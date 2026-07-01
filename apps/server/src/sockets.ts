import { Server as SocketIOServer, Socket } from "socket.io";
import { getRoom } from "./rooms.js";
import { generateBoard } from "./engine.js";
import { sampleWords } from "@cluegrid/wordpacks";
import { redis } from "./redis.js";
import { db } from "./db.js";
import { addGameLogEntry, getGameLog, clearGameLog } from "./log.js";
import {
  RoomState,
  TeamIdentifier,
  TeamState,
  TEAM_COLORS_BY_INDEX,
  PlayerRole,
} from "@cluegrid/shared";

// Map of Socket ID -> Player Identity
const socketToPlayerMap = new Map<string, { roomCode: string; playerId: string }>();

// Map of Player ID -> Last reaction timestamp (ms)
const lastReactionMap = new Map<string, number>();

// Map of Room Code -> Timeout for server-side automatic turn shifting
const roomTimeouts = new Map<string, NodeJS.Timeout>();

function clearRoomTimer(roomCode: string) {
  const existing = roomTimeouts.get(roomCode);
  if (existing) {
    clearTimeout(existing);
    roomTimeouts.delete(roomCode);
  }
}

function startRoomTimer(room: RoomState, io: SocketIOServer) {
  clearRoomTimer(room.roomCode);

  if (room.phase !== "playing" || !room.turnState) return;

  const isCoop = room.gameMode === "coop";
  const timerMode = room.settings.timerMode || "off";
  const timerAction = room.settings.timerAction || "manual";

  const isTimerActive = isCoop || (timerMode !== "off");
  if (!isTimerActive) return;

  if (timerAction === "manual" && !isCoop) return;

  let limit = 120;
  if (!isCoop) {
    let spyTime = 90;
    let opTime = 60;
    let extraTime = 60;

    if (timerMode === "fast") {
      spyTime = 90;
      opTime = 60;
      extraTime = 60;
    } else if (timerMode === "long") {
      spyTime = 180;
      opTime = 120;
      extraTime = 120;
    } else if (timerMode === "custom") {
      spyTime = room.settings.spymasterTimerSeconds !== undefined ? room.settings.spymasterTimerSeconds : 90;
      extraTime = room.settings.firstClueExtraSeconds !== undefined ? room.settings.firstClueExtraSeconds : 60;
      opTime = room.settings.operativeTimerSeconds !== undefined ? room.settings.operativeTimerSeconds : 60;
    }

    limit = room.turnState.phase === "giving_clue" ? spyTime : opTime;
    if (room.turnState.phase === "giving_clue" && room.turnState.turnNumber === 1) {
      limit += extraTime;
    }
  }

  const timeoutId = setTimeout(() => {
    handleServerTimerExpiry(room.roomCode, io);
  }, limit * 1000);

  roomTimeouts.set(room.roomCode, timeoutId);
}

function handleServerTimerExpiry(roomCode: string, io: SocketIOServer) {
  const room = getRoom(roomCode);
  if (!room || room.phase !== "playing" || !room.turnState) return;

  addGameLogEntry(
    io,
    roomCode,
    "turn_transition",
    null,
    `Timer expired! ${room.turnState.phase === "giving_clue" ? "Spymaster" : "Operatives"} ran out of time.`
  );

  if (room.turnState.phase === "giving_clue") {
    room.turnState.clueWord = "pass";
    room.turnState.clueCount = 0;
    room.turnState.guessesUsed = 0;
    room.turnState.guessesAllowed = 1;
    room.turnState.phase = "guessing";
    advanceTurn(room, io);
  } else if (room.turnState.phase === "guessing") {
    advanceTurn(room, io);
  }

  broadcastRoomState(room, io);
}

/**
 * Update Socket.IO room subscriptions based on player's team and role
 */
export function updateSocketRooms(
  socket: Socket,
  roomCode: string,
  team: TeamIdentifier | null,
  role: PlayerRole | null
) {
  const teamColors: TeamIdentifier[] = ["red", "blue", "green", "yellow"];
  teamColors.forEach((color) => {
    socket.leave(`room:${roomCode}:team:${color}:operatives`);
  });
  socket.leave(`room:${roomCode}:spymasters`);
  socket.leave(`room:${roomCode}:operatives`);

  if (role === "spymaster" && team) {
    socket.join(`room:${roomCode}:spymasters`);
    socket.join(`room:${roomCode}:operatives`);
  } else if ((role === "operative" || role === null) && team) {
    socket.join(`room:${roomCode}:operatives`);
  }
}

/**
 * Send the last 100 chat messages to a connecting/updating socket
 */
export async function sendChatHistory(
  socket: Socket,
  roomCode: string,
  team: TeamIdentifier | null,
  role: PlayerRole | null
) {
  if (!team) {
    socket.emit("chat_history", { messages: [] });
    return;
  }

  try {
    if (role === "operative" || role === null) {
      const redisKey = `chat:${roomCode}:operatives`;
      const rawMessages = await redis.lrange(redisKey, 0, -1);
      const messages = rawMessages.map((m) => JSON.parse(m));
      socket.emit("chat_history", { messages });
    } else if (role === "spymaster") {
      const opsKey = `chat:${roomCode}:operatives`;
      const spyKey = `chat:${roomCode}:spymasters`;
      const [rawOps, rawSpys] = await Promise.all([
        redis.lrange(opsKey, 0, -1),
        redis.lrange(spyKey, 0, -1),
      ]);
      const opsMsgs = rawOps.map((m) => JSON.parse(m));
      const spyMsgs = rawSpys.map((m) => JSON.parse(m));
      const messages = [...opsMsgs, ...spyMsgs].sort(
        (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
      );
      socket.emit("chat_history", { messages });
    }
  } catch (err) {
    console.error("[redis] error fetching chat history:", err);
    socket.emit("chat_history", { messages: [] });
  }
}

/**
 * Filter RoomState before sending to a player based on their identity
 */
function getRoomStateForPlayer(room: RoomState, playerId: string): any {
  const player = room.players.find((p) => p.id === playerId);
  const isSpymaster = player && player.role === "spymaster";

  // Clean board: apply per-player visibility rules
  const board = room.board.map((card) => {
    // Game over — reveal all cards to everyone
    if (room.phase === "ended") return card;

    // ── Duet / Coop Mode ──────────────────────────────────────────────────
    if (room.gameMode === "coop") {
      if (player && player.team) {
        // Always show revealed cards as-is
        if (card.revealed) return card;

        /**
         * Each team sees the OPPONENT's board:
         *   Red team → sees coopBlueType  (Blue's agents + Blue's assassins)
         *   Blue team → sees coopRedType  (Red's agents + Red's assassins)
         *
         * This lets Red give meaningful clues to Blue (and vice versa),
         * while each team sees the assassin positions they must avoid hinting toward.
         */
        let displayType: string | undefined;
        if (player.team === "red") {
          // Red sees Blue's board
          displayType = card.coopBlueType; // "blue" | "assassin" | "neutral"
        } else if (player.team === "blue") {
          // Blue sees Red's board
          displayType = card.coopRedType;  // "red" | "assassin" | "neutral"
        }

        if (!displayType || displayType === "neutral") {
          // Hide neutral cards (strip type)
          const { type: _t, coopRedType: _r, coopBlueType: _b, ...safeCard } = card;
          return safeCard;
        }

        // Visible card: show with the computed display type (and strip internal coop fields)
        const { coopRedType: _r, coopBlueType: _b, ...rest } = card;
        return { ...rest, type: displayType };
      } else {
        // Spectator: only see revealed cards
        if (card.revealed) {
          const { coopRedType: _r, coopBlueType: _b, ...rest } = card;
          return rest;
        }
        const { type: _t, coopRedType: _r, coopBlueType: _b, ...safeCard } = card;
        return safeCard;
      }
    }

    // ── Classic Mode ───────────────────────────────────────────────────────
    if (isSpymaster || card.revealed) return card;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { type, ...safeCard } = card;
    return safeCard;
  });

  // Clue filtering: clueWord and clueCount are broadcast to active team only
  let turnState = null;
  if (room.turnState) {
    const isTeamMember = player && player.team === room.turnState.activeTeam;
    // Spymaster of active team can see it, operatives of active team can see it.
    // If it's the guessing phase, everyone can see it to play, wait, is that true?
    // Let's check the prompt: "Spymaster gives a clue (one word + a number) via a simple form; this clue is broadcast to their team's operatives only."
    // Yes! Broadcast to their team's operatives only. Let's make sure that if a player is NOT on the active team (or spectator), they see null.
    // Wait, does the active team's spymaster see it? Yes, they gave it.
    // So if isTeamMember is true, we show the clue. Otherwise, we hide it.
    if (isTeamMember) {
      turnState = room.turnState;
    } else {
      turnState = {
        ...room.turnState,
        clueWord: null,
        clueCount: null,
      };
    }
  }

  return {
    ...room,
    board,
    turnState,
  };
}

/**
 * Broadcast room state individually to each connected player in the room
 */
export function broadcastRoomState(room: RoomState, io: SocketIOServer) {
  room.players.forEach((player) => {
    // We can emit directly to player sockets.
    // Since players can reconnect, we store their socketIds.
    // We can join socket to a socket.io room `room:${roomCode}` for other broadcasts,
    // but individual broadcasts are needed to filter the board/clue state.
    const playerSocket = io.sockets.sockets.get((player as any).socketId);
    if (playerSocket) {
      playerSocket.emit("room_state", getRoomStateForPlayer(room, player.id));
    }
  });
}

function endGame(room: RoomState, winner: TeamIdentifier | null, io: SocketIOServer) {
  clearRoomTimer(room.roomCode);
  room.phase = "ended";
  room.winner = winner;
  room.endedAt = new Date().toISOString();
  room.turnState = null;

  const winnerName = winner ? (room.teams[winner]?.name || winner.charAt(0).toUpperCase() + winner.slice(1)) : null;
  const message = winner
    ? `Game ended! ${winnerName} won the match! 🏆`
    : "Game ended! No team remains. ☠️";

  addGameLogEntry(
    io,
    room.roomCode,
    "game_ended",
    winner,
    message,
    { winner }
  );

  saveMatchStats(room).catch((err) => console.error("[postgres] error saving stats:", err));
}

async function saveMatchStats(room: RoomState) {
  for (const player of room.players) {
    if (!player.userId) continue;

    const won = room.winner !== null && player.team === room.winner;
    const teamName = player.team || "spectator";
    const roleName = player.role || "spectator";

    try {
      // Insert history
      await db.query(
        "INSERT INTO match_history (user_id, room_code, team, role, won) VALUES ($1, $2, $3, $4, $5)",
        [player.userId, room.roomCode, teamName, roleName, won]
      );

      // Update stats
      const correctCount = player.correctGuessesCount || 0;
      const totalCount = player.guessesCount || 0;
      const wonVal = won ? 1 : 0;

      await db.query(
        `UPDATE user_stats 
         SET games_played = games_played + 1, 
             games_won = games_won + $1, 
             total_guesses = total_guesses + $2, 
             correct_guesses = correct_guesses + $3 
         WHERE user_id = $4`,
        [wonVal, totalCount, correctCount, player.userId]
      );
    } catch (err) {
      console.error(`[postgres] error updating stats for user ${player.userId}:`, err);
    }
  }
}

function advanceTurn(room: RoomState, io: SocketIOServer) {
  if (!room.turnState) return;

  // Clear all player votes
  room.players.forEach((p) => {
    p.votedCardId = null;
    p.votedCardIds = [];
  });

  if (room.gameMode === "coop") {
    room.coopMistakesMade++;
    if (room.coopMistakesMade >= room.coopMistakesAllowed) {
      // Out of turn tokens -> defeat!
      addGameLogEntry(
        io,
        room.roomCode,
        "team_eliminated",
        null,
        "Mistake limit reached! The cooperative team has run out of tokens. ☠️"
      );
      endGame(room, null, io);
      return;
    }

    const nextTeam = room.turnState.activeTeam === "red" ? "blue" : "red";
    room.turnState.activeTeam = nextTeam;
    room.turnState.phase = "giving_clue";
    room.turnState.clueWord = null;
    room.turnState.clueCount = null;
    room.turnState.guessesUsed = 0;
    room.turnState.guessesAllowed = null;
    room.turnState.turnNumber++;
    room.turnState.phaseStartedAt = Date.now();

    const activeTeamName = room.teams[nextTeam]?.name || nextTeam.toUpperCase();
    addGameLogEntry(
      io,
      room.roomCode,
      "turn_transition",
      nextTeam,
      `New cooperative turn started. Active Spymaster Team: ${activeTeamName}. Tokens used: ${room.coopMistakesMade}/${room.coopMistakesAllowed}`,
      { activeTeam: nextTeam, teamName: activeTeamName }
    );
    startRoomTimer(room, io);
    return;
  }

  const currentTeam = room.turnState.activeTeam;
  const teamColors = TEAM_COLORS_BY_INDEX.slice(0, room.teamCount);
  let nextTeamIdx = teamColors.indexOf(currentTeam);

  let loops = 0;
  while (loops < room.teamCount) {
    nextTeamIdx = (nextTeamIdx + 1) % room.teamCount;
    const candidateTeam = teamColors[nextTeamIdx]!;
    if (room.teams[candidateTeam] && !room.teams[candidateTeam]!.eliminated) {
      room.turnState.activeTeam = candidateTeam;
      room.turnState.phase = "giving_clue";
      room.turnState.clueWord = null;
      room.turnState.clueCount = null;
      room.turnState.guessesUsed = 0;
      room.turnState.guessesAllowed = null;
      room.turnState.turnNumber++;
      room.turnState.phaseStartedAt = Date.now();

      const teamName = room.teams[candidateTeam]?.name || (candidateTeam.charAt(0).toUpperCase() + candidateTeam.slice(1) + " Team");
      addGameLogEntry(
        io,
        room.roomCode,
        "turn_transition",
        candidateTeam,
        `Turn transitioned to ${teamName}.`,
        { activeTeam: candidateTeam, teamName }
      );
      startRoomTimer(room, io);
      return;
    }
    loops++;
  }

  // If no teams left, end game
  endGame(room, null, io);
}

export function registerSocketHandlers(io: SocketIOServer) {
  io.on("connection", (socket: Socket) => {
    console.log(`[socket] client connected: ${socket.id}`);

    // Join room / Register identity
    socket.on("join_room", ({ roomCode, playerId, displayName, avatar, team, role, userId }) => {
      const room = getRoom(roomCode);
      if (!room) {
        socket.emit("error_msg", "Room not found");
        return;
      }

      // Check if player already exists in room (session recovery)
      let player = room.players.find((p) => p.id === playerId) as any;

      if (player) {
        // Recover session
        player.socketId = socket.id;
        player.connected = true;
        if (displayName) player.displayName = displayName;
        if (avatar) player.avatar = avatar;
        if (userId) player.userId = userId;
        
        // Enforce max 1 spymaster constraint if they try to update team/role during reconnect
        if (team !== undefined || role !== undefined) {
          const t = team !== undefined ? team : player.team;
          const r = role !== undefined ? role : player.role;
          if (r === "spymaster" && t) {
            const hasSpymaster = room.players.some(
              (p) => p.team === t && p.role === "spymaster" && p.id !== playerId
            );
            if (hasSpymaster) {
              // Reset to operative if already occupied
              player.team = t;
              player.role = "operative";
            } else {
              player.team = t;
              player.role = r;
            }
          } else {
            player.team = t;
            player.role = r;
          }
        }
      } else {
        // Create new player
        player = {
          id: playerId,
          displayName: displayName || `Player ${room.players.length + 1}`,
          avatar: avatar || "👤",
          team: null,
          role: null,
          connected: true,
          ready: false,
          joinedAt: new Date().toISOString(),
          socketId: socket.id,
          status: "ACTIVE",
          userId: userId || null,
          isHost: room.players.length === 0,
        };

        // Enforce max 1 spymaster constraint for new player team/role choice
        if (room.settings.roomLocked) {
          // If room is locked, new players join as spectators
          player.team = null;
          player.role = null;
        } else if (role === "spymaster" && team) {
          const hasSpymaster = room.players.some(
            (p) => p.team === team && p.role === "spymaster"
          );
          if (!hasSpymaster) {
            player.team = team;
            player.role = role;
          } else {
            player.team = team;
            player.role = "operative";
          }
        } else {
          player.team = team || null;
          player.role = role || null;
        }

        room.players.push(player);
      }

      // Map socket to player identity
      socketToPlayerMap.set(socket.id, { roomCode: room.roomCode, playerId: player.id });

      // Join socket.io room
      socket.join(`room:${room.roomCode}`);
      updateSocketRooms(socket, room.roomCode, player.team, player.role);
      sendChatHistory(socket, room.roomCode, player.team, player.role);

      // Fetch and send game log history upon connection
      getGameLog(room.roomCode).then((log) => {
        socket.emit("game_log", { log });
      });

      // Broadcast update after fetching supporter status
      if (player.userId) {
        db.query("SELECT is_supporter FROM users WHERE id = $1", [player.userId])
          .then((dbRes) => {
            player.isSupporter = dbRes.rows.length > 0 && !!dbRes.rows[0].is_supporter;
            broadcastRoomState(room, io);
          })
          .catch((err) => {
            console.error(err);
            broadcastRoomState(room, io);
          });
      } else {
        player.isSupporter = false;
        broadcastRoomState(room, io);
      }
    });

    // Update player team, role, or ready status
    socket.on("update_player", ({ roomCode, playerId, team, role, ready }) => {
      const room = getRoom(roomCode);
      if (!room) return;

      const player = room.players.find((p) => p.id === playerId) as any;
      if (!player) return;

      const mapping = socketToPlayerMap.get(socket.id);
      if (!mapping) return;
      const caller = room.players.find((p) => p.id === mapping.playerId);
      if (!caller) return;

      const isCallerHost = caller.isHost || (room.players.length > 0 && caller.id === room.players[0]?.id);

      // Authorization for position switching
      if (team !== undefined || role !== undefined) {
        if (room.settings.roomLocked) {
          socket.emit("error_msg", "The room is locked. Unlock the room to switch player positions.");
          return;
        } else {
          if (!isCallerHost && player.id !== caller.id) {
            socket.emit("error_msg", "Only the host can change other players' positions.");
            return;
          }
        }
      }

      if (ready !== undefined) {
        player.ready = ready;
      }

      if (team !== undefined || role !== undefined) {
        if (room.gameMode === "coop") {
          player.team = team !== undefined ? team : player.team;
          player.role = null;
        } else {
          const nextTeam = team !== undefined ? team : player.team;
          const nextRole = role !== undefined ? role : player.role;

          if (nextRole === "spymaster" && nextTeam) {
            const hasSpymaster = room.players.some((p) => p.team === nextTeam && p.role === "spymaster" && p.id !== player.id);
            if (hasSpymaster) {
              socket.emit("error_msg", `There is already a Spymaster on the ${nextTeam} team.`);
              return;
            }

            // Log ONLY if an operative is switching to be a spy (spymaster) during live play
            if (room.phase === "playing" && player.role === "operative") {
              const teamLabel = nextTeam.charAt(0).toUpperCase() + nextTeam.slice(1);
              addGameLogEntry(
                io,
                room.roomCode,
                "role_change" as any,
                nextTeam,
                `${player.displayName} -> ${teamLabel} spy`,
                {
                  playerDisplayName: player.displayName,
                  prevRole: player.role,
                  newRole: nextRole,
                  newTeam: nextTeam,
                }
              );
            }
            player.team = nextTeam;
            player.role = nextRole;
          } else {
            player.team = nextTeam;
            player.role = nextRole;
          }
        }
        updateSocketRooms(socket, room.roomCode, player.team, player.role);
        sendChatHistory(socket, room.roomCode, player.team, player.role);
      }

      broadcastRoomState(room, io);
    });

function runStartGameLogic(room: any, io: SocketIOServer) {
  // Reset team statistics
  const preset = room.gridConfig;
  const teams = {} as Record<TeamIdentifier, TeamState>;
  preset.teamCardCounts.forEach((count: number, index: number) => {
    const color = TEAM_COLORS_BY_INDEX[index];
    if (color) {
      teams[color] = {
        color,
        cardsRemaining: count,
        totalCards: count,
        eliminated: false,
        name: room.teams[color]?.name || color.charAt(0).toUpperCase() + color.slice(1),
      };
    }
  });

  room.teams = teams;
  room.winner = null;
  room.startedAt = new Date().toISOString();
  room.endedAt = null;
  room.phase = "playing";
  room.turnState = {
    activeTeam: "red", // red always starts
    phase: "giving_clue",
    clueWord: null,
    clueCount: null,
    guessesUsed: 0,
    guessesAllowed: null,
    turnNumber: 1,
    phaseStartedAt: Date.now(),
  };

  // Reset card board for a new fresh start
  const words = sampleWords(room.language || "en", preset.totalCards);
  // Duet/Coop mode: use independent dual-type board with per-team assassins
  room.board = generateBoard(room.teamCount, words, room.gameMode === "coop");

  // In coop mode: recalculate each team's agent count from the independently-generated board
  if (room.gameMode === "coop") {
    const redAgents = room.board.filter((c: any) => c.coopRedType === "red").length;
    const blueAgents = room.board.filter((c: any) => c.coopBlueType === "blue").length;
    if (room.teams.red) {
      room.teams.red.cardsRemaining = redAgents;
      room.teams.red.totalCards = redAgents;
    }
    if (room.teams.blue) {
      room.teams.blue.cardsRemaining = blueAgents;
      room.teams.blue.totalCards = blueAgents;
    }
  }

  const firstTeam = room.turnState?.activeTeam || "red";
  const teamName = room.teams[firstTeam]?.name || (firstTeam.charAt(0).toUpperCase() + firstTeam.slice(1) + " Team");

  // Clear old logs and start new game log
  clearGameLog(room.roomCode)
    .then(() => {
      addGameLogEntry(io, room.roomCode, "game_started", null, "Game started!");
      addGameLogEntry(io, room.roomCode, "turn_transition", firstTeam, `Turn transitioned to ${teamName}.`, { activeTeam: firstTeam, teamName });
    })
    .catch((err) => console.error(err));

  // Explicitly notify all clients in the room to trigger start/reset animations
  io.to(room.roomCode).emit("game_started");

  startRoomTimer(room, io);
  broadcastRoomState(room, io);
}

    // Start game
    socket.on("start_game", ({ roomCode }) => {
      const room = getRoom(roomCode);
      if (!room) return;

      const mapping = socketToPlayerMap.get(socket.id);
      if (!mapping) {
        socket.emit("error_msg", "Identity not found.");
        return;
      }
      const player = room.players.find((p) => p.id === mapping.playerId);
      if (!player) {
        socket.emit("error_msg", "Player not found.");
        return;
      }

      // Check if player is host (first player in the room)
      const isHost = player.isHost || (room.players.length > 0 && player.id === room.players[0]?.id);
      if (!isHost) {
        socket.emit("error_msg", "Only the room host can start or reset the game.");
        return;
      }

      // If resetting/restarting from an active match (playing) or finished match (ended):
      // Move all players to Spectators (team = null, role = "operative").
      if (room.phase === "playing" || room.phase === "ended") {
        room.players.forEach((p) => {
          p.team = null;
          p.role = "operative";
          p.ready = false;
          p.votedCardId = null;
          p.votedCardIds = [];
        });
      }

      runStartGameLogic(room, io);
    });

    // Reset game to lobby phase
    socket.on("reset_to_lobby", ({ roomCode }) => {
      const room = getRoom(roomCode);
      if (!room) return;

      clearRoomTimer(room.roomCode);

      const mapping = socketToPlayerMap.get(socket.id);
      if (!mapping) {
        socket.emit("error_msg", "Identity not found.");
        return;
      }
      const player = room.players.find((p) => p.id === mapping.playerId);
      if (!player) {
        socket.emit("error_msg", "Player not found.");
        return;
      }

      // Check if player is host
      const isHost = player.isHost || (room.players.length > 0 && player.id === room.players[0]?.id);
      if (!isHost) {
        socket.emit("error_msg", "Only the room host can return to lobby.");
        return;
      }

      // Reset phase to lobby
      room.phase = "lobby";
      room.winner = null;
      room.turnState = null;
      room.startedAt = null;
      room.endedAt = null;

      // Reset players ready status and votes
      room.players.forEach((p) => {
        p.ready = false;
        p.votedCardId = null;
        p.votedCardIds = [];
      });

      addGameLogEntry(
        io,
        room.roomCode,
        "turn_transition",
        null,
        `${player.displayName} returned the game to the lobby.`
      );

      broadcastRoomState(room, io);
    });

    // Spymaster gives clue
    socket.on("give_clue", ({ roomCode, playerId, clueWord, clueCount, word, count }) => {
      const room = getRoom(roomCode);
      if (!room || room.phase !== "playing" || !room.turnState) return;

      const player = room.players.find((p) => p.id === playerId);
      if (!player) return;

      // Support fallback parameter names (e.g. from timer auto-pass)
      const effectiveClueWord = clueWord !== undefined ? clueWord : word;
      const effectiveClueCount = clueCount !== undefined ? clueCount : count;

      // Validate: is active team member (coop) or active spymaster (classic)
      if (room.gameMode === "coop") {
        if (player.team !== room.turnState.activeTeam) {
          socket.emit("error_msg", "Only members of the active team can give a clue.");
          return;
        }
      } else {
        if (player.team !== room.turnState.activeTeam || player.role !== "spymaster") {
          socket.emit("error_msg", "Only the active Spymaster can give a clue.");
          return;
        }
      }

      // Validate clue phase
      if (room.turnState.phase !== "giving_clue") {
        socket.emit("error_msg", "Not the time to give a clue.");
        return;
      }

      // Validate clue word: single word
      if (typeof effectiveClueWord !== "string") {
        socket.emit("error_msg", "Invalid clue word format.");
        return;
      }
      const trimmedClue = effectiveClueWord.trim();
      if (!trimmedClue || trimmedClue.includes(" ")) {
        socket.emit("error_msg", "Clue must be a single word.");
        return;
      }

      room.turnState.phase = "guessing";
      room.turnState.clueWord = trimmedClue;
      room.turnState.clueCount = effectiveClueCount;
      room.turnState.guessesUsed = 0;
      room.turnState.guessesAllowed = (effectiveClueCount === 0 || effectiveClueCount === -1) ? Infinity : effectiveClueCount + 1;
      room.turnState.phaseStartedAt = Date.now();
      startRoomTimer(room, io);

      if (player.team) {
        addGameLogEntry(
          io,
          room.roomCode,
          "clue",
          player.team,
          `${player.displayName} (Spymaster) gave clue: "${trimmedClue}" (Count: ${effectiveClueCount === -1 ? "∞" : effectiveClueCount})`,
          {
            spymasterName: player.displayName,
            word: trimmedClue,
            count: effectiveClueCount,
          }
        );
      }

      broadcastRoomState(room, io);
    });

    // Operative votes card
    socket.on("vote_card", ({ roomCode, playerId, cardId }) => {
      const room = getRoom(roomCode);
      if (!room || room.phase !== "playing") return;

      const player = room.players.find((p) => p.id === playerId);
      if (!player) return;

      if (!player.votedCardIds) {
        player.votedCardIds = [];
      }

      if (cardId === null || cardId === undefined) {
        player.votedCardIds = [];
        player.votedCardId = null;
      } else {
        const index = player.votedCardIds.indexOf(cardId);
        if (index > -1) {
          player.votedCardIds.splice(index, 1);
        } else {
          player.votedCardIds.push(cardId);
        }
        player.votedCardId = player.votedCardIds.length > 0 ? (player.votedCardIds[player.votedCardIds.length - 1] ?? null) : null;
      }
      broadcastRoomState(room, io);
    });

    // Operative guesses card
    socket.on("guess_card", ({ roomCode, playerId, cardId }) => {
      const room = getRoom(roomCode);
      if (!room || room.phase !== "playing" || !room.turnState) return;

      const player = room.players.find((p) => p.id === playerId);
      if (!player) return;

      // Validate: is operative of active team
      if (room.gameMode === "coop") {
        const guessingTeam = room.turnState.activeTeam === "red" ? "blue" : "red";
        if (player.team !== guessingTeam) {
          socket.emit("error_msg", "Only the guessing team can guess.");
          return;
        }
      } else {
        if (player.team !== room.turnState.activeTeam || player.role !== "operative") {
          socket.emit("error_msg", "Only active Operatives can guess.");
          return;
        }
      }

      if (room.turnState.phase !== "guessing") {
        socket.emit("error_msg", "Waiting for Spymaster's clue.");
        return;
      }

      const card = room.board.find((c) => c.id === cardId);
      if (!card || card.revealed) return;

      // Clear or adjust player votes based on correctness
      const isCorrect = card.type === player.team;
      if (!isCorrect) {
        // Incorrect guess: remove all votes on all cards
        room.players.forEach((p) => {
          p.votedCardId = null;
          p.votedCardIds = [];
        });
      } else {
        // Correct guess: only remove the vote from the flipped card itself
        room.players.forEach((p) => {
          if (p.votedCardIds) {
            p.votedCardIds = p.votedCardIds.filter((id) => id !== cardId);
          }
          if (p.votedCardId === cardId) {
            p.votedCardId = p.votedCardIds && p.votedCardIds.length > 0 
              ? (p.votedCardIds[p.votedCardIds.length - 1] ?? null) 
              : null;
          }
        });
      }

      // ── Duet / Coop Mode: dual-type card resolution ──────────────────────
      if (room.gameMode === "coop") {
        /**
         * In Duet Mode:
         * - Active team (clue-givers) gives clues; GUESSING team is the OPPOSITE team.
         * - When Blue guesses: check coopBlueType to determine outcome
         * - When Red guesses:  check coopRedType  to determine outcome
         *
         * Outcomes for the GUESSER:
         *   "blue" (their own agents) → correct hit, reduce Blue cardsRemaining
         *   "red"  (their own agents) → correct hit, reduce Red cardsRemaining
         *   "assassin" → the GUESSER flipped their own assassin → OPPONENT wins
         *   "neutral"  → wrong guess, turn ends
         */
        const guessingTeam = room.turnState.activeTeam === "red" ? "blue" : "red";
        const coopType =
          guessingTeam === "blue" ? card.coopBlueType : card.coopRedType;

        // Update card.type so revealed state shows the correct color to all players
        if (coopType === "blue" || coopType === "red") {
          card.type = coopType;
        } else if (coopType === "assassin") {
          card.type = "assassin";
        } else {
          card.type = "neutral";
        }

        // Reveal card
        card.revealed = true;
        card.revealedAt = new Date().toISOString();
        card.revealedBy = player.team;

        if (coopType === guessingTeam) {
          // ✅ Correct agent card hit!
          room.turnState.guessesUsed++;
          player.guessesCount = (player.guessesCount || 0) + 1;
          player.correctGuessesCount = (player.correctGuessesCount || 0) + 1;

          // Decrement that team's remaining card count
          if (room.teams[guessingTeam]) {
            room.teams[guessingTeam]!.cardsRemaining = Math.max(
              0,
              room.teams[guessingTeam]!.cardsRemaining - 1
            );
          }

          addGameLogEntry(io, room.roomCode, "reveal", guessingTeam,
            `${player.displayName} found "${card.word}" (Correct! — ${guessingTeam === "red" ? "Red" : "Blue"} agent)`,
            { playerDisplayName: player.displayName, cardWord: card.word, cardType: coopType }
          );

          // Win check: has this team revealed all their agents?
          if (room.teams[guessingTeam]?.cardsRemaining === 0) {
            endGame(room, guessingTeam, io);
          } else {
            const maxGuesses = room.turnState.guessesAllowed;
            if (maxGuesses !== null && room.turnState.guessesUsed >= maxGuesses) {
              advanceTurn(room, io);
            }
          }

        } else if (coopType === "assassin") {
          // ☠️ Guesser hit THEIR OWN assassin → the OTHER team wins!
          const winner = guessingTeam === "red" ? "blue" : "red";
          player.guessesCount = (player.guessesCount || 0) + 1;
          addGameLogEntry(io, room.roomCode, "reveal", null,
            `${player.displayName} hit "${card.word}" — ASSASSIN! ${guessingTeam === "red" ? "Blue" : "Red"} Team wins!`,
            { playerDisplayName: player.displayName, cardWord: card.word, cardType: "assassin" }
          );
          endGame(room, winner, io);

        } else {
          // 🟡 Neutral or opponent's agent — wrong guess, end turn
          player.guessesCount = (player.guessesCount || 0) + 1;
          addGameLogEntry(io, room.roomCode, "reveal", null,
            `${player.displayName} guessed "${card.word}" — not their agent (Turn Ends)`,
            { playerDisplayName: player.displayName, cardWord: card.word, cardType: coopType ?? "neutral" }
          );
          advanceTurn(room, io);
        }

        broadcastRoomState(room, io);
        return;
      }
      // ── END Duet / Coop Mode ─────────────────────────────────────────────

      // Reveal card (classic mode)
      card.revealed = true;
      card.revealedAt = new Date().toISOString();
      card.revealedBy = player.team;

      const cardType = card.type;
      const isTeamCard = ["red", "blue", "green", "yellow"].includes(cardType);

      if (isTeamCard) {
        const cardTeamColor = cardType as TeamIdentifier;
        if (room.teams[cardTeamColor]) {
          room.teams[cardTeamColor]!.cardsRemaining = Math.max(
            0,
            room.teams[cardTeamColor]!.cardsRemaining - 1
          );
        }
      }

      if (cardType === player.team) {
        // Correct team color card!
        room.turnState.guessesUsed++;

        // Track stats for database logs
        player.guessesCount = (player.guessesCount || 0) + 1;
        player.correctGuessesCount = (player.correctGuessesCount || 0) + 1;

        addGameLogEntry(
          io,
          room.roomCode,
          "reveal",
          player.team,
          `${player.displayName} guessed "${card.word}" (Correct!)`,
          {
            playerDisplayName: player.displayName,
            cardWord: card.word,
            cardType,
          }
        );

        // Check victory
        if (room.teams[player.team]!.cardsRemaining === 0) {
          endGame(room, player.team, io);
        } else {
          // Check if guesses limit reached
          const maxGuesses = room.turnState.guessesAllowed;
          if (maxGuesses !== null && room.turnState.guessesUsed >= maxGuesses) {
            advanceTurn(room, io);
          }
        }
      } else if (cardType === "neutral") {
        // Neutral card -> turn ends
        player.guessesCount = (player.guessesCount || 0) + 1;

        addGameLogEntry(
          io,
          room.roomCode,
          "reveal",
          player.team,
          `${player.displayName} guessed "${card.word}" (Neutral - Turn Ends)`,
          {
            playerDisplayName: player.displayName,
            cardWord: card.word,
            cardType,
          }
        );
        advanceTurn(room, io);
      } else if (cardType === "assassin") {
        // Assassin card -> eliminate team!
        player.guessesCount = (player.guessesCount || 0) + 1;
        const activeTeam = player.team;
        room.teams[activeTeam]!.eliminated = true;

        const activeTeamName = activeTeam.charAt(0).toUpperCase() + activeTeam.slice(1);
        addGameLogEntry(
          io,
          room.roomCode,
          "reveal",
          player.team,
          `${player.displayName} guessed "${card.word}" (ASSASSIN! - Team Eliminated)`,
          {
            playerDisplayName: player.displayName,
            cardWord: card.word,
            cardType,
          }
        );
        addGameLogEntry(
          io,
          room.roomCode,
          "team_eliminated",
          activeTeam,
          `Team ${activeTeamName} was eliminated!`,
          { teamColor: activeTeam }
        );

        if (room.settings.eliminationRule === "game_end") {
          // Ends entire game immediately. Find remaining team with fewest cards left
          let bestTeam: TeamIdentifier | null = null;
          let minRemaining = Infinity;
          Object.keys(room.teams).forEach((colorKey) => {
            const teamColor = colorKey as TeamIdentifier;
            if (teamColor !== activeTeam) {
              const cardsRem = room.teams[teamColor]!.cardsRemaining;
              if (cardsRem < minRemaining) {
                minRemaining = cardsRem;
                bestTeam = teamColor;
              }
            }
          });
          endGame(room, bestTeam, io);
        } else {
          // "continue" rule: Active team is eliminated. Play continues if more than 1 team remains.
          const nonEliminatedTeams = Object.values(room.teams).filter((t) => !t.eliminated);
          if (nonEliminatedTeams.length <= 1) {
            const winner = nonEliminatedTeams[0]?.color || null;
            endGame(room, winner, io);
          } else {
            advanceTurn(room, io);
          }
        }
      } else {
        // Other team's card -> turn ends.
        player.guessesCount = (player.guessesCount || 0) + 1;
        const otherTeamColor = cardType as TeamIdentifier;

        addGameLogEntry(
          io,
          room.roomCode,
          "reveal",
          player.team,
          `${player.displayName} guessed "${card.word}" (Other Team's Card - Turn Ends)`,
          {
            playerDisplayName: player.displayName,
            cardWord: card.word,
            cardType,
          }
        );

        if (room.teams[otherTeamColor] && room.teams[otherTeamColor]!.cardsRemaining === 0) {
          endGame(room, otherTeamColor, io);
        } else {
          advanceTurn(room, io);
        }
      }

      broadcastRoomState(room, io);
    });

    // End turn manually
    socket.on("end_turn", ({ roomCode, playerId }) => {
      const room = getRoom(roomCode);
      if (!room || room.phase !== "playing" || !room.turnState) return;

      const player = room.players.find((p) => p.id === playerId);
      if (!player) return;

      const isManualTimer = room.settings.timerAction === "manual";

      if (room.gameMode === "coop") {
        const guessingTeam = room.turnState.activeTeam === "red" ? "blue" : "red";
        if (!isManualTimer && player.team !== guessingTeam) {
          socket.emit("error_msg", "Only members of the guessing team can end the turn.");
          return;
        }
      } else {
        const isOpponent = player.team !== room.turnState.activeTeam;
        if (isOpponent) {
          socket.emit("error_msg", "Only active Operatives on the playing team can end the turn.");
          return;
        } else {
          const isSpymasterAutoEnd = player.role === "spymaster" && room.turnState.phase === "giving_clue" && !isManualTimer;
          const isOperativeGuessEnd = player.role === "operative" && room.turnState.phase === "guessing";

          if (!isSpymasterAutoEnd && !isOperativeGuessEnd) {
            socket.emit("error_msg", "Only active Operatives can end the turn.");
            return;
          }
        }
      }

      if (room.turnState.phase === "giving_clue") {
        // Force submit a pass clue and advance turn
        room.turnState.clueWord = "pass";
        room.turnState.clueCount = 0;
        room.turnState.guessesUsed = 0;
        room.turnState.guessesAllowed = 1;
        room.turnState.phase = "guessing";
        advanceTurn(room, io);
      } else if (room.turnState.phase === "guessing") {
        advanceTurn(room, io);
      } else {
        socket.emit("error_msg", "Cannot end turn now.");
        return;
      }

      broadcastRoomState(room, io);
    });

    // Update settings (e.g. elimination rule, afk timeout)
    socket.on("update_settings", ({ roomCode, settings }) => {
      const room = getRoom(roomCode);
      if (!room) return;

      const mapping = socketToPlayerMap.get(socket.id);
      if (!mapping) return;
      const caller = room.players.find((p) => p.id === mapping.playerId);
      if (!caller) return;

      const isCallerHost = caller.isHost || (room.players.length > 0 && caller.id === room.players[0]?.id);

      if (settings) {
        const isModifyingHostOnly =
          settings.eliminationRule !== undefined ||
          settings.timerMode !== undefined ||
          settings.timerSeconds !== undefined ||
          settings.spymasterTimerSeconds !== undefined ||
          settings.firstClueExtraSeconds !== undefined ||
          settings.operativeTimerSeconds !== undefined ||
          settings.timerAction !== undefined;

        if (isModifyingHostOnly && !isCallerHost) {
          socket.emit("error_msg", "Only the host can modify Turn Timer, Assassin Rule, or Timer Action settings.");
          return;
        }

        if (settings.eliminationRule) {
          room.settings.eliminationRule = settings.eliminationRule;
        }
        if (settings.timerMode) {
          room.settings.timerMode = settings.timerMode;
        }
        if (settings.timerSeconds !== undefined) {
          room.settings.timerSeconds = settings.timerSeconds;
        }
        if (settings.spymasterTimerSeconds !== undefined) {
          room.settings.spymasterTimerSeconds = settings.spymasterTimerSeconds;
        }
        if (settings.firstClueExtraSeconds !== undefined) {
          room.settings.firstClueExtraSeconds = settings.firstClueExtraSeconds;
        }
        if (settings.operativeTimerSeconds !== undefined) {
          room.settings.operativeTimerSeconds = settings.operativeTimerSeconds;
        }
        if (settings.roomLocked !== undefined) {
          room.settings.roomLocked = settings.roomLocked;
        }
        if (settings.timerAction !== undefined) {
          room.settings.timerAction = settings.timerAction;
        }
        if (settings.language) {
          room.language = settings.language;
          const preset = room.gridConfig;
          const words = sampleWords(room.language || "en", preset.totalCards);
          room.board = generateBoard(room.teamCount, words, room.gameMode === "coop");
        }
      }

      startRoomTimer(room, io);
      broadcastRoomState(room, io);
    });

    // Kick player (host action)
    socket.on("kick_player", ({ roomCode, playerId }) => {
      const room = getRoom(roomCode);
      if (!room) return;

      const mapping = socketToPlayerMap.get(socket.id);
      if (!mapping) return;
      const caller = room.players.find((p) => p.id === mapping.playerId);
      if (!caller) return;

      const isCallerHost = caller.isHost || (room.players.length > 0 && caller.id === room.players[0]?.id);
      if (!isCallerHost) {
        socket.emit("error_msg", "Only the host can kick players.");
        return;
      }

      // Find the player to kick
      const targetPlayer = room.players.find((p) => p.id === playerId);
      if (targetPlayer) {
        // Disconnect their websocket if connected
        if (targetPlayer.socketId) {
          const targetSocket = io.sockets.sockets.get(targetPlayer.socketId);
          if (targetSocket) {
            targetSocket.emit("kicked");
            targetSocket.disconnect(true);
          }
        }

        // Remove from players array
        room.players = room.players.filter((p) => p.id !== playerId);

        // Add a system log message
        addGameLogEntry(
          io,
          room.roomCode,
          "turn_transition",
          null,
          `${targetPlayer.displayName} was kicked from the room by the host.`
        );

        broadcastRoomState(room, io);
      }
    });

    // Make player host (host action)
    socket.on("make_host", ({ roomCode, playerId }) => {
      const room = getRoom(roomCode);
      if (!room) return;

      const mapping = socketToPlayerMap.get(socket.id);
      if (!mapping) return;
      const caller = room.players.find((p) => p.id === mapping.playerId);
      if (!caller) return;

      // Only the host can promote someone else to host
      const isCallerHost = caller.isHost || (room.players.length > 0 && caller.id === room.players[0]?.id);
      if (!isCallerHost) {
        socket.emit("error_msg", "Only the host can promote someone else to host.");
        return;
      }

      const targetPlayer = room.players.find((p) => p.id === playerId);
      if (targetPlayer) {
        targetPlayer.isHost = true;

        addGameLogEntry(
          io,
          room.roomCode,
          "turn_transition",
          null,
          `${targetPlayer.displayName} has been promoted to Host.`
        );

        broadcastRoomState(room, io);
      }
    });

    // Rename team custom name
    socket.on("rename_team", ({ roomCode, teamColor, name }) => {
      const room = getRoom(roomCode);
      if (!room) return;
      const color = teamColor as TeamIdentifier;
      if (room.teams[color] && name && name.trim() !== "") {
        const oldName = room.teams[color]!.name;
        room.teams[color]!.name = name.trim();
        addGameLogEntry(
          io,
          room.roomCode,
          "turn_transition",
          color,
          `Team ${color.toUpperCase()} ("${oldName}") was renamed to "${name.trim()}".`
        );
        broadcastRoomState(room, io);
      }
    });

    // Randomize players into teams
    socket.on("randomize_teams", ({ roomCode }) => {
      const room = getRoom(roomCode);
      if (!room) return;
      if (room.settings.roomLocked) return;

      const allPlayers = room.players;
      if (allPlayers.length === 0) return;

      // Persist host identity before shuffling
      const currentHost = allPlayers.find((p) => p.isHost) || allPlayers[0];
      if (currentHost) {
        currentHost.isHost = true;
      }

      // Fisher-Yates Shuffle
      const shuffled = [...allPlayers];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = shuffled[i]!;
        shuffled[i] = shuffled[j]!;
        shuffled[j] = temp;
      }

      const teamColors = TEAM_COLORS_BY_INDEX.slice(0, room.teamCount);

      // Reset roles and teams
      shuffled.forEach((p, idx) => {
        const teamColor = teamColors[idx % teamColors.length]!;
        p.team = teamColor;

        if (room.gameMode === "coop") {
          p.role = null;
        } else {
          // Balance roles: first player in team gets spymaster, subsequent get operative
          const teamPlayersPrior = shuffled.slice(0, idx).filter((x) => x.team === teamColor);
          const hasSpymaster = teamPlayersPrior.some((x) => x.role === "spymaster");
          p.role = hasSpymaster ? "operative" : "spymaster";
        }
      });

      // Update room.players with the shuffled new array reference
      room.players = shuffled;

      // Update socket room subscriptions for each player in the room
      shuffled.forEach((p) => {
        if ((p as any).socketId) {
          const pSocket = io.sockets.sockets.get((p as any).socketId);
          if (pSocket) {
            updateSocketRooms(pSocket, room.roomCode, p.team, p.role);
            sendChatHistory(pSocket, room.roomCode, p.team, p.role);
          }
        }
      });

      addGameLogEntry(
        io,
        room.roomCode,
        "turn_transition",
        null,
        "Lobby teams and roles randomized by the host!"
      );
      broadcastRoomState(room, io);
    });

    // Send chat message
    socket.on("send_chat", async ({ roomCode, playerId, content }) => {
      const room = getRoom(roomCode);
      if (!room) return;

      const player = room.players.find((p) => p.id === playerId);
      if (!player || !player.team || (room.gameMode !== "coop" && !player.role)) return;

      const trimmedContent = content.trim();
      if (!trimmedContent) return;

      const chatMessage = {
        id: `msg_${Math.random().toString(36).substring(2, 11)}`,
        roomCode,
        senderId: player.id,
        senderName: player.displayName,
        content: trimmedContent,
        sentAt: new Date().toISOString(),
        isSystemMessage: false,
        senderIsSupporter: !!(player as any).isSupporter,
      };

      let redisKey = "";
      let socketRoom = "";

      if (room.gameMode === "coop" || player.role === "operative") {
        redisKey = `chat:${roomCode}:operatives`;
        socketRoom = `room:${roomCode}:operatives`;
      } else if (player.role === "spymaster") {
        redisKey = `chat:${roomCode}:spymasters`;
        socketRoom = `room:${roomCode}:spymasters`;
      } else {
        return;
      }

      const msgStr = JSON.stringify(chatMessage);
      redis.rpush(redisKey, msgStr)
        .then(() => redis.ltrim(redisKey, -100, -1))
        .catch((err) => console.error("[redis] error storing chat message:", err));

      io.to(socketRoom).emit("chat_message", chatMessage);
    });

    // Update player status (presence)
    socket.on("update_status", ({ roomCode, playerId, status }) => {
      const room = getRoom(roomCode);
      if (!room) return;

      const player = room.players.find((p) => p.id === playerId);
      if (!player) return;

      const validStatuses = ["ACTIVE", "BRB", "AFK", ".zZ", "FOCUS", "BUSY"];
      if (validStatuses.includes(status)) {
        player.status = status;
        broadcastRoomState(room, io);
      }
    });

    // Send screen reaction (spymasters only, rate-limited)
    socket.on("send_reaction", ({ roomCode, playerId, emoji }) => {
      const room = getRoom(roomCode);
      if (!room) return;

      const player = room.players.find((p) => p.id === playerId);
      if (!player || player.role !== "spymaster") {
        socket.emit("error_msg", "Only spymasters can send screen reactions.");
        return;
      }

      const validEmojis = ["facepalm", "fire", "skull", "party", "clap", "heart"];
      if (!validEmojis.includes(emoji)) return;

      const cooldown = process.env["NODE_ENV"] === "test" ? 100 : 10000;
      const lastReaction = lastReactionMap.get(playerId) || 0;
      const now = Date.now();

      if (now - lastReaction < cooldown) {
        socket.emit("error_msg", "Reaction is on cooldown. Please wait.");
        return;
      }

      lastReactionMap.set(playerId, now);

      // Broadcast reaction event to all sockets in the room
      io.to(`room:${room.roomCode}`).emit("reaction_received", {
        playerId,
        emoji,
      });
    });

    // Disconnect handler
    socket.on("disconnect", (reason) => {
      console.log(`[socket] client disconnected: ${socket.id} — ${reason}`);
      const mapping = socketToPlayerMap.get(socket.id);
      if (mapping) {
        const room = getRoom(mapping.roomCode);
        if (room) {
          const player = room.players.find((p) => p.id === mapping.playerId);
          if (player) {
            player.connected = false;
            broadcastRoomState(room, io);
          }
        }
        socketToPlayerMap.delete(socket.id);
      }
    });
  });
}

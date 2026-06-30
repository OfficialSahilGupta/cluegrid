process.env.NODE_ENV = "test";
import { createRoom } from "./rooms.js";
import { registerSocketHandlers } from "./sockets.js";
import { redis } from "./redis.js";

// Mock Socket.IO server representation for testing
class MockSocket {
  id: string;
  events: Record<string, ((...args: any[]) => void)[]> = {};
  emitted: { event: string; args: any[] }[] = [];
  rooms = new Set<string>();

  constructor(id: string) {
    this.id = id;
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event]!.push(callback);
  }

  emit(event: string, ...args: any[]) {
    this.emitted.push({ event, args });
  }

  join(room: string) {
    this.rooms.add(room);
  }

  leave(room: string) {
    this.rooms.delete(room);
  }

  simulateReceive(event: string, payload: any) {
    const callbacks = this.events[event];
    if (callbacks) {
      callbacks.forEach((cb) => cb(payload));
    }
  }
}

class MockIOServer {
  sockets = {
    sockets: new Map<string, MockSocket>(),
  };
  connectionCallbacks: ((...args: any[]) => void)[] = [];

  on(event: string, callback: (...args: any[]) => void) {
    if (event === "connection") {
      this.connectionCallbacks.push(callback);
    }
  }

  simulateConnection(socket: MockSocket) {
    this.sockets.sockets.set(socket.id, socket);
    this.connectionCallbacks.forEach((cb) => cb(socket));
  }
}

async function runGameLoopTests() {
  console.log("==> Running Game Loop and turn engine tests...");

  // Setup: Create room and connect players
  const room = await createRoom(2); // 2 teams: red and blue
  const io = new MockIOServer() as any;
  registerSocketHandlers(io);

  const socketPlayer1 = new MockSocket("socket_1");
  const socketPlayer2 = new MockSocket("socket_2");
  const socketPlayer3 = new MockSocket("socket_3");

  io.simulateConnection(socketPlayer1);
  io.simulateConnection(socketPlayer2);
  io.simulateConnection(socketPlayer3);

  // 1. Join room
  socketPlayer1.simulateReceive("join_room", {
    roomCode: room.roomCode,
    playerId: "p1",
    displayName: "Player 1",
  });
  socketPlayer2.simulateReceive("join_room", {
    roomCode: room.roomCode,
    playerId: "p2",
    displayName: "Player 2",
  });
  socketPlayer3.simulateReceive("join_room", {
    roomCode: room.roomCode,
    playerId: "p3",
    displayName: "Player 3",
  });

  if (room.players.length !== 3) throw new Error("Players count must be 3");

  // 2. Select teams and roles
  // Player 1: Red Spymaster
  socketPlayer1.simulateReceive("update_player", {
    roomCode: room.roomCode,
    playerId: "p1",
    team: "red",
    role: "spymaster",
  });

  // Verify Player 1 is Red Spymaster
  const p1 = room.players.find((p) => p.id === "p1");
  if (p1?.team !== "red" || p1?.role !== "spymaster") {
    throw new Error("Player 1 must be Red Spymaster");
  }

  // Enforce Max 1 Spymaster: Player 2 attempts to join as Red Spymaster
  socketPlayer2.simulateReceive("update_player", {
    roomCode: room.roomCode,
    playerId: "p2",
    team: "red",
    role: "spymaster",
  });

  // Verify Player 2 was NOT allowed to become Red Spymaster (keeps their previous undefined or spectator role)
  const p2 = room.players.find((p) => p.id === "p2");
  if (p2?.role === "spymaster") {
    throw new Error("Enforcement fail: Two spymasters on the same team allowed!");
  }

  // Player 2 joins Red Operative
  socketPlayer2.simulateReceive("update_player", {
    roomCode: room.roomCode,
    playerId: "p2",
    team: "red",
    role: "operative",
  });

  // Player 3 joins Blue Spymaster
  socketPlayer3.simulateReceive("update_player", {
    roomCode: room.roomCode,
    playerId: "p3",
    team: "blue",
    role: "spymaster",
  });

  // 3. Start Game
  socketPlayer1.simulateReceive("start_game", { roomCode: room.roomCode });

  if (room.phase !== "playing") throw new Error("Game must start and enter playing phase");
  if (!room.turnState) throw new Error("Turn state must be initialized");
  if (room.turnState.activeTeam !== "red") throw new Error("Red must start first");
  if (room.turnState.phase !== "giving_clue") throw new Error("Should start in giving_clue phase");

  // 4. Clue Validation and Submission
  // Blue Spymaster (P3) tries to give clue on Red's turn -> should fail
  socketPlayer3.simulateReceive("give_clue", {
    roomCode: room.roomCode,
    playerId: "p3",
    clueWord: "BLUECLUE",
    clueCount: 2,
  });
  if (room.turnState.clueWord === "BLUECLUE") {
    throw new Error("Non-active team spymaster gave a clue!");
  }

  // Red Operative (P2) tries to give clue -> should fail
  socketPlayer2.simulateReceive("give_clue", {
    roomCode: room.roomCode,
    playerId: "p2",
    clueWord: "OPERATIVECLUE",
    clueCount: 2,
  });
  if (room.turnState.clueWord === "OPERATIVECLUE") {
    throw new Error("Operative was allowed to give clue!");
  }

  // Red Spymaster (P1) gives valid clue
  socketPlayer1.simulateReceive("give_clue", {
    roomCode: room.roomCode,
    playerId: "p1",
    clueWord: "FIRE",
    clueCount: 2,
  });

  if (room.turnState.clueWord !== "FIRE" || room.turnState.clueCount !== 2) {
    throw new Error("Valid clue submission failed");
  }
  if ((room.turnState.phase as string) !== "guessing") {
    throw new Error("Turn phase should become guessing");
  }
  if (room.turnState.guessesAllowed !== 3) {
    throw new Error("Guesses allowed should be clueCount + 1 = 3");
  }

  // 5. Card revealing and guesses limit logic
  // Find a red card, a neutral card, a blue card, and assassin card
  const redCard = room.board.find((c) => c.type === "red")!;
  const blueCard = room.board.find((c) => c.type === "blue")!;
  const neutralCard = room.board.find((c) => c.type === "neutral")!;
  const assassinCard = room.board.find((c) => c.type === "assassin")!;

  if (!redCard || !blueCard || !neutralCard || !assassinCard) {
    throw new Error("Missing cards on board");
  }

  // Non-active team (P3) tries to guess -> should fail
  socketPlayer3.simulateReceive("guess_card", {
    roomCode: room.roomCode,
    playerId: "p3",
    cardId: redCard.id,
  });
  if (redCard.revealed) {
    throw new Error("Inactive team was allowed to guess card");
  }

  // Red Spymaster (P1) tries to guess -> should fail
  socketPlayer1.simulateReceive("guess_card", {
    roomCode: room.roomCode,
    playerId: "p1",
    cardId: redCard.id,
  });
  if (redCard.revealed) {
    throw new Error("Spymaster was allowed to guess card");
  }

  // Red Operative (P2) guesses correctly
  socketPlayer2.simulateReceive("guess_card", {
    roomCode: room.roomCode,
    playerId: "p2",
    cardId: redCard.id,
  });

  if (!redCard.revealed) throw new Error("Card should be revealed after guess");
  if (room.turnState.guessesUsed !== 1) throw new Error("Guesses used should increment to 1");
  if ((room.turnState.activeTeam as string) !== "red" || (room.turnState.phase as string) !== "guessing") {
    throw new Error("Correct guess should keep guessing turn alive");
  }

  // Red Operative guesses neutral card -> turn ends
  socketPlayer2.simulateReceive("guess_card", {
    roomCode: room.roomCode,
    playerId: "p2",
    cardId: neutralCard.id,
  });

  if (!neutralCard.revealed) throw new Error("Neutral card should be revealed");
  if ((room.turnState.activeTeam as string) !== "blue") {
    throw new Error("Neutral card click must end turn and rotate to Blue");
  }
  if ((room.turnState.phase as string) !== "giving_clue") {
    // Rotated turn should reset phase to giving_clue
    throw new Error("Advanced turn should reset phase to giving_clue");
  }

  console.log("✓ Turn rotation and correct/neutral guess reveal tests passed.");

  // 6. Test Assassin / Elimination rule
  // Reset game so we can test assassin cards
  socketPlayer1.simulateReceive("start_game", { roomCode: room.roomCode });
  // Set default settings
  socketPlayer1.simulateReceive("update_settings", {
    roomCode: room.roomCode,
    settings: { eliminationRule: "continue" },
  });

  // Give clue for red team
  socketPlayer1.simulateReceive("give_clue", {
    roomCode: room.roomCode,
    playerId: "p1",
    clueWord: "DANGER",
    clueCount: 1,
  });

  // Operative P2 clicks assassin
  const freshAssassinCard = room.board.find((c) => c.type === "assassin")!;
  socketPlayer2.simulateReceive("guess_card", {
    roomCode: room.roomCode,
    playerId: "p2",
    cardId: freshAssassinCard.id,
  });

  // Red team was active, so they clicked assassin. Red team should be eliminated.
  if (!room.teams.red!.eliminated) {
    throw new Error("Red team should be eliminated after assassin card click");
  }
  // With "continue" settings and 2 teams total, if red is eliminated, only blue remains, so blue should win!
  if ((room.phase as string) !== "ended" || room.winner !== "blue") {
    throw new Error("With only 2 teams, eliminating 1 must end the game and crown the other team!");
  }

  console.log("✓ Assassin card elimination/end game tests passed.");
  console.log("All game loop & turn engine tests passed successfully! 🎉");
  try {
    await redis.quit();
  } catch (err) {
    // Already closed or failed
  }
}

runGameLoopTests().catch(console.error);

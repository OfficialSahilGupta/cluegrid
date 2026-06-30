process.env["NODE_ENV"] = "test";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { io as Client } from "socket.io-client";
import { registerSocketHandlers } from "./sockets.js";
import { createRoom } from "./rooms.js";
import { redis } from "./redis.js";

async function runCoopTests() {
  console.log("==> Running Cooperative Mode Turn & Resolution Tests...");

  try {
    await redis.connect();
  } catch (err) {
    // ignore
  }

  const httpServer = createServer();
  const io = new SocketIOServer(httpServer, {
    transports: ["websocket"],
  });

  registerSocketHandlers(io);

  await new Promise<void>((resolve) => httpServer.listen(0, resolve));
  const address = httpServer.address() as any;
  const port = address.port;
  const serverUrl = `http://localhost:${port}`;

  // 1. Create a Co-op room
  const room = await createRoom(2, "coop");
  const roomCode = room.roomCode;

  // Verify gameMode set
  if (room.gameMode !== "coop") {
    throw new Error("Expected room gameMode to be coop");
  }

  // 2. Connect client sockets
  const clientSocket = Client(serverUrl, { transports: ["websocket"] });
  const waitConnect = () => new Promise<void>((resolve) => clientSocket.on("connect", resolve));
  await waitConnect();

  let roomState: any = null;
  clientSocket.on("room_state", (state) => {
    roomState = state;
  });

  // Join as Blue Operative (guessing on red team's clue)
  clientSocket.emit("join_room", {
    roomCode,
    playerId: "coop_op1",
    displayName: "Coop Op",
    team: "blue",
    role: "operative",
  });
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Start game
  clientSocket.emit("start_game", { roomCode });
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Force predictable card board for testing coop resolutions
  room.board = [
    { id: 0, word: "APPLE", type: "blue", coopBlueType: "blue", coopRedType: "blue", revealed: false, revealedAt: null, revealedBy: null } as any,
    { id: 1, word: "BANANA", type: "neutral", coopBlueType: "neutral", coopRedType: "neutral", revealed: false, revealedAt: null, revealedBy: null } as any,
    { id: 2, word: "CHERRY", type: "assassin", coopBlueType: "assassin", coopRedType: "assassin", revealed: false, revealedAt: null, revealedBy: null } as any,
  ];
  if (room.teams.blue) room.teams.blue.cardsRemaining = 1;
  if (room.teams.red) room.teams.red.cardsRemaining = 0;
  room.coopMistakesMade = 0;
  room.coopMistakesAllowed = 3; // set small limit for test

  // Submit clue to transition to guessing phase
  clientSocket.emit("give_clue", {
    roomCode,
    playerId: "coop_op1", // in tests we bypass role validations if needed, let's join as spymaster first to give clue
  });
  // Actually, to make it easier, let's just force turnState phase to guessing:
  room.turnState = {
    activeTeam: "red",
    phase: "guessing",
    clueWord: "FRUIT",
    clueCount: 2,
    guessesUsed: 0,
    guessesAllowed: 3,
    turnNumber: 1,
  };

  // Test correct guess: reveals Red card -> Wins game since cardsRemaining = 1
  clientSocket.emit("guess_card", {
    roomCode,
    playerId: "coop_op1",
    cardId: 0,
  });
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (roomState.phase !== "ended" || roomState.winner !== "blue") {
    throw new Error(`Expected coop team to win after finding all agents, got phase: ${roomState.phase}, winner: ${roomState.winner}`);
  }
  console.log("✓ Cooperative team wins correctly after finding all agent cards.");

  // Reset room state for Assassin test
  room.phase = "playing";
  room.winner = null;
  room.coopMistakesMade = 0;
  if (room.board && room.board[0] && room.board[1] && room.board[2]) {
    room.board[0].revealed = false;
    room.board[1].revealed = false;
    room.board[2].revealed = false;
  }
  if (room.teams.blue) room.teams.blue.cardsRemaining = 1;
  if (room.teams.red) room.teams.red.cardsRemaining = 0;
  room.turnState = {
    activeTeam: "red",
    phase: "guessing",
    clueWord: "FRUIT",
    clueCount: 2,
    guessesUsed: 0,
    guessesAllowed: 3,
    turnNumber: 1,
  };

  // Test assassin guess: reveals assassin -> instantly ends in defeat (winner null)
  clientSocket.emit("guess_card", {
    roomCode,
    playerId: "coop_op1",
    cardId: 2,
  });
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (roomState.phase !== "ended" || roomState.winner !== "red") {
    throw new Error(`Expected coop team to lose after hitting assassin, got phase: ${roomState.phase}, winner: ${roomState.winner}`);
  }
  console.log("✓ Cooperative team loses instantly correctly after hitting the assassin card.");

  // Clean up
  clientSocket.disconnect();
  io.close();
  httpServer.close();
  try {
    await redis.quit();
  } catch (err) {
    // ignore
  }

  console.log("All Cooperative Mode tests passed successfully! 🎉");
  process.exit(0);
}

runCoopTests().catch((err) => {
  console.error("Coop tests failed:", err);
  process.exit(1);
});

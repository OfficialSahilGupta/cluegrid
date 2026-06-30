process.env["NODE_ENV"] = "test";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { io as Client } from "socket.io-client";
import { registerSocketHandlers } from "./sockets.js";
import { createRoom } from "./rooms.js";
import { redis } from "./redis.js";

async function runGameLogTests() {
  console.log("==> Running Game Log Persistence Tests...");

  try {
    await redis.connect();
  } catch (err) {
    // Already connected or failed
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

  // 1. Create a 2-team room
  const room = await createRoom(2);
  const roomCode = room.roomCode;



  // 2. Connect client sockets
  const spymasterSocket = Client(serverUrl, { transports: ["websocket"] });
  const operativeSocket = Client(serverUrl, { transports: ["websocket"] });

  const waitConnect = (socket: any) =>
    new Promise<void>((resolve) => socket.on("connect", resolve));

  await Promise.all([waitConnect(spymasterSocket), waitConnect(operativeSocket)]);

  // Join spymaster client as Red Spymaster
  spymasterSocket.emit("join_room", {
    roomCode,
    playerId: "spy1",
    displayName: "Spy 1",
    team: "red",
    role: "spymaster",
  });

  // Join operative client as Red Operative
  operativeSocket.emit("join_room", {
    roomCode,
    playerId: "op1",
    displayName: "Op 1",
    team: "red",
    role: "operative",
  });

  // Wait for registration
  await new Promise((resolve) => setTimeout(resolve, 300));

  let currentLog: any[] = [];
  operativeSocket.on("game_log", ({ log }) => {
    currentLog = log;
  });

  operativeSocket.on("log_entry", (entry) => {
    currentLog.push(entry);
  });

  // 3. Start game
  spymasterSocket.emit("start_game", { roomCode });
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Force cards to be predictable for testing card reveal results
  room.board = [
    { id: 0, word: "APPLE", type: "red", revealed: false, revealedAt: null, revealedBy: null },
    { id: 1, word: "BANANA", type: "neutral", revealed: false, revealedAt: null, revealedBy: null },
    { id: 2, word: "CHERRY", type: "assassin", revealed: false, revealedAt: null, revealedBy: null },
  ];
  if (room.teams.red) room.teams.red.cardsRemaining = 1;

  // Expect game_started log entry
  if ((currentLog.length as number) < 1 || currentLog[0].type !== "game_started") {
    throw new Error(`Expected first log entry to be game_started, got ${JSON.stringify(currentLog)}`);
  }
  console.log("✓ Game Started log recorded correctly.");

  // 4. Submit clue
  spymasterSocket.emit("give_clue", {
    roomCode,
    playerId: "spy1",
    clueWord: "FRUIT",
    clueCount: 2,
  });
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Expect clue log entry
  if ((currentLog.length as number) < 3 || currentLog[2].type !== "clue") {
    throw new Error(`Expected third log entry to be clue, got ${JSON.stringify(currentLog)}`);
  }
  console.log("✓ Clue Given log recorded correctly.");

  // 5. Guess correct card (APPLE)
  operativeSocket.emit("guess_card", {
    roomCode,
    playerId: "op1",
    cardId: 0,
  });
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Expect reveal log entry
  if ((currentLog.length as number) < 4 || currentLog[3].type !== "reveal" || !currentLog[3].message.includes("Correct")) {
    throw new Error(`Expected fourth log entry to be correct reveal, got ${JSON.stringify(currentLog)}`);
  }
  console.log("✓ Card Guess Reveal log recorded correctly.");

  // 6. Reconnect new socket and verify history loads from Redis
  operativeSocket.disconnect();
  await new Promise((resolve) => setTimeout(resolve, 150));

  const newOperativeSocket = Client(serverUrl, { transports: ["websocket"] });
  await waitConnect(newOperativeSocket);

  let reloadedLog: any[] = [];
  newOperativeSocket.on("game_log", ({ log }) => {
    reloadedLog = log;
  });

  newOperativeSocket.emit("join_room", {
    roomCode,
    playerId: "op1",
    displayName: "Op 1 (Reconnected)",
    team: "red",
    role: "operative",
  });
  await new Promise((resolve) => setTimeout(resolve, 300));

  if ((reloadedLog.length as number) !== 5) {
    throw new Error(`Expected reloaded log length to be 5, got ${reloadedLog.length}`);
  }
  if (reloadedLog[3].type !== "reveal" || reloadedLog[4].type !== "game_ended") {
    throw new Error(`Expected reloaded log history to match pre-disconnect state and include game_ended`);
  }
  console.log("✓ Game Log successfully persists in Redis and survives reconnection.");

  // Clean up
  spymasterSocket.disconnect();
  newOperativeSocket.disconnect();
  io.close();
  httpServer.close();
  try {
    await redis.quit();
  } catch (err) {
    // Already closed or failed
  }

  console.log("All Game Log tests passed successfully! 🎉");
  process.exit(0);
}

runGameLogTests().catch((err) => {
  console.error("Game log tests failed:", err);
  process.exit(1);
});

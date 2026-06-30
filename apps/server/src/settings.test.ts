process.env["NODE_ENV"] = "test";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { io as Client } from "socket.io-client";
import { registerSocketHandlers } from "./sockets.js";
import { createRoom } from "./rooms.js";
import { redis } from "./redis.js";

async function runSettingsTests() {
  console.log("==> Running Settings, Team Rename & Randomization Tests...");

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

  // 1. Create room
  const room = await createRoom(2);
  const roomCode = room.roomCode;

  // 2. Connect client sockets
  const clientSocket1 = Client(serverUrl, { transports: ["websocket"] });
  const clientSocket2 = Client(serverUrl, { transports: ["websocket"] });

  await Promise.all([
    new Promise<void>((resolve) => clientSocket1.on("connect", resolve)),
    new Promise<void>((resolve) => clientSocket2.on("connect", resolve)),
  ]);

  let roomState: any = null;
  clientSocket1.on("room_state", (state) => {
    roomState = state;
  });

  // Join room
  clientSocket1.emit("join_room", {
    roomCode,
    playerId: "p1",
    displayName: "Player 1",
  });
  clientSocket2.emit("join_room", {
    roomCode,
    playerId: "p2",
    displayName: "Player 2",
  });

  await new Promise((resolve) => setTimeout(resolve, 200));

  // Test 1: Update settings over socket
  clientSocket1.emit("update_settings", {
    roomCode,
    settings: {
      timerMode: "fast",
      timerSeconds: 60,
    },
  });
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (roomState.settings.timerMode !== "fast" || roomState.settings.timerSeconds !== 60) {
    throw new Error("Expected timerMode to update to fast and timerSeconds to 60");
  }
  console.log("✓ Live game timer configurations successfully updated over Socket.IO.");

  // Test 2: Rename team over socket
  clientSocket1.emit("rename_team", {
    roomCode,
    teamColor: "red",
    name: "New York Red Bulls",
  });
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (roomState.teams.red.name !== "New York Red Bulls") {
    throw new Error("Expected team red name to update to New York Red Bulls");
  }
  console.log("✓ Team names pool custom renaming successfully persisted and broadcasted.");

  // Test 3: Randomize teams over socket
  clientSocket1.emit("randomize_teams", { roomCode });
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Verify randomization did not throw and state is broadcasted
  if (!roomState.players || roomState.players.length === 0) {
    throw new Error("Expected players list to be broadcasted");
  }
  console.log("✓ Lobby teams and roles randomization successfully randomized.");

  // Clean up
  clientSocket1.disconnect();
  clientSocket2.disconnect();
  io.close();
  httpServer.close();
  try {
    await redis.quit();
  } catch (err) {
    // ignore
  }

  console.log("All Settings, Rename & Randomization tests passed successfully! 🎉");
  process.exit(0);
}

runSettingsTests().catch((err) => {
  console.error("Settings tests failed:", err);
  process.exit(1);
});

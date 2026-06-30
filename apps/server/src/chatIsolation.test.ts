process.env.NODE_ENV = "test";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { io as Client } from "socket.io-client";
import { registerSocketHandlers } from "./sockets.js";
import { createRoom } from "./rooms.js";
import { redis } from "./redis.js";

async function runTests() {
  console.log("==> Running Chat Channel Isolation Tests...");

  // Try to connect to Redis if not connected
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

  // Start listening on an ephemeral port
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

  // Join operative client as Blue Operative
  operativeSocket.emit("join_room", {
    roomCode,
    playerId: "op1",
    displayName: "Op 1",
    team: "blue",
    role: "operative",
  });

  // Wait a small bit for registration
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Set up listeners for chat messages on both clients
  const spymasterMessages: any[] = [];
  const operativeMessages: any[] = [];

  spymasterSocket.on("chat_message", (msg) => {
    spymasterMessages.push(msg);
  });

  operativeSocket.on("chat_message", (msg) => {
    operativeMessages.push(msg);
  });

  // 3. Spymaster sends a message to the spymaster channel
  spymasterSocket.emit("send_chat", {
    roomCode,
    playerId: "spy1",
    content: "Secret spymaster plan!",
  });

  // Wait for propagation
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Assertions
  if (spymasterMessages.length !== 1) {
    throw new Error(`Spymaster should have received 1 message, got ${spymasterMessages.length}`);
  }
  if (spymasterMessages[0].content !== "Secret spymaster plan!") {
    throw new Error(`Spymaster message content mismatch: ${spymasterMessages[0].content}`);
  }
  if ((operativeMessages.length as number) !== 0) {
    throw new Error(`SECURITY VULNERABILITY: Blue Operative received spymaster-channel message!`);
  }

  // 3.5 Operative sends a message to the operatives channel
  operativeSocket.emit("send_chat", {
    roomCode,
    playerId: "op1",
    content: "Hello team!",
  });

  // Wait for propagation
  await new Promise((resolve) => setTimeout(resolve, 300));

  if ((operativeMessages.length as number) !== 1) {
    throw new Error(`Operative should have received 1 message, got ${operativeMessages.length}`);
  }
  if ((spymasterMessages.length as number) !== 2) {
    throw new Error(`Spymaster should have received 2 messages (1 spymaster plan, 1 operative message), got ${spymasterMessages.length}`);
  }

  // 4. Double check server side room subscriptions
  const sockets = await io.in(`room:${roomCode}:spymasters`).fetchSockets();
  const socketIds = sockets.map((s) => s.id);

  const opPlayer = room.players.find((p) => p.id === "op1") as any;
  const opServerSocketId = opPlayer?.socketId;

  if (socketIds.includes(opServerSocketId)) {
    throw new Error(`SECURITY VULNERABILITY: Operative socket was placed in spymaster room!`);
  }

  console.log("✓ Operative socket is physically isolated from spymaster-channel events.");

  // Clean up
  spymasterSocket.disconnect();
  operativeSocket.disconnect();
  io.close();
  httpServer.close();
  try {
    await redis.quit();
  } catch (err) {
    // Already closed or failed
  }

  console.log("All chat isolation tests passed successfully! 🎉");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

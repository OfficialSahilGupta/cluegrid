process.env["NODE_ENV"] = "test";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { io as Client } from "socket.io-client";
import { registerSocketHandlers } from "./sockets.js";
import { createRoom } from "./rooms.js";
import { redis } from "./redis.js";

async function runReactionsTests() {
  console.log("==> Running Presence and Reaction Rate-Limit Tests...");

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

  // Start listening on ephemeral port
  await new Promise<void>((resolve) => httpServer.listen(0, resolve));
  const address = httpServer.address() as any;
  const port = address.port;
  const serverUrl = `http://localhost:${port}`;

  // 1. Create a 2-team room
  const room = await createRoom(2);
  const roomCode = room.roomCode;

  // 2. Connect clients
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

  // 3. Test Presence / Status Updates
  const roomStates: any[] = [];
  operativeSocket.on("room_state", (state) => {
    roomStates.push(state);
  });

  // Update status of spymaster to FOCUS
  spymasterSocket.emit("update_status", {
    roomCode,
    playerId: "spy1",
    status: "FOCUS",
  });

  // Wait for status sync
  await new Promise((resolve) => setTimeout(resolve, 300));

  const lastState = roomStates[roomStates.length - 1];
  const spy1Player = lastState?.players.find((p: any) => p.id === "spy1");
  if (!spy1Player) {
    throw new Error("Could not find spymaster player in room state");
  }
  if (spy1Player.status !== "FOCUS") {
    throw new Error(`Expected status to be FOCUS, got ${spy1Player.status}`);
  }
  console.log("✓ Presence status successfully synchronized across clients.");

  // 4. Test Spymaster reactions and rate limits
  const receivedReactions: any[] = [];
  operativeSocket.on("reaction_received", (rx) => {
    receivedReactions.push(rx);
  });

  // Send first valid reaction (emoji 🔥)
  spymasterSocket.emit("send_reaction", {
    roomCode,
    playerId: "spy1",
    emoji: "🔥",
  });

  // Send second reaction immediately (bypassing client-side controls)
  spymasterSocket.emit("send_reaction", {
    roomCode,
    playerId: "spy1",
    emoji: "🎉",
  });

  // Wait a small bit for server to process both
  await new Promise((resolve) => setTimeout(resolve, 150));

  if ((receivedReactions.length as number) !== 1) {
    throw new Error(`Expected exactly 1 reaction broadcast, received ${receivedReactions.length}`);
  }
  if (receivedReactions[0].emoji !== "🔥" || receivedReactions[0].playerId !== "spy1") {
    throw new Error(`Reaction payload mismatch: ${JSON.stringify(receivedReactions[0])}`);
  }

  console.log("✓ Server-side reaction rate-limiting successfully block abuse.");

  // Wait for test cooldown to elapse (100ms)
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Now sending should work again
  spymasterSocket.emit("send_reaction", {
    roomCode,
    playerId: "spy1",
    emoji: "🎉",
  });

  await new Promise((resolve) => setTimeout(resolve, 150));

  if ((receivedReactions.length as number) !== 2) {
    throw new Error(`Expected second reaction after cooldown, got total ${receivedReactions.length}`);
  }
  if (receivedReactions[1].emoji !== "🎉") {
    throw new Error(`Expected second emoji to be 🎉, got ${receivedReactions[1].emoji}`);
  }
  console.log("✓ Spymaster reactions correctly broadcasted again after cooldown elapsed.");

  // Operative tries to send reaction -> should be blocked server-side
  operativeSocket.emit("send_reaction", {
    roomCode,
    playerId: "op1",
    emoji: "👏",
  });

  await new Promise((resolve) => setTimeout(resolve, 150));

  if ((receivedReactions.length as number) > 2) {
    throw new Error("SECURITY FAILURE: Operative socket was allowed to broadcast screen reaction!");
  }
  console.log("✓ Non-spymasters are blocked from sending reactions.");

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

  console.log("All reactions & status test verification passed successfully! 🎉");
  process.exit(0);
}

runReactionsTests().catch((err) => {
  console.error("Reactions tests failed:", err);
  process.exit(1);
});

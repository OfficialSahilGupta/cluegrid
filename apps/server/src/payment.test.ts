import { createServer } from "http";
import express from "express";
import { registerSocketHandlers } from "./sockets.js";
import paymentRouter from "./routes/payment.js";
import { db, initializeSchema } from "./db.js";
import { createRoom } from "./rooms.js";
import { io as Client } from "socket.io-client";
import { Server as SocketIOServer } from "socket.io";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runPaymentTests() {
  console.log("==> Running Monetization & Supporter Integration Tests...");

  await initializeSchema();

  // Create a clean mock user
  const email = `supporter_test_${Date.now()}@cluegrid.com`;
  const username = "SupporterHero";
  const userRes = await db.query(
    "INSERT INTO users (email, password_hash, username) VALUES ($1, 'dummy', $2) RETURNING id",
    [email, username]
  );
  const userId = userRes.rows[0].id;

  // Set up test server
  const app = express();
  app.use("/api/payment", paymentRouter);
  app.use(express.json());

  const server = createServer(app);
  const io = new SocketIOServer(server);
  registerSocketHandlers(io);

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;

  // 1. Test Checkout Session endpoint (Mock mode)
  const checkoutRes = await fetch(`http://localhost:${port}/api/payment/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-mock-user-id": String(userId),
    },
    body: JSON.stringify({ type: "one_time" }),
  });

  const checkoutData: any = await checkoutRes.json();
  if (!checkoutData.success || !checkoutData.url.includes("supporter-success")) {
    throw new Error("Checkout session creation failed or returned incorrect mock URL!");
  }
  console.log("✓ Mock Checkout session generated successfully.");

  // 2. Test Webhook direct upgrade (Bypass signature for test validation)
  const webhookPayload = JSON.stringify({ userId });
  const webhookRes = await fetch(`http://localhost:${port}/api/payment/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-bypass-stripe-webhook": "true",
    },
    body: webhookPayload,
  });

  const webhookData: any = await webhookRes.json();
  if (!webhookData.received || !webhookData.bypassed) {
    throw new Error("Webhook processing failed!");
  }

  // Verify DB updated
  const checkDb = await db.query("SELECT is_supporter FROM users WHERE id = $1", [userId]);
  if (!checkDb.rows[0].is_supporter) {
    throw new Error("User's is_supporter database column was not updated to TRUE!");
  }
  console.log("✓ Stripe Webhook successfully upgraded user record in PostgreSQL to Supporter tier.");

  // 3. Test Socket join room reads supporter status
  const room = await createRoom(2);
  const clientSocket = Client(`http://localhost:${port}`, {
    transports: ["websocket"],
  });

  await new Promise<void>((resolve, reject) => {
    clientSocket.on("connect", () => {
      clientSocket.emit("join_room", {
        roomCode: room.roomCode,
        playerId: "p_supporter_test",
        displayName: username,
        avatar: "⚡",
        userId: userId,
      });
    });

    clientSocket.on("room_state", (updatedRoom: any) => {
      const playerObj = updatedRoom.players.find((p: any) => p.id === "p_supporter_test");
      if (playerObj) {
        if (playerObj.isSupporter === true) {
          resolve();
        } else {
          reject(new Error("Player isSupporter memory flag was not set to true on join_room!"));
        }
      }
    });

    setTimeout(() => reject(new Error("Timeout waiting for room_state on socket")), 4000);
  });

  console.log("✓ Real-time websocket correctly loaded and broadcasted player supporter status.");

  // Clean up
  clientSocket.disconnect();
  io.close();
  server.close();
  await db.query("DELETE FROM users WHERE id = $1", [userId]);

  console.log("All Monetization / Stripe Checkout tests passed successfully! 💎🎉");
  process.exit(0);
}

runPaymentTests().catch((err) => {
  console.error("Monetization tests failed:", err);
  process.exit(1);
});

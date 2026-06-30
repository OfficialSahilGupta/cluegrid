import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { ExpressAuth } from "@auth/express";
import { config } from "./config.js";
import { healthRouter } from "./routes/health.js";
import { redis } from "./redis.js";
import { authConfig } from "./auth.js";
import { checkDbConnection, initializeSchema } from "./db.js";
import userRouter from "./routes/user.js";

// ─── Express app ─────────────────────────────────────────────────────────────

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

import paymentRouter from "./routes/payment.js";
app.use("/api/payment", paymentRouter);

app.use(express.json({ limit: "512kb" }));

// ─── Routes ──────────────────────────────────────────────────────────────────

import { searchRouter } from "./routes/search.js";
app.use("/api/search", searchRouter);
app.use("/api/auth", ExpressAuth(authConfig));
app.use("/api/user", userRouter);

app.get("/", (_req, res) => {
  res.json({ message: "ClueGrid server is running 🎯", version: config.version });
});

// Import rooms helper and config
import { createRoom, getRoom } from "./rooms.js";
import { registerSocketHandlers } from "./sockets.js";

// Endpoint to create a room
app.post("/api/rooms", async (req, res) => {
  try {
    // Guard against missing body (e.g. wrong Content-Type header)
    const body = req.body ?? {};
    const teamCount = Number(body.teamCount || 2);
    const gameMode = body.gameMode || "classic";
    const language = body.language || "en";
    const room = await createRoom(teamCount, gameMode, language);
    res.json({ success: true, roomCode: room.roomCode });
  } catch (error: any) {
    console.error("[rooms] createRoom error:", error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Endpoint to get a room
app.get("/api/rooms/:code", (req, res) => {
  const room = getRoom(req.params.code);
  if (!room) {
    res.status(404).json({ success: false, error: "Room not found" });
    return;
  }

  const isSpymaster = req.query["spymaster"] === "true";

  // Strip true card types if player is not spymaster
  const clientBoard = room.board.map((card) => {
    if (isSpymaster || card.revealed) {
      return card;
    }
    // Return card without the sensitive "type" field
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { type: _, ...safeCard } = card;
    return safeCard;
  });

  res.json({
    success: true,
    room: {
      ...room,
      board: clientBoard,
    },
  });
});

app.use("/health", healthRouter);

// ─── Global error handler ─────────────────────────────────────────────────────
// Must be registered after all routes. Catches any unhandled errors and returns
// a clean JSON body so the frontend can display a useful message.
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("[server] unhandled error:", err?.message ?? err);
  res.status(500).json({ success: false, error: err?.message ?? "Internal server error" });
});

// ─── HTTP + Socket.IO server ─────────────────────────────────────────────────

const httpServer = createServer(app);

export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.corsOrigin,
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

registerSocketHandlers(io);

// ─── Boot ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  // Eagerly connect Redis so health-check reflects reality quickly.
  try {
    await redis.connect();
    console.log("[redis] connected");
  } catch (err) {
    console.warn("[redis] could not connect on startup:", (err as Error).message);
  }

  // Connect and initialize Postgres schema
  const dbConnected = await checkDbConnection();
  if (dbConnected) {
    console.log("[postgres] connected");
    await initializeSchema();
  } else {
    console.warn("[postgres] could not connect on startup");
  }

  httpServer.listen(config.port, () => {
    console.log(
      `[server] ClueGrid server running at http://localhost:${config.port} (${config.nodeEnv})`
    );
  });
}

main().catch((err: unknown) => {
  console.error("[server] fatal startup error:", err);
  process.exit(1);
});

import { redis } from "./redis.js";
import { GameLogEntry, GameLogType } from "@cluegrid/shared";
import { Server as SocketIOServer } from "socket.io";

export async function addGameLogEntry(
  io: SocketIOServer,
  roomCode: string,
  type: GameLogType,
  team: string | null,
  message: string,
  details?: any
) {
  const entry: GameLogEntry = {
    id: `log_${Math.random().toString(36).substring(2, 11)}`,
    roomCode,
    type,
    team,
    message,
    timestamp: new Date().toISOString(),
    details,
  };

  try {
    await redis.rpush(`log:${roomCode}`, JSON.stringify(entry));
  } catch (err) {
    console.error("[redis] error writing game log entry:", err);
  }

  // Broadcast to all sockets in the room
  if (io && typeof io.to === "function") {
    io.to(`room:${roomCode}`).emit("log_entry", entry);
  }
  return entry;
}

export async function getGameLog(roomCode: string): Promise<GameLogEntry[]> {
  try {
    const raw = await redis.lrange(`log:${roomCode}`, 0, -1);
    return raw.map((r) => JSON.parse(r));
  } catch (err) {
    console.error("[redis] error retrieving game log:", err);
    return [];
  }
}

export async function clearGameLog(roomCode: string) {
  try {
    await redis.del(`log:${roomCode}`);
  } catch (err) {
    console.error("[redis] error deleting game log:", err);
  }
}

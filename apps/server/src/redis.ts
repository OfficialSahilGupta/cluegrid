import { Redis } from "ioredis";
import { config } from "./config.js";

export const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
});

redis.on("error", (err: Error) => {
  // Log but don't crash — health check will reflect the state.
  console.error("[redis] connection error:", err.message);
});

/**
 * Tests the Redis connection. Returns true if successful.
 */
export async function checkRedisConnection(): Promise<boolean> {
  try {
    const pong = await redis.ping();
    return pong === "PONG";
  } catch {
    return false;
  }
}

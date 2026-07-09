import { Router } from "express";
import type { HealthResponse } from "@cluegrid/shared";
import { checkDbConnection } from "../db.js";
import { checkRedisConnection } from "../redis.js";
import { config } from "../config.js";

export const healthRouter = Router();

let cachedHealth: { postgresOk: boolean; redisOk: boolean; timestamp: number } | null = null;
const CACHE_TTL_MS = 2000; // Cache health checks for 2 seconds to prevent DB/Redis connection hammering

/**
 * GET /health
 * Returns service status for Postgres, Redis, and the server itself.
 */
healthRouter.get("/", async (_req, res) => {
  const now = Date.now();

  if (!cachedHealth || now - cachedHealth.timestamp > CACHE_TTL_MS) {
    const [postgresOk, redisOk] = await Promise.all([
      checkDbConnection(),
      checkRedisConnection(),
    ]);
    cachedHealth = { postgresOk, redisOk, timestamp: now };
  }

  const body: HealthResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: config.version,
    services: {
      postgres: cachedHealth.postgresOk ? "up" : "down",
      redis: cachedHealth.redisOk ? "up" : "down",
    },
  };

  // Return 200 regardless — let uptime monitors parse the service sub-statuses.
  res.status(200).json(body);
});

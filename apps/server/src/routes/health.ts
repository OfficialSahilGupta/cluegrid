import { Router } from "express";
import type { HealthResponse } from "@cluegrid/shared";
import { checkDbConnection } from "../db.js";
import { checkRedisConnection } from "../redis.js";
import { config } from "../config.js";

export const healthRouter = Router();

/**
 * GET /health
 * Returns service status for Postgres, Redis, and the server itself.
 */
healthRouter.get("/", async (_req, res) => {
  const [postgresOk, redisOk] = await Promise.all([
    checkDbConnection(),
    checkRedisConnection(),
  ]);

  const body: HealthResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: config.version,
    services: {
      postgres: postgresOk ? "up" : "down",
      redis: redisOk ? "up" : "down",
    },
  };

  // Return 200 regardless — let uptime monitors parse the service sub-statuses.
  res.status(200).json(body);
});

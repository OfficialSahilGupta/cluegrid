import "dotenv/config";

export const config = {
  port: parseInt(process.env["PORT"] ?? "3001", 10),
  nodeEnv: process.env["NODE_ENV"] ?? "development",
  databaseUrl:
    process.env["DATABASE_URL"] ??
    "postgresql://cluegrid:cluegrid_dev@localhost:5432/cluegrid",
  redisUrl: process.env["REDIS_URL"] ?? "redis://localhost:6379",
  corsOrigin: process.env["CORS_ORIGIN"] ?? "http://localhost:5173",
  version: "0.1.0",
} as const;

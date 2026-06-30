import pg from "pg";
import { config } from "./config.js";

const { Pool } = pg;

export const db = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

export let isDbConnected = false;

/**
 * Tests the database connection. Returns true if successful.
 */
export async function checkDbConnection(): Promise<boolean> {
  try {
    const client = await db.connect();
    await client.query("SELECT 1");
    client.release();
    isDbConnected = true;
    return true;
  } catch {
    isDbConnected = false;
    return false;
  }
}

/**
 * Initializes database tables if they do not exist.
 */
export async function initializeSchema() {
  const client = await db.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        avatar VARCHAR(255) DEFAULT '🕵️‍♂️',
        is_admin BOOLEAN DEFAULT FALSE,
        is_supporter BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
    `);

    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_supporter BOOLEAN DEFAULT FALSE;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS world_cities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
      );
    `);

    const citiesRes = await client.query("SELECT COUNT(*) FROM world_cities");
    if (Number(citiesRes.rows[0].count) === 0) {
      const defaultCities = [
        "Tokyo", "London", "Paris", "New York", "Cairo",
        "Sydney", "Mumbai", "Rio de Janeiro", "Moscow", "Cape Town",
        "Toronto", "Berlin", "Dubai", "Singapore", "Beijing",
        "Rome", "Amsterdam", "San Francisco", "Buenos Aires", "Nairobi",
        "Birgunj", "Kathmandu", "Pokhara", "Delhi", "Patna", "Chennai"
      ];
      for (const city of defaultCities) {
        await client.query("INSERT INTO world_cities (name) VALUES ($1) ON CONFLICT DO NOTHING", [city]);
      }
      console.log("[postgres] seeded initial world cities");
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_stats (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        games_played INTEGER DEFAULT 0,
        games_won INTEGER DEFAULT 0,
        total_guesses INTEGER DEFAULT 0,
        correct_guesses INTEGER DEFAULT 0
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS match_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        room_code VARCHAR(10) NOT NULL,
        team VARCHAR(20) NOT NULL,
        role VARCHAR(20) NOT NULL,
        won BOOLEAN NOT NULL,
        ended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("[postgres] tables initialized successfully");
  } catch (err) {
    console.error("[postgres] error initializing tables:", err);
  } finally {
    client.release();
  }
}

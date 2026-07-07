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
        password_hash VARCHAR(255) DEFAULT 'firebase_auth',
        username VARCHAR(255) NOT NULL,
        avatar VARCHAR(255) DEFAULT '🕵️‍♂️',
        is_admin BOOLEAN DEFAULT FALSE,
        is_supporter BOOLEAN DEFAULT FALSE,
        firebase_uid VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255) UNIQUE;
    `);


    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
    `);

    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_supporter BOOLEAN DEFAULT FALSE;
    `);

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

    await client.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("[postgres] tables initialized successfully");
  } catch (err) {
    console.error("[postgres] error initializing tables:", err);
  } finally {
    client.release();
  }
}

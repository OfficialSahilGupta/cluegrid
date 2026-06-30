import Credentials from "@auth/express/providers/credentials";
import Google from "@auth/express/providers/google";
import Discord from "@auth/express/providers/discord";
import { db } from "./db.js";
import crypto from "crypto";

export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        username: { label: "Username", type: "text" },
        action: { label: "Action", type: "text" }, // "login" or "signup"
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const email = (credentials.email as string)?.trim().toLowerCase();
        const password = credentials.password as string;
        const action = credentials.action as string;
        const username = (credentials.username as string)?.trim();

        if (!email || !password) return null;

        if (action === "signup") {
          if (!username) return null;

          try {
            const existRes = await db.query("SELECT * FROM users WHERE email = $1", [email]);
            if (existRes.rows.length > 0) {
              throw new Error("User already exists with this email.");
            }

            const salt = crypto.randomBytes(16).toString("hex");
            const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
            const passwordHash = `${salt}:${hash}`;

            const insertRes = await db.query(
              "INSERT INTO users (email, password_hash, username, avatar) VALUES ($1, $2, $3, $4) RETURNING *",
              [email, passwordHash, username, "🕵️‍♂️"]
            );

            const user = insertRes.rows[0];
            await db.query(
              "INSERT INTO user_stats (user_id, games_played, games_won, total_guesses, correct_guesses) VALUES ($1, 0, 0, 0, 0)",
              [user.id]
            );

            return {
              id: String(user.id),
              name: user.username,
              email: user.email,
              image: user.avatar,
            };
          } catch (err: any) {
            throw new Error(err.message || "Failed to sign up.");
          }
        } else {
          // Login
          try {
            const res = await db.query("SELECT * FROM users WHERE email = $1", [email]);
            if (res.rows.length === 0) {
              throw new Error("Invalid email or password.");
            }

            const user = res.rows[0];
            const [salt, storedHash] = user.password_hash.split(":");
            const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");

            if (hash !== storedHash) {
              throw new Error("Invalid email or password.");
            }

            return {
              id: String(user.id),
              name: user.username,
              email: user.email,
              image: user.avatar,
            };
          } catch (err: any) {
            throw new Error(err.message || "Failed to sign in.");
          }
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock_google_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock_google_secret",
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID || "mock_discord_id",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "mock_discord_secret",
    }),
  ],
  secret: process.env.AUTH_SECRET || "supersecret_session_key_for_cluegrid_development",
  trustHost: true,
  callbacks: {
    jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.image = user.image;
      }
      return token;
    },
    session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.image = token.image;
      }
      return session;
    },
  },
};

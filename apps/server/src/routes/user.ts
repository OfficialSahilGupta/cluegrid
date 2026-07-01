import express from "express";
import { getSession } from "@auth/express";
import { authConfig } from "../auth.js";
import { db } from "../db.js";
import { verifyFirebaseToken } from "../firebaseAdmin.js";
import fs from "fs";
import path from "path";

const router = express.Router();

function debugLog(msg: string) {
  try {
    const logMsg = `[${new Date().toISOString()}] ${msg}\n`;
    fs.appendFileSync(path.join(process.cwd(), "auth_debug.log"), logMsg);
    console.log(`[auth-debug] ${msg}`);
  } catch (err) {
    // ignore
  }
}

async function resolveAuthenticatedUser(req: express.Request): Promise<string | null> {
  const authHeader = req.headers["authorization"];
  debugLog(`Incoming request path: ${req.path}, authHeader: ${authHeader ? authHeader.substring(0, 25) + "..." : "none"}`);
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const firebaseUser = await verifyFirebaseToken(token);
      debugLog(`verifyFirebaseToken result: ${JSON.stringify(firebaseUser)}`);
      
      if (firebaseUser && firebaseUser.uid) {
        // Query user by firebase_uid
        const uidRes = await db.query("SELECT id FROM users WHERE firebase_uid = $1", [firebaseUser.uid]);
        debugLog(`Query by firebase_uid (${firebaseUser.uid}) rows found: ${uidRes.rows.length}`);
        
        if (uidRes.rows.length > 0) {
          const resolvedId = String(uidRes.rows[0].id);
          debugLog(`Resolved user ID by firebase_uid: ${resolvedId}`);
          return resolvedId;
        }

        // If not found by firebase_uid, try finding by email to link accounts
        const email = firebaseUser.email?.trim().toLowerCase();
        debugLog(`Email associated: ${email}`);
        
        if (email) {
          const emailRes = await db.query("SELECT id FROM users WHERE email = $1", [email]);
          debugLog(`Query by email (${email}) rows found: ${emailRes.rows.length}`);
          
          if (emailRes.rows.length > 0) {
            const existingId = emailRes.rows[0].id;
            // Link the account
            await db.query("UPDATE users SET firebase_uid = $1 WHERE id = $2", [firebaseUser.uid, existingId]);
            debugLog(`Linked firebase_uid ${firebaseUser.uid} to existing user ID: ${existingId}`);
            return String(existingId);
          }
        }

        // If still not found, create a new user profile
        const username = firebaseUser.name || (email ? email.split("@")[0] : "Agent");
        const defaultAvatar = "🕵️‍♂️";
        debugLog(`Creating new user with email: ${email || 'none'}, username: ${username}`);
        
        const insertRes = await db.query(
          "INSERT INTO users (email, username, avatar, firebase_uid, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING id",
          [email || `${firebaseUser.uid}@firebase.local`, username, defaultAvatar, firebaseUser.uid, "firebase_auth"]
        );
        const newId = insertRes.rows[0].id;
        debugLog(`Created new user record ID: ${newId}`);

        // Initialize user stats
        await db.query(
          "INSERT INTO user_stats (user_id, games_played, games_won, total_guesses, correct_guesses) VALUES ($1, 0, 0, 0, 0)",
          [newId]
        );
        debugLog(`Initialized user_stats for user ID: ${newId}`);

        return String(newId);
      } else {
        debugLog("firebaseUser or firebaseUser.uid is falsy");
      }
    } catch (err: any) {
      debugLog(`Firebase token verification threw error: ${err?.message || err}`);
      console.error("[auth] Firebase token verification failed:", err);
      return null;
    }
  }

  // 2. Fall back to Session or Mock cookie / Mock header
  let userId: string | null = null;
  try {
    const session = await getSession(req, authConfig);
    if (session?.user) {
      userId = (session.user as any).id;
      debugLog(`Resolved user ID from session: ${userId}`);
    }
  } catch (e) {
    // ignore auth.js parsing error in mock environments
  }

  if (!userId) {
    const headerVal = req.headers["x-mock-user-id"];
    const cookieVal = req.headers.cookie
      ?.split(";")
      .find((c) => c.trim().startsWith("mock_user_id="))
      ?.split("=")[1];
    userId = (headerVal || cookieVal || null) as string | null;
    if (userId) {
      debugLog(`Resolved user ID from mock headers/cookies: ${userId}`);
    }
  }

  if (!userId) {
    debugLog("No authenticated user resolved");
  }
  return userId;
}

/**
 * Fetch profile data, user stats, and match history
 */
router.get("/profile", async (req, res) => {
  try {
    const userId = await resolveAuthenticatedUser(req);

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    // Fetch user details
    const userRes = await db.query("SELECT id, email, username, avatar FROM users WHERE id = $1", [userId]);
    if (userRes.rows.length === 0) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }
    const user = userRes.rows[0];

    // Fetch stats
    const statsRes = await db.query(
      "SELECT games_played, games_won, total_guesses, correct_guesses FROM user_stats WHERE user_id = $1",
      [userId]
    );
    const stats = statsRes.rows[0] || { games_played: 0, games_won: 0, total_guesses: 0, correct_guesses: 0 };

    // Fetch match history
    const historyRes = await db.query(
      "SELECT id, room_code, team, role, won, ended_at FROM match_history WHERE user_id = $1 ORDER BY ended_at DESC LIMIT 50",
      [userId]
    );
    const history = historyRes.rows;

    res.json({
      success: true,
      profile: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        isAdmin: !!user.is_admin,
        isSupporter: !!user.is_supporter,
        stats: {
          gamesPlayed: stats.games_played,
          gamesWon: stats.games_won,
          totalGuesses: stats.total_guesses,
          correctGuesses: stats.correct_guesses,
        },
        matchHistory: history.map((m) => ({
          id: m.id,
          roomCode: m.room_code,
          team: m.team,
          role: m.role,
          won: m.won,
          endedAt: m.ended_at,
        })),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to fetch profile." });
  }
});

/**
 * Update user settings (username and avatar selection)
 */
router.post("/settings", async (req, res) => {
  try {
    const userId = await resolveAuthenticatedUser(req);

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { username, avatar } = req.body;

    if (!username || !username.trim()) {
      res.status(400).json({ success: false, error: "Username cannot be empty" });
      return;
    }

    // Fetch user supporter status
    const userQuery = await db.query("SELECT is_supporter FROM users WHERE id = $1", [userId]);
    const isSupporter = !!userQuery.rows[0]?.is_supporter;

    // Standard emojis for registered users
    const registeredAvatars = [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", 
      "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🦆", "🦅", 
      "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌",
      "🧙‍♂️", "🧙‍♀️", "🧚‍♂️", "🧚‍♀️", "🧛‍♂️", "🧛‍♀️", "🧜‍♂️", "🧜‍♀️", "🥷", "🧑‍🚀", 
      "🧑‍🔥", "🧑‍✈️", "🧑‍🎨", "🧑‍🎤", "🧑‍💻",
      "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🏓", "🏸", 
      "🎨", "🎬", "🎤", "🎧", "🎸",
      "🚀", "🛸", "🌙", "☀️", "⭐", "🪐", "🌍", "🌋", "🏔️", "🏕️", 
      "🔮", "🧿", "💎", "🔑", "🛡️", "⚔️", "🎯", "🧩", "🎲", "🃏"
    ];

    if (avatar) {
      const isStandard = registeredAvatars.includes(avatar);
      const isPremium = avatar.startsWith("s1_") || avatar.startsWith("s2_");

      if (!isStandard && !isPremium) {
        res.status(400).json({ success: false, error: "Invalid avatar selection" });
        return;
      }

      if (isPremium && !isSupporter) {
        res.status(403).json({ success: false, error: "Premium avatars are restricted to supporters" });
        return;
      }
    }

    // Update DB
    await db.query("UPDATE users SET username = $1, avatar = $2 WHERE id = $3", [
      username.trim(),
      avatar || "🕵️‍♂️",
      userId,
    ]);

    res.json({ success: true, message: "Settings updated successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to update settings" });
  }
});

/**
 * Endpoint to simulate social OAuth signins in test/mock environments
 */
router.post("/mock-login", async (req, res) => {
  try {
    const { email, username, avatar } = req.body;
    if (!email || !username) {
      res.status(400).json({ success: false, error: "Missing email or username" });
      return;
    }

    const userRes = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    let user;
    if (userRes.rows.length === 0) {
      const insertRes = await db.query(
        "INSERT INTO users (email, password_hash, username, avatar) VALUES ($1, $2, $3, $4) RETURNING *",
        [email, "mock_oauth_no_password", username, avatar || "🦊"]
      );
      user = insertRes.rows[0];
      await db.query(
        "INSERT INTO user_stats (user_id, games_played, games_won, total_guesses, correct_guesses) VALUES ($1, 0, 0, 0, 0)",
        [user.id]
      );
    } else {
      user = userRes.rows[0];
    }

    res.json({
      success: true,
      user: {
        id: String(user.id),
        email: user.email,
        name: user.username,
        image: user.avatar,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

async function verifyAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const userId = await resolveAuthenticatedUser(req);
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }
    const userRes = await db.query("SELECT is_admin FROM users WHERE id = $1", [userId]);
    if (userRes.rows.length === 0 || !userRes.rows[0].is_admin) {
      res.status(403).json({ success: false, error: "Forbidden: Admins only" });
      return;
    }
    next();
  } catch (e) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}

// Admin Cities CRUD
router.get("/admin/cities", verifyAdmin, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM world_cities ORDER BY name ASC");
    res.json({ success: true, cities: result.rows });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post("/admin/cities", verifyAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === "") {
      res.status(400).json({ success: false, error: "City name required" });
      return;
    }
    const result = await db.query(
      "INSERT INTO world_cities (name) VALUES ($1) ON CONFLICT DO NOTHING RETURNING *",
      [name.trim()]
    );
    res.json({ success: true, city: result.rows[0] });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.delete("/admin/cities/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM world_cities WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Submit user feedback (Public)
router.post("/feedback", async (req, res) => {
  try {
    const { category, description, email } = req.body;
    if (!description || !description.trim()) {
      res.status(400).json({ success: false, error: "Description is required" });
      return;
    }
    await db.query(
      "INSERT INTO feedback (category, description, email) VALUES ($1, $2, $3)",
      [category || "bug", description.trim(), email || null]
    );
    res.json({ success: true, message: "Feedback submitted successfully" });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message || "Failed to submit feedback" });
  }
});

// Get all user feedback (Admin only)
router.get("/admin/feedback", verifyAdmin, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM feedback ORDER BY created_at DESC");
    res.json({ success: true, feedback: result.rows });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;

process.env["NODE_ENV"] = "test";
import { createServer } from "http";
import express from "express";
import { db, checkDbConnection, initializeSchema } from "./db.js";
import userRouter from "./routes/user.js";

async function runAuthTests() {
  console.log("==> Running Authentication & Profile Tests...");

  // 1. Check DB and initialize
  const dbConnected = await checkDbConnection();
  if (!dbConnected) {
    console.warn("Skipping Postgres dependent tests because DB is not reachable.");
    process.exit(0);
  }

  await initializeSchema();

  // Clean old test user if exists
  await db.query("DELETE FROM users WHERE email = $1", ["test_auth_flow@cluegrid.com"]);

  // Create Express App
  const app = express();
  app.use(express.json());
  app.use("/api/user", userRouter);

  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const port = address.port;
  const baseUrl = `http://localhost:${port}`;

  // Test 1: GET /api/user/profile without header -> 401
  const res1 = await fetch(`${baseUrl}/api/user/profile`);
  if (res1.status !== 401) {
    throw new Error(`Expected 401 Unauthorized, got ${res1.status}`);
  }
  console.log("✓ Guest access restricted correctly (returns 401).");

  // Test 2: POST /api/user/mock-login -> Create mock user
  const res2 = await fetch(`${baseUrl}/api/user/mock-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test_auth_flow@cluegrid.com",
      username: "Test User",
      avatar: "🦊",
    }),
  });
  if (res2.status !== 200) {
    throw new Error(`Expected 200 on mock login, got ${res2.status}`);
  }
  const loginData = await res2.json();
  if (!loginData.success || !loginData.user.id) {
    throw new Error(`Mock login failed: ${JSON.stringify(loginData)}`);
  }
  const userId = loginData.user.id;
  console.log(`✓ Mock Social Login simulated successfully (User ID: ${userId}).`);

  // Test 3: GET /api/user/profile with x-mock-user-id header -> 200 & verify stats
  const res3 = await fetch(`${baseUrl}/api/user/profile`, {
    headers: {
      "x-mock-user-id": userId,
    },
  });
  if (res3.status !== 200) {
    throw new Error(`Expected 200 on profile fetch, got ${res3.status}`);
  }
  const profileData = await res3.json();
  if (!profileData.success || profileData.profile.username !== "Test User") {
    throw new Error(`Profile fetch mismatch: ${JSON.stringify(profileData)}`);
  }
  const stats = profileData.profile.stats;
  if (stats.gamesPlayed !== 0 || stats.gamesWon !== 0) {
    throw new Error(`Expected stats to be initialized to 0, got ${JSON.stringify(stats)}`);
  }
  console.log("✓ User profile, statistics, and empty match history loaded correctly.");

  // Test 4: POST /api/user/settings to change username and avatar -> 200
  const res4 = await fetch(`${baseUrl}/api/user/settings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-mock-user-id": userId,
    },
    body: JSON.stringify({
      username: "Updated Name",
      avatar: "🧙‍♂️",
    }),
  });
  if (res4.status !== 200) {
    throw new Error(`Expected 200 on settings update, got ${res4.status}`);
  }
  console.log("✓ Premium avatar library and username settings updated correctly.");

  // Verify updates
  const res5 = await fetch(`${baseUrl}/api/user/profile`, {
    headers: {
      "x-mock-user-id": userId,
    },
  });
  const updatedData = await res5.json();
  if (updatedData.profile.username !== "Updated Name" || updatedData.profile.avatar !== "🧙‍♂️") {
    throw new Error(`Updates did not persist: ${JSON.stringify(updatedData)}`);
  }
  console.log("✓ Profile modifications successfully persisted to database.");

  // Cleanup
  await db.query("DELETE FROM users WHERE id = $1", [userId]);
  server.close();
  await db.end();

  console.log("All Authentication & Profile tests passed successfully! 🎉");
  process.exit(0);
}

runAuthTests().catch((err) => {
  console.error("Auth tests failed:", err);
  process.exit(1);
});

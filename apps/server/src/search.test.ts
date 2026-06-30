process.env["NODE_ENV"] = "test";
import { createServer } from "http";
import express from "express";
import { searchRouter } from "./routes/search.js";

async function runSearchTests() {
  console.log("==> Running Search and Meaning Lookup API Tests...");

  const app = express();
  app.use(express.json());
  app.use("/api/search", searchRouter);

  const server = createServer(app);
  const port = 4999;

  await new Promise<void>((resolve) => server.listen(port, resolve));

  try {
    // Test 1: Query is missing -> returns 400
    const resEmpty = await fetch(`http://localhost:${port}/api/search/meaning`);
    if (resEmpty.status !== 400) {
      throw new Error(`Expected 400 status for empty query, got ${resEmpty.status}`);
    }

    // Test 2: Valid lookup -> returns 200 with result structure
    const resValid = await fetch(`http://localhost:${port}/api/search/meaning?q=spy`);
    if (resValid.status !== 200) {
      throw new Error(`Expected 200 status for search query 'spy', got ${resValid.status}`);
    }

    const data = (await resValid.json()) as any;
    if (!data.success) {
      throw new Error("Expected search result success to be true");
    }
    if (!data.result || typeof data.result.title !== "string") {
      throw new Error("Expected search result payload with valid title");
    }
    if (typeof data.result.overview !== "string") {
      throw new Error("Expected overview string in result payload");
    }
    if (!Array.isArray(data.result.googleResults)) {
      throw new Error("Expected googleResults array in result payload");
    }

    console.log("✓ Search meaning API query successfully validated.");
  } finally {
    server.close();
  }

  console.log("All Search & Meaning Lookup tests passed successfully! 🔍🎉");
}

runSearchTests().catch((err) => {
  console.error("Search tests failed:", err);
  process.exit(1);
});

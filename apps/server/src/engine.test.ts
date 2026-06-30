import { assert } from "console";
import { GRID_PRESETS } from "@cluegrid/shared";
import { generateBoard } from "./engine.js";

function runTests() {
  console.log("==> Running Board Distribution Engine Tests...");

  // Test 2-team preset
  {
    const preset = 2;
    const config = GRID_PRESETS[preset];
    assert(config !== undefined);
    const mockWords = Array.from({ length: 35 }, (_, i) => `WORD_${i}`);
    const board = generateBoard(preset, mockWords);

    if (board.length !== 25) throw new Error("2-team board must have exactly 25 cards");

    const redCount = board.filter(c => c.type === "red").length;
    const blueCount = board.filter(c => c.type === "blue").length;
    const neutralCount = board.filter(c => c.type === "neutral").length;
    const assassinCount = board.filter(c => c.type === "assassin").length;

    // Check that we got 9 and 8 (could be in any order in config, let's verify exact matches to presets)
    if (redCount !== 9 || blueCount !== 8) {
      throw new Error(`2-team presets card counts invalid: red ${redCount}, blue ${blueCount}`);
    }
    if (neutralCount !== 7) throw new Error(`2-team neutrals invalid: ${neutralCount}`);
    if (assassinCount !== 1) throw new Error(`2-team assassin invalid: ${assassinCount}`);
    console.log("✓ 2-team preset distribution test passed.");
  }

  // Test 3-team preset
  {
    const preset = 3;
    const config = GRID_PRESETS[preset];
    assert(config !== undefined);
    const mockWords = Array.from({ length: 35 }, (_, i) => `WORD_${i}`);
    const board = generateBoard(preset, mockWords);

    if (board.length !== 25) throw new Error("3-team board must have exactly 25 cards");

    const redCount = board.filter(c => c.type === "red").length;
    const blueCount = board.filter(c => c.type === "blue").length;
    const greenCount = board.filter(c => c.type === "green").length;
    const neutralCount = board.filter(c => c.type === "neutral").length;
    const assassinCount = board.filter(c => c.type === "assassin").length;

    if (redCount !== 8 || blueCount !== 8 || greenCount !== 7) {
      throw new Error(`3-team presets card counts invalid: red ${redCount}, blue ${blueCount}, green ${greenCount}`);
    }
    if (neutralCount !== 1) throw new Error(`3-team neutrals invalid: ${neutralCount}`);
    if (assassinCount !== 1) throw new Error(`3-team assassin invalid: ${assassinCount}`);
    console.log("✓ 3-team preset distribution test passed.");
  }

  // Test 4-team preset
  {
    const preset = 4;
    const config = GRID_PRESETS[preset];
    assert(config !== undefined);
    const mockWords = Array.from({ length: 35 }, (_, i) => `WORD_${i}`);
    const board = generateBoard(preset, mockWords);

    if (board.length !== 30) throw new Error("4-team board must have exactly 30 cards");

    const redCount = board.filter(c => c.type === "red").length;
    const blueCount = board.filter(c => c.type === "blue").length;
    const greenCount = board.filter(c => c.type === "green").length;
    const yellowCount = board.filter(c => c.type === "yellow").length;
    const neutralCount = board.filter(c => c.type === "neutral").length;
    const assassinCount = board.filter(c => c.type === "assassin").length;

    if (redCount !== 7 || blueCount !== 7 || greenCount !== 7 || yellowCount !== 6) {
      throw new Error(`4-team presets card counts invalid: red ${redCount}, blue ${blueCount}, green ${greenCount}, yellow ${yellowCount}`);
    }
    if (neutralCount !== 2) throw new Error(`4-team neutrals invalid: ${neutralCount}`);
    if (assassinCount !== 1) throw new Error(`4-team assassin invalid: ${assassinCount}`);
    console.log("✓ 4-team preset distribution test passed.");
  }

  console.log("All engine tests passed successfully! 🎉");
}

runTests();

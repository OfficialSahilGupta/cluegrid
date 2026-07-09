import { GRID_PRESETS, RoomState, TeamIdentifier, TeamState, TEAM_COLORS_BY_INDEX } from "@cluegrid/shared";
import { sampleWords } from "@cluegrid/wordpacks";
import { generateBoard } from "./engine.js";

import fs from "fs";
import path from "path";

// Basic in-memory store for rooms, initialized from disk if it exists
const roomsStore = new Map<string, RoomState>();
const PERSISTENCE_FILE = path.join(process.cwd(), "rooms-persistence.json");

try {
  if (fs.existsSync(PERSISTENCE_FILE)) {
    const data = JSON.parse(fs.readFileSync(PERSISTENCE_FILE, "utf-8"));
    for (const [code, room] of Object.entries(data)) {
      roomsStore.set(code, room as RoomState);
    }
    console.log(`[rooms] Restored ${roomsStore.size} rooms from disk persistence.`);
  }
} catch (e) {
  console.error("[rooms] Failed to load disk persistence:", e);
}

let saveTimeout: NodeJS.Timeout | null = null;
export function saveRoomsToDisk() {
  if (saveTimeout) return;
  saveTimeout = setTimeout(() => {
    saveTimeout = null;
    try {
      const data = Object.fromEntries(roomsStore);
      fs.writeFile(PERSISTENCE_FILE, JSON.stringify(data, null, 2), "utf-8", (err) => {
        if (err) {
          console.error("[rooms] Failed to save rooms to disk:", err);
        }
      });
    } catch (e) {
      console.error("[rooms] Failed to serialize rooms for disk write:", e);
    }
  }, 1000);
}

/**
 * Generate a random 6-character room code of uppercase letters
 */
function generateRoomCode(): string {
  const adjectives = [
    "creepy", "blessing", "funny", "clever", "silent", "gentle", "brave", "swift", "cozy",
    "sleepy", "happy", "wild", "bright", "calm", "daring", "eager", "fancy", "grand", "jolly",
    "lively", "mighty", "noble", "proud", "quick", "rusty", "shiny", "witty", "zealous", "candid",
    "dapper", "earnest", "frosty", "golden", "hardy", "iron", "keen", "lucid", "nimble", "quiet",
    "bold", "magic", "shadow", "cosmic", "solar", "lunar", "stellar", "quantum"
  ];
  const animals = [
    "cat", "anaconda", "dog", "fox", "bear", "lion", "tiger", "wolf", "deer", "owl",
    "eagle", "hawk", "rabbit", "panda", "koala", "otter", "badger", "falcon", "panther", "jaguar",
    "leopard", "dolphin", "whale", "seal", "penguin", "shark", "turtle", "sloth", "llama", "alpaca",
    "lemur", "ferret", "hedgehog", "squirrel", "beaver", "moose", "elk", "bison", "platypus",
    "cobra", "python", "viper", "cheetah", "cougar", "lynx", "orca", "octopus", "squid", "lobster"
  ];

  let attempts = 0;
  while (attempts < 100) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const anim = animals[Math.floor(Math.random() * animals.length)];
    const code = `${adj}-${anim}`;
    if (!roomsStore.has(code)) {
      return code;
    }
    attempts++;
  }

  // Fallback to random suffix if we collide heavily
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const anim = animals[Math.floor(Math.random() * animals.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}-${anim}-${num}`;
}

function getRandomCities(count: number): string[] {
  const fallbackCities = [
    "Tokyo", "London", "Paris", "Cairo",
    "Sydney", "Mumbai", "Moscow",
    "Toronto", "Berlin", "Dubai", "Singapore", "Beijing",
    "Rome", "Amsterdam", "Nairobi",
    "Birgunj", "Kathmandu", "Pokhara", "Delhi", "Patna", "Chennai",
    "Seoul", "Bangkok", "Istanbul", "Vienna", "Madrid",
    "Lisbon", "Dublin", "Stockholm", "Athens", "Brussels",
    "Oslo", "Helsinki", "Prague", "Budapest", "Warsaw",
    "Zagreb", "Belgrade", "Jakarta", "Manila", "Melbourne"
  ];
  const shuffled = [...fallbackCities].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Creates a new game room with selected team count preset
 */
export async function createRoom(
  teamCount: number,
  gameMode: "classic" | "coop" = "classic",
  language: string = "en"
): Promise<RoomState> {
  if (!GRID_PRESETS[teamCount]) {
    throw new Error(`Unsupported team count: ${teamCount}`);
  }

  const roomCode = generateRoomCode();
  const preset = GRID_PRESETS[teamCount]!;
  
  // Sample exact number of words required for this preset
  const words = sampleWords(language, preset.totalCards);
  // Duet/Coop mode uses independent dual-type boards with per-team assassins
  const board = generateBoard(teamCount, words, gameMode === "coop");

  const cities = getRandomCities(teamCount);

  const teams = {} as Record<TeamIdentifier, TeamState>;
  preset.teamCardCounts.forEach((count, index) => {
    const color = TEAM_COLORS_BY_INDEX[index];
    if (color) {
      teams[color] = {
        color,
        cardsRemaining: count,
        totalCards: count,
        eliminated: false,
        name: cities[index] || color.charAt(0).toUpperCase() + color.slice(1),
      };
    }
  });

  const room: RoomState = {
    roomCode,
    teamCount,
    gridConfig: preset,
    board,
    players: [],
    winner: null,
    startedAt: null,
    endedAt: null,
    phase: "lobby",
    turnState: null,
    settings: {
      eliminationRule: "continue",
      timerMode: "fast",
      timerSeconds: 120,
      spymasterTimerSeconds: 90,
      firstClueExtraSeconds: 60,
      operativeTimerSeconds: 60,
      roomLocked: false,
      timerAction: "manual",
    },
    teams,
    gameMode,
    coopMistakesMade: 0,
    coopMistakesAllowed: 9,
    language,
  };

  roomsStore.set(roomCode, room);
  saveRoomsToDisk();
  return room;
}

/**
 * Retrieve room by room code
 */
export function getRoom(roomCode: string): RoomState | undefined {
  if (!roomCode) return undefined;
  return roomsStore.get(roomCode.toLowerCase());
}

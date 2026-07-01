import { GRID_PRESETS, RoomState, TeamIdentifier, TeamState, TEAM_COLORS_BY_INDEX } from "@cluegrid/shared";
import { sampleWords } from "@cluegrid/wordpacks";
import { generateBoard } from "./engine.js";
import { db, isDbConnected } from "./db.js";

// Basic in-memory store for rooms in Phase 1
const roomsStore = new Map<string, RoomState>();

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

async function getRandomCities(count: number): Promise<string[]> {
  const fallbackCities = [
    "Tokyo", "London", "Paris", "New York", "Cairo",
    "Sydney", "Mumbai", "Rio de Janeiro", "Moscow", "Cape Town",
    "Toronto", "Berlin", "Dubai", "Singapore", "Beijing",
    "Rome", "Amsterdam", "San Francisco", "Buenos Aires", "Nairobi",
    "Birgunj", "Kathmandu", "Pokhara", "Delhi", "Patna", "Chennai"
  ];
  if (isDbConnected) {
    try {
      const res = await db.query("SELECT name FROM world_cities ORDER BY RANDOM() LIMIT $1", [count]);
      if (res.rows.length > 0) {
        return res.rows.map((r: any) => r.name);
      }
    } catch (e) {
      // fallback
    }
  }
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

  const cities = await getRandomCities(teamCount);

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
      afkTimeoutMinutes: 5,
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
  return room;
}

/**
 * Retrieve room by room code
 */
export function getRoom(roomCode: string): RoomState | undefined {
  if (!roomCode) return undefined;
  return roomsStore.get(roomCode.toLowerCase());
}

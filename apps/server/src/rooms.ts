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
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
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
      timerMode: "off",
      timerSeconds: 120,
      roomLocked: false,
      timerAction: "auto",
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
  return roomsStore.get(roomCode.toUpperCase());
}

import crypto from "crypto";
import { GRID_PRESETS, TEAM_COLORS_BY_INDEX } from "@cluegrid/shared";
import type { CardState, CardTypeExtended, GridConfig } from "@cluegrid/shared";

/**
 * Generates a cryptographically shuffled board based on presets and sample words.
 * @param presetTeams  Number of teams (used to look up GRID_PRESETS)
 * @param words        Word list to draw from
 * @param isCoopMode   When true, generates independent per-team card types for Duet Mode.
 *                     Each team gets its own 3 assassins (independently placed, may overlap 0–3 times).
 */
export function generateBoard(presetTeams: number, words: string[], isCoopMode = false): CardState[] {
  const config = GRID_PRESETS[presetTeams];
  if (!config) {
    throw new Error(`Unsupported team count preset: ${presetTeams}`);
  }

  if (words.length < config.totalCards) {
    throw new Error(`Insufficient words. Needed ${config.totalCards}, got ${words.length}`);
  }

  if (isCoopMode) {
    return generateCoopBoard(config, words);
  }

  // ── Classic board ──────────────────────────────────────────────────────────
  const cardTypes: CardTypeExtended[] = [];

  config.teamCardCounts.forEach((count, index) => {
    const teamColor = TEAM_COLORS_BY_INDEX[index];
    if (!teamColor) throw new Error(`Out of range team index: ${index}`);
    for (let i = 0; i < count; i++) cardTypes.push(teamColor);
  });
  for (let i = 0; i < config.neutralCount; i++) cardTypes.push("neutral");
  for (let i = 0; i < config.assassinCount; i++) cardTypes.push("assassin");

  const shuffledTypes = cryptographicallyShuffle(cardTypes);
  return words.slice(0, config.totalCards).map((word, index) => {
    const type = shuffledTypes[index];
    if (!type) throw new Error(`Missing shuffled type for index ${index}`);
    return { id: index, word, type, revealed: false, revealedAt: null, revealedBy: null };
  });
}

/**
 * Generates an independent dual-type board for Duet/Coop Mode.
 *
 * Each team gets their own hidden key:
 *  - Red board (coopRedType):  9 red-agents, 3 assassins, 13 neutral  (seen by Blue to give clues)
 *  - Blue board (coopBlueType): 8 blue-agents, 3 assassins, 14 neutral (seen by Red to give clues)
 *
 * Assassin positions are independently shuffled, so they can overlap 0–3 times.
 * The shared `type` field is set to "neutral" for unrevealed cards in coop mode
 * and updated to the relevant team's type when the card is flipped.
 */
function generateCoopBoard(config: GridConfig, words: string[]): CardState[] {
  const total = config.totalCards; // 25

  // Red team's board: 9 red agents, 3 assassins, 13 neutral
  const redTypes: Array<"red" | "assassin" | "neutral"> = [
    ...Array(9).fill("red"),
    ...Array(3).fill("assassin"),
    ...Array(total - 9 - 3).fill("neutral"),
  ];

  // Blue team's board: 8 blue agents, 3 assassins, 14 neutral
  const blueTypes: Array<"blue" | "assassin" | "neutral"> = [
    ...Array(8).fill("blue"),
    ...Array(3).fill("assassin"),
    ...Array(total - 8 - 3).fill("neutral"),
  ];

  // Independently shuffle both boards so assassin overlaps are random (0–3)
  const shuffledRed = cryptographicallyShuffle(redTypes);
  const shuffledBlue = cryptographicallyShuffle(blueTypes);

  return words.slice(0, total).map((word, index) => {
    const coopRedType = shuffledRed[index]!;
    const coopBlueType = shuffledBlue[index]!;
    return {
      id: index,
      word,
      type: "neutral" as CardTypeExtended, // placeholder; updated on reveal
      revealed: false,
      revealedAt: null,
      revealedBy: null,
      coopRedType,
      coopBlueType,
    };
  });
}

/**
 * Perform a cryptographic Fisher-Yates shuffle
 */
function cryptographicallyShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    // Generate secure random index from 0 to i inclusive
    const j = getRandomInt(i + 1);
    const temp = result[i];
    const itemJ = result[j];
    if (temp === undefined || itemJ === undefined) continue;
    result[i] = itemJ;
    result[j] = temp;
  }
  return result;
}

/**
 * Returns a cryptographically secure random integer in the range [0, max)
 */
function getRandomInt(max: number): number {
  if (max <= 1) return 0;
  const bytesNeeded = Math.ceil(Math.log2(max) / 8);
  const maxRange = Math.pow(256, bytesNeeded);
  const buffer = Buffer.alloc(bytesNeeded);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    crypto.randomFillSync(buffer);
    let value = 0;
    for (let i = 0; i < bytesNeeded; i++) {
      const byte = buffer[i];
      if (byte !== undefined) {
        value = (value << 8) + byte;
      }
    }
    // Avoid modulo bias
    if (value < maxRange - (maxRange % max)) {
      return value % max;
    }
  }
}

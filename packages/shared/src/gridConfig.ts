// Grid configuration specification for different team counts
export interface GridConfig {
  teamCount: number;
  cols: number;
  rows: number;
  totalCards: number;
  // Card counts per type
  // Team cards are represented dynamically. For example, for 2 teams, index 0 gets 9 cards, index 1 gets 8.
  teamCardCounts: number[];
  neutralCount: number;
  assassinCount: number;
}

export const GRID_PRESETS: Record<number, GridConfig> = {
  2: {
    teamCount: 2,
    cols: 5,
    rows: 5,
    totalCards: 25,
    teamCardCounts: [9, 8],
    neutralCount: 7,
    assassinCount: 1,
  },
  3: {
    teamCount: 3,
    cols: 5,
    rows: 5,
    totalCards: 25,
    teamCardCounts: [8, 8, 7],
    neutralCount: 1,
    assassinCount: 1,
  },
  4: {
    teamCount: 4,
    cols: 6,
    rows: 5, // 5x6 grid
    totalCards: 30,
    teamCardCounts: [7, 7, 7, 6],
    neutralCount: 2,
    assassinCount: 1,
  },
};

import type { GamePhase, TurnState, Player } from "./types.js";

// Extended TeamColor to support 3 or 4 teams if needed, but standard team colors are red/blue.
// Let's define the mapping of team indexes to card types or team identifiers.
export type TeamIdentifier = "red" | "blue" | "green" | "yellow";
export const TEAM_COLORS_BY_INDEX: TeamIdentifier[] = ["red", "blue", "green", "yellow"];

export type CardTypeExtended = TeamIdentifier | "neutral" | "assassin";

export interface CardState {
  id: number;
  word: string;
  type: CardTypeExtended;
  revealed: boolean;
  revealedAt: string | null;
  revealedBy: TeamIdentifier | null;
  // Duet/Coop Mode: each team has independent type assignments.
  // Red team's clue-giver sees coopBlueType (Blue's board) to give clues about Blue's agents.
  // Blue team's clue-giver sees coopRedType (Red's board) to give clues about Red's agents.
  coopRedType?: "red" | "assassin" | "neutral";   // What this card is from Red's perspective
  coopBlueType?: "blue" | "assassin" | "neutral";  // What this card is from Blue's perspective
}

export interface RoomSettings {
  eliminationRule: "game_end" | "continue";
  afkTimeoutMinutes: number;
  timerMode?: "off" | "fast" | "long" | "custom";
  timerSeconds?: number;
  roomLocked?: boolean;
  timerAction?: "auto" | "manual";
}

export interface TeamState {
  color: TeamIdentifier;
  cardsRemaining: number;
  totalCards: number;
  eliminated: boolean;
  name?: string;
}

export interface RoomState {
  roomCode: string;
  teamCount: number;
  gridConfig: GridConfig;
  board: CardState[];
  players: Player[];
  winner: TeamIdentifier | null;
  startedAt: string | null;
  endedAt: string | null;
  phase: GamePhase;
  turnState: TurnState | null;
  settings: RoomSettings;
  teams: Record<TeamIdentifier, TeamState>;
  gameMode: "classic" | "coop";
  coopMistakesMade: number;
  coopMistakesAllowed: number;
  language?: string;
}

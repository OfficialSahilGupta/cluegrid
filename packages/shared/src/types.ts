// ─── Enums ───────────────────────────────────────────────────────────────────

/** The competing teams in ClueGrid. */
export type TeamColor = "red" | "blue" | "green" | "yellow";

/** Role a player holds within a team. */
export type PlayerRole = "spymaster" | "operative";

/** The category a card belongs to (determines who it scores for, or ends the game). */
export type CardType = "red" | "blue" | "green" | "yellow" | "neutral" | "assassin";

/** High-level phase the room is currently in. */
export type GamePhase =
  | "lobby"       // waiting for players to join / ready up
  | "playing"     // active rounds
  | "ended";      // game has concluded

// ─── Core Domain ─────────────────────────────────────────────────────────────

/**
 * A single word-card on the 5×5 grid.
 */
export interface Card {
  /** Unique position index 0–24 on the 5×5 grid. */
  id: number;
  /** The displayed word. */
  word: string;
  /** The true card type — only sent to clients when already revealed or when the
   *  requesting player is a spymaster for the appropriate team. */
  type: CardType;
  /** Whether this card has already been uncovered. */
  revealed: boolean;
  /** ISO-8601 timestamp of when this card was revealed, or null. */
  revealedAt: string | null;
  /** Which team revealed this card, or null if not yet revealed. */
  revealedBy: TeamColor | null;
}

/**
 * One of the two competing teams.
 */
export interface Team {
  color: TeamColor;
  /** Total cards of this team's colour remaining (not yet revealed). */
  cardsRemaining: number;
  /** Total cards assigned to this team at game start (8 or 9 depending on who goes first). */
  totalCards: number;
  score: number;
}

export type PlayerStatus = "ACTIVE" | "BRB" | "AFK" | ".zZ" | "FOCUS" | "BUSY";

/**
 * A connected player in a room.
 */
export interface Player {
  /** Stable socket/session ID. */
  id: string;
  /** Display name chosen by the player. */
  displayName: string;
  /** Avatar URL or emoji fallback. */
  avatar: string;
  team: TeamColor | null;
  role: PlayerRole | null;
  /** Whether the player is currently connected via websocket. */
  connected: boolean;
  /** Whether the player has signalled "ready" in the lobby. */
  ready: boolean;
  /** ISO-8601 timestamp the player joined. */
  joinedAt: string;
  status: PlayerStatus;
  userId?: string | null;
  guessesCount?: number;
  correctGuessesCount?: number;
  isSupporter?: boolean;
  socketId?: string;
  votedCardId?: number | null;
  votedCardIds?: number[];
  isHost?: boolean;
}

/**
 * State for the currently active turn.
 */
export interface TurnState {
  /** Which team is currently giving / guessing. */
  activeTeam: TeamColor;
  /** Current phase within the turn. */
  phase: "giving_clue" | "guessing" | "turn_end";
  /** The clue word submitted by the spymaster. null until given. */
  clueWord: string | null;
  /** The numeric count submitted alongside the clue. 0 means "unlimited". */
  clueCount: number | null;
  /** How many guesses the active team has already made this turn. */
  guessesUsed: number;
  /** Max guesses allowed this turn (clueCount + 1, or Infinity when clueCount is 0). */
  guessesAllowed: number | null;
  /** Turn number within the current game, starting at 1. */
  turnNumber: number;
  /** Timestamp in ms when the current phase started. */
  phaseStartedAt?: number;
}

/**
 * Full game state broadcast to all players in a room.
 * Sensitive fields (card types for unrevealed cards) are stripped
 * server-side before sending to non-spymasters.
 */
export interface GameState {
  /** Unique room code (6 uppercase letters). */
  roomCode: string;
  phase: GamePhase;
  /** The 25 cards laid out in the grid (row-major order). */
  board: Card[];
  teams: Record<TeamColor, Team>;
  players: Player[];
  turnState: TurnState | null;
  /** The team that won, or null while the game is in progress. */
  winner: TeamColor | null;
  /** ISO-8601 timestamp the game started, or null while in lobby/setup. */
  startedAt: string | null;
  /** ISO-8601 timestamp the game ended, or null while ongoing. */
  endedAt: string | null;
  /** Language/locale pack used to generate this board's words. */
  locale: string;
}

/**
 * A message in the in-room chat.
 */
export interface ChatMessage {
  id: string;
  roomCode: string;
  /** The player who sent the message. */
  senderId: string;
  senderName: string;
  /** Rendered text content (plain text only — no HTML). */
  content: string;
  /** ISO-8601 timestamp. */
  sentAt: string;
  /** Whether this is a system-generated event message (e.g. "Blue team revealed AGENT"). */
  isSystemMessage: boolean;
  senderIsSupporter?: boolean;
}

// ─── Socket Event Payloads ────────────────────────────────────────────────────

/** Payload emitted when a player joins a room. */
export interface JoinRoomPayload {
  roomCode: string;
  displayName: string;
  avatar?: string;
}

/** Payload emitted when a spymaster submits a clue. */
export interface GiveCluePayload {
  roomCode: string;
  clueWord: string;
  clueCount: number;
}

/** Payload emitted when an operative guesses a card. */
export interface GuessCardPayload {
  roomCode: string;
  cardId: number;
}

/** Payload emitted when a player sends a chat message. */
export interface SendChatPayload {
  roomCode: string;
  content: string;
}

// ─── REST API shapes ─────────────────────────────────────────────────────────

/** Standard API envelope. */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/** Health-check response body. */
export interface HealthResponse {
  status: "ok";
  timestamp: string;
  version: string;
  services: {
    postgres: "up" | "down";
    redis: "up" | "down";
  };
}

// ─── Game Log Types ──────────────────────────────────────────────────────────

export type GameLogType =
  | "game_started"
  | "clue"
  | "reveal"
  | "turn_transition"
  | "team_eliminated"
  | "game_ended"
  | "role_change";

export interface GameLogEntry {
  id: string;
  roomCode: string;
  type: GameLogType;
  team: string | null;
  message: string;
  timestamp: string;
  details?: any;
}

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Socket } from "socket.io-client";
import type { RoomState, CardState, TeamIdentifier, PlayerRole, ChatMessage, GameLogEntry, Player } from "@cluegrid/shared";
import { useAuth } from "../context/AuthContext.js";
import { Identicon } from "./Identicon.js";
import { useTranslation } from "react-i18next";
import { GatedUpsellModal } from "./GatedUpsellModal.js";
import { MusicPlayer } from "./MusicPlayer.js";
import { ChatMessageBubble } from "./ChatMessageBubble.js";
import { renderAvatar } from "../utils/avatar";

const ALL_LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ne", name: "नेपाली", flag: "🇳🇵" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "cs", name: "Čeština", flag: "🇨🇿" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "uk", name: "Українська", flag: "🇺🇦" },
  { code: "he", name: "עברית", flag: "🇮🇱" },
  { code: "sr", name: "Српски", flag: "🇷🇸" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "ro", name: "Română", flag: "🇷🇴" },
  { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "da", name: "Dansk", flag: "🇩🇰" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ca", name: "Català", flag: "🇪🇸" },
  { code: "sv", name: "Svenska", flag: "🇸🇪" },
  { code: "mk", name: "Македонски", flag: "🇲🇰" },
  { code: "et", name: "Eesti", flag: "🇪🇪" },
  { code: "eo", name: "Esperanto", flag: "🌌" },
  { code: "be", name: "Беларуская", flag: "🇧🇾" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "sk", name: "Slovenčina", flag: "🇸🇰" },
  { code: "af", name: "Afrikaans", flag: "🇿🇦" },
  { code: "ar-LB", name: "العربية (لبنان)", flag: "🇱🇧" },
  { code: "bg", name: "Български", flag: "🇧🇬" },
  { code: "hr", name: "Hrvatski", flag: "🇭🇷" },
  { code: "fi", name: "Suomi", flag: "🇫🇮" },
  { code: "el", name: "Ελληνικά", flag: "🇬🇷" },
  { code: "hu", name: "Magyar", flag: "🇭🇺" },
  { code: "is", name: "Íslenska", flag: "🇮🇸" },
  { code: "lt", name: "Lietuvių", flag: "🇱🇹" },
  { code: "lv", name: "Latviešu", flag: "🇱🇻" },
  { code: "no", name: "Norsk", flag: "🇳🇴" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "sl", name: "Slovenščina", flag: "🇸🇮" },
  { code: "th", name: "ไทย", flag: "🇹🇭" },
  { code: "fil", name: "Filipino", flag: "🇵🇭" },
  { code: "fa", name: "فارسی", flag: "🇮🇷" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "sq", name: "Shqip", flag: "🇦🇱" },
  { code: "ka", name: "ქართული", flag: "🇬🇪" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
];

// ─── Design Colors per Team ──────────────────────────────────────────────────
const teamColorPresets = [
  {
    bg: "var(--team-1-bg)",
    border: "var(--team-1)",
    text: "var(--team-1-text)",
    light: "var(--team-1-text)",
  },
  {
    bg: "var(--team-2-bg)",
    border: "var(--team-2)",
    text: "var(--team-2-text)",
    light: "var(--team-2-text)",
  },
  {
    bg: "var(--team-3-bg)",
    border: "var(--team-3)",
    text: "var(--team-3-text)",
    light: "var(--team-3-text)",
  },
  {
    bg: "var(--team-4-bg)",
    border: "var(--team-4)",
    text: "var(--team-4-text)",
    light: "var(--team-4-text)",
  },
];

const typeColors: Record<string, { bg: string; border: string; text: string; light: string }> = {
  red: teamColorPresets[0]!,
  blue: teamColorPresets[1]!,
  green: teamColorPresets[2]!,
  yellow: teamColorPresets[3]!,
  neutral: {
    bg: "var(--card-neutral-bg)",
    border: "var(--card-neutral-border)",
    text: "var(--card-neutral-text)",
    light: "var(--card-neutral-text)",
  },
  assassin: {
    bg: "var(--card-assassin-bg)",
    border: "var(--card-assassin-border)",
    text: "var(--card-assassin-text)",
    light: "var(--card-assassin-text)",
  },
  unknown: {
    bg: "var(--bg-surface-raised)",
    border: "var(--border-subtle)",
    text: "var(--text-secondary)",
    light: "var(--text-secondary)",
  },
};

function playBeep(frequency = 440, type: OscillatorType = "sine") {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);
  } catch (e) {
    // ignore AudioContext blocked warnings
  }
}

function playReactionSound(emoji: string) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();

    const playTone = (freq: number, duration: number, delay: number, type: OscillatorType = "sine", gainVal = 0.08) => {
      setTimeout(() => {
        try {
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          
          gainNode.gain.setValueAtTime(gainVal, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
          
          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + duration);
        } catch {
          // ignore
        }
      }, delay);
    };

    if (emoji === "🎉") {
      // Ascending C-major arpeggio
      playTone(523.25, 0.15, 0, "sine"); // C5
      playTone(659.25, 0.15, 80, "sine"); // E5
      playTone(783.99, 0.15, 160, "sine"); // G5
      playTone(1046.50, 0.25, 240, "sine"); // C6
    } else if (emoji === "🔥") {
      // Rising warm triangle notes
      playTone(440.00, 0.15, 0, "triangle"); // A4
      playTone(554.37, 0.15, 70, "triangle"); // C#5
      playTone(659.25, 0.20, 140, "triangle"); // E5
    } else if (emoji === "🤦") {
      // Descending sad sigh
      playTone(349.23, 0.25, 0, "sine"); // F4
      playTone(293.66, 0.35, 120, "sine"); // D4
    } else if (emoji === "💀") {
      // Detuned low spooky beating wave chord
      playTone(220.00, 0.40, 0, "sawtooth", 0.04); // A3
      playTone(223.00, 0.40, 0, "sawtooth", 0.04);
    } else if (emoji === "👏") {
      // Double claps
      playTone(880.00, 0.06, 0, "triangle", 0.1); // A5
      playTone(880.00, 0.06, 120, "triangle", 0.1);
    }
  } catch (e) {
    // ignore
  }
}

interface GameBoardProps {
  room: RoomState;
  playerId: string;
  socket: Socket | null;
  lightMode: boolean;
  setLightMode: (val: boolean) => void;
  setGlobalConfirm: (config: { title: string; message: string; onConfirm: () => void } | null) => void;
  setGatedFeature: (featureName: string | null) => void;
  onOpenAuth: () => void;
}

export function GameBoard({ room, playerId, socket, lightMode, setLightMode, setGlobalConfirm, setGatedFeature, onOpenAuth }: GameBoardProps) {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const { cols, rows } = room.gridConfig;
  const board = room.board as CardState[];

  // Clue Form state
  const [clueWord, setClueWord] = useState("");
  const [clueCount, setClueCount] = useState<number>(1);
  const [clueError, setClueError] = useState<string | null>(null);
  const [neuralStreams, setNeuralStreams] = useState<{ start: { x: number; y: number }; end: { x: number; y: number } }[]>([]);
  const [assassinRevealedId, setAssassinRevealedId] = useState<number | null>(null);
  const [shockwaveCardOffsets, setShockwaveCardOffsets] = useState<Record<number, { x: number; y: number }>>({});
  // Phase 2 animation states
  const [typewriterText, setTypewriterText] = useState("");
  const [typewriterCursor, setTypewriterCursor] = useState(false);
  const [showRadarPing, setShowRadarPing] = useState(false);
  const [handoffWipe, setHandoffWipe] = useState<{ from: string; to: string } | null>(null);
  const [cameraWarpActive, setCameraWarpActive] = useState(false);
  const prevActiveTeamRef = useRef<string | null>(null);
  const prevPhase2Ref = useRef<string | null>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const particleRafRef = useRef<number | null>(null);

  // Sidebar Tab state
  const [activeTab, setActiveTab] = useState<"chat" | "log">("log");
  const [unreadLog, setUnreadLog] = useState(false);
  const [isChatFloatingOpen, setIsChatFloatingOpen] = useState(false); // Default closed as FAB is floating


  // Collapsible Stats Card state
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [spyWarningConfig, setSpyWarningConfig] = useState<{
    spyName: string;
    team: TeamIdentifier;
    role: PlayerRole;
    targetPlayerId?: string;
  } | null>(null);
  const [playersExpanded, setPlayersExpanded] = useState(true);

  // Chat panel state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Game Log panel state
  const [gameLog, setGameLog] = useState<GameLogEntry[]>([]);
  const logEndRef = useRef<HTMLDivElement | null>(null);
  const logScrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Floating screen reactions
  const [reactions, setReactions] = useState<{ id: string; emoji: string; senderName: string }[]>([]);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Local debug key peeking state
  const [peekKey, setPeekKey] = useState(false);

  // Cooperative Timer Count State
  const [timerCount, setTimerCount] = useState(120);

  // Personal Preference Toggles (Local Only)
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Switching Player State
  const [activeSwitchPlayerId, setActiveSwitchPlayerId] = useState<string | null>(null);
  const [votedCardIds, setVotedCardIds] = useState<number[]>([]);
  const [clueSelectedCardIds, setClueSelectedCardIds] = useState<number[]>([]);
  const [recentlyFlippedCardIds, setRecentlyFlippedCardIds] = useState<number[]>([]);
  const prevBoardRef = useRef<CardState[]>([]);
  const [isAssassinShake, setIsAssassinShake] = useState(false);
  const prevWinnerRef = useRef<string | null>(null);
  const [isDealingAnimationActive, setIsDealingAnimationActive] = useState(false);
  const prevPhaseRef = useRef<string | null>(null);
  const prevBoardWordsRef = useRef<string[]>([]);
  const prevTurnStateRef = useRef<any>(null);
  const roomPlayersRef = useRef(room.players);
  const roomBoardRef = useRef(room.board);
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    roomPlayersRef.current = room.players;
    roomBoardRef.current = room.board;
    soundEnabledRef.current = soundEnabled;
  });

  const localPlayer = room.players.find((p) => p.id === playerId);
  const isHost = !!localPlayer?.isHost || (room.players.length > 0 && playerId === room.players[0]?.id);

  // Keep client local votedCardIds state in sync with server broadcasted voter status
  useEffect(() => {
    if (localPlayer?.votedCardIds) {
      setVotedCardIds(localPlayer.votedCardIds);
    } else {
      setVotedCardIds([]);
    }
  }, [localPlayer?.votedCardIds]);

  const playCardDealCascade = (cardCount: number) => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      for (let idx = 0; idx < cardCount; idx++) {
        const delayMs = idx * 50;
        setTimeout(() => {
          try {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.type = "sine";
            const freq = 400 + (delayMs / 8);
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            
            gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
            
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.06);
          } catch {
            // ignore
          }
        }, delayMs);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | number | null = null;
    let endTimer: NodeJS.Timeout | number | null = null;

    const isTransitionToPlaying = prevPhaseRef.current === "lobby" && room.phase === "playing";
    const currentWords = room.board ? room.board.map((c) => c.word) : [];

    const isBoardReset =
      prevBoardWordsRef.current.length > 0 &&
      currentWords.length > 0 &&
      currentWords.some((w, idx) => prevBoardWordsRef.current[idx] !== w);

    if ((isTransitionToPlaying || isBoardReset) && room.phase === "playing") {
      // 50ms delay to allow DOM mounting of the grid elements
      timer = setTimeout(() => {
        setIsDealingAnimationActive(true);
        const cardCount = room.board ? room.board.length : 25;
        playCardDealCascade(cardCount);
      }, 50);

      endTimer = setTimeout(() => {
        setIsDealingAnimationActive(false);
      }, 2550);
    }

    prevPhaseRef.current = room.phase;
    prevBoardWordsRef.current = currentWords;

    return () => {
      if (timer) clearTimeout(timer as any);
      if (endTimer) clearTimeout(endTimer as any);
    };
  }, [room.phase, room.board]);

  const playClueSelectionSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1400, audioCtx.currentTime); // high-pitched professional tick
      osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.04);

      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch {
      // ignore
    }
  };

  const playClueSentSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();

      const playTone = (freq: number, duration: number, delay: number, type: OscillatorType = "sine", gainVal = 0.08) => {
        setTimeout(() => {
          try {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            
            gainNode.gain.setValueAtTime(gainVal, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
          } catch {
            // ignore
          }
        }, delay);
      };

      // Professional radar ping sound
      playTone(587.33, 0.18, 0, "sine", 0.08);   // D5
      playTone(880.00, 0.35, 120, "sine", 0.06); // A5
    } catch {
      // ignore
    }
  };

  const playCardFlipSound = (cardType: string) => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();

      const playTone = (freq: number, duration: number, delay: number, type: OscillatorType = "sine", gainVal = 0.08) => {
        setTimeout(() => {
          try {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            
            gainNode.gain.setValueAtTime(gainVal, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
          } catch {
            // ignore
          }
        }, delay);
      };

      const myTeam = localPlayer?.team;

      if (cardType === "assassin") {
        // Deep low base drone for tragic weight
        playTone(73.42, 2.2, 0, "sine", 0.12);     // D2 low base
        
        // Melancholic, sorrowful minor key melody (D-minor to diminished 5th resolving to sad lingering E)
        playTone(293.66, 0.45, 0, "triangle", 0.08);    // D4
        playTone(349.23, 0.45, 350, "triangle", 0.08);  // F4
        playTone(440.00, 0.45, 700, "triangle", 0.08);  // A4
        playTone(415.30, 0.50, 1050, "triangle", 0.08); // G#4 (tragic dissonant shift)
        playTone(349.23, 0.50, 1450, "triangle", 0.08); // F4
        playTone(329.63, 0.90, 1850, "triangle", 0.08); // E4 (lingering sad resolution)
      } else if (cardType === "neutral") {
        // 2. White/neutral card flipped: Soft neutral double beep
        playTone(329.63, 0.08, 0, "sine", 0.06); // E4
        playTone(329.63, 0.08, 100, "sine", 0.06); // E4
      } else if (myTeam && cardType === myTeam) {
        // 1. Our own team card flipped: Joyful major chime
        playTone(523.25, 0.15, 0, "sine", 0.08); // C5
        playTone(783.99, 0.25, 100, "sine", 0.08); // G5
      } else {
        // Opponent card flipped: A clean, bouncy warning beep (professional double-tone rise)
        playTone(392.00, 0.10, 0, "sine", 0.06);   // G4
        playTone(587.33, 0.18, 80, "sine", 0.06);  // D5
      }
    } catch (e) {
      // ignore
    }
  };

  const playVictorySound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();

      const playTone = (freq: number, duration: number, delay: number, type: OscillatorType = "sine", gainVal = 0.08) => {
        setTimeout(() => {
          try {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            
            gainNode.gain.setValueAtTime(gainVal, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
          } catch {
            // ignore
          }
        }, delay);
      };

      // Super Triumphant 8-bit / Cinematic Chiptune Fanfare!
      playTone(261.63, 0.15, 0, "triangle", 0.10);   // C4
      playTone(329.63, 0.15, 80, "triangle", 0.10);  // E4
      playTone(392.00, 0.15, 160, "triangle", 0.10); // G4
      playTone(523.25, 0.15, 240, "triangle", 0.10); // C5
      playTone(659.25, 0.15, 320, "triangle", 0.10); // E5
      playTone(783.99, 0.15, 400, "triangle", 0.10); // G5
      playTone(1046.50, 0.20, 480, "triangle", 0.10); // C6
      
      playTone(1174.66, 0.10, 560, "sine", 0.08); // D6
      playTone(1318.51, 0.10, 620, "sine", 0.08); // E6
      playTone(1567.98, 0.30, 680, "sine", 0.08); // G6
      
      const chordDelay = 780;
      playTone(523.25, 1.5, chordDelay, "sine", 0.08);   // C5
      playTone(659.25, 1.5, chordDelay, "sine", 0.08);   // E5
      playTone(783.99, 1.5, chordDelay, "sine", 0.08);   // G5
      playTone(1046.50, 1.5, chordDelay, "triangle", 0.05); // C6 (crisp chord edge)
      playTone(1318.51, 1.5, chordDelay, "triangle", 0.05); // E6 (crisp chord edge)
    } catch {
      // ignore
    }
  };

  // Trigger neural streams shooting from the clue box to unrevealed cards
  const triggerNeuralStreams = () => {
    setTimeout(() => {
      const containerEl = document.getElementById("game-board-container");
      const cluePanelEl = document.getElementById("clue-display-panel");
      if (!containerEl || !cluePanelEl) return;

      const containerRect = containerEl.getBoundingClientRect();
      const clueRect = cluePanelEl.getBoundingClientRect();

      const start = {
        x: (clueRect.left - containerRect.left) + (clueRect.width / 2),
        y: (clueRect.top - containerRect.top) + clueRect.height,
      };

      const cardElements = document.querySelectorAll("[data-card-id]");
      const streams: { start: { x: number; y: number }; end: { x: number; y: number } }[] = [];

      cardElements.forEach((cardEl) => {
        const cardId = parseInt(cardEl.getAttribute("data-card-id") || "", 10);
        const cardObj = board.find((c) => c.id === cardId);
        if (cardObj && !cardObj.revealed) {
          const cardRect = cardEl.getBoundingClientRect();
          const end = {
            x: (cardRect.left - containerRect.left) + (cardRect.width / 2),
            y: (cardRect.top - containerRect.top) + (cardRect.height / 2),
          };
          streams.push({ start, end });
        }
      });

      setNeuralStreams(streams);
      setTimeout(() => {
        setNeuralStreams([]);
      }, 1500);
    }, 100);
  };

  // Listen for Spymaster giving a clue to play a alert sound
  useEffect(() => {
    if (room.turnState && room.phase === "playing") {
      const prevTurnState = prevTurnStateRef.current;
      const curClue = room.turnState.clueWord;
      const prevClue = prevTurnState?.clueWord;

      if (curClue && curClue !== prevClue) {
        playClueSentSound();
        triggerNeuralStreams();
      }
    }
    prevTurnStateRef.current = room.turnState;
  }, [room.turnState, room.phase]);

  // Listen for Live Card Flips to trigger Sound and Animations
  useEffect(() => {
    if (!room.board || room.board.length === 0) return;

    if (room.phase === "playing" && prevBoardRef.current.length > 0) {
      room.board.forEach((card) => {
        const prevCard = prevBoardRef.current.find((c) => c.id === card.id);
        if (card.revealed && prevCard && !prevCard.revealed) {
          // Play flip sound
          playCardFlipSound(card.type);
          
          // Trigger flip animation class
          setRecentlyFlippedCardIds((prev) => [...prev, card.id]);
          setTimeout(() => {
            setRecentlyFlippedCardIds((prev) => prev.filter((id) => id !== card.id));
          }, 600);

          if (card.type === "assassin") {
            setAssassinRevealedId(card.id);
            setIsAssassinShake(true);
            
            // Calculate shockwave offsets for all other cards
            const assassinRow = Math.floor(card.id / cols);
            const assassinCol = card.id % cols;
            const offsets: Record<number, { x: number; y: number }> = {};
            
            board.forEach((otherCard) => {
              if (otherCard.id === card.id) return;
              const r = Math.floor(otherCard.id / cols);
              const c = otherCard.id % cols;
              const dx = c - assassinCol;
              const dy = r - assassinRow;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > 0) {
                const force = 25 / dist;
                offsets[otherCard.id] = {
                  x: (dx / dist) * force,
                  y: (dy / dist) * force,
                };
              }
            });
            setShockwaveCardOffsets(offsets);
            
            setTimeout(() => {
              setIsAssassinShake(false);
              setAssassinRevealedId(null);
              setShockwaveCardOffsets({});
            }, 1200);
          }
        }
      });
    }

    prevBoardRef.current = room.board;
  }, [room.board, room.phase, soundEnabled, localPlayer?.team]);

  // Listen for Victory transition to play fanfare sound
  useEffect(() => {
    if (room.winner && !prevWinnerRef.current) {
      playVictorySound();
    }
    prevWinnerRef.current = room.winner || null;
  }, [room.winner, soundEnabled]);

  const [isTimerModeDropdownOpen, setIsTimerModeDropdownOpen] = useState(false);


  // Google Meaning Search Overlay States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const renderGroupedPlayersCard = () => {
    const renderTeamSegment = (color: "red" | "blue" | "green" | "yellow", label: string) => {
      const teamObj = room.teams[color];
      const teamPlayers = room.players.filter((p) => p.team === color);
      const spymasters = teamPlayers.filter((p) => p.role === "spymaster");
      const operatives = teamPlayers.filter((p) => p.role === "operative" || (!p.role && p.team));
      const themeCol = typeColors[color]!;

      return (
        <div
          key={color}
          style={{
            borderLeft: `3px solid ${themeCol.border}`,
            paddingLeft: "12px",
            marginBottom: "4px",
            flex: 1,
            minWidth: "180px",
          }}
        >
          <h4
            style={{
              margin: "0 0 10px 0",
              fontFamily: "var(--font-display)",
              fontSize: "1.15rem",
              fontWeight: 700,
              color: themeCol.light,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{label}</span>
            {isHost ? (
              <input
                type="text"
                defaultValue={teamObj?.name || ""}
                placeholder="City Name"
                onBlur={(e) => {
                  if (socket && e.target.value.trim() !== "") {
                    socket.emit("rename_team", {
                      roomCode: room.roomCode,
                      teamColor: color,
                      name: e.target.value.trim(),
                    });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && socket && e.currentTarget.value.trim() !== "") {
                    socket.emit("rename_team", {
                      roomCode: room.roomCode,
                      teamColor: color,
                      name: e.currentTarget.value.trim(),
                    });
                    e.currentTarget.blur();
                  }
                }}
                style={{
                  background: themeCol.bg,
                  border: `1px solid ${themeCol.border}`,
                  borderRadius: "12px",
                  color: themeCol.text,
                  padding: "3px 8px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  width: "110px",
                  textAlign: "center",
                  outline: "none",
                }}
              />
            ) : (
              teamObj?.name && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    padding: "3px 8px",
                    borderRadius: "12px",
                    background: themeCol.bg,
                    color: themeCol.text,
                    border: `1px solid ${themeCol.border}`,
                    display: "inline-block",
                  }}
                >
                  {teamObj.name}
                </span>
              )
            )}
          </h4>

          {room.gameMode === "coop" ? (
            <div style={{ width: "100%", boxSizing: "border-box" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: "8px" }}>
                Members
              </div>
              {teamPlayers.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                  {teamPlayers.map((p) => renderPlayerRow(p))}
                </div>
              ) : null}
              {localPlayer?.team !== color && (
                <button
                  onClick={() => handleJoinTeamRole(color, "operative")}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    background: "transparent",
                    border: "1px solid var(--accent)",
                    color: "var(--accent)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                    transition: "all 0.15s ease",
                    boxSizing: "border-box",
                    textAlign: "center",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "var(--accent)";
                    e.currentTarget.style.color = "var(--accent-text-on)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--accent)";
                  }}
                >
                  + Join Team
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", width: "100%", boxSizing: "border-box" }}>
              {/* Spymasters section */}
              <div>
                <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>
                  Spymaster
                </div>
                {spymasters.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "8px" }}>
                    {spymasters.map((p) => renderPlayerRow(p))}
                  </div>
                ) : (
                  <button
                    onClick={() => handleJoinTeamRole(color, "spymaster")}
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      background: "transparent",
                      border: "1px solid var(--accent)",
                      color: "var(--accent)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "var(--font-display)",
                      transition: "all 0.15s ease",
                      boxSizing: "border-box",
                      textAlign: "center",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "var(--accent)";
                      e.currentTarget.style.color = "var(--accent-text-on)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--accent)";
                    }}
                  >
                    + Join Spymaster
                  </button>
                )}
              </div>

              {/* Operatives section */}
              <div>
                <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>
                  Operatives
                </div>
                {operatives.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "8px" }}>
                    {operatives.map((p) => renderPlayerRow(p))}
                  </div>
                ) : (
                  <button
                    onClick={() => handleJoinTeamRole(color, "operative")}
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      background: "transparent",
                      border: "1px solid var(--accent)",
                      color: "var(--accent)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "var(--font-display)",
                      transition: "all 0.15s ease",
                      boxSizing: "border-box",
                      textAlign: "center",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "var(--accent)";
                      e.currentTarget.style.color = "var(--accent-text-on)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--accent)";
                    }}
                  >
                    + Join Operative
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      );
    };

    return (
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          padding: "20px",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 0 16px 0" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
            {t("game.roomPlayers", "Room Players")} ({room.players.length})
          </h3>
          <button
            onClick={() => setPlayersExpanded(!playersExpanded)}
            style={{
              background: "var(--bg-surface-raised)",
              border: "1px solid var(--border-default)",
              color: "var(--accent)",
              padding: "4px 10px",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "var(--font-display)",
            }}
          >
            {playersExpanded ? "Collapse ▲" : "Expand ▼"}
          </button>
        </div>

        {!playersExpanded ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", padding: "4px 0" }}>
            {room.players.map((p) => renderPlayerRow(p))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Row 1: Red and Blue Teams */}
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              {renderTeamSegment("red", `${t("teams.red")} ${t("teams.team")}`)}
              {renderTeamSegment("blue", `${t("teams.blue")} ${t("teams.team")}`)}
            </div>

            {/* Row 2: Green and Yellow Teams */}
            {room.teamCount > 2 && (
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                {renderTeamSegment("green", `${t("teams.green")} ${t("teams.team")}`)}
                {room.teamCount > 3 ? (
                  renderTeamSegment("yellow", `${t("teams.yellow")} ${t("teams.team")}`)
                ) : (
                  <div style={{ flex: 1, minWidth: "180px" }} />
                )}
              </div>
            )}

            {/* Spectators / Unassigned Group */}
            {(() => {
              const specs = room.players.filter((p) => !p.team);
              if (specs.length === 0) return null;
              return (
                <div
                  style={{
                    borderLeft: "3px solid rgba(255,255,255,0.2)",
                    paddingLeft: "12px",
                    marginTop: "8px",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 10px 0",
                      fontFamily: "var(--font-display)",
                      fontSize: "1.15rem",
                      fontWeight: 700,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {t("roles.spectator", "Spectators")}
                  </h4>
                  <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "8px" }}>
                    {specs.map((p) => renderPlayerRow(p))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    );
  };

  const renderSettingsCard = () => {
    return (
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          padding: "24px",
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          gap: "32px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            filter: isHost ? "none" : "blur(1.5px)",
            pointerEvents: isHost ? "auto" : "none",
            opacity: isHost ? 1 : 0.7,
            transition: "all 0.3s ease",
            position: "relative",
          }}
        >
          <div>
            <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", margin: 0, fontWeight: 700, color: "var(--accent)" }}>
              {t("settings.hostSettings", "Host Settings")}
            </h4>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "32px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative" }}>
                <label style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "0.95rem" }}>
                  {t("settings.timerMode", "Turn Timer Mode")}
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button
                    type="button"
                    disabled={!isHost}
                    onClick={() => isHost && setIsTimerModeDropdownOpen(!isTimerModeDropdownOpen)}
                    style={{
                      width: "fit-content",
                      minWidth: "160px",
                      padding: "7px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-default)",
                      background: "var(--bg-surface-raised)",
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-display)",
                      fontSize: "0.9rem",
                      textAlign: "left",
                      cursor: isHost ? "pointer" : "not-allowed",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>
                      {room.settings.timerMode === "off" || !room.settings.timerMode ? t("settings.timerOff", "Off") :
                       room.settings.timerMode === "fast" ? t("settings.timerFast", "Fast (90s / 60s)") :
                       room.settings.timerMode === "long" ? t("settings.timerLong", "Long (180s / 120s)") : t("settings.timerCustom", "Custom")}
                    </span>
                    <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                      {isTimerModeDropdownOpen ? "▲" : "▼"}
                    </span>
                  </button>
                  {(room.settings.timerMode && room.settings.timerMode !== "off") && (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "6px",
                      width: "100%",
                      maxWidth: "380px",
                    }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.68rem", color: "var(--color-text)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {t("settings.spymasterTimer", "Spymaster (s)")}
                        </label>
                        <input
                          type="number"
                          disabled={room.settings.timerMode !== "custom" || !isHost}
                          value={
                            room.settings.timerMode === "fast" ? 90 :
                            room.settings.timerMode === "long" ? 180 :
                            (room.settings.spymasterTimerSeconds !== undefined ? room.settings.spymasterTimerSeconds : 90)
                          }
                          onChange={(e) => {
                            if (socket && isHost && room.settings.timerMode === "custom") {
                              socket.emit("update_settings", {
                                roomCode: room.roomCode,
                                settings: { spymasterTimerSeconds: Number(e.target.value) },
                              });
                            }
                          }}
                          style={{
                            width: "100%",
                            padding: "6px 8px",
                            borderRadius: "var(--radius-sm)",
                            border: room.settings.timerMode === "custom" ? "1px solid var(--accent)" : "1px solid var(--border-default)",
                            background: room.settings.timerMode === "custom" ? "var(--bg-surface-raised)" : "rgba(255,255,255,0.03)",
                            color: "var(--color-text)",
                            fontSize: "0.82rem",
                            outline: "none",
                            textAlign: "center",
                            opacity: room.settings.timerMode === "custom" ? 1.0 : 0.6,
                          }}
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.68rem", color: "var(--color-text)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {t("settings.firstClueExtra", "1st Clue Extra (s)")}
                        </label>
                        <input
                          type="number"
                          disabled={room.settings.timerMode !== "custom" || !isHost}
                          value={
                            room.settings.timerMode === "fast" ? 60 :
                            room.settings.timerMode === "long" ? 120 :
                            (room.settings.firstClueExtraSeconds !== undefined ? room.settings.firstClueExtraSeconds : 60)
                          }
                          onChange={(e) => {
                            if (socket && isHost && room.settings.timerMode === "custom") {
                              socket.emit("update_settings", {
                                roomCode: room.roomCode,
                                settings: { firstClueExtraSeconds: Number(e.target.value) },
                              });
                            }
                          }}
                          style={{
                            width: "100%",
                            padding: "6px 8px",
                            borderRadius: "var(--radius-sm)",
                            border: room.settings.timerMode === "custom" ? "1px solid var(--accent)" : "1px solid var(--border-default)",
                            background: room.settings.timerMode === "custom" ? "var(--bg-surface-raised)" : "rgba(255,255,255,0.03)",
                            color: "var(--color-text)",
                            fontSize: "0.82rem",
                            outline: "none",
                            textAlign: "center",
                            opacity: room.settings.timerMode === "custom" ? 1.0 : 0.6,
                          }}
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.68rem", color: "var(--color-text)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {t("settings.operativeTimer", "Operative (s)")}
                        </label>
                        <input
                          type="number"
                          disabled={room.settings.timerMode !== "custom" || !isHost}
                          value={
                            room.settings.timerMode === "fast" ? 60 :
                            room.settings.timerMode === "long" ? 120 :
                            (room.settings.operativeTimerSeconds !== undefined ? room.settings.operativeTimerSeconds : 60)
                          }
                          onChange={(e) => {
                            if (socket && isHost && room.settings.timerMode === "custom") {
                              socket.emit("update_settings", {
                                roomCode: room.roomCode,
                                settings: { operativeTimerSeconds: Number(e.target.value) },
                              });
                            }
                          }}
                          style={{
                            width: "100%",
                            padding: "6px 8px",
                            borderRadius: "var(--radius-sm)",
                            border: room.settings.timerMode === "custom" ? "1px solid var(--accent)" : "1px solid var(--border-default)",
                            background: room.settings.timerMode === "custom" ? "var(--bg-surface-raised)" : "rgba(255,255,255,0.03)",
                            color: "var(--color-text)",
                            fontSize: "0.82rem",
                            outline: "none",
                            textAlign: "center",
                            opacity: room.settings.timerMode === "custom" ? 1.0 : 0.6,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {isTimerModeDropdownOpen && isHost && (
                  <>
                    <div
                      style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 998,
                      }}
                      onClick={() => setIsTimerModeDropdownOpen(false)}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        width: "240px",
                        marginTop: "4px",
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-default)",
                        borderRadius: "var(--radius-sm)",
                        maxHeight: "220px",
                        overflowY: "auto",
                        zIndex: 999,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                        padding: "4px 0",
                      }}
                      className="scale-up"
                    >
                      {[
                        { value: "off", label: t("settings.timerOff", "Off") },
                        { value: "fast", label: t("settings.timerFast", "Fast (90s / 60s)") },
                        { value: "long", label: t("settings.timerLong", "Long (180s / 120s)") },
                        { value: "custom", label: t("settings.timerCustom", "Custom") },
                      ].map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => {
                            if (socket && isHost) {
                              let extraSettings = {};
                              if (opt.value === "fast") {
                                extraSettings = { spymasterTimerSeconds: 90, firstClueExtraSeconds: 60, operativeTimerSeconds: 60 };
                              } else if (opt.value === "long") {
                                extraSettings = { spymasterTimerSeconds: 180, firstClueExtraSeconds: 120, operativeTimerSeconds: 120 };
                              } else if (opt.value === "off") {
                                extraSettings = { spymasterTimerSeconds: 0, firstClueExtraSeconds: 0, operativeTimerSeconds: 0 };
                              }
                              socket.emit("update_settings", {
                                roomCode: room.roomCode,
                                settings: { timerMode: opt.value, ...extraSettings },
                              });
                            }
                            setIsTimerModeDropdownOpen(false);
                          }}
                          style={{
                            padding: "8px 14px",
                            cursor: "pointer",
                            color: (room.settings.timerMode || "off") === opt.value ? "var(--accent)" : "var(--text-primary)",
                            background: (room.settings.timerMode || "off") === opt.value ? "rgba(232, 163, 61, 0.08)" : "transparent",
                            fontWeight: (room.settings.timerMode || "off") === opt.value ? 700 : 500,
                            fontSize: "0.9rem",
                          }}
                          onMouseOver={(e) => {
                            if ((room.settings.timerMode || "off") !== opt.value) {
                              e.currentTarget.style.background = "var(--border-subtle)";
                            }
                          }}
                          onMouseOut={(e) => {
                            if ((room.settings.timerMode || "off") !== opt.value) {
                              e.currentTarget.style.background = "transparent";
                            }
                          }}
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "0.95rem" }}>
                  {t("settings.assassinRule", "Assassin Card Rule")}
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: isHost ? "pointer" : "not-allowed" }}>
                    <input
                      type="radio"
                      disabled={!isHost}
                      name="eliminationRule"
                      checked={room.settings.eliminationRule === "continue"}
                      onChange={() => isHost && handleUpdateEliminationRule("continue")}
                      style={{ cursor: isHost ? "pointer" : "not-allowed", accentColor: "var(--accent)" }}
                    />
                    <span style={{ fontSize: "0.9rem" }}>{t("settings.teamEliminatedContinue", "Team Eliminated, Continue (Default)")}</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: isHost ? "pointer" : "not-allowed" }}>
                    <input
                      type="radio"
                      disabled={!isHost}
                      name="eliminationRule"
                      checked={room.settings.eliminationRule === "game_end"}
                      onChange={() => isHost && handleUpdateEliminationRule("game_end")}
                      style={{ cursor: isHost ? "pointer" : "not-allowed", accentColor: "var(--accent)" }}
                    />
                    <span style={{ fontSize: "0.9rem" }}>{t("settings.gameEndsImmediately", "Game Ends Immediately")}</span>
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "320px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "0.95rem" }}>
                  {t("settings.timerAction", "Timer Expiration Action")}
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { value: "auto", label: t("settings.timerActionAuto", "Automatic Turn Shift") },
                    { value: "manual", label: t("settings.timerActionManual", "Manual End Turn") },
                  ].map((opt) => {
                    const isSelected = (room.settings.timerAction || "auto") === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={!isHost}
                        onClick={() => {
                          if (socket && isHost) {
                            socket.emit("update_settings", {
                              roomCode: room.roomCode,
                              settings: { timerAction: opt.value },
                            });
                          }
                        }}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "var(--radius-sm)",
                          border: `1px solid ${isSelected ? "var(--accent)" : "var(--border-default)"}`,
                          background: isSelected ? "var(--accent)" : "var(--bg-surface-raised)",
                          color: isSelected ? "var(--accent-text-on)" : "var(--text-primary)",
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          cursor: isHost ? "pointer" : "not-allowed",
                          textAlign: "left",
                          transition: "all 0.15s ease",
                          boxShadow: isSelected ? "0 0 8px rgba(232,163,61,0.3)" : "none",
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {room.phase === "lobby" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "0.95rem" }}>
                    {t("settings.lobbyControls", "Lobby Controls")}
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <button
                      disabled={!isHost}
                      onClick={() => {
                        if (socket && isHost) socket.emit("randomize_teams", { roomCode: room.roomCode });
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "var(--radius-sm)",
                        background: "transparent",
                        border: "1px solid var(--border-default)",
                        color: "var(--text-primary)",
                        fontWeight: 700,
                        cursor: isHost ? "pointer" : "not-allowed",
                        fontFamily: "var(--font-display)",
                        fontSize: "0.85rem",
                        textAlign: "left",
                        transition: "all 0.2s ease",
                      }}
                      onMouseOver={(e) => {
                        if (isHost) e.currentTarget.style.background = "var(--border-subtle)";
                      }}
                      onMouseOut={(e) => {
                        if (isHost) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {t("settings.randomize", "Randomize Teams")}
                    </button>
                    <button
                      disabled={!isHost}
                      onClick={() => {
                        if (socket && isHost) {
                          socket.emit("update_settings", {
                            roomCode: room.roomCode,
                            settings: { roomLocked: !room.settings.roomLocked },
                          });
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "var(--radius-sm)",
                        background: room.settings.roomLocked ? "rgba(239, 68, 68, 0.12)" : "transparent",
                        border: `1px solid ${room.settings.roomLocked ? "rgb(239, 68, 68)" : "var(--accent)"}`,
                        color: room.settings.roomLocked ? "rgb(239, 68, 68)" : "var(--accent)",
                        fontWeight: 700,
                        cursor: isHost ? "pointer" : "not-allowed",
                        fontFamily: "var(--font-display)",
                        fontSize: "0.85rem",
                        textAlign: "left",
                        transition: "all 0.2s ease",
                      }}
                      onMouseOver={(e) => {
                        if (isHost) e.currentTarget.style.background = room.settings.roomLocked ? "rgba(239, 68, 68, 0.2)" : "rgba(232, 163, 61, 0.08)";
                      }}
                      onMouseOut={(e) => {
                        if (isHost) e.currentTarget.style.background = room.settings.roomLocked ? "rgba(239, 68, 68, 0.12)" : "transparent";
                      }}
                    >
                      {room.settings.roomLocked ? t("settings.unlockRoom", "Unlock Room") : t("settings.lockRoom", "Lock Room")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px", borderTop: "1px solid var(--border-subtle)", paddingTop: "24px" }}>
          <div>
            <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", margin: 0, fontWeight: 700, color: "var(--text-primary)" }}>
              {t("settings.gameSettings", "Game Settings")}
            </h4>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "32px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "0.95rem" }}>
                {t("settings.afkTimeout", "AFK Timeout")}
              </label>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {[1, 3, 5, 10, 15].map((mins) => {
                  const isSelected = (room.settings.afkTimeoutMinutes || 5) === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        if (socket) {
                          socket.emit("update_settings", {
                            roomCode: room.roomCode,
                            settings: { afkTimeoutMinutes: mins },
                          });
                        }
                      }}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "var(--radius-sm)",
                        border: `1px solid ${isSelected ? "var(--accent)" : "var(--border-default)"}`,
                        background: isSelected ? "var(--accent)" : "var(--bg-surface-raised)",
                        color: isSelected ? "var(--accent-text-on)" : "var(--text-primary)",
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        boxShadow: isSelected ? "0 0 8px rgba(232,163,61,0.3)" : "none",
                      }}
                    >
                      {mins}{t("settings.minutes", "m").charAt(0)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "0.95rem" }}>
                {t("settings.preferences", "Preferences")}
              </label>
              <div style={{ display: "flex", gap: "16px" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                  <div style={{ position: "relative", width: "42px", height: "22px" }}>
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={(e) => setSoundEnabled(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0, position: "absolute" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: soundEnabled ? "var(--accent)" : "var(--border-default)",
                        borderRadius: "22px",
                        transition: "all 0.2s ease",
                        boxShadow: soundEnabled ? "0 0 8px rgba(232,163,61,0.4)" : "none",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: soundEnabled ? "22px" : "2px",
                        width: "18px",
                        height: "18px",
                        backgroundColor: "#fff",
                        borderRadius: "50%",
                        transition: "all 0.2s ease",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "0.95rem", color: "var(--color-text)", fontWeight: 500 }}>
                    {t("settings.sound", "Sound")}
                  </span>
                </label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                  <div style={{ position: "relative", width: "42px", height: "22px" }}>
                    <input
                      type="checkbox"
                      checked={lightMode}
                      onChange={(e) => setLightMode(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0, position: "absolute" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: lightMode ? "var(--accent)" : "var(--border-default)",
                        borderRadius: "22px",
                        transition: "all 0.2s ease",
                        boxShadow: lightMode ? "0 0 8px rgba(232,163,61,0.4)" : "none",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: lightMode ? "22px" : "2px",
                        width: "18px",
                        height: "18px",
                        backgroundColor: "#fff",
                        borderRadius: "50%",
                        transition: "all 0.2s ease",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "0.95rem", color: "var(--color-text)", fontWeight: 500 }}>
                    {t("settings.lightMode", "Light Mode")}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPlayerRow = (p: Player) => {
    const border = p.team ? typeColors[p.team]!.border : "rgba(255,255,255,0.15)";
    const isCurrent = p.id === playerId;
    const canSwitch = isHost || (p.id === playerId && !room.settings.roomLocked);

    return (
      <div
        key={p.id}
        style={{
          position: "relative",
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: canSwitch ? "pointer" : "default",
          margin: "4px",
        }}
      >
        {/* The Circle */}
        <div
          onClick={() => {
            if (canSwitch) {
              setActiveSwitchPlayerId(activeSwitchPlayerId === p.id ? null : p.id);
            }
          }}
          title={`${p.displayName}${p.id === playerId ? " (You)" : ""} - ${p.status || "ACTIVE"} (${p.connected ? "Online" : "Offline"})`}
          style={{
            position: "relative",
            width: "54px",
            height: "54px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
            border: `2px solid ${isCurrent ? "var(--accent)" : border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isCurrent ? "0 0 10px rgba(232, 163, 61, 0.4)" : "none",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
            if (isCurrent) e.currentTarget.style.boxShadow = "0 0 14px rgba(232, 163, 61, 0.6)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = isCurrent ? "var(--accent)" : border;
            e.currentTarget.style.boxShadow = isCurrent ? "0 0 10px rgba(232, 163, 61, 0.4)" : "none";
          }}
        >
          {/* Avatar inside */}
          {p.avatar ? (
            renderAvatar(p.avatar, 38)
          ) : (
            <Identicon username={p.displayName} size={38} />
          )}

          {/* Connection dot (top right) */}
          <div
            style={{
              position: "absolute",
              top: "1px",
              right: "1px",
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              background: p.connected ? "hsl(142,75%,45%)" : "hsl(355,85%,58%)",
              border: "1px solid var(--color-surface)",
            }}
          />

          {/* Host Crown (above) */}
          {(p.isHost || p.id === room.players[0]?.id) && (
            <span
              style={{
                position: "absolute",
                top: "-12px",
                left: "50%",
                transform: "translateX(-50%) rotate(-5deg)",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                pointerEvents: "none",
              }}
              title="Room Host"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 4L5 12L12 6L19 12L22 4L17 18H7L2 4Z" />
                <circle cx="12" cy="6" r="1" fill="var(--accent)" />
                <circle cx="2" cy="4" r="1" fill="var(--accent)" />
                <circle cx="22" cy="4" r="1" fill="var(--accent)" />
              </svg>
            </span>
          )}

          {/* Small status overlay badge (bottom right) */}
          {p.status && p.status !== "ACTIVE" && (
            <span
              style={{
                position: "absolute",
                bottom: "-2px",
                right: "-2px",
                fontSize: "0.6rem",
                fontWeight: 800,
                padding: "1px 3px",
                borderRadius: "3px",
                background: getStatusStyle(p.status).bg,
                color: getStatusStyle(p.status).text,
                textTransform: "uppercase",
                pointerEvents: "none",
                lineHeight: 1,
              }}
            >
              {p.status}
            </span>
          )}
        </div>

        {/* Small name label (underneath) */}
        <span
          style={{
            fontSize: "0.9rem",
            fontWeight: isCurrent ? 700 : 500,
            color: isCurrent ? "var(--accent)" : "var(--color-text-muted)",
            maxWidth: "70px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginTop: "4px",
            textAlign: "center",
          }}
          title={p.displayName}
        >
          {p.displayName}
        </span>

        {activeSwitchPlayerId === p.id && (
          <>
            {/* Transparent click catcher background (no visible overlay, no blur) */}
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "transparent",
                zIndex: 9998,
              }}
              onClick={() => setActiveSwitchPlayerId(null)}
            />
            {/* Popover content absolute positioned directly below the circle */}
            <div
              style={{
                position: "absolute",
                top: "60px",
                left: (p.team === "red" || p.team === "green") ? "0" : ((p.team === "blue" || p.team === "yellow") ? "auto" : "50%"),
                right: (p.team === "blue" || p.team === "yellow") ? "0" : "auto",
                transform: (p.team === "red" || p.team === "green" || p.team === "blue" || p.team === "yellow") ? "none" : "translateX(-50%)",
                background: "var(--color-surface)",
                border: "1px solid var(--accent)",
                borderRadius: "var(--radius-md)",
                padding: "20px",
                boxShadow: "0 15px 40px rgba(0,0,0,0.6)",
                width: "250px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                zIndex: 9999,
              }}
              className="scale-up"
            >
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "center", borderBottom: "1px solid var(--border-default)", paddingBottom: "4px" }}>
                {t("game.assign", "Assign")} {p.displayName}
              </span>
              
              {room.gameMode === "coop" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {Object.entries(room.teams).map(([color, teamState]) => (
                    <button
                      key={color}
                      onClick={() => {
                        handleJoinTeamRole(color as any, null, p.id);
                        setActiveSwitchPlayerId(null);
                      }}
                      style={{
                        padding: "8px",
                        fontSize: "0.75rem",
                        background: p.team === color ? typeColors[color as keyof typeof typeColors]!.border : typeColors[color as keyof typeof typeColors]!.bg,
                        border: `1px solid ${typeColors[color as keyof typeof typeColors]!.border}`,
                        borderRadius: "4px",
                        color: p.team === color ? "#fff" : typeColors[color as keyof typeof typeColors]!.text,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {t("game.joinAs", { role: teamState.name || t(`teams.${color}`) })}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {/* Red Team */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                    <button
                      onClick={() => {
                        handleJoinTeamRole("red", "spymaster", p.id);
                        setActiveSwitchPlayerId(null);
                      }}
                      style={{
                        padding: "6px",
                        fontSize: "0.75rem",
                        background: p.team === "red" && p.role === "spymaster" ? typeColors.red!.border : typeColors.red!.bg,
                        border: `1px solid ${typeColors.red!.border}`,
                        borderRadius: "4px",
                        color: p.team === "red" && p.role === "spymaster" ? "#fff" : typeColors.red!.text,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {t("teams.red")} {t("roles.spymaster")}
                    </button>
                    <button
                      onClick={() => {
                        handleJoinTeamRole("red", "operative", p.id);
                        setActiveSwitchPlayerId(null);
                      }}
                      style={{
                        padding: "6px",
                        fontSize: "0.75rem",
                        background: p.team === "red" && p.role === "operative" ? typeColors.red!.border : typeColors.red!.bg,
                        border: `1px solid ${typeColors.red!.border}`,
                        borderRadius: "4px",
                        color: p.team === "red" && p.role === "operative" ? "#fff" : typeColors.red!.text,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {t("teams.red")} {t("roles.operative")}
                    </button>
                  </div>

                  {/* Blue Team */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                    <button
                      onClick={() => {
                        handleJoinTeamRole("blue", "spymaster", p.id);
                        setActiveSwitchPlayerId(null);
                      }}
                      style={{
                        padding: "6px",
                        fontSize: "0.75rem",
                        background: p.team === "blue" && p.role === "spymaster" ? typeColors.blue!.border : typeColors.blue!.bg,
                        border: `1px solid ${typeColors.blue!.border}`,
                        borderRadius: "4px",
                        color: p.team === "blue" && p.role === "spymaster" ? "#fff" : typeColors.blue!.text,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {t("teams.blue")} {t("roles.spymaster")}
                    </button>
                    <button
                      onClick={() => {
                        handleJoinTeamRole("blue", "operative", p.id);
                        setActiveSwitchPlayerId(null);
                      }}
                      style={{
                        padding: "6px",
                        fontSize: "0.75rem",
                        background: p.team === "blue" && p.role === "operative" ? typeColors.blue!.border : typeColors.blue!.bg,
                        border: `1px solid ${typeColors.blue!.border}`,
                        borderRadius: "4px",
                        color: p.team === "blue" && p.role === "operative" ? "#fff" : typeColors.blue!.text,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {t("teams.blue")} {t("roles.operative")}
                    </button>
                  </div>

                  {/* Green Team */}
                  {room.teamCount > 2 && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                      <button
                        onClick={() => {
                          handleJoinTeamRole("green", "spymaster", p.id);
                          setActiveSwitchPlayerId(null);
                        }}
                        style={{
                          padding: "6px",
                          fontSize: "0.75rem",
                          background: p.team === "green" && p.role === "spymaster" ? typeColors.green!.border : typeColors.green!.bg,
                          border: `1px solid ${typeColors.green!.border}`,
                          borderRadius: "4px",
                          color: p.team === "green" && p.role === "spymaster" ? "#fff" : typeColors.green!.text,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {t("teams.green")} {t("roles.spymaster")}
                      </button>
                      <button
                        onClick={() => {
                          handleJoinTeamRole("green", "operative", p.id);
                          setActiveSwitchPlayerId(null);
                        }}
                        style={{
                          padding: "6px",
                          fontSize: "0.75rem",
                          background: p.team === "green" && p.role === "operative" ? typeColors.green!.border : typeColors.green!.bg,
                          border: `1px solid ${typeColors.green!.border}`,
                          borderRadius: "4px",
                          color: p.team === "green" && p.role === "operative" ? "#fff" : typeColors.green!.text,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {t("teams.green")} {t("roles.operative")}
                      </button>
                    </div>
                  )}

                  {/* Yellow Team */}
                  {room.teamCount > 3 && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                      <button
                        onClick={() => {
                          handleJoinTeamRole("yellow", "spymaster", p.id);
                          setActiveSwitchPlayerId(null);
                        }}
                        style={{
                          padding: "6px",
                          fontSize: "0.75rem",
                          background: p.team === "yellow" && p.role === "spymaster" ? typeColors.yellow!.border : typeColors.yellow!.bg,
                          border: `1px solid ${typeColors.yellow!.border}`,
                          borderRadius: "4px",
                          color: p.team === "yellow" && p.role === "spymaster" ? "#fff" : typeColors.yellow!.text,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {t("teams.yellow")} {t("roles.spymaster")}
                      </button>
                      <button
                        onClick={() => {
                          handleJoinTeamRole("yellow", "operative", p.id);
                          setActiveSwitchPlayerId(null);
                        }}
                        style={{
                          padding: "6px",
                          fontSize: "0.75rem",
                          background: p.team === "yellow" && p.role === "operative" ? typeColors.yellow!.border : typeColors.yellow!.bg,
                          border: `1px solid ${typeColors.yellow!.border}`,
                          borderRadius: "4px",
                          color: p.team === "yellow" && p.role === "operative" ? "#fff" : typeColors.yellow!.text,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {t("teams.yellow")} {t("roles.operative")}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Spectate Button */}
              <button
                onClick={() => {
                  handleJoinTeamRole(null, null, p.id);
                  setActiveSwitchPlayerId(null);
                }}
                style={{
                  padding: "6px",
                  fontSize: "0.75rem",
                  background: !p.team ? "var(--accent)" : "transparent",
                  border: "1px solid var(--accent)",
                  borderRadius: "4px",
                  color: !p.team ? "var(--accent-text-on)" : "var(--accent)",
                  fontWeight: 600,
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                {t("roles.spectator", "Spectate")}
              </button>

              {/* Host Actions: Kick / Promote */}
              {isHost && p.id !== playerId && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", borderTop: "1px solid var(--border-default)", paddingTop: "8px", marginTop: "4px" }}>
                  {!p.isHost && p.id !== room.players[0]?.id && (
                    <button
                      onClick={() => {
                        if (socket) socket.emit("make_host", { roomCode: room.roomCode, playerId: p.id });
                        setActiveSwitchPlayerId(null);
                      }}
                      style={{
                        padding: "6px",
                        fontSize: "0.75rem",
                        background: "rgba(16, 185, 129, 0.1)",
                        border: "1px solid rgb(16, 185, 129)",
                        borderRadius: "4px",
                        color: "hsl(142,75%,45%)",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {t("game.makeHost", "Make Host")}
                    </button>
                  )}
                  {p.id !== playerId && (
                    <button
                      onClick={() => {
                        if (socket) socket.emit("kick_player", { roomCode: room.roomCode, playerId: p.id });
                        setActiveSwitchPlayerId(null);
                      }}
                      style={{
                        padding: "6px",
                        fontSize: "0.75rem",
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgb(239, 68, 68)",
                        borderRadius: "4px",
                        color: "hsl(355,85%,65%)",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {t("game.kick", "Kick")}
                    </button>
                  )}
                </div>
              )}

              {/* Cancel Button */}
              <button
                onClick={() => setActiveSwitchPlayerId(null)}
                style={{
                  padding: "6px",
                  fontSize: "0.75rem",
                  background: "transparent",
                  border: "1px solid var(--border-default)",
                  borderRadius: "4px",
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                {t("profile.cancel", "Cancel")}
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  // Auto scroll chat to bottom
  const scrollToBottom = () => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    if (activeTab === "chat") {
      scrollToBottom();
    }
  }, [chatMessages, activeTab]);

  // Reset voted cards when active team or turn phase changes
  useEffect(() => {
    setVotedCardIds([]);
    setClueSelectedCardIds([]);
  }, [room.turnState?.activeTeam, room.turnState?.phase]);

  // ── #12 Camera Warp: trigger on lobby→playing transition ──
  useEffect(() => {
    if (room.phase === "playing" && prevPhase2Ref.current === "lobby") {
      setCameraWarpActive(true);
      setTimeout(() => setCameraWarpActive(false), 900);
    }
    prevPhase2Ref.current = room.phase;
  }, [room.phase]);

  // ── #6 Radar Ping + #10 Turn Handoff Wipe: trigger on team change ──
  useEffect(() => {
    const cur = room.turnState?.activeTeam ?? null;
    if (cur && prevActiveTeamRef.current && cur !== prevActiveTeamRef.current) {
      setShowRadarPing(false);
      requestAnimationFrame(() => setShowRadarPing(true));
      setTimeout(() => setShowRadarPing(false), 2000);
      setHandoffWipe({ from: typeColors[prevActiveTeamRef.current]?.border ?? "#888", to: typeColors[cur]?.border ?? "#888" });
      setTimeout(() => setHandoffWipe(null), 1400);
    }
    prevActiveTeamRef.current = cur;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.turnState?.activeTeam]);

  // ── #9 Ambient Particles ──
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const activeColor = room.turnState?.activeTeam
      ? (typeColors[room.turnState.activeTeam]?.border ?? "#E8A33D")
      : "#E8A33D";
    const W = canvas.width;
    const H = canvas.height;
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.8 + 0.4,
      speed: Math.random() * 0.35 + 0.15,
      alpha: Math.random() * 0.3 + 0.08,
      drift: (Math.random() - 0.5) * 0.4,
    }));
    const hex = activeColor.replace("#", "");
    const cr = parseInt(hex.substring(0, 2), 16);
    const cg = parseInt(hex.substring(2, 4), 16);
    const cb = parseInt(hex.substring(4, 6), 16);
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${p.alpha})`;
        ctx.fill();
        p.y -= p.speed; p.x += p.drift;
        if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; }
        if (p.x < -4) p.x = W + 4;
        if (p.x > W + 4) p.x = -4;
      });
      particleRafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { if (particleRafRef.current) cancelAnimationFrame(particleRafRef.current); };
  }, [room.turnState?.activeTeam]);

  // ── #7 Typewriter Clue Reveal ──
  useEffect(() => {
    const word = room.turnState?.clueWord;
    if (!word || room.turnState?.phase !== "guessing") {
      setTypewriterText(""); setTypewriterCursor(false); return;
    }
    setTypewriterText(""); setTypewriterCursor(true);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTypewriterText(word.slice(0, i));
      if (i >= word.length) { clearInterval(iv); setTimeout(() => setTypewriterCursor(false), 1100); }
    }, 62);
    return () => clearInterval(iv);
  }, [room.turnState?.clueWord, room.turnState?.phase]);

  // Timer Reset on Turn Number update
  useEffect(() => {
    if (room.phase !== "playing" || !room.turnState) return;

    let limit = 120;
    if (room.gameMode === "coop") {
      limit = 120;
    } else {
      const mode = room.settings.timerMode || "off";
      if (mode === "off") return;

      let spyTime = 90;
      let opTime = 60;
      let extraTime = 60;

      if (mode === "fast") {
        spyTime = 90;
        opTime = 60;
        extraTime = 60;
      } else if (mode === "long") {
        spyTime = 180;
        opTime = 120;
        extraTime = 120;
      } else if (mode === "custom") {
        spyTime = room.settings.spymasterTimerSeconds !== undefined ? room.settings.spymasterTimerSeconds : 90;
        extraTime = room.settings.firstClueExtraSeconds !== undefined ? room.settings.firstClueExtraSeconds : 60;
        opTime = room.settings.operativeTimerSeconds !== undefined ? room.settings.operativeTimerSeconds : 60;
      }

      if (room.turnState.phase === "giving_clue") {
        limit = spyTime;
        if (room.turnState.turnNumber === 1) {
          limit += extraTime;
        }
      } else {
        limit = opTime;
      }
    }

    setTimerCount(limit);
  }, [room.turnState?.turnNumber, room.turnState?.phase, room.phase, room.gameMode, room.settings.timerMode, room.settings.spymasterTimerSeconds, room.settings.firstClueExtraSeconds, room.settings.operativeTimerSeconds]);

  // Turn timer countdown loop
  useEffect(() => {
    if (room.phase !== "playing" || !room.turnState) return;

    let enabled = false;
    let limit = 120;
    if (room.gameMode === "coop") {
      enabled = true;
      limit = 120;
    } else {
      const mode = room.settings.timerMode || "off";
      if (mode !== "off") {
        enabled = true;

        let spyTime = 90;
        let opTime = 60;
        let extraTime = 60;

        if (mode === "fast") {
          spyTime = 90;
          opTime = 60;
          extraTime = 60;
        } else if (mode === "long") {
          spyTime = 180;
          opTime = 120;
          extraTime = 120;
        } else if (mode === "custom") {
          spyTime = room.settings.spymasterTimerSeconds !== undefined ? room.settings.spymasterTimerSeconds : 90;
          extraTime = room.settings.firstClueExtraSeconds !== undefined ? room.settings.firstClueExtraSeconds : 60;
          opTime = room.settings.operativeTimerSeconds !== undefined ? room.settings.operativeTimerSeconds : 60;
        }

        if (room.turnState.phase === "giving_clue") {
          limit = spyTime;
          if (room.turnState.turnNumber === 1) {
            limit += extraTime;
          }
        } else {
          limit = opTime;
        }
      }
    }

    if (!enabled) return;

    const interval = setInterval(() => {
      setTimerCount((prev) => {
        const isManual = room.settings.timerAction === "manual";
        if (isManual) {
          return prev - 1;
        }

        if (prev <= 1) {
          // In coop/duet mode, ANY guessing-team member (no role needed) can auto-end turn
          const isCoopActiveOp =
            room.gameMode === "coop" &&
            localPlayer?.team === (room.turnState?.activeTeam === "red" ? "blue" : "red") &&
            room.turnState?.phase === "guessing";

          const isActiveOp =
            isCoopActiveOp ||
            (room.gameMode !== "coop" &&
              localPlayer?.team === room.turnState?.activeTeam &&
              localPlayer?.role === "operative" &&
              room.turnState?.phase === "guessing");

          const isActiveSpy =
            localPlayer?.team === room.turnState?.activeTeam &&
            localPlayer?.role === "spymaster" &&
            room.turnState?.phase === "giving_clue";

          if (socket) {
            if (isActiveOp) {
              socket.emit("end_turn", { roomCode: room.roomCode, playerId });
            } else if (isActiveSpy) {
              socket.emit("give_clue", { roomCode: room.roomCode, playerId, word: "pass", count: 0 });
            }
          }
          return limit;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [room.gameMode, room.phase, room.turnState, socket, localPlayer, room.roomCode, playerId, room.settings.timerMode, room.settings.spymasterTimerSeconds, room.settings.firstClueExtraSeconds, room.settings.operativeTimerSeconds, room.settings.timerAction]);



  // Auto scroll log to bottom
  useEffect(() => {
    if (activeTab === "log" && logScrollContainerRef.current) {
      logScrollContainerRef.current.scrollTo({
        top: logScrollContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [gameLog, activeTab]);

  // Disable body scroll when Search Meaning Modal is open
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "unset";
    }
    return () => {
      document.body.style.overflowY = "unset";
    };
  }, [isSearchOpen]);

  // Synchronize room language setting when navbar language is selected
  useEffect(() => {
    if (!socket || !room || !isHost) return;
    if (room.language !== i18n.language) {
      socket.emit("update_settings", {
        roomCode: room.roomCode,
        settings: { language: i18n.language },
      });
    }
  }, [i18n.language, isHost, socket, room?.roomCode, room?.language]);

  // Synchronize chat events and history based on team and role memberships
  useEffect(() => {
    if (!socket) return;

    setChatMessages([]);

    socket.on("chat_history", ({ messages }) => {
      setChatMessages(messages);
    });

    socket.on("chat_message", (message: ChatMessage) => {
      setChatMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("chat_history");
      socket.off("chat_message");
    };
  }, [socket, localPlayer?.team, localPlayer?.role]);

  // Synchronize game log and log entries
  useEffect(() => {
    if (!socket) return;

    socket.on("game_log", ({ log }) => {
      setGameLog(log);
    });

    socket.on("log_entry", (entry: GameLogEntry) => {
      setGameLog((prev) => [...prev, entry]);
      if (activeTab !== "log") {
        setUnreadLog(true);
      }
    });

    return () => {
      socket.off("game_log");
      socket.off("log_entry");
    };
  }, [socket, activeTab]);

  // Listen to screen reactions and spymaster selections broadcast from server
  useEffect(() => {
    if (!socket) return;

    const handleReaction = ({ playerId: senderId, emoji }: { playerId: string; emoji: string }) => {
      const sender = roomPlayersRef.current.find((p) => p.id === senderId);
      const senderName = sender ? sender.displayName : "Spymaster";
      const newRx = {
        id: `rx_${Math.random().toString(36).substring(2, 11)}`,
        emoji,
        senderName,
      };

      setReactions((prev) => [...prev, newRx]);

      if (soundEnabledRef.current) {
        playReactionSound(emoji);
      }

      // Remove after 2 seconds animation ends
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== newRx.id));
      }, 2000);
    };

    const handleSpymasterSelectedCard = () => {
      playClueSelectionSound();
    };

    const handleGameStarted = () => {
      // Allow DOM to mount the playing cards first
      setTimeout(() => {
        setIsDealingAnimationActive(true);
        const cardCount = roomBoardRef.current && roomBoardRef.current.length ? roomBoardRef.current.length : 25;
        playCardDealCascade(cardCount);
      }, 50);

      setTimeout(() => {
        setIsDealingAnimationActive(false);
      }, 2550);
    };

    socket.on("reaction_received", handleReaction);
    socket.on("spymaster_selected_card", handleSpymasterSelectedCard);
    socket.on("game_started", handleGameStarted);

    return () => {
      socket.off("reaction_received", handleReaction);
      socket.off("spymaster_selected_card", handleSpymasterSelectedCard);
      socket.off("game_started", handleGameStarted);
    };
  }, [socket]);

  // Cooldown countdown timer effect
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const t = setTimeout(() => setCooldownRemaining(cooldownRemaining - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldownRemaining]);

  // Inactivity tracking (Auto AFK)
  useEffect(() => {
    if (!socket || !localPlayer) return;

    let inactivityTimeout: NodeJS.Timeout;
    const timeoutMins = room.settings.afkTimeoutMinutes || 5;
    const INACTIVITY_LIMIT_MS = timeoutMins * 60 * 1000;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimeout);

      // Auto-restore status to ACTIVE if current status is AFK and user interacts
      if (localPlayer?.status === "AFK") {
        socket.emit("update_status", {
          roomCode: room.roomCode,
          playerId,
          status: "ACTIVE",
        });
      }

      inactivityTimeout = setTimeout(() => {
        if (localPlayer?.status !== "AFK") {
          socket.emit("update_status", {
            roomCode: room.roomCode,
            playerId,
            status: "AFK",
          });
        }
      }, INACTIVITY_LIMIT_MS);
    };

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach((evt) => {
      document.addEventListener(evt, resetInactivityTimer);
    });

    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimeout);
      events.forEach((evt) => {
        document.removeEventListener(evt, resetInactivityTimer);
      });
    };
  }, [socket, localPlayer, room.roomCode, playerId, room.settings.afkTimeoutMinutes]);

  // Auto-scroll chat to bottom on new messages (disabled in lobby)
  useEffect(() => {
    if (room.phase !== "lobby" && chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight;
    }
  }, [chatMessages, room.phase]);

  // Auto-scroll game log to bottom on new events (disabled in lobby)
  useEffect(() => {
    if (room.phase !== "lobby" && logScrollContainerRef.current) {
      logScrollContainerRef.current.scrollTop = logScrollContainerRef.current.scrollHeight;
    }
  }, [gameLog, room.phase]);



  // Set peekKey defaults based on role shifts (Spymaster defaults to ON, Operative defaults to OFF)
  useEffect(() => {
    if (localPlayer?.role === "spymaster") {
      setPeekKey(true);
    } else {
      setPeekKey(false);
    }
  }, [localPlayer?.role]);

  const handleJoinTeamRole = (
    team: TeamIdentifier | null,
    role: PlayerRole | null,
    targetPlayerId?: string,
    force = false
  ) => {
    if (!force && role === "spymaster" && team) {
      const targetId = targetPlayerId || playerId;
      const existingSpy = room.players.find(
        (p) => p.team === team && p.role === "spymaster" && p.id !== targetId
      );
      if (existingSpy) {
        setSpyWarningConfig({
          spyName: existingSpy.displayName,
          team,
          role,
          targetPlayerId: targetId,
        });
        return;
      }
    }

    if (socket) {
      socket.emit("update_player", {
        roomCode: room.roomCode,
        playerId: targetPlayerId || playerId,
        team,
        role,
      });
    }
  };

  const handleStartGame = () => {
    if (room.phase === "playing") {
      setGlobalConfirm({
        title: "Reset Game?",
        message: "Warning! This will wipe the grid and start a new game immediately. All players will be moved to Spectators. Proceed?",
        onConfirm: () => {
          if (socket) socket.emit("start_game", { roomCode: room.roomCode });
        }
      });
    } else if (room.phase === "ended") {
      setGlobalConfirm({
        title: "Play Again?",
        message: "The grid will be reshuffled and a new game will start immediately. All players will be moved to Spectators. Proceed?",
        onConfirm: () => {
          if (socket) socket.emit("start_game", { roomCode: room.roomCode });
        }
      });
    } else {
      if (socket) socket.emit("start_game", { roomCode: room.roomCode });
    }
  };

  const handleReturnToLobby = () => {
    const msg = room.phase === "playing"
      ? "Warning! Returning to the lobby will end the currently running game. Do you want to abort the match?"
      : "Return all players to the lobby to prepare for a new match? Action cannot be undone.";
    setGlobalConfirm({
      title: "Return to Lobby?",
      message: msg,
      onConfirm: () => {
        if (socket) socket.emit("reset_to_lobby", { roomCode: room.roomCode });
      }
    });
  };

  const runSearch = async (query: string) => {
    setSearchLoading(true);
    setSearchError(null);
    setSearchResults(null);

    try {
      const res = await fetch(`/api/search/meaning?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success && data.result) {
        setSearchResults(data.result);
      } else {
        setSearchError(data.error || "No results found.");
      }
    } catch (err) {
      setSearchError("Failed to fetch meaning. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      runSearch(searchQuery);
    }
  };

  const handleSuggestionClick = (word: string) => {
    setSearchQuery(word);
    runSearch(word);
  };

  const handleGiveClue = (e: React.FormEvent) => {
    e.preventDefault();
    setClueError(null);

    const trimmed = clueWord.trim();
    if (!trimmed) {
      setClueError("Clue word cannot be empty");
      return;
    }
    if (trimmed.includes(" ")) {
      setClueError("Clue must be a single word");
      return;
    }

    if (socket) {
      socket.emit("give_clue", {
        roomCode: room.roomCode,
        playerId,
        clueWord: trimmed,
        clueCount,
      });
    }
    setClueWord("");
  };

  const handleCardClick = (cardId: number) => {
    if (!room.turnState || room.phase !== "playing") return;

    // 1. Spymaster / Duet clue-giver card selection
    const isActiveSpymaster =
      localPlayer?.team === room.turnState.activeTeam &&
      (localPlayer?.role === "spymaster" || room.gameMode === "coop") &&
      room.turnState.phase === "giving_clue";

    if (isActiveSpymaster) {
      const card = room.board.find((c) => c.id === cardId);
      // In coop: active team selects from the OPPONENT's cards they can see (cross-team clue)
      // In classic: spymaster selects from their own team's cards
      const targetType =
        room.gameMode === "coop"
          ? (localPlayer?.team === "red" ? "blue" : "red")
          : localPlayer?.team;
      if (card && card.type === targetType) {
        playClueSelectionSound();
        if (socket) {
          socket.emit("spymaster_select_card", { roomCode: room.roomCode, cardId });
        }
        setClueSelectedCardIds((prev) => {
          const exists = prev.includes(cardId);
          const newIds = exists
            ? prev.filter((id) => id !== cardId)
            : [...prev, cardId];
          setClueCount(newIds.length);
          return newIds;
        });
      }
      return;
    }

    // 2. Operative voting selection
    const isCoopActiveOp =
      room.gameMode === "coop" &&
      localPlayer?.team === (room.turnState.activeTeam === "red" ? "blue" : "red") &&
      room.turnState.phase === "guessing";

    const isActiveOperative =
      isCoopActiveOp ||
      (room.gameMode !== "coop" &&
        localPlayer?.team === room.turnState.activeTeam &&
        localPlayer?.role === "operative" &&
        room.turnState.phase === "guessing");

    if (!isActiveOperative) return;

    // Toggle selected card
    const nextIds = [...votedCardIds];
    const index = nextIds.indexOf(cardId);
    if (index > -1) {
      nextIds.splice(index, 1);
    } else {
      nextIds.push(cardId);
    }
    setVotedCardIds(nextIds);
    if (socket) {
      socket.emit("vote_card", {
        roomCode: room.roomCode,
        playerId,
        cardId,
      });
    }
  };

  const handleEndTurn = () => {
    if (socket) {
      socket.emit("end_turn", { roomCode: room.roomCode, playerId });
    }
  };

  const handleUpdateEliminationRule = (rule: "game_end" | "continue") => {
    if (socket) {
      socket.emit("update_settings", {
        roomCode: room.roomCode,
        settings: { eliminationRule: rule },
      });
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;

    socket.emit("send_chat", {
      roomCode: room.roomCode,
      playerId,
      content: chatInput.trim(),
    });
    setChatInput("");
  };

  const triggerReaction = (emoji: string) => {
    if (cooldownRemaining > 0 || !socket) return;

    socket.emit("send_reaction", {
      roomCode: room.roomCode,
      playerId,
      emoji,
    });
    setCooldownRemaining(10);
  };

  const activeTeams = Object.keys(room.teams) as TeamIdentifier[];

  const formatTeamName = (team: string) => {
    return team.charAt(0).toUpperCase() + team.slice(1);
  };

  const isSpymaster = localPlayer?.role === "spymaster";
  const isSpectator = !localPlayer?.team || (!localPlayer?.role && room.gameMode !== "coop");
  const isGameEnded = room.phase === "ended";

  const canSeeKey =
    (room.gameMode !== "coop" && (
      (isSpymaster && peekKey) ||
      (isSpectator && peekKey) ||
      (isGameEnded && peekKey)
    )) ||
    (room.gameMode === "coop" && !!localPlayer?.team) ||
    (room.phase === "ended");

  const getChatHeader = () => {
    if (!localPlayer?.team) {
      return { title: "Spectator View", badgeColor: "var(--color-text-muted)" };
    }
    // In Duet/Coop mode players have null role but belong to a team
    if (room.gameMode === "coop" || !localPlayer?.role) {
      const colorVal = typeColors[localPlayer.team]?.light || "var(--color-text)";
      return { title: `${formatTeamName(localPlayer.team)} Team Chat`, badgeColor: colorVal };
    }
    if (localPlayer.role === "spymaster") {
      return { title: "Rival Spymasters Chat", badgeColor: "var(--color-assassin)" };
    }
    const colorVal = typeColors[localPlayer.team]?.light || "var(--color-text)";
    return { title: `${formatTeamName(localPlayer.team)} Team Chat`, badgeColor: colorVal };
  };

  const getStatusStyle = (status: string) => {
    if (status === "ACTIVE" || !status) {
      return {
        bg: "var(--status-active-bg)",
        text: "var(--status-active-text)",
      };
    }
    return {
      bg: "var(--status-afk-bg)",
      text: "var(--status-afk-text)",
    };
  };

  // Color code individual log entry items
  const getLogEntryStyle = (entry: GameLogEntry) => {
    switch (entry.type) {
      case "game_started":
        return {
          borderLeft: "4px solid var(--color-text-muted)",
          background: "rgba(255,255,255,0.02)",
          fontStyle: "italic",
        };
      case "clue":
        return {
          borderLeft: `4px solid ${entry.team ? typeColors[entry.team]!.border : "var(--color-border)"}`,
          background: "rgba(168,85,247,0.03)",
        };
      case "reveal":
        return {
          borderLeft: `4px solid ${entry.team ? typeColors[entry.team]!.border : "var(--color-border)"}`,
          background: "rgba(255,255,255,0.02)",
        };
      case "turn_transition":
        return {
          borderLeft: `4px solid ${entry.team ? typeColors[entry.team]!.border : "var(--color-border)"}`,
          background: "rgba(0,0,0,0.2)",
          fontWeight: 600,
        };
      case "team_eliminated":
        return {
          borderLeft: "4px solid hsl(355,85%,58%)",
          background: "rgba(239,68,68,0.08)",
          color: "hsl(355,85%,80%)",
        };
      case "game_ended":
        return {
          borderLeft: "4px solid hsl(45,85%,50%)",
          background: "rgba(234,179,8,0.08)",
          boxShadow: "0 0 12px rgba(234,179,8,0.1)",
        };
      case "role_change":
        return {
          borderLeft: "4px solid var(--accent)",
          background: "rgba(232, 163, 61, 0.05)",
          fontStyle: "italic",
        };
      default:
        return {};
    }
  };

  const chatHeader = getChatHeader();
  // In Duet/Coop mode, players have null role but should still be able to chat
  const chatDisabled = !localPlayer?.team || (!localPlayer?.role && room.gameMode !== "coop");

  const handleTabChange = (tab: "chat" | "log") => {
    setActiveTab(tab);
    if (tab === "log") {
      setUnreadLog(false);
    }
  };

  const renderChatAndLogPanel = () => {
    return (
      <div
        className="scale-up"
        style={{
          position: "fixed",
          right: "clamp(12px, 3vw, 24px)",
          bottom: "92px",
          width: "min(380px, calc(100vw - 32px))",
          height: "min(520px, calc(100vh - 140px))",
          background: "var(--bg-surface-raised)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          padding: "16px",
          textAlign: "left",
          zIndex: 9999,
        }}
      >
        {/* Header row with Tab navigation, minimize button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
            paddingBottom: "4px",
            userSelect: "none",
          }}
        >
          <div style={{ display: "flex", gap: "16px" }}>
            <button
              onClick={() => handleTabChange("chat")}
              style={{
                background: "none",
                border: "none",
                borderBottom: activeTab === "chat" ? "3px solid var(--accent)" : "3px solid transparent",
                color: activeTab === "chat" ? "var(--text-primary)" : "var(--color-text-muted)",
                padding: "8px 4px",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "var(--font-display)",
              }}
            >
              Chat
            </button>
            <button
              onClick={() => handleTabChange("log")}
              style={{
                background: "none",
                border: "none",
                borderBottom: activeTab === "log" ? "3px solid var(--accent)" : "3px solid transparent",
                color: activeTab === "log" ? "var(--text-primary)" : "var(--color-text-muted)",
                padding: "8px 4px",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "var(--font-display)",
              }}
            >
              Game Log
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <button
              onClick={() => setIsChatFloatingOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-text-muted)",
                fontSize: "1.2rem",
                cursor: "pointer",
                padding: "4px 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.2s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseOut={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
              title="Minimize"
            >
              —
            </button>
          </div>
        </div>

        {/* TAB CONTENT: Chat Box */}
        {activeTab === "chat" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "calc(100% - 44px)" }}>
            {!user ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "20px", textAlign: "center" }}>
                <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                  Chat Locked
                </h4>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.4, maxWidth: "220px" }}>
                  Real-time chat is gated for Guest accounts. Sign in to chat with your team!
                </p>
                <button
                  onClick={() => onOpenAuth()}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "var(--radius-sm)",
                    border: "none",
                    background: "var(--accent)",
                    color: "var(--accent-text-on)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(232, 163, 61, 0.25)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "var(--accent-hover)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "var(--accent)";
                  }}
                >
                  Sign In / Sign Up
                </button>
              </div>
            ) : (
              <>
                {/* Chat header channel name */}
                <div
                  style={{
                    borderBottom: `2px solid ${chatHeader.badgeColor}`,
                    paddingBottom: "8px",
                    marginBottom: "10px",
                  }}
                >
                  <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", fontWeight: 600 }}>
                    Channel: {chatHeader.title}
                  </span>
                </div>

                {/* Messages feed */}
                <div
                  ref={chatScrollContainerRef}
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    paddingRight: "4px",
                    marginBottom: "12px",
                  }}
                >
                  {chatMessages.map((msg) => (
                    <ChatMessageBubble key={msg.id} msg={msg} playerId={playerId} />
                  ))}

                  {chatDisabled && (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "20px" }}>
                      Join a team and role to participate in the real-time chat.
                    </div>
                  )}

                  {(!chatDisabled && chatMessages.length === 0) && (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: "0.9rem", fontStyle: "italic" }}>
                      No messages yet. Send a whisper!
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Send input */}
                {!chatDisabled && (
                  <form onSubmit={handleSendChat} style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-default)",
                        background: "var(--bg-surface-raised)",
                        color: "var(--text-primary)",
                        fontSize: "0.9rem",
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: "10px 18px",
                        borderRadius: "var(--radius-sm)",
                        border: "none",
                        background: "var(--accent)",
                        color: "var(--accent-text-on)",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        transition: "all 0.15s ease",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = "var(--accent-hover)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = "var(--accent)";
                      }}
                    >
                      Send
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB CONTENT: Game Log */}
        {activeTab === "log" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "calc(100% - 44px)" }}>
            {/* Log events list */}
            <div
              ref={logScrollContainerRef}
              style={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                paddingRight: "4px",
                marginBottom: "12px",
              }}
            >
              {gameLog.filter((entry) => entry.type === "clue" || entry.type === "reveal" || entry.type === "role_change").map((entry) => {
                const timeStr = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const styles = getLogEntryStyle(entry);
                const isReveal = entry.type === "reveal";
                const isRoleChange = entry.type === "role_change";

                return (
                  <div
                    key={entry.id}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.85rem",
                      border: "1px solid var(--border-default)",
                      background: "var(--bg-surface-raised)",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                      ...styles,
                    }}
                  >
                    <span style={{ opacity: 0.5, fontSize: "0.7rem", fontFamily: "var(--font-mono)" }}>
                      {timeStr}
                    </span>

                    {isReveal ? (
                      <>
                        <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                          {entry.details?.playerDisplayName || "Player"}
                        </span>
                        <span style={{ color: "var(--color-text-muted)", marginLeft: "4px", marginRight: "4px" }}>
                          :
                        </span>
                        <span
                          style={{
                            background: typeColors[entry.details?.cardType || "unknown"]?.bg || "rgba(255,255,255,0.05)",
                            border: `1px solid ${typeColors[entry.details?.cardType || "unknown"]?.border || "rgba(255,255,255,0.15)"}`,
                            color: typeColors[entry.details?.cardType || "unknown"]?.text || "#fff",
                            borderRadius: "3px",
                            padding: "2px 6px",
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {entry.details?.cardWord || "Word"}
                        </span>
                      </>
                    ) : isRoleChange ? (
                      <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                        {entry.message}
                      </span>
                    ) : (
                      <>
                        <span style={{ color: typeColors[entry.team || "unknown"]?.light || "#fff", fontWeight: 700 }}>
                          {entry.details?.spymasterName || "Spymaster"}
                        </span>
                        <span style={{ color: "var(--color-text-muted)" }}>:</span>
                        <span style={{ color: "var(--text-primary)", fontWeight: 700, background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: "4px" }}>
                          {entry.details?.word || "Word"}{" "}
                          {entry.details?.count !== undefined
                            ? entry.details.count === -1
                              ? "∞"
                              : entry.details.count
                            : ""}
                        </span>
                      </>
                    )}
                  </div>
                );
              })}

              {gameLog.length === 0 && (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: "0.9rem", fontStyle: "italic", textAlign: "center" }}>
                  Log is empty. Start the game to begin recording events!
                </div>
              )}

              <div ref={logEndRef} />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCustomReaction = (type: string, isButton = false) => {
    const size = isButton ? "16px" : "32px";
    const padding = isButton ? "8px 12px" : "18px";
    const borderRadius = isButton ? "var(--radius-sm)" : "50%";
    
    switch (type) {
      case "facepalm":
        return (
          <div
            style={{
              padding,
              borderRadius,
              background: "linear-gradient(135deg, hsl(355, 75%, 20%) 0%, hsl(355, 80%, 35%) 100%)",
              border: "1.5px solid hsl(355, 85%, 55%)",
              color: "#fff",
              boxShadow: isButton ? "none" : "0 8px 30px rgba(239, 68, 68, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            {isButton && (
              <span style={{ fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Misplay
              </span>
            )}
          </div>
        );
      case "fire":
        return (
          <div
            style={{
              padding,
              borderRadius,
              background: "linear-gradient(135deg, hsl(15, 85%, 25%) 0%, hsl(25, 90%, 45%) 100%)",
              border: "1.5px solid hsl(25, 100%, 55%)",
              color: "#fff",
              boxShadow: isButton ? "none" : "0 8px 30px rgba(249, 115, 22, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/>
            </svg>
            {isButton && (
              <span style={{ fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Firey
              </span>
            )}
          </div>
        );
      case "skull":
        return (
          <div
            style={{
              padding,
              borderRadius,
              background: "linear-gradient(135deg, hsl(270, 75%, 15%) 0%, hsl(275, 80%, 30%) 100%)",
              border: "1.5px solid hsl(270, 90%, 60%)",
              color: "#fff",
              boxShadow: isButton ? "none" : "0 8px 30px rgba(168, 85, 247, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2a5 5 0 0 0-5 5v3a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V7a5 5 0 0 0-5-5z"/>
              <path d="M9 17h6M10 20h4"/>
              <circle cx="10" cy="8" r="1" fill="currentColor"/>
              <circle cx="14" cy="8" r="1" fill="currentColor"/>
            </svg>
            {isButton && (
              <span style={{ fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Deadly
              </span>
            )}
          </div>
        );
      case "party":
        return (
          <div
            style={{
              padding,
              borderRadius,
              background: "linear-gradient(135deg, hsl(45, 85%, 25%) 0%, hsl(45, 90%, 45%) 100%)",
              border: "1.5px solid hsl(45, 100%, 55%)",
              color: "#fff",
              boxShadow: isButton ? "none" : "0 8px 30px rgba(234, 179, 8, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            {isButton && (
              <span style={{ fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Genius
              </span>
            )}
          </div>
        );
      case "clap":
        return (
          <div
            style={{
              padding,
              borderRadius,
              background: "linear-gradient(135deg, hsl(142, 75%, 15%) 0%, hsl(142, 80%, 30%) 100%)",
              border: "1.5px solid hsl(142, 85%, 50%)",
              color: "#fff",
              boxShadow: isButton ? "none" : "0 8px 30px rgba(34, 197, 94, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
            </svg>
            {isButton && (
              <span style={{ fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Bravo
              </span>
            )}
          </div>
        );
      case "heart":
        return (
          <div
            style={{
              padding,
              borderRadius,
              background: "linear-gradient(135deg, hsl(330, 75%, 20%) 0%, hsl(330, 80%, 35%) 100%)",
              border: "1.5px solid hsl(330, 85%, 55%)",
              color: "#fff",
              boxShadow: isButton ? "none" : "0 8px 30px rgba(236, 72, 153, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {isButton && (
              <span style={{ fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Heart
              </span>
            )}
          </div>
        );
      default:
        return <span>{type}</span>;
    }
  };

  const playReactionSound = (type: string) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      
      if (type === "facepalm") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.6);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === "fire") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === "skull") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.setValueAtTime(90, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
      } else if (type === "party") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.setValueAtTime(0.12, now + 0.1);
        gain.gain.setValueAtTime(0.12, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === "clap") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(500, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.setValueAtTime(0.15, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === "heart") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.setValueAtTime(70, now + 0.12);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.10);
        gain.gain.setValueAtTime(0.3, now + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      console.warn("AudioContext block:", e);
    }
  };

  return (
    <div className={`fade-in ${isAssassinShake ? "assassin-shake-active" : ""}`} style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(8px, 3vw, 20px)" }}>
      <style>{`
        @keyframes emoji-float-up {
          0% {
            transform: translate(-50%, -20%) scale(0.4);
            opacity: 0;
          }
          15% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.95;
          }
          85% {
            transform: translate(-50%, -52%) scale(1.2);
            opacity: 0.95;
          }
          100% {
            transform: translate(-50%, -85%) scale(0.9);
            opacity: 0;
          }
        }
        @keyframes card-flip {
          0% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(90deg) scale(1.03);
          }
          100% {
            transform: rotateY(0deg);
          }
        }
        .card-flipped-active {
          animation: card-flip 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }
        @keyframes screen-shake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          10% { transform: translate(-4px, -2px) rotate(-0.5deg); }
          20% { transform: translate(-3px, 0px) rotate(0.5deg); }
          30% { transform: translate(0px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(0.5deg); }
          50% { transform: translate(-1px, 2px) rotate(-0.5deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(2px, 1px) rotate(-0.5deg); }
          80% { transform: translate(-1px, -1px) rotate(0.5deg); }
          90% { transform: translate(2px, 2px) rotate(0deg); }
        }
        .assassin-shake-active {
          animation: screen-shake 0.8s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes deal-card-fly {
          0% {
            transform: translate(var(--start-x, -350px), var(--start-y, 150px)) rotate(var(--start-rot, -35deg)) scale(0);
            opacity: 0;
            box-shadow: 0 0 0px transparent;
          }
          40% {
            opacity: 1;
            box-shadow: 0 0 25px var(--accent);
          }
          70% {
            box-shadow: 0 0 15px var(--accent);
          }
          100% {
            transform: translate(0, 0) rotate(0) scale(1);
            opacity: 1;
            box-shadow: 0 4px 6px rgba(0,0,0,0.15);
          }
        }
        @keyframes sparks-burst {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes dossier-float {
          0%, 100% { transform: translateY(0) rotate(-10deg); }
          50% { transform: translateY(-10px) rotate(-8deg); }
        }
        @keyframes dossier-fade-out {
          0% { opacity: 1; transform: scale(1) rotate(-10deg); }
          100% { opacity: 0; transform: scale(0.8) rotate(-20deg) translateX(-100px); }
        }
        @keyframes sparks-rotate {
          0% { transform: rotate(0deg); opacity: 0.3; }
          50% { opacity: 0.8; }
          100% { transform: rotate(360deg); opacity: 0.3; }
        }

        /* ─── Custom Mind-Boggling Animations ─── */
        @keyframes cyber-beam {
          0% {
            stroke-dasharray: 150 1000;
            stroke-dashoffset: 800;
            opacity: 0;
          }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% {
            stroke-dasharray: 150 1000;
            stroke-dashoffset: -150;
            opacity: 0;
          }
        }
        .beam-line {
          animation: cyber-beam 1.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        /* Assassin Flip Override */
        .assassin-flip {
          animation: assassin-implode 0.9s cubic-bezier(0.25, 0.8, 0.25, 1.3) forwards !important;
        }
        @keyframes assassin-implode {
          0% { transform: scale(1) rotateY(0); }
          30% { transform: scale(0.6) rotateY(90deg) rotateZ(-15deg); filter: brightness(0.2) drop-shadow(0 0 0px transparent); }
          100% { transform: scale(1.08) rotateY(180deg); filter: brightness(1) drop-shadow(0 0 25px #ff3b30); }
        }

        /* Shockwave Reactivity */
        .shockwave-push {
          animation: shockwave-bounce 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        @keyframes shockwave-bounce {
          0% { transform: translate(0, 0); }
          20% { transform: translate(var(--push-x, 0px), var(--push-y, 0px)) scale(0.94); filter: brightness(0.85); }
          100% { transform: translate(0, 0) scale(1); filter: brightness(1); }
        }

        /* Voter floating */
        @keyframes voter-badge-entry {
          0% { transform: scale(0) translateY(10px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes avatar-float {
          0% { transform: translateY(0) rotate(-2deg); }
          100% { transform: translateY(-4px) rotate(2deg); }
        }

        /* Victory Grid Style */
        .grid-victory-active {
          animation: grid-victory-tilt 1s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
          box-shadow: 0 0 40px rgba(232, 163, 61, 0.15) !important;
        }
        @keyframes grid-victory-tilt {
          0% { transform: perspective(1200px) rotateX(0deg) scale(1); }
          100% { transform: perspective(1200px) rotateX(10deg) translateY(-5px) scale(0.98); }
        }

        /* Defeat Grid Style */
        .grid-defeat-active {
          animation: grid-defeat-tilt 1s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
          opacity: 0.65;
          filter: grayscale(0.4) brightness(0.8);
        }
        @keyframes grid-defeat-tilt {
          0% { transform: perspective(1200px) rotateX(0deg) translateY(0) scale(1); }
          100% { transform: perspective(1200px) rotateX(-12deg) translateY(10px) scale(0.95); }
        }
        /* ─── Phase 2 Animations ─── */
        @keyframes camera-warp-in {
          0%   { filter: blur(14px) brightness(0.2); transform: perspective(900px) rotateX(-18deg) scale(1.12); opacity:0; }
          60%  { filter: blur(2px) brightness(1.1); transform: perspective(900px) rotateX(3deg) scale(1.02); opacity:1; }
          100% { filter: none; transform: perspective(900px) rotateX(0deg) scale(1); opacity:1; }
        }
        .camera-warp-active { animation: camera-warp-in 0.85s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
        @keyframes radar-sweep {
          0%   { transform: scale(0); opacity: 0.9; }
          70%  { opacity: 0.45; }
          100% { transform: scale(4.5); opacity: 0; }
        }
        .radar-ring {
          pointer-events: none; position: absolute; border-radius: 50%;
          animation: radar-sweep 1.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          z-index: 30;
        }
        @keyframes handoff-wipe {
          0%   { clip-path: inset(0 100% 0 0); opacity: 0.72; }
          55%  { clip-path: inset(0 0% 0 0);   opacity: 0.55; }
          100% { clip-path: inset(0 0% 0 100%); opacity: 0; }
        }
        .turn-handoff-overlay { animation: handoff-wipe 1.3s cubic-bezier(0.76, 0, 0.24, 1) forwards; }
        @keyframes cursor-blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
        .clue-cursor {
          display:inline-block; width:3px; height:0.9em;
          background:currentColor; margin-left:3px;
          vertical-align:middle; border-radius:1px;
          animation: cursor-blink 0.75s step-end infinite;
        }
        @keyframes danger-pulse-slow { 0%,100%{transform:scale(1);box-shadow:0 0 0 transparent;} 50%{transform:scale(1.035);box-shadow:0 0 14px hsl(355,85%,58%);} }
        @keyframes danger-pulse-fast { 0%,100%{transform:scale(1);box-shadow:0 0 0 transparent;} 50%{transform:scale(1.065);box-shadow:0 0 22px hsl(355,85%,58%);} }
        .timer-danger-slow   { animation: danger-pulse-slow 1.2s ease-in-out infinite; }
        .timer-danger-medium { animation: danger-pulse-slow 0.7s ease-in-out infinite; }
        .timer-danger-fast   { animation: danger-pulse-fast 0.38s ease-in-out infinite; }
        .score-liquid-fill   { transition: height 0.7s cubic-bezier(0.68,-0.55,0.265,1.55); }
      `}</style>

      {/* ─── Screen Reactions Overlay ─── */}
      {createPortal(
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            pointerEvents: "none",
            zIndex: 9999,
            overflow: "hidden",
          }}
        >
          {reactions.map((rx) => (
            <div
              key={rx.id}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                animation: "emoji-float-up 2s ease-out forwards",
              }}
            >
              {renderCustomReaction(rx.emoji, false)}
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "#fff",
                  background: "rgba(0,0,0,0.7)",
                  padding: "6px 18px",
                  borderRadius: "20px",
                  marginTop: "12px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                }}
              >
                {rx.senderName}
              </span>
            </div>
          ))}
        </div>,
        document.body
      )}

      {/* ─── Room Header ─── */}
      <div
        className="game-room-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px",
          background: "var(--color-surface)",
          padding: "20px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div style={{ textAlign: "left" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, margin: 0 }}>
            Room: <span style={{ color: "var(--accent)" }}>{room.roomCode}</span>
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", margin: "4px 0 0 0" }}>
            {room.teamCount} Teams Preset · {cols}x{rows} Grid
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => {
              if (!user) {
                setGatedFeature("Meaning Lookup");
              } else {
                setIsSearchOpen(true);
              }
            }}
            style={{
              padding: "10px 16px",
              borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              cursor: "pointer",
              background: "transparent",
              border: "1px solid var(--border-default)",
              color: "var(--text-secondary)",
              transition: "all 0.2s ease",
            }}
          >
            Lookup Meaning
          </button>
          {room.gameMode !== "coop" && (isSpymaster || isSpectator || isGameEnded) && (
            <button
              onClick={() => setPeekKey(!peekKey)}
              style={{
                padding: "10px 16px",
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                cursor: "pointer",
                background: peekKey ? "var(--accent)" : "transparent",
                border: `1px solid ${peekKey ? "var(--accent)" : "var(--border-default)"}`,
                color: peekKey ? "var(--accent-text-on)" : "var(--text-secondary)",
                boxShadow: peekKey ? "0 0 12px var(--accent)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              {peekKey ? "Peeking Key (ON)" : "Peek Board Key"}
            </button>
          )}
        </div>
      </div>

      {/* ─── Main Content Split Layout ─── */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          flexDirection: "row",
          flexWrap: "wrap",
          width: "100%",
          alignItems: "flex-start",
        }}
      >
        {/* Left Side: Game Board & Action forms */}
        <div className="game-main-col" style={{ flex: "3 1 650px", display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Lobby Preset Forms */}
          {room.phase === "lobby" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Game Settings Card */}
              {renderSettingsCard()}

              {/* Room Players Card */}
              {renderGroupedPlayersCard()}



              {/* Lobby Actions */}
              <div
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "20px",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                }}
              >
                {localPlayer?.team && (
                  <button
                    onClick={() => handleJoinTeamRole(null, null)}
                    style={{
                      padding: "12px 20px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-surface-raised)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Spectate
                  </button>
                )}

                {isHost ? (
                  <button
                    onClick={handleStartGame}
                    style={{
                      padding: "12px 32px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--accent)",
                      color: "var(--accent-text-on)",
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      cursor: "pointer",
                      border: "none",
                      boxShadow: "0 4px 16px rgba(232, 163, 61, 0.2)",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "var(--accent-hover)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "var(--accent)";
                    }}
                  >
                    Start Game
                  </button>
                ) : (
                  <div style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", fontStyle: "italic", alignSelf: "center" }}>
                    Waiting for Host to start the game...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active Game Layout */}
          {(room.phase === "playing" || room.phase === "ended") && (
            <div
              id="game-board-container"
              className={cameraWarpActive ? "camera-warp-active" : ""}
              style={{ display: "flex", flexDirection: "column", gap: "24px", position: "relative" }}
            >
              {/* #10 Turn Handoff Torch Wipe */}
              {handoffWipe && createPortal(
                <div
                  className="turn-handoff-overlay"
                  style={{
                    position: "fixed", inset: 0, zIndex: 200, pointerEvents: "none",
                    background: `linear-gradient(105deg, ${handoffWipe.from} 0%, ${handoffWipe.to} 100%)`,
                  }}
                />,
                document.body
              )}
              {/* Particle Canvas Background */}
              <canvas ref={particleCanvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }} />
              {/* Neural Streams Overlay SVG */}
              {neuralStreams.length > 0 && (
                <svg
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                    zIndex: 50,
                  }}
                >
                  {neuralStreams.map((stream, idx) => (
                    <path
                      key={idx}
                      d={`M ${stream.start.x} ${stream.start.y} Q ${(stream.start.x + stream.end.x)/2} ${(stream.start.y + stream.end.y)/2 - 50}, ${stream.end.x} ${stream.end.y}`}
                      fill="none"
                      stroke={room.turnState ? typeColors[room.turnState.activeTeam]?.light || "var(--accent)" : "var(--accent)"}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="beam-line"
                    />
                  ))}
                </svg>
              )}
              {/* #6 Radar Ping ring */}
              {showRadarPing && (
                <div
                  className="radar-ring"
                  style={{
                    top: "50%", left: "50%", width: "80px", height: "80px",
                    marginTop: "-40px", marginLeft: "-40px",
                    border: `2px solid ${room.turnState ? typeColors[room.turnState.activeTeam]?.light ?? "var(--accent)" : "var(--accent)"}`,
                  }}
                />
              )}
              {/* Turn Banner */}
              <div
                id="clue-display-panel"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                {room.phase === "playing" && room.turnState ? (
                  <div style={{ textAlign: "left" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        backgroundColor: typeColors[room.turnState.activeTeam]!.border,
                        color: "#fff",
                        marginBottom: "8px",
                      }}
                    >
                      {`${room.teams[room.turnState.activeTeam]?.name || (room.turnState.activeTeam.charAt(0).toUpperCase() + room.turnState.activeTeam.slice(1))} Team's Turn`}
                    </span>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700, margin: 0 }}>
                      {room.turnState.phase === "giving_clue" ? (
                        room.gameMode === "coop"
                          ? `${room.teams[room.turnState.activeTeam]?.name || (room.turnState.activeTeam.charAt(0).toUpperCase() + room.turnState.activeTeam.slice(1))} Team is giving a clue to the other team...`
                          : `${room.teams[room.turnState.activeTeam]?.name || (room.turnState.activeTeam.charAt(0).toUpperCase() + room.turnState.activeTeam.slice(1))} Spymaster is giving clue...`
                      ) : (
                        <>
                          Clue:{" "}
                          <span style={{ color: typeColors[room.turnState.activeTeam]!.light }}>
                            {typewriterText || room.turnState.clueWord || "[Secret Clue]"}
                            {typewriterCursor && <span className="clue-cursor" />}
                          </span>{" "}
                          · Count:{" "}
                          <span style={{ color: typeColors[room.turnState.activeTeam]!.light }}>
                            {room.turnState.clueCount !== null
                              ? room.turnState.clueCount === -1
                                ? "∞"
                                : room.turnState.clueCount
                              : "[Secret]"}
                          </span>
                        </>
                      )}
                    </h3>
                    {room.turnState.phase === "guessing" && (
                      <p style={{ margin: "4px 0 0 0", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                        Guesses used: {room.turnState.guessesUsed} / {room.turnState.guessesAllowed === Infinity ? "Unlimited" : room.turnState.guessesAllowed}
                      </p>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: "left" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        backgroundColor: room.winner ? typeColors[room.winner]!.border : "var(--color-text-muted)",
                        color: "#fff",
                        marginBottom: "8px",
                      }}
                    >
                      Game Over
                    </span>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 700, margin: 0 }}>
                      {room.winner ? `${formatTeamName(room.winner)} Team Wins! 🏆` : `No one wins! ☠️`}
                    </h3>
                  </div>
                )}

                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  {room.phase === "playing" && room.turnState && (
                    <>
                      {((room.gameMode === "coop" &&
                          localPlayer?.team === (room.turnState.activeTeam === "red" ? "blue" : "red")) ||
                        (room.gameMode !== "coop" &&
                          localPlayer?.team === room.turnState.activeTeam &&
                          localPlayer?.role === "operative")) &&
                        room.turnState.phase === "guessing" && (
                          <button
                            onClick={handleEndTurn}
                            style={{
                              padding: "10px 24px",
                              borderRadius: "var(--radius-md)",
                              background: "var(--accent)",
                              border: "none",
                              color: "var(--accent-text-on)",
                              fontFamily: "var(--font-display)",
                              fontWeight: 700,
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
                            onMouseOut={(e) => (e.currentTarget.style.background = "var(--accent)")}
                          >
                            End Turn
                          </button>
                        )}
                      {room.gameMode !== "coop" &&
                        localPlayer &&
                        localPlayer.team !== room.turnState.activeTeam &&
                        room.settings.timerAction === "manual" && (
                          <button
                            onClick={handleEndTurn}
                            style={{
                              padding: "10px 24px",
                              borderRadius: "var(--radius-md)",
                              background: "rgba(196, 69, 54, 0.12)",
                              border: "1px solid var(--team-1)",
                              color: "var(--team-1)",
                              fontFamily: "var(--font-display)",
                              fontWeight: 700,
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = "var(--team-1)";
                              e.currentTarget.style.color = "#fff";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = "rgba(196, 69, 54, 0.12)";
                              e.currentTarget.style.color = "var(--team-1)";
                            }}
                          >
                            End Opponent&apos;s Turn
                          </button>
                        )}
                      {isHost && (
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            onClick={handleStartGame}
                            style={{
                              padding: "10px 24px",
                              borderRadius: "var(--radius-md)",
                              background: "transparent",
                              border: "1px solid var(--border-default)",
                              color: "var(--text-secondary)",
                              fontFamily: "var(--font-display)",
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.borderColor = "var(--accent)";
                              e.currentTarget.style.color = "var(--text-primary)";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.borderColor = "var(--border-default)";
                              e.currentTarget.style.color = "var(--text-secondary)";
                            }}
                          >
                            Reset Game
                          </button>
                          <button
                            onClick={handleReturnToLobby}
                            style={{
                              padding: "10px 24px",
                              borderRadius: "var(--radius-md)",
                              background: "transparent",
                              border: "1px solid var(--border-default)",
                              color: "var(--text-secondary)",
                              fontFamily: "var(--font-display)",
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.borderColor = "var(--accent)";
                              e.currentTarget.style.color = "var(--text-primary)";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.borderColor = "var(--border-default)";
                              e.currentTarget.style.color = "var(--text-secondary)";
                            }}
                          >
                            Return to Lobby
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  {room.phase === "ended" && (
                    isHost ? (
                      <div style={{ display: "flex", gap: "12px" }}>
                        <button
                          onClick={handleStartGame}
                          style={{
                            padding: "12px 32px",
                            borderRadius: "var(--radius-md)",
                            background: "var(--accent)",
                            color: "var(--accent-text-on)",
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            cursor: "pointer",
                            border: "none",
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
                          onMouseOut={(e) => (e.currentTarget.style.background = "var(--accent)")}
                        >
                          Play Again
                        </button>
                        <button
                          onClick={handleReturnToLobby}
                          style={{
                            padding: "12px 32px",
                            borderRadius: "var(--radius-md)",
                            background: "transparent",
                            border: "1px solid var(--border-default)",
                            color: "var(--text-secondary)",
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = "var(--accent)";
                            e.currentTarget.style.color = "var(--text-primary)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = "var(--border-default)";
                            e.currentTarget.style.color = "var(--text-secondary)";
                          }}
                        >
                          Return to Lobby
                        </button>
                      </div>
                    ) : (
                      <div style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", fontStyle: "italic" }}>
                        Waiting for Host to restart the game...
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Cards remaining badges */}
              {room.gameMode === "coop" ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Co-op Cards Remaining */}
                  <div
                    style={{
                      background: "var(--color-surface)",
                      border: "2px solid hsl(0,85%,62%)",
                      padding: "12px 24px",
                      borderRadius: "var(--radius-md)",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: "hsl(0,85%,62%)",
                      }}
                    />
                    <span style={{ fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                      Co-op Agents Remaining: {room.teams.red?.cardsRemaining} / {room.teams.red?.totalCards}
                    </span>
                  </div>

                  {/* Co-op Turn Tokens Board */}
                  <div
                    style={{
                      background: "var(--color-surface)",
                      border: "2px solid hsl(355, 80%, 48%)",
                      padding: "12px 24px",
                      borderRadius: "var(--radius-md)",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span style={{ fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                      Mistake / Turn Tokens Used: {room.coopMistakesMade} / {room.coopMistakesAllowed}
                    </span>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {Array.from({ length: room.coopMistakesAllowed || 9 }).map((_, i) => {
                        const used = i < room.coopMistakesMade;
                        return (
                          <div
                            key={i}
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              background: used ? "hsl(355, 80%, 48%)" : "hsl(142, 70%, 42%)",
                              opacity: used ? 0.4 : 1,
                              boxShadow: used ? "none" : "0 0 8px hsl(142, 70%, 50%)",
                            }}
                            title={used ? "Token used" : "Token available"}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Turn Timer Countdown — only show when timer is active */}
                  {room.phase === "playing" && (room.gameMode === "coop" || (room.settings.timerMode && room.settings.timerMode !== "off")) && (
                    <div
                      className={
                        timerCount <= 5  ? "timer-danger-fast"
                        : timerCount <= 10 ? "timer-danger-medium"
                        : timerCount <= 20 ? "timer-danger-slow"
                        : ""
                      }
                      style={{
                        background: "var(--color-surface)",
                        border: `2px solid ${timerCount <= 10 ? "hsl(355,85%,58%)" : "hsl(45, 85%, 55%)"}`,
                        padding: "12px 24px",
                        borderRadius: "var(--radius-md)",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        transition: "border-color 0.5s ease",
                      }}
                    >
                      <span style={{ fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                        {t("turn.timerLabel")}:{" "}
                        <span style={{
                          color: timerCount <= 0 ? "var(--team-1)" : timerCount <= 10 ? "hsl(355,85%,58%)" : "hsl(45, 85%, 55%)",
                          fontVariantNumeric: "tabular-nums",
                          minWidth: "2.5ch",
                          display: "inline-block",
                          transition: "color 0.4s ease",
                        }}>
                          {timerCount}s
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  {/* #8 Liquid Score Fill */}
                  {activeTeams.map((team) => {
                    const state = room.teams[team];
                    const config = typeColors[team]!;
                    if (!state) return null;
                    const fillPct = state.totalCards > 0 ? (state.cardsRemaining / state.totalCards) * 100 : 0;

                    return (
                      <div
                        key={team}
                        style={{
                          background: state.eliminated ? "rgba(0,0,0,0.4)" : "var(--color-surface)",
                          border: `2px solid ${state.eliminated ? "rgba(255,255,255,0.05)" : config.border}`,
                          padding: "12px 20px",
                          borderRadius: "var(--radius-md)",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          opacity: state.eliminated ? 0.5 : 1,
                          minWidth: "140px",
                        }}
                      >
                        <div style={{ position: "relative", width: "10px", height: "44px", borderRadius: "5px", background: "rgba(255,255,255,0.08)", overflow: "hidden", flexShrink: 0 }}>
                          <div
                            className="score-liquid-fill"
                            style={{
                              position: "absolute", bottom: 0, left: 0, right: 0,
                              height: `${fillPct}%`,
                              background: `linear-gradient(to top, ${config.border}, ${config.light})`,
                              borderRadius: "5px",
                            }}
                          />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontWeight: 700, fontFamily: "var(--font-display)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", color: config.light }}>
                            {formatTeamName(team)}
                          </span>
                          <span style={{ fontWeight: 800, fontFamily: "var(--font-display)", fontSize: "1.3rem", color: state.eliminated ? "var(--color-text-muted)" : "var(--text-primary)", lineHeight: 1 }}>
                            {state.cardsRemaining}
                            <span style={{ fontWeight: 400, fontSize: "0.75rem", color: "var(--text-secondary)", marginLeft: "3px" }}>/ {state.totalCards}</span>
                          </span>
                          {state.eliminated && <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Eliminated</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Spymaster reaction bar */}
              {room.phase === "playing" && localPlayer?.role === "spymaster" && (
                <div
                  style={{
                    background: "var(--bg-surface-raised)",
                    border: "1px solid var(--border-default)",
                    borderLeft: "4px solid var(--accent)",
                    borderRadius: "var(--radius-md)",
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                    textAlign: "left",
                    marginTop: "20px",
                  }}
                >
                  <div>
                    <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                      Spymaster Reactions Overlay
                    </h4>
                    <p style={{ margin: "2px 0 0 0", color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
                      {cooldownRemaining > 0 ? `Rate limited: wait ${cooldownRemaining}s` : "Trigger a full-screen reaction"}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {["facepalm", "fire", "skull", "party", "clap", "heart"].map((type) => (
                      <button
                        key={type}
                        disabled={cooldownRemaining > 0}
                        onClick={() => triggerReaction(type)}
                        style={{
                          border: "none",
                          background: "none",
                          padding: 0,
                          cursor: cooldownRemaining > 0 ? "not-allowed" : "pointer",
                          opacity: cooldownRemaining > 0 ? 0.5 : 1,
                          transition: "transform 0.1s ease",
                        }}
                        onMouseOver={(e) => {
                          if (cooldownRemaining === 0) e.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        {renderCustomReaction(type, true)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clue Submission Form */}
              {room.phase === "playing" &&
                room.turnState &&
                room.turnState.phase === "giving_clue" &&
                localPlayer?.team === room.turnState.activeTeam &&
                (localPlayer?.role === "spymaster" || room.gameMode === "coop") && (
                   <form
                    onSubmit={handleGiveClue}
                    className="fade-in"
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius-md)",
                      padding: "24px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      textAlign: "left",
                    }}
                  >
                    <h4 style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>
                      {room.gameMode === "coop" ? "Give a Clue (Duet Mode)" : "Give a Clue"}
                    </h4>
                    {room.gameMode === "coop" && (
                      <div style={{
                        background: "linear-gradient(135deg, rgba(var(--team-accent-rgb,232,163,61),0.08), rgba(var(--team-accent-rgb,232,163,61),0.04))",
                        border: "1px solid rgba(232,163,61,0.25)",
                        borderRadius: "var(--radius-sm)",
                        padding: "10px 14px",
                        fontSize: "0.82rem",
                        color: "var(--text-secondary)",
                        lineHeight: 1.6,
                      }}>
                        💡 <strong style={{ color: "var(--accent)" }}>Duet Mode:</strong>{" "}
                        You can see the <strong style={{ color: typeColors[localPlayer?.team === "red" ? "blue" : "red"]?.light }}>
                          {localPlayer?.team === "red" ? "Blue" : "Red"} Team&apos;s cards
                        </strong> on the board. Give a clue that points to those cards — your partner will guess them!
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <label style={{ display: "block", color: "var(--text-primary)", fontSize: "0.85rem", marginBottom: "8px", fontWeight: 600 }}>
                          Clue Word (Single word, no spaces)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. OCEAN"
                          value={clueWord}
                          onChange={(e) => setClueWord(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--border-default)",
                            background: "var(--bg-surface-raised)",
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-display)",
                            fontWeight: 600,
                            letterSpacing: "0.05em",
                          }}
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                        <label style={{ display: "block", color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 600 }}>
                          Count
                        </label>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, -1].map((n) => {
                            const isSelected = clueCount === n;
                            return (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setClueCount(n)}
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "50%",
                                  border: `1px solid ${isSelected ? "var(--accent)" : "var(--border-default)"}`,
                                  background: isSelected
                                    ? "var(--accent)"
                                    : "var(--bg-surface-raised)",
                                  color: isSelected ? "var(--accent-text-on)" : "var(--text-secondary)",
                                  fontFamily: "var(--font-display)",
                                  fontWeight: 700,
                                  fontSize: "0.95rem",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  boxShadow: isSelected ? "0 0 8px var(--accent)" : "none",
                                  transition: "all 0.15s ease",
                                }}
                              >
                                {n === -1 ? "∞" : n}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        type="submit"
                        style={{
                          padding: "12px 32px",
                          borderRadius: "var(--radius-sm)",
                          border: "none",
                          background: "var(--accent)",
                          color: "var(--accent-text-on)",
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(232, 163, 61, 0.2)",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "var(--accent-hover)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "var(--accent)";
                        }}
                      >
                        Send Clue
                      </button>
                    </div>
                    {clueError && (
                      <div style={{ color: "hsl(355,85%,58%)", fontSize: "0.85rem", fontWeight: 500 }}>
                        ⚠️ {clueError}
                      </div>
                    )}
                  </form>
                )}

              {/* Card Board Grid */}
              <div style={{ position: "relative", width: "100%" }}>
                {/* #9 Ambient Particle Field canvas */}
                <canvas
                  ref={particleCanvasRef}
                  width={800} height={600}
                  style={{
                    position: "absolute", inset: 0, width: "100%", height: "100%",
                    pointerEvents: "none", zIndex: 0, borderRadius: "var(--radius-lg)", opacity: 0.55,
                  }}
                />
                {isDealingAnimationActive && (
                  <div
                    style={{
                      position: "absolute",
                      left: "-200px",
                      top: "15%",
                      width: "140px",
                      height: "190px",
                      background: "linear-gradient(135deg, #161b22, #0d1117)",
                      border: "2px dashed var(--accent)",
                      borderRadius: "var(--radius-md)",
                      boxShadow: "0 15px 40px rgba(0,0,0,0.8), 0 0 25px rgba(232,163,61,0.25)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 150,
                      transform: "rotate(-10deg)",
                      animation: "dossier-float 2.5s ease-in-out infinite, dossier-fade-out 0.5s ease 2s forwards",
                      color: "var(--accent)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: -8,
                        border: "1px solid rgba(232, 163, 61, 0.4)",
                        borderRadius: "var(--radius-lg)",
                        animation: "sparks-rotate 4s linear infinite",
                        pointerEvents: "none",
                      }}
                    />
                    <div style={{ fontSize: "2.5rem", marginBottom: "8px", filter: "drop-shadow(0 0 8px var(--accent))" }}>📁</div>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--accent)" }}>
                      Classified
                    </span>
                    <span style={{ fontSize: "0.55rem", opacity: 0.6, marginTop: "4px", color: "var(--text-secondary)" }}>
                      DEALING...
                    </span>
                  </div>
                )}
                <div
                  className={
                    [
                      room.phase === "ended"
                        ? room.winner
                          ? (localPlayer?.team && room.winner === localPlayer.team) || (!localPlayer?.team && room.winner === "red")
                            ? "grid-victory-active"
                            : "grid-defeat-active"
                          : "grid-defeat-active"
                        : "",
                      "game-board-grid",
                    ].filter(Boolean).join(" ")
                  }
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gap: "clamp(4px, 1.5vw, 12px)",
                    width: "100%",
                    padding: "clamp(8px, 2vw, 16px)",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: "var(--radius-lg)",
                  }}
                >
                  {board.map((card) => {
                    let cardType = "unknown";
                    if (room.gameMode === "coop" && localPlayer?.team) {
                      if (card.revealed) {
                        cardType = card.type || "unknown";
                      } else {
                        const opponentColor = localPlayer.team === "red" ? "blue" : "red";
                        if (card.type === opponentColor || card.type === "assassin" || card.type === "neutral") {
                          cardType = card.type || "unknown";
                        } else {
                          cardType = "unknown";
                        }
                      }
                    } else {
                      cardType = canSeeKey ? (card.type || "unknown") : (card.revealed ? card.type || "unknown" : "unknown");
                    }
                    const colors = typeColors[cardType] || typeColors["unknown"]!;

                    const isGuessingTime = room.phase === "playing" && room.turnState?.phase === "guessing";
                    const isMyTeamGuessing = localPlayer && room.turnState && localPlayer.team === room.turnState.activeTeam;
                    const isOperative = localPlayer?.role === "operative";

                    const isCoopActiveOp =
                      room.gameMode === "coop" &&
                      localPlayer?.team === (room.turnState?.activeTeam === "red" ? "blue" : "red") &&
                      room.turnState?.phase === "guessing";

                    const isActiveOperative =
                      isCoopActiveOp ||
                      (room.gameMode !== "coop" &&
                        isGuessingTime &&
                        isMyTeamGuessing &&
                        isOperative);

                    // In coop/duet mode: the active team player selects opponent-team cards (they see the opponent board)
                    // In classic mode: spymaster selects their own team's cards as hint markers
                    const isSpymasterClickable =
                      room.phase === "playing" &&
                      room.turnState?.phase === "giving_clue" &&
                      localPlayer?.team === room.turnState?.activeTeam &&
                      (room.gameMode === "coop"
                        ? card.type === (localPlayer?.team === "red" ? "blue" : "red")
                        : localPlayer?.role === "spymaster" && card.type === localPlayer?.team);

                    const isInteractive = (isActiveOperative || isSpymasterClickable) && !card.revealed;
                    const voters = room.players.filter((p) => (p.votedCardIds && p.votedCardIds.includes(card.id)) || p.votedCardId === card.id);

                    const rowIndex = Math.floor(card.id / cols);
                    const colIndex = card.id % cols;
                    const startX = `-${180 + colIndex * 150}px`;
                    const startY = `${100 - rowIndex * 120}px`;
                    const animationDelay = `${card.id * 50}ms`;

                    const dealAnimationStyles = isDealingAnimationActive ? {
                      animation: "deal-card-fly 0.75s cubic-bezier(0.175, 0.885, 0.32, 1.275) both",
                      animationDelay: animationDelay,
                      "--start-x": startX,
                      "--start-y": startY,
                      "--start-rot": "-45deg",
                      zIndex: 100 - card.id,
                    } as React.CSSProperties : {};

                    const isAssassinCard = assassinRevealedId === card.id;
                    const shockwaveOffset = shockwaveCardOffsets[card.id];
                    const cardClassName = [
                      recentlyFlippedCardIds.includes(card.id) ? "card-flipped-active" : "",
                      isAssassinCard ? "assassin-flip" : "",
                      shockwaveOffset ? "shockwave-push" : "",
                    ].filter(Boolean).join(" ");

                    return (
                      <button
                        key={card.id}
                        data-card-id={card.id}
                        disabled={!isInteractive}
                        onClick={() => handleCardClick(card.id)}
                        className={[cardClassName, "game-board-card"].filter(Boolean).join(" ")}
                        style={{
                          background: colors.bg,
                          border: clueSelectedCardIds.includes(card.id)
                            ? `3px solid ${colors.light}`
                            : `2px solid ${colors.border}`,
                          borderRadius: "var(--radius-md)",
                          padding: "clamp(10px, 3.5vw, 24px) clamp(4px, 1.5vw, 10px)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: isInteractive ? "pointer" : "default",
                          minHeight: "clamp(52px, 15vw, 100px)",
                          position: "relative",
                          perspective: "1000px",
                          transformStyle: "preserve-3d",
                          boxShadow: card.revealed
                            ? "inset 0 2px 10px rgba(0,0,0,0.5)"
                            : clueSelectedCardIds.includes(card.id)
                              ? `0 0 14px ${colors.light}`
                              : "0 4px 6px rgba(0,0,0,0.15)",
                          transition: isDealingAnimationActive
                            ? "none"
                            : "transform 0.15s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.15s ease, border-color 0.15s ease",
                          transform: shockwaveOffset ? `translate(var(--push-x), var(--push-y))` : undefined,
                          "--push-x": shockwaveOffset ? `${shockwaveOffset.x}px` : "0px",
                          "--push-y": shockwaveOffset ? `${shockwaveOffset.y}px` : "0px",
                          ...dealAnimationStyles,
                        } as React.CSSProperties}
                        onMouseMove={(e) => {
                          if (isInteractive) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;
                            const xc = ((x / rect.width) - 0.5) * 16;
                            const yc = ((y / rect.height) - 0.5) * -16;
                            e.currentTarget.style.transform = `perspective(1000px) rotateX(${yc}deg) rotateY(${xc}deg) scale(1.03)`;
                            e.currentTarget.style.boxShadow = clueSelectedCardIds.includes(card.id)
                              ? `0 0 24px ${colors.light}`
                              : "0 12px 24px rgba(0,0,0,0.35)";
                            e.currentTarget.style.borderColor = clueSelectedCardIds.includes(card.id)
                              ? colors.light
                              : "rgba(255,255,255,0.3)";
                            e.currentTarget.style.setProperty('--glare-x', `${(x / rect.width) * 100}%`);
                            e.currentTarget.style.setProperty('--glare-y', `${(y / rect.height) * 100}%`);
                            e.currentTarget.style.setProperty('--glare-opacity', '0.15');
                          }
                        }}
                        onMouseOut={(e) => {
                          if (isInteractive) {
                            e.currentTarget.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
                            e.currentTarget.style.boxShadow = clueSelectedCardIds.includes(card.id)
                              ? `0 0 14px ${colors.light}`
                              : "0 4px 6px rgba(0,0,0,0.15)";
                            e.currentTarget.style.borderColor = clueSelectedCardIds.includes(card.id)
                              ? colors.light
                              : colors.border;
                            e.currentTarget.style.setProperty('--glare-opacity', '0');
                          }
                        }}
                      >
                        {/* Glare Overlay for 3D card */}
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: "inherit",
                            background: `radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255, 255, 255, var(--glare-opacity, 0)) 0%, rgba(255, 255, 255, 0) 65%)`,
                            pointerEvents: "none",
                            transition: "background 0.15s ease",
                            zIndex: 1,
                          }}
                        />

                        {(card.revealed || (canSeeKey && card.type === "assassin")) && !votedCardIds.includes(card.id) && (
                          <span
                            style={{
                              position: "absolute",
                              top: "6px",
                              right: "8px",
                              fontSize: "0.6rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: "rgba(0,0,0,0.4)",
                              color: colors.text,
                              letterSpacing: "0.05em",
                              zIndex: 2,
                            }}
                          >
                            {card.type === "assassin" ? "assassin" : ""}
                            {card.revealed && (card.type === "assassin" ? " (REV)" : "REV")}
                          </span>
                        )}

                        <span
                          className="game-card-word"
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "clamp(0.55rem, 2.8vw, 1.1rem)",
                            fontWeight: 700,
                            letterSpacing: "0.02em",
                            color: colors.text,
                            textAlign: "center",
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                            hyphens: "auto",
                            lineHeight: 1.15,
                            opacity: card.revealed && !canSeeKey ? 0.35 : 1,
                            transform: "translateZ(20px)",
                            display: "block",
                            zIndex: 2,
                          }}
                        >
                          {card.word}
                        </span>

                        {/* Pointer Hand Icon in corner to Flip */}
                        {votedCardIds.includes(card.id) && isActiveOperative && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (socket) {
                                socket.emit("guess_card", {
                                  roomCode: room.roomCode,
                                  playerId,
                                  cardId: card.id,
                                });
                              }
                            }}
                            style={{
                              position: "absolute",
                              top: "6px",
                              right: "8px",
                              background: "linear-gradient(135deg, var(--accent), #b87c24)",
                              border: "1px solid var(--accent)",
                              borderRadius: "50%",
                              width: "28px",
                              height: "28px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--accent-text-on)",
                              cursor: "pointer",
                              boxShadow: "0 0 10px rgba(232,163,61,0.5)",
                              zIndex: 10,
                              transition: "all 0.15s ease",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = "scale(1.15)";
                              e.currentTarget.style.boxShadow = "0 0 15px rgba(232,163,61,0.8)";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = "none";
                              e.currentTarget.style.boxShadow = "0 0 10px rgba(232,163,61,0.5)";
                            }}
                            title="Flip Card"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "scaleX(-1)" }}>
                              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                            </svg>
                          </button>
                        )}

                        {/* Real-time Voter Avatars Overlay */}
                        {voters.length > 0 && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: "6px",
                              left: "8px",
                              display: "flex",
                              gap: "4px",
                              flexWrap: "wrap",
                              zIndex: 4,
                            }}
                          >
                            {voters.map((v, index) => {
                              const delay = `${(index * 200) % 1000}ms`;
                              return (
                                <span
                                  key={v.id}
                                  title={v.displayName}
                                  className="voter-badge-floating"
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "20px",
                                    height: "20px",
                                    borderRadius: "50%",
                                    cursor: "default",
                                    animation: "voter-badge-entry 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) both, avatar-float 3s ease-in-out infinite alternate",
                                    animationDelay: `0s, ${delay}`,
                                  }}
                                >
                                  {renderAvatar(v.avatar || v.displayName.charAt(0), 20)}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Players & Scoped Room Chat */}
        <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "24px", minWidth: "260px" }}>
          {/* User Profile Card / Statistics */}
          {/* User Profile Circular Widget */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              padding: "16px",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
            }}
          >
            {/* Clickable Circle Container */}
            <div
              onClick={() => setStatsExpanded(!statsExpanded)}
              style={{
                position: "relative",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(0, 0, 0, 0.2)",
                border: `2px solid ${statsExpanded ? "var(--accent)" : "var(--color-border)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: statsExpanded ? "0 0 12px rgba(232, 163, 61, 0.3)" : "0 4px 10px rgba(0,0,0,0.3)",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
              }}
              onMouseOut={(e) => {
                if (!statsExpanded) e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            >
              {/* Avatar Image or Fallback */}
              {renderAvatar(user ? user.avatar : (localPlayer?.avatar || "s1_0_0"), 52)}
              
              {/* Online indicator dot at bottom right */}
              {user && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "2px",
                    right: "2px",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: "var(--status-active-bg, #10b981)",
                    border: "2px solid var(--color-surface)",
                  }}
                  title="Status: Active"
                />
              )}
            </div>

            {/* Username and Online/Offline state */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}>
                {user ? user.username : "Guest"}
                {user?.isSupporter && (
                  <span style={{ fontSize: "0.7rem", background: "var(--accent-bg-subtle)", border: "1px solid var(--accent)", color: "var(--accent-text-on-subtle)", padding: "1px 4px", borderRadius: "8px", fontWeight: 700 }}>
                    💎
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "2px" }}>
                {user ? "Online · Tap circle for stats" : "Gated · Tap circle to log in"}
              </div>
            </div>

            {/* Stats list expands below */}
            {statsExpanded && (
              <div style={{ width: "100%", marginTop: "12px", borderTop: "1px solid var(--color-border)", paddingTop: "12px" }} className="scale-up">
                {user ? (
                  <>
                    {/* Profile Role & Status Settings */}
                    <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      {/* Status selector (single-line horizontal pill selection) */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                          My Status
                        </label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {["ACTIVE", "BRB", "AFK", ".zZ", "FOCUS", "BUSY"].map((st) => {
                            const isSelected = (localPlayer?.status || "ACTIVE") === st;
                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() => {
                                  if (socket) {
                                    socket.emit("update_status", {
                                      roomCode: room.roomCode,
                                      playerId,
                                      status: st,
                                    });
                                  }
                                }}
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: "4px",
                                  border: isSelected ? "1px solid var(--accent)" : "1px solid var(--border-default)",
                                  background: isSelected ? "var(--accent)" : "var(--bg-surface-raised)",
                                  color: isSelected ? "var(--accent-text-on)" : "var(--text-primary)",
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                  cursor: "pointer",
                                  transition: "all 0.15s ease",
                                }}
                                onMouseOver={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.background = "var(--border-subtle)";
                                  }
                                }}
                                onMouseOut={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.background = "var(--bg-surface-raised)";
                                  }
                                }}
                              >
                                {st}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Team & Role Switcher */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                          {room.gameMode === "coop" ? "Assign Team" : "Assign Team & Role"}
                        </label>
                        {room.gameMode === "coop" ? (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                            <button
                              onClick={() => handleJoinTeamRole("red", "operative")}
                              style={{
                                padding: "8px",
                                fontSize: "0.75rem",
                                background: localPlayer?.team === "red" ? typeColors.red!.border : typeColors.red!.bg,
                                border: `1px solid ${typeColors.red!.border}`,
                                borderRadius: "4px",
                                color: localPlayer?.team === "red" ? "#fff" : typeColors.red!.text,
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Red Team
                            </button>
                            <button
                              onClick={() => handleJoinTeamRole("blue", "operative")}
                              style={{
                                padding: "8px",
                                fontSize: "0.75rem",
                                background: localPlayer?.team === "blue" ? typeColors.blue!.border : typeColors.blue!.bg,
                                border: `1px solid ${typeColors.blue!.border}`,
                                borderRadius: "4px",
                                color: localPlayer?.team === "blue" ? "#fff" : typeColors.blue!.text,
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Blue Team
                            </button>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                              <button
                                onClick={() => handleJoinTeamRole("red", "spymaster")}
                                style={{
                                  padding: "6px",
                                  fontSize: "0.75rem",
                                  background: localPlayer?.team === "red" && localPlayer?.role === "spymaster" ? typeColors.red!.border : typeColors.red!.bg,
                                  border: `1px solid ${typeColors.red!.border}`,
                                  borderRadius: "4px",
                                  color: localPlayer?.team === "red" && localPlayer?.role === "spymaster" ? "#fff" : typeColors.red!.text,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                Red Spy
                              </button>
                              <button
                                onClick={() => handleJoinTeamRole("red", "operative")}
                                style={{
                                  padding: "6px",
                                  fontSize: "0.75rem",
                                  background: localPlayer?.team === "red" && localPlayer?.role === "operative" ? typeColors.red!.border : typeColors.red!.bg,
                                  border: `1px solid ${typeColors.red!.border}`,
                                  borderRadius: "4px",
                                  color: localPlayer?.team === "red" && localPlayer?.role === "operative" ? "#fff" : typeColors.red!.text,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                Red Op
                              </button>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                              <button
                                onClick={() => handleJoinTeamRole("blue", "spymaster")}
                                style={{
                                  padding: "6px",
                                  fontSize: "0.75rem",
                                  background: localPlayer?.team === "blue" && localPlayer?.role === "spymaster" ? typeColors.blue!.border : typeColors.blue!.bg,
                                  border: `1px solid ${typeColors.blue!.border}`,
                                  borderRadius: "4px",
                                  color: localPlayer?.team === "blue" && localPlayer?.role === "spymaster" ? "#fff" : typeColors.blue!.text,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                Blue Spy
                              </button>
                              <button
                                onClick={() => handleJoinTeamRole("blue", "operative")}
                                style={{
                                  padding: "6px",
                                  fontSize: "0.75rem",
                                  background: localPlayer?.team === "blue" && localPlayer?.role === "operative" ? typeColors.blue!.border : typeColors.blue!.bg,
                                  border: `1px solid ${typeColors.blue!.border}`,
                                  borderRadius: "4px",
                                  color: localPlayer?.team === "blue" && localPlayer?.role === "operative" ? "#fff" : typeColors.blue!.text,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                Blue Op
                              </button>
                            </div>

                            {room.teamCount > 2 && (
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                <button
                                  onClick={() => handleJoinTeamRole("green", "spymaster")}
                                  style={{
                                    padding: "6px",
                                    fontSize: "0.75rem",
                                    background: localPlayer?.team === "green" && localPlayer?.role === "spymaster" ? typeColors.green!.border : typeColors.green!.bg,
                                    border: `1px solid ${typeColors.green!.border}`,
                                    borderRadius: "4px",
                                    color: localPlayer?.team === "green" && localPlayer?.role === "spymaster" ? "#fff" : typeColors.green!.text,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                >
                                  Green Spy
                                </button>
                                <button
                                  onClick={() => handleJoinTeamRole("green", "operative")}
                                  style={{
                                    padding: "6px",
                                    fontSize: "0.75rem",
                                    background: localPlayer?.team === "green" && localPlayer?.role === "operative" ? typeColors.green!.border : typeColors.green!.bg,
                                    border: `1px solid ${typeColors.green!.border}`,
                                    borderRadius: "4px",
                                    color: localPlayer?.team === "green" && localPlayer?.role === "operative" ? "#fff" : typeColors.green!.text,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                >
                                  Green Op
                                </button>
                              </div>
                            )}

                            {room.teamCount > 3 && (
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                <button
                                  onClick={() => handleJoinTeamRole("yellow", "spymaster")}
                                  style={{
                                    padding: "6px",
                                    fontSize: "0.75rem",
                                    background: localPlayer?.team === "yellow" && localPlayer?.role === "spymaster" ? typeColors.yellow!.border : typeColors.yellow!.bg,
                                    border: `1px solid ${typeColors.yellow!.border}`,
                                    borderRadius: "4px",
                                    color: localPlayer?.team === "yellow" && localPlayer?.role === "spymaster" ? "#fff" : typeColors.yellow!.text,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                >
                                  Yellow Spy
                                </button>
                                <button
                                  onClick={() => handleJoinTeamRole("yellow", "operative")}
                                  style={{
                                    padding: "6px",
                                    fontSize: "0.75rem",
                                    background: localPlayer?.team === "yellow" && localPlayer?.role === "operative" ? typeColors.yellow!.border : typeColors.yellow!.bg,
                                    border: `1px solid ${typeColors.yellow!.border}`,
                                    borderRadius: "4px",
                                    color: localPlayer?.team === "yellow" && localPlayer?.role === "operative" ? "#fff" : typeColors.yellow!.text,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                >
                                  Yellow Op
                                </button>
                              </div>
                            )}
                          </>
                        )}

                        <button
                          onClick={() => handleJoinTeamRole(null, null)}
                          style={{
                            padding: "6px",
                            fontSize: "0.75rem",
                            background: !localPlayer?.team ? "var(--accent)" : "transparent",
                            border: "1px solid var(--accent)",
                            borderRadius: "4px",
                            color: !localPlayer?.team ? "var(--accent-text-on)" : "var(--accent)",
                            fontWeight: 600,
                            cursor: "pointer",
                            marginTop: "2px",
                          }}
                        >
                          Spectate
                        </button>
                      </div>
                    </div>

                    <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, margin: "0 0 10px 0", color: "var(--text-primary)" }}>
                      My Stats & History
                    </h4>
                    {/* Stats Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                      <div style={{ background: "var(--bg-surface-raised)", padding: "8px", borderRadius: "4px", border: "1px solid var(--border-default)" }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Played</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>{user.stats.gamesPlayed}</div>
                      </div>
                      <div style={{ background: "var(--bg-surface-raised)", padding: "8px", borderRadius: "4px", border: "1px solid var(--border-default)" }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Won</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>{user.stats.gamesWon}</div>
                      </div>
                      <div style={{ background: "var(--bg-surface-raised)", padding: "8px", borderRadius: "4px", border: "1px solid var(--border-default)" }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Win Rate</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                          {user.stats.gamesPlayed > 0 ? ((user.stats.gamesWon / user.stats.gamesPlayed) * 100).toFixed(0) : 0}%
                        </div>
                      </div>
                      <div style={{ background: "var(--bg-surface-raised)", padding: "8px", borderRadius: "4px", border: "1px solid var(--border-default)" }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Accuracy</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                          {user.stats.totalGuesses > 0 ? ((user.stats.correctGuesses / user.stats.totalGuesses) * 100).toFixed(0) : 0}%
                        </div>
                      </div>
                    </div>

                    {/* Match History List */}
                    <div>
                      <h4 style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
                        Recent Matches
                      </h4>
                      {user.matchHistory.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "150px", overflowY: "auto" }}>
                          {user.matchHistory.slice(0, 5).map((m) => (
                            <div
                              key={m.id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "6px 8px",
                                background: "var(--bg-surface-raised)",
                                borderRadius: "4px",
                                border: "1px solid var(--border-default)",
                                fontSize: "0.8rem",
                              }}
                            >
                              <span>Room: {m.roomCode} ({m.role.toUpperCase()})</span>
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  fontWeight: 700,
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  background: m.won ? "hsl(142,70%,25%)" : "hsl(355,75%,30%)",
                                  color: "#fff",
                                }}
                              >
                                {m.won ? "WON" : "LOST"}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>
                          No matches played yet.
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "12px 0" }}>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0 0 12px 0", lineHeight: 1.4 }}>
                      Track your wins, losses, guess accuracy, and match history across games!
                    </p>
                    <button
                      onClick={() => onOpenAuth()}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        background: "var(--accent)",
                        color: "var(--accent-text-on)",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        boxShadow: "0 4px 12px rgba(232, 163, 61, 0.25)",
                        transition: "background 0.2s ease",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = "var(--accent-hover)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = "var(--accent)";
                      }}
                    >
                      Sign In / Sign Up
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Music Player Widget (Gated personal audio player) */}
          <MusicPlayer onShowGatedUpsell={() => setGatedFeature("Personal Music Player Widget")} />



          {/* In lobby both are in the main column; in play phase show Room Players in sidebar */}
          {room.phase !== "lobby" && renderGroupedPlayersCard()}


        </div>
      </div>



      {/* ─── Search Meaning Modal ─── */}
      {isSearchOpen && createPortal(
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: 10005,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
            className="scale-up"
          >
            {/* Header / Close button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.25rem", fontWeight: 800, fontFamily: "var(--font-display)", color: "#fff" }}>
                <span>ClueGrid Meaning Lookup</span>
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--color-text-muted)",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                &times;
              </button>
            </div>

            {/* Google-Style Search Form */}
            <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "8px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <input
                  type="text"
                  placeholder="Search the meaning of anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-surface-raised)",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-primary)",
                    fontSize: "0.95rem",
                    outline: "none",
                  }}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      color: "var(--color-text-muted)",
                      cursor: "pointer",
                      fontSize: "1.1rem",
                    }}
                  >
                    &times;
                  </button>
                )}
              </div>
              <button
                type="submit"
                style={{
                  padding: "12px 24px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--accent)",
                  border: "none",
                  color: "var(--accent-text-on)",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(232, 163, 61, 0.2)",
                }}
              >
                Search
              </button>
            </form>

            {/* Loading / Error / Results Area */}
            {searchLoading && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0", gap: "12px" }}>
                <div className="spinner" style={{ width: "36px", height: "36px" }} />
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>Searching database...</span>
              </div>
            )}

            {searchError && (
              <div style={{ textAlign: "center", padding: "30px 10px", color: "hsl(355,85%,65%)" }}>
                <p style={{ margin: 0, fontSize: "0.95rem" }}>{searchError}</p>
              </div>
            )}

            {/* Welcome / Suggestions state */}
            {!searchLoading && !searchError && !searchResults && (
              <div style={{ textAlign: "center", padding: "30px 0" }}>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", margin: "0 0 12px 0" }}>
                  Search words, cities, concepts, or historical names.
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                  {["spy", "assassin", "codename", "cooperative", "monopoly", "deduction"].map((word) => (
                    <button
                      key={word}
                      onClick={() => handleSuggestionClick(word)}
                      style={{
                        padding: "6px 12px",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--accent)",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Google Search Meaning Panel (Knowledge Graph Card) */}
            {searchResults && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
                {/* Result Title Header */}
                <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
                  <h4 style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0, color: "#fff" }}>
                    {searchResults.title}
                  </h4>
                  {searchResults.description && (
                    <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "4px", display: "inline-block" }}>
                      {searchResults.description}
                    </span>
                  )}
                </div>

                {/* Overview Text + Image Row */}
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  {searchResults.image && (
                    <div style={{ flex: "1 0 150px", maxWidth: "200px" }}>
                      <img
                        src={searchResults.image}
                        alt={searchResults.title}
                        style={{
                          width: "100%",
                          borderRadius: "8px",
                          border: "1px solid rgba(255,255,255,0.1)",
                          objectFit: "cover",
                          maxHeight: "180px",
                        }}
                      />
                    </div>
                  )}
                  <div style={{ flex: "2 1 300px" }}>
                    <h5 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 6px 0", color: "hsl(220,85%,65%)" }}>
                      Overview
                    </h5>
                    <p style={{ fontSize: "0.9rem", lineHeight: 1.5, margin: 0, color: "var(--color-text-muted)" }}>
                      {searchResults.overview}
                    </p>
                  </div>
                </div>

                {/* Dictionary Meanings / Definitions */}
                {searchResults.definitions && searchResults.definitions.length > 0 && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px" }}>
                    <h5 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 12px 0", color: "hsl(220,85%,65%)" }}>
                      Definitions & Meanings
                    </h5>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {searchResults.definitions.map((defGroup: any, idx: number) => (
                        <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              color: "hsl(45, 85%, 55%)",
                              fontStyle: "italic",
                            }}
                          >
                            {defGroup.partOfSpeech}
                          </span>
                          <ol style={{ margin: "0 0 0 16px", padding: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                            {defGroup.defs.map((d: any, dIdx: number) => (
                              <li key={dIdx} style={{ fontSize: "0.9rem", color: "var(--color-text)" }}>
                                <span>{d.definition}</span>
                                {d.example && (
                                  <span
                                    style={{
                                      display: "block",
                                      fontSize: "0.8rem",
                                      color: "var(--color-text-muted)",
                                      fontStyle: "italic",
                                      marginTop: "2px",
                                    }}
                                  >
                                    &quot;{d.example}&quot;
                                  </span>
                                )}
                              </li>
                            ))}
                          </ol>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Google Organic Search Results */}
                {searchResults.googleResults && searchResults.googleResults.length > 0 && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px", marginTop: "8px" }}>
                    <h5 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 12px 0", color: "hsl(220,85%,65%)" }}>
                      Google Web Results
                    </h5>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {searchResults.googleResults.map((res: any, idx: number) => (
                        <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", wordBreak: "break-all" }}>
                            {res.link}
                          </span>
                          <a
                            href={res.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: "1rem",
                              fontWeight: 600,
                              color: "hsl(220,90%,70%)",
                              textDecoration: "none",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                          >
                            {res.title}
                          </a>
                          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.4 }}>
                            {res.snippet}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* ─── Spy Warning Modal ─── */}
      {spyWarningConfig && createPortal(
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
          onClick={() => setSpyWarningConfig(null)}
        >
          <div
            className="scale-up"
            style={{
              background: "var(--bg-surface-raised)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-lg)",
              padding: "24px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px 0", fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, color: "var(--color-assassin)" }}>
              Warning
            </h3>
            <p style={{ margin: "0 0 24px 0", fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              <strong style={{ color: "var(--text-primary)" }}>{spyWarningConfig.spyName}</strong> is already a spy for the {spyWarningConfig.team.toUpperCase()} Team. Do you want to continue?
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => setSpyWarningConfig(null)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-default)",
                  background: "transparent",
                  color: "var(--text-secondary)",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  transition: "all 0.15s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--text-primary)")}
                onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleJoinTeamRole(spyWarningConfig.team, spyWarningConfig.role, spyWarningConfig.targetPlayerId, true);
                  setSpyWarningConfig(null);
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: "var(--accent)",
                  color: "var(--accent-text-on)",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  transition: "all 0.15s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
                onMouseOut={(e) => (e.currentTarget.style.background = "var(--accent)")}
              >
                Continue
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ─── Floating Chat & Game Log Panel ─── */}
      {createPortal(
        <>
          <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999 }}>
            <button
              onClick={() => {
                setIsChatFloatingOpen((prev) => !prev);
                if (!isChatFloatingOpen) {
                  setUnreadLog(false);
                }
              }}
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--accent)",
                color: "var(--accent-text-on)",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 6px 24px rgba(232, 163, 61, 0.4)",
                transition: "transform 0.2s ease, background-color 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.08)";
                e.currentTarget.style.background = "var(--accent-hover)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.background = "var(--accent)";
              }}
              title={isChatFloatingOpen ? t("profile.cancel") : "Open Chat & Log"}
            >
              {isChatFloatingOpen ? (
                /* Close/X Icon */
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                /* Speech Bubble / Chat Icon */
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              )}

              {/* Notification Dot */}
              {!isChatFloatingOpen && unreadLog && (
                <span
                  style={{
                    position: "absolute",
                    top: "2px",
                    right: "2px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    backgroundColor: "hsl(355,85%,58%)",
                    boxShadow: "0 0 10px hsl(355,85%,58%)",
                    border: "2px solid var(--bg-surface-raised)",
                  }}
                />
              )}
            </button>
          </div>

          {/* Floating Panel */}
          {isChatFloatingOpen && renderChatAndLogPanel()}
        </>,
        document.body
      )}
    </div>
  );
}

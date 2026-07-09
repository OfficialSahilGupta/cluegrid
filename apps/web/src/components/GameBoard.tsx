import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { Socket } from "socket.io-client";
import { getWordPack } from "@cluegrid/wordpacks";
import type { RoomState, CardState, TeamIdentifier, PlayerRole, ChatMessage, GameLogEntry, Player } from "@cluegrid/shared";
import { useAuth } from "../context/AuthContext.js";
import { Identicon } from "./Identicon.js";
import { useTranslation } from "react-i18next";
import { GatedUpsellModal } from "./GatedUpsellModal.js";
import { MusicPlayer } from "./MusicPlayer.js";
import { ProfileSettingsModal } from "./ProfileSettingsModal.js";
import { ChatMessageBubble } from "./ChatMessageBubble.js";
import { renderAvatar } from "../utils/avatar";

const ALL_LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "ne", name: "नेपाली", flag: "🇳🇵" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
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
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" }
];

function getTranslatedCardWord(word: string, roomLanguage: string, uiLanguage: string): string {
  try {
    const sourcePack = getWordPack(roomLanguage || "en");
    const idx = sourcePack.indexOf(word.toUpperCase());
    if (idx !== -1) {
      const targetPack = getWordPack(uiLanguage || "en");
      const targetWord = targetPack[idx];
      if (targetWord) {
        return targetWord;
      }
    }
  } catch (e) {
    // fallback
  }
  return word;
}

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

// ─── Custom Premium Timer Icons ──────────────────────────────────────────────
const renderOffIcon = (color: string) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "all 0.2s ease" }}>
    <circle cx="12" cy="12" r="10" opacity="0.3" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);

const renderFastIcon = (color: string) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "all 0.2s ease" }}>
    <circle cx="12" cy="12" r="10" opacity="0.2" />
    <line x1="12" y1="2" x2="12" y2="5" />
    <path d="M12 9v4l2.5 2.5" />
    <path d="M16.24 7.76a6 6 0 1 1-8.49 0" />
    <path d="M2 12h3M19 12h3" opacity="0.5" />
  </svg>
);

const renderLongIcon = (color: string) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "all 0.2s ease" }}>
    <path d="M5 2h14M5 22h14" />
    <path d="M19 2v3a7 7 0 0 1-5 6.68V13.3a7 7 0 0 1 5 6.7v2H5v-2a7 7 0 0 1 5-6.7v-1.62A7 7 0 0 1 5 5V2h14z" />
    <path d="M12 5v2" opacity="0.4" />
    <path d="M10 18h4" opacity="0.7" />
    <circle cx="12" cy="17" r="1" fill={color} stroke="none" />
  </svg>
);

const renderCustomIcon = (color: string) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "all 0.2s ease" }}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const getWatermarkImage = (color: string, role: "operative" | "spymaster") => {
  if (color === "red") {
    return role === "operative" 
      ? "/game-board-card/teams-card/happy-1.webp" 
      : "/game-board-card/teams-card/happy-2.webp";
  }
  if (color === "blue") {
    return role === "operative" 
      ? "/game-board-card/teams-card/happy-6.webp" 
      : "/game-board-card/teams-card/happy-7.webp";
  }
  if (color === "green") {
    return role === "operative" 
      ? "/game-board-card/whilte-flips/sad-5.webp" 
      : "/game-board-card/whilte-flips/sad-6.webp";
  }
  if (color === "yellow") {
    return role === "operative" 
      ? "/game-board-card/whilte-flips/sad-3.webp" 
      : "/game-board-card/teams-card/happy-2.webp";
  }
  return "";
};

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

function triggerHaptics(pattern: number | number[]) {
  // navigator.vibrate disabled
}

function playBeep(frequency = 440, type: OscillatorType = "sine") {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
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

    const playTone = (freq: number, duration: number, delay: number, type: OscillatorType = "sine", gainVal = 0.5) => {
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
      playTone(220.00, 0.40, 0, "sawtooth", 0.3); // A3
      playTone(223.00, 0.40, 0, "sawtooth", 0.3);
    } else if (emoji === "👏") {
      // Double claps
      playTone(880.00, 0.06, 0, "triangle", 0.6); // A5
      playTone(880.00, 0.06, 120, "triangle", 0.6);
    }
  } catch (e) {
    // ignore
  }
}

const getTeamBgColor = (team: string | null | undefined) => {
  if (team === "red" || team === "team-1") return "var(--team-1-bg)";
  if (team === "blue" || team === "team-2") return "var(--team-2-bg)";
  if (team === "green" || team === "team-3") return "var(--team-3-bg)";
  if (team === "yellow" || team === "team-4") return "var(--team-4-bg)";
  return "var(--bg-surface-raised)";
};

const getTeamTranslucentBg = (type: string | null | undefined) => {
  if (!type) return "transparent";
  if (type === "red" || type === "team-1") return "rgba(240, 113, 103, 0.16)";
  if (type === "blue" || type === "team-2") return "rgba(74, 144, 226, 0.16)";
  if (type === "green" || type === "team-3") return "rgba(16, 185, 129, 0.16)";
  if (type === "yellow" || type === "team-4") return "rgba(255, 145, 0, 0.16)";
  if (type === "neutral") return "rgba(148, 163, 184, 0.15)";
  if (type === "assassin") return "rgba(15, 15, 18, 0.4)";
  return "transparent";
};



const getTeamDarkColor = (team: string | null | undefined) => {
  const normTeam = (team === "team-1" ? "red" : team === "team-2" ? "blue" : team === "team-3" ? "green" : team === "team-4" ? "yellow" : team);
  if (normTeam && typeColors[normTeam]) {
    return typeColors[normTeam].text || typeColors[normTeam].border;
  }
  if (normTeam === "red") return "var(--team-1)";
  if (normTeam === "blue") return "var(--team-2)";
  if (normTeam === "green") return "var(--team-3)";
  if (normTeam === "yellow") return "var(--team-4)";
  return "var(--border-default)";
};

const getTeamAvatarBorderColor = (team: string | null | undefined) => {
  if (team === "red" || team === "team-1") return "var(--team-1)";
  if (team === "blue" || team === "team-2") return "var(--team-2)";
  if (team === "green" || team === "team-3") return "var(--team-3)";
  if (team === "yellow" || team === "team-4") return "var(--team-4)";
  return "var(--border-default)";
};

interface GameBoardProps {
  room: RoomState;
  playerId: string;
  socket: Socket | null;
  lightMode: boolean;
  setLightMode: (val: boolean) => void;
  setGlobalConfirm: (config: { title: string; message: string; onConfirm: () => void; isWarning?: boolean } | null) => void;
  setGatedFeature: (featureName: string | null) => void;
  onOpenAuth: () => void;
}

export function GameBoard({ room, playerId, socket, lightMode, setLightMode, setGlobalConfirm, setGatedFeature, onOpenAuth }: GameBoardProps) {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const { cols, rows } = room.gridConfig;
  const board = room.board as CardState[];

  // Clue Form state
  const [clueWord, setClueWord] = useState("");
  const [clueCount, setClueCount] = useState<number | null>(null);
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
  const [alternateTabLabel, setAlternateTabLabel] = useState<"log" | "chat">("log");

  // Alternates the closed FAB label between LOG and CHAT every 5 seconds
  useEffect(() => {
    if (isChatFloatingOpen) return;
    const interval = setInterval(() => {
      setAlternateTabLabel((prev) => (prev === "log" ? "chat" : "log"));
    }, 5000);
    return () => clearInterval(interval);
  }, [isChatFloatingOpen]);


  // Collapsible Stats Card state
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [profileSettingsOpen, setProfileSettingsOpen] = useState(false);
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
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => localStorage.getItem("cluegrid_sound_enabled") !== "false");
  const [soundVolume, setSoundVolume] = useState<number>(() => Number(localStorage.getItem("cluegrid_sound_volume") ?? "5"));

  // Active Switching Player State
  const [activeSwitchPlayerId, setActiveSwitchPlayerId] = useState<string | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(typeof window !== "undefined" ? window.innerWidth <= 768 : false);
  useEffect(() => {
    const handleResize = () => setIsMobileViewport(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [votedCardIds, setVotedCardIds] = useState<number[]>([]);
  const [showWordCardIds, setShowWordCardIds] = useState<number[]>([]);
  const [clueSelectedCardIds, setClueSelectedCardIds] = useState<number[]>([]);
  const [recentlyFlippedCardIds, setRecentlyFlippedCardIds] = useState<number[]>([]);

  // Preload Card Character WebP Assets in background to achieve 100% performance (Zero paint lag on flips)
  useEffect(() => {
    const imagesToPreload = [
      "/game-board-card/black-card/assassin-card.webp",
      ...Array.from({ length: 10 }, (_, i) => `/game-board-card/teams-card/happy-${i + 1}.webp`),
      ...Array.from({ length: 6 }, (_, i) => `/game-board-card/whilte-flips/sad-${i + 1}.webp`)
    ];
    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);
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
  const soundVolumeRef = useRef(soundVolume);
  const lastVolumeRef = useRef<number>(soundVolume > 0 ? soundVolume : 5);
  const lastActiveTeamRef = useRef<string | null>(null);

  useEffect(() => {
    roomPlayersRef.current = room.players;
    roomBoardRef.current = room.board;
    soundEnabledRef.current = soundEnabled;
    soundVolumeRef.current = soundVolume;
    localStorage.setItem("cluegrid_sound_enabled", String(soundEnabled));
    localStorage.setItem("cluegrid_sound_volume", String(soundVolume));
  });

  // Close player assign popover when clicking outside or scrolling
  useEffect(() => {
    if (!activeSwitchPlayerId) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".assign-popover-card") && !target.closest(".player-row-wrapper")) {
        setActiveSwitchPlayerId(null);
        
      }
    };

    const handleScrollClose = () => {
      setActiveSwitchPlayerId(null);
      
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    window.addEventListener("scroll", handleScrollClose, { passive: true });
    
    // Also listen to main page container scroll if any
    const viewport = document.getElementById("game-board-viewport");
    if (viewport) {
      viewport.addEventListener("scroll", handleScrollClose, { passive: true });
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      window.removeEventListener("scroll", handleScrollClose);
      if (viewport) {
        viewport.removeEventListener("scroll", handleScrollClose);
      }
    };
  }, [activeSwitchPlayerId]);

  // Lock body scroll when overlay popups are active to prevent background scrolling
  useEffect(() => {
    const viewport = document.getElementById("game-board-viewport");
    if (statsExpanded || profileSettingsOpen) {
      if (viewport) viewport.style.overflowY = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      if (viewport) viewport.style.overflowY = "auto";
      document.body.style.overflow = "";
    }
    return () => {
      if (viewport) viewport.style.overflowY = "auto";
      document.body.style.overflow = "";
    };
  }, [statsExpanded, profileSettingsOpen]);



  useEffect(() => {
    const originalAC = window.AudioContext;
    const originalWebkitAC = (window as any).webkitAudioContext;
    const AC = originalAC || originalWebkitAC;

    if (!AC) return;

    const originalCreateGain = AC.prototype.createGain;

    AC.prototype.createGain = function(this: AudioContext) {
      const gainNode = originalCreateGain.apply(this, arguments as any);
      const gainParam = gainNode.gain;

      const originalSetValueAtTime = gainParam.setValueAtTime;
      const originalLinearRampToValueAtTime = gainParam.linearRampToValueAtTime;
      const originalExponentialRampToValueAtTime = gainParam.exponentialRampToValueAtTime;

      gainParam.setValueAtTime = function(value: number, startTime: number) {
        const scaledValue = value * (soundVolumeRef.current / 100);
        return originalSetValueAtTime.call(this, scaledValue, startTime);
      };

      gainParam.linearRampToValueAtTime = function(value: number, endTime: number) {
        const scaledValue = value * (soundVolumeRef.current / 100);
        return originalLinearRampToValueAtTime.call(this, scaledValue, endTime);
      };

      gainParam.exponentialRampToValueAtTime = function(value: number, endTime: number) {
        const scaledValue = Math.max(0.0001, value * (soundVolumeRef.current / 100));
        return originalExponentialRampToValueAtTime.call(this, scaledValue, endTime);
      };

      return gainNode;
    };

    return () => {
      AC.prototype.createGain = originalCreateGain;
    };
  }, []);

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
            
            gainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);
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

        // Smoothly scroll down to the card deck grid container
        const viewportEl = document.getElementById("game-board-viewport");
        const boardEl = document.getElementById("game-board-container");
        if (viewportEl && boardEl) {
          viewportEl.scrollTo({
            top: boardEl.offsetTop - 30, // offset a bit for a clean spacing margin
            behavior: "smooth",
          });
        } else if (boardEl) {
          boardEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
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

  const playReliefSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const now = audioCtx.currentTime;

      // Frequencies for a beautiful, rich, warm C Major 9 chord (C3, G3, E4, B4, D5)
      const freqs = [130.81, 196.00, 329.63, 493.88, 587.33];
      const duration = 3.5; // 3.5 seconds

      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime(idx * 3 - 6, now);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.6);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start(now);
        osc.stop(now + duration);
      });
    } catch (e) {
      // ignore
    }
  };

  // ─── Rich Audio Library ────────────────────────────────────────────────────

  /** Bright ascending 3-note pop — for joining a team/role slot (different from card-click) */
  const playRoleTapSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const now = audioCtx.currentTime;
      // Three ascending notes: E5 → G5 → B5, each 60ms apart
      ([[659.25, 0], [783.99, 0.06], [987.77, 0.12]] as [number, number][]).forEach(([freq, delay]) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.85, now + delay + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(now + delay); osc.stop(now + delay + 0.2);
      });
    } catch { /* ignore */ }
  };

  /** Low ominous warning drone — for Reset Game / Return to Lobby */
  const playWarningSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const now = audioCtx.currentTime;
      // Heavy sub-bass thud
      const bass = audioCtx.createOscillator();
      const bassGain = audioCtx.createGain();
      bass.type = 'sine';
      bass.frequency.setValueAtTime(80, now);
      bass.frequency.exponentialRampToValueAtTime(40, now + 0.6);
      bassGain.gain.setValueAtTime(1.0, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      bass.connect(bassGain); bassGain.connect(audioCtx.destination);
      bass.start(now); bass.stop(now + 0.6);
      // Minor chord sting: A2 + E♭3 (tritone — unsettling)
      ([[110, 0.05], [155.56, 0.08]] as [number, number][]).forEach(([freq, delay]) => {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + delay);
        g.gain.setValueAtTime(0.55, now + delay);
        g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.7);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(now + delay); osc.stop(now + delay + 0.75);
      });
    } catch { /* ignore */ }
  };

  /** Airy, light navigation click — navbar links */
  const playNavClick = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.04);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.14);
    } catch { /* ignore */ }
  };

  /** Two-note toggle pop — game mode (Multi-team / Duet) */
  const playModeToggle = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const now = audioCtx.currentTime;
      ([[440, 0], [660, 0.07]] as [number, number][]).forEach(([freq, delay]) => {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + delay);
        g.gain.setValueAtTime(0.6, now + delay);
        g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.15);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(now + delay); osc.stop(now + delay + 0.18);
      });
    } catch { /* ignore */ }
  };

  /** Rising numeric tone per team count — 2 teams=2 tones, 3=3, 4=4 */
  const playTeamCountSelect = (count: number) => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const now = audioCtx.currentTime;
      const scale = [261.63, 329.63, 392.00, 523.25]; // C4 E4 G4 C5
      for (let i = 0; i < count && i < scale.length; i++) {
        const delay = i * 0.07;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(scale[i]!, now + delay);
        g.gain.setValueAtTime(0.7, now + delay);
        g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.2);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(now + delay); osc.stop(now + delay + 0.22);
      }
    } catch { /* ignore */ }
  };

  /** Soft globe shimmer — language selection */
  const playLangSelect = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const now = audioCtx.currentTime;
      // Shimmering high tones
      [1046.5, 1318.5, 1567.98].forEach((freq, i) => {
        const delay = i * 0.05;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);
        g.gain.setValueAtTime(0, now + delay);
        g.gain.linearRampToValueAtTime(0.45, now + delay + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.35);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(now + delay); osc.stop(now + delay + 0.38);
      });
    } catch { /* ignore */ }
  };

  /** Calm ethereal wind chime — feedback */
  const playFeedbackSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const now = audioCtx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const delay = i * 0.12;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);
        g.gain.setValueAtTime(0, now + delay);
        g.gain.linearRampToValueAtTime(0.3, now + delay + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.8);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(now + delay); osc.stop(now + delay + 0.85);
      });
    } catch { /* ignore */ }
  };

  /** Clean mechanical toggle — timer action / timer mode / AFK / preferences */
  const playSettingsToggle = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const now = audioCtx.currentTime;
      // Double pop chime: E5 and A5 slightly offset for a premium tactile toggle feel
      ([[659.25, 0], [880.00, 0.035]] as [number, number][]).forEach(([freq, delay]) => {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);
        g.gain.setValueAtTime(0.55, now + delay);
        g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(now + delay); osc.stop(now + delay + 0.09);
      });
    } catch { /* ignore */ }
  };

  /** Deep ominous chord — assassin rule selection */
  const playAssassinRuleSelect = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const now = audioCtx.currentTime;
      // Deep sub-bass sweep using a smooth triangle wave for cinematic impact
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.4);
      g.gain.setValueAtTime(0.95, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(g); g.connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.55);
    } catch { /* ignore */ }
  };

  /** Crystalline glass ding — lookup meaning / peek */
  const playGlassDing = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2093, now); // C7 — crystal bell range
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.75, now + 0.008);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.connect(g); g.connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 1.25);
    } catch { /* ignore */ }
  };

  /** Triumphant two-tone announcement — turn shift to new team */
  const playTurnShiftChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const now = audioCtx.currentTime;
      // G4 → C5 — a clean herald interval
      ([[392.00, 0], [523.25, 0.14]] as [number, number][]).forEach(([freq, delay]) => {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + delay);
        g.gain.setValueAtTime(0, now + delay);
        g.gain.linearRampToValueAtTime(0.9, now + delay + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.45);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(now + delay); osc.stop(now + delay + 0.5);
      });
    } catch { /* ignore */ }
  };

  // ──────────────────────────────────────────────────────────────────────────

  const playPremiumRichClick = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const now = audioCtx.currentTime;

      // Transient oscillator (sharp snap)
      const snapOsc = audioCtx.createOscillator();
      const snapGain = audioCtx.createGain();
      snapOsc.type = "triangle";
      snapOsc.frequency.setValueAtTime(1200, now);
      snapOsc.frequency.exponentialRampToValueAtTime(300, now + 0.02);
      snapGain.gain.setValueAtTime(0.8, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      snapOsc.connect(snapGain);
      snapGain.connect(audioCtx.destination);
      snapOsc.start(now);
      snapOsc.stop(now + 0.02);

      // Resonant body oscillator (warm woody/metallic resonance)
      const bodyOsc = audioCtx.createOscillator();
      const bodyGain = audioCtx.createGain();
      bodyOsc.type = "sine";
      bodyOsc.frequency.setValueAtTime(440, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
      bodyGain.gain.setValueAtTime(0.7, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      bodyOsc.connect(bodyGain);
      bodyGain.connect(audioCtx.destination);
      bodyOsc.start(now);
      bodyOsc.stop(now + 0.08);
    } catch (e) {
      // ignore
    }
  };


  const playClueSelectionSound = () => {
    playPremiumRichClick();
  };

  const playHapticClick = (gainVal = 0.12) => {
    // playHapticClick disabled
  };

  const playOperativeAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const now = audioCtx.currentTime;

      // A futuristic, bright dual-chime arpeggio (C5 -> E5 -> G5 -> C6) with high clarity
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const delay = idx * 0.08; // fast cascade
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator(); // layer with a perfect fifth above for richness
        const gainNode = audioCtx.createGain();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(freq, now + delay);
        
        osc2.type = "triangle"; // triangle gives warm harmonic body
        osc2.frequency.setValueAtTime(freq * 1.5, now + delay); // perfect 5th

        gainNode.gain.setValueAtTime(0, now + delay);
        gainNode.gain.linearRampToValueAtTime(0.8, now + delay + 0.02); // Full volume rise
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.35);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc1.start(now + delay);
        osc1.stop(now + delay + 0.35);
        osc2.start(now + delay);
        osc2.stop(now + delay + 0.35);
      });
    } catch (e) {
      // ignore
    }
  };

  const playClueSentSound = () => {
    if (!soundEnabled) return;
    try {
      const audio = new Audio("/cluegrid-music-effects/spy-clue-given.mp3");
      audio.volume = 0.5;
      audio.play().catch((err) => console.log("Audio play failed:", err));
    } catch (e) {
      // ignore
    }
  };

  const playEndTurnSound = () => {
    if (!soundEnabled) return;
    try {
      const audio = new Audio("/cluegrid-music-effects/end-turn.mp3");
      audio.volume = 0.5;
      audio.play().catch((err) => console.log("Audio play failed:", err));
    } catch (e) {
      // ignore
    }
  };

  const playCardFlipSound = (cardType: string) => {
    if (!soundEnabled) return;
    try {
      const activeTeam = lastActiveTeamRef.current || room.turnState?.activeTeam;
      let src = "";

      if (cardType === "assassin") {
        src = "/cluegrid-music-effects/black-card-flip.mp3";
      } else if (cardType === "neutral") {
        src = "/cluegrid-music-effects/wrong-card-flip.mp3";
      } else if (activeTeam && cardType === activeTeam) {
        src = "/cluegrid-music-effects/correct-card-flip.mp3";
      } else {
        // opponent team card
        src = "/cluegrid-music-effects/wrong-card-flip.mp3";
      }

      if (src) {
        const audio = new Audio(src);
        audio.volume = 0.5;
        audio.play().catch((err) => console.log("Audio play failed:", err));
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

      const playTone = (freq: number, duration: number, delay: number, type: OscillatorType = "sine", gainVal = 0.5) => {
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
      playTone(261.63, 0.15, 0, "triangle", 0.60);   // C4
      playTone(329.63, 0.15, 80, "triangle", 0.60);  // E4
      playTone(392.00, 0.15, 160, "triangle", 0.60); // G4
      playTone(523.25, 0.15, 240, "triangle", 0.60); // C5
      playTone(659.25, 0.15, 320, "triangle", 0.60); // E5
      playTone(783.99, 0.15, 400, "triangle", 0.60); // G5
      playTone(1046.50, 0.20, 480, "triangle", 0.60); // C6
      
      playTone(1174.66, 0.10, 560, "sine", 0.50); // D6
      playTone(1318.51, 0.10, 620, "sine", 0.50); // E6
      playTone(1567.98, 0.30, 680, "sine", 0.50); // G6
      
      const chordDelay = 780;
      playTone(523.25, 1.5, chordDelay, "sine", 0.50);   // C5
      playTone(659.25, 1.5, chordDelay, "sine", 0.50);   // E5
      playTone(783.99, 1.5, chordDelay, "sine", 0.50);   // G5
      playTone(1046.50, 1.5, chordDelay, "triangle", 0.40); // C6 (crisp chord edge)
      playTone(1318.51, 1.5, chordDelay, "triangle", 0.40); // E6 (crisp chord edge)
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

  // Listen for Spymaster giving a clue or end turn to play sounds
  useEffect(() => {
    if (room.turnState && room.phase === "playing") {
      const prevTurnState = prevTurnStateRef.current;
      const curClue = room.turnState.clueWord;
      const prevClue = prevTurnState?.clueWord;

      if (curClue && curClue !== prevClue) {
        // Skip playing if the local player is the spymaster who just submitted this clue
        const isActiveSpymaster = localPlayer?.role === "spymaster" && localPlayer?.team === prevTurnState?.activeTeam;
        if (!isActiveSpymaster) {
          playClueSentSound();
        }
        triggerNeuralStreams();
      }

      if (prevTurnState && room.turnState.activeTeam !== prevTurnState.activeTeam) {
        const cardFlipped = room.board && prevBoardRef.current.length > 0 && room.board.some((card) => {
          const prevCard = prevBoardRef.current.find((c) => c.id === card.id);
          return card.revealed && prevCard && !prevCard.revealed;
        });

        if (cardFlipped) {
          setTimeout(() => {
            playEndTurnSound();
          }, 1200);
        } else {
          playEndTurnSound();
        }
      }
    }
    prevTurnStateRef.current = room.turnState;
  }, [room.turnState, room.phase]);

  // Listen for Live Card Flips to trigger Sound and Animations
  useEffect(() => {
    if (!room.board || room.board.length === 0) return;

    if ((room.phase === "playing" || room.phase === "ended") && prevBoardRef.current.length > 0) {
      room.board.forEach((card) => {
        const prevCard = prevBoardRef.current.find((c) => c.id === card.id);
        if (card.revealed && prevCard && !prevCard.revealed) {
          // Play flip sound with full volume
          playCardFlipSound(card.type);
          
          // Trigger flip animation class (matches sound effect duration)
          const duration = card.type === "assassin" ? 1800 : (localPlayer?.team && card.type === localPlayer.team ? 1200 : 800);
          setRecentlyFlippedCardIds((prev) => [...prev, card.id]);
          setTimeout(() => {
            setRecentlyFlippedCardIds((prev) => prev.filter((id) => id !== card.id));
          }, duration);

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
    // Update the last active team ref after sound evaluations have completed
    if (room.turnState) {
      lastActiveTeamRef.current = room.turnState.activeTeam;
    }
  }, [room.board, room.phase, soundEnabled, localPlayer?.team, room.turnState]);

  // Listen for Victory transition to play fanfare sound
  useEffect(() => {
    if (room.winner && !prevWinnerRef.current) {
      const isAssassinRevealed = room.board && room.board.some((c) => c.type === "assassin" && c.revealed);
      if (!isAssassinRevealed) {
        playVictorySound();
      }
    }
    prevWinnerRef.current = room.winner || null;
  }, [room.winner, soundEnabled, room.board]);

  // Listen for turn/phase transitions to play the relief sound for active Spymasters
  useEffect(() => {
    if (room.phase === "playing" && room.turnState) {
      const prevTurnState = prevTurnStateRef.current;
      const isTeamShift = prevTurnState && prevTurnState.activeTeam !== room.turnState.activeTeam;
      const isNewGivingCluePhase = room.turnState.phase === "giving_clue" && (!prevTurnState || prevTurnState.phase !== "giving_clue" || isTeamShift);

      if (isNewGivingCluePhase) {
        // Play turn-shift chime for everyone whenever the active team changes
        if (isTeamShift || !prevTurnState) {
          playTurnShiftChime();
        }

        const isActiveSpymaster =
          localPlayer?.team === room.turnState.activeTeam &&
          localPlayer?.role === "spymaster";

        if (isActiveSpymaster) {
          playReliefSound();
        }
      }
    }
  }, [room.turnState?.activeTeam, room.turnState?.phase, room.phase, localPlayer?.team, localPlayer?.role]);

  // Global event listener to attach haptic click feedback to all buttons
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      
      const button = target.closest("button") || target.closest('[role="button"]');
      if (button) {
        playHapticClick();
      }
    };

    window.addEventListener("click", handleGlobalClick, { capture: true });
    return () => {
      window.removeEventListener("click", handleGlobalClick, { capture: true });
    };
  }, [soundEnabled]);

  const [isTimerModeDropdownOpen, setIsTimerModeDropdownOpen] = useState(false);


  // Google Meaning Search Overlay States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const renderGroupedPlayersCard = (side?: "left" | "right") => {
    const renderTeamSegment = (color: "red" | "blue" | "green" | "yellow", label: string) => {
      const teamObj = room.teams[color];
      const teamPlayers = room.players.filter((p) => p.team === color);
      const spymasters = teamPlayers.filter((p) => p.role === "spymaster");
      const operatives = teamPlayers.filter((p) => p.role === "operative" || (!p.role && p.team));
      const themeCol = typeColors[color]!;

      const activePlayer = room.players.find((p) => p.id === activeSwitchPlayerId);
      const showPopover = activePlayer && activePlayer.team === color;

      if (room.phase === "lobby") {
        // 1. Original simple layout style used in the game lobby
        return (
          <div
            key={color}
            style={{
              borderLeft: `3px solid ${themeCol.border}`,
              paddingLeft: "12px",
              marginBottom: "4px",
              flex: 1,
              minWidth: "180px",
              position: "relative",
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
                  <div style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", justifyContent: "center", gap: teamPlayers.length > 5 ? "4px" : "8px", marginBottom: "8px", width: "100%" }}>
                    {(() => {
                      const size = teamPlayers.length <= 4 ? 68 : (teamPlayers.length === 5 ? 58 : (teamPlayers.length === 6 ? 50 : 44));
                      return teamPlayers.map((p) => renderPlayerRow(p, size));
                    })()}
                  </div>
                ) : null}
                {localPlayer?.team !== color && (
                  !room.settings.roomLocked ? (
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
                  ) : (
                    <div style={{
                      width: "100%",
                      padding: "6px 8px",
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px dashed var(--border-default)",
                      color: "var(--text-muted)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      fontFamily: "var(--font-display)",
                      boxSizing: "border-box",
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      opacity: 0.6
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: "2px" }}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span>Locked</span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", boxSizing: "border-box" }}>
                {/* Operatives section */}
                <div>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>
                    Operatives
                  </div>
                  {operatives.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", justifyContent: "center", gap: operatives.length > 5 ? "4px" : "8px", marginBottom: "6px", width: "100%" }}>
                      {(() => {
                        const size = operatives.length <= 4 ? 68 : (operatives.length === 5 ? 58 : (operatives.length === 6 ? 50 : 44));
                        return operatives.map((p) => renderPlayerRow(p, size));
                      })()}
                    </div>
                  )}
                  {!room.settings.roomLocked ? (
                    (!localPlayer || localPlayer.team !== color || localPlayer.role !== "operative") && (
                      <button
                        onClick={() => handleJoinTeamRole(color, "operative")}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          background: "transparent",
                          border: `1px solid ${themeCol.border}`,
                          color: themeCol.text,
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
                          e.currentTarget.style.background = themeCol.border;
                          e.currentTarget.style.color = "#fff";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = themeCol.text;
                        }}
                      >
                        + JOIN TEAM
                      </button>
                    )
                  ) : (
                    operatives.length === 0 && (
                      <div style={{
                        width: "100%",
                        padding: "6px 8px",
                        background: "rgba(255, 255, 255, 0.02)",
                        border: "1px dashed var(--border-default)",
                        color: "var(--text-muted)",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        fontFamily: "var(--font-display)",
                        boxSizing: "border-box",
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        opacity: 0.6
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: "2px" }}>
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <span>Locked</span>
                      </div>
                    )
                  )}
                </div>

                {/* Spymasters section */}
                <div>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>
                    Spymasters
                  </div>
                  {spymasters.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", justifyContent: "center", gap: spymasters.length > 5 ? "4px" : "8px", marginBottom: "6px", width: "100%" }}>
                      {(() => {
                        const size = spymasters.length <= 4 ? 68 : (spymasters.length === 5 ? 58 : (spymasters.length === 6 ? 50 : 44));
                        return spymasters.map((p) => renderPlayerRow(p, size));
                      })()}
                    </div>
                  )}
                  {!room.settings.roomLocked ? (
                    (!localPlayer || localPlayer.team !== color || localPlayer.role !== "spymaster") && (
                      <button
                        onClick={() => handleJoinTeamRole(color, "spymaster")}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          background: "transparent",
                          border: `1px solid ${themeCol.border}`,
                          color: themeCol.text,
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
                          e.currentTarget.style.background = themeCol.border;
                          e.currentTarget.style.color = "#fff";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = themeCol.text;
                        }}
                      >
                        + JOIN TEAM
                      </button>
                    )
                  ) : (
                    spymasters.length === 0 && (
                      <div style={{
                        width: "100%",
                        padding: "6px 8px",
                        background: "rgba(255, 255, 255, 0.02)",
                        border: "1px dashed var(--border-default)",
                        color: "var(--text-muted)",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        fontFamily: "var(--font-display)",
                        boxSizing: "border-box",
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        opacity: 0.6
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: "2px" }}>
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <span>Locked</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }

      // 2. Redesigned layout style (Capsule name headers, Watermark role cards) used in the gameplay phase
      const greenPillButtonStyle: React.CSSProperties = {
        background: "linear-gradient(180deg, #10b981 0%, #047857 100%)",
        border: "1.5px solid rgba(255, 255, 255, 0.45)",
        borderRadius: "9999px",
        color: "#FFFFFF",
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: "0.9rem",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: "9px 18px",
        cursor: "pointer",
        boxShadow: "0 6px 14px rgba(0, 0, 0, 0.35)",
        width: "100%",
        boxSizing: "border-box",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
        transition: "all 0.15s ease",
      };

      const lockedButtonStyle: React.CSSProperties = {
        background: "rgba(0,0,0,0.35)",
        border: "1.5px dashed rgba(255,255,255,0.25)",
        borderRadius: "9999px",
        color: "rgba(255,255,255,0.55)",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "0.85rem",
        padding: "8px 18px",
        width: "100%",
        boxSizing: "border-box",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        opacity: 0.8,
        zIndex: 2,
      };

      const absoluteButtonStyle: React.CSSProperties = {
        ...greenPillButtonStyle,
        position: "absolute",
        bottom: "16px",
        left: "16px",
        width: "calc(100% - 32px)",
      };

      const lockedAbsoluteButtonStyle: React.CSSProperties = {
        ...lockedButtonStyle,
        position: "absolute",
        bottom: "16px",
        left: "16px",
        width: "calc(100% - 32px)",
      };

      const cardStyle = {
        bg: themeCol.bg,
        border: `2.5px solid ${themeCol.border}`,
        watermarkSpy: "👁️‍🗨️",
        watermarkOp: "🕵️‍♂️",
        watermarkMem: "👥",
      };

      const teamNameText = (teamObj?.name || label).toUpperCase();

      // Check if this specific card contains the active popover player
      const hasActiveCoopPopover = teamPlayers.some((p) => p.id === activeSwitchPlayerId);
      const hasActiveSpyPopover = spymasters.some((p) => p.id === activeSwitchPlayerId);
      const hasActiveOpPopover = operatives.some((p) => p.id === activeSwitchPlayerId);

      return (
        <div
          key={color}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            flex: 1,
            minWidth: "240px",
            position: "relative",
          }}
        >
          {/* Team Name Bubble Capsule Header */}
          <div
            style={{
              background: "linear-gradient(180deg, rgba(63, 63, 70, 0.95) 0%, rgba(39, 39, 42, 0.95) 100%)",
              border: `2.5px solid ${themeCol.border}`,
              padding: "8px 24px",
              borderRadius: "9999px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
              boxSizing: "border-box",
            }}
          >
            {isHost ? (
              <input
                type="text"
                defaultValue={teamObj?.name || ""}
                placeholder={label.toUpperCase()}
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
                  background: "transparent",
                  border: "none",
                  color: "#FFFFFF",
                  padding: "0",
                  fontSize: "1.1rem",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  width: "100%",
                  textAlign: "center",
                  outline: "none",
                  fontFamily: "var(--font-display)",
                }}
              />
            ) : (
              <span
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#FFFFFF",
                  fontFamily: "var(--font-display)",
                  textAlign: "center",
                }}
              >
                {teamNameText}
              </span>
            )}
          </div>

          {/* Team Role Containers (set to overflow: "visible" to prevent clipping role assignment popovers) */}
          {room.gameMode === "coop" ? (
            /* CO-OP Mode */
            <div
              style={{
                background: cardStyle.bg,
                border: cardStyle.border,
                borderRadius: "var(--radius-lg)",
                padding: "16px",
                minHeight: "150px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                overflow: "visible",
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.25)",
                boxSizing: "border-box",
                gap: "12px",
                zIndex: hasActiveCoopPopover ? 30 : 1,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "12px",
                  bottom: "6px",
                  fontSize: "100px",
                  lineHeight: 1,
                  opacity: 0.1,
                  pointerEvents: "none",
                  userSelect: "none",
                  zIndex: 1,
                }}
              >
                {cardStyle.watermarkMem}
              </div>

              <div style={{ zIndex: 2 }}>
                <div style={{ fontSize: "1.05rem", color: themeCol.text, textTransform: "uppercase", fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "0.05em", textAlign: "center", marginBottom: "8px" }}>
                  Members
                </div>
                {teamPlayers.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "8px", marginBottom: "4px" }}>
                    {teamPlayers.map((p) => renderPlayerRow(p))}
                  </div>
                ) : (
                  <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", fontStyle: "italic", textAlign: "center", margin: "12px 0" }}>No members active</div>
                )}
              </div>

              {localPlayer?.team !== color && (
                !room.settings.roomLocked ? (
                  <button
                    onClick={() => handleJoinTeamRole(color, "operative")}
                    style={greenPillButtonStyle}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.filter = "brightness(1.1)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.filter = "brightness(1)";
                    }}
                  >
                    Join Team
                  </button>
                ) : (
                  <div style={lockedButtonStyle}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: "2px" }}>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>Locked</span>
                  </div>
                )
              )}
            </div>
          ) : (
            /* COMPETITIVE Modes */
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", boxSizing: "border-box" }}>

              {/* Operatives Card */}
              <div
                style={{
                  background: cardStyle.bg,
                  border: cardStyle.border,
                  borderRadius: "var(--radius-lg)",
                  padding: "16px",
                  paddingBottom: "68px",
                  height: "195px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  position: "relative",
                  overflow: "visible",
                  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.25)",
                  boxSizing: "border-box",
                  gap: "12px",
                  zIndex: hasActiveOpPopover ? 30 : 1,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url(${getWatermarkImage(color, "operative")})`,
                    backgroundSize: "140%",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center 20%",
                    opacity: 0.28,
                    pointerEvents: "none",
                    userSelect: "none",
                    zIndex: 1,
                  }}
                />

                <div style={{ zIndex: 2 }}>
                  <div style={{ fontSize: "1.05rem", color: themeCol.text, textTransform: "uppercase", fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "0.05em", textAlign: "center", marginBottom: "8px" }}>
                    Operatives
                  </div>
                  {operatives.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", justifyContent: "center", gap: operatives.length > 5 ? "4px" : "8px", marginBottom: "4px", width: "100%" }}>
                      {(() => {
                        const size = operatives.length <= 4 ? 68 : (operatives.length === 5 ? 58 : (operatives.length === 6 ? 50 : 44));
                        return operatives.map((p) => renderPlayerRow(p, size));
                      })()}
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", fontStyle: "italic", textAlign: "center", margin: "12px 0" }}>No Operatives deployed</div>
                  )}
                </div>

                {!room.settings.roomLocked ? (
                  (!localPlayer || localPlayer.team !== color || localPlayer.role !== "operative") ? (
                    <button
                      onClick={() => handleJoinTeamRole(color, "operative")}
                      style={absoluteButtonStyle}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.filter = "brightness(1.1)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.filter = "brightness(1)";
                      }}
                    >
                      Join Operatives
                    </button>
                  ) : (
                    <button style={{ ...absoluteButtonStyle, visibility: "hidden" }}>Join Operatives</button>
                  )
                ) : (
                  operatives.length === 0 && (
                    <div style={lockedAbsoluteButtonStyle}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: "2px" }}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span>Locked</span>
                    </div>
                  )
                )}
              </div>

              {/* Spymasters Card */}
              <div
                style={{
                  background: cardStyle.bg,
                  border: cardStyle.border,
                  borderRadius: "var(--radius-lg)",
                  padding: "16px",
                  paddingBottom: "68px",
                  height: "195px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  position: "relative",
                  overflow: "visible",
                  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.25)",
                  boxSizing: "border-box",
                  gap: "12px",
                  zIndex: hasActiveSpyPopover ? 30 : 1,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url(${getWatermarkImage(color, "spymaster")})`,
                    backgroundSize: getWatermarkImage(color, "spymaster").includes("happy-2") ? "110%" : "140%",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: getWatermarkImage(color, "spymaster").includes("happy-2") ? "95% 10%" : "center 20%",
                    opacity: 0.28,
                    pointerEvents: "none",
                    userSelect: "none",
                    zIndex: 1,
                  }}
                />

                <div style={{ zIndex: 2 }}>
                  <div style={{ fontSize: "1.05rem", color: themeCol.text, textTransform: "uppercase", fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "0.05em", textAlign: "center", marginBottom: "8px" }}>
                    Spymasters
                  </div>
                  {spymasters.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", justifyContent: "center", gap: spymasters.length > 5 ? "4px" : "8px", marginBottom: "4px", width: "100%" }}>
                      {(() => {
                        const size = spymasters.length <= 4 ? 68 : (spymasters.length === 5 ? 58 : (spymasters.length === 6 ? 50 : 44));
                        return spymasters.map((p) => renderPlayerRow(p, size));
                      })()}
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", fontStyle: "italic", textAlign: "center", margin: "12px 0" }}>No Spymaster deployed</div>
                  )}
                </div>

                {!room.settings.roomLocked ? (
                  (!localPlayer || localPlayer.team !== color || localPlayer.role !== "spymaster") ? (
                    <button
                      onClick={() => handleJoinTeamRole(color, "spymaster")}
                      style={absoluteButtonStyle}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.filter = "brightness(1.1)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.filter = "brightness(1)";
                      }}
                    >
                      Join Spymasters
                    </button>
                  ) : (
                    <button style={{ ...absoluteButtonStyle, visibility: "hidden" }}>Join Spymasters</button>
                  )
                ) : (
                  spymasters.length === 0 && (
                    <div style={lockedAbsoluteButtonStyle}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: "2px" }}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span>Locked</span>
                    </div>
                  )
                )}
              </div>

            </div>
          )}
        </div>
      );
    };


    if (side) {
      const isLeft = side === "left";
      return (
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "20px",
            textAlign: "left",
            width: "100%",
          }}
        >
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 16px 0", color: isLeft ? "hsl(355,85%,58%)" : "var(--accent)" }}>
            {isLeft ? `${t("teams.red", "Red")} ${t("teams.team", "Team")}` : `${t("teams.blue", "Blue")} & Other ${t("teams.team", "Teams")}`}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {isLeft ? (
              renderTeamSegment("red", `${t("teams.red")} ${t("teams.team")}`)
            ) : (
              <>
                {renderTeamSegment("blue", `${t("teams.blue")} ${t("teams.team")}`)}
                {room.teamCount > 2 && renderTeamSegment("green", `${t("teams.green")} ${t("teams.team")}`)}
                {room.teamCount > 3 && renderTeamSegment("yellow", `${t("teams.yellow")} ${t("teams.team")}`)}
                {(() => {
                  const specs = room.players.filter((p) => !p.team);
                  if (specs.length === 0) return null;
                  const activePlayer = room.players.find((p) => p.id === activeSwitchPlayerId);
                  const showPopover = activePlayer && !activePlayer.team;
                  return (
                    <div
                      style={{
                        borderLeft: "3px solid rgba(255,255,255,0.2)",
                        paddingLeft: "12px",
                        marginTop: "8px",
                        position: "relative",
                      }}
                    >
                      <h4 style={{ margin: "0 0 10px 0", fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, color: "var(--color-text-muted)" }}>
                        {t("roles.spectator", "Spectators")}
                      </h4>
                      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "8px" }}>
                        {specs.map((p) => renderPlayerRow(p))}
                      </div>
                      
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      );
    }

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
            
            {/* All Teams in one row */}
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", width: "100%" }}>
              {renderTeamSegment("red", `${t("teams.red")} ${t("teams.team")}`)}
              {renderTeamSegment("blue", `${t("teams.blue")} ${t("teams.team")}`)}
              {room.teamCount > 2 && renderTeamSegment("green", `${t("teams.green")} ${t("teams.team")}`)}
              {room.teamCount > 3 && renderTeamSegment("yellow", `${t("teams.yellow")} ${t("teams.team")}`)}
            </div>

            {/* Spectators / Unassigned Group */}
            {(() => {
              const specs = room.players.filter((p) => !p.team);
              if (specs.length === 0) return null;
              const activePlayer = room.players.find((p) => p.id === activeSwitchPlayerId);
              const showPopover = activePlayer && !activePlayer.team;
              return (
                <div
                  style={{
                    borderLeft: "3px solid rgba(255,255,255,0.2)",
                    paddingLeft: "12px",
                    marginTop: "8px",
                    position: "relative",
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

  
  const renderLobbyLayout = () => {
    return (
      <>
        {/* Column 1 (Left): Consolidated Settings Card (Host Settings, Timer Action, Preferences) */}
        <div className="lobby-col-settings" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {renderSettingsCard()}
        </div>

        {/* Column 2 (Center): Unified Room Players Card & Action Controls */}
        <div className="lobby-col-players" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {renderGroupedPlayersCard()}

          {/* Action Row Card (Start Game & Spectate rendered side-by-side in one compact line) */}
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "12px 18px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* Start Game Action Container */}
            <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
              {isHost ? (
                <button
                  onClick={handleStartGame}
                  style={{
                    width: "100%",
                    padding: "9px 18px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--accent)",
                    color: "var(--accent-text-on)",
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    border: "none",
                    boxShadow: "0 3px 10px rgba(232, 163, 61, 0.18)",
                  }}
                >
                  Start Game
                </button>
              ) : (
                <div style={{ color: "var(--color-text-muted)", fontSize: "0.78rem", fontStyle: "italic", textAlign: "center", width: "100%" }}>
                  Waiting for Host...
                </div>
              )}
            </div>

            {/* Spectate Action Container */}
            {localPlayer?.team && !room.settings.roomLocked && (
              <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                <button
                  onClick={() => handleJoinTeamRole(null, null)}
                  style={{
                    width: "100%",
                    padding: "9px 18px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-surface-raised)",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  Spectate
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Column 3 (Right): Profiles & Actions (Unified in a single Card) */}
        <div
          className="lobby-col-profile"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            boxSizing: "border-box",
          }}
        >
          {/* User Profile Container (No individual borders) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              position: "relative",
              width: "100%",
            }}
          >
            <div
              onClick={() => setStatsExpanded(!statsExpanded)}
              style={{
                position: "relative",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(0, 0, 0, 0.2)",
                border: statsExpanded ? "2px solid var(--accent)" : "2px solid var(--color-border)",
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
              {renderAvatar(user ? user.avatar : (localPlayer?.avatar || "s1_0_0"), 52)}
              {user && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "2px",
                    right: "2px",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: (localPlayer?.connected !== false) ? "hsl(142,75%,45%)" : "hsl(355,85%,58%)",
                    border: "2px solid var(--color-surface)",
                  }}
                  title={localPlayer?.connected !== false ? "Online" : "Offline"}
                />
              )}
            </div>
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
            {statsExpanded && (
              <>
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0, 0, 0, 0.4)",
                    backdropFilter: "blur(1.5px)",
                    zIndex: 9998,
                    touchAction: "none",
                  }}
                  onClick={(e) => { e.stopPropagation(); setStatsExpanded(false); }}
                />
                <div
                  className="profile-popup-card scale-up lobby-popup"
                  style={{}}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)", paddingBottom: "8px" }}>
                    <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      Profile Settings & Stats
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setStatsExpanded(false); }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--color-text-muted)",
                        cursor: "pointer",
                        fontSize: "1.1rem",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="profile-popup-content" style={{ maxHeight: "360px", overflowY: "auto", paddingRight: "4px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setStatsExpanded(false);
                        setProfileSettingsOpen(true);
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: "var(--accent)",
                        color: "var(--accent-text-on)",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        marginTop: "4px",
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                      <span>Edit Username & Avatar</span>
                    </button>
                    <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                          My Status
                        </label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {["ACTIVE", "BRB", "AFK", ".zZ", "FOCUS", "BUSY", "THINKING", "COOKING"].map((st) => {
                            const isSelected = (localPlayer?.status || "ACTIVE") === st;
                            const teamColor = localPlayer?.team && typeColors[localPlayer.team]
                              ? typeColors[localPlayer.team]!.border
                              : "var(--color-text-muted)";
                            const teamTextOn = localPlayer?.team && typeColors[localPlayer.team]
                              ? "#fff"
                              : "var(--color-surface)";
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
                                  border: isSelected ? `1px solid ${teamColor}` : "1px solid var(--border-default)",
                                  background: isSelected ? teamColor : "var(--bg-surface-raised)",
                                  color: isSelected ? teamTextOn : "var(--text-primary)",
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
                      {!room.settings.roomLocked && (
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
                          )}</div>
                      )}
                    </div>
                    {user ? (
                      <>
                    <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, margin: "0 0 10px 0", color: "var(--text-primary)" }}>
                      My Stats & History
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                      <div style={{ background: "var(--bg-surface-raised)", padding: "8px", borderRadius: "4px", border: "1px solid var(--border-default)" }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Played</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>{user.stats.gamesPlayed}</div>
                      </div>
                      <div style={{ background: "var(--bg-surface-raised)", padding: "8px", borderRadius: "4px", border: "1px solid var(--border-default)" }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Won</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>{user.stats.gamesWon}</div>
                      </div>
                    </div>

                    {/* Sign Out — bottom of signed-in popup */}
                    <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px" }}>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          setStatsExpanded(false);
                          await logout();
                        }}
                        style={{
                          width: "100%",
                          padding: "9px 14px",
                          background: "rgba(239, 68, 68, 0.08)",
                          color: "hsl(355, 85%, 62%)",
                          border: "1px solid rgba(239, 68, 68, 0.25)",
                          borderRadius: "var(--radius-sm)",
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          fontFamily: "var(--font-display)",
                          transition: "all 0.15s ease",
                          letterSpacing: "0.04em",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "rgba(239, 68, 68, 0.18)";
                          e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
                          e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.25)";
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </>
                    ) : (
                       /* Guest — sign-in nudge */
                       <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "4px 0" }}>
                         <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                           You're playing as a guest. Sign in to save stats and track match history.
                         </p>

                         <button
                           onClick={(e) => { e.stopPropagation(); setStatsExpanded(false); onOpenAuth(); }}
                           style={{
                             padding: "8px 12px",
                             background: "transparent",
                             color: "var(--accent)",
                             border: "1.5px solid var(--accent)",
                             borderRadius: "var(--radius-sm)",
                             cursor: "pointer",
                             fontWeight: 700,
                             fontSize: "0.82rem",
                             fontFamily: "var(--font-display)",
                             letterSpacing: "0.04em",
                             transition: "all 0.15s ease",
                             display: "flex",
                             alignItems: "center",
                             gap: "6px",
                           }}
                           onMouseOver={(e) => { e.currentTarget.style.background = "rgba(232,163,61,0.12)"; }}
                           onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; }}
                         >
                           <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                             <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                             <polyline points="10 17 15 12 10 7" />
                             <line x1="15" y1="12" x2="3" y2="12" />
                           </svg>
                           Save My Wins — Sign Up Free
                         </button>
                       </div>
                     )}
              </div>
            </div>
          </>
        )}
          </div>
          
          {/* Music Player (Border removed as it is inside the unified container) */}
          <MusicPlayer onShowGatedUpsell={() => setGatedFeature("Personal Music Player Widget")} noBorder={true} />

          {/* Host Controls & Actions (Borders removed as it is inside the unified container) */}
          {isHost && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                width: "100%",
                borderTop: "1px solid var(--color-border)",
                paddingTop: "20px",
              }}
            >
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.0rem", margin: 0, fontWeight: 700, color: "var(--accent)" }}>
                Host Controls
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <button
                  disabled={room.settings.roomLocked}
                  onClick={() => {
                    triggerHaptics([250, 50, 250]);
                    playNavClick();
                    if (socket) socket.emit("randomize_teams", { roomCode: room.roomCode });
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    background: "transparent",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-primary)",
                    fontWeight: 700,
                    cursor: !room.settings.roomLocked ? "pointer" : "not-allowed",
                    opacity: !room.settings.roomLocked ? 1 : 0.4,
                    fontFamily: "var(--font-display)",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  Randomize Teams
                </button>
                <button
                  onClick={() => {
                    triggerHaptics([200]);
                    playNavClick();
                    if (socket) {
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
                    background: "transparent",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-primary)",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {room.settings.roomLocked ? "Unlock Room" : "Lock Room"}
                </button>
              </div>
            </div>
          )}

        </div>
      </>
    );
  };

  const renderGameplayLayout = () => {
    return (
      <>
        {/* Full-screen Centered Congratulations Modal Overlay */}
        {room.phase === "ended" && (
          <div
            id="congrats-modal"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(10, 10, 12, 0.88)",
              backdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 20000,
              padding: "20px",
              boxSizing: "border-box"
            }}
          >
            <style>{`
              @keyframes shine {
                0% { left: -100%; }
                100% { left: 200%; }
              }
            `}</style>
            <div
              className="scale-up"
              style={{
                background: "linear-gradient(135deg, rgba(var(--team-accent-rgb,232,163,61),0.12), rgba(var(--team-accent-rgb,232,163,61),0.06))",
                border: "2px solid var(--accent)",
                borderRadius: "var(--radius-lg)",
                padding: "36px 48px",
                textAlign: "center",
                maxWidth: "550px",
                width: "100%",
                boxShadow: "0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div 
                className="celebration-shine" 
                style={{ 
                  position: "absolute", 
                  inset: 0, 
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)", 
                  transform: "skewX(-20deg)", 
                  animation: "shine 3s infinite",
                  pointerEvents: "none"
                }} 
              />
              
              <h2 style={{
                fontFamily: "var(--font-display)",
                fontSize: "2.4rem",
                fontWeight: 900,
                background: "linear-gradient(90deg, #FFE082, #FFB300, #FFE082)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: 0,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                textShadow: "0 4px 15px rgba(255, 179, 0, 0.4)"
              }}>
                🎉 CONGRATULATIONS! 🎉
              </h2>
              
              <p style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                margin: 0,
                fontFamily: "var(--font-display)",
                letterSpacing: "0.04em"
              }}>
                {room.winner ? `${room.winner.toUpperCase()} TEAM WINS THE DECRYPTION MATCH!` : "MATCH COMPLETED!"}
              </p>
              
              <p style={{
                fontSize: "0.95rem",
                color: "var(--color-text-muted)",
                margin: 0,
                lineHeight: 1.6
              }}>
                Decryption grid solved successfully. The lobby host can reset the match from the room controls to start a new match.
              </p>

              <button
                onClick={() => {
                  const modal = document.getElementById("congrats-modal");
                  if (modal) modal.style.display = "none";
                }}
                style={{
                  marginTop: "12px",
                  padding: "10px 24px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--accent)",
                  color: "#1C1916",
                  fontWeight: 700,
                  border: "none",
                  fontFamily: "var(--font-display)",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(232,163,61,0.2)"
                }}
              >
                View Decryption Board
              </button>
            </div>
          </div>
        )}
        <style>{`
          @keyframes slow-shake {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(-6deg); }
            50% { transform: rotate(0deg); }
            75% { transform: rotate(6deg); }
            100% { transform: rotate(0deg); }
          }
          .premium-clock-shake {
            animation: slow-shake 3s ease-in-out infinite;
          }
        `}</style>
        {/* Top Horizontal Row: User Profile, Music Player, and Host Controls Unified in a Single Card */}
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "24px",
            display: "flex",
            gap: "32px",
            width: "100%",
            flexWrap: "wrap",
            alignItems: "stretch",
            marginBottom: "8px",
            boxSizing: "border-box",
          }}
        >
          {/* User Profile */}
          <div style={{ flex: "1 1 250px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            {/* User Profile Card / Statistics */}
          {/* User Profile Circular Widget */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              width: "100%",
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
                    background: (localPlayer?.connected !== false) ? "hsl(142,75%,45%)" : "hsl(355,85%,58%)",
                    border: "2px solid var(--color-surface)",
                  }}
                  title={localPlayer?.connected !== false ? "Online" : "Offline"}
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
              <>
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0, 0, 0, 0.4)",
                    backdropFilter: "blur(1.5px)",
                    zIndex: 9998,
                    touchAction: "none",
                  }}
                  onClick={(e) => { e.stopPropagation(); setStatsExpanded(false); }}
                />
                <div
                  className="profile-popup-card scale-up gameplay-popup"
                  style={{}}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)", paddingBottom: "8px" }}>
                    <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      Profile Settings & Stats
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setStatsExpanded(false); }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--color-text-muted)",
                        cursor: "pointer",
                        fontSize: "1.1rem",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="profile-popup-content" style={{ maxHeight: "360px", overflowY: "auto", paddingRight: "4px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setStatsExpanded(false);
                        setProfileSettingsOpen(true);
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: "var(--accent)",
                        color: "var(--accent-text-on)",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        marginTop: "4px",
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                      <span>Edit Username & Avatar</span>
                    </button>
                    {/* Profile Role & Status Settings */}
                    <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      {/* Status selector (single-line horizontal pill selection) */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                          My Status
                        </label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {["ACTIVE", "BRB", "AFK", ".zZ", "FOCUS", "BUSY", "THINKING", "COOKING"].map((st) => {
                            const isSelected = (localPlayer?.status || "ACTIVE") === st;
                            const teamColor = localPlayer?.team && typeColors[localPlayer.team]
                              ? typeColors[localPlayer.team]!.border
                              : "var(--color-text-muted)";
                            const teamTextOn = localPlayer?.team && typeColors[localPlayer.team]
                              ? "#fff"
                              : "var(--color-surface)";
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
                                  border: isSelected ? `1px solid ${teamColor}` : "1px solid var(--border-default)",
                                  background: isSelected ? teamColor : "var(--bg-surface-raised)",
                                  color: isSelected ? teamTextOn : "var(--text-primary)",
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
                      {!room.settings.roomLocked && (
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
                          )}</div>
                      )}
                    </div>

                    {user ? (
                      <>
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
                       /* Guest — sign-in nudge */
                       <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "4px 0" }}>
                         <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                           You're playing as a guest. Sign in to save stats and track match history.
                         </p>

                         <button
                           onClick={(e) => { e.stopPropagation(); setStatsExpanded(false); onOpenAuth(); }}
                           style={{
                             padding: "8px 12px",
                             background: "transparent",
                             color: "var(--accent)",
                             border: "1.5px solid var(--accent)",
                             borderRadius: "var(--radius-sm)",
                             cursor: "pointer",
                             fontWeight: 700,
                             fontSize: "0.82rem",
                             fontFamily: "var(--font-display)",
                             letterSpacing: "0.04em",
                             transition: "all 0.15s ease",
                             display: "flex",
                             alignItems: "center",
                             gap: "6px",
                           }}
                           onMouseOver={(e) => { e.currentTarget.style.background = "rgba(232,163,61,0.12)"; }}
                           onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; }}
                         >
                           <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                             <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                             <polyline points="10 17 15 12 10 7" />
                             <line x1="15" y1="12" x2="3" y2="12" />
                           </svg>
                           Save My Wins — Sign Up Free
                         </button>
                       </div>
                     )}
              </div>
            </div>
          </>
        )}
          </div>

          {/* Music Player Widget (Gated personal audio player) */}
          </div>
          
          {/* Music Player */}
          <div style={{ flex: "1 2 340px", display: "flex", flexDirection: "column", borderLeft: "1px solid var(--color-border)", borderRight: isHost ? "1px solid var(--color-border)" : "none", paddingLeft: "24px", paddingRight: isHost ? "24px" : "0" }}>
            <MusicPlayer onShowGatedUpsell={() => setGatedFeature("Personal Music Player Widget")} noBorder={true} />
          </div>

          {/* Host Controls */}
          {isHost && (
            <div style={{ flex: "1 1 250px", display: "flex", flexDirection: "column" }}>
              <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                width: "100%",
              }}
            >
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.0rem", margin: 0, fontWeight: 700, color: "var(--accent)" }}>
                Host Controls
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <button
                  disabled={room.settings.roomLocked}
                  onClick={() => {
                    triggerHaptics([250, 50, 250]);
                    playNavClick();
                    if (socket) socket.emit("randomize_teams", { roomCode: room.roomCode });
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    background: "transparent",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-primary)",
                    fontWeight: 700,
                    cursor: !room.settings.roomLocked ? "pointer" : "not-allowed",
                    opacity: !room.settings.roomLocked ? 1 : 0.4,
                    fontFamily: "var(--font-display)",
                    fontSize: "0.85rem",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onMouseOver={(e) => {
                    if (!room.settings.roomLocked) {
                      e.currentTarget.style.background = "var(--border-subtle)";
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 3 21 3 21 8" />
                    <line x1="4" y1="20" x2="21" y2="3" />
                    <polyline points="21 16 21 21 16 21" />
                    <line x1="15" y1="15" x2="21" y2="21" />
                    <line x1="4" y1="4" x2="9" y2="9" />
                  </svg>
                  <span>{t("settings.randomize", "Randomize Teams")}</span>
                </button>
                <button
                  onClick={() => {
                    triggerHaptics([250, 50, 250]);
                    playSettingsToggle();
                    if (socket) {
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
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.85rem",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = room.settings.roomLocked ? "rgba(239, 68, 68, 0.2)" : "rgba(232, 163, 61, 0.08)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = room.settings.roomLocked ? "rgba(239, 68, 68, 0.12)" : "transparent";
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {room.settings.roomLocked ? (
                      <>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </>
                    ) : (
                      <>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                      </>
                    )}
                  </svg>
                  <span>{room.settings.roomLocked ? t("settings.unlockRoom", "Unlock Room") : t("settings.lockRoom", "Lock Room")}</span>
                </button>
                <button
                  onClick={handleStartGame}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    background: "transparent",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-secondary)",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.85rem",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.color = "var(--text-primary)";
                    e.currentTarget.style.background = "rgba(232, 163, 61, 0.08)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-default)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                  <span>Reset Game</span>
                </button>
                <button
                  onClick={handleReturnToLobby}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    background: "transparent",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-secondary)",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.85rem",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.color = "var(--text-primary)";
                    e.currentTarget.style.background = "rgba(232, 163, 61, 0.08)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-default)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <span>Return to Lobby</span>
                </button>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Room Players card rendered at the top, above Turn Banner */}
        {room.phase !== "lobby" && (
          <div style={{ width: "100%", boxSizing: "border-box", position: "relative", zIndex: activeSwitchPlayerId ? 100 : 1 }}>
            {renderGroupedPlayersCard()}
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
                    gap: "24px",
                    textAlign: "left",
                    marginTop: "20px",
                    width: "100%",
                    boxSizing: "border-box",
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
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
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

              


              
        {/* Turn Banner */}
              <div
                id="clue-display-panel"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "14px",
                  position: "relative",
                  zIndex: 2,
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: "center", alignItems: "center", justifyContent: "center", flex: 1, minWidth: "280px", width: "100%" }}>
                  {room.phase === "playing" && room.turnState ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", flexWrap: "wrap", width: "100%" }}>
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
                            <span style={{
                              color: typeColors[room.turnState.activeTeam]!.light,
                              fontWeight: 800,
                              textTransform: "uppercase",
                              fontSize: "1.8rem",
                              letterSpacing: "1px",
                              textShadow: `0 0 10px ${typeColors[room.turnState.activeTeam]!.border}55`,
                            }}>
                              {typewriterText || room.turnState.clueWord || "[Secret Clue]"}
                              {typewriterCursor && <span className="clue-cursor" />}
                            </span>{" "}
                            · Count:{" "}
                            <span style={{
                              color: typeColors[room.turnState.activeTeam]!.light,
                              fontWeight: 800,
                              fontSize: "1.8rem",
                              textShadow: `0 0 10px ${typeColors[room.turnState.activeTeam]!.border}55`,
                            }}>
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
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", flexWrap: "wrap", width: "100%" }}>
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
                        }}
                      >
                        Game Over
                      </span>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 700, margin: 0 }}>
                        {room.winner ? `${formatTeamName(room.winner)} Team Wins!` : `No one wins!`}
                      </h3>
                    </div>
                  )}

                  
                    {/* Integrated Scores & Timer Row */}
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", justifyContent: "center", marginTop: "4px", width: "100%" }}>
                      {/* Inline Premium Shaking Timer badge at the end of Scores row with CLAIM OPPONENT TURN action */}
                      {room.phase === "playing" && (room.gameMode === "coop" || (room.settings.timerMode && room.settings.timerMode !== "off")) && (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {timerCount <= 0 && localPlayer && localPlayer.team !== room.turnState?.activeTeam && room.settings.timerAction === "manual" && (
                            <button
                              onClick={() => {
                                playNavClick();
                                if (socket) {
                                  socket.emit("end_turn", { roomCode: room.roomCode, playerId });
                                }
                              }}
                              style={{
                                background: "hsl(355, 85%, 58%)",
                                border: "none",
                                borderRadius: "var(--radius-sm)",
                                color: "#fff",
                                fontFamily: "var(--font-display)",
                                fontWeight: 700,
                                fontSize: "0.8rem",
                                padding: "6px 12px",
                                cursor: "pointer",
                                boxShadow: "0 0 10px rgba(239, 68, 68, 0.4)",
                                transition: "all 0.15s ease",
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = "hsl(355, 90%, 65%)";
                                e.currentTarget.style.transform = "scale(1.05)";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = "hsl(355, 85%, 58%)";
                                e.currentTarget.style.transform = "none";
                              }}
                            >
                              CLAIM OPPONENT TURN
                            </button>
                          )}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              background: "var(--color-surface)",
                              border: `1.5px solid ${timerCount <= 10 ? "hsl(355,85%,58%)" : "rgba(255, 255, 255, 0.15)"}`,
                              padding: "6px 14px",
                              borderRadius: "var(--radius-md)",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                              minHeight: "36px",
                              boxSizing: "border-box"
                            }}
                          >
                            <svg className="premium-clock-shake" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={timerCount <= 10 ? "hsl(355,85%,58%)" : "hsl(45, 85%, 55%)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transformOrigin: "center center" }}>
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span style={{
                              fontFamily: "var(--font-display)",
                              fontSize: "1.05rem",
                              fontWeight: 900,
                              fontVariantNumeric: "tabular-nums",
                              color: timerCount <= 10 ? "hsl(355,85%,58%)" : "var(--text-primary)"
                            }}>
                              {Math.floor(Math.max(0, timerCount) / 60)}:{(Math.max(0, timerCount) % 60) < 10 ? "0" : ""}{Math.max(0, timerCount) % 60}
                            </span>
                          </div>
                        </div>
                      )}

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
                      padding: "6px 12px",
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
                      padding: "6px 12px",
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
                          padding: "6px 12px",
                          borderRadius: "var(--radius-md)",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          opacity: state.eliminated ? 0.5 : 1,
                          minWidth: "140px",
                        }}
                      >
                        <div style={{ position: "relative", width: "10px", height: "28px", borderRadius: "5px", background: "rgba(255,255,255,0.08)", overflow: "hidden", flexShrink: 0 }}>
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
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: 700, fontFamily: "var(--font-display)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.06em", color: config.light }}>
                            {formatTeamName(team)}
                          </span>
                          <span style={{ fontWeight: 800, fontFamily: "var(--font-display)", fontSize: "1.1rem", color: state.eliminated ? "var(--color-text-muted)" : "var(--text-primary)", lineHeight: 1 }}>
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
                    </div>

                  {/* Centered Action Controls (End Turn, Waiting Status) */}
                  {(room.phase === "playing" && room.turnState && (
                    ((room.gameMode === "coop" &&
                        localPlayer?.team === (room.turnState.activeTeam === "red" ? "blue" : "red")) ||
                      (room.gameMode !== "coop" &&
                        localPlayer?.team === room.turnState.activeTeam &&
                        localPlayer?.role === "operative")) &&
                      room.turnState.phase === "guessing"
                  )) && (
                    <div style={{ display: "flex", justifyContent: "center", marginTop: "4px" }}>
                      <button
                        onClick={handleEndTurn}
                        style={{
                          padding: "10px 28px",
                          borderRadius: "var(--radius-md)",
                          background: "var(--accent)",
                          border: "none",
                          color: "#1C1916",
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          boxShadow: "0 4px 12px rgba(232, 163, 61, 0.25)"
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "var(--accent)")}
                      >
                        End Turn
                      </button>
                    </div>
                  )}
                  {room.phase === "ended" && !isHost && (
                    <div style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", fontStyle: "italic", marginTop: "4px", textAlign: "center" }}>
                      Waiting for Host to restart the game...
                    </div>
                  )}
                </div>
              </div>

              {/* Left Side: Game Board & Action forms */}
        <div className="game-main-col" style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Lobby Preset Forms */}
          {room.phase === "lobby" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Game Settings Card */}
              {renderSettingsCard()}

              {/* Room Players Card */}
              {renderGroupedPlayersCard()}



              {/* Spectate Action Card (Rendered in its own separate container) */}
              {localPlayer?.team && !room.settings.roomLocked && (
                <div
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <button
                    onClick={() => handleJoinTeamRole(null, null)}
                    style={{
                      width: "100%",
                      padding: "12px 20px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-surface-raised)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    Spectate (Join Spectators)
                  </button>
                </div>
              )}

              {/* Start Game Action Card (Rendered in its own separate container) */}
              <div
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                  gap: "12px",
                }}
              >
                {isHost ? (
                  <button
                    onClick={handleStartGame}
                    style={{
                      width: "100%",
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
                  <div style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", fontStyle: "italic", textAlign: "center", width: "100%" }}>
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
                    background: room.phase === "ended" ? "var(--bg-surface-solid)" : "rgba(4, 11, 13, 0.75)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.1)",
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

                    const happyImages = ["happy-1.webp", "happy-2.webp", "happy-3.webp", "happy-4.webp", "happy-5.webp", "happy-6.webp", "happy-7.webp", "happy-8.webp", "happy-9.webp", "happy-10.webp"];
                    const sadImages = ["sad-1.webp", "sad-2.webp", "sad-3.webp", "sad-4.webp", "sad-5.webp", "sad-6.webp"];
                    const getDeterministicIndex = (str: string, max: number) => {
                      let hash = 0;
                      for (let i = 0; i < str.length; i++) {
                        hash = str.charCodeAt(i) + ((hash << 5) - hash);
                      }
                      return Math.abs(hash) % max;
                    };

                    const isAssassinCard = assassinRevealedId === card.id;
                    const shockwaveOffset = shockwaveCardOffsets[card.id];
                    const cardClassName = [
                      recentlyFlippedCardIds.includes(card.id) ? "card-flipped-active" : "",
                      isAssassinCard ? "assassin-flip" : "",
                      shockwaveOffset ? "shockwave-push" : "",
                    ].filter(Boolean).join(" ");

                    let revealedCharacterUrl = "";
                    if (card.revealed && card.type) {
                      if (["red", "blue", "green", "yellow"].includes(card.type)) {
                        const idx = getDeterministicIndex(card.word, happyImages.length);
                        revealedCharacterUrl = `/game-board-card/teams-card/${happyImages[idx]}`;
                      } else if (card.type === "neutral") {
                        const idx = getDeterministicIndex(card.word, sadImages.length);
                        revealedCharacterUrl = `/game-board-card/whilte-flips/${sadImages[idx]}`;
                      } else if (card.type === "assassin") {
                        revealedCharacterUrl = `/game-board-card/black-card/assassin-card.webp`;
                      }
                    }

                    return (
                      <button
                        key={card.id}
                        data-card-id={card.id}
                        disabled={!isInteractive && !card.revealed}
                        onClick={() => handleCardClick(card.id)}
                        className={[cardClassName, "game-board-card"].filter(Boolean).join(" ")}
                        style={{
                          background: card.revealed ? colors.bg : "var(--bg-surface-raised)",
                          border: clueSelectedCardIds.includes(card.id)
                            ? `3.5px solid ${colors.light}`
                            : `2px solid ${colors.border}`,
                          borderRadius: "var(--radius-lg)",
                          padding: 0,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "stretch",
                          justifyContent: "stretch",
                          cursor: (isInteractive || card.revealed) ? "pointer" : "default",
                          minHeight: "clamp(80px, 18vw, 130px)",
                          position: "relative",
                          perspective: "1000px",
                          transformStyle: "preserve-3d",
                          boxShadow: card.revealed
                            ? "inset 0 4px 12px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.2)"
                            : clueSelectedCardIds.includes(card.id)
                              ? `0 0 20px ${colors.light}`
                              : "0 8px 16px rgba(0,0,0,0.25)",
                          transition: isDealingAnimationActive
                            ? "none"
                            : "transform 0.15s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.15s ease, border-color 0.15s ease",
                          transform: shockwaveOffset ? `translate(var(--push-x), var(--push-y))` : undefined,
                          "--push-x": shockwaveOffset ? `${shockwaveOffset.x}px` : "0px",
                          "--push-y": shockwaveOffset ? `${shockwaveOffset.y}px` : "0px",
                          overflow: "hidden",
                          animationDuration: recentlyFlippedCardIds.includes(card.id)
                            ? `${card.type === "assassin" ? 1.8 : (localPlayer?.team && card.type === localPlayer.team ? 1.2 : 0.8)}s`
                            : undefined,
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
                              ? `0 0 28px ${colors.light}`
                              : "0 16px 32px rgba(0,0,0,0.45)";
                            e.currentTarget.style.borderColor = clueSelectedCardIds.includes(card.id)
                              ? colors.light
                              : "rgba(255,255,255,0.45)";
                            e.currentTarget.style.setProperty('--glare-x', `${(x / rect.width) * 100}%`);
                            e.currentTarget.style.setProperty('--glare-y', `${(y / rect.height) * 100}%`);
                            e.currentTarget.style.setProperty('--glare-opacity', '0.18');
                          }
                        }}
                        onMouseOut={(e) => {
                          if (isInteractive) {
                            e.currentTarget.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
                            e.currentTarget.style.boxShadow = clueSelectedCardIds.includes(card.id)
                              ? `0 0 20px ${colors.light}`
                              : "0 8px 16px rgba(0,0,0,0.25)";
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
                            zIndex: 3,
                          }}
                        />

                        {/* Character Image Overlay for Flipped/Revealed Cards (Covers entire card) */}
                        {revealedCharacterUrl && (
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              backgroundImage: `url("${revealedCharacterUrl}")`,
                              backgroundSize: "cover",
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "center",
                              opacity: showWordCardIds.includes(card.id) ? 0.25 : 0.95,
                              pointerEvents: "none",
                              zIndex: 1,
                              borderRadius: "inherit",
                              transition: "opacity 0.25s ease",
                            }}
                          />
                        )}

                        {/* 1. TOP Identity Section */}
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            padding: "8px",
                            borderBottom: `1.5px solid ${colors.border}`,
                            background: (card.revealed || canSeeKey) ? getTeamTranslucentBg(card.type) : "transparent",
                            boxSizing: "border-box",
                          }}
                        >


                          {/* Reveal Status Badge (top right) */}
                          {(card.revealed || (canSeeKey && card.type === "assassin")) && !votedCardIds.includes(card.id) && (
                            <span
                              style={{
                                position: "absolute",
                                top: "6px",
                                right: "8px",
                                fontSize: "0.55rem",
                                fontWeight: 800,
                                textTransform: "uppercase",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                background: "rgba(0,0,0,0.45)",
                                color: colors.text,
                                border: "0.5px solid rgba(255,255,255,0.1)",
                                letterSpacing: "0.06em",
                                zIndex: 2,
                              }}
                            >
                              {card.type === "assassin" ? "black" : ""}
                              {card.revealed && (card.type === "assassin" ? " (REV)" : "REV")}
                            </span>
                          )}

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

                          {/* Real-time Voter Avatars Overlay (floats above divider inside top section) */}
                          {voters.length > 0 && (() => {
                            const count = voters.length;
                            const gap = count > 4 ? "2px" : "4px";
                            const padding = count > 4 ? "1px 4px 1px 1px" : "2px 6px 2px 2px";
                            const avSize = count > 4 ? 12 : 16;
                            const fSize = count > 4 ? "0.55rem" : "0.62rem";
                            const maxW = count > 4 ? "48px" : "64px";
                            return (
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: "6px",
                                  left: "8px",
                                  right: "8px",
                                  display: "flex",
                                  gap: gap,
                                  flexWrap: "wrap",
                                  zIndex: 4,
                                }}
                              >
                                {voters.map((v, index) => {
                                  const delay = `${(index * 200) % 1000}ms`;
                                  return (
                                    <div
                                      key={v.id}
                                      title={v.displayName}
                                      className="voter-badge-floating"
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: count > 4 ? "2px" : "4px",
                                        padding: padding,
                                        background: "rgba(0, 0, 0, 0.75)",
                                        border: "1px solid rgba(255, 255, 255, 0.2)",
                                        borderRadius: "12px",
                                        cursor: "default",
                                        animation: "voter-badge-entry 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) both, avatar-float 3s ease-in-out infinite alternate",
                                        animationDelay: `0s, ${delay}`,
                                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.4)",
                                        pointerEvents: "none",
                                      }}
                                    >
                                      <div style={{ display: "flex", borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                                        {renderAvatar(v.avatar || v.displayName.charAt(0), avSize)}
                                      </div>
                                      <span style={{
                                        fontFamily: "var(--font-sans)",
                                        fontSize: fSize,
                                        fontWeight: 700,
                                        color: "#fff",
                                        maxWidth: maxW,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        lineHeight: 1,
                                      }}>
                                        {v.displayName}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>

                        {/* 2. BOTTOM Word Capsule Section */}
                        <div
                          style={{
                            width: "100%",
                            padding: "10px 10px",
                            background: lightMode ? "rgba(0, 0, 0, 0.05)" : "rgba(0, 0, 0, 0.35)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 2,
                            boxSizing: "border-box",
                          }}
                        >
                          <span
                            className="game-card-word"
                            style={{
                              fontFamily: "var(--font-display)",
                              fontSize: card.word.length > 9
                                ? "clamp(0.6rem, 2.6vw, 0.95rem)"
                                : card.word.length > 7
                                  ? "clamp(0.75rem, 3.2vw, 1.1rem)"
                                  : "clamp(0.9rem, 3.8vw, 1.25rem)",
                              fontWeight: 900,
                              letterSpacing: "0.05em",
                              color: card.revealed
                                ? colors.text
                                : (lightMode ? "#1C1916" : "#FFFFFF"),
                              textAlign: "center",
                              whiteSpace: "nowrap",
                              lineHeight: 1.15,
                              opacity: card.revealed
                                ? showWordCardIds.includes(card.id)
                                  ? 1
                                  : 0
                                : canSeeKey
                                  ? 0.45
                                  : 1,
                              transform: "translateZ(20px)",
                              display: "block",
                              zIndex: 2,
                              textShadow: !card.revealed ? "0 1px 2px rgba(0,0,0,0.5)" : "none",
                              transition: "opacity 0.25s ease",
                            }}
                          >
                            {card.word}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>



        

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
                      padding: "16px 24px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      textAlign: "left",
                      marginTop: "-8px", /* Tighten gap with cards grid */
                      maxWidth: "600px",
                      width: "100%",
                      marginLeft: "auto",
                      marginRight: "auto",
                      boxSizing: "border-box",
                    }}
                  >
                    {room.gameMode === "coop" && (
                      <div style={{
                        background: "linear-gradient(135deg, rgba(var(--team-accent-rgb,232,163,61),0.08), rgba(var(--team-accent-rgb,232,163,61),0.04))",
                        border: "1px solid rgba(232,163,61,0.25)",
                        borderRadius: "var(--radius-sm)",
                        padding: "10px 14px",
                        fontSize: "0.82rem",
                        color: "var(--text-secondary)",
                        lineHeight: 1.6,
                        marginBottom: "12px",
                      }}>
                        💡 <strong style={{ color: "var(--accent)" }}>Duet Mode:</strong>{" "}
                        You can see the <strong style={{ color: typeColors[localPlayer?.team === "red" ? "blue" : "red"]?.light }}>
                          {localPlayer?.team === "red" ? "Blue" : "Red"} Team&apos;s cards
                        </strong> on the board. Give a clue that points to those cards — your partner will guess them!
                      </div>
                    )}
                    <div style={{ display: "flex", gap: isMobileViewport ? "8px" : "14px", alignItems: "center", width: "100%", flexWrap: "nowrap" }}>
                      <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                        <input
                          type="text"
                          placeholder="GIVE YOUR CLUE"
                          value={clueWord}
                          onChange={(e) => setClueWord(e.target.value)}
                          style={{
                            width: "100%",
                            padding: isMobileViewport ? "12px 14px" : "12px 20px",
                            borderRadius: "9999px",
                            border: "1px solid var(--border-default)",
                            background: "var(--bg-surface-raised)",
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            fontSize: "1.05rem",
                            letterSpacing: "0.06em",
                            outline: "none",
                            boxSizing: "border-box",
                            textAlign: "center",
                          }}
                        />
                      </div>

                      {/* Count Selector Trigger (-) */}
                      <div className="clue-count-selector-container" style={{ flexShrink: 0 }}>
                        <button
                          type="button"
                          className={`clue-count-trigger-btn ${clueCount !== null ? "active" : ""}`}
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "50%",
                            border: "1.5px solid var(--border-default)",
                            background: "var(--bg-surface-raised)",
                            color: "var(--accent)",
                            fontFamily: "var(--font-display)",
                            fontWeight: 800,
                            fontSize: "1.1rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {clueCount === -1 ? "∞" : clueCount === null ? "-" : clueCount}
                        </button>
                        <div className="clue-count-dropdown">
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

                      {/* Custom design Send Clue button */}
                      <button
                        type="submit"
                        style={{
                          padding: isMobileViewport ? "12px 18px" : "12px 28px",
                          flexShrink: 0,
                          borderRadius: "9999px",
                          border: "1.5px solid rgba(255, 255, 255, 0.2)",
                          background: "linear-gradient(180deg, #10b981 0%, #047857 100%)",
                          color: "#FFFFFF",
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          fontSize: "0.9rem",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                          transition: "all 0.15s ease",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = "translateY(-1px)";
                          e.currentTarget.style.filter = "brightness(1.1)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = "none";
                          e.currentTarget.style.filter = "brightness(1)";
                        }}
                      >
                        Send Clue
                      </button>
                    </div>
                    {clueError && (
                      <div style={{ color: "hsl(355,85%,58%)", fontSize: "0.85rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        {clueError}
                      </div>
                    )}
                  </form>
                )}

            </div>
          )}
        </div>

      </>
    );
  };
const renderSettingsCard = (side?: "left" | "right") => {
    const isLeft = side === "left";
    const isRight = side === "right";
    if (side) {
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
            gap: "24px",
            width: "100%",
          }}
        >
          {isLeft ? (
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
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", margin: "0 0 4px 0", fontWeight: 700, color: "hsl(355,85%,58%)" }}>
                Host Settings
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative" }}>
                <label style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "0.95rem" }}>
                  {t("settings.timerMode", "Timer Settings")}
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ position: "relative", width: "fit-content" }}>
                    <button
                      type="button"
                      disabled={!isHost}
                      onClick={() => { if (isHost) { playSettingsToggle(); setIsTimerModeDropdownOpen(!isTimerModeDropdownOpen); } }}
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

                    {isTimerModeDropdownOpen && isHost && (
                      <>
                        <div
                          style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(0, 0, 0, 0.15)",
                            zIndex: 9998,
                          }}
                          onClick={() => setIsTimerModeDropdownOpen(false)}
                        />
                        <div
                          style={{
                            position: "absolute",
                            top: "calc(100% + 4px)",
                            left: 0,
                            width: "320px",
                            background: lightMode ? "#ffffff" : "#0b1d21",
                            border: "2px solid var(--accent)",
                            borderRadius: "var(--radius-md)",
                            padding: "16px",
                            boxShadow: "0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(232, 163, 61, 0.15)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                            zIndex: 9999,
                          }}
                          className="scale-up assign-popover-card"
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-default)", paddingBottom: "8px" }}>
                            <span style={{ fontSize: "1.0rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.5px" }}>
                              {t("settings.timerMode", "Timer Settings")}
                            </span>
                            <button
                              onClick={() => setIsTimerModeDropdownOpen(false)}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                                fontSize: "1.1rem",
                                padding: "0 4px",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              ✕
                            </button>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {[
                              { value: "off", renderIcon: (c: string) => renderOffIcon(c), label: t("settings.timerOff", "Off"), desc: "No turn timer limit." },
                              { value: "fast", renderIcon: (c: string) => renderFastIcon(c), label: t("settings.timerFast", "Fast (90s / 60s)"), desc: "Quick turns for high intensity." },
                              { value: "long", renderIcon: (c: string) => renderLongIcon(c), label: t("settings.timerLong", "Long (180s / 120s)"), desc: "Relaxed pace for deeper planning." },
                              { value: "custom", renderIcon: (c: string) => renderCustomIcon(c), label: t("settings.timerCustom", "Custom"), desc: "Fine-tune spymaster and operative limits." },
                            ].map((opt) => {
                              const isSelected = (room.settings.timerMode || "off") === opt.value;
                              const iconColor = isSelected ? "var(--accent)" : "var(--text-secondary)";
                              return (
                                <button
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
                                    playSettingsToggle();
                                    setIsTimerModeDropdownOpen(false);
                                  }}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: "10px 12px",
                                    background: isSelected ? "rgba(232, 163, 61, 0.08)" : "rgba(255,255,255,0.02)",
                                    border: isSelected ? "1px solid var(--accent)" : "1px solid var(--border-default)",
                                    borderRadius: "var(--radius-sm)",
                                    cursor: "pointer",
                                    textAlign: "left",
                                    width: "100%",
                                    transition: "all 0.15s ease",
                                  }}
                                  onMouseOver={(e) => {
                                    if (!isSelected) {
                                      e.currentTarget.style.background = "var(--border-subtle)";
                                    }
                                  }}
                                  onMouseOut={(e) => {
                                    if (!isSelected) {
                                      e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                                    }
                                  }}
                                >
                                  <span style={{ width: "30px", height: "24px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    {opt.renderIcon(iconColor)}
                                  </span>
                                  <div style={{ display: "flex", flexDirection: "column" }}>
                                    <span style={{ fontSize: "1rem", fontWeight: 800, color: isSelected ? "var(--accent)" : "var(--text-primary)" }}>{opt.label}</span>
                                    <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", marginTop: "2px" }}>{opt.desc}</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {room.settings.timerMode === "custom" && (
                    <div style={{ display: "flex", gap: "10px", marginTop: "4px", width: "100%", maxWidth: "340px" }} className="scale-up">
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>Spymaster</div>
                        <input
                          type="number"
                          disabled={!isHost}
                          min="10"
                          max="999"
                          value={room.settings.spymasterTimerSeconds || 120}
                          onChange={(e) => {
                            const val = Math.max(10, Math.min(999, Number(e.target.value)));
                            if (socket && isHost) {
                              socket.emit("update_settings", {
                                roomCode: room.roomCode,
                                settings: { spymasterTimerSeconds: val },
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
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>First Clue +</div>
                        <input
                          type="number"
                          disabled={!isHost}
                          min="0"
                          max="999"
                          value={room.settings.firstClueExtraSeconds || 60}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(999, Number(e.target.value)));
                            if (socket && isHost) {
                              socket.emit("update_settings", {
                                roomCode: room.roomCode,
                                settings: { firstClueExtraSeconds: val },
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
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>Operative</div>
                        <input
                          type="number"
                          disabled={!isHost}
                          min="10"
                          max="999"
                          value={room.settings.operativeTimerSeconds || 60}
                          onChange={(e) => {
                            const val = Math.max(10, Math.min(999, Number(e.target.value)));
                            if (socket && isHost) {
                              socket.emit("update_settings", {
                                roomCode: room.roomCode,
                                settings: { operativeTimerSeconds: val },
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
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  filter: isHost ? "none" : "blur(1.5px)",
                  pointerEvents: isHost ? "auto" : "none",
                  opacity: isHost ? 1 : 0.7,
                  transition: "all 0.3s ease",
                }}
              >
                <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", margin: "0 0 4px 0", fontWeight: 700, color: "var(--accent)" }}>
                  Timer Action
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", width: "100%" }}>
                  {[
                    { value: "auto", label: t("settings.timerActionAuto", "Auto End") },
                    { value: "manual", label: t("settings.timerActionManual", "Manual End") },
                  ].map((opt) => {
                    const isSelected = (room.settings.timerAction || "manual") === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={!isHost}
                        onClick={() => {
                          playSettingsToggle();
                          if (socket && isHost) {
                            socket.emit("update_settings", {
                              roomCode: room.roomCode,
                              settings: { timerAction: opt.value },
                            });
                          }
                        }}
                        style={{
                          padding: "10px 8px",
                          borderRadius: "var(--radius-sm)",
                          border: `1px solid ${isSelected ? "var(--accent)" : "var(--border-default)"}`,
                          background: isSelected ? "var(--accent)" : "var(--bg-surface-raised)",
                          color: isSelected ? "var(--accent-text-on)" : "var(--text-primary)",
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          cursor: isHost ? "pointer" : "not-allowed",
                          textAlign: "center",
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

              <div style={{ display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px solid var(--border-subtle)", paddingTop: "20px" }}>
                <label style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "0.95rem" }}>
                  {t("settings.preferences", "Preferences (Local Only)")}
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                    <div style={{ position: "relative", width: "42px", height: "22px" }}>
                      <input
                        type="checkbox"
                        checked={soundEnabled}
                        onChange={(e) => {
                          const enabled = e.target.checked;
                          setSoundEnabled(enabled);
                          if (enabled) {
                            const restoredVol = lastVolumeRef.current > 0 ? lastVolumeRef.current : 80;
                            setSoundVolume(restoredVol);
                            try {
                              const AC = window.AudioContext || (window as any).webkitAudioContext;
                              if (AC) {
                                const ctx = new AC();
                                const osc = ctx.createOscillator();
                                const g = ctx.createGain();
                                osc.type = 'sine';
                                osc.frequency.setValueAtTime(659.25, ctx.currentTime);
                                g.gain.setValueAtTime(0.55 * (restoredVol / 100), ctx.currentTime);
                                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
                                osc.connect(g); g.connect(ctx.destination);
                                osc.start(); osc.stop(ctx.currentTime + 0.09);
                              }
                            } catch { /* ignore */ }
                          } else {
                            if (soundVolume > 0) {
                              lastVolumeRef.current = soundVolume;
                            }
                            setSoundVolume(0);
                          }
                        }}
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
                          borderRadius: "50%",
                          backgroundColor: "var(--color-surface)",
                          transition: "all 0.2s cubic-bezier(0.1, 0.9, 0.2, 1.2)",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Sound Effects</span>
                  </label>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", width: "32px", textAlign: "right" }}>
                      {soundVolume}%
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={soundVolume}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSoundVolume(val);
                        if (val > 0) {
                          setSoundEnabled(true);
                          lastVolumeRef.current = val;
                        } else {
                          setSoundEnabled(false);
                        }
                      }}
                      style={{
                        flex: 1,
                        height: "6px",
                        borderRadius: "3px",
                        background: "var(--border-default)",
                        outline: "none",
                        cursor: "pointer",
                        accentColor: "var(--accent)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

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
          gap: "24px",
        }}
      >
        <div
          style={{
            filter: isHost ? "none" : "blur(1.5px)",
            opacity: isHost ? 1 : 0.7,
            transition: "all 0.3s ease",
          }}
        >
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", margin: 0, fontWeight: 700, color: "var(--accent)" }}>
            {t("settings.hostSettings", "Host Settings")}
          </h4>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px" }}>
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
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative" }}>
              <label style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "0.95rem" }}>
                {t("settings.timerMode", "Timer Settings")}
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ position: "relative", width: "fit-content" }}>
                  <button
                    type="button"
                    disabled={!isHost}
                    onClick={() => { if (isHost) { playSettingsToggle(); setIsTimerModeDropdownOpen(!isTimerModeDropdownOpen); } }}
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

                  {isTimerModeDropdownOpen && isHost && (
                    <>
                      {/* Backdrop overlay to close the popup on click */}
                      <div
                        style={{
                          position: "fixed",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: "rgba(0, 0, 0, 0.15)",
                          zIndex: 9998,
                        }}
                        onClick={() => setIsTimerModeDropdownOpen(false)}
                      />
                      {/* Popover content absolute positioned directly below the button */}
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 4px)",
                          left: 0,
                          width: "320px",
                          background: lightMode ? "#ffffff" : "#0b1d21",
                          border: "2px solid var(--accent)",
                          borderRadius: "var(--radius-md)",
                          padding: "16px",
                          boxShadow: "0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(232, 163, 61, 0.15)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                          zIndex: 9999,
                        }}
                        className="scale-up"
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-default)", paddingBottom: "8px" }}>
                          <span style={{ fontSize: "1.0rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.5px" }}>
                            {t("settings.timerMode", "Timer Settings")}
                          </span>
                          <button
                            onClick={() => setIsTimerModeDropdownOpen(false)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "var(--text-secondary)",
                              cursor: "pointer",
                              fontSize: "1.1rem",
                              padding: "0 4px",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            ✕
                          </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {[
                            { value: "off", renderIcon: (c: string) => renderOffIcon(c), label: t("settings.timerOff", "Off"), desc: "No turn timer limit." },
                            { value: "fast", renderIcon: (c: string) => renderFastIcon(c), label: t("settings.timerFast", "Fast (90s / 60s)"), desc: "Quick turns for high intensity." },
                            { value: "long", renderIcon: (c: string) => renderLongIcon(c), label: t("settings.timerLong", "Long (180s / 120s)"), desc: "Relaxed pace for deeper planning." },
                            { value: "custom", renderIcon: (c: string) => renderCustomIcon(c), label: t("settings.timerCustom", "Custom"), desc: "Fine-tune spymaster and operative limits." },
                          ].map((opt) => {
                            const isSelected = (room.settings.timerMode || "off") === opt.value;
                            const iconColor = isSelected ? "var(--accent)" : "var(--text-secondary)";
                            return (
                              <button
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
                                  playSettingsToggle();
                                  setIsTimerModeDropdownOpen(false);
                                }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  padding: "10px 12px",
                                  background: isSelected ? "rgba(232, 163, 61, 0.08)" : "rgba(255,255,255,0.02)",
                                  border: isSelected ? "1px solid var(--accent)" : "1px solid var(--border-default)",
                                  borderRadius: "var(--radius-sm)",
                                  cursor: "pointer",
                                  textAlign: "left",
                                  width: "100%",
                                  transition: "all 0.15s ease",
                                }}
                                onMouseOver={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.background = "var(--border-subtle)";
                                  }
                                }}
                                onMouseOut={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                                  }
                                }}
                              >
                                <span style={{ width: "30px", height: "24px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                  {opt.renderIcon(iconColor)}
                                </span>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                                  <span style={{ fontSize: "1rem", fontWeight: 800, color: isSelected ? "var(--accent)" : "var(--text-primary)" }}>
                                    {opt.label}
                                  </span>
                                  <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                                    {opt.desc}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {(room.settings.timerMode === "custom") && (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "12px",
                    width: "100%",
                    maxWidth: "440px",
                    marginTop: "12px",
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600, display: "flex", alignItems: "flex-end", minHeight: "34px" }}>
                        {t("settings.spymasterTimer", "Spymaster (s)")}
                      </label>
                      <input
                        type="number"
                        disabled={room.settings.timerMode !== "custom" || !isHost}
                        value={room.settings.spymasterTimerSeconds !== undefined ? room.settings.spymasterTimerSeconds : 90}
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
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600, display: "flex", alignItems: "flex-end", minHeight: "34px" }}>
                        {t("settings.firstClueExtra", "1st Clue Extra (s)")}
                      </label>
                      <input
                        type="number"
                        disabled={room.settings.timerMode !== "custom" || !isHost}
                        value={room.settings.firstClueExtraSeconds !== undefined ? room.settings.firstClueExtraSeconds : 60}
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
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600, display: "flex", alignItems: "flex-end", minHeight: "34px" }}>
                        {t("settings.operativeTimer", "Operative (s)")}
                      </label>
                      <input
                        type="number"
                        disabled={room.settings.timerMode !== "custom" || !isHost}
                        value={room.settings.operativeTimerSeconds !== undefined ? room.settings.operativeTimerSeconds : 60}
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

          <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", maxWidth: "320px", marginLeft: "auto" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                filter: isHost ? "none" : "blur(1.5px)",
                pointerEvents: isHost ? "auto" : "none",
                opacity: isHost ? 1 : 0.7,
                transition: "all 0.3s ease",
              }}
            >
              <label style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "0.95rem" }}>
                {t("settings.timerAction", "Timer Action")}
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", width: "100%" }}>
                {[
                  { value: "auto", label: t("settings.timerActionAuto", "Auto End") },
                  { value: "manual", label: t("settings.timerActionManual", "Manual End") },
                ].map((opt) => {
                  const isSelected = (room.settings.timerAction || "manual") === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={!isHost}
                      onClick={() => {
                        playSettingsToggle();
                        if (socket && isHost) {
                          socket.emit("update_settings", {
                            roomCode: room.roomCode,
                            settings: { timerAction: opt.value },
                          });
                        }
                      }}
                      style={{
                        padding: "10px 8px",
                        borderRadius: "var(--radius-sm)",
                        border: `1px solid ${isSelected ? "var(--accent)" : "var(--border-default)"}`,
                        background: isSelected ? "var(--accent)" : "var(--bg-surface-raised)",
                        color: isSelected ? "var(--accent-text-on)" : "var(--text-primary)",
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        cursor: isHost ? "pointer" : "not-allowed",
                        textAlign: "center",
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

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px solid var(--border-subtle)", paddingTop: "20px" }}>
              <label style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "0.95rem" }}>
                {t("settings.preferences", "Preferences")}
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                  <div style={{ position: "relative", width: "42px", height: "22px" }}>
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        setSoundEnabled(enabled);
                        if (enabled) {
                          const restoredVol = lastVolumeRef.current > 0 ? lastVolumeRef.current : 80;
                          setSoundVolume(restoredVol);
                          try {
                            const AC = window.AudioContext || (window as any).webkitAudioContext;
                            if (AC) {
                              const ctx = new AC();
                              const osc = ctx.createOscillator();
                              const g = ctx.createGain();
                              osc.type = 'sine';
                              osc.frequency.setValueAtTime(659.25, ctx.currentTime);
                              g.gain.setValueAtTime(0.55 * (restoredVol / 100), ctx.currentTime);
                              g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
                              osc.connect(g); g.connect(ctx.destination);
                              osc.start(); osc.stop(ctx.currentTime + 0.09);
                            }
                          } catch { /* ignore */ }
                        } else {
                          if (soundVolume > 0) {
                            lastVolumeRef.current = soundVolume;
                          }
                          setSoundVolume(0);
                        }
                      }}
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
                    {t("settings.sound", "Sound Effects")}
                  </span>
                </label>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  maxWidth: "260px",
                  opacity: soundEnabled ? 1 : 0.45,
                  transition: "opacity 0.2s ease",
                  pointerEvents: "auto",
                }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", minWidth: "36px", fontWeight: 600 }}>
                    {soundVolume}%
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={soundVolume}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSoundVolume(val);
                      if (val > 0) {
                        setSoundEnabled(true);
                        lastVolumeRef.current = val;
                      } else {
                        setSoundEnabled(false);
                      }
                    }}
                    style={{
                      flex: 1,
                      height: "6px",
                      borderRadius: "3px",
                      background: "var(--border-default)",
                      outline: "none",
                      cursor: "pointer",
                      accentColor: "var(--accent)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAssignPopover = (p: Player) => {
    return (
      <>

        {/* Popover content positioned absolute nested on desktop, fixed centered portal on mobile */}
        <div
          style={{
            position: isMobileViewport ? "fixed" : "absolute",
            top: isMobileViewport ? "50%" : "60px",
            left: "50%",
            transform: isMobileViewport ? "translate(-50%, -50%)" : "translateX(-50%)",
            background: "var(--bg-surface-solid)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "16px",
            boxShadow: "0 15px 45px rgba(0,0,0,0.85)",
            width: "290px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            zIndex: 10000,
          }}
          className="scale-up assign-popover-card"
        >
          <span style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)", textTransform: "uppercase", textAlign: "center", borderBottom: "1px solid var(--border-default)", paddingBottom: "8px" }}>
            {t("game.assign", "Assign")} {p.displayName}
          </span>
          
          {room.gameMode === "coop" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {Object.entries(room.teams).map(([color, teamState]) => {
                const isSelected = p.team === color;
                const themeCol = typeColors[color]!;
                return (
                  <button
                    key={color}
                    onClick={() => {
                      handleJoinTeamRole(color as any, null, p.id);
                      setActiveSwitchPlayerId(null);
                    }}
                    style={{
                      padding: "8px",
                      fontSize: "0.75rem",
                      background: isSelected ? themeCol.border : themeCol.bg,
                      border: `1px solid ${themeCol.border}`,
                      borderRadius: "4px",
                      color: isSelected ? "#fff" : themeCol.text,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "var(--font-display)",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      width: "100%",
                    }}
                  >
                    {t("game.joinAs", { role: teamState.name || t(`teams.${color}`) })}
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
                    fontFamily: "var(--font-display)",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    width: "100%",
                  }}
                >
                  Red Spy
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
                    fontFamily: "var(--font-display)",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    width: "100%",
                  }}
                >
                  Red Op
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
                    fontFamily: "var(--font-display)",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    width: "100%",
                  }}
                >
                  Blue Spy
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
                    fontFamily: "var(--font-display)",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    width: "100%",
                  }}
                >
                  Blue Op
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
                      fontFamily: "var(--font-display)",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      width: "100%",
                    }}
                  >
                    Green Spy
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
                      fontFamily: "var(--font-display)",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      width: "100%",
                    }}
                  >
                    Green Op
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
                      fontFamily: "var(--font-display)",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      width: "100%",
                    }}
                  >
                    Yellow Spy
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
                      fontFamily: "var(--font-display)",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      width: "100%",
                  }}
                  >
                    Yellow Op
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
              background: !p.team ? "var(--accent)" : "var(--bg-surface-raised)",
              border: !p.team ? "1px solid var(--accent)" : "1px solid var(--border-default)",
              borderRadius: "4px",
              color: !p.team ? "var(--accent-text-on)" : "var(--text-primary)",
              fontWeight: 600,
              fontSize: "0.75rem",
              cursor: "pointer",
              width: "100%",
              fontFamily: "var(--font-display)",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
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
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    width: "100%",
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
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    width: "100%",
                  }}
                >
                  {t("game.kick", "Kick")}
                </button>
              )}
            </div>
          )}
        </div>
      </>
    );
  };

    const renderPlayerRow = (p: Player, customSize?: number) => {
    const size = Math.floor((customSize || 54) * 1.22);
    const avatarSize = Math.floor(size * 0.88);
    const border = p.team ? typeColors[p.team]!.border : "rgba(255,255,255,0.15)";
    const isCurrent = p.id === playerId;
    const canSwitch = isHost || (p.id === playerId && !room.settings.roomLocked);

    const teamGlows: Record<string, string> = {
      red: "rgba(196, 69, 54, 0.45)",
      blue: "rgba(45, 110, 142, 0.45)",
      green: "rgba(122, 140, 92, 0.45)",
      yellow: "rgba(176, 122, 31, 0.45)",
    };
    const glowColor = p.team ? teamGlows[p.team]! : "rgba(232, 163, 61, 0.45)";
    const finalBorderColor = p.team ? typeColors[p.team]!.border : (isCurrent ? "var(--accent)" : "rgba(255,255,255,0.15)");

    return (
      <div
        key={p.id}
        className="player-row-wrapper"
        style={{
          position: "relative",
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: canSwitch ? "pointer" : "default",
          margin: size > 46 ? "4px" : "2px",
          zIndex: activeSwitchPlayerId === p.id ? 50 : 1,
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
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
            border: `2px solid ${finalBorderColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isCurrent ? `0 0 10px ${glowColor}` : "none",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = p.team ? typeColors[p.team]!.light : "var(--accent)";
            if (isCurrent) e.currentTarget.style.boxShadow = `0 0 14px ${glowColor}`;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = finalBorderColor;
            e.currentTarget.style.boxShadow = isCurrent ? `0 0 10px ${glowColor}` : "none";
          }}
        >
          {/* Avatar inside */}
          {p.avatar ? (
            renderAvatar(p.avatar, avatarSize)
          ) : (
            <Identicon username={p.displayName} size={avatarSize} />
          )}

          {/* Connection dot (top right) */}
          <div
            style={{
              position: "absolute",
              top: "1px",
              right: "1px",
              width: `${Math.max(6, Math.floor(size * 0.16))}px`,
              height: `${Math.max(6, Math.floor(size * 0.16))}px`,
              borderRadius: "50%",
              background: p.connected ? "hsl(142,75%,45%)" : "hsl(355,85%,58%)",
              border: "1px solid var(--color-surface)",
            }}
          />

          {/* Host Crown (above) */}
          {(p.isHost || p.id === room.players[0]?.id) && (() => {
            const crownSize = Math.max(14, Math.floor(size * 0.35));
            return (
              <span
                className="premium-host-crown"
                style={{
                  position: "absolute",
                  top: `-${Math.max(10, Math.floor(size * 0.28))}px`,
                  left: "50%",
                  transform: "translateX(-50%) rotate(-5deg)",
                  filter: "drop-shadow(0 0 8px rgba(255, 179, 0, 0.75)) drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                  pointerEvents: "none",
                  animation: "avatar-float 3s ease-in-out infinite alternate",
                }}
                title="Room Host"
              >
                <svg width={crownSize} height={crownSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="crown-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFF2A3" />
                      <stop offset="40%" stopColor="#F9A825" />
                      <stop offset="100%" stopColor="#E65100" />
                    </linearGradient>
                  </defs>
                  {/* Detailed Crown Path */}
                  <path 
                    d="M2 5L6.5 12.5L12 5.5L17.5 12.5L22 5L18.5 18.5H5.5L2 5Z" 
                    fill="url(#crown-gold-grad)" 
                    stroke="#FF8F00" 
                    strokeWidth="0.75" 
                    strokeLinejoin="round" 
                  />
                  {/* Jewels details */}
                  <circle cx="12" cy="5.5" r="1.2" fill="#FFFFFF" />
                  <circle cx="2" cy="5" r="1.2" fill="#FFFFFF" />
                  <circle cx="22" cy="5" r="1.2" fill="#FFFFFF" />
                  <circle cx="12" cy="12" r="1" fill="#FF1744" />
                  <circle cx="6.5" cy="12.5" r="0.8" fill="#2979FF" />
                  <circle cx="17.5" cy="12.5" r="0.8" fill="#2979FF" />
                  <line x1="6" y1="16" x2="18" y2="16" stroke="#FF8F00" strokeWidth="0.8" />
                </svg>
              </span>
            );
          })()}

          {/* Small status overlay badge (bottom right) */}
          {p.status && p.status !== "ACTIVE" && (
            <span
              style={{
                position: "absolute",
                bottom: "-2px",
                right: "-2px",
                fontSize: `${Math.max(0.4, size * 0.011)}rem`,
                fontWeight: 800,
                padding: "1px 3px",
                borderRadius: "3px",
                background: getStatusStyle(p.status, p.team).bg,
                color: getStatusStyle(p.status, p.team).text,
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
            fontSize: `${Math.max(0.65, Math.min(0.9, size * 0.016))}rem`,
            fontWeight: isCurrent ? 700 : 500,
            color: p.team ? typeColors[p.team]!.border : (isCurrent ? "var(--accent)" : "var(--color-text-muted)"),
            maxWidth: `${size + 12}px`,
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
        {activeSwitchPlayerId === p.id && renderAssignPopover(p)}
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

    if (room.turnState?.phaseStartedAt) {
      const elapsed = Math.floor((Date.now() - room.turnState.phaseStartedAt) / 1000);
      setTimerCount(Math.max(0, limit - elapsed));
    } else {
      setTimerCount(limit);
    }
  }, [room.turnState?.turnNumber, room.turnState?.phase, room.phase, room.gameMode, room.settings.timerMode, room.settings.spymasterTimerSeconds, room.settings.firstClueExtraSeconds, room.settings.operativeTimerSeconds, room.turnState?.phaseStartedAt]);

  // Turn timer countdown loop
  useEffect(() => {
    if (room.phase !== "playing" || !room.turnState) return;

    let enabled = false;
    if (room.gameMode === "coop") {
      enabled = true;
    } else {
      const mode = room.settings.timerMode || "off";
      if (mode !== "off") {
        enabled = true;
      }
    }

    if (!enabled) return;

    const interval = setInterval(() => {
      setTimerCount((prev) => {
        const isManual = room.settings.timerAction === "manual";
        if (isManual) {
          return Math.max(0, prev - 1);
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
            if (isActiveOp || isActiveSpy) {
              socket.emit("end_turn", { roomCode: room.roomCode, playerId });
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [room.gameMode, room.phase, room.turnState, socket, localPlayer, room.roomCode, playerId, room.settings.timerAction]);



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

  const hostInitialSyncRef = useRef(false);

  // Synchronize player's local UI language to match the room's language on initial join
  useEffect(() => {
    if (!room?.language || !i18n) return;
    if (!hostInitialSyncRef.current) {
      if (i18n.language !== room.language) {
        i18n.changeLanguage(room.language);
      }
      hostInitialSyncRef.current = true;
    }
  }, [room?.language, i18n]);

  // Synchronize room language setting when navbar language is explicitly changed by host
  useEffect(() => {
    if (!socket || !room || !isHost || !hostInitialSyncRef.current) return;
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
      setGameLog([]);
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
    playRoleTapSound();

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
    playHapticClick(1.0);

    if (room.phase === "playing") {
      setGlobalConfirm({
        title: "Reset Game?",
        message: "Warning! This will wipe the grid and start a new game immediately. All players will be moved to Spectators. Proceed?",
        isWarning: true,
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
    playWarningSound();
    const msg = room.phase === "playing"
      ? "Warning! Returning to the lobby will end the currently running game. Do you want to abort the match?"
      : "Return all players to the lobby to prepare for a new match? Action cannot be undone.";
    setGlobalConfirm({
      title: "Return to Lobby?",
      message: msg,
      isWarning: true,
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
    if (clueCount === null) {
      setClueError("Please select a clue count");
      return;
    }

    playClueSentSound();
    if (socket) {
      socket.emit("give_clue", {
        roomCode: room.roomCode,
        playerId,
        clueWord: trimmed,
        clueCount,
      });
    }
    setClueWord("");
    setClueCount(null);
  };

  const getTeamButtonStyles = (team: string, role: string, isSelected: boolean) => {
    let baseColor = "var(--text-secondary)";
    let bgColor = "var(--bg-surface-raised)";
    let borderColor = "var(--border-default)";
    
    if (team === "red") {
      baseColor = "var(--team-1)";
      bgColor = isSelected ? "rgba(239, 68, 68, 0.45)" : "rgba(239, 68, 68, 0.12)";
      borderColor = isSelected ? "var(--team-1)" : "rgba(239, 68, 68, 0.35)";
    } else if (team === "blue") {
      baseColor = "var(--team-2)";
      bgColor = isSelected ? "rgba(0, 240, 255, 0.45)" : "rgba(0, 240, 255, 0.12)";
      borderColor = isSelected ? "var(--team-2)" : "rgba(0, 240, 255, 0.35)";
    } else if (team === "green") {
      baseColor = "var(--team-3)";
      bgColor = isSelected ? "rgba(16, 185, 129, 0.45)" : "rgba(16, 185, 129, 0.12)";
      borderColor = isSelected ? "var(--team-3)" : "rgba(16, 185, 129, 0.35)";
    } else if (team === "yellow") {
      baseColor = "var(--team-4)";
      bgColor = isSelected ? "rgba(245, 158, 11, 0.45)" : "rgba(245, 158, 11, 0.12)";
      borderColor = isSelected ? "var(--team-4)" : "rgba(245, 158, 11, 0.35)";
    }
    
    return {
      padding: "6px 10px",
      fontSize: "0.72rem",
      background: bgColor,
      border: `1.5px solid ${borderColor}`,
      borderRadius: "4px",
      color: isSelected ? "#fff" : baseColor,
      fontWeight: isSelected ? 800 : 600,
      cursor: "pointer",
      fontFamily: "var(--font-display)",
      letterSpacing: "0.03em",
      textTransform: "uppercase" as const,
      boxShadow: isSelected ? `0 0 10px ${baseColor}` : "none",
      transition: "all 0.15s ease",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    };
  };

    const handleCardClick = (cardId: number) => {
    const clickedCard = room.board.find((c) => c.id === cardId);
    if (clickedCard && clickedCard.revealed) {
      playPremiumRichClick();
      setShowWordCardIds((prev) =>
        prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
      );
      return;
    }

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
    playAssassinRuleSelect();
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

  const getStatusStyle = (status: string, team?: string | null) => {
    if (team && typeColors[team]) {
      return {
        bg: typeColors[team].bg,
        text: typeColors[team].border,
      };
    }
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
          position: "absolute",
          right: isMobileViewport ? "12px" : "clamp(8px, 3vw, 20px)",
          bottom: "92px",
          width: activeTab === "log"
            ? "min(280px, calc(100vw - 24px))"
            : "min(380px, calc(100vw - 32px))",
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
          pointerEvents: "auto",
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
          </div>
        )}

        {/* TAB CONTENT: Game Log */}
        {activeTab === "log" && (() => {
          const clueGroups: Array<{ clue: GameLogEntry; guesses: GameLogEntry[] }> = [];
          let currentClueGroup: { clue: GameLogEntry; guesses: GameLogEntry[] } | null = null;
          
          for (const entry of gameLog) {
            if (entry.type === "clue") {
              if (currentClueGroup) {
                clueGroups.push(currentClueGroup);
              }
              currentClueGroup = { clue: entry, guesses: [] };
            } else if (entry.type === "reveal") {
              if (currentClueGroup) {
                currentClueGroup.guesses.push(entry);
              }
            }
          }
          
          if (currentClueGroup) {
            clueGroups.push(currentClueGroup);
          }

          return (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "calc(100% - 44px)" }}>
              {/* Log events list */}
              <div
                ref={logScrollContainerRef}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  paddingRight: "6px",
                  paddingLeft: "4px",
                  marginBottom: "12px",
                }}
              >
                {clueGroups.map((group, idx) => {
                  const { clue, guesses } = group;
                  const clueTeam = clue.team;
                  const spymasterName = clue.details?.spymasterName || clue.message.split(" ")[0] || "Spymaster";
                  const spymasterAvatar = clue.details?.spymasterAvatar || "🕵️‍♂️";
                  const word = clue.details?.word || "";
                  const count = clue.details?.count;
                  const countStr = count === -1 ? "∞" : count !== undefined ? String(count) : "";
                  
                  const bannerBg = getTeamDarkColor(clueTeam);
                  const badgeBg = getTeamDarkColor(clueTeam);
                  const avatarBorder = getTeamAvatarBorderColor(clueTeam);

                  return (
                    <div key={`clue-group-${clue.id || idx}`} style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                      {/* Clue Banner */}
                      <div style={{ display: "flex", alignItems: "center", position: "relative", width: "100%", height: "38px" }}>
                        {/* Avatar and Name Badge */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2, marginRight: "-8px", width: "32px", flexShrink: 0 }}>
                          {/* Circular background disk matching team color */}
                          <div style={{
                            position: "relative",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            background: badgeBg,
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.2)"
                          }}>
                            {renderAvatar(spymasterAvatar, 26)}
                            <div style={{
                              position: "absolute",
                              bottom: "-4px",
                              background: badgeBg,
                              padding: "0.5px 4px",
                              borderRadius: "2px",
                              fontSize: "11px",
                              fontWeight: 900,
                              color: "#FFFFFF",
                              whiteSpace: "nowrap",
                              maxWidth: "46px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              lineHeight: 1,
                              boxShadow: "0 0.5px 1px rgba(0,0,0,0.25)",
                              fontFamily: "var(--font-sans)",
                              border: "0.5px solid rgba(255,255,255,0.15)",
                              textAlign: "center"
                            }}>
                              {spymasterName}
                            </div>
                          </div>
                        </div>
                        
                        {/* Banner Strip */}
                        <div style={{
                          flex: 1,
                          height: "28px",
                          background: bannerBg,
                          borderRadius: "14px",
                          display: "flex",
                          alignItems: "center",
                          padding: "0 10px 0 14px",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.15)"
                        }}>
                          {/* Clue Word Card */}
                          <div style={{
                            flex: 1,
                            height: "22px",
                            background: "#FFFFFF",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: "14px",
                            color: "#000000",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            fontFamily: "Outfit, Inter, sans-serif",
                            boxShadow: "inset 0 0.5px 1.5px rgba(0,0,0,0.12)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            padding: "0 8px"
                          }}>
                            {word}
                          </div>
                          
                          {/* Clue Count Badge */}
                          {countStr && (
                            <div style={{
                              width: "22px",
                              height: "22px",
                              borderRadius: "50%",
                              background: "#FFFFFF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: "13px",
                              color: "#000000",
                              marginLeft: "6px",
                              flexShrink: 0,
                              boxShadow: "inset 0 0.5px 1.5px rgba(0,0,0,0.12)",
                              fontFamily: "Outfit, Inter, sans-serif"
                            }}>
                              {countStr}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Guesses Row */}
                      {guesses.length > 0 && (
                        <div style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px 10px",
                          paddingLeft: "24px",
                          width: "100%"
                        }}>
                          {guesses.map((guess, gIdx) => {
                            const guessPlayerName = guess.details?.playerDisplayName || guess.message.split(" ")[0] || "Player";
                            const guessPlayerAvatar = guess.details?.playerAvatar || "🕵️‍♂️";
                            const guessPlayerTeam = guess.details?.playerTeam || clueTeam;
                            const guessWord = guess.details?.cardWord || "";
                            const guessCardType = guess.details?.cardType || "unknown";
                            
                            const isPass = guessCardType === "pass" || guessWord.toLowerCase() === "pass";
                            
                            let pillBg = "var(--bg-surface-raised)";
                            let pillText = "var(--text-secondary)";
                            
                            if (isPass) {
                              pillBg = "var(--team-3)";
                              pillText = "#FFFFFF";
                            } else {
                              if (guessCardType === "red") {
                                pillBg = "var(--team-1)";
                                pillText = "#FFFFFF";
                              } else if (guessCardType === "blue") {
                                pillBg = "var(--team-2)";
                                pillText = "#FFFFFF";
                              } else if (guessCardType === "green") {
                                pillBg = "var(--team-3)";
                                pillText = "#FFFFFF";
                              } else if (guessCardType === "yellow") {
                                pillBg = "var(--team-4)";
                                pillText = "#FFFFFF";
                              } else if (guessCardType === "neutral") {
                                pillBg = "var(--card-neutral-bg)";
                                pillText = "var(--text-primary)";
                              } else if (guessCardType === "assassin") {
                                pillBg = "var(--card-assassin-bg)";
                                pillText = "#FFFFFF";
                              }
                            }
                            
                            const guessPlayerBadgeBg = getTeamDarkColor(guessPlayerTeam);

                            return (
                              <div key={`guess-${guess.id || gIdx}`} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                {/* Horizontal Stack: Avatar + Name Underneath */}
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "22px", flexShrink: 0 }}>
                                  {/* Circular background disk matching team color */}
                                  <div style={{
                                    position: "relative",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    width: "22px",
                                    height: "22px",
                                    borderRadius: "50%",
                                    background: guessPlayerBadgeBg,
                                    border: "0.5px solid rgba(255, 255, 255, 0.15)",
                                    boxShadow: "0 0.5px 1.5px rgba(0,0,0,0.2)"
                                  }}>
                                    {renderAvatar(guessPlayerAvatar, 19)}
                                    <div style={{
                                      position: "absolute",
                                      bottom: "-3px",
                                      background: guessPlayerBadgeBg,
                                      padding: "0.5px 3px",
                                      borderRadius: "2px",
                                      fontSize: "10px",
                                      fontWeight: 900,
                                      color: "#FFFFFF",
                                      whiteSpace: "nowrap",
                                      maxWidth: "38px",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      lineHeight: 0.95,
                                      fontFamily: "var(--font-sans)",
                                      border: "0.5px solid rgba(255,255,255,0.06)",
                                      textAlign: "center"
                                    }}>
                                      {guessPlayerName}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Guess Pill */}
                                <div style={{
                                  height: "20px",
                                  background: pillBg,
                                  color: pillText,
                                  borderRadius: "4px",
                                  padding: "0 8px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 800,
                                  fontSize: "0.75rem",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.01em",
                                  fontFamily: "Outfit, Inter, sans-serif",
                                  boxShadow: "0 1px 2px rgba(0,0,0,0.18)",
                                }}>
                                  {isPass ? "✔ PASS" : guessWord}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {clueGroups.length === 0 && (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: "0.9rem", fontStyle: "italic", textAlign: "center" }}>
                    Log is empty. Start the game and submit clues to see history!
                  </div>
                )}

                <div ref={logEndRef} />
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  const renderCustomReaction = (type: string, isButton = false) => {
    const size = isButton ? "20px" : "84px";
    const padding = isButton ? "10px 18px" : "36px";
    const borderRadius = isButton ? "var(--radius-sm)" : "50%";
    
    switch (type) {
      case "facepalm":
        return (
          <div
            style={{
              padding,
              borderRadius,
              background: "linear-gradient(135deg, hsl(355, 75%, 15%) 0%, hsl(355, 80%, 25%) 100%)",
              border: "1.5px solid hsl(355, 80%, 48%)",
              color: "#fff",
              boxShadow: isButton ? "none" : "0 6px 20px rgba(239, 68, 68, 0.4)",
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
              <span style={{ fontSize: "1rem", fontWeight: 800, fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
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
              background: "linear-gradient(135deg, hsl(35, 85%, 18%) 0%, hsl(35, 90%, 30%) 100%)",
              border: "1.5px solid hsl(35, 90%, 55%)",
              color: "#fff",
              boxShadow: isButton ? "none" : "0 6px 20px rgba(226, 163, 61, 0.4)",
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
              <span style={{ fontSize: "1rem", fontWeight: 800, fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
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
              background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
              border: "1.5px solid #3f3f46",
              color: "#fafafa",
              boxShadow: isButton ? "none" : "0 6px 20px rgba(63, 63, 70, 0.4)",
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
              <span style={{ fontSize: "1rem", fontWeight: 800, fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
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
              background: "linear-gradient(135deg, rgba(0, 240, 255, 0.08) 0%, rgba(0, 240, 255, 0.18) 100%)",
              border: "1.5px solid var(--accent)",
              color: "var(--accent)",
              boxShadow: isButton ? "none" : "0 6px 20px rgba(0, 240, 255, 0.4)",
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
              <span style={{ fontSize: "1rem", fontWeight: 800, fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
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
              background: "linear-gradient(135deg, hsl(142, 75%, 12%) 0%, hsl(142, 80%, 22%) 100%)",
              border: "1.5px solid hsl(142, 70%, 45%)",
              color: "#fff",
              boxShadow: isButton ? "none" : "0 6px 20px rgba(34, 197, 94, 0.4)",
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
              <span style={{ fontSize: "1rem", fontWeight: 800, fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
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
              background: "linear-gradient(135deg, hsl(217, 85%, 15%) 0%, hsl(217, 80%, 25%) 100%)",
              border: "1.5px solid hsl(217, 91%, 60%)",
              color: "#fff",
              boxShadow: isButton ? "none" : "0 6px 20px rgba(59, 130, 246, 0.4)",
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
              <span style={{ fontSize: "1rem", fontWeight: 800, fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
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
    if (!soundEnabled) return;
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
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === "fire") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === "skull") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.setValueAtTime(90, now + 0.15);
        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
      } else if (type === "party") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.setValueAtTime(0.6, now + 0.1);
        gain.gain.setValueAtTime(0.6, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === "clap") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(500, now + 0.08);
        gain.gain.setValueAtTime(0.7, now);
        gain.gain.setValueAtTime(0.7, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === "heart") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.setValueAtTime(70, now + 0.12);
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.10);
        gain.gain.setValueAtTime(0.8, now + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      console.warn("AudioContext block:", e);
    }
  };

  return (
    <div
      className={`fade-in ${isAssassinShake ? "assassin-shake-active" : ""}`}
      style={{
        width: "100%",
        maxWidth: isChatFloatingOpen && !isMobileViewport ? "1600px" : "1200px",
        margin: "0 auto",
        paddingTop: 0,
        paddingBottom: isMobileViewport
          ? (isChatFloatingOpen ? "clamp(120px, 42vh, 440px)" : "110px")
          : "24px",
        paddingLeft: "clamp(8px, 3vw, 20px)",
        paddingRight: isChatFloatingOpen && !isMobileViewport
          ? (activeTab === "log" ? "316px" : "416px")
          : "clamp(8px, 3vw, 20px)",
        boxSizing: "border-box",
        transition: "max-width 0.3s ease, padding-right 0.3s ease",
      }}
    >
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
          animation: card-flip 2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
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
          100% { transform: perspective(1200px) rotateX(0deg) scale(1); }
        }

        /* Defeat Grid Style */
        .grid-defeat-active {
          animation: grid-defeat-tilt 1s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
          filter: grayscale(0.4) brightness(0.8);
        }
        @keyframes grid-defeat-tilt {
          0% { transform: perspective(1200px) rotateX(0deg) scale(1); }
          100% { transform: perspective(1200px) rotateX(0deg) scale(1); }
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
              playGlassDing();
                setIsSearchOpen(true);
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
              onClick={() => { playGlassDing(); setPeekKey(!peekKey); }}
              style={{
                padding: "10px 16px",
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                cursor: "pointer",
                background: peekKey ? "var(--accent)" : "transparent",
                border: `1px solid ${peekKey ? "var(--accent)" : "var(--border-default)"}`,
                color: peekKey ? "var(--accent-text-on)" : "var(--text-secondary)",
                boxShadow: peekKey ? "0 0 6px var(--accent)" : "none",
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
        className={room.phase === "lobby" ? "game-main-split-layout" : ""}
        style={
          room.phase === "lobby"
            ? {
                width: "100%",
                alignItems: "flex-start",
              }
            : {
                display: "flex",
                gap: "24px",
                flexDirection: "row",
                flexWrap: "wrap",
                width: "100%",
                alignItems: "flex-start",
              }
        }
      >
        {room.phase === "lobby" ? renderLobbyLayout() : renderGameplayLayout()}
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
      {room.phase !== "lobby" && createPortal(
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: isChatFloatingOpen && !isMobileViewport ? "1600px" : "1200px",
            height: 0,
            pointerEvents: "none",
            zIndex: 9999,
            transition: "max-width 0.3s ease",
          }}
        >
          {/* Floating Panel */}
          {isChatFloatingOpen && renderChatAndLogPanel()}

          <div
            style={{
              position: "absolute",
              bottom: "24px",
              right: isMobileViewport ? "24px" : "clamp(8px, 3vw, 20px)",
              pointerEvents: "auto",
            }}
          >
            <button
              onClick={() => {
                if (!isChatFloatingOpen) {
                  setIsChatFloatingOpen(true);
                  setActiveTab("log");
                  setUnreadLog(false);
                } else {
                  if (activeTab === "log") {
                    setActiveTab("chat");
                  } else {
                    setIsChatFloatingOpen(false);
                  }
                }
              }}
              style={{
                width: "64px",
                height: "64px",
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
              title={isChatFloatingOpen ? (activeTab === "log" ? "Switch to Chat" : "Minimize") : "Open Game Log"}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: (isChatFloatingOpen ? activeTab === "chat" : alternateTabLabel === "chat") ? "0.92rem" : "1.05rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {isChatFloatingOpen 
                  ? (activeTab === "chat" ? "Chat" : "Log")
                  : (alternateTabLabel === "chat" ? "Chat" : "Log")
                }
              </span>

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
        </div>,
        document.body
      )}


      {profileSettingsOpen && (
        <ProfileSettingsModal onClose={() => setProfileSettingsOpen(false)} />
      )}

    </div>
  );
}

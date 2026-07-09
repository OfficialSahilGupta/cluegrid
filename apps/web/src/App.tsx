import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { io, Socket } from "socket.io-client";
import type { RoomState } from "@cluegrid/shared";
import { useAuth } from "./context/AuthContext";
import { useTranslation } from "react-i18next";
import { renderAvatar } from "./utils/avatar";
import { LandingPage } from "./components/LandingPage";
import { CookieConsent } from "./components/CookieConsent";

// Lazily load components that are not needed on initial page paint
const GameBoard = lazy(() => import("./components/GameBoard").then(module => ({ default: module.GameBoard })));
const RulesPage = lazy(() => import("./components/RulesPage").then(module => ({ default: module.RulesPage })));
const ChangelogPage = lazy(() => import("./components/ChangelogPage").then(module => ({ default: module.ChangelogPage })));
const AboutPage = lazy(() => import("./components/AboutPage").then(module => ({ default: module.AboutPage })));
const ManagementPanel = lazy(() => import("./components/ManagementPanel").then(module => ({ default: module.ManagementPanel })));
const AuthModal = lazy(() => import("./components/AuthModal").then(module => ({ default: module.AuthModal })));
const ProfileSettingsModal = lazy(() => import("./components/ProfileSettingsModal").then(module => ({ default: module.ProfileSettingsModal })));
const LanguageSwitcher = lazy(() => import("./components/LanguageSwitcher").then(module => ({ default: module.LanguageSwitcher })));
const SupportPage = lazy(() => import("./components/SupportPage").then(module => ({ default: module.SupportPage })));
const FeaturesPage = lazy(() => import("./components/FeaturesPage").then(module => ({ default: module.FeaturesPage })));
const FeedbackRobot = lazy(() => import("./components/FeedbackRobot").then(module => ({ default: module.FeedbackRobot })));
const GatedUpsellModal = lazy(() => import("./components/GatedUpsellModal").then(module => ({ default: module.GatedUpsellModal })));


const isInitialRoomPath = (() => {
  if (typeof window === "undefined") return false;
  const pathParts = window.location.pathname.split("/");
  const roomIndex = pathParts.indexOf("room");
  if (roomIndex !== -1 && pathParts.length > roomIndex + 1 && pathParts[roomIndex + 1]?.trim()) {
    return true;
  }
  if (window.location.hash.replace("#", "").trim()) {
    return true;
  }
  return false;
})();

const AVATARS = ["🦊", "🦉", "🦁", "🐼", "🤖", "🎮", "👤", "🎩"];

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
];

// Stable unique player ID per browser profile
const playerId = (() => {
  let id = localStorage.getItem("cluegrid_player_id");
  if (!id) {
    id = "p_" + Math.random().toString(36).substring(2, 11);
    localStorage.setItem("cluegrid_player_id", id);
  }
  return id;
})();



function GlowOrbs() {
  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "-20%",
          left: "-10%",
          width: "min(700px, 100vw)",
          height: "min(700px, 100vw)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, var(--glow-1) 0%, transparent 70%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          bottom: "-20%",
          right: "-10%",
          width: "min(700px, 100vw)",
          height: "min(700px, 100vw)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, var(--glow-2) 0%, transparent 70%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
    </>
  );
}

export default function App() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [room, setRoom] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tracks intentional disconnects (back nav, leave button) so the socket
  // disconnect handler doesn't show a "Connection Lost" error overlay.
  const intentionalLeave = useRef(false);
  
  // Tracks history navigation (back/forward) to prevent phase-sync loops
  const isNavigatingHistory = useRef(false);

  // Global Light Mode State
  const [lightMode, setLightMode] = useState(() => {
    return localStorage.getItem("cluegrid_theme") === "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", lightMode ? "light" : "dark");
    localStorage.setItem("cluegrid_theme", lightMode ? "light" : "dark");
  }, [lightMode]);

  // Modal open states
  const [authOpen, setAuthOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [globalConfirm, setGlobalConfirm] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    isWarning?: boolean;
  } | null>(null);
  const [gatedFeature, setGatedFeature] = useState<string | null>(null);
  const [globalErrorMsg, setGlobalErrorMsg] = useState<string | null>(null);

  // Read config preset option selected by host
  const [selectedTeams, setSelectedTeams] = useState<number>(2);

  // Socket instance state
  const [socket, setSocket] = useState<Socket | null>(null);

  // Game Mode: classic or coop
  const [gameMode, setGameMode] = useState<"classic" | "coop">("classic");

  // Navigation View: lobby, rules, changelog, about, admin, support
  const [currentView, setCurrentView] = useState<"lobby" | "rules" | "features" | "changelog" | "about" | "admin" | "support">("lobby");

  // ─── Lightweight Audio & Haptic Helpers (no external deps) ────────────────
  const triggerHaptics = (pattern: number | number[]) => {
    // navigator.vibrate disabled
  };

  const _mkCtx = () => {
    const isSoundEnabled = localStorage.getItem("cluegrid_sound_enabled") !== "false";
    if (!isSoundEnabled) return null;
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    const ctx = new AC();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  };
  const _getVol = () => {
    return Number(localStorage.getItem("cluegrid_sound_volume") ?? "80") / 100;
  };
  const playWarningAudio = () => {
    try {
      const ctx = _mkCtx();
      if (!ctx) return;
      const vol = _getVol();
      const n = ctx.currentTime;
      // Descending two-tone disconnect chime (A4 -> F4)
      ([[440, 0], [349.23, 0.08]] as [number, number][]).forEach(([f, d]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(f, n + d);
        g.gain.setValueAtTime(0.45 * vol, n + d);
        g.gain.exponentialRampToValueAtTime(0.001, n + d + 0.22);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(n + d);
        o.stop(n + d + 0.25);
      });
    } catch {
      /* ignore */
    }
  };
  const playNavAudio = () => { try { const ctx = _mkCtx(); if (!ctx) return; const vol = _getVol(); const o = ctx.createOscillator(), g = ctx.createGain(), n = ctx.currentTime; o.type = "sine"; o.frequency.setValueAtTime(880, n); o.frequency.exponentialRampToValueAtTime(1320, n + 0.04); g.gain.setValueAtTime(0.32 * vol, n); g.gain.exponentialRampToValueAtTime(0.001, n + 0.13); o.connect(g); g.connect(ctx.destination); o.start(n); o.stop(n + 0.14); } catch { /* ignore */ } };
  const playModeAudio = () => { try { const ctx = _mkCtx(); if (!ctx) return; const vol = _getVol(); const n = ctx.currentTime; ([[440, 0], [660, 0.07]] as [number, number][]).forEach(([f, d]) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "triangle"; o.frequency.setValueAtTime(f, n + d); g.gain.setValueAtTime(0.55 * vol, n + d); g.gain.exponentialRampToValueAtTime(0.001, n + d + 0.15); o.connect(g); g.connect(ctx.destination); o.start(n + d); o.stop(n + d + 0.18); }); } catch { /* ignore */ } };
  const playTeamCountAudio = (count: number) => { try { const ctx = _mkCtx(); if (!ctx) return; const vol = _getVol(); const n = ctx.currentTime; const s = [261.63, 329.63, 392.00, 523.25]; for (let i = 0; i < count && i < s.length; i++) { const d = i * 0.07, o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.setValueAtTime(s[i]!, n + d); g.gain.setValueAtTime(0.65 * vol, n + d); g.gain.exponentialRampToValueAtTime(0.001, n + d + 0.2); o.connect(g); g.connect(ctx.destination); o.start(n + d); o.stop(n + d + 0.22); } } catch { /* ignore */ } };
  const playLangAudio = () => { try { const ctx = _mkCtx(); if (!ctx) return; const vol = _getVol(); const n = ctx.currentTime; [1046.5, 1318.5, 1567.98].forEach((f, i) => { const d = i * 0.05, o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.setValueAtTime(f, n + d); g.gain.setValueAtTime(0, n + d); g.gain.linearRampToValueAtTime(0.42 * vol, n + d + 0.02); g.gain.exponentialRampToValueAtTime(0.001, n + d + 0.35); o.connect(g); g.connect(ctx.destination); o.start(n + d); o.stop(n + d + 0.38); }); } catch { /* ignore */ } };
  // ─────────────────────────────────────────────────────────────────────────

  // Gameplay Word Pack Language Selected by Host
  const [gameplayLang, setGameplayLang] = useState<string>("en");
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Local storage profile values (fallback if guest)
  const [tempName, setTempName] = useState(localStorage.getItem("cluegrid_display_name") || "");
  const [tempAvatar, setTempAvatar] = useState(localStorage.getItem("cluegrid_avatar") || "s2_0_0");
  const [hasProfile, setHasProfile] = useState(
    !!localStorage.getItem("cluegrid_display_name") && !!localStorage.getItem("cluegrid_avatar")
  );
  const [profileError, setProfileError] = useState<string | null>(null);

  // Check if current user is active/authorized to enter
  const isJoined = hasProfile || !!user;

  // Global server error popup state
  const [serverError, setServerError] = useState<{
    status?: number;
    message: string;
  } | null>(null);

  // Intercept all API fetches to catch server errors globally (only show overlay when inside a room)
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        // Clear server error if any request succeeds
        if (response.status < 400) {
          setServerError(null);
        }
        // Only trigger overlay for 5xx errors and only while inside a room
        if (response.status >= 500 && room) {
          let errMsg = `Server error (${response.status})`;
          try {
            const clone = response.clone();
            const body = await clone.json();
            if (body.error) errMsg = body.error;
          } catch {
            try {
              const clone = response.clone();
              const text = await clone.text();
              if (text) errMsg = text;
            } catch {}
          }
          setServerError({ status: response.status, message: errMsg });
        }
        return response;
      } catch (err: any) {
        // Only block with overlay when inside a room and not intentionally leaving
        if (room && !intentionalLeave.current) {
          setServerError({
            status: 0,
            message: err?.message || "Cannot reach the server.",
          });
        }
        throw err;
      }
    };
    return () => {
      window.fetch = originalFetch;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  // Manage font scaling class on root html element (increased font size on all screens except the main landing page)
  useEffect(() => {
    const isMainPage = currentView === "lobby" && !room;
    if (isMainPage) {
      document.documentElement.classList.remove("increased-fonts");
    } else {
      document.documentElement.classList.add("increased-fonts");
    }
  }, [currentView, room]);

  // Fetch room data if URL contains code path or hash
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const pathParts = window.location.pathname.split("/");
    const roomIndex = pathParts.indexOf("room");
    let roomCode = "";

    if (roomIndex !== -1 && pathParts.length > roomIndex + 1) {
      const targetPart = pathParts[roomIndex + 1];
      if (targetPart && targetPart !== "play" && targetPart.trim() !== "") {
        roomCode = targetPart.trim();
      }
    } else {
      roomCode = window.location.hash.replace("#", "").trim();
    }

    if (roomCode) {
      loadRoom(roomCode);
    }
  }, []);

  // Establish real-time socket connection when room exists and profile is completed
  useEffect(() => {
    if (!room || !isJoined) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = window.location.origin;
    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("[socket] connected as:", newSocket.id);
      setServerError(null); // Clear server maintenance overlays
      newSocket.emit("join_room", {
        roomCode: room.roomCode,
        playerId,
        displayName: user ? user.username : localStorage.getItem("cluegrid_display_name"),
        avatar: user ? user.avatar : localStorage.getItem("cluegrid_avatar"),
        userId: user ? user.id : null,
      });
    });

    newSocket.on("disconnect", (reason) => {
      console.log("[socket] disconnected:", reason);
      // Skip error overlay if the user intentionally left (back nav, leave button)
      if (intentionalLeave.current) {
        intentionalLeave.current = false;
        return;
      }
    });

    newSocket.on("room_state", (updatedRoom: RoomState) => {
      setRoom(updatedRoom);
    });

    newSocket.on("connect_error", (err) => {
      console.error("[socket] connection error:", err);
    });

    newSocket.on("error_msg", (err: string) => {
      if (err === "Room not found") {
        setShowUpdatePopup(true);
      } else {
        triggerHaptics([350, 60, 350, 60, 350]);
        playWarningAudio();
        setGlobalErrorMsg(err);
      }
    });

    newSocket.on("kicked", () => {
      triggerHaptics([350, 60, 350, 60, 350]);
      playWarningAudio();
      setGlobalErrorMsg("You have been kicked from the room by the host.");
      handleLeave();
    });

    return () => {
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.roomCode, isJoined, user]);

  const handleUpdateRefresh = () => {
    triggerHaptics([350, 60, 350, 60, 350]);
    setShowUpdatePopup(false);
    window.history.pushState(null, "", "/");
    setRoom(null);
    window.location.reload();
  };

  const loadRoom = (code: string) => {
    setLoading(true);
    setError(null);
    fetch(`/api/rooms/${code}`)
      .then((r) => {
        if (!r.ok) throw new Error("Room lookup failed");
        return r.json();
      })
      .then((res) => {
        if (res.success && res.room) {
          setRoom(res.room);
          const targetPath = `/room/${res.room.roomCode}`;
          if (window.location.pathname !== targetPath) {
            window.history.pushState(null, "", targetPath);
          }
          if (window.location.hash) {
            window.location.hash = "";
          }
        } else {
          setError(res.error || "Room not found");
          if (res.error === "Room not found") {
            setShowUpdatePopup(true);
          }
        }
      })
      .catch((err) => {
        setError(err.message);
        setShowUpdatePopup(true);
      })
      .finally(() => setLoading(false));
  };

  const handleCreateRoom = () => {
    try {
      playModeAudio();
    } catch {
      /* ignore */
    }
    triggerHaptics([350, 60, 350, 60, 350]);
    setLoading(true);
    setError(null);
    fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamCount: selectedTeams, gameMode, language: gameplayLang }),
    })
      .then(async (r) => {
        if (!r.ok) {
          // Try to parse a JSON error body first (from our server error handler)
          let message = `Server error (${r.status})`;
          try {
            const json = await r.json();
            if (json?.error) message = json.error;
          } catch {
            const text = await r.text().catch(() => "");
            if (text) message = text;
          }
          throw new Error(message);
        }
        return r.json();
      })
      .then((res) => {
        if (res.success && res.roomCode) {
          loadRoom(res.roomCode);
        } else {
          setError(res.error || "Could not create room");
        }
      })
      .catch((err) => {
        // TypeError: Failed to fetch = server is offline / unreachable
        const isOffline = err instanceof TypeError && err.message.includes("fetch");
        setError(isOffline ? "Cannot reach the server. Make sure the ClueGrid server is running." : err.message);
      })
      .finally(() => setLoading(false));
  };

  const handleCreateRoomWithOptions = (options: { teamCount: number; gameMode: "classic" | "coop"; language: string }) => {
    try {
      playModeAudio();
    } catch {
      /* ignore */
    }
    triggerHaptics([350, 60, 350, 60, 350]);
    setLoading(true);
    setError(null);
    fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamCount: options.teamCount, gameMode: options.gameMode, language: options.language }),
    })
      .then(async (r) => {
        if (!r.ok) {
          let message = `Server error (${r.status})`;
          try {
            const json = await r.json();
            if (json?.error) message = json.error;
          } catch {
            const text = await r.text().catch(() => "");
            if (text) message = text;
          }
          throw new Error(message);
        }
        return r.json();
      })
      .then((res) => {
        if (res.success && res.roomCode) {
          loadRoom(res.roomCode);
        } else {
          setError(res.error || "Could not create room");
        }
      })
      .catch((err) => {
        const isOffline = err instanceof TypeError && err.message.includes("fetch");
        setError(isOffline ? "Cannot reach the server. Make sure the ClueGrid server is running." : err.message);
      })
      .finally(() => setLoading(false));
  };



  const handleLeave = () => {
    intentionalLeave.current = true;
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setRoom(null);
    setServerError(null);
    window.history.pushState(null, "", "/");
  };

  // Handle browser back (Cmd+Left) and forward (Cmd+Right) navigation
  useEffect(() => {
    const handlePopState = () => {
      isNavigatingHistory.current = true;
      const path = window.location.pathname;
      const pathParts = path.split("/");
      const roomIndex = pathParts.indexOf("room");
      const roomCodeInUrl = roomIndex !== -1 && pathParts[roomIndex + 1] && pathParts[roomIndex + 1] !== "play"
        ? pathParts[roomIndex + 1]!.trim()
        : "";

      // Determine local player status
      const localPlayer = room?.players?.find((p) => p.id === playerId);
      const isHost = !!localPlayer?.isHost || (room?.players?.length && playerId === room.players[0]?.id);

      if (path === "/") {
        // Navigated back to landing
        intentionalLeave.current = true;
        if (socket) { socket.disconnect(); setSocket(null); }
        setRoom(null);
        setServerError(null);
        window.dispatchEvent(new CustomEvent("route-change", { detail: { showWelcome: false } }));
      } else if (path === "/room") {
        // Navigated to creation screen
        intentionalLeave.current = true;
        if (socket) { socket.disconnect(); setSocket(null); }
        setRoom(null);
        setServerError(null);
        window.dispatchEvent(new CustomEvent("route-change", { detail: { showWelcome: true } }));
      } else if (roomCodeInUrl) {
        if (!room || room.roomCode !== roomCodeInUrl) {
          // If entering a new/different room
          loadRoom(roomCodeInUrl);
        } else if (path === `/room/${room.roomCode}`) {
          // Navigated back from /play to lobby in the same room
          if (isHost) {
            // Host can request resetting room phase to lobby
            if (socket) socket.emit("reset_to_lobby", { roomCode: room.roomCode });
          } else {
            // Operatives/Spectators leave the room on back navigation since they can't change room phase
            intentionalLeave.current = true;
            if (socket) { socket.disconnect(); setSocket(null); }
            setRoom(null);
            setServerError(null);
            window.history.pushState(null, "", "/room");
            window.dispatchEvent(new CustomEvent("route-change", { detail: { showWelcome: true } }));
          }
        } else if (path === `/room/${room.roomCode}/play`) {
          // Navigated forward from lobby to /play in the same room
          if (room.phase === "lobby") {
            if (isHost) {
              // Host starts the game
              if (socket) socket.emit("start_game", { roomCode: room.roomCode });
            } else {
              // Non-hosts cannot start the game, revert URL to lobby
              window.history.replaceState(null, "", `/room/${room.roomCode}`);
            }
          }
        }
      } else {
        // Leave active room
        if (room) {
          intentionalLeave.current = true;
          if (socket) { socket.disconnect(); setSocket(null); }
          setRoom(null);
          setServerError(null);
        }
      }
      
      // Allow sync effect to run on next user actions
      setTimeout(() => {
        isNavigatingHistory.current = false;
      }, 100);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, socket, playerId]);

  // Keep URL in sync with active room phase (lobby vs play) using pushState (so history stacks correctly)
  useEffect(() => {
    if (!room || isNavigatingHistory.current) return;
    const targetPath = room.phase === "lobby"
      ? `/room/${room.roomCode}`
      : `/room/${room.roomCode}/play`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, "", targetPath);
    }
  }, [room?.phase, room?.roomCode]);

  // Generate the 50 premium avatar identifiers (sheet 1 & sheet 2)
  const premiumAvatars: string[] = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      premiumAvatars.push(`s1_${r}_${c}`);
    }
  }
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      premiumAvatars.push(`s2_${r}_${c}`);
    }
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);

    const trimmedName = tempName.trim();
    if (!trimmedName) {
      setProfileError("Agent Name is required to enter the grid.");
      return;
    }
    if (trimmedName.length < 2) {
      setProfileError("Agent Name must be at least 2 characters long.");
      return;
    }
    if (!tempAvatar) {
      setProfileError("Please select a standard avatar profile to identify yourself.");
      return;
    }

    localStorage.setItem("cluegrid_display_name", trimmedName);
    localStorage.setItem("cluegrid_avatar", tempAvatar);
    setHasProfile(true);
  };


  if (room) {
    return (
      <>
        <LandingPage
          currentView={currentView}
          setCurrentView={setCurrentView}
          setAuthOpen={setAuthOpen}
          handleCreateRoom={handleCreateRoomWithOptions}
          loading={loading}
          isActiveRoom={true}
        />
        <div id="game-board-viewport" style={{ position: "fixed", inset: 0, zIndex: 10, overflowY: "auto", overflowX: "hidden", background: "transparent" }}>
          <Suspense fallback={
            <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "40px", height: "40px", border: "3px solid transparent", borderTopColor: "#00f0ff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            </div>
          }>
            <GameBoard
              room={room}
              playerId={playerId}
              socket={socket}
              lightMode={lightMode}
              setLightMode={setLightMode}
              setGlobalConfirm={setGlobalConfirm}
              setGatedFeature={setGatedFeature}
              onOpenAuth={() => setAuthOpen(true)}
            />
          </Suspense>
        </div>

        {/* Global Auth Modal & Settings Modal */}
        <Suspense fallback={null}>
          {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
          {settingsOpen && (
          <ProfileSettingsModal
            onClose={() => setSettingsOpen(false)}
            socket={socket}
            playerId={playerId}
            roomCode={room ? (room as any).roomCode : undefined}
            onGuestProfileUpdate={(name, avatar) => {
              setTempName(name);
              setTempAvatar(avatar);
              setHasProfile(true);
            }}
          />
        )}
          {gatedFeature && (
            <GatedUpsellModal
              featureName={gatedFeature}
              onClose={() => setGatedFeature(null)}
              onOpenAuth={() => setAuthOpen(true)}
            />
          )}
        </Suspense>

        {/* Server/connection error overlays suppressed */}


        {/* Guest Profile Entrance Modal */}
        {!isJoined && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(3,11,14,0.95)",
              backdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999999,
              boxSizing: "border-box",
              padding: "16px",
            }}
          >
            <form
              onSubmit={handleSaveProfile}
              style={{
                width: "min(420px, 100%)",
                background: "rgba(6,24,28,0.96)",
                border: "1.5px solid rgba(0,240,255,0.35)",
                padding: "32px",
                borderRadius: "var(--radius-lg)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                margin: 0,
                boxSizing: "border-box",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "8px" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800, color: "#00f0ff", margin: "0 0 6px 0", letterSpacing: "0.02em" }}>
                  IDENTIFY YOURSELF
                </h2>
                <div style={{ fontSize: "0.82rem", color: "#9aa29b" }}>
                  Entering secure decryption grid. Input alias badge.
                </div>
              </div>

              {profileError && (
                <div style={{ background: "rgba(239,149,156,0.1)", border: "1px solid #ef959c", color: "#ef959c", padding: "10px 12px", borderRadius: "6px", fontSize: "0.8rem" }}>
                  {profileError}
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#eef3ee", opacity: 0.8, marginBottom: "8px", fontWeight: 700 }}>
                  Agent Alias
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSaveProfile(e as any); } }}
                  placeholder="Enter alias..."
                  autoFocus
                  style={{ width: "100%", background: "rgba(238,243,238,0.04)", border: "1.5px solid rgba(238,243,238,0.14)", borderRadius: "8px", color: "#eef3ee", fontSize: "14px", padding: "13px 14px", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#eef3ee", opacity: 0.8, marginBottom: "8px", fontWeight: 700 }}>
                  Select Avatar
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px", maxHeight: "175px", overflowY: "auto", padding: "8px", background: "rgba(0,0,0,0.25)", borderRadius: "8px", border: "1px solid rgba(238,243,238,0.08)" }}>
                  {premiumAvatars.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setTempAvatar(emoji)}
                      style={{
                        padding: "4px",
                        cursor: "pointer",
                        background: tempAvatar === emoji ? "rgba(0,240,255,0.12)" : "transparent",
                        border: tempAvatar === emoji ? "1.5px solid #00f0ff" : "1.5px solid transparent",
                        borderRadius: "50%",
                        transition: "all 0.15s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {renderAvatar(emoji, 38)}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={handleLeave}
                  style={{ padding: "12px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border-default)", background: "transparent", color: "var(--text-primary)", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-display)" }}
                >
                  Leave
                </button>
                <button
                  type="submit"
                  style={{ padding: "12px", borderRadius: "var(--radius-md)", border: "none", background: "#00f0ff", color: "#040b0d", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-display)" }}
                >
                  Enter Room
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Global Confirmation Dialog */}
        {globalConfirm && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
              zIndex: 99999,
            }}
          >
            <div
              className="scale-up"
              style={{
                width: "min(400px, 100%)",
                background: "var(--color-surface)",
                border: "1.5px solid " + (globalConfirm.isWarning ? "hsl(355,85%,58%)" : "var(--accent)"),
                padding: "28px",
                borderRadius: "var(--radius-lg)",
                textAlign: "center",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.45rem",
                  fontWeight: 700,
                  color: globalConfirm.isWarning ? "hsl(355,85%,58%)" : "var(--text-primary)",
                  margin: "0 0 12px 0",
                }}
              >
                {globalConfirm.title}
              </h3>
              <p
                style={{
                  fontSize: "0.95rem",
                  lineHeight: 1.5,
                  color: "var(--text-secondary)",
                  margin: "0 0 24px 0",
                  fontFamily: "var(--font-body)",
                }}
              >
                {globalConfirm.message}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button
                  onClick={() => {
                    triggerHaptics([100]);
                    playNavAudio();
                    setGlobalConfirm(null);
                  }}
                  style={{
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    border: "1.5px solid var(--border-default)",
                    background: "transparent",
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                    transition: "background 0.15s ease",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    triggerHaptics([200]);
                    playNavAudio();
                    globalConfirm.onConfirm();
                    setGlobalConfirm(null);
                  }}
                  style={{
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    border: "none",
                    background: globalConfirm.isWarning ? "hsl(355,85%,58%)" : "var(--accent)",
                    color: "var(--accent-text-on)",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                    transition: "background 0.15s ease",
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global error modal suppressed */}
      </>
    );
  }

  return (
    <>
      <LandingPage
        currentView={currentView}
        setCurrentView={setCurrentView}
        setAuthOpen={setAuthOpen}
        handleCreateRoom={handleCreateRoomWithOptions}
        loading={loading}
        isActiveRoom={isInitialRoomPath}
      >
        <Suspense fallback={<div style={{ padding: "40px", textAlign: "center", color: "var(--accent)" }}>Loading section...</div>}>
          {currentView === "rules" && <RulesPage />}
          {currentView === "features" && <FeaturesPage />}
          {currentView === "changelog" && <ChangelogPage />}
          {currentView === "about" && <AboutPage />}
          {currentView === "admin" && <ManagementPanel />}
          {currentView === "support" && <SupportPage />}
        </Suspense>
      </LandingPage>

      {/* Global Auth Modal & Settings Modal */}
      <Suspense fallback={null}>
        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
        {settingsOpen && (
          <ProfileSettingsModal
            onClose={() => setSettingsOpen(false)}
            socket={socket}
            playerId={playerId}
            roomCode={room ? (room as any).roomCode : undefined}
            onGuestProfileUpdate={(name, avatar) => {
              setTempName(name);
              setTempAvatar(avatar);
              setHasProfile(true);
            }}
          />
        )}
        {gatedFeature && (
          <GatedUpsellModal
            featureName={gatedFeature}
            onClose={() => setGatedFeature(null)}
            onOpenAuth={() => setAuthOpen(true)}
          />
        )}
      </Suspense>

      {/* Server/connection error overlay suppressed */}


      <CookieConsent />
    </>
  );
}

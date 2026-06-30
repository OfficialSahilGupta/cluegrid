import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { RoomState } from "@cluegrid/shared";
import { GameBoard } from "./components/GameBoard";
import { useAuth } from "./context/AuthContext";
import { RulesPage } from "./components/RulesPage";
import { ChangelogPage } from "./components/ChangelogPage";
import { ManagementPanel } from "./components/ManagementPanel";
import { AuthModal } from "./components/AuthModal";
import { ProfileSettingsModal } from "./components/ProfileSettingsModal";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { SupportPage } from "./components/SupportPage";
import { GravityGrid } from "./components/GravityGrid";
import { FeaturesPage } from "./components/FeaturesPage";
import { FeedbackRobot } from "./components/FeedbackRobot";
import { GatedUpsellModal } from "./components/GatedUpsellModal";
import { renderAvatar } from "./utils/avatar";

const AVATARS = ["🦊", "🦉", "🦁", "🐼", "🤖", "🎮", "👤", "🎩"];

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
  } | null>(null);
  const [gatedFeature, setGatedFeature] = useState<string | null>(null);

  // Read config preset option selected by host
  const [selectedTeams, setSelectedTeams] = useState<number>(2);

  // Socket instance state
  const [socket, setSocket] = useState<Socket | null>(null);

  // Game Mode: classic or coop
  const [gameMode, setGameMode] = useState<"classic" | "coop">("classic");

  // Navigation View: lobby, rules, changelog, admin, support
  const [currentView, setCurrentView] = useState<"lobby" | "rules" | "features" | "changelog" | "admin" | "support">("lobby");

  // Gameplay Word Pack Language Selected by Host
  const [gameplayLang, setGameplayLang] = useState<string>("en");
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Local storage profile values (fallback if guest)
  const [tempName, setTempName] = useState(localStorage.getItem("cluegrid_display_name") || "");
  const [tempAvatar, setTempAvatar] = useState(localStorage.getItem("cluegrid_avatar") || "");
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

  // Intercept all API fetches to catch server errors globally
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        // Only trigger server error popup for 5xx status codes
        if (response.status >= 500) {
          let errMsg = `Internal server error occurred on the grid database. (Status ${response.status})`;
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
          setServerError({
            status: response.status,
            message: errMsg,
          });
        }
        return response;
      } catch (err: any) {
        setServerError({
          status: 0,
          message: err?.message || "Failed to establish a secure connection to the database grid.",
        });
        throw err;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Fetch room data if URL contains code hash
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const roomCode = window.location.hash.replace("#", "").toUpperCase();
    if (roomCode.length === 6) {
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
      newSocket.emit("join_room", {
        roomCode: room.roomCode,
        playerId,
        displayName: user ? user.username : localStorage.getItem("cluegrid_display_name"),
        avatar: user ? user.avatar : localStorage.getItem("cluegrid_avatar"),
        userId: user ? user.id : null,
      });
    });

    newSocket.on("room_state", (updatedRoom: RoomState) => {
      setRoom(updatedRoom);
    });

    newSocket.on("connect_error", (err) => {
      console.error("[socket] connection error:", err);
      setServerError({
        status: 0,
        message: "Failed to maintain a real-time connection with the grid server. Retrying secure link...",
      });
    });

    newSocket.on("error_msg", (err: string) => {
      if (err === "Room not found") {
        setShowUpdatePopup(true);
      } else {
        alert(err);
      }
    });

    newSocket.on("kicked", () => {
      alert("You have been kicked from the room by the host.");
      handleLeave();
    });

    return () => {
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.roomCode, isJoined, user]);

  const handleUpdateRefresh = () => {
    setShowUpdatePopup(false);
    window.location.hash = "";
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
          window.location.hash = code;
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


  const handleLeave = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setRoom(null);
    window.location.hash = "";
  };

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

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .fade-in { animation: fadeInUp 0.7s ease both; }
        .scale-up { animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(3rem, 8vw, 4.5rem);
          font-weight: 800;
          line-height: 1.1;
          background: linear-gradient(135deg, #FFEAB5 0%, var(--accent) 50%, #8c530b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .nav-link {
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          font-weight: 700;
          font-family: var(--font-display);
          font-size: 0.95rem;
          transition: color 0.15s ease;
          padding: 0;
        }
        .nav-link:hover {
          color: var(--accent);
        }
        .nav-link.active {
          color: var(--accent);
        }
        @keyframes mobile-slide-down {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mobile-nav-slide { animation: mobile-slide-down 0.22s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      <GravityGrid lightMode={lightMode} />
      <GlowOrbs />

      {/* Floating Global Navbar */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "64px",
          background: "var(--header-bg)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 24px",
          zIndex: 9999,
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
          onClick={() => {
            if (room) {
              setGlobalConfirm({
                title: "Abandon Grid?",
                message: "You will leave this room and forfeit your position in the current mission. Are you sure you want to abandon the grid?",
                onConfirm: () => {
                  setCurrentView("lobby");
                  handleLeave();
                },
              });
            } else {
              setCurrentView("lobby");
              handleLeave();
            }
          }}
        >
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.25rem", letterSpacing: "0.05em", color: "var(--accent)" }}>ClueGrid</span>
        </div>

        {/* Central navigation links — hidden on mobile via CSS class */}
        <div className="nav-center-links" style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <button
            onClick={() => {
              setCurrentView("lobby");
            }}
            className={`nav-link ${currentView === "lobby" ? "active" : ""}`}
          >
            {t("nav.play")}
          </button>
          <button
            onClick={() => setCurrentView("rules")}
            className={`nav-link ${currentView === "rules" ? "active" : ""}`}
          >
            {t("nav.rules")}
          </button>
          <button
            onClick={() => setCurrentView("features")}
            className={`nav-link ${currentView === "features" ? "active" : ""}`}
          >
            Features
          </button>
          <button
            onClick={() => setCurrentView("changelog")}
            className={`nav-link ${currentView === "changelog" ? "active" : ""}`}
          >
            {t("nav.changelog")}
          </button>

          {user?.isAdmin && (
            <button
              onClick={() => setCurrentView("admin")}
              className={`nav-link ${currentView === "admin" ? "active" : ""}`}
            >
              {t("nav.admin")}
            </button>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Hide language switcher on mobile — surfaced in mobile menu */}
          <div className="nav-lang-wrapper"><LanguageSwitcher /></div>
          {/* Hide 'Become a Member' on mobile — surfaced in mobile menu */}
          <div className="nav-member-wrapper">
            <button
              onClick={() => setCurrentView("support")}
              style={{
                background: currentView === "support" ? "var(--accent)" : "rgba(232, 163, 61, 0.12)",
                border: "1px solid var(--accent)",
                color: currentView === "support" ? "var(--accent-text-on)" : "var(--accent)",
                padding: "6px 14px",
                borderRadius: "20px",
                cursor: "pointer",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.85rem",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                if (currentView !== "support") {
                  e.currentTarget.style.background = "var(--accent)";
                  e.currentTarget.style.color = "var(--accent-text-on)";
                }
              }}
              onMouseOut={(e) => {
                if (currentView !== "support") {
                  e.currentTarget.style.background = "rgba(232, 163, 61, 0.12)";
                  e.currentTarget.style.color = "var(--accent)";
                }
              }}
            >
              Become a Member
            </button>
          </div>
          <button
            onClick={() => setLightMode(!lightMode)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.25rem",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
              transition: "transform 0.15s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            title={lightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {lightMode ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="var(--accent)" fillOpacity="0.15"></path>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" fill="var(--accent)" fillOpacity="0.15"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </button>
          {user ? (
            <div style={{ position: "relative" }}>
              <button
                className="nav-user-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "var(--bg-surface-raised)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "20px",
                  padding: "6px 14px 6px 8px",
                  cursor: "pointer",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                }}
              >
                {renderAvatar(user.avatar, 24)}
                <span className="nav-username">{user.username}</span>
                <span className="nav-chevron" style={{ fontSize: "0.6rem", opacity: 0.7 }}>▼</span>
              </button>

              {menuOpen && (
                <div
                  className="scale-up"
                  style={{
                    position: "absolute",
                    top: "48px",
                    right: 0,
                    width: "200px",
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                    display: "flex",
                    flexDirection: "column",
                    padding: "8px 0",
                    zIndex: 5001,
                  }}
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setSettingsOpen(true);
                    }}
                    style={{
                      padding: "10px 16px",
                      background: "none",
                      border: "none",
                      color: "var(--text-primary)",
                      textAlign: "left",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {t("nav.settings")}
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    style={{
                      padding: "10px 16px",
                      background: "none",
                      border: "none",
                      color: "hsl(355,85%,58%)",
                      textAlign: "left",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {t("nav.logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="nav-login-btn"
              onClick={() => setAuthOpen(true)}
              style={{
                padding: "8px 18px",
                borderRadius: "var(--radius-md)",
                background: "var(--accent)",
                border: "none",
                color: "var(--accent-text-on)",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(232, 163, 61, 0.2)",
                fontFamily: "var(--font-display)",
                fontSize: "0.9rem",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "var(--accent-hover)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "var(--accent)";
              }}
            >
              {t("nav.login")}
            </button>
          )}
          {/* Hamburger — visible only on mobile via CSS class */}
          <button
            className="nav-hamburger"
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
          >
            {mobileNavOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* ─── Mobile Navigation Overlay ─────────────────────────────── */}
      {mobileNavOpen && (
        <div
          className="mobile-nav-slide"
          style={{
            position: "fixed",
            top: "64px",
            left: 0,
            right: 0,
            bottom: 0,
            background: "var(--bg-page)",
            borderTop: "1px solid var(--border-subtle)",
            zIndex: 9997,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          {/* Nav Links */}
          {([
            { label: t("nav.play"), view: "lobby" },
            { label: t("nav.rules"), view: "rules" },
            { label: "Features", view: "features" },
            { label: t("nav.changelog"), view: "changelog" },
            ...(user?.isAdmin ? [{ label: t("nav.admin"), view: "admin" }] : []),
          ] as { label: string; view: typeof currentView }[]).map(({ label, view }) => (
            <button
              key={view}
              onClick={() => { setCurrentView(view); setMobileNavOpen(false); }}
              style={{
                padding: "18px 24px",
                background: currentView === view ? "var(--accent-bg-subtle)" : "none",
                border: "none",
                borderBottom: "1px solid var(--border-subtle)",
                color: currentView === view ? "var(--accent)" : "var(--text-primary)",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.05rem",
                textAlign: "left",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              {label}
            </button>
          ))}

          {/* Language Switcher */}
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
            <LanguageSwitcher />
          </div>

          {/* Become a Member */}
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
            <button
              onClick={() => { setCurrentView("support"); setMobileNavOpen(false); }}
              style={{
                width: "100%",
                padding: "13px",
                background: "var(--accent)",
                border: "none",
                color: "var(--accent-text-on)",
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              Become a Member
            </button>
          </div>

          {/* Login if not signed in */}
          {!user && (
            <div style={{ padding: "16px 24px" }}>
              <button
                onClick={() => { setAuthOpen(true); setMobileNavOpen(false); }}
                style={{
                  width: "100%",
                  padding: "13px",
                  background: "none",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-primary)",
                  borderRadius: "var(--radius-md)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                {t("nav.login")}
              </button>
            </div>
          )}
        </div>
      )}

      <main
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(80px, 12vw, 100px) clamp(12px, 4vw, 20px) 40px",
          textAlign: "center",
          gap: "32px",
          width: "100%",
        }}
      >
        {currentView === "rules" ? (
          <RulesPage />
        ) : currentView === "features" ? (
          <FeaturesPage />
        ) : currentView === "changelog" ? (
          <ChangelogPage />
        ) : currentView === "admin" ? (
          <ManagementPanel />
        ) : currentView === "support" ? (
          <SupportPage />
        ) : !room ? (
          /* Lobby / room creator screen */
          <section className="fade-in" style={{ maxWidth: "580px", width: "100%" }}>
            <h1 className="hero-title" style={{ marginBottom: "16px" }}>{t("game.title")}</h1>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "32px" }}>
              {t("game.subtitle")}
            </p>

            <div
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "clamp(18px, 5vw, 32px)",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                textAlign: "left",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    marginBottom: "12px",
                    color: "var(--text-primary)",
                  }}
                >
                  {t("game.gameMode")}
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                  <button
                    onClick={() => setGameMode("classic")}
                    style={{
                      padding: "12px",
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      border: gameMode === "classic" ? "2px solid var(--accent)" : "1px solid var(--border-default)",
                      background: gameMode === "classic" ? "var(--accent-bg-subtle)" : "rgba(255,255,255,0.03)",
                      color: gameMode === "classic" ? "var(--accent)" : "var(--text-secondary)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {t("game.classic")}
                  </button>
                  <button
                    onClick={() => {
                      setGameMode("coop");
                      setSelectedTeams(2);
                    }}
                    style={{
                      padding: "12px",
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      border: gameMode === "coop" ? "2px solid var(--accent)" : "1px solid var(--border-default)",
                      background: gameMode === "coop" ? "var(--accent-bg-subtle)" : "rgba(255,255,255,0.03)",
                      color: gameMode === "coop" ? "var(--accent)" : "var(--text-secondary)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {t("game.coop")}
                  </button>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    marginBottom: "12px",
                    color: "var(--text-primary)",
                  }}
                >
                  {t("game.teamCount")}
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                  {[2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => setSelectedTeams(num)}
                      disabled={gameMode === "coop"}
                      style={{
                        padding: "12px",
                        borderRadius: "var(--radius-md)",
                        cursor: gameMode === "coop" ? "not-allowed" : "pointer",
                        fontFamily: "var(--font-display)",
                        fontWeight: 600,
                        border: selectedTeams === num ? "2px solid var(--accent)" : "1px solid var(--border-default)",
                        background: selectedTeams === num ? "var(--accent-bg-subtle)" : "rgba(255,255,255,0.03)",
                        color: selectedTeams === num ? "var(--accent)" : "var(--text-secondary)",
                        opacity: gameMode === "coop" ? 0.5 : 1,
                        transition: "all 0.15s ease",
                      }}
                    >
                      {num} {t("teams.team")}s
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "8px" }}>
                  {selectedTeams === 2 && "2 Teams: 9 / 8 Cards, 7 Neutrals, 1 Assassin (5x5)"}
                  {selectedTeams === 3 && "3 Teams: 8 / 8 / 7 Cards, 1 Neutral, 1 Assassin (5x5)"}
                  {selectedTeams === 4 && "4 Teams: 7 / 7 / 7 / 6 Cards, 2 Neutrals, 1 Assassin (5x6)"}
                </p>
              </div>
              {/* Gameplay Word Pack Language Selector */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative", marginBottom: "16px", textAlign: "left" }}>
                <label style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "0.95rem" }}>
                  Gameplay Word Pack Language
                </label>

                <button
                  type="button"
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-default)",
                    background: "var(--bg-surface-raised)",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.95rem",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>
                    {ALL_LANGUAGES.find((l) => l.code === gameplayLang)?.flag || "🏳️"}{" "}
                    {ALL_LANGUAGES.find((l) => l.code === gameplayLang)?.name || "Select Language"}
                  </span>
                  <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                    {isLangDropdownOpen ? "▲" : "▼"}
                  </span>
                </button>

                {isLangDropdownOpen && (
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
                      onClick={() => setIsLangDropdownOpen(false)}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        marginTop: "4px",
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        maxHeight: "220px",
                        overflowY: "auto",
                        zIndex: 999,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                        padding: "4px 0",
                      }}
                      className="scale-up"
                    >
                      {ALL_LANGUAGES.map((lang) => (
                        <div
                          key={lang.code}
                          onClick={() => {
                            setGameplayLang(lang.code);
                            setIsLangDropdownOpen(false);
                          }}
                          style={{
                            padding: "10px 14px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            background: gameplayLang === lang.code ? "var(--accent-bg-subtle)" : "transparent",
                            color: gameplayLang === lang.code ? "var(--accent)" : "var(--text-primary)",
                            fontSize: "0.9rem",
                            transition: "all 0.1s ease",
                          }}
                          onMouseOver={(e) => {
                            if (gameplayLang !== lang.code) {
                              e.currentTarget.style.background = "var(--border-subtle)";
                            }
                          }}
                          onMouseOut={(e) => {
                            if (gameplayLang !== lang.code) {
                              e.currentTarget.style.background = "transparent";
                            }
                          }}
                        >
                          <span style={{ fontSize: "1.1rem" }}>{lang.flag}</span>
                          <span style={{ fontWeight: gameplayLang === lang.code ? 600 : 400 }}>
                            {lang.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>



              {error && (
                <div style={{ color: "hsl(355,85%,58%)", fontSize: "0.85rem", fontWeight: 500 }}>
                  ⚠️ {error}
                </div>
              )}

              <button
                onClick={handleCreateRoom}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  background: "var(--accent)",
                  color: "var(--accent-text-on)",
                  boxShadow: "0 4px 20px rgba(232, 163, 61, 0.2)",
                  transition: "all 0.15s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "var(--accent-hover)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "var(--accent)";
                }}
              >
                {loading ? "..." : t("game.createRoom")}
              </button>
            </div>
          </section>
        ) : !isJoined ? (
          <section className="fade-in" style={{ maxWidth: "480px", width: "100%" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, marginBottom: "8px" }}>
              {t("game.joinRoom")}: <span style={{ color: "var(--accent)" }}>{room.roomCode}</span>
            </h2>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "24px" }}>
              {t("game.chooseAvatar")}
            </p>

            <form
              onSubmit={handleSaveProfile}
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "clamp(18px, 5vw, 32px)",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                textAlign: "left",
              }}
            >
              {profileError && (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid hsl(355, 85%, 58%)",
                    borderRadius: "var(--radius-md)",
                    padding: "12px 16px",
                    color: "hsl(355, 85%, 70%)",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 0 12px rgba(239, 68, 68, 0.15)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>⚠️</span>
                  <span>{profileError}</span>
                </div>
              )}
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", fontSize: "0.95rem" }}>
                  {t("game.displayName")}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Agent Smith"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(0,0,0,0.2)",
                    color: "#fff",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "12px", fontSize: "0.95rem" }}>
                  {t("game.chooseAvatar")}
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(48px, 1fr))", gap: "8px" }}>
                  {AVATARS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setTempAvatar(emoji)}
                      style={{
                        padding: "6px",
                        borderRadius: "var(--radius-sm)",
                        border: tempAvatar === emoji ? "2px solid var(--accent)" : "1px solid var(--border-default)",
                        background: tempAvatar === emoji ? "var(--accent-bg-subtle)" : "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {renderAvatar(emoji, 32)}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={handleLeave}
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: "var(--radius-md)",
                    background: "transparent",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {t("profile.cancel")}
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: "14px",
                    borderRadius: "var(--radius-md)",
                    border: "none",
                    background: "var(--accent)",
                    color: "var(--accent-text-on)",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(232, 163, 61, 0.2)",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "var(--accent-hover)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "var(--accent)";
                  }}
                >
                  {t("game.joinRoom")}
                </button>
              </div>
            </form>
          </section>
        ) : (
          /* Active Game View */
          <div style={{ width: "100%" }}>
            <button
              onClick={() => {
                setGlobalConfirm({
                  title: "Abandon Grid?",
                  message: "You will leave this room and forfeit your position in the current mission. Are you sure you want to abandon the grid?",
                  onConfirm: handleLeave,
                });
              }}
              style={{
                marginBottom: "16px",
                background: "var(--bg-surface-raised)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
                padding: "8px 16px",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                fontFamily: "var(--font-display)",
                fontWeight: 600,
              }}
            >
              ← {t("game.leaveRoom")}
            </button>
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
          </div>
        )}

      </main>

      {/* Global Auth Modal & Settings Modal */}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {settingsOpen && <ProfileSettingsModal onClose={() => setSettingsOpen(false)} />}
      {gatedFeature && (
        <GatedUpsellModal
          featureName={gatedFeature}
          onClose={() => setGatedFeature(null)}
          onOpenAuth={() => setAuthOpen(true)}
        />
      )}

      {/* Floating Feedback Robot Helper */}
      {!room && <FeedbackRobot />}

      {/* Custom styled confirmation overlay */}
      {globalConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
          className="fade-in"
        >
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--accent)",
              borderRadius: "var(--radius-md)",
              padding: "24px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 20px 50px rgba(0,0,0,0.65)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
            className="scale-up"
          >
            <h4 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, fontFamily: "var(--font-display)", color: "#fff" }}>
              {globalConfirm.title}
            </h4>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
              {globalConfirm.message}
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button
                onClick={() => setGlobalConfirm(null)}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "var(--radius-sm)",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "var(--color-text-muted)",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-display)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  globalConfirm.onConfirm();
                  setGlobalConfirm(null);
                }}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--accent)",
                  border: "none",
                  color: "var(--accent-text-on)",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "var(--font-display)",
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Detected Popup overlay */}
      {showUpdatePopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10001,
          }}
          className="fade-in"
        >
          <div
            style={{
              background: "var(--color-surface)",
              border: "2px solid var(--accent)",
              borderRadius: "var(--radius-lg)",
              padding: "32px",
              maxWidth: "440px",
              width: "90%",
              boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
            className="scale-up"
          >
            <div style={{ display: "flex", justifyContent: "center" }}>
              <style>{`
                @keyframes spin-slow {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}</style>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin-slow 4s linear infinite", filter: "drop-shadow(0 0 8px var(--accent))" }}>
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
            </div>
            <h4 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, fontFamily: "var(--font-display)", color: "#fff" }}>
              Update Available!
            </h4>
            <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              A new version of ClueGrid is available. Please reload the page to sync with the latest updates and return to the main lobby.
            </p>
            <button
              onClick={handleUpdateRefresh}
              style={{
                width: "100%",
                padding: "14px 24px",
                borderRadius: "var(--radius-md)",
                background: "var(--accent)",
                border: "none",
                color: "var(--accent-text-on)",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: "pointer",
                fontFamily: "var(--font-display)",
                boxShadow: "0 4px 16px rgba(232, 163, 61, 0.3)",
                transition: "all 0.15s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "var(--accent-hover)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "var(--accent)";
              }}
            >
              Refresh & Go to Main Page
            </button>
          </div>
        </div>
      )}

      {/* Global Server Error / Grid Offline Overlay */}
      {serverError && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(10, 11, 14, 0.85)",
            backdropFilter: "blur(16px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10002,
          }}
          className="fade-in"
        >
          <div
            style={{
              background: "var(--bg-surface)",
              border: "2px solid #C44536",
              borderRadius: "var(--radius-lg)",
              padding: "32px",
              maxWidth: "480px",
              width: "90%",
              boxShadow: "0 25px 60px rgba(196, 69, 54, 0.25), 0 0 40px rgba(0, 0, 0, 0.8)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              position: "relative",
            }}
            className="scale-up"
          >
            {/* Warning Icon Badge */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(196, 69, 54, 0.1)",
                border: "1px solid #C44536",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 16px rgba(196, 69, 54, 0.2)",
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C44536" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <h4 style={{
                margin: 0,
                fontSize: "1.4rem",
                fontWeight: 800,
                fontFamily: "var(--font-display)",
                color: "#FFF",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}>
                Grid Link Disrupted
              </h4>
              <p style={{
                margin: 0,
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-display)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}>
                Status: {serverError.status === 0 ? "NETWORK_OFFLINE" : `SERVER_ERROR_${serverError.status}`}
              </p>
            </div>

            <p style={{
              margin: 0,
              fontSize: "0.95rem",
              color: "var(--text-primary)",
              lineHeight: 1.6,
              background: "rgba(0, 0, 0, 0.2)",
              padding: "16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              fontFamily: "var(--font-body)",
            }}>
              {serverError.message}
            </p>

            <p style={{
              margin: 0,
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              lineHeight: 1.5,
            }}>
              The grid operations database might be experiencing high load or undergoing maintenance. Please stand by while we attempt connection recovery.
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setServerError(null)}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  borderRadius: "var(--radius-md)",
                  background: "transparent",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-primary)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  fontFamily: "var(--font-display)",
                  transition: "all 0.15s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setServerError(null);
                  window.location.reload();
                }}
                style={{
                  flex: 2,
                  padding: "14px 24px",
                  borderRadius: "var(--radius-md)",
                  background: "#C44536",
                  border: "none",
                  color: "#FFF",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  fontFamily: "var(--font-display)",
                  boxShadow: "0 4px 16px rgba(196, 69, 54, 0.3)",
                  transition: "all 0.15s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#D95241";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#C44536";
                }}
              >
                Reconnect to Grid
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

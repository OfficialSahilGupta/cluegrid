import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.js";
import { renderAvatar } from "../utils/avatar";

interface ProfileSettingsModalProps {
  onClose: () => void;
  socket?: any;
  playerId?: string;
  roomCode?: string;
  onGuestProfileUpdate?: (name: string, avatar: string) => void;
}

export function ProfileSettingsModal({ onClose, socket, playerId, roomCode, onGuestProfileUpdate }: ProfileSettingsModalProps) {
  const { user, updateSettings } = useAuth();
  const [username, setUsername] = useState(user?.username || localStorage.getItem("cluegrid_display_name") || "");
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || localStorage.getItem("cluegrid_avatar") || "s2_0_0");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 150+ standard emojis for registered users

  // 50 premium character face avatars for supporters
  const supporterAvatars: string[] = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      supporterAvatars.push(`s1_${r}_${c}`);
    }
  }
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      supporterAvatars.push(`s2_${r}_${c}`);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const trimmedName = username.trim();
      if (!trimmedName) throw new Error("Username cannot be empty");

      if (user) {
        await updateSettings(trimmedName, selectedAvatar);
      } else {
        // Guest flow: save locally
        localStorage.setItem("cluegrid_display_name", trimmedName);
        localStorage.setItem("cluegrid_avatar", selectedAvatar);
        if (onGuestProfileUpdate) {
          onGuestProfileUpdate(trimmedName, selectedAvatar);
        }
      }

      // Universal instant socket sync: if inside a room, notify the socket regardless of guest/user status
      if (socket && roomCode && playerId) {
        socket.emit("join_room", {
          roomCode,
          playerId,
          displayName: trimmedName,
          avatar: selectedAvatar,
          userId: user?.id || undefined,
        });
      }

      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update profile settings");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "16px",
      }}
    >
      <div
        className="scale-up"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          width: "100%",
          maxWidth: "460px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          padding: "32px",
          textAlign: "left",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "none",
            border: "none",
            color: "var(--color-text-muted)",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          &times;
        </button>

        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            fontWeight: 800,
            marginBottom: "8px",
            color: "#fff",
          }}
        >
          Account Settings
        </h3>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: "24px" }}>
          Edit your visual identity and choose a premium avatar.
        </p>

        {error && (
          <div
            style={{
              padding: "12px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "hsl(355,85%,65%)",
              fontSize: "0.85rem",
              marginBottom: "16px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "8px", fontWeight: 700 }}>
              Edit Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-default)",
                background: "var(--bg-surface-raised)",
                color: "var(--text-primary)",
                fontSize: "0.95rem",
              }}
            />
          </div>

          {/* Supporter Premium Avatars Section */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 5px var(--accent))" }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
                <label style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--accent)", fontFamily: "var(--font-display)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  AGENT IDENTITY MATRIX
                </label>
              </div>
              <span style={{ fontSize: "0.75rem", color: "hsl(142,75%,45%)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                ✨ ACTIVE
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: "12px",
                maxHeight: "285px",
                overflowY: "auto",
                padding: "12px",
                background: "var(--bg-surface-raised)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-sm)",
                opacity: 1,
              }}
            >
              {supporterAvatars.map((emoji) => {
                const isSelected = selectedAvatar === emoji;
                const isLocked = false;
                return (
                  <button
                    key={emoji}
                    type="button"
                    disabled={isLocked}
                    onClick={() => setSelectedAvatar(emoji)}
                    style={{
                      padding: "2px",
                      background: isSelected ? "var(--accent-bg-subtle)" : "transparent",
                      border: isSelected ? "2px solid var(--accent)" : "2px solid transparent",
                      borderRadius: "50%",
                      cursor: isLocked ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      transition: "all 0.15s ease",
                    }}
                    onMouseOver={(e) => {
                      if (!isSelected && !isLocked) e.currentTarget.style.background = "var(--border-subtle)";
                    }}
                    onMouseOut={(e) => {
                      if (!isSelected && !isLocked) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {renderAvatar(emoji, 44)}
                    {isLocked && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-2px",
                          right: "-2px",
                          background: "var(--color-surface)",
                          borderRadius: "50%",
                          width: "14px",
                          height: "14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.65rem",
                          border: "1px solid var(--border-default)",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                        }}
                      >
                        🔒
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 18px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-default)",
                background: "transparent",
                color: "var(--text-primary)",
                cursor: "pointer",
                fontFamily: "var(--font-display)",
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 24px",
                borderRadius: "var(--radius-sm)",
                background: "var(--accent)",
                color: "var(--accent-text-on)",
                fontWeight: 700,
                border: "none",
                fontFamily: "var(--font-display)",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

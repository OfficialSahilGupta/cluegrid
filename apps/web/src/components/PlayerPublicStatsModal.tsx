import React from "react";
import { renderAvatar } from "../utils/avatar";

interface PublicProfile {
  id: string;
  username: string;
  avatar: string;
  isSupporter: boolean;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    totalGuesses: number;
    correctGuesses: number;
  };
}

interface PlayerPublicStatsModalProps {
  profile: PublicProfile;
  onClose: () => void;
}

export function PlayerPublicStatsModal({ profile, onClose }: PlayerPublicStatsModalProps) {
  const winRate = profile.stats.gamesPlayed > 0 
    ? ((profile.stats.gamesWon / profile.stats.gamesPlayed) * 100).toFixed(0) 
    : "0";
  const accuracy = profile.stats.totalGuesses > 0 
    ? ((profile.stats.correctGuesses / profile.stats.totalGuesses) * 100).toFixed(0) 
    : "0";

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
        zIndex: 11000,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        className="scale-up"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          padding: "24px",
          textAlign: "left",
          position: "relative",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px", marginBottom: "16px" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
            Player Stats
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              fontSize: "1.2rem",
              display: "flex",
              alignItems: "center",
              padding: "4px",
            }}
          >
            ✕
          </button>
        </div>

        {/* User Card info */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "rgba(0, 0, 0, 0.2)",
              border: "2px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
            }}
          >
            {renderAvatar(profile.avatar, 42)}
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
              {profile.username}
              {profile.isSupporter && (
                <span style={{ fontSize: "0.75rem", background: "var(--accent-bg-subtle)", border: "1px solid var(--accent)", color: "var(--accent-text-on-subtle)", padding: "1px 5px", borderRadius: "8px", fontWeight: 700 }}>
                  💎
                </span>
              )}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "2px" }}>
              Cluegrid Member
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
          <div style={{ background: "var(--bg-surface-raised)", padding: "12px 8px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.03em" }}>Played</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 900, marginTop: "4px", color: "var(--text-primary)" }}>{profile.stats.gamesPlayed}</div>
          </div>
          <div style={{ background: "var(--bg-surface-raised)", padding: "12px 8px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.03em" }}>Won</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 900, marginTop: "4px", color: "var(--text-primary)" }}>{profile.stats.gamesWon}</div>
          </div>
          <div style={{ background: "var(--bg-surface-raised)", padding: "12px 8px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.03em" }}>Win Rate</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 900, marginTop: "4px", color: "var(--accent)" }}>{winRate}%</div>
          </div>
          <div style={{ background: "var(--bg-surface-raised)", padding: "12px 8px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.03em" }}>Accuracy</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 900, marginTop: "4px", color: "var(--accent)" }}>{accuracy}%</div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "10px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-primary)",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "var(--font-display)",
            transition: "all 0.15s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

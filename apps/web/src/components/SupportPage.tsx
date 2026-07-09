import React, { useState, useEffect } from "react";

export function SupportPage() {
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes("supporter-success")) {
      setSuccess(true);
    }
  }, []);

  return (
    <div className="fade-in" style={{ color: "#eef3ee", fontFamily: "'JetBrains Mono', monospace", fontSize: "14px", lineHeight: 1.6 }}>
      {/* Header section with Cyber bracket style */}
      <div style={{ borderBottom: "1.5px solid rgba(0, 240, 255, 0.3)", paddingBottom: "12px", marginBottom: "20px" }}>
        <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "1.8rem", fontWeight: 900, margin: 0, color: "#00f0ff", display: "flex", alignItems: "center", gap: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2.5" style={{ flexShrink: 0 }}><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" /><line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" /></svg>
          SUPPLY LINE : SUPPORT CLUEGRID
        </h2>
        <p style={{ color: "#9AA29B", fontSize: "12px", margin: "4px 0 0 0", letterSpacing: "0.03em" }}>
          Thank you for helping us keep our servers running and game lobbies active.
        </p>
      </div>

      {success && (
        <div
          style={{
            background: "rgba(178, 239, 155, 0.1)",
            border: "1.5px solid #b2ef9b",
            borderRadius: "6px",
            padding: "12px 16px",
            color: "#b2ef9b",
            fontWeight: 700,
            marginBottom: "20px",
            fontSize: "13px",
          }}
        >
          [ACCESS GRANTED] Supporter badge unlocked. Thank you for securing our supply lines.
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          background: "var(--bg-surface-raised)",
          border: "1.5px solid rgba(0,240,255,0.2)",
          borderRadius: "6px",
          padding: "20px",
          marginBottom: "24px",
        }}
      >
        <h3 style={{ margin: "0 0 4px 0", color: "#ef959c", fontWeight: 900, textTransform: "uppercase", fontSize: "1.1rem", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef959c" strokeWidth="2.5" style={{ flexShrink: 0 }}><path d="M12 2a10 10 0 0 0-10 10" /><path d="M12 6a6 6 0 0 0-6 6" /><circle cx="12" cy="18" r="2" fill="currentColor" /><path d="M12 12a2 2 0 0 0-2 2" /><line x1="12" y1="18" x2="12" y2="22" /></svg>
          Why support cluegrid?
        </h3>
        <p style={{ margin: 0, color: "#9AA29B", lineHeight: 1.6 }}>
          We appreciate your support in keeping the game alive. Every contribution directly funds our server infrastructure, helping us maintain stable real-time connections, database logs, and game lobby rooms for players worldwide.
        </p>
      </div>

      <div
        style={{
          background: "rgba(239,149,156,0.05)",
          border: "1.5px solid #ef959c",
          borderRadius: "6px",
          padding: "16px 20px",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(239,149,156,0.06)",
        }}
      >
        <h4
          style={{
            fontFamily: "'Big Shoulders Display', sans-serif",
            fontSize: "1.25rem",
            fontWeight: 900,
            margin: "0 0 6px 0",
            color: "#ef959c",
            letterSpacing: "0.06em",
          }}
        >
          PAYMENT SYSTEM UNDER MAINTENANCE
        </h4>
        <p
          style={{
            color: "#9AA29B",
            fontSize: "12px",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          We are currently updating our payment system. Support options will be available soon. Please check back later!
        </p>
      </div>
    </div>
  );
}

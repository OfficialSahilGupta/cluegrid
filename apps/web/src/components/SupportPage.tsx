import React, { useState, useEffect } from "react";

export function SupportPage() {
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes("supporter-success")) {
      setSuccess(true);
    }
  }, []);

  return (
    <div className="fade-in" style={{ color: "#eef3ee", fontFamily: "'JetBrains Mono', monospace" }}>
      <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "2.5rem", fontWeight: 900, margin: "0 0 12px 0", color: "#00f0ff", display: "flex", alignItems: "center", gap: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        <span>☕</span> SUPPLY LINE : PROJECT SUPPORT
      </h2>
      <p style={{ color: "#9AA29B", fontSize: "1.05rem", margin: "0 0 32px 0", lineHeight: 1.6 }}>
        Fund our server grid and secure operations. Supporting covers real-time WebSockets, database logs, and secure hosting infrastructure. No tracking. No ads. Just pure intelligence.
      </p>

      {success && (
        <div
          style={{
            background: "rgba(178, 239, 155, 0.12)",
            border: "1.5px solid #b2ef9b",
            borderRadius: "6px",
            padding: "16px",
            color: "#b2ef9b",
            fontWeight: 700,
            marginBottom: "24px",
            fontSize: "0.95rem",
          }}
        >
          [ACCESS GRANTED] Supporter badge unlocked. Thank you for securing our supply lines.
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          background: "rgba(6,24,28,0.4)",
          border: "1px solid rgba(0,240,255,0.2)",
          borderRadius: "8px",
          padding: "24px",
          marginBottom: "32px",
          textAlign: "left",
        }}
      >
        <h3 style={{ margin: "0 0 8px 0", color: "#ff0055", fontWeight: 900, textTransform: "uppercase", fontSize: "1.1rem", letterSpacing: "0.08em" }}>
          📡 CLEARANCE BENEFITS (SUPPORTER LEVEL)
        </h3>
        <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: 1.7, color: "#9AA29B", listStyleType: "square" }}>
          <li style={{ marginBottom: "8px" }}>
            <strong style={{ color: "#eef3ee" }}>Synchronized Intel Stream:</strong> Broadcast background music with all players currently connected to the spy grid.
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong style={{ color: "#eef3ee" }}>Tactical Identifier:</strong> Dedicated Supporter Badge overlayed next to your avatar in lobbies, lists, and main chats.
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong style={{ color: "#eef3ee" }}>Wall of Operatives:</strong> Special codename mention in our permanent credits terminal.
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong style={{ color: "#eef3ee" }}>Custom Profile Encryption:</strong> Edit and customize a bio description visible to players viewing your dossier.
          </li>
          <li>
            <strong style={{ color: "#eef3ee" }}>Fair Play Protocol:</strong> No unfair gameplay advantages. Standard agents and elite operatives remain mathematically balanced.
          </li>
        </ul>
      </div>

      <div
        style={{
          background: "rgba(255,0,85,0.06)",
          border: "1.5px solid #ff0055",
          borderRadius: "8px",
          padding: "24px 32px",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(255,0,85,0.1)",
        }}
      >
        <h4
          style={{
            fontFamily: "'Big Shoulders Display', sans-serif",
            fontSize: "1.4rem",
            fontWeight: 900,
            margin: "0 0 8px 0",
            color: "#ff0055",
            letterSpacing: "0.06em",
          }}
        >
          [GATEWAY DOWN] PAYMENT SYSTEM UNDER MAINTENANCE
        </h4>
        <p
          style={{
            color: "#9AA29B",
            fontSize: "0.95rem",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Our secure checkout portal is undergoing local encryption configuration. Direct stripe transactions will be functional shortly. Check back during future cycles to support.
        </p>
      </div>
    </div>
  );
}

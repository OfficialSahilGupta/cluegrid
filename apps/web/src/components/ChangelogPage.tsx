import React from "react";

export function ChangelogPage() {
  const updates = [
    {
      version: "Music & Profiles",
      date: "July 2026",
      color: "#00f0ff",
      features: [
        "YouTube & Spotify Player: Play your favorite music inside the game room.",
        "Avatar Gallery: Choose amazing avatars for your player profile.",
        "Chat Music Integration: Share music links in team chat to play them instantly.",
      ],
    },
    {
      version: "Room Settings",
      date: "June 2026",
      color: "#ef959c",
      features: [
        "Turn Timers: Set custom time limits for each turn to keep the game moving fast.",
        "Game Modes: Switch easily between Duet (co-op) and Classic competitive modes.",
      ],
    },
    {
      version: "Profiles & Statistics",
      date: "May 2026",
      color: "#00f0ff",
      features: [
        "Easy Sign-In: Join quickly as a Guest, or log in with Google and Discord.",
        "Match Statistics: Track your overall win rate, total games played, and scores.",
      ],
    },
  ];

  return (
    <div className="fade-in" style={{ color: "#eef3ee", fontFamily: "'JetBrains Mono', monospace", fontSize: "14px", lineHeight: 1.5 }}>
      {/* Header section */}
      <div style={{ borderBottom: "1.5px solid rgba(0, 240, 255, 0.3)", paddingBottom: "12px", marginBottom: "20px" }}>
        <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "1.8rem", fontWeight: 900, margin: 0, color: "#00f0ff", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          What's New
        </h2>
        <p style={{ color: "#9AA29B", fontSize: "12px", margin: "4px 0 0 0", letterSpacing: "0.03em" }}>
          Check out our latest game features and updates.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {updates.map((up) => (
          <section key={up.version} style={{ background: "var(--bg-surface-raised)", border: "1.5px solid rgba(238,243,238,0.08)", borderLeft: `4px solid ${up.color}`, padding: "14px 18px", borderRadius: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
              <h3 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "1.25rem", fontWeight: 900, margin: 0, color: up.color, letterSpacing: "0.04em" }}>
                {up.version}
              </h3>
              <span style={{ fontSize: "11px", color: "#9AA29B", fontWeight: 500 }}>
                {up.date}
              </span>
            </div>
            <ul style={{ margin: 0, paddingLeft: "16px", lineHeight: 1.6, color: "#9AA29B", listStyleType: "square", display: "flex", flexDirection: "column", gap: "6px" }}>
              {up.features.map((feat, i) => (
                <li key={i}>
                  {feat}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

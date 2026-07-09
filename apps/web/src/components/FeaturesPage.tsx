import React from "react";

export function FeaturesPage() {
    const featuresList = [
    {
      id: "Teams",
      badge: "Standard",
      badgeType: "standard",
      title: "2, 3, and 4 Teams Support",
      desc: "Scale your games for large groups. Connect and play with up to 4 teams (Red, Blue, Green, Yellow) simultaneously.",
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: "Search",
      badge: "Standard",
      badgeType: "standard",
      title: "Google Search Meanings",
      desc: "Stuck on a word? Click any card on the grid to search and lookup definitions instantly via the integrated Google lookup search bar.",
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      id: "Key",
      badge: "Standard",
      badgeType: "standard",
      title: "Peek Intel Board Key",
      desc: "Allows active Spymasters to toggle the overlay grid solution at any time to plan their next clue strategical moves.",
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <line x1="15" y1="3" x2="15" y2="21" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="15" x2="21" y2="15" />
        </svg>
      ),
    },

    {
      id: "Status",
      badge: "Standard",
      badgeType: "standard",
      title: "Live Presence Status",
      desc: "Inform your teammates of your current status with quick selector badges such as Active, AFK, Busy, or sleep.",
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      id: "Decks",
      badge: "Standard",
      badgeType: "standard",
      title: "45+ Deck Languages",
      desc: "Fully localized gameplay board card deck words in languages including Japanese, Hindi, Nepali, Vietnamese, French, and more.",
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
    {
      id: "Media",
      badge: "Standard",
      badgeType: "standard",
      title: "YouTube and Spotify Player",
      desc: "Synchronize and stream background music directly inside the room panel while discussing clues with teammates.",
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      ),
    },
    {
      id: "Chat",
      badge: "Standard",
      badgeType: "standard",
      title: "Isolated Team Chats",
      desc: "Discuss your plans privately in dedicated Operative channels or coordinate Spymaster signals without leaking info.",
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: "Stats",
      badge: "Signed In",
      badgeType: "signedin",
      title: "Player Stats and History",
      desc: "Track your match performance, overall win rates, games played, and supporter level achievements easily.",
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      id: "Security",
      badge: "Standard",
      badgeType: "standard",
      title: "Anti-Spy Action Logging",
      desc: "If an Operative secretly or intuitively attempts to join the Spymasters, they'll be caught and recorded in the game log.",
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="fade-in" style={{ color: "#eef3ee", fontFamily: "'JetBrains Mono', monospace", fontSize: "14px", lineHeight: 1.5 }}>
      {/* Header section with Cyber bracket style */}
      <div style={{ borderBottom: "1.5px solid rgba(0, 240, 255, 0.3)", paddingBottom: "12px", marginBottom: "20px" }}>
        <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "1.8rem", fontWeight: 900, margin: 0, color: "#00f0ff", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          SYSTEM CAPABILITIES &amp; GRID PROTOCOLS
        </h2>
        <span style={{ fontSize: "10px", color: "#9AA29B", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          DOCUMENT ID: CLUEGRID-SYS-FEAT-v1.4.0
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "10px" }}>
        {featuresList.map((feat) => {
          const isStandard = feat.badgeType === "standard";
          const accentColor = isStandard ? "#00f0ff" : "#ef959c";
          const badgeBg = isStandard ? "rgba(0, 240, 255, 0.08)" : "rgba(239, 149, 156, 0.08)";

          return (
            <div
              key={feat.id}
              style={{
                background: "var(--bg-surface-raised)",
                border: `1.5px solid ${isStandard ? "rgba(0, 240, 255, 0.2)" : "rgba(239, 149, 156, 0.2)"}`,
                padding: "14px",
                borderRadius: "6px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "135px",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: accentColor, display: "flex", alignItems: "center", gap: "6px", textTransform: "uppercase" }}>
                    {feat.icon}
                    {feat.id}
                  </span>
                  <span style={{ fontSize: "9px", background: badgeBg, color: accentColor, padding: "1px 6px", borderRadius: "3px", fontWeight: 600 }}>
                    {feat.badge}
                  </span>
                </div>
                <h4 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: "1.1rem", color: "#eef3ee", marginBottom: "6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  {feat.title}
                </h4>
                <p style={{ fontSize: "12px", color: "#9AA29B", margin: 0, lineHeight: 1.4 }}>
                  {feat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

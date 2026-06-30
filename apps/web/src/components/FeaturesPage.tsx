import React from "react";

export function FeaturesPage() {
  return (
    <div
      style={{
        maxWidth: "850px",
        width: "100%",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        padding: "36px",
        textAlign: "left",
        margin: "0 auto",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
      }}
      className="fade-in"
    >
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, margin: "0 0 8px 0", color: "var(--text-primary)" }}>
        ClueGrid Features
      </h2>
      <p style={{ color: "var(--text-secondary)", fontSize: "1rem", margin: "0 0 28px 0" }}>
        Discover the features built into ClueGrid to enhance your game nights, track your performance, and customize your experience.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
        {/* Feature 1 */}
        <div style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", padding: "18px", borderRadius: "var(--radius-md)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>Teams</span>
            <span style={{ fontSize: "0.75rem", background: "rgba(214, 207, 194, 0.08)", color: "var(--text-secondary)", padding: "3px 8px", borderRadius: "4px", fontWeight: 600 }}>Standard</span>
          </div>
          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", color: "var(--text-primary)", marginBottom: "6px" }}>
            2, 3, and 4 Teams Support
          </h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Scale your games for large groups. Connect and play with up to 4 teams (Red, Blue, Green, Yellow) simultaneously.
          </p>
        </div>

        {/* Feature 2 */}
        <div style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", padding: "18px", borderRadius: "var(--radius-md)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>Search</span>
            <span style={{ fontSize: "0.75rem", background: "var(--accent-bg-subtle)", color: "var(--accent)", padding: "3px 8px", borderRadius: "4px", fontWeight: 600 }}>Signed In</span>
          </div>
          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", color: "var(--text-primary)", marginBottom: "6px" }}>
            Google Search Meanings
          </h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Stuck on a word? Click any card on the grid to search and lookup definitions instantly via the integrated Google lookup search bar.
          </p>
        </div>

        {/* Feature 3 */}
        <div style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", padding: "18px", borderRadius: "var(--radius-md)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>Key</span>
            <span style={{ fontSize: "0.75rem", background: "rgba(214, 207, 194, 0.08)", color: "var(--text-secondary)", padding: "3px 8px", borderRadius: "4px", fontWeight: 600 }}>Standard</span>
          </div>
          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", color: "var(--text-primary)", marginBottom: "6px" }}>
            Peek Intel Board Key
          </h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Allows active Spymasters to toggle the overlay grid solution at any time to plan their next clue strategical moves.
          </p>
        </div>

        {/* Feature 4 */}
        <div style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", padding: "18px", borderRadius: "var(--radius-md)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>Theme</span>
            <span style={{ fontSize: "0.75rem", background: "rgba(214, 207, 194, 0.08)", color: "var(--text-secondary)", padding: "3px 8px", borderRadius: "4px", fontWeight: 600 }}>Standard</span>
          </div>
          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", color: "var(--text-primary)", marginBottom: "6px" }}>
            Dual Creative Themes
          </h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Switch on the fly between "Redacted Ink" (tactile dark mode) and "Daylight Dossier" (warm paper light mode).
          </p>
        </div>

        {/* Feature 5 */}
        <div style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", padding: "18px", borderRadius: "var(--radius-md)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>Status</span>
            <span style={{ fontSize: "0.75rem", background: "var(--accent-bg-subtle)", color: "var(--accent)", padding: "3px 8px", borderRadius: "4px", fontWeight: 600 }}>Signed In</span>
          </div>
          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", color: "var(--text-primary)", marginBottom: "6px" }}>
            Live Presence Status
          </h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Inform your teammates of your current status with quick selector badges such as Active, AFK, Busy, or sleep.
          </p>
        </div>

        {/* Feature 6 */}
        <div style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", padding: "18px", borderRadius: "var(--radius-md)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>Decks</span>
            <span style={{ fontSize: "0.75rem", background: "rgba(214, 207, 194, 0.08)", color: "var(--text-secondary)", padding: "3px 8px", borderRadius: "4px", fontWeight: 600 }}>Standard</span>
          </div>
          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", color: "var(--text-primary)", marginBottom: "6px" }}>
            45+ Deck Languages
          </h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Fully localized gameplay board card deck words in languages including Japanese, Hindi, Nepali, Vietnamese, French, and more.
          </p>
        </div>

        {/* Feature 7 */}
        <div style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", padding: "18px", borderRadius: "var(--radius-md)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>Media</span>
            <span style={{ fontSize: "0.75rem", background: "var(--accent-bg-subtle)", color: "var(--accent)", padding: "3px 8px", borderRadius: "4px", fontWeight: 600 }}>Signed In</span>
          </div>
          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", color: "var(--text-primary)", marginBottom: "6px" }}>
            YouTube and Spotify Player
          </h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Synchronize and stream background music directly inside the room panel while discussing clues with teammates.
          </p>
        </div>

        {/* Feature 8 */}
        <div style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", padding: "18px", borderRadius: "var(--radius-md)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>Chat</span>
            <span style={{ fontSize: "0.75rem", background: "var(--accent-bg-subtle)", color: "var(--accent)", padding: "3px 8px", borderRadius: "4px", fontWeight: 600 }}>Signed In</span>
          </div>
          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", color: "var(--text-primary)", marginBottom: "6px" }}>
            Isolated Team Chats
          </h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Discuss your plans privately in dedicated Operative channels or coordinate Spymaster signals without leaking info.
          </p>
        </div>

        {/* Feature 9 */}
        <div style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", padding: "18px", borderRadius: "var(--radius-md)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>Stats</span>
            <span style={{ fontSize: "0.75rem", background: "var(--accent-bg-subtle)", color: "var(--accent)", padding: "3px 8px", borderRadius: "4px", fontWeight: 600 }}>Signed In</span>
          </div>
          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", color: "var(--text-primary)", marginBottom: "6px" }}>
            Player Stats and History
          </h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Track your match performance, overall win rates, games played, and supporter level achievements easily.
          </p>
        </div>

        {/* Feature 10 */}
        <div style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", padding: "18px", borderRadius: "var(--radius-md)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>Security</span>
            <span style={{ fontSize: "0.75rem", background: "rgba(214, 207, 194, 0.08)", color: "var(--text-secondary)", padding: "3px 8px", borderRadius: "4px", fontWeight: 600 }}>Standard</span>
          </div>
          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", color: "var(--text-primary)", marginBottom: "6px" }}>
            Anti-Spy Action Logging
          </h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            If an Operative secretly or intuitively attempts to join the Spymasters, they&apos;ll be caught and recorded in the game log.
          </p>
        </div>
      </div>
    </div>
  );
}

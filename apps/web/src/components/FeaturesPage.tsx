import React from "react";

export function FeaturesPage() {
  return (
    <div className="fade-in" style={{ color: "#eef3ee", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.82rem", lineHeight: 1.4 }}>
      <div style={{ borderBottom: "2px solid #00f0ff", paddingBottom: "12px", marginBottom: "20px" }}>
        <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "1.8rem", fontWeight: 900, margin: 0, color: "#00f0ff", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          SYSTEM CAPABILITIES &amp; GRID PROTOCOLS
        </h2>
        <span style={{ fontSize: "10px", color: "#9AA29B", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          DOCUMENT ID: CLUEGRID-SYS-FEAT-v1.4.0
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
        {/* Feature 1 */}
        <div style={{ background: "rgba(6,24,28,0.4)", border: "1.5px solid rgba(0,240,255,0.25)", padding: "14px", borderRadius: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#00f0ff", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              NET_NODES
            </span>
            <span style={{ fontSize: "0.65rem", background: "rgba(0,240,255,0.1)", color: "#00f0ff", padding: "1px 5px", borderRadius: "3px", fontWeight: 600 }}>Standard</span>
          </div>
          <h4 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: "1.05rem", color: "#eef3ee", marginBottom: "4px", letterSpacing: "0.04em" }}>
            2, 3, AND 4 TEAMS SCALING
          </h4>
          <p style={{ fontSize: "0.78rem", color: "#9AA29B", margin: 0 }}>
            Scale active channels for larger squads. Connect and play with up to 4 teams (Red, Blue, Green, Yellow) simultaneously on a dynamically sizing grid.
          </p>
        </div>

        {/* Feature 2 */}
        <div style={{ background: "rgba(6,24,28,0.4)", border: "1.5px solid rgba(255,0,85,0.25)", padding: "14px", borderRadius: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ff0055", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              TERM_SEARCH
            </span>
            <span style={{ fontSize: "0.65rem", background: "rgba(255,0,85,0.1)", color: "#ff0055", padding: "1px 5px", borderRadius: "3px", fontWeight: 600 }}>Standard</span>
          </div>
          <h4 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: "1.05rem", color: "#eef3ee", marginBottom: "4px", letterSpacing: "0.04em" }}>
            GOOGLE TERM SEARCH
          </h4>
          <p style={{ fontSize: "0.78rem", color: "#9AA29B", margin: 0 }}>
            Click any active card on the grid to instantly pull up dictionary search definitions via the integrated Google lookup search bar.
          </p>
        </div>

        {/* Feature 3 */}
        <div style={{ background: "rgba(6,24,28,0.4)", border: "1.5px solid rgba(0,240,255,0.25)", padding: "14px", borderRadius: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#00f0ff", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
              PEEK_MAP
            </span>
            <span style={{ fontSize: "0.65rem", background: "rgba(0,240,255,0.1)", color: "#00f0ff", padding: "1px 5px", borderRadius: "3px", fontWeight: 600 }}>Standard</span>
          </div>
          <h4 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: "1.05rem", color: "#eef3ee", marginBottom: "4px", letterSpacing: "0.04em" }}>
            PEEK INTEL KEY
          </h4>
          <p style={{ fontSize: "0.78rem", color: "#9AA29B", margin: 0 }}>
            Allows Spymasters to toggle the key overlay board at any time to plan their next word transmission coordinate moves.
          </p>
        </div>

        {/* Feature 4 */}
        <div style={{ background: "rgba(6,24,28,0.4)", border: "1.5px solid rgba(255,0,85,0.25)", padding: "14px", borderRadius: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ff0055", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              SYS_TIMERS
            </span>
            <span style={{ fontSize: "0.65rem", background: "rgba(255,0,85,0.1)", color: "#ff0055", padding: "1px 5px", borderRadius: "3px", fontWeight: 600 }}>Standard</span>
          </div>
          <h4 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: "1.05rem", color: "#eef3ee", marginBottom: "4px", letterSpacing: "0.04em" }}>
            CUSTOM GAME TIMERS
          </h4>
          <p style={{ fontSize: "0.78rem", color: "#9AA29B", margin: 0 }}>
            Control turn and clue durations. Tailor active timers to ensure quick diagnostic runs or standard deliberate game-play.
          </p>
        </div>

        {/* Feature 5 */}
        <div style={{ background: "rgba(6,24,28,0.4)", border: "1.5px solid rgba(0,240,255,0.25)", padding: "14px", borderRadius: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#00f0ff", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
              MEDIA_LINK
            </span>
            <span style={{ fontSize: "0.65rem", background: "rgba(0,240,255,0.1)", color: "#00f0ff", padding: "1px 5px", borderRadius: "3px", fontWeight: 600 }}>Signed In</span>
          </div>
          <h4 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: "1.05rem", color: "#eef3ee", marginBottom: "4px", letterSpacing: "0.04em" }}>
            YOUTUBE / SPOTIFY STREAMING
          </h4>
          <p style={{ fontSize: "0.78rem", color: "#9AA29B", margin: 0 }}>
            Paste links into a synchronized media player widget to share background music across all connected operatives.
          </p>
        </div>

        {/* Feature 6 */}
        <div style={{ background: "rgba(6,24,28,0.4)", border: "1.5px solid rgba(255,0,85,0.25)", padding: "14px", borderRadius: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ff0055", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              SEC_PROTO
            </span>
            <span style={{ fontSize: "0.65rem", background: "rgba(255,0,85,0.1)", color: "#ff0055", padding: "1px 5px", borderRadius: "3px", fontWeight: 600 }}>Standard</span>
          </div>
          <h4 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: "1.05rem", color: "#eef3ee", marginBottom: "4px", letterSpacing: "0.04em" }}>
            ANTI-SPY ACTION LOGGING
          </h4>
          <p style={{ fontSize: "0.78rem", color: "#9AA29B", margin: 0 }}>
            Automatically catch and log attempts by Operatives to peek at the key solutions board, ensuring full game transparency.
          </p>
        </div>

        {/* Feature 7 */}
        <div style={{ background: "rgba(6,24,28,0.4)", border: "1.5px solid rgba(0,240,255,0.25)", padding: "14px", borderRadius: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#00f0ff", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              ISOLATED_COMMS
            </span>
            <span style={{ fontSize: "0.65rem", background: "rgba(0,240,255,0.1)", color: "#00f0ff", padding: "1px 5px", borderRadius: "3px", fontWeight: 600 }}>Signed In</span>
          </div>
          <h4 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: "1.05rem", color: "#eef3ee", marginBottom: "4px", letterSpacing: "0.04em" }}>
            ISOLATED TEAM CHATS
          </h4>
          <p style={{ fontSize: "0.78rem", color: "#9AA29B", margin: 0 }}>
            Keep planning private. Coordinates and target details are secured in separate chat sockets to prevent leakage.
          </p>
        </div>

        {/* Feature 8 */}
        <div style={{ background: "rgba(6,24,28,0.4)", border: "1.5px solid rgba(255,0,85,0.25)", padding: "14px", borderRadius: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ff0055", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              STATS_MON
            </span>
            <span style={{ fontSize: "0.65rem", background: "rgba(255,0,85,0.1)", color: "#ff0055", padding: "1px 5px", borderRadius: "3px", fontWeight: 600 }}>Signed In</span>
          </div>
          <h4 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: "1.05rem", color: "#eef3ee", marginBottom: "4px", letterSpacing: "0.04em" }}>
            PLAYER PERFORMANCE HISTORIES
          </h4>
          <p style={{ fontSize: "0.78rem", color: "#9AA29B", margin: 0 }}>
            Track match victories, exact clue designation rates, roles completed, and active presence status logs in real-time.
          </p>
        </div>

        {/* Feature 9 */}
        <div style={{ background: "rgba(6,24,28,0.4)", border: "1.5px solid rgba(0,240,255,0.25)", padding: "14px", borderRadius: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#00f0ff", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 20h20M5 17h14M8 14h8M11 11h2"/></svg>
              AUDIO_KEY
            </span>
            <span style={{ fontSize: "0.65rem", background: "rgba(0,240,255,0.1)", color: "#00f0ff", padding: "1px 5px", borderRadius: "3px", fontWeight: 600 }}>Standard</span>
          </div>
          <h4 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: "1.05rem", color: "#eef3ee", marginBottom: "4px", letterSpacing: "0.04em" }}>
            PROCEDURAL BRIEFING AUDIO
          </h4>
          <p style={{ fontSize: "0.78rem", color: "#9AA29B", margin: 0 }}>
            Procedural mechanical typewriter clicks and speaker hum generators generated directly on-the-fly using Web Audio API.
          </p>
        </div>

        {/* Feature 10 */}
        <div style={{ background: "rgba(6,24,28,0.4)", border: "1.5px solid rgba(255,0,85,0.25)", padding: "14px", borderRadius: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ff0055", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              DECK_LANGS
            </span>
            <span style={{ fontSize: "0.65rem", background: "rgba(255,0,85,0.1)", color: "#ff0055", padding: "1px 5px", borderRadius: "3px", fontWeight: 600 }}>Standard</span>
          </div>
          <h4 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: "1.05rem", color: "#eef3ee", marginBottom: "4px", letterSpacing: "0.04em" }}>
            45+ LOCALIZED DECKS
          </h4>
          <p style={{ fontSize: "0.78rem", color: "#9AA29B", margin: 0 }}>
            Generate grids in multiple deck languages (Spanish, French, German, Vietnamese, Hindi, Japanese, and more).
          </p>
        </div>
      </div>
    </div>
  );
}

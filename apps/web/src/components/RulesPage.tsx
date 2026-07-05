import React from "react";
import { useTranslation } from "react-i18next";

export function RulesPage() {
  const { t } = useTranslation();

  return (
    <div className="fade-in" style={{ color: "#eef3ee", fontFamily: "'JetBrains Mono', monospace" }}>
      <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "2.5rem", fontWeight: 900, margin: "0 0 8px 0", color: "#00f0ff", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {t("rules.title")}
      </h2>
      <p style={{ color: "#9AA29B", fontSize: "1.05rem", margin: "0 0 28px 0", lineHeight: 1.5 }}>
        {t("rules.subtitle")}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Core Roles Section */}
        <section style={{ background: "rgba(6,24,28,0.4)", padding: "20px", borderRadius: "8px", border: "1px solid rgba(0,240,255,0.2)" }}>
          <h3 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "1.4rem", fontWeight: 900, margin: "0 0 12px 0", color: "#ff0055", letterSpacing: "0.06em" }}>
            OPERATIVE ROLES OVERVIEW
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.95rem", lineHeight: 1.6 }}>
            <p>
              <strong style={{ color: "#00f0ff" }}>Spymasters:</strong> Can see the full grid solution map showing agent locations, neutral civilians, and the assassin. They transmit signals through single-word clues.
            </p>
            <p>
              <strong style={{ color: "#ff0055" }}>Operatives:</strong> Only see word cards on the grid. They must decipher clues, vote on target designations, and flip cards.
            </p>
          </div>
        </section>

        {/* Section 1: Classic & Multi-Team */}
        <section style={{ borderBottom: "1px solid rgba(0,240,255,0.15)", paddingBottom: "24px" }}>
          <h3 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "1.4rem", fontWeight: 900, margin: "0 0 12px 0", color: "#00f0ff", letterSpacing: "0.06em" }}>
            1. MULTI-TEAM OPERATION PROTOCOL
          </h3>
          <p style={{ lineHeight: 1.6, fontSize: "0.95rem", color: "#eef3ee", margin: "0 0 12px 0" }}>
            In Classic mode, players split into Red and Blue. In Multi-Team mode, up to 4 groups (Red, Blue, Green, Duet) can coordinate simultaneously on expanded grids.
          </p>
          <ul style={{ paddingLeft: "20px", lineHeight: 1.7, fontSize: "0.95rem", color: "#9AA29B", listStyleType: "square" }}>
            <li style={{ marginBottom: "8px" }}>Teams deploy turns sequentially to contact their secret targets.</li>
            <li style={{ marginBottom: "8px" }}>Flipping your own card scores a point and allows another action.</li>
            <li style={{ marginBottom: "8px" }}>Flipping a civilian or enemy target ends the active turn immediately.</li>
            <li style={{ marginBottom: "8px" }}><strong style={{ color: "#ff0055" }}>The Assassin:</strong> Contacting the assassin results in instant mission failure.</li>
          </ul>
        </section>

        {/* Section 2: Duet/Co-op Mode */}
        <section style={{ borderBottom: "1px solid rgba(0,240,255,0.15)", paddingBottom: "24px" }}>
          <h3 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "1.4rem", fontWeight: 900, margin: "0 0 12px 0", color: "#00f0ff", letterSpacing: "0.06em" }}>
            2. DUET / COOPERATIVE OPERATIONS
          </h3>
          <p style={{ lineHeight: 1.6, fontSize: "0.95rem", color: "#eef3ee", margin: "0 0 12px 0" }}>
            A fully cooperative variant where everyone works as one combined spy group.
          </p>
          <ul style={{ paddingLeft: "20px", lineHeight: 1.7, fontSize: "0.95rem", color: "#9AA29B", listStyleType: "square" }}>
            <li style={{ marginBottom: "8px" }}>Double-sided key maps are shared: each side of the channel sees half of the target locations.</li>
            <li style={{ marginBottom: "8px" }}>Give clues back and forth to find all 15 agents before turn logs deplete.</li>
          </ul>
        </section>

        {/* Section 3: Clue Giving Rules & Constraints */}
        <section style={{ borderBottom: "1px solid rgba(0,240,255,0.15)", paddingBottom: "24px" }}>
          <h3 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "1.4rem", fontWeight: 900, margin: "0 0 12px 0", color: "#00f0ff", letterSpacing: "0.06em" }}>
            3. TRANSMISSION CONSTRAINTS
          </h3>
          <p style={{ lineHeight: 1.6, fontSize: "0.95rem", color: "#eef3ee", margin: "0 0 12px 0" }}>
            To keep communications secure and balanced, Spymasters must adhere to constraints:
          </p>
          <ul style={{ paddingLeft: "20px", lineHeight: 1.7, fontSize: "0.95rem", color: "#9AA29B", listStyleType: "square" }}>
            <li style={{ marginBottom: "8px" }}><strong>Single Word:</strong> Clues must be exactly one single word. Phrases are prohibited.</li>
            <li style={{ marginBottom: "8px" }}><strong>No Numeric Codes:</strong> Do not include digits or coordinates (e.g. "clues04").</li>
          </ul>
        </section>

        {/* Section 4: Special Count Rules (0 & Infinity) */}
        <section style={{ borderBottom: "1px solid rgba(0,240,255,0.15)", paddingBottom: "24px" }}>
          <h3 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "1.4rem", fontWeight: 900, margin: "0 0 12px 0", color: "#00f0ff", letterSpacing: "0.06em" }}>
            4. TACTICAL OVERRIDES (0 & INFINITY)
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "0.95rem", lineHeight: 1.6, color: "#eef3ee" }}>
            <div>
              <strong style={{ color: "#b2ef9b" }}>0 (Zero) Clue Override:</strong>
              <p style={{ margin: "4px 0 0 0", color: "#9AA29B" }}>
                Signals that none of your cards link to the word (e.g. <em>"Water 0"</em>). Allows unlimited guesses this turn to safely pick other cards.
              </p>
            </div>
            <div>
              <strong style={{ color: "#b2ef9b" }}>Infinity Clue Override:</strong>
              <p style={{ margin: "4px 0 0 0", color: "#9AA29B" }}>
                Allows unlimited guesses to catch up on missed targets from previous turns.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

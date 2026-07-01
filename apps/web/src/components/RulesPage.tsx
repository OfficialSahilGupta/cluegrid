import React from "react";
import { useTranslation } from "react-i18next";

export function RulesPage() {
  const { t } = useTranslation();

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
        {t("rules.title")}
      </h2>
      <p style={{ color: "var(--text-secondary)", fontSize: "1rem", margin: "0 0 28px 0" }}>
        {t("rules.subtitle")}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Core Roles Section */}
        <section style={{ background: "var(--bg-surface-raised)", padding: "20px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, margin: "0 0 12px 0", color: "var(--accent)" }}>
            Roles Overview
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.95rem", lineHeight: 1.6 }}>
            <p>
              <strong>Spymasters:</strong> Spymasters can see the secret board key grid showing which card belongs to which team, neutral, or the assassin. They guide their team by providing smart clues.
            </p>
            <p>
              <strong>Operatives:</strong> Operatives do not see the key. They see only the word cards on the grid. They must discuss, vote on, and flip cards based on their Spymaster's clues.
            </p>
          </div>
        </section>

        {/* Section 1: Classic & Multi-Team */}
        <section style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "24px" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, margin: "0 0 12px 0", color: "var(--accent)" }}>
            1. Classic and Multi-Team Game Modes
          </h3>
          <p style={{ lineHeight: 1.6, fontSize: "0.95rem", color: "var(--text-primary)", margin: "0 0 12px 0" }}>
            In <strong>Classic</strong> mode, players divide into two teams (Red vs Blue). In <strong>Multi-Team</strong> mode, the game scales to 3 teams (Red, Blue, Green) or 4 teams (Red, Blue, Green, Yellow) playing on a larger grid.
          </p>
          <ul style={{ paddingLeft: "20px", lineHeight: 1.6, fontSize: "0.95rem", color: "var(--text-secondary)" }}>
            <li style={{ marginBottom: "8px" }}>Teams take turns sequentially to clear their assigned cards from the board.</li>
            <li style={{ marginBottom: "8px" }}>If operatives flip their own team's card, they score a point and can guess again.</li>
            <li style={{ marginBottom: "8px" }}>Flipping a neutral card or an opponent team's card ends the turn immediately (and opponent cards award a point to that team).</li>
            <li style={{ marginBottom: "8px" }}><strong>The Assassin:</strong> Hitting the assassin card results in an immediate loss or elimination depending on your lobby settings!</li>
          </ul>
        </section>

        {/* Section 2: Duet/Co-op Mode */}
        <section style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "24px" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, margin: "0 0 12px 0", color: "var(--accent)" }}>
            2. Duet and Co-op Mode
          </h3>
          <p style={{ lineHeight: 1.6, fontSize: "0.95rem", color: "var(--text-primary)", margin: "0 0 12px 0" }}>
            A fully cooperative variant where players work together as one team.
          </p>
          <ul style={{ paddingLeft: "20px", lineHeight: 1.6, fontSize: "0.95rem", color: "var(--text-secondary)" }}>
            <li style={{ marginBottom: "8px" }}>All players act as both Spymasters and Operatives. The key grid is dual-sided: one side of the room sees one half of the agent locations, and the other side sees the remaining locations.</li>
            <li style={{ marginBottom: "8px" }}>Players take turns giving clues to each other.</li>
            <li style={{ marginBottom: "8px" }}>The goal is to find all 15 active agents on the board cooperatively before running out of turn tokens or clicking the assassin card.</li>
          </ul>
        </section>

        {/* Section 3: Clue Giving Rules & Constraints */}
        <section style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "24px" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, margin: "0 0 12px 0", color: "var(--accent)" }}>
            3. Clue Giving Constraints (For Spymasters)
          </h3>
          <p style={{ lineHeight: 1.6, fontSize: "0.95rem", color: "var(--text-primary)", margin: "0 0 12px 0" }}>
            To keep the game fair, Spymasters must follow strict communication rules:
          </p>
          <ul style={{ paddingLeft: "20px", lineHeight: 1.6, fontSize: "0.95rem", color: "var(--text-secondary)" }}>
            <li style={{ marginBottom: "8px" }}><strong>Single Word Clues:</strong> Clues must be exactly one single word. Two-word clues or phrases are strictly prohibited.</li>
            <li style={{ marginBottom: "8px" }}><strong>No Alphanumeric Words:</strong> You cannot use digits or mixed alphanumeric structures (e.g. "agent007", "3trees").</li>
            <li style={{ marginBottom: "8px" }}><strong>Abbreviations and Acronyms:</strong> Abbreviations (like "NASA", "USA") are allowed only if your team agrees upon them before starting the game.</li>
          </ul>
        </section>

        {/* Section 4: Special Count Rules (0 & Infinity) */}
        <section style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "24px" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, margin: "0 0 12px 0", color: "var(--accent)" }}>
            4. Special Clue Count Rules (0 and Infinity)
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "0.95rem", lineHeight: 1.6, color: "var(--text-primary)" }}>
            <div>
              <strong>0 (Zero) Clue Rule:</strong>
              <p style={{ margin: "4px 0 0 0", color: "var(--text-secondary)" }}>
                Giving a count of 0 (e.g. <em>"Water 0"</em>) indicates that none of your team's cards are related to "Water". This allows operatives to make an unlimited number of guesses during that turn while avoiding cards linked to that word. It is a powerful tactical tool: operatives should identify and avoid the most obvious cards matching the clue, and instead safely target other related cards. While you can guess as many times as you can, playing safely and not over-guessing is considered a great strategy!
              </p>
            </div>
            <div>
              <strong>Infinity Clue Rule:</strong>
              <p style={{ margin: "4px 0 0 0", color: "var(--text-secondary)" }}>
                Giving a count of infinity allows operatives to make an unlimited number of guesses. This is especially useful for catching up on previous clues left behind (words pointed to by clues given in earlier turns) without being limited by a strict card count.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Operatives Guessing Flow */}
        <section>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, margin: "0 0 12px 0", color: "var(--accent)" }}>
            5. Operative Guessing Mechanics
          </h3>
          <ul style={{ paddingLeft: "20px", lineHeight: 1.6, fontSize: "0.95rem", color: "var(--text-secondary)" }}>
            <li style={{ marginBottom: "8px" }}>Operatives discuss clues via chat and vote on cards by tapping/clicking them.</li>
            <li style={{ marginBottom: "8px" }}>Once a card has enough votes, it can be revealed/flipped.</li>
            <li style={{ marginBottom: "8px" }}>If they correctly guess their own team color card, they can choose to either stop or make another guess (up to the Spymaster's count + 1 guess).</li>
            <li style={{ marginBottom: "8px" }}>If they flip a card of another color or bystander, the turn ends immediately.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

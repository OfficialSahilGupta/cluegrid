import React from "react";
import { useTranslation } from "react-i18next";

export function ChangelogPage() {
  const { t } = useTranslation();

  const updates = [
    {
      version: "v1.4.0 - Operation Cyber-Stealth Redesign",
      date: "July 2026",
      color: "#00f0ff",
      features: [
        "Purged Yellow/Amber color tokens for tactical stealth cyber-cyan (#00F0FF) and rose (#ef959c) palette.",
        "Redesigned Navigation Link styling with dotted underlines.",
        "Implemented real-time surveillance terminal animations in empty background zones.",
        "Created real-time Spy Dossier panels tracking active operatives.",
      ],
    },
    {
      version: "v1.3.0 - Visual Overhaul and Core Polish",
      date: "June 2026",
      color: "#ef959c",
      features: [
        "Daylight Dossier Theme Support: Added a warm paper light mode counterpart matching the classified folder theme.",
        "Vietnamese Locale Support: Created localized UI translations and gameplay decks.",
        "Security / Standard - Anti-Spy Action Logging: Catch and record unverified spymaster access attempts.",
        "Custom Game Timers: Control the pressure! Tailor turn and clue timers.",
        "Sensory Sound Effects: Satisfying, responsive sound triggers for card taps and turns.",
      ],
    },
    {
      version: "v1.2.0 - Duet Mode & Custom Settings",
      date: "June 2026",
      color: "#00f0ff",
      features: [
        "Cooperative Duet Mode: Play cooperatively against a shared mistake limit of 9 tokens.",
        "Turn & Clue Timers: Integrated 120-second timers with Spymaster and Operative auto-skips.",
        "Personal Music Player: Paste YouTube/Spotify links into a personal docked player widget.",
        "Chat Link Unfurling: Pasting YouTube/Spotify URLs in chat renders collapsible embedded players.",
      ],
    },
    {
      version: "v1.1.0 - Profiles & Match Statistics",
      date: "May 2026",
      color: "#ef959c",
      features: [
        "Auth.js Integration: Support credentials signup, Google, and Discord login.",
        "Deterministic Identicons: Symmetrical 5x5 SVG grid icons generated from guest usernames.",
        "Premium Avatar Gallery: Seeded 20 premium unlocked emojis for registered users.",
        "Match Statistics: Track career games played, won, correct guesses, and match histories.",
      ],
    },
  ];

  return (
    <div className="fade-in" style={{ color: "#eef3ee", fontFamily: "'JetBrains Mono', monospace", fontSize: "14px", lineHeight: 1.5 }}>
      {/* Header section with Cyber bracket style */}
      <div style={{ borderBottom: "1.5px solid rgba(0, 240, 255, 0.3)", paddingBottom: "12px", marginBottom: "20px" }}>
        <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "1.8rem", fontWeight: 900, margin: 0, color: "#00f0ff", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {t("news.title")}
        </h2>
        <p style={{ color: "#9AA29B", fontSize: "12px", margin: "4px 0 0 0", letterSpacing: "0.03em" }}>
          {t("news.subtitle")}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {updates.map((up) => (
          <section key={up.version} style={{ background: "rgba(6,24,28,0.2)", border: "1.5px solid rgba(238,243,238,0.08)", borderLeft: `4px solid ${up.color}`, padding: "14px 18px", borderRadius: "4px" }}>
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

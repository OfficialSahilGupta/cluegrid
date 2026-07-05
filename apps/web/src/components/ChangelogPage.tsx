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
        "Purged Yellow/Amber color tokens for tactical stealth cyber-cyan (#00F0FF) and magenta (#FF0055) palette.",
        "Redesigned Navigation Link styling with dotted underlines.",
        "Implemented real-time surveillance terminal animations in empty background zones.",
        "Created real-time Spy Dossier panels tracking active operatives Fox, Owl, Lion, and Shadow.",
      ],
    },
    {
      version: "v1.3.0 - Visual Overhaul and Core Polish",
      date: "June 2026",
      color: "#ff0055",
      features: [
        "Daylight Dossier Theme Support: Added a warm paper light mode counterpart matching the classified folder theme.",
        "Vietnamese Locale Support: Created localized UI translations and gameplay decks supporting Vietnamese (Tiếng Việt) players.",
        "Security / Standard - Anti-Spy Action Logging: If an Operative secretly or intuitively attempts to join the Spymasters, they'll be caught and recorded in the game log.",
        "Custom Game Timers: Control the pressure! Tailor turn and clue timers so your team can play at their own speed.",
        "Sensory Sound Effects: Satisfying, responsive sound triggers for card taps, role selections, and team turns.",
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
        "Admin Cities panel: CRUD interface to manage randomized team names pool.",
      ],
    },
    {
      version: "v1.1.0 - Profiles & Match Statistics",
      date: "May 2026",
      color: "#ff0055",
      features: [
        "Auth.js Integration: Support credentials signup, Google, and Discord login.",
        "Deterministic Identicons: Symmetrical 5x5 SVG grid icons generated from guest usernames.",
        "Premium Avatar Gallery: Seeded 20 premium unlocked emojis for registered users.",
        "Match Statistics: Track career games played, won, correct guesses, and match histories.",
        "Floating Reactions: Cool spymasters screen reaction rate-limiting on server side.",
      ],
    },
    {
      version: "v1.0.0 - Classic Multi-Team Launch",
      date: "April 2026",
      color: "#00f0ff",
      features: [
        "Classic 2-team, 3-team, and 4-team Codenames match rooms.",
        "Real-time turn engine, card reveals, and clue forms over Socket.IO.",
        "Isolated Chat Channels: Physical isolation of operative and spymaster channels.",
        "Real-time game logging sidebar with unread notification badges.",
        "Player presence badges (ACTIVE, BRB, AFK, .zZ).",
      ],
    },
  ];

  return (
    <div className="fade-in" style={{ color: "#eef3ee", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.88rem" }}>
      <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "2rem", fontWeight: 900, margin: "0 0 8px 0", color: "#00f0ff", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {t("news.title")}
      </h2>
      <p style={{ color: "#9AA29B", fontSize: "0.9rem", margin: "0 0 20px 0" }}>
        {t("news.subtitle")}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {updates.map((up) => (
          <section key={up.version} style={{ borderBottom: "1px solid rgba(0,240,255,0.15)", paddingBottom: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
              <h3 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "1.2rem", fontWeight: 900, margin: 0, color: up.color, letterSpacing: "0.04em" }}>
                {up.version}
              </h3>
              <span style={{ fontSize: "0.8rem", color: "#9AA29B", fontWeight: 500 }}>
                {up.date}
              </span>
            </div>
            <ul style={{ margin: 0, paddingLeft: "18px", lineHeight: 1.5, fontSize: "0.82rem", color: "#9AA29B", listStyleType: "square" }}>
              {up.features.map((feat, i) => (
                <li key={i} style={{ marginBottom: "6px" }}>
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

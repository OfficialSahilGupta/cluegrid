import React from "react";
import { useTranslation } from "react-i18next";

export function ChangelogPage() {
  const { t } = useTranslation();

  const updates = [
    {
      version: "v1.3.0 - Visual Overhaul and Core Polish",
      date: "June 2026",
      color: "var(--accent)",
      features: [
        "Visual Migration to Redacted Ink: Fully updated the application layout to a premium, high-contrast classified dossier dark mode theme.",
        "Daylight Dossier Theme Support: Added a warm paper light mode counterpart matching the classified folder theme.",
        "Main Page Theme Toggle: Placed a globally accessible moon and sun toggle button in the navigation header to switch themes in one click.",
        "Interactive Gravity Grid Background: Added a canvas-based grid background animation that responds to mouse movements with physical gravity warping.",
        "Simplified Game Modes: Streamlined room setup parameters to target Multi-Team and Duet options directly.",
        "Vietnamese Locale Support: Created localized UI translations and gameplay decks supporting Vietnamese (Tiếng Việt) players.",
        "Logo and Rules Redesign: Cleaned up brand logo styling by removing emojis and updated the gameplay rules page with tactical clue suggestions.",
      ],
    },
    {
      version: "v1.2.0 - Duet Mode & Custom Settings",
      date: "June 2026",
      color: "var(--team-1)",
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
      color: "var(--team-2)",
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
      color: "var(--team-3)",
      features: [
        "Classic 2-team, 3-team, and 4-team Codenames match rooms.",
        "Real-time turn engine, card reveals, and clue forms over Socket.IO.",
        "Isolated Chat Channels: Physical isolation of operative and spymaster channels.",
        "Real-time game logging sidebar with unread notification badges.",
        "Player presence badges (ACTIVE, BRB, AFK, .zZ) with auto-AFK timers.",
      ],
    },
  ];

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
        {t("news.title")}
      </h2>
      <p style={{ color: "var(--text-secondary)", fontSize: "1rem", margin: "0 0 28px 0" }}>
        {t("news.subtitle")}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {updates.map((up) => (
          <section key={up.version} style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, margin: 0, color: up.color }}>
                {up.version}
              </h3>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>
                {up.date}
              </span>
            </div>
            <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: 1.6, fontSize: "0.95rem", color: "var(--text-primary)" }}>
              {up.features.map((feat, i) => (
                <li key={i} style={{ marginBottom: "8px" }}>
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

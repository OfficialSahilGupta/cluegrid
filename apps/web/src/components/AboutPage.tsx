import React from "react";
import { useTranslation } from "react-i18next";

export function AboutPage() {
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
      {/* Title with Version */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "12px", flexWrap: "wrap", marginBottom: "8px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
          {t("about.title", "About ClueGrid")}
        </h2>
        <span style={{
          fontSize: "0.85rem",
          background: "rgba(232, 163, 61, 0.12)",
          color: "var(--accent)",
          padding: "4px 10px",
          borderRadius: "6px",
          fontWeight: 700,
          fontFamily: "monospace"
        }}>
          v1.3.0
        </span>
      </div>
      <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", margin: "0 0 28px 0", lineHeight: 1.5 }}>
        {t("about.subtitle", "A real-time, distributed word-deduction grid system. Explore the technical specifications and structural architecture of the ClueGrid application.")}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
        
        {/* Mission/System Purpose Section */}
        <section style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "28px" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, margin: "0 0 8px 0", color: "var(--accent)" }}>
            {t("about.missionTitle", "System Purpose")}
          </h3>
          <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.6, color: "var(--text-primary)" }}>
            {t("about.missionText", "ClueGrid is engineered to deliver high-fidelity, real-time tabletop board simulations in a distributed web environment. Utilizing a synchronized state engine, the platform enables multi-user collaboration and competitive execution across varied grid configurations and localized game variants.")}
          </p>
        </section>

        {/* How It Works Section */}
        <section style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "28px" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, margin: "0 0 16px 0", color: "var(--team-1)" }}>
            {t("about.howTitle", "System Architecture & Flow")}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", padding: "16px", borderRadius: "var(--radius-md)" }}>
              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--team-1)", display: "block", marginBottom: "6px" }}>01. Room Allocation</span>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                Lobbies are dynamically created with custom configurations, multi-locale bindings (40+ language systems), and multi-team scaling parameters.
              </p>
            </div>
            <div style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", padding: "16px", borderRadius: "var(--radius-md)" }}>
              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--team-2)", display: "block", marginBottom: "6px" }}>02. Peer Synchronization</span>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                Client-server websocket connections synchronize grid states, room actions, and credentials securely via unique room invitation links.
              </p>
            </div>
            <div style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", padding: "16px", borderRadius: "var(--radius-md)" }}>
              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent)", display: "block", marginBottom: "6px" }}>03. Real-Time Execution</span>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                Operatives submit guesses which are evaluated against hidden spymaster grids, processing logs and score states in real-time.
              </p>
            </div>
          </div>
        </section>

        {/* Tech Stack / Specifications */}
        <section style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "28px" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, margin: "0 0 12px 0", color: "var(--team-2)" }}>
            {t("about.techTitle", "Technical Architecture")}
          </h3>
          <p style={{ margin: "0 0 16px 0", fontSize: "0.95rem", lineHeight: 1.6, color: "var(--text-primary)" }}>
            {t("about.techDesc", "Engineered with modern full-stack web technologies to ensure zero-lag gameplay, complete state safety, and a highly responsive design:")}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "16px" }}>
            <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.8 }}>
              <li><strong>Frontend:</strong> React (TypeScript) + Vite for rapid UI rendering and performance.</li>
              <li><strong>Backend Engine:</strong> Node.js + Express with custom socket rooms to manage game lobbies.</li>
              <li><strong>Real-time Comm:</strong> Socket.IO for duplex communication, presence tracking, and chat isolation.</li>
            </ul>
            <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.8 }}>
              <li><strong>Translation:</strong> Multi-region support via the custom i18next locales generator.</li>
              <li><strong>Security:</strong> Deterministic guest identicon generation + optional OAuth credentials.</li>
              <li><strong>Audio/Theme:</strong> Lightweight browser synthesizers for navigation audio, with Daylight Dossier theme support.</li>
            </ul>
          </div>
        </section>

        {/* System Development Info */}
        <section style={{ background: "rgba(232, 163, 61, 0.05)", border: "1px solid rgba(232, 163, 61, 0.2)", borderRadius: "var(--radius-md)", padding: "20px" }}>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 8px 0", color: "var(--accent)" }}>
            {t("about.footerTitle", "ClueGrid Project Development")}
          </h4>
          <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.6, color: "var(--text-primary)" }}>
            {t("about.footerText", "ClueGrid is maintained as a modular repository, integrating real-time action logging, custom timers, and audio synthesis. Please refer to the Changelog section for release logs, visual overhaul details, and performance optimizations.")}
          </p>
        </section>

      </div>
    </div>
  );
}

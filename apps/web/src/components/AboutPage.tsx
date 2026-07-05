import React from "react";
import { useTranslation } from "react-i18next";

export function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="fade-in" style={{ color: "#eef3ee", fontFamily: "'JetBrains Mono', monospace" }}>
      <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "2.5rem", fontWeight: 900, margin: "0 0 8px 0", color: "#00f0ff", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {t("about.title", "About ClueGrid")}
      </h2>
      <p style={{ color: "#9AA29B", fontSize: "1.1rem", margin: "0 0 28px 0", lineHeight: 1.5 }}>
        {t("about.subtitle", "Welcome to ClueGrid — the ultimate word game to play with your friends!")}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Intro Section */}
        <section style={{ borderBottom: "1px solid rgba(0,240,255,0.15)", paddingBottom: "24px" }}>
          <h3 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "1.4rem", fontWeight: 900, margin: "0 0 10px 0", color: "#ff0055", letterSpacing: "0.06em" }}>
            {t("about.introTitle", "Why Play ClueGrid?")}
          </h3>
          <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.6, color: "#9AA29B" }}>
            {t("about.introText", "ClueGrid brings the fun of classic word games straight to your screen. Challenge your brain, coordinate with teammates, or host a large group party session. ClueGrid is fast to set up, easy to learn, and infinitely fun to play.")}
          </p>
        </section>

        {/* Highlighted features section */}
        <section style={{ borderBottom: "1px solid rgba(0,240,255,0.15)", paddingBottom: "28px" }}>
          <h3 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "1.4rem", fontWeight: 900, margin: "0 0 20px 0", color: "#00f0ff", letterSpacing: "0.06em" }}>
            {t("about.featuresTitle", "Protocol Highlights")}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ padding: "16px", background: "rgba(6,24,28,0.4)", border: "1px solid rgba(0,240,255,0.2)", borderRadius: "8px" }}>
              <h4 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "1.2rem", fontWeight: 900, margin: "0 0 6px 0", color: "#eef3ee", letterSpacing: "0.04em" }}>
                {t("about.feature1Title", "Instant Deployment")}
              </h4>
              <p style={{ fontSize: "0.85rem", color: "#9AA29B", margin: 0, lineHeight: 1.5 }}>
                {t("about.feature1Text", "No downloads or signups required. Just spin up a secure room link, transmit it to your squad, and initiate operations instantly.")}
              </p>
            </div>

            <div style={{ padding: "16px", background: "rgba(6,24,28,0.4)", border: "1px solid rgba(255,0,85,0.2)", borderRadius: "8px" }}>
              <h4 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "1.2rem", fontWeight: 900, margin: "0 0 6px 0", color: "#eef3ee", letterSpacing: "0.04em" }}>
                {t("about.feature2Title", "Multiple Operation Modes")}
              </h4>
              <p style={{ fontSize: "0.85rem", color: "#9AA29B", margin: 0, lineHeight: 1.5 }}>
                {t("about.feature2Text", "Go head-to-head in competitive team operations (up to 4 teams!) or run co-op diagnostics in cooperative Duet mode.")}
              </p>
            </div>

            <div style={{ padding: "16px", background: "rgba(6,24,28,0.4)", border: "1px solid rgba(0,240,255,0.2)", borderRadius: "8px" }}>
              <h4 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "1.2rem", fontWeight: 900, margin: "0 0 6px 0", color: "#eef3ee", letterSpacing: "0.04em" }}>
                {t("about.feature3Title", "Real-Time WebSocket Sync")}
              </h4>
              <p style={{ fontSize: "0.85rem", color: "#9AA29B", margin: 0, lineHeight: 1.5 }}>
                {t("about.feature3Text", "All actions transmit instantly. Chat channels, voting indicators, and card flips synchronize with zero latency.")}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

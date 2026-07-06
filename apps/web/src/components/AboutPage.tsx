import React from "react";
import { useTranslation } from "react-i18next";

export function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="fade-in" style={{ color: "#eef3ee", fontFamily: "'JetBrains Mono', monospace", fontSize: "14px", lineHeight: 1.6 }}>
      {/* Header section with Cyber bracket style */}
      <div style={{ borderBottom: "1.5px solid rgba(0, 240, 255, 0.3)", paddingBottom: "12px", marginBottom: "20px" }}>
        <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "1.8rem", fontWeight: 900, margin: 0, color: "#00f0ff", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {t("about.title", "About ClueGrid")}
        </h2>
        <p style={{ color: "#9AA29B", fontSize: "12px", margin: "4px 0 0 0", letterSpacing: "0.03em" }}>
          {t("about.subtitle", "Welcome to ClueGrid — the ultimate word game to play with your friends!")}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Intro Section */}
        <section>
          <p style={{ margin: 0, color: "#9AA29B" }}>
            {t("about.introText", "ClueGrid brings the fun of classic word games straight to your screen. Challenge your brain, coordinate with teammates, or host a large group party session. ClueGrid is fast to set up, easy to learn, and infinitely fun to play.")}
          </p>
        </section>

        {/* Highlighted features section */}
        <section>
          <h3 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "1.25rem", fontWeight: 900, margin: "0 0 16px 0", color: "#00f0ff", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {t("about.featuresTitle", "Protocol Highlights")}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ padding: "14px 18px", background: "rgba(6,24,28,0.4)", border: "1.5px solid rgba(0,240,255,0.2)", borderRadius: "6px" }}>
              <h4 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "1.1rem", fontWeight: 900, margin: "0 0 4px 0", color: "#eef3ee", letterSpacing: "0.04em" }}>
                {t("about.feature1Title", "Instant Deployment")}
              </h4>
              <p style={{ fontSize: "13px", color: "#9AA29B", margin: 0, lineHeight: 1.5 }}>
                {t("about.feature1Text", "No downloads or signups required. Just spin up a secure room link, transmit it to your squad, and initiate operations instantly.")}
              </p>
            </div>

            <div style={{ padding: "14px 18px", background: "rgba(6,24,28,0.4)", border: "1.5px solid rgba(239,149,156,0.2)", borderRadius: "6px" }}>
              <h4 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "1.1rem", fontWeight: 900, margin: "0 0 4px 0", color: "#eef3ee", letterSpacing: "0.04em" }}>
                {t("about.feature2Title", "Multiple Operation Modes")}
              </h4>
              <p style={{ fontSize: "13px", color: "#9AA29B", margin: 0, lineHeight: 1.5 }}>
                {t("about.feature2Text", "Go head-to-head in competitive team operations (up to 4 teams!) or run co-op diagnostics in cooperative Duet mode.")}
              </p>
            </div>

            <div style={{ padding: "14px 18px", background: "rgba(6,24,28,0.4)", border: "1.5px solid rgba(0,240,255,0.2)", borderRadius: "6px" }}>
              <h4 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: "1.1rem", fontWeight: 900, margin: "0 0 4px 0", color: "#eef3ee", letterSpacing: "0.04em" }}>
                {t("about.feature3Title", "Real-Time WebSocket Sync")}
              </h4>
              <p style={{ fontSize: "13px", color: "#9AA29B", margin: 0, lineHeight: 1.5 }}>
                {t("about.feature3Text", "All actions transmit instantly. Chat channels, voting indicators, and card flips synchronize with zero latency.")}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

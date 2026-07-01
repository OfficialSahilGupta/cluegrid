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
      {/* Title */}
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: 800, margin: "0 0 8px 0", color: "var(--text-primary)" }}>
        {t("about.title", "About ClueGrid")}
      </h2>
      <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", margin: "0 0 28px 0", lineHeight: 1.5 }}>
        {t("about.subtitle", "Welcome to ClueGrid — the ultimate word game to play with your friends!")}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        
        {/* Intro Section */}
        <section style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "24px" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, margin: "0 0 10px 0", color: "var(--accent)" }}>
            {t("about.introTitle", "Why Play ClueGrid?")}
          </h3>
          <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.6, color: "var(--text-primary)" }}>
            {t("about.introText", "ClueGrid brings the fun of classic word games straight to your screen. Whether you want to challenge your brain, hang out with friends online, or play with a large group at a party, ClueGrid is built to give you the smoothest, most exciting game night possible. It's fast to set up, easy to learn, and infinitely fun to play.")}
          </p>
        </section>

        {/* Highlighted features section */}
        <section style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "28px" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, margin: "0 0 20px 0", color: "var(--accent)" }}>
            {t("about.featuresTitle", "Why You'll Love ClueGrid")}
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            <div style={{ padding: "16px", background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 700, margin: "0 0 6px 0", color: "var(--text-primary)" }}>
                {t("about.feature1Title", "Start playing in seconds")}
              </h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                {t("about.feature1Text", "No downloads or signups required. Just create a room, share a quick link with your friends, and start playing instantly.")}
              </p>
            </div>

            <div style={{ padding: "16px", background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 700, margin: "0 0 6px 0", color: "var(--text-primary)" }}>
                {t("about.feature2Title", "Play your way")}
              </h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                {t("about.feature2Text", "Go head-to-head in competitive team modes (up to 4 teams!) or team up and work together to beat the game in cooperative Duet mode.")}
              </p>
            </div>

            <div style={{ padding: "16px", background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 700, margin: "0 0 6px 0", color: "var(--text-primary)" }}>
                {t("about.feature3Title", "Super smooth real-time action")}
              </h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                {t("about.feature3Text", "Everything updates instantly. Chat with your team, watch cards flip in real time, and hear satisfying game sound effects.")}
              </p>
            </div>

            <div style={{ padding: "16px", background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 700, margin: "0 0 6px 0", color: "var(--text-primary)" }}>
                {t("about.feature4Title", "Play in your language")}
              </h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                {t("about.feature4Text", "ClueGrid supports over 40 languages, so you can play in whichever language you and your friends feel most comfortable with.")}
              </p>
            </div>

            <div style={{ padding: "16px", background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 700, margin: "0 0 6px 0", color: "var(--text-primary)" }}>
                {t("about.feature5Title", "Packed with cool features")}
              </h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                {t("about.feature5Text", "Stuck on a word? Use our built-in definition search helper. Want some background music? Play your favorite tunes directly inside our docked player.")}
              </p>
            </div>

          </div>
        </section>

        {/* Footer info section */}
        <section style={{ background: "rgba(232, 163, 61, 0.05)", border: "1px solid rgba(232, 163, 61, 0.2)", borderRadius: "var(--radius-md)", padding: "20px" }}>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 8px 0", color: "var(--accent)" }}>
            {t("about.footerTitle", "Always Getting Better")}
          </h4>
          <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.6, color: "var(--text-primary)" }}>
            {t("about.footerText", "We are always working to make ClueGrid even more fun! Check out our Changelog in the main menu to see all the cool new features, modes, and designs we add regularly.")}
          </p>
        </section>

      </div>
    </div>
  );
}

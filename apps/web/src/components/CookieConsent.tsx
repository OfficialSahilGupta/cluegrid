import React, { useState, useEffect } from "react";

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    personalization: true,
  });

  useEffect(() => {
    const consent = localStorage.getItem("cluegrid_cookie_consent");
    let timer: any;
    if (!consent) {
      // Small delay for smooth entry animation after page load
      timer = setTimeout(() => setVisible(true), 1500);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cluegrid_cookie_consent", "all");
    localStorage.setItem("cluegrid_cookie_preferences", JSON.stringify({
      essential: true,
      analytics: true,
      personalization: true,
    }));
    setVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem("cluegrid_cookie_consent", "essential");
    localStorage.setItem("cluegrid_cookie_preferences", JSON.stringify({
      essential: true,
      analytics: false,
      personalization: false,
    }));
    setVisible(false);
  };

  const handleSavePreferences = () => {
    const allSelected = preferences.analytics && preferences.personalization;
    localStorage.setItem(
      "cluegrid_cookie_consent",
      allSelected ? "all" : "custom"
    );
    localStorage.setItem(
      "cluegrid_cookie_preferences",
      JSON.stringify(preferences)
    );
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 99999,
        width: "min(420px, calc(100vw - 48px))",
        background: "rgba(6, 24, 28, 0.94)",
        backdropFilter: "blur(18px)",
        border: "1.5px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.65), 0 0 30px rgba(0, 242, 254, 0.05)",
        padding: "24px",
        color: "var(--text-primary)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        fontFamily: "var(--font-body)",
        animation: "slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "rgba(0, 242, 254, 0.1)",
            border: "1px solid var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5Z" />
            <circle cx="7.5" cy="13.5" r="1" fill="currentColor" />
            <circle cx="11.5" cy="17.5" r="1" fill="currentColor" />
            <circle cx="16.5" cy="13.5" r="1" fill="currentColor" />
            <circle cx="12.5" cy="9.5" r="1" fill="currentColor" />
          </svg>
        </div>
        <div>
          <h4
            style={{
              margin: 0,
              fontSize: "1.1rem",
              fontWeight: 800,
              fontFamily: "var(--font-display)",
              letterSpacing: "0.03em",
              color: "#FFFFFF",
            }}
          >
            How we remember you
          </h4>
          <p
            style={{
              margin: "6px 0 0 0",
              fontSize: "0.82rem",
              lineHeight: 1.5,
              color: "var(--text-secondary)",
            }}
          >
            We save small details on your browser to make Cluegrid run smoothly. This includes keeping you inside your game room, remembering your nickname, and saving your lobby settings.
          </p>
        </div>
      </div>

      {customize ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            padding: "12px 14px",
            borderRadius: "var(--radius-md)",
            boxSizing: "border-box",
          }}
        >
          {/* Essential Row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#FFFFFF" }}>Game Connection (Required)</span>
              <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-muted)" }}>Keeps you inside your active game room and remembers your username.</p>
            </div>
            <input type="checkbox" checked disabled style={{ accentColor: "var(--accent)", cursor: "not-allowed" }} />
          </div>

          <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.06)" }} />

          {/* Analytics Row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#FFFFFF" }}>Game Performance</span>
              <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-muted)" }}>Helps us monitor server speeds and reduce connection lag.</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.analytics}
              onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
              style={{ accentColor: "var(--accent)", cursor: "pointer" }}
            />
          </div>

          <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.06)" }} />

          {/* Personalization Row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#FFFFFF" }}>Sound & Visuals</span>
              <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-muted)" }}>Remembers your music preferences, sound volume, and 3D background animation settings.</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.personalization}
              onChange={(e) => setPreferences({ ...preferences, personalization: e.target.checked })}
              style={{ accentColor: "var(--accent)", cursor: "pointer" }}
            />
          </div>
        </div>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleAcceptEssential}
            style={{
              flex: 1,
              padding: "9px",
              borderRadius: "var(--radius-sm)",
              border: "1.5px solid var(--border-default)",
              background: "transparent",
              color: "var(--text-secondary)",
              fontWeight: 700,
              fontSize: "0.8rem",
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              transition: "all 0.15s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "#FFFFFF";
              e.currentTarget.style.color = "#FFFFFF";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "var(--border-default)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            Essential Only
          </button>
          <button
            onClick={handleAcceptAll}
            style={{
              flex: 1,
              padding: "9px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: "var(--accent)",
              color: "#111827",
              fontWeight: 800,
              fontSize: "0.8rem",
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              boxShadow: "0 0 15px rgba(0, 242, 254, 0.15)",
              transition: "all 0.15s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(0, 242, 254, 0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 0 15px rgba(0, 242, 254, 0.15)";
            }}
          >
            Accept All
          </button>
        </div>
        
        <button
          onClick={() => {
            if (customize) {
              handleSavePreferences();
            } else {
              setCustomize(true);
            }
          }}
          style={{
            background: "none",
            border: "none",
            color: "var(--accent)",
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: "pointer",
            textAlign: "center",
            textDecoration: "underline",
            marginTop: "4px",
            fontFamily: "var(--font-display)",
            transition: "color 0.15s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#FFFFFF")}
          onMouseOut={(e) => (e.currentTarget.style.color = "var(--accent)")}
        >
          {customize ? "Save Preferences" : "Customize Settings"}
        </button>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from "react";

export function SupportPage() {
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes("supporter-success")) {
      setSuccess(true);
    }
  }, []);

  return (
    <div
      style={{
        maxWidth: "680px",
        width: "100%",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        padding: "40px",
        textAlign: "center",
        margin: "0 auto",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
      }}
      className="fade-in"
    >
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: 800, margin: "0 0 12px 0", color: "var(--text-primary)" }}>
        Become a Member
      </h2>
      <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", margin: "0 0 32px 0", lineHeight: 1.6 }}>
        Help keep ClueGrid free, open-source, and running ad-free. Supporting us covers our hosting, websocket operations, and database infrastructure. Think of it like buying us a coffee!
      </p>

      {success && (
        <div
          style={{
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgb(16, 185, 129)",
            borderRadius: "var(--radius-md)",
            padding: "16px",
            color: "var(--text-primary)",
            fontWeight: 600,
            marginBottom: "24px",
            fontSize: "0.95rem",
          }}
        >
          Thank you so much for your support! Your Supporter Badge has been unlocked!
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          background: "var(--bg-surface-raised)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "24px",
          marginBottom: "32px",
          textAlign: "left",
        }}
      >
        <h3 style={{ margin: "0 0 8px 0", color: "var(--accent)", fontWeight: 700 }}>
          Supporter Benefits
        </h3>
        <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: 1.7, color: "var(--text-secondary)" }}>
          <li style={{ marginBottom: "6px" }}>
            Share in-game background music with everyone in the room (all players hear your stream).
          </li>
          <li style={{ marginBottom: "6px" }}>
            A dedicated Member badge displayed next to your avatar in lobbies, game rooms, and chat.
          </li>
          <li style={{ marginBottom: "6px" }}>
            Special name mention inside the website&apos;s credits index.
          </li>
          <li style={{ marginBottom: "6px" }}>
            Add and customize a custom bio description on your player profile card.
          </li>
          <li>
            No gameplay advantages: ClueGrid remains completely fair and balanced for all players.
          </li>
        </ul>
      </div>

      <div
        style={{
          background: "var(--accent-bg-subtle)",
          border: "1px solid var(--accent)",
          borderRadius: "var(--radius-md)",
          padding: "24px 32px",
          textAlign: "center",
          maxWidth: "500px",
          margin: "0 auto",
          boxShadow: "0 8px 32px rgba(232, 163, 61, 0.08)",
          animation: "float-pulse 3s ease-in-out infinite",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(232, 163, 61, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 15px rgba(232, 163, 61, 0.3)",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        </div>
        <h4
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.2rem",
            fontWeight: 700,
            margin: "0 0 8px 0",
            color: "var(--accent-text-on-subtle)",
          }}
        >
          Supporter Options Coming Soon!
        </h4>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.95rem",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          We are currently working on integrating secure payment options (like Stripe Checkout) to enable Supporter subscriptions. Once ready, you&apos;ll be able to support ClueGrid and instantly unlock exclusive member perks.
        </p>
      </div>

      <p style={{ marginTop: "24px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
        Thank you for playing and supporting the development of ClueGrid!
      </p>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.js";
import { AuthModal } from "./AuthModal.js";

export function SupportPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.location.hash.includes("supporter-success")) {
      setSuccess(true);
    }
  }, []);

  const handleCheckout = async (type: "subscription" | "one_time") => {
    if (!user) {
      setAuthOpen(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const userId = localStorage.getItem("cluegrid_user_id");
      if (userId) {
        headers["x-mock-user-id"] = userId;
      }

      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers,
        body: JSON.stringify({ type, userId: user.id }),
      });

      if (!res.ok) {
        throw new Error("Failed to create Stripe checkout session");
      }

      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  };

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

      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgb(239, 68, 68)",
            borderRadius: "var(--radius-md)",
            padding: "16px",
            color: "var(--team-1)",
            fontWeight: 600,
            marginBottom: "24px",
            fontSize: "0.95rem",
          }}
        >
          {error}
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
            Special name mention inside the website's credits index.
          </li>
          <li style={{ marginBottom: "6px" }}>
            Add and customize a custom bio description on your player profile card.
          </li>
          <li>
            No gameplay advantages: ClueGrid remains completely fair and balanced for all players.
          </li>
        </ul>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          onClick={() => handleCheckout("subscription")}
          disabled={loading}
          style={{
            padding: "16px 32px",
            borderRadius: "var(--radius-md)",
            border: "none",
            background: "var(--accent)",
            color: "var(--accent-text-on)",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "1rem",
            transition: "all 0.15s ease",
            boxShadow: "0 4px 15px rgba(232, 163, 61, 0.2)",
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "var(--accent-hover)"}
          onMouseOut={(e) => e.currentTarget.style.background = "var(--accent)"}
        >
          {loading ? "Loading..." : "Support $3 / month (Valid for 30 days)"}
        </button>
      </div>

      <p style={{ marginTop: "24px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
        Payments are processed securely via Stripe Checkout. You can cancel subscriptions at any time.
      </p>

      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          upsellMessage="Guests must log in to unlock Supporter badges across matches!"
        />
      )}
    </div>
  );
}

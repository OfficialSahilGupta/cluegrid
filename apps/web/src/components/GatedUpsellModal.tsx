import React from "react";

interface GatedUpsellModalProps {
  featureName: string;
  onClose: () => void;
  onOpenAuth: () => void;
}

export function GatedUpsellModal({ featureName, onClose, onOpenAuth }: GatedUpsellModalProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10001,
        padding: "16px",
      }}
    >
      <div
        className="scale-up"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          padding: "32px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "none",
            border: "none",
            color: "var(--color-text-muted)",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          &times;
        </button>

        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            fontWeight: 800,
            marginBottom: "12px",
            color: "#fff",
            marginTop: "16px",
          }}
        >
          Unlock Gated Feature!
        </h3>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "24px" }}>
          The <strong style={{ color: "var(--accent)" }}>{featureName}</strong> feature is reserved for registered players. 
          Create a free account or log in to unlock stats tracking, social integrations, spymaster emoji reactions, and premium avatars!
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={() => {
              onClose();
              onOpenAuth();
            }}
            style={{
              padding: "12px",
              background: "var(--accent)",
              color: "var(--accent-text-on)",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1rem",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(232, 163, 61, 0.25)",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "var(--accent-hover)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "var(--accent)";
            }}
          >
            Log In / Sign Up
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "10px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "var(--color-text-muted)",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}

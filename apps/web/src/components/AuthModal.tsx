import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.js";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

interface AuthModalProps {
  onClose: () => void;
  upsellMessage?: string;
}

export function AuthModal({ onClose, upsellMessage }: AuthModalProps) {
  const { login, signup, mockSocialLogin, loginWithGoogleCredential } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!username.trim()) throw new Error("Username is required");
        await signup(username, email, password);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(2, 6, 8, 0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "16px",
        fontFamily: "'JetBrains Mono', monospace",
        color: "#eef3ee"
      }}
    >
      <div
        className="scale-up"
        style={{
          background: "rgba(6, 24, 28, 0.96)",
          border: "2px solid #00f0ff",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 0 35px rgba(0, 240, 255, 0.25)",
          padding: "32px",
          textAlign: "left",
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
            border: "1.5px solid rgba(0, 240, 255, 0.4)",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            color: "#00f0ff",
            fontSize: "1.1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          ✕
        </button>

        <h3
          style={{
            fontFamily: "'Big Shoulders Display', sans-serif",
            fontSize: "2rem",
            fontWeight: 900,
            marginBottom: "8px",
            color: "#00f0ff",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}
        >
          {isSignUp ? "RECRUIT CODEX" : "OPERATIVE LOGIN"}
        </h3>
        <p style={{ color: "#9AA29B", fontSize: "0.9rem", marginBottom: "24px" }}>
          {isSignUp ? "Generate new clearance key to record tactical statistics." : "Input encrypted parameters to verify identity."}
        </p>

        {upsellMessage && (
          <div
            style={{
              background: "rgba(255, 0, 85, 0.08)",
              border: "1px solid #ff0055",
              borderRadius: "6px",
              padding: "10px 14px",
              color: "#ff0055",
              fontSize: "0.85rem",
              fontWeight: 700,
              marginBottom: "20px",
              textAlign: "left",
              lineHeight: 1.4,
            }}
          >
            [ALERT] {upsellMessage}
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "12px",
              background: "rgba(255, 0, 85, 0.1)",
              border: "1px solid #ff0055",
              borderRadius: "6px",
              color: "#ff0055",
              fontSize: "0.85rem",
              marginBottom: "16px",
              fontWeight: 700,
            }}
          >
            ⚠️ ERROR: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {isSignUp && (
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "6px", fontWeight: 700, color: "#9AA29B", textTransform: "uppercase" }}>
                CODENAME
              </label>
              <input
                type="text"
                placeholder="e.g. AgentClue"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1.5px solid rgba(0, 240, 255, 0.2)",
                  background: "rgba(255, 255, 255, 0.03)",
                  color: "#eef3ee",
                  fontSize: "0.95rem",
                  outline: "none"
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "6px", fontWeight: 700, color: "#9AA29B", textTransform: "uppercase" }}>
              SECURE EMAIL
            </label>
            <input
              type="email"
              placeholder="name@agency.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1.5px solid rgba(0, 240, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.03)",
                color: "#eef3ee",
                fontSize: "0.95rem",
                outline: "none"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "6px", fontWeight: 700, color: "#9AA29B", textTransform: "uppercase" }}>
              ENCRYPTED PASSCODE
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1.5px solid rgba(0, 240, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.03)",
                color: "#eef3ee",
                fontSize: "0.95rem",
                outline: "none"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px",
              background: "#00f0ff",
              color: "#040b0d",
              fontFamily: "'Big Shoulders Display', sans-serif",
              fontWeight: 900,
              fontSize: "1.1rem",
              letterSpacing: "0.06em",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 0 15px rgba(0, 240, 255, 0.2)",
              marginTop: "8px",
              transition: "all 0.2s ease",
            }}
          >
            {loading ? "AUTHENTICATING..." : isSignUp ? "REQUEST CLEARANCE" : "VERIFY CREDENTIALS"}
          </button>
        </form>

        <div style={{ textAlign: "center", margin: "16px 0", color: "#9AA29B", fontSize: "0.85rem", letterSpacing: "0.05em" }}>
          — OR ACCESS GRID VIA —
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", position: "relative", width: "100%", height: "40px" }}>
          <button
            disabled={loading}
            style={{
              flex: 1,
              width: "100%",
              height: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1.5px solid rgba(0, 240, 255, 0.2)",
              background: "rgba(255, 255, 255, 0.03)",
              color: "#eef3ee",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontSize: "0.9rem",
              fontWeight: 700,
              pointerEvents: "none",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#00f0ff" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "4px" }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09zM12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23zM5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63zM12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg> GOOGLE LINK
          </button>

          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.01, overflow: "hidden" }}>
            <GoogleLogin
              onSuccess={async (credentialResponse: CredentialResponse) => {
                if (credentialResponse.credential) {
                  setError(null);
                  setLoading(true);
                  try {
                    await loginWithGoogleCredential(credentialResponse.credential);
                    onClose();
                  } catch (err: any) {
                    setError(err.message || "Google login failed");
                  } finally {
                    setLoading(false);
                  }
                }
              }}
              onError={() => {
                setError("Google authentication failed");
              }}
              width="336px"
            />
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              background: "none",
              border: "none",
              color: "#ff0055",
              fontSize: "0.9rem",
              cursor: "pointer",
              fontWeight: 700,
              borderBottom: "1.5px dotted rgba(255, 0, 85, 0.5)",
              paddingBottom: "2px"
            }}
          >
            {isSignUp ? "Already registered? Verify credentials" : "Need registration? Apply recruits"}
          </button>
        </div>
      </div>
    </div>
  );
}

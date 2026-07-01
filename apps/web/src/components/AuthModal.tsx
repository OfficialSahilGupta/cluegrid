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

  const handleSocialClick = async (provider: "discord") => {
    setError(null);
    setLoading(true);
    try {
      await mockSocialLogin(provider);
      onClose();
    } catch (err: any) {
      setError(err.message || `Social sign-in failed`);
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
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
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
            fontSize: "1.75rem",
            fontWeight: 800,
            marginBottom: "8px",
            color: "#fff",
          }}
        >
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h3>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>
          {isSignUp ? "Sign up to track stats and unlock premium features!" : "Sign in to resume stats and premium access."}
        </p>

        {upsellMessage && (
          <div
            style={{
              background: "var(--accent-bg-subtle)",
              border: "1px solid var(--accent)",
              borderRadius: "6px",
              padding: "10px 14px",
              color: "var(--accent-text-on-subtle)",
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: "20px",
              textAlign: "left",
              lineHeight: 1.4,
            }}
          >
            💎 {upsellMessage}
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "12px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "var(--radius-sm)",
              color: "hsl(355,85%,65%)",
              fontSize: "0.85rem",
              marginBottom: "16px",
              fontWeight: 500,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {isSignUp && (
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "6px", fontWeight: 600 }}>
                Username
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
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-default)",
                  background: "var(--bg-surface-raised)",
                  color: "var(--text-primary)",
                  fontSize: "0.95rem",
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "6px", fontWeight: 600 }}>
              Email
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-default)",
                background: "var(--bg-surface-raised)",
                color: "var(--text-primary)",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "6px", fontWeight: 600 }}>
              Password
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
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-default)",
                background: "var(--bg-surface-raised)",
                color: "var(--text-primary)",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px",
              background: "var(--accent)",
              color: "var(--accent-text-on)",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1rem",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 12px rgba(232, 163, 61, 0.2)",
              marginTop: "8px",
              transition: "background 0.2s ease",
            }}
            onMouseOver={(e) => {
              if (!loading) e.currentTarget.style.background = "var(--accent-hover)";
            }}
            onMouseOut={(e) => {
              if (!loading) e.currentTarget.style.background = "var(--accent)";
            }}
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>

        <div style={{ textAlign: "center", margin: "16px 0", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
          — OR SIGN IN WITH —
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", position: "relative", width: "100%", height: "40px" }}>
          {/* Custom styled Google button with icon logo */}
          <button
            disabled={loading}
            style={{
              flex: 1,
              width: "100%",
              height: "100%",
              padding: "10px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-default)",
              background: "var(--bg-surface-raised)",
              color: "var(--text-primary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontSize: "0.9rem",
              fontWeight: 600,
              pointerEvents: "none", // Allows clicks to pass through to the overlay
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--accent)" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "4px" }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09zM12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23zM5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63zM12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg> Google
          </button>

          {/* Invisible GoogleLogin overlay that intercepts clicks and opens the GIS prompt */}
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
              color: "var(--accent)",
              fontSize: "0.9rem",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {isSignUp ? "Already have an account? Log In" : "Need an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}

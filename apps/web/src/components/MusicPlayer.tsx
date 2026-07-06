import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.js";

export function parseYouTubeUrl(url: string): { type: "video" | "playlist"; id: string } | null {
  const playlistMatch = url.match(/[?&]list=([^"&?/\s]+)/i);
  if (playlistMatch && playlistMatch[1]) {
    return { type: "playlist", id: playlistMatch[1] };
  }

  // Matches youtube.com, music.youtube.com, youtu.be domains with standard watch parameters or paths
  const videoMatch = url.match(/(?:youtube\.com|music\.youtube\.com|youtu\.be)(?:\/watch\?v=|\/embed\/|\/v\/|\/)([^"&?/\s]{11})/i);
  if (videoMatch && videoMatch[1]) {
    return { type: "video", id: videoMatch[1] };
  }
  return null;
}

export function parseSpotifyUrl(url: string): { type: "track" | "playlist" | "album"; id: string } | null {
  const match = url.match(/open\.spotify\.com\/(track|playlist|album)\/([^"&?/\s]+)/i);
  if (match && match[1] && match[2]) {
    return { type: match[1] as "track" | "playlist" | "album", id: match[2] };
  }
  return null;
}

interface MusicPlayerProps {
  onShowGatedUpsell: () => void;
  noBorder?: boolean;
}

export function MusicPlayer({ onShowGatedUpsell, noBorder }: MusicPlayerProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"youtube" | "spotify">("youtube");
  const [ytUrl, setYtUrl] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [ytEmbed, setYtEmbed] = useState<{ type: "video" | "playlist"; id: string } | null>(null);
  const [spotifyEmbed, setSpotifyEmbed] = useState<{ type: "track" | "playlist" | "album"; id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleYtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = parseYouTubeUrl(ytUrl);
    if (!parsed) {
      setError("Invalid YouTube Video or Playlist link.");
      setYtEmbed(null);
      return;
    }
    setYtEmbed(parsed);
  };

  const handleSpotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = parseSpotifyUrl(spotifyUrl);
    if (!parsed) {
      setError("Invalid Spotify Track, Playlist, or Album link.");
      setSpotifyEmbed(null);
      return;
    }
    setSpotifyEmbed(parsed);
  };

  const handleTabChange = (tab: "youtube" | "spotify") => {
    setActiveTab(tab);
    setError(null);
  };

  // If user is not logged in, render the locked version that triggers the upsell
  if (!user) {
    return (
      <div
        style={{
          background: noBorder ? "transparent" : "var(--color-surface)",
          border: noBorder ? "none" : "1px solid var(--color-border)",
          borderRadius: noBorder ? "0" : "var(--radius-md)",
          padding: noBorder ? "0" : "20px",
          textAlign: "left",
          position: "relative",
          cursor: "pointer",
        }}
        onClick={onShowGatedUpsell}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--text-secondary)" }}>
            Music Player (Locked)
          </h3>
        </div>
        <p style={{ margin: "8px 0 0 0", color: "var(--text-secondary)", fontSize: "0.8rem", lineHeight: 1.4 }}>
          Log in or create a profile to unlock the personal media player widget!
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: noBorder ? "transparent" : "var(--color-surface)",
        border: noBorder ? "none" : "1px solid var(--color-border)",
        borderRadius: noBorder ? "0" : "var(--radius-md)",
        padding: noBorder ? "0" : "16px",
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#fff" }}>
          Media Player
        </h3>
        <span
          style={{
            fontSize: "0.7rem",
            color: "var(--accent-text-on-subtle)",
            fontWeight: 700,
            letterSpacing: "0.03em",
            textTransform: "uppercase",
            background: "var(--accent-bg-subtle)",
            padding: "2px 6px",
            borderRadius: "4px",
            border: "1px solid rgba(232, 163, 61, 0.2)",
          }}
        >
          Personal Audio Only
        </span>
      </div>
      <p style={{ margin: "0 0 12px 0", color: "var(--color-text-muted)", fontSize: "0.75rem", fontStyle: "italic" }}>
        Only you can hear this player audio.
      </p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "8px", marginBottom: "12px" }}>
        <button
          onClick={() => handleTabChange("youtube")}
          style={{
            flex: 1,
            background: activeTab === "youtube" ? "rgba(232, 163, 61, 0.12)" : "transparent",
            border: activeTab === "youtube" ? "1px solid rgba(232, 163, 61, 0.3)" : "1px solid transparent",
            color: activeTab === "youtube" ? "var(--accent)" : "var(--color-text-muted)",
            padding: "8px 12px",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            fontSize: "0.8rem",
            fontWeight: 700,
            fontFamily: "var(--font-display)",
            transition: "all 0.15s ease",
          }}
        >
          YouTube
        </button>
        <button
          onClick={() => handleTabChange("spotify")}
          style={{
            flex: 1,
            background: activeTab === "spotify" ? "rgba(232, 163, 61, 0.12)" : "transparent",
            border: activeTab === "spotify" ? "1px solid rgba(232, 163, 61, 0.3)" : "1px solid transparent",
            color: activeTab === "spotify" ? "var(--accent)" : "var(--color-text-muted)",
            padding: "8px 12px",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            fontSize: "0.8rem",
            fontWeight: 700,
            fontFamily: "var(--font-display)",
            transition: "all 0.15s ease",
          }}
        >
          Spotify
        </button>
      </div>

      {error && (
        <div style={{ color: "hsl(355,85%,65%)", fontSize: "0.78rem", marginBottom: "10px", fontWeight: 500 }}>
          {error}
        </div>
      )}

      {/* Tab Panel Content: YouTube */}
      {activeTab === "youtube" && (
        <div>
          {!ytEmbed ? (
            <form onSubmit={handleYtSubmit} style={{ display: "flex", gap: "6px" }}>
              <input
                type="text"
                placeholder="Paste video/playlist URL..."
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  fontSize: "0.85rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-default)",
                  background: "var(--bg-surface-raised)",
                  color: "var(--text-primary)",
                  outline: "none",
                  fontFamily: "var(--font-body)",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "10px 16px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  borderRadius: "var(--radius-md)",
                  background: "var(--accent)",
                  border: "none",
                  color: "var(--accent-text-on)",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(232, 163, 61, 0.25)",
                  transition: "all 0.2s ease",
                  fontFamily: "var(--font-display)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "var(--accent-hover)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "var(--accent)";
                }}
              >
                Load
              </button>
            </form>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }} className="scale-up">
              <iframe
                title="YouTube Personal Embed"
                width="100%"
                height="150"
                src={
                  ytEmbed.type === "video"
                    ? `https://www.youtube.com/embed/${ytEmbed.id}?enablejsapi=1`
                    : `https://www.youtube.com/embed?listType=playlist&list=${ytEmbed.id}`
                }
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ borderRadius: "6px", background: "#000" }}
              />
              <button
                onClick={() => {
                  setYtEmbed(null);
                  setYtUrl("");
                }}
                style={{
                  padding: "8px 12px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "transparent",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                  textAlign: "center",
                  fontFamily: "var(--font-display)",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--color-text-muted)";
                }}
              >
                Clear Player
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab Panel Content: Spotify */}
      {activeTab === "spotify" && (
        <div>
          {!spotifyEmbed ? (
            <form onSubmit={handleSpotifySubmit} style={{ display: "flex", gap: "6px" }}>
              <input
                type="text"
                placeholder="Paste track/playlist URL..."
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  fontSize: "0.85rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-default)",
                  background: "var(--bg-surface-raised)",
                  color: "var(--text-primary)",
                  outline: "none",
                  fontFamily: "var(--font-body)",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "10px 16px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  borderRadius: "var(--radius-md)",
                  background: "var(--accent)",
                  border: "none",
                  color: "var(--accent-text-on)",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(232, 163, 61, 0.25)",
                  transition: "all 0.2s ease",
                  fontFamily: "var(--font-display)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "var(--accent-hover)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "var(--accent)";
                }}
              >
                Load
              </button>
            </form>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }} className="scale-up">
              <iframe
                title="Spotify Personal Embed"
                src={`https://open.spotify.com/embed/${spotifyEmbed.type}/${spotifyEmbed.id}`}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{ borderRadius: "6px" }}
              />
              <button
                onClick={() => {
                  setSpotifyEmbed(null);
                  setSpotifyUrl("");
                }}
                style={{
                  padding: "8px 12px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "transparent",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                  textAlign: "center",
                  fontFamily: "var(--font-display)",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--color-text-muted)";
                }}
              >
                Clear Player
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

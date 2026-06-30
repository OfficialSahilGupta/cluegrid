import React, { useState } from "react";
import type { ChatMessage } from "@cluegrid/shared";
import { parseYouTubeUrl, parseSpotifyUrl } from "./MusicPlayer.js";

interface ChatMessageBubbleProps {
  msg: ChatMessage;
  playerId: string;
}

export function ChatMessageBubble({ msg, playerId }: ChatMessageBubbleProps) {
  const isMe = msg.senderId === playerId;
  const formattedTime = new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const [showPreview, setShowPreview] = useState(false);

  // Check if content contains youtube or spotify URLs
  const words = msg.content.split(/\s+/);
  let ytEmbed: ReturnType<typeof parseYouTubeUrl> = null;
  let spotifyEmbed: ReturnType<typeof parseSpotifyUrl> = null;

  for (const word of words) {
    if (!ytEmbed) ytEmbed = parseYouTubeUrl(word);
    if (!spotifyEmbed) spotifyEmbed = parseSpotifyUrl(word);
  }

  const hasMediaLink = !!(ytEmbed || spotifyEmbed);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isMe ? "flex-end" : "flex-start",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "3px" }}>
        {!isMe && (
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
            {msg.senderName}
            {msg.senderIsSupporter && <span title="Supporter" style={{ cursor: "help", fontSize: "0.8rem" }}>💎</span>}
          </span>
        )}
        <span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>{formattedTime}</span>
      </div>
      <div
        style={{
          background: isMe ? "linear-gradient(135deg, var(--accent), var(--accent-hover))" : "rgba(255,255,255,0.06)",
          padding: "8px 12px",
          borderRadius: isMe ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
          border: isMe ? "none" : "1px solid rgba(255,255,255,0.06)",
          color: isMe ? "var(--accent-text-on)" : "#fff",
          maxWidth: "85%",
          wordBreak: "break-word",
          fontSize: "0.9rem",
        }}
      >
        {msg.content}
      </div>

      {/* Inline collapsible preview link unfurling (works for guests too) */}
      {hasMediaLink && (
        <div style={{ marginTop: "4px", width: "100%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
          <button
            onClick={() => setShowPreview(!showPreview)}
            style={{
              padding: "4px 8px",
              fontSize: "0.7rem",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "4px",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {showPreview ? "▼ Hide Preview" : `▶️ Show ${ytEmbed ? "YouTube" : "Spotify"} Preview`}
          </button>

          {showPreview && (
            <div
              className="scale-up"
              style={{
                marginTop: "6px",
                width: "90%",
                borderRadius: "6px",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "#000",
              }}
            >
              {ytEmbed && (
                <iframe
                  title="YouTube Inline Preview"
                  width="100%"
                  height="160"
                  src={
                    ytEmbed.type === "video"
                      ? `https://www.youtube.com/embed/${ytEmbed.id}`
                      : `https://www.youtube.com/embed?listType=playlist&list=${ytEmbed.id}`
                  }
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
              {spotifyEmbed && (
                <iframe
                  title="Spotify Inline Preview"
                  src={`https://open.spotify.com/embed/${spotifyEmbed.type}/${spotifyEmbed.id}`}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

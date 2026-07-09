import React, { useState, useRef, useCallback, useEffect } from "react";
import type { ChatMessage, ChatReactions } from "@cluegrid/shared";
import { parseYouTubeUrl, parseSpotifyUrl } from "./MusicPlayer.js";

interface ChatMessageBubbleProps {
  msg: ChatMessage;
  playerId: string;
  allMessages: ChatMessage[];
  onReply: (msg: ChatMessage) => void;
  onReact: (messageId: string, emoji: string) => void;
  /** Role of the person VIEWING this message (not the sender). */
  viewerRole?: string | null;
  getPlayerName?: (id: string) => string;
  hideName?: boolean;
}

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👎", "🎉"];

/** Render message text with @mention highlights */
function renderContent(content: string, isMe: boolean) {
  const parts = content.split(/(@\w[\w\s]*?\b)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      return (
        <span
          key={i}
          style={{
            background: "rgba(0,240,255,0.15)",
            color: "var(--accent)",
            borderRadius: "4px",
            padding: "0 4px",
            fontWeight: 800,
            fontSize: "0.88em",
          }}
        >
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function ChatMessageBubble({
  msg,
  playerId,
  allMessages,
  onReply,
  onReact,
  viewerRole,
  getPlayerName,
  hideName,
}: ChatMessageBubbleProps) {
  // Spymaster viewing an operative message = read-only (can't reply or react)
  const isViewerSpy = viewerRole === "spymaster";
  const isMsgFromOperative = msg.senderRole === "operative" || (!msg.senderRole && msg.senderRole !== "spymaster");
  const readOnly = isViewerSpy && isMsgFromOperative;
  const isMe = msg.senderId === playerId;
  const [showTime, setShowTime] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const reactionPickerRef = useRef<HTMLDivElement | null>(null);
  const swipeThreshold = 60;

  // Close reaction picker on click outside
  useEffect(() => {
    if (!showReactionPicker) return;
    const handleClick = (e: MouseEvent) => {
      // Ignore clicks on the react button itself to prevent immediate toggle closure conflicts
      if (
        reactionPickerRef.current && 
        !reactionPickerRef.current.contains(e.target as Node) && 
        !(e.target as Element).closest('.chat-react-btn')
      ) {
        setShowReactionPicker(false);
      }
    };
    const timer = setTimeout(() => document.addEventListener("click", handleClick), 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClick);
    };
  }, [showReactionPicker]);

  const formattedTime = new Date(msg.sentAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Media link detection
  const words = msg.content.split(/\s+/);
  let ytEmbed: ReturnType<typeof parseYouTubeUrl> = null;
  let spotifyEmbed: ReturnType<typeof parseSpotifyUrl> = null;
  for (const word of words) {
    if (!ytEmbed) ytEmbed = parseYouTubeUrl(word);
    if (!spotifyEmbed) spotifyEmbed = parseSpotifyUrl(word);
  }
  const hasMediaLink = !!(ytEmbed || spotifyEmbed);

  // Swipe gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touch = e.touches[0];
    if (!touch) return;
    const dx = touch.clientX - touchStartX.current;
    // Swipe right to reply (for my messages) or left (for others)
    const swipeDir = isMe ? -1 : 1;
    const raw = dx * swipeDir;
    if (raw > 0) {
      setSwipeOffset(Math.min(raw, swipeThreshold + 20));
    }
  }, [isMe]);

  const handleTouchEnd = useCallback(() => {
    if (swipeOffset >= swipeThreshold) {
      onReply(msg);
    }
    setSwipeOffset(0);
    setIsSwiping(false);
    touchStartX.current = null;
  }, [swipeOffset, msg, onReply]);

  // Reactions display
  const reactions: ChatReactions = msg.reactions ?? {};
  const hasReactions = Object.keys(reactions).length > 0;

  const myReactions = Object.entries(reactions)
    .filter(([, pids]) => pids.includes(playerId))
    .map(([emoji]) => emoji);

  const isSpymaster = msg.senderRole === "spymaster";

  const getTeamColor = (team: string | null | undefined) => {
    switch (team) {
      case "red": return "var(--team-1)";
      case "blue": return "var(--team-2)";
      case "green": return "var(--team-3)";
      case "yellow": return "var(--team-4)";
      default: return "var(--color-text-muted)";
    }
  };
  
  const senderNameColor = isSpymaster ? "rgba(200,140,255,0.9)" : getTeamColor(msg.senderTeam);

  // Re-derive readOnly here since it's used in JSX closures below
  const isReadOnly = readOnly;

  const bubbleBg = isMe
    ? "var(--accent-bg-subtle)"
    : isSpymaster
    ? "linear-gradient(135deg, rgba(138,43,226,0.35) 0%, rgba(100,10,200,0.25) 100%)"
    : "rgba(255,255,255,0.06)";

  const bubbleBorder = isMe
    ? "1px solid var(--accent)"
    : isSpymaster
    ? "1px solid rgba(180,100,255,0.35)"
    : "1px solid rgba(255,255,255,0.06)";

  const bubbleColor = "#fff";

  const swipeIndicatorOpacity = Math.min(swipeOffset / swipeThreshold, 1);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isMe ? "flex-end" : "flex-start",
        width: "100%",
        position: "relative",
        opacity: isReadOnly ? 0.88 : 1,
      }}
      onTouchStart={isReadOnly ? undefined : handleTouchStart}
      onTouchMove={isReadOnly ? undefined : handleTouchMove}
      onTouchEnd={isReadOnly ? undefined : handleTouchEnd}
    >

      {/* Swipe reply indicator */}
      {isSwiping && swipeOffset > 5 && (
        <div
          style={{
            position: "absolute",
            [isMe ? "right" : "left"]: "calc(100% - 24px)",
            top: "50%",
            transform: "translateY(-50%)",
            opacity: swipeIndicatorOpacity,
            fontSize: "1.1rem",
            color: "var(--accent)",
            transition: isSwiping ? "none" : "opacity 0.2s",
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          ↩
        </div>
      )}

      {/* Reaction picker (Positioned above the entire message) */}
      {showReactionPicker && (
        <div
          ref={reactionPickerRef}
          className="scale-up"
          style={{
            position: "absolute",
            bottom: "calc(100% + 4px)", // pops above the outer div
            [isMe ? "right" : "left"]: 0,
            background: "var(--bg-surface-raised)",
            border: "1px solid var(--border-default)",
            borderRadius: "24px",
            padding: "6px 10px",
            display: "flex",
            gap: "4px",
            zIndex: 200,
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            whiteSpace: "nowrap",
          }}
        >
          {REACTION_EMOJIS.map((emoji) => {
            const isMine = myReactions.includes(emoji);
            return (
              <button
                key={emoji}
                onClick={() => {
                  onReact(msg.id, emoji);
                  setShowReactionPicker(false);
                }}
                style={{
                  background: isMine ? "rgba(0,240,255,0.12)" : "none",
                  border: isMine ? "1px solid rgba(0,240,255,0.3)" : "1px solid transparent",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "1.05rem",
                  padding: "4px 5px",
                  lineHeight: 1,
                  transition: "transform 0.12s, background 0.12s",
                  transform: isMine ? "scale(1.15)" : "scale(1)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.3)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = isMine ? "scale(1.15)" : "scale(1)"; }}
                title={emoji}
              >
                {emoji}
              </button>
            );
          })}
        </div>
      )}

      {/* Sender name + role badge */}
      {!isMe && !hideName && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "3px",
            paddingLeft: "2px",
          }}
        >
          <span
            style={{
              fontSize: "0.72rem",
              color: senderNameColor,
              fontWeight: 800,
              letterSpacing: "0.02em",
              textShadow: "0 1px 4px rgba(0,0,0,0.4)"
            }}
          >
            {msg.senderName}
          </span>
          {/* Operative channel tag — shown to spymasters */}
          {isReadOnly && (
            <span
              title="Operative channel — read only"
              style={{
                fontSize: "0.58rem",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(160,160,180,0.8)",
                borderRadius: "3px",
                padding: "0px 4px",
                letterSpacing: "0.04em",
                fontWeight: 700,
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", opacity: 0.8 }}>
                <svg xmlns="http://www.w3.org/w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </span>
              Operative
            </span>
          )}
          {isSpymaster && (
            <span
              title="Spymaster — only spies see this"
              style={{
                fontSize: "0.6rem",
                background: "rgba(138,43,226,0.3)",
                border: "1px solid rgba(180,100,255,0.4)",
                color: "rgba(220,160,255,0.9)",
                borderRadius: "3px",
                padding: "0px 4px",
                letterSpacing: "0.04em",
                fontWeight: 800,
                textTransform: "uppercase",
              }}
            >
              SPY
            </span>
          )}
          {msg.senderIsSupporter && (
            <span title="Supporter" style={{ cursor: "help", fontSize: "0.75rem" }}>
              💎
            </span>
          )}
        </div>
      )}

      {/* Main bubble row */}
      <div
        onMouseEnter={(e) => {
          const reply = e.currentTarget.querySelector(".chat-reply-btn") as HTMLElement | null;
          const react = e.currentTarget.querySelector(".chat-react-btn") as HTMLElement | null;
          if (reply) reply.style.opacity = "1";
          if (react) react.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          const reply = e.currentTarget.querySelector(".chat-reply-btn") as HTMLElement | null;
          const react = e.currentTarget.querySelector(".chat-react-btn") as HTMLElement | null;
          if (reply) reply.style.opacity = "0";
          if (react && !showReactionPicker) react.style.opacity = "0";
        }}
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "6px",
          flexDirection: isMe ? "row-reverse" : "row",
          maxWidth: "90%",
        transform: isReadOnly ? undefined : `translateX(${isMe ? -swipeOffset * 0.4 : swipeOffset * 0.4}px)`,
        transition: isSwiping ? "none" : "transform 0.2s ease",
        }}
      >
        {/* Desktop hover reply button — hidden for read-only operative messages */}
        {!isReadOnly && (
        <button
          className="chat-reply-btn"
          onClick={() => onReply(msg)}
          title="Reply"
          style={{
            background: "none",
            border: "none",
            color: "var(--color-text-muted)",
            cursor: "pointer",
            fontSize: "0.85rem",
            padding: "4px",
            borderRadius: "50%",
            opacity: 0,
            transition: "opacity 0.15s, background 0.15s",
            flexShrink: 0,
            alignSelf: "center",
          }}
        >
          ↩
        </button>
        )}

        {/* Bubble */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowTime((v) => !v)}
          onKeyDown={(e) => e.key === "Enter" && setShowTime((v) => !v)}
          style={{
            background: bubbleBg,
            padding: "9px 13px",
            borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            border: bubbleBorder,
            color: bubbleColor,
            wordBreak: "break-word",
            fontSize: "0.88rem",
            lineHeight: 1.5,
            cursor: "pointer",
            userSelect: "none",
            position: "relative",
            boxShadow: isSpymaster && !isMe
              ? "0 0 12px rgba(138,43,226,0.2)"
              : isMe
              ? "0 4px 16px rgba(0,0,0,0.2)"
              : "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          {/* WhatsApp-style internal reply preview */}
          {msg.replyToId && msg.replyToContent && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                background: "rgba(0, 0, 0, 0.2)",
                borderLeft: "3px solid var(--accent)",
                borderRadius: "4px",
                padding: "6px 8px",
                marginBottom: "6px",
                cursor: "pointer",
              }}
            >
              <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.75rem", marginBottom: "2px" }}>
                {msg.replyToSenderName}
              </span>
              <span style={{ opacity: 0.85, fontSize: "0.82rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "250px" }}>
                {msg.replyToContent}
              </span>
            </div>
          )}

          {renderContent(msg.content, isMe)}

          {/* Time tooltip on click */}
          {showTime && (
            <span
              style={{
                display: "block",
                marginTop: "4px",
                fontSize: "0.62rem",
                color: isMe ? "rgba(255,255,255,0.6)" : "var(--color-text-muted)",
                textAlign: isMe ? "right" : "left",
                animation: "fadeIn 0.15s ease",
              }}
            >
              {formattedTime}
            </span>
          )}
        </div>

        {/* Reaction add button — hidden for read-only messages */}
        {!isReadOnly && (
        <div style={{ position: "relative", flexShrink: 0, alignSelf: "center" }}>
          <button
            onClick={() => setShowReactionPicker((v) => !v)}
            className="chat-react-btn"
            title="React"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "0.9rem",
              padding: "4px",
              borderRadius: "50%",
              opacity: 0,
              color: "var(--color-text-muted)",
              transition: "opacity 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              const btn = e.currentTarget as HTMLElement;
              btn.style.background = "rgba(255,255,255,0.07)";
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget as HTMLElement;
              btn.style.background = "none";
            }}
          >
            😊
          </button>
        </div>
        )}
      </div>

      {/* Reaction bubbles below message — hidden for read-only messages */}
      {hasReactions && !isReadOnly && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px",
            marginTop: "4px",
            justifyContent: isMe ? "flex-end" : "flex-start",
            paddingLeft: isMe ? 0 : "2px",
            paddingRight: isMe ? "2px" : 0,
          }}
        >
          {Object.entries(reactions).map(([emoji, pids]) => {
            const isMine = pids.includes(playerId);
            const reactorNames = getPlayerName 
              ? pids.map(getPlayerName).join(", ") 
              : pids.length + " " + (pids.length === 1 ? "person" : "people");
            return (
              <button
                key={emoji}
                onClick={() => onReact(msg.id, emoji)}
                style={{
                  background: isMine
                    ? "rgba(0,240,255,0.12)"
                    : "rgba(255,255,255,0.05)",
                  border: isMine
                    ? "1px solid rgba(0,240,255,0.35)"
                    : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "2px 7px",
                  cursor: "pointer",
                  fontSize: "0.78rem",
                  color: isMine ? "var(--accent)" : "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  transition: "all 0.15s ease",
                  fontWeight: isMine ? 700 : 400,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                title={reactorNames}
              >
                <span>{emoji}</span>
                <span style={{ fontSize: "0.7rem" }}>{pids.length}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Media link unfurling */}
      {hasMediaLink && (
        <div
          style={{
            marginTop: "5px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: isMe ? "flex-end" : "flex-start",
          }}
        >
          <button
            onClick={() => setShowPreview(!showPreview)}
            style={{
              padding: "4px 10px",
              fontSize: "0.7rem",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "6px",
              color: "var(--accent)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {showPreview
              ? "▼ Hide Preview"
              : `▶ Show ${ytEmbed ? "YouTube" : "Spotify"} Preview`}
          </button>

          {showPreview && (
            <div
              className="scale-up"
              style={{
                marginTop: "6px",
                width: "90%",
                borderRadius: "8px",
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

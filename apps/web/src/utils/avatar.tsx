import React from "react";

export function renderAvatar(avatarId: string | null | undefined, size = 32, extraStyle: React.CSSProperties = {}) {
  const val = avatarId || "🕵️‍♂️";

  if (val.startsWith("s1_") || val.startsWith("s2_")) {
    const sheetNum = val.startsWith("s1_") ? 1 : 2;
    const parts = val.split("_");
    const r = parseInt(parts[1] || "0");
    const c = parseInt(parts[2] || "0");
    const backgroundPosition = `${c * 25}% ${r * 25}%`;
    const sheetUrl = `/avatars/sheet_${sheetNum}.jpg`;

    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          backgroundImage: `url(${sheetUrl})`,
          backgroundSize: "500% 500%",
          backgroundPosition,
          display: "block",
          verticalAlign: "middle",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          flexShrink: 0,
          ...extraStyle
        }}
      />
    );
  }

  // Fallback for standard emoji avatars
  return (
    <span
      style={{
        fontSize: `${size * 0.7}px`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: `${size}px`,
        height: `${size}px`,
        verticalAlign: "middle",
        ...extraStyle
      }}
    >
      {val}
    </span>
  );
}

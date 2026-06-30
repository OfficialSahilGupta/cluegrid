import React from "react";

interface IdenticonProps {
  username: string;
  size?: number;
}

export function Identicon({ username, size = 40 }: IdenticonProps) {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Determine HSL color based on hash
  const hue = Math.abs(hash) % 360;
  const saturation = 65;
  const lightness = 45;
  const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  // Determine 5x5 grid cells based on hash bits
  const cells: boolean[] = [];
  for (let i = 0; i < 15; i++) {
    cells.push(((hash >> i) & 1) === 1);
  }

  // Mirror columns to make it symmetrical (column 0,1,2, then column 1, 0)
  const grid: boolean[][] = [];
  for (let row = 0; row < 5; row++) {
    const rCells = [
      !!cells[row * 3],
      !!cells[row * 3 + 1],
      !!cells[row * 3 + 2],
      !!cells[row * 3 + 1], // mirror column 1
      !!cells[row * 3],     // mirror column 0
    ];
    grid.push(rCells);
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 5 5"
      style={{
        borderRadius: "8px",
        background: "var(--color-surface-hover)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "block",
      }}
    >
      {grid.map((row, rIdx) =>
        row.map((active, cIdx) => {
          if (!active) return null;
          return (
            <rect
              key={`${rIdx}-${cIdx}`}
              x={cIdx}
              y={rIdx}
              width={1}
              height={1}
              fill={color}
            />
          );
        })
      )}
    </svg>
  );
}

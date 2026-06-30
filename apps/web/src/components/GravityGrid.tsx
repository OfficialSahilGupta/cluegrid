import { useEffect, useRef } from "react";

interface GravityGridProps {
  lightMode: boolean;
}

export function GravityGrid({ lightMode }: GravityGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false, currentX: -1000, currentY: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Grid configuration
    const spacing = 55;
    const gravityRadius = 220;
    const gravityStrength = 35; // Maximum offset in pixels

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smoothly interpolate mouse position for a buttery-smooth feel
      const mouse = mouseRef.current;
      if (mouse.active) {
        if (mouse.currentX === -1000) {
          mouse.currentX = mouse.x;
          mouse.currentY = mouse.y;
        } else {
          mouse.currentX += (mouse.x - mouse.currentX) * 0.08;
          mouse.currentY += (mouse.y - mouse.currentY) * 0.08;
        }
      } else {
        // Slowly drift mouse away when inactive
        mouse.currentX += (-1000 - mouse.currentX) * 0.08;
        mouse.currentY += (-1000 - mouse.currentY) * 0.08;
      }

      // Read current theme grid line color dynamically
      const gridColor = lightMode ? "rgba(28, 25, 22, 0.15)" : "rgba(214, 207, 194, 0.15)";
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;

      const cols = Math.ceil(width / spacing) + 2;
      const rows = Math.ceil(height / spacing) + 2;

      // Calculate displaced positions for all grid intersections
      const points: { x: number; y: number }[][] = [];

      for (let r = 0; r < rows; r++) {
        points[r] = [];
        const origY = r * spacing - (spacing / 2);

        for (let c = 0; c < cols; c++) {
          const origX = c * spacing - (spacing / 2);

          // Calculate distance to mouse
          const dx = mouse.currentX - origX;
          const dy = mouse.currentY - origY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let displaceX = 0;
          let displaceY = 0;

          if (dist < gravityRadius) {
            // Smooth bell-curve dropoff
            const force = (gravityRadius - dist) / gravityRadius;
            const pull = Math.pow(force, 2) * gravityStrength;

            // Shift point toward cursor (gravity effect)
            displaceX = (dx / (dist || 1)) * pull;
            displaceY = (dy / (dist || 1)) * pull;
          }

          points[r]![c] = {
            x: origX + displaceX,
            y: origY + displaceY,
          };
        }
      }

      // Draw horizontal lines
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        for (let c = 0; c < cols; c++) {
          const row = points[r];
          if (!row) continue;
          const p = row[c];
          if (!p) continue;

          if (c === 0) {
            ctx.moveTo(p.x, p.y);
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.stroke();
      }

      // Draw vertical lines
      for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        for (let r = 0; r < rows; r++) {
          const row = points[r];
          if (!row) continue;
          const p = row[c];
          if (!p) continue;

          if (r === 0) {
            ctx.moveTo(p.x, p.y);
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [lightMode]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        maskImage: "radial-gradient(ellipse at center, black 70%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 70%, transparent 100%)",
      }}
    />
  );
}

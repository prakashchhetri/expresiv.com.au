import React, { useEffect, useRef } from "react";

export type WavyBackgroundProps = {
  children?: React.ReactNode;
  className?: string; // applied to content wrapper
  containerClassName?: string; // applied to outer container
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
};

const DEFAULTS = {
  colors: ["#38bdf8", "#818cf8", "#c084fc", "#e879f9", "#22d3ee"],
  waveWidth: 50,
  backgroundFill: "black",
  blur: 10,
  speed: "fast" as const,
  waveOpacity: 0.5,
};

export default function WavyBackground({
  children,
  className,
  containerClassName,
  colors = DEFAULTS.colors,
  waveWidth = DEFAULTS.waveWidth,
  backgroundFill = DEFAULTS.backgroundFill,
  blur = DEFAULTS.blur,
  speed = DEFAULTS.speed,
  waveOpacity = DEFAULTS.waveOpacity,
}: WavyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let t = 0;

    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const speedFactor = speed === "slow" ? 0.5 : 1.2;

    const draw = () => {
      t += 0.008 * speedFactor;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = backgroundFill;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      if (blur > 0) {
        ctx.filter = `blur(${blur}px)`;
      }

      const numWaves = colors.length;
      const amplitude = Math.max(6, Math.min(60, waveWidth));

      for (let i = 0; i < numWaves; i++) {
        const yOffset = (i + 1) * (height / (numWaves + 2));
        const color = colors[i % colors.length];
        ctx.globalAlpha = waveOpacity;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x <= width; x += 2) {
          const y = yOffset + Math.sin((x + i * 40) * 0.01 + t * (1 + i * 0.15)) * amplitude;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [colors, waveWidth, backgroundFill, blur, speed, waveOpacity]);

  return (
    <div className={["relative overflow-hidden", containerClassName || ""].join(" ")}>      
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden="true" />
      <div className={["relative", className || ""].join(" ")}>{children}</div>
    </div>
  );
}

import React, { useEffect, useMemo, useRef } from "react";

export type SparklesProps = {
  id?: string;
  className?: string;
  background?: string;
  particleSize?: number;
  minSize?: number;
  maxSize?: number;
  speed?: number; // pixels per second
  particleColor?: string;
  particleDensity?: number; // particles per 10k px^2
};

const DEFAULTS: Required<Omit<SparklesProps, "id" | "className">> = {
  background: "transparent",
  particleSize: 2,
  minSize: 1,
  maxSize: 3,
  speed: 20,
  particleColor: "rgba(255,255,255,0.8)",
  particleDensity: 8,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export const Sparkles: React.FC<SparklesProps> = ({
  id,
  className,
  background = DEFAULTS.background,
  particleSize = DEFAULTS.particleSize,
  minSize = DEFAULTS.minSize,
  maxSize = DEFAULTS.maxSize,
  speed = DEFAULTS.speed,
  particleColor = DEFAULTS.particleColor,
  particleDensity = DEFAULTS.particleDensity,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Array<{ x: number; y: number; r: number; vx: number; vy: number }>>([]);
  const animationRef = useRef<number | null>(null);
  const color = particleColor;

  const density = clamp(particleDensity, 1, 5000);
  const minR = clamp(minSize, 0.1, 10);
  const maxR = Math.max(minR, clamp(maxSize, minR, 20));
  const baseSpeed = clamp(speed, 1, 200);
  const defaultR = clamp(particleSize, minR, maxR);

  const computeParticleCount = (width: number, height: number) => {
    const area = (width * height) / 10000; // 10k px^2 buckets
    return Math.floor(area * density);
  };

  const initParticles = (width: number, height: number) => {
    const count = computeParticleCount(width, height);
    const particles: Array<{ x: number; y: number; r: number; vx: number; vy: number }> = [];
    for (let i = 0; i < count; i++) {
      const r = defaultR + Math.random() * (maxR - minR);
      const angle = Math.random() * Math.PI * 2;
      const speedPx = baseSpeed * (0.5 + Math.random());
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r,
        vx: Math.cos(angle) * (speedPx / 60),
        vy: Math.sin(angle) * (speedPx / 60),
      });
    }
    particlesRef.current = particles;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let resizeObserver: ResizeObserver | null = null;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles(width, height);
    };

    resize();
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      if (background && background !== "transparent") {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.fillStyle = color;
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -p.r) p.x = width + p.r;
        if (p.x > width + p.r) p.x = -p.r;
        if (p.y < -p.r) p.y = height + p.r;
        if (p.y > height + p.r) p.y = -p.r;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [background, color, defaultR, maxR, minR, baseSpeed, density]);

  return (
    <canvas
      id={id}
      ref={canvasRef}
      className={
        [
          "pointer-events-none absolute inset-0 h-full w-full",
          className || "",
        ].join(" ")
      }
      aria-hidden="true"
    />
  );
};

export default Sparkles;

"use client";

import { useEffect, useRef } from "react";

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
      pulse: number;
    }[] = [];

    const resize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.4 + 0.05,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,0,0,${a})`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,0,0,${0.04 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ display: "block" }}
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(240,240,255,0.7) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="relative mb-10 flex items-center justify-center">
          <span
            className="absolute inline-block rounded-full border border-black/10"
            style={{
              width: 120,
              height: 120,
              animation: "ping-slow 2.8s cubic-bezier(0,0,0.2,1) infinite",
            }}
          />
          <span
            className="absolute inline-block rounded-full border border-black/6"
            style={{
              width: 160,
              height: 160,
              animation: "ping-slow 2.8s cubic-bezier(0,0,0.2,1) infinite 0.4s",
            }}
          />
          <span
            className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-black"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="5" fill="white" />
              <path
                d="M14 3v3M14 22v3M3 14h3M22 14h3M6.22 6.22l2.12 2.12M19.66 19.66l2.12 2.12M6.22 21.78l2.12-2.12M19.66 8.34l2.12-2.12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </div>

        <p
          className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-black/40"
          style={{ letterSpacing: "0.25em" }}
        >
          RiskBases
        </p>

        <h1
          className="text-[clamp(52px,10vw,96px)] font-semibold leading-none tracking-[-0.05em] text-black"
          style={{ animation: "fade-up 0.9s ease both" }}
        >
          Coming
          <br />
          <span
            style={{
              WebkitTextStroke: "2px black",
              color: "transparent",
              animation: "fade-up 0.9s ease 0.12s both",
              display: "inline-block",
            }}
          >
            Soon.
          </span>
        </h1>

        <p
          className="mt-6 max-w-[380px] text-[17px] leading-8 text-black/50"
          style={{ animation: "fade-up 0.9s ease 0.22s both" }}
        >
          RiskBases is launching soon. We're putting the finishing touches on something built for serious risk management.
        </p>
      </div>

      <style>{`
        @keyframes ping-slow {
          0%   { transform: scale(1);   opacity: 0.6; }
          80%  { transform: scale(1.7); opacity: 0; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}

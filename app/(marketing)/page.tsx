"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.75, ease: "easeOut" },
  },
};

const fadeRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.75, ease: "easeOut" },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const featureLine = [
  "Centralized risk register",
  "Smart risk analysis",
  "Action workflow",
  "Stakeholder alignment",
  "Automated reporting",
];

const problemItems = [
  "Risks, actions and decisions are spread across too many files and tools.",
  "Teams struggle to see what is open, overdue or most important right now.",
  "Ownership gets lost and mitigation actions slip through over time.",
];

const solutionItems = [
  "One source of truth for risks and actions.",
  "Clear ownership across teams and projects.",
  "Clean reporting for stakeholders and management.",
  "Better visibility across the full project lifecycle.",
];

const steps = [
  {
    number: "01",
    title: "Create a workspace",
    text: "Set up your workspace and invite your team in minutes.",
  },
  {
    number: "02",
    title: "Add and score risks",
    text: "Structure risks clearly and apply one consistent scoring model.",
  },
  {
    number: "03",
    title: "Assign actions",
    text: "Turn risks into clear ownership, deadlines and follow-up.",
  },
  {
    number: "04",
    title: "Report and improve",
    text: "Track progress and generate updates for every stakeholder.",
  },
];

const fieldItems = [
  "Capture risks earlier in the project lifecycle.",
  "Improve coordination between project stakeholders.",
  "Reduce delays in follow-up and reporting.",
];

const collaborationItems = [
  "One live overview across projects.",
  "Clear accountability for every action.",
  "Stronger collaboration between office and site.",
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[16px] font-semibold tracking-[-0.02em] text-black">
      {children}
    </div>
  );
}

function DotList({ items }: { items: string[] }) {
  return (
    <div className="mt-10 space-y-5">
      {items.map((item) => (
        <div
          key={item}
          className="flex items-start gap-4 border-t border-black/10 pt-5"
        >
          <div className="mt-[11px] h-2 w-2 rounded-full bg-black" />
          <p className="text-[20px] leading-9 text-black">{item}</p>
        </div>
      ))}
    </div>
  );
}


function ParticleField() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;
    const MARGIN = 24;

    type Particle = {
      x: number; y: number; startY: number; targetY: number; targetX: number;
      vx: number; vy: number; r: number; hue: number; sat: number;
      alpha: number; pulse: number; pulseSpeed: number;
      landDelay: number; landed: boolean;
      isBubble: boolean;
      // pop state
      popTimer: number; popTrigger: number;
      popPhase: number; // 0=alive 1=swelling 2=popping 3=done
      popProgress: number;
    };

    const mkP = (delayOverride?: number): Particle => {
      const w = W(), h = H();
      const isBubble = Math.random() < 0.22;
      const tx = MARGIN + Math.random() * (w - MARGIN * 2);
      const ty = MARGIN + Math.random() * (h - MARGIN * 2);
      return {
        x: tx, y: -60 - Math.random() * h,
        startY: -60 - Math.random() * h,
        targetY: ty, targetX: tx,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: isBubble ? 3 + Math.random() * 4 : 0.9 + Math.random() * 1.5,
        hue: 260 + Math.random() * 70,
        sat: 65 + Math.random() * 25,
        alpha: isBubble ? 0.42 + Math.random() * 0.32 : 0.30 + Math.random() * 0.48,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.007 + Math.random() * 0.013,
        landDelay: delayOverride ?? Math.random() * 800,
        landed: false, isBubble,
        popTimer: 0,
        popTrigger: 3000 + Math.random() * 9000,
        popPhase: 0, popProgress: 0,
      };
    };

    const particles: Particle[] = Array.from({ length: 1050 }, () => mkP());

    let animId: number;
    let startTime: number | null = null;
    let lastTs = 0;

    const draw = (ts: number) => {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const dt = Math.min(ts - lastTs, 50);
      lastTs = ts;

      ctx.clearRect(0, 0, W(), H());
      const w = W(), h = H();

      for (const p of particles) {
        const t = Math.max(0, Math.min(1, (elapsed - p.landDelay) / 1500));
        const ease = 1 - Math.pow(1 - t, 3);

        if (t < 1) {
          p.y = p.startY + (p.targetY - p.startY) * ease;
          p.x = p.targetX;
        } else {
          if (!p.landed) p.landed = true;

          // bubble pop logic
          if (p.isBubble && p.popPhase === 0) {
            p.popTimer += dt;
            if (p.popTimer > p.popTrigger) p.popPhase = 1;
          }
          if (p.popPhase === 1) { // swell
            p.popProgress = Math.min(1, p.popProgress + dt / 400);
            if (p.popProgress >= 1) p.popPhase = 2;
          }
          if (p.popPhase === 2) { // pop burst
            p.popProgress = Math.min(1, p.popProgress + dt / 180);
            if (p.popProgress >= 1) {
              // respawn as new particle
              const np = mkP(0);
              Object.assign(p, np);
              p.landed = true; p.y = p.targetY; p.x = p.targetX;
            }
          }

          // drift (only when not popping)
          if (p.popPhase < 2) {
            p.x += p.vx; p.y += p.vy;
            p.pulse += p.pulseSpeed;
            if (p.x < MARGIN)     { p.x = MARGIN;     p.vx =  Math.abs(p.vx); }
            if (p.x > w - MARGIN) { p.x = w - MARGIN; p.vx = -Math.abs(p.vx); }
            if (p.y < MARGIN)     { p.y = MARGIN;      p.vy =  Math.abs(p.vy); }
            if (p.y > h - MARGIN) { p.y = h - MARGIN;  p.vy = -Math.abs(p.vy); }
          }
        }

        const fadeIn = Math.min(1, t * 2.5);
        const pulseFactor = p.landed ? (0.80 + 0.20 * Math.sin(p.pulse)) : 1;

        if (p.isBubble) {
          let drawR = p.r * pulseFactor;
          let drawA = p.alpha * fadeIn;

          if (p.popPhase === 1) {
            // swell: grow 1x → 1.5x
            drawR = p.r * (1 + 0.5 * p.popProgress) * pulseFactor;
            drawA = p.alpha * fadeIn;
          } else if (p.popPhase === 2) {
            // pop: expand ring outward, fade out
            drawR = p.r * 1.5 * (1 + 0.6 * p.popProgress);
            drawA = p.alpha * (1 - p.popProgress);
          }

          if (drawA <= 0) continue;

          // outer ring
          ctx.beginPath();
          ctx.arc(p.x, p.y, drawR, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${p.hue}, ${p.sat}%, 65%, ${drawA * 1.6})`;
          ctx.lineWidth = p.popPhase === 2 ? 0.8 : 1.6;
          ctx.stroke();

          // inner gradient fill
          const bg = ctx.createRadialGradient(p.x, p.y - drawR * 0.3, drawR * 0.05, p.x, p.y, drawR);
          bg.addColorStop(0,   `hsla(${p.hue}, ${p.sat}%, 88%, ${drawA * 0.68})`);
          bg.addColorStop(0.5, `hsla(${p.hue}, ${p.sat}%, 72%, ${drawA * 0.30})`);
          bg.addColorStop(1,   `hsla(${p.hue}, ${p.sat}%, 65%, 0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, drawR, 0, Math.PI * 2);
          ctx.fillStyle = bg;
          ctx.fill();

          // specular highlight (top-left gleam)
          if (p.popPhase < 2) {
            ctx.beginPath();
            ctx.arc(p.x - drawR * 0.28, p.y - drawR * 0.30, drawR * 0.22, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${drawA * 0.55})`;
            ctx.fill();
          }

          // second burst ring on pop
          if (p.popPhase === 2) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, drawR * 1.35, 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(${p.hue}, ${p.sat}%, 80%, ${drawA * 0.3})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        } else {
          // dot
          const a = p.alpha * fadeIn * pulseFactor;
          const r = p.r * pulseFactor;
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.0);
          g.addColorStop(0,   `hsla(${p.hue}, ${p.sat}%, 68%, ${a})`);
          g.addColorStop(0.4, `hsla(${p.hue}, ${p.sat}%, 62%, ${a * 0.38})`);
          g.addColorStop(1,   `hsla(${p.hue}, ${p.sat}%, 55%, 0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 3.0, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ zIndex: 1 }}
    />
  );
}


function HeroRibbon() {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const animRef = React.useRef<number>(0);

  React.useEffect(() => {
    // Height: stop just above feature bar
    const setHeight = () => {
      if (!wrapRef.current) return;
      const secs = document.querySelectorAll("section");
      const bar = secs[1] as HTMLElement | null;
      if (bar) {
        const top = bar.getBoundingClientRect().top + window.scrollY;
        wrapRef.current.style.height = (top - 10) + "px";
      }
    };
    setTimeout(setHeight, 60);
    window.addEventListener("resize", setHeight);
    return () => window.removeEventListener("resize", setHeight);
  }, []);

  React.useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const W = 560, H = 1000, N = 100;
    let t = 0;

    // Create 3 ribbon groups: each has a fill path + a sheen path
    const groups: { fill: SVGPathElement; sheen: SVGPathElement }[] = [];

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

    // Main ribbon gradient
    const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    grad.setAttribute("id", "rg");
    grad.setAttribute("x1", "0"); grad.setAttribute("y1", "0");
    grad.setAttribute("x2", "0"); grad.setAttribute("y2", "1");
    const gStops = [
      [0,   "rgba(255,255,255,0)"],
      [0.05,"rgba(90,70,255,0.20)"],
      [0.14,"rgba(58,40,255,0.99)"],
      [0.26,"rgba(195,185,255,0.93)"],
      [0.37,"rgba(50,32,255,1.0)"],
      [0.49,"rgba(191,181,255,0.95)"],
      [0.61,"rgba(55,37,255,0.99)"],
      [0.73,"rgba(188,178,255,0.93)"],
      [0.85,"rgba(60,42,255,0.97)"],
      [0.94,"rgba(130,115,255,0.22)"],
      [1,   "rgba(255,255,255,0)"],
    ];
    gStops.forEach(([o, c]) => {
      const s = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      s.setAttribute("offset", (o as number * 100) + "%");
      s.setAttribute("stop-color", c as string);
      grad.appendChild(s);
    });
    defs.appendChild(grad);

    // Sheen gradient
    const sg = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    sg.setAttribute("id", "sg");
    sg.setAttribute("x1", "0"); sg.setAttribute("y1", "0");
    sg.setAttribute("x2", "0"); sg.setAttribute("y2", "1");
    const sStops = [
      [0,   "rgba(255,255,255,0)"],
      [0.10,"rgba(255,255,255,0.94)"],
      [0.25,"rgba(255,255,255,0.02)"],
      [0.45,"rgba(255,255,255,0.92)"],
      [0.61,"rgba(255,255,255,0.02)"],
      [0.79,"rgba(255,255,255,0.90)"],
      [1,   "rgba(255,255,255,0)"],
    ];
    sStops.forEach(([o, c]) => {
      const s = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      s.setAttribute("offset", (o as number * 100) + "%");
      s.setAttribute("stop-color", c as string);
      sg.appendChild(s);
    });
    defs.appendChild(sg);

    // Fade mask
    const maskGrad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    maskGrad.setAttribute("id", "mg");
    maskGrad.setAttribute("x1","0"); maskGrad.setAttribute("y1","0");
    maskGrad.setAttribute("x2","0"); maskGrad.setAttribute("y2","1");
    [[0,"#000"],[0.87,"#000"],[1,"rgba(0,0,0,0)"]].forEach(([o,c])=>{
      const s = document.createElementNS("http://www.w3.org/2000/svg","stop");
      s.setAttribute("offset", (parseFloat(o as string)*100)+"%");
      s.setAttribute("stop-color", c as string);
      maskGrad.appendChild(s);
    });
    defs.appendChild(maskGrad);

    const mask = document.createElementNS("http://www.w3.org/2000/svg","mask");
    mask.setAttribute("id","fm");
    const mr = document.createElementNS("http://www.w3.org/2000/svg","rect");
    mr.setAttribute("width", String(W)); mr.setAttribute("height", String(H));
    mr.setAttribute("fill","url(#mg)");
    mask.appendChild(mr);
    defs.appendChild(mask);

    svg.appendChild(defs);

    // Main group with mask
    const g = document.createElementNS("http://www.w3.org/2000/svg","g");
    g.setAttribute("mask","url(#fm)");
    svg.appendChild(g);

    // 3 ribbons
    const configs = [
      { hw: 82, wave: 0.115, phase: 0,    sheenHw: 17 },
      { hw: 64, wave: 0.115, phase: 1.1,  sheenHw: 13 },
      { hw: 48, wave: 0.115, phase: 2.3,  sheenHw: 10 },
    ];

    configs.forEach(cfg => {
      const fill = document.createElementNS("http://www.w3.org/2000/svg","path");
      fill.setAttribute("fill","url(#rg)");
      g.appendChild(fill);
      const sheen = document.createElementNS("http://www.w3.org/2000/svg","path");
      sheen.setAttribute("fill","url(#sg)");
      sheen.setAttribute("opacity","0.72");
      g.appendChild(sheen);
      groups.push({ fill, sheen });
    });

    const buildPath = (hw: number, wave: number, phase: number, sheenHw: number): [string, string] => {
      const spine = Array.from({length: N+1}, (_, i) => {
        const n = i / N;
        // Strong diagonal: starts at 98% width from left at top, ends at 8% at bottom
        const diag = W * (0.98 - n * 0.90);
        const w = Math.sin(n * Math.PI * 2.2 + t * 0.28 + phase) * W * wave;
        return { x: diag + w, y: n * H };
      });

      const L: {x:number,y:number}[] = [];
      const R: {x:number,y:number}[] = [];
      const SH: {x:number,y:number}[] = [];

      for (let i = 0; i <= N; i++) {
        const a = spine[Math.max(0,i-1)], b = spine[Math.min(N,i+1)];
        const dx = b.x - a.x, dy = b.y - a.y;
        const len = Math.sqrt(dx*dx+dy*dy)||1;
        const nx = -dy/len, ny = dx/len;
        L.push({x: spine[i].x + nx*hw, y: spine[i].y + ny*hw});
        R.push({x: spine[i].x - nx*hw, y: spine[i].y - ny*hw});
        SH.push({x: spine[i].x + nx*sheenHw, y: spine[i].y + ny*sheenHw});
      }

      const pts2path = (arr:{x:number,y:number}[], start='M') =>
        arr.map((p,i) => `${i===0?start:'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('');

      const fillPath = pts2path(L) + pts2path([...R].reverse(), 'L') + 'Z';
      const sheenPath = pts2path(L) + pts2path([...SH].reverse(), 'L') + 'Z';
      return [fillPath, sheenPath];
    };

    const frame = () => {
      configs.forEach((cfg, i) => {
        const [fp, sp] = buildPath(cfg.hw, cfg.wave, cfg.phase, cfg.sheenHw);
        groups[i].fill.setAttribute('d', fp);
        groups[i].sheen.setAttribute('d', sp);
      });
      t += 0.007;
      animRef.current = requestAnimationFrame(frame);
    };

    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute right-0 hidden lg:block"
      style={{ width: 580, height: 1100, zIndex: 5, overflow: "visible", top: 0 }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 560 1000"
        style={{ width: "100%", height: "100%", overflow: "visible" }}
        preserveAspectRatio="xMaxYMin meet"
      />
    </div>
  );
}


export default function HomePage() {

  return (
    <main className="bg-[#f6f7fb] text-black" style={{ position: "relative" }}>

      {/* HERO */}
      <section className="relative bg-white" style={{overflow:"visible"}}>
        <div className="absolute inset-y-0 right-0 hidden w-[46%] bg-white lg:block" />

        <div className="mx-auto max-w-[1560px] px-6 pb-20 pt-20 lg:px-10 lg:pb-24 lg:pt-24">
          <div className="grid items-center gap-16 lg:grid-cols-[0.82fr_1.18fr]">
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="max-w-[620px]"
            >
              <SectionLabel>AI-driven risk management platform</SectionLabel>

              <h1 className="mt-6 text-[58px] font-semibold leading-[0.94] tracking-[-0.07em] text-black md:text-[84px]">
                Take control
                <br />
                of risk.
                <br />
                Build safer projects.
              </h1>

              <p className="mt-8 max-w-[560px] text-[20px] leading-9 text-black">
                RiskBases helps teams manage risks, actions and stakeholders in
                one clear workspace. Stay proactive, aligned and always up to
                date.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/book-demo"
                  className="inline-flex items-center rounded-full bg-[#635bff] px-7 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#554cf2]"
                >
                  Book a demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>

                <Link
                  href="/features/risk-register"
                  className="inline-flex items-center rounded-full border border-black/12 px-7 py-3.5 text-[15px] font-semibold text-black transition hover:bg-black/[0.03]"
                >
                  Explore features
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px] text-black">
                <span className="font-medium text-black">★★★★★</span>
                <span>Trusted by growing project teams</span>
                <span className="hidden h-1 w-1 rounded-full bg-black/20 sm:block" />
                <span>Structured. Clear. Scalable.</span>
              </div>
            </motion.div>

            <motion.div
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="relative overflow-visible"
              style={{ minHeight: "760px" }}
            >
              {/* Particles fill entire right column including top gray area */}
              <div className="pointer-events-none absolute inset-0" style={{ top: "-100px", bottom: "-80px", left: "-60px", right: "-200px", zIndex: 1 }}>
                <ParticleField />
              </div>
              <div className="relative z-10">
                <div className="ml-auto max-w-[980px] overflow-hidden rounded-[24px] shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                  <Image
                    src="/workspace.png"
                    alt="RiskBases workspace overview"
                    width={1600}
                    height={1000}
                    className="h-auto w-full object-cover"
                    priority
                  />
                </div>

                <div className="-mt-12 ml-12 max-w-[920px] overflow-hidden rounded-[22px] shadow-[0_18px_60px_rgba(15,23,42,0.08)] lg:ml-20">
                  <Image
                    src="/project.png"
                    alt="RiskBases project overview"
                    width={1500}
                    height={900}
                    className="h-auto w-full object-cover"
                  />
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      </section>

      {/* Ribbon — overlaps hero from the right, z above bg but below feature bar */}
      <div className="pointer-events-none relative hidden lg:block" style={{ height: 0 }}>
        <HeroRibbon />
      </div>
      {/* FEATURE LINE */}
      <section className="bg-[#f6f7fb]">
        <div className="mx-auto max-w-[1440px] px-6 py-10 lg:px-10">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid gap-y-6 border-y border-black/10 py-10 md:grid-cols-2 xl:grid-cols-5"
          >
            {featureLine.map((item) => (
              <motion.div
                key={item}
                variants={fadeUp}
                className="text-[20px] font-semibold tracking-[-0.02em] text-black"
              >
                {item}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="bg-[#f6f7fb]">
        <div className="mx-auto max-w-[1440px] px-6 py-24 lg:px-10">
          <div className="grid gap-20 lg:grid-cols-2">
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="max-w-[620px]"
            >
              <SectionLabel>The challenge</SectionLabel>

              <h2 className="mt-5 text-[56px] font-semibold leading-[1.02] tracking-[-0.06em] text-black md:text-[72px]">
                Risk management is often still fragmented.
              </h2>

              <p className="mt-7 text-[20px] leading-9 text-black">
                Many teams still rely on Excel, email and separate documents.
                That makes it difficult to maintain clarity, ownership and
                timely follow-up.
              </p>

              <div className="mt-12 space-y-8">
                {problemItems.map((item, index) => (
                  <div key={item} className="border-t border-black/10 pt-6">
                    <div className="text-[24px] font-semibold tracking-[-0.03em] text-black/20">
                      0{index + 1}
                    </div>
                    <p className="mt-3 max-w-[560px] text-[20px] leading-9 text-black">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="max-w-[640px]"
            >
              <SectionLabel>The platform</SectionLabel>

              <h2 className="mt-5 text-[56px] font-semibold leading-[1.02] tracking-[-0.06em] text-black md:text-[72px]">
                One platform for everything. Always in control.
              </h2>

              <p className="mt-7 text-[20px] leading-9 text-black">
                RiskBases brings risks, actions, reporting and accountability
                together in one structured environment for project teams.
              </p>

              <DotList items={solutionItems} />

              <div className="mt-12 overflow-hidden rounded-[22px] shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
                <Image
                  src="/integraties.png"
                  alt="RiskBases integrations overview"
                  width={1600}
                  height={1000}
                  className="h-auto w-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1440px] px-6 py-24 lg:px-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="max-w-[760px]"
          >
            <SectionLabel>How it works</SectionLabel>

            <h2 className="mt-5 text-[56px] font-semibold leading-[1.02] tracking-[-0.06em] text-black md:text-[72px]">
              From risk to action in four steps.
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-14 grid gap-10 md:grid-cols-2 xl:grid-cols-4"
          >
            {steps.map((step) => (
              <motion.div
                key={step.number}
                variants={fadeUp}
                className="border-t border-black/10 pt-6"
              >
                <div className="text-[24px] font-semibold tracking-[-0.03em] text-black/20">
                  {step.number}
                </div>
                <h3 className="mt-4 text-[28px] font-semibold tracking-[-0.03em] text-black">
                  {step.title}
                </h3>
                <p className="mt-4 text-[18px] leading-8 text-black">
                  {step.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PHOTO 1 */}
      <section className="bg-[#f6f7fb]">
        <div className="mx-auto max-w-[1440px] px-6 py-24 lg:px-10">
          <div className="grid items-center gap-16 lg:grid-cols-[1.02fr_0.98fr]">
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="overflow-hidden rounded-[22px] shadow-[0_12px_40px_rgba(15,23,42,0.06)]"
            >
              <Image
                src="/fotorisk.png"
                alt="Construction team reviewing plans on site"
                width={1600}
                height={1100}
                className="h-[560px] w-full object-cover"
              />
            </motion.div>

            <motion.div
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="max-w-[560px]"
            >
              <SectionLabel>Built for real project environments</SectionLabel>

              <h2 className="mt-5 text-[56px] font-semibold leading-[1.03] tracking-[-0.06em] text-black md:text-[72px]">
                Created for teams that need clarity on site and in the office.
              </h2>

              <p className="mt-7 text-[20px] leading-9 text-black">
                From planning and execution to audits and stakeholder reviews,
                RiskBases gives teams one clear place to stay aligned.
              </p>

              <DotList items={fieldItems} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* PHOTO 2 */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1440px] px-6 py-24 lg:px-10">
          <div className="grid items-center gap-16 lg:grid-cols-[0.98fr_1.02fr]">
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="max-w-[560px]"
            >
              <SectionLabel>Collaboration and accountability</SectionLabel>

              <h2 className="mt-5 text-[56px] font-semibold leading-[1.03] tracking-[-0.06em] text-black md:text-[72px]">
                Better conversations. Better decisions.
              </h2>

              <p className="mt-7 text-[20px] leading-9 text-black">
                Keep managers, engineers and stakeholders on the same page with
                structured actions, visible ownership and clear progress
                tracking.
              </p>

              <DotList items={collaborationItems} />
            </motion.div>

            <motion.div
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="overflow-hidden rounded-[22px] shadow-[0_12px_40px_rgba(15,23,42,0.06)]"
            >
              <Image
                src="/fotorisk2.png"
                alt="Project professionals collaborating with tablet"
                width={1600}
                height={1100}
                className="h-[560px] w-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#f6f7fb]">
        <div className="mx-auto max-w-[1440px] px-6 py-24 lg:px-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="border-t border-black/10 pt-16 text-center"
          >
            <div className="mx-auto max-w-[860px]">
              <h2 className="text-[56px] font-semibold leading-[1.02] tracking-[-0.06em] text-black md:text-[72px]">
                Ready to take control of your risks?
              </h2>

              <p className="mx-auto mt-7 max-w-[760px] text-[20px] leading-9 text-black">
                Book a demo and discover how RiskBases helps teams stay
                proactive, aligned and always up to date.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/book-demo"
                  className="inline-flex items-center rounded-full bg-[#635bff] px-7 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#554cf2]"
                >
                  Book a demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>

                <Link
                  href="/auth"
                  className="inline-flex items-center rounded-full border border-black/12 px-7 py-3.5 text-[15px] font-semibold text-black transition hover:bg-white"
                >
                  Start for free
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
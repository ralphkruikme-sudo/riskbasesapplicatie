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


function BrainCard() {
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "1179/610", background: "#f6f7fb", borderRadius: 0 }}>
      <style>{`
        @keyframes brainPulse {
          0%,100% { transform: scale(1);     opacity: 0.82; }
          12%     { transform: scale(1.07);  opacity: 1;    }
          22%     { transform: scale(0.974); opacity: 0.88; }
          34%     { transform: scale(1.038); opacity: 0.95; }
          50%     { transform: scale(1);     opacity: 0.82; }
        }
        @keyframes pulseRing {
          0%   { transform: scale(0.85); opacity: 0.8; }
          100% { transform: scale(1.6);  opacity: 0;   }
        }
        @keyframes rayFlow {
          0%   { stroke-dashoffset: 180; opacity: 0;   }
          15%  { opacity: 0.85; }
          85%  { opacity: 0.85; }
          100% { stroke-dashoffset: -180; opacity: 0;  }
        }
        @keyframes rayFlash {
          0%,100% { opacity: 0.35; }
          12%     { opacity: 1.0;  }
          22%     { opacity: 0.45; }
          34%     { opacity: 0.85; }
          50%     { opacity: 0.35; }
        }
      `}</style>

      {/* PNG — multiply blends its white bg away */}
      <img
        src="/integraties_cropped.png"
        alt="RiskBases AI Engine"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", position: "relative", zIndex: 1 }}
      />

      {/* SVG overlay */}
      <svg viewBox="0 0 1179 610"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 2, pointerEvents: "none", overflow: "visible" }}>
        <defs>
          <radialGradient id="bc1" cx="50%" cy="48%" r="52%">
            <stop offset="0%"   stopColor="#b8a4ff" stopOpacity="0.9"/>
            <stop offset="40%"  stopColor="#7c5cfc" stopOpacity="0.55"/>
            <stop offset="100%" stopColor="#5b3de8" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="bc2" cx="42%" cy="38%" r="45%">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.65"/>
            <stop offset="60%"  stopColor="#d4c8ff" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="#9b8aff" stopOpacity="0"/>
          </radialGradient>
          {/* Ray gradient: bright near brain, fades to icon */}
          <linearGradient id="rl" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#a78bff" stopOpacity="0"/>
            <stop offset="30%"  stopColor="#c4b5ff" stopOpacity="0.95"/>
            <stop offset="70%"  stopColor="#a78bff" stopOpacity="0.7"/>
            <stop offset="100%" stopColor="#7c5cfc" stopOpacity="0.15"/>
          </linearGradient>
          <linearGradient id="rr" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%"   stopColor="#a78bff" stopOpacity="0"/>
            <stop offset="30%"  stopColor="#c4b5ff" stopOpacity="0.95"/>
            <stop offset="70%"  stopColor="#a78bff" stopOpacity="0.7"/>
            <stop offset="100%" stopColor="#7c5cfc" stopOpacity="0.15"/>
          </linearGradient>
        </defs>

        {/* Pulse rings from brain center (615, 390) */}
        {[0, 0.55, 1.10].map((d, i) => (
          <circle key={i} cx="590" cy="320" r="92" fill="none"
            stroke="#b8a4ff" strokeWidth="1.4"
            style={{ transformOrigin:"590px 320px", animation:`pulseRing 2.0s ease-out ${d}s infinite`, opacity:0 }}
          />
        ))}

        {/* LEFT rays: brain → icons (Project data, Cost data, Schedule, Weather, Supply chain) */}
        {/* Each ray: x1=brain edge (~520), y1=brain, x2=icon, y2=icon */}
        {[
          { x1:500, y1:220, x2:220, y2:100, delay:"0.0s" },  // Project data
          { x1:494, y1:270, x2:198, y2:188, delay:"0.25s" }, // Cost data
          { x1:490, y1:318, x2:194, y2:275, delay:"0.5s" },  // Schedule
          { x1:494, y1:365, x2:198, y2:368, delay:"0.75s" }, // Weather
          { x1:500, y1:406, x2:220, y2:455, delay:"1.0s" },  // Supply chain
        ].map((r, i) => (
          <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
            stroke="url(#rl)" strokeWidth="1.4"
            strokeDasharray="160 280"
            style={{ animation:`rayFlow 2.0s linear ${r.delay} infinite`, opacity:0 }}
          />
        ))}

        {/* RIGHT rays: brain → icons (Risk score, AI insights, Monte Carlo, Scenario, Alerts) */}
        {[
          { x1:685, y1:220, x2:958, y2:100, delay:"0.12s" },  // Risk score
          { x1:688, y1:270, x2:978, y2:188, delay:"0.37s" }, // AI insights
          { x1:692, y1:318, x2:982, y2:275, delay:"0.62s" }, // Monte Carlo
          { x1:688, y1:365, x2:978, y2:368, delay:"0.87s" }, // Scenario
          { x1:682, y1:406, x2:960, y2:455, delay:"1.12s" },  // Alerts
        ].map((r, i) => (
          <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
            stroke="url(#rr)" strokeWidth="1.4"
            strokeDasharray="160 280"
            style={{ animation:`rayFlow 2.0s linear ${r.delay} infinite`, opacity:0 }}
          />
        ))}

        {/* Brain glow — pulses with heartbeat */}
        <ellipse cx="590" cy="320" rx="148" ry="160"
          fill="url(#bc1)"
          style={{ transformOrigin:"590px 320px", animation:"brainPulse 2.0s ease-in-out infinite" }}
        />
        <ellipse cx="585" cy="302" rx="88" ry="100"
          fill="url(#bc2)"
          style={{ transformOrigin:"585px 302px", animation:"brainPulse 2.0s ease-in-out infinite" }}
        />
      </svg>
    </div>
  );
}


function HeroRibbon() {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const animRef = React.useRef<number>(0);

  React.useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // W=320 is the container width, H=900 covers hero + some below
    const W = 320, H = 900, N = 120;
    let t = 0;

    const groups: { fill: SVGPathElement; sheen: SVGPathElement }[] = [];
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

    // Main ribbon gradient - deep purple to lavender
    const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    grad.setAttribute("id", "rg2");
    grad.setAttribute("x1", "0"); grad.setAttribute("y1", "0");
    grad.setAttribute("x2", "0"); grad.setAttribute("y2", "1");
    [
      [0,    "rgba(255,255,255,0)"],
      [0.04, "rgba(90,70,255,0.18)"],
      [0.12, "rgba(58,40,255,1.0)"],
      [0.24, "rgba(195,185,255,0.95)"],
      [0.36, "rgba(50,32,255,1.0)"],
      [0.48, "rgba(191,181,255,0.96)"],
      [0.60, "rgba(55,37,255,1.0)"],
      [0.72, "rgba(188,178,255,0.95)"],
      [0.84, "rgba(60,42,255,0.98)"],
      [0.93, "rgba(130,115,255,0.20)"],
      [1,    "rgba(255,255,255,0)"],
    ].forEach(([o, c]) => {
      const s = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      s.setAttribute("offset", (o as number * 100) + "%");
      s.setAttribute("stop-color", c as string);
      grad.appendChild(s);
    });
    defs.appendChild(grad);

    // Sheen
    const sg = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    sg.setAttribute("id", "sg2");
    sg.setAttribute("x1", "0"); sg.setAttribute("y1", "0");
    sg.setAttribute("x2", "0"); sg.setAttribute("y2", "1");
    [
      [0,    "rgba(255,255,255,0)"],
      [0.10, "rgba(255,255,255,0.92)"],
      [0.25, "rgba(255,255,255,0.02)"],
      [0.44, "rgba(255,255,255,0.90)"],
      [0.60, "rgba(255,255,255,0.02)"],
      [0.78, "rgba(255,255,255,0.88)"],
      [1,    "rgba(255,255,255,0)"],
    ].forEach(([o, c]) => {
      const s = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      s.setAttribute("offset", (o as number * 100) + "%");
      s.setAttribute("stop-color", c as string);
      sg.appendChild(s);
    });
    defs.appendChild(sg);

    // Fade mask: fade in at top, fade out at bottom
    const mg = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    mg.setAttribute("id", "mg2");
    mg.setAttribute("x1","0"); mg.setAttribute("y1","0");
    mg.setAttribute("x2","0"); mg.setAttribute("y2","1");
    [[0,"rgba(0,0,0,0)"],[0.05,"#000"],[0.88,"#000"],[1,"rgba(0,0,0,0)"]].forEach(([o,c])=>{
      const s = document.createElementNS("http://www.w3.org/2000/svg","stop");
      s.setAttribute("offset", (parseFloat(o as string)*100)+"%");
      s.setAttribute("stop-color", c as string);
      mg.appendChild(s);
    });
    defs.appendChild(mg);

    const mask = document.createElementNS("http://www.w3.org/2000/svg","mask");
    mask.setAttribute("id","fm2");
    const mr = document.createElementNS("http://www.w3.org/2000/svg","rect");
    mr.setAttribute("x","-200"); mr.setAttribute("width", "600"); mr.setAttribute("height", String(H));
    mr.setAttribute("fill","url(#mg2)");
    mask.appendChild(mr);
    defs.appendChild(mask);
    svg.appendChild(defs);

    const g = document.createElementNS("http://www.w3.org/2000/svg","g");
    g.setAttribute("mask","url(#fm2)");
    svg.appendChild(g);

    // 3 ribbons — narrower halfwidths: 52, 38, 28
    const configs = [
      { hw: 52, wave: 0.10, phase: 0,   sheenHw: 11 },
      { hw: 38, wave: 0.10, phase: 1.1, sheenHw: 8  },
      { hw: 28, wave: 0.10, phase: 2.3, sheenHw: 6  },
    ];

    configs.forEach(() => {
      const fill = document.createElementNS("http://www.w3.org/2000/svg","path");
      fill.setAttribute("fill","url(#rg2)");
      g.appendChild(fill);
      const sheen = document.createElementNS("http://www.w3.org/2000/svg","path");
      sheen.setAttribute("fill","url(#sg2)");
      sheen.setAttribute("opacity","0.75");
      g.appendChild(sheen);
      groups.push({ fill, sheen });
    });

    const buildPath = (hw: number, wave: number, phase: number, sheenHw: number): [string, string] => {
      const spine = Array.from({length: N+1}, (_, i) => {
        const n = i / N;
        // Diagonal: start right of center at top (x≈260), drift left to x≈40 at bottom
        const diag = W * (0.82 - n * 0.75);
        const w = Math.sin(n * Math.PI * 2.4 + t * 0.25 + phase) * W * wave;
        return { x: diag + w, y: n * H };
      });

      const L: {x:number,y:number}[] = [];
      const R: {x:number,y:number}[] = [];
      const SH: {x:number,y:number}[] = [];

      for (let i = 0; i <= N; i++) {
        const a = spine[Math.max(0,i-1)], b = spine[Math.min(N,i+1)];
        const dx = b.x-a.x, dy = b.y-a.y;
        const len = Math.sqrt(dx*dx+dy*dy)||1;
        const nx = -dy/len, ny = dx/len;
        L.push({x: spine[i].x + nx*hw,      y: spine[i].y + ny*hw});
        R.push({x: spine[i].x - nx*hw,      y: spine[i].y - ny*hw});
        SH.push({x: spine[i].x + nx*sheenHw, y: spine[i].y + ny*sheenHw});
      }

      const pts2path = (arr:{x:number,y:number}[], start='M') =>
        arr.map((p,i) => `${i===0?start:'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('');

      return [
        pts2path(L) + pts2path([...R].reverse(), 'L') + 'Z',
        pts2path(L) + pts2path([...SH].reverse(), 'L') + 'Z',
      ];
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
    <svg
      ref={svgRef}
      viewBox="0 0 320 900"
      style={{ width: "100%", height: "100%", overflow: "visible" }}
      preserveAspectRatio="xMaxYMin meet"
    />
  );
}


export default function HomePage() {

  return (
    <>
    <main className="bg-[#f6f7fb] text-black" style={{ position: "relative" }}>

      {/* HERO */}
      <section className="bg-white" style={{overflow:"visible"}}>

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

              <div className="mt-12 -mx-6 lg:-mx-0">
                <BrainCard />
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
    <div className="pointer-events-none fixed right-0 top-0 hidden lg:block" style={{ zIndex: 9999, width: 320, height: "100vh" }}>
      <HeroRibbon />
    </div>
    </>
  );
}
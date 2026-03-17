"use client";

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

function HeroTornadoObject() {
  // Animated 3D-style purple tornado using layered SVG ribbons
  const ribbons = [
    { delay: 0,    dur: 8,  xOff: 0,   scaleX: 1.0, opacity: 0.95, blur: 0 },
    { delay: 0.8,  dur: 9,  xOff: 6,   scaleX: 0.85, opacity: 0.80, blur: 0.5 },
    { delay: 1.6,  dur: 10, xOff: -6,  scaleX: 0.70, opacity: 0.70, blur: 1 },
    { delay: 2.4,  dur: 11, xOff: 10,  scaleX: 0.55, opacity: 0.55, blur: 1.5 },
    { delay: 3.2,  dur: 12, xOff: -10, scaleX: 0.40, opacity: 0.40, blur: 2 },
  ];

  return (
    <div
      className="pointer-events-none absolute right-[-80px] top-1/2 hidden -translate-y-1/2 lg:block"
      style={{ width: 340, height: 900, zIndex: 20 }}
    >
      {/* ambient glow behind tornado */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(99,91,255,0.22) 0%, rgba(140,120,255,0.10) 50%, transparent 80%)",
          filter: "blur(24px)",
        }}
      />

      {ribbons.map((r, i) => (
        <motion.div
          key={i}
          animate={{
            scaleX: [r.scaleX, r.scaleX * 1.12, r.scaleX],
            x: [r.xOff, -r.xOff, r.xOff],
            rotate: [i % 2 === 0 ? 2 : -2, i % 2 === 0 ? -2 : 2, i % 2 === 0 ? 2 : -2],
          }}
          transition={{
            duration: r.dur,
            delay: r.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            width: "100%",
            height: "100%",
            translateX: "-50%",
            transformOrigin: "50% 85%",
            opacity: r.opacity,
            filter: `blur(${r.blur}px)`,
          }}
        >
          <svg
            viewBox="0 0 340 900"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", height: "100%", overflow: "visible" }}
          >
            <defs>
              <linearGradient id={`tg${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="rgba(255,255,255,0)" />
                <stop offset="8%"   stopColor={`rgba(${180 - i*20},${160 - i*15},255,0.25)`} />
                <stop offset="22%"  stopColor={`rgba(${99 + i*8},${80 + i*6},255,${0.98 - i*0.08})`} />
                <stop offset="38%"  stopColor="rgba(230,220,255,0.85)" />
                <stop offset="50%"  stopColor={`rgba(${90 + i*10},${65 + i*8},255,${0.99 - i*0.06})`} />
                <stop offset="65%"  stopColor="rgba(210,200,255,0.80)" />
                <stop offset="78%"  stopColor={`rgba(${105 + i*8},${82 + i*7},255,${0.94 - i*0.07})`} />
                <stop offset="90%"  stopColor={`rgba(${190 - i*18},${175 - i*14},255,0.28)`} />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
              {/* sheen highlight overlay */}
              <linearGradient id={`sh${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="rgba(255,255,255,0)" />
                <stop offset="15%"  stopColor="rgba(255,255,255,0.70)" />
                <stop offset="28%"  stopColor="rgba(255,255,255,0.05)" />
                <stop offset="48%"  stopColor="rgba(255,255,255,0.82)" />
                <stop offset="64%"  stopColor="rgba(255,255,255,0.04)" />
                <stop offset="84%"  stopColor="rgba(255,255,255,0.68)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>

            {/* tornado body — wide at top, narrow at bottom */}
            <path
              d={`
                M ${170 - 110 + i*16} 0
                C ${170 - 120 + i*14} 80, ${170 + 120 - i*14} 120, ${170 + 110 - i*16} 180
                C ${170 + 130 - i*12} 280, ${170 - 90 + i*12} 320, ${170 - 75 + i*10} 420
                C ${170 - 90 + i*10} 520, ${170 + 80 - i*10} 560, ${170 + 65 - i*10} 660
                C ${170 + 50 - i*8}  750, ${170 - 40 + i*8}  800, ${170 - 20 + i*4}  900
                L ${170 + 20 - i*4}  900
                C ${170 + 40 - i*8}  800, ${170 - 50 + i*8}  750, ${170 - 65 + i*10} 660
                C ${170 - 80 + i*10} 560, ${170 + 90 - i*10} 520, ${170 + 75 - i*10} 420
                C ${170 + 90 - i*12} 320, ${170 - 130 + i*12} 280, ${170 - 110 + i*16} 180
                C ${170 - 120 + i*14} 120, ${170 + 120 - i*14} 80, ${170 + 110 - i*16} 0
                Z
              `}
              fill={`url(#tg${i})`}
              style={{
                filter: `drop-shadow(0 0 ${20 - i*3}px rgba(99,91,255,${0.35 - i*0.04}))`,
              }}
            />

            {/* sheen highlight strip */}
            <path
              d={`
                M ${170 - 18 + i*8} 0
                C ${170 - 20 + i*6} 80, ${170 + 24 - i*6} 130, ${170 + 18 - i*8} 190
                C ${170 + 28 - i*6} 290, ${170 - 18 + i*6} 330, ${170 - 14 + i*5} 430
                C ${170 - 18 + i*5} 530, ${170 + 16 - i*5} 570, ${170 + 12 - i*5} 670
                C ${170 + 10 - i*4} 760, ${170 - 8 + i*3}  810, ${170 - 4 + i*2}  900
                L ${170 + 8 - i*2}  900
                C ${170 + 10 - i*3} 810, ${170 - 12 + i*4} 760, ${170 - 14 + i*5} 670
                C ${170 - 18 + i*5} 570, ${170 + 20 - i*5} 530, ${170 + 16 - i*5} 430
                C ${170 + 22 - i*6} 330, ${170 - 24 + i*6} 290, ${170 - 20 + i*8} 190
                C ${170 - 26 + i*6} 130, ${170 + 24 - i*6} 80, ${170 + 20 - i*8} 0
                Z
              `}
              fill={`url(#sh${i})`}
              opacity={0.6 - i * 0.08}
            />
          </svg>
        </motion.div>
      ))}

      {/* pixel shimmer dots */}
      {[...Array(18)].map((_, i) => (
        <motion.div
          key={`px${i}`}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.4, 0.5],
          }}
          transition={{
            duration: 2.5 + (i % 4) * 0.8,
            delay: (i * 0.37) % 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            left: `${15 + (i % 7) * 12}%`,
            top: `${5 + Math.floor(i / 7) * 30 + (i % 3) * 8}%`,
            width: i % 3 === 0 ? 4 : 2,
            height: i % 3 === 0 ? 4 : 2,
            borderRadius: 1,
            background: `rgba(${180 + (i % 3) * 25},${160 + (i % 4) * 15},255,0.9)`,
            boxShadow: `0 0 ${6 + (i % 3) * 4}px rgba(99,91,255,0.8)`,
          }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="bg-[#f6f7fb] text-black">
      {/* HERO */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-y-0 right-0 hidden w-[46%] bg-[#f5f6fb] lg:block" />

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
              className="relative min-h-[760px] overflow-visible"
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

                <div className="-mt-16 ml-12 max-w-[920px] overflow-hidden rounded-[22px] shadow-[0_18px_60px_rgba(15,23,42,0.08)] lg:ml-20">
                  <Image
                    src="/project.png"
                    alt="RiskBases project overview"
                    width={1500}
                    height={900}
                    className="h-auto w-full object-cover"
                  />
                </div>
              </div>

              <HeroTornadoObject />
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
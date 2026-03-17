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

function HeroRibbonObject() {
  // Three smooth flowing silk ribbons like the Stripe reference — wide sweeping curves, full height
  return (
    <div
      className="pointer-events-none absolute right-[-180px] top-1/2 hidden -translate-y-1/2 lg:block"
      style={{ width: 420, height: 960, zIndex: 20 }}
    >
      {/* soft ambient glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 40% 50%, rgba(99,91,255,0.18) 0%, rgba(130,110,255,0.08) 55%, transparent 80%)",
          filter: "blur(32px)",
        }}
      />

      {/* RIBBON 1 — back, wide, slow */}
      <motion.div
        animate={{ rotate: [3, -3, 3], scaleX: [1, 1.04, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", inset: 0, transformOrigin: "50% 50%" }}
      >
        <svg viewBox="0 0 420 960" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", overflow: "visible" }}>
          <defs>
            <linearGradient id="r1g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="rgba(255,255,255,0)" />
              <stop offset="10%"  stopColor="rgba(160,140,255,0.20)" />
              <stop offset="28%"  stopColor="rgba(99,91,255,0.88)" />
              <stop offset="46%"  stopColor="rgba(220,210,255,0.75)" />
              <stop offset="62%"  stopColor="rgba(85,75,255,0.92)" />
              <stop offset="80%"  stopColor="rgba(180,165,255,0.30)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          {/* wide flowing S-curve ribbon */}
          <path
            d="M 60 0 C 20 120, 360 200, 340 380 C 320 560, 60 620, 80 800 C 95 900, 200 940, 220 960 L 280 960 C 260 940, 160 900, 150 800 C 130 620, 390 560, 370 380 C 350 200, 10 120, 50 0 Z"
            fill="url(#r1g)"
            style={{ filter: "drop-shadow(0 0 28px rgba(99,91,255,0.30))" }}
          />
          {/* sheen highlight on ribbon 1 */}
          <path
            d="M 175 0 C 155 120, 250 200, 238 380 C 226 560, 155 620, 165 800 C 170 900, 200 940, 210 960 L 230 960 C 222 940, 194 900, 190 800 C 180 620, 252 560, 264 380 C 276 200, 182 120, 200 0 Z"
            fill="rgba(255,255,255,0.55)"
          />
        </svg>
      </motion.div>

      {/* RIBBON 2 — middle, offset phase */}
      <motion.div
        animate={{ rotate: [-4, 4, -4], scaleX: [0.88, 0.94, 0.88] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        style={{ position: "absolute", inset: 0, transformOrigin: "50% 50%" }}
      >
        <svg viewBox="0 0 420 960" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", overflow: "visible" }}>
          <defs>
            <linearGradient id="r2g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="rgba(255,255,255,0)" />
              <stop offset="12%"  stopColor="rgba(140,125,255,0.18)" />
              <stop offset="30%"  stopColor="rgba(108,98,255,0.82)" />
              <stop offset="50%"  stopColor="rgba(240,235,255,0.80)" />
              <stop offset="68%"  stopColor="rgba(95,82,255,0.86)" />
              <stop offset="85%"  stopColor="rgba(195,182,255,0.25)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          <path
            d="M 110 0 C 300 80, 80 260, 120 420 C 160 580, 360 640, 320 800 C 300 900, 200 940, 185 960 L 240 960 C 258 940, 355 900, 375 800 C 415 640, 210 580, 170 420 C 130 260, 355 80, 165 0 Z"
            fill="url(#r2g)"
            style={{ filter: "drop-shadow(0 0 20px rgba(99,91,255,0.22))" }}
            opacity={0.9}
          />
          <path
            d="M 200 0 C 260 80, 170 260, 195 420 C 220 580, 280 640, 258 800 C 248 900, 215 940, 210 960 L 228 960 C 234 940, 262 900, 272 800 C 294 640, 234 580, 210 420 C 186 260, 278 80, 218 0 Z"
            fill="rgba(255,255,255,0.50)"
          />
        </svg>
      </motion.div>

      {/* RIBBON 3 — front, narrower, fastest */}
      <motion.div
        animate={{ rotate: [5, -2, 5], scaleX: [0.72, 0.80, 0.72] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
        style={{ position: "absolute", inset: 0, transformOrigin: "50% 50%" }}
      >
        <svg viewBox="0 0 420 960" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", overflow: "visible" }}>
          <defs>
            <linearGradient id="r3g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="rgba(255,255,255,0)" />
              <stop offset="15%"  stopColor="rgba(170,155,255,0.22)" />
              <stop offset="32%"  stopColor="rgba(115,105,255,0.78)" />
              <stop offset="52%"  stopColor="rgba(235,230,255,0.82)" />
              <stop offset="70%"  stopColor="rgba(102,90,255,0.80)" />
              <stop offset="87%"  stopColor="rgba(200,190,255,0.22)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          <path
            d="M 150 0 C 360 100, 50 300, 100 460 C 150 620, 380 660, 340 820 C 320 910, 210 945, 195 960 L 245 960 C 262 945, 368 910, 388 820 C 428 660, 198 620, 148 460 C 98 300, 408 100, 198 0 Z"
            fill="url(#r3g)"
            style={{ filter: "drop-shadow(0 0 14px rgba(99,91,255,0.18))" }}
            opacity={0.82}
          />
          <path
            d="M 210 0 C 290 100, 165 300, 185 460 C 205 620, 295 660, 275 820 C 265 910, 220 945, 215 960 L 230 960 C 236 945, 280 910, 290 820 C 310 660, 220 620, 200 460 C 180 300, 306 100, 226 0 Z"
            fill="rgba(255,255,255,0.45)"
          />
        </svg>
      </motion.div>

      {/* pixel shimmer dots */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`px${i}`}
          animate={{ opacity: [0, 0.9, 0], scale: [0.6, 1.3, 0.6] }}
          transition={{
            duration: 2.2 + (i % 4) * 0.7,
            delay: (i * 0.41) % 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            left: `${18 + (i % 5) * 16}%`,
            top: `${8 + Math.floor(i / 4) * 32 + (i % 3) * 5}%`,
            width: i % 3 === 0 ? 3 : 2,
            height: i % 3 === 0 ? 3 : 2,
            borderRadius: 1,
            background: `rgba(180,165,255,0.95)`,
            boxShadow: `0 0 ${5 + (i % 3) * 4}px rgba(99,91,255,0.85)`,
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

              <HeroRibbonObject />
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
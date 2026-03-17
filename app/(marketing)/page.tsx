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
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.75,
      ease: "easeOut",
    },
  },
};

const fadeRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.75,
      ease: "easeOut",
    },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
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

function HeroTornado() {
  return (
    <div className="pointer-events-none absolute right-[-4%] top-[-4%] hidden h-[760px] w-[440px] lg:block">
      <motion.div
        animate={{ rotate: [8, 14, 8], y: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0"
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute left-[16%] top-[2%] h-[94%] w-[70%]"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="absolute left-1/2 top-1/2 h-[118%] w-[90px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[linear-gradient(180deg,rgba(128,92,255,0.00)_0%,rgba(128,92,255,0.96)_14%,rgba(97,70,255,0.95)_30%,rgba(190,171,255,0.78)_48%,rgba(103,78,255,0.96)_66%,rgba(134,97,255,0.92)_82%,rgba(128,92,255,0.00)_100%)] blur-[0.5px] opacity-90"
            style={{
              transform:
                "translate(-50%, -50%) rotate(22deg) skewY(8deg)",
              boxShadow:
                "0 0 40px rgba(99,91,255,0.22), 0 0 120px rgba(99,91,255,0.18)",
            }}
          />
          <div className="absolute left-1/2 top-1/2 h-[108%] w-[64px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.52)_12%,rgba(255,255,255,0.12)_26%,rgba(255,255,255,0.65)_48%,rgba(255,255,255,0.15)_68%,rgba(255,255,255,0.52)_86%,rgba(255,255,255,0)_100%)] opacity-80 blur-[1px]"
            style={{
              transform:
                "translate(-50%, -50%) rotate(22deg) skewY(8deg)",
            }}
          />
        </motion.div>

        <motion.div
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          className="absolute left-[8%] top-[6%] h-[88%] w-[74%]"
        >
          <div className="absolute left-1/2 top-1/2 h-[112%] w-[72px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(157,132,255,0.0)_10%,rgba(124,88,255,0.82)_28%,rgba(201,189,255,0.78)_52%,rgba(112,81,255,0.88)_74%,rgba(255,255,255,0)_100%)] opacity-80 blur-[0.5px]"
            style={{
              transform:
                "translate(-50%, -50%) rotate(-18deg) skewY(-10deg)",
              boxShadow:
                "0 0 30px rgba(124,88,255,0.18), 0 0 100px rgba(124,88,255,0.12)",
            }}
          />
        </motion.div>

        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          className="absolute left-[18%] top-[10%] h-[80%] w-[58%]"
        >
          <div className="absolute left-1/2 top-1/2 h-[100%] w-[38px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(240,235,255,0.66)_18%,rgba(255,255,255,0.1)_50%,rgba(240,235,255,0.72)_82%,rgba(255,255,255,0)_100%)] opacity-90 blur-[1px]"
            style={{
              transform:
                "translate(-50%, -50%) rotate(14deg) skewY(6deg)",
            }}
          />
        </motion.div>

        <div className="absolute right-[18%] top-[16%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(99,91,255,0.20)_0%,rgba(99,91,255,0.10)_26%,rgba(99,91,255,0.05)_44%,rgba(255,255,255,0)_72%)] blur-2xl" />
      </motion.div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="bg-[#f6f7fb] text-black">
      {/* HERO */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-[#f5f6fb] lg:block" />

        <div className="mx-auto max-w-[1440px] px-6 pb-20 pt-20 lg:px-10 lg:pb-24 lg:pt-24">
          <div className="grid items-center gap-16 lg:grid-cols-[0.92fr_1.08fr]">
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
              className="relative min-h-[620px]"
            >
              <HeroTornado />

              <div className="relative z-10">
                <div className="ml-auto max-w-[820px] overflow-hidden rounded-[24px] shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                  <Image
                    src="/workspace.png"
                    alt="RiskBases workspace overview"
                    width={1600}
                    height={1000}
                    className="h-auto w-full object-cover"
                    priority
                  />
                </div>

                <div className="-mt-12 ml-10 max-w-[760px] overflow-hidden rounded-[22px] shadow-[0_18px_60px_rgba(15,23,42,0.08)] lg:ml-16">
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
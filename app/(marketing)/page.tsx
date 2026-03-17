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
  return (
    <div className="pointer-events-none absolute right-[-220px] top-1/2 hidden h-[820px] w-[640px] -translate-y-1/2 lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_50%,rgba(99,91,255,0.16)_0%,rgba(99,91,255,0.08)_24%,rgba(255,255,255,0)_68%)] blur-3xl" />

      {/* wide back ribbon */}
      <motion.div
        animate={{ rotate: [26, 32, 26], y: [0, -10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[28%] top-[6%] h-[88%] w-[220px]"
      >
        <div
          className="absolute inset-0 opacity-80 blur-[0.5px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(213,203,255,0.24) 8%, rgba(118,94,255,0.90) 26%, rgba(241,236,255,0.80) 48%, rgba(120,95,255,0.94) 68%, rgba(207,198,255,0.26) 88%, rgba(255,255,255,0) 100%)",
            clipPath:
              "polygon(20% 0%, 66% 0%, 100% 14%, 78% 36%, 54% 50%, 80% 68%, 100% 86%, 70% 100%, 24% 100%, 0% 88%, 14% 66%, 38% 48%, 12% 24%, 0% 10%)",
            transform: "rotate(18deg) skewY(4deg)",
            borderRadius: "999px",
            boxShadow:
              "0 0 36px rgba(99,91,255,0.14), 0 0 120px rgba(99,91,255,0.10)",
          }}
        />
      </motion.div>

      {/* main front ribbon */}
      <motion.div
        animate={{ rotate: [8, 14, 8], y: [0, 8, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[43%] top-[0%] h-[100%] w-[170px]"
      >
        <div
          className="absolute inset-0 opacity-96 blur-[0.35px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(196,184,255,0.28) 8%, rgba(110,84,255,0.98) 22%, rgba(255,255,255,0.88) 40%, rgba(105,79,255,0.99) 58%, rgba(230,224,255,0.60) 80%, rgba(255,255,255,0) 100%)",
            clipPath:
              "polygon(26% 0%, 72% 0%, 100% 12%, 86% 28%, 62% 50%, 86% 73%, 100% 88%, 72% 100%, 26% 100%, 0% 86%, 14% 68%, 40% 48%, 14% 24%, 0% 10%)",
            transform: "rotate(10deg) skewY(2deg)",
            borderRadius: "999px",
            boxShadow:
              "0 0 40px rgba(99,91,255,0.18), 0 0 160px rgba(99,91,255,0.14)",
          }}
        />
      </motion.div>

      {/* glossy highlight */}
      <motion.div
        animate={{ rotate: [10, 15, 10], y: [0, -6, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[49%] top-[2%] h-[96%] w-[88px]"
      >
        <div
          className="absolute inset-0 opacity-95 blur-[0.2px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.86) 14%, rgba(255,255,255,0.14) 28%, rgba(255,255,255,0.98) 48%, rgba(255,255,255,0.18) 66%, rgba(255,255,255,0.82) 86%, rgba(255,255,255,0) 100%)",
            clipPath:
              "polygon(34% 0%, 70% 0%, 100% 14%, 82% 34%, 58% 50%, 82% 67%, 100% 86%, 68% 100%, 34% 100%, 0% 86%, 18% 66%, 42% 48%, 18% 28%, 0% 12%)",
            transform: "rotate(9deg) skewY(2deg)",
            borderRadius: "999px",
          }}
        />
      </motion.div>

      {/* far side ribbon */}
      <motion.div
        animate={{ rotate: [-14, -20, -14], y: [0, 10, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[58%] top-[10%] h-[84%] w-[150px]"
      >
        <div
          className="absolute inset-0 opacity-78 blur-[0.4px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(228,220,255,0.20) 12%, rgba(139,115,255,0.84) 34%, rgba(244,240,255,0.76) 54%, rgba(128,103,255,0.86) 74%, rgba(255,255,255,0) 100%)",
            clipPath:
              "polygon(24% 0%, 66% 0%, 100% 16%, 78% 38%, 56% 52%, 80% 68%, 100% 86%, 68% 100%, 24% 100%, 0% 86%, 20% 64%, 42% 48%, 18% 28%, 0% 10%)",
            transform: "rotate(-14deg) skewY(-6deg)",
            borderRadius: "999px",
          }}
        />
      </motion.div>
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
              className="relative min-h-[760px] overflow-visible pr-[320px]"
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
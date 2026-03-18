"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

function Reveal({
  children,
  direction = "up",
  delay = 0,
}: {
  children: React.ReactNode;
  direction?: "left" | "right" | "up";
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const hiddenX = direction === "left" ? -40 : direction === "right" ? 40 : 0;
  const hiddenY = direction === "up" ? 28 : 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: hiddenX, y: hiddenY }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, x: hiddenX, y: hiddenY }
      }
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f3f4f6] text-black">
      <section className="mx-auto max-w-[1200px] px-6 pb-24 pt-16 md:px-8 md:pt-20">

        {/* HERO */}
        <div className="max-w-[900px]">
          <Reveal>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em]">
              Company
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="text-4xl font-semibold leading-[1] tracking-[-0.05em] md:text-[64px]">
              Built for teams that want
              <br />
              better control over project risk.
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-[700px] text-[18px] leading-8">
              RiskBases is a modern risk management platform designed to help
              teams centralize risks, align stakeholders and improve control
              across complex projects.
            </p>
          </Reveal>
        </div>

        {/* GRID */}
        <div className="mt-12 grid gap-6 lg:grid-cols-2">

          {/* MISSION */}
          <Reveal direction="left">
            <div className="rounded-[24px] border border-black/10 bg-white p-8">
              <h2 className="text-[28px] font-semibold">Mission</h2>
              <p className="mt-4 text-[16px] leading-7">
                Our mission is to make project risk management structured,
                understandable and actionable for every team. We eliminate
                fragmented workflows and bring risks, actions and ownership
                together in one system.
              </p>
            </div>
          </Reveal>

          {/* VISION */}
          <Reveal direction="right">
            <div className="rounded-[24px] border border-black/10 bg-white p-8">
              <h2 className="text-[28px] font-semibold">Vision</h2>
              <p className="mt-4 text-[16px] leading-7">
                We believe every project team should operate with full clarity
                over risks. In the future, risk management will not be an
                afterthought, but a core part of how projects are executed and
                decisions are made.
              </p>
            </div>
          </Reveal>

          {/* STRATEGY */}
          <Reveal direction="left" delay={0.05}>
            <div className="rounded-[24px] border border-black/10 bg-white p-8">
              <h2 className="text-[28px] font-semibold">Strategy</h2>
              <p className="mt-4 text-[16px] leading-7">
                RiskBases focuses on simplicity, structure and scalability. We
                build tools that are powerful enough for enterprise environments,
                but intuitive enough for teams to actually use daily.
              </p>
              <p className="mt-4 text-[16px] leading-7">
                Our approach combines structured workflows, real-time visibility
                and data-driven insights to help teams reduce uncertainty and
                improve execution.
              </p>
            </div>
          </Reveal>

          {/* VALUES */}
          <Reveal direction="right" delay={0.05}>
            <div className="rounded-[24px] border border-black/10 bg-white p-8">
              <h2 className="text-[28px] font-semibold">Values</h2>
              <p className="mt-4 text-[16px] leading-7">
                We value clarity, ownership and simplicity. Software should not
                add complexity — it should remove it.
              </p>
              <p className="mt-4 text-[16px] leading-7">
                Every feature we build is focused on helping teams make better
                decisions, faster, with less friction.
              </p>
            </div>
          </Reveal>
        </div>

        {/* TEAM */}
        <div className="mt-16">
          <Reveal>
            <h2 className="text-[42px] font-semibold tracking-[-0.04em]">
              The team
            </h2>
          </Reveal>

          <div className="mt-8 grid gap-6 md:grid-cols-2">

            {/* JASPER */}
            <Reveal direction="left">
              <div className="rounded-[24px] border border-black/10 bg-white p-8">
                <h3 className="text-[24px] font-semibold">
                  Jasper Kraamwinkel
                </h3>
                <p className="mt-2 text-[14px] uppercase tracking-wide text-black/60">
                  CEO & Co-Founder
                </p>

                <p className="mt-4 text-[16px] leading-7">
                  Jasper leads the commercial and strategic direction of
                  RiskBases. He focuses on market positioning, customer
                  relationships and scaling the platform across industries.
                </p>

                <a
                  href="mailto:jasper@riskbases.com"
                  className="mt-5 inline-block text-[15px] font-medium underline"
                >
                  jasper@riskbases.com
                </a>
              </div>
            </Reveal>

            {/* RALPH */}
            <Reveal direction="right">
              <div className="rounded-[24px] border border-black/10 bg-white p-8">
                <h3 className="text-[24px] font-semibold">
                  Ralph Kruik
                </h3>
                <p className="mt-2 text-[14px] uppercase tracking-wide text-black/60">
                  CTO & Co-Founder
                </p>

                <p className="mt-4 text-[16px] leading-7">
                  Ralph leads product and technology at RiskBases. He is
                  responsible for platform architecture, user experience and the
                  development of scalable risk management workflows.
                </p>

                <a
                  href="mailto:ralph@riskbases.com"
                  className="mt-5 inline-block text-[15px] font-medium underline"
                >
                  ralph@riskbases.com
                </a>
              </div>
            </Reveal>

          </div>
        </div>

        {/* CTA */}
        <Reveal delay={0.15}>
          <div className="mt-16 rounded-[24px] border border-black/10 bg-white px-8 py-12 text-center">
            <h3 className="text-[36px] font-semibold tracking-[-0.04em]">
              Work with RiskBases
            </h3>
            <p className="mt-4 text-[18px] leading-8">
              Build better control over your projects with structured risk
              management.
            </p>

            <Link
              href="/book-a-demo"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-[14px] bg-black px-8 text-[16px] font-semibold text-white"
            >
              Book a demo
            </Link>
          </div>
        </Reveal>

      </section>
    </main>
  );
}
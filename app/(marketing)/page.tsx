"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeRight: Variants = {
  hidden: { opacity: 0, x: 28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const marqueeItems = [
  "Centralized risk workflows",
  "Clear action ownership",
  "Stakeholder-ready reporting",
  "Project visibility",
  "Live monitoring",
  "Structured workflows",
  "Portfolio control",
  "Risk identification",
];

const valueCards = [
  {
    title: "One clear system",
    text: "Bring risks, actions, stakeholders and reporting together in one structured environment.",
  },
  {
    title: "Better oversight",
    text: "Keep project teams aligned with clearer ownership, cleaner follow-up and less fragmentation.",
  },
  {
    title: "Real control",
    text: "See critical risks, overdue actions and project movement before issues become harder to manage.",
  },
];

const industries = [
  {
    number: "01",
    title: "Construction",
    text: "Track site risks, contractor issues and delivery concerns in one structured workflow.",
  },
  {
    number: "02",
    title: "Infrastructure",
    text: "Manage long-cycle project risks across stakeholders, phases and decision moments.",
  },
  {
    number: "03",
    title: "Maritime & offshore",
    text: "Keep operational, technical and compliance risk visible across complex projects.",
  },
  {
    number: "04",
    title: "Manufacturing",
    text: "Standardize risk workflows across facilities, teams and improvement programs.",
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Create your workspace",
    text: "Start with a structured environment for teams, projects and risk management flows.",
  },
  {
    step: "02",
    title: "Capture the risks",
    text: "Register risks consistently with categories, scoring and project context.",
  },
  {
    step: "03",
    title: "Assign actions",
    text: "Turn risk into execution with owners, deadlines and visible accountability.",
  },
  {
    step: "04",
    title: "Monitor and report",
    text: "Track movement, follow-up and status with cleaner reporting for stakeholders.",
  },
];

const metrics = [
  { value: "1", label: "central platform for risks, actions and reporting" },
  { value: "24/7", label: "visibility across project status and follow-up" },
  { value: "100%", label: "clearer ownership across teams and stakeholders" },
];

function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-full bg-black px-6 py-3 text-[15px] font-semibold text-white transition duration-200 hover:-translate-y-[1px] hover:bg-neutral-800"
    >
      {children}
      <ArrowRight className="ml-2 h-4 w-4" />
    </Link>
  );
}

function SecondaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-full border border-black/15 bg-white px-6 py-3 text-[15px] font-semibold text-black transition duration-200 hover:border-black"
    >
      {children}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-black">
      {children}
    </div>
  );
}

function MarqueeRow() {
  const items = [...marqueeItems, ...marqueeItems, ...marqueeItems];

  return (
    <div className="relative w-full overflow-hidden border-y border-black/10 bg-[#ececec] py-4">
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-[#ececec] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-[#ececec] to-transparent" />

      <div className="marquee-track flex w-max min-w-full items-center gap-0">
        {items.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="flex shrink-0 items-center gap-4 whitespace-nowrap px-6"
          >
            <span className="text-[15px] font-medium text-black">{item}</span>
            <span className="h-[5px] w-[5px] rounded-full bg-black" />
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroOrb() {
  return (
    <div className="relative h-[180px] w-[180px] sm:h-[220px] sm:w-[220px]">
      <motion.div
        animate={{
          scale: [1, 1.06, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-[-20px] rounded-full bg-[#6f5bff]/30 blur-[45px]"
      />
      <motion.div
        animate={{
          y: [0, -10, 0, 10, 0],
          rotate: [0, 6, 0, -6, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 rounded-[34px] bg-[linear-gradient(135deg,#9b8cff_0%,#6f5bff_50%,#4d36ff_100%)] shadow-[0_32px_90px_rgba(111,91,255,0.42)]"
      >
        <div className="absolute inset-0 rounded-[34px] opacity-35 [background-image:radial-gradient(rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:12px_12px]" />
        <div className="absolute left-4 top-4 h-2.5 w-2.5 rounded-full bg-white/80" />
        <div className="absolute right-5 top-6 h-2 w-2 rounded-full bg-white/70" />
        <div className="absolute bottom-5 left-5 h-2 w-2 rounded-full bg-white/70" />
      </motion.div>
    </div>
  );
}

function FloatingMiniShape() {
  return (
    <div className="relative h-[150px] w-[150px] md:h-[180px] md:w-[180px]">
      <motion.div
        animate={{
          y: [0, -8, 0, 8, 0],
          rotate: [0, -7, 0, 7, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 rounded-[30px] bg-[linear-gradient(135deg,#8f7bff_0%,#6f5bff_50%,#4d36ff_100%)] shadow-[0_24px_70px_rgba(111,91,255,0.35)]"
      >
        <div className="absolute inset-0 rounded-[30px] opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.45)_1px,transparent_1px)] [background-size:12px_12px]" />
      </motion.div>
    </div>
  );
}

function InfoCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-[28px] border border-black/10 bg-white p-7 shadow-[0_24px_70px_rgba(0,0,0,0.04)]"
    >
      <h3 className="text-[24px] font-semibold tracking-[-0.04em] text-black">
        {title}
      </h3>
      <p className="mt-4 text-[18px] leading-8 text-black">{text}</p>
    </motion.div>
  );
}

function TiltImageCard({
  src,
  alt,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className={`overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.06)] ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        width={1800}
        height={1200}
        priority={priority}
        className="h-auto w-full object-cover"
      />
    </motion.div>
  );
}

function DotList({ items }: { items: string[] }) {
  return (
    <div className="mt-8 space-y-4">
      {items.map((item) => (
        <div
          key={item}
          className="flex items-start gap-4 border-t border-black/10 pt-4"
        >
          <div className="mt-[10px] h-[7px] w-[7px] rounded-full bg-black" />
          <p className="text-[18px] leading-8 text-black">{item}</p>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="bg-[#ececec] text-black">
      <style jsx global>{`
        .marquee-track {
          animation: marqueeMove 34s linear infinite;
          will-change: transform;
        }

        @keyframes marqueeMove {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-33.333%, 0, 0);
          }
        }
      `}</style>

      {/* HERO */}
      <section className="bg-[#ececec]">
        <div className="mx-auto max-w-[1320px] px-6 pb-10 pt-20 lg:px-8 lg:pb-14 lg:pt-24">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-[1040px] text-center"
          >
            <motion.h1
              variants={fadeUp}
              className="mx-auto max-w-[1040px] text-[46px] font-semibold leading-[0.94] tracking-[-0.065em] text-black sm:text-[68px] lg:text-[88px]"
            >
              Risk management
              <br />
              for teams that want
              <br />
              more clarity and
              <br />
              control.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-8 max-w-[780px] text-[20px] leading-9 text-black"
            >
              RiskBases helps project teams identify, assess, track and reduce
              risk in one clean platform. Structured workflows, clear ownership
              and better visibility from start to finish.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <PrimaryButton href="/book-demo">Book a demo</PrimaryButton>
              <SecondaryButton href="/product">Explore product</SecondaryButton>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-[15px] font-medium text-black"
            >
              <span>Centralized risk workflows</span>
              <span className="h-[5px] w-[5px] rounded-full bg-black" />
              <span>Clear action ownership</span>
              <span className="h-[5px] w-[5px] rounded-full bg-black" />
              <span>Stakeholder-ready reporting</span>
            </motion.div>
          </motion.div>

          {/* BIG HERO VISUAL DIRECTLY UNDER TEXT */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto mt-14 max-w-[1220px]"
          >
            <div className="absolute -left-10 top-[12%] hidden lg:block">
              <HeroOrb />
            </div>

            <div className="absolute -right-4 bottom-[10%] hidden lg:block">
              <FloatingMiniShape />
            </div>

            <div className="relative overflow-hidden rounded-[38px] border border-black/10 bg-white p-4 shadow-[0_30px_100px_rgba(0,0,0,0.09)] md:p-5">
              <div className="relative overflow-hidden rounded-[30px]">
                <Image
                  src="/home-platform-overview.png"
                  alt="RiskBases platform overview"
                  width={2200}
                  height={1400}
                  priority
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/* SMALL METRICS UNDER HERO VISUAL */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mx-auto mt-10 grid max-w-[1120px] gap-4 md:grid-cols-3"
          >
            {metrics.map((metric) => (
              <motion.div
                key={metric.label}
                variants={fadeUp}
                className="rounded-[24px] border border-black/10 bg-white px-6 py-6 text-left shadow-[0_18px_50px_rgba(0,0,0,0.04)]"
              >
                <div className="text-[28px] font-semibold tracking-[-0.04em] text-black">
                  {metric.value}
                </div>
                <p className="mt-2 text-[16px] leading-7 text-black">
                  {metric.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <MarqueeRow />

      {/* PHOTO + MESSAGE */}
      <section className="bg-[#ececec]">
        <div className="mx-auto max-w-[1320px] px-6 py-16 lg:px-8 lg:py-20">
          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <TiltImageCard
              src="/fotorisk.png"
              alt="RiskBases project professional with construction context"
            />

            <div className="grid gap-5">
              <TiltImageCard
                src="/fotorisk2.png"
                alt="RiskBases office and construction collaboration"
              />

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                className="flex min-h-[220px] flex-col justify-between rounded-[30px] border border-black/10 bg-white p-8 shadow-[0_24px_70px_rgba(0,0,0,0.05)]"
              >
                <div>
                  <SectionLabel>Built for execution</SectionLabel>
                  <h3 className="mt-4 text-[30px] font-semibold leading-[1.02] tracking-[-0.04em] text-black">
                    Clear structure for real project environments.
                  </h3>
                  <p className="mt-4 text-[18px] leading-8 text-black">
                    From office teams to site coordination, RiskBases helps keep
                    risk visible, actionable and easier to manage.
                  </p>
                </div>

                <div className="mt-6">
                  <SecondaryButton href="/about">About us</SecondaryButton>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="bg-[#ececec]">
        <div className="mx-auto max-w-[1320px] px-6 py-16 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="max-w-[540px]"
            >
              <SectionLabel>Why RiskBases</SectionLabel>
              <h2 className="mt-5 text-[40px] font-semibold leading-[1.02] tracking-[-0.05em] text-black md:text-[60px]">
                A simpler and more professional way to manage project risk.
              </h2>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="grid gap-5 md:grid-cols-3"
            >
              {valueCards.map((card) => (
                <InfoCard key={card.title} title={card.title} text={card.text} />
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* PLATFORM DETAILS */}
      <section className="bg-[#ececec]">
        <div className="mx-auto max-w-[1320px] px-6 py-16 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="max-w-[560px]"
            >
              <SectionLabel>The platform</SectionLabel>
              <h2 className="mt-5 text-[40px] font-semibold leading-[1.02] tracking-[-0.05em] text-black md:text-[60px]">
                Designed to feel calm, structured and easy to work with.
              </h2>
              <p className="mt-6 text-[20px] leading-9 text-black">
                RiskBases connects identification, ownership, monitoring and
                reporting in one environment built for real project execution.
              </p>

              <DotList items={[
                "Centralized risk registers across projects and teams.",
                "Clear ownership with actions, deadlines and accountability.",
                "Live visibility into status, exposure and overdue follow-up.",
                "Reporting that feels structured, fast and stakeholder-ready.",
              ]} />

              <div className="mt-9">
                <PrimaryButton href="/product">See the product</PrimaryButton>
              </div>
            </motion.div>

            <div className="grid gap-5">
              <motion.div
                variants={fadeRight}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="rounded-[30px] border border-black/10 bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,0.06)]"
              >
                <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <SectionLabel>Visibility</SectionLabel>
                    <h3 className="mt-4 text-[30px] font-semibold leading-[1.02] tracking-[-0.04em] text-black">
                      Built to make risks and actions easier to follow.
                    </h3>
                    <p className="mt-4 text-[18px] leading-8 text-black">
                      Keep teams aligned with one system for identifying risks,
                      assigning mitigation and reporting project movement clearly.
                    </p>
                  </div>

                  <div className="flex justify-start md:justify-end">
                    <FloatingMiniShape />
                  </div>
                </div>
              </motion.div>

              <TiltImageCard
                src="/home-platform-overview.png"
                alt="RiskBases platform detail"
              />
            </div>
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="bg-[#ececec]">
        <div className="mx-auto max-w-[1320px] px-6 py-16 lg:px-8 lg:py-20">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="max-w-[760px]"
          >
            <SectionLabel>Industries</SectionLabel>
            <h2 className="mt-5 text-[40px] font-semibold leading-[1.02] tracking-[-0.05em] text-black md:text-[60px]">
              Flexible enough for multiple sectors. Structured enough for real control.
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4"
          >
            {industries.map((item) => (
              <motion.div
                key={item.number}
                variants={fadeUp}
                className="rounded-[28px] border border-black/10 bg-white p-7 shadow-[0_24px_70px_rgba(0,0,0,0.04)]"
              >
                <div className="text-[17px] font-semibold text-black">
                  {item.number}
                </div>
                <h3 className="mt-5 text-[27px] font-semibold tracking-[-0.04em] text-black">
                  {item.title}
                </h3>
                <p className="mt-4 text-[18px] leading-8 text-black">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[#ececec]">
        <div className="mx-auto max-w-[1320px] px-6 py-16 lg:px-8 lg:py-20">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="max-w-[760px]"
          >
            <SectionLabel>How it works</SectionLabel>
            <h2 className="mt-5 text-[40px] font-semibold leading-[1.02] tracking-[-0.05em] text-black md:text-[60px]">
              A clean flow from first signal to clear action.
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4"
          >
            {workflowSteps.map((item) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                className="rounded-[28px] border border-black/10 bg-white p-7 shadow-[0_24px_70px_rgba(0,0,0,0.04)]"
              >
                <div className="text-[17px] font-semibold text-black">
                  {item.step}
                </div>
                <h3 className="mt-5 text-[25px] font-semibold tracking-[-0.04em] text-black">
                  {item.title}
                </h3>
                <p className="mt-4 text-[18px] leading-8 text-black">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#ececec]">
        <div className="mx-auto max-w-[1320px] px-6 pb-24 pt-8 lg:px-8 lg:pb-28">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="rounded-[34px] border border-black/10 bg-white px-8 py-14 text-center shadow-[0_24px_70px_rgba(0,0,0,0.05)] md:px-14 md:py-18"
          >
            <SectionLabel>Get started</SectionLabel>
            <h2 className="mx-auto mt-5 max-w-[900px] text-[40px] font-semibold leading-[1.02] tracking-[-0.05em] text-black md:text-[64px]">
              Ready to bring more structure and control to project risk?
            </h2>
            <p className="mx-auto mt-6 max-w-[760px] text-[20px] leading-9 text-black">
              Book a demo and see how RiskBases helps teams move from fragmented
              risk management to one professional workflow.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <PrimaryButton href="/book-demo">Book a demo</PrimaryButton>
              <SecondaryButton href="/about">About us</SecondaryButton>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
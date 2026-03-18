"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

type SolutionItem = {
  slug: string;
  title: string;
  description: string;
  body: string;
  image: string;
  imageAlt: string;
  imageSide: "left" | "right";
  bullets: string[];
};

const solutions: SolutionItem[] = [
  {
    slug: "construction",
    title: "Construction",
    description: "Mitigate construction project risks with more clarity and control.",
    body:
      "Centralize project risk oversight across site operations, contractors and delivery milestones. Keep teams aligned on safety, compliance and execution without relying on fragmented spreadsheets.",
    image: "/construction.jpg",
    imageAlt: "Construction industry solution",
    imageSide: "left",
    bullets: [
      "Monitor site safety protocols and project compliance",
      "Assess contractor and subcontractor risk profiles",
      "Track delays, issues and on-site hazards in one workflow",
    ],
  },
  {
    slug: "infrastructure",
    title: "Infrastructure",
    description: "Streamline infrastructure risk management across complex public works.",
    body:
      "Navigate large-scale infrastructure delivery with structured oversight, early warning indicators and standardized reporting. Reduce surprises and improve accountability across teams and suppliers.",
    image: "/infrastructure.jpg",
    imageAlt: "Infrastructure industry solution",
    imageSide: "right",
    bullets: [
      "Monitor infrastructure risk dashboards centrally",
      "Set early warnings for critical milestones and exposures",
      "Assess contractor, supplier and dependency risks",
    ],
  },
  {
    slug: "maritime",
    title: "Maritime & Offshore",
    description: "Manage risks across maritime, offshore and port operations.",
    body:
      "Maintain stronger oversight of operational, regulatory and supply chain risks across vessels, terminals and offshore environments. Give teams one structured system for identification, ownership and review.",
    image: "/maritime.png",
    imageAlt: "Maritime and offshore solution",
    imageSide: "left",
    bullets: [
      "Monitor vessels and offshore operations in real time",
      "Improve compliance with maritime regulations",
      "Strengthen resilience across offshore supply chains",
    ],
  },
  {
    slug: "event-management",
    title: "Event Management",
    description: "Keep event execution controlled across planning, vendors and operations.",
    body:
      "Coordinate venues, suppliers, health and safety considerations and operational dependencies in one place. Reduce execution risk and improve clarity from preparation to live event delivery.",
    image: "/event.jpg",
    imageAlt: "Event management solution",
    imageSide: "right",
    bullets: [
      "Track vendor, venue and operational risks clearly",
      "Improve incident readiness and live event coordination",
      "Keep planning, ownership and mitigation in one workflow",
    ],
  },
];

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

  const hiddenX = direction === "left" ? -48 : direction === "right" ? 48 : 0;
  const hiddenY = direction === "up" ? 32 : 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: hiddenX, y: hiddenY }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, x: hiddenX, y: hiddenY }
      }
      transition={{
        duration: 0.7,
        ease: "easeOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

function SolutionCard({ item, index }: { item: SolutionItem; index: number }) {
  const imageBlock = (
    <div className="relative min-h-[320px] overflow-hidden bg-[#e9edf1] md:min-h-[420px]">
      <Image
        src={item.image}
        alt={item.imageAlt}
        fill
        className="object-cover object-center"
        priority={index === 0}
      />
    </div>
  );

  const textBlock = (
    <div className="flex h-full flex-col justify-center p-8 md:p-10 lg:p-12">
      <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-black/55">
        Solution
      </p>

      <h2 className="mt-3 text-[34px] font-semibold leading-[1.02] tracking-[-0.04em] text-black md:text-[44px]">
        {item.title}
      </h2>

      <p className="mt-5 text-[20px] leading-8 text-black">
        {item.description}
      </p>

      <p className="mt-5 max-w-[620px] text-[17px] leading-8 text-black">
        {item.body}
      </p>

      <div className="mt-7 space-y-4">
        {item.bullets.map((bullet) => (
          <div key={bullet} className="flex items-start gap-3">
            <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#eef7ee]">
              <Check className="h-3.5 w-3.5 text-[#4b9b4b]" />
            </div>
            <p className="text-[16px] leading-7 text-black">{bullet}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Link
          href={`/solutions#${item.slug}`}
          className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Explore {item.title}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );

  return (
    <Reveal
      direction={item.imageSide === "left" ? "left" : "right"}
      delay={index * 0.05}
    >
      <section
        id={item.slug}
        className="overflow-hidden rounded-[28px] border border-black/10 bg-white"
      >
        <div
          className={`grid min-h-[420px] lg:grid-cols-2 ${
            item.imageSide === "right" ? "lg:[&>*:first-child]:order-1 lg:[&>*:last-child]:order-2" : ""
          }`}
        >
          {item.imageSide === "left" ? (
            <>
              {imageBlock}
              {textBlock}
            </>
          ) : (
            <>
              {textBlock}
              {imageBlock}
            </>
          )}
        </div>
      </section>
    </Reveal>
  );
}

export default function SolutionsPage() {
  return (
    <main className="min-h-screen bg-[#f3f4f6] text-black">
      <section className="mx-auto max-w-[1280px] px-6 pb-24 pt-16 md:px-8 md:pt-20">
        <div className="mx-auto max-w-[1080px]">
          <Reveal>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-black">
              Solutions
            </p>
          </Reveal>

          <Reveal delay={0.04}>
            <h1 className="max-w-[760px] text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-black md:text-[68px]">
              Risk management adapted
              <span className="text-black/35"> to your industry.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="mt-6 max-w-[840px] text-[20px] leading-9 text-black">
              RiskBases adapts to your environment. From construction and
              infrastructure to maritime and event operations, manage risk with
              more clarity, ownership and control.
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#construction"
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white"
              >
                Construction
              </a>
              <a
                href="#infrastructure"
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white"
              >
                Infrastructure
              </a>
              <a
                href="#maritime"
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white"
              >
                Maritime & Offshore
              </a>
              <a
                href="#event-management"
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white"
              >
                Event Management
              </a>
            </div>
          </Reveal>
        </div>

        <div className="mx-auto mt-14 flex max-w-[1080px] flex-col gap-7">
          {solutions.map((item, index) => (
            <SolutionCard key={item.slug} item={item} index={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

type ProductSection = {
  id: string;
  step: string;
  eyebrow: string;
  title: string;
  description: string;
  body: string;
  bullets: string[];
  image: string;
  imageAlt: string;
  imageSide: "left" | "right";
  imageClassName: string;
  imageObjectPosition?: string;
  imageHeightClassName?: string;
};

const productSections: ProductSection[] = [
  {
    id: "platform-overview",
    step: "01",
    eyebrow: "Platform overview",
    title: "Take control of risk. Build safer projects.",
    description:
      "RiskBases helps teams manage risks, actions and stakeholders in one clear workspace.",
    body:
      "Bring project oversight, ownership and reporting together in a structured system built for operational teams. Reduce fragmentation and replace scattered files, spreadsheets and updates with one shared source of truth.",
    bullets: [
      "Centralize project risks, actions and stakeholders",
      "Create one clear workspace for operational control",
      "Move from fragmented files to structured collaboration",
    ],
    image: "/step1.png",
    imageAlt: "RiskBases platform overview",
    imageSide: "right",
    imageClassName:
      "w-[132%] max-w-none translate-x-[-17%] lg:w-[138%] lg:translate-x-[-19%]",
    imageObjectPosition: "top center",
    imageHeightClassName: "min-h-[420px] lg:min-h-[520px]",
  },
  {
    id: "risk-register",
    step: "02",
    eyebrow: "Risk register",
    title: "One platform for everything. Always in control.",
    description:
      "RiskBases brings risks, actions, reporting and accountability together in one clear workspace.",
    body:
      "Project teams often lose visibility because risks, actions and decisions are spread across too many tools. RiskBases centralizes the full risk register so teams can quickly understand what is open, overdue or most important right now.",
    bullets: [
      "See all project risks in one structured register",
      "Keep exposure, status and ownership visible",
      "Reduce missed follow-up and unclear accountability",
    ],
    image: "/step2.png",
    imageAlt: "RiskBases risk register",
    imageSide: "right",
    imageClassName:
      "w-[138%] max-w-none translate-x-[-21%] lg:w-[145%] lg:translate-x-[-23%]",
    imageObjectPosition: "top center",
    imageHeightClassName: "min-h-[430px] lg:min-h-[530px]",
  },
  {
    id: "action-workflow",
    step: "03",
    eyebrow: "Action workflow",
    title: "Assign actions and turn risks into ownership.",
    description:
      "Turn identified risks into clear tasks, deadlines and follow-up actions.",
    body:
      "Once a risk is identified, teams need to act. RiskBases helps you assign actions, track progress and hold owners accountable without losing visibility across the project. This keeps mitigation practical, traceable and operational.",
    bullets: [
      "Create and assign mitigation tasks in seconds",
      "Set deadlines and keep ownership explicit",
      "Track action progress without separate tools",
    ],
    image: "/step3.png",
    imageAlt: "RiskBases action workflow",
    imageSide: "right",
    imageClassName:
      "w-[138%] max-w-none translate-x-[-22%] lg:w-[145%] lg:translate-x-[-24%]",
    imageObjectPosition: "top center",
    imageHeightClassName: "min-h-[430px] lg:min-h-[530px]",
  },
  {
    id: "stakeholder-alignment",
    step: "04",
    eyebrow: "Stakeholder alignment",
    title: "Keep everyone aligned on responsibilities.",
    description:
      "Connect stakeholders, risks and actions so teams always know who is involved.",
    body:
      "Project delivery depends on coordination between internal teams, subcontractors, clients and operational stakeholders. RiskBases gives each risk and action clear context so communication becomes faster and responsibilities stay transparent.",
    bullets: [
      "Link risks and actions to stakeholders",
      "Improve ownership and communication",
      "Reduce ambiguity across project teams",
    ],
    image: "/step4.png",
    imageAlt: "RiskBases stakeholder alignment",
    imageSide: "left",
    imageClassName:
      "w-[150%] max-w-none translate-x-[-14%] lg:w-[158%] lg:translate-x-[-18%]",
    imageObjectPosition: "top left",
    imageHeightClassName: "min-h-[440px] lg:min-h-[540px]",
  },
  {
    id: "reports-dashboards",
    step: "05",
    eyebrow: "Reports & dashboards",
    title: "See what matters without digging through data.",
    description:
      "Use dashboards and reporting views to understand risk exposure, open actions and project status.",
    body:
      "Instead of manually combining updates from multiple sources, RiskBases gives teams a cleaner view of project health. Surface high-risk items, overdue actions and reporting summaries quickly for reviews, meetings and decision-making.",
    bullets: [
      "Get instant oversight of open and high risks",
      "Prepare reviews faster with cleaner summaries",
      "Turn raw risk data into decision-ready insight",
    ],
    image: "/step5.png",
    imageAlt: "RiskBases dashboards and reporting",
    imageSide: "right",
    imageClassName:
      "w-[138%] max-w-none translate-x-[-20%] lg:w-[144%] lg:translate-x-[-22%]",
    imageObjectPosition: "top center",
    imageHeightClassName: "min-h-[430px] lg:min-h-[530px]",
  },
  {
    id: "ai-risk-generation",
    step: "06",
    eyebrow: "AI risk generation",
    title: "Generate stronger risk starting points with AI.",
    description:
      "Kickstart project registers with intelligent risk suggestions tailored to your context.",
    body:
      "Teams should not start from a blank page every time. RiskBases helps generate relevant initial risks based on project context, so teams can move faster, standardize quality and focus more on reviewing and refining instead of starting from scratch.",
    bullets: [
      "Start faster with AI-assisted draft risks",
      "Standardize how teams begin new projects",
      "Review and refine instead of rebuilding manually",
    ],
    image: "/step6.png",
    imageAlt: "RiskBases AI risk generation",
    imageSide: "left",
    imageClassName:
      "w-[146%] max-w-none translate-x-[-18%] lg:w-[154%] lg:translate-x-[-20%]",
    imageObjectPosition: "top left",
    imageHeightClassName: "min-h-[450px] lg:min-h-[560px]",
  },
  {
    id: "project-timeline",
    step: "07",
    eyebrow: "Project timeline",
    title: "Understand when risks hit and how they affect delivery.",
    description:
      "View risks against timeline and milestones to manage delays, dependencies and impact more clearly.",
    body:
      "Not every risk matters at the same moment. RiskBases helps teams understand timing, escalation and project phases so they can anticipate issues earlier and coordinate responses around deadlines, execution windows and delivery milestones.",
    bullets: [
      "See risks in relation to project timing",
      "Spot delays and critical dependencies earlier",
      "Coordinate mitigation around real delivery moments",
    ],
    image: "/step7.png",
    imageAlt: "RiskBases project timeline",
    imageSide: "right",
    imageClassName:
      "w-[144%] max-w-none translate-x-[-18%] lg:w-[150%] lg:translate-x-[-20%]",
    imageObjectPosition: "top center",
    imageHeightClassName: "min-h-[380px] lg:min-h-[460px]",
  },
  {
    id: "review-governance",
    step: "08",
    eyebrow: "Review & governance",
    title: "Run cleaner reviews and improve project governance.",
    description:
      "Create repeatable review workflows that support stronger accountability and better decisions.",
    body:
      "Risk management only works when it is maintained consistently. RiskBases supports structured review cycles, cleaner governance and clearer auditability so project teams and leadership can stay confident in the decisions being made over time.",
    bullets: [
      "Run repeatable review and update workflows",
      "Strengthen governance and audit readiness",
      "Keep project leadership aligned on current exposure",
    ],
    image: "/step8.png",
    imageAlt: "RiskBases review and governance",
    imageSide: "left",
    imageClassName:
      "w-[146%] max-w-none translate-x-[-18%] lg:w-[152%] lg:translate-x-[-21%]",
    imageObjectPosition: "top center",
    imageHeightClassName: "min-h-[430px] lg:min-h-[520px]",
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

  const hiddenX = direction === "left" ? -36 : direction === "right" ? 36 : 0;
  const hiddenY = direction === "up" ? 24 : 0;

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

function Screenshot({
  src,
  alt,
  className,
  side,
  objectPosition = "top center",
  heightClassName = "min-h-[430px] lg:min-h-[520px]",
  priority = false,
}: {
  src: string;
  alt: string;
  className: string;
  side: "left" | "right";
  objectPosition?: string;
  heightClassName?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative flex items-center ${heightClassName}`}>
      <div
        className={`relative ${className} ${
          side === "left" ? "mr-auto" : "ml-auto"
        }`}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[22px] border border-black/8 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.12)]">
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            className="object-cover"
            style={{ objectPosition }}
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
    </div>
  );
}

function ProductText({ section }: { section: ProductSection }) {
  return (
    <div className="flex flex-col justify-center p-8 md:p-10 lg:p-12">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-[28px] font-semibold tracking-[-0.04em] text-white">
          {section.step}
        </div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-black/55">
          {section.eyebrow}
        </p>
      </div>

      <h2 className="mt-6 max-w-[640px] text-[34px] font-semibold leading-[1.02] tracking-[-0.045em] text-black md:text-[48px]">
        {section.title}
      </h2>

      <p className="mt-5 max-w-[720px] text-[20px] leading-8 text-black">
        {section.description}
      </p>

      <p className="mt-5 max-w-[720px] text-[17px] leading-8 text-black">
        {section.body}
      </p>

      <div className="mt-7 space-y-4">
        {section.bullets.map((bullet) => (
          <div key={bullet} className="flex items-start gap-3">
            <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#eef7ee]">
              <Check className="h-3.5 w-3.5 text-[#4b9b4b]" />
            </div>
            <p className="text-[16px] leading-7 text-black">{bullet}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductBlock({
  section,
  index,
}: {
  section: ProductSection;
  index: number;
}) {
  const visual = (
    <Screenshot
      src={section.image}
      alt={section.imageAlt}
      side={section.imageSide}
      className={section.imageClassName}
      objectPosition={section.imageObjectPosition}
      heightClassName={section.imageHeightClassName}
      priority={index < 2}
    />
  );

  return (
    <Reveal
      direction={section.imageSide === "left" ? "left" : "right"}
      delay={index * 0.04}
    >
      <section
        id={section.id}
        className="overflow-hidden rounded-[28px] border border-black/10 bg-white"
      >
        <div className="grid min-h-[520px] lg:grid-cols-2">
          {section.imageSide === "left" ? (
            <>
              {visual}
              <ProductText section={section} />
            </>
          ) : (
            <>
              <ProductText section={section} />
              {visual}
            </>
          )}
        </div>
      </section>
    </Reveal>
  );
}

export default function ProductPage() {
  return (
    <main className="min-h-screen bg-[#f3f4f6] text-black">
      <section className="mx-auto max-w-[1280px] px-6 pb-24 pt-16 md:px-8 md:pt-20">
        <div className="mx-auto max-w-[1080px]">
          <Reveal>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-black">
              Product
            </p>
          </Reveal>

          <Reveal delay={0.04}>
            <h1 className="max-w-[920px] text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-black md:text-[68px]">
              One platform for risks,
              <span className="text-black/35"> actions and project control.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="mt-6 max-w-[860px] text-[20px] leading-9 text-black">
              RiskBases brings risk registers, action workflows, stakeholder
              visibility and reporting together in one structured workspace
              built for real project teams.
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-8 flex flex-wrap gap-3">
              {productSections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white"
                >
                  {section.eyebrow}
                </a>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mx-auto mt-14 flex max-w-[1080px] flex-col gap-7">
          {productSections.map((section, index) => (
            <ProductBlock key={section.id} section={section} index={index} />
          ))}
        </div>

        <Reveal delay={0.12}>
          <div className="mx-auto mt-12 max-w-[1080px] rounded-[28px] border border-black/10 bg-white px-8 py-12 text-center">
            <h3 className="text-[42px] font-semibold tracking-[-0.045em] text-black">
              Ready to explore the platform?
            </h3>
            <p className="mx-auto mt-4 max-w-[760px] text-[18px] leading-8 text-black">
              See how RiskBases helps teams bring structure, ownership and clarity
              to project risk management.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/book-demo"
                className="inline-flex h-12 items-center justify-center rounded-[14px] bg-black px-8 text-[16px] font-semibold text-white transition hover:opacity-90"
              >
                Book a demo
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-12 items-center justify-center rounded-[14px] border border-black/10 bg-[#f8f9fa] px-8 text-[16px] font-semibold text-black transition hover:bg-[#eef1f3]"
              >
                View pricing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
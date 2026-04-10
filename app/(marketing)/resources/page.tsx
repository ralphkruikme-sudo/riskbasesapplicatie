"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  FileText,
  FolderKanban,
  Search,
} from "lucide-react";

type ResourceType = "documentation" | "guide" | "case-study" | "template";

type ResourceItem = {
  title: string;
  description: string;
  href: string;
  type: ResourceType;
  category: string;
};

const allResources: ResourceItem[] = [
  {
    title: "Getting Started",
    description: "Set up your first workspace, project, register and review flow in minutes.",
    href: "/resources/docs/getting-started",
    type: "documentation",
    category: "Documentation",
  },
  {
    title: "User Manual",
    description: "Complete overview of the platform and how teams work inside RiskBases.",
    href: "/resources/docs/user-manual",
    type: "documentation",
    category: "Documentation",
  },
  {
    title: "API Documentation",
    description: "Connect RiskBases with your internal systems and workflows.",
    href: "/resources/docs/api",
    type: "documentation",
    category: "Documentation",
  },
  {
    title: "Risk Management 101",
    description: "Core concepts, ownership, scoring and mitigation fundamentals.",
    href: "/resources/guides/risk-management-101",
    type: "guide",
    category: "Guides",
  },
  {
    title: "Setting Up a Risk Register",
    description: "Structure a register your team can actually maintain and use.",
    href: "/resources/guides/risk-register-setup",
    type: "guide",
    category: "Guides",
  },
  {
    title: "Conducting a Risk Assessment",
    description: "Identify, assess and review risks using a practical repeatable method.",
    href: "/resources/guides/risk-assessment",
    type: "guide",
    category: "Guides",
  },
  {
    title: "Construction Case Study",
    description: "How contractors improve visibility and reduce onsite risk exposure.",
    href: "/resources/case-studies/construction",
    type: "case-study",
    category: "Case Studies",
  },
  {
    title: "Infrastructure Case Study",
    description: "How infrastructure teams standardize reporting and accountability.",
    href: "/resources/case-studies/infrastructure",
    type: "case-study",
    category: "Case Studies",
  },
  {
    title: "Maritime Case Study",
    description: "How maritime projects improve control over operational and compliance risks.",
    href: "/resources/case-studies/maritime",
    type: "case-study",
    category: "Case Studies",
  },
  {
    title: "Risk Register Template",
    description: "Structured template to capture, score and track project risks.",
    href: "/resources/templates/risk-register-template",
    type: "template",
    category: "Templates",
  },
  {
    title: "Risk Review Checklist",
    description: "A practical checklist for recurring reviews and project controls.",
    href: "/resources/templates/risk-review-checklist",
    type: "template",
    category: "Templates",
  },
  {
    title: "Issue Log Template",
    description: "Track issues, status, owners and follow-up actions in one place.",
    href: "/resources/templates/issue-log-template",
    type: "template",
    category: "Templates",
  },
];

const groupedSections = [
  { title: "Documentation", icon: BookOpen, type: "documentation" as ResourceType },
  { title: "Guides", icon: FileText, type: "guide" as ResourceType },
  { title: "Case Studies", icon: BriefcaseBusiness, type: "case-study" as ResourceType },
  { title: "Templates", icon: FolderKanban, type: "template" as ResourceType },
];

const typeOptions = [
  { label: "All", value: "all" },
  { label: "Documentation", value: "documentation" },
  { label: "Guides", value: "guide" },
  { label: "Case Studies", value: "case-study" },
  { label: "Templates", value: "template" },
] as const;

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
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: hiddenX, y: hiddenY }}
      transition={{ duration: 0.65, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

function FloatingOrb({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      style={{
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 35% 35%, #d7ecff 0%, #5caeff 42%, #1f5fd6 100%)",
        boxShadow:
          "inset -6px -6px 16px rgba(10, 44, 108, 0.22), inset 5px 5px 12px rgba(255,255,255,0.72), 0 14px 40px rgba(31,95,214,0.22)",
        ...style,
      }}
    />
  );
}

function Scene3D() {
  return (
    <div
      className="pointer-events-none absolute -right-2 -top-6 hidden xl:block"
      style={{ width: 280, height: 220, perspective: 600 }}
    >
      <div
        className="absolute"
        style={{ right: 8, top: 16, animation: "floatC 5.5s ease-in-out infinite" }}
      >
        <FloatingOrb style={{ width: 80, height: 80 }} />
      </div>

      <div
        className="absolute"
        style={{ right: 118, top: 55, animation: "floatA 7s ease-in-out infinite" }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            transformStyle: "preserve-3d",
            transform: "rotateX(28deg) rotateY(42deg)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, #cfe7ff, #4f9dff)",
              borderRadius: 10,
              border: "1px solid rgba(31,95,214,0.18)",
              boxShadow: "0 8px 24px rgba(31,95,214,0.16)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, #3d8fff, #1f5fd6)",
              borderRadius: 10,
              transform: "rotateY(90deg) translateZ(26px)",
              transformOrigin: "right center",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, #bfe0ff, #69b6ff)",
              borderRadius: 10,
              transform: "rotateX(90deg) translateZ(-26px)",
              transformOrigin: "center top",
            }}
          />
        </div>
      </div>

      <div
        className="absolute"
        style={{ right: 44, top: 108, animation: "floatB 6.5s ease-in-out infinite 1.2s" }}
      >
        <FloatingOrb style={{ width: 38, height: 38 }} />
      </div>

      <div
        className="absolute"
        style={{ right: 158, top: 14, animation: "floatA 8s ease-in-out infinite 0.6s" }}
      >
        <FloatingOrb style={{ width: 22, height: 22 }} />
      </div>

      <div
        className="absolute"
        style={{ right: 60, top: 170, animation: "floatC 9s ease-in-out infinite 2s" }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            transformStyle: "preserve-3d",
            transform: "rotateX(32deg) rotateY(50deg)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, #d0e8ff, #67b3ff)",
              borderRadius: 5,
              border: "1px solid rgba(31,95,214,0.16)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#1f5fd6",
              borderRadius: 5,
              transform: "rotateY(90deg) translateZ(13px)",
              transformOrigin: "right center",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ResourcesPage() {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] =
    useState<(typeof typeOptions)[number]["value"]>("all");
  const [typeOpen, setTypeOpen] = useState(false);

  const filteredResources = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return allResources.filter((item) => {
      const matchesType = selectedType === "all" ? true : item.type === selectedType;
      const matchesQuery =
        normalized.length === 0
          ? true
          : item.title.toLowerCase().includes(normalized) ||
            item.description.toLowerCase().includes(normalized) ||
            item.category.toLowerCase().includes(normalized);
      return matchesType && matchesQuery;
    });
  }, [query, selectedType]);

  const groupedFiltered = useMemo(() => {
    return groupedSections
      .map((section) => ({
        ...section,
        items: filteredResources.filter((item) => item.type === section.type),
      }))
      .filter((section) => section.items.length > 0);
  }, [filteredResources]);

  const showHeroCards =
    query.trim().length === 0 &&
    (selectedType === "all" ||
      selectedType === "documentation" ||
      selectedType === "case-study" ||
      selectedType === "template");

  return (
    <main className="min-h-screen bg-white text-black">
      <style>{`
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-13px) rotate(5deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-9px) rotate(-6deg); }
        }
        @keyframes floatC {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-17px); }
        }
        .card-hover {
          transition: transform 0.28s ease, box-shadow 0.28s ease;
        }
        .card-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 56px rgba(0,0,0,0.09);
        }
      `}</style>

      <section className="mx-auto max-w-[1280px] px-6 pb-28 pt-16 md:px-8 md:pt-20">
        <div className="mx-auto max-w-[980px]">
          <div className="relative">
            <Scene3D />

            <Reveal>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#1f5fd6]">
                Resources
              </p>
            </Reveal>

            <Reveal delay={0.04}>
              <h1 className="max-w-[680px] text-4xl font-semibold leading-[1.0] tracking-[-0.055em] text-black md:text-[64px]">
                Start where you are, not from scratch.
              </h1>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="mt-5 max-w-[580px] text-[17px] leading-[1.8] text-black/72">
                Practical documentation, guides, templates and case studies
                built for modern project risk management teams.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <div className="mt-10 flex flex-col gap-2 rounded-2xl border border-black/8 bg-[#fafafa] p-1.5 shadow-sm md:flex-row md:items-center">
              <div className="flex h-12 flex-1 items-center px-4">
                <Search className="mr-3 h-4 w-4 shrink-0 text-black/35" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search risk register, reporting, mitigation..."
                  className="w-full bg-transparent text-[14px] text-black outline-none placeholder:text-black/30"
                />
              </div>

              <div className="relative px-1.5 pb-1.5 md:pb-0 md:pr-1.5">
                <button
                  type="button"
                  onClick={() => setTypeOpen((prev) => !prev)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-[13px] font-medium text-black shadow-sm transition hover:bg-black hover:text-white"
                >
                  {typeOptions.find((o) => o.value === selectedType)?.label ?? "All"}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {typeOpen && (
                  <div className="absolute right-1.5 top-[48px] z-20 min-w-[190px] overflow-hidden rounded-2xl border border-black/8 bg-white p-1.5 shadow-2xl">
                    {typeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSelectedType(option.value);
                          setTypeOpen(false);
                        }}
                        className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition ${
                          selectedType === option.value
                            ? "bg-black text-white"
                            : "text-black hover:bg-[#f4f4f4]"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>

        {showHeroCards && (
          <div className="mx-auto mt-10 grid max-w-[980px] gap-4 lg:grid-cols-[1.62fr_0.9fr]">
            {(selectedType === "all" || selectedType === "template") && (
              <Reveal direction="left" delay={0.06}>
                <Link
                  href="/resources/templates/risk-register-template"
                  className="card-hover group block overflow-hidden rounded-3xl border border-black/8 bg-white shadow-sm"
                >
                  <div className="grid min-h-[390px] md:grid-cols-[1.08fr_0.92fr]">
                    <div className="relative min-h-[240px] overflow-hidden bg-[#e8edf2]">
                      <Image
                        src="/register.jpg"
                        alt="Risk Register Template"
                        fill
                        priority
                        className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                      />
                    </div>

                    <div className="flex flex-col justify-center p-8 md:p-9">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#1f5fd6]">
                        Featured Template
                      </p>
                      <h2 className="mt-4 text-[38px] font-semibold leading-[0.97] tracking-[-0.05em] text-black">
                        Risk Register
                        <br />
                        Template
                      </h2>
                      <p className="mt-4 text-[13px] leading-[1.75] text-black/68">
                        Download a structured template to capture, score and track project risks across planning, execution and review.
                      </p>
                      <div className="mt-6">
                        <span className="inline-flex h-10 items-center gap-1.5 rounded-full bg-black px-5 text-[13px] font-semibold text-white transition group-hover:opacity-85">
                          Download Template
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            )}

            <div className="flex flex-col gap-4">
              {(selectedType === "all" || selectedType === "case-study") && (
                <Reveal direction="right" delay={0.1}>
                  <Link
                    href="/resources/case-studies/construction"
                    className="card-hover group block overflow-hidden rounded-3xl border border-black/8 bg-white shadow-sm"
                  >
                    <div className="relative aspect-[1.55] w-full overflow-hidden bg-[#e8edf2]">
                      <Image
                        src="/casestudy.png"
                        alt="Construction Case Study"
                        fill
                        className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute left-4 top-4 rounded-full border border-black/10 bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black backdrop-blur-sm">
                        Case Study
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-[19px] font-semibold leading-tight tracking-[-0.03em] text-black">
                        Construction Case Study
                      </h3>
                      <p className="mt-2 text-[13px] leading-[1.65] text-black/66">
                        How contractors reduce onsite risk exposure with structured reporting and mitigation workflows.
                      </p>
                    </div>
                  </Link>
                </Reveal>
              )}

              {(selectedType === "all" || selectedType === "documentation") && (
                <Reveal direction="right" delay={0.14}>
                  <Link
                    href="/resources/docs/getting-started"
                    className="card-hover group block rounded-3xl border border-black/8 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-2xl bg-[#e8edf2]">
                        <Image
                          src="/getting.png"
                          alt="Getting Started with RiskBases"
                          fill
                          className="object-cover object-center transition duration-500 group-hover:scale-[1.05]"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1f5fd6]">
                          Docs
                        </p>
                        <h3 className="text-[18px] font-semibold leading-[1.1] tracking-[-0.03em] text-black">
                          Getting Started
                          <br />
                          with RiskBases
                        </h3>
                        <p className="mt-1.5 text-[13px] leading-[1.6] text-black/66">
                          Set up your first workspace, project, register and review flow in minutes.
                        </p>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              )}
            </div>
          </div>
        )}

        <div className="mx-auto mt-8 max-w-[980px]">
          {groupedFiltered.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {groupedFiltered.map((section, index) => {
                const Icon = section.icon;
                return (
                  <Reveal
                    key={section.title}
                    direction={index % 2 === 0 ? "left" : "right"}
                    delay={index * 0.06}
                  >
                    <div className="card-hover relative h-full overflow-hidden rounded-3xl border border-black/8 bg-white p-6 shadow-sm">
                      <div className="pointer-events-none absolute -bottom-4 -right-4 opacity-20">
                        <FloatingOrb style={{ width: 80, height: 80 }} />
                      </div>

                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
                          <Icon className="h-4 w-4" />
                        </div>
                        <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-black">
                          {section.title}
                        </h3>
                      </div>

                      <div className="space-y-0.5">
                        {section.items.map((item) => (
                          <Link
                            key={item.title}
                            href={item.href}
                            className="group/item flex items-center justify-between rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-black transition hover:bg-[#f5f5f5]"
                          >
                            <span>{item.title}</span>
                            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-black/22 transition duration-200 group-hover/item:translate-x-0.5 group-hover/item:text-black" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          ) : (
            <Reveal>
              <div className="rounded-3xl border border-black/8 bg-white px-8 py-14 shadow-sm">
                <h3 className="text-[22px] font-semibold text-black">No results found</h3>
                <p className="mt-3 text-[14px] leading-7 text-black/62">
                  Try another search term or choose a different resource type.
                </p>
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </main>
  );
}
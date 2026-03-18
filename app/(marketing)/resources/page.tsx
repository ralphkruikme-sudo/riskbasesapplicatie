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
    description:
      "Set up your first workspace, project, register and review flow in minutes.",
    href: "/resources/docs/getting-started",
    type: "documentation",
    category: "Documentation",
  },
  {
    title: "User Manual",
    description:
      "Complete overview of the platform and how teams work inside RiskBases.",
    href: "/resources/docs/user-manual",
    type: "documentation",
    category: "Documentation",
  },
  {
    title: "API Documentation",
    description:
      "Connect RiskBases with your internal systems and workflows.",
    href: "/resources/docs/api",
    type: "documentation",
    category: "Documentation",
  },
  {
    title: "Risk Management 101",
    description:
      "Core concepts, ownership, scoring and mitigation fundamentals.",
    href: "/resources/guides/risk-management-101",
    type: "guide",
    category: "Guides",
  },
  {
    title: "Setting Up a Risk Register",
    description:
      "Structure a register your team can actually maintain and use.",
    href: "/resources/guides/risk-register-setup",
    type: "guide",
    category: "Guides",
  },
  {
    title: "Conducting a Risk Assessment",
    description:
      "Identify, assess and review risks using a practical repeatable method.",
    href: "/resources/guides/risk-assessment",
    type: "guide",
    category: "Guides",
  },
  {
    title: "Construction Case Study",
    description:
      "How contractors improve visibility and reduce onsite risk exposure.",
    href: "/resources/case-studies/construction",
    type: "case-study",
    category: "Case Studies",
  },
  {
    title: "Infrastructure Case Study",
    description:
      "How infrastructure teams standardize reporting and accountability.",
    href: "/resources/case-studies/infrastructure",
    type: "case-study",
    category: "Case Studies",
  },
  {
    title: "Maritime Case Study",
    description:
      "How maritime projects improve control over operational and compliance risks.",
    href: "/resources/case-studies/maritime",
    type: "case-study",
    category: "Case Studies",
  },
  {
    title: "Risk Register Template",
    description:
      "Structured template to capture, score and track project risks.",
    href: "/resources/templates/risk-register-template",
    type: "template",
    category: "Templates",
  },
  {
    title: "Risk Review Checklist",
    description:
      "A practical checklist for recurring reviews and project controls.",
    href: "/resources/templates/risk-review-checklist",
    type: "template",
    category: "Templates",
  },
  {
    title: "Issue Log Template",
    description:
      "Track issues, status, owners and follow-up actions in one place.",
    href: "/resources/templates/issue-log-template",
    type: "template",
    category: "Templates",
  },
];

const groupedSections = [
  {
    title: "Documentation",
    icon: BookOpen,
    type: "documentation" as ResourceType,
  },
  {
    title: "Guides",
    icon: FileText,
    type: "guide" as ResourceType,
  },
  {
    title: "Case Studies",
    icon: BriefcaseBusiness,
    type: "case-study" as ResourceType,
  },
  {
    title: "Templates",
    icon: FolderKanban,
    type: "template" as ResourceType,
  },
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
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, x: hiddenX, y: hiddenY }
      }
      transition={{
        duration: 0.65,
        ease: "easeOut",
        delay,
      }}
    >
      {children}
    </motion.div>
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
      const matchesType =
        selectedType === "all" ? true : item.type === selectedType;

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
    <main className="min-h-screen bg-[#f3f4f6] text-black">
      <section className="mx-auto max-w-[1280px] px-6 pb-24 pt-16 md:px-8 md:pt-20">
        <div className="mx-auto max-w-[980px]">
          <Reveal>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-black">
              Resources
            </p>
          </Reveal>

          <Reveal delay={0.04}>
            <h1 className="max-w-[780px] text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-black md:text-[66px]">
              Start where you are,
              <span className="text-black/30"> not from scratch.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="mt-6 max-w-[760px] text-[18px] leading-8 text-black">
              Explore practical documentation, guides, templates and case
              studies built for modern project risk management teams.
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-10 flex flex-col gap-3 rounded-[20px] border border-black/10 bg-white p-2 md:flex-row md:items-center">
              <div className="flex h-14 flex-1 items-center px-4">
                <Search className="mr-3 h-[18px] w-[18px] text-black" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search risk register, reporting, mitigation..."
                  className="w-full bg-transparent text-[15px] text-black outline-none placeholder:text-black/35"
                />
              </div>

              <div className="relative px-2 pb-2 md:pb-0">
                <button
                  type="button"
                  onClick={() => setTypeOpen((prev) => !prev)}
                  className="inline-flex h-11 items-center gap-2 rounded-[14px] border border-black/10 bg-[#f7f7f8] px-4 text-sm font-medium text-black transition hover:bg-[#eceef1]"
                >
                  {typeOptions.find((option) => option.value === selectedType)
                    ?.label ?? "All"}
                  <ChevronDown className="h-4 w-4" />
                </button>

                {typeOpen && (
                  <div className="absolute right-2 top-[52px] z-20 min-w-[190px] rounded-[16px] border border-black/10 bg-white p-1.5 shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
                    {typeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSelectedType(option.value);
                          setTypeOpen(false);
                        }}
                        className={`flex w-full items-center rounded-[12px] px-3 py-2.5 text-left text-sm font-medium transition ${
                          selectedType === option.value
                            ? "bg-[#f1f2f4] text-black"
                            : "text-black hover:bg-[#f6f7f8]"
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
          <div className="mx-auto mt-12 grid max-w-[980px] gap-5 lg:grid-cols-[1.62fr_0.9fr]">
            {(selectedType === "all" || selectedType === "template") && (
              <Reveal direction="left" delay={0.06}>
                <Link
                  href="/resources/templates/risk-register-template"
                  className="group block overflow-hidden rounded-[26px] border border-black/10 bg-white"
                >
                  <div className="grid min-h-[430px] md:grid-cols-[1.08fr_0.92fr]">
                    <div className="relative min-h-[290px] overflow-hidden bg-[#e8edf2]">
                      <Image
                        src="/register.jpg"
                        alt="Risk Register Template"
                        fill
                        priority
                        className="object-cover object-center transition duration-500 group-hover:scale-[1.02]"
                      />
                    </div>

                    <div className="flex flex-col justify-center p-8 md:p-10">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black">
                        Featured Template
                      </p>

                      <h2 className="mt-5 text-[44px] font-semibold leading-[0.98] tracking-[-0.05em] text-black">
                        Risk Register
                        <br />
                        Template
                      </h2>

                      <p className="mt-5 max-w-[320px] text-[15px] leading-7 text-black">
                        Download a structured template to capture, score and
                        track project risks across planning, execution and
                        review.
                      </p>

                      <div className="mt-8">
                        <span className="inline-flex h-11 items-center rounded-full bg-black px-5 text-sm font-semibold text-white">
                          Download Template
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            )}

            <div className="flex flex-col gap-5">
              {(selectedType === "all" || selectedType === "case-study") && (
                <Reveal direction="right" delay={0.1}>
                  <Link
                    href="/resources/case-studies/construction"
                    className="group block overflow-hidden rounded-[26px] border border-black/10 bg-white"
                  >
                    <div className="relative aspect-[1.28/0.88] w-full overflow-hidden bg-[#e8edf2]">
                      <Image
                        src="/casestudy.png"
                        alt="Construction Case Study"
                        fill
                        className="object-cover object-center transition duration-500 group-hover:scale-[1.02]"
                      />
                      <div className="absolute left-4 top-4 rounded-full border border-black/10 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-black">
                        Case Study
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-[21px] font-semibold leading-[1.1] tracking-[-0.03em] text-black">
                        Construction Case Study
                      </h3>
                      <p className="mt-3 text-[14px] leading-6 text-black">
                        How contractors reduce onsite risk exposure with
                        structured reporting and mitigation workflows.
                      </p>
                    </div>
                  </Link>
                </Reveal>
              )}

              {(selectedType === "all" || selectedType === "documentation") && (
                <Reveal direction="right" delay={0.14}>
                  <Link
                    href="/resources/docs/getting-started"
                    className="group block rounded-[26px] border border-black/10 bg-white p-5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[16px] bg-[#e8edf2]">
                        <Image
                          src="/getting.png"
                          alt="Getting Started with RiskBases"
                          fill
                          className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-black">
                          Docs
                        </p>
                        <h3 className="text-[22px] font-semibold leading-[1.05] tracking-[-0.035em] text-black">
                          Getting Started with
                          <br />
                          RiskBases
                        </h3>
                        <p className="mt-2 text-[14px] leading-6 text-black">
                          Set up your first workspace, project, register and
                          review flow in minutes.
                        </p>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              )}
            </div>
          </div>
        )}

        <div className="mx-auto mt-12 max-w-[980px]">
          {groupedFiltered.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {groupedFiltered.map((section, index) => {
                const Icon = section.icon;

                return (
                  <Reveal
                    key={section.title}
                    direction={index % 2 === 0 ? "left" : "right"}
                    delay={index * 0.05}
                  >
                    <div className="h-full rounded-[22px] border border-black/10 bg-white p-7">
                      <div className="mb-7 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#f5f6f7] text-black">
                          <Icon className="h-[18px] w-[18px]" />
                        </div>
                        <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-black">
                          {section.title}
                        </h3>
                      </div>

                      <div className="space-y-4">
                        {section.items.map((item) => (
                          <Link
                            key={item.title}
                            href={item.href}
                            className="group/item flex items-start gap-3 text-[15px] font-medium leading-7 text-black transition hover:opacity-70"
                          >
                            <span>{item.title}</span>
                            <ArrowRight className="ml-auto mt-1 h-4 w-4 shrink-0 opacity-0 transition duration-200 group-hover/item:translate-x-0.5 group-hover/item:opacity-100" />
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
              <div className="rounded-[22px] border border-black/10 bg-white px-8 py-14">
                <h3 className="text-[24px] font-semibold text-black">
                  No results found
                </h3>
                <p className="mt-3 text-[15px] leading-7 text-black">
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
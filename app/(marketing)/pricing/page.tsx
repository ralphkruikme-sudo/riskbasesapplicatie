"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

type BillingPeriod = "monthly" | "yearly";

type PricingPlan = {
  name: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  monthlyLabel?: string;
  yearlyLabel?: string;
  description: string;
  cta: string;
  href: string;
  featured?: boolean;
  enterprise?: boolean;
  features: string[];
};

const plans: PricingPlan[] = [
  {
    name: "Starter",
    monthlyPrice: 249,
    yearlyPrice: 2390, // ~20% discount vs 2988
    monthlyLabel: "From €249 / month",
    yearlyLabel: "From €2,390 / year",
    description:
      "For smaller project teams looking to introduce a more structured risk workflow.",
    cta: "Talk to sales",
    href: "/sales",
    features: [
      "Structured project risk workflow",
      "Central risk register",
      "Risk analysis and action tracking",
      "Team collaboration environment",
      "Standard reporting exports",
      "Core onboarding support",
      "Email support",
    ],
  },
  {
    name: "Professional",
    monthlyPrice: 599,
    yearlyPrice: 5750, // ~20% discount vs 7188
    monthlyLabel: "From €599 / month",
    yearlyLabel: "From €5,750 / year",
    description:
      "For growing teams that need stronger control, deeper analysis, and better project oversight.",
    cta: "Talk to sales",
    href: "/sales",
    featured: true,
    features: [
      "Everything in Starter",
      "Advanced risk analysis workflows",
      "Dependencies and stakeholder tracking",
      "Project-level reporting and visibility",
      "Custom scoring structures",
      "Priority onboarding and support",
      "Designed for serious operational use",
    ],
  },
  {
    name: "Enterprise",
    monthlyPrice: null,
    yearlyPrice: null,
    monthlyLabel: "Custom pricing",
    yearlyLabel: "Custom pricing",
    description:
      "For organizations that require tailored rollout, governance, integrations, and implementation support.",
    cta: "Talk to sales",
    href: "/sales",
    enterprise: true,
    features: [
      "Everything in Professional",
      "Multi-team or multi-workspace setup",
      "Advanced permissions and governance",
      "Custom onboarding and rollout support",
      "API and integration options",
      "Security and compliance alignment",
      "Commercial setup tailored to your organization",
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
      transition={{ duration: 0.65, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

function FAQItem({
  question,
  answer,
  defaultOpen = false,
}: {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-black/10 py-7">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-start justify-between gap-6 text-left"
      >
        <span className="text-[20px] font-medium leading-8 text-black">
          {question}
        </span>
        <ChevronDown
          className={`mt-1 h-5 w-5 shrink-0 text-black transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="max-w-[760px] pr-8 pt-5">
          <p className="text-[17px] leading-8 text-black">{answer}</p>
        </div>
      )}
    </div>
  );
}

function BillingToggle({
  billing,
  setBilling,
}: {
  billing: BillingPeriod;
  setBilling: (value: BillingPeriod) => void;
}) {
  return (
    <div className="mt-10 flex items-center justify-start">
      <div className="inline-flex items-center rounded-full border border-black/10 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setBilling("monthly")}
          className={`rounded-full px-5 py-2.5 text-[14px] font-semibold transition ${
            billing === "monthly"
              ? "bg-black text-white"
              : "text-black hover:bg-black/5"
          }`}
        >
          Monthly
        </button>

        <button
          type="button"
          onClick={() => setBilling("yearly")}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-semibold transition ${
            billing === "yearly"
              ? "bg-black text-white"
              : "text-black hover:bg-black/5"
          }`}
        >
          Yearly
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              billing === "yearly"
                ? "bg-white text-black"
                : "bg-[#eef7ee] text-[#2f7a38]"
            }`}
          >
            Save 20%
          </span>
        </button>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingPeriod>("monthly");

  return (
    <main className="min-h-screen text-black">
      <section className="bg-white">
        <div className="mx-auto max-w-[1280px] px-6 pb-16 pt-16 md:px-8 md:pt-20">
          <div className="mx-auto max-w-[1060px]">
            <Reveal>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-black">
                Pricing
              </p>
            </Reveal>

            <Reveal delay={0.04}>
              <h1 className="max-w-[820px] text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-black md:text-[64px]">
                Pricing built for serious project risk management
              </h1>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="mt-5 max-w-[720px] text-[18px] leading-8 text-black">
                RiskBases is positioned for professional project teams that need
                more structure, better visibility, and stronger control over
                project risk. Pricing depends on your team setup, operating
                model, and implementation needs.
              </p>
            </Reveal>

            <Reveal delay={0.12}>
              <BillingToggle billing={billing} setBilling={setBilling} />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f7f9]">
        <div className="mx-auto max-w-[1280px] px-6 pb-24 pt-16 md:px-8">
          <div className="mx-auto max-w-[1060px]">
            <div className="grid gap-6 lg:grid-cols-3">
              {plans.map((plan, index) => {
                const priceLabel =
                  billing === "monthly"
                    ? plan.monthlyLabel ?? "Custom pricing"
                    : plan.yearlyLabel ?? "Custom pricing";

                const savings =
                  plan.monthlyPrice && plan.yearlyPrice
                    ? Math.round(plan.monthlyPrice * 12 - plan.yearlyPrice)
                    : null;

                return (
                  <Reveal
                    key={plan.name}
                    direction={
                      index === 1 ? "up" : index === 0 ? "left" : "right"
                    }
                    delay={index * 0.05}
                  >
                    <div
                      className={`relative h-full rounded-[28px] bg-white p-8 ${
                        plan.featured
                          ? "border-2 border-blue-400 shadow-[0_16px_50px_rgba(0,0,0,0.06)]"
                          : "border border-blue-200"
                      }`}
                    >
                      {plan.featured && (
                        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black px-5 py-2 text-sm font-semibold text-white">
                          Most popular
                        </div>
                      )}

                      <div className="text-center">
                        <h2 className="text-[34px] font-semibold tracking-[-0.04em] text-black">
                          {plan.name}
                        </h2>

                        <motion.div
                          key={`${plan.name}-${billing}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.22, ease: "easeOut" }}
                        >
                          <p className="mt-4 text-[20px] font-semibold tracking-[-0.03em] text-black">
                            {priceLabel}
                          </p>

                          {billing === "yearly" && savings && (
                            <p className="mt-2 text-[13px] font-medium text-[#2f7a38]">
                              Save €{savings.toLocaleString()} per year
                            </p>
                          )}
                        </motion.div>

                        <p className="mx-auto mt-6 max-w-[300px] text-[17px] leading-8 text-black">
                          {plan.description}
                        </p>

                        <Link
                          href={plan.href}
                          className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-[14px] bg-black text-[16px] font-semibold text-white transition hover:opacity-90"
                        >
                          {plan.cta}
                        </Link>
                      </div>

                      <ul className="mt-8 space-y-4">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3">
                            <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#eef7ee]">
                              <Check className="h-3.5 w-3.5 text-[#4b9b4b]" />
                            </div>
                            <span className="text-[15px] leading-7 text-black">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            <Reveal delay={0.18}>
              <div className="mt-10 rounded-[28px] border border-blue-200 bg-white px-8 py-12 text-center">
                <h3 className="text-[42px] font-semibold tracking-[-0.045em] text-black">
                  Let’s find the right setup for your team
                </h3>
                <p className="mx-auto mt-4 max-w-[760px] text-[18px] leading-8 text-black">
                  We’ll walk through your organization, project environment, and
                  implementation needs to recommend the right RiskBases setup.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href="/sales"
                    className="inline-flex h-12 items-center justify-center rounded-[14px] bg-black px-8 text-[16px] font-semibold text-white transition hover:opacity-90"
                  >
                    Talk to sales
                  </Link>
                  <Link
                    href="/sales"
                    className="inline-flex h-12 items-center justify-center rounded-[14px] border border-black px-8 text-[16px] font-semibold text-black transition hover:bg-black hover:text-white"
                  >
                    Contact sales
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-6 py-20 md:px-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-16">
          <Reveal direction="left">
            <div>
              <p className="text-[56px] font-medium leading-[0.95] tracking-[-0.05em] text-black md:text-[72px]">
                Frequently
                <br />
                asked
                <br />
                questions
              </p>
            </div>
          </Reveal>

          <Reveal direction="right" delay={0.04}>
            <div className="rounded-[24px] bg-transparent">
              <FAQItem
                question="Can I sign up directly on the website?"
                answer="No. RiskBases follows a sales-led onboarding flow. New customers first get in touch with our team so we can align the platform setup with their organization, workflow, and project environment."
                defaultOpen
              />
              <FAQItem
                question="How do we get access after choosing a plan?"
                answer="After commercial alignment, your organization is onboarded and your workspace is prepared. Your team then receives invite-based access to log in and start using the platform."
              />
              <FAQItem
                question="Do you offer annual pricing?"
                answer="Yes. Annual pricing is available with a 20% discount compared to the monthly starting price."
              />
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

type BillingMode = "monthly" | "yearly";

type PricingPlan = {
  name: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
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
    monthlyPrice: 149,
    yearlyPrice: 149 * 12,
    description: "For smaller teams that want structured project risk oversight.",
    cta: "Start with Starter",
    href: "/book-a-demo",
    features: [
      "Up to 3 active projects",
      "Central risk register",
      "Basic risk analysis",
      "Action tracking",
      "Stakeholder overview",
      "PDF report export",
      "Email support",
    ],
  },
  {
    name: "Business",
    monthlyPrice: 299,
    yearlyPrice: 299 * 12,
    description: "For growing teams that need stronger reporting and analysis.",
    cta: "Start with Business",
    href: "/book-a-demo",
    featured: true,
    features: [
      "Up to 15 active projects",
      "Advanced risk analysis",
      "Project timeline view",
      "Custom risk scoring",
      "Full stakeholder management",
      "Advanced reporting",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    description: "For organizations that need custom governance, security and rollout.",
    cta: "Contact sales",
    href: "/contact",
    enterprise: true,
    features: [
      "Unlimited projects",
      "Multi-workspace setup",
      "Custom modules",
      "Advanced permissions",
      "Custom onboarding",
      "API / integrations",
      "Custom security & compliance options",
    ],
  },
];

const faqs = [
  {
    question: "How does yearly billing work?",
    answer:
      "When yearly billing is selected, the yearly total is shown directly. Starter becomes $1,788 per year and Business becomes $3,588 per year.",
  },
  {
    question: "Which plan is best for a growing operational team?",
    answer:
      "Business is the strongest fit for teams that need deeper analysis, timeline visibility, stakeholder management and more advanced reporting across multiple projects.",
  },
  {
    question: "Can Enterprise include custom modules or onboarding?",
    answer:
      "Yes. Enterprise is designed for organizations that need custom rollout support, permissions, integrations, security requirements and module configuration.",
  },
  {
    question: "Can I start small and upgrade later?",
    answer:
      "Yes. Teams can begin with Starter and move to Business or Enterprise when they need more projects, more advanced workflows or broader governance.",
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

function PriceBlock({
  plan,
  billing,
}: {
  plan: PricingPlan;
  billing: BillingMode;
}) {
  if (plan.enterprise) {
    return (
      <>
        <div className="mt-7">
          <span className="text-[42px] font-semibold tracking-[-0.04em] text-black">
            Custom pricing
          </span>
        </div>
        <p className="mt-3 text-[14px] leading-6 text-black">
          Tailored to your organization and implementation scope.
        </p>
      </>
    );
  }

  const amount =
    billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  const suffix = billing === "monthly" ? "/mo" : "/yr";
  const helper =
    billing === "monthly"
      ? `Billed monthly`
      : `Billed yearly as one annual payment`;

  return (
    <>
      <div className="mt-7 flex items-end justify-center gap-1">
        <span className="mb-[8px] text-[22px] font-semibold text-black">$</span>
        <span className="text-[58px] font-semibold leading-none tracking-[-0.06em] text-black">
          {amount}
        </span>
        <span className="mb-[9px] text-[22px] text-black">{suffix}</span>
      </div>
      <p className="mt-3 text-[14px] leading-6 text-black">{helper}</p>
    </>
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

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingMode>("monthly");

  return (
    <main className="min-h-screen bg-[#f3f4f6] text-black">
      <section className="mx-auto max-w-[1280px] px-6 pb-24 pt-16 md:px-8 md:pt-20">
        <div className="mx-auto max-w-[1060px]">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Reveal>
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-black">
                  Pricing
                </p>
              </Reveal>

              <Reveal delay={0.04}>
                <h1 className="max-w-[760px] text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-black md:text-[64px]">
                  Pick the plan that suits your team
                </h1>
              </Reveal>

              <Reveal delay={0.08}>
                <p className="mt-5 max-w-[640px] text-[18px] leading-8 text-black">
                  Start small, scale when needed, and choose the setup that fits
                  your project risk workflow.
                </p>
              </Reveal>
            </div>

            <Reveal direction="right" delay={0.1}>
              <div className="rounded-[18px] border border-black/10 bg-white p-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 text-sm font-medium ${
                      billing === "monthly" ? "text-black" : "text-black/45"
                    }`}
                  >
                    Monthly
                  </span>

                  <button
                    type="button"
                    aria-label="Toggle billing period"
                    onClick={() =>
                      setBilling((prev) =>
                        prev === "monthly" ? "yearly" : "monthly"
                      )
                    }
                    className={`relative h-8 w-14 rounded-full transition ${
                      billing === "yearly" ? "bg-black" : "bg-black/15"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-all duration-300 ${
                        billing === "yearly" ? "left-7" : "left-1"
                      }`}
                    />
                  </button>

                  <span
                    className={`px-3 text-sm font-medium ${
                      billing === "yearly" ? "text-black" : "text-black/45"
                    }`}
                  >
                    Yearly
                  </span>

                  <div className="rounded-[12px] bg-[#f5f6f7] px-3 py-2 text-sm font-semibold text-black">
                    Save 20%
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <Reveal
                key={plan.name}
                direction={index === 1 ? "up" : index === 0 ? "left" : "right"}
                delay={index * 0.05}
              >
                <div
                  className={`relative h-full rounded-[28px] bg-white p-8 ${
                    plan.featured
                      ? "border-2 border-black shadow-[0_16px_50px_rgba(0,0,0,0.06)]"
                      : "border border-black/10"
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

                    <PriceBlock plan={plan} billing={billing} />

                    <p className="mx-auto mt-7 max-w-[290px] text-[17px] leading-8 text-black">
                      {plan.description}
                    </p>

                    <Link
                      href={plan.href}
                      className={`mt-8 inline-flex h-12 w-full items-center justify-center rounded-[14px] text-[16px] font-semibold transition ${
                        plan.featured
                          ? "bg-black text-white hover:opacity-90"
                          : plan.enterprise
                          ? "border border-black/10 bg-[#f8f9fa] text-black hover:bg-[#eef1f3]"
                          : "bg-black text-white hover:opacity-90"
                      }`}
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
            ))}
          </div>

          <Reveal delay={0.18}>
            <div className="mt-10 rounded-[28px] border border-black/10 bg-white px-8 py-12 text-center">
              <h3 className="text-[42px] font-semibold tracking-[-0.045em] text-black">
                Get started today
              </h3>
              <p className="mx-auto mt-4 max-w-[720px] text-[18px] leading-8 text-black">
                Start transforming your project risk management with a cleaner,
                more structured workflow.
              </p>

              <Link
                href="/book-a-demo"
                className="mt-8 inline-flex h-12 items-center justify-center rounded-[14px] bg-black px-8 text-[16px] font-semibold text-white transition hover:opacity-90"
              >
                Start free trial
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-black/10 bg-[#f3f4f6]">
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
                question="How does the monthly versus yearly switch work?"
                answer="The switch changes the pricing display between monthly and yearly billing. With yearly selected, Starter shows $1,788 per year and Business shows $3,588 per year."
                defaultOpen
              />
              <FAQItem
                question="How do I know whether to choose Starter, Business or Enterprise?"
                answer="Starter fits smaller teams with a limited number of active projects. Business is better for growing teams that need stronger reporting, custom scoring and more advanced analysis. Enterprise is for organizations that need custom modules, governance, integrations and rollout support."
              />
              <FAQItem
                question="Can I upgrade later?"
                answer="Yes. Teams can start on a smaller plan and move up when they need more projects, broader reporting or more advanced governance."
              />
              <FAQItem
                question="Do you offer custom onboarding for larger teams?"
                answer="Yes. Enterprise includes the option for tailored onboarding, permissions setup, integrations and compliance requirements."
              />
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  CalendarDays,
  Building2,
  Layers3,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const salesTopics = [
  {
    title: "Pricing & packaging",
    description:
      "Discuss which RiskBases setup fits your organization, team structure, and project environment.",
    icon: Layers3,
  },
  {
    title: "Implementation & onboarding",
    description:
      "Explore rollout, workspace setup, onboarding support, and how RiskBases can be introduced effectively.",
    icon: Building2,
  },
  {
    title: "Enterprise & governance",
    description:
      "Review permissions, governance needs, compliance expectations, and organization-wide adoption.",
    icon: ShieldCheck,
  },
];

const reasons = [
  "Discuss the right commercial setup for your team",
  "Review implementation scope and onboarding approach",
  "Explore enterprise requirements and rollout options",
  "Align RiskBases with your project risk workflow",
];

function FadeUp({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

export default function SalesPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="border-b border-black/8 bg-white">
        <div className="mx-auto max-w-[1280px] px-6 pb-16 pt-16 md:px-8 md:pb-20 md:pt-20">
          <div className="mx-auto max-w-[1060px]">
            <FadeUp>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-black">
                Talk to Sales
              </p>
            </FadeUp>

            <FadeUp delay={0.05}>
              <h1 className="max-w-[820px] text-4xl font-semibold leading-[0.96] tracking-[-0.055em] text-black md:text-[64px]">
                Find the right RiskBases setup for your organization
              </h1>
            </FadeUp>

            <FadeUp delay={0.1}>
              <p className="mt-5 max-w-[760px] text-[18px] leading-8 text-black">
                Speak with our team about pricing, onboarding, implementation,
                rollout, and enterprise requirements. We’ll help you determine
                the right setup for your project environment.
              </p>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="https://outlook.office.com/bookwithme/"
                  className="inline-flex h-12 items-center justify-center rounded-[14px] bg-black px-7 text-[16px] font-semibold text-white transition hover:opacity-90"
                >
                  Book a sales call
                </Link>

                <Link
                  href="mailto:sales@riskbases.com"
                  className="inline-flex h-12 items-center justify-center rounded-[14px] border border-black px-7 text-[16px] font-semibold text-black transition hover:bg-black hover:text-white"
                >
                  Email sales
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f7f9]">
        <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-8 md:py-20">
          <div className="mx-auto grid max-w-[1060px] gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <FadeUp>
              <div className="rounded-[28px] border border-blue-200 bg-white p-8 md:p-10">
                <h2 className="text-[34px] font-semibold tracking-[-0.04em] text-black">
                  What we can discuss
                </h2>
                <div className="mt-8 space-y-5">
                  {salesTopics.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.title}
                        className="rounded-[22px] border border-black/8 bg-white p-5"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f3f0ff]">
                            <Icon className="h-5 w-5 text-[#6b4ce6]" />
                          </div>
                          <div>
                            <h3 className="text-[20px] font-semibold leading-7 text-black">
                              {item.title}
                            </h3>
                            <p className="mt-2 text-[16px] leading-7 text-black">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.08}>
              <div className="rounded-[28px] border border-blue-200 bg-white p-8 md:p-10">
                <h2 className="text-[34px] font-semibold tracking-[-0.04em] text-black">
                  Sales contact
                </h2>

                <div className="mt-8 space-y-4">
                  <div className="rounded-[18px] border border-black/8 px-5 py-4">
                    <div className="flex items-start gap-3">
                      <Mail className="mt-1 h-5 w-5 shrink-0 text-[#6b4ce6]" />
                      <div>
                        <p className="text-[14px] font-medium text-black/65">
                          Email
                        </p>
                        <a
                          href="mailto:sales@riskbases.com"
                          className="mt-1 block text-[17px] font-medium text-black"
                        >
                          sales@riskbases.com
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[18px] border border-black/8 px-5 py-4">
                    <div className="flex items-start gap-3">
                      <CalendarDays className="mt-1 h-5 w-5 shrink-0 text-[#6b4ce6]" />
                      <div>
                        <p className="text-[14px] font-medium text-black/65">
                          Direct scheduling
                        </p>
                        <p className="mt-1 text-[17px] leading-7 text-black">
                          Schedule a commercial conversation through Microsoft
                          Teams booking.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-[22px] bg-[#f7f7f9] p-6">
                  <p className="text-[20px] font-semibold leading-8 text-black">
                    This page is best for:
                  </p>
                  <ul className="mt-4 space-y-3">
                    {reasons.map((reason) => (
                      <li key={reason} className="flex items-start gap-3">
                        <div className="mt-2 h-2.5 w-2.5 rounded-full bg-[#6b4ce6]" />
                        <span className="text-[16px] leading-7 text-black">
                          {reason}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <Link
                    href="https://outlook.office.com/bookwithme/"
                    className="inline-flex h-12 items-center justify-center rounded-[14px] bg-black px-6 text-[16px] font-semibold text-white transition hover:opacity-90"
                  >
                    Schedule via Teams
                  </Link>

                  <Link
                    href="mailto:sales@riskbases.com"
                    className="inline-flex h-12 items-center justify-center rounded-[14px] border border-black px-6 text-[16px] font-semibold text-black transition hover:bg-black hover:text-white"
                  >
                    Contact sales
                  </Link>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-[1060px] rounded-[32px] border border-blue-200 bg-[#f7f7f9] px-8 py-10 md:px-12 md:py-12">
            <FadeUp>
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="text-[42px] font-semibold leading-[1.02] tracking-[-0.045em] text-black">
                    Want to see the platform first?
                  </p>
                  <p className="mt-4 max-w-[700px] text-[18px] leading-8 text-black">
                    If you’d rather start with a product walkthrough before
                    discussing commercial setup, book a demo with our team.
                  </p>
                </div>

                <Link
                  href="/book-demo"
                  className="inline-flex h-12 items-center justify-center rounded-[14px] bg-black px-8 text-[16px] font-semibold text-white transition hover:opacity-90"
                >
                  Book a demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>
    </main>
  );
}
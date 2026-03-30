"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ChevronDown, Headphones, Mail, MessageSquare } from "lucide-react";

const faqs = [
  {
    question: "How do I know whether to choose Sales or Support?",
    answer:
      "Choose Sales for questions about pricing, demos, partnerships, or how RiskBases can support your organization. Choose Support if you already use the platform and need help with access, issues, or troubleshooting.",
  },
  {
    question: "How quickly can I expect a response?",
    answer:
      "We aim to respond to most messages within one business day. Urgent support issues are reviewed as quickly as possible.",
  },
  {
    question: "What happens after I submit the form?",
    answer:
      "Your request is routed to the appropriate team. We will follow up with the right next steps, whether that is a demo, commercial response, or technical assistance.",
  },
  {
    question: "Do I need to be a customer to contact RiskBases?",
    answer:
      "No. You can contact us whether you are exploring the platform, requesting a demo, or already using RiskBases.",
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
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: hiddenX, y: hiddenY }}
      transition={{ duration: 0.65, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-[#e7e8ee]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-6 py-5 text-left md:py-6"
      >
        <span className="pr-6 text-[16px] font-medium leading-7 text-[#111827] md:text-[17px]">
          {question}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#111827] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ${
          isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="max-w-[760px] text-[15px] leading-7 text-[#667085]">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className="min-h-screen">

      {/* SECTIE 1 — wit: header */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1080px] px-6 pb-14 pt-12 md:px-8 md:pb-16 md:pt-14">
          <Reveal>
            <div className="mx-auto max-w-[720px] text-center">
              <h1 className="text-[34px] font-semibold tracking-[-0.04em] text-[#1f2747] md:text-[48px]">
                Contact Us
              </h1>
              <p className="mx-auto mt-4 max-w-[640px] text-[16px] leading-7 text-[#667085] md:text-[18px]">
                We're here to help. Reach out with any questions or needs you have.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SECTIE 2 — grijs: kaartjes */}
      <section className="bg-[#f7f7f9]">
        <div className="mx-auto max-w-[1080px] px-6 py-14 md:px-8">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Reveal direction="left" delay={0.05}>
              <div className="rounded-[16px] border border-[#e5e7eb] bg-white p-7">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ebeaf5] bg-[#f7f4ff] text-[#6f4ef6]">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <h2 className="mt-5 text-[24px] font-semibold tracking-[-0.03em] text-[#1f2747]">
                  General Inquiries
                </h2>
                <p className="mt-4 max-w-[460px] text-[16px] leading-8 text-[#667085]">
                  For questions about our services, platform, partnerships, or general information.
                </p>
                <div className="mt-6 flex items-center gap-3 rounded-[12px] border border-[#e4e7ec] bg-[#fbfbfc] px-4 py-3.5">
                  <Mail className="h-4 w-4 text-[#6f4ef6]" />
                  <span className="text-[15px] text-[#344054]">info@riskbases.com</span>
                </div>
                <div className="mt-4">
                  <Link
                    href="mailto:info@riskbases.com"
                    className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[#d9dce7] bg-white px-4 text-[14px] font-medium text-[#1f2747] transition hover:bg-[#f8f8fb]"
                  >
                    Email sales
                  </Link>
                </div>
              </div>
            </Reveal>

            <Reveal direction="right" delay={0.05}>
              <div className="rounded-[16px] border border-[#e5e7eb] bg-white p-7">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ebeaf5] bg-[#f7f4ff] text-[#6f4ef6]">
                  <Headphones className="h-4 w-4" />
                </div>
                <h2 className="mt-5 text-[24px] font-semibold tracking-[-0.03em] text-[#1f2747]">
                  Support
                </h2>
                <p className="mt-4 max-w-[460px] text-[16px] leading-8 text-[#667085]">
                  For technical help, platform issues, or urgent support requests from existing users.
                </p>
                <div className="mt-6 flex items-center gap-3 rounded-[12px] border border-[#e4e7ec] bg-[#fbfbfc] px-4 py-3.5">
                  <Mail className="h-4 w-4 text-[#6f4ef6]" />
                  <span className="text-[15px] text-[#344054]">support@riskbases.com</span>
                </div>
                <div className="mt-4">
                  <Link
                    href="mailto:support@riskbases.com"
                    className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[#d9dce7] bg-white px-4 text-[14px] font-medium text-[#1f2747] transition hover:bg-[#f8f8fb]"
                  >
                    Contact support
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SECTIE 3 — wit: afbeelding */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1080px] px-6 py-14 md:px-8">
          <Reveal delay={0.05}>
            <div className="overflow-hidden rounded-[16px] border border-[#e5e7eb]">
              <div className="relative aspect-[16/6] w-full">
                <Image
                  key="contactus-v2"
                  src="/contactus.png?v=2"
                  alt="RiskBases support team"
                  fill
                  unoptimized
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SECTIE 4 — grijs: FAQ */}
      <section className="bg-[#f7f7f9]">
        <div className="mx-auto grid max-w-[1080px] grid-cols-1 gap-10 px-6 py-14 md:px-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
          <Reveal direction="left">
            <div>
              <h3 className="text-[30px] font-medium leading-[1.02] tracking-[-0.04em] text-[#1f2747] md:text-[42px]">
                Frequently asked questions
              </h3>
            </div>
          </Reveal>

          <Reveal direction="right" delay={0.04}>
            <div>
              {faqs.map((faq, index) => (
                <FaqItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openIndex === index}
                  onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

    </main>
  );
}

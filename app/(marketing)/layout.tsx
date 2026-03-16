import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MarketingHeader from "./MarketingHeader";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "RiskBases",
  description:
    "RiskBases helps teams manage risks, actions, stakeholders and reporting in one powerful workspace.",
};

const footerNav = [
  {
    title: "Product",
    links: [
      { label: "Product", href: "/" },
      { label: "Pricing", href: "/pricing" },
      { label: "Features", href: "/features" },
      { label: "Resources", href: "/resources" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/documentation" },
      { label: "Guides", href: "/guides" },
      { label: "Blog", href: "/blog" },
      { label: "Case Studies", href: "/case-studies" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Book a Demo", href: "/book-demo" },
      { label: "Sign up", href: "/auth" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <MarketingHeader />
      {children}

      <footer className="relative isolate overflow-hidden border-t border-slate-200 bg-white">
        {/* Subtle gradient top */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/60 to-transparent" />

        {/* Main footer content */}
        <div className="mx-auto max-w-[1400px] px-6 pb-10 pt-16 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
            {/* Brand column */}
            <div>
              <Link href="/" className="flex w-fit items-center gap-3">
                <Image
                  src="/logo-icon.png"
                  alt="RiskBases logo"
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain"
                />
                <span className="text-[22px] font-bold tracking-[-0.05em] text-slate-950">
                  RiskBases
                </span>
              </Link>

              <p className="mt-5 max-w-[260px] text-[15px] leading-7 text-slate-500">
                AI-driven risk management for safer, smarter projects.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-[12px] font-semibold text-violet-700">
                  SOC 2 Ready
                </span>
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[12px] font-semibold text-slate-600">
                  GDPR Focused
                </span>
              </div>

              {/* Mini CTA */}
              <Link
                href="/book-demo"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_6px_20px_rgba(109,40,217,0.24)] transition hover:scale-[1.02]"
              >
                Book a demo
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Nav columns */}
            {footerNav.map((col) => (
              <div key={col.title}>
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  {col.title}
                </h3>
                <ul className="mt-5 flex flex-col gap-3.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[15px] text-slate-600 transition hover:text-violet-600"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-100">
          <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-4 px-6 py-6 text-[13px] text-slate-400 lg:flex-row lg:items-center lg:px-10">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span>© 2026 RiskBases. All rights reserved.</span>
              <span className="hidden h-3.5 w-px bg-slate-200 lg:block" />
              <Link href="/privacy" className="transition hover:text-violet-600">
                Privacy Policy
              </Link>
              <Link href="/terms" className="transition hover:text-violet-600">
                Terms of Service
              </Link>
              <Link href="/cookies" className="transition hover:text-violet-600">
                Cookie Policy
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-7 items-center rounded-full border border-slate-200 bg-slate-50 px-3 text-[12px] font-medium text-slate-500">
                🔒 Secure platform
              </span>
              <span className="inline-flex h-7 items-center rounded-full border border-violet-100 bg-violet-50 px-3 text-[12px] font-medium text-violet-600">
                Privacy-first
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

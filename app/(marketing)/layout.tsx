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
      { label: "Platform", href: "/" },
      { label: "Solutions", href: "/solutions" },
      { label: "Pricing", href: "/pricing" },
      { label: "Resources", href: "/resources" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/documentation" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Book a Demo", href: "/book-demo" },
      { label: "Login", href: "/auth" },
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
    <div className="min-h-screen bg-white text-slate-950">
      <MarketingHeader />

      {/* PAGE CONTENT */}
      <main>{children}</main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-10">
          <div className="grid gap-14 py-16 lg:grid-cols-[1.2fr_2fr] lg:gap-16">
            {/* LEFT */}
            <div className="max-w-[360px]">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/logo-icon.png"
                  alt="RiskBases logo"
                  width={42}
                  height={42}
                  className="h-[42px] w-[42px] object-contain"
                />
                <span className="text-[18px] font-bold tracking-[-0.03em] text-slate-950">
                  RiskBases
                </span>
              </Link>

              <p className="mt-5 max-w-[320px] text-[15px] leading-7 text-slate-600">
                AI-driven risk management for safer, smarter projects.
              </p>

              <div className="mt-6">
                <Link
                  href="/book-demo"
                  className="inline-flex items-center rounded-full bg-violet-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_8px_25px_rgba(124,58,237,0.20)] transition hover:bg-violet-700"
                >
                  Book a demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* RIGHT */}
            <div className="grid grid-cols-2 gap-x-10 gap-y-10 sm:grid-cols-4">
              {footerNav.map((column) => (
                <div key={column.title}>
                  <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {column.title}
                  </h3>

                  <ul className="mt-5 space-y-4">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-[15px] font-medium text-slate-700 transition duration-200 hover:text-violet-600"
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

          {/* BOTTOM */}
          <div className="flex flex-col gap-4 border-t border-slate-200 py-5 text-[14px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 RiskBases. All rights reserved.</p>

            <div className="flex flex-wrap items-center gap-5">
              <Link
                href="/privacy"
                className="transition hover:text-violet-600"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="transition hover:text-violet-600"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="transition hover:text-violet-600"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
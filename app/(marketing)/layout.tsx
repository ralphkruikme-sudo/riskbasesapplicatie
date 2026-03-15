import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MarketingHeader from "./MarketingHeader";

export const metadata: Metadata = {
  title: "RiskBases",
  description:
    "RiskBases helps teams manage risks, actions, stakeholders and reporting in one powerful workspace.",
};

const productLinks = [
  { label: "Product", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "Features", href: "/features" },
  { label: "Resources", href: "/resources" },
];

const resourceLinks = [
  { label: "Documentation", href: "/documentation" },
  { label: "Guides", href: "/guides" },
  { label: "Blog", href: "/blog" },
  { label: "Case Studies", href: "/case-studies" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Book a Demo", href: "/book-demo" },
  { label: "Sign up", href: "/auth" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
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

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-[1480px] px-6 py-16 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr]">
            <div className="max-w-[320px]">
              <Link href="/" className="flex w-fit items-center gap-3">
                <Image
                  src="/logo-icon.png"
                  alt="RiskBases logo"
                  width={38}
                  height={38}
                  className="h-[38px] w-[38px] object-contain"
                />
                <span className="text-[28px] font-bold tracking-[-0.05em] text-slate-950">
                  RiskBases
                </span>
              </Link>

              <p className="mt-6 text-[18px] leading-8 text-slate-500">
                AI-driven risk management for safer, smarter projects.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-[13px] font-semibold text-violet-700">
                  SOC 2 Ready
                </span>
                <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[13px] font-semibold text-slate-600">
                  GDPR Focused
                </span>
              </div>
            </div>

            <FooterColumn title="Product" links={productLinks} />
            <FooterColumn title="Resources" links={resourceLinks} />
            <FooterColumn title="Company" links={companyLinks} />
            <FooterColumn title="Legal" links={legalLinks} />
          </div>

          <div className="mt-14 border-t border-slate-200 pt-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-[760px]">
                <p className="text-[15px] font-medium text-slate-900">
                  © 2026 RiskBases. All rights reserved.
                </p>

                <p className="mt-3 text-[15px] leading-7 text-slate-500">
                  We use cookies to improve your experience and analyze site
                  traffic. Read our{" "}
                  <Link
                    href="/cookies"
                    className="font-medium text-violet-600 transition hover:text-violet-700"
                  >
                    Cookie Policy
                  </Link>{" "}
                  and manage your preferences through{" "}
                  <Link
                    href="/cookies"
                    className="font-medium text-violet-600 transition hover:text-violet-700"
                  >
                    Cookie Settings
                  </Link>
                  .
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                <div className="inline-flex h-12 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[13px] font-semibold text-slate-700">
                  Secure platform
                </div>
                <Link
                  href="/cookies"
                  className="inline-flex h-12 items-center rounded-2xl border border-violet-100 bg-violet-50 px-4 text-[13px] font-semibold text-violet-700 transition hover:bg-violet-100"
                >
                  Cookie Policy
                </Link>
                <Link
                  href="/privacy"
                  className="inline-flex h-12 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[13px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                >
                  Privacy-first
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-[16px] font-semibold tracking-[-0.02em] text-slate-950">
        {title}
      </h3>

      <div className="mt-5 flex flex-col gap-4">
        {links.map((link) => (
          <Link
            key={`${title}-${link.label}`}
            href={link.href}
            className="w-fit text-[15px] text-slate-500 transition hover:text-violet-600"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

const navItems = [
  { label: "Product", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "Features", href: "/features" },
  { label: "Resources", href: "/resources" },
];

export default function MarketingHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="grid h-[86px] grid-cols-[auto_1fr_auto] items-center px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 justify-self-start">
          <Image
            src="/logo-icon.png"
            alt="RiskBases logo"
            width={34}
            height={34}
            className="h-[34px] w-[34px] object-contain"
            priority
          />
          <span className="text-[20px] font-bold tracking-[-0.04em] text-slate-950">
            RiskBases
          </span>
        </Link>

        <nav className="hidden justify-center lg:flex">
          <div className="flex items-center gap-12">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative pb-8 text-[17px] font-medium transition ${
                    isActive
                      ? "text-slate-950"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                  {isActive ? (
                    <span className="absolute bottom-0 left-1/2 h-[3px] w-[72px] -translate-x-1/2 rounded-full bg-violet-500" />
                  ) : null}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="hidden items-center gap-4 justify-self-end lg:flex">
          <Link
            href="/auth"
            className="inline-flex h-14 items-center justify-center rounded-full border border-slate-200 bg-white px-8 text-[17px] font-medium text-slate-700 shadow-[0_4px_18px_rgba(15,23,42,0.06)] transition hover:border-slate-300 hover:text-slate-950"
          >
            Sign up
          </Link>

          <Link
            href="/book-demo"
            className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 px-8 text-[17px] font-semibold text-white shadow-[0_18px_40px_rgba(109,40,217,0.24)] transition hover:scale-[1.01]"
          >
            Book a demo
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
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
      <div className="grid h-[72px] grid-cols-[auto_1fr_auto] items-center px-6 lg:px-10">
        {/* Logo — groter, verticaal gecentreerd */}
        <Link href="/" className="flex items-center gap-3 justify-self-start">
          <Image
            src="/logo-icon.png"
            alt="RiskBases logo"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
            priority
          />
          <span className="text-[22px] font-bold tracking-[-0.05em] text-slate-950">
            RiskBases
          </span>
        </Link>

        {/* Nav — zelfde verticale baseline als logo */}
        <nav className="hidden justify-center lg:flex">
          <div className="flex items-center gap-10">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative text-[15px] font-medium transition ${
                    isActive
                      ? "text-slate-950"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-[26px] left-1/2 h-[2px] w-full -translate-x-1/2 rounded-full bg-violet-500" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* CTA buttons */}
        <div className="hidden items-center gap-3 justify-self-end lg:flex">
          <Link
            href="/auth"
            className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-[15px] font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          >
            Sign up
          </Link>

          <Link
            href="/book-demo"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 px-6 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(109,40,217,0.28)] transition hover:scale-[1.02] hover:shadow-[0_12px_32px_rgba(109,40,217,0.36)]"
          >
            Book a demo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

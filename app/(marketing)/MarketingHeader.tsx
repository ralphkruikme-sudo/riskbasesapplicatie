"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type DropdownItem = {
  label: string;
  href: string;
};

type NavItemType = {
  label: string;
  href: string;
  dropdown: DropdownItem[] | null;
};

const navItems: NavItemType[] = [
  {
    label: "Product",
    href: "/",
    dropdown: [
      {
        label: "Platform Overview",
        href: "/",
      },
      {
        label: "Risk Register",
        href: "/features/risk-register",
      },
      {
        label: "Action Management",
        href: "/features/actions",
      },
      {
        label: "Stakeholder Management",
        href: "/features/stakeholders",
      },
      {
        label: "Reports & Dashboards",
        href: "/features/reports",
      },
      {
        label: "AI Risk Generation",
        href: "/features/ai",
      },
    ],
  },
  {
    label: "Solutions",
    href: "/solutions",
    dropdown: [
      {
        label: "Construction",
        href: "/solutions/construction",
      },
      {
        label: "Infrastructure",
        href: "/solutions/infrastructure",
      },
      {
        label: "Maritime & Offshore",
        href: "/solutions/maritime",
      },
      {
        label: "Enterprise Teams",
        href: "/solutions/enterprise",
      },
    ],
  },
  {
    label: "Pricing",
    href: "/pricing",
    dropdown: null,
  },
  {
    label: "Resources",
    href: "/resources",
    dropdown: [
      {
        label: "Documentation",
        href: "/documentation",
      },
      {
        label: "Case Studies",
        href: "/case-studies",
      },
      {
        label: "Blog",
        href: "/blog",
      },
    ],
  },
  {
    label: "About",
    href: "/about",
    dropdown: null,
  },
];

function DropdownMenu({ items }: { items: DropdownItem[] }) {
  return (
    <div className="absolute left-1/2 top-full z-50 mt-4 w-[320px] -translate-x-1/2">
      <div
        className="
          relative overflow-hidden rounded-2xl bg-white p-2
          border border-violet-500/30
          shadow-[0_24px_70px_rgba(46,49,146,0.14)]
        "
      >
        <div className="absolute -top-[7px] left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-l border-t border-violet-500/30 bg-white" />

        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group flex items-center justify-between rounded-xl px-5 py-4 transition duration-200 hover:bg-slate-50"
          >
            <span className="text-[15px] font-semibold text-slate-900 transition group-hover:text-violet-600">
              {item.label}
            </span>

            <ArrowRight className="h-4 w-4 shrink-0 text-violet-500/80 transition duration-200 group-hover:translate-x-0.5 group-hover:text-violet-600" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function NavItem({
  item,
  isActive,
}: {
  item: NavItemType;
  isActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeClass = "text-violet-700";
  const inactiveClass = "text-slate-700 hover:text-slate-950";

  if (!item.dropdown) {
    return (
      <Link
        href={item.href}
        className={`relative inline-flex h-[82px] items-center text-[15px] font-semibold transition-colors duration-200 ${
          isActive ? activeClass : inactiveClass
        }`}
      >
        {item.label}
        {isActive && (
          <span className="absolute bottom-0 left-1/2 h-[2px] w-full -translate-x-1/2 rounded-full bg-violet-600" />
        )}
      </Link>
    );
  }

  return (
    <div
      ref={ref}
      className="relative flex h-[82px] items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`relative inline-flex h-full items-center gap-1.5 text-[15px] font-semibold transition-colors duration-200 ${
          isActive || open ? activeClass : inactiveClass
        }`}
      >
        <span>{item.label}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
        {(isActive || open) && (
          <span className="absolute bottom-0 left-1/2 h-[2px] w-full -translate-x-1/2 rounded-full bg-violet-600" />
        )}
      </button>

      {open && item.dropdown && <DropdownMenu items={item.dropdown} />}
    </div>
  );
}

export default function MarketingHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="mx-auto grid h-[82px] max-w-[1440px] grid-cols-[auto_1fr_auto] items-center px-6 sm:px-8 lg:px-10">
        {/* Left */}
        <div className="justify-self-start">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-icon.png"
              alt="RiskBases logo"
              width={44}
              height={44}
              className="h-[44px] w-[44px] object-contain"
              priority
            />
            <span className="text-[23px] font-bold tracking-[-0.04em] text-slate-950">
              RiskBases
            </span>
          </Link>
        </div>

        {/* Center */}
        <nav className="hidden justify-center lg:flex">
          <div className="flex items-center gap-9">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/" || pathname.startsWith("/features")
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return <NavItem key={item.label} item={item} isActive={isActive} />;
            })}
          </div>
        </nav>

        {/* Right */}
        <div className="hidden items-center justify-self-end gap-6 pl-12 lg:flex">
          <Link
            href="/contact"
            className={`relative inline-flex h-[82px] items-center text-[15px] font-semibold transition-colors duration-200 ${
              pathname === "/contact" || pathname.startsWith("/contact/")
                ? "text-violet-700"
                : "text-slate-700 hover:text-slate-950"
            }`}
          >
            Contact Us
            {(pathname === "/contact" || pathname.startsWith("/contact/")) && (
              <span className="absolute bottom-0 left-1/2 h-[2px] w-full -translate-x-1/2 rounded-full bg-violet-600" />
            )}
          </Link>

          <Link
            href="/auth"
            className="text-[15px] font-semibold text-violet-700 transition hover:text-violet-800"
          >
            Login
          </Link>

          <Link
            href="/book-demo"
            className="inline-flex items-center rounded-full bg-violet-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_10px_30px_rgba(124,58,237,0.20)] transition hover:bg-violet-700"
          >
            Book a demo
          </Link>
        </div>
      </div>
    </header>
  );
}
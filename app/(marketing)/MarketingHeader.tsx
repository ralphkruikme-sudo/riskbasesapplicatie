"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
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
      { label: "Platform Overview", href: "/" },
      { label: "Risk Register", href: "/features/risk-register" },
      { label: "Action Management", href: "/features/actions" },
      { label: "Stakeholder Management", href: "/features/stakeholders" },
      { label: "Reports & Dashboards", href: "/features/reports" },
      { label: "AI Risk Generation", href: "/features/ai" },
    ],
  },
  {
    label: "Solutions",
    href: "/solutions",
    dropdown: [
      { label: "Construction", href: "/solutions/construction" },
      { label: "Infrastructure", href: "/solutions/infrastructure" },
      { label: "Maritime & Offshore", href: "/solutions/maritime" },
      { label: "Enterprise Teams", href: "/solutions/enterprise" },
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
      { label: "Documentation", href: "/documentation" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    label: "About",
    href: "/about",
    dropdown: null,
  },
];

function isItemActive(pathname: string, item: NavItemType) {
  if (item.label === "Product") {
    return pathname === "/" || pathname.startsWith("/features");
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function DropdownMenu({
  items,
  closeMenu,
}: {
  items: DropdownItem[];
  closeMenu: () => void;
}) {
  return (
    <div className="absolute left-1/2 top-full z-50 w-[320px] -translate-x-1/2 pt-2">
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-white p-2 shadow-[0_24px_70px_rgba(46,49,146,0.14)]">
        <div className="absolute -top-[7px] left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-l border-t border-violet-500/20 bg-white" />

        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={closeMenu}
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

function DesktopNavItem({
  item,
  isActive,
}: {
  item: NavItemType;
  isActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const startCloseTimer = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 120);
  };

  const openMenu = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setOpen(true);
  };

  const activeClass = "text-violet-700";
  const inactiveClass = "text-slate-700 hover:text-slate-950";

  if (!item.dropdown) {
    return (
      <Link
        href={item.href}
        className={`relative inline-flex h-[80px] items-center text-[15px] font-semibold transition-colors duration-200 ${
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
      className="relative h-[80px]"
      onMouseEnter={openMenu}
      onMouseLeave={startCloseTimer}
    >
      <div className="relative flex h-full items-center">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`relative inline-flex h-[80px] items-center gap-1.5 text-[15px] font-semibold transition-colors duration-200 ${
            isActive || open ? activeClass : inactiveClass
          }`}
          aria-expanded={open}
          aria-haspopup="menu"
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
      </div>

      {open && (
        <>
          <div className="absolute left-0 top-full h-3 w-full" />
          <DropdownMenu items={item.dropdown} closeMenu={() => setOpen(false)} />
        </>
      )}
    </div>
  );
}

export default function MarketingHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState<string | null>(
    null
  );

  useEffect(() => {
    setMobileOpen(false);
    setMobileDropdownOpen(null);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="mx-auto flex h-[80px] max-w-[1440px] items-center justify-between px-6 sm:px-8 lg:px-10">
        <div className="flex shrink-0 items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-icon.png"
              alt="RiskBases logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              priority
            />
            <span className="text-[22px] font-bold tracking-[-0.04em] text-slate-950">
              RiskBases
            </span>
          </Link>
        </div>

        <nav className="hidden h-full items-center lg:flex">
          <div className="flex h-full items-center gap-10">
            {navItems.map((item) => (
              <DesktopNavItem
                key={item.label}
                item={item}
                isActive={isItemActive(pathname, item)}
              />
            ))}
          </div>
        </nav>

        <div className="hidden items-center gap-6 lg:flex">
          <Link
            href="/contact"
            className={`relative inline-flex h-[80px] items-center text-[15px] font-semibold transition-colors duration-200 ${
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
            className="inline-flex items-center rounded-full bg-violet-600 px-5 py-3 text-[14px] font-semibold text-white shadow-[0_10px_30px_rgba(124,58,237,0.20)] transition hover:bg-violet-700"
          >
            Book a demo
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-800 lg:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="mx-auto max-w-[1440px] px-6 py-4 sm:px-8">
            <div className="flex flex-col">
              {navItems.map((item) => {
                const active = isItemActive(pathname, item);
                const isOpen = mobileDropdownOpen === item.label;

                if (!item.dropdown) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`py-3 text-[15px] font-semibold transition ${
                        active ? "text-violet-700" : "text-slate-800"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <div key={item.label} className="border-b border-slate-100 last:border-b-0">
                    <button
                      type="button"
                      onClick={() =>
                        setMobileDropdownOpen((prev) =>
                          prev === item.label ? null : item.label
                        )
                      }
                      className={`flex w-full items-center justify-between py-3 text-left text-[15px] font-semibold transition ${
                        active || isOpen ? "text-violet-700" : "text-slate-800"
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="pb-3 pl-3">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.label}
                            href={subItem.href}
                            className="flex items-center justify-between rounded-xl px-3 py-3 text-[14px] font-medium text-slate-700 transition hover:bg-slate-50 hover:text-violet-600"
                          >
                            <span>{subItem.label}</span>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4">
                <Link
                  href="/contact"
                  className="text-[15px] font-semibold text-slate-800"
                >
                  Contact Us
                </Link>

                <Link
                  href="/auth"
                  className="text-[15px] font-semibold text-violet-700"
                >
                  Login
                </Link>

                <Link
                  href="/book-demo"
                  className="inline-flex w-fit items-center rounded-full bg-violet-600 px-5 py-3 text-[14px] font-semibold text-white shadow-[0_10px_30px_rgba(124,58,237,0.20)] transition hover:bg-violet-700"
                >
                  Book a demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
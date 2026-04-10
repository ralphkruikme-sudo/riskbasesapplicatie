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
    href: "/product",
    dropdown: [
      { label: "Platform Overview", href: "/product" },
      { label: "Risk Register", href: "/product#risk-register" },
      { label: "Action Workflow", href: "/product#action-workflow" },
      { label: "Stakeholder Alignment", href: "/product#stakeholder-alignment" },
      { label: "Reports & Dashboards", href: "/product#reports-dashboards" },
      { label: "AI Risk Generation", href: "/product#ai-risk-generation" },
      { label: "Project Timeline", href: "/product#project-timeline" },
      { label: "Review & Governance", href: "/product#review-governance" },
    ],
  },
  {
    label: "Solutions",
    href: "/solutions",
    dropdown: [
      { label: "Construction", href: "/solutions#construction" },
      { label: "Infrastructure", href: "/solutions#infrastructure" },
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
      { label: "Documentation", href: "/resources" },
      { label: "Guides", href: "/resources#guides" },
      { label: "Case Studies", href: "/resources#case-studies" },
      { label: "Templates", href: "/resources#templates" },
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
    return pathname === "/product" || pathname.startsWith("/product/");
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
    <div className="absolute left-1/2 top-full z-50 w-[340px] -translate-x-1/2 pt-3">
      <div className="overflow-hidden rounded-[20px] border border-black/10 bg-white p-2 shadow-[0_24px_70px_rgba(0,0,0,0.08)]">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={closeMenu}
            className="group flex items-center justify-between rounded-[14px] px-4 py-3 transition hover:bg-[#f7f8fa]"
          >
            <span className="text-[15px] font-medium text-black transition group-hover:opacity-70">
              {item.label}
            </span>
            <ArrowRight className="h-4 w-4 text-black/60 transition group-hover:translate-x-0.5 group-hover:text-black" />
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
    closeTimeoutRef.current = setTimeout(() => setOpen(false), 120);
  };

  const openMenu = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setOpen(true);
  };

  const activeClass = "text-black";
  const inactiveClass = "text-black/70 hover:text-black";

  if (!item.dropdown) {
    return (
      <Link
        href={item.href}
        className={`relative inline-flex h-[76px] items-center text-[15px] font-medium transition-colors duration-200 ${
          isActive ? activeClass : inactiveClass
        }`}
      >
        {item.label}
        {isActive && (
          <span className="absolute bottom-0 left-1/2 h-[2px] w-full -translate-x-1/2 rounded-full bg-black" />
        )}
      </Link>
    );
  }

  return (
    <div
      ref={ref}
      className="relative h-[76px]"
      onMouseEnter={openMenu}
      onMouseLeave={startCloseTimer}
    >
      <div className="relative flex h-full items-center gap-1.5">
        <Link
          href={item.href}
          className={`relative inline-flex h-[76px] items-center text-[15px] font-medium transition-colors duration-200 ${
            isActive || open ? activeClass : inactiveClass
          }`}
        >
          <span>{item.label}</span>
          {(isActive || open) && (
            <span className="absolute bottom-0 left-1/2 h-[2px] w-full -translate-x-1/2 rounded-full bg-black" />
          )}
        </Link>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`inline-flex h-[76px] items-center justify-center transition-colors duration-200 ${
            isActive || open ? activeClass : inactiveClass
          }`}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={`Toggle ${item.label} menu`}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {open && <DropdownMenu items={item.dropdown} closeMenu={() => setOpen(false)} />}
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
    <header className="sticky top-0 z-50 border-b border-black/8 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-6 sm:px-8 lg:px-10">
        <div className="flex shrink-0 items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-icon.png"
              alt="RiskBases logo"
              width={38}
              height={38}
              className="h-9 w-9 object-contain"
              priority
            />
            <span className="text-[22px] font-semibold tracking-[-0.04em] text-black">
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
            className={`relative inline-flex h-[76px] items-center text-[15px] font-medium transition-colors duration-200 ${
              pathname === "/contact" || pathname.startsWith("/contact/")
                ? "text-black"
                : "text-black/70 hover:text-black"
            }`}
          >
            Contact Us
            {(pathname === "/contact" || pathname.startsWith("/contact/")) && (
              <span className="absolute bottom-0 left-1/2 h-[2px] w-full -translate-x-1/2 rounded-full bg-black" />
            )}
          </Link>

          <Link
            href="/auth"
            className="text-[15px] font-medium text-black/70 transition hover:text-black"
          >
            Login
          </Link>

          <Link
            href="/book-demo"
            className="inline-flex items-center rounded-full bg-black px-5 py-3 text-[14px] font-semibold text-white transition hover:opacity-90"
          >
            Book a demo
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-black/10 text-black lg:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-black/10 bg-white lg:hidden">
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
                      className={`py-3 text-[15px] font-medium transition ${
                        active ? "text-black" : "text-black/75"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <div
                    key={item.label}
                    className="border-b border-black/6 last:border-b-0"
                  >
                    <div className="flex items-center justify-between gap-3 py-3">
                      <Link
                        href={item.href}
                        className={`text-[15px] font-medium transition ${
                          active ? "text-black" : "text-black/75"
                        }`}
                      >
                        {item.label}
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          setMobileDropdownOpen((prev) =>
                            prev === item.label ? null : item.label
                          )
                        }
                        className={`inline-flex items-center justify-center transition ${
                          active || isOpen ? "text-black" : "text-black/75"
                        }`}
                        aria-label={`Toggle ${item.label} menu`}
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {isOpen && (
                      <div className="pb-3 pl-3">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.label}
                            href={subItem.href}
                            className="flex items-center justify-between rounded-[12px] px-3 py-3 text-[14px] font-medium text-black/70 transition hover:bg-[#f7f8fa] hover:text-black"
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

              <div className="mt-4 flex flex-col gap-3 border-t border-black/10 pt-4">
                <Link
                  href="/contact"
                  className="text-[15px] font-medium text-black"
                >
                  Contact Us
                </Link>

                <Link
                  href="/auth"
                  className="text-[15px] font-medium text-black/75"
                >
                  Login
                </Link>

                <Link
                  href="/book-demo"
                  className="inline-flex w-fit items-center rounded-full bg-black px-5 py-3 text-[14px] font-semibold text-white transition hover:opacity-90"
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
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  FileText,
  ShieldCheck,
  Users,
} from "lucide-react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "About Us", href: "/about-us" },
  { label: "FAQ", href: "/faq" },
];

const features = [
  {
    title: "Centralized Risk Register",
    desc: "Track & control all risks",
    icon: ClipboardList,
  },
  {
    title: "Smart Risk Analysis",
    desc: "Visual insights & scoring",
    icon: ShieldCheck,
  },
  {
    title: "Action & Task Workflow",
    desc: "Collaborate & follow up",
    icon: FileText,
  },
  {
    title: "Stakeholder Management",
    desc: "Keep everyone aligned",
    icon: Users,
  },
  {
    title: "Automated Reports",
    desc: "Export in one click",
    icon: BarChart3,
  },
];

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto grid h-[82px] max-w-[1480px] grid-cols-[auto_1fr_auto] items-center px-6 lg:px-8 xl:px-10">
          <Link href="/" className="flex items-center gap-3 justify-self-start">
            <Image
              src="/logo-icon.png"
              alt="RiskBases logo"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
              priority
            />
            <span className="text-[22px] font-bold tracking-[-0.04em] text-slate-950">
              RiskBases
            </span>
          </Link>

          <nav className="hidden justify-center lg:flex">
            <div className="flex items-center gap-12">
              {navItems.map((item, index) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative text-[17px] font-medium transition ${
                    index === 0
                      ? "text-slate-950"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                  {index === 0 ? (
                    <span className="absolute -bottom-[28px] left-0 h-[3px] w-full rounded-full bg-violet-500" />
                  ) : null}
                </Link>
              ))}
            </div>
          </nav>

          <div className="hidden items-center gap-4 justify-self-end lg:flex">
            <Link
              href="/auth"
              className="inline-flex h-14 items-center justify-center rounded-full border border-slate-200 bg-white px-8 text-[17px] font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
            >
              Sign in
            </Link>

            <Link
              href="/book-demo"
              className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 px-8 text-[17px] font-semibold text-white shadow-[0_18px_40px_rgba(109,40,217,0.22)] transition hover:scale-[1.01]"
            >
              Book a demo
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      <section className="px-6 pb-14 pt-12 lg:px-8 xl:px-10">
        <div className="mx-auto grid max-w-[1480px] items-center gap-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] xl:gap-4">
          <div className="max-w-[610px]">
            <h1 className="text-[60px] font-bold leading-[0.95] tracking-[-0.06em] text-slate-950 xl:text-[74px]">
              Take Control of Risk.
              <br />
              Build{" "}
              <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
                Safer Projects.
              </span>
            </h1>

            <p className="mt-8 max-w-[560px] text-[20px] leading-[1.6] text-slate-500 xl:text-[22px]">
              RiskBases helps teams manage risks, actions, and stakeholders all
              in one powerful workspace. Stay proactive, stay compliant, stay
              ahead.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/book-demo"
                className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 px-8 text-[17px] font-semibold text-white shadow-[0_18px_40px_rgba(109,40,217,0.22)] transition hover:scale-[1.01]"
              >
                Book a demo
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                href="/pricing"
                className="inline-flex h-14 items-center justify-center rounded-full border border-slate-200 bg-white px-8 text-[17px] font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
              >
                Explore features
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-3 text-[16px] text-slate-500">
              <div className="flex items-center gap-1 text-yellow-400">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
              <span>Trusted by growing teams worldwide</span>
            </div>
          </div>

          <div className="relative h-[680px] w-full">
            <div className="absolute left-[4%] top-[10%] h-44 w-44 rounded-full bg-violet-200/30 blur-3xl" />
            <div className="absolute left-[12%] bottom-[8%] h-40 w-40 rounded-full bg-violet-100/40 blur-3xl" />

            <div className="absolute right-0 top-0 w-[88%] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
              <Image
                src="/workspace.png"
                alt="Workspace preview"
                width={1600}
                height={900}
                className="h-auto w-full object-cover"
                priority
              />
            </div>

            <div className="absolute left-[8%] top-[42%] w-[86%] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
              <Image
                src="/project.png"
                alt="Project preview"
                width={1600}
                height={900}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-8 lg:px-8 xl:px-10">
        <div className="mx-auto max-w-[1480px] rounded-[30px] border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <div className="grid md:grid-cols-2 xl:grid-cols-5">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className={[
                    "p-8",
                    index !== features.length - 1
                      ? "xl:border-r xl:border-slate-200"
                      : "",
                    index < 4
                      ? "md:border-b md:border-slate-200 xl:border-b-0"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-[20px] font-semibold tracking-[-0.02em] text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-[15px] leading-7 text-slate-500">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 pt-8 lg:px-8 xl:px-10">
        <div className="mx-auto max-w-[1480px] text-center">
          <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-slate-900">
            Trusted by teams who take risk seriously
          </h2>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[16px] text-slate-500">
            <span>Compliant</span>
            <span>Secure</span>
            <span>Scalable</span>
            <span>Always-up-to-date</span>
          </div>
        </div>
      </section>
    </main>
  );
}

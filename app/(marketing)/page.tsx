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

const features = [
  {
    title: "Centralized Risk Register",
    desc: "Track & control all risks in one structured workspace.",
    icon: ClipboardList,
  },
  {
    title: "Smart Risk Analysis",
    desc: "Score, review and prioritize risks with clear oversight.",
    icon: ShieldCheck,
  },
  {
    title: "Action & Task Workflow",
    desc: "Assign actions, follow progress and keep teams accountable.",
    icon: FileText,
  },
  {
    title: "Stakeholder Management",
    desc: "Keep internal and external stakeholders aligned in one place.",
    icon: Users,
  },
  {
    title: "Automated Reports",
    desc: "Create clean reports and insights without scattered spreadsheets.",
    icon: BarChart3,
  },
];

export default function MarketingPage() {
  return (
    <main className="overflow-hidden bg-[#f7f8fc] text-slate-950">
      <section className="relative px-6 pb-20 pt-14 lg:px-8 xl:px-10">
        <div className="mx-auto grid max-w-[1480px] items-center gap-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] xl:gap-4">
          <div className="max-w-[610px]">
            <h1 className="text-[60px] font-bold leading-[0.95] tracking-[-0.065em] text-slate-950 xl:text-[86px]">
              Take Control of
              <br />
              Risk.
              <br />
              Build{" "}
              <span className="bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-500 bg-clip-text text-transparent">
                Safer
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-500 bg-clip-text text-transparent">
                Projects.
              </span>
            </h1>

            <p className="mt-8 max-w-[560px] text-[20px] leading-[1.65] text-slate-500 xl:text-[22px]">
              RiskBases helps teams manage risks, actions, and stakeholders all
              in one powerful workspace. Stay proactive, stay compliant, stay
              ahead.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/book-demo"
                className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 px-8 text-[17px] font-semibold text-white shadow-[0_18px_40px_rgba(109,40,217,0.24)] transition hover:scale-[1.01]"
              >
                Book a demo
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                href="/features"
                className="inline-flex h-14 items-center justify-center rounded-full border border-slate-200 bg-white px-8 text-[17px] font-semibold text-slate-700 shadow-[0_4px_18px_rgba(15,23,42,0.06)] transition hover:border-slate-300 hover:text-slate-950"
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

          <div className="relative h-[730px] w-full">
            <div className="pointer-events-none absolute inset-0 overflow-visible">
              <div className="absolute right-[8%] top-[8%] h-[280px] w-[280px] rounded-full bg-violet-400/20 blur-3xl animate-[floatGlow_10s_ease-in-out_infinite]" />
              <div className="absolute left-[10%] top-[36%] h-[240px] w-[240px] rounded-full bg-fuchsia-300/20 blur-3xl animate-[floatGlow_12s_ease-in-out_infinite_reverse]" />
              <div className="absolute right-[18%] bottom-[10%] h-[260px] w-[260px] rounded-full bg-indigo-300/20 blur-3xl animate-[floatGlow_14s_ease-in-out_infinite]" />
              <div className="absolute left-[20%] bottom-[16%] h-[180px] w-[180px] rounded-full bg-violet-500/10 blur-3xl animate-[floatGlow_16s_ease-in-out_infinite_reverse]" />
            </div>

            <div className="absolute inset-0 rounded-[38px] bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.10),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.10),transparent_28%)]" />

            <div className="absolute right-0 top-0 w-[92%] overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <Image
                src="/workspace.png"
                alt="Workspace preview"
                width={1600}
                height={900}
                className="h-auto w-full object-cover"
                priority
              />
            </div>

            <div className="absolute left-[8%] top-[52%] w-[84%] overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.12)]">
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

      <section className="px-6 pb-20 pt-8 lg:px-8 xl:px-10">
        <div className="mx-auto max-w-[1480px] text-center">
          <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-slate-900">
            Trusted by teams who take risk seriously
          </h2>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[16px] text-slate-500">
            <span>Compliant</span>
            <span>Secure</span>
            <span>Scalable</span>
            <span>Always up-to-date</span>
          </div>
        </div>
      </section>
    </main>
  );
}
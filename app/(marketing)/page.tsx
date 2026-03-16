import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FileText,
  ShieldCheck,
  Users,
  AlertTriangle,
  Layers,
  Zap,
  Eye,
  TrendingUp,
} from "lucide-react";

const problems = [
  { icon: AlertTriangle, title: "Risks scattered across spreadsheets", desc: "Teams work with separate files that become outdated, contain errors, and can't be connected to each other." },
  { icon: Eye, title: "No real-time visibility", desc: "Management lacks a current view of open risks, actions, and who is responsible for what." },
  { icon: Layers, title: "Stakeholders out of sync", desc: "Internal and external parties miss updates, become disconnected, and risk management turns reactive instead of proactive." },
];

const solutions = [
  { icon: ShieldCheck, title: "Central risk management", desc: "All risks, scores and actions in one place. Always current, always visible for the entire team." },
  { icon: Zap, title: "Automated reporting", desc: "Generate professional reports with one click. No more copy-pasting from spreadsheets." },
  { icon: TrendingUp, title: "Proactive insights", desc: "AI-driven analysis helps you prioritize risks before they escalate. Always one step ahead." },
];

const steps = [
  { number: "01", title: "Create a workspace", desc: "Invite your team and connect your projects in a shared environment. Operational within 5 minutes." },
  { number: "02", title: "Add risks & score them", desc: "Use the built-in scoring model to determine probability, impact and priority. Structured and repeatable." },
  { number: "03", title: "Assign actions to owners", desc: "Link control measures directly to team members with deadlines and progress tracking." },
  { number: "04", title: "Report & stay compliant", desc: "Generate ready-made reports for audits, stakeholders or management reviews." },
];

const features = [
  { title: "Centralized Risk Register", desc: "Track & control all risks in one structured workspace.", icon: ClipboardList },
  { title: "Smart Risk Analysis", desc: "Score, review and prioritize risks with clear oversight.", icon: ShieldCheck },
  { title: "Action & Task Workflow", desc: "Assign actions, follow progress and keep teams accountable.", icon: FileText },
  { title: "Stakeholder Management", desc: "Keep internal and external stakeholders aligned in one place.", icon: Users },
  { title: "Automated Reports", desc: "Create clean reports and insights without scattered spreadsheets.", icon: BarChart3 },
];

const testimonials = [
  { quote: "RiskBases completely transformed our risk management process. We save hours every week and our audits run flawlessly.", name: "Marieke van den Berg", role: "Risk Manager, Heijmans", initials: "MB" },
  { quote: "Finally a tool that fits how project teams actually work. Clear, fast, and always up-to-date.", name: "Thomas de Wit", role: "Project Director, Strukton", initials: "TW" },
  { quote: "The automated reporting alone has saved our team an enormous amount of time. A must for any construction company.", name: "Sandra Hoekstra", role: "Compliance Lead, BAM Infra", initials: "SH" },
];

export default function MarketingPage() {
  return (
    <main className="overflow-hidden bg-[#f7f8fc] text-slate-950">

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden bg-white">
        {/* ─── MASSIVE SWIRL — full right half, bleeds off screen ─── */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {/* The swirl lives in the right ~60% of the viewport, bleeds top+right */}
          <div
            className="absolute swirl-container"
            style={{ right: "-10%", top: "-20%", width: "72%", height: "140%" }}
          >
            <svg
              viewBox="0 0 1200 1200"
              xmlns="http://www.w3.org/2000/svg"
              className="h-full w-full"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                {/* === GRADIENTS — 8 distinct ones for rich layering === */}
                <radialGradient id="g-core" cx="50%" cy="50%" r="45%">
                  <stop offset="0%"   stopColor="#7c3aed" stopOpacity="1.00" />
                  <stop offset="40%"  stopColor="#6d28d9" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="g-arm1" cx="50%" cy="25%" r="60%">
                  <stop offset="0%"   stopColor="#8b5cf6" stopOpacity="0.95" />
                  <stop offset="45%"  stopColor="#7c3aed" stopOpacity="0.50" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="g-arm2" cx="50%" cy="75%" r="58%">
                  <stop offset="0%"   stopColor="#4f46e5" stopOpacity="0.90" />
                  <stop offset="40%"  stopColor="#6366f1" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="g-arm3" cx="75%" cy="50%" r="55%">
                  <stop offset="0%"   stopColor="#a78bfa" stopOpacity="0.80" />
                  <stop offset="50%"  stopColor="#8b5cf6" stopOpacity="0.30" />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="g-wisp1" cx="30%" cy="40%" r="50%">
                  <stop offset="0%"   stopColor="#c4b5fd" stopOpacity="0.70" />
                  <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="g-wisp2" cx="70%" cy="60%" r="50%">
                  <stop offset="0%"   stopColor="#818cf8" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="g-outer1" cx="50%" cy="20%" r="70%">
                  <stop offset="0%"   stopColor="#ddd6fe" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#ddd6fe" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="g-outer2" cx="50%" cy="80%" r="70%">
                  <stop offset="0%"   stopColor="#ede9fe" stopOpacity="0.50" />
                  <stop offset="100%" stopColor="#ede9fe" stopOpacity="0" />
                </radialGradient>

                {/* Filters */}
                <filter id="f-ultra" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="55" />
                </filter>
                <filter id="f-heavy" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="38" />
                </filter>
                <filter id="f-medium" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="26" />
                </filter>
                <filter id="f-soft" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="16" />
                </filter>
              </defs>

              {/* ── LAYER 1: Huge outer halo — barely visible, massive reach ── */}
              <g filter="url(#f-ultra)" className="swirl-outer1">
                <ellipse cx="600" cy="350" rx="500" ry="700" fill="url(#g-outer1)" />
              </g>
              <g filter="url(#f-ultra)" className="swirl-outer2">
                <ellipse cx="600" cy="850" rx="480" ry="660" fill="url(#g-outer2)" />
              </g>

              {/* ── LAYER 2: Wide arm wisps ── */}
              <g filter="url(#f-heavy)" className="swirl-wisp1">
                <ellipse cx="420" cy="480" rx="360" ry="520" fill="url(#g-wisp1)" />
              </g>
              <g filter="url(#f-heavy)" className="swirl-wisp2">
                <ellipse cx="780" cy="720" rx="340" ry="500" fill="url(#g-wisp2)" />
              </g>

              {/* ── LAYER 3: Main swirl arms — tall narrow ellipses ── */}
              <g filter="url(#f-heavy)" className="swirl-arm1">
                <ellipse cx="580" cy="380" rx="140" ry="560" fill="url(#g-arm1)" />
              </g>
              <g filter="url(#f-heavy)" className="swirl-arm2">
                <ellipse cx="620" cy="820" rx="155" ry="520" fill="url(#g-arm2)" />
              </g>
              <g filter="url(#f-medium)" className="swirl-arm3">
                <ellipse cx="750" cy="580" rx="180" ry="420" fill="url(#g-arm3)" />
              </g>

              {/* ── LAYER 4: Dense core ── */}
              <g filter="url(#f-medium)" className="swirl-core">
                <ellipse cx="600" cy="580" rx="220" ry="320" fill="url(#g-core)" />
              </g>

              {/* ── LAYER 5: Bright hot spot ── */}
              <g filter="url(#f-soft)" className="swirl-hotspot">
                <ellipse cx="600" cy="560" rx="100" ry="140" fill="#9333ea" fillOpacity="0.75" />
              </g>
            </svg>
          </div>
        </div>

        {/* ─── HERO CONTENT ─── */}
        <div className="relative mx-auto grid max-w-[1480px] items-center gap-0 px-6 pb-28 pt-16 lg:grid-cols-[480px_1fr] lg:gap-8 lg:px-10 xl:grid-cols-[520px_1fr]">

          {/* LEFT: copy — hard left, fixed width */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-[13px] font-semibold text-violet-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500" />
              AI-driven risk management platform
            </div>

            <h1 className="text-[58px] font-bold leading-[0.94] tracking-[-0.065em] text-slate-950 xl:text-[78px]">
              Take Control
              <br />
              of Risk.
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-500 bg-clip-text text-transparent">
                Build Safer
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-500 bg-clip-text text-transparent">
                Projects.
              </span>
            </h1>

            <p className="mt-8 text-[18px] leading-[1.7] text-slate-500 xl:text-[19px]">
              RiskBases helps teams manage risks, actions,
              <br />
              and stakeholders all in one powerful workspace.
              <br />
              Stay proactive, stay compliant, stay ahead.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/book-demo"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 px-7 text-[16px] font-semibold text-white shadow-[0_12px_36px_rgba(109,40,217,0.34)] transition hover:scale-[1.02] hover:shadow-[0_18px_48px_rgba(109,40,217,0.44)]"
              >
                Book a demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/features"
                className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-7 text-[16px] font-semibold text-slate-700 shadow-[0_4px_14px_rgba(15,23,42,0.06)] transition hover:border-slate-300 hover:text-slate-950"
              >
                Explore features
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-3 text-[14px] text-slate-500">
              <span className="text-[16px] tracking-tight text-yellow-400">★★★★★</span>
              <span>Trusted by growing teams worldwide</span>
            </div>
          </div>

          {/* RIGHT: screenshots — larger, tighter stack */}
          <div className="relative h-[660px] w-full">
            {/* TOP card */}
            <div
              className="absolute right-0 top-0 w-full overflow-hidden rounded-[20px] border border-slate-200/80 bg-white"
              style={{ boxShadow: "0 8px 40px rgba(15,23,42,0.10), 0 2px 8px rgba(15,23,42,0.05)" }}
            >
              <Image
                src="/workspace.png"
                alt="Workspace overview"
                width={1600}
                height={900}
                className="h-auto w-full object-cover"
                priority
              />
            </div>

            {/* BOTTOM card — overlaps top by 24px, slightly left inset */}
            <div
              className="absolute left-[-2%] w-[98%] overflow-hidden rounded-[20px] border border-slate-200/80 bg-white"
              style={{
                top: "calc(48% - 24px)",
                boxShadow: "0 20px 70px rgba(15,23,42,0.16), 0 4px 16px rgba(15,23,42,0.08)",
              }}
            >
              <Image
                src="/project.png"
                alt="Project dashboard"
                width={1600}
                height={900}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES ROW */}
      <section className="px-6 pb-8 pt-8 lg:px-10">
        <div className="mx-auto max-w-[1480px] rounded-[24px] border border-slate-200 bg-white shadow-[0_8px_40px_rgba(15,23,42,0.05)]">
          <div className="grid md:grid-cols-2 xl:grid-cols-5">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={[
                    "p-7",
                    index !== features.length - 1 ? "xl:border-r xl:border-slate-100" : "",
                    index < 4 ? "md:border-b md:border-slate-100 xl:border-b-0" : "",
                  ].filter(Boolean).join(" ")}
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-[14px] leading-6 text-slate-500">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-[1480px]">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-[13px] font-semibold text-red-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            The problem
          </div>
          <h2 className="mt-4 max-w-[600px] text-[40px] font-bold leading-[1.05] tracking-[-0.05em] text-slate-950 xl:text-[52px]">
            Risk management is still{" "}
            <span className="text-red-500">broken.</span>
          </h2>
          <p className="mt-5 max-w-[500px] text-[18px] leading-[1.7] text-slate-500">
            Most teams manage risks with Excel, email, and separate Word documents. The result: outdated data, missed signals, and reactions that come too late.
          </p>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {problems.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="rounded-[20px] border border-red-100/60 bg-white p-8 shadow-[0_4px_24px_rgba(239,68,68,0.06)]">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-slate-900">{p.title}</h3>
                  <p className="mt-3 text-[15px] leading-7 text-slate-500">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* THE SOLUTION */}
      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-[1480px]">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-[13px] font-semibold text-violet-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            The solution
          </div>
          <h2 className="mt-4 max-w-[600px] text-[40px] font-bold leading-[1.05] tracking-[-0.05em] text-slate-950 xl:text-[52px]">
            One platform for everything.{" "}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">Always in control.</span>
          </h2>
          <p className="mt-5 max-w-[500px] text-[18px] leading-[1.7] text-slate-500">
            RiskBases replaces the patchwork of tools with one integrated workspace where risks, actions and reporting come together.
          </p>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {solutions.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="rounded-[20px] border border-violet-100/60 bg-white p-8 shadow-[0_4px_24px_rgba(109,40,217,0.06)]">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-slate-900">{s.title}</h3>
                  <p className="mt-3 text-[15px] leading-7 text-slate-500">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-[1480px]">
          <div className="mb-14 max-w-[540px]">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600">
              How it works
            </div>
            <h2 className="text-[40px] font-bold leading-[1.05] tracking-[-0.05em] text-slate-950 xl:text-[52px]">
              From risk to action in{" "}
              <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">four steps.</span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-7 hidden h-px w-full translate-x-1/2 border-t border-dashed border-violet-200 xl:block" />
                )}
                <div className="relative rounded-[20px] border border-slate-200 bg-white p-7 shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
                  <div className="mb-5 select-none text-[42px] font-bold leading-none tracking-[-0.06em] text-violet-100">{step.number}</div>
                  <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-slate-900">{step.title}</h3>
                  <p className="mt-3 text-[14px] leading-6 text-slate-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-[1480px]">
          <div className="mb-14 text-center">
            <h2 className="text-[36px] font-bold tracking-[-0.05em] text-slate-950 xl:text-[44px]">What our customers say</h2>
            <p className="mt-4 text-[17px] text-slate-500">Teams in construction, infrastructure and project management trust RiskBases.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="flex flex-col rounded-[20px] border border-slate-200 bg-white p-8 shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
                <p className="flex-1 text-[16px] leading-[1.75] text-slate-700">"{t.quote}"</p>
                <div className="mt-7 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-[13px] font-bold text-white">{t.initials}</div>
                  <div>
                    <div className="text-[14px] font-semibold text-slate-900">{t.name}</div>
                    <div className="text-[13px] text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="px-6 pb-8 lg:px-10">
        <div className="mx-auto max-w-[1480px] rounded-[24px] border border-slate-200 bg-white px-10 py-10 shadow-[0_8px_40px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col items-center justify-between gap-6 text-center lg:flex-row lg:text-left">
            <h2 className="text-[26px] font-bold tracking-[-0.04em] text-slate-950 xl:text-[32px]">Trusted by teams who take risk seriously</h2>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[15px] font-medium text-slate-400">
              <span>Compliant</span><span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>Secure</span><span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>Scalable</span><span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>Always up-to-date</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-[1480px]">
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-violet-600 via-violet-600 to-indigo-600 px-10 py-16 text-center shadow-[0_24px_80px_rgba(109,40,217,0.30)] md:px-16">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/4 top-0 h-64 w-64 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute bottom-0 right-1/4 h-64 w-64 translate-y-1/2 rounded-full bg-indigo-400/20 blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-[36px] font-bold tracking-[-0.05em] text-white xl:text-[48px]">Ready to take control of your risks?</h2>
              <p className="mx-auto mt-5 max-w-[480px] text-[17px] leading-[1.7] text-violet-100">
                Book a free demo and discover how RiskBases helps your team stay proactive, compliant and always up-to-date.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link href="/book-demo" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-[16px] font-semibold text-violet-700 shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition hover:scale-[1.02]">
                  Book a demo <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/auth" className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 text-[16px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
                  Start for free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          KEYFRAME ANIMATIONS
      ══════════════════════════════════════════════════════ */}
      <style>{`
        /* ── Container: the whole swirl slowly rotates ── */
        .swirl-container {
          animation: masterSpin 32s linear infinite;
          transform-origin: 55% 48%;
        }
        @keyframes masterSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ── Outer halos: very slow drift ── */
        .swirl-outer1 {
          transform-origin: 50% 29%;
          animation: outerDrift1 22s ease-in-out infinite;
        }
        @keyframes outerDrift1 {
          0%,100% { transform: rotate(0deg) scale(1); opacity: 0.6; }
          50%     { transform: rotate(28deg) scale(1.10); opacity: 0.85; }
        }
        .swirl-outer2 {
          transform-origin: 50% 71%;
          animation: outerDrift2 26s ease-in-out infinite;
        }
        @keyframes outerDrift2 {
          0%,100% { transform: rotate(0deg) scale(1); opacity: 0.55; }
          50%     { transform: rotate(-22deg) scale(1.08); opacity: 0.80; }
        }

        /* ── Wisps: medium drift ── */
        .swirl-wisp1 {
          transform-origin: 35% 40%;
          animation: wispMove1 15s ease-in-out infinite;
        }
        @keyframes wispMove1 {
          0%,100% { transform: rotate(0deg) scaleY(1) scaleX(1); opacity: 0.7; }
          33%     { transform: rotate(20deg) scaleY(1.12) scaleX(0.9); opacity: 1; }
          66%     { transform: rotate(-12deg) scaleY(0.92) scaleX(1.1); opacity: 0.8; }
        }
        .swirl-wisp2 {
          transform-origin: 65% 60%;
          animation: wispMove2 18s ease-in-out infinite;
        }
        @keyframes wispMove2 {
          0%,100% { transform: rotate(0deg) scaleY(1); opacity: 0.65; }
          40%     { transform: rotate(-25deg) scaleY(1.15); opacity: 0.9; }
          70%     { transform: rotate(15deg) scaleY(0.88); opacity: 0.7; }
        }

        /* ── Arms: fast counter-rotation for swirl effect ── */
        .swirl-arm1 {
          transform-origin: 48% 32%;
          animation: arm1Twist 10s ease-in-out infinite;
        }
        @keyframes arm1Twist {
          0%,100% { transform: rotate(0deg) scaleY(1) scaleX(1); }
          25%     { transform: rotate(38deg) scaleY(1.14) scaleX(0.85); }
          50%     { transform: rotate(70deg) scaleY(0.94) scaleX(1.12); }
          75%     { transform: rotate(38deg) scaleY(1.06) scaleX(0.92); }
        }
        .swirl-arm2 {
          transform-origin: 52% 68%;
          animation: arm2Twist 13s ease-in-out infinite;
        }
        @keyframes arm2Twist {
          0%,100% { transform: rotate(0deg) scaleY(1); }
          30%     { transform: rotate(-42deg) scaleY(1.16); }
          60%     { transform: rotate(-80deg) scaleY(0.90); }
          80%     { transform: rotate(-45deg) scaleY(1.05); }
        }
        .swirl-arm3 {
          transform-origin: 63% 48%;
          animation: arm3Twist 16s ease-in-out infinite;
        }
        @keyframes arm3Twist {
          0%,100% { transform: rotate(0deg) scale(1); opacity: 0.8; }
          50%     { transform: rotate(55deg) scale(1.18); opacity: 1; }
        }

        /* ── Core: breathes with slow scale ── */
        .swirl-core {
          transform-origin: 50% 48%;
          animation: coreBreathe 8s ease-in-out infinite;
        }
        @keyframes coreBreathe {
          0%,100% { transform: scale(1); opacity: 0.85; }
          50%     { transform: scale(1.18); opacity: 1; }
        }

        /* ── Hot spot: fast pulse ── */
        .swirl-hotspot {
          transform-origin: 50% 47%;
          animation: hotPulse 5s ease-in-out infinite;
        }
        @keyframes hotPulse {
          0%,100% { transform: scale(1); opacity: 0.75; }
          50%     { transform: scale(1.30); opacity: 1; }
        }
      `}</style>
    </main>
  );
}

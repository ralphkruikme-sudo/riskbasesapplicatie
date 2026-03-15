export default function PricingPage() {
  return (
    <main className="relative overflow-hidden bg-[#f8f6fb]">
      {/* zachte paarse achtergrond / glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[180px] h-[320px] w-[320px] rounded-full bg-purple-300/25 blur-3xl" />
        <div className="absolute right-[-80px] top-[120px] h-[320px] w-[320px] rounded-full bg-violet-300/25 blur-3xl" />
        <div className="absolute bottom-[180px] left-[20%] h-[260px] w-[260px] rounded-full bg-fuchsia-200/20 blur-3xl" />
        <div className="absolute bottom-[120px] right-[18%] h-[260px] w-[260px] rounded-full bg-purple-200/20 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-10 md:px-10 lg:px-12">
        {/* top content */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-[40px] font-semibold leading-tight tracking-[-0.03em] text-[#201a35] md:text-[52px]">
              Pick the plan that suits your team
            </h1>
            <p className="mt-3 text-lg text-[#6f6885]">
              Start free and scale up when you're ready.
            </p>
          </div>

          {/* monthly toggle UI */}
          <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 p-2 shadow-[0_12px_40px_rgba(125,82,255,0.08)] backdrop-blur">
            <div className="rounded-xl px-5 py-3 text-sm font-medium text-[#4c4662]">
              Monthly
            </div>

            <button
              type="button"
              aria-label="Toggle billing"
              className="relative h-8 w-14 rounded-full bg-[#ddd5f3] transition"
            >
              <span className="absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-sm" />
            </button>

            <div className="rounded-xl border border-[#ece7f8] bg-[#faf8ff] px-5 py-3 text-sm font-semibold text-[#7a4cff]">
              Save 20%
            </div>
          </div>
        </div>

        {/* pricing cards */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Starter */}
          <div className="rounded-[28px] border border-white/80 bg-white/90 px-8 pb-8 pt-10 shadow-[0_20px_60px_rgba(110,82,160,0.08)] backdrop-blur">
            <div className="text-center">
              <h2 className="text-[28px] font-semibold text-[#221b39]">Starter</h2>

              <div className="mt-5 flex items-end justify-center gap-1">
                <span className="text-[26px] font-semibold text-[#221b39]">$</span>
                <span className="text-[58px] font-semibold leading-none tracking-[-0.04em] text-[#221b39]">
                  149
                </span>
                <span className="mb-[10px] text-[24px] text-[#5e5873]">/mo</span>
              </div>

              <p className="mt-3 text-sm text-[#7c7690]">$119/mo annually</p>

              <p className="mx-auto mt-8 max-w-[260px] text-[17px] leading-7 text-[#5f596f]">
                For management teams centralize up to 3 projects.
              </p>

              <button className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#8e5cff] to-[#7b4dff] text-[17px] font-semibold text-white shadow-[0_10px_30px_rgba(123,77,255,0.28)] transition hover:opacity-95">
                Start with Starter
              </button>
            </div>

            <ul className="mt-8 space-y-4 text-[16px] text-[#5e5873]">
              {[
                "Up to 3 active projects",
                "Central risk register",
                "Basic risk analysis",
                "Action tracking",
                "Stakeholder overview",
                "PDF report export",
                "Email support",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-[7px] h-2 w-2 rounded-full bg-[#8a58ff]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Business */}
          <div className="relative rounded-[28px] border-2 border-[#8b5cff] bg-white/95 px-8 pb-8 pt-10 shadow-[0_24px_80px_rgba(123,77,255,0.16)] backdrop-blur">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#8e5cff] to-[#7b4dff] px-7 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(123,77,255,0.28)]">
              Most popular
            </div>

            <div className="text-center">
              <h2 className="text-[28px] font-semibold text-[#221b39]">Business</h2>

              <div className="mt-5 flex items-end justify-center gap-1">
                <span className="text-[26px] font-semibold text-[#221b39]">$</span>
                <span className="text-[58px] font-semibold leading-none tracking-[-0.04em] text-[#221b39]">
                  299
                </span>
                <span className="mb-[10px] text-[24px] text-[#5e5873]">/mo</span>
              </div>

              <p className="mt-3 text-sm text-[#7c7690]">$249/mo annually</p>

              <p className="mx-auto mt-8 max-w-[270px] text-[17px] leading-7 text-[#5f596f]">
                For growing teams measure your risk data to minimize project
                risks.
              </p>

              <button className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#8e5cff] to-[#7b4dff] text-[17px] font-semibold text-white shadow-[0_10px_30px_rgba(123,77,255,0.28)] transition hover:opacity-95">
                Start with Business
              </button>
            </div>

            <ul className="mt-8 space-y-4 text-[16px] text-[#5e5873]">
              {[
                "Up to 15 active projects",
                "Advanced risk analysis",
                "Project timeline view",
                "Custom risk scoring",
                "Full stakeholder management",
                "Advanced reporting",
                "Priority support",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-[7px] h-2 w-2 rounded-full bg-[#8a58ff]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Enterprise */}
          <div className="rounded-[28px] border border-white/80 bg-white/90 px-8 pb-8 pt-10 shadow-[0_20px_60px_rgba(110,82,160,0.08)] backdrop-blur">
            <div className="text-center">
              <h2 className="text-[28px] font-semibold text-[#221b39]">Enterprise</h2>

              <div className="mt-6">
                <span className="text-[38px] font-semibold tracking-[-0.03em] text-[#221b39]">
                  Custom pricing
                </span>
              </div>

              <p className="mx-auto mt-8 max-w-[280px] text-[17px] leading-7 text-[#5f596f]">
                For large organizations that need custom setup and governance.
              </p>

              <button className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl border border-[#ece7f8] bg-white text-[17px] font-semibold text-[#3b3451] shadow-[0_8px_25px_rgba(80,60,120,0.06)] transition hover:bg-[#faf8ff]">
                Contact sales
              </button>
            </div>

            <ul className="mt-8 space-y-4 text-[16px] text-[#5e5873]">
              {[
                "Unlimited projects",
                "Multi-workspace setup",
                "Custom modules",
                "Advanced permissions",
                "Custom onboarding",
                "API / integrations",
                "Custom security & compliance options",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-[7px] h-2 w-2 rounded-full bg-[#8a58ff]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA bottom */}
        <div className="relative mt-14 overflow-hidden rounded-[32px] border border-white/70 bg-white/55 px-6 py-14 text-center shadow-[0_16px_50px_rgba(123,77,255,0.08)] backdrop-blur">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[15%] top-1/2 h-36 w-36 -translate-y-1/2 rounded-full bg-purple-200/20 blur-3xl" />
            <div className="absolute right-[15%] top-1/2 h-36 w-36 -translate-y-1/2 rounded-full bg-violet-200/20 blur-3xl" />
          </div>

          <div className="relative">
            <h3 className="text-[42px] font-semibold tracking-[-0.03em] text-[#221b39]">
              Get started today
            </h3>
            <p className="mt-4 text-[20px] text-[#6f6885]">
              Start transforming your project risk management.
            </p>

            <button className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#8e5cff] to-[#7b4dff] px-8 text-[17px] font-semibold text-white shadow-[0_10px_30px_rgba(123,77,255,0.28)] transition hover:opacity-95">
              Start free trial
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
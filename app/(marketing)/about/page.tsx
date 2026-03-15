import Link from "next/link";

const values = [
  {
    title: "Clarity",
    text: "We believe risk management should be structured, understandable and actionable for every team.",
  },
  {
    title: "Control",
    text: "Projects move faster when risks, actions and responsibilities are visible in one place.",
  },
  {
    title: "Professionalism",
    text: "RiskBases is built for modern teams that want enterprise-level structure without unnecessary complexity.",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-[#f7f8fc] text-slate-950">
      <section className="px-6 pb-20 pt-16 lg:px-8">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-12">
              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[13px] font-semibold text-slate-700">
                Company
              </span>

              <h1 className="mt-5 text-[42px] font-bold tracking-[-0.05em] md:text-[60px]">
                Built for teams that want better control over project risk.
              </h1>

              <p className="mt-6 text-[18px] leading-8 text-slate-500">
                RiskBases is a modern risk management platform designed to help
                teams centralize risks, streamline actions, align stakeholders
                and improve project oversight in one powerful workspace.
              </p>

              <p className="mt-6 text-[18px] leading-8 text-slate-500">
                Our focus is simple: make risk management feel less fragmented,
                less manual and far more operational for real project teams.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/book-demo"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 px-6 text-[15px] font-semibold text-white"
                >
                  Book a demo
                </Link>
                <Link
                  href="/features"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-[15px] font-semibold text-slate-700 transition hover:border-slate-300"
                >
                  Explore features
                </Link>
              </div>
            </div>

            <div className="grid gap-6">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.04)]"
                >
                  <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-slate-900">
                    {value.title}
                  </h2>
                  <p className="mt-3 text-[16px] leading-8 text-slate-600">
                    {value.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
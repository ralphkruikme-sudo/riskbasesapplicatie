const studies = [
  {
    title: "Construction teams standardizing project risk workflows",
    text: "See how a growing project organization could centralize risks, actions and reporting into one structured process.",
  },
  {
    title: "Infrastructure programs improving stakeholder visibility",
    text: "Learn how teams can align internal and external stakeholders with clearer ownership and centralized oversight.",
  },
  {
    title: "Operational teams reducing spreadsheet dependency",
    text: "Explore how replacing fragmented files with one shared workspace improves reporting and accountability.",
  },
];

export default function CaseStudiesPage() {
  return (
    <main className="bg-[#f7f8fc] text-slate-950">
      <section className="px-6 pb-20 pt-16 lg:px-8">
        <div className="mx-auto max-w-[1100px]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-12">
            <span className="inline-flex rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-[13px] font-semibold text-violet-700">
              Case Studies
            </span>

            <h1 className="mt-5 text-[42px] font-bold tracking-[-0.05em] md:text-[56px]">
              Examples of how structured risk management creates better control.
            </h1>

            <div className="mt-10 grid gap-6">
              {studies.map((study) => (
                <div
                  key={study.title}
                  className="rounded-[28px] border border-slate-200 p-7"
                >
                  <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-slate-900">
                    {study.title}
                  </h2>
                  <p className="mt-3 text-[16px] leading-8 text-slate-600">
                    {study.text}
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
const guides = [
  "How to build a structured risk register",
  "How to assign actions across teams",
  "How to keep stakeholders aligned",
  "How to improve reporting workflows",
  "How to standardize project oversight",
  "How to reduce spreadsheet dependency",
];

export default function GuidesPage() {
  return (
    <main className="bg-[#f7f8fc] text-slate-950">
      <section className="px-6 pb-20 pt-16 lg:px-8">
        <div className="mx-auto max-w-[1100px]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-12">
            <span className="inline-flex rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-[13px] font-semibold text-violet-700">
              Guides
            </span>

            <h1 className="mt-5 text-[42px] font-bold tracking-[-0.05em] md:text-[56px]">
              Practical guides for better risk workflows.
            </h1>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {guides.map((guide) => (
                <div
                  key={guide}
                  className="rounded-[24px] border border-slate-200 p-6"
                >
                  <h2 className="text-[18px] font-semibold text-slate-900">
                    {guide}
                  </h2>
                  <p className="mt-2 text-[15px] leading-7 text-slate-600">
                    Practical playbooks and structured guidance for teams that
                    want stronger project control.
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
const docs = [
  "Getting started with RiskBases",
  "Workspace setup and onboarding",
  "Projects, risks and actions",
  "Stakeholder structure",
  "Reports and exports",
  "Permissions and collaboration",
];

export default function DocumentationPage() {
  return (
    <main className="bg-[#f7f8fc] text-slate-950">
      <section className="px-6 pb-20 pt-16 lg:px-8">
        <div className="mx-auto max-w-[1100px]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-12">
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[13px] font-semibold text-slate-700">
              Resources
            </span>

            <h1 className="mt-5 text-[42px] font-bold tracking-[-0.05em] md:text-[56px]">
              Documentation
            </h1>

            <p className="mt-5 max-w-[760px] text-[18px] leading-8 text-slate-500">
              Explore how RiskBases works, from workspace setup to risk tracking,
              actions, reporting and collaboration.
            </p>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {docs.map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-slate-200 p-6 transition hover:border-violet-200 hover:bg-violet-50/40"
                >
                  <h2 className="text-[18px] font-semibold text-slate-900">
                    {item}
                  </h2>
                  <p className="mt-2 text-[15px] leading-7 text-slate-600">
                    Clear product documentation to help teams implement and use
                    RiskBases with confidence.
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
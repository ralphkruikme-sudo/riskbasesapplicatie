const posts = [
  "Why project teams still struggle with fragmented risk tracking",
  "From spreadsheets to structured risk management",
  "How modern teams improve accountability with action workflows",
  "What better stakeholder visibility means for project delivery",
  "Why reporting should not be a last-minute process",
  "The future of digital risk management platforms",
];

export default function BlogPage() {
  return (
    <main className="bg-[#f7f8fc] text-slate-950">
      <section className="px-6 pb-20 pt-16 lg:px-8">
        <div className="mx-auto max-w-[1100px]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-12">
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[13px] font-semibold text-slate-700">
              Blog
            </span>

            <h1 className="mt-5 text-[42px] font-bold tracking-[-0.05em] md:text-[56px]">
              Insights on risk, workflows and project control.
            </h1>

            <div className="mt-10 grid gap-5">
              {posts.map((post) => (
                <article
                  key={post}
                  className="rounded-[24px] border border-slate-200 p-6 transition hover:border-violet-200 hover:bg-violet-50/30"
                >
                  <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-slate-900">
                    {post}
                  </h2>
                  <p className="mt-3 text-[15px] leading-7 text-slate-600">
                    A deeper look at how teams can reduce fragmentation,
                    standardize processes and build stronger project oversight.
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
import Link from "next/link";

const contactOptions = [
  {
    title: "Sales",
    text: "Interested in RiskBases for your team or organization? Get in touch to discuss use cases, workflows and fit.",
  },
  {
    title: "Support",
    text: "Need help with the platform, onboarding or product questions? We are here to help.",
  },
  {
    title: "Partnerships",
    text: "Want to explore integration, collaboration or implementation opportunities? Let’s connect.",
  },
];

export default function ContactPage() {
  return (
    <main className="bg-[#f7f8fc] text-slate-950">
      <section className="px-6 pb-20 pt-16 lg:px-8">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-12">
              <span className="inline-flex rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-[13px] font-semibold text-violet-700">
                Contact
              </span>

              <h1 className="mt-5 text-[42px] font-bold tracking-[-0.05em] md:text-[60px]">
                Let’s talk about RiskBases.
              </h1>

              <p className="mt-6 text-[18px] leading-8 text-slate-500">
                Whether you want a demo, have product questions or want to
                explore a collaboration, we would love to hear from you.
              </p>

              <div className="mt-8 space-y-4 text-[16px] text-slate-600">
                <p>Email: hello@riskbases.com</p>
                <p>Response time: typically within 1–2 business days</p>
                <p>Focus: demo requests, onboarding, partnerships, support</p>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/book-demo"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 px-6 text-[15px] font-semibold text-white"
                >
                  Book a demo
                </Link>
                <Link
                  href="mailto:hello@riskbases.com"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-[15px] font-semibold text-slate-700"
                >
                  Email us
                </Link>
              </div>
            </div>

            <div className="grid gap-6">
              {contactOptions.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.04)]"
                >
                  <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-slate-900">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-[16px] leading-8 text-slate-600">
                    {item.text}
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
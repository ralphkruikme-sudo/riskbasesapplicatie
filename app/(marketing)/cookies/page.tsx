import Link from "next/link";

const cookieTypes = [
  {
    title: "Essential cookies",
    text: "These cookies are necessary for the website and platform to function properly, including security, authentication, navigation and basic usability.",
  },
  {
    title: "Preference cookies",
    text: "These cookies remember settings such as language, session preferences and interface choices to improve your experience.",
  },
  {
    title: "Analytics cookies",
    text: "These cookies help us understand how visitors use the website and platform so we can improve performance, design and content.",
  },
  {
    title: "Marketing cookies",
    text: "Where used, these cookies may help measure campaign performance and improve communication relevance. They are not essential to core site functionality.",
  },
];

export default function CookiePage() {
  return (
    <main className="bg-[#f7f8fc] text-slate-950">
      <section className="px-6 pb-20 pt-16 lg:px-8">
        <div className="mx-auto max-w-[980px]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-12">
            <span className="inline-flex rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-[13px] font-semibold text-violet-700">
              Cookies
            </span>

            <h1 className="mt-5 text-[42px] font-bold tracking-[-0.05em] md:text-[56px]">
              Cookie Policy
            </h1>

            <p className="mt-5 max-w-[760px] text-[18px] leading-8 text-slate-500">
              This Cookie Policy explains how RiskBases uses cookies and similar
              technologies to support functionality, understand usage and
              improve the overall experience.
            </p>

            <div className="mt-10 rounded-[24px] border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-[20px] font-semibold text-slate-900">
                What are cookies?
              </h2>
              <p className="mt-3 text-[16px] leading-8 text-slate-600">
                Cookies are small text files stored on your device when you
                visit a website. They help websites recognize users, remember
                preferences and collect usage information.
              </p>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {cookieTypes.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[24px] border border-slate-200 p-6"
                >
                  <h3 className="text-[18px] font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-7 text-slate-600">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 space-y-8">
              <section>
                <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-slate-900">
                  Managing cookies
                </h2>
                <p className="mt-3 text-[16px] leading-8 text-slate-600">
                  You can usually control or delete cookies through your browser
                  settings. Disabling certain cookies may affect site
                  functionality or reduce the quality of your experience.
                </p>
              </section>

              <section>
                <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-slate-900">
                  Changes to this policy
                </h2>
                <p className="mt-3 text-[16px] leading-8 text-slate-600">
                  We may update this Cookie Policy to reflect legal,
                  operational or technical changes. The most recent version will
                  always be available on this page.
                </p>
              </section>
            </div>

            <div className="mt-12 rounded-[24px] border border-slate-200 bg-slate-50 p-6">
              <p className="text-[15px] leading-7 text-slate-600">
                For broader information on data handling, view our{" "}
                <Link href="/privacy" className="font-medium text-violet-600 hover:text-violet-700">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
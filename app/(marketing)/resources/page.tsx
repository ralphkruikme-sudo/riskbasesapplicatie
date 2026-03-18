import Link from "next/link";
import {
  Search,
  ChevronDown,
  BookOpen,
  FileText,
  BriefcaseBusiness,
  FolderKanban,
} from "lucide-react";

const documentationLinks = [
  { label: "Getting Started", href: "/resources/docs/getting-started" },
  { label: "User Manual", href: "/resources/docs/user-manual" },
  { label: "API Documentation", href: "/resources/docs/api" },
];

const guideLinks = [
  { label: "Risk Management 101", href: "/resources/guides/risk-management-101" },
  { label: "Setting Up a Risk Register", href: "/resources/guides/risk-register-setup" },
  { label: "Conducting a Risk Assessment", href: "/resources/guides/risk-assessment" },
];

const caseStudyLinks = [
  { label: "Construction", href: "/resources/case-studies/construction" },
  { label: "Infrastructure", href: "/resources/case-studies/infrastructure" },
  { label: "Maritime", href: "/resources/case-studies/maritime" },
];

const templateLinks = [
  { label: "Risk Register Template", href: "/resources/templates/risk-register-template" },
  { label: "Risk Review Checklist", href: "/resources/templates/risk-review-checklist" },
  { label: "Issue Log Template", href: "/resources/templates/issue-log-template" },
];

function ResourceListCard({
  icon,
  title,
  links,
}: {
  icon: React.ReactNode;
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="rounded-[28px] border border-[#ECE9F7] bg-white p-7 shadow-[0_10px_40px_rgba(41,31,89,0.04)]">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F4F1FF] text-[#6F5AE8]">
          {icon}
        </div>
        <h3 className="text-[19px] font-semibold text-[#1E1B39]">{title}</h3>
      </div>

      <div className="space-y-3">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="group flex items-start gap-2 text-[17px] text-[#6A6790] transition hover:text-[#4F46E5]"
          >
            <span className="mt-[2px] text-[#8C7CF3] transition group-hover:translate-x-0.5">
              →
            </span>
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-[#FCFBFF] text-[#1E1B39]">
      <section className="mx-auto w-full max-w-7xl px-6 pb-20 pt-16 md:px-8 lg:px-10 lg:pt-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-semibold tracking-[-0.04em] text-[#3E358A] md:text-6xl">
            Resources
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg text-[#66627F] md:text-[22px]">
            Insights, guides, templates and case studies for better risk
            management.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-5xl rounded-[26px] border border-[#ECE9F7] bg-white p-3 shadow-[0_12px_35px_rgba(41,31,89,0.06)]">
          <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_2fr]">
            <button className="flex h-16 items-center justify-between rounded-[18px] border border-[#ECE9F7] px-5 text-left transition hover:bg-[#FAF9FF]">
              <span className="flex items-center gap-2 text-[18px] font-medium text-[#2B2750]">
                Industry
                <ChevronDown className="h-4 w-4 text-[#7D78A3]" />
              </span>
              <span className="text-[18px] text-[#7D78A3]">All</span>
            </button>

            <button className="flex h-16 items-center justify-between rounded-[18px] border border-[#ECE9F7] px-5 text-left transition hover:bg-[#FAF9FF]">
              <span className="flex items-center gap-2 text-[18px] font-medium text-[#2B2750]">
                Type
                <ChevronDown className="h-4 w-4 text-[#7D78A3]" />
              </span>
              <span className="text-[18px] text-[#7D78A3]">All</span>
            </button>

            <div className="flex h-16 items-center rounded-[18px] border border-[#ECE9F7] px-5">
              <input
                type="text"
                placeholder="Search risk register, reporting, mitigation..."
                className="w-full bg-transparent text-[16px] text-[#2B2750] outline-none placeholder:text-[#8A87A3]"
              />
              <Search className="h-5 w-5 text-[#8A87A3]" />
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.9fr_0.95fr]">
          <div className="rounded-[34px] border border-[#F0ECFA] bg-[#F8F6FD] p-5 shadow-[0_12px_40px_rgba(41,31,89,0.04)]">
            <p className="mb-5 text-[14px] font-semibold uppercase tracking-[0.14em] text-[#7B6AE6]">
              Featured
            </p>

            <div className="rounded-[30px] border border-[#ECE9F7] bg-white p-6 shadow-[0_10px_30px_rgba(71,52,146,0.05)] md:p-8">
              <div className="grid items-center gap-8 md:grid-cols-[280px_1fr]">
                <div className="relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-[24px] border border-[#E9E5FA] bg-[linear-gradient(180deg,#F5F2FF_0%,#E8F0FF_100%)] p-6">
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-[radial-gradient(circle_at_bottom_left,rgba(112,92,234,0.22),transparent_55%)]" />
                  <div className="relative">
                    <div className="mx-auto h-[120px] w-[120px] rounded-[22px] bg-[linear-gradient(135deg,#7A73F8_0%,#6BC1FF_100%)] p-4 shadow-[0_18px_40px_rgba(93,92,235,0.28)]">
                      <div className="h-full w-full rounded-[16px] bg-white/80 p-3 backdrop-blur">
                        <div className="mb-2 grid grid-cols-4 gap-1">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <div
                              key={i}
                              className="h-2 rounded bg-[#C9D8FF]"
                            />
                          ))}
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          {Array.from({ length: 12 }).map((_, i) => (
                            <div
                              key={i}
                              className="h-3 rounded bg-[#DDE6FF]"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className="relative inline-flex h-12 items-center justify-center rounded-2xl bg-[linear-gradient(90deg,#6D63F5_0%,#5B8CFF_100%)] px-6 text-[16px] font-medium text-white shadow-[0_12px_25px_rgba(92,99,245,0.28)] transition hover:scale-[1.02]">
                    Download Template
                  </button>
                </div>

                <div className="max-w-xl">
                  <p className="text-[15px] font-semibold uppercase tracking-[0.12em] text-[#8A78EE]">
                    Featured
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#1F1A3D] md:text-[44px] md:leading-[1.08]">
                    Risk Register Template
                  </h2>
                  <p className="mt-5 max-w-lg text-[20px] leading-8 text-[#5F5A7B]">
                    Download a structured template to capture, score and track
                    project risks.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-[34px] border border-[#F0ECFA] bg-[#F8F6FD] p-5 shadow-[0_12px_40px_rgba(41,31,89,0.04)]">
            <p className="mb-5 text-[14px] font-semibold uppercase tracking-[0.14em] text-[#7B6AE6]">
              Spotlight
            </p>

            <div className="space-y-4">
              <Link
                href="/resources/case-studies/construction"
                className="block rounded-[26px] border border-[#ECE9F7] bg-white p-4 shadow-[0_8px_24px_rgba(41,31,89,0.04)] transition hover:-translate-y-0.5"
              >
                <div className="grid grid-cols-[110px_1fr] gap-4">
                  <div className="relative overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,#EEE9FF_0%,#F8F6FF_100%)]">
                    <div className="absolute left-2 top-2 rounded-xl bg-[#8C79F8] px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-white">
                      Case Study
                    </div>
                    <div className="flex h-full min-h-[110px] items-end justify-center p-3">
                      <div className="h-16 w-16 rounded-full bg-[#D9E5FF]" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[17px] font-semibold leading-6 text-[#1F1A3D]">
                      Construction Case Study
                    </h3>
                    <p className="mt-2 text-[15px] leading-6 text-[#66627F]">
                      How Leighton Contractors reduced onsite risk by 40%.
                    </p>
                    <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8A87A3]">
                      Success Story · 3 min read
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/resources/docs/getting-started"
                className="block rounded-[26px] border border-[#ECE9F7] bg-white p-4 shadow-[0_8px_24px_rgba(41,31,89,0.04)] transition hover:-translate-y-0.5"
              >
                <div className="grid grid-cols-[110px_1fr] gap-4">
                  <div className="relative overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,#EEE9FF_0%,#F8F6FF_100%)]">
                    <div className="absolute left-2 top-2 rounded-xl bg-[#A08BF9] px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-white">
                      Docs
                    </div>
                    <div className="flex h-full min-h-[110px] items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
                        <BookOpen className="h-8 w-8 text-[#6F5AE8]" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[17px] font-semibold leading-6 text-[#1F1A3D]">
                      Getting Started with RiskBases
                    </h3>
                    <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8A87A3]">
                      Docs · 5 min read
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </aside>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <ResourceListCard
            icon={<BookOpen className="h-5 w-5" />}
            title="Documentation"
            links={documentationLinks}
          />
          <ResourceListCard
            icon={<FileText className="h-5 w-5" />}
            title="Guides"
            links={guideLinks}
          />
          <ResourceListCard
            icon={<BriefcaseBusiness className="h-5 w-5" />}
            title="Case Studies"
            links={caseStudyLinks}
          />
          <ResourceListCard
            icon={<FolderKanban className="h-5 w-5" />}
            title="Templates"
            links={templateLinks}
          />
        </div>
      </section>
    </main>
  );
}
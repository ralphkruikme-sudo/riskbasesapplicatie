import Link from "next/link";
import {
  FileText,
  BookOpen,
  Newspaper,
  Download,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const resources = [
  {
    icon: FileText,
    type: "Guide",
    title: "How to structure a modern project risk register",
    description:
      "A practical framework for setting up a cleaner, more useful and more scalable risk register.",
    cta: "Read article",
    href: "/book-demo",
  },
  {
    icon: BookOpen,
    type: "Best Practice",
    title: "From Excel to one shared risk platform",
    description:
      "Why project teams are moving away from scattered spreadsheets and disconnected reporting.",
    cta: "Explore topic",
    href: "/book-demo",
  },
  {
    icon: Newspaper,
    type: "Insight",
    title: "What strong risk governance looks like in complex projects",
    description:
      "An overview of ownership, actions, escalation and reporting in professional project environments.",
    cta: "Learn more",
    href: "/book-demo",
  },
  {
    icon: Download,
    type: "Template",
    title: "Risk review checklist for project teams",
    description:
      "A practical checklist to support recurring risk reviews, action tracking and decision-making.",
    cta: "Get template",
    href: "/book-demo",
  },
];

const bullets = [
  "Guides for project and risk teams",
  "Templates and practical frameworks",
  "Insights for structured risk governance",
  "Content focused on real project environments",
];

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.18),transparent_26%),radial-gradient(circle_at_right_center,rgba(168,85,247,0.12),transparent_22%)]" />
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 lg:px-10 lg:py-28">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">
              RiskBases Resources
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Practical resources for stronger project risk management.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Explore guides, templates and insights designed to help teams
              improve visibility, governance and control over project risk.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/book-demo"
                className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                Book a demo
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                View features
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8 lg:px-10 lg:py-20">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {resources.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <Icon className="h-6 w-6" />
                </div>

                <p className="text-sm font-semibold text-violet-700">
                  {item.type}
                </p>

                <h3 className="mt-2 text-lg font-semibold text-slate-950">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {item.description}
                </p>

                <Link
                  href={item.href}
                  className="mt-5 inline-flex items-center text-sm font-semibold text-slate-900 transition hover:text-violet-700"
                >
                  {item.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:px-8 lg:grid-cols-2 lg:px-10 lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-700">
              What you can expect
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Useful content for real teams and real projects.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
              The Resources section is meant to support project teams with
              practical content instead of vague theory.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {bullets.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-violet-600" />
                  <p className="text-sm font-medium leading-6 text-slate-700">
                    {item}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8 lg:px-10 lg:py-24">
        <div className="rounded-[32px] border border-slate-200 bg-slate-950 px-8 py-10 text-white md:px-12 md:py-14">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
              Want a guided walkthrough?
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              See how RiskBases supports your risk process end-to-end.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
              Book a demo and we’ll show how teams can centralize risks,
              coordinate actions and improve reporting.
            </p>

            <div className="mt-8">
              <Link
                href="/book-demo"
                className="inline-flex items-center justify-center rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
              >
                Book a demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
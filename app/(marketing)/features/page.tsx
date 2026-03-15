import Link from "next/link";
import {
  ShieldCheck,
  BrainCircuit,
  BarChart3,
  BellRing,
  FileSpreadsheet,
  Users,
  Workflow,
  Building2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const coreFeatures = [
  {
    icon: ShieldCheck,
    title: "Central Risk Register",
    description:
      "Beheer alle projectrisico’s op één centrale plek met duidelijke status, eigenaarschap, impact en kans.",
  },
  {
    icon: BrainCircuit,
    title: "AI Risk Support",
    description:
      "Gebruik AI om sneller risico’s te signaleren, beschrijvingen te verbeteren en passende maatregelen voor te stellen.",
  },
  {
    icon: BarChart3,
    title: "Risk Analysis",
    description:
      "Voer gestructureerde analyses uit met kans x impact, prioritering en heldere visuele inzichten.",
  },
  {
    icon: BellRing,
    title: "Alerts & Follow-up",
    description:
      "Blijf op de hoogte van acties, deadlines en kritieke risico’s met slimme meldingen en opvolging.",
  },
  {
    icon: FileSpreadsheet,
    title: "Excel to Platform",
    description:
      "Stap af van losse spreadsheets en breng bestaande risico-overzichten eenvoudig onder in één platform.",
  },
  {
    icon: Users,
    title: "Stakeholder Collaboration",
    description:
      "Werk samen met projectteams, managers en stakeholders in één gedeelde omgeving met duidelijke verantwoordelijkheden.",
  },
  {
    icon: Workflow,
    title: "Action Management",
    description:
      "Koppel acties aan risico’s, wijs eigenaren toe en bewaak voortgang tot en met afronding.",
  },
  {
    icon: Building2,
    title: "Built for Complex Projects",
    description:
      "Ontworpen voor bouw, infra, offshore, vastgoed en andere projecten waar grip op risico essentieel is.",
  },
];

const featureHighlights = [
  "Snelle onboarding per workspace en project",
  "Duidelijke dashboards en prioriteiten",
  "Minder losse Excel-bestanden en handmatig werk",
  "Beter overzicht voor teams en management",
  "Schaalbaar voor meerdere projecten tegelijk",
  "Professionele, centrale risicobeheersing",
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.18),transparent_28%),radial-gradient(circle_at_left_center,rgba(168,85,247,0.12),transparent_24%)]" />
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 lg:px-10 lg:py-28">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">
              RiskBases Features
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Everything your team needs to manage project risk properly.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              RiskBases helps teams move from fragmented spreadsheets and static
              reporting to one modern platform for risk visibility, analysis,
              ownership and action.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/book-demo"
                className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                Book a demo
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8 lg:px-10 lg:py-20">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {coreFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="text-lg font-semibold text-slate-950">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:px-8 lg:grid-cols-2 lg:px-10 lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-700">
              Why teams choose RiskBases
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              More structure, more visibility, better decisions.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
              RiskBases is built to make risk management practical for real
              project teams. Not just documentation, but actual control.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {featureHighlights.map((item) => (
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
              Ready to see it in action?
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Bring your project risks into one professional platform.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
              Discover how RiskBases can help your team work with more control,
              consistency and confidence.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/book-demo"
                className="inline-flex items-center justify-center rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
              >
                Book a demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <Link
                href="/resources"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Explore resources
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
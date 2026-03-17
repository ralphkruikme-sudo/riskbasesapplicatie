import Link from "next/link";
import Image from "next/image";

const steps = [
  {
    number: "01",
    title: "Create a workspace",
    text: "Set up your workspace and invite your team in minutes.",
  },
  {
    number: "02",
    title: "Add and score risks",
    text: "Structure risks clearly and apply one consistent scoring model.",
  },
  {
    number: "03",
    title: "Assign actions",
    text: "Turn risks into clear ownership, deadlines and follow-up.",
  },
  {
    number: "04",
    title: "Report and improve",
    text: "Track progress and generate updates for every stakeholder.",
  },
];

const sections = [
  {
    id: "construction",
    eyebrow: "Built for real project environments",
    label: "Construction",
    title: "Created for teams that need clarity on site and in the office.",
    text: "RiskBases helps construction teams structure project risks, assign actions, monitor safety-related issues, and improve follow-up across every phase of delivery.",
    bullets: [
      "Project-based risk registers",
      "Clear ownership and deadlines",
      "Structured safety and compliance workflows",
      "Cleaner reporting for internal and external stakeholders",
    ],
    image: "/solutions-construction.jpg",
    alt: "Construction team on site",
    background: "bg-[#f3f4f7]",
    reverse: false,
  },
  {
    id: "infrastructure",
    eyebrow: "Designed for complex delivery",
    label: "Infrastructure",
    title: "Built for infrastructure teams managing many stakeholders and long timelines.",
    text: "Bring programs, phases, and project governance together in one consistent workflow designed for infrastructure environments.",
    bullets: [
      "Multi-stakeholder alignment",
      "Phase-based risk monitoring",
      "Program and project visibility",
      "Better governance and review structure",
    ],
    image: "/solutions-infrastructure.jpg",
    alt: "Infrastructure project environment",
    background: "bg-white",
    reverse: true,
  },
  {
    id: "maritime",
    eyebrow: "Operational visibility where it matters most",
    label: "Maritime & Offshore",
    title: "Structured risk management for operational and offshore environments.",
    text: "Track operational, technical, and compliance-related risks with a workflow that supports offshore and maritime teams.",
    bullets: [
      "Operational risk tracking",
      "Incident and action follow-up",
      "Audit-ready structure",
      "Centralized project records",
    ],
    image: "/solutions-maritime.jpg",
    alt: "Maritime and offshore operations",
    background: "bg-[#f3f4f7]",
    reverse: false,
  },
  {
    id: "enterprise",
    eyebrow: "One standard across the business",
    label: "Enterprise Teams",
    title: "Made for organizations that want consistency across teams and departments.",
    text: "Standardize workflows, improve reporting quality, and give leadership more visibility with one scalable setup for risk management.",
    bullets: [
      "Shared templates and workflows",
      "Role-based collaboration",
      "Executive reporting visibility",
      "Scalable governance across teams",
    ],
    image: "/solutions-enterprise.jpg",
    alt: "Enterprise teams collaborating",
    background: "bg-white",
    reverse: true,
  },
];

export default function SolutionsPage() {
  return (
    <main className="bg-white text-black">
      <section className="border-b border-neutral-200 bg-[#f5f5f7]">
        <div className="mx-auto max-w-[1180px] px-6 py-24 sm:px-8 lg:px-10 lg:py-32">
          <div className="max-w-[780px]">
            <p className="text-sm font-semibold text-neutral-900">Solutions</p>

            <h1 className="mt-5 text-[56px] font-bold leading-[0.95] tracking-[-0.06em] sm:text-[72px] lg:text-[88px]">
              Risk management
              <br />
              for real project
              <br />
              environments.
            </h1>

            <p className="mt-8 max-w-[640px] text-lg leading-8 text-neutral-600 sm:text-xl">
              One platform for construction, infrastructure, maritime &
              offshore, and enterprise teams — designed to bring more structure,
              accountability, and visibility to risk.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/book-demo"
                className="rounded-full bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                Book a demo
              </Link>

              <Link
                href="#construction"
                className="rounded-full border border-neutral-300 px-6 py-3.5 text-sm font-semibold text-neutral-900 transition hover:bg-white"
              >
                Explore solutions
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-[1180px] px-6 py-24 sm:px-8 lg:px-10 lg:py-28">
          <div className="max-w-[540px]">
            <p className="text-sm font-semibold text-neutral-900">How it works</p>

            <h2 className="mt-4 text-[48px] font-bold leading-[0.98] tracking-[-0.05em] sm:text-[64px]">
              From risk to action in four steps.
            </h2>
          </div>

          <div className="mt-14 grid gap-10 border-t border-neutral-200 pt-10 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number}>
                <div className="text-[34px] font-semibold tracking-[-0.04em] text-neutral-300">
                  {step.number}
                </div>

                <h3 className="mt-4 text-[22px] font-semibold tracking-[-0.03em] text-neutral-950">
                  {step.title}
                </h3>

                <p className="mt-4 max-w-[260px] text-base leading-8 text-neutral-700">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {sections.map((section) => (
        <section
          id={section.id}
          key={section.id}
          className={`${section.background} scroll-mt-28`}
        >
          <div className="mx-auto max-w-[1180px] px-6 py-24 sm:px-8 lg:px-10 lg:py-28">
            <div
              className={`grid items-center gap-14 lg:grid-cols-2 ${
                section.reverse ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div>
                <div className="overflow-hidden rounded-[24px] bg-neutral-200">
                  <Image
                    src={section.image}
                    alt={section.alt}
                    width={1200}
                    height={900}
                    className="h-[360px] w-full object-cover sm:h-[430px]"
                  />
                </div>
              </div>

              <div className="max-w-[540px]">
                <p className="text-sm font-semibold text-neutral-900">
                  {section.eyebrow}
                </p>

                <div className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
                  {section.label}
                </div>

                <h2 className="mt-4 text-[46px] font-bold leading-[0.98] tracking-[-0.05em] text-neutral-950 sm:text-[62px]">
                  {section.title}
                </h2>

                <p className="mt-6 text-lg leading-8 text-neutral-700">
                  {section.text}
                </p>

                <div className="mt-8 space-y-0">
                  {section.bullets.map((item) => (
                    <div
                      key={item}
                      className="border-t border-neutral-200 py-4 text-base leading-7 text-neutral-900"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-10 flex flex-wrap gap-4">
                  <Link
                    href="/book-demo"
                    className="rounded-full bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                  >
                    Book a demo
                  </Link>

                  <Link
                    href="/pricing"
                    className="rounded-full border border-neutral-300 px-6 py-3.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
                  >
                    View pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-[980px] px-6 py-24 text-center sm:px-8 lg:py-28">
          <p className="text-sm font-semibold text-neutral-900">Get started</p>

          <h2 className="mt-4 text-[46px] font-bold leading-[0.98] tracking-[-0.05em] text-neutral-950 sm:text-[62px]">
            See how RiskBases fits your team.
          </h2>

          <p className="mx-auto mt-6 max-w-[700px] text-lg leading-8 text-neutral-700">
            Explore how your workflow can be structured inside RiskBases with a
            clean, consistent setup for risk, actions, and reporting.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/book-demo"
              className="rounded-full bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              Book a demo
            </Link>

            <Link
              href="/contact"
              className="rounded-full border border-neutral-300 px-6 py-3.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
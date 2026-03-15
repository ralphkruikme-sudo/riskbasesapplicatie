import Link from "next/link";

const sections = [
  {
    title: "1. Introduction",
    text: "RiskBases respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store and protect information when you visit our website, request a demo, create an account, or use the RiskBases platform.",
  },
  {
    title: "2. Information We Collect",
    text: "We may collect personal information such as your name, email address, company name, job title, billing details, account credentials, and any information you provide through forms, demo requests, support conversations, or while using the platform. We may also collect technical data such as IP address, browser type, device information, usage data, referral sources, and cookie identifiers.",
  },
  {
    title: "3. How We Use Your Information",
    text: "We use your information to provide and improve our services, manage user accounts, process demo requests, communicate with you, maintain security, analyze website and product usage, comply with legal obligations, and support product development. We may also use limited data for service notifications, onboarding, support, and platform administration.",
  },
  {
    title: "4. Legal Bases for Processing",
    text: "Where applicable under GDPR, we process personal data on the basis of consent, performance of a contract, compliance with legal obligations, and our legitimate interests in operating, securing and improving RiskBases.",
  },
  {
    title: "5. Data Sharing",
    text: "We do not sell your personal data. We may share information with trusted service providers that help us operate the platform, such as hosting, analytics, authentication, payment, customer support, and communication providers. These parties process data only as necessary to perform services on our behalf and under appropriate safeguards.",
  },
  {
    title: "6. Data Retention",
    text: "We retain personal data only for as long as necessary to fulfill the purposes outlined in this policy, including maintaining accounts, meeting legal obligations, resolving disputes, enforcing agreements, and supporting legitimate business operations.",
  },
  {
    title: "7. Data Security",
    text: "RiskBases uses appropriate technical and organizational measures to protect personal data against unauthorized access, alteration, disclosure, or destruction. However, no online system can be guaranteed to be completely secure.",
  },
  {
    title: "8. International Transfers",
    text: "If personal data is transferred outside your jurisdiction, we take reasonable steps to ensure appropriate safeguards are in place, consistent with applicable privacy laws.",
  },
  {
    title: "9. Your Rights",
    text: "Depending on your location, you may have rights to access, correct, update, delete, restrict or object to the processing of your data, as well as rights related to portability and withdrawal of consent. You may contact us to exercise these rights.",
  },
  {
    title: "10. Cookies and Tracking",
    text: "We use cookies and related technologies to support site functionality, remember preferences, analyze traffic, and improve performance. For more details, see our Cookie Policy.",
  },
  {
    title: "11. Third-Party Links",
    text: "Our website may contain links to third-party websites or services. We are not responsible for the privacy practices or content of those third parties.",
  },
  {
    title: "12. Changes to This Policy",
    text: "We may update this Privacy Policy from time to time to reflect product, legal or operational changes. The latest version will always be published on this page.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="bg-[#f7f8fc] text-slate-950">
      <section className="px-6 pb-20 pt-16 lg:px-8">
        <div className="mx-auto max-w-[980px]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-12">
            <span className="inline-flex rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-[13px] font-semibold text-violet-700">
              Legal
            </span>

            <h1 className="mt-5 text-[42px] font-bold tracking-[-0.05em] text-slate-950 md:text-[56px]">
              Privacy Policy
            </h1>

            <p className="mt-5 max-w-[760px] text-[18px] leading-8 text-slate-500">
              This Privacy Policy explains how RiskBases collects, uses and
              protects your information across our website, demo flows and SaaS
              platform.
            </p>

            <div className="mt-10 space-y-10">
              {sections.map((section) => (
                <section key={section.title}>
                  <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-slate-900">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-[16px] leading-8 text-slate-600">
                    {section.text}
                  </p>
                </section>
              ))}
            </div>

            <div className="mt-12 rounded-[24px] border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-[18px] font-semibold text-slate-900">
                Questions about privacy?
              </h3>
              <p className="mt-2 text-[15px] leading-7 text-slate-600">
                For questions about data handling, privacy rights or compliance,
                please contact us through our{" "}
                <Link href="/contact" className="font-medium text-violet-600 hover:text-violet-700">
                  contact page
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
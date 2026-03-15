import Link from "next/link";

const sections = [
  {
    title: "1. Acceptance of Terms",
    text: "By accessing or using RiskBases, you agree to be bound by these Terms of Service. If you do not agree to these terms, you should not use the website or platform.",
  },
  {
    title: "2. Services",
    text: "RiskBases provides a software platform for managing project risks, actions, stakeholders, reporting and related workflows. Features may evolve over time as the platform develops.",
  },
  {
    title: "3. Accounts",
    text: "You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. You must provide accurate information and promptly update it when necessary.",
  },
  {
    title: "4. Acceptable Use",
    text: "You agree not to misuse the platform, interfere with its operation, attempt unauthorized access, upload malicious content, or use RiskBases for unlawful, harmful, fraudulent or abusive purposes.",
  },
  {
    title: "5. Intellectual Property",
    text: "All intellectual property rights in the RiskBases website, platform, branding, design, code and related materials remain the property of RiskBases or its licensors, unless otherwise stated.",
  },
  {
    title: "6. Customer Data",
    text: "You retain ownership of the data you submit to the platform. You grant RiskBases the limited rights necessary to host, process, transmit and display that data in order to operate and improve the service.",
  },
  {
    title: "7. Availability and Changes",
    text: "We aim to provide a reliable service, but we do not guarantee uninterrupted or error-free access. We may modify, suspend or discontinue features at any time.",
  },
  {
    title: "8. Fees and Billing",
    text: "If paid plans are introduced or used, you agree to pay all applicable fees in accordance with the relevant pricing terms. Billing, renewals and cancellations may be governed by additional commercial terms.",
  },
  {
    title: "9. Disclaimer",
    text: "RiskBases is provided on an 'as is' and 'as available' basis. To the fullest extent permitted by law, we disclaim warranties of any kind, whether express or implied.",
  },
  {
    title: "10. Limitation of Liability",
    text: "To the extent permitted by law, RiskBases shall not be liable for indirect, incidental, special, consequential or punitive damages, or for loss of profits, revenue, data or business opportunities arising from use of the platform.",
  },
  {
    title: "11. Termination",
    text: "We may suspend or terminate access to the platform if these terms are violated or if necessary to protect the service, users, legal compliance or business operations.",
  },
  {
    title: "12. Governing Terms",
    text: "These terms are governed by applicable law and may be updated from time to time. Continued use of the service after updates become effective constitutes acceptance of the revised terms.",
  },
];

export default function TermsPage() {
  return (
    <main className="bg-[#f7f8fc] text-slate-950">
      <section className="px-6 pb-20 pt-16 lg:px-8">
        <div className="mx-auto max-w-[980px]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-12">
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[13px] font-semibold text-slate-700">
              Legal
            </span>

            <h1 className="mt-5 text-[42px] font-bold tracking-[-0.05em] md:text-[56px]">
              Terms of Service
            </h1>

            <p className="mt-5 max-w-[760px] text-[18px] leading-8 text-slate-500">
              These Terms of Service govern access to and use of the RiskBases
              website, platform and related services.
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
              <p className="text-[15px] leading-7 text-slate-600">
                For questions regarding commercial terms, platform access or
                support, visit our{" "}
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
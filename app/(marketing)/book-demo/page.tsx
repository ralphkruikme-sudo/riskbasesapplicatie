import Image from "next/image";
import { Building2, Calendar, Clock3, Mail, User, Check } from "lucide-react";

export default function BookDemoPage() {
  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      <section className="mx-auto max-w-[1320px] px-6 pb-20 pt-8 md:px-8 md:pt-10">
        {/* Heading */}
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h1 className="text-[42px] font-semibold tracking-[-0.04em] text-[#19213d] md:text-[56px]">
            Book a Demo
          </h1>

          <p className="mt-4 text-[17px] leading-8 text-[#667085]">
            See how RiskBases can help you manage and mitigate risks.
            <br className="hidden sm:block" />
            Schedule a personalized demo with our experts today.
          </p>
        </div>

        {/* Main layout */}
        <div className="grid items-stretch gap-0 overflow-hidden rounded-[28px] border border-[#e7e9f2] bg-white shadow-[0_8px_30px_rgba(16,24,40,0.04)] lg:grid-cols-[560px_minmax(0,1fr)]">
          {/* Left form */}
          <div className="p-8 md:p-10">
            <form className="space-y-5">
              <div>
                <label className="mb-2 block text-[15px] font-medium text-[#24304a]">
                  Your name
                </label>
                <div className="flex h-[62px] items-center gap-3 rounded-[18px] border border-[#d9dfeb] bg-white px-5">
                  <User className="h-5 w-5 text-[#7b869c]" />
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full bg-transparent text-[16px] text-[#1d2742] outline-none placeholder:text-[#98a2b3]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[15px] font-medium text-[#24304a]">
                  Your email
                </label>
                <div className="flex h-[62px] items-center gap-3 rounded-[18px] border border-[#d9dfeb] bg-white px-5">
                  <Mail className="h-5 w-5 text-[#7b869c]" />
                  <input
                    type="email"
                    placeholder="Your email"
                    className="w-full bg-transparent text-[16px] text-[#1d2742] outline-none placeholder:text-[#98a2b3]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[15px] font-medium text-[#24304a]">
                  Your company
                </label>
                <div className="flex h-[62px] items-center gap-3 rounded-[18px] border border-[#d9dfeb] bg-white px-5">
                  <Building2 className="h-5 w-5 text-[#7b869c]" />
                  <input
                    type="text"
                    placeholder="Your company"
                    className="w-full bg-transparent text-[16px] text-[#1d2742] outline-none placeholder:text-[#98a2b3]"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[15px] font-medium text-[#24304a]">
                    Preferred date
                  </label>
                  <div className="flex h-[62px] items-center gap-3 rounded-[18px] border border-[#d9dfeb] bg-white px-5">
                    <Calendar className="h-5 w-5 text-[#7b869c]" />
                    <input
                      type="date"
                      className="w-full bg-transparent text-[16px] text-[#1d2742] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[15px] font-medium text-[#24304a]">
                    Preferred time
                  </label>
                  <div className="flex h-[62px] items-center gap-3 rounded-[18px] border border-[#d9dfeb] bg-white px-5">
                    <Clock3 className="h-5 w-5 text-[#7b869c]" />
                    <input
                      type="time"
                      className="w-full bg-transparent text-[16px] text-[#1d2742] outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 flex h-[62px] w-full items-center justify-center rounded-[18px] bg-[#1d2742] text-[18px] font-semibold text-white transition hover:bg-[#24304f]"
              >
                Submit
              </button>

              <p className="pt-1 text-center text-sm text-[#8b93a7]">
                We&apos;ll get back to you within 1 business day
              </p>
            </form>
          </div>

          {/* Right visual */}
          <div className="border-t border-[#eef1f6] bg-[#fbfcfe] lg:border-l lg:border-t-0">
            <div className="flex h-full items-center justify-center px-8 py-8 md:px-10 lg:px-12">
              <div className="relative w-full max-w-[620px]">
                <div className="relative aspect-[1.28/1] w-full">
                  <Image
                    src="/democall.png"
                    alt="RiskBases demo call"
                    fill
                    priority
                    className="object-contain object-center"
                    sizes="(max-width: 1024px) 100vw, 48vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mx-auto mt-10 max-w-4xl">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#eef2ff]">
                <Check className="h-4 w-4 text-[#4f46e5]" />
              </div>
              <p className="text-[18px] text-[#2d3754]">
                Get a customized walkthrough of our platform
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#eef2ff]">
                <Check className="h-4 w-4 text-[#4f46e5]" />
              </div>
              <p className="text-[18px] text-[#2d3754]">
                Learn how to tailor RiskBases to your industry needs
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#eef2ff]">
                <Check className="h-4 w-4 text-[#4f46e5]" />
              </div>
              <p className="text-[18px] text-[#2d3754]">
                Get your questions answered by our knowledgeable team
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
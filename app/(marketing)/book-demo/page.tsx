"use client";

import { FormEvent, useState } from "react";
import {
  CalendarDays,
  Building2,
  Users,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const benefits = [
  "Personal walkthrough of the platform",
  "See RiskBases applied to real project workflows",
  "Discuss your current Excel / risk process",
  "Explore fit for your team or organisation",
];

export default function BookDemoPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.18),transparent_28%),radial-gradient(circle_at_left_center,rgba(168,85,247,0.12),transparent_24%)]" />
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:px-8 lg:grid-cols-2 lg:px-10 lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">
              Book a RiskBases Demo
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              See how RiskBases can strengthen your risk management process.
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              Book a demo to explore how your team can centralize risks, track
              actions and improve visibility across projects.
            </p>

            <div className="mt-8 grid gap-4">
              {benefits.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-violet-600" />
                  <p className="text-sm font-medium leading-6 text-slate-700">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <CalendarDays className="h-5 w-5 text-violet-700" />
                <p className="mt-3 text-sm font-semibold text-slate-900">
                  20–30 min demo
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Compact, focused walkthrough.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Building2 className="h-5 w-5 text-violet-700" />
                <p className="mt-3 text-sm font-semibold text-slate-900">
                  Built for projects
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  For teams needing more control.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Users className="h-5 w-5 text-violet-700" />
                <p className="mt-3 text-sm font-semibold text-slate-900">
                  Team-focused
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Collaboration, ownership and follow-up.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:pl-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 md:p-8">
              {!submitted ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                      Request a demo
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Fill in your details and we’ll use this as your demo
                      request form.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label
                        htmlFor="fullName"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Full name
                      </label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        placeholder="Your name"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Work email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="name@company.com"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="company"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Company
                      </label>
                      <input
                        id="company"
                        name="company"
                        type="text"
                        placeholder="Your company"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="teamSize"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Team size
                      </label>
                      <select
                        id="teamSize"
                        name="teamSize"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Select team size
                        </option>
                        <option value="1-10">1 - 10</option>
                        <option value="11-50">11 - 50</option>
                        <option value="51-200">51 - 200</option>
                        <option value="200+">200+</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        What would you like to discuss?
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        placeholder="Tell us about your current risk process, challenges or goals..."
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                      />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
                    >
                      Submit request
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
                    Demo request submitted
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
                    Nice — this page is now visually working. Later kun je hier
                    Supabase, Formspree of een andere backend aan koppelen om de
                    form echt te versturen.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
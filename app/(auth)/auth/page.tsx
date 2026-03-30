"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type MessageType = "success" | "error" | "info";

export default function AuthPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageType | null>(null);

  function clearMessage() {
    setMessage("");
    setMessageType(null);
  }

  function showError(text: string) {
    setMessage(text);
    setMessageType("error");
  }

  function showSuccess(text: string) {
    setMessage(text);
    setMessageType("success");
  }

  async function redirectAfterAuth() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.push("/onboarding");
      return;
    }

    const { data: membership, error: membershipError } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (membershipError) {
      router.push("/onboarding");
      return;
    }

    if (membership?.workspace_id) {
      router.push("/app");
    } else {
      router.push("/onboarding");
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearMessage();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      await redirectAfterAuth();
    } catch (error: any) {
      showError(error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    clearMessage();

    if (!email.trim()) {
      showError("Please enter your email address first.");
      return;
    }

    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      showSuccess(
        "Password reset email sent. Please check your inbox and click the link in the email."
      );
    } catch (error: any) {
      showError(error?.message || "Could not send reset email.");
    } finally {
      setResetLoading(false);
    }
  }

  const messageStyles =
    messageType === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : messageType === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <main className="min-h-screen bg-slate-100 p-3 sm:p-4 lg:p-5">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1240px] items-center justify-center">
        <div className="relative grid w-full overflow-hidden rounded-[24px] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.10)] lg:min-h-[620px] lg:grid-cols-2 xl:min-h-[660px]">
          <div className="absolute left-0 top-7 z-20 flex items-center gap-3 px-7 sm:top-9 sm:px-9">
            <img
              src="/logo-icon.png"
              alt="RiskBases"
              className="h-11 w-11 rounded-xl object-contain"
            />
            <span className="whitespace-nowrap text-2xl font-bold tracking-[-0.03em] text-[#173269]">
              RiskBases
            </span>
          </div>

          <section className="flex w-full bg-white">
            <div className="flex w-full flex-col justify-center px-6 pb-6 pt-32 sm:px-8 sm:pb-8 sm:pt-36 lg:px-10 lg:pb-10 lg:pt-32 xl:px-12">
              <div className="w-full max-w-[430px]">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#173269]"
                >
                  <ArrowLeft size={16} />
                  Back to home
                </button>

                <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.03em] text-[#173269] sm:text-[36px] xl:text-[40px]">
                  Welcome back
                </h1>

                <p className="mt-2 text-[15px] text-slate-600 sm:text-[16px]">
                  Log in to RiskBases
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-3.5">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 px-5 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#173269] focus:bg-white"
                  />

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 px-5 pr-12 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#173269] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#173269]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={resetLoading}
                      className="text-sm font-medium text-[#173269] transition hover:text-[#10254f] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {resetLoading ? "Sending..." : "Forgot password?"}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="h-12 w-full rounded-full bg-[#173269] text-[16px] font-semibold text-white shadow-[0_10px_30px_rgba(23,50,105,0.22)] transition hover:bg-[#10254f] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Please wait..." : "Log in"}
                  </button>

                  {message ? (
                    <div
                      className={`rounded-2xl border px-4 py-3 text-sm ${messageStyles}`}
                    >
                      {message}
                    </div>
                  ) : null}
                </form>

                <div className="mt-6 text-sm text-slate-600">
                  Need access?{" "}
                  <span className="font-semibold text-[#173269]">
                    Contact your organization administrator.
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="hidden bg-slate-100 p-3 lg:block">
            <div className="h-full w-full overflow-hidden rounded-[20px]">
              <img
                src="/worker.jpg"
                alt="construction worker"
                className="h-full w-full object-cover"
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Mode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isLogin = mode === "login";

  const heading = useMemo(() => {
    return isLogin ? "Welcome back" : "Create your account";
  }, [isLogin]);

  const subheading = useMemo(() => {
    return isLogin ? "Log in to RiskBases" : "Sign up to RiskBases";
  }, [isLogin]);

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
    setLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        await redirectAfterAuth();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        await redirectAfterAuth();
      }
    } catch (error: any) {
      setMessage(error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setMessage("");

    if (!email) {
      setMessage("Please enter your email address first.");
      return;
    }

    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setMessage("Password reset email sent. Check your inbox.");
    } catch (error: any) {
      setMessage(error?.message || "Could not send reset email.");
    } finally {
      setResetLoading(false);
    }
  }

  async function handleGoogleAuth() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) setMessage(error.message);
  }

  async function handleMicrosoftAuth() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) setMessage(error.message);
  }

  async function handleAppleAuth() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) setMessage(error.message);
  }

  return (
    <main className="min-h-screen bg-slate-100 p-3 sm:p-4 lg:p-5">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1240px] items-center justify-center">
        <div className="relative grid w-full overflow-hidden rounded-[24px] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.10)] lg:min-h-[620px] lg:grid-cols-2 xl:min-h-[660px]">
          <div
            className="absolute left-0 top-7 z-20 px-7 sm:top-9 sm:px-9"
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <img
              src="/logo-icon.png"
              alt="RiskBases"
              style={{
                height: 44,
                width: 44,
                borderRadius: 12,
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#1a1a2e",
                letterSpacing: "-0.03em",
                whiteSpace: "nowrap",
              }}
            >
              RiskBases
            </span>
          </div>

          <section className="flex w-full bg-white">
            <div className="flex w-full flex-col justify-center px-6 pb-6 pt-32 sm:px-8 sm:pb-8 sm:pt-36 lg:px-10 lg:pb-10 lg:pt-32 xl:px-12">
              <div className="w-full max-w-[430px]">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <ArrowLeft size={16} />
                  Back to home
                </button>

                <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.03em] text-slate-900 sm:text-[36px] xl:text-[40px]">
                  {heading}
                </h1>

                <p className="mt-2 text-[15px] text-slate-600 sm:text-[16px]">
                  {subheading}
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
                    aria-label="Continue with Google"
                  >
                    <img
                      src="/google.png"
                      alt="Google"
                      className="h-5 w-5 object-contain"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={handleMicrosoftAuth}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
                    aria-label="Continue with Microsoft"
                  >
                    <img
                      src="/microsoft.png"
                      alt="Microsoft"
                      className="h-5 w-5 object-contain"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={handleAppleAuth}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
                    aria-label="Continue with Apple"
                  >
                    <img
                      src="/apple.png"
                      alt="Apple"
                      className="h-5 w-5 object-contain"
                    />
                  </button>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="whitespace-nowrap text-xs text-slate-400 sm:text-sm">
                    {isLogin ? "or log in via email" : "or sign up via email"}
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
                  {!isLogin && (
                    <input
                      type="text"
                      placeholder="Your name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 px-5 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white"
                    />
                  )}

                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 px-5 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white"
                  />

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 px-5 pr-12 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {isLogin && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={resetLoading}
                        className="text-sm font-medium text-violet-600 transition hover:text-violet-700 disabled:opacity-60"
                      >
                        {resetLoading ? "Sending..." : "Forgot password?"}
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="h-12 w-full rounded-full bg-gradient-to-r from-violet-600 to-violet-500 text-[16px] font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
                  >
                    {loading ? "Please wait..." : isLogin ? "Log in" : "Sign up"}
                  </button>

                  {message ? (
                    <p className="text-sm text-slate-500">{message}</p>
                  ) : null}
                </form>

                <div className="mt-6 text-sm text-slate-600">
                  {isLogin ? "No account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode(isLogin ? "signup" : "login");
                      setMessage("");
                    }}
                    className="font-semibold text-violet-600 hover:text-violet-700"
                  >
                    {isLogin ? "Sign up" : "Log in"}
                  </button>
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
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [checkingSession, setCheckingSession] = useState(true);
  const [hasRecoveryAccess, setHasRecoveryAccess] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function initRecovery() {
      try {
        const hash = window.location.hash;

        if (hash) {
          const params = new URLSearchParams(hash.replace("#", ""));
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");
          const type = params.get("type");

          if (type === "recovery" && accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              throw error;
            }
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session) {
          setHasRecoveryAccess(true);
        } else {
          setHasRecoveryAccess(false);
        }
      } catch (error: any) {
        if (!mounted) return;
        setErrorMessage(
          error?.message || "This reset link is invalid or has expired."
        );
        setHasRecoveryAccess(false);
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    }

    initRecovery();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setHasRecoveryAccess(true);
        setCheckingSession(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleUpdatePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!password || !confirmPassword) {
      setErrorMessage("Please fill in both password fields.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setSuccessMessage("Your password has been updated successfully.");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/auth");
      }, 1800);
    } catch (error: any) {
      setErrorMessage(
        error?.message || "Could not update your password. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-3 sm:p-4 lg:p-5">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1240px] items-center justify-center">
        <div className="relative grid w-full overflow-hidden rounded-[24px] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.10)] lg:min-h-[620px] lg:grid-cols-2 xl:min-h-[660px]">
          <div
            className="absolute left-0 top-7 z-20 flex items-center gap-3 px-7 sm:top-9 sm:px-9"
          >
            <img
              src="/logo-icon.png"
              alt="RiskBases"
              className="h-11 w-11 rounded-xl object-contain"
            />
            <span className="whitespace-nowrap text-2xl font-bold tracking-[-0.03em] text-[#1a1a2e]">
              RiskBases
            </span>
          </div>

          <section className="flex w-full bg-white">
            <div className="flex w-full flex-col justify-center px-6 pb-6 pt-32 sm:px-8 sm:pb-8 sm:pt-36 lg:px-10 lg:pb-10 lg:pt-32 xl:px-12">
              <div className="w-full max-w-[430px]">
                <button
                  type="button"
                  onClick={() => router.push("/auth")}
                  className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <ArrowLeft size={16} />
                  Back to login
                </button>

                <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.03em] text-slate-900 sm:text-[36px] xl:text-[40px]">
                  Reset password
                </h1>

                <p className="mt-2 text-[15px] text-slate-600 sm:text-[16px]">
                  Create a new secure password for your RiskBases account.
                </p>

                {checkingSession ? (
                  <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
                    Checking your reset link...
                  </div>
                ) : !hasRecoveryAccess ? (
                  <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 text-rose-500" />
                      <div>
                        <p className="text-sm font-semibold text-rose-700">
                          Reset link not valid
                        </p>
                        <p className="mt-1 text-sm text-rose-600">
                          This password reset link is invalid, expired, or has
                          already been used.
                        </p>

                        {errorMessage ? (
                          <p className="mt-2 text-sm text-rose-600">
                            {errorMessage}
                          </p>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => router.push("/auth")}
                          className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
                        >
                          Go back to login
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdatePassword} className="mt-8 space-y-4">
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="New password"
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

                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 px-5 pr-12 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((prev) => !prev)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                        aria-label={
                          showConfirmPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    <p className="px-1 text-xs text-slate-500 sm:text-sm">
                      Use at least 8 characters for a stronger password.
                    </p>

                    {errorMessage ? (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {errorMessage}
                      </div>
                    ) : null}

                    {successMessage ? (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                          <div>
                            <p className="text-sm font-semibold text-emerald-700">
                              Password updated
                            </p>
                            <p className="mt-1 text-sm text-emerald-600">
                              {successMessage} Redirecting you to login...
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      disabled={loading}
                      className="h-12 w-full rounded-full bg-gradient-to-r from-violet-600 to-violet-500 text-[16px] font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
                    >
                      {loading ? "Updating password..." : "Save new password"}
                    </button>
                  </form>
                )}
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
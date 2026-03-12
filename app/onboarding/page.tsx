"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { KeyRound, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function generateJoinKey() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export default function OnboardingPage() {
  const router = useRouter();

  const [workspaceKey, setWorkspaceKey] = useState("");
  const [loadingJoin, setLoadingJoin] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [message, setMessage] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [companyName, setCompanyName] = useState("");

  async function handleJoinWorkspace() {
    setLoadingJoin(true);
    setMessage("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) throw new Error("Niet ingelogd.");

      const trimmedKey = workspaceKey.trim().toUpperCase();

      if (!trimmedKey) throw new Error("Voer een workspace key in.");

      // Find workspace by join_key
      const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .select("id, join_key")
        .eq("join_key", trimmedKey)
        .maybeSingle();

      if (workspaceError) throw workspaceError;
      if (!workspace) throw new Error("Workspace key niet gevonden. Controleer de key en probeer opnieuw.");

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from("workspace_members")
        .select("id")
        .eq("workspace_id", workspace.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingMember) {
        // Already a member, just redirect
        router.push("/app");
        return;
      }

      // Add user as member
      const { error: memberError } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: "member",
        });

      if (memberError) throw memberError;

      router.push("/app");
    } catch (error: any) {
      setMessage(error?.message || "Kon workspace niet joinen.");
    } finally {
      setLoadingJoin(false);
    }
  }

  async function handleCreateWorkspace() {
    setLoadingCreate(true);
    setMessage("");

    try {
      const trimmedWorkspaceName = workspaceName.trim();
      const trimmedCompanyName = companyName.trim();

      if (!trimmedWorkspaceName) throw new Error("Voer een workspace naam in.");
      if (!trimmedCompanyName) throw new Error("Voer een bedrijfsnaam in.");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) throw new Error("Niet ingelogd.");

      const joinKey = generateJoinKey();

      const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .insert({
          name: trimmedWorkspaceName,
          company_name: trimmedCompanyName,
          join_key: joinKey,
          created_by: user.id,
        })
        .select("id")
        .single();

      if (workspaceError) throw workspaceError;
      if (!workspace) throw new Error("Workspace kon niet worden aangemaakt.");

      const { error: memberError } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: "owner",
        });

      if (memberError) throw memberError;

      router.push("/app");
    } catch (error: any) {
      setMessage(error?.message || "Kon workspace niet aanmaken.");
    } finally {
      setLoadingCreate(false);
    }
  }

  function closeModal() {
    if (loadingCreate) return;
    setShowCreateModal(false);
  }

  // Allow pressing Enter to submit join
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && workspaceKey.trim()) {
      handleJoinWorkspace();
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-white px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-slate-800 sm:text-3xl lg:text-4xl">
            What would you like to do?
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-500 sm:text-base">
            Choose an option below to either join an existing workspace or create
            a new one.
          </p>
        </div>

        <div className="space-y-4 sm:space-y-5">
          <div className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:px-6 sm:py-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-violet-100 sm:h-20 sm:w-20 sm:rounded-[24px]">
                <img
                  src="/logo-icon.png"
                  alt="RiskBases icon"
                  className="h-8 w-8 object-contain sm:h-10 sm:w-10"
                />
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-semibold text-slate-800 sm:text-2xl lg:text-[30px]">
                  Join Workspace
                </h2>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Enter workspace key"
                      value={workspaceKey}
                      onChange={(e) => setWorkspaceKey(e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoComplete="off"
                      spellCheck={false}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-[15px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleJoinWorkspace}
                    disabled={loadingJoin || !workspaceKey.trim()}
                    className="h-12 rounded-xl bg-violet-400 px-6 text-base font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60 sm:px-8 sm:text-lg"
                  >
                    {loadingJoin ? "Joining..." : "Join"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setMessage("");
              setShowCreateModal(true);
            }}
            className="flex w-full items-center justify-center gap-3 rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-5 text-xl font-semibold text-slate-800 shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition hover:border-violet-200 hover:bg-violet-50 sm:gap-4 sm:px-6 sm:py-6 sm:text-2xl lg:text-[28px]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-400 text-white sm:h-12 sm:w-12">
              <Plus className="h-6 w-6 sm:h-7 sm:w-7" />
            </span>
            <span>Create New Workspace</span>
          </button>

          {message ? (
            <p className="pt-1 text-center text-sm text-red-500">{message}</p>
          ) : null}
        </div>
      </div>

      <img
        src="/worker-mascot.png"
        alt="Construction worker mascot"
        className="pointer-events-none absolute bottom-4 left-4 hidden h-28 w-auto object-contain lg:block xl:h-36"
      />

      <img
        src="/excavator.png"
        alt="Excavator illustration"
        className="pointer-events-none absolute bottom-5 right-5 hidden h-20 w-auto object-contain lg:block xl:h-24"
      />

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4">
          <div className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.20)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-2xl font-semibold text-slate-800">
                Create Workspace
              </h3>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Workspace Name
                </label>
                <input
                  type="text"
                  placeholder="RiskBases Main Workspace"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="Kruik BV"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleCreateWorkspace}
                disabled={loadingCreate}
                className="rounded-lg bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-600 disabled:opacity-60"
              >
                {loadingCreate ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

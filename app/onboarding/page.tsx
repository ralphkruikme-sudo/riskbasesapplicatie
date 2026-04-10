"use client";

import { KeyboardEvent, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { KeyRound, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type WorkspaceRow = {
  id: string;
  name: string | null;
  company_name: string | null;
};

type WorkspaceJoinCodeRow = {
  id: string;
  workspace_id: string;
  code: string;
  role: string | null;
  is_active: boolean | null;
  expires_at: string | null;
};

function generateJoinCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }

  return result;
}

function normalizeRole(role?: string | null) {
  const value = (role ?? "").toLowerCase();

  if (value === "owner") return "owner";
  if (value === "co-owner" || value === "co_owner" || value === "admin") return "co-owner";
  if (value === "worker" || value === "member" || value === "user") return "member";

  return "member";
}

export default function OnboardingPage() {
  const router = useRouter();

  const [workspaceCode, setWorkspaceCode] = useState("");
  const [loadingJoin, setLoadingJoin] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [companyName, setCompanyName] = useState("");

  const messageClasses = useMemo(() => {
    if (messageType === "success") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }
    return "border-red-200 bg-red-50 text-red-600";
  }, [messageType]);

  function clearMessage() {
    setMessage("");
    setMessageType(null);
  }

  function setError(text: string) {
    setMessage(text);
    setMessageType("error");
  }

  function setSuccess(text: string) {
    setMessage(text);
    setMessageType("success");
  }

  async function storeActiveWorkspace(payload: {
    id: string;
    name?: string | null;
    company_name?: string | null;
    join_code?: string | null;
  }) {
    if (typeof window === "undefined") return;

    localStorage.setItem("active_workspace_id", payload.id);
    localStorage.setItem(
      "active_workspace",
      JSON.stringify({
        id: payload.id,
        name: payload.name ?? "",
        company_name: payload.company_name ?? "",
        join_code: payload.join_code ?? "",
      })
    );
  }

  async function setDefaultWorkspace(userId: string, workspaceId: string) {
    const { error } = await supabase.from("user_settings").upsert(
      {
        user_id: userId,
        default_workspace_id: workspaceId,
        onboarding_completed: true,
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.warn("user_settings upsert skipped:", error.message);
    }
  }

  async function ensureWorkspaceSettings(workspaceId: string) {
    const { error } = await supabase.from("workspace_settings").upsert(
      {
        workspace_id: workspaceId,
      },
      { onConflict: "workspace_id" }
    );

    if (error) {
      console.warn("workspace_settings upsert skipped:", error.message);
    }
  }

  async function createUniqueWorkspaceCode() {
    for (let i = 0; i < 6; i++) {
      const code = generateJoinCode(8);

      const { data, error } = await supabase
        .from("workspace_join_codes")
        .select("id")
        .eq("code", code)
        .maybeSingle();

      if (error) {
        console.warn("workspace code uniqueness check skipped:", error.message);
        return code;
      }

      if (!data) return code;
    }

    return generateJoinCode(10);
  }

  async function handleJoinWorkspace() {
    setLoadingJoin(true);
    clearMessage();

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) throw new Error("You are not logged in.");

      const trimmedCode = workspaceCode.trim().toUpperCase();
      if (!trimmedCode) throw new Error("Enter a workspace code first.");

      const { data: joinCode, error: joinCodeError } = await supabase
        .from("workspace_join_codes")
        .select("id, workspace_id, code, role, is_active, expires_at")
        .eq("code", trimmedCode)
        .maybeSingle();

      if (joinCodeError) throw joinCodeError;
      if (!joinCode) throw new Error("Workspace code not found. Check the code and try again.");

      const codeRow = joinCode as WorkspaceJoinCodeRow;

      if (codeRow.is_active === false) {
        throw new Error("This workspace code is no longer active.");
      }

      if (codeRow.expires_at && new Date(codeRow.expires_at).getTime() < Date.now()) {
        throw new Error("This workspace code has expired.");
      }

      const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .select("id, name, company_name")
        .eq("id", codeRow.workspace_id)
        .maybeSingle();

      if (workspaceError) throw workspaceError;
      if (!workspace) throw new Error("Workspace linked to this code was not found.");

      const { data: existingMember, error: existingMemberError } = await supabase
        .from("workspace_members")
        .select("id, workspace_id")
        .eq("workspace_id", workspace.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingMemberError) throw existingMemberError;

      if (!existingMember) {
        const { error: memberError } = await supabase.from("workspace_members").insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: normalizeRole(codeRow.role),
        });

        if (memberError) throw memberError;
      }

      await setDefaultWorkspace(user.id, workspace.id);
      await storeActiveWorkspace({
        id: workspace.id,
        name: workspace.name,
        company_name: workspace.company_name,
        join_code: codeRow.code,
      });

      setWorkspaceCode("");
      setSuccess(`Joined ${workspace.name ?? "workspace"} successfully.`);
      router.push(`/app?workspace=${workspace.id}`);
      router.refresh();
    } catch (error: any) {
      setError(error?.message || "Could not join workspace.");
    } finally {
      setLoadingJoin(false);
    }
  }

  async function handleCreateWorkspace() {
    setLoadingCreate(true);
    clearMessage();

    try {
      const trimmedWorkspaceName = workspaceName.trim();
      const trimmedCompanyName = companyName.trim();

      if (!trimmedWorkspaceName) throw new Error("Enter a workspace name.");
      if (!trimmedCompanyName) throw new Error("Enter a company name.");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) throw new Error("You are not logged in.");

      const newWorkspaceCode = await createUniqueWorkspaceCode();

      const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .insert({
          name: trimmedWorkspaceName,
          company_name: trimmedCompanyName,
          created_by: user.id,
        })
        .select("id, name, company_name")
        .single();

      if (workspaceError) throw workspaceError;
      if (!workspace) throw new Error("Workspace could not be created.");

      const { error: ownerError } = await supabase.from("workspace_members").insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: "owner",
      });

      if (ownerError) throw ownerError;

      const { error: joinCodeError } = await supabase.from("workspace_join_codes").insert({
        workspace_id: workspace.id,
        code: newWorkspaceCode,
        role: "member",
        is_active: true,
        created_by: user.id,
      });

      if (joinCodeError) throw joinCodeError;

      await ensureWorkspaceSettings(workspace.id);
      await setDefaultWorkspace(user.id, workspace.id);
      await storeActiveWorkspace({
        id: workspace.id,
        name: workspace.name,
        company_name: workspace.company_name,
        join_code: newWorkspaceCode,
      });

      setWorkspaceName("");
      setCompanyName("");
      setShowCreateModal(false);
      setSuccess("Workspace created successfully.");

      router.push(`/app?workspace=${workspace.id}`);
      router.refresh();
    } catch (error: any) {
      setError(error?.message || "Could not create workspace.");
    } finally {
      setLoadingCreate(false);
    }
  }

  function closeModal() {
    if (loadingCreate) return;
    setShowCreateModal(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && workspaceCode.trim() && !loadingJoin) {
      handleJoinWorkspace();
    }
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="w-full max-w-[760px]">
          <div className="mb-8 text-center">
            <h1 className="text-[34px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[40px]">
              What would you like to do?
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-[15px] text-slate-500">
              Join an existing workspace with a code or create a new one for your company.
            </p>
          </div>

          <div className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-5 shadow-[0_10px_32px_rgba(15,23,42,0.05)] sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-[84px] w-[84px] shrink-0 items-center justify-center rounded-[24px] bg-blue-50">
                  <img
                    src="/logo-icon.png"
                    alt="RiskBases icon"
                    className="h-10 w-10 object-contain"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-[28px] font-bold tracking-[-0.03em] text-slate-900">
                    Join Workspace
                  </h2>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="ENTER WORKSPACE CODE"
                        value={workspaceCode}
                        onChange={(e) => setWorkspaceCode(e.target.value.toUpperCase())}
                        onKeyDown={handleKeyDown}
                        autoComplete="off"
                        spellCheck={false}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-[15px] uppercase text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleJoinWorkspace}
                      disabled={loadingJoin || !workspaceCode.trim()}
                      className="h-12 rounded-2xl bg-blue-600 px-7 text-[18px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                clearMessage();
                setShowCreateModal(true);
              }}
              className="flex w-full items-center justify-center gap-4 rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-8 text-[24px] font-bold tracking-[-0.03em] text-slate-900 shadow-[0_10px_32px_rgba(15,23,42,0.05)] transition hover:border-blue-200 hover:bg-blue-50"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white">
                <Plus className="h-7 w-7" />
              </span>
              <span>Create New Workspace</span>
            </button>

            {message ? (
              <div className={`rounded-2xl border px-4 py-3 text-center text-sm ${messageClasses}`}>
                {message}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4">
          <div className="w-full max-w-[560px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.20)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <h3 className="text-[24px] font-bold tracking-[-0.03em] text-slate-900">
                Create New Workspace
              </h3>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Workspace name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. RiskBases Operations"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[15px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Company name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Kruik BV"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[15px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                A workspace owner account, default workspace settings and a reusable join code will be created automatically.
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loadingCreate}
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleCreateWorkspace}
                  disabled={loadingCreate || !workspaceName.trim() || !companyName.trim()}
                  className="h-12 rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingCreate ? "Creating..." : "Create Workspace"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

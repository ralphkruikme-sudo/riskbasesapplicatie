"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Check, LogOut, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hashColor(uid: string) {
  const colors = ["#5b5bd6", "#0091ff", "#30a46c", "#e54d2e", "#8d4e15", "#793aaf"];
  let h = 0;
  for (let i = 0; i < uid.length; i++) h = ((h << 5) - h + uid.charCodeAt(i)) | 0;
  return colors[Math.abs(h) % colors.length];
}

type Tab = "profile" | "security" | "notifications";

export default function ProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>("profile");

  const [userId, setUserId]       = useState<string | null>(null);
  const [email, setEmail]         = useState("");
  const [fullName, setFullName]   = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [role, setRole]           = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [loading, setLoading]     = useState(true);
  const [avatarBg, setAvatarBg]   = useState("#5b5bd6");

  const [newPassword, setNewPassword]           = useState("");
  const [confirmPassword, setConfirmPassword]   = useState("");
  const [passwordError, setPasswordError]       = useState("");
  const [passwordSaved, setPasswordSaved]       = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [notifRisks, setNotifRisks]   = useState(true);
  const [notifDigest, setNotifDigest] = useState(false);
  const [notifInApp, setNotifInApp]   = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }
      setUserId(user.id);
      setEmail(user.email ?? "");
      setAvatarBg(hashColor(user.id));
      const { data: profile } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle();
      setFullName(profile?.full_name || user.user_metadata?.full_name || "");
      setAvatarUrl(profile?.avatar_url || null);
      const { data: membership } = await supabase.from("workspace_members").select("role").eq("user_id", user.id).maybeSingle();
      setRole(membership?.role ?? null);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    await supabase.from("profiles").upsert({ id: userId, full_name: fullName, avatar_url: avatarUrl, updated_at: new Date().toISOString() });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/${userId}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(data.publicUrl + "?t=" + Date.now());
    }
    setUploading(false);
  }

  async function handlePasswordChange() {
    setPasswordError("");
    if (newPassword !== confirmPassword) { setPasswordError("Wachtwoorden komen niet overeen."); return; }
    if (newPassword.length < 8) { setPasswordError("Minimaal 8 tekens vereist."); return; }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) { setPasswordError(error.message); return; }
    setPasswordSaved(true);
    setNewPassword(""); setConfirmPassword("");
    setTimeout(() => setPasswordSaved(false), 2500);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid #e4e4e7", borderTopColor: "#18181b", animation: "spin .7s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const pwStrength = !newPassword ? 0 : newPassword.length < 6 ? 1 : newPassword.length < 10 ? 2 : 3;
  const pwColors   = ["#e4e4e7", "#ef4444", "#f59e0b", "#22c55e"];
  const pwLabels   = ["", "Zwak", "Matig", "Sterk"];

  const TABS: { key: Tab; label: string }[] = [
    { key: "profile",       label: "Profiel" },
    { key: "security",      label: "Beveiliging" },
    { key: "notifications", label: "Notificaties" },
  ];

  return (
    <div style={{ flex: 1, overflowY: "auto", background: "#fafafa" }}>
      <style>{`
        .p-input {
          width: 100%; height: 38px; border-radius: 8px;
          border: 1px solid #e4e4e7; background: #fff;
          padding: 0 12px; font-size: 14px; color: #18181b;
          outline: none; transition: border-color 150ms; box-sizing: border-box;
          font-family: inherit;
        }
        .p-input:focus { border-color: #18181b; }
        .p-input:disabled { background: #fafafa; color: #a1a1aa; cursor: not-allowed; }
        .p-label { font-size: 13px; font-weight: 500; color: #52525b; margin-bottom: 6px; display: block; }
        .p-btn {
          display: inline-flex; align-items: center; gap: 6px;
          height: 36px; padding: 0 16px; border-radius: 8px;
          background: #18181b; color: #fff; font-size: 13px; font-weight: 500;
          border: none; cursor: pointer; transition: opacity 150ms; font-family: inherit;
          white-space: nowrap;
        }
        .p-btn:hover:not(:disabled) { opacity: .85; }
        .p-btn:disabled { opacity: .35; cursor: not-allowed; }
        .p-btn-outline {
          display: inline-flex; align-items: center; gap: 6px;
          height: 36px; padding: 0 16px; border-radius: 8px;
          background: #fff; color: #18181b; font-size: 13px; font-weight: 500;
          border: 1px solid #e4e4e7; cursor: pointer; transition: background 150ms; font-family: inherit;
          white-space: nowrap;
        }
        .p-btn-outline:hover { background: #f4f4f5; }
        .p-btn-danger {
          display: inline-flex; align-items: center; gap: 6px;
          height: 36px; padding: 0 16px; border-radius: 8px;
          background: #fff; color: #ef4444; font-size: 13px; font-weight: 500;
          border: 1px solid #fca5a5; cursor: pointer; transition: background 150ms; font-family: inherit;
        }
        .p-btn-danger:hover { background: #fef2f2; }
        .p-toggle { position: relative; display: inline-block; width: 40px; height: 22px; flex-shrink: 0; cursor: pointer; }
        .p-toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
        .p-track {
          position: absolute; inset: 0; border-radius: 22px;
          background: #e4e4e7; transition: background 200ms;
        }
        .p-toggle input:checked + .p-track { background: #18181b; }
        .p-track::before {
          content: ""; position: absolute; height: 16px; width: 16px;
          left: 3px; top: 3px; border-radius: 50%; background: #fff;
          transition: transform 200ms; box-shadow: 0 1px 2px rgba(0,0,0,0.15);
        }
        .p-toggle input:checked + .p-track::before { transform: translateX(18px); }
        .section { background: #fff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; }
        .section-header { padding: 20px 24px; border-bottom: 1px solid #f4f4f5; }
        .section-row { padding: 16px 24px; border-bottom: 1px solid #f4f4f5; }
        .section-row:last-child { border-bottom: none; }
        .tab-btn { padding: 0 4px 12px; font-size: 14px; font-weight: 500; color: #71717a; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; transition: color 150ms, border-color 150ms; font-family: inherit; }
        .tab-btn.active { color: #18181b; border-bottom-color: #18181b; }
        .tab-btn:hover:not(.active) { color: #3f3f46; }
      `}</style>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Page title */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "#18181b", margin: "0 0 4px" }}>Account</h1>
          <p style={{ fontSize: 14, color: "#71717a", margin: 0 }}>Beheer je persoonlijke instellingen en beveiliging.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 20, borderBottom: "1px solid #e4e4e7", marginBottom: 28 }}>
          {TABS.map(t => (
            <button key={t.key} className={`tab-btn${tab === t.key ? " active" : ""}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ── */}
        {tab === "profile" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Avatar + name */}
            <div className="section">
              <div className="section-header">
                <p style={{ fontSize: 14, fontWeight: 600, color: "#18181b", margin: "0 0 1px" }}>Persoonlijke gegevens</p>
                <p style={{ fontSize: 13, color: "#71717a", margin: 0 }}>Je naam en profielfoto die zichtbaar zijn voor teamleden.</p>
              </div>

              {/* Avatar row */}
              <div className="section-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {avatarUrl
                    ? <img src={avatarUrl} alt={fullName} style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover", border: "1px solid #e4e4e7", flexShrink: 0 }}/>
                    : <div style={{ width: 52, height: 52, borderRadius: 12, background: avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                        {getInitials(fullName)}
                      </div>
                  }
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "#18181b", margin: "0 0 2px" }}>Profielfoto</p>
                    <p style={{ fontSize: 13, color: "#71717a", margin: 0 }}>PNG of JPG, max 5MB</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {avatarUrl && (
                    <button className="p-btn-outline" style={{ color: "#71717a" }} onClick={() => setAvatarUrl(null)}>Verwijderen</button>
                  )}
                  <button className="p-btn-outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    <Upload style={{ width: 14, height: 14 }}/>{uploading ? "Uploaden..." : "Foto uploaden"}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarUpload}/>
                </div>
              </div>

              {/* Name row */}
              <div className="section-row">
                <label className="p-label">Volledige naam</label>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <input className="p-input" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jouw naam"/>
                  <button className="p-btn" onClick={handleSave} disabled={saving} style={{ flexShrink: 0 }}>
                    {saved ? <><Check style={{ width: 14, height: 14 }}/>Opgeslagen</> : saving ? "Opslaan..." : "Opslaan"}
                  </button>
                </div>
              </div>

              {/* Email row */}
              <div className="section-row">
                <label className="p-label">E-mailadres</label>
                <input className="p-input" value={email} disabled/>
                <p style={{ fontSize: 12, color: "#a1a1aa", marginTop: 6, marginBottom: 0 }}>E-mailadres kan niet worden gewijzigd.</p>
              </div>

              {/* Role row */}
              {role && (
                <div className="section-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "#18181b", margin: "0 0 1px" }}>Rol</p>
                    <p style={{ fontSize: 13, color: "#71717a", margin: 0 }}>Je rol binnen de workspace.</p>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#18181b", background: "#f4f4f5", padding: "4px 12px", borderRadius: 6, border: "1px solid #e4e4e7", textTransform: "capitalize" }}>{role}</span>
                </div>
              )}
            </div>

            {/* Danger zone */}
            <div className="section" style={{ border: "1px solid #fca5a5" }}>
              <div className="section-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#18181b", margin: "0 0 1px" }}>Account verwijderen</p>
                  <p style={{ fontSize: 13, color: "#71717a", margin: 0 }}>Permanent verwijderen. Kan niet ongedaan worden gemaakt.</p>
                </div>
                <button className="p-btn-danger" style={{ flexShrink: 0 }}>Verwijderen</button>
              </div>
            </div>

          </div>
        )}

        {/* ── SECURITY TAB ── */}
        {tab === "security" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <div className="section">
              <div className="section-header">
                <p style={{ fontSize: 14, fontWeight: 600, color: "#18181b", margin: "0 0 1px" }}>Wachtwoord</p>
                <p style={{ fontSize: 13, color: "#71717a", margin: 0 }}>Kies een sterk wachtwoord van minimaal 8 tekens.</p>
              </div>

              <div className="section-row" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="p-label">Nieuw wachtwoord</label>
                  <input className="p-input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••"/>
                  {newPassword.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                        {[1,2,3].map(i => (
                          <div key={i} style={{ flex: 1, height: 3, borderRadius: 3, background: pwStrength >= i ? pwColors[pwStrength] : "#e4e4e7", transition: "background 250ms" }}/>
                        ))}
                      </div>
                      <p style={{ fontSize: 12, color: pwColors[pwStrength], margin: 0, fontWeight: 500 }}>{pwLabels[pwStrength]}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="p-label">Bevestig wachtwoord</label>
                  <input className="p-input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••"/>
                </div>

                {passwordError && <p style={{ fontSize: 13, color: "#ef4444", margin: 0 }}>{passwordError}</p>}
                {passwordSaved && (
                  <p style={{ fontSize: 13, color: "#22c55e", fontWeight: 500, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                    <Check style={{ width: 14, height: 14 }}/> Wachtwoord bijgewerkt
                  </p>
                )}

                <div>
                  <button className="p-btn" onClick={handlePasswordChange} disabled={changingPassword || !newPassword}>
                    {changingPassword ? "Bijwerken..." : "Wachtwoord bijwerken"}
                  </button>
                </div>
              </div>
            </div>

            {/* Sessions */}
            <div className="section">
              <div className="section-header">
                <p style={{ fontSize: 14, fontWeight: 600, color: "#18181b", margin: "0 0 1px" }}>Sessies</p>
                <p style={{ fontSize: 13, color: "#71717a", margin: 0 }}>Apparaten waarop je bent ingelogd.</p>
              </div>
              {[
                { device: "Chrome · Windows", location: "Nederland", time: "Nu actief", current: true },
                { device: "Safari · iPhone", location: "Nederland", time: "2 uur geleden", current: false },
              ].map((s, i) => (
                <div key={i} className="section-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "#18181b", margin: "0 0 2px" }}>{s.device}</p>
                    <p style={{ fontSize: 13, color: "#71717a", margin: 0 }}>{s.location} · {s.time}</p>
                  </div>
                  {s.current
                    ? <span style={{ fontSize: 12, fontWeight: 600, color: "#16a34a", background: "#f0fdf4", padding: "4px 10px", borderRadius: 6, border: "1px solid #bbf7d0" }}>Huidig</span>
                    : <button className="p-btn-outline" style={{ fontSize: 13, height: 32, color: "#ef4444", borderColor: "#fca5a5" }}>Beëindigen</button>
                  }
                </div>
              ))}
            </div>

            {/* Logout */}
            <div className="section">
              <div className="section-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#18181b", margin: "0 0 1px" }}>Uitloggen</p>
                  <p style={{ fontSize: 13, color: "#71717a", margin: 0 }}>Sluit je huidige sessie af.</p>
                </div>
                <button className="p-btn-outline" onClick={handleLogout}>
                  <LogOut style={{ width: 14, height: 14 }}/> Uitloggen
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ── NOTIFICATIONS TAB ── */}
        {tab === "notifications" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <div className="section">
              <div className="section-header">
                <p style={{ fontSize: 14, fontWeight: 600, color: "#18181b", margin: "0 0 1px" }}>Meldingen</p>
                <p style={{ fontSize: 13, color: "#71717a", margin: 0 }}>Kies welke meldingen je wilt ontvangen.</p>
              </div>

              {[
                { label: "Kritieke risico's",       desc: "Direct een melding bij hoge risico's",             value: notifRisks,  set: setNotifRisks },
                { label: "Dagelijkse samenvatting", desc: "E-mail overzicht van risico's en acties per dag",  value: notifDigest, set: setNotifDigest },
                { label: "In-app meldingen",        desc: "Toon meldingen in de notificatiebalk",             value: notifInApp,  set: setNotifInApp },
              ].map((item, i) => (
                <div key={i} className="section-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "#18181b", margin: "0 0 2px" }}>{item.label}</p>
                    <p style={{ fontSize: 13, color: "#71717a", margin: 0 }}>{item.desc}</p>
                  </div>
                  <label className="p-toggle">
                    <input type="checkbox" checked={item.value} onChange={e => item.set(e.target.checked)}/>
                    <span className="p-track"/>
                  </label>
                </div>
              ))}

              <div style={{ padding: "16px 24px" }}>
                <button className="p-btn">Voorkeuren opslaan</button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

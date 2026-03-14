"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "next/navigation";
import { CalendarRange, Plus, X, Check, ChevronDown } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type TimelineEvent = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  type: "phase" | "milestone" | "review" | "delivery";
  status: "planned" | "in_progress" | "completed" | "delayed";
  owner_stakeholder_id: string | null;
  created_by: string | null;
  created_at: string;
};

type Stakeholder = { id: string; name: string };
type LinkedRisk = { id: string; title: string; level: string };
type LinkedAction = { id: string; title: string; status: string };

const TYPE_COLORS: Record<string, { bg: string; text: string; bar: string; border: string }> = {
  phase:     { bg: "#ede9fb", text: "#6d28d9", bar: "#7c3aed", border: "#c4b5fd" },
  milestone: { bg: "#fffbeb", text: "#d97706", bar: "#f59e0b", border: "#fcd34d" },
  review:    { bg: "#eff6ff", text: "#2563eb", bar: "#3b82f6", border: "#93c5fd" },
  delivery:  { bg: "#f0fdf4", text: "#16a34a", bar: "#22c55e", border: "#86efac" },
};
const STATUS_COLORS: Record<string, { dot: string; text: string; bg: string }> = {
  planned:     { dot: "#94a3b8", text: "#64748b",  bg: "#f8fafc" },
  in_progress: { dot: "#3b82f6", text: "#2563eb",  bg: "#eff6ff" },
  completed:   { dot: "#22c55e", text: "#16a34a",  bg: "#f0fdf4" },
  delayed:     { dot: "#ef4444", text: "#dc2626",  bg: "#fef2f2" },
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}
function fmtShort(d: string) {
  return new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

// ─── Gantt bar calculation ────────────────────────────────────────────────────
function getGanttRange(events: TimelineEvent[]) {
  const dates = events.flatMap(e => [new Date(e.start_date), e.end_date ? new Date(e.end_date) : new Date(e.start_date)]);
  const min = new Date(Math.min(...dates.map(d => d.getTime())));
  const max = new Date(Math.max(...dates.map(d => d.getTime())));
  // Add 10% padding
  const pad = (max.getTime() - min.getTime()) * 0.05;
  return { min: new Date(min.getTime() - pad), max: new Date(max.getTime() + pad) };
}
function ganttPos(date: string, min: Date, max: Date) {
  const total = max.getTime() - min.getTime();
  const offset = new Date(date).getTime() - min.getTime();
  return Math.max(0, Math.min(100, (offset / total) * 100));
}

// ─── Add event modal ──────────────────────────────────────────────────────────
function AddEventModal({ projectId, stakeholders, onClose, onCreated }: {
  projectId: string; stakeholders: Stakeholder[];
  onClose: () => void; onCreated: (e: TimelineEvent) => void;
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState<TimelineEvent["type"]>("phase");
  const [status, setStatus] = useState<TimelineEvent["status"]>("planned");
  const [ownerId, setOwnerId] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function handleSave() {
    if (!title.trim() || !startDate) { setErr("Titel en startdatum zijn verplicht."); return; }
    setSaving(true); setErr("");
    const { data, error } = await supabase.from("project_timeline").insert({
      project_id: projectId, title: title.trim(), description: desc||null,
      start_date: startDate, end_date: endDate||null,
      type, status, owner_stakeholder_id: ownerId||null,
    }).select("*").single();
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onCreated(data as TimelineEvent);
    onClose();
  }

  return (
    <div style={{ position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(15,23,42,0.4)",backdropFilter:"blur(4px)",padding:16 }}
      onClick={e => { if (e.target===e.currentTarget) onClose(); }}>
      <div style={{ width:"100%",maxWidth:520,background:"white",borderRadius:20,border:"1px solid #e8eaf0",boxShadow:"0 24px 80px rgba(15,23,42,0.2)",overflow:"hidden" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px",borderBottom:"1px solid #f1f5f9" }}>
          <h3 style={{ fontSize:18,fontWeight:700,color:"#0f172a" }}>Nieuw timeline event</h3>
          <button onClick={onClose} style={{ height:32,width:32,borderRadius:8,border:"none",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8" }}><X style={{height:16,width:16}}/></button>
        </div>
        <div style={{ padding:"20px 24px",display:"flex",flexDirection:"column",gap:14 }}>
          <div>
            <label style={{ display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:6 }}>Titel *</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="bijv. Ontwerpfase" autoFocus
              style={{ width:"100%",height:40,borderRadius:10,border:"1px solid #e2e8f0",padding:"0 12px",fontSize:14,outline:"none",boxSizing:"border-box" }}/>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <div>
              <label style={{ display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:6 }}>Type</label>
              <select value={type} onChange={e=>setType(e.target.value as any)}
                style={{ width:"100%",height:40,borderRadius:10,border:"1px solid #e2e8f0",padding:"0 12px",fontSize:14,background:"white",outline:"none" }}>
                <option value="phase">Fase</option>
                <option value="milestone">Milestone</option>
                <option value="review">Review</option>
                <option value="delivery">Oplevering</option>
              </select>
            </div>
            <div>
              <label style={{ display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:6 }}>Status</label>
              <select value={status} onChange={e=>setStatus(e.target.value as any)}
                style={{ width:"100%",height:40,borderRadius:10,border:"1px solid #e2e8f0",padding:"0 12px",fontSize:14,background:"white",outline:"none" }}>
                <option value="planned">Gepland</option>
                <option value="in_progress">Bezig</option>
                <option value="completed">Afgerond</option>
                <option value="delayed">Vertraagd</option>
              </select>
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <div>
              <label style={{ display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:6 }}>Startdatum *</label>
              <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)}
                style={{ width:"100%",height:40,borderRadius:10,border:"1px solid #e2e8f0",padding:"0 12px",fontSize:14,outline:"none",boxSizing:"border-box" }}/>
            </div>
            <div>
              <label style={{ display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:6 }}>Einddatum</label>
              <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)}
                style={{ width:"100%",height:40,borderRadius:10,border:"1px solid #e2e8f0",padding:"0 12px",fontSize:14,outline:"none",boxSizing:"border-box" }}/>
            </div>
          </div>
          {stakeholders.length > 0 && (
            <div>
              <label style={{ display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:6 }}>Verantwoordelijke</label>
              <select value={ownerId} onChange={e=>setOwnerId(e.target.value)}
                style={{ width:"100%",height:40,borderRadius:10,border:"1px solid #e2e8f0",padding:"0 12px",fontSize:14,background:"white",outline:"none" }}>
                <option value="">Geen</option>
                {stakeholders.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label style={{ display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:6 }}>Beschrijving</label>
            <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={2} placeholder="Optioneel..."
              style={{ width:"100%",borderRadius:10,border:"1px solid #e2e8f0",padding:"10px 12px",fontSize:14,outline:"none",resize:"vertical",boxSizing:"border-box" }}/>
          </div>
          {err && <p style={{ fontSize:13,color:"#dc2626",background:"#fef2f2",borderRadius:8,padding:"8px 12px" }}>{err}</p>}
        </div>
        <div style={{ display:"flex",justifyContent:"flex-end",gap:10,padding:"16px 24px",borderTop:"1px solid #f1f5f9" }}>
          <button onClick={onClose} style={{ height:38,borderRadius:10,border:"1px solid #e2e8f0",background:"white",padding:"0 18px",fontSize:13,fontWeight:600,color:"#374151",cursor:"pointer" }}>Annuleren</button>
          <button onClick={handleSave} disabled={saving} style={{ height:38,borderRadius:10,border:"none",background:"#7c3aed",padding:"0 18px",fontSize:13,fontWeight:600,color:"white",cursor:"pointer",opacity:saving?0.7:1 }}>
            {saving ? "Opslaan..." : "Event toevoegen"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProjectTimelinePage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [view, setView] = useState<"timeline"|"gantt">("timeline");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [{ data: ed }, { data: sd }] = await Promise.all([
        supabase.from("project_timeline").select("*").eq("project_id", projectId).order("start_date", { ascending: true }),
        supabase.from("project_stakeholders").select("id, name").eq("project_id", projectId),
      ]);
      setEvents((ed ?? []) as TimelineEvent[]);
      setStakeholders((sd ?? []) as Stakeholder[]);
      setLoading(false);
    }
    if (projectId) load();
  }, [projectId]);

  const ganttRange = events.length > 0 ? getGanttRange(events) : null;

  // Generate month markers for Gantt header
  const monthMarkers = (() => {
    if (!ganttRange) return [];
    const markers: { label: string; pct: number }[] = [];
    const d = new Date(ganttRange.min);
    d.setDate(1);
    while (d <= ganttRange.max) {
      markers.push({ label: d.toLocaleDateString("nl-NL", { month: "short", year: "2-digit" }), pct: ganttPos(d.toISOString(), ganttRange.min, ganttRange.max) });
      d.setMonth(d.getMonth() + 1);
    }
    return markers;
  })();

  // Today marker
  const todayPct = ganttRange ? ganttPos(new Date().toISOString(), ganttRange.min, ganttRange.max) : null;

  return (
    <div style={{ padding:"28px 28px 40px", background:"#f7f7fb", minHeight:"100%" }}>
      {/* Header */}
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24,gap:16,flexWrap:"wrap" }}>
        <div>
          <div style={{ display:"inline-flex",alignItems:"center",gap:6,background:"#ede9fb",borderRadius:20,padding:"4px 12px",marginBottom:10 }}>
            <CalendarRange style={{height:13,width:13,color:"#6d28d9"}}/>
            <span style={{fontSize:11,fontWeight:700,color:"#6d28d9",letterSpacing:"0.1em",textTransform:"uppercase"}}>Timeline</span>
          </div>
          <h1 style={{fontSize:34,fontWeight:700,color:"#0f172a",letterSpacing:"-0.02em"}}>Project Timeline</h1>
          <p style={{fontSize:15,color:"#64748b",marginTop:4}}>Fases, milestones en sleutelmomenten</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          {/* View toggle */}
          <div style={{display:"flex",border:"1px solid #e2e8f0",borderRadius:10,overflow:"hidden",background:"white"}}>
            {(["timeline","gantt"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                height:38,padding:"0 16px",fontSize:13,fontWeight:600,border:"none",cursor:"pointer",
                background: view===v ? "#7c3aed" : "transparent",
                color: view===v ? "white" : "#64748b",
              }}>{v==="timeline" ? "📋 Lijst" : "📊 Gantt"}</button>
            ))}
          </div>
          <button onClick={() => setShowModal(true)} style={{display:"flex",alignItems:"center",gap:8,height:40,borderRadius:10,background:"#7c3aed",padding:"0 18px",fontSize:13,fontWeight:600,color:"white",border:"none",cursor:"pointer"}}>
            <Plus style={{height:14,width:14}}/> Event toevoegen
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{textAlign:"center",padding:80,color:"#94a3b8"}}>Laden...</div>
      ) : events.length === 0 ? (
        <div style={{background:"white",borderRadius:16,border:"2px dashed #e2e8f0",padding:72,textAlign:"center"}}>
          <div style={{height:64,width:64,borderRadius:20,background:"#ede9fb",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}>
            <CalendarRange style={{height:32,width:32,color:"#7c3aed"}}/>
          </div>
          <p style={{fontSize:18,fontWeight:700,color:"#1e293b",marginBottom:8}}>Nog geen timeline events</p>
          <p style={{fontSize:14,color:"#94a3b8",marginBottom:24}}>Voeg fases, milestones en opleveringen toe om je project bij te houden.</p>
          <button onClick={() => setShowModal(true)} style={{display:"inline-flex",alignItems:"center",gap:8,height:42,borderRadius:10,background:"#7c3aed",padding:"0 22px",fontSize:14,fontWeight:600,color:"white",border:"none",cursor:"pointer"}}>
            <Plus style={{height:15,width:15}}/> Eerste event toevoegen
          </button>
        </div>

      ) : view === "gantt" ? (
        /* ── GANTT VIEW ── */
        <div style={{background:"white",borderRadius:16,border:"1px solid #e8eaf0",overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
          <div style={{padding:"16px 20px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <h3 style={{fontSize:15,fontWeight:700,color:"#0f172a"}}>Gantt overzicht</h3>
            {ganttRange && <p style={{fontSize:12,color:"#94a3b8"}}>{fmtShort(ganttRange.min.toISOString())} → {fmtShort(ganttRange.max.toISOString())}</p>}
          </div>
          <div style={{padding:20}}>
            {/* Month header */}
            <div style={{display:"flex",marginBottom:8,paddingLeft:220}}>
              <div style={{flex:1,position:"relative",height:20}}>
                {monthMarkers.map((m,i) => (
                  <span key={i} style={{position:"absolute",left:`${m.pct}%`,fontSize:11,color:"#94a3b8",fontWeight:500,transform:"translateX(-50%)",whiteSpace:"nowrap"}}>{m.label}</span>
                ))}
              </div>
            </div>
            {/* Gantt rows */}
            {events.map(event => {
              const tc = TYPE_COLORS[event.type] ?? TYPE_COLORS.phase;
              const sc = STATUS_COLORS[event.status] ?? STATUS_COLORS.planned;
              const left = ganttRange ? ganttPos(event.start_date, ganttRange.min, ganttRange.max) : 0;
              const right = ganttRange ? ganttPos(event.end_date || event.start_date, ganttRange.min, ganttRange.max) : left + 5;
              const width = Math.max(right - left, 1.5);
              return (
                <div key={event.id} style={{display:"flex",alignItems:"center",gap:0,marginBottom:10}}>
                  {/* Label */}
                  <div style={{width:220,flexShrink:0,paddingRight:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:sc.dot,flexShrink:0}}/>
                      <span style={{fontSize:13,fontWeight:600,color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:180}}>{event.title}</span>
                    </div>
                    <div style={{display:"flex",gap:6,marginTop:3,paddingLeft:16}}>
                      <span style={{fontSize:10,fontWeight:700,color:tc.text,background:tc.bg,padding:"1px 6px",borderRadius:10}}>{event.type}</span>
                    </div>
                  </div>
                  {/* Bar */}
                  <div style={{flex:1,position:"relative",height:28,background:"#f8fafc",borderRadius:8,overflow:"visible"}}>
                    {/* Today line */}
                    {todayPct !== null && todayPct >= 0 && todayPct <= 100 && (
                      <div style={{position:"absolute",left:`${todayPct}%`,top:-4,bottom:-4,width:2,background:"#ef4444",zIndex:5,opacity:0.6,borderRadius:1}}/>
                    )}
                    <div style={{
                      position:"absolute",left:`${left}%`,width:`${width}%`,
                      height:28,borderRadius:8,background:tc.bar,
                      display:"flex",alignItems:"center",paddingLeft:8,
                      boxShadow:"0 1px 3px rgba(0,0,0,0.1)",cursor:"pointer",
                      minWidth:6,
                    }} onClick={() => setSelectedEvent(event)}>
                      {width > 8 && <span style={{fontSize:11,fontWeight:600,color:"white",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{fmtShort(event.start_date)}</span>}
                    </div>
                    {/* Month gridlines */}
                    {monthMarkers.map((m,i) => (
                      <div key={i} style={{position:"absolute",left:`${m.pct}%`,top:0,bottom:0,width:1,background:"#e8eaf0",pointerEvents:"none"}}/>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      ) : (
        /* ── TIMELINE LIST VIEW ── */
        <div style={{position:"relative"}}>
          {/* Vertical line */}
          <div style={{position:"absolute",left:20,top:0,bottom:0,width:2,background:"#e2e8f0",borderRadius:1}}/>
          <div style={{display:"flex",flexDirection:"column",gap:14,paddingLeft:52}}>
            {events.map((event, i) => {
              const tc = TYPE_COLORS[event.type] ?? TYPE_COLORS.phase;
              const sc = STATUS_COLORS[event.status] ?? STATUS_COLORS.planned;
              const owner = stakeholders.find(s => s.id === event.owner_stakeholder_id);
              return (
                <div key={event.id} style={{position:"relative"}}>
                  {/* Dot on line */}
                  <div style={{
                    position:"absolute",left:-40,top:20,width:16,height:16,borderRadius:"50%",
                    background:sc.dot,border:"3px solid white",
                    boxShadow:`0 0 0 3px ${sc.dot}30`,
                  }}/>
                  <div
                    onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                    style={{background:"white",borderRadius:14,border:`1px solid ${selectedEvent?.id===event.id ? "#c4b5fd" : "#e8eaf0"}`,padding:"16px 20px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)",cursor:"pointer",transition:"border-color 200ms"}}
                  >
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                          <span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:tc.bg,color:tc.text,border:`1px solid ${tc.border}`}}>{event.type}</span>
                          <span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:sc.bg,color:sc.text}}>{event.status.replace("_"," ")}</span>
                          {owner && <span style={{fontSize:11,color:"#64748b"}}>👤 {owner.name}</span>}
                        </div>
                        <h3 style={{fontSize:16,fontWeight:700,color:"#0f172a",marginBottom:4}}>{event.title}</h3>
                        {event.description && <p style={{fontSize:13,color:"#64748b",marginBottom:8,lineHeight:1.5}}>{event.description}</p>}
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <CalendarRange style={{height:13,width:13,color:"#94a3b8"}}/>
                          <span style={{fontSize:12,color:"#94a3b8"}}>
                            {fmt(event.start_date)}
                            {event.end_date && event.end_date !== event.start_date && ` → ${fmt(event.end_date)}`}
                          </span>
                          {event.end_date && (
                            <span style={{fontSize:12,color:"#94a3b8"}}>
                              · {Math.max(0, Math.ceil((new Date(event.end_date).getTime() - new Date(event.start_date).getTime()) / 86400000))} dagen
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail panel for selected event */}
      {selectedEvent && (
        <div style={{position:"fixed",right:0,top:0,bottom:0,width:320,background:"white",borderLeft:"1px solid #e8eaf0",boxShadow:"-8px 0 32px rgba(0,0,0,0.08)",zIndex:30,display:"flex",flexDirection:"column"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 20px",borderBottom:"1px solid #f1f5f9"}}>
            <h3 style={{fontSize:15,fontWeight:700,color:"#0f172a"}}>Event details</h3>
            <button onClick={()=>setSelectedEvent(null)} style={{height:30,width:30,borderRadius:8,border:"none",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8"}}><X style={{height:15,width:15}}/></button>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:20}}>
            {(() => {
              const tc = TYPE_COLORS[selectedEvent.type] ?? TYPE_COLORS.phase;
              const sc = STATUS_COLORS[selectedEvent.status] ?? STATUS_COLORS.planned;
              const owner = stakeholders.find(s => s.id === selectedEvent.owner_stakeholder_id);
              return (
                <div style={{display:"flex",flexDirection:"column",gap:16}}>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <span style={{padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:700,background:tc.bg,color:tc.text,border:`1px solid ${tc.border}`}}>{selectedEvent.type}</span>
                    <span style={{padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:600,background:sc.bg,color:sc.text}}>{selectedEvent.status.replace("_"," ")}</span>
                  </div>
                  <h2 style={{fontSize:20,fontWeight:700,color:"#0f172a",margin:0}}>{selectedEvent.title}</h2>
                  {selectedEvent.description && <p style={{fontSize:14,color:"#64748b",lineHeight:1.6,margin:0}}>{selectedEvent.description}</p>}
                  <div style={{background:"#f8fafc",borderRadius:12,padding:14,display:"flex",flexDirection:"column",gap:8}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <span style={{fontSize:12,color:"#94a3b8"}}>Start</span>
                      <span style={{fontSize:13,fontWeight:600,color:"#1e293b"}}>{fmt(selectedEvent.start_date)}</span>
                    </div>
                    {selectedEvent.end_date && (
                      <div style={{display:"flex",justifyContent:"space-between"}}>
                        <span style={{fontSize:12,color:"#94a3b8"}}>Einde</span>
                        <span style={{fontSize:13,fontWeight:600,color:"#1e293b"}}>{fmt(selectedEvent.end_date)}</span>
                      </div>
                    )}
                    {selectedEvent.end_date && (
                      <div style={{display:"flex",justifyContent:"space-between"}}>
                        <span style={{fontSize:12,color:"#94a3b8"}}>Duur</span>
                        <span style={{fontSize:13,fontWeight:600,color:"#1e293b"}}>{Math.max(0,Math.ceil((new Date(selectedEvent.end_date).getTime()-new Date(selectedEvent.start_date).getTime())/86400000))} dagen</span>
                      </div>
                    )}
                    {owner && (
                      <div style={{display:"flex",justifyContent:"space-between"}}>
                        <span style={{fontSize:12,color:"#94a3b8"}}>Verantwoordelijke</span>
                        <span style={{fontSize:13,fontWeight:600,color:"#1e293b"}}>{owner.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {showModal && (
        <AddEventModal
          projectId={projectId} stakeholders={stakeholders}
          onClose={() => setShowModal(false)}
          onCreated={e => setEvents(prev => [...prev, e].sort((a,b) => a.start_date.localeCompare(b.start_date)))}
        />
      )}
    </div>
  );
}

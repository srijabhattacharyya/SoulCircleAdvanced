import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const MOODS = [
  { symbol: "☀", label: "Happy", value: 5 },
  { symbol: "◎", label: "Okay", value: 4 },
  { symbol: "~", label: "Meh", value: 3 },
  { symbol: "◌", label: "Low", value: 2 },
  { symbol: "✦", label: "Rough", value: 1 },
];

function MoodTracker() {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [log, setLog] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    loadMoods();
  }, [user]);

  const loadMoods = async () => {
    const res = await authFetch("http://127.0.0.1:8000/mood");
    if (res.ok) setLog(await res.json());
  };

  const todayStr = new Date().toDateString();
  const checkedInToday = log.some((e) => new Date(e.created_at).toDateString() === todayStr);

  const streak = (() => {
    if (!log.length) return 0;
    const days = [...new Set(log.map((e) => new Date(e.created_at).toDateString()))];
    let count = 0;
    let d = new Date();
    for (let i = 0; i < 365; i++) {
      if (days.includes(d.toDateString())) { count++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return count;
  })();

  const avg7 = (() => {
    const cutoff = Date.now() - 7 * 86400000;
    const recent = log.filter((e) => new Date(e.created_at).getTime() > cutoff);
    if (!recent.length) return null;
    const avg = recent.reduce((s, e) => s + e.value, 0) / recent.length;
    return MOODS.find((m) => m.value === Math.round(avg))?.label || null;
  })();

  const save = async () => {
    if (!selected || checkedInToday) return;
    setSaving(true);
    const res = await authFetch("http://127.0.0.1:8000/mood", {
      method: "POST",
      body: JSON.stringify({ mood: selected.label, symbol: selected.symbol, value: selected.value, note }),
    });
    if (res.ok) { await loadMoods(); setSelected(null); setNote(""); }
    setSaving(false);
  };

  return (
    <div className="mood-page">
      <Navbar />
      <div className="mood-layout">
        <div className="page-header">
          <p className="eyebrow">Daily check-in</p>
          <h1>Mood Tracker</h1>
          <p>A quiet moment to notice how you're doing, {user?.name?.split(" ")[0]}.</p>
        </div>

        <div className="mood-stats">
          <div className="mood-stat-card"><span className="mood-stat-label">Total Check-ins</span><span className="mood-stat-value">{log.length}</span></div>
          <div className="mood-stat-card"><span className="mood-stat-label">Day Streak</span><span className="mood-stat-value">{streak}{streak > 0 ? " 🔥" : ""}</span></div>
          <div className="mood-stat-card"><span className="mood-stat-label">7-Day Average</span><span className="mood-stat-value">{avg7 || "—"}</span></div>
        </div>

        {checkedInToday ? (
          <div className="mood-done-banner">You've already checked in today. See you tomorrow ✦</div>
        ) : (
          <>
            <p className="mood-question">How are you feeling right now?</p>
            <div className="mood-grid">
              {MOODS.map((m) => (
                <div key={m.label} className={`mood-card ${selected?.label === m.label ? "selected" : ""}`} onClick={() => setSelected(m)}>
                  <div className="mood-symbol">{m.symbol}</div>
                  <span className="mood-label">{m.label}</span>
                </div>
              ))}
            </div>
            <div className="mood-note-section">
              <label>Anything else on your mind? <em>(optional)</em></label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="A few words is enough…" rows={3} />
              <button className="btn-primary mood-save-btn" onClick={save} disabled={!selected || saving}
                style={{ opacity: selected ? 1 : 0.45, cursor: selected ? "pointer" : "not-allowed" }}>
                {saving ? "Saving…" : "Save entry"}
              </button>
            </div>
          </>
        )}

        {log.length > 0 && (
          <div className="mood-log">
            <h3>Recent entries</h3>
            <div className="mood-log-list">
              {log.slice(0, 10).map((entry, i) => (
                <div key={i} className="mood-log-item">
                  <span className="mood-log-symbol">{entry.symbol}</span>
                  <span className="mood-log-name">{entry.mood}</span>
                  {entry.note && <span className="mood-log-note">— {entry.note}</span>}
                  <span className="time">{new Date(entry.created_at).toLocaleDateString([], { month: "short", day: "numeric" })} · {new Date(entry.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MoodTracker;
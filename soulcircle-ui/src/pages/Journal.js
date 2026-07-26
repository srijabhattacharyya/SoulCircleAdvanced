import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PROMPTS = [
  "What is one thing you are carrying today that you wish you could set down?",
  "Describe how you're feeling right now using only weather. What kind of day is it inside you?",
  "What would you say to a friend who was feeling exactly what you're feeling?",
  "What is something small that brought you even a moment of comfort recently?",
  "What does your body need right now? What does your heart need?",
  "Write about a moment this week when you felt like yourself.",
  "What are you afraid to admit you're struggling with?",
  "What would 'enough' look like for you today?",
];

function Journal() {
  const { user, authFetch } = useAuth();
  const [promptIndex, setPromptIndex] = useState(() => Math.floor(Math.random() * PROMPTS.length));
  const [entry, setEntry] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pastEntries, setPastEntries] = useState([]);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    if (user) loadPast();
  }, [user]);

  const loadPast = async () => {
    const res = await authFetch("http://127.0.0.1:8000/journal");
    if (res.ok) setPastEntries(await res.json());
  };

  const newPrompt = () => { setPromptIndex((i) => (i + 1) % PROMPTS.length); setSaved(false); };

  const save = async () => {
    if (!entry.trim() || saving) return;
    setSaving(true);
    const res = await authFetch("http://127.0.0.1:8000/journal", {
      method: "POST",
      body: JSON.stringify({ prompt: PROMPTS[promptIndex], entry }),
    });
    if (res.ok) { setSaved(true); await loadPast(); }
    setSaving(false);
  };

  return (
    <div className="tool-page">
      <Navbar />
      <div className="tool-layout">
        <Link to="/support" className="tool-back">← Back to Support</Link>
        <div className="page-header">
          <p className="eyebrow">Reflective journalling</p>
          <h1>Journal Prompt</h1>
          <p>There are no right answers here. Just you and your thoughts.</p>
        </div>

        <div className="journal-prompt-card">
          <span className="journal-prompt-symbol">✦</span>
          <p className="journal-prompt-text">{PROMPTS[promptIndex]}</p>
          <button className="journal-new-prompt" onClick={newPrompt}>Try a different prompt →</button>
        </div>

        <div className="journal-write-area">
          <label className="journal-label">Write freely. This is just for you.</label>
          <textarea className="journal-textarea" rows={10}
            placeholder="Start anywhere. Even one sentence is enough…"
            value={entry} onChange={(e) => { setEntry(e.target.value); setSaved(false); }} />
          <div className="journal-footer">
            <span className="journal-wordcount">{entry.trim() ? entry.trim().split(/\s+/).length : 0} words</span>
            <button className="btn-primary" onClick={save} disabled={!entry.trim() || saving}>
              {saving ? "Saving…" : saved ? "Saved ✦" : "Save entry"}
            </button>
          </div>
        </div>

        {pastEntries.length > 0 && (
          <div className="journal-past">
            <button className="journal-past-toggle" onClick={() => setShowPast(!showPast)}>
              {showPast ? "Hide" : "Show"} past entries ({pastEntries.length})
            </button>
            {showPast && (
              <div className="journal-past-list">
                {pastEntries.map((e, i) => (
                  <div key={i} className="journal-past-item">
                    <p className="journal-past-prompt">{e.prompt}</p>
                    <p className="journal-past-entry">{e.entry}</p>
                    <span className="journal-past-date">{new Date(e.created_at).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="journal-note">Your entries are saved securely to your account.</p>
      </div>
    </div>
  );
}

export default Journal;
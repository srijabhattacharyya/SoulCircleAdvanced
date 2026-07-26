import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

const PHASES = [
  { label: "Inhale", duration: 4, instruction: "Breathe in slowly through your nose" },
  { label: "Hold", duration: 7, instruction: "Hold gently — don't strain" },
  { label: "Exhale", duration: 8, instruction: "Release slowly through your mouth" },
];

function Breathing() {
  const [active, setActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [count, setCount] = useState(PHASES[0].duration);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!active) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          setPhaseIndex((pi) => {
            const next = (pi + 1) % PHASES.length;
            if (next === 0) setCycles((c) => c + 1);
            setCount(PHASES[next].duration);
            return next;
          });
          return PHASES[(phaseIndex + 1) % PHASES.length].duration;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [active, phaseIndex]);

  const reset = () => { setActive(false); setPhaseIndex(0); setCount(PHASES[0].duration); setCycles(0); };
  const phase = PHASES[phaseIndex];
  const progress = 1 - (count / phase.duration);

  return (
    <div className="tool-page">
      <Navbar />
      <div className="tool-layout">
        <Link to="/support" className="tool-back">← Back to Support</Link>
        <div className="page-header">
          <p className="eyebrow">Breathing exercise</p>
          <h1>4 — 7 — 8 Breathing</h1>
          <p>A calming technique developed by Dr. Andrew Weil. Do 3–4 cycles.</p>
        </div>

        <div className="breath-circle-wrap">
          <div
            className="breath-circle"
            style={{
              transform: phase.label === "Inhale"
                ? `scale(${1 + progress * 0.35})`
                : phase.label === "Exhale"
                ? `scale(${1.35 - progress * 0.35})`
                : "scale(1.35)",
              transition: "transform 1s ease"
            }}
          >
            <span className="breath-phase">{phase.label}</span>
            <span className="breath-count">{count}</span>
          </div>
        </div>

        <p className="breath-instruction">{phase.instruction}</p>
        <p className="breath-cycles">Cycles completed: <strong>{cycles}</strong></p>

        <div className="tool-buttons">
          {!active
            ? <button className="btn-primary" onClick={() => setActive(true)}>Begin breathing</button>
            : <button className="btn-secondary" onClick={() => setActive(false)}>Pause</button>
          }
          {(active || cycles > 0) && <button className="btn-secondary" onClick={reset}>Reset</button>}
        </div>

        <div className="tool-steps">
          <h3>How it works</h3>
          {PHASES.map((p) => (
            <div key={p.label} className="tool-step">
              <span className="tool-step-num">{p.duration}s</span>
              <div>
                <strong>{p.label}</strong>
                <p>{p.instruction}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Breathing;
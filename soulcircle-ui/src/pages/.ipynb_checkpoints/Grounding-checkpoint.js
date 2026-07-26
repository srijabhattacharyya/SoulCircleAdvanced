import { useState } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

const STEPS = [
  { count: 5, sense: "See", symbol: "◎", instruction: "Look around and name 5 things you can see right now.", placeholder: "e.g. a lamp, my hands, the ceiling..." },
  { count: 4, sense: "Touch", symbol: "◇", instruction: "Notice 4 things you can physically feel or touch.", placeholder: "e.g. the chair beneath me, my feet on the floor..." },
  { count: 3, sense: "Hear", symbol: "~", instruction: "Listen carefully and name 3 things you can hear.", placeholder: "e.g. traffic outside, my own breathing..." },
  { count: 2, sense: "Smell", symbol: "✦", instruction: "Notice 2 things you can smell right now.", placeholder: "e.g. coffee, fresh air, fabric..." },
  { count: 1, sense: "Taste", symbol: "◯", instruction: "Name 1 thing you can taste right now.", placeholder: "e.g. mint, water, nothing in particular..." },
];

function Grounding() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(5).fill(""));
  const [done, setDone] = useState(false);

  const current = STEPS[step];

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else setDone(true);
  };

  if (done) return (
    <div className="tool-page">
      <Navbar />
      <div className="tool-layout tool-center">
        <div className="grounding-done">
          <div className="grounding-done-symbol">◯</div>
          <h2>You're back.</h2>
          <p>Take a slow breath. You just anchored yourself to the present moment. That took courage.</p>
          <div className="tool-buttons">
            <button className="btn-primary" onClick={() => { setStep(0); setAnswers(Array(5).fill("")); setDone(false); }}>Do it again</button>
            <Link to="/support" className="btn-secondary">Back to Support</Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="tool-page">
      <Navbar />
      <div className="tool-layout">
        <Link to="/support" className="tool-back">← Back to Support</Link>
        <div className="page-header">
          <p className="eyebrow">Grounding technique</p>
          <h1>5 — 4 — 3 — 2 — 1</h1>
          <p>Bring yourself back to the present moment, one sense at a time.</p>
        </div>

        <div className="grounding-progress">
          {STEPS.map((s, i) => (
            <div key={i} className={`grounding-step-dot ${i < step ? "done" : i === step ? "active" : ""}`}>
              {s.count}
            </div>
          ))}
        </div>

        <div className="grounding-card">
          <div className="grounding-card-symbol">{current.symbol}</div>
          <h3>{current.count} things you can <em>{current.sense}</em></h3>
          <p className="grounding-instruction">{current.instruction}</p>
          <textarea
            className="grounding-textarea"
            rows={3}
            placeholder={current.placeholder}
            value={answers[step]}
            onChange={(e) => {
              const updated = [...answers];
              updated[step] = e.target.value;
              setAnswers(updated);
            }}
          />
          <button className="btn-primary" onClick={next} style={{ marginTop: "1.25rem" }}>
            {step < STEPS.length - 1 ? `Next — ${STEPS[step + 1].count} things you can ${STEPS[step + 1].sense}` : "I'm done"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Grounding;
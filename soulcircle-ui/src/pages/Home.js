import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const QUOTES = [
  "You don't have to be okay all the time. You just have to keep showing up, softly, for yourself.",
  "Healing is not linear. Every small step forward is still a step forward.",
  "You are allowed to be a work in progress and still be worthy of love.",
  "Rest is not a reward. It is a right.",
  "Your feelings are valid, even when they are hard to explain.",
];

function Home() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setQuoteIndex((i) => (i + 1) % QUOTES.length);
        setFade(true);
      }, 500);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-page">
      <Navbar />
      <section className="hero">
        <div className="hero-left">
          <p className="hero-eyebrow">A gentle space for you</p>
          <h1>
            Your safe place to <em>breathe,</em><br />
            reflect, and heal
          </h1>
          <p className="hero-desc">
            SoulCircle combines AI emotional support, mood tracking,
            journaling, and wellness tools into one calming experience —
            built with care, not code.
          </p>
          <div className="hero-buttons">
            <Link to="/chat" className="btn-primary">Begin your session</Link>
            <Link to="/support" className="btn-secondary">Explore tools</Link>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-right-inner">
            <div className="hero-card">
              <div className="hero-card-icon">ai</div>
              <div className="hero-card-text">
                <h4>AI Emotional Support</h4>
                <p>Talk through what you're feeling with a patient, non-judgemental companion.</p>
              </div>
            </div>
            <div className="hero-card">
              <div className="hero-card-icon">~</div>
              <div className="hero-card-text">
                <h4>Mood Tracking</h4>
                <p>Gently log your emotional state each day and notice patterns over time.</p>
              </div>
            </div>
            <div className="hero-card">
              <div className="hero-card-icon">◇</div>
              <div className="hero-card-text">
                <h4>Wellness Tools</h4>
                <p>Breathing exercises, grounding techniques, and journal prompts when you need them.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="quote-section">
        <div className="quote-inner" style={{ opacity: fade ? 1 : 0, transition: "opacity 0.5s ease" }}>
          <span className="quote-mark">"</span>
          <p className="quote-text">{QUOTES[quoteIndex]}</p>
        </div>
        <div className="quote-dots">
          {QUOTES.map((_, i) => (
            <button
              key={i}
              className={`quote-dot ${i === quoteIndex ? "active" : ""}`}
              onClick={() => { setFade(false); setTimeout(() => { setQuoteIndex(i); setFade(true); }, 300); }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
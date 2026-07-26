import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

const tools = [
  { symbol: "◎", title: "Breathing Exercise", desc: "Calm your nervous system with a simple 4-7-8 breathing pattern. Takes only two minutes.", action: "Try it now", path: "/breathing" },
  { symbol: "◇", title: "Grounding Technique", desc: "Reconnect with the present moment using the 5-4-3-2-1 method during anxiety or overwhelm.", action: "Begin grounding", path: "/grounding" },
  { symbol: "✦", title: "Journal Prompt", desc: "Reflect gently on your emotions with a curated prompt to help you find clarity and ease.", action: "Open prompt", path: "/journal" },
];

const crisisLines = [
  { name: "iCall", desc: "Psychologists and counsellors — call or email", phone: "9152987821", hours: "Mon–Sat, 8am–10pm" },
  { name: "Vandrevala Foundation", desc: "24/7 free mental health helpline", phone: "1860-2662-345", hours: "24 hours, 7 days" },
  { name: "AASRA", desc: "Crisis intervention and suicide prevention", phone: "9820466627", hours: "24 hours, 7 days" },
  { name: "Snehi", desc: "Emotional support and counselling", phone: "044-24640050", hours: "24 hours, 7 days" },
];

const therapistLinks = [
  { name: "Practo Mind", desc: "Find licensed therapists and psychiatrists across India", url: "https://www.practo.com/mental-health" },
  { name: "YourDOST", desc: "Online counselling with verified Indian psychologists", url: "https://yourdost.com" },
  { name: "MindPeers", desc: "Affordable therapy sessions in English and Hindi", url: "https://mindpeers.co" },
  { name: "Amaha (InnerHour)", desc: "Therapy, self-care plans, and psychiatry support", url: "https://www.amahahealth.com" },
];

function Support() {
  return (
    <div className="support-page">
      <Navbar />
      <div className="support-layout">

        <div className="page-header">
          <p className="eyebrow">Wellness tools</p>
          <h1>Support Resources</h1>
          <p>Small practices that make a real difference. Choose what feels right today.</p>
        </div>

        <div className="support-grid">
          {tools.map((tool) => (
            <div key={tool.title} className="support-card">
              <div className="support-card-symbol">{tool.symbol}</div>
              <h3>{tool.title}</h3>
              <p>{tool.desc}</p>
              <Link to={tool.path} className="support-card-link">{tool.action} →</Link>
            </div>
          ))}
        </div>

        <hr className="support-divider" />

        <div className="support-section-header">
          <p className="eyebrow">Real human support</p>
          <h2>Crisis helplines in India</h2>
          <p>If you're in distress, please reach out. These are free, confidential, and staffed by trained professionals.</p>
        </div>

        <div className="crisis-grid">
          {crisisLines.map((line) => (
            <div key={line.name} className="crisis-card">
              <div className="crisis-card-top">
                <h4>{line.name}</h4>
                <a href={`tel:${line.phone}`} className="crisis-phone">{line.phone}</a>
              </div>
              <p className="crisis-desc">{line.desc}</p>
              <span className="crisis-hours">{line.hours}</span>
            </div>
          ))}
        </div>

        <hr className="support-divider" />

        <div className="support-section-header">
          <p className="eyebrow">Professional care</p>
          <h2>Find a therapist</h2>
          <p>When you're ready to talk to a professional, these platforms connect you with licensed therapists across India.</p>
        </div>

        <div className="therapist-grid">
          {therapistLinks.map((t) => (
            <a key={t.name} href={t.url} target="_blank" rel="noreferrer" className="therapist-card">
              <h4>{t.name}</h4>
              <p>{t.desc}</p>
              <span className="therapist-link-label">Visit website →</span>
            </a>
          ))}
        </div>

        <div className="crisis-banner">
          <div className="crisis-banner-icon">♡</div>
          <div className="crisis-banner-text">
            <h4>SoulCircle is a companion, not a replacement for care</h4>
            <p>If you are in immediate danger, please call <strong>112</strong> (India emergency) or go to your nearest hospital.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Support;
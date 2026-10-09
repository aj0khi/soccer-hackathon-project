"use client";

import { useState } from "react";
import {
  Activity,
  ArrowUpRight,
  ChevronDown,
  CircleHelp,
  GitBranch,
  LayoutDashboard,
  Radio,
  Settings2,
  Sparkles,
  UserRound,
  Zap,
} from "lucide-react";

const timeline = [
  { time: "52:10", label: "Villa regain", detail: "High recovery", tone: "lime" },
  { time: "54:42", label: "Pressure spike", detail: "+31% intensity", tone: "coral" },
  { time: "58:08", label: "The fork", detail: "Two viable choices", tone: "lime", active: true },
  { time: "63:14", label: "Goal", detail: "Counter-attack", tone: "coral" },
  { time: "67:30", label: "Shape shift", detail: "4-2-3-1 → 3-4-2-1", tone: "gold" },
];

const evidence = [
  "Team A have held 64% of the ball, but only 2 of their last 11 possessions entered the box.",
  "Team B are recovering the ball 18.4m higher than their first-half average.",
  "Three consecutive attacks have targeted the same channel behind the left-back.",
];

export default function Home() {
  const [view, setView] = useState<"studio" | "fan">("studio");
  const [selectedFork, setSelectedFork] = useState<"pass" | "shot">("pass");

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><Sparkles size={16} strokeWidth={2.5} /></div>
          <div>
            <p className="brand-name">SECOND STORY</p>
            <p className="brand-subtitle">Match intelligence, beyond the score</p>
          </div>
        </div>
        <div className="match-status"><span className="live-dot" /> LIVE <span className="status-divider" /> 2ND HALF <span className="clock">68:24</span></div>
        <div className="top-actions">
          <button className="icon-button" aria-label="Open settings"><Settings2 size={17} /></button>
          <button className="profile-button"><UserRound size={16} /> Studio view <ChevronDown size={15} /></button>
        </div>
      </header>

      <section className="match-strip">
        <div className="competition"><span className="competition-kicker">SYNTHETIC MATCH / PREMIER LEAGUE MODEL</span><strong>Riverside Stadium</strong></div>
        <div className="scoreline"><span>AST</span><b>1</b><em>—</em><b className="away-score">1</b><span>BRI</span></div>
        <div className="match-meta"><span>68:24</span><small>Match day 14</small></div>
      </section>

      <div className="workspace">
        <aside className="rail">
          <button className="rail-button active" aria-label="Match intelligence"><LayoutDashboard size={19} /><span>Match</span></button>
          <button className="rail-button" aria-label="Live signals"><Activity size={19} /><span>Signals</span></button>
          <button className="rail-button" aria-label="Broadcast mode"><Radio size={19} /><span>On air</span></button>
          <div className="rail-spacer" />
          <button className="rail-button" aria-label="Help"><CircleHelp size={19} /><span>Guide</span></button>
        </aside>

        <div className="content-area">
          <div className="page-heading">
            <div><p className="eyebrow"><span className="eyebrow-line" /> LIVE READ / 03</p><h1>The match is not saying what it looks like.</h1></div>
            <div className="audience-switcher"><button className={view === "studio" ? "selected" : ""} onClick={() => setView("studio")}>Studio</button><button className={view === "fan" ? "selected" : ""} onClick={() => setView("fan")}>Fan lens</button></div>
          </div>

          <section className="story-card hero-story">
            <div className="story-card-header"><div><span className="live-label"><span className="tiny-dot" /> LIVE INTERPRETATION</span><h2>Control has changed hands.</h2></div><div className="confidence"><span>CONFIDENCE</span><strong>92%</strong><div className="confidence-track"><i /></div></div></div>
            <p className="hero-copy">Aston have the ball. Brighton have the danger. The game has moved from possession to transition, and the next mistake will be worth more than the last ten passes.</p>
            <div className="story-proof"><div className="proof-stat"><strong>+18.4m</strong><span>recovery height</span></div><div className="proof-stat"><strong>3 / 3</strong><span>attacks behind LB</span></div><div className="proof-stat"><strong>0.61</strong><span>transition xG</span></div><div className="proof-source"><GitBranch size={15} /> 14 events support this read <ArrowUpRight size={14} /></div></div>
          </section>

          <div className="split-grid">
            <section className="story-card perception-card">
              <div className="card-label"><span className="number-label">01</span> THE PERCEIVED MATCH</div>
              <div className="big-perception">“Aston are<br /><i>dominating.</i>”</div>
              <div className="perception-meter"><div className="meter-label"><span>64% possession</span><span className="muted">But only 2 box entries</span></div><div className="meter"><i style={{ width: "64%" }} /><b style={{ left: "64%" }} /></div></div>
              <p className="card-note">Possession is loud. Territory is not the same as threat.</p>
            </section>

            <section className="story-card evidence-card">
              <div className="card-label evidence-label"><span className="number-label">02</span> THE EVIDENCE MATCH <span className="signal-badge">DATA SAYS</span></div>
              <h3>Brighton are<br /><span>setting the trap.</span></h3>
              <ul className="evidence-list">{evidence.map((item) => <li key={item}><span className="check-mark">+</span><span>{item}</span></li>)}</ul>
              <button className="text-action">Open evidence trail <ArrowUpRight size={14} /></button>
            </section>
          </div>

          <section className="story-card timeline-card">
            <div className="section-heading"><div><div className="card-label"><span className="number-label">03</span> THE MATCH MEMORY</div><h3>Pressure leaves a trail.</h3></div><span className="live-label"><span className="tiny-dot" /> UPDATING LIVE</span></div>
            <div className="timeline"><div className="timeline-line" />{timeline.map((item) => <div key={item.time} className={`timeline-event ${item.active ? "current" : ""}`}><span className={`event-dot ${item.tone}`} /> <span className="event-time">{item.time}</span><strong>{item.label}</strong><small>{item.detail}</small></div>)}</div>
          </section>

          <section className="story-card fork-card">
            <div className="fork-intro"><div className="fork-icon"><GitBranch size={18} /></div><div><div className="card-label"><span className="number-label">04</span> THE DECISION WINDOW</div><h3>One moment. Two matches.</h3><p>At 58:08, the winger had two viable options. Explore the path not taken.</p></div></div>
            <div className="fork-options"><button className={`fork-option ${selectedFork === "pass" ? "chosen" : ""}`} onClick={() => setSelectedFork("pass")}><span className="option-key">A</span><div><strong>Slip the pass</strong><small>0.42 expected threat <span>↑</span></small></div><span className="option-tag">HIGHER VALUE</span></button><button className={`fork-option ${selectedFork === "shot" ? "chosen" : ""}`} onClick={() => setSelectedFork("shot")}><span className="option-key">B</span><div><strong>Take the shot</strong><small>0.18 expected threat <span>↓</span></small></div><span className="option-tag neutral">ACTUAL PATH</span></button></div>
            <div className="fork-result"><Zap size={16} fill="currentColor" /><span>{selectedFork === "pass" ? "The higher-value path would have opened the central lane before Brighton could reset." : "The shot arrived under pressure. Brighton recovered shape in 1.8 seconds."}</span><b>MODELLED</b></div>
          </section>

          <footer className="bottom-note"><span><span className="tiny-dot" /> Synthetic event stream healthy</span><span>Last interpretation 2.4s ago</span><span className="powered">Powered by <strong>Azure AI</strong> · Evidence locked</span></footer>
        </div>
      </div>
    </main>
  );
}

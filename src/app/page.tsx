"use client";

import { useState } from "react";
import {
  Activity,
  ArrowUpRight,
  ChevronDown,
  CircleHelp,
  Database,
  GitBranch,
  LayoutDashboard,
  Radio,
  Settings2,
  Sparkles,
  UserRound,
  Zap,
} from "lucide-react";
import { aggregateMatchState } from "@/lib/analytics/aggregate-match-state";
import { buildMatchInsight } from "@/lib/narrative/build-match-insight";
import { generateSyntheticMatch } from "@/lib/simulation/generate-match";
import type { MatchEvent } from "@/types/match";
import { DataIntakePanel } from "@/components/data-intake-panel";

const generatedMatch = generateSyntheticMatch();
const matchState = aggregateMatchState(generatedMatch.events);
const leadInsight = buildMatchInsight(generatedMatch.events, matchState);
const teamState = (teamId: string) => matchState.teams.find((team) => team.teamId === teamId);
const astonState = teamState("AST");
const brightonState = teamState("BRI");
const goalCount = (teamId: string) => generatedMatch.events.filter((event) => event.eventType === "goal" && event.teamId === teamId).length;
const lastMinute = Math.max(...generatedMatch.events.map((event) => event.minute));

function formatEventLabel(event: MatchEvent) {
  if (event.eventType === "possession_change") return "Possession regain";
  if (event.eventType === "pressure") return "Pressure spike";
  if (event.eventType === "shot") return "Dangerous shot";
  if (event.eventType === "goal") return "Goal";
  if (event.eventType === "tackle") return "Defensive duel";
  return "Passing sequence";
}

const timeline = [
  ...generatedMatch.events.filter((event) => event.minute >= 48 && ["possession_change", "pressure", "shot", "goal"].includes(event.eventType)).slice(0, 5),
].map((event, index) => ({
  time: `${String(event.minute).padStart(2, "0")}:${String((index * 17 + 10) % 60).padStart(2, "0")}`,
  label: formatEventLabel(event),
  detail: event.eventType === "pressure" ? `${Math.round(event.intensity * 100)}% intensity` : event.eventType === "shot" ? `${event.expectedGoals.toFixed(2)} xG` : event.teamId === "BRI" ? "Brighton signal" : "Aston response",
  tone: event.eventType === "goal" || event.eventType === "shot" ? "coral" : event.eventType === "pressure" ? "gold" : "lime",
  active: index === 2,
}));

const evidence = [
  ...(leadInsight?.evidence.map((item) => `${item.comparison}: ${item.value}${item.unit === "%" ? "%" : ` ${item.unit ?? ""}`}`) ?? []),
];

export default function Home() {
  const [view, setView] = useState<"studio" | "fan">("studio");
  const [selectedFork, setSelectedFork] = useState<"pass" | "shot">("pass");
  const [intakeOpen, setIntakeOpen] = useState(false);

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
        <div className="match-status"><span className="live-dot" /> LIVE <span className="status-divider" /> 2ND HALF <span className="clock">{lastMinute}:00</span></div>
        <div className="top-actions">
          <button className="icon-button" aria-label="Open settings"><Settings2 size={17} /></button>
          <button className="profile-button"><UserRound size={16} /> Studio view <ChevronDown size={15} /></button>
        </div>
      </header>

      <section className="match-strip">
        <div className="competition"><span className="competition-kicker">SYNTHETIC MATCH / PREMIER LEAGUE MODEL</span><strong>Riverside Stadium</strong></div>
        <div className="scoreline"><span>AST</span><b>{goalCount("AST")}</b><em>—</em><b className="away-score">{goalCount("BRI")}</b><span>BRI</span></div>
        <div className="match-meta"><span>{lastMinute}:00</span><small>{matchState.eventCount} events interpreted</small></div>
      </section>

      <div className="workspace">
        <aside className="rail">
          <button className="rail-button active" aria-label="Match intelligence"><LayoutDashboard size={19} /><span>Match</span></button>
          <button className="rail-button" aria-label="Open data intake" onClick={() => setIntakeOpen(true)}><Database size={19} /><span>Data</span></button>
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
            <div className="story-card-header"><div><span className="live-label"><span className="tiny-dot" /> EVIDENCE-BACKED READ</span><h2>{leadInsight?.title ?? "The match is still being interpreted."}</h2></div><div className="confidence"><span>CONFIDENCE</span><strong>{leadInsight?.confidence ?? 0}%</strong><div className="confidence-track"><i style={{ width: `${leadInsight?.confidence ?? 0}%` }} /></div></div></div>
            <p className="hero-copy">{leadInsight?.summary ?? "There is not enough validated event data to make this read."}</p>
            <div className="story-proof"><div className="proof-stat"><strong>{matchState.rhythmScore}</strong><span>rhythm score</span></div><div className="proof-stat"><strong>{matchState.chaosScore}</strong><span>chaos score</span></div><div className="proof-stat"><strong>{brightonState?.expectedGoals.toFixed(2) ?? "0.00"}</strong><span>Brighton xG</span></div><div className="proof-source"><GitBranch size={15} /> {leadInsight?.evidence.reduce((total, item) => total + item.eventIds.length, 0) ?? 0} supporting events <ArrowUpRight size={14} /></div></div>
          </section>

          <div className="split-grid">
            <section className="story-card perception-card">
              <div className="card-label"><span className="number-label">01</span> THE PERCEIVED MATCH</div>
              <div className="big-perception">“Aston are<br /><i>dominating.</i>”</div>
              <div className="perception-meter"><div className="meter-label"><span>{astonState?.possessionPct ?? 0}% possession</span><span className="muted">But danger says otherwise</span></div><div className="meter"><i style={{ width: `${astonState?.possessionPct ?? 0}%` }} /><b style={{ left: `${astonState?.possessionPct ?? 0}%` }} /></div></div>
              <p className="card-note">Possession is loud. Territory is not the same as threat.</p>
            </section>

            <section className="story-card evidence-card">
              <div className="card-label evidence-label"><span className="number-label">02</span> THE EVIDENCE MATCH <span className="signal-badge">DATA SAYS</span></div>
              <h3>Brighton are<br /><span>{matchState.dominantDangerTeamId === "BRI" ? "setting the trap." : "reading the game."}</span></h3>
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
      {intakeOpen && <DataIntakePanel onClose={() => setIntakeOpen(false)} />}
    </main>
  );
}

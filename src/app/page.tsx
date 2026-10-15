"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  CircleHelp,
  Database,
  GitBranch,
  LayoutDashboard,
  Languages,
  Radio,
  Settings2,
  Sparkles,
  UserRound,
  Zap,
  X,
} from "lucide-react";
import { runMatchIntelligenceAgents } from "@/application/agents/orchestrate-match-intelligence";
import { aggregateMatchState } from "@/lib/analytics/aggregate-match-state";
import { calculateMatchProbabilities } from "@/lib/analytics/calculate-probabilities";
import { buildMatchRecap } from "@/lib/narrative/build-match-recap";
import { generateSyntheticMatch } from "@/lib/simulation/generate-match";
import { renderLocalizedInsight, type SupportedLocale } from "@/lib/narrative/render-localized-insight";
import type { MatchEvent } from "@/types/match";
import { DataIntakePanel } from "@/components/data-intake-panel";

const generatedMatch = generateSyntheticMatch();
const audienceProfiles = {
  studio: { profileId: "studio", locale: "en", detailLevel: "deep" as const, deliveryModes: ["screen" as const], followedTeamIds: ["AST", "BRI"], followedPlayerIds: [], interests: ["tactics", "evidence"] },
  fan: { profileId: "fan", locale: "en", detailLevel: "brief" as const, deliveryModes: ["screen" as const], followedTeamIds: ["AST"], followedPlayerIds: [], interests: ["momentum", "goals"] },
  player: { profileId: "player", locale: "en", detailLevel: "standard" as const, deliveryModes: ["screen" as const], followedTeamIds: ["BRI"], followedPlayerIds: ["BRI-P-09"], interests: ["player impact", "transitions"] },
};

function formatEventLabel(event: MatchEvent) {
  if (event.eventType === "possession_change") return "Possession regain";
  if (event.eventType === "pressure") return "Pressure spike";
  if (event.eventType === "shot") return "Dangerous shot";
  if (event.eventType === "goal") return "Goal";
  if (event.eventType === "tackle") return "Defensive duel";
  return "Passing sequence";
}

function createDashboardModel(events: MatchEvent[]) {
  const matchState = aggregateMatchState(events);
  const teamState = (teamId: string) => matchState.teams.find((team) => team.teamId === teamId);
  const timeline = events.filter((event) => event.minute >= 48 && ["possession_change", "pressure", "shot", "goal"].includes(event.eventType)).slice(0, 5).map((event, index) => ({
    time: `${String(event.minute).padStart(2, "0")}:${String((index * 17 + 10) % 60).padStart(2, "0")}`,
    label: formatEventLabel(event),
    detail: event.eventType === "pressure" ? `${Math.round(event.intensity * 100)}% intensity` : event.eventType === "shot" ? `${event.expectedGoals.toFixed(2)} xG` : event.teamId === "BRI" ? "Brighton signal" : "Aston response",
    tone: event.eventType === "goal" || event.eventType === "shot" ? "coral" : event.eventType === "pressure" ? "gold" : "lime",
    active: index === 2,
  }));
  return {
    matchState,
    astonState: teamState("AST"),
    brightonState: teamState("BRI"),
    goalCount: (teamId: string) => events.filter((event) => event.eventType === "goal" && event.teamId === teamId).length,
    lastMinute: events.length ? Math.max(...events.map((event) => event.minute)) : 0,
    timeline,
  };
}

export default function Home() {
  const [view, setView] = useState<"studio" | "fan" | "player">("studio");
  const [selectedFork, setSelectedFork] = useState<"pass" | "shot">("pass");
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [utilityPanel, setUtilityPanel] = useState<"settings" | "guide" | null>(null);
  const [locale, setLocale] = useState<SupportedLocale>("en");
  const [activeEvents, setActiveEvents] = useState<MatchEvent[]>(generatedMatch.events);
  const model = useMemo(() => createDashboardModel(activeEvents), [activeEvents]);
  const { matchState, astonState, brightonState, goalCount, lastMinute, timeline } = model;
  const agentRun = runMatchIntelligenceAgents(activeEvents, audienceProfiles[view]);
  const leadInsight = agentRun.insight;
  const renderedInsight = agentRun.renderedInsight;
  const recap = leadInsight ? buildMatchRecap(activeEvents, matchState, leadInsight) : undefined;
  const localizedInsight = leadInsight ? renderLocalizedInsight(leadInsight, locale) : undefined;
  const probability = calculateMatchProbabilities(activeEvents, matchState);
  const evidence = leadInsight?.evidence.map((item) => `${item.comparison}: ${item.value}${item.unit === "%" ? "%" : ` ${item.unit ?? ""}`}`) ?? [];
  const scrollToSection = (selector: string) => document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const cycleView = () => setView(view === "studio" ? "fan" : view === "fan" ? "player" : "studio");

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
            <button className="icon-button" aria-label="Open settings" onClick={() => setUtilityPanel("settings")}><Settings2 size={17} /></button>
            <button className="profile-button" onClick={cycleView}><UserRound size={16} /> {view === "player" ? "Player focus" : view === "fan" ? "Fan lens" : "Studio view"} <ChevronDown size={15} /></button>
        </div>
      </header>

      <section className="match-strip">
        <div className="competition"><span className="competition-kicker">SYNTHETIC MATCH / PREMIER LEAGUE MODEL</span><strong>Riverside Stadium</strong></div>
        <div className="scoreline"><span>AST</span><b>{goalCount("AST")}</b><em>—</em><b className="away-score">{goalCount("BRI")}</b><span>BRI</span></div>
        <div className="match-meta"><span>{lastMinute}:00</span><small>{matchState.eventCount} events interpreted</small></div>
      </section>

      <div className="workspace">
        <aside className="rail">
          <button className="rail-button active" aria-label="Match intelligence" onClick={() => scrollToSection(".hero-story")}><LayoutDashboard size={19} /><span>Match</span></button>
          <button className="rail-button" aria-label="Open data intake" onClick={() => setIntakeOpen(true)}><Database size={19} /><span>Data</span></button>
          <button className="rail-button" aria-label="Live signals" onClick={() => scrollToSection(".timeline-card")}><Activity size={19} /><span>Signals</span></button>
          <button className="rail-button" aria-label="Broadcast mode" onClick={() => scrollToSection(".hero-story")}><Radio size={19} /><span>On air</span></button>
          <div className="rail-spacer" />
            <button className="rail-button" aria-label="Help" onClick={() => setUtilityPanel("guide")}><CircleHelp size={19} /><span>Guide</span></button>
        </aside>

        <div className="content-area">
          <div className="page-heading">
            <div><p className="eyebrow"><span className="eyebrow-line" /> LIVE READ / 03</p><h1>The match is not saying what it looks like.</h1></div>
            <div className="audience-switcher"><button className={view === "studio" ? "selected" : ""} onClick={() => setView("studio")}>Studio</button><button className={view === "fan" ? "selected" : ""} onClick={() => setView("fan")}>Fan lens</button><button className={view === "player" ? "selected" : ""} onClick={() => setView("player")}>Player focus</button></div>
          </div>

          <section className="story-card hero-story">
            <div className="story-card-header"><div><span className="live-label"><span className="tiny-dot" /> {view === "studio" ? "EVIDENCE-BACKED READ" : view === "fan" ? "FAN LENS / PLAIN LANGUAGE" : "PLAYER FOCUS / BRIGHTON-P-09"}</span><h2>{leadInsight?.title ?? "The match is still being interpreted."}</h2></div><div className="confidence"><span>CONFIDENCE</span><strong>{leadInsight?.confidence ?? 0}%</strong><div className="confidence-track"><i style={{ width: `${leadInsight?.confidence ?? 0}%` }} /></div></div></div>
            <p className="hero-copy">{renderedInsight?.text ?? "There is not enough validated event data to make this read."}</p>
            <div className="story-proof"><div className="proof-stat"><strong>{matchState.rhythmScore}</strong><span>rhythm score</span></div><div className="proof-stat"><strong>{matchState.chaosScore}</strong><span>chaos score</span></div><div className="proof-stat"><strong>{brightonState?.expectedGoals.toFixed(2) ?? "0.00"}</strong><span>Brighton xG</span></div><div className="proof-source"><GitBranch size={15} /> {leadInsight?.evidence.reduce((total, item) => total + item.eventIds.length, 0) ?? 0} supporting events <ArrowUpRight size={14} /></div></div>
          </section>

          {recap && <section className="story-card recap-card">
            <div className="recap-header"><div><div className="card-label"><span className="number-label">05</span> THE MATCH RECAP</div><h3><BookOpen size={17} /> {recap.headline}</h3></div><div className="language-picker"><Languages size={14} /><button className={locale === "en" ? "selected" : ""} onClick={() => setLocale("en")}>EN</button><button className={locale === "es" ? "selected" : ""} onClick={() => setLocale("es")}>ES</button><button className={locale === "fr" ? "selected" : ""} onClick={() => setLocale("fr")}>FR</button></div></div>
            <p className="localized-read">{localizedInsight?.text}</p>
            <div className="recap-grid">{recap.sections.map((section) => <article key={section.label}><span>{section.label.replace("-", " ")}</span><strong>{section.title}</strong><p>{section.text}</p><small>{section.evidenceEventIds.length} linked events</small></article>)}</div>
          </section>}

          {probability && <section className="story-card probability-card">
            <div className="probability-header"><div><div className="card-label"><span className="number-label">06</span> PROBABILITY LAB</div><h3>What does the match math say?</h3></div><span className="signal-badge">SYNTHETIC MODEL / NO MARKET FEED</span></div>
            <div className="probability-summary"><div><strong>{probability.projectedHomeGoals.toFixed(2)}</strong><span>projected AST goals</span></div><div><strong>{probability.projectedAwayGoals.toFixed(2)}</strong><span>projected BRI goals</span></div><div><strong>{probability.mostLikelyScore}</strong><span>most likely finish</span></div><div><strong>{probability.remainingMinutes}&apos;</strong><span>minutes modelled</span></div></div>
            <div className="probability-body"><div className="poisson-note"><span className="live-label"><span className="tiny-dot" /> POISSON SCORE MODEL</span><p><code>P(k) = e<sup>-λ</sup> λ<sup>k</sup> / k!</code></p><small>Remaining-goal probability is estimated from validated xG, current score, and time left. Fair odds are the reciprocal of model probability, not a recommendation.</small></div><div className="outcome-list">{probability.outcomes.map((outcome) => <div className="outcome-row" key={outcome.outcome}><div><strong>{outcome.label}</strong><span>{outcome.fairOdds.toFixed(2)} fair odds</span></div><div className="outcome-bar"><i style={{ width: `${outcome.probability}%` }} /></div><b>{outcome.probability}%</b></div>)}</div></div>
            <div className="probability-footer"><span>Illustrative model overround: {(probability.modelOverround * 100).toFixed(0)}%</span><span>Derived from {matchState.eventCount} synthetic events · refreshes with the active feed</span></div>
          </section>}

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
              <button className="text-action" onClick={() => setEvidenceOpen(true)}>Open evidence trail <ArrowUpRight size={14} /></button>
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

          <footer className="bottom-note"><span><span className="tiny-dot" /> Synthetic event stream healthy</span><span>{agentRun.trace.length} agents handed off successfully</span><span className="powered">Powered by <strong>Azure AI</strong> · Evidence locked</span></footer>
        </div>
      </div>
      {intakeOpen && <DataIntakePanel onClose={() => setIntakeOpen(false)} onDataReady={(events) => { if (events.length > 0) setActiveEvents(events); }} />}
      {evidenceOpen && leadInsight && <div className="evidence-overlay" role="dialog" aria-modal="true" aria-labelledby="evidence-title">
        <div className="evidence-backdrop" onClick={() => setEvidenceOpen(false)} />
        <section className="evidence-panel">
          <header className="evidence-panel-header"><div><span className="live-label"><span className="tiny-dot" /> TRACEABLE EXPLANATION</span><h2 id="evidence-title">Why this matters.</h2></div><button className="icon-button" onClick={() => setEvidenceOpen(false)} aria-label="Close evidence trail"><X size={18} /></button></header>
          <p className="evidence-explanation">{leadInsight.explanation}</p>
          <div className="evidence-confidence"><span>INSIGHT CONFIDENCE</span><strong>{leadInsight.confidence}%</strong><div className="confidence-track"><i style={{ width: `${leadInsight.confidence}%` }} /></div></div>
          <div className="evidence-trail-list">{leadInsight.evidence.map((item) => <article key={item.metric}><div className="trail-heading"><strong>{item.metric}</strong><span>{item.comparison}</span></div><div className="trail-value">{item.value}{item.unit === "%" ? "%" : ` ${item.unit ?? ""}`}</div><div className="trail-events"><span>EVENT IDS</span>{item.eventIds.length ? item.eventIds.map((eventId) => <code key={eventId}>{eventId}</code>) : <small>No matching events</small>}</div></article>)}</div>
          <footer className="evidence-panel-footer"><span>Claims without evidence are not rendered.</span><span>{leadInsight.tags.join(" · ")}</span></footer>
        </section>
      </div>}
      {utilityPanel && <div className="utility-overlay" role="dialog" aria-modal="true" aria-labelledby="utility-title">
        <div className="evidence-backdrop" onClick={() => setUtilityPanel(null)} />
        <section className="utility-panel">
          <header className="evidence-panel-header"><div><span className="live-label"><span className="tiny-dot" /> {utilityPanel === "settings" ? "WORKSPACE SETTINGS" : "SECOND STORY GUIDE"}</span><h2 id="utility-title">{utilityPanel === "settings" ? "Tune the lens." : "Read the match differently."}</h2></div><button className="icon-button" onClick={() => setUtilityPanel(null)} aria-label="Close panel"><X size={18} /></button></header>
          {utilityPanel === "settings" ? <div className="utility-options"><div><strong>Active audience</strong><span>{view === "player" ? "Player Focus" : view === "fan" ? "Fan Lens" : "Studio"}</span></div><div><strong>Evidence policy</strong><span>Event-linked claims only</span></div><div><strong>Input source</strong><span>{activeEvents.length} normalized synthetic events</span></div><button className="utility-action" onClick={() => { setView("studio"); setUtilityPanel(null); }}>Reset to studio view <ArrowUpRight size={14} /></button></div> : <div className="utility-options"><div><strong>1. Bring data</strong><span>Use Data to inspect a file or run the momentum scenario.</span></div><div><strong>2. Find the second story</strong><span>Compare the perceived match with evidence-backed danger.</span></div><div><strong>3. Change the audience</strong><span>Switch Studio, Fan Lens, or Player Focus without changing the facts.</span></div><div><strong>4. Audit the claim</strong><span>Open the evidence trail to inspect supporting event IDs.</span></div></div>}
        </section>
      </div>}
    </main>
  );
}

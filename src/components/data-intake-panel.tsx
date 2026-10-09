"use client";

import { ChangeEvent, useState } from "react";
import { Check, FileJson, LoaderCircle, Play, TriangleAlert, Upload, WandSparkles, X } from "lucide-react";
import { aggregateMatchState } from "@/lib/analytics/aggregate-match-state";
import { normalizeRows } from "@/lib/ingestion/normalize-events";
import { generateSyntheticMatch } from "@/lib/simulation/generate-match";
import type { DatasetField, DatasetFormat, DatasetReport } from "@/types/dataset";
import type { MatchEvent } from "@/types/match";

interface DataIntakePanelProps {
  onClose: () => void;
  onDataReady?: (events: MatchEvent[], report: DatasetReport) => void;
}

type DataRow = Record<string, unknown>;

const supportedEvents = new Set([
  "pass",
  "shot",
  "tackle",
  "possession_change",
  "pressure",
  "substitution",
  "card",
  "goal",
]);

const aliases: Record<string, string> = {
  timestamp: "timestampMs",
  timestampms: "timestampMs",
  time: "timestampMs",
  event_time: "timestampMs",
  event: "eventType",
  type: "eventType",
  action: "eventType",
  team: "teamId",
  teamid: "teamId",
  club: "teamId",
  club_id: "teamId",
  player: "playerId",
  playerid: "playerId",
  athlete: "playerId",
};

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[\s-]/g, "_");
}

function parseCsv(content: string) {
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [] as DataRow[];
  const headers = lines[0].split(",").map((header) => header.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? ""]));
  });
}

function parseContent(content: string, fileName: string): { format: DatasetFormat; rows: DataRow[] } {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (extension === "csv") return { format: "csv" as DatasetFormat, rows: parseCsv(content) };
  if (extension === "ndjson" || extension === "jsonl") {
    return { format: "ndjson" as DatasetFormat, rows: content.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line)) };
  }
  try {
    const value = JSON.parse(content);
    const rows = Array.isArray(value) ? value : value.events ?? [value];
    return { format: "json" as DatasetFormat, rows: rows as DataRow[] };
  } catch {
    return { format: "unknown" as DatasetFormat, rows: [] };
  }
}

function profileDataset(content: string, fileName: string): DatasetReport {
  try {
    const { format, rows } = parseContent(content, fileName);
    const normalization = normalizeRows(rows, "uploaded-match");
    const matchState = aggregateMatchState(normalization.events);
    const firstRow = rows[0] ?? {};
    const fields: DatasetField[] = Object.entries(firstRow).map(([sourceName, value]) => {
      const canonicalName = aliases[normalizeKey(sourceName)];
      return {
        sourceName,
        canonicalName: canonicalName ?? (sourceName in { eventType: true, teamId: true, playerId: true } ? sourceName : undefined),
        status: canonicalName || sourceName in { eventType: true, teamId: true, playerId: true } ? "mapped" : "unavailable",
        confidence: canonicalName ? 98 : sourceName in { eventType: true, teamId: true, playerId: true } ? 100 : 0,
        sample: String(value).slice(0, 22),
      };
    });
    const eventField = fields.find((field) => field.canonicalName === "eventType")?.sourceName;
    const recognizedEvents = eventField ? rows.filter((row) => supportedEvents.has(String(row[eventField]).toLowerCase())).length : 0;
    const missingFields = ["eventType", "teamId"].filter((field) => !fields.some((item) => item.canonicalName === field));
    const unsupportedEvents = rows.length - recognizedEvents;
    const readiness = rows.length === 0 ? 0 : Math.max(0, Math.round(((recognizedEvents / rows.length) * 0.65 + ((fields.length - missingFields.length) / Math.max(fields.length, 1)) * 0.35) * 100));
    return {
      fileName,
      format,
      rowCount: rows.length,
      recognizedEvents,
      normalizedEvents: normalization.events.length,
      rejectedEvents: normalization.rejected.length,
      unsupportedEvents,
      readiness,
      fields,
      missingFields,
      matchState,
      warnings: [...(format === "unknown" ? ["This file is not JSON, CSV, or NDJSON."] : missingFields.length ? ["Some insights will remain unavailable until the missing fields are mapped."] : []), ...normalization.rejected.slice(0, 3).map((item) => `Row ${item.rowIndex}: ${item.reason}.`)],
    };
  } catch {
    return { fileName, format: "unknown", rowCount: 0, recognizedEvents: 0, normalizedEvents: 0, rejectedEvents: 0, unsupportedEvents: 0, readiness: 0, fields: [], missingFields: ["eventType", "teamId"], warnings: ["The file could not be parsed. Check its format and try again."] };
  }
}

function readDataset(content: string, fileName: string) {
  const report = profileDataset(content, fileName);
  const { rows } = parseContent(content, fileName);
  return { report, events: normalizeRows(rows, "uploaded-match").events };
}

const sampleData = JSON.stringify([
  { timestamp: 3488000, event: "pressure", team: "BRI", player: "P-12", x: 68, y: 42, intensity: 0.82, durationSeconds: 2.4 },
  { timestamp: 3491000, event: "possession_change", team: "BRI", player: "P-12", previousTeamId: "AST", nextTeamId: "BRI", x: 68, y: 42 },
  { timestamp: 3495000, event: "pass", team: "BRI", player: "P-12", startX: 68, startY: 42, endX: 78, endY: 48, distanceMeters: 14.2, completed: true, pressureCount: 2 },
  { timestamp: 3502000, event: "shot", team: "BRI", player: "P-09", x: 83, y: 47, expectedGoals: 0.18, shotSpeedKph: 94, outcome: "saved" },
  { timestamp: 3509000, event: "goal", team: "BRI", player: "P-09" },
], null, 2);

function getSyntheticReport() {
  const match = generateSyntheticMatch();
  const matchState = aggregateMatchState(match.events);
  return {
    fileName: "synthetic-momentum-shift",
    format: "json" as DatasetFormat,
    rowCount: match.events.length,
    recognizedEvents: match.events.length,
    normalizedEvents: match.events.length,
    rejectedEvents: 0,
    unsupportedEvents: 0,
    readiness: 100,
    fields: ["eventType", "teamId", "playerId", "timestampMs", "event-specific fields"].map((sourceName) => ({ sourceName, canonicalName: sourceName, status: "recognized" as const, confidence: 100 })),
    missingFields: [],
    matchState,
    warnings: ["Scenario seeded for a deliberate control-to-transition shift."],
  };
}

export function DataIntakePanel({ onClose, onDataReady }: DataIntakePanelProps) {
  const [report, setReport] = useState<DatasetReport | null>(null);
  const [isReading, setIsReading] = useState(false);

  const inspectFile = (file: File) => {
    setIsReading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = readDataset(String(reader.result), file.name);
      setReport(result.report);
      onDataReady?.(result.events, result.report);
      setIsReading(false);
    };
    reader.onerror = () => setIsReading(false);
    reader.readAsText(file);
  };

  const inspectSample = () => {
    const result = readDataset(sampleData, "synthetic-riverside-feed.json");
    setReport(result.report);
    onDataReady?.(result.events, result.report);
  };

  const runScenario = () => {
    const match = generateSyntheticMatch();
    const report = getSyntheticReport();
    setReport(report);
    onDataReady?.(match.events, report);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) inspectFile(file);
  };

  return (
    <div className="intake-overlay" role="dialog" aria-modal="true" aria-labelledby="intake-title">
      <div className="intake-backdrop" onClick={onClose} />
      <section className="intake-panel">
        <header className="intake-header"><div><span className="live-label"><span className="tiny-dot" /> INPUT HEALTH / 01</span><h2 id="intake-title">Bring your match data.</h2><p>Second Story profiles the feed before it makes a claim.</p></div><button className="icon-button" onClick={onClose} aria-label="Close data intake"><X size={18} /></button></header>
        <label className="upload-zone"><Upload size={21} /><strong>Drop a file to inspect</strong><span>JSON, CSV, or NDJSON · synthetic events only</span><input type="file" accept=".json,.csv,.ndjson,.jsonl,application/json,text/csv" onChange={handleFileChange} /></label>
        <div className="intake-actions"><button className="sample-button" onClick={inspectSample}><FileJson size={15} /> Inspect a sample feed</button><button className="sample-button scenario-button" onClick={runScenario}><WandSparkles size={15} /> Run momentum scenario <Play size={12} /></button></div>
        {isReading && <div className="intake-loading"><LoaderCircle size={16} className="spin" /> Profiling event structure...</div>}
        {report && <ReportView report={report} />}
        <footer className="intake-footer"><span><TriangleAlert size={14} /> Unsupported fields stay visible, never invented.</span><span>Local adapter preview</span></footer>
      </section>
    </div>
  );
}

function ReportView({ report }: { report: DatasetReport }) {
  return <div className="dataset-report">
    <div className="report-heading"><div><span className="card-label">DATASET PROFILE</span><h3>{report.fileName}</h3></div><div className="readiness"><strong>{report.readiness}%</strong><span>insight readiness</span></div></div>
    <div className="report-stats"><div><strong>{report.rowCount}</strong><span>rows read</span></div><div><strong className="good">{report.normalizedEvents}</strong><span>canonical events</span></div><div><strong className={report.rejectedEvents ? "warn" : "good"}>{report.rejectedEvents}</strong><span>rejected with reason</span></div></div>
    <div className="field-list">{report.fields.slice(0, 6).map((field) => <div className="field-row" key={field.sourceName}><span className={field.status === "unavailable" ? "field-status missing" : "field-status"}>{field.status === "unavailable" ? <TriangleAlert size={12} /> : <Check size={12} />}</span><span className="field-source">{field.sourceName}</span><span className="field-arrow">→</span><strong>{field.canonicalName ?? "needs mapping"}</strong><small>{field.sample}</small></div>)}</div>
    {report.matchState && <MatchStateView state={report.matchState} />}
    {report.warnings.map((warning) => <p className="report-warning" key={warning}><TriangleAlert size={14} /> {warning}</p>)}
  </div>;
}

function MatchStateView({ state }: { state: NonNullable<DatasetReport["matchState"]> }) {
  return <div className="match-state-report">
    <div className="card-label"><span className="number-label">DERIVED MATCH STATE</span> FROM {state.eventCount} EVENTS</div>
    <div className="state-metrics"><div><strong>{state.rhythmScore}</strong><span>rhythm</span></div><div><strong>{state.chaosScore}</strong><span>chaos</span></div><div><strong>{state.dominantControlTeamId ?? "—"}</strong><span>control edge</span></div><div><strong>{state.dominantDangerTeamId ?? "—"}</strong><span>danger edge</span></div></div>
    <div className="team-state-list">{state.teams.map((team) => <div className="team-state" key={team.teamId}><div><strong>{team.teamId}</strong><span>{team.shots} shots · {team.expectedGoals.toFixed(2)} xG</span></div><div className="team-bars"><span>control <i style={{ width: `${Math.min(100, team.controlScore)}%` }} /></span><span>danger <b style={{ width: `${Math.min(100, team.dangerScore)}%` }} /></span></div><small>{team.possessionPct}% possession</small></div>)}</div>
  </div>;
}

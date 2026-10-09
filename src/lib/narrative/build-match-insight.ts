import type { MatchEvent } from "@/types/match";
import type { MatchInsight } from "@/types/insight";
import type { MatchStateSummary } from "@/types/match-state";

function teamLabel(teamId: string) {
  return teamId === "AST" ? "Aston" : teamId === "BRI" ? "Brighton" : teamId;
}

function supportingEvents(events: MatchEvent[], teamId: string) {
  return events
    .filter((event) => event.teamId === teamId && ["pressure", "possession_change", "shot", "goal"].includes(event.eventType))
    .slice(-8)
    .map((event) => event.eventId);
}

function teamById(state: MatchStateSummary, teamId?: string) {
  return state.teams.find((team) => team.teamId === teamId);
}

export function buildMatchInsight(events: MatchEvent[], state: MatchStateSummary): MatchInsight | undefined {
  const controlTeam = teamById(state, state.dominantControlTeamId);
  const dangerTeam = teamById(state, state.dominantDangerTeamId);
  if (!controlTeam || !dangerTeam) return undefined;

  const mismatch = controlTeam.teamId !== dangerTeam.teamId;
  const evidenceIds = [...supportingEvents(events, controlTeam.teamId), ...supportingEvents(events, dangerTeam.teamId)];
  const uniqueEvidenceIds = [...new Set(evidenceIds)];
  const confidence = Math.min(98, Math.round(72 + Math.min(20, uniqueEvidenceIds.length * 2) + (mismatch ? 5 : 0)));
  const controlName = teamLabel(controlTeam.teamId);
  const dangerName = teamLabel(dangerTeam.teamId);

  return {
    insightId: `${state.eventCount}-${state.dominantControlTeamId}-${state.dominantDangerTeamId}`,
    matchId: events[0]?.matchId ?? "unknown-match",
    createdAtMs: events.at(-1)?.timestampMs ?? 0,
    kind: mismatch ? "state_change" : "narrative",
    audience: ["fan", "analyst", "studio"],
    significance: Math.min(1, 0.55 + state.chaosScore / 200 + (mismatch ? 0.15 : 0)),
    confidence,
    title: mismatch ? `${controlName} have the ball. ${dangerName} have the danger.` : `${controlName} are controlling the match.`,
    summary: mismatch
      ? `${controlName} own ${controlTeam.possessionPct}% of possession, but ${dangerName} lead the danger score ${dangerTeam.dangerScore} to ${controlTeam.dangerScore}. The match has moved from control to transition.`
      : `${controlName} lead both control and danger. The current event stream supports a controlled match state rather than a momentum break.`,
    explanation: `This read combines possession share, pass accuracy, pressure intensity, shots, and expected goals from ${state.eventCount} validated events. It is supported by ${uniqueEvidenceIds.length} event records.`,
    evidence: [
      {
        eventIds: events.filter((event) => event.teamId === controlTeam.teamId && event.eventType === "pass").slice(-12).map((event) => event.eventId),
        metric: "possession share",
        value: controlTeam.possessionPct,
        unit: "%",
        comparison: `${controlName} control edge`,
      },
      {
        eventIds: events.filter((event) => event.teamId === dangerTeam.teamId && event.eventType === "pressure").slice(-12).map((event) => event.eventId),
        metric: "pressure index",
        value: dangerTeam.pressureIndex,
        unit: "%",
        comparison: `${dangerName} pressure contribution`,
      },
      {
        eventIds: events.filter((event) => event.teamId === dangerTeam.teamId && ["shot", "goal"].includes(event.eventType)).map((event) => event.eventId),
        metric: "expected goals",
        value: dangerTeam.expectedGoals,
        unit: "xG",
        comparison: `${dangerName} chance quality`,
      },
    ],
    tags: mismatch ? ["control-vs-danger", "transition", "momentum-shift"] : ["control", "match-state"],
  };
}

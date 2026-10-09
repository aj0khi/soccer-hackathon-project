import type { MatchEvent } from "@/types/match";
import type { MatchStateSummary, TeamMatchState } from "@/types/match-state";

interface TeamAccumulator {
  teamId: string;
  possessionActions: number;
  passes: number;
  completedPasses: number;
  pressureTotal: number;
  shots: number;
  expectedGoals: number;
}

function round(value: number, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function ensureTeam(map: Map<string, TeamAccumulator>, teamId: string) {
  const existing = map.get(teamId);
  if (existing) return existing;
  const created: TeamAccumulator = { teamId, possessionActions: 0, passes: 0, completedPasses: 0, pressureTotal: 0, shots: 0, expectedGoals: 0 };
  map.set(teamId, created);
  return created;
}

export function aggregateMatchState(events: MatchEvent[]): MatchStateSummary {
  const accumulators = new Map<string, TeamAccumulator>();
  let possessionChanges = 0;
  let totalPressure = 0;
  let totalShots = 0;
  let totalExpectedGoals = 0;

  for (const event of events) {
    const team = ensureTeam(accumulators, event.teamId);
    if (event.eventType === "possession_change") {
      possessionChanges += 1;
      ensureTeam(accumulators, event.nextTeamId).possessionActions += 2;
    } else {
      team.possessionActions += 1;
    }
    if (event.eventType === "pass") {
      team.passes += 1;
      if (event.completed) team.completedPasses += 1;
    }
    if (event.eventType === "pressure") {
      team.pressureTotal += event.intensity;
      totalPressure += event.intensity;
    }
    if (event.eventType === "shot") {
      team.shots += 1;
      team.expectedGoals += event.expectedGoals;
      totalShots += 1;
      totalExpectedGoals += event.expectedGoals;
    }
  }

  const totalPossessionActions = [...accumulators.values()].reduce((sum, team) => sum + team.possessionActions, 0) || 1;
  const teamStates: TeamMatchState[] = [...accumulators.values()].map((team) => {
    const possessionPct = (team.possessionActions / totalPossessionActions) * 100;
    const passAccuracyPct = team.passes ? (team.completedPasses / team.passes) * 100 : 0;
    const pressureIndex = totalPressure ? (team.pressureTotal / totalPressure) * 100 : 0;
    const dangerScore = totalExpectedGoals ? (team.expectedGoals / totalExpectedGoals) * 70 + (pressureIndex * 0.3) : pressureIndex;
    return {
      teamId: team.teamId,
      possessionPct: round(possessionPct, 1),
      passAccuracyPct: round(passAccuracyPct, 1),
      pressureIndex: round(pressureIndex, 1),
      shots: team.shots,
      expectedGoals: round(team.expectedGoals, 2),
      controlScore: round(possessionPct * 0.6 + passAccuracyPct * 0.4, 1),
      dangerScore: round(dangerScore, 1),
    };
  });

  const durationMinutes = events.length ? Math.max(1, Math.ceil(Math.max(...events.map((event) => event.minute)))) : 0;
  const rhythmScore = durationMinutes ? Math.min(100, round((events.length / durationMinutes) * 18, 1)) : 0;
  const chaosScore = events.length ? Math.min(100, round((possessionChanges / events.length) * 240 + (totalShots / events.length) * 180, 1)) : 0;
  const byControl = [...teamStates].sort((a, b) => b.controlScore - a.controlScore)[0];
  const byDanger = [...teamStates].sort((a, b) => b.dangerScore - a.dangerScore)[0];

  return {
    eventCount: events.length,
    durationMinutes,
    rhythmScore,
    chaosScore,
    dominantControlTeamId: byControl?.teamId,
    dominantDangerTeamId: byDanger?.teamId,
    teams: teamStates,
  };
}

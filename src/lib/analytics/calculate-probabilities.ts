import type { MatchEvent } from "@/types/match";
import type { MatchStateSummary } from "@/types/match-state";
import type { MatchOutcome, OutcomeProbability, ProbabilitySummary } from "@/types/probability";

function factorial(value: number) {
  let result = 1;
  for (let index = 2; index <= value; index += 1) result *= index;
  return result;
}

function poissonProbability(goals: number, expectedGoals: number) {
  return (Math.exp(-expectedGoals) * expectedGoals ** goals) / factorial(goals);
}

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function outcomeLabel(outcome: MatchOutcome, homeTeamId: string, awayTeamId: string) {
  if (outcome === "home_win") return `${homeTeamId} win`;
  if (outcome === "away_win") return `${awayTeamId} win`;
  return "Draw";
}

export function calculateMatchProbabilities(events: MatchEvent[], state: MatchStateSummary): ProbabilitySummary | undefined {
  const [homeTeam, awayTeam] = state.teams;
  const homeTeamId = homeTeam?.teamId;
  const awayTeamId = awayTeam?.teamId;
  if (!homeTeamId || !awayTeamId) return undefined;
  const homeState = state.teams.find((team) => team.teamId === homeTeamId);
  const awayState = state.teams.find((team) => team.teamId === awayTeamId);
  if (!homeState || !awayState) return undefined;

  const currentHomeGoals = events.filter((event) => event.eventType === "goal" && event.teamId === homeTeamId).length;
  const currentAwayGoals = events.filter((event) => event.eventType === "goal" && event.teamId === awayTeamId).length;
  const currentMinute = Math.max(0, ...events.map((event) => event.minute));
  const remainingMinutes = Math.max(0, 90 - currentMinute);
  const remainingShare = Math.max(0.08, remainingMinutes / 90);
  const homeExpectedRemaining = homeState.expectedGoals * remainingShare;
  const awayExpectedRemaining = awayState.expectedGoals * remainingShare;
  const outcomeTotals: Record<MatchOutcome, number> = { home_win: 0, draw: 0, away_win: 0 };
  let mostLikelyScore = `${currentHomeGoals}-${currentAwayGoals}`;
  let highestScoreProbability = 0;

  for (let homeGoals = 0; homeGoals <= 8; homeGoals += 1) {
    for (let awayGoals = 0; awayGoals <= 8; awayGoals += 1) {
      const probability = poissonProbability(homeGoals, homeExpectedRemaining) * poissonProbability(awayGoals, awayExpectedRemaining);
      const finalHomeGoals = currentHomeGoals + homeGoals;
      const finalAwayGoals = currentAwayGoals + awayGoals;
      if (probability > highestScoreProbability) {
        highestScoreProbability = probability;
        mostLikelyScore = `${finalHomeGoals}-${finalAwayGoals}`;
      }
      const outcome: MatchOutcome = finalHomeGoals > finalAwayGoals ? "home_win" : finalHomeGoals < finalAwayGoals ? "away_win" : "draw";
      outcomeTotals[outcome] += probability;
    }
  }

  const modelOverround = 0.06;
  const outcomes: OutcomeProbability[] = (Object.keys(outcomeTotals) as MatchOutcome[]).map((outcome) => {
    const probability = Math.min(0.995, outcomeTotals[outcome]);
    return {
      outcome,
      label: outcomeLabel(outcome, homeTeamId, awayTeamId),
      probability: round(probability * 100, 1),
      fairOdds: round(1 / Math.max(probability, 0.001), 2),
    };
  });

  return {
    homeTeamId,
    awayTeamId,
    currentHomeGoals,
    currentAwayGoals,
    projectedHomeGoals: round(currentHomeGoals + homeExpectedRemaining, 2),
    projectedAwayGoals: round(currentAwayGoals + awayExpectedRemaining, 2),
    mostLikelyScore,
    remainingMinutes,
    outcomes,
    modelOverround,
  };
}

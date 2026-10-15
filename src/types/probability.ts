export type MatchOutcome = "home_win" | "draw" | "away_win";

export interface OutcomeProbability {
  outcome: MatchOutcome;
  label: string;
  probability: number;
  fairOdds: number;
}

export interface ProbabilitySummary {
  homeTeamId: string;
  awayTeamId: string;
  currentHomeGoals: number;
  currentAwayGoals: number;
  projectedHomeGoals: number;
  projectedAwayGoals: number;
  mostLikelyScore: string;
  remainingMinutes: number;
  outcomes: OutcomeProbability[];
  modelOverround: number;
}

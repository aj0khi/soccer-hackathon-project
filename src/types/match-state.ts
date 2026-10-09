export interface TeamMatchState {
  teamId: string;
  possessionPct: number;
  passAccuracyPct: number;
  pressureIndex: number;
  shots: number;
  expectedGoals: number;
  controlScore: number;
  dangerScore: number;
}

export interface MatchStateSummary {
  eventCount: number;
  durationMinutes: number;
  rhythmScore: number;
  chaosScore: number;
  dominantControlTeamId?: string;
  dominantDangerTeamId?: string;
  teams: TeamMatchState[];
}

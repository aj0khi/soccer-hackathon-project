export type InsightKind =
  | "metric"
  | "narrative"
  | "milestone"
  | "state_change"
  | "alert";

export type InsightAudience = "fan" | "analyst" | "studio" | "system";

export interface InsightEvidence {
  eventIds: string[];
  metric: string;
  value: number | string;
  unit?: string;
  comparison?: string;
}

export interface MatchInsight {
  insightId: string;
  matchId: string;
  createdAtMs: number;
  kind: InsightKind;
  audience: InsightAudience[];
  significance: number;
  confidence: number;
  title: string;
  summary: string;
  explanation?: string;
  evidence: InsightEvidence[];
  tags: string[];
}

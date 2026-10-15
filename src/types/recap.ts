export type RecapSectionLabel = "first-half" | "second-half" | "full-time";

export interface RecapSection {
  label: RecapSectionLabel;
  title: string;
  text: string;
  evidenceEventIds: string[];
}

export interface MatchRecap {
  matchId: string;
  headline: string;
  sections: RecapSection[];
  evidenceEventIds: string[];
  generatedAtMs: number;
}

import type { MatchEvent } from "@/types/match";
import type { ExperienceProfile, RenderedInsight } from "@/types/experience";
import type { MatchInsight } from "@/types/insight";

export interface EventSource {
  subscribe(matchId: string, onEvent: (event: MatchEvent) => void): () => void;
}

export interface MatchInterpreter {
  accept(event: MatchEvent): Promise<MatchInsight[]>;
}

export interface InsightRenderer {
  render(
    insight: MatchInsight,
    profile?: ExperienceProfile,
  ): Promise<RenderedInsight[]>;
}

export interface MatchIntelligencePipeline {
  eventSource: EventSource;
  interpreter: MatchInterpreter;
  renderer: InsightRenderer;
}

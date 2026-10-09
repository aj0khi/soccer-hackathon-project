import { aggregateMatchState } from "@/lib/analytics/aggregate-match-state";
import { buildMatchInsight } from "@/lib/narrative/build-match-insight";
import { renderPersonalizedInsight } from "@/lib/narrative/render-personalized-insight";
import type { ExperienceProfile, RenderedInsight } from "@/types/experience";
import type { MatchEvent } from "@/types/match";
import type { MatchInsight } from "@/types/insight";
import type { MatchStateSummary } from "@/types/match-state";

export type AgentName = "match-state-agent" | "evidence-agent" | "experience-agent";
export type AgentStatus = "completed" | "skipped";

export interface AgentTraceEntry {
  agent: AgentName;
  status: AgentStatus;
  handoff: string;
}

export interface MatchIntelligenceRun {
  matchState: MatchStateSummary;
  insight?: MatchInsight;
  renderedInsight?: RenderedInsight;
  trace: AgentTraceEntry[];
}

export function runMatchIntelligenceAgents(
  events: MatchEvent[],
  profile: ExperienceProfile,
): MatchIntelligenceRun {
  const matchState = aggregateMatchState(events);
  const trace: AgentTraceEntry[] = [{
    agent: "match-state-agent",
    status: "completed",
    handoff: `${matchState.eventCount} events became a shared match state`,
  }];

  const insight = buildMatchInsight(events, matchState);
  trace.push({
    agent: "evidence-agent",
    status: insight ? "completed" : "skipped",
    handoff: insight ? `${insight.evidence.length} evidence groups verified` : "insufficient state for an insight",
  });

  const renderedInsight = insight ? renderPersonalizedInsight(insight, profile) : undefined;
  trace.push({
    agent: "experience-agent",
    status: renderedInsight ? "completed" : "skipped",
    handoff: renderedInsight ? `${profile.profileId} lens rendered` : "no insight to personalize",
  });

  return { matchState, insight, renderedInsight, trace };
}

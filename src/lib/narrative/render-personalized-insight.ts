import type { ExperienceProfile, RenderedInsight } from "@/types/experience";
import type { MatchInsight } from "@/types/insight";

export type AudienceMode = "studio" | "fan" | "player";

export function renderPersonalizedInsight(insight: MatchInsight, profile: ExperienceProfile): RenderedInsight {
  const playerId = profile.followedPlayerIds[0] ?? "selected player";
  let text = insight.summary;

  if (profile.profileId === "fan") {
    text = `Aston have more of the ball, but Brighton are creating the bigger danger. Watch the next Brighton attack: the match has become open and quick.`;
  }

  if (profile.profileId === "player") {
    text = `${playerId} is the player to watch. Their side is finding more pressure moments, and the next action in transition could change the match.`;
  }

  if (profile.detailLevel === "deep" && insight.explanation) {
    text = `${text} ${insight.explanation}`;
  }

  return {
    insightId: insight.insightId,
    profileId: profile.profileId,
    mode: profile.deliveryModes[0] ?? "screen",
    locale: profile.locale,
    text,
    generatedAtMs: insight.createdAtMs,
    metadata: {
      confidence: insight.confidence,
      evidenceCount: insight.evidence.reduce((total, item) => total + item.eventIds.length, 0),
      personalization: profile.profileId,
    },
  };
}

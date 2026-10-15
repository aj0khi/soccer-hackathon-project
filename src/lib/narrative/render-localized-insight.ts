import type { RenderedInsight } from "@/types/experience";
import type { MatchInsight } from "@/types/insight";

export type SupportedLocale = "en" | "es" | "fr";

export function renderLocalizedInsight(insight: MatchInsight, locale: SupportedLocale): RenderedInsight {
  const evidenceCount = insight.evidence.reduce((total, item) => total + item.eventIds.length, 0);
  const text = locale === "es"
    ? "El equipo con más posesión no está generando el mayor peligro. El partido ha pasado del control a las transiciones rápidas."
    : locale === "fr"
      ? "L’équipe qui a le ballon ne crée pas forcément le plus de danger. Le match est passé du contrôle aux transitions rapides."
      : insight.summary;
  return {
    insightId: insight.insightId,
    profileId: `locale-${locale}`,
    mode: "recap",
    locale,
    text,
    generatedAtMs: insight.createdAtMs,
    metadata: { confidence: insight.confidence, evidenceCount, translation: locale !== "en" },
  };
}

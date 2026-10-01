export type DetailLevel = "brief" | "standard" | "deep";

export type DeliveryMode = "screen" | "feed" | "audio" | "recap" | "api";

export interface ExperienceProfile {
  profileId: string;
  locale: string;
  detailLevel: DetailLevel;
  deliveryModes: DeliveryMode[];
  followedTeamIds: string[];
  followedPlayerIds: string[];
  interests: string[];
}

export interface RenderedInsight {
  insightId: string;
  profileId?: string;
  mode: DeliveryMode;
  locale: string;
  text: string;
  generatedAtMs: number;
  expiresAtMs?: number;
  metadata?: Record<string, string | number | boolean>;
}

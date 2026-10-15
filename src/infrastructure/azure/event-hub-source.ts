import {
  earliestEventPosition,
  EventHubConsumerClient,
} from "@azure/event-hubs";
import { DefaultAzureCredential } from "@azure/identity";
import type { EventSource } from "@/application/pipeline";
import type { MatchEvent, MatchEventType } from "@/types/match";
import { getAzureEventHubConfig, type AzureEventHubConfig } from "@/infrastructure/azure/config";

const eventTypes = new Set<MatchEventType>([
  "pass",
  "shot",
  "tackle",
  "possession_change",
  "pressure",
  "substitution",
  "card",
  "goal",
]);

function isCoordinate(value: unknown): value is { x: number; y: number } {
  if (!value || typeof value !== "object") return false;
  const coordinate = value as { x?: unknown; y?: unknown };
  return typeof coordinate.x === "number" && typeof coordinate.y === "number";
}

export function isCanonicalMatchEvent(value: unknown): value is MatchEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as Partial<MatchEvent>;
  const commonFields = typeof event.matchId === "string"
    && typeof event.eventId === "string"
    && typeof event.teamId === "string"
    && typeof event.timestampMs === "number"
    && typeof event.eventType === "string"
    && eventTypes.has(event.eventType as MatchEventType);
  if (!commonFields) return false;

  switch (event.eventType) {
    case "pass":
      return isCoordinate(event.start) && isCoordinate(event.end) && typeof event.distanceMeters === "number" && typeof event.completed === "boolean" && typeof event.pressureCount === "number";
    case "shot":
      return isCoordinate(event.start) && typeof event.expectedGoals === "number" && typeof event.shotSpeedKph === "number" && typeof event.outcome === "string";
    case "tackle":
      return isCoordinate(event.location) && typeof event.won === "boolean";
    case "possession_change":
      return isCoordinate(event.location) && typeof event.previousTeamId === "string" && typeof event.nextTeamId === "string";
    case "pressure":
      return isCoordinate(event.location) && typeof event.intensity === "number" && typeof event.durationSeconds === "number";
    case "substitution":
      return typeof event.playerOnId === "string" && typeof event.playerOffId === "string";
    case "card":
      return event.card === "yellow" || event.card === "red";
    case "goal":
      return typeof event.scorerId === "string";
  }
  return false;
}

export class AzureEventHubSource implements EventSource {
  private readonly client: EventHubConsumerClient;

  constructor(
    config: AzureEventHubConfig,
    onError: (error: Error) => void = () => undefined,
  ) {
    this.client = new EventHubConsumerClient(
      config.consumerGroup,
      config.fullyQualifiedNamespace,
      config.eventHubName,
      new DefaultAzureCredential(),
    );
    this.onError = onError;
  }

  private readonly onError: (error: Error) => void;

  static fromEnvironment(
    onError?: (error: Error) => void,
  ): AzureEventHubSource | undefined {
    const config = getAzureEventHubConfig();
    return config ? new AzureEventHubSource(config, onError) : undefined;
  }

  subscribe(matchId: string, onEvent: (event: MatchEvent) => void) {
    const subscription = this.client.subscribe(
      {
        processEvents: async (events) => {
          for (const event of events) {
            const body = event.body;
            if (isCanonicalMatchEvent(body) && body.matchId === matchId) onEvent(body);
          }
        },
        processError: async (error) => {
          this.onError(error instanceof Error ? error : new Error(String(error)));
        },
      },
      { startPosition: earliestEventPosition },
    );

    return () => {
      void subscription.close();
    };
  }

  async close() {
    await this.client.close();
  }
}

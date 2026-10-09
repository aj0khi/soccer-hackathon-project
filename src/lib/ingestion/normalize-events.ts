import type {
  CardEvent,
  Coordinate,
  GoalEvent,
  MatchEvent,
  MatchEventType,
  PassEvent,
  PossessionChangeEvent,
  PressureEvent,
  ShotEvent,
  SubstitutionEvent,
  TackleEvent,
} from "@/types/match";

export interface RejectedEvent {
  rowIndex: number;
  reason: string;
}

export interface NormalizationResult {
  events: MatchEvent[];
  rejected: RejectedEvent[];
}

type DataRow = Record<string, unknown>;

const supportedEventTypes = new Set<MatchEventType>([
  "pass",
  "shot",
  "tackle",
  "possession_change",
  "pressure",
  "substitution",
  "card",
  "goal",
]);

function getString(row: DataRow, ...keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return undefined;
}

function getNumber(row: DataRow, ...keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    const number = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(number)) return number;
  }
  return undefined;
}

function getBoolean(row: DataRow, ...keys: string[]) {
  const value = getString(row, ...keys)?.toLowerCase();
  if (value === "true" || value === "yes" || value === "1") return true;
  if (value === "false" || value === "no" || value === "0") return false;
  return undefined;
}

function getEventType(row: DataRow) {
  const value = getString(row, "eventType", "event", "type", "action")?.toLowerCase().replace(/[\s-]/g, "_");
  return value && supportedEventTypes.has(value as MatchEventType) ? value as MatchEventType : undefined;
}

function getCoordinate(row: DataRow, prefix: string): Coordinate | undefined {
  const x = getNumber(row, `${prefix}X`, `${prefix}_x`, prefix === "location" ? "x" : "");
  const y = getNumber(row, `${prefix}Y`, `${prefix}_y`, prefix === "location" ? "y" : "");
  return x !== undefined && y !== undefined ? { x, y } : undefined;
}

function getBase(row: DataRow, matchId: string, rowIndex: number, eventType: MatchEventType) {
  const teamId = getString(row, "teamId", "team", "club", "club_id");
  const timestampMs = getNumber(row, "timestampMs", "timestamp", "time", "event_time");
  if (!teamId) return { error: "teamId is missing" as const };
  if (timestampMs === undefined) return { error: "timestampMs is missing" as const };
  return {
    value: {
      eventId: getString(row, "eventId", "id") ?? `${matchId}-${rowIndex + 1}`,
      matchId,
      timestampMs,
      minute: Math.floor(timestampMs / 60000),
      teamId,
      playerId: getString(row, "playerId", "player", "athlete"),
      eventType,
    },
  };
}

function normalizeEvent(row: DataRow, matchId: string, rowIndex: number): MatchEvent | string {
  const eventType = getEventType(row);
  if (!eventType) return "eventType is missing or unsupported";
  const base = getBase(row, matchId, rowIndex, eventType);
  if ("error" in base) return base.error ?? "event base is invalid";

  switch (eventType) {
    case "pass": {
      const start = getCoordinate(row, "start");
      const end = getCoordinate(row, "end");
      const distanceMeters = getNumber(row, "distanceMeters", "passDistance", "pass_distance");
      const completed = getBoolean(row, "completed", "passCompleted", "pass_completed");
      if (!start || !end) return "pass start and end coordinates are required";
      if (distanceMeters === undefined) return "pass distance is required";
      if (completed === undefined) return "pass completion is required";
      return { ...base.value, eventType, start, end, distanceMeters, completed, pressureCount: getNumber(row, "pressureCount", "pressure_count") ?? 0 } satisfies PassEvent;
    }
    case "shot": {
      const start = getCoordinate(row, "start") ?? getCoordinate(row, "location");
      const expectedGoals = getNumber(row, "expectedGoals", "xG", "xg");
      const shotSpeedKph = getNumber(row, "shotSpeedKph", "shot_speed_kph", "shotSpeed");
      const outcome = getString(row, "outcome", "shotOutcome", "shot_outcome") as ShotEvent["outcome"] | undefined;
      if (!start) return "shot location is required";
      if (expectedGoals === undefined) return "expected goals is required";
      if (shotSpeedKph === undefined) return "shot speed is required";
      if (!outcome || !["goal", "saved", "blocked", "off_target"].includes(outcome)) return "shot outcome is missing or unsupported";
      return { ...base.value, eventType, start, expectedGoals, shotSpeedKph, outcome } satisfies ShotEvent;
    }
    case "tackle": {
      const location = getCoordinate(row, "location");
      const won = getBoolean(row, "won", "tackleWon", "tackle_won");
      if (!location) return "tackle location is required";
      if (won === undefined) return "tackle outcome is required";
      return { ...base.value, eventType, location, won } satisfies TackleEvent;
    }
    case "possession_change": {
      const location = getCoordinate(row, "location");
      const previousTeamId = getString(row, "previousTeamId", "previous_team_id", "fromTeamId");
      const nextTeamId = getString(row, "nextTeamId", "next_team_id", "toTeamId") ?? base.value.teamId;
      if (!location) return "possession change location is required";
      if (!previousTeamId) return "previous team is required";
      return { ...base.value, eventType, previousTeamId, nextTeamId, location } satisfies PossessionChangeEvent;
    }
    case "pressure": {
      const location = getCoordinate(row, "location");
      const intensity = getNumber(row, "intensity", "pressureIntensity", "pressure_intensity");
      const durationSeconds = getNumber(row, "durationSeconds", "duration_seconds", "duration");
      if (!location) return "pressure location is required";
      if (intensity === undefined) return "pressure intensity is required";
      if (durationSeconds === undefined) return "pressure duration is required";
      return { ...base.value, eventType, location, intensity, durationSeconds } satisfies PressureEvent;
    }
    case "substitution": {
      const playerOnId = getString(row, "playerOnId", "player_on_id", "playerOn");
      const playerOffId = getString(row, "playerOffId", "player_off_id", "playerOff");
      if (!playerOnId || !playerOffId) return "players on and off are required";
      return { ...base.value, eventType, playerOnId, playerOffId } satisfies SubstitutionEvent;
    }
    case "card": {
      const card = getString(row, "card", "cardType", "card_type") as CardEvent["card"] | undefined;
      if (!card || !["yellow", "red"].includes(card)) return "card type is missing or unsupported";
      return { ...base.value, eventType, card } satisfies CardEvent;
    }
    case "goal": {
      const scorerId = getString(row, "scorerId", "scorer_id", "playerId", "player");
      if (!scorerId) return "scorer is required";
      return { ...base.value, eventType, scorerId, assistPlayerId: getString(row, "assistPlayerId", "assist_player_id", "assist") } satisfies GoalEvent;
    }
  }
}

export function normalizeRows(rows: DataRow[], matchId: string): NormalizationResult {
  const events: MatchEvent[] = [];
  const rejected: RejectedEvent[] = [];
  rows.forEach((row, rowIndex) => {
    const result = normalizeEvent(row, matchId, rowIndex);
    if (typeof result === "string") rejected.push({ rowIndex: rowIndex + 1, reason: result });
    else events.push(result);
  });
  return { events, rejected };
}

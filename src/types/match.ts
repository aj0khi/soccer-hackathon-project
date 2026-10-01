export type MatchEventType =
  | "pass"
  | "shot"
  | "tackle"
  | "possession_change"
  | "pressure"
  | "substitution"
  | "card"
  | "goal";

export interface MatchEventBase {
  eventId: string;
  matchId: string;
  timestampMs: number;
  minute: number;
  teamId: string;
  playerId?: string;
  eventType: MatchEventType;
}

export interface PassEvent extends MatchEventBase {
  eventType: "pass";
  start: Coordinate;
  end: Coordinate;
  distanceMeters: number;
  completed: boolean;
  pressureCount: number;
}

export interface ShotEvent extends MatchEventBase {
  eventType: "shot";
  start: Coordinate;
  expectedGoals: number;
  shotSpeedKph: number;
  outcome: "goal" | "saved" | "blocked" | "off_target";
}

export interface TackleEvent extends MatchEventBase {
  eventType: "tackle";
  location: Coordinate;
  won: boolean;
}

export interface PossessionChangeEvent extends MatchEventBase {
  eventType: "possession_change";
  previousTeamId: string;
  nextTeamId: string;
  location: Coordinate;
}

export interface PressureEvent extends MatchEventBase {
  eventType: "pressure";
  location: Coordinate;
  intensity: number;
  durationSeconds: number;
}

export interface SubstitutionEvent extends MatchEventBase {
  eventType: "substitution";
  playerOnId: string;
  playerOffId: string;
}

export interface CardEvent extends MatchEventBase {
  eventType: "card";
  card: "yellow" | "red";
}

export interface GoalEvent extends MatchEventBase {
  eventType: "goal";
  scorerId: string;
  assistPlayerId?: string;
}

export type MatchEvent =
  | PassEvent
  | ShotEvent
  | TackleEvent
  | PossessionChangeEvent
  | PressureEvent
  | SubstitutionEvent
  | CardEvent
  | GoalEvent;

export interface Coordinate {
  x: number;
  y: number;
}

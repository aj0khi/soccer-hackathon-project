import type { MatchEvent } from "@/types/match";

export type SyntheticScenario = "momentum-shift";

export interface SyntheticMatch {
  matchId: string;
  scenario: SyntheticScenario;
  teams: [string, string];
  events: MatchEvent[];
}

interface RandomSource {
  next(): number;
}

function seededRandom(seed: number): RandomSource {
  let value = seed >>> 0;
  return {
    next() {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 4294967296;
    },
  };
}

function coordinate(random: RandomSource, attacking: boolean) {
  const x = attacking ? 55 + random.next() * 40 : 20 + random.next() * 40;
  return { x: Number(x.toFixed(1)), y: Number((12 + random.next() * 76).toFixed(1)) };
}

function eventBase<T extends MatchEvent["eventType"]>(index: number, minute: number, teamId: string, playerId: string, eventType: T) {
  return {
    eventId: `momentum-shift-${String(index + 1).padStart(3, "0")}`,
    matchId: "synthetic-momentum-shift",
    timestampMs: minute * 60000,
    minute,
    teamId,
    playerId,
    eventType,
  };
}

export function generateSyntheticMatch(seed = 27, eventCount = 120): SyntheticMatch {
  const random = seededRandom(seed);
  const events: MatchEvent[] = [];

  for (let index = 0; index < eventCount; index += 1) {
    const minute = Math.min(89, Math.floor((index / eventCount) * 90));
    const isShiftPhase = minute >= 54;
    const isChaosPhase = minute >= 68;
    const teamId = isShiftPhase ? (isChaosPhase && index % 3 === 0 ? "AST" : "BRI") : index % 4 === 0 ? "BRI" : "AST";
    const playerId = `${teamId}-P-${String((index % 11) + 1).padStart(2, "0")}`;
    const attacking = teamId === "BRI" && isShiftPhase;
    const baseIndex = index;
    const roll = random.next();

    if (index === 84) {
      events.push({ ...eventBase(baseIndex, minute, "BRI", "BRI-P-09", "goal"), scorerId: "BRI-P-09", assistPlayerId: "BRI-P-07" });
      continue;
    }

    if (roll < 0.5) {
      const start = coordinate(random, attacking);
      const end = coordinate(random, attacking);
      events.push({ ...eventBase(baseIndex, minute, teamId, playerId, "pass"), start, end, distanceMeters: Number((8 + random.next() * 32).toFixed(1)), completed: random.next() > (isShiftPhase && teamId === "AST" ? 0.22 : 0.1), pressureCount: isShiftPhase ? 1 + Math.floor(random.next() * 3) : Math.floor(random.next() * 2) });
    } else if (roll < 0.68) {
      events.push({ ...eventBase(baseIndex, minute, teamId, playerId, "pressure"), location: coordinate(random, attacking), intensity: Number((0.45 + random.next() * (isShiftPhase ? 0.5 : 0.35)).toFixed(2)), durationSeconds: Number((1 + random.next() * 4).toFixed(1)) });
    } else if (roll < 0.78) {
      events.push({ ...eventBase(baseIndex, minute, teamId, playerId, "possession_change"), previousTeamId: teamId === "AST" ? "BRI" : "AST", nextTeamId: teamId, location: coordinate(random, attacking) });
    } else if (roll < 0.88) {
      events.push({ ...eventBase(baseIndex, minute, teamId, playerId, "tackle"), location: coordinate(random, attacking), won: random.next() > 0.25 });
    } else {
      events.push({ ...eventBase(baseIndex, minute, teamId, playerId, "shot"), start: coordinate(random, true), expectedGoals: Number((0.05 + random.next() * (isShiftPhase ? 0.3 : 0.18)).toFixed(2)), shotSpeedKph: Number((58 + random.next() * 48).toFixed(1)), outcome: "saved" });
    }
  }

  return { matchId: "synthetic-momentum-shift", scenario: "momentum-shift", teams: ["AST", "BRI"], events };
}

import { describe, expect, it } from "vitest";
import { aggregateMatchState } from "@/lib/analytics/aggregate-match-state";
import { runMatchIntelligenceAgents } from "@/application/agents/orchestrate-match-intelligence";
import { getFoundryProjectConfig, isFoundryReady } from "@/infrastructure/azure/foundry-config";
import { normalizeRows } from "@/lib/ingestion/normalize-events";
import { buildMatchInsight } from "@/lib/narrative/build-match-insight";
import { generateSyntheticMatch } from "@/lib/simulation/generate-match";

const validRows = [
  { timestamp: 60000, event: "pass", team: "AST", player: "AST-P-01", startX: 20, startY: 40, endX: 35, endY: 42, distanceMeters: 18, completed: "true" },
  { timestamp: 70000, event: "pressure", team: "BRI", player: "BRI-P-01", x: 65, y: 45, intensity: 0.8, durationSeconds: 2 },
  { timestamp: 80000, event: "shot", team: "BRI", player: "BRI-P-09", x: 82, y: 45, expectedGoals: 0.2, shotSpeedKph: 91, outcome: "saved" },
];

describe("match intelligence pipeline", () => {
  it("normalizes aliases and reports incomplete rows", () => {
    const result = normalizeRows([...validRows, { timestamp: 90000, event: "shot", team: "AST" }], "test-match");
    expect(result.events).toHaveLength(3);
    expect(result.events[0]?.eventType).toBe("pass");
    expect(result.events[0]?.matchId).toBe("test-match");
    expect(result.rejected).toEqual([{ rowIndex: 4, reason: "shot location is required" }]);
  });

  it("derives team state from canonical events", () => {
    const normalized = normalizeRows(validRows, "test-match");
    const state = aggregateMatchState(normalized.events);
    expect(state.eventCount).toBe(3);
    expect(state.teams).toHaveLength(2);
    expect(state.teams.find((team) => team.teamId === "BRI")?.shots).toBe(1);
    expect(state.teams.find((team) => team.teamId === "BRI")?.expectedGoals).toBe(0.2);
    expect(state.rhythmScore).toBeGreaterThan(0);
  });

  it("generates a repeatable scenario with evidence-backed insight", () => {
    const first = generateSyntheticMatch(27, 120);
    const second = generateSyntheticMatch(27, 120);
    expect(first.events).toEqual(second.events);
    expect(first.events.some((event) => event.eventType === "goal")).toBe(true);

    const state = aggregateMatchState(first.events);
    const insight = buildMatchInsight(first.events, state);
    expect(insight).toBeDefined();
    expect(insight?.confidence).toBeGreaterThan(70);
    expect(insight?.evidence.some((item) => item.eventIds.length > 0)).toBe(true);
  });

  it("passes shared state through the three agent handoffs", () => {
    const match = generateSyntheticMatch();
    const run = runMatchIntelligenceAgents(match.events, {
      profileId: "fan",
      locale: "en",
      detailLevel: "brief",
      deliveryModes: ["screen"],
      followedTeamIds: ["AST"],
      followedPlayerIds: [],
      interests: ["momentum"],
    });
    expect(run.trace.map((entry) => entry.agent)).toEqual([
      "match-state-agent",
      "evidence-agent",
      "experience-agent",
    ]);
    expect(run.renderedInsight?.profileId).toBe("fan");
  });

  it("keeps Foundry configuration optional until every role is mapped", () => {
    const partial = getFoundryProjectConfig({ AZURE_AI_PROJECT_ENDPOINT: "https://example.test", FOUNDRY_MATCH_STATE_AGENT_ID: "state" });
    const complete = getFoundryProjectConfig({ AZURE_AI_PROJECT_ENDPOINT: "https://example.test", FOUNDRY_MATCH_STATE_AGENT_ID: "state", FOUNDRY_EVIDENCE_AGENT_ID: "evidence", FOUNDRY_EXPERIENCE_AGENT_ID: "experience" });
    expect(isFoundryReady(partial)).toBe(false);
    expect(isFoundryReady(complete)).toBe(true);
    expect(isFoundryReady(getFoundryProjectConfig({}))).toBe(false);
  });
});

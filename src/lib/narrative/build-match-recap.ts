import type { MatchEvent } from "@/types/match";
import type { MatchInsight } from "@/types/insight";
import type { MatchStateSummary } from "@/types/match-state";
import type { MatchRecap, RecapSection, RecapSectionLabel } from "@/types/recap";

function teamLabel(teamId?: string) {
  return teamId === "AST" ? "Aston" : teamId === "BRI" ? "Brighton" : teamId ?? "the teams";
}

function sectionFor(
  label: RecapSectionLabel,
  events: MatchEvent[],
  state: MatchStateSummary,
  insight: MatchInsight,
): RecapSection {
  const eventIds = events.map((event) => event.eventId);
  const goal = events.find((event) => event.eventType === "goal");
  const pressure = events.filter((event) => event.eventType === "pressure").length;
  const shots = events.filter((event) => event.eventType === "shot").length;
  const dominantTeam = teamLabel(state.dominantDangerTeamId);
  const title = label === "first-half" ? "A game of control" : label === "second-half" ? "The match opens up" : "The story beneath the score";
  const text = label === "first-half"
    ? `The opening phase built around measured possession. ${events.length} validated events established the shape before the match became more volatile.`
    : label === "second-half"
      ? `${dominantTeam} turned pressure into danger, with ${pressure} pressure events and ${shots} shots in this window.${goal ? ` The goal by ${teamLabel(goal.teamId)} became the clearest consequence.` : " The pressure changed the feel of the match even without another goal."}`
      : `${insight.summary} The final read is supported by ${insight.evidence.reduce((total, item) => total + item.eventIds.length, 0)} event links rather than the scoreline alone.`;
  return { label, title, text, evidenceEventIds: eventIds.slice(-12) };
}

export function buildMatchRecap(
  events: MatchEvent[],
  state: MatchStateSummary,
  insight: MatchInsight,
): MatchRecap {
  const firstHalf = events.filter((event) => event.minute < 45);
  const secondHalf = events.filter((event) => event.minute >= 45);
  const sections = [
    sectionFor("first-half", firstHalf, state, insight),
    sectionFor("second-half", secondHalf, state, insight),
    sectionFor("full-time", events, state, insight),
  ];
  return {
    matchId: insight.matchId,
    headline: insight.title,
    sections,
    evidenceEventIds: [...new Set(sections.flatMap((section) => section.evidenceEventIds))],
    generatedAtMs: insight.createdAtMs,
  };
}

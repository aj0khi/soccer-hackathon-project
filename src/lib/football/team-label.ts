export function formatTeamLabel(teamId?: string) {
  if (!teamId) return "the teams";
  if (teamId === "AST") return "Aston";
  if (teamId === "BRI") return "Brighton";
  return teamId
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

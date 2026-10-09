import type { AgentName } from "@/application/agents/orchestrate-match-intelligence";

export interface FoundryProjectConfig {
  projectEndpoint: string;
  agents: Partial<Record<AgentName, string>>;
}

export function getFoundryProjectConfig(
  environment: Record<string, string | undefined> = process.env,
): FoundryProjectConfig | undefined {
  const projectEndpoint = environment.AZURE_AI_PROJECT_ENDPOINT?.trim();
  if (!projectEndpoint) return undefined;

  const agents: Partial<Record<AgentName, string>> = {};
  const mappings: Array<[AgentName, string | undefined]> = [
    ["match-state-agent", environment.FOUNDRY_MATCH_STATE_AGENT_ID],
    ["evidence-agent", environment.FOUNDRY_EVIDENCE_AGENT_ID],
    ["experience-agent", environment.FOUNDRY_EXPERIENCE_AGENT_ID],
  ];

  for (const [role, agentId] of mappings) {
    if (agentId?.trim()) agents[role] = agentId.trim();
  }

  return { projectEndpoint, agents };
}

export function isFoundryReady(config: FoundryProjectConfig | undefined) {
  if (!config) return false;
  return ["match-state-agent", "evidence-agent", "experience-agent"].every(
    (role) => Boolean(config.agents[role as AgentName]),
  );
}

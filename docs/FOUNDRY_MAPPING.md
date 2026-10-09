# Microsoft Foundry Mapping

The local agent graph is the executable fallback. Microsoft Foundry should replace each role independently while preserving the same handoff payloads.

## Project configuration

Set these values in `.env.local` after creating the Foundry project and agents:

```text
AZURE_AI_PROJECT_ENDPOINT=https://<project-endpoint>
FOUNDRY_MATCH_STATE_AGENT_ID=<agent-id>
FOUNDRY_EVIDENCE_AGENT_ID=<agent-id>
FOUNDRY_EXPERIENCE_AGENT_ID=<agent-id>
```

Authentication should use `DefaultAzureCredential`. Do not commit endpoint secrets, API keys, or access tokens.

## Agent roles

### Match State Agent

Input: validated `MatchEvent[]`

Output: `MatchStateSummary`

Responsibilities:

- Aggregate possession, pressure, passing, shots, and expected goals.
- Detect rhythm, chaos, and control states.
- Preserve the event window used for each calculation.

### Evidence Agent

Input: `MatchEvent[]` and `MatchStateSummary`

Output: `MatchInsight`

Responsibilities:

- Identify the most meaningful state change.
- Attach event IDs to every material claim.
- Return confidence and significance.
- Abstain when the evidence is insufficient.

### Experience Agent

Input: `MatchInsight` and `ExperienceProfile`

Output: `RenderedInsight`

Responsibilities:

- Adapt detail level, language, and emphasis.
- Support fan, analyst, studio, and player-focused modes.
- Preserve the original evidence references in output metadata.

## Handoff rules

1. Agents communicate through typed shared state, not free-form chat.
2. A downstream agent cannot receive an insight if the upstream agent abstains.
3. Every narrative claim must be traceable to event IDs or derived metrics.
4. The local implementation remains the fallback when Foundry is not configured.

## Deployment checklist

- Create an Azure AI Foundry project.
- Create one agent for each role above.
- Configure model deployment and content-safety settings.
- Grant the runtime identity access to the project.
- Configure Event Hubs and the consumer group.
- Add the project endpoint and agent IDs to deployment secrets.
- Run `npm test`, `npm run lint`, and `npm run build`.
- Run the demo scenario and compare local versus Foundry trace output.

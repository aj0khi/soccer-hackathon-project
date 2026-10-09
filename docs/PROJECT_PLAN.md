# Second Story Project Plan

Last updated: 2026-10-09

## Product goal

Second Story turns synthetic football events into evidence-backed match intelligence. It shows the difference between the story a match appears to tell and the story supported by the event stream.

## Done

### Workspace foundation

- Next.js 16, React, TypeScript, Tailwind CSS, ESLint
- GitHub branch: `soccer-hackathon-project`
- Local development server: `http://localhost:3000`
- Production build and lint checks configured
- Provider-neutral contracts in `src/types`
- Pipeline interfaces in `src/application/pipeline.ts`

### First interface

- Broadcast-inspired Second Story studio view
- Perceived Match versus Evidence Match
- Match-memory timeline
- Interactive decision window
- Studio and Fan lens toggle
- Responsive layout

### Intake preview

- JSON, CSV, and NDJSON/JSONL file selection
- Synthetic sample feed
- Field alias detection and mapping suggestions
- Dataset readiness score
- Recognized and held-back event counts
- Missing-field warnings

### Canonical normalization

- Converts accepted source rows into typed `MatchEvent` objects.
- Supports aliases for event, team, player, timestamp, location, and event-specific fields.
- Reports rejected rows with row numbers and concrete reasons.
- Keeps incomplete events out of downstream analysis instead of inventing values.

### Synthetic match generator

- Produces a deterministic 90-minute event stream from a seed.
- Includes passes, pressure, possession changes, tackles, shots, and a goal.
- Deliberately shifts from Aston control to Brighton transition pressure after minute 54.
- Available in the intake panel as the `Run momentum scenario` action.

### Live match-state aggregation

- Calculates possession share, pass accuracy, pressure index, shots, and expected goals by team.
- Derives control, danger, rhythm, and chaos scores from canonical events.
- Uses the same aggregator for uploaded data and the synthetic scenario.
- Surfaces the derived state in the intake report before narrative generation.

### Data-driven interface

- The score and match clock are derived from generated events.
- The main interpretation uses calculated control, danger, rhythm, chaos, and expected goals.
- Evidence bullets and the match-memory timeline are populated from the event stream.
- The intake panel and main studio surface share the same normalization and aggregation paths.
- Valid uploaded JSON, CSV, or NDJSON events now replace the active dashboard event stream.
- The dashboard recalculates its score, timeline, metrics, narrative, and agent trace from the uploaded events.

### Evidence-backed narrative engine

- Produces a structured `MatchInsight` from validated events and match state.
- Separates title, summary, explanation, confidence, significance, tags, and evidence.
- Attaches supporting event IDs to possession, pressure, and chance-quality claims.
- Renders the confidence score and supporting-event count in the live studio story.
- The current wording is deterministic and provider-neutral; an Azure AI narrative provider can be added behind the same contract.

### Personalization

- Studio mode renders deep evidence and methodology.
- Fan Lens renders the same insight in concise plain language.
- Player Focus follows a selected player and shifts the emphasis toward individual impact.
- All modes preserve the same underlying confidence and event evidence.

### Azure integration

- Added an optional server-only Azure Event Hubs source behind the `EventSource` interface.
- Uses `DefaultAzureCredential` for local Azure CLI or managed identity authentication.
- Filters events by `matchId` and rejects malformed event envelopes.
- Local synthetic data remains the fallback when Azure environment variables are absent.
- Azure resource provisioning and live end-to-end verification are still pending.

### Testing and demo readiness

- Added Vitest with `npm test`.
- Added pipeline tests for alias normalization, rejection reasons, match-state aggregation, deterministic simulation, and narrative evidence.
- Added the under-two-minute walkthrough in `docs/DEMO_SCRIPT.md`.
- Lint and production build remain required checks before each checkpoint.

### Agent orchestration

- Added a shared-state local orchestrator with three purposeful handoffs:
   - `match-state-agent` calculates the derived state.
   - `evidence-agent` builds the grounded insight and evidence groups.
   - `experience-agent` renders the selected audience profile.
- Added a test that verifies the handoff order and personalized output.
- The orchestrator is provider-neutral and ready to be mapped to Microsoft Foundry agents.

### Foundry mapping

- Added optional Foundry project and agent-role configuration.
- Documented the three role contracts and typed handoff rules in `docs/FOUNDRY_MAPPING.md`.
- Added tests for partial, complete, and absent Foundry configuration.
- Kept local execution as the fallback until Azure resources and credentials are supplied.

### Azure infrastructure template

- Added `infra/main.bicep` for an Event Hubs namespace, match-events hub, and consumer group.
- Added safe deployment parameters in `infra/main.parameters.example.json`.
- Added deployment and identity instructions in `infra/README.md`.
- Local Azure CLI validation and deployment remain pending because `az` is not installed in this workspace.
- Added a student-plan setup and cleanup guide with the Basic tier as the default.

## Current step: recap and multilingual output

The next layer should turn the same grounded insight state into a full-match recap and language-specific renderings while Azure provisioning is pending.

Completed implementation:

- `src/lib/ingestion/normalize-events.ts`
- `src/lib/simulation/generate-match.ts`
- `src/lib/analytics/aggregate-match-state.ts`
- `src/lib/narrative/build-match-insight.ts`
- `src/lib/narrative/render-personalized-insight.ts`
- `src/infrastructure/azure/config.ts`
- `src/infrastructure/azure/event-hub-source.ts`
- `src/application/agents/orchestrate-match-intelligence.ts`
- `src/infrastructure/azure/foundry-config.ts`
- `infra/main.bicep`
- `src/app/page.tsx` now consumes generated events and derived state.

Normalization, synthetic generator, aggregation, data-driven interface, narrative, personalization, and the Azure adapter definition of done: complete. Uploaded rows produce typed canonical events, invalid rows are reported, the scenario is repeatable, derived match state is calculated, the primary interface consumes that state, the narrative carries evidence IDs and confidence, audience modes render different detail levels, the optional Event Hubs adapter compiles behind the pipeline port, lint and build pass, and the intake report shows the resulting metrics.

Testing and demo readiness definition of done: complete. `npm test` passes three pipeline checks, lint passes, build passes, and a judge-facing script exists under `docs/DEMO_SCRIPT.md`.

Agent orchestration definition of done: local version complete. The three handoffs are tested and visible in the application; Foundry deployment and live Azure handoff verification remain pending.

Foundry mapping definition of done: complete. Role IDs, endpoint configuration, handoff contracts, local fallback behavior, and configuration tests are documented; resource provisioning remains pending.

Infrastructure definition of done: template complete. Event Hubs resources, example parameters, local secret protection, and deployment instructions are present; Azure CLI deployment remains pending.

## Remaining work

1. **Recap and multilingual output**
   - Generate first-half, second-half, and full-time recaps with evidence references.
2. **Live Azure provisioning**
   - Provision event-driven Azure resources, configure identities, create the three Foundry agents, and verify the live handoffs.
3. **Submission package**
   - Final pitch, public demo URL, GitHub repository, English testing instructions, and rights-safe demo assets.

## Guardrails

- Synthetic football-realistic data only.
- Preserve raw input separately from normalized events.
- Keep evidence attached to generated insights.
- Show uncertainty and missing data to the user.
- Do not use Premier League footage, copyrighted music, or unlicensed third-party assets.

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

## Current step: Azure integration

The next layer should connect the provider-neutral pipeline to Azure services without moving secrets or SDK types into the domain contracts.

Completed implementation:

- `src/lib/ingestion/normalize-events.ts`
- `src/lib/simulation/generate-match.ts`
- `src/lib/analytics/aggregate-match-state.ts`
- `src/lib/narrative/build-match-insight.ts`
- `src/lib/narrative/render-personalized-insight.ts`
- `src/app/page.tsx` now consumes generated events and derived state.

Normalization, synthetic generator, aggregation, data-driven interface, narrative, and personalization definition of done: complete. Uploaded rows produce typed canonical events, invalid rows are reported, the scenario is repeatable, derived match state is calculated, the primary interface consumes that state, the narrative carries evidence IDs and confidence, audience modes render different detail levels, lint and build pass, and the intake report shows the resulting metrics.

## Remaining work

1. **Azure integration**
   - Move ingestion to event-driven services and connect Microsoft Foundry/Agent Framework behind the existing interfaces.
2. **Testing and demo readiness**
   - Add parser tests, malformed-data tests, a repeatable demo scenario, deployment instructions, and a two-minute demo script.
3. **Submission package**
   - Final pitch, public demo URL, GitHub repository, English testing instructions, and rights-safe demo assets.

## Guardrails

- Synthetic football-realistic data only.
- Preserve raw input separately from normalized events.
- Keep evidence attached to generated insights.
- Show uncertainty and missing data to the user.
- Do not use Premier League footage, copyrighted music, or unlicensed third-party assets.

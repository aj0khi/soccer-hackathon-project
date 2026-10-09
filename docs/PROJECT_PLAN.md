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

## Current step: synthetic match generator

The next layer should create repeatable synthetic event streams with deliberate match-state changes so the interface can be driven by real event flow instead of fixed demo values.

Completed implementation:

- `src/lib/ingestion/normalize-events.ts`

Normalization definition of done: complete. Uploaded rows produce typed canonical events, invalid rows are reported, lint and build pass, and the intake report shows canonical versus rejected counts.

## Remaining work

1. **Synthetic match generator**
   - Create repeatable football-realistic event streams with deliberate momentum shifts.
2. **Live match-state aggregation**
   - Calculate possession, pressure, recovery height, pass quality, shot quality, rhythm, and control versus chaos.
3. **Data-driven interface**
   - Replace hardcoded dashboard values with the normalized event stream and derived state.
4. **Evidence-backed narrative engine**
   - Generate explanations linked to supporting event IDs and metrics.
5. **Personalization**
   - Add fan, player-focused, analyst, studio, and multilingual output modes.
6. **Azure integration**
   - Move ingestion to event-driven services and connect Microsoft Foundry/Agent Framework behind the existing interfaces.
7. **Testing and demo readiness**
   - Add parser tests, malformed-data tests, a repeatable demo scenario, deployment instructions, and a two-minute demo script.
8. **Submission package**
   - Final pitch, public demo URL, GitHub repository, English testing instructions, and rights-safe demo assets.

## Guardrails

- Synthetic football-realistic data only.
- Preserve raw input separately from normalized events.
- Keep evidence attached to generated insights.
- Show uncertainty and missing data to the user.
- Do not use Premier League footage, copyrighted music, or unlicensed third-party assets.

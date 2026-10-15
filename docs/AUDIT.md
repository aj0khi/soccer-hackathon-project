# Project Audit

Last audited: 2026-10-14

## Fixed in this audit

- Generalized dashboard labels and probability outputs to follow the active dataset teams instead of assuming AST/BRI.
- Generalized fan, player, recap, timeline, and multilingual copy for uploaded teams and players.
- Replaced naive CSV splitting with quote-aware parsing.
- Hardened Azure Event Hubs validation for event-specific fields, not only the common envelope.
- Added regression coverage for quoted CSV fields and malformed cloud pressure events.
- Confirmed production dependency audit reports zero vulnerabilities with `npm audit --omit=dev`.
- Confirmed desktop and mobile browser layouts have no horizontal overflow.
- Confirmed application-owned controls are interactive; the Next.js development-tools button is framework-owned.

## Remaining risks

### Live cloud path

The Bicep template and Foundry role mapping are ready, but no Azure resources or credentials are connected in this workspace. Deploy Event Hubs, create the Foundry agents, configure identity access, and compare the cloud trace with the local trace.

### Provider-backed language and narrative

The current Spanish/French and narrative renderers are deterministic local fallbacks. They are suitable for the demo path, but a production version should use a configured translation/model provider while preserving event evidence and abstention rules.

### Video auto-eventing

The project currently consumes event data, not video. Auto-eventing from video is optional in the challenge brief and should only be added if licensed footage, a model, and enough time are available. It should not displace the validated event pipeline.

### Probability model

The Probability Lab uses an independent Poisson model based on synthetic xG and remaining time. It is explainable model math, not bookmaker data, historical league truth, or wagering advice.

## Submission blockers

- Live Azure deployment and test instructions with accessible credentials or a public demo path.
- Final English pitch and architecture explanation.
- Public demo video under two minutes using only rights-safe assets.
- Public GitHub repository and reproducible setup instructions.
- Final run of `npm test`, `npm run lint`, and `npm run build` before submission.

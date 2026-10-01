This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

# Inside the Game

An Azure-ready workspace for turning synthetic, football-realistic events into explainable match intelligence and personalized stories.

The product direction is intentionally still open. The first stable boundary is the incoming match-event contract in `src/types/match.ts`; future ingestion, analytics, agent, and rendering work should build around that contract.

## Stack

- Next.js 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS 4
- ESLint
- Azure services will be added as the event pipeline is designed

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000` in a browser.

Validation commands:

```bash
npm run lint
npm run build
```

## Data rules

- Use synthetic football-realistic data only.
- Keep generated narratives grounded in the event stream and derived metrics.
- Store secrets in `.env.local`; never commit them.
- Keep raw events, derived match state, explanations, and presentation payloads as separate layers.

## Planned boundaries

1. Ingest and validate synthetic events.
2. Aggregate events into match state and football metrics.
3. Explain important changes with evidence from the event stream.
4. Personalize the output for fans, analysts, and studio workflows.
5. Render synchronized insight cards, overlays, and recaps.

## Source layout

- `src/types`: provider-neutral event, insight, and experience contracts.
- `src/application`: pipeline interfaces and orchestration boundaries.
- `src/infrastructure`: future local fixtures and Azure adapters.
- `src/app`: the web experience, to be shaped after the product direction is selected.
- `docs`: architecture decisions and project notes.

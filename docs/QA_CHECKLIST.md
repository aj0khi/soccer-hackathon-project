# UI QA Checklist

Last checked: 2026-10-14

## Local run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Verified interactions

- Settings opens and closes the workspace settings panel.
- Profile control cycles Studio, Fan Lens, and Player Focus.
- Match scrolls to the primary story.
- Data opens the intake panel.
- Sample feed and momentum scenario create a dataset profile.
- Valid intake events replace the active dashboard event stream.
- Signals scrolls to the match-memory timeline.
- On air scrolls to the live interpretation surface.
- Guide opens and closes the in-product guide.
- Studio, Fan Lens, and Player Focus audience buttons update the rendered copy.
- EN, ES, and FR update the recap rendering.
- Open evidence trail opens a claim audit drawer.
- Evidence drawer close and backdrop interactions work.
- Decision window buttons switch the selected path and result text.
- Intake drawer close and backdrop interactions work.

## Automated checks

```bash
npm test
npm run lint
npm run build
```

The Next.js development tools button is framework-injected and is not part of the application QA surface.

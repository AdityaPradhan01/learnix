# Paste this into Claude Code

Put the `design_handoff_learnix/` folder in your repo root (or in an empty folder), run `claude`, and paste:

---

Build **Learnix**, a university course recommendation website. The full design is in `design_handoff_learnix/`.

1. Read `design_handoff_learnix/README.md` end to end. It is the spec: tokens, all 9 screens, the scoring model, state, motion and accessibility.
2. Read `design_handoff_learnix/design/Learnix.dc.html`. It is an HTML **prototype for reference only**. Its markup is the visual spec (all styles are inline) and its `class Component` is the behavioural spec. Do not copy its runtime (`support.js`, `<sc-for>`, `<sc-if>`).
3. Use `design/canopy-data.js` as seed / mock data.

Stack: [describe your codebase — or write "none yet: use Next.js App Router + TypeScript + Tailwind + Framer Motion"].

Work in this order, and stop for my review after each step:
1. **Plan:** routes, components, data layer, and where the scoring lives. No code yet.
2. **Tokens:** the colours, type (Archivo + Space Mono), radii, shadows and dot-grid texture as Tailwind theme / CSS variables.
3. **Scoring module:** pure and unit-tested functions for subscores, weighted match, bands, reasons, exclusions and clash detection. Port them exactly from `sub()`/`dec()`.
4. **Shared UI:** Pill button, Segmented control, Chip toggle, Ring, Switch, Toast with Undo, Tile, and a reveal-on-scroll wrapper that respects reduced motion.
5. **Landing**, then **Onboarding**, then **Home**.
6. **Explore** and **Course detail** (with the 4 tabs).
7. **Progress**, **Saved** (with the weekly timetable), **Updates** and **Settings**.
8. Propose and build what the prototype does not cover: auth, loading and error states, and mobile layouts.

Rules: match the design exactly (high fidelity). No inline styles in production. Keep the fixture data behind a data layer so it can be swapped for real registrar and catalogue APIs. Never leave content hidden if an animation fails.

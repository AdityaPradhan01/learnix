# Handoff: Learnix — course recommendation website

## Overview
Learnix recommends university courses to a degree student choosing next-term classes. It reads the student's career goal, interests, transcript and weekly availability. It ranks every eligible course and explains each recommendation in plain language. Users can save courses, see their week, track skill gaps and get deadline alerts.

Primary user: undergraduate student (demo persona: Riya Advani, BS Computer Science, Year 3). Platform: desktop web (min width ~1024px).

## About the design files
The files in `design/` are **design references built in HTML**. They form a working prototype that shows the intended look and behaviour. They are **not production code to copy**. The prototype runs on a bespoke design-tool runtime (`support.js`, `<sc-for>`, `<sc-if>`, and a `class Component extends DCLogic`). Do not ship that runtime.

**Task:** recreate these designs in the target codebase's environment, using its routing, state and styling patterns. If there is no codebase yet, use **Next.js (App Router) + TypeScript + Tailwind CSS**. Add Framer Motion for animation.

How to read the prototype:
- `design/Learnix.dc.html`, the template part (markup before `<script data-dc-script>`), is the **visual spec**. All styles are inline, so every size, colour and radius can be read directly.
- The logic part of the same file (`class Component`) is the **behavioural spec**: state shape, scoring maths, derived values and handlers.
- `design/canopy-data.js` holds all **fixture data**: courses, instructors, reviews, careers, transcript, notifications and degree requirements. Use it as the seed or mock API.
- Construct mapping: `<sc-for list="{{ xs }}" as="x">` means `xs.map(x => …)`, `<sc-if value="{{ f }}">` means `{f && …}`, and `renderVals()` holds the selectors / `useMemo` values.

## Fidelity
**High-fidelity.** Colours, type, spacing, radii, copy, interactions and animations are final. All data is placeholder.

## Design tokens
### Colour — "Salt & pepper + Gothic noir"
| Token | Hex | Use |
|---|---|---|
| salt (bg) | `#F5F4F1` | page background |
| pepper (surface) | `#E4E3DF` | tiles, cards, pill tracks |
| ink | `#141414` | text, dark tiles, primary nav pill |
| charcoal | `#2B2B2E` | ring tracks on dark |
| graphite (muted text) | `#5E5E63` | secondary text (≥4.5:1 on salt) |
| silver | `#BDBCB8` | muted text on dark, dotted rules |
| stone | `#D2D1CC` | inactive step bars, stripes |
| oxblood (accent) | `#7A1F2B` | primary CTA, match rings, highlights |
| oxblood-hover | `#5C1620` | CTA hover |
| blush | `#F3E4E6` | text on oxblood |
| rose | `#C9A9AE` | secondary ring ("after saved courses"), bullets on dark |

Signal colours (score breakdown): Career goal `#7A1F2B`, Skill gap `#141414`, Past courses `#8A8A8F`, Schedule fit `#C9A9AE`, Credit value `#D2D1CC`.

### Type
- **Archivo** (400/600/800) for headings and body. **Space Mono** (400/700) only for small uppercase labels.
- Display: `clamp(44px,7vw,88px)`, weight 800, letter-spacing −0.04em, line-height ~1.
- Section H2: `clamp(28px,3.6vw,44px)`, −0.03em. Card titles: 17–22px, weight 800.
- Body: 15–20px. Labels: Space Mono 11–12px, uppercase, letter-spacing .18–.2em.

### Shape and space
- Tiles/cards: radius **28px** (hero cards 32–36px). Buttons, chips, segmented controls and toasts are **pills (999px)**. Avatars and date badges are circles.
- No borders on tiles. Separation comes from surface colour and whitespace. The one exception is 1–1.5px hairlines in settings rows and the light tile on Home.
- Content max-width **1040px** (landing 1120px), side padding 28px. Section rhythm is 72–120px vertical.
- Shadows only on hero objects: `0 40px 80px -40px rgba(20,20,20,.5)`.
- Brand texture: a dot grid, `radial-gradient(rgba(20,20,20,.14) 1.2px, transparent 1.6px)` at 14–18px, usually faded out with a radial `mask-image`.

### Components
- **Primary pill:** oxblood bg, white text, 48px tall, 26px horizontal padding, weight 600. Hover goes to oxblood-hover with `scale(1.04)`. Secondary pill: pepper or ink bg. Text link: oxblood.
- **Segmented control:** pepper track with 4px padding. The active segment is an ink pill with salt text. Used for main nav, course tabs, sort and notification filters.
- **Chip toggle:** pill, 1.5px border. When on, it fills with ink and uses `aria-pressed`.
- **Ring:** SVG circle `r=26` in a 64 viewBox, rotated −90°, round linecap, `stroke-dasharray = (C·pct) C` where `C = 2π·26`. The number is HTML overlaid on top, not SVG text.
- **Switch:** 52×32 pill with a 26px white knob. On = oxblood, off = silver. `role="switch"`.
- **Toast:** bottom-centre ink pill with a salt "Undo" pill. Auto-dismisses after 6s.

## Screens
1. **Landing:** sticky blurred nav (logo, 3 links, Log in, Get started). Centred hero with a label, 104px headline "Your next term, figured out.", a subline, a CTA pill and a text link. Below it, a large dark app-preview card on a masked dot grid, with a best-fit course, three reasons, and an oxblood match panel whose 92% counts up. Then a black statement band ("Every pick tells you why.") with a pulsing oxblood glow. Then a 3-tile row (Goal pills, Record bars, Week bars), a closing CTA and a footer.
2. **Onboarding (4 steps, full screen):** step dots at the top. Centred label, question headline and hint. Step 1 is a 3×2 grid of career tiles, each with an abstract shape glyph. Step 2 is interest pills. Step 3 is transcript pills with grade badges, tap to exclude. Step 4 is a 220px ring showing hours, a slider, and circular day toggles. At the bottom: Back / Continue and a live "N courses match so far" count.
3. **Home:** centred greeting. A best-fit hero card (dark left side with reasons, Learn more and Save; oxblood right side with a 200px ring). A 3-tile bento: days to registration, biggest skill gap as a ring, saved hours against budget as a ring. A horizontal scroll-snap row "More for you".
4. **Explore:** centred title and a 64px white search pill. Department and day chips, a workload slider pill, and a sort segmented control. A live result count with Clear. A grid of cards (ring, heart, code, title, instructor, and chips for rating, hours and seats), plus an empty state.
5. **Course detail:** breadcrumb, centred code, headline and blurb. A 250px match ring on a masked dot halo, with Save and "Not for me" pills. A spec row of 4 big numbers (rating, h/week, credits, seats). Tabs:
   - Overview: three "Why it fits you" tiles in ink, pepper and oxblood; a prerequisite path of ✓ pills joined by dotted lines; and an expandable score breakdown.
   - Syllabus: a 6-node horizontal timeline and a stacked grading bar with a legend.
   - Instructor: a dotted circle avatar with initials, a rating, years teaching and a bio.
   - Reviews: a 120px rating, a distribution bar chart and quote cards.
6. **Progress:** a 280px credits ring on a dot halo. Five skill tiles with dual rings (ink = now, rose = after saved courses) and a status pill. A requirements tile with bars and an oxblood "Focus next" tile.
7. **Saved:** a workload ring tile and a registration date tile. A clash alert pill, shown when needed. A rounded weekly timetable (08:00–18:00, blocks placed from `t0/t1`, striped unavailable days). A list of saved rows with Remove.
8. **Updates:** a segmented filter and Mark all read. A vertical dotted timeline of circular date badges beside rounded cards, with read/unread dots.
9. **Profile & settings:** a dotted avatar. Grouped cards: Preferences (rows go to onboarding), What matters most (5 weight sliders + reset), Notifications (switches), Accessibility (larger text = 1.125 zoom), and Hidden courses (restore).

Suggested routes: `/`, `/onboarding`, `/home`, `/explore`, `/course/[id]?tab=`, `/progress`, `/saved`, `/updates`, `/settings`.

## Recommendation model (port exactly — see `sub()` and `dec()`)
- Skill axes: `ml, stat, sys, alg, prac`. `BASE` is the student's current level. Unticking transcript courses subtracts their `sk` contribution.
- Each career has a target vector `t`.
- Per-course subscores (0–100):
  - `goals = 38 + 105·(Σ sk·t / Σ t)`, plus 5 if a selected interest matches the title or blurb.
  - `gap = 30 + 140·(Σ sk·max(0,t−have) / Σ gap)`.
  - `history` = fixture value, halved if a prerequisite is unticked.
  - `schedule` = fixture value, multiplied by 0.7 if `hrs > hours/2.5`.
  - `cost` = fixture value.
- Weights come from user sliders (default 30/25/20/15/10) and are **normalised on read**. `match = Σ raw·w/Σw`. Bands: ≥85 "Great fit", ≥72 "Good fit", otherwise "Okay fit".
- Reasons: take the top 3 contributions and map each to a plain sentence. The list-card reason skips the generic "goal" sentence when a more specific one exists.
- Exclusions happen **before** ranking: hidden courses and courses meeting on a blocked day.
- Clash detection: two saved courses that share a day and have overlapping `t0–t1`.

## State (all else derived)
```
screen, step, career, interests[], taken[], hours, offDays[],
weights{goals,gap,history,schedule,cost}, query, fDept[], fMaxHrs, fDays[], sort,
detailId, tab, saved[], hidden[], read[], nFilter,
notifSet{deadlines,seats,newc,email}, largeText, toast{label,undo}
```
Persist the profile, weights, saved, hidden, read and settings server-side per student. Filters and tab state can live in the URL.

## Interactions and motion
- **Entrance:** elements tagged `data-anim` animate when they reach 92% of viewport height.
  - `up`: translateY(28px) to 0, opacity 0 to 1, 900ms.
  - `rise`: translateY(70px) scale(.97) to none, 1200ms.
  - `grow`: scaleX/scaleY 0 to 1, staggered 90ms.
  - `ring`: stroke-dashoffset from L to 0, 1400ms.
  - `count`: number counts up with ease-out cubic.
  - Easing throughout: `cubic-bezier(.2,.7,.2,1)`. Per-element delay from `data-delay`.
- **Ambient:** dot grids drift (background-position 5s, infinite). The glow on the landing statement band pulses (scale .9 to 1.15, 7s).
- **Hover:** tiles and cards lift `translateY(-6px)` over 450ms. Pills `scale(1.04)`.
- **Safety:** the prototype never leaves content hidden. A 4s fallback reveals everything. In production, use Framer Motion `whileInView` with `initial` only on the client.
- **Reduced motion:** honour `prefers-reduced-motion`. No entrance or ambient animation; show everything static.
- **Undo:** every save, remove and hide shows the toast with Undo.

## Accessibility
- Focus ring: `3px solid #7A1F2B`, offset 2px.
- Minimum 40–44px targets.
- `aria-current` on nav items; `aria-pressed` on toggles and chips; `role="tab"`/`aria-selected` on course tabs; `role="switch"`/`aria-checked` on switches; `aria-live` on result and match counts.
- Labels on all sliders and search. Decorative shapes are `aria-hidden`.

## Not covered by the prototype (design these in-system)
Auth and sign-up screens, loading skeletons, API errors, mobile layouts (<1024px), real instructor photos (the initials avatar is a placeholder), and the registration flow itself.

## Files
```
design/Learnix.dc.html   prototype: template = visual spec, class Component = behaviour
design/canopy-data.js    fixture data (courses, reviews, careers, notifications…)
design/support.js        design-tool runtime — reference only, do not ship
design/_ds/…/styles.css  base design-system stylesheet the prototype overrides (reference)
PROMPT.md                paste-ready opening prompt for Claude Code
```
To view the prototype, serve the `design/` folder (e.g. `npx serve design`) and open `Learnix.dc.html`.

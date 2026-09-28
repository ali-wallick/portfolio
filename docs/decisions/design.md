# Decision record — design

Why the site looks and behaves the way it does. **Everything here is settled: do not relitigate
it.** [`CLAUDE.md`](../../CLAUDE.md) is the standing brief and carries the design rules a routine
job trips over; this file carries the reasoning and the measurements behind them.

Read it before a look, motion, spacing, colour, type or control-shape change. Most of these
sections are the live-switcher loop's output, and the `design-switcher` skill points here.

Sections are in the order they were decided. Append a new pass at the end.

**`grep '^## ' docs/decisions/design.md` is the index.** A heading here states the decision it
settled rather than its topic, so scanning the headings beats scrolling the file.

[`docs/REBUILD-LOG.md`](../REBUILD-LOG.md) carries the _narrative_ of how each pass was run and
what it cost; this file carries what it decided. They are not two copies of one thing.

---

## Phase 5 gate outcome (2026-08-17)

Four questions, settled. Do not relitigate. The gate's verification step also corrected two facts
that both CLAUDE.md and the plan had been asserting since Phase 2 — see "What the gate corrected"
below, because one of them changes what the phase's signature piece of work actually is.

### 1. Three directions — two invented, one revival

The plan's suggested spread was playful/toy-like, dense/craft-forward, and editorial. **Editorial is
dropped and replaced by a modern reinterpretation of the old site's own palette.** The remaining
three:

| Direction           | Territory                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------- |
| **Playful / toy**   | Leans into the game-dev identity. Interactive, game-UI-referencing, motion is load-bearing. |
| **Dense / craft**   | Information-dense and restrained. The work speaks; the frame gets out of the way.           |
| **Palette revival** | Warm, saturated, serif-bodied, hard offset shadows — Ali's own 2014 palette, reinterpreted. |

Editorial went rather than one of the others because the revival absorbs most of its territory —
both are type-led, warm, and reading-focused, so keeping both would have spent a branch on near
-duplicate ground. Playful and dense sit furthest from the revival on both energy and density, which
is what makes the three-way comparison worth Ali's time.

**Why the revival is not nostalgia.** The brief that governs this phase is _it should be obvious a
game developer made this and not obvious which template they used._ Every invented direction has to
argue its way to "not a template." A direction derived from a palette Ali chose herself in 2014 is
not-a-template **by construction** — there is no template it could be mistaken for, because the
source is her. See "The old palette is real" below for the actual values and their measured contrast.

### 2. Type is settled globally; color varies per direction

These are not in tension, and the split is deliberate.

- **Type: a display face for headings, a neutral sans for body, monospace for technical furniture**
  — engines, years, roles, `tech` lists. That last role is doing real work here: a large share of
  this site's content _is_ technical metadata, so mono stops being decoration and starts being
  semantic. The **role assignment is shared across all three directions**; each direction picks its
  own faces. The revival direction adds a fourth voice, a text serif for prose, continuous with the
  old site's use of Georgia for paragraphs.
- **Color is a per-direction variable**, not a decision made up front. It is the axis Ali most wants
  to react to rather than be presented with, and making it vary is what extracts the most information
  from three previews.

### 3. Motion: shared baseline in tokens, per-direction expression

`--ease` and `--duration` carried the old site's real curve and duration (see the correction below)
on `master` through Phase 5, so **every direction inherited the chase-and-settle character** whether
or not it made a feature of it. (Phase 6 tuned them to the direction that shipped — see "The motion
values are tuned now, not recovered" below. The character is the same family; the numbers are not
the recovered ones any more.) Where that character is most visible is a per-direction choice. This is what
"reinterpret `nav.js`, don't delete it" resolves to concretely.

Ruled out: a literal port. A JavaScript scroll handler reimplementing `position: sticky` in 2026 is
nostalgia, not reinterpretation, and the old implementation's return trip is a bug (below) rather
than an idea worth carrying.

## What the gate corrected

Both corrections came from reading primary sources rather than CLAUDE.md. Both were load-bearing.

### `nav.js` contains no easing — the personality is four lines of CSS

CLAUDE.md and the plan both described "a hand-rolled easing sticky sidebar built before
`position: sticky` existed." That is wrong in a way that matters. `resources/js/nav.js` does no
interpolation at all — no lerp, no `requestAnimationFrame`. Its `onScrolled()` reads `#MainContent`'s
bounding rect and assigns `quickInfo.style.top` **directly**, on every scroll event.

The easing is in `resources/css/templateStyles.css`:

```css
.scrolled {
  position: relative;
  transition: top 0.5s;
  transition-timing-function: cubic-bezier(0, 0, 0.25, 1);
}
```

So the real mechanism is: **JS retargets `top` on every scroll event, and CSS eases each retarget over
500ms.** Scroll events fire far faster than 500ms, so the sidebar never arrives while the page is
moving — it chases, and settles when scrolling stops. The lag-and-settle is _emergent from a
transition being continuously retriggered_, not a designed animation.

What follows from that:

- **The character is two token values**, not a component: `cubic-bezier(0,0,0.25,1)` and `500ms` — the
  _recovered_ pair, which is what shipped through Phase 5 and what Phase 6 tuned away from. Both
  differ sharply from the Phase 2 placeholders they replaced — the old `--ease` was
  `cubic-bezier(0.2,0,0,1)` and `--duration` was `240ms`. The real curve has **zero ease-in**: it
  launches at full speed and decelerates hard. The real duration is twice as long.
- **The technique generalizes** to anything with a continuously-updating target, which is what makes
  the abstract reinterpretation viable rather than a cop-out.
- **One asymmetry is a bug, not the good idea.** `position: relative` and the transition exist only
  while `.scrolled` is applied, so scrolling back to the top drops the class and the return snaps.
  Don't reproduce it.
- **Nothing else in `nav.js` needs preserving.** The rest is breadcrumbs and nav highlighting, which
  Astro already does natively — `BaseLayout.astro` sets `aria-current` today.

### The old palette is real, and Phase 3 filed it as cruft

Phase 3 listed `palette.html` and "the unlinked `colors.css`" under dead ends to kill. Correct as
_served files_ — but `snapshot/misc/colors.css` is a Paletton export documenting a color system the
old site genuinely used, and `templateStyles.css` shows it applied throughout:

| Role                   | Value                                             |
| ---------------------- | ------------------------------------------------- |
| Body ground            | `#FFE4C2` warm peach                              |
| Content ground         | `#FFF6EB` cream                                   |
| Section / aside        | `#99C9B3` mint                                    |
| Section shadow         | `-5px 5px 0 #4AA17A` — **hard, no blur**          |
| Headings               | `#006E3C` deep green                              |
| Link / visited / hover | `#9F2B00` rust / `#063E66` navy / `#4A7696` slate |
| Type                   | Trebuchet MS chrome, **Georgia body**             |

**Measured, not assumed** — contrast ratios computed at the gate rather than eyeballed. Body text on
mint is 7.65:1 (AAA) and links on cream are 6.96:1. The only failures are accents: headings on mint
3.45:1, hover 2.63:1, links on mint 4.03:1. **The hues are sound; the accent lightnesses need
retuning.** That is a palette to reinterpret, not to discard, and it is why the revival direction
exists.

## Phase 5 execution outcome (2026-08-20)

**Direction 03, playful / toy, in the arcade-dimmed palette.** Merged via
[PR #19](https://github.com/ali-wallick/portfolio/pull/19) at `2b60bf6`. Directions 01 (palette
revival, [#12](https://github.com/ali-wallick/portfolio/pull/12)), 02 (dense / craft,
[#13](https://github.com/ali-wallick/portfolio/pull/13)) and 04 (the hybrid,
[#18](https://github.com/ali-wallick/portfolio/pull/18)) are closed. Their branches are kept.

The direction's thesis: **the play is in the interaction layer, not the paint.** A still reads as a
confident, information-dense portfolio; using it makes it obvious a game developer built it. That
was a deliberate answer to the risk the brief named — whimsy undercutting a Marvel Snap credit in
the two seconds a hiring manager spends deciding whether to forward it.

Two devices carry it, each with a rule attached:

- **The reticle.** One element that travels to whatever is pointed at or tabbed to. Rule: it
  decorates, never informs. The native focus ring stays underneath, so keyboard users lose nothing
  if the script never runs.
- **Height.** An unblurred shadow, and **height means pressable**. Nothing decorative gets height,
  which is what stops the device becoming a texture applied to every box on the page.

**Colour is three layers, each with a job** — magenta marks _where you are_ (reticle, focus, current
page), blue marks _where you can go_ (links, and only links), and five status hues mark _what a
thing is_, one per `status` enum value. Adding a status without adding a colour pair falls back to
the neutral pair, which is legible but says nothing. Add both.

### Two things that were decided twice, and the second answer is the one that stuck

- **The direction was chosen before its colour was.** Ali picked 03 on behaviour while explicitly
  disliking the lilac-and-coral it happened to be built in. Rather than guess, four candidate
  palettes went up behind a live switcher on one preview — because the only comparison that matters
  is flipping between them on the _same_ page, which separate branches make impossible. Arcade won,
  then got five riffs of its own on one axis: how dark its light mode should be.
- **Near-white was the palette at its weakest.** Arcade's identity is saturated accents holding
  their own against a dark ground, and near-white is where magenta and cyan look cheapest. The
  shipped ground is off white with a violet cast lifted from the dark theme — the first version
  where the two themes read as the same site.

### The print block can be beaten on specificity, not just on omission

**This is a correction to what CLAUDE.md already says**, and it is worth reading before touching
`resume.css` or `tokens.css`. The Phase 4 note in [`resume.md`](resume.md) warns that the print
block is a denylist which silently passes any token nobody enumerated. True, and incomplete.

Making a palette the default put **28 elements of the résumé PDF in the wrong colour** — a token the
print block _does_ pin. The block pins on `:root`, specificity (0,1,0); the palette rules were
`:root[data-palette='…']`, (0,2,0). **Media queries do not affect specificity**, so the palette won
on paper. The page-count assertion saw nothing, because colour costs no height.

So: pinning a token is not sufficient. Any selector that outranks a bare `:root` beats the print
block regardless of the media query. The fix used was `@media screen` around the offending rules,
which is a statement about where they may apply at all — scoping the screen half of `resume.css`
inside `@media screen` so screen rules cannot reach paper. **That is the fix to reach for**, and it
is one half of [#35](https://github.com/ali-wallick/portfolio/issues/35); the other half is a differ that names the offending element rather
than reporting that a number moved.

### Three soft decisions, deliberately left soft

Ali's framing at the close: _"this is good enough to move on for now."_ **Nothing about them is
wrong** — they are the choices most likely to read differently after living with the site rather
than looking at a comparison page: the faces, the colour calibration at the edges, and the tweening.

All three were booked as one issue and that was a mistake worth naming: they shared a number because
they were deferred in the same conversation, not because they were one activity. The tweening turned
out to be a state-machine change driven by a usability complaint, the faces are a comparison with a
CLS hazard attached, and the calibration is three hand-fitted contrast values. Nothing about doing
one informs doing another. Split on 2026-08-21 — **the tweening, the faces, and the colour
calibration are all settled and closed** — the next three sections. They are the design-scoped
siblings of the wording pass ([#31](https://github.com/ali-wallick/portfolio/issues/31)) and the
resume tone pass ([#32](https://github.com/ali-wallick/portfolio/issues/32)); sequencing them is
[#23](https://github.com/ali-wallick/portfolio/issues/23).

**What generalises, and belongs here rather than in the issue:** `--ease` and `--duration` were the
_old site's_ recovered curve and duration, adopted as a shared baseline across all four directions
and never tuned to this one. **Inheriting a character is not the same as choosing it** — which is
what the section below is the resolution of.

## The motion values are tuned now, not recovered (2026-08-21)

Settled on a live switcher, closing [#33](https://github.com/ali-wallick/portfolio/issues/33), which
was rescoped to just this. The faces and the colour calibration are separate now, both closed below.

| Token / value             | Was                        | Is                                   | Why                                                                                                                                                                                                       |
| ------------------------- | -------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--duration`              | `500ms` (recovered)        | **`320ms`**                          | 500ms read as sluggish rather than characterful once the reticle made it visible on every hover.                                                                                                          |
| `--ease`                  | `cubic-bezier(0,0,0.25,1)` | **`cubic-bezier(0.34,1.28,0.64,1)`** | Same family — launches at full speed, decelerates hard — plus 2.6% overshoot. A descendant of the recovered curve, not a replacement.                                                                     |
| `--duration-fast`         | `250ms`                    | **unchanged then, `160ms` now**      | It was never in this comparison, and the note here said to revisit it deliberately rather than as a side effect. That revisit happened in #67: it was restored to half of `--duration`. See `tokens.css`. |
| Reticle idle behaviour    | return home immediately    | **hold 1.6s, then fade, and cut**    | The busyness was the _return trip_, not the acquisitions. See `src/scripts/reticle.ts`.                                                                                                                   |
| Reticle acquisition dwell | none                       | **25ms**                             | Stops a pointer travelling somewhere else from dragging the brackets through every control it crosses.                                                                                                    |

**`1.28` is a control-point ordinate, not a peak.** The actual overshoot is 2.6%, measured — which is
what makes the curve safe on the clamped colour transitions in `base.css` (3–6 RGB units for a few
milliseconds). It was _not_ safe on opacity, which is why the reticle's fade has its own curve.

## The faces are confirmed, not changed (2026-08-22)

Closes [#66](https://github.com/ali-wallick/portfolio/issues/66). Unlike the motion values above,
this is a **no-change decision** — Gabarito, Figtree and DM Mono all held against eleven alternatives
on a live switcher, the same review-loop pattern as the motion and colour switchers before it.

**The option set itself was chosen by measurement, not the catalogue**, per the rule the tweening
pass established — an instrument with two identical marks on it is worse than one with fewer marks.
Nineteen faces were measured headless before any of them went on the switcher; seven were dropped for
landing on a mark another candidate already occupied. That measurement also overturned the stated
reason for DM Mono — `tokens.css` said "narrow enough to survive the metadata strip," but every
credible mono measured is exactly 0.600em per character, DM Mono included. Width discriminates
between none of them; x-height does, and `tokens.css`'s comment is corrected to say so.

**Also checked, at Ali's request: whether any of these read as an AI-generated-site default.** Inter,
Space Grotesk and Geist are the three fonts most commonly named in 2026 discussion of what makes a
site look AI-built — Inter because it's the most-used interface face in the training data and
shadcn/ui's own default, Space Grotesk as "the model's idea of edgy," Geist for its saturation in
v0/Vercel-generated output. None of Gabarito, Figtree or DM Mono turned up on any such list; Space
Grotesk and Geist Mono were in fact two of the eleven alternatives compared and rejected. The
incumbents are unchosen in the sense of "not reconsidered since Phase 5," not in the sense the slop
critique means.

**One finding did not get acted on and is tracked separately, deliberately.** `tokens.css` claimed
`68ch` of Figtree "measures" 40.4rem; it actually measures 43.58rem by two independent methods. The
rendered column is unaffected — the value was signed off visually, not derived from that claim — but
the claim itself is wrong in a comment the file's own header calls load-bearing. Fixing it would have
meant touching `--measure`, which is a layout decision outside what #66 was for, so it is
[#68](https://github.com/ali-wallick/portfolio/issues/68) instead of a silent edit here.

The switcher — `scripts/preview-fonts.mjs`, the panel in `BaseLayout.astro`, twelve candidate
`@fontsource` packages — was scaffolding for the comparison and is gone; `BaseLayout.astro` is
byte-identical to master again. See the Phase 6 log entry for how it was built and the three bugs
caught while building it.

## The colour calibration is settled (2026-08-22)

Closes [#67](https://github.com/ali-wallick/portfolio/issues/67). Same review-loop pattern as the
motion values and the faces — a live switcher on one preview, candidates chosen by computing the
axis that actually differs rather than by eye.

Part of #67 had already shipped directly, outside the switcher loop, in a prior look-polish pass:
`--color-plate` went from a 1.67:1/1.77:1 split (fitted to one ground, nearly invisible on another)
to a flat 2.2:1 in both themes. That value went back on the switcher anyway, against four other
ratios (1.8/2.6/3.0/3.4) spanning faint to heavy — **confirmed, not just retuned**, the same
no-change-decision shape as the faces above. 2.2:1 held.

`--color-index` — the `01`/`02` ranking numbers — was the item actually still open: shipped at 5.50:1
through Phase 5, a value hand-fitted to hit a target at the end of that phase rather than derived
from a rule, the same concern the plate had. Compared against 4.5/5.0/6.25/7.0 on the same switcher.
**4.5:1 won** — as quiet as the number can go while still clearing the AA floor for text CLAUDE.md's
own rule holds every other text colour to.

| Token                   | Was                | Is                                            |
| ----------------------- | ------------------ | --------------------------------------------- |
| `--color-index` (light) | `#645f77` (5.50:1) | **`#716c87`** (4.512:1)                       |
| `--color-index` (dark)  | `#8b86a9` (5.22:1) | **`#807ba1`** (4.521:1)                       |
| `--color-plate` (light) | `#9e93c3` (2.2:1)  | **unchanged** — confirmed against four others |
| `--color-plate` (dark)  | `#484180` (2.2:1)  | **unchanged** — confirmed against four others |

**4.512:1, not 4.5:1 exactly.** A target-ratio search lands slightly under-target more often than on
it — the first pass at these candidates computed `#726c87`/`#807aa1` at 4.499:1/4.479:1, both just
_under_ the AA floor the "quiet (AA floor)" label on the switcher promised. Caught before shipping by
requiring the search to find the darkest/lightest value that clears the target rather than the
closest one to it; ratios "close to 4.5" and "at least 4.5" are different questions; the switcher
needed the second one.

The switcher's own scaffolding — the panel in `BaseLayout.astro`, `src/scripts/calibration-data.ts`,
`src/scripts/calibration-panel.ts` — is gone; `BaseLayout.astro` is byte-identical to master again.

**One implementation note worth keeping, since it'll bite the next switcher too.**
prettier-plugin-astro cannot parse a `<script>` with its own multi-statement body when nested
directly inside a `{condition && (…)}` JSX expression — reproduced in isolation across `is:inline`,
`define:vars`, a plain function declaration, and an IIFE, all failing the same way: "Unexpected
token" at the first statement past the opening brace. Neither of the two prior switchers hit it,
probably by accident of how their scripts happened to be shaped. The fix: anything that must run
synchronously and can't be a bare `import` has to be built as a string and injected via
`<Fragment set:html={...}>` rather than written as a literal nested `<script>`; anything that can be
a deferred module stays a single-line `<script>import '...';</script>`, which parses fine because it
has no block body of its own.

## The switcher loop is a skill now, and the panel deliberately is not (2026-08-30)

Closes [#246](https://github.com/ali-wallick/portfolio/issues/246). The live-switcher review loop
had run four times — the motion values (#33), the faces (#66), the colour calibration (#67) and the
résumé actions bar (#239) — and was transmitted only by example: a new session learned it by reading
the records of past passes rather than by having the method to hand. It is
`.claude/skills/design-switcher/` now, with the constraints and the traps in `SKILL.md`, the working
shapes of the four scaffolding files in `references/scaffolding.md`, and a contact-sheet renderer in
the skill's own `scripts/contact-sheet.mjs`.

**The decision the issue asked for: the panel does not become reusable code.** It stays a template
inside the skill, copied and adapted per pass, and three of the loop's own rules are why. Scaffolding
must not import a hashed module — a shared component in `src/` is exactly an import, and the first
pass needing one more knob would edit it and drag every `byteHashedFiles` input along. A settled axis
comes off in the commit that settles it, so the file is under continuous surgery for the life of a
pass and byte-identical to nothing by the end. And permanent code in `src/` has to be gated out of
production forever, where a deleted route cannot leak at all. What generalises is the shape and the
traps; what does not is the axis, which is most of any real panel.

**The contact sheet is the one piece that did become code**, because it is the half a switcher cannot
do. A live switcher is sequential and "which of these four is loudest" is simultaneous; #239's
tab-corner notch lived in exactly one of four state combinations. It renders every state into one
labelled grid with its measurement under each tile, and the tiles are laid out by the browser rather
than composited, so labels get real typography for free.

**Building it turned up a fact worth having on hand: this site has no `data-theme` hook.**
`tokens.css` selects dark on `prefers-color-scheme` alone, so anything comparing both themes has to
emulate the media feature. Writing an attribute renders a light tile labelled "dark" — the exact
shape of convincing wrong answer the skill's own traps section exists for.

## Every picture is matted (2026-09-01, closes #163)

Settled on a live switcher, the seventh run of that loop. Every image, video
embed and photograph on the site now sits in a **mat**: a small inset of
`--color-surface`, then a 1px `--color-frame` line outside it. Ali's pick from
three crossed axes — version, line colour, line weight — plus the mat's own
inset.

**The measurement is the reason this issue was real, and it should survive the
issue.** Edge-ring contrast of all 63 project assets against each theme's
ground: **9 sit under 1.5:1 on the light ground and a _different_ 17 under
1.5:1 on the dark one.** `marvel-snap/thumb-wide.jpg` is **1.03:1** and it is
the homepage's headline card; `kaneva/thumb-logo-v2.png` is 1.16:1 because its
matte is literally `--color-surface`. So a frame is load-bearing, on a
different set of images per theme — and the old `--color-border` hairline was
1.31:1 light / 1.43:1 dark, weakest exactly where it was needed.

**Six surfaces, and finding them took two corrections from Ali.** `.thumb img`,
`.card-art`, `.media img` (hero and gallery), `.aside-figure img` (/about's two
photographs), `.hero-portrait img` (the homepage headshot) and `.embed` (the
YouTube iframe). The last three were missing from the first round and were
found by Ali asking why nothing changed on `/about`, then whether videos could
take it too. All three already carried the identical `1px solid
var(--color-border)`, so they were on the incumbent treatment and simply were
not being offered the alternatives — **the failure mode is a surface list, not
a rule**, and the list now lives in one place per stylesheet rather than being
repeated.

**Why 2.20:1 is enough for the line, when a flush border at 2.20:1 was
rejected.** The mat does the separating: the gap lifts the picture off the
page, so the line only has to read as a frame. Contrast ratio is not
perceptual weight — the same ratio does far less work at 1px than it does on
the 5px plate it was calibrated for. That is why the answer is a mat and not
simply a bolder hairline.

**`--color-frame` equals `--color-plate` today and is deliberately a separate
token.** The plate's violet won on an argument about meaning: it is already
"the colour under anything with height", so it is the colour this direction
uses to say _this object has an edge_. Borrowing that hue is cheap **because
the plate's meaning is carried by geometry** — an offset unblurred block —
whereas magenta's is carried by hue alone across three different shapes (the
reticle, the focus ring, the current-page pill). Magenta was on the switcher at
Ali's request and its cost is concrete: `--color-focus` is the _same hex_ as
`--color-accent`, so a magenta frame would put every image at rest in the focus
colour, and `base.css`'s hover cue for a zoomable gallery image — which turns
that border magenta — would stop marking anything at all. Separate tokens
because the two roles can diverge; same reasoning that made `--color-index` its
own token rather than an alias of `--color-text-muted`.

**Two mat sizes, and the seam is "leads a page" vs "belongs to a set", not
size.** `--frame-mat-lead` (4px) for a project hero, `--frame-mat` (2px) for
gallery slides, thumbnails, the photographs and the headshot. **Scaling the mat
by image width was measured and rejected**: the gallery row is normalised on
height (#166), so a width-proportional mat gives a 115px portrait a thin frame
and a 401px landscape a fat one _despite their being the same height_. Images
in a set share a frame weight; the hero is the outlier. The step is
deliberately shallow — at 2/6 the hero read as a differently framed object, at
2/4 as the same system one size up.

**The general rule, which outlives this pass: a frame is a constant.** A
gallery hangs the same moulding on a small etching and a large canvas, and that
is what makes them read as one collection. The hero's wider mat is the single
sanctioned exception, and it is justified by role rather than by dimensions.

### Three things that will bite whoever touches this next

- **The hover cue is on the `outline`, not the `border`.** The border is the
  mat now. Recolouring it paints the _gap_ magenta and leaves the frame alone.
- **A gallery slide needs `aspect-ratio`, or the mat breaks the row.** With
  `height: auto` the browser derives height from the CONTENT box, so a slide's
  outer height becomes a function of its own ratio and every slide ends at a
  different y. Measured on `/projects/i-fits-i-sits` (five slides, 0.45–1.78):
  bottom edges spread **3px on the old 1px border**, which the mat widened to
  **7px**. `aspect-ratio` resolves against the border box under `box-sizing:
border-box`, so height becomes exactly `width / ratio` whatever the mat
  costs — **spread 0, the first time #166's shared bottom line is exact rather
  than approximate.** The 3px was pre-existing; nobody had measured it.
- **`.embed` letterboxes slightly.** It sets `aspect-ratio: 16 / 9` on a
  border box, so the mat makes the content box marginally off-ratio and the
  player compensates — about 7px at 4px on an 864px hero. Known, accepted, not
  worth engineering around.

### The surface list missed a seventh, and it was the lightbox (2026-09-05, closes #321)

`.zoom-dialog img` was not in #163's six, so **the one place a picture is the
CONTENT was the only place with no edge** — the surface-list failure mode
above, a fourth time. Measured across the 22 zoomable sources against the
dialog's ground, which is `--color-surface` and not `--color-bg`: light mode is
clear everywhere at worst 2.16:1, and **8 of 22 sit under 1.5:1 in dark mode**,
the dark-UI screenshots bottoming out at **1.05:1**. A light-theme review cannot
show it, which is how it survived two passes over this dialog.

**The line alone, no mat**, and that is not a weaker version of the recipe: the
dialog's padded field of `--color-surface` already IS a very large mat, so 2px
more inside the picture would only spend width the pinned box (#249) exists to
protect. `--color-frame` reads 2.55:1 light / 2.01:1 dark against the surface,
either side of the 2.2:1 it was calibrated at, so the recipe transfers.

**Desktop only, and the phone half is a measurement rather than a shrug.**
Below 48em the picture fills its box and `object-fit: contain` letterboxes for
real — 390x685 box against a 390x602 picture, measured — so an outline there
would draw around the SCREEN and leave the picture's own top and bottom bare.
Same rect-is-not-the-painted-picture trap #249 recorded. The picture runs to
both screen edges at that size anyway, which is where a frame has least to do.

**Adding tokens to `tokens.css` regenerates the résumé PDFs**, because that
file is a `byteHashedFiles` input. `check:resume-print` confirms the geometry
did not move — the résumé renders none of these surfaces — so the regenerated
PDFs differ only in Chromium's own metadata. Commit them with the change, per
the standing rule.

## A video hero carries a poster, and a dead one is a fact (2026-09-01, closes #273)

The `youtube` media variant gains `poster` and `dead`, mirroring `links[].dead` exactly. `hero` is
the one field the content model refuses to let a published project omit, so a taken-down video was a
**required field rendering as a black box carrying YouTube's own error text**, on a page the schema
considered complete. Flipping one boolean is now the entire remediation, the same as for a link.

**`poster` is required even though a live page never renders it**, which is worth stating plainly
because it looks like an unused field. It has two jobs: it is what a dead video degrades to, and it
is where a card or tile thumbnail comes from. A video hero that is alive still shows nothing until
YouTube answers — see "A live video still paints nothing", that is a decision rather than an
omission.

**A dead video renders through the same branch an `image` item takes**, not a third rendering — same
frame, same widths, same caption slot. The caption lives in `Media.astro` rather than in front
matter, because a per-project string would mean flipping the boolean was not the whole remediation.
It states a fact about the video and stops; the picture is described by its own `alt`.

**`poster` is `{ src, alt }`, not a bare `image()`.** In the dead state that picture _is_ the
content, and alt text describes the picture rather than the video it stands in for — deriving it
from `title` would have put "Still from Firefall trailer" under what is actually a title screen.

### A live video still paints nothing, and that is Ali's call rather than a gap

#273 also proposed showing the poster behind the loading embed, on the reasoning that a cold iframe
painting nothing is worth fixing. It was built, put on a preview, and **rejected. Do not put it
back.**

**The problem is not the wait, it is that the player paints its OWN thumbnail when it arrives.** A
still underneath therefore turns one transition into two, between two different pictures: ours
cropped to the box, YouTube's fitted to the video. Blank to video reads as loading; picture to a
different picture to video reads as a flash. Ali's words on the preview: _"I don't think I like that
flash."_ Nothing about a cold embed was ever a complaint; the fix was for a problem nobody had.

**A click-to-play facade — our still up permanently, the player loaded on click — was offered and
not taken.** It removes the swap and loads no YouTube at all until asked, at the cost of a click.
Available if this is ever revisited; the flash is not the argument against it.

**And it could not have been done in CSS anyway, which is the fact worth keeping.** A loading iframe
is **not transparent** — a frame whose navigation is still in flight is displaying its initial
`about:blank`, and that document paints an opaque canvas over whatever is behind it. Nothing on the
parent side reaches it; the iframe element's own `background` is not what is being painted. Measured
in headless Chromium against a hanging `src`, after building it the wrong way first. So a poster
behind an embed always costs a script to hide the player, which is a second reason the idea is not
as cheap as it looks.

### The rule for choosing a poster

**Local imagery, and never a frame lifted from a video Ali doesn't own.** A frame carries that
video's licensing, so committing Marvel's thumbnail is the same act as committing Marvel's trailer,
only smaller. Marvel Snap, Firefall and Vegas Blvd Slots therefore use imagery already committed for
those pages.

**The three on Ali's own channel are not that case**, and two of them need not to be: It Will Kill
You's local candidates top out at 183px and Mini Mages' at ~230px, which cannot lead an ~864px hero.
Both use a frame from their own student video, which is the call #273's own table already makes for
Mini Mages. **Secret Garden deliberately does not**, because its best YouTube still is a 640x480
`sddefault` with the letterbox bars baked in, and bars inside a mat read worse than an upscale does.

**Two posters are soft and that is the accepted cost, not an oversight.** Vegas Blvd Slots upscales
~2.1x and Secret Garden ~3.9x. The fix for either is a real capture, not a code change — and for
Vegas Blvd Slots the only larger thing that exists is MobilityWare's own trailer.

**A poster that is also in the page's gallery is accepted per page rather than ruled out.** Marvel
Snap and Mini Mages both do it. On a live video the duplication is invisible; on a dead one the
alternative was a picture that could not lead the page.

### Adding the field made an older mechanism redundant

`poster.jpg` next to a project's assets used to be globbed by slug to feed card and tile thumbnails,
which was right while nothing named a poster in front matter. With `poster` required, the glob became
a **second source for one picture** — set a hero poster and the tile would still have shown whatever
file happened to sit beside it. Both consumers (`projectThumb()` in `src/lib/content.ts` and
`scripts/generate-og-images.mjs`) read the field now. `scripts/fetch-posters.mjs` still works and is
now a way to look at what a video's own frame is, not a default source for a poster.

**A poster and a thumbnail are allowed to be different pictures, and on Secret Garden they are.**
Its poster is the gallery screenshot, because the video's own frame is a letterboxed 640x480
`sddefault` and bars inside a mat read worse than an upscale does — but that screenshot is 221px and
reads soft in a tile, where a crop hides the bars. So it carries a `thumbWide` override pointing at
the frame, which is exactly the job `thumb`/`thumbWide` exist for. **`thumbWide`, not `thumb`: the
archive tiles on `/projects` ask for the wide aspect**, and the square slot is the featured cards.

**That was found by diffing the built site against `main`, not by reading the code**, and it is the
argument for doing so on any change that touches a fallback chain. Removing the glob was reasoned to
be behaviour-identical and was not: one `<img>` on `/projects` silently swapped a 640x480 source for
a 221px one. With the override in place all 23 rendered pages are byte-identical to `main`, which is
the real statement this change wanted to be able to make — everything it adds is a schema field and a
capability, and nothing about the site today moves.

**Detection is the half this does not do.** `npm run links:external` resolves embeds through oEmbed
and is what finds a dead video; it cannot run usefully from a Claude Code session, where the egress
proxy answers 403 for every YouTube URL — which the three-bucket split handles correctly, reporting
all 28 outbound links as **unverifiable** rather than dead. It runs monthly on GitHub Actions as of
#275 and files an issue; see [`tooling.md`](tooling.md).

## A project's links are a "See Also" list, not a bullet list (2026-09-05, closes #290)

Settled on a live switcher, the tenth run of that loop. Ali's question was whether there was a
better way to show a project's outbound links than a bullet list, and whether the answer might be
no. It was not no, and the reason is sharper than "plain".

**The block was not merely unstyled, it was camouflaged as body copy.** Measured on
`/projects/marvel-snap`, where three `<ul>`s render down the page, the links list's computed style
was **identical** to the two prose lists above it: same family, size, line-height, `disc` marker,
40px indent, 600px max-width. The only difference was the anchor's blue, which is what a link
inside a paragraph gets too. It also carried **no heading at all**, while `Team` directly above it
had an `<h2>`. So the one block on the page meaning _leave the site and go look at this_ was
rendered exactly like prose and never introduced.

**Shipped: an `h2` reading "See Also", then a marker-less stack with `kind` in a leading gutter.**
Dropping the marker and the 40px indent is what separates it from the prose lists; the heading does
the rest.

**The plate lost, and the reason is not weight.** `/contact` renders outbound links as pressable
pills and its own comment justifies that by the page being _a surface you act on, not one you
read_. Ali ruled the plated version out for readability, and the mechanism underneath her instinct
is this: **a plated row turns the label into a BUTTON's label, which is neither link-coloured nor
underlined**, while every other outbound reference on a project page is both — `i-fits-i-sits`
links Puzzle Cats in its body prose _and_ in this block, so a plate gives one destination two
treatments on one page. One way of saying "outbound link" per page beats two. (It was also 306px
against 160px for five links, and 434px against 211px on a phone, but that is the smaller argument.)

**`kind` is rendered now, and it was live-but-invisible data before.** `store`/`play`/`video`/
`source`/`press`/`jam`/`site` sits on every link (`slides` joined in #49, and ties `source` at six
characters, which is why the gutter below did not need re-measuring) and was read only by `structured-data.ts` and
`build-linkedin.mjs`, both looking up the one `press` link. Surfacing it is the `card-index`
argument for `featureOrder`: a fact the content model already holds. It is typed against the schema
enum in `LinkList.astro`, so adding a `kind` fails the build rather than printing a raw value, and
it is **not** `aria-hidden` — unlike `.card-index`, which is hidden because DOM order already
conveys the ranking. This is the opposite case: the kind is available nowhere else on the page.

**A leading gutter, not a trailing tag, and the trailing tag was mine and it underdelivered.**
Measured, `kind` discriminates on two pages (kaneva: site + press; marvel-snap: press + four
videos) and labels a lone link on the other seven — so the gutter's 72px indent is paid everywhere
to inform in two places. A trailing tag was built to keep both the information and the page-column
alignment. It does not work: the tags rag out at a different x on every row, so they stop being
scannable, and scanning was the entire reason to want the aligned column. **The gutter is 3.5rem**,
sized to the longest value the schema allows (`source`, six characters) at DM Mono's flat 0.600em
per character; the first pass used 4.5rem and left ~26px of dead space.

### The heading is "See Also", and getting there corrected a rule I invented

**The wording was decided on Ali's frame, which is better than the one the switcher started with.**
Her read: the block is _additional references for what the page does not contain_, since the hero,
the screenshots and the description already carry the project itself. That makes the heading
**relational** rather than a label for what the links are, and it survives the block changing
composition later. It also holds against the data — the 14 links across 9 pages are 4 video, 3
site, 3 press, 3 jam and 1 store, the game itself plus video and press _of_ it, so nothing is
further reading.

**It is also why `Elsewhere` and `Off the Page` lost.** Both name a **location**, and Ali wants the
heading open to the block growing or one day holding an on-site cross-link. A heading promising
off-site goes wrong the moment one points inward. `See Also` is at least as open as `More` and more
precise, since it is the standard term for related pointers whether they sit on this site or off it.

**`See Also` was excluded for a rule that does not exist, and that is the lesson worth keeping.**
It was ruled out mid-pass for being grammatically imperative, on the observation that no heading on
this site is one — `Team`, `Skills`, `Archive`, `Summary`, `What I Built`, `Off the Clock`. **The
observation is true and the rule is not**: nothing in CLAUDE.md or the `write-copy` skill has ever
said headings cannot be imperative. A pattern was measured, then cited back as a constraint, which
is exactly the drift the content model's guard table exists to rule out — and it was applied twice
before Ali named it as an accident rather than a decision. **An observed regularity is evidence,
not a rule, until someone writes it down.** There is still no rule; `See Also` is simply the only
imperative heading on the site.

One measurement decided it in the end: **at n=1, `More` is the weakest option** — a heading
promising more with a single item under it reads thin, and that is seven of the nine pages. `See
Also` reads the same at one link or five.

### Two things recorded rather than acted on

- **An on-site cross-link is a content-model change, not a heading choice.** `links[].url` is
  `z.url()`, which rejects `/projects/kaneva` (verified), and the `kind` enum has no value for an
  on-site pointer. The heading is open to it; the schema is not, yet.
- **The `dead: true` path is untouched and was invisible in review**, since no project carries one
  today — all three formerly-dead domains resolved to Wayback snapshots instead. It still renders
  as the same plain-text note.

**`base.css` is a `byteHashedFiles` input, so this regenerated the résumé PDFs.**
`check:resume-print` confirms the geometry did not move — the résumé renders none of these
surfaces — so they differ only in Chromium's own metadata. Same shape as #163; commit them with the
change, per the standing rule.

## The gallery is one scrolling row (2026-08-30, closes #166)

Every project gallery is a single horizontally scrolling row, replacing the wrapping grid Phase 5
shipped. The decisions, in the order a future session would trip over them.

**A fixed-height row is a better answer to #93 than the grid was, not a departure from it.** Nothing
on this site is cropped, so a row of mixed aspect ratios — 0.45 to 1.78 across the twelve galleries
— can only guarantee ONE edge, and `align-items: start` guaranteed the top. Sizing every slide to a
shared height and letting each take its own natural width puts the top **and** the bottom on the
same line, which the grid could never do. What stays ragged is caption line counts, which is
`content-pass`'s caption-length guidance to hold rather than layout's.

**16rem, filling the row, in the page column.** All three are Ali's calls on the preview, and the
first two settle each other: filling means upscaling the archive assets, and the shorter row is what
makes that payable — **1.61× worst case at 16rem against 2.21× at 22rem**. Nine of the twelve
galleries are 137–296px files from 2009–2013, so a consistent row and sharp old pictures are in
direct tension and there is no option that escapes it. Full-bleed lost for being at its thinnest on
the nine galleries holding one or two images, where it made a viewport-wide band around a single
picture. Locking that in also took `overflow-x: clip` off the root, which only ever existed because
`100vw` includes the vertical scrollbar.

**Slide width is arithmetic on build-time numbers, and both obvious CSS answers fail.** `Media.astro`
emits `--media-ar` and CSS multiplies it by `--gallery-h`. A slide has to be as wide as its IMAGE and
not as wide as its caption's longest line — but `width: min-content` on the figure with
`max-width: 100%` on the image is a cyclic dependency that collapsed every image on the site to about
60px, and dropping the `max-width` makes `min-content` resolve to the source's full intrinsic width
instead. Don't rediscover either.

### Zoom, and the plate that announces it

**An image opens full size when its source is at least 384px tall**, which is 1.5× the row. The
threshold is not a tuned number: at a 16rem row every gallery image on this site is either **≥1.60×**
its rendered height or **≤0.72×**, with nothing in between, so anywhere from 0.8× to 1.5× picks the
same twelve of thirty. That is a natural split in Ali's assets rather than a judgment — the archive
files have nothing more to show, and a lightbox on one is a bigger copy of what you were already
looking at. **Stated as an absolute height** so it cannot drift if the row is ever retuned.

**The plate is the affordance, and this is the height rule doing what it was written for rather than
an exception to it.** "Height means pressable" is exactly why a gallery image never had one — it
could not be pressed. A zoomable one can, so it takes the plate, the hover rise and the press-flat,
and a non-zoomable one keeps the plain frame. The raised edge is what says which images open, in the
vocabulary the site already has, instead of an icon that appears nowhere else. The visible
consequence is real and was accepted deliberately: `/projects/mini-mages` shows one raised image
beside two flat ones, because only its poster has more to show than the two ~230px screenshots.

Left/right steps between the zoomable images of one gallery, stopping at the ends rather than
wrapping — a reader who cannot tell whether they have seen everything is what wrapping costs. The
controls hide below two, the same "no arrows where it makes no sense" rule the row itself follows.

### Everything degrades to real HTML, and one thing had to move to keep it true

The row is a plain `overflow-x: auto` element, so it scrolls by touch, trackpad and arrow key with
no script at all. The arrows ship `hidden` and `gallery-scroll.ts` unhides them, so a page whose
script never runs carries no dead controls. Every zoomable image is a real link to its full-size
file, upgraded into a native `<dialog>`; a modified click is left alone so new-tab and save-as still
work.

**`tabindex="0"` on the scroll region is required, not decorative** — a scrollable region with no
focusable children is unreachable by keyboard, which axe reports as `scrollable-region-focusable`
and which fails the flat 1.0 accessibility bar `lighthouserc.json` holds project pages to. The
script narrows it, removing the tab stop from a row that does not overflow.

**`reticle.ts` listens for `scroll` in the CAPTURE phase now, and the reason generalises: scroll
events do not bubble.** A bubbling listener on `window` sees the page scrolling and nothing else — an
element-level scroller dispatches `scroll` at itself only. That was latent while the only controls
sat outside the row, and went live the moment zoom put focusable links inside it. One listener on the
capture path covers the page and every scroller on it.

### The row has ends, and its controls are a centred cluster (2026-09-02, closes #268)

Settled on a live switcher, the eighth run of that loop. Two axes, decided separately: how much room
the row leaves at its ends, and what the scroll controls are.

**8px at the ends, driven by ONE token.** `--gallery-pad` on `.gallery` drives the scroller’s
`padding-inline`, its negative `margin-inline` and both fade offsets. Writing the fade offset as its
own number is exactly the drift #253 used a `calc` to rule out, and here it was not hypothetical --
it was the bug Ali caught on the preview. Padding the scroller moved its clip edge while the fades
stayed pinned to `.gallery`, so a slide emerged from a hard edge and then faded in **afterwards**,
by exactly the padding. The negative margin is what keeps the pictures on the page column edge:
**the scroll box widens, the pictures do not move** (measured 0px against the column at 1280/768/390).

**What the padding is for is the FOCUS RING, and the reason it shipped with is already dead.** It was
justified partly by #163’s frame line being cut off at rest — true when it was written, and retired
five days later by [#283](https://github.com/ali-wallick/portfolio/issues/283), which pulled the line
inside its own border box. Pixel-sampled at 4x on both shapes: pre-#283 the strip at the clip edge
carries no frame colour at all, post-#283 it reads ground / frame 1px / mat 2px / picture. **The
surviving reason is stronger anyway**: a focused link inside a scroll container is clipped BY that
container, and at 0 padding the first zoom link’s ring was cut off by exactly 6px — the ring’s whole
3px width plus its whole 3px offset — so a keyboard user tabbing into the row saw no focus on the
slide they had landed on. 8px covers it with 2px to spare, and the spare is Ali’s, by eye.

**Worth generalising, because only pulling `main` in caught it: a comment that justifies a value by a bug
elsewhere goes stale when someone else fixes that bug.** Nothing failed — the padding is still
right, for one fewer reason — and nothing would have told the next session the claim had expired.

#### The controls are two arrows around a proportional bar

Ali’s read of the bottom-right arrows: "a little too just stuck on there." **The diagnosis I offered
first was wrong and is recorded so it is not repeated** — I said they sat under a large dead gap, and
the gap measured 24px, which is normal. The emptiness under a gallery is caption line-count spread
(23px on marvel-snap against 69px on i-fits-i-sits), which is `content-pass`’s to hold rather than
layout’s. The real argument for moving them is **distance**: bottom-right put them 78-124px below the
pictures they scroll.

So `.gallery-nav` is centred now, and the arrows sit either side of an indicator. **The indicator is
a proportional bar, not pips, and that was decided on correctness rather than taste.** Pips were
built and Ali spotted the defect on the preview: they only ever reached 2. A row of variable-width
slides has no page count — `scroll-snap-align: start` on slides that are 160px to 630px wide means
the number of distinct resting positions is a function of viewport width, so any fixed pip count
either overshoots into indices the row cannot reach or undershoots the content. A bar sidesteps the
question entirely by reporting a ratio: thumb width is `clientWidth / scrollWidth` and its offset is
scroll progress across the remaining track. Measured from 19.97% (marvel-snap at 390) to 98.5%
(critter-3’s 11px of overflow at 768) — it degrades to "nearly everything is visible" rather than to
a wrong number.

**And it is deliberately not draggable.** It is `aria-hidden` and `pointer-events: none`: an
indicator, not a control. Three reasons, in order. The row is already draggable — by touch, trackpad,
arrow key and the two arrows beside it — so a draggable bar is a fourth affordance for a thing that
has three. A 4px target fails every pointer-size guideline worth following, so making it draggable
means growing it into something that looks like a control and then IS one, which is a slider, which
is the option Ali did not pick. And a real slider needs a role, a value, a label and keyboard
semantics; an `aria-hidden` bar needs none of that because the scroll region it reports on is already
focusable and already announces itself. **If it is ever made draggable, it stops being this element
and becomes an `<input type="range">` — do not bolt a drag handler onto the bar.**

#### Two bugs fixed on the way, both found by Ali on the preview

- **Zooming an image drew the magenta focus ring around the WHOLE gallery.** `dialog.close()` restores
  focus to whatever was focused when it opened, and on a browser where clicking a link does not focus
  it — Safari on macOS, by default — that was `.gallery-viewport`, the `tabindex="0"` box wrapping
  the entire row. `gallery-zoom.ts` now focuses the link explicitly on close. The container’s own ring
  is right for someone who tabbed to the row deliberately, so the fix is to stop the zoom path landing
  on it, not to remove it; what that ring should look like is
  [#278](https://github.com/ali-wallick/portfolio/issues/278).
- **`base.css` carried the same 61-line block twice**, verbatim since 618ef66 (#241) --
  [#277](https://github.com/ali-wallick/portfolio/issues/277), closed here. Checked before deleting
  that the removed copy was not the one carrying `.gallery-nav[hidden]`.

**One measurement fix in `gallery-scroll.ts` follows from the padding**: `page()` computed its step
from `getBoundingClientRect().left` under a comment asserting the row carried no inline padding. It
does now, so `contentEdge()` adds `paddingLeft` and the arrows step to the right place.

### The container's own ring is the frame recipe, and the reticle got scoped out of it (2026-09-02, closes #278)

The question #268 left open, settled on a live switcher — the ninth run of that loop. Ali's pick:
`--color-frame`, outside the box, and the reticle skips this tab stop entirely.

**Two separate mechanisms were wrapping `.gallery-viewport`, and the switcher's first round only
compared one of them.** The `:focus-visible` ring is CSS, styled by `base.css`; the reticle's
corner brackets are a second, independent overlay, driven by `reticle.ts`'s own `FOCUS_SELECTOR`
matching any `[tabindex]`. Ali's first look at the preview showed brackets with no visible ring at
all — the reticle, not the outline the issue was filed about — which is what forced the switcher to
grow a third axis mid-pass rather than ship a fix for half the bug. **A design-switcher pass that
compares only what a filed issue names can still miss the dominant cause**; the fix was to look at
what the reviewer actually reacted to, not to assume the issue's own diagnosis was complete.

**The ring reuses the mat-line recipe (#163) rather than inventing a treatment.**
`--color-frame`/`--frame-line` is already what every matted image on the site uses for "this object
has an edge"; applying it here says the truer thing than the global control ring did — this is a
region, not a button. **Outside the box, not inset** — the one place this diverges from every mat
line, which is pulled inside by its own width (#283). Ali's pick, by eye on the switcher.

**The reticle exclusion is a general mechanism, not a one-off carve-out.** `data-reticle-skip` on
an element removes it from `reticle.ts`'s `FOCUS_SELECTOR` without touching the selector string
itself for future cases — `.gallery-viewport` is the only element that carries it today, but the
attribute names the concept (a required tab stop that isn't a control) rather than hard-coding one
class name into the script. **Safe specifically because of `reticle.ts`'s own rule 1**: the reticle
is decoration over a real focus ring, so an element the reticle ignores is still fully indicated by
the native `:focus-visible` ring underneath. Excluding an element from the reticle is never itself
an accessibility regression; it only removes a flourish that was overclaiming.

**Implementation note for the next capture-phase intercept:** the switcher prototyped the exclusion
by stopping `focusin`/`focusout` in the capture phase before they reached `reticle.ts`'s
document-level bubble listener — the same technique `reticle.ts`'s own comments describe the panel
using on itself. That worked for comparison purposes but was scaffolding-only; the shipped fix is
the `:not([data-reticle-skip])` selector change, which is smaller, doesn't need a second script on
every page that has a gallery, and is the same mechanism every other `FOCUS_SELECTOR` exclusion
would use.

### The lightbox is a pinned box, and the pin is the gallery (2026-09-04, closes #249)

Settled on a live switcher, the tenth run of that loop. Ali's issue was two lines — "changes size",
"too small on mobile" — and both turned out to be one axis each, on different devices.

**The two complaints are not the same question, and measuring them said so.** On a 390px phone the
dialog is 359px wide for every picture on the site: width spread **zero**. "Changes size" is a
desktop phenomenon — the hugging box swung **643px** across `/projects/i-fits-i-sits`' five slides at
1280x800. So the phone axis is how big the picture gets and the desktop axis is whether the frame
holds still, and they were settled separately.

**The box is pinned to the gallery's widest picture, not to the viewport.** Stepping never leaves the
row you opened, so the box only has to hold still within one gallery — and pinning to the viewport
buys a box sized for a picture the gallery may not contain. Measured on a 1280x620 window, a
viewport-pinned box put the tall level shot at 160px wide in a 1178px box: **8% fill**. Pinning to
the gallery gives 36px of movement instead of 643, and 17–20% fill instead of 8–15%.

**36px is not zero and the residue is honest**: a caption can take one more line than its
neighbour's, which changes the height available and so the width derived from it. Closing it would
mean reserving a constant caption height per gallery, which is a lot of machinery for a pixel count
nobody can see.

**The furniture reservation is gone, and its own comment predicted this.** Group A measured the
picture's cap against the furniture actually present, because the box hugged its picture. A pinned
box has a definite height, so flex distributes it and the measurement becomes a second mechanism
competing for one job — which is exactly what the Group A note said would happen if the box were ever
pinned. `capToFurniture()` is deleted; `flex: 1 1 0` does it.

**On a phone the lightbox is edge to edge**, which takes the picture from 0.71x to 0.86x of the size
the ROW renders it at. **It cannot beat the row and that is structural**: the row is a horizontal
scroller, so at `--gallery-h` a 16:9 slide renders 455px wide on a 390px viewport. It is bigger
there and CLIPPED — 79% of the slide visible at 390px, 72% at 360px — where the lightbox shows all of
it. They answer different questions, and 0.86x is the ceiling for a dialog that fits the whole
picture on screen. Two candidates that could have beaten it lost: magnify-and-pan (a mode nobody
asked for) and no-dialog-below-a-breakpoint (loses the caption, the stepping, and the page).

**The caption takes the picture's width now, and that was a defect in the old box too** — measured at
1280x800, the caption sat 75px left of the tall level shot, because the box was sized by the caption
while the picture was centred in it. Pinning took it to 128–444px, which is what made it visible.

### Four measurement traps from this pass, all of which returned a plausible number

Worth keeping loose from the issue, because none is specific to a lightbox.

- **`max-width`/`max-height` only CAP a picture; they never stretch one. And a `srcset` image's
  intrinsic size is DENSITY-CORRECTED, not the file's.** With `w` descriptors and a 92vw `sizes`, a
  1920px candidate reports an intrinsic 358px — so `width: auto` rendered the picture at 92% of a
  full-bleed box. **`sizes` is therefore a layout input, not only a bandwidth hint**: understate it
  and the picture renders small. `ZOOM_SIZES` in `Media.astro` is per-width for this reason.
- **`flex: 1 1 auto` leaves a flex item's height content-derived, which is INDEFINITE**, so
  `max-height: 100%` inside it resolves to `none`. The first pinned box constrained nothing: the tall
  level shot overflowed it by 918px and covered 335% of it. A **zero basis** is what makes the used
  height definite.
- **`getBoundingClientRect()` is not the painted picture wherever `object-fit: contain` is
  letterboxing inside it.** Compute what `contain` produces. Same family as the inline-box trap under
  #284 — a rect is a fact about a box, not about what is in it.
- **Deriving a box's size from something inside that box feeds itself back in.** A "chrome" term
  written as `dialog.width - image.width` is the EMPTY SPACE inside a pinned box, and computed a
  1900px box. Take padding and border from `getComputedStyle`.

### The lightbox's three leftovers (2026-09-05, closes #305)

Split out of #249 and each small, but two of them settle a rule rather than fix a line.

**The zoom link says "open larger", not "view full size".** The dialog has never shown the source
at its own size and since #249 deliberately does not, so the hidden hint inside every
`.gallery-zoom` was promising something measurably untrue -- 23-66% of the file's width at
1280x800. "Larger" is also the one word true of both states the link has: with the script dead it
still navigates to the full-size file, which is larger too.

**Stepping stays scoped to the zoomable images, and the counter is what gives way.** Stepping
through every slide instead was the other option on the table and it loses to the pinned box: the
box is sized to the widest picture in the row, so a slide under the zoom threshold would land in a
box several times its width. That is #249's own 8%-fill complaint, reintroduced one step in. What
follows is that the counter's set is not the row, so **the dialog states no position rather than a
misreadable one** -- `2 of 3` renders only while the zoomable images ARE the row, which is every
gallery on the site today. The arrows' disabled ends carry it otherwise, which is the argument
`Gallery.astro` already makes for the scroll rail being `aria-hidden`.

**Swipe steps the lightbox on touch, and it never calls `preventDefault`.** Every listener is
passive and the gesture is decided at `touchend` from where the finger started and ended, so
pinch-zoom, scrolling and the platform's own handling are untouched while it is in flight. Three
guards keep it to itself: a second finger cancels it (a pinch's touches drift apart horizontally,
which is a swipe on the arithmetic), the outer 24px of the screen is left to the back gesture, and
horizontal travel has to beat vertical by 1.5x. **Nothing animates, so there is no reduced-motion
branch** -- the swipe ends in the same `show()` the arrows call.

### The scroller is a containing block, and the fades pay for it (2026-09-05, closes #318)

Every project page with a gallery scrolled sideways, on `main`, at every viewport —
`/projects/marvel-snap` measured a `scrollWidth` of 1384 against a 390px window and really panned.
`.gallery-zoom-hint`, the visually-hidden "opens larger" text, is `position: absolute` and
`.gallery-viewport` was `position: static`, so each hint resolved against `.gallery` — **outside the
scroller's clip** — and was laid out at its slide's real x inside a track up to 1782px wide. The
last hint's right edge was 1383.72 against a `scrollWidth` of 1384.

**`overflow` clips an absolutely-positioned box only when the scroller sits between it and its
containing block**, which is why `overflow-x: clip` on the scroller measured no change at all. The
fix is `position: relative` on `.gallery-viewport`, and it is deliberately the rule rather than the
surface: pinning the hint's own `inset` fixes this symptom and leaves any future
absolutely-positioned thing in a slide free to escape. #163's lesson, one component over.

**The cost is paint order, and it is the part that will bite.** `.gallery`'s two edge fades are
`::before`/`::after` on it, and they used to paint over a static scroller for free. Positioned, the
scroller lands between them in tree order — so `::after` still paints above and **`::before` does
not**. Measured before the repair: the right fade pixel-identical, the left one simply gone, reading
the raw image where it had been a gradient stepping 141 → 94 → 47. `z-index: 1` on both fades
restores it, `1` chosen against the site's existing scale (header 40, reticle 50, skip link 100) so
a fade still passes beneath a sticky header. **Anything else added to `.gallery` that must paint
over the row needs a `z-index` now; it will not get one for free.**

**One control is worth copying rather than the finding.** With the fade restored the page still
differed from `main` by 21,311 pixels, scattered site-wide. Reproducing the same outcome a
completely different way — pinning the hint's `inset`, touching no positioning layer — produced the
**identical** 21,311, which identifies it as Chromium re-rasterizing text once the document stops
being horizontally scrollable rather than as anything this change chose. A large diff is not a
finding until a second, independent fix says whether it is yours.

### A page under `src/pages/design/` ships unless it is gated

`scripts/build-ci.mjs` has no prune step for that directory, and a production build emitted
`dist/design/` — `noindex` and staying out of `sitemap.xml.ts` keep a lab route **uncrawled, not
unserved**. A switcher branch stays open for as long as the review takes, so "we delete it before
merging" is not the guarantee. Make it a dynamic route whose `getStaticPaths` returns `[]` unless
`showDrafts`, and verify both ways. This is the switcher skill's own teardown check earning itself.

## One page column, and never reason about line length in `ch` (2026-08-31, closes #253)

Settled on a live switcher, the fifth run of that loop. Started as Ali asking why `--measure` was
the number it was, and turned into the widths being a system rather than five values that each made
sense once.

**The site had three structural edges that agreed with nothing.** At 1280 the header, `main` and the
footer ran to 1136 while the widest content stopped at 976 — 160px of dead space under a nav that
reached past everything, plus prose narrower still. That shape matches no convention: the ordinary
web pattern is **one container shared by header, content and footer, with reading text narrower
inside it**. Worse, "widest content" meant different things per route — the résumé panel and the
project galleries did reach 1136, so `--content-max` was chrome on some pages and a real content
edge on others.

**Settled: `--content-max: 56rem`, `--measure: 37.5rem`.** The page column comes down to meet the
content rather than the content growing to meet the header, and every framed thing on the site now
shares one right edge.

### The finding worth carrying forward: `ch` is not characters

Every previous discussion of `--measure` was conducted in `ch`, and `ch` **systematically
understates** real line length. `1ch` is the `0` glyph — 10.25px in Figtree at 16px — while the
average character in running prose is about **7.3px**, because prose is mostly narrow letters and
spaces. Real characters per line run **~1.38× the `ch` count**, so the "63ch" everyone had in mind
was **~87 characters**.

Measured properly — walking text nodes and bucketing them into visual lines across /about and four
project pages — the old 40.4rem ran **81 avg / 98 max, with 86% of full lines over 80**. WCAG 2.1
SC 1.4.8 puts the ceiling at 80. **That is Level AAA, not the AA baseline ADA/Section 508/EN 301 549
require**, so this was a readability call rather than a compliance fix — but it had been invisible
for the life of the project because nobody measured the rendered text.

**So: never reason about line length in `ch` on this site. Measure the output.** This is the third
time a measurement in this project's history has overturned a plausible number ([#68](https://github.com/ali-wallick/portfolio/issues/68)
corrected the `ch` arithmetic, [#191](https://github.com/ali-wallick/portfolio/issues/191) caught a
page-count check passing a document 64px over budget, and now this).

### The subtraction between the two width tokens is load-bearing

`--measure-wide` is now **derived, not chosen**: `calc(var(--content-max) - var(--space-4) * 2)`.
`.layout` carries `--space-4` of padding a side, so its content box is the column less 2rem, and
feature blocks fill exactly that.

**Written as a calc so the two cannot drift.** The alignment holds only while the container's
content box is no wider than the feature cap — widen the column alone and every card silently stops
filling it, restoring the mismatch this closed. A hand-maintained second value is precisely the
drift the content model's guard table exists to rule out, and the token would otherwise claim a
width nothing renders at, which is the `ch`-vs-characters trap one token up.

### Three widths that had stopped participating, found by looking rather than by reading CSS

Each was a value that made sense when it was written and quietly stopped agreeing with anything.
All three were spotted on the preview, not in the stylesheet — which is the argument for the review
loop, not for a linter.

| What                    | Was                                                    | Now                                                                                                                |
| ----------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Résumé prose            | `--measure`, so it moved with unrelated site decisions | `--resume-measure` (701px), the print column, pinned ([#244](https://github.com/ali-wallick/portfolio/issues/244)) |
| Project hero (`.media`) | a raw `44rem`, the only width not a token              | fills the page column                                                                                              |
| `.contact-card`         | `--measure`                                            | `--measure-wide`, like every other bordered note                                                                   |

**The rule that decided all three: a frame has an edge, and an edge that agrees with nothing reads
as a mistake.** Prose may sit narrower without looking wrong because it has no frame to align; a
bordered box may not. That is why `.contact-card` moved and the prose measure did not.

**The hero's `44rem` had a real reason and it scales with the column.** A 16:9 embed at the old
64rem column is 576px tall and pushes the write-up below the fold — a fact about the _column_, not
about 44rem. At 56rem it is 486px. So that change is coupled to this one: **re-check the hero height
if the column ever widens again.** `Media.astro`'s `sizes` hint had to follow too, and that one has
no guard behind it — an undersized hint downloads a too-small file and renders the hero soft, which
no build check catches.

### What was measured and rejected

- **Content grows to meet the header** (everything at 64rem). Closest to the standard shape, but it
  returns the "currently" box to a wide band with two lines floating in it — 346px of empty box
  against today's 218px — which is the exact thing `--measure-wide` was created to prevent.
- **A full-bleed header**, the single most common pattern on the web, and the only option that
  needed no content width to change. Lost to Ali preferring the columns actually align. Its
  implementation note is worth keeping anyway: a `::before` bled to `inset: 0 -50vw` scrolls the
  page 400px sideways at 1280, and scoping `overflow-x: clip` to `:root` does **not** contain it
  (nor does moving the clip to `body`). A `box-shadow` spread paints outside the border box without
  contributing scrollable overflow, so there is nothing to clip.
- **Narrowing further than 56rem.** 52rem was Ali's first preference and reads well at 1280, but it
  is a fixed cap: 46% of a 1728 screen and 42% of 1920. What she liked about it was the alignment,
  which is separable from the width.
- **A résumé exception** to match print more closely. Unnecessary — [#244](https://github.com/ali-wallick/portfolio/issues/244)
  already pins the résumé's text column to 701px, the print content width, in its own token immune
  to `--measure`. Narrowing the panel itself to sheet proportions was built and rejected: it makes
  the panel a bordered box aligning with nothing (the rule above), and detaches the download button,
  which is positioned against `.resume-actions` rather than the panel.

## One page title edge, and pages cross-fade between (2026-08-31, closes #247)

Ali's report was that "home page clicking around has different heights." It measured worse than it
sounds. `main` starts at a constant y on every route — the spread was entirely in **what each page
put first**, and every route had picked its own shape:

| Route            | h1 top at 1280 | What was above it           |
| ---------------- | -------------- | --------------------------- |
| `/contact`       | 90             | nothing                     |
| `/about`, `/404` | 106            | a bare h1's own 16px margin |
| `/projects`      | 127            | an eyebrow                  |
| `/projects/*`    | 132            | a loose backlink            |
| `/`              | 155            | the hero's own top padding  |
| `/resume`        | 165            | the density tabs            |

**75px of jump between adjacent nav items.** Every route now opens with `PageHead.astro`, whose
reserved `--page-kicker` slot supplies the whole gap above the title, so **all nine land on exactly
the same edge** (126 at 1280 and 768, 166 at 390). The homepage is the one deliberate exception
below 360px, where its eyebrow wraps and the `min-height` slot nudges the name down rather than
letting a word land on top of it.

**The slot is reserved by the component, never by the caller** — a page with nothing to put above
its title renders the same slot as one that does. Reserving it only where it is filled is precisely
the bug, re-expressed as a convention each new page has to remember. Same move
`content.config.ts` makes for content: the old site drifted because every page was free to be
shaped its own way.

**36px is fitted to `/projects`, deliberately.** That was the one page whose top was already
composed — an eyebrow above the title — rather than accidental, so the value is the one that leaves
it where it was (127 → 126). Everything else moved to meet it.

**`min-height`, not `height`, and it is a failure mode rather than a preference.** A fixed height
silently _overlaps_ the title when a kicker wraps; a min-height nudges it down. Not hypothetical —
the hero's eyebrow wraps to three lines at 320px, and the first build of this drew "ENGINEER"
through the middle of "Ali Wallick". A title nudged 20px on one narrow viewport is a worse
alignment; a title with a word sitting on top of it is a broken page.

**The résumé carries a `Resume` page title, and that is what closed the last route** (Ali's call on
a five-candidate switcher, the sixth run of that loop). It was the only route with no page title,
so its content met the shared edge 14px low at desktop and 67px low at 390. It now opens with
`PageHead` like everything else, and the actions bar is what FOLLOWS the title rather than what
stands in for it. All nine routes land on the same edge at 1280 and 768.

**The switcher's finding, which is the part worth keeping: two of the five candidates aligned on a
desktop and not on a phone.** Below 48em the actions bar goes `column-reverse` and stacks to 103px,
so every candidate that sized the reserved slot to the TAB STRIP — growing the slot to 51px, or
shrinking the tabs to 37px — fixed 1280 and left ~53px at 390. Both were recommended in this
branch's own PR description before the instrument was built. **Only the two candidates that put
something other than the strip at the title edge held at every width**, which is the whole reason
the answer is a title rather than a spacing tweak.

**`.page-head` is hidden in `resume.css`'s print block, beside `.resume-actions`.** Without it the
title prints on the PDF. It is what keeps this change invisible on paper — verified as zero
differing text-placement operators across 3,064 and 5,973, so the PDFs are byte-identical in
content and differ only in metadata.

**The résumé's name stays an `<h1>`, so `/resume` carries two.** Ali asked directly whether it had
to stop being one, and the answer is no: multiple `<h1>`s are valid HTML5, are not an axe rule, and
measured clean — accessibility 1.0 on both résumé routes with `heading-order` passing. Demoting the
name to `<h2>` would have bought a convention and cost a print-side change to
`.resume-head h1` plus a cascade question about the section headings under it. **The page title is
the page's; the name is the document's.** Do not "fix" this by demoting one of them.

**The two rules in `base.css` that restored collapsed h1 margins are gone with it.** They faithfully
reproduced the fact that a title landed at a different height depending on which shape its page
used — the difference was the bug, not the contract.

### The horizontal half nobody had noticed

`/contact` and `/404` are short enough not to scroll while every other route does, and there was no
`scrollbar-gutter` anywhere — so on any platform with classic scrollbars the centred column _also_
jumped sideways when clicking between them. `scrollbar-gutter: stable` on `html`, inside
`@media screen`. **A no-op on default macOS**, where overlay scrollbars take no space, which is
exactly why it survived the life of the project unseen: the machine the site is reviewed on cannot
show the bug.

### Pages cross-fade now, and it costs one CSS rule

The second half of Ali's question was whether navigation could be smoother. Native cross-document
view transitions (`@view-transition { navigation: auto }`) — **no script, no client-side router, no
`astro:transitions`**, so a browser that doesn't implement it (Firefox today) navigates exactly as
before. Same posture the résumé's density toggle takes with `document.startViewTransition`.

**The header carries a `view-transition-name` so it is treated as the same element across the
navigation** and stays put instead of dissolving under itself. Without that the sticky nav
cross-fades on every click, which is more motion than the change earns — only the content changed.

**Reduced motion is handled in CSS and cannot be a token — but for a narrower reason than this
used to claim.** It said no custom property can reach a view transition's animation. That is false,
measured on #260's switcher: the pseudo tree is anchored on the root element and inherits from it,
so `var(--duration)` resolves inside `::view-transition-group(*)` exactly as it does anywhere else,
and the density toggle's timing is driven that way today. **What no token can express is a
transition's absence** — there is no value of `animation-duration` meaning "do not animate", and
zero is not it. The transition still runs with `animation: none`, which is the documented way to
get an instant swap rather than a broken one.

## The tab title and the share title are two strings (2026-09-01, closes #256)

The homepage's `<title>` was `Ali Wallick — Game Developer · Software Engineer`, 48 characters into
a browser tab that shows about 176px of text. Measured in a mock tab strip at Chrome's real metrics
it wants 277px, so roughly the last two thirds were cut on every tab — and what got cut was the
role, the only part of that string a visitor doesn't already have from the favicon and the name.

**This was never an SEO problem.** Google truncates around 60 characters and nothing on the site
reaches 51. Tabs, bookmarks and window titles only.

**The order was already right on 22 of 23 routes**, which is why the fix is scoped to one page and
why reversing the template was rejected rather than tried. Every page truncates in a tab; what
matters is which end survives, and an inner page leads with its distinguishing word
(`Prodigal: A Game…`). The homepage was the single route with the payload at the end.

**`<title>` and `og:title`/`twitter:title` are separate strings now** — `socialTitle` on
`BaseLayout`, defaulting to the tab title so no other route's output changed. A link preview has
room for a sentence and already carries the name twice over (`og:site_name`, and the name rendered
into the card by `buildBrandCard()`), so the card keeps the full role line the tab cannot hold.
Ali's pick for the tab was the primary hat alone — 28 characters, fits a full-width tab with room
to spare — over a bare `Ali Wallick`, which never truncates anywhere but leaves a search result
saying nothing the site name doesn't.

**`site.role` became `site.roles`, an array joined at the point of rendering**, so `Game Developer`
is not written down in a second place. Same reasoning as a project's `role` in #152; `site.role`
still exists, derived from it, so the homepage eyebrow and the résumé header are untouched.

### The title's em dash stays, and the reason is sharper than #97's

Reopened by Ali on this pass, so it is worth writing down properly. #97 kept it as "a structural
separator, not prose" — true, and it does not explain why it should be an em dash rather than the
`·` this site uses for every _other_ structural separator: the role hats, `{role} · {location}` in
the résumé header, the skills lists, `Software Engineer · Kaneva`, the project meta strip.

**The answer is that the homepage title is the one string carrying both levels at once.**
`Ali Wallick · Game Developer · Software Engineer` has three identical separators and no way to
tell which divides the name from the role. The em dash marks the outer level and `·` the inner one;
collapsing them onto one glyph loses that. Exactly the trap #152 named when it kept `role`'s own
join off the meta strip's `·`.

**And it is not the AI tell.** That critique is about em dashes in running prose, at frequency,
doing the job of a comma or a full stop. A delimiter between two labels is not a sentence and
carries none of that signal. The zero-em-dash rule (#31) still holds where it was measured: the
only two in rendered body text are inside quoted external titles (`Kaneva — Virtual Worlds Museum`,
`"Welcome Ali!" — Second Dinner`), which are other people's names for things, not Ali's prose.

**Ruled out, so they are not rediscovered.** A pipe is the most common title separator on the web
and the most template-looking, which is the one thing this site's brief is against. A hyphen is a
hyphen doing a dash's job, on a site with a build check that fails on a straight apostrophe. An en
dash costs the same "it's the only dash on the site" asterisk while being less legible at tab size.

## Decoration tracks `:focus-visible`, and the reticle cuts between regions (2026-09-05, closes #240)

Two findings from one issue, and only the second was a preference.

**The rule that generalises: a decoration layered over a native indicator has to track the same
pseudo-class that indicator does.** The reticle matched `:focus`; the ring underneath it is
`:focus-visible`. A mouse click focuses a link and the browser then declines to paint a ring on it,
so the brackets were indicating a control the browser had decided not to indicate — the exact
inverse of `reticle.ts`'s own rule 1, which promises the script only decorates a real ring. It also
never let go, because `retarget()` arms the idle timer only when nothing is active and a focused
element is active. Measured on `/resume`: click a density tab, move the pointer away, brackets still
on it 3.5s later. **Anything else that ever decorates focus on this site inherits this** — match the
pseudo-class the browser is actually painting, not the one with the shorter name.

**The reticle crosses between the header and the body by cutting, never by travelling.** Ali's pick
from four homes on a live switcher, the eleventh run of that loop. It keeps the resting nav pill and
keeps chase-and-settle _within_ each region; what goes is the one move that spanned the page. Her
reasoning: it balances the uniqueness and the usability. The mechanism, the measurements and the
three candidates that lost are in `src/scripts/reticle.ts`'s own header, which is where anyone
changing this will be.

**What is worth having here rather than there: `fade` (#33) did not close this, and the reason is a
general one.** That pass measured the busyness between _body_ targets and fixed it. The brackets are
placed at their home on every page load and are not dormant, so the launch out of the header was
outside what it measured — and it is the longest travel the reticle makes, longer than the screen
(1515px against a 1509px viewport diagonal on `/projects`). **An idle behaviour settles what happens
after a pause; it says nothing about the first move after a page load**, and those are different
questions on any site where something rests somewhere.

**Two candidates lost on costs that only show up off the desktop, and both are worth knowing before
anyone reopens this.** Dropping the home retires `base.css`'s stated reason for the sticky header
("Sticky, because the reticle needs a home") — it survives on the second reason in that same comment
and would become a decision rather than a consequence. And on a phone the brackets on the nav pill
are the whole of the reticle: below 40em there is no pointer, so a homeless reticle renders nothing
at all until something takes focus.

## The plate needs a flat bottom, so nothing pressable is a pill any more (2026-09-05, closes #299)

Ali's report was that the drop shadow on the round buttons looked weird. It is a real geometric
defect and not a matter of taste, and the diagnosis generalises past this one control.

**The plate is a slab edge.** An unblurred copy of the shape, offset straight down — so it reads as
thickness only where the silhouette has a **flat bottom for it to sit under**. Measured across the
shipped components: `.card` has one across **97%** of its width, `.tile` **90%**, a labelled pill
**61–81%**, and an icon-only button **0%**, because `.button`'s square padding plus `--radius-pill`
is a circle. Under a circle the offset copy has no edge to be — it reads as a second disc peeking
out from behind, ending in two cusps where the silhouettes cross. On a pill the same artifact curls
up the two rounded ends as horns.

**Shrinking `--lift` on small controls does not fix it, and that measurement is the useful one.**
For any convex shape the visible plate is a band of constant _vertical_ thickness, so a circle's
plate covers exactly the area a slab of the same width would. It is not too big. What falls to zero
at the sides is its _perpendicular_ thickness. **The cure is a flat bottom, not a smaller plate** —
which also means the fix cannot be bought by touching a shared token.

Settled on a live switcher, the eleventh run of that loop: two axes, four marks each, spanning "keep
it round" to "stop being round". Ali's pick, in two passes — A3 + B3 first, then A4 + B3 after the
cohesion question below.

|                                                       | Was                        | Is                                                             |
| ----------------------------------------------------- | -------------------------- | -------------------------------------------------------------- |
| Labelled `.button` (contact, CTA, résumé download)    | `--radius-pill`            | **`--radius-lg`**, the corner `.card` and `.tile` already have |
| Icon-only `.button` (`.gallery-arrow`, `.zoom-close`) | `--radius-pill` → a circle | **`--radius`**                                                 |

**The labelled half is a deletion, not a new value.** `base.css` already gave `.card`, `.tile` and
`.button` one radius and `.button` alone overrode it; that override is gone.

### One radius cannot make the site samey, and the reason is arithmetic

Ali's question on seeing A3 + B3 was whether a shared corner would read as cohesive or as samey. It
cannot read as samey, because **`border-radius` is absolute while these elements differ ~8× in
size**, so one number is a visibly different corner on each. As a fraction of the largest radius the
shape can take, 14px is **10%** on a `.tile`, **20%** on a `.card`, **25%** on `.currently`, **68%**
on a labelled button and **78%** on a 36px arrow.

**The site had already run the experiment.** `.card` and `.tile` have shared one radius since
Phase 5 and have never read as one object, because size and content do that work. Radius was only
ever separating `.button` from `.card`, and the closest those two come to each other is `/contact`,
where an 864×112 card sits directly above 106×41 buttons — no viewport makes them confusable.

**The real risk was the opposite of the one asked about, which is why the icon controls went to
`--radius` rather than `--radius-lg`.** At 78% of its maximum the arrow was still nearly a circle:
enough to fix the plate (0% → 22% flat bottom) and not enough to look chosen. `--radius` puts it at
**67% flat**, which reads as a control rather than as a corrected circle — and it is the radius
`.reticle` draws its corner brackets at, so a focused control now shares the corner of the thing
framing it.

### What this deliberately did not touch

**`.chip`, `.draft-flag`, `.nav-link` and the gallery rail are still `--radius-pill`, and that is
correct rather than an oversight.** None of them carries a plate, so none of them has the artifact —
the token is still doing real work and is not now dead. **Pill is still the right shape for a label;
it stopped being the right shape for something with height.**

**One rule, not a copy per component.** The icon-only radius is a single `.gallery-arrow,
.zoom-close` selector. [#163](https://github.com/ali-wallick/portfolio/issues/163) learned that the
failure mode here is a surface list rather than a rule — three surfaces were missed there because
each carried its own copy of the same border. A new icon-only button joins that selector; it does
not get its own radius.

**`src/styles/base.css` is a `byteHashedFiles` input, so both résumé PDFs regenerated for a change
the résumé renders nothing of.** `check:resume-print` reported the geometry unmoved, which is the
check that means anything; the differing bytes say nothing. See "Working here" in
[`CLAUDE.md`](../../CLAUDE.md) for why.

## A project page opens with a breadcrumb and closes with its neighbours (2026-09-05, closes #314)

Settled on a live switcher, the twelfth run of that loop. Ali's issue was two lines — is a plain
`← Projects` link the best call, and maybe make a picker of the options — and measuring moved the
question before any candidate was built.

**`Projects` was on a project page three times.** The backlink, the header nav pill (which already
carries `aria-current`), and the footer nav. The header is `position: sticky` at >=40em, so on a
desktop that destination is pinned at y=14 at every scroll position: the slot directly above the
`<h1>` was spending prime space on a link you cannot lose.

**And the phone inverts it exactly.** Below 40em the header is deliberately `position: static`, so
at the bottom of `/projects/marvel-snap` on a 390px phone the nav's `Projects` link is **4,722px**
behind you and so is the backlink. Pages run 1.8x to 6.0x the viewport. So the two platforms had
opposite problems, and neither is answered by restyling the link.

**Which is why "a back link at the bottom" was never a candidate.** The footer nav already carries
`Projects` 64px after the article ends — a fourth copy of one destination, 64px above an existing
one. What the footer cannot give you is another project, and that is what the foot of the page is
for now.

### The slot names the set; the foot states your position in it

`.breadcrumb` replaces `.backlink`, and `.project-nav` is new. They are one decision: the page
**opens** by naming a set (`Projects / Featured`, `Projects / Archive`, both crumbs linked) and
**closes** with the adjacent entries of that same list.

**Both crumbs are links because NEITHER is the current page** — the page is the `<h1>` directly
below, so this is a breadcrumb with the final crumb elided. That is the form that avoids restating
the title, and `/projects` carries `#featured` and `#archive` ids so the second crumb lands on the
section this project is filed in. Ali's own reservation on the first round was that a tier crumb
"doesn't really add anything unless I added sub project pages", and she was right about the version
she was shown: it rendered as plain text, so it was a label wearing breadcrumb clothes. **A crumb
you cannot click is not a location.**

**`Projects / <title>` — the textbook breadcrumb — lost, and the reasoning generalises to any
two-level site.** Its leaf carries no information and sits 20px above an `<h1>` saying the same
words at 40px; a leaf earns its place where the title is ambiguous or truncated, and here it never
is. It also overflowed the one-line kicker on 3 of 16 titles at 320px (KinoClue is 413px into a
273px budget). The "what if project pages get children" argument favours the tier crumb too: a
child's breadcrumb would be `Projects / Marvel Snap / Thing`, whose leaf still restates its own h1,
so the title form is that shape minus a level — pre-building for a hierarchy that does not exist and
paying a redundant line on all 16 pages now.

**The tier is a fact no other surface of a project page shows.** `.meta-strip` carries `status`,
which is a different claim. Worth knowing that they nearly partition the same way — nearly every
`shipped` project is featured, every `coursework` and `prototype` is archive, and only the jam
entries have a tier you cannot guess from the chip. (Written when that was four entries and the
`shipped` half had no exception. `aliwallick-com` published as `shipped` + `archive` on 2026-09-09,
so the exception exists now and the count is five. The point — that the chip is nearly but not
actually the tier — is what matters, and it got truer.)

### `Previous` / `Next`, and why not `Newer` / `Older`

Ali asked about `Newer` / `Older` and then answered half of it herself (`featureOrder` is hand
picked). Both halves are worth keeping, because the first is the one that is checkable today.

**The order IS chronological right now** — sort year descends 2024 -> 2009 with no inversion, the
featured->archive seam included — **but it has ties, and 6 of its 15 steps point at a project of the
same year.** Four 2011s in a row, three 2010s, two 2009s. So "Older" would be false on 40% of steps,
in front of a reader who can see both years in the meta strip on both pages.

**The second reason outlives the first: `featureOrder` is a hand ranking, not a date.** It is
chronological by coincidence. Reordering the featured five — which the field exists to allow — would
make a chronological label wrong with no build error. That is the class of thing the content model's
guard table exists to rule out.

**`Previous` / `Next` is not a compromise on wording.** Ali's own doubt was that it reads oddly
because "previous in what?", and that was true while the page named no sequence. The breadcrumb is
what answers it: the set is named and linked at the top, and the pair states your position in it at
the bottom. It also makes no claim that can be false, which is the whole reason the alternative
lost. Two candidates that dropped the directional word entirely (arrows only) or replaced it with
each neighbour's **year** were built and not taken.

### The card lost on the tier's own rule

A "Next Project" card with art was the other half of Ali's "picker of other options" reading, and
the argument that decided it is a content one rather than a layout one. **The sequence crosses
featured -> archive between Kaneva and Tilting at Windmills**, so a card headed "Next Project"
presents a 2014 jam entry as the peer of a five-year job — the exact reading the two tiers exist to
prevent ("honest framing in the archive tier: history, not a portfolio pitch"). A line of mono
promises nothing about what is on the other end.

Supporting, and smaller: the pair offers two destinations on 14 of 16 pages where the card offers
one; the card needs a fallback to "Previous Project" on the last entry, which the pair does not
because a missing end is simply an empty side; and it costs +115px at every width against the card's
+214 desktop and **+333 on a phone**, at the end of a page already 3.7x the viewport.

**Scoping the pair to the tier was built and rejected (B8).** It would make the head and the foot
describe the same list on all 16 pages — exactly one step crosses today — at the cost of dead-ending
Kaneva and Tilting at Windmills, taking pages with a single neighbour from 2 to 4. Ali's call: one
inconsistency on one page beats a dead end on the strongest page in the archive tier's neighbourhood.

### Two things found on the way

- **[#318](https://github.com/ali-wallick/portfolio/issues/318): every project page with a gallery
  scrolls sideways**, on `main`, at every viewport. `.gallery-zoom-hint` is `position: absolute`
  while `.gallery-viewport` is `position: static`, so the hints take `.gallery` as their containing
  block and escape the scroller's clip — the last hint's right edge is 1384px, exactly
  `documentElement.scrollWidth` on a 390px phone. `overflow-x: hidden` on the scroller changes
  nothing; `position: relative` on it fixes it completely. Filed rather than fixed, since it is
  unrelated to this pass.
- **A helper beside `getStaticPaths` in the frontmatter is not in scope inside it.** Astro hoists
  that function into its own module and evaluates it in isolation, so it type-checks clean and dies
  at "generating static routes" with "not defined". Declare it inside.

## Two design rules became build guards (2026-09-07, closes #338 in part)

#335 settled the cut line between the brief and these records as one test: is the rule enforced by
a build guard? #338 took the next step and asked which of the unenforced rules could become one.
Two of them were design rules, and both are now in `npm run verify`.

### Raw colours and raw `px` font sizes

**The rule is unchanged and now lives in `scripts/check-source.mjs`**: `tokens.css` holds the
palette and the type scale, and a component uses the variables. The reason is the same one Phase 5
gave — a palette change should be a token swap, not a hunt through every file — and it is worth
keeping here because the guard states the rule but not the argument for it.

**The tree was already clean, which is what made it buildable.** No `.astro` file carries a scoped
`<style>` block at all; `base.css` had zero raw hex, zero raw `px` font sizes, and one raw colour.
So the check starts green and is purely a regression guard, the shape every rule in
`check-links.mjs` already has.

Three things it does deliberately, each of which would otherwise have made it useless:

- **Comments are blanked before matching.** This repo's stylesheets carry 136 issue references
  (`#247`, `#327`) against a single real raw colour, and `#327` matches any hex pattern anyone would
  write. Anchoring to the value side of a declaration cuts most of it and not a comment that wraps a
  `#nnn` mid-sentence.
- **Paper is exempt by scope, not by line.** `resume.css`'s `@media print` block pins three tokens
  and leaves every other one undefined, so a `var()` inside it falls back to the property's initial
  value rather than to the palette. Its raw values are correct and its font sizes are `pt`, which a
  `px` rule never had an opinion about.
- **`transparent` and `currentColor` are not matched at all.** Neither is paint: they have no
  light/dark pair a token could hold, so there is nothing for them to be a token _of_. Seven sites
  use them correctly, and a pattern that never had an opinion beats seven allowlist entries.

**The lightbox scrim is the one exemption, and it is declared on the line it exempts** rather than
listed inside the script — the same move as the content model's explicit `hero: { type: art }`.

### Line length is a ratchet, not a ceiling

The rule from "One page column" above — _never reason about line length in `ch`; measure the
output_ — is now `scripts/check-line-length.mjs`, diffed against a committed baseline.

**It deliberately does not assert 80 characters, and that is the whole design.** 80 is WCAG 2.1
SC 1.4.8, **Level AAA**; the baselines actually required reference AA, which has no line-length
criterion. Narrowing `--measure` was a readability call, not a compliance fix, and at today's
37.5rem `/about` still runs 83 average. A ceiling would have been red on merge and would have
relitigated a decision settled on a switcher. So the guard records what the site measures — 76.5
average across 300 full lines of prose — and fails when that _moves_.

**It asserts average and maximum, never the number of lines.** Line count is a property of how much
prose a page has, and this repo's content model turns on _adding a project is one Markdown file_. A
guard that made a new write-up fail the build until someone re-baselined it would be fighting the
rule the whole content model rests on. A route missing from the baseline is reported and passes, for
the same reason. Average is a property of the **column**, so it holds still when prose is added and
moves when a width or a type size does — which is the only sensitivity worth having.

**The scope took three passes, and the first two were wrong in the same way.** A naive
`main p, main li` put the homepage at 6.4 average characters and `/projects` at 12.6, because both
were reading the card and tile grids, where every `<li>` is a link tile holding a title. That is not
a wrong measurement of line length; it is an accurate measurement of something else, and averaged in
it dragged the site's figure from 76.5 to 63. **A selector that looks like prose is not the same as
prose**, and the site's own metadata paragraphs — the breadcrumb, the meta strip, the eyebrows,
captions — are shaped exactly like it.

**The instrument was checked against a known quantity before it was trusted**, because #253's run
produced two confidently wrong numbers (a `getClientRects()` line count over a flex container that
returned one rect per item, and an assertion built from a right-edge coordinate that failed six
times against correct code). `/about`'s paragraphs render at exactly 600px — 37.5rem, as the token
says — and 83 average agrees with #253's own probe table for that width. Only then was the baseline
committed.

## Appearing is always a cut, and arming waits for a real placement (2026-09-07, closes #352)

Ali on `main`: _"sometimes I am on a page there's no reticle on any header. Then I mouse over a
header link you can see the reticle traveling from the corner to it."_ No repro, because the trigger
is not on the page — it is the state of the tab the page loaded into.

**`place()` bails without assigning geometry when its target measures off screen, and a document
that has never been presented reports a zero-height viewport.** So the test that exists to hide the
brackets when their target scrolls away also hides them from a page that nobody has looked at yet,
including a resting nav pill the sticky header would otherwise keep on screen forever. Measured in a
hidden tab on `/projects`: the pill's own rect is real — top 100, width 83.7 — while
`window.innerHeight` is 0. Load the site into a background tab (a ⌘-click, a session restore, a
prerender) and that is the state the page starts in.

Two more things then had to be true for it to be visible as a fly-in, and both were:

- **`arm()` counted frames rather than placements.** It added `is-armed` two frames after load
  whether or not the measurement succeeded, so the transition went live over an element still at its
  CSS origin: 0×0 at `translate(0, 0)`, the top-left corner.
- **The first acquisition travelled.** #240's cut fires for `dormant` or for a header/body crossing,
  and hovering a header link out of a header home is neither. Reproduced: from the unplaced state a
  `pointerover` on a nav link left the brackets mid-flight at `translate(238, 2)` on their way to
  `translate(905, 8)`.

**The general rule, and the reason this belongs here rather than only in the file's own header:
travel is only legible if the brackets were visible where the travel started.** That is what #240
argued about the page-spanning diagonal and what #33 argued about the return trip, each time as a
special case — `dormant`, then `crossing`. There is a third state neither named (off screen), a
fourth this issue added (never placed), and no reason to expect a fifth not to turn up. So the
condition is now the union rather than the members: `shown`, set by every path through `place()`,
and **acquiring while not shown cuts**. `dormant` stopped being tested at the call site in the same
change, which is the tell that it was standing in for this all along.

The second rule is the same move applied to arming: a frame count was a **proxy** for "geometry has
been assigned", so `arm()` is called from the bottom of `place()` and from nowhere else. Every early
return skips it, and the brackets stay unarmed — and invisible — until there is a real box to be
unarmed at. **A proxy that is right in every case you tested is still a proxy**, and this one was
wrong in exactly the case where its own guarantee mattered.

`visibilitychange` re-measures on top of both, because neither rule puts the reticle back on the
pill — they only stop it flying. Without it the brackets are absent until the pointer moves, which
is the half of the report that was about absence rather than about motion.

### Nothing paints until the first target has settled

The rest of the same report, found only because Ali kept testing after the first fix shipped:
refresh with the pointer already over the wordmark, and the brackets rest on the nav pill and then
relocate the whole width of the header to reach it. **522px on `/projects` at 1280 wide** — pill at
x=724, wordmark at x=202. Nothing was broken; that is what the rules said to do.

**Cutting that move instead of travelling it was tried, shipped, and rejected on sight** — _"that
actually seems worse. I see the movement always on reload now."_ It trades a slide for a teleport,
and the viewer still watches the brackets sit somewhere they never belonged. That is the finding
worth keeping: **when a move itself is the artifact, changing how it is animated cannot help.** Both
treatments were arguments about the 500ms; the complaint was about the two positions.

The move exists because **a stationary pointer already has a target at load and the page does not
know it yet.** Chrome dispatches that pointer's `pointerover` once there is a painted frame to
hit-test, which is after the reticle has already been placed at its home. Everything painted in
between is a guess being corrected in public.

So the brackets are measured at load and **held invisible** until the target settles: the first
acquisition wins if one arrives, an 80ms window decides if none does, and either way the reveal is a
placement rather than a move. Verified three ways on `/projects` — a pointer parked on the wordmark
before the first frame produces exactly one painted state, the wordmark, with the pill never
bracketed; no pointer target lands on the pill at rest; and a move made afterwards still
interpolates (mid-flight at x=277 of a move to x=411).

**This deliberately leaves #240 alone**, which the rejected version did not. A pointer that arrives
later — reload, look, then move to a nav link — still travels within a region and still cuts across
the boundary, exactly as the switcher settled. What goes is only the move nobody made.

**The general shape, and the reason this is the second entry in one issue: a rule about motion
written in terms of _where_ keeps finding new cases.** `dormant`, then `crossing`, then off screen,
then never placed — four conditions and one question, which is whether the viewer watched the
brackets arrive at the place the travel starts from. The load-time case is the same question with a
different answer: there, the honest move is not to have painted a starting place at all.

## The ranking number shares the title's baseline, then steps off it (2026-09-27, closes #387)

Ali, from a phone: the `01` / `02` on a featured card didn't line up with the project title. It
didn't — by 4px — and fixing that turned out to be two decisions rather than one.

**The bug was a scope error.** Below `40em` the card wraps into a column: the picture takes a flex
line to itself, and the ranking number and the card body share the line under it. That breakpoint
set `align-items: flex-start`, which aligns the two _boxes_ — 21px of `--text-lg` mono against
26.26px of `--text-xl` display type. Top-align two unequal line boxes and the shorter one's
baseline rides high.

`flex-start` was there to override the wide layout's `align-items: center`, and that rule is
right for what it answers: a picture _in_ the row, where "baseline alignment is right for a row of
type and wrong the moment there is a picture in it." The override just inherited the wide layout's
premise. Once the card wraps, the picture is on its own flex line and the second line is a row of
type again — the case baseline alignment is for. `align-items` resolves within a flex line, so it
never reaches the picture's line and the wrap is untouched either way.

**Then baseline alignment turned out not to be the end of it.** Sharing a baseline is correct and
still reads low, because the digits are shorter than the title's capitals: 14.06px of digit ink
against 17.19px of cap ink. All 3.13px of that difference opens above the digits and none below, so
a correct alignment still looks like a mistake. Ali picked re-centring the digits on the capitals
over leaving them on the baseline, from a three-way render.

So the shipped treatment is both: `align-items: baseline` for the alignment, and
`translateY(-0.075em)` on `.card-index` for half the ink difference. **They are different kinds of
rule and the comment in `base.css` says so** — one is where the boxes go, the other moves ink
without moving layout.

**Three things about that magic number are worth keeping.**

It is in `em` of the index's own size rather than `px`, so it survives a reader whose default font
size is not 16px; a px nudge would sit still while the type it corrects grew. It is only valid
while `--text-xl` stays 1.25x `--text-lg` — nothing enforces that ratio, and changing the scale is
what would silently make this stale. And 0.075em is a deliberate round number between two honest
derivations: 0.078em measuring flat-sided glyphs (`HIEFLT` against `147`) and 0.069em measuring
every glyph's ink including the round letters' overshoot. The residual against the flat-glyph
target is 0.065px.

**The third candidate is the one worth recording, because it is the obvious reading of "centre
it".** `align-items: center` on the wrapped row centres the number against the whole card body —
title, status chip and four metadata lines — which parks `02` beside `2019–2024`. Centring is only
meaningful against the thing you mean to centre on, and in a flex row that thing is the entire
item.

**A measurement note, since it produced a confident wrong answer here too.** A zero-height
inline-block probe is the reliable way to find a rendered baseline, but a probe placed _inside_ a
transformed element already reports transformed coordinates — adding the element's own transform on
top double-counts it. That read as a 1.435px error in a nudge that was actually 0.065px out.

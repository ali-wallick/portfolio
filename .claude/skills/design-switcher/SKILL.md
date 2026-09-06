---
name: design-switcher
description: Run the live-switcher review loop on aliwallick.com — put design candidates on one preview route behind a switcher, compare them with Ali, and delete the scaffolding in the commit that settles them. Use when a look, motion, spacing, colour, type or control-shape decision needs Ali's eye rather than a right answer; when a polish change is a question rather than a fix; or when the user asks to compare options, try a few versions, or see them side by side. For prose, use write-copy instead — this skill is about what a thing looks like and how it behaves.
---

# The live-switcher review loop

The most effective thing this project does, and the reason the old DreamHost setup could not have
produced this site. Four passes have run it — the motion values ([#33]), the faces ([#66]), the
colour calibration ([#67]) and the resume actions bar ([#239]) — and each rebuilt the scaffolding
from scratch, so this file is the method rather than the code.

[#33]: https://github.com/ali-wallick/Portfolio/issues/33
[#66]: https://github.com/ali-wallick/Portfolio/issues/66
[#67]: https://github.com/ali-wallick/Portfolio/issues/67
[#239]: https://github.com/ali-wallick/Portfolio/pull/239

**The shape:** every candidate ships in one DOM on one preview route, a panel flips between them
live, Ali reacts on a phone against the real content, and the whole instrument is deleted in the
commit that settles the last axis.

**The value is the discipline, not the panel.** The panel is radios, `localStorage` and writing
`data-*` onto a target — perhaps 120 lines. Every rule below cost a real mistake to learn.

## 1. Is this a switcher question?

Yes when the answer is a **preference held by one reviewer** and the only comparison that carries
information is an instant one on identical content. Colour, type, spacing, motion, the shape of a
control, how loud a button is.

No when there is a right answer — a contrast failure, a broken layout, a bug. Fix those. No when
nothing is genuinely open either: **check what is still open before you build the instrument.** Half
of #67 had already shipped outside the loop in a look-polish commit, so the issue as filed no longer
matched the repo, and a switcher built from the issue text would have compared the wrong things. Ask
`AskUserQuestion` when scope is unclear — Ali's answer there was "put the settled one back on anyway,
so it clears the same bar", which is not a scope either option offered.

## 2. Measure before you choose the marks

**A set of options is an instrument, and an instrument with two identical marks on it is worse than
one with fewer marks.** Do the measuring _before_ writing any of the switcher.

- **Drop any candidate that lands where another already sits.** #66 measured 19 faces headless at a
  100px em and dropped 7 for exactly this. Atkinson Hyperlegible Next measured 64.8 wide / 49.6
  x-height against Figtree's 64.1 / 50.0 — the same mark, to within a percent.
- **The axis you would name from the catalogue is often not the axis the candidates differ on.**
  `tokens.css` justified DM Mono as "narrow enough to survive the metadata strip"; every credible
  mono measures exactly 0.600em per character, so width discriminates between none of them.
  X-height does. Same with easing: `easeOutQuint` and `easeOutExpo` land 22ms apart at a 500ms fade
  while `ease-out` and `easeOutExpo` land 205ms apart, so the marks are spaced on _how long the
  brackets stay readable_, not evenly through the easing catalogue.
- **Label each option by its measurement, not its maths.** "90% gone by 220ms" is a fact about the
  fade; `cubic-bezier(0.25, 1, 0.5, 1)` is a string nobody can read.
- **Measuring often changes what gets built.** Three complaints on #239 had a different cause than
  their words suggested. "Make them the same height" — they already were, within 1px; the difference
  was a 13px vertical offset, so the axis that shipped varied altitude, not size. "The tabs look
  claustrophobic" — padding was the obvious answer and type size was the better one, because type
  carries its own line box.

## 3. Build the instrument

**For anything about how the printed résumé looks, start from
`references/resume-paper-sheet/` instead** — the sheet that renders the PDF's page on screen with
its real breaks, kept from #235 with its fidelity check and the paper traps it found.

`references/scaffolding.md` carries the working shapes — the route, the panel, the script, the
stylesheet — recovered from #239 and annotated with what each constraint is for. Read it before
writing a file. The constraints, in short, because every one of them has bitten:

1. **One `noindex` route under `src/pages/design/`**, absent from `src/pages/sitemap.xml.ts`'s
   hand-written list. For a sitewide axis (motion, type, colour) there is no route to make, so the
   markup goes inline in `BaseLayout.astro` gated on `showDrafts` — **at the markup and at the
   script**, because a module imported from a bundled `<script>` ships to all 24 production pages
   whether or not the markup renders.
2. **No new imports in `BaseLayout.astro`.** One component import reorders Astro's CSS bundles and
   takes `resume.css`'s print block out of the cascade, which silently turns a 1-page resume into 2
   ([#62]). The bootstrap and the panel are string constants injected with `<Fragment set:html>`.
3. **Bootstrap inline in `<head>` when the axis affects first paint.** Applying `--duration` after
   first paint means the first hover of every navigation runs at the wrong speed — the exact thing
   being judged.
4. **Nothing the scaffolding touches may be a `byteHashedFiles` input.** New files on a new route,
   its own stylesheet — never `base.css`, `tokens.css` or `resume.css`. **Duplicate a hashed module
   rather than importing it**: `actions-lab.ts` restated `resume-density.ts`'s contract on purpose,
   because reusing it would have meant editing it, which would have meant regenerating committed
   PDFs for a comparison that never reaches paper. #33 put its panel CSS in `base.css` and every
   commit in that comparison regenerated `public/*.pdf` and the lock file for nothing.
5. **`prettier-plugin-astro` cannot parse a `<script>` with its own braced body nested inside a
   `{condition && (…)}` expression.** `is:inline`, `define:vars`, a function declaration and an IIFE
   all fail identically at the first statement past the opening brace. Build the script as a
   template literal in the frontmatter and inject it with `<Fragment set:html={...} />`, or keep it
   to a single line: `<script>import '~/scripts/thing';</script>` parses fine in the same position.
6. **The panel must not be a thing the reticle chases.** `FOCUS_SELECTOR` matches `input` and
   `summary`, so every click on a radio parks the brackets on the instrument while you are comparing
   the thing the instrument exists to compare. Stop `pointerover` and `focusin` in the **capture
   phase at the panel's own root** rather than teaching `reticle.ts` about the panel: production
   code stays byte-identical, and the brackets hold their last target instead of being cleared,
   which is the right behaviour rather than merely the absence of the wrong one.
7. **Every candidate is live.** A candidate is judged by using it, not by looking at a picture of
   it — #239's candidates each drove the same `data-density` attribute the shipped control flips.
8. **Options are authoritative; storage is a cache.** Narrowing an option set strands whoever
   already picked a removed value: Ali's `localStorage` held two settings that had just been ruled
   out, and the panel would have rendered those groups with nothing checked while the old values
   stayed in effect — an instrument quietly reporting the wrong behaviour. Reconcile on load; a
   group whose stored value matches no option snaps to its first and writes that through.

[#62]: https://github.com/ali-wallick/Portfolio/issues/62

**The panel must never cover what it compares.** Fixed, corner-anchored, collapsible, and **capped**
in both dimensions with its own scroll. #239's grew to 26 radios and, anchored only at the bottom,
reached the top-right corner — exactly where the bar's right-hand element was. Found by a click that
could not land.

## 4. Run the loop

Branch, push, take the Cloudflare preview URL, hand it to Ali, react. Every round should make the
switcher **shorter**.

- **A settled axis comes off in the same commit that settles it.** A switcher still offering a
  decided question is one nobody trusts the rest of. The CSS deletes the losing overrides rather
  than promoting one of them.
- **Expect the reviewer to narrow the axes, not you.** #239 opened with eight controls and nine
  arrangements; Ali cut to one control immediately, then the placement question replaced the
  arrangement question, then the weight axis collapsed from four to two to settled.
- **Resample the live region rather than spanning the plausible range.** After the first pass on
  #33, "5s hold too long, 0.6s too short" moved the set to 1.2–2.5s. Keep the incumbent on as a
  labelled baseline to compare against.
- **A decision whose blast radius does not depend on an open question can be closed out of order.**
  The reticle's fade curve governs every idle mode, so it was locked while the mode itself was still
  open.
- **When surgical edits start producing contradictions rather than changes, rewrite the file.** Six
  rounds of index-based patching left #239's stylesheet with a duplicated section and four
  contradictory blocks. Rewriting it around what was decided was cheaper than a seventh patch.

## 5. Contact sheets, for the questions a switcher cannot ask

A live switcher is **sequential**. "Which of these four is loudest" is a **simultaneous** question,
and so is anything about a state you cannot be in twice at once.

`scripts/contact-sheet.mjs` renders every state into one labelled grid image with its measurement
under each tile. Several #239 rounds collapsed into one look once it existed, and it caught two
things the switcher could not: the notch under a hovered tab exists in exactly one of four state
combinations, and a flush tab supplies the panel's corner only while it is the selected one.

```bash
node .claude/skills/design-switcher/scripts/contact-sheet.mjs sheet.json
```

A state is a theme, a set of `data-*` writes, an optional click, hover or focus, and an expression
to measure. The full spec is documented at the top of the script. Four things it knows that you
would otherwise rediscover:

- **A theme is emulated, not written.** `tokens.css` selects dark on `prefers-color-scheme` alone —
  there is no `data-theme` hook on this site and no toggle. Setting an attribute produces a light
  tile labelled "dark", which is precisely the convincing wrong answer §6 is about.
- **`attrs` writes state; `click` drives it.** Where a script owns a control, the attribute alone
  leaves everything else the script syncs — `aria-current`, an href, a label — on the other state,
  so the tile shows a combination that cannot occur.
- **`hide` takes the instrument out of the picture.** The panel is fixed and lands in any tile wider
  than the clip, and the reticle parks its brackets on whatever `click` just touched, so a tile of a
  selected tab arrives framed in magenta that is not part of the candidate.
- **A failure names the state it happened in.** A bare Playwright timeout on a selector that moved
  does not tell you which of twelve tiles was being drawn.

Two habits the sheet exists to enforce:

- **Judge every relevant state, not the default one.** Both themes. Hover, focus-visible and active
  wherever they exist. A 2×3 grid of two tab states against three treatments is the shape that
  answers a question about interaction.
- **Render the argument rather than making it.** "A 14px corner eats the first 14px of the panel's
  top edge, so a tab in that span has no straight line to join" is four sentences and one picture at
  5× zoom. Use the picture.

## 6. Traps that produced convincing wrong answers

All of these returned a plausible number. None of them was caught by a guard.

- **Assert after transitions settle.** A `background-color` on a 320ms transition returns the _old_
  value if you read it immediately after the state change.
- **Park Playwright's virtual mouse before touching anything hover-sensitive.** It survives
  `page.goto`, so a screenshot taken after an earlier `hover()` is a screenshot of a hovered page.
- **A target-ratio search wants _at least_ the target, not _closest to_ it.** #67 nearly shipped
  `#726c87` at 4.499:1 and `#807aa1` at 4.479:1, both labelled "quiet (AA floor)" by the same script
  that computed them, because 4.499 displays as 4.5 in anything that rounds to one decimal.
- **A lazily-loaded candidate is measured as the fallback.** The first selection of any face in
  #66's instrument computed `68ch` before that face arrived. Re-measure on `document.fonts`
  `loadingdone`; `ready` only ever covers the first paint.
- **A flag applied per child process gets applied to one step and missed by the next.**
  `build-ci.mjs` passed `SHOW_DRAFTS=true` to `astro build` only, so the prune step read it off its
  own env, found it unset, and deleted the 16 font files it had just generated. Every guard passed.
- **An assertion suite proves the things it was pointed at.** #239's first panel bled 24px outside
  the header and footer on each side; every alignment that had been asserted still held. Ali saw it
  by eye. Point the suite at what a reviewer flags, and expect the reviewer to find what it misses.
- **Do not port a measured number across a border.** A `+ 1px` that was right in the lab was 1px
  wrong in the shipped component, because the port dropped an inner flex wrapper and a negative
  margin resolved differently. Re-measure.

## 7. Settle, tear down, and write it where it will be read

The teardown is part of the pass, not cleanup after it.

1. Delete the route, the panel, the script, the stylesheet and any generated assets. Delete any
   guard that existed only for the instrument.
2. **Assert byte-identity** against `main` for every file that should not have changed —
   `git diff --stat main -- src/layouts/BaseLayout.astro src/styles/` and expect nothing. #66 and
   #67 both ended with `BaseLayout.astro` byte-identical to master, and that was checked, not
   assumed.
3. Confirm a production build carries none of it: `WORKERS_CI_BRANCH=main npm run build:ci`, then
   grep `dist/` for the panel's class name and expect zero.
4. `npm run verify`. If the pass touched anything the resume renders, `npm run check:resume-print`
   and `npm run check:pdf` too — and remember the print block is a denylist beatable on specificity,
   so a new token or a selector outranking bare `:root` reaches paper.
5. **Put the decision where the next person editing that value will look** — the comment beside it
   in `tokens.css` or the component, with the measurement that chose it. `CLAUDE.md` gets the rule
   that generalises; `docs/REBUILD-LOG.md` gets the narrative. Pointing all three at each other is
   how the guard table's drift problem starts.
6. **A no-change outcome is a real answer.** #66 confirmed all three faces against eleven
   alternatives and changed nothing. Record it as confirmed, with what it was confirmed against.
7. A follow-up found mid-pass is an issue, not a quiet edit and not a doc note. #66 found
   `--measure`'s comment wrong by two independent methods and filed [#68] rather than touching a
   layout value it was not scoped to move.

[#68]: https://github.com/ali-wallick/Portfolio/issues/68

## Why there is no shared panel component

Asked and answered on [#246]: the panel stays a **template in this skill**, copied and adapted per
pass, rather than a component in `src/`.

Three of the rules above are the reason. Scaffolding must not import a hashed module (rule 4) — a
shared component in `src/` is exactly an import, and the first pass that needed one more knob would
edit it and drag every hashed input along. Settled axes come off in the commit that settles them
(§4), so the file is under continuous surgery for the life of a pass and byte-identical to nothing
by the end of it. And permanent code in `src/` has to be gated out of production forever, where a
deleted route cannot leak at all.

What generalises is the shape and the traps, which is what `references/scaffolding.md` carries. What
does not generalise is the axis, and that is most of any real panel.

[#246]: https://github.com/ali-wallick/Portfolio/issues/246

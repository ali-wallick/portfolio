# The résumé's printed page, on screen

The instrument #235 ran twelve rounds on, kept here as a template. It renders the résumé **as the
printed sheet** — letter geometry, the print cascade, the real page breaks — on a `noindex` lab
route, with a panel of candidate treatments and a live readout of each page's fill against the
960px budget. Use it for any future change to how the PDF looks; the update-resume skill points
here for that.

**It is a template, not code in `src/`, for the reasons #246 settled for the panel itself**: the
sheet is a hand transcription of `resume.css`'s `@media print` block, so if it lived in the repo it
would drift from the block the moment anyone edited paper, and it would have to be gated out of
production forever. Copied per pass, it is checked against the real thing before being trusted and
deleted with the pass. The three files are verbatim from the last round of #235, so their candidate
axes are that pass's and come out first; the sheet half, the pagination and the panel are what to
keep.

| File                       | Copy to                           | What it is                                                    |
| -------------------------- | --------------------------------- | ------------------------------------------------------------- |
| `lab.astro.txt`            | `src/pages/design/[...lab].astro` | The route: dynamic, no paths unless `showDrafts`, the panel   |
| `resume-print-lab.css.txt` | `src/styles/resume-print-lab.css` | The sheet (a transcription of the print block) and candidates |
| `resume-print-lab.ts.txt`  | `src/scripts/resume-print-lab.ts` | Axes → `data-*`, Chromium-faithful pagination, fit-to-width   |
| `fidelity.mjs.txt`         | your scratch directory            | Proves the sheet matches `/resume` under real print emulation |

## The three things that make it honest

1. **The sheet reproduces the print cascade, not an approximation of it.** The print block's
   `:root` token pins go on `.lab-sheet`, its rules go under `.lab-sheet`, and `resume.css` is NOT
   imported by the route — its screen half would style the sheet as the panel. Whatever `base.css`
   contributes on paper it contributes here. The one thing print sets on `body` (face, size,
   leading, colour, `font-variant-numeric`) is set on the sheet directly, because a variable
   re-pinned below `body` cannot reach a property `body` already resolved.
2. **Re-transcribe the print block every time, then run `fidelity.mjs`.** It walks every element of
   `/resume` under `page.emulateMedia({ media: 'print' })` at 701px and diffs y, height, width,
   face, size, weight and colour against the sheet at its incumbent settings. #235's read **94 of
   94 match** before any candidate was judged. A transcription that drifts by one rule is a
   convincing wrong instrument; this is what catches it.
3. **It paginates the way Chromium prints.** A fixed line at 960px is not where the break falls.
   The print block makes `.resume-job` unbreakable and forbids a break after a section heading, a
   group heading or a group subtitle, so the break lands before the first block that would cross the
   page, pulled back past any heading it must stay with. The script applies those rules, pushes the
   first block of each page down past a margin band, and reports each page's fill. Checked against
   the committed two-pager: both break before MobilityWare.

## Traps this instrument already knows about

- **The readout is exact at 1× pixel ratio, which is what the PDF renders at.** A Retina display or
  a phone snaps line boxes finer and reads ~1% short (922 for 928). Say so on the panel.
- **A `min-height` on the sheet hides content growth from a `ResizeObserver` on the sheet.** Observe
  the article.
- **An 8pt line at fit-to-width on a phone is invisible.** Ali could not find the page-2 header
  until it was drawn at header size. Offer an actual-size toggle.
- **`base.css` caps every `p` at `--measure`.** A small-caps role line wrapped at ~460px for that
  reason while the incumbent fit — the incumbent only fit because its size made `68ch` wider than
  the text.
- **Group-heading indents invert under a marker-less list.** Dropping the bullet indent to buy line
  width measured +0px and put the group heading right of its own bullets.
- **The page-boundary marker must not look like the design.** A thin red rule at 960px read as a
  magenta line in the résumé. Blue, dashed, captioned.
- **A duplicated code block from a slipped `str.index` cut is a runtime error that hides as a layout
  number.** A shadowed `budget` variable made the sheet report 900px for a document that was 919;
  the panel's `data-*` never got written, so every candidate measured as the incumbent. Run
  `astro check` after every scripted edit, and read the console.

## What paper can and cannot do, measured in Chromium 151

- **`@page` margin boxes work**, `@page :first` keeps them off page 1, and `counter(page)` /
  `counter(pages)` resolve. Pages after the first can carry a different margin. This is how the
  running header on page 2 is done, at no content cost on page 1.
- **A webfont named in a margin box does not resolve.** The box fell back to the body face and the
  PDF embedded only Public Sans. Name Public Sans in the box explicitly or `assertPrintFace` fails.
- **A `position: fixed` element is not a repeating header.** It printed once, on page 1, inside the
  content area.
- **A variable font embeds as a Type 3 font** — glyphs as drawing procedures, no `BaseFont`, and
  the one kind of PDF text applicant-tracking parsers most often cannot read. Name a static face on
  paper; `assertPrintFace` now fails on any `/Subtype /Type3`.
- **Cascade order beat `:first`'s specificity** for a margin box's `content` — a plain `@page` rule
  emitted later in the document printed the name on page 1 as well. Emit the `:first { content:
none }` after it.

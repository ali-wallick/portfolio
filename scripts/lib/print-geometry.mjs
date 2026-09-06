/**
 * The print-measurement geometry shared by `check-resume-print.mjs` and
 * `resume-headroom.mjs`. Both render the resume under Chromium's `print`
 * media emulation, and both have to agree on what "paper" means in pixels —
 * this used to be derived and commented separately in each, under two
 * different names.
 *
 * `PRINT_VIEWPORT` is letter (8.5in) less `@page`'s 0.6in side margins in
 * `src/styles/resume.css`, times 96 CSS px per inch, paired with 11in less
 * the page's 0.5in top and bottom margins. Never Playwright's 1280x720
 * default — that renders print CSS at a screen width, a combination that
 * exists on no page and no sheet of paper, and it inverted a real conclusion
 * during #32 (see CLAUDE.md's "The density question, measured twice and
 * deliberately not acted on").
 *
 * `PAGE_2_HEIGHT_BUDGET` is smaller than the first page's because page 2
 * onward carries a taller top margin for the running header (#235) — see
 * CLAUDE.md's "The résumé's paper look".
 */

export const PRINT_VIEWPORT = { width: 701, height: 960 };
export const PAGE_HEIGHT_BUDGET = PRINT_VIEWPORT.height;
export const PAGE_2_HEIGHT_BUDGET = 912;

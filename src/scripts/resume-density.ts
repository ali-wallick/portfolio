/**
 * The in-place density toggle on /resume.
 *
 * `ResumeDocument` ships both densities in one DOM — full-only nodes carry
 * `data-full-only`, and `data-density` on the article decides what shows, on
 * screen and on paper alike (the one both-media rule in resume.css). This
 * script upgrades `ResumeActions`' two ordinary links into a toggle that flips
 * that attribute, so switching densities means watching the document grow into
 * its two-page form instead of navigating to it.
 *
 * ## The rules it obeys
 *
 * 1. **Progressive enhancement, strictly** (same contract as reticle.ts). The
 *    links it intercepts are real navigation to /resume/full and back; if this
 *    never runs, the switch is exactly what it was before this script existed.
 *    /resume/full deliberately never loads it — a shared link to the two-pager
 *    stays a plain page.
 * 2. **Init never writes to the article.** scripts/build-pdf.mjs and
 *    scripts/check-resume-print.mjs both navigate /resume fresh — JS enabled,
 *    no hash — and the concise default is what the one-page PDF and the print
 *    baseline are recorded from. On load this script only brings the controls
 *    (aria-current, the PDF link) in line with whatever density the article
 *    already carries; the #detailed deep link is applied before it runs, by
 *    the inline script in resume.astro. A future edit that flips the article
 *    on load would silently change the committed PDF — which is why this file
 *    is in build-pdf.mjs's byteHashedFiles.
 * 3. **`replaceState`, never `pushState`.** Toggling is a view change, not
 *    navigation — no history spam, no popstate handling. The hash makes the
 *    full view shareable to JS users; the durable shareable URL for the
 *    two-pager remains /resume/full, and a no-JS visitor handed /resume#detailed
 *    sees the one-pager.
 * 4. **The reduced-motion check lives here, not in a token.** The view
 *    transition is the whole animation; a `--duration` token cannot reach it,
 *    so the script has to ask — same reason the reticle's fade carries its own
 *    curve instead of `var(--ease)`.
 */

type Density = 'concise' | 'full';

const article = document.querySelector<HTMLElement>('article.resume');
const links = [...document.querySelectorAll<HTMLAnchorElement>('a[data-density-link]')];
const pdfLink = document.querySelector<HTMLAnchorElement>('a[data-pdf-link]');
const pdfPages = document.querySelector<HTMLElement>('[data-pdf-pages]');

const PDF: Record<Density, string> = { concise: '/resume.pdf', full: '/resume-full.pdf' };

/* The page count inside the download. It names the FILE, not the view, so it
   has to move with the href rather than with the article — and its box is
   reserved in resume.css for the longer string, so swapping it cannot shift
   the button. */
const PAGES: Record<Density, string> = { concise: '1 page', full: '2 pages' };

if (article && links.length > 0) {
  const syncControls = (density: Density) => {
    for (const link of links) {
      if (link.dataset.densityLink === density) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    if (pdfLink) pdfLink.href = PDF[density];
    if (pdfPages) pdfPages.textContent = PAGES[density];
  };

  /**
   * The parts that travel (#260).
   *
   * Without these the whole page is ONE snapshot and the toggle cross-fades:
   * the document dissolves into its taller self and nothing appears to move.
   * Naming each section and each job gives every one its own group, so the
   * browser tweens it from its old rect to its new one — Skills and everything
   * under it slide the 142px the revealed Summary pushes them, while Summary
   * itself fades into the gap that opened. Settled with Ali against a live
   * switcher; a variant that also slid the revealed sections in was built and
   * not taken.
   *
   * An INDEX is a safe key here, and only here: density hides nodes, it never
   * adds, removes or reorders them, so the nth match is the same element in
   * both states. If a future density difference ever changes the node list,
   * this has to become a content-derived key — a name that moved between the
   * two states would tween the wrong pair of rects.
   */
  const TRAVELS = '.resume-section, .resume-job';

  /* Names are written for the duration of the transition and taken off again,
     rather than assigned once on load, and both halves of that matter:
     - At rest the DOM is untouched, so scripts/build-pdf.mjs and
       scripts/check-resume-print.mjs — which navigate /resume fresh and never
       toggle — measure exactly what they measured before this existed. Rule 2
       above still holds: init writes nothing.
     - base.css opts the whole site into CROSS-document transitions. A name
       left on an element would make navigating AWAY from /resume animate that
       element separately from the page, which is a different feature nobody
       asked for. Transient names cannot leak into it. */
  let running = 0;

  const setDensity = (density: Density) => {
    const apply = () => {
      article.dataset.density = density;
      syncControls(density);
    };
    /* lib.dom types the method as always present; feature-detect anyway, since
       a browser without it must still get a working toggle — it simply flips
       instantly. (Firefox shipped same-document view transitions in 144, so
       this is no longer the Chromium-and-Safari-only path it was written as;
       base.css's `@view-transition` navigation is still the half Firefox
       lacks.) */
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced && typeof document.startViewTransition === 'function') {
      const parts = [...document.querySelectorAll<HTMLElement>(TRAVELS)];
      parts.forEach((el, i) => el.style.setProperty('view-transition-name', `resume-part-${i}`));
      /* Scopes resume.css's timing rules to THIS transition. Without it they
         would retime every cross-document navigation the resume pages take
         part in, which is not what was reviewed. */
      document.documentElement.dataset.resumeTransition = '';
      running += 1;
      document
        .startViewTransition(apply)
        .finished /* Rejects when a transition is skipped — by a second toggle
                     mid-flight, most likely. Swallowed so cleanup still runs
                     and no unhandled rejection reaches the console. */
        .catch(() => {})
        .finally(() => {
          running -= 1;
          /* A toggle during a toggle re-names everything and starts again, so
             the OUTGOING transition must not strip the names the incoming one
             is mid-way through using. Only the last one out clears. */
          if (running > 0) return;
          for (const el of parts) el.style.removeProperty('view-transition-name');
          delete document.documentElement.dataset.resumeTransition;
        });
    } else apply();
    history.replaceState(null, '', density === 'full' ? '#detailed' : location.pathname);
  };

  for (const link of links) {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      setDensity(link.dataset.densityLink as Density);
    });
  }

  syncControls((article.dataset.density as Density) ?? 'concise');
}

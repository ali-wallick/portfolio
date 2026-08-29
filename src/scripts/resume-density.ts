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
 *    already carries; the #full deep link is applied before it runs, by the
 *    inline script in resume.astro. A future edit that flips the article on
 *    load would silently change the committed PDF — which is why this file is
 *    in build-pdf.mjs's byteHashedFiles.
 * 3. **`replaceState`, never `pushState`.** Toggling is a view change, not
 *    navigation — no history spam, no popstate handling. The hash makes the
 *    full view shareable to JS users; the durable shareable URL for the
 *    two-pager remains /resume/full, and a no-JS visitor handed /resume#full
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

const PDF: Record<Density, string> = { concise: '/resume.pdf', full: '/resume-full.pdf' };

if (article && links.length > 0) {
  const syncControls = (density: Density) => {
    for (const link of links) {
      if (link.dataset.densityLink === density) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    if (pdfLink) pdfLink.href = PDF[density];
  };

  const setDensity = (density: Density) => {
    const apply = () => {
      article.dataset.density = density;
      syncControls(density);
    };
    /* lib.dom types the method as always present; Firefox still lacks it at
       runtime (the toggle is simply instant there), so feature-detect. */
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced && typeof document.startViewTransition === 'function')
      document.startViewTransition(apply);
    else apply();
    history.replaceState(null, '', density === 'full' ? '#full' : location.pathname);
  };

  for (const link of links) {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      setDensity(link.dataset.densityLink as Density);
    });
  }

  syncControls((article.dataset.density as Density) ?? 'concise');
}

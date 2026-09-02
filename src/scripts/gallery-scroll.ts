/**
 * The gallery row's arrows, edge fades and keyboard reachability (#166).
 *
 * ## Progressive enhancement, strictly
 *
 * Same contract as `reticle.ts` and `resume-density.ts`. The row is a plain
 * `overflow-x: auto` element, so with this script dead it still scrolls by
 * touch, trackpad and shift-wheel. What the script adds is everything that
 * depends on knowing whether the row actually overflows, which CSS cannot ask:
 * the arrows, the fades, and the tab stop.
 *
 * The arrows ship in the markup with `hidden` rather than being built here, so
 * their labels and icons stay in the template where prettier formats them and a
 * reviewer can read them. That leaves this file with `hidden = !overflowing`,
 * which is a much smaller thing to get wrong than DOM construction.
 *
 * ## The tab stop is added, not removed
 *
 * A scrollable region with no focusable children is unreachable by keyboard,
 * which axe reports as `scrollable-region-focusable` and which would fail the
 * flat 1.0 accessibility bar `lighthouserc.json` holds project pages to. So
 * `tabindex="0"` is in the markup, unconditionally — the no-JS baseline has to
 * pass on its own.
 *
 * What this script does is take it AWAY from a row that does not overflow: a
 * one-image gallery is not scrollable, so it should not be a tab stop that does
 * nothing. That is an enhancement over the baseline, never a regression from
 * it — if the script never runs, the row is merely focusable when it did not
 * strictly need to be.
 *
 * ## Reduced motion is checked here, not in a token
 *
 * `tokens.css`'s reduced-motion block zeroes duration TOKENS. A `scrollTo`
 * behaviour never reads one, so the script has to ask — the same reason
 * `resume-density.ts` checks it for its view transition and the reticle's fade
 * carries its own curve.
 */

const galleries = document.querySelectorAll<HTMLElement>('.gallery');

/** Below this, a sub-pixel rounding difference reads as an overflow. */
const EPSILON = 1;

/**
 * The scroller's CONTENT edge, which is what every slide is measured against.
 *
 * This used `getBoundingClientRect().left` directly until #268, on the stated
 * grounds that "the row carries no inline padding". It carries 8px now — see
 * `--gallery-pad` in `base.css` — so the arithmetic has to add it back. At
 * zero padding this is identical to the old expression.
 */
function contentEdge(viewport: HTMLElement): number {
  return viewport.getBoundingClientRect().left + parseFloat(getComputedStyle(viewport).paddingLeft);
}

for (const gallery of galleries) {
  const viewport = gallery.querySelector<HTMLElement>('.gallery-viewport');
  const track = gallery.querySelector<HTMLElement>('.gallery-track');
  const nav = gallery.querySelector<HTMLElement>('.gallery-nav');
  const railThumb = gallery.querySelector<HTMLElement>('.gallery-rail-thumb');
  if (!viewport || !track || !nav || !railThumb) continue;

  const arrows = [...nav.querySelectorAll<HTMLButtonElement>('.gallery-arrow')];
  let frame = 0;

  function sync(): void {
    frame = 0;
    if (!viewport || !nav || !railThumb) return;

    const max = viewport.scrollWidth - viewport.clientWidth;
    const overflowing = max > EPSILON;
    const atStart = viewport.scrollLeft <= EPSILON;
    const atEnd = viewport.scrollLeft >= max - EPSILON;

    gallery.toggleAttribute('data-overflow', overflowing);
    gallery.toggleAttribute('data-at-start', atStart);
    gallery.toggleAttribute('data-at-end', atEnd);

    nav.hidden = !overflowing;
    // See the header note: the baseline is focusable and this narrows it.
    if (overflowing) viewport.setAttribute('tabindex', '0');
    else viewport.removeAttribute('tabindex');

    for (const arrow of arrows) {
      arrow.disabled = arrow.dataset.dir === '-1' ? atStart : atEnd;
    }

    /* The indicator (#268). Width is how much of the row is on screen; offset
       is how far through the remainder you are. Both are proportions, which is
       the point — see the note in `base.css` for why a bar rather than pips or
       a counter, and why it is not draggable. */
    const ratio = viewport.clientWidth / viewport.scrollWidth;
    const progress = max > 0 ? viewport.scrollLeft / max : 0;
    railThumb.style.width = `${ratio * 100}%`;
    railThumb.style.left = `${progress * (1 - ratio) * 100}%`;
  }

  /** One measurement per frame, however many sources ask. Same as `reticle.ts`. */
  function schedule(): void {
    if (!frame) frame = requestAnimationFrame(sync);
  }

  /**
   * Scroll to the next slide's leading edge rather than by a fixed amount.
   *
   * Slide widths here run from ~160px to ~630px, so any fixed step — a
   * percentage of the viewport included — lands mid-image about as often as
   * not. Going to a slide boundary is also the only distance that agrees with
   * `scroll-snap-align: start`, so the snap has nothing left to correct.
   */
  function page(dir: number): void {
    if (!viewport || !track) return;
    const edge = contentEdge(viewport);
    const slides = [...track.children] as HTMLElement[];
    const candidates =
      dir > 0
        ? slides.filter((el) => el.getBoundingClientRect().left > edge + EPSILON)
        : slides.filter((el) => el.getBoundingClientRect().left < edge - EPSILON).reverse();

    const next = candidates[0];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    viewport.scrollBy({
      // With nothing left in that direction, fall back to a viewport's worth so
      // the button still does something at a partially-scrolled end.
      left: next ? next.getBoundingClientRect().left - edge : dir * viewport.clientWidth,
      behavior: reduced ? 'auto' : 'smooth',
    });
  }

  for (const arrow of arrows) {
    arrow.addEventListener('click', () => page(Number(arrow.dataset.dir)));
  }

  viewport.addEventListener('scroll', schedule, { passive: true });
  // Both boxes: the viewport changes with the window, and the track changes as
  // images decode into their intrinsic sizes. Either one moves `scrollWidth`.
  const observer = new ResizeObserver(schedule);
  observer.observe(viewport);
  observer.observe(track);
  // Captions are set in Figtree, and a caption reflowing changes the track's
  // width — so the first measurement can be taken against the fallback face.
  // Same reason `reticle.ts` waits on `fonts.ready` before arming.
  document.fonts?.ready.then(schedule);

  sync();
}

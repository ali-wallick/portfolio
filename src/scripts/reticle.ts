/**
 * The selection reticle — this direction's signature, and the one place the old
 * site's recovered motion character is made a feature of rather than inherited.
 *
 * ## What it is
 *
 * Four corner brackets that travel to whatever the pointer is over or the
 * keyboard is focused on. Console and card-game menus all have one; websites
 * essentially never do, which is most of why it reads as "a game developer made
 * this" without a single decorative flourish on the page.
 *
 * ## Why it is written this way
 *
 * `resources/js/nav.js` on the old site did **no interpolation at all** — it
 * assigned `quickInfo.style.top` directly on every scroll event, and four lines
 * of CSS in `templateStyles.css` eased each assignment over 500ms. Scroll events
 * fire faster than that, so the sidebar never arrived while the page was moving:
 * it chased, and settled when scrolling stopped. The lag was *emergent*.
 *
 * This is that mechanism, not a port of it. Everything below assigns a target;
 * nothing below animates. The easing is entirely in `.reticle`'s transition in
 * base.css, using the `--ease` / `--duration` the gate recovered. Which means
 * the character comes free on scroll — retarget every frame, ease each retarget
 * over 500ms, and the brackets trail the moving element and catch up.
 *
 * The old implementation's one *bug* is deliberately not reproduced: it kept
 * `position: relative` and the transition together in a `.scrolled` class and
 * dropped both at the top of the page, so the return trip snapped. Nothing here
 * is conditional, so it settles in both directions.
 *
 * ## The three rules it obeys
 *
 * 1. **It decorates; it never informs.** The real `:focus-visible` outline in
 *    base.css stays underneath. If this script is blocked, fails, or is simply
 *    slow, nothing about the site becomes unusable or unnavigable.
 * 2. **Hover and focus are targeted differently, on purpose.** Focus follows
 *    anything focusable, because a keyboard user needs it everywhere. Hover
 *    follows *controls only* — nav, cards, tiles, buttons. Letting it chase
 *    inline links would make it twitch across every paragraph of prose, which
 *    is noise rather than personality.
 * 3. **Reduced motion is not a disabled state.** `--duration` is already zeroed
 *    under `prefers-reduced-motion`, so the brackets cut to each target instead
 *    of travelling to it. The device survives; only the travel goes.
 */

const PAD = 6;

/** Controls. Pointing at one is an act of aiming; pointing at prose isn't. */
const HOVER_SELECTOR = '.nav-link, .card, .tile, .button, .backlink, .brand';

/** Anything the keyboard can land on, because focus must always be visible. */
const FOCUS_SELECTOR =
  'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';

const fine = window.matchMedia('(hover: hover) and (pointer: fine)');

const root = document.createElement('div');
root.className = 'reticle';
root.setAttribute('aria-hidden', 'true');
for (let i = 0; i < 4; i += 1) root.appendChild(document.createElement('i'));
document.body.appendChild(root);

/**
 * Where the reticle rests when nothing is hovered or focused: the current
 * page's nav pill, or the wordmark on the homepage, which has no nav entry.
 *
 * Giving it a home is what makes it legible as a *selection cursor* rather than
 * as a hover effect — it is already on screen, already pointing at where you
 * are, before you touch anything. It is also the reason the header is sticky:
 * a resting target that scrolls away would leave the brackets chasing it off
 * the top of the page.
 */
const home =
  document.querySelector<HTMLElement>('.nav-link[aria-current="page"]') ??
  document.querySelector<HTMLElement>('.brand');

let hovered: HTMLElement | null = null;
let focused: HTMLElement | null = null;
let frame = 0;

function place(): void {
  frame = 0;
  const el = focused ?? hovered ?? home;
  if (!el || !el.isConnected) {
    root.style.opacity = '0';
    return;
  }

  const box = el.getBoundingClientRect();
  const onScreen = box.width > 0 && box.bottom > 0 && box.top < window.innerHeight;
  root.style.opacity = onScreen ? '1' : '0';
  if (!onScreen) return;

  root.style.width = `${box.width + PAD * 2}px`;
  root.style.height = `${box.height + PAD * 2}px`;
  root.style.transform = `translate(${box.left - PAD}px, ${box.top - PAD}px)`;
}

/**
 * Coalesce to one measurement per frame. Not a change in character — scroll
 * events already fire at most once per frame in every current browser — but it
 * keeps `getBoundingClientRect()` from forcing more than one layout per frame
 * if several sources retarget at once.
 */
function schedule(): void {
  if (!frame) frame = requestAnimationFrame(place);
}

function match(event: Event, selector: string): HTMLElement | null {
  const node = event.target;
  return node instanceof Element ? node.closest<HTMLElement>(selector) : null;
}

document.addEventListener('pointerover', (event) => {
  if (!fine.matches) return;
  hovered = match(event, HOVER_SELECTOR);
  schedule();
});

document.addEventListener('pointerleave', () => {
  hovered = null;
  schedule();
});

document.addEventListener('focusin', (event) => {
  focused = match(event, FOCUS_SELECTOR);
  schedule();
});

document.addEventListener('focusout', () => {
  focused = null;
  schedule();
});

window.addEventListener('scroll', schedule, { passive: true });
window.addEventListener('resize', schedule);

/**
 * Re-measure when the target finishes moving under us.
 *
 * A card lifts 3px on hover, and `pointerover` fires *before* that lift has
 * happened — so a single measurement parks the brackets 3px below where the
 * card ends up, and leaves them there. Measured, not guessed: the reticle
 * settled at y=649 against a hovered card at y=652.
 *
 * Listening for the target's own `transitionend` costs one listener and fixes
 * it exactly, rather than by subtracting a hard-coded `--lift` that would go
 * stale the moment the token changes. It also stays in character: the
 * correction eases like every other retarget instead of snapping.
 */
document.addEventListener('transitionend', (event) => {
  if (event.target === (focused ?? hovered)) schedule();
});

/**
 * Arm after the first placement, so the brackets appear *at* their resting
 * target rather than flying to it from the top-left corner on every page load.
 * Two frames: one for the style assignment to be committed, one for it to have
 * been painted before the transition is allowed to apply.
 *
 * Waiting on `fonts.ready` as well because the resting target is a nav pill,
 * and a pill set in a webfont is a different size before and after the face
 * arrives. Measuring once, early, would park the reticle at the fallback's
 * dimensions and leave it there.
 */
function arm(): void {
  place();
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-armed')));
}

arm();
document.fonts?.ready.then(schedule);

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
 *    anything focusable *that the browser is itself indicating* — see the
 *    `:focus-visible` note on the `focusin` listener — because a keyboard user
 *    needs it everywhere and a pointer user has already been told where they
 *    are by the pointer. Hover follows *controls only* — nav, cards, tiles,
 *    buttons. Letting it chase inline links would make it twitch across every
 *    paragraph of prose, which is noise rather than personality.
 * 3. **Reduced motion is not a disabled state.** `--duration` is already zeroed
 *    under `prefers-reduced-motion`, so the brackets cut to each target instead
 *    of travelling to it. The device survives; only the travel goes.
 *
 * ## Idle behaviour is a state, and the state was chosen (#33)
 *
 * The one thing Phase 5 never examined. When nothing was hovered or focused the
 * brackets went straight home to the nav pill — which meant sweeping a pointer
 * across a page of cards sent them on a full-width traverse back to the
 * top-left between every single one. Correct as written, busy in use, and the
 * busyness was the *return trip*, not the acquisitions.
 *
 * Four candidates went up behind a live switcher on 2026-08-21 and `fade` won:
 * hold the last target, fade out after a beat, and **cut** to the next target
 * rather than flying to it. The long diagonal between distant targets is gone
 * entirely, which was the actual complaint. The other three, and the switcher,
 * are in this branch's history if the decision ever wants reopening.
 *
 * ## Crossing between the header and the body is a cut (#240, 2026-09-05)
 *
 * The traverse `fade` never covered. It killed the long diagonal *between body
 * targets*, but the brackets are placed at their home on every page load and
 * are not dormant — so the launch out of the header happened on the first
 * acquisition of every navigation, and again whenever a nav link and a card
 * were pointed at within `HOLD` of each other.
 *
 * It is also the longest travel the reticle ever makes, and it is longer than
 * the screen. Measured on `/projects` at 1280x800: the resting nav pill is
 * **353px** from the first card and **1515px** from the furthest tile, against
 * a **1509px** viewport diagonal. Across routes the first acquisition after a
 * page load ran 281px (`/resume`) to 703px (`/`).
 *
 * Four homes went on a live switcher and Ali picked this one: **keep the
 * resting pill, and cut across the boundary rather than flying across it.**
 * The reticle still travels *within* the header and *within* the body, so the
 * chase-and-settle character is untouched everywhere it was legible; what goes
 * is the one move that was never legible as a chase because it spanned the
 * page. Her reasoning: it balances the uniqueness and the usability.
 *
 * The three that lost, so they are not rediscovered as improvements: flying
 * across (the incumbent); dropping the home entirely so nothing rests
 * anywhere; and dropping the home *and* taking the header out of both
 * selectors. The last two both retire `base.css`'s stated reason for the
 * header being sticky ("because the reticle needs a home"), and both render
 * nothing at all on a phone, where there is no pointer and the brackets are
 * the only thing the nav pill gets.
 */

/** How far outside the target's box the brackets sit. */
const PAD = 6;

/**
 * What the brackets do once nothing is hovered or focused.
 *
 * - `home`   travel back to the resting target immediately. Phase 5's shipped
 *            behaviour, and the one being questioned.
 * - `stay`   hold the last target indefinitely. The reticle reads as a *cursor
 *            that was put down* rather than one that springs back.
 * - `linger` hold, then travel home after `HOLD`. `home` with hysteresis: a
 *            sweep across cards never triggers a return trip, but leaving the
 *            page alone still resets it to pointing at where you are.
 * - `fade`   hold in place, then fade out after `HOLD`, and *cut* to the next
 *            target rather than travelling to it. Kills the long diagonal
 *            traverse entirely — the brackets acquire rather than fly.
 */
type Mode = 'home' | 'stay' | 'linger' | 'fade';

/** Settled 2026-08-21, from four candidates compared on a preview. */
const MODE: Mode = 'fade';

/**
 * How long the brackets hold the last target before fading, in ms. Long enough
 * that moving between two controls never triggers a fade, short enough that a
 * genuinely abandoned reticle does not sit there. 0.6s read as twitchy and 5s
 * as forgotten; 1.6s is where it stopped being either.
 */
const HOLD = 1600;

/**
 * Dwell before a *new* target is acquired, in ms — the second source of chatter,
 * and a subtler one than the return trip. At 0 the brackets retarget on the
 * first `pointerover`, so a pointer travelling somewhere else drags them through
 * every control it crosses on the way. 25ms is below the threshold where the
 * reticle feels laggy on a deliberate move, and above the one where a
 * pass-through registers as an aim.
 */
const SETTLE = 25;

/** Controls. Pointing at one is an act of aiming; pointing at prose isn't. */
const HOVER_SELECTOR = '.nav-link, .card, .tile, .button, .backlink, .brand, .gallery-zoom';

/**
 * Anything the keyboard can land on, because focus must always be visible —
 * except `[data-reticle-skip]` (#278). That marks a tab stop that exists for
 * scrollability rather than as a control (`.gallery-viewport`'s `tabindex="0"`
 * is required so `scrollable-region-focusable` doesn't fail, not because the
 * region is something to press). Bracketing the whole region reads as "this
 * is selected," which the region isn't. Rule 1 above is what makes the
 * exclusion safe: the real `:focus-visible` ring underneath still shows
 * without this script's help, so nothing here is the only indicator.
 */
const FOCUS_SELECTOR =
  'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"]):not([data-reticle-skip])';

const fine = window.matchMedia('(hover: hover) and (pointer: fine)');

const root = document.createElement('div');
root.className = 'reticle';
root.setAttribute('aria-hidden', 'true');
for (let i = 0; i < 4; i += 1) root.appendChild(document.createElement('i'));
document.body.appendChild(root);

/** The sticky header occludes whatever scrolls under it; the reticle should
    too, except when its own target lives inside the header. See `place()`. */
const header = document.querySelector<HTMLElement>('.site-header');

/** Which of the page's two regions an element is in. Used for the clip in
    `place()` and for the boundary cut in `retarget()` — see both. */
const inHeader = (el: Element | null): boolean => (el ? (header?.contains(el) ?? false) : false);

/**
 * Where the reticle rests when nothing is hovered or focused: the current
 * page's nav pill, or the wordmark on the homepage, which has no nav entry.
 *
 * Giving it a home is what makes it legible as a *selection cursor* rather than
 * as a hover effect — it is already on screen, already pointing at where you
 * are, before you touch anything. It is also the reason the header is sticky:
 * a resting target that scrolls away would leave the brackets chasing it off
 * the top of the page.
 *
 * Every mode still *starts* here. They differ only in whether, and how fast,
 * they come back.
 */
const home =
  // `[aria-current]`, not `[aria-current="page"]`: a project or resume subpage
  // marks its section's nav item `true` rather than `page` (#128, item 15b),
  // and the reticle should still rest there rather than falling back to the
  // brand.
  document.querySelector<HTMLElement>('.nav-link[aria-current]') ??
  document.querySelector<HTMLElement>('.brand');

let hovered: HTMLElement | null = null;
let focused: HTMLElement | null = null;

/** What the brackets are actually on — which is not `focused ?? hovered` any
    more, because in three of the four modes they outlive their target. */
let current: HTMLElement | null = home;

/** Faded out by `fade` mode. Held separately from the on-screen test in
    `place()`, which is about geometry rather than about idling. */
let dormant = false;

let frame = 0;
let idle = 0;
let settling = 0;

function place(): void {
  frame = 0;
  const el = current;
  if (!el || !el.isConnected || dormant) {
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

  /* Clip whatever's covered by the header, in the header's own local frame,
     so the brackets slide under it as the target scrolls rather than
     floating on top of its opaque background. Skipped for header-internal
     targets (the resting nav pill) so they stay fully visible. */
  const headerBottom = inHeader(el) ? 0 : (header?.getBoundingClientRect().bottom ?? 0);
  const covered = headerBottom - (box.top - PAD);
  root.style.clipPath = covered > 0 ? `inset(${covered}px 0 0 0)` : '';
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

/**
 * Move without travelling.
 *
 * `fade` mode's whole argument is that the long diagonal is the noisy part, so
 * reappearing has to be a cut. `is-cutting` suppresses the geometry transition
 * for exactly one committed frame while leaving opacity eased, so the brackets
 * snap to the new box and fade up on it — an acquisition rather than a flight.
 * Same two-frame dance as `arm()`, and for the same reason.
 */
function cut(): void {
  root.classList.add('is-cutting');
  place();
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('is-cutting')));
}

/**
 * Decide what the brackets should be on. Called by input events only — never by
 * scroll or resize, which re-measure the *existing* target and must not restart
 * an idle timer that is counting down a return trip.
 */
function retarget(): void {
  const active = focused ?? hovered;
  clearTimeout(idle);

  if (active) {
    /* The header/body boundary is crossed by cutting, never by travelling
       (#240). See "Crossing between the header and the body" above. Tested on
       the pair rather than on whether the target happens to be home: pointing
       at a nav link and then at a card is the same long diagonal as launching
       out of the resting pill, and both are the thing being removed. */
    const crossing = !dormant && current !== null && inHeader(current) !== inHeader(active);

    current = active;
    if (dormant) {
      dormant = false;
      cut();
      return;
    }
    if (crossing) {
      cut();
      return;
    }
    schedule();
    return;
  }

  if (MODE === 'home') {
    current = home;
    schedule();
    return;
  }

  /* `stay` holds forever; the other two hold, then do something. Either way
     `current` is left alone — that is what "where it last landed" means. */
  if (MODE === 'linger') {
    idle = window.setTimeout(() => {
      current = home;
      schedule();
    }, HOLD);
  } else if (MODE === 'fade') {
    idle = window.setTimeout(() => {
      dormant = true;
      schedule();
    }, HOLD);
  }
}

/**
 * Acquisition dwell. A new target has to hold the pointer for `SETTLE` before
 * the brackets commit to it — losing a target still takes effect immediately,
 * because delaying *that* would defeat the idle behaviour entirely.
 */
function commit(immediate: boolean): void {
  clearTimeout(settling);
  if (immediate || !SETTLE) {
    retarget();
    return;
  }
  settling = window.setTimeout(retarget, SETTLE);
}

function match(event: Event, selector: string): HTMLElement | null {
  const node = event.target;
  return node instanceof Element ? node.closest<HTMLElement>(selector) : null;
}

document.addEventListener('pointerover', (event) => {
  if (!fine.matches) return;
  const next = match(event, HOVER_SELECTOR);
  if (next === hovered) return;
  hovered = next;
  commit(!next);
});

document.addEventListener('pointerleave', () => {
  hovered = null;
  commit(true);
});

/**
 * Focus is tracked through `:focus-visible`, not `:focus` — which is what rule 1
 * above actually promises, and what it was failing to keep (#240).
 *
 * A mouse click focuses a link or a button, and the browser then declines to
 * paint a focus ring on it, because a pointer user does not need one. The
 * reticle had no such rule, so it bracketed a control the browser had decided
 * not to indicate. Worse, it never stopped: `retarget()` only arms the idle
 * timer when nothing is active, and a focused element is active — so the
 * brackets sat on whatever was last clicked, pointer long gone, for the life of
 * the page. Measured on `/resume`: click a density tab, move the pointer away,
 * and the brackets are still on it 3.5s later with `:focus-visible` false the
 * whole time. That is the hanging-around this issue was filed for.
 *
 * Reading the pseudo-class inside the handler is accurate — verified in
 * Chromium, false for a click and true for a Tab on the same element — because
 * focus-visible is settled at focus time rather than at first paint.
 *
 * Tested against `event.target` rather than the `closest()` match: the
 * pseudo-class is on the element that actually took focus, and an ancestor
 * standing in for it does not carry it.
 */
document.addEventListener('focusin', (event) => {
  const el = event.target;
  const next = match(event, FOCUS_SELECTOR);
  focused = next && el instanceof Element && el.matches(':focus-visible') ? next : null;
  commit(true);
});

document.addEventListener('focusout', () => {
  focused = null;
  commit(true);
});

/* `capture: true` is load-bearing, not defensive. Scroll events do not bubble,
   so a bubbling listener here sees the page scrolling and NOTHING else — an
   element-level scroller dispatches `scroll` at itself only. The gallery row
   (#166) is one, and its zoomable images are focusable links inside it, so
   without this the brackets stay parked at a slide's old x while the row
   carries it sideways. The capture path runs window → … → target for every
   event, so one listener covers the page and every scroller on it, and
   `schedule()` already coalesces to one measurement per frame. */
window.addEventListener('scroll', schedule, { passive: true, capture: true });
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
 *
 * Keyed off `current` rather than `focused ?? hovered` now that they diverge:
 * in the holding modes the element still under the brackets is the one whose
 * movement matters, and it may well be one the pointer has already left.
 */
document.addEventListener('transitionend', (event) => {
  if (event.target === current) schedule();
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

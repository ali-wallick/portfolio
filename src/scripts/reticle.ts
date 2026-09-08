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
 *
 * ## Appearing is always a cut, and arming waits for a real placement (#352)
 *
 * Both halves of one bug: the reticle could load *unplaced*, and then fly in
 * from the top-left corner on the first thing the pointer touched.
 *
 * `place()` bails without assigning geometry when its target measures off
 * screen — and **a document that has never been presented reports a zero-height
 * viewport**, so that test fails for everything on the page, including a
 * resting nav pill the sticky header would otherwise keep visible forever.
 * Measured in a hidden tab on `/projects`: the pill's own rect is real (top
 * 100, width 83.7) while `window.innerHeight` is 0. Load the site into a
 * background tab and that is the state the page starts in.
 *
 * `arm()` then armed the transition two frames later regardless, over an
 * element still at its CSS origin, and `retarget()` cut only for `dormant` or
 * for a crossing — neither of which a header target coming out of the header
 * home is. So the brackets travelled, 0,0 to wherever the pointer was.
 *
 * The two rules that replace it are each a generalisation of something already
 * settled rather than a new behaviour:
 *
 * 1. **Arm on the first placement that actually happened.** The two-frame dance
 *    was a proxy for "geometry has been assigned"; it is now the real
 *    condition, so a bailed measurement cannot leave a live transition sitting
 *    over the origin.
 * 2. **Acquiring while invisible is a cut**, whatever made it invisible —
 *    dormant, scrolled off screen, or never placed. This is #240's argument
 *    with the special case taken out of it: travel is only legible if the
 *    brackets were visible where the travel *started*, and none of these three
 *    states is somewhere a viewer watched them leave.
 *
 * `visibilitychange` re-measures on top of that, which fixes the absence at its
 * source instead of only making its consequence prettier — the brackets are on
 * the pill when you first look at the tab, rather than when you first move the
 * pointer.
 *
 * ## Nothing paints until the first target has settled (#352)
 *
 * The rest of the same report, and the half that was not a bug at all: refresh
 * with the pointer already over the wordmark and the brackets rest on the nav
 * pill, then relocate to it. **522px across the header on `/projects` at 1280
 * wide** — pill at x=724, wordmark at x=202. Correct by the rules as written,
 * and it reads as the reticle having been lost and coming back.
 *
 * **Cutting that move instead of travelling it was the wrong answer, tried and
 * rejected: it trades a slide for a teleport and the viewer still sees the
 * brackets in a place they never belonged.** The move itself is the artifact.
 * A stationary pointer already has a target at load — the page just doesn't
 * know it yet, because Chrome dispatches that pointer's `pointerover` after the
 * first paint rather than before it. Everything painted in between is a guess
 * being corrected in public.
 *
 * So the brackets are measured at load and **held invisible** until the target
 * has settled: the first acquisition wins if one arrives, `LAND` decides if
 * none does, and either way the reveal is a placement rather than a move. On a
 * reload with the pointer parked anywhere, the brackets simply appear where
 * they belong.
 *
 * **This deliberately leaves #240 alone.** A pointer that arrives *later* — you
 * reload, look, then move to a nav link — still travels within a region and
 * still cuts across the boundary, which is what the switcher settled. What goes
 * is only the move nobody made.
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
 *
 * Two more pieces of state sit alongside the mode: `dormant`, fade's
 * faded-out state, and the crossing cut between header and body (#240),
 * documented above.
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

/**
 * How long after the first frame to give up waiting for a load-time target, in
 * ms. A stationary pointer's `pointerover` is dispatched once there is a
 * painted frame to hit-test, so the window has to cover that dispatch plus
 * `SETTLE` — 80ms is comfortably past both without being long enough for the
 * delay itself to read as the reticle being slow to arrive.
 *
 * Erring long is the safe direction: overshoot and the brackets appear a frame
 * or two later than they could have, undershoot and the relocation this exists
 * to prevent is back.
 */
const LAND = 80;

/** Controls. Pointing at one is an act of aiming; pointing at prose isn't. */
/* `.breadcrumb a` rather than `.breadcrumb` (#314): the crumb list is a `<p>`
   and only its anchors are controls, so naming the container would park the
   brackets around the separator too. Same shape as `.gallery-zoom` — the link,
   not the figure it sits in. */
const HOVER_SELECTOR =
  '.nav-link, .card, .tile, .button, .breadcrumb a, .project-step, .brand, .gallery-zoom';

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

/**
 * Whether the last `place()` left the brackets actually visible — the union of
 * every reason they might not be, which is exactly what rule 2 above needs and
 * what `dormant` alone was standing in for. Starts false because nothing has
 * been placed yet, which is the state the whole fix is about (#352).
 */
let shown = false;

/**
 * Whether the brackets have been revealed yet. Until they have, `place()`
 * measures and positions but paints nothing, so the load-time target can be
 * corrected without anyone watching it happen (#352).
 */
let landed = false;

let frame = 0;
let idle = 0;
let settling = 0;

function place(): void {
  frame = 0;
  const el = current;
  if (!el || !el.isConnected || dormant) {
    shown = false;
    root.style.opacity = '0';
    return;
  }

  const box = el.getBoundingClientRect();
  const onScreen = box.width > 0 && box.bottom > 0 && box.top < window.innerHeight;
  /* Geometry is still assigned while unlanded, so that revealing is a paint
     and never a move. Only the opacity waits. */
  shown = onScreen && landed;
  root.style.opacity = shown ? '1' : '0';
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

  /* Geometry now exists, so the transition is safe to turn on. Every early
     return above skips this deliberately — see `arm()`. Held until the reveal
     as well: an unlanded reticle has a target that is still provisional. */
  if (landed) arm();
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
    const crossing = current !== null && inHeader(current) !== inHeader(active);

    current = active;
    dormant = false;
    /* A target that arrives before the reveal *is* the load-time placement, not
       a move away from one — so it lands here rather than travelling or
       cutting from a home nobody saw (#352). */
    if (!landed) {
      land();
      return;
    }
    /* `!shown` covers dormant, scrolled off screen, and never placed — three
       states with one thing in common, which is that nobody saw the brackets
       where the travel would start (#352). */
    if (!shown || crossing) {
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
 * **Called from the bottom of `place()`, and only from there (#352).** It used
 * to arm on a frame count taken at load, which is a proxy for "geometry has
 * been assigned" that is wrong in precisely the case that matters: a
 * measurement that bailed left the transition live over an element still at
 * `translate(0, 0)`, so the next acquisition flew in from the corner. Every
 * early return in `place()` therefore skips this, and the brackets stay
 * unarmed — and invisible — until there is a real box to be unarmed *at*.
 *
 * Waiting on `fonts.ready` below as well because the resting target is a nav
 * pill, and a pill set in a webfont is a different size before and after the
 * face arrives. Measuring once, early, would park the reticle at the
 * fallback's dimensions and leave it there.
 */
let armed = false;
function arm(): void {
  if (armed) return;
  armed = true;
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-armed')));
}

/**
 * Reveal, once. Called by whichever comes first: an acquisition that arrives
 * before the reticle has painted, or `LAND` after the first frame if nothing
 * does. The placement is already measured either way, so this paints rather
 * than moves — which is the whole point (#352).
 */
function land(): void {
  if (landed) return;
  landed = true;
  place();
}

place();

/* Two frames, then the window: the first frame is what gives a stationary
   pointer something to hit-test, and its `pointerover` follows. */
requestAnimationFrame(() => requestAnimationFrame(() => window.setTimeout(land, LAND)));

document.fonts?.ready.then(schedule);

/* A tab that loads in the background has no viewport to measure against, so
   the placement above bailed and the brackets are nowhere. Re-measure when the
   document is first shown rather than waiting for the pointer to arrive (#352). */
document.addEventListener('visibilitychange', schedule);

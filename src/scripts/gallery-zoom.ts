/**
 * Click-to-zoom on the gallery images that have more to show, with left/right
 * between them (#166).
 *
 * ## Progressive enhancement, strictly
 *
 * Same contract as `reticle.ts`, `resume-density.ts` and `gallery-scroll.ts`.
 * Every zoomable image is already a REAL LINK to its full-size file, so with
 * this script dead, clicking one opens the picture. That is a worse experience
 * than a dialog and a perfectly good one; nothing here is load-bearing.
 *
 * ## Why `<dialog>` and `showModal()`
 *
 * It traps focus, closes on Escape, returns focus to the link that opened it,
 * and makes the page behind it inert. A hand-rolled overlay has to reimplement
 * all four, and usually reimplements three.
 *
 * One dialog per page rather than one per image: the content is swapped on
 * open, so a five-image gallery ships one dialog rather than five.
 *
 * ## Stepping, and what it steps through
 *
 * The ZOOMABLE images only, in row order. On this site that is the whole
 * gallery on three pages and exactly one image on a fourth, so the controls
 * hide themselves below two — the same "no arrows where it makes no sense"
 * rule the row itself follows. The ends stop rather than wrap, matching the
 * row's own arrows; a reader who cannot tell whether they have seen everything
 * is the thing wrapping costs you.
 *
 * Stepping through EVERY slide instead was considered and rejected (#305). The
 * box is pinned to the widest picture in the row, so a slide that is under the
 * zoom threshold — one with nothing more to show — would land in a box sized
 * for a picture several times its width. That is the 8%-fill complaint #249
 * closed, reintroduced one step in.
 */

const dialog = document.querySelector<HTMLDialogElement>('.zoom-dialog');
const zoomLinks = [...document.querySelectorAll<HTMLAnchorElement>('.gallery-zoom')];

// Nothing to enhance: a page with no zoomable image, or a browser without
// `showModal`. Either way the links keep working as links.
if (dialog && zoomLinks.length > 0 && typeof dialog.showModal === 'function') {
  const image = dialog.querySelector<HTMLImageElement>('img');
  const caption = dialog.querySelector<HTMLElement>('figcaption');
  const close = dialog.querySelector<HTMLButtonElement>('.zoom-close');
  const nav = dialog.querySelector<HTMLElement>('.zoom-nav');
  const count = dialog.querySelector<HTMLElement>('.zoom-count');
  const steps = [...dialog.querySelectorAll<HTMLButtonElement>('[data-zoom-step]')];

  if (image && caption && close && nav && count) {
    let index = 0;

    const frame = dialog.querySelector<HTMLElement>('.zoom-frame');

    /**
     * Publish the PAINTED picture's width, so the caption can align to the
     * thing it describes (#249).
     *
     * The painted width is not the element's rect wherever `object-fit:
     * contain` is letterboxing inside it — on a phone the picture fills its
     * box and the letterboxing is real — so compute what `contain` produces
     * rather than reading `getBoundingClientRect()`.
     */
    function syncPictureWidth(): void {
      if (!image) return;
      const r = image.getBoundingClientRect();
      const ratio = image.naturalWidth / image.naturalHeight || 1;
      const painted = Math.min(r.width, r.height * ratio);
      if (painted > 0) dialog!.style.setProperty('--zoom-picture-w', `${Math.round(painted)}px`);
    }

    /**
     * Pin the box to the widest picture in THIS gallery (#249).
     *
     * The reasoning is in `base.css` beside the rule that consumes this. The
     * mechanics worth knowing here:
     *
     * `.zoom-frame`'s height is the space left for the picture after the
     * caption, so it is the right quantity to derive a width from — the
     * CURRENT picture's own height is not, because a wide picture can be
     * limited by the box's width instead and would under-report.
     *
     * "This gallery" is the row the opened link sits in, not every zoomable
     * picture on the page. Stepping never leaves that row, so pooling a second
     * gallery would size the box for a picture you cannot reach from here.
     */
    function pinToGallery(): void {
      if (!frame) return;
      const available = frame.getBoundingClientRect().height;
      if (available <= 0) return;

      const row = zoomLinks[index]?.closest('.gallery');
      const siblings = row ? zoomLinks.filter((l) => l.closest('.gallery') === row) : zoomLinks;

      let widest = 0;
      for (const link of siblings) {
        const w = Number(link.dataset.zoomW);
        const h = Number(link.dataset.zoomH);
        if (!(w > 0 && h > 0)) continue;
        widest = Math.max(widest, available * (w / h));
      }
      if (widest <= 0) return;

      /* The dialog's own padding and border. NOT `dialog.width - image.width`,
         which inside a pinned box is the EMPTY SPACE — it feeds itself back in
         and runs away (measured: a 1900px box). */
      const cs = getComputedStyle(dialog!);
      const chrome =
        dialog!.offsetWidth -
        dialog!.clientWidth +
        parseFloat(cs.paddingLeft) +
        parseFloat(cs.paddingRight);
      dialog!.style.setProperty('--zoom-box-w', `${Math.ceil(widest + chrome)}px`);
    }

    /**
     * The two above are circular, so they run together and iterate.
     *
     * Aligning the caption to the picture makes the caption's width depend on
     * the picture's width, which depends on the width of the box, which is
     * derived from the height the caption left. Running them once in either
     * order leaves one measuring a layout that no longer exists.
     *
     * Three passes, because it converges: a narrower caption is a taller
     * caption is a shorter picture. It settles in two; the third is the check.
     */
    function relayout(): void {
      for (let pass = 0; pass < 3; pass += 1) {
        syncPictureWidth();
        pinToGallery();
      }
    }

    /**
     * Swap the picture, and never through an in-between size.
     *
     * Mutating the visible `<img>` in place is what gave every step two
     * reflows in opposite directions (#249): between the `src` assignment and
     * the decode the element has no picture, so the box collapsed to whatever
     * the caption and the nav wanted and then expanded past where it started.
     * Intrinsic `width`/`height` attributes fix most of that on their own, and
     * measured frame by frame they did — except across a portrait-to-landscape
     * step, where the box still went 440 -> 362 -> 986.
     *
     * So the new picture is decoded off-screen first and only swapped in when
     * it can paint. The box then holds the old size and moves exactly once,
     * which is also what the browser does natively for a plain navigation.
     * The preload warms the cache, so the visible element's own request is a
     * hit rather than a second download.
     */
    let request = 0;
    function swapPicture(link: HTMLAnchorElement): void {
      if (!image || !caption) return;
      const w = Number(link.dataset.zoomW);
      const h = Number(link.dataset.zoomH);
      const srcset = link.dataset.zoomSrcset ?? '';
      const sizes = link.dataset.zoomSizes ?? '';
      // The alt is the picture's meaning and does not change with its size. The
      // visually-hidden "open larger" hint is the LINK's, not the image's, so
      // it is deliberately not carried across.
      const alt = link.querySelector('img')?.alt ?? '';
      const text = link.dataset.caption ?? '';

      const apply = (): void => {
        if (w > 0 && h > 0) {
          image.width = w;
          image.height = h;
        } else {
          image.removeAttribute('width');
          image.removeAttribute('height');
        }
        // Candidates rather than one file (#249). A phone was downloading the
        // 1600px variant to paint a 245px-wide picture, throwing away the
        // responsive work `Media.astro` does one element away. `srcset` before
        // `src`, or the browser can start the wrong request.
        if (srcset) {
          image.srcset = srcset;
          image.sizes = sizes;
        } else {
          image.removeAttribute('srcset');
          image.removeAttribute('sizes');
        }
        image.src = link.href;
        image.alt = alt;

        // The caption travels WITH the picture, and that is the second half of
        // the one-reflow rule rather than tidiness. Updating it on click while
        // the picture waited for its decode moved the box twice on its own:
        // stepping off the tall level shot, whose long caption was setting the
        // width, narrowed the dialog 440 -> 362 before the new picture landed
        // and took it to 922. A caption describes the picture above it, so it
        // has no business being on screen ahead of it.
        caption.textContent = text;
        caption.hidden = text === '';

        relayout();
      };

      // Opening, rather than stepping: there is no old picture to hold, so
      // waiting would just show an empty dialog for the length of a decode.
      if (!image.getAttribute('src')) {
        apply();
        return;
      }

      const token = (request += 1);
      const preload = new Image();
      if (srcset) {
        preload.srcset = srcset;
        preload.sizes = sizes;
      }
      preload.src = link.href;
      // Stale by the time it decoded — the reader stepped again. Dropping it
      // is the whole reason for the token.
      const settle = (): void => {
        if (token === request) apply();
      };
      if (preload.complete) settle();
      else preload.decode().then(settle, settle);
    }

    /** Fill the dialog from one link, without opening or closing it. */
    function show(next: number): void {
      if (!image || !caption || !count) return;
      index = Math.min(Math.max(next, 0), zoomLinks.length - 1);
      const link = zoomLinks[index];

      // The picture and its caption swap together, and only once the new one
      // can paint. The counter and the arrows are control state rather than
      // content, so they answer the click immediately.
      swapPicture(link);

      if (!count.hidden) count.textContent = `${index + 1} of ${zoomLinks.length}`;
      for (const step of steps) {
        step.disabled =
          step.dataset.zoomStep === '-1' ? index === 0 : index === zoomLinks.length - 1;
      }
    }

    nav.hidden = zoomLinks.length < 2;

    /**
     * The counter states a POSITION, and a position needs a set the reader can
     * see (#305).
     *
     * It counts the set the arrows step, which is the zoomable images. On every
     * gallery on this site today that IS the row, so "2 of 3" is true of both
     * and there is nothing to disambiguate. The first gallery to mix two or
     * more zoomable images with a non-zoomable one breaks that: the number
     * would then disagree with the pictures the reader can see beside it, and
     * there is no short phrasing that fixes it — microcopy here is "plain and a
     * little dry", and "2 of 3 of the 5 that open" is neither.
     *
     * So the dialog states no position rather than a misreadable one. The
     * arrows' disabled ends still say where you are, which is the same argument
     * `Gallery.astro` already makes for the scroll rail being `aria-hidden`.
     *
     * Counting `.gallery-slide` rather than the gallery's data: the row is what
     * the reader is comparing the number against.
     */
    count.hidden = document.querySelectorAll('.gallery-slide').length !== zoomLinks.length;

    /**
     * Lock the page behind the modal (#249).
     *
     * `showModal()` inerts the page but does NOT stop it scrolling — measured
     * at 0 to 600px on a phone with the lightbox open, so closing it put you
     * somewhere else on the page than where you opened it.
     *
     * Costs no horizontal shift, because `html` already carries
     * `scrollbar-gutter: stable` (#247): `overflow: hidden` is still a scroll
     * container, so the gutter stays reserved and the centred column does not
     * jump sideways.
     */
    const root = document.documentElement;
    let lockedAt = 0;
    function lockScroll(locked: boolean): void {
      if (locked) {
        // `overflow: hidden` does not preserve where the page was — it clamps
        // the scroll position and the browser hands back 0 on release. Measured:
        // closing the dialog left the page at the top, and A4's scrollIntoView
        // below then jumped it 3597px chasing the gallery. Remember it here and
        // put it back on release, before anything else moves.
        lockedAt = window.scrollY;
        root.classList.add('is-zoom-open');
        return;
      }
      root.classList.remove('is-zoom-open');
      window.scrollTo({ top: lockedAt, behavior: 'instant' });
    }

    for (const [i, link] of zoomLinks.entries()) {
      link.addEventListener('click', (event) => {
        // Let a modified click do what the user asked for — new tab, download,
        // save-as. Intercepting those is the classic way an enhancement makes
        // a real link worse than it was.
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (event.button !== 0) return;
        event.preventDefault();
        show(i);
        dialog.showModal();
        lockScroll(true);
        // Neither value can be measured until the dialog is in the top layer
        // and laid out, so the open path measures again here.
        relayout();
      });
    }

    for (const step of steps) {
      step.addEventListener('click', () => show(index + Number(step.dataset.zoomStep)));
    }

    // Arrow keys, because a dialog showing one of several pictures is the one
    // place a reader will reach for them. Escape is the platform's already.
    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') show(index + 1);
      else if (event.key === 'ArrowLeft') show(index - 1);
      else return;
      event.preventDefault();
    });

    /**
     * Swipe to step, on touch (#305).
     *
     * On a phone the arrows were the only way through, on a lightbox that is
     * edge to edge — which is the shape that invites a swipe in the first
     * place.
     *
     * Four rules keep it from taking over gestures that are not it:
     *
     * 1. **Nothing is ever `preventDefault`ed**, and every listener is
     *    `passive`. The gesture is decided at `touchend` from where the finger
     *    started and ended, so pinch-zoom, scrolling and the browser's own
     *    handling are untouched while it is in flight. A swipe that turns out
     *    not to be one costs nothing.
     * 2. **A second finger cancels it.** A pinch's two touches drift apart
     *    horizontally, which is a swipe on the arithmetic below.
     * 3. **The screen edges are left alone**, where the platform's back
     *    gesture lives. 24px is the usual width of that strip, and the picture
     *    keeps the other ~340px of a 390px phone.
     * 4. **Horizontal has to dominate**, or a scroll-ish drag down the caption
     *    would step the picture.
     *
     * Nothing animates, so there is no `prefers-reduced-motion` branch to
     * write: the swipe ends in the same `show()` the arrows and the arrow keys
     * call, and the picture is swapped once its bytes can paint.
     */
    const SWIPE_MIN = 40;
    const SWIPE_DOMINANCE = 1.5;
    const SWIPE_EDGE = 24;

    let swipe: { x: number; y: number; id: number } | null = null;

    dialog.addEventListener(
      'touchstart',
      (event) => {
        swipe = null;
        if (zoomLinks.length < 2 || event.touches.length !== 1) return;
        const touch = event.touches[0];
        const edge = touch.clientX < SWIPE_EDGE || touch.clientX > window.innerWidth - SWIPE_EDGE;
        if (edge) return;
        swipe = { x: touch.clientX, y: touch.clientY, id: touch.identifier };
      },
      { passive: true },
    );

    dialog.addEventListener(
      'touchmove',
      (event) => {
        if (event.touches.length > 1) swipe = null;
      },
      { passive: true },
    );

    dialog.addEventListener(
      'touchend',
      (event) => {
        const start = swipe;
        swipe = null;
        if (!start) return;
        const touch = [...event.changedTouches].find((t) => t.identifier === start.id);
        if (!touch) return;

        const dx = touch.clientX - start.x;
        const dy = touch.clientY - start.y;
        if (Math.abs(dx) < SWIPE_MIN) return;
        if (Math.abs(dx) < Math.abs(dy) * SWIPE_DOMINANCE) return;

        // Swipe left to go forward: the picture follows the finger. `show()`
        // clamps, so a swipe past either end is a no-op rather than a wrap.
        show(index + (dx < 0 ? 1 : -1));
      },
      { passive: true },
    );

    dialog.addEventListener(
      'touchcancel',
      () => {
        swipe = null;
      },
      { passive: true },
    );

    // Every path measures once BEFORE the bytes arrive, off the intrinsic
    // width and height, which is close but not exact: the decoded box can land
    // a fraction off what the attributes implied. Measuring again on load is
    // what makes the box right rather than nearly right.
    image.addEventListener('load', () => {
      if (dialog.open) relayout();
    });

    // Both values are pixels derived from a viewport-relative box, so they
    // stop being right the moment the viewport changes — a phone rotating is
    // the case that matters.
    window.addEventListener('resize', () => {
      if (dialog.open) relayout();
    });

    close.addEventListener('click', () => dialog.close());

    // Click-outside. The backdrop is not a child, so a click on it targets the
    // dialog itself — anything inside stops at its own element first.
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });

    // Drop the source once it is off screen, so a large photo is not held in
    // memory for the rest of the visit.
    dialog.addEventListener('close', () => {
      lockScroll(false);
      image.removeAttribute('src');
      image.removeAttribute('srcset');

      /**
       * Put focus back on the link explicitly, rather than trusting
       * `close()`'s own restore.
       *
       * `showModal()` restores focus to whatever was focused when it opened,
       * and on a browser where clicking a link does not focus it — Safari on
       * macOS, by default — that was not the link. It was the nearest
       * focusable ancestor, which is `.gallery-viewport`: a `tabindex="0"` box
       * wrapping the WHOLE row. The site's `:focus-visible` rule then draws a
       * 3px magenta ring around the entire gallery, which reads as "this
       * region is selected" when magenta on this site means "you are on a
       * control".
       *
       * The container's ring is right for a keyboard user who tabbed to the
       * row deliberately (it is how they know arrow keys will work there), so
       * the fix is to stop the zoom path landing on it rather than to remove
       * it — see #278 for what that ring should look like.
       */
      const link = zoomLinks[index];
      if (!link) return;

      /**
       * Bring the ROW to the picture you closed on, before focusing it (#249).
       *
       * `preventScroll` below is what makes this necessary and is still right:
       * it is the other half of the fix described above, and dropping it puts
       * the ring back on the container. But it also meant the row never
       * followed the dialog — step to the fifth image, press Escape, and focus
       * landed on a link that was 30% visible past the right edge, with the row
       * still at `scrollLeft: 0`.
       *
       * `block: 'nearest'` so the page does not scroll vertically: the gallery
       * was on screen when the dialog opened, and A3's lock means it still is.
       * `inline: 'center'` is the row's own arrows' behaviour.
       */
      link.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'instant' });
      link.focus({ preventScroll: true });
    });
  }
}

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

    /**
     * Cap the picture against the furniture that is actually there (#249).
     *
     * `max-height` used to be `calc(92vh - 8rem)`, a constant reserving 128px
     * for the close button, the caption and the nav. It was wrong in both
     * directions: measured, the furniture is 63px on /projects/mini-mages,
     * where the nav is hidden and the picture was capped with 65px going
     * spare — and 167px on a two-line caption, where the dialog overflowed its
     * own 92vh and pushed the nav below its fold, so you had to scroll a
     * lightbox to reach the arrows.
     *
     * Measured rather than expressed in CSS because the honest CSS version
     * needs the dialog's height to be definite so flex can hand the remainder
     * to the picture — and a definite height is a pinned box, which is a look
     * rather than a fix and belongs with #249's group C. This changes what the
     * picture is capped AT and leaves the box hugging it, exactly as before.
     *
     * Two passes, because the two quantities feed each other: a shorter
     * picture is a narrower picture, a narrower dialog is a narrower caption,
     * and a narrower caption can take one more line. It settles in one; the
     * second is the check.
     */
    function capToFurniture(): void {
      if (!image) return;
      dialog!.style.removeProperty('--zoom-furniture');
      let reserved = 0;
      for (let pass = 0; pass < 2; pass += 1) {
        const border = dialog!.offsetHeight - dialog!.clientHeight;
        // `scrollHeight` is the full natural content height whether or not the
        // box is currently capping it, which is what makes this independent of
        // the cap it is about to set.
        const furniture = dialog!.scrollHeight + border - image.offsetHeight;
        reserved = Math.max(0, Math.ceil(furniture));
        dialog!.style.setProperty('--zoom-furniture', `${reserved}px`);
      }
      // Sub-pixel residue. The picture's own rounding can still leave the box
      // a pixel over budget, and a pixel over budget on a lightbox is a
      // scrollbar. Correct against the overflow itself rather than by rounding
      // the estimate harder, which would cost every dialog a pixel to fix one.
      const over = dialog!.scrollHeight - dialog!.clientHeight;
      if (over > 0) dialog!.style.setProperty('--zoom-furniture', `${reserved + over}px`);
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
      // visually-hidden "view full size" hint is the LINK's, not the image's,
      // so it is deliberately not carried across.
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

        capToFurniture();
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

      count.textContent = `${index + 1} of ${zoomLinks.length}`;
      for (const step of steps) {
        step.disabled =
          step.dataset.zoomStep === '-1' ? index === 0 : index === zoomLinks.length - 1;
      }
    }

    nav.hidden = zoomLinks.length < 2;

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
        // The furniture cannot be measured until the dialog is in the top
        // layer and laid out, so the open path measures again here.
        capToFurniture();
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

    // Every path measures once BEFORE the bytes arrive, off the intrinsic
    // width and height, which is close but not exact: the decoded box can land
    // a fraction off what the attributes implied, and a fraction over budget
    // is a scrollbar on a lightbox. Measuring again on load is what makes the
    // reservation right rather than nearly right.
    image.addEventListener('load', () => {
      if (dialog.open) capToFurniture();
    });

    // The reservation is a pixel value against a viewport-relative budget, so
    // it stops being right the moment the viewport changes — a phone rotating
    // is the case that matters.
    window.addEventListener('resize', () => {
      if (dialog.open) capToFurniture();
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

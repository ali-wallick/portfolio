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

    /** Fill the dialog from one link, without opening or closing it. */
    function show(next: number): void {
      if (!image || !caption || !count) return;
      index = Math.min(Math.max(next, 0), zoomLinks.length - 1);
      const link = zoomLinks[index];
      const source = link.querySelector('img');

      image.src = link.href;
      // The alt is the picture's meaning and does not change with its size. The
      // visually-hidden "view full size" hint is the LINK's, not the image's,
      // so it is deliberately not carried across.
      image.alt = source?.alt ?? '';

      const text = link.dataset.caption ?? '';
      caption.textContent = text;
      caption.hidden = text === '';

      count.textContent = `${index + 1} of ${zoomLinks.length}`;
      for (const step of steps) {
        step.disabled =
          step.dataset.zoomStep === '-1' ? index === 0 : index === zoomLinks.length - 1;
      }
    }

    nav.hidden = zoomLinks.length < 2;

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

    close.addEventListener('click', () => dialog.close());

    // Click-outside. The backdrop is not a child, so a click on it targets the
    // dialog itself — anything inside stops at its own element first.
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });

    // Drop the source once it is off screen, so a large photo is not held in
    // memory for the rest of the visit.
    dialog.addEventListener('close', () => {
      image.removeAttribute('src');

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
      zoomLinks[index]?.focus({ preventScroll: true });
    });
  }
}

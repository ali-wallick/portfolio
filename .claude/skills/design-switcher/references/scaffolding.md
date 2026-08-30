# The scaffolding, in working shapes

Recovered from #239's instrument (`src/pages/design/resume-actions.astro`,
`src/components/ResumeActionsPanel.astro`, `src/scripts/actions-lab.ts`,
`src/styles/resume-actions-lab.css`), with the parts that were specific to the resume replaced by
the general shape. Copy what applies, delete the rest, and delete all of it when the pass settles.

`git show 557a653` on the `pr/239` ref has the originals in full if you want them —
`git fetch origin 'refs/pull/239/head:refs/remotes/pr/239'`.

Two variants, and which one you need is decided by whether the axis is sitewide:

- **A page-scoped axis** (a control, a component, a layout) gets its own `noindex` route. Four new
  files, nothing existing edited. Prefer this — the teardown is `git rm` and the byte-identity check
  is trivially clean.
- **A sitewide axis** (motion tokens, type, colour) has no route to make, because the thing being
  judged is every page. The panel goes inline in `BaseLayout.astro`, gated on `showDrafts`, as
  **string constants** — never as a component import. See "The sitewide variant" at the bottom.

Every file carries a `SCAFFOLDING — not shipped` header. It is not decoration: the diff is the thing
Ali skims to check the comparison is fair, and the header is what tells a reader which half is which.

---

## 1. The route

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
import Subject from '~/components/Subject.astro';
import SubjectLab from '~/components/SubjectLab.astro';
import SwitcherPanel from '~/components/SwitcherPanel.astro';
import '~/styles/subject-lab.css';

/**
 * SCAFFOLDING — not shipped. Deleted before this branch merges.
 *
 * `/subject` with the thing under review replaced by N live candidates and a
 * switcher, so the comparison happens on one page against the real content
 * rather than across N branches. `noindex`, and it is not in
 * `src/pages/sitemap.xml.ts`'s hand-written route list, so nothing crawls it.
 *
 * It renders the real page below the candidates on purpose: the question is
 * how each one reads in situ, not how it looks in isolation.
 *
 * Nothing on this route is a `byteHashedFiles` input, so `npm run check:pdf`
 * and `npm run check:resume-print` still measure the shipped pages untouched.
 */
---

<BaseLayout title="Subject — candidates" description="Scaffolding: candidate treatments." noindex>
  <SubjectLab />
  <Subject />
  <SwitcherPanel />
  <script>
    import '~/scripts/subject-lab';
  </script>
</BaseLayout>
```

`<script>import '...';</script>` on one line is the shape that survives `prettier-plugin-astro`.
Anything with a braced body of its own, nested inside a `{cond && (…)}` expression, does not.

**Add the route to `src/pages/sitemap.xml.ts`? No.** It is a hand-written list; leaving it out is
what keeps the instrument uncrawled, and `noindex` is the belt to that braces.

---

## 2. The panel

Radios, not buttons: a single-choice axis is exactly what a radio group is, and it gives keyboard
arrow-key comparison for free — which matters when the whole point is flipping between options
quickly.

```astro
---
/**
 * SCAFFOLDING — not shipped. Deleted before this branch merges.
 *
 * Two axes. Everything settled comes straight off — a switcher that still
 * offers a decided question is a switcher nobody trusts the rest of.
 */

const weights = [
  { key: 'w1', label: 'Outline' },
  { key: 'w2', label: 'Filled' },
];

/* `--text-sm` is the site's control size — .nav-link, .button, .backlink, the
   footer. Stepping off it is a deliberate deviation, which is why it is an
   axis rather than a silent bump. */
const sizes = [
  { key: 'f1', label: '--text-sm (site control size)' },
  { key: 'f2', label: '--text-base' },
];
---

<aside class="lab-panel" aria-label="Subject switcher">
  {
    /* Collapsible because it is fixed: on a phone an always-open panel covers
      the thing it is there to compare. */
  }
  <details open>
    <summary>Compare</summary>
    <fieldset>
      <legend>Weight</legend>
      <div class="lab-panel-opts">
        {
          weights.map((w, i) => (
            <label>
              <input type="radio" name="lab-weight" value={w.key} checked={i === 0} />
              <span>
                <code>{w.key.toUpperCase()}</code> {w.label}
              </span>
            </label>
          ))
        }
      </div>
    </fieldset>
    {/* …one fieldset per axis… */}
    <p class="lab-panel-current">Showing <code>W1 + F1</code></p>
  </details>
</aside>
```

`.lab-panel-current` is load-bearing, not a nicety: it lets a reaction name a combination
("W2 + F1 is the one") without describing it, which is most of what makes the loop fast over chat.

---

## 3. The stylesheet

Its own file, imported only by the lab route. **Never** `base.css`, `tokens.css` or `resume.css` —
those are `byteHashedFiles` inputs, and editing one makes every commit in the comparison regenerate
`public/*.pdf` and `scripts/resume-pdf.lock.json` for a comparison that never reaches paper.

Tokens only, no raw colours, no raw `px` font sizes. The standing rule applies to scaffolding too,
because a candidate styled outside the system gets judged on the wrong thing.

```css
@media print {
  .subject-lab,
  .lab-panel {
    display: none;
  }
}

/* Fixed, corner-anchored, and CAPPED in both dimensions. With four axes on it
   #239's panel grew to 26 radios and, anchored only at the bottom, reached the
   top of the viewport — covering the top-right corner, which is exactly where
   the candidate's right-hand element was. Found by a click that could not
   land. The cap is what stops a switcher growing over what it compares. */
.lab-panel {
  position: fixed;
  right: var(--space-4);
  bottom: var(--space-4);
  z-index: 50;
  max-width: min(24rem, calc(100vw - var(--space-8)));
  max-height: calc(100vh - var(--space-8));
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-rest);
  font-size: var(--text-sm);
}

.lab-panel summary {
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin: 0;
}

.lab-panel details[open] summary {
  margin-bottom: var(--space-2);
}

.lab-panel fieldset {
  border: 0;
  padding: 0;
  margin: 0 0 var(--space-3);
}

.lab-panel legend {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-muted);
  padding: 0;
  margin-bottom: var(--space-1);
}

/* The options live in their own wrapper rather than being gridded on the
   `<fieldset>`, because a `<legend>` inside a grid or flex fieldset is
   rendered specially and lays out unpredictably across engines. */
.lab-panel-opts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 var(--space-3);
}

.lab-panel label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 2px 0;
  cursor: pointer;
}

.lab-panel-current {
  margin: 0;
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}
```

The candidate overrides key off `data-*` on a single lab root — `.subject-lab[data-weight='w2']
.thing { … }` — so a settled axis is deleted by removing its attribute selectors, not by hunting
through the file for the winner.

---

## 4. The wiring script

`src/scripts/subject-lab.ts`. Three jobs, kept apart because they are three questions: swap the
candidates, keep the thing **live**, and drive the panel.

```ts
/**
 * SCAFFOLDING — not shipped. Deleted before this branch merges.
 *
 * The behaviour half is deliberately the same contract as
 * `src/scripts/subject.ts` rather than an import of it: that file is in
 * `scripts/build-pdf.mjs`'s byteHashedFiles list, so reusing it would mean
 * editing it, which would mean regenerating the committed PDFs for a
 * comparison that never reaches paper.
 */

const lab = document.querySelector<HTMLElement>('.subject-lab');

if (lab) {
  const store = {
    read: (key: string, fallback: string) => {
      try {
        return localStorage.getItem(`subject-lab-${key}`) ?? fallback;
      } catch {
        return fallback;
      }
    },
    write: (key: string, value: string) => {
      try {
        localStorage.setItem(`subject-lab-${key}`, value);
      } catch {
        /* Private mode. The panel still works for this page view. */
      }
    },
  };

  const current = document.querySelector<HTMLElement>('.lab-panel-current code');
  const report = () => {
    if (current)
      current.textContent = [lab.dataset.weight, lab.dataset.size]
        .map((k) => k?.toUpperCase())
        .join(' + ');
  };

  /**
   * Options are authoritative; storage is a cache. Narrowing an option set
   * strands whoever already picked a removed value — the group renders with
   * nothing checked while the old value stays in effect, so the instrument
   * quietly reports the wrong thing. A stored value matching no option snaps
   * to the first and writes that through. What is checked is always what is
   * running.
   */
  const bind = (axis: string, fallback: string) => {
    const inputs = document.querySelectorAll<HTMLInputElement>(`input[name="lab-${axis}"]`);
    const apply = (key: string) => {
      lab.dataset[axis] = key;
      store.write(axis, key);
      report();
    };
    for (const input of inputs) input.addEventListener('change', () => apply(input.value));

    const stored = store.read(axis, fallback);
    const match = document.querySelector<HTMLInputElement>(
      `input[name="lab-${axis}"][value="${stored}"]`,
    );
    if (match) match.checked = true;
    apply(match ? stored : fallback);
  };

  bind('weight', 'w1');
  bind('size', 'f1');

  /**
   * Catching the reticle at the panel's edge beats teaching the reticle about
   * the panel. `FOCUS_SELECTOR` in reticle.ts matches `input` and `summary`,
   * so without this every click on a radio parks the brackets on the
   * instrument — while comparing the exact thing the instrument exists to
   * compare. Capture-phase, at the panel's own root: `reticle.ts` stays
   * byte-identical to main, and the brackets HOLD their last target instead of
   * being cleared, which is the right behaviour rather than the absence of the
   * wrong one.
   */
  const panel = document.querySelector<HTMLElement>('.lab-panel');
  for (const type of ['pointerover', 'focusin']) {
    panel?.addEventListener(type, (event) => event.stopPropagation(), true);
  }
}

/* Makes this a module rather than a global script, so its top-level names
   don't collide with the shipped script's under `astro check`. */
export {};
```

---

## 5. The sitewide variant

When the axis is a token every page reads, there is no route. Three extra constraints:

**No new imports in `BaseLayout.astro`.** One component import reorders Astro's CSS bundles and
takes `resume.css`'s print block out of the cascade, which silently turns a 1-page resume into 2
(#62). The panel markup, its CSS and its bootstrap are template-literal **strings** in the
frontmatter, injected with `<Fragment set:html={...} />`. That also sidesteps the
`prettier-plugin-astro` parse failure entirely, because prettier never tries to read a JSX attribute
expression as JS-in-JSX.

**The bootstrap runs inline in `<head>`, before first paint.** `--duration` and `--ease` are read by
every transition on the page; applying them after first paint means the first hover of every
navigation runs at the wrong speed, which is the exact thing being judged.

**Gate on `showDrafts` at the markup _and_ the script.** A module imported from the bundled
`<script>` ships to all 24 production pages whether or not the markup renders. Verify by building
both ways and grepping:

```bash
WORKERS_CI_BRANCH=main npm run build:ci && grep -rc 'lab-panel' dist/ | grep -v ':0' || echo clean
WORKERS_CI_BRANCH=my-branch npm run build:ci && grep -c 'lab-panel' dist/about.html
```

**Generated candidate assets go to a gitignored `public/` subdirectory, and the prune deletes the
_output_, not the source.** `verify` runs `build`, and `astro dev` serves `public/` from disk per
request — so a production build that deletes `public/preview-fonts/` silently pulls the candidates
out from under the dev server running the comparison. Pruning `dist/preview-fonts/` leaves the
running preview alone and still makes the leak impossible.

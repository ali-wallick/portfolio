---
name: pre-launch-check
description: Run the full pre-merge or pre-launch sweep on aliwallick.com — build, links, markup, accessibility, stale-content grep, and the old-URL redirect map. Use before merging a branch to master, before a DNS cutover, when the user asks "is this ready to ship", "check the site before I merge", or wants a launch readiness review.
---

# Pre-launch check

A sweep, not a single command. Work through every section and **report what actually happened** —
including anything skipped and why. A check that silently didn't run is worse than no check.

## 1. The automated gate

```bash
npm run verify
```

That is `format:check` → `astro check` → `build` → `links`, exactly what CI runs. If it fails, stop
and fix; nothing below matters until it passes.

Note that `npm run build` is the **production** build, so drafts are excluded. Also run the preview
build, since that's what the reviewer will actually be looking at:

```bash
SHOW_DRAFTS=true npm run build && npm run links
```

## 2. Nothing stale or untrue

The old site's defining failure was staying wrong for seven years. Grep the built output, not the
source — this is about what ships.

```bash
grep -rniE 'upcoming|currently work|lorem ipsum|TODO|FIXME|coming soon' dist/ || echo 'clean'
```

Anything implying the Marvel game is upcoming is a bug — **Marvel Snap shipped in October 2022.**

`unannounced` is deliberately not in the pattern, but the reason changed at the Phase 3 gate: the
old rule was that "an unannounced mobile title in Godot" was the settled phrasing. It isn't any more
— Second Dinner went public about the Godot project on 2024-08-07, and the site now says so and
cites the announcement. So `unannounced` should be **rare**. If it appears, read the sentence rather
than waving it through.

### Source-level markers the `dist/` grep cannot see

The grep above reads built output, which is right for stale _content_ — but YAML front-matter
comments never reach `dist/`, so deferred-decision markers are invisible to it. Check the source
directly:

```bash
grep -rn 'TODO(phase-3-revisit)' src/ || echo 'no deferred decisions outstanding'
```

These are decisions parked on purpose so Ali could react to them rendered in context rather than in
the abstract — placeholder `role` values, borderline links. Each one is a real question awaiting an
answer, not a note. **Phase 3 cannot close with any outstanding.** The same pattern works for any
future `TODO(phase-N-revisit)`; the point is that "decide this later" needs a mechanical way to
come back, or later never arrives.

Then check for drafts that leaked into production. Note the quotes — they match the rendered
`class="draft-flag"` attribute and not the `.draft-flag{` rule in the inlined stylesheet, which is
on every page regardless:

```bash
grep -rl '"draft-flag"' dist/ || echo 'no drafts in build'
```

## 3. Content is true

Read the site top to bottom against `src/content/jobs/`, the resume page, and LinkedIn. Every claim
true as of today. Specifically confirm:

- Second Dinner dates and title are current.
- No page implies a job that ended is ongoing.
- Project years match the project bodies (Critter³ is **2011**, not 2013).
- Links marked `dead: true` are the ones that are actually dead, and no live link 404s.

## 4. Accessibility and markup

`npm run links` already enforces the floor: every page has a `<title>`, a viewport meta, and `lang`;
every `<img>` has alt text; no `http://` subresources; no broken internal links.

Beyond that, by hand:

- Tab through a page. Focus is visible everywhere, the skip link works, tab order is sensible.
- Headings descend without skipping levels.
- Alt text describes the image, not the filename.
- Run Lighthouse (CI does this too, thresholds in `lighthouserc.json`: performance ≥ 0.95,
  accessibility = 1.0).

## 5. The review loop — do not skip this

Push the branch and open the **Cloudflare preview URL on a real phone.**

The old site's core failure was never being looked at on a phone: no viewport meta, `display: table`
layout, rendered zoomed out on every handset for a decade. Desktop review alone would not have
caught it, and will not catch its successor.

Check both desktop and phone. Check dark mode.

## 6. Launch-only (Phase 6 — skip for an ordinary merge)

- **Outbound links still resolve.** `npm run links:external` — deliberately outside `npm run verify`
  (see CLAUDE.md), so nothing runs it for you. It buckets results three ways: a host that answers 403
  or 999 to a script is **unverifiable**, not dead, and only genuinely-gone links fail the run.
  **Open the unverifiable ones in a browser** — the list that matters is short and named in
  [#204](https://github.com/ali-wallick/Portfolio/issues/204). Two of them cannot be checked by
  status code at all: a deleted YouTube video still returns 200 on `/embed/` (the script resolves
  those through oEmbed instead), and a Wayback snapshot URL keeps resolving while its _replay_ can
  fail, which is how the Vegas Blvd App Store capture was caught hanging on an interstitial.
- **Redirects.** Every old URL resolves or redirects. The old `.htaccess` served extensionless paths
  (`/about`, `/projects/critter`), and `/blog/*` needs somewhere to land. Crawl the old URL list in
  `snapshot/` against the new site.
- **OG previews.** Paste a link into Slack, Discord, and iMessage and confirm the card renders. The
  old tags were `http://`, so previews broke everywhere.
- **Favicon, `robots.txt`, sitemap** all present.
- **Analytics** — Cloudflare Web Analytics, no cookie banner needed.
- **Email still delivers**, before and after any DNS change. Phase 1 is closed and this repo does not
  touch DNS, but a cutover is the one moment to re-verify.

## Report

Give the user a short list: what passed, what failed, what you skipped and why. Do not report "ready
to ship" unless every section above actually ran.

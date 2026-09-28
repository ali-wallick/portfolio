---
name: pre-merge-check
description: Run the pre-merge sweep on aliwallick.com — build, links, markup, accessibility and a stale-content grep — and the short after-release checks. Use before merging a branch to main, when the user asks "is this ready to ship", "check the site before I merge", or wants a review of what a branch changed. The DNS cutover itself is done and its record is docs/LAUNCH.md; this is the routine half.
---

# Pre-merge check

A sweep, not a single command. Work through every section and **report what actually happened** —
including anything skipped and why. A check that silently didn't run is worse than no check.

## 1. The automated gate

```bash
npm run verify
```

That is `format:check` → `astro check` (`check`) → `check:source` → `build` → `check:pdf` →
`check:resume-print` → `check:linkedin` → `links` → `check:lines`, exactly the nine steps
`.github/workflows/ci.yml` runs. If it fails, stop and fix; nothing below matters until it
passes.

**Read `docs/decisions/tooling.md` for why a check exists**, and before adding one. Its #338
section is the test a new guard has to pass: measure the naive form against the content it would
run on first. Three guards shipped narrower than proposed because measuring found them red on
correct pages, and #107 declined four candidates outright on the same grounds. A sweep step here
that could survive that test belongs in `verify` instead of in this file.

`.claude/hooks/format-on-write.sh` runs Prettier on every file a session writes, so a
`format:check` failure in a session-only branch usually means a file that was written some other
way.

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
comments never reach `dist/`, so deferred-decision markers are invisible to it.

**`npm run check:source` covers this now** (#338): a `TODO(` that cites no issue number fails the
build, so the manual sweep this section used to carry is gone. What is still worth a human eye is
the half a guard cannot judge — **a marker whose issue is already closed** is stale and should have
gone with the change that closed it. `grep -rn 'TODO(' src/` lists them; check each number against
its issue.

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
  accessibility = 1.0). `lighthouserc.json` holds project pages to best-practices 0.90 (a
  YouTube-iframe cookie audit, third party) and everything else to 0.95; SEO is warn-only at 0.9.

## 5. The review loop — do not skip this

Push the branch and open the **Cloudflare preview URL on a real phone.**

The old site's core failure was never being looked at on a phone: no viewport meta, `display: table`
layout, rendered zoomed out on every handset for a decade. Desktop review alone would not have
caught it, and will not catch its successor.

Check both desktop and phone. Check dark mode.

## 6. After a release (skip for an ordinary merge)

Everything else that used to live here — the redirects crawl, OG previews, mail, DNS, the `dig`
warning — was the cutover itself, done 2026-08-27, and its record is `docs/LAUNCH.md`. What's left
is three quick checks worth repeating after a production release.

- **Outbound links still resolve.** `npm run links:external` — deliberately outside `npm run verify`
  (see CLAUDE.md), so nothing runs it for you. It buckets results three ways: a host that answers 403
  or 999 to a script is **unverifiable**, not dead, and only genuinely-gone links fail the run.
  **Open the unverifiable ones in a browser** — the list that matters is short and named in
  [#204](https://github.com/ali-wallick/portfolio/issues/204). Two of them cannot be checked by
  status code at all: a deleted YouTube video still returns 200 on `/embed/` (the script resolves
  those through oEmbed instead), and a Wayback snapshot URL keeps resolving while its _replay_ can
  fail, which is how the Vegas Blvd App Store capture was caught hanging on an interstitial.
- **`www` still 301s to the apex, preserving path _and_ query.** It is a zone-level Single Redirect
  rule, not `public/_redirects` (which matches paths, not hosts), so nothing in this repo will catch
  it breaking.

  ```bash
  curl -sI "https://www.aliwallick.com/projects/firefall?a=1" | grep -iE '^HTTP|^location'
  ```

- **Favicon, `robots.txt`, sitemap** all present. Note that the _served_ `robots.txt` is not the
  generated one — Cloudflare injects a Managed block ahead of it
  ([#215](https://github.com/ali-wallick/portfolio/issues/215)). Check that `Allow: /` and the
  `Sitemap:` line survive; don't be alarmed by the crawler `Disallow`s above them.

## Report

Give the user a short list: what passed, what failed, what you skipped and why. Do not report "ready
to ship" unless every section above actually ran.

# Site snapshot

A full crawl of the rendered HTML output of `https://www.aliwallick.com`, captured 2026-08-15 as part of Phase 0 (Preserve) of the portfolio rebuild. This preserves what the old hand-built PHP site actually looked like to a visitor, so the presentation survives after DreamHost is retired and the Astro rebuild replaces this repo's PHP.

This is rendered output (PHP already processed by the live server), not source — the source is the rest of this repository. Fetched read-only via `curl`; nothing on the live host was modified.

## Layout

- `index.html`, `about.html`, `resume.html`, `contact.html` — top-level pages.
- `projects/index.html` — project listing, plus one file per project page using the same (mixed-case) URL the live site actually links to. These match the *live* casing, not necessarily every filename committed in this repo — see the Phase 0 asset/repo notes about duplicate-cased project files.
- `blog/index.html` and `blog/offset-{5,10,15}.html` — the four pages of the WordPress blog's custom pagination (`?offset=N`). The blog content itself was separately converted to Markdown in [`content/archive/`](../content/archive/); these HTML pages are the visual/structural record.
- `misc/` — other publicly-reachable stray files noted during the audit: `todo.txt`, `palette.html`, `colors.css` (all still live at time of capture), `robots.txt`, and `wp-login.html` (the public WordPress login page).

## Not included

Images, CSS, and JS are not duplicated here — they're already committed under `resources/` in this repo (for the static site) or covered by the blog image check in the Phase 0 asset inventory (for WordPress-hosted images). This snapshot only captures the rendered page markup.

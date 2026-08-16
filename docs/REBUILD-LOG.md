# Rebuild log

Running notes on rebuilding aliwallick.com with agentic workflows — what was tried, what worked,
what didn't, and what it cost. **Phase 7 turns this into a build-in-public page.** Keeping notes as
we go is much cheaper than reconstructing them at the end, and the details that make this
interesting are exactly the ones that evaporate a week later.

Append as you go. Newest phase last.

---

## Phase 2 — Foundation & agentic tooling

_2026-08-16. Opus 5, one session, start to finish._

### What got built

An Astro static site replacing 178 files of PHP, a content model, CI, and the agentic layer:
`CLAUDE.md`, three skills, a permission allowlist, and two hooks.

### Judgment calls worth remembering

**Node wasn't installed at all.** Not on the machine, not via nvm, not via Homebrew. Astro can't
scaffold without it, and there is no alternative that satisfies "scaffold Astro". Installed
Node 26 via Homebrew and pinned CI and Cloudflare to Node 22 with `.nvmrc`. Worth noting because it
is the kind of prerequisite that is invisible until it blocks everything.

**Seeding 17 project entries with metadata but no prose.** The tempting reading of "no content
rewriting until Phase 3" is to ship zero content. But a content model that has never held real data
is a guess. Seeding every project's _metadata_ — years, engines, roles, links, video IDs, team
credits, all extracted from the old pages — tested the schema against every awkward real shape:
a four-year job-project, a 48-hour jam entry, a bare-metal Atari game with no engine, a project
whose only surviving link is dead, a page that is literally one image and nothing else (KinoClue).
Several schema decisions changed because of what those entries turned up. Phase 3 is now pure
writing.

**The 2019 resume forced a schema change.** The original `jobs` schema required `YYYY-MM`. The
resume records employment as bare years, and that is genuinely all we know for the older roles —
so the requirement would have been satisfied by inventing months. Changed to accept `YYYY` _or_
`YYYY-MM`. Recording the precision you actually have is the whole point of a single source of
truth; a schema that forces false precision is worse than a loose one.

**Reading the resume PNG instead of the PDF.** The PDF uses subset fonts with custom encodings, so
text extraction returned glyph indices. `resources/images/resume.png` is the same document as an
image and reads perfectly. Two minutes of trying to be clever versus ten seconds of looking at the
picture.

**Making bugs unrepresentable rather than fixing them.** The most useful thing to come out of the
content-model design. Instead of "remember to use https for YouTube", store a bare video ID and let
the component build the URL. Instead of "remember alt text", make the schema require it. Instead of
"remember to check whether these links still work", make `dead: true` a field. Each one converts a
recurring discipline problem into a thing that cannot happen.

**A hand-written link checker beat a library.** Every rule in `scripts/check-links.mjs` is a
regression guard for something the old site actually got wrong — broken internal links, `http://`
subresources, missing alt text, missing viewport meta. A generic checker would have covered the
first and none of the rest. Zero dependencies, runs offline, ~120 lines. Negative-tested by
injecting faults into `dist/` and confirming all seven rules fire.

**The `pre-launch-check` skill found three things on its first run — two of them bugs in itself.**
Worth recording, because it is the clearest evidence that writing a skill is not the same as having
a working one.

1. **A real leak.** `<!-- TODO(phase-6): favicon, OG image… -->` in `BaseLayout.astro` was being
   emitted into all 23 pages. In `.astro` files `<!-- -->` ships to output and `{/* */}` does not —
   easy to forget, invisible until something looks. Fixed, then converted into a permanent checker
   rule so it cannot recur.
2. **A false positive.** The skill grepped `dist/` for `draft-flag` to catch drafts leaking into
   production. It matched all six production pages — because `.draft-flag{…}` is a CSS rule in the
   inlined stylesheet, present whether or not any draft badge renders. Fixed to grep the quoted
   `"draft-flag"` class attribute.
3. **A grep that didn't run.** The context-capturing pattern (`.{0,40}…`) exceeded macOS ugrep's
   complexity limit and errored out — while still printing "clean" from the `||` fallback, which is
   the worst possible failure mode for a check. Simplified.

The new HTML-comment rule then failed all 15 draft project pages, since their `TODO(phase-3)` notes
are Markdown HTML comments. Rather than delete the notes or drop the rule, drafts became exempt:
draft pages emit `<meta name="robots" content="noindex">`, and the checker skips the comment rule on
those. Working notes are the point of a draft and the exemption vanishes the instant the page is
published — the same discipline the schema already uses for `summary`/`role`/`hero`. Negative-tested
by flipping an entry to `draft: false` and confirming the rule fires.

**CI's first real run failed on Lighthouse, and the check was wrong rather than the site.** The
Lighthouse job had been pointed at a drafts-visible build so project pages would be non-empty to
measure. Firefall came back with SEO 0.54 and best-practices 0.93 — the first because draft pages
emit `robots: noindex`, which Lighthouse's SEO category correctly and heavily penalizes, and the
second because it is the one page carrying a YouTube iframe.

Neither number says anything about the site that will actually be published. The fix was to gate the
**production** build, matching the `build` job, rather than to lower a threshold until it went
green. Tuning a threshold to pass is how a check quietly stops meaning anything. The tradeoff — the
project-page template goes unmeasured until Phase 3 publishes one — is recorded as a `TODO(phase-3)`
in the workflow, along with the expectation that a third-party embed will cost best-practices points
when it comes back.

**Getting the numbers out of CI took three tries, and each failure was in the instrumentation.**
The Lighthouse artifact uploaded successfully while containing nothing, twice — because
`actions/upload-artifact@v4` defaults to `include-hidden-files: false`, and LHCI's default output
directory is the hidden `.lighthouseci/`. Moving to a non-hidden `lighthouse-report/` fixed it: 31
files. Then the summary script printed "nothing to summarise" next to those 31 files, because LHCI's
`collect` stage writes `lhr-<timestamp>.json` while its `filesystem` upload target writes
`<host>-<path>-<timestamp>.report.json`, and the script matched only the first. Now it matches on
content rather than filename.

Worth the persistence: the first readable run immediately explained both remaining gaps. `public/`
is empty, so every page 404s on `/favicon.ico` and logs a browser error — that single missing file
is the entire reason best-practices sits at 0.96 rather than 1.00 site-wide. And the homepage had no
meta description, the one page most likely to show up in a search result or a link preview. Neither
was failing its threshold, so neither would ever have surfaced on its own.

The general lesson: **a check you cannot read is not a check.** Two of the three problems in this
phase's CI were in the reporting path, not the thing being reported on, and both failed silently in
the "looks green" direction.

**The deploy landed on Workers, not Pages, and the decision got made at the dashboard.** Cloudflare
routes new Git-connected projects into the Workers flow now — Pages is frozen for new features. This
reversed a settled plan decision, so it is recorded in `CLAUDE.md` with the reasoning rather than
left as a surprise.

It turned out to be a small upgrade. Pages would have put the drafts-on-preview rule in a dashboard
environment variable: invisible from a checkout, and silently wrong if set on the wrong environment.
Workers Builds injects `WORKERS_CI_BRANCH`, so `scripts/build-ci.mjs` makes the call in committed
code that behaves the same locally. Workers also supports `_redirects` natively, which Phase 6 needs.

Two failures on the way, both worth keeping:

1. **First production build failed with `ENOENT: package.json`.** Not a misconfiguration — the
   production trigger builds `master`, and `master` is still the old PHP site. Every trigger setting
   was correct. Production goes green on the merge commit.
2. **Preview URL served Cloudflare's "There is nothing here yet" placeholder** even though the build
   succeeded, 24 files uploaded, and the branch alias existed on the version. The Worker's own
   `subdomain` settings had `previews_enabled: false`. `preview_urls: true` in `wrangler.jsonc` only
   applies on a successful `wrangler deploy` — which, per failure 1, had never happened. So the repo
   config was correct and simply could not take effect yet. Fixed via the API, and the production
   `workers.dev` URL was deliberately left disabled: nothing should serve this site at a stable
   public address until Phase 6.

The second one is the more interesting failure. Everything upstream was green — build succeeded,
assets uploaded, alias created — and the symptom appeared at the only layer nothing had asserted on.
Reading the actual `subdomain` object took one API call; guessing from the placeholder page could
have gone on for a while.

### Subagents: used zero, and that was right

The brief flagged "surveying what's left in the old PHP" as a fan-out candidate. It wasn't. The
whole surface was 23 PHP files totalling ~36 KB — one `cat` loop read all of it in a single tool
call. A subagent would have started cold, re-read the same files, and returned a summary less useful
than the raw text, because the _specific wording_ of the old pages is source material for Phase 3.

The honest rule this suggests: **fan-out pays when the answer is much smaller than the material, and
loses when you need the material itself.** Summarizing 200 files to find three: worth it. Reading 23
small files whose contents you want verbatim: not.

Also skipped `skill-creator` for scaffolding the three skills. The `SKILL.md` format is frontmatter
plus prose — checking one existing skill for convention fidelity cost one tool call, where loading
the scaffolding skill would have pulled in a lot of context to produce a file shape already in hand.
Used `fewer-permission-prompts` though, because deriving an allowlist from actual transcript usage
is genuinely better than guessing, and it produced entries a guess would have missed.

### Cost notes

One session, Opus 5 throughout. The plan earmarked Opus for the content model and `CLAUDE.md` and
suggested downshifting to Sonnet for mechanical follow-through. In practice the phase didn't split
cleanly — schema design and page-writing interleaved, and the schema kept changing in response to
what the seeded entries revealed. A mid-phase model handoff would have meant either re-explaining
the model or handing over an unfinished one.

For Phase 3 the split is much cleaner: the gate conversation and the Marvel Snap framing want
judgment; writing 12 archive one-liners from existing source material does not.

### Loose ends handed to the check-in

- Cloudflare Pages project not yet created — the first GitHub App install has no API.
- `projects/downloads/nightLight.unity3d` (6.3 MB) still in the repo, pending the asset keep/drop
  decision from Phase 0.
- Job start/end months are year-precision and flagged `TODO(phase-4)` where LinkedIn could sharpen
  them.

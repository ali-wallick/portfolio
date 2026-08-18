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

**Merging the PR then reproduced a variant of the exact same class of bug, from the opposite
direction.** The production build going green for the first time (`master` finally had a
`package.json`) ran an actual `wrangler deploy`, and that silently flipped the subdomain's `enabled`
flag back to `true` — undoing the API fix from twenty minutes earlier and making the production
`workers.dev` URL briefly publicly reachable, which is exactly the thing that was supposed to stay
off until Phase 6. Caught immediately by checking the `subdomain` object again rather than assuming
the earlier fix was durable, and confirmed via wrangler's own build log, which names the cause
verbatim: `workers_dev` defaults to `true` on every deploy unless the config says otherwise.

Fixed for real this time by putting `"workers_dev": false` in `wrangler.jsonc` — in the repo, not in
dashboard state — so it can't be silently undone by the next deploy the way an API call or a
dashboard toggle can. The general lesson repeats: dashboard/API state that isn't also asserted in a
committed file is not a fix, it's a fact that happens to be true right now. Two occurrences of that
exact shape in one deploy sequence is enough to call it a pattern worth watching for going forward,
not a one-off.

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

---

## Phase 3 gate — conversation, 2026-08-16

Held as a conversation rather than an execution brief, per the plan's own design. It was worth it:
the gate produced five factual corrections to things the repo already "knew", and four of them would
have shipped as confident, wrong prose if the phase had started cold.

### The gate's actual value was correcting settled facts, not answering its own questions

The three questions on the agenda (Marvel Snap framing, 2019–2022 describability, media inventory)
all resolved without much difficulty. What made the gate pay for itself was the incidental
verification around them:

- The job title in the repo (`Engineer`) and on the old site (`Client Engineer`) were both wrong.
  Marvel Snap's official credits page says **Senior Software Engineer I** — and, better, it's a
  public page that can be _linked_ instead of asserted.
- The plan's claim that the old site calls the Marvel game "upcoming" in four places was wrong; it
  says it once. The thing repeating four times is a stale-in-context sidebar. A stale-content grep
  written against the plan's description would have hunted the wrong string.
- The settled phrase "an unannounced mobile title in Godot" was **more restrictive than reality and
  factually wrong** — Second Dinner went public on 7 August 2024 about building a Godot game, and
  never said mobile. A settled decision had quietly gone stale between phases.
- It Fits I Sits was overclaimed in its own seed metadata (`status: shipped`, a platform Ali never
  shipped on). She built the jam prototype only. The honest version is a better story.
- KinoClue, dismissed in a Phase 2 TODO as "a single image and nothing else... or an honest decision
  to drop it", is undergraduate research. The single image is a research poster containing the full
  project description, author list included.

**The pattern:** every one of these came from looking at a primary source — the credits page, the
press release, the poster image, the person — rather than from the repo's own accumulated notes. A
standing brief is a cache, and caches go stale. The gate's real function is cache invalidation.

### Reading a poster instead of asking for it

The Phase 2 TODO on KinoClue said the page needed "the most sourcing of anything in the archive
tier." The sourcing was a `Read` on a PNG that had been in the repo since 2011. Multimodal reads
make image assets searchable content rather than opaque blobs, and the asset inventory — which
catalogued that file by name and size — had no way to know it contained four paragraphs of text.
Worth a habit: when a content gap points at an image, look at the image.

### WebFetch loses to a real browser on client-rendered pages

Pulling the YouTube playlist failed twice through `WebFetch` — YouTube renders client-side, so the
fetch returned the page shell and footer links, and the summarising model correctly reported it had
nothing. The browser pane loaded the same URL fine.

The efficient move wasn't scraping the rendered DOM either. One `fetch` loop against YouTube's
**oEmbed endpoint**, run from the page's own origin, returned exact titles and channel names for all
five videos in a single call — where scraping anchor elements had produced truncated
`aria-label` strings with durations glued on. **Prefer a data endpoint over the DOM, even when you
already have the DOM.**

### Cost notes

Opus 5, one session, ~20 tool calls. The gate deliberately ran on the expensive model and stayed
short — the plan's bet was that judgment-per-token is what this kind of session buys, and the five
corrections above are the return on it. Execution downshifts to Sonnet 5 in a fresh session, which
is the cleanest phase boundary in the project so far: the framing is written down in `CLAUDE.md`, so
the handoff carries no scrollback.

Zero subagents again. Nothing here fanned out — the research was five sequential lookups, each of
which informed what to look up next.

## Phase 3 — Content: get it true, 2026-08-16

Executed on branch `phase-3-content`, same day as the gate, in one session working straight down the
gate's execution brief. Sonnet 5, no subagents — the same reasoning as Phase 2 applies harder here:
the work is mostly close reading (old page HTML, blog posts, one image) and writing from it, and a
subagent summarizing a source would have thrown away exactly the specific phrasing worth keeping.

### The image-as-source habit paid off again, immediately

The KinoClue poster read at the gate wasn't a one-off. Building this phase's write-ups meant checking
every outbound link before shipping it, not just reading the old page copy, and two things turned up
that a text-only pass would have missed: Vegas Blvd Slots' iOS and Android store links both now
404 — `curl` against the old iTunes URL redirects to `apps.apple.com` and then 404s, so the game
appears to have been delisted since 2019 — and Rose Peng's old portfolio domain (`daportfolio.com`,
linked from Mini Mages) turned out to silently redirect to a generic DeviantArt page rather than
404, which would have shipped as a working-looking credit link to nothing. Both are marked `dead:
true` now rather than left as live-looking links. On the other side of the same coin, checking rather
than assuming also turned up a genuinely live replacement: Prodigal's old MySpace link for its
composer was long dead, but Sabrepulse turned out to have an active Bandcamp — a five-second search
that turned a "drop the credit" TODO into a real link.

### One deferred decision, handled by staying consistent rather than by picking

Three featured projects carried `TODO(phase-3-revisit)` markers on `role` — placeholders Ali flagged
at the gate as "a good accent, not answers." Marvel Snap and It Fits I Sits stayed `draft: true`
regardless, so the marker was moot for them. Vegas Blvd Slots didn't: it had a real write-up ready
and got flipped to `draft: false` on the first pass — which meant a page went live carrying an
unresolved "Ali needs to react to this" note, exactly the kind of thing `pre-launch-check`'s
`TODO(phase-3-revisit)` sweep exists to catch. Caught it by actually running that sweep before
calling the phase done, not by re-reading the diff. Reverted to `draft: true`. The rule that mattered
in the moment: a mechanical check that runs after the writing is worth more than remembering the
rule while writing.

### A schema constraint became a stale-link bug, mechanically

`getFeaturedProjects()` filters drafts out of production entirely, so linking to
`/projects/marvel-snap` in the About and homepage prose — a real, true credit — produced a broken
internal link the moment the page itself stayed a draft. `npm run links` caught it immediately. Fix
was to link the always-true external credits page instead of the maybe-not-published-yet internal
one. Worth remembering: a fact being true doesn't mean the page about it exists yet, and the two need
different links.

### Cost notes

Sonnet 5, one session, content-heavy: ~15 project/job files rewritten or filled in, 2 pages of new
prose (About, homepage), a ~150-file asset migration, and 5 featured write-ups researched from
`snapshot/` and `content/archive/`. No subagents. The phase-gate handoff worked as designed — starting
from `CLAUDE.md`'s already-settled framing meant zero re-litigation of the three gate questions, and
the session's tool calls went entirely into sourcing and writing rather than rediscovering context.

---

## Phase 4 gate — conversation, 2026-08-17

### The gate's own verification step paid for itself again

The plan added a "check load-bearing facts against primary sources" step to every gate after Phase 3
earned it. Phase 4's pass produced five corrections in about six tool calls, three of which changed
what got asked:

1. **`resume.astro` was not a placeholder.** The brief described it that way; it already read
   `getJobs('resume')` and `getEducation()`, formatted spans, and had working conditional branches
   for multi-entry `roles[]` and non-empty `highlights[]`. Phase 2's promised data flow was done.
   Phase 4 added content, layout, and print — not wiring.
2. **The PO Box wasn't on the site, and never had been.** The only occurrence of the string anywhere
   in the repo was the warning comment telling us not to reintroduce it. The actual PO Box lives in
   two committed-but-unserved files. Worth checking before writing a task to "remove" something.
3. **The schema already accepted year-only dates.** `datePart` takes `YYYY` or `YYYY-MM`, so
   splitting `roles[]` needs "promoted in 2022" and not a month — which made the blocking gate
   question materially cheaper to answer than its TODOs implied.
4. **Kaneva's structured data contradicted its own prose.** `roles[]` held one entry titled
   `Software Engineer` — matching _neither_ end of the real Technical Support Engineer → Lead UI
   Programmer progression — while the About page two paragraphs up already claimed the progression in
   words. The narrative and the data disagreed, and only the narrative was right.
5. **The weighting problem was inverted.** The "Source material (2019 resume, verbatim)" blocks are
   richest for the _oldest_ jobs. Second Dinner — seven years, the most important entry — had exactly
   one stale sentence describing the game as unannounced. Writing bullets straight from the source
   material, which is what the phase brief literally said to do, would have produced a resume
   weighted backwards. Second Dinner's highlights came from the Phase 3 Snap write-up instead.

Item 5 is the one worth generalizing: **"write X from the source material" assumes the source
material is evenly distributed, and it usually isn't.** Check the distribution before trusting the
instruction.

---

## Phase 4 — Resume, one source, 2026-08-17

### Two densities without two documents

Ali asked for both a one-page and a two-page resume. The obvious implementations — two components,
or two Markdown files — are the same shape that let the old site describe the Marvel game as
"upcoming" on four pages simultaneously, because each page owned its own copy of the fact.

What shipped instead: `highlights` is the one-pager, `highlightsExtended` is appended for the long
version, and one component renders both with a `variant` prop. The long version is a **strict
superset by construction** rather than by discipline. A bullet cannot disagree with itself across
versions because there is only ever one copy of it. The same arrays are then pasted verbatim into
`docs/LINKEDIN.md`, so the off-site profile is the same single source rather than a fourth surface.

### The page-count assertion earned its keep on its first run

`scripts/build-pdf.mjs` renders both routes with Chromium and fails if either exceeds its page limit.
It fired immediately: the one-pager came out at two pages. That is exactly the failure it exists to
catch, and it caught it before a human ever opened the PDF.

The fix process is the interesting part, because the first instinct was wrong. Trimming ~40 words
across the bullets moved the content height by **0.12in** — the section heights came back
byte-identical to two decimal places, which initially looked like a stale build. It wasn't: the
trims removed words without removing _wrapped lines_. Cutting words only helps when it drops a line.

Getting a real number required measuring the page, and the first measurement was also wrong —
`getBoundingClientRect` under `emulateMedia({media:'print'})` still uses the **screen viewport
width**, so it reported 8.34in against a 9.90in budget and said everything fit. At the true printable
width (701px ≈ 7.3in) the same content measured 10.12in. **Print-media emulation does not imply
print geometry**; the viewport has to be set to the page's content box or the measurement flatters
the layout by about 20%.

### A directory shadowed a page, and only the second route noticed

The PDF script serves `dist/` over HTTP rather than `file://`, because every internal href on this
site is root-relative and those resolve against the filesystem root under `file://` — you get a PDF
that looks nearly right and is silently missing its stylesheet.

Adding `/resume/full` created `dist/resume/`, which meant the request for `/resume` matched the
**directory** before `resume.html`, since the resolver only checked `existsSync`. `readFile` on a
directory throws `EISDIR`, so `/resume` 500'd while `/resume/full` worked fine. Fixed with
`statSync().isFile()`. The general shape is worth remembering: adding a nested route can shadow its
own parent, and the symptom shows up on the route you _didn't_ add.

### Chromium went in as a committed line — and then Cloudflare refused to run it

The resume PDFs need a headless browser, and the Cloudflare build command lives in the dashboard.
Patching it there would have repeated Phase 2's `workers_dev: true` lesson exactly, so the install
went in as a `postinstall` script in `package.json` (`playwright install --only-shell chromium`,
~95 MB rather than the full 180 MB), which `npm ci` picks up everywhere from one line anyone can
read in a checkout.

**That was the right placement and the wrong plan, and the gap between those took three pushes to
find.** The install worked perfectly on Cloudflare. The browser then died at launch:

```
error while loading shared libraries: libatk-1.0.so.0: cannot open shared object file
```

Cloudflare's build image is Ubuntu 24.04 with a **fixed apt package list** — it carries `libgbm1`
but none of Chromium's desktop dependencies. The documented escape hatch, `playwright install-deps`,
is an apt install and needs root, which the builder doesn't grant:

```
Switching to root user to install dependencies...
Password: su: Authentication failure
```

**The most instructive part: GitHub Actions built the identical commit green, twice.** Its runners
ship the desktop libs, so the entire path — postinstall, browser launch, PDF render, page-count
assertion — passed CI while the deploy that actually serves the site failed. A green CI run said
nothing about the environment that matters. Worth generalizing: when two CI systems build the same
repo, they are not redundant, and the one you're not watching is the one that will surprise you.

The fix inverts the design. The PDFs are committed in `public/`, Astro copies them into `dist/`, and
Cloudflare serves them with no browser involved. That reintroduces drift risk, which this repo
doesn't accept on a handshake — so `build-pdf.mjs --check` hashes every input that can change the
PDFs (job files, education, the resume components, its stylesheets, the site config) and fails if
the committed files are stale. It needs no browser, so it runs inside `build:ci`: **a deploy
carrying an out-of-date resume fails instead of shipping.** The check was verified by actually
breaking it — touching a job file exits 1, restoring it exits 0. A staleness check nobody has seen
fail is just a comment.

A second reason committing turned out better than regenerating per-deploy, which wasn't the original
motivation: `--font-body` is `system-ui`, which resolves to a different typeface on macOS than on
Linux. The committed PDF is the document Ali actually reviewed, not a Linux re-render of it.

### …and then that same fact broke CI, one step after being written down

Worth recording without softening, because it's the most instructive mistake of the phase. The
freshness guarantee shipped as two checks in one CI step:

```yaml
run: npm run check:pdf && git diff --exit-code --stat -- public
```

The first is the input hash — platform-independent, correct. The second asserts the regenerated
PDFs are byte-identical to the committed ones. CI reported exactly that split:

```
✓ committed resume PDFs are current.
 public/resume-full.pdf | Bin 174896 -> 38779 bytes
 public/resume.pdf      | Bin 167607 -> 33795 bytes
```

A Linux runner renders these at a fifth of the macOS size, because `system-ui` resolves to a
different typeface and a different set of embedded font subsets. Byte equality across platforms is
not a property these files have — **which `build-pdf.mjs`'s own header comment already said, in the
paragraph explaining why committing beats regenerating.** The belt-and-braces instinct added a
second check that contradicted the reasoning behind the first one, and the redundancy was the bug.

Two things generalize. **A second check is not free** — it can encode an assumption the first check
was specifically designed to avoid. And **an artifact's identity is not its bytes**: the useful
question was "was this built from the current inputs", which the hash answers, not "is this the same
file", which nothing portable can.

The consolation is that the mistake was cheap and loud, which is the whole argument for mechanical
checks: it failed in CI in under a minute rather than becoming a stale PDF nobody noticed. Keeping
the full build in CI is still worth it for a reason that survived the fix — it's the only
environment that can launch a browser at all, so it exercises generation end to end and re-checks
both page counts against a second font stack, which is a stricter layout test than macOS alone.

### Two things deliberately not done

- **The apostrophes.** YAML front matter doesn't go through Astro's smartypants, so the resume renders
  typewriter apostrophes while the Markdown project bodies render curly ones. Fixing only the resume
  would have created a _third_ state for Phase 6's wording pass to untangle, and straight apostrophes
  in a resume PDF are unremarkable. Left alone, noted for Phase 6.
- **Deleting the old resume PNG and PDF.** Both carry the PO Box, neither is served, and the repo is
  private — so there's no exposure today, only a trap for whenever Phase 7's build-in-public page
  makes going public attractive. Deleting them falls under the asset keep/drop check-in rule, so it
  was flagged rather than done.

### Cost notes

Opus 5, one session, gate plus execution. Zero subagents, and the judgment call there was easy: the
whole surface was four job files, one schema, one page, and a plan file — readable directly, and the
gate's five corrections all came from reading primary sources that a subagent's summary would have
flattened. The measure-then-fix loop on the print layout was the only place the session spent real
tool calls, and it replaced what would otherwise have been four or five blind build-and-check cycles.

### Merged, with a mid-session model downshift

Merged via [PR #9](https://github.com/ali-wallick/Portfolio/pull/9) at `c2f7811` (squash), same day
as the gate. The session that opened Phase 4 ran on Opus 5 through the gate, the resume build, and
the Cloudflare PDF investigation; Ali switched the session to Sonnet 5 partway through, for the
merge, the two follow-up content edits (GDScript, the Second Dinner role split), and this close-out —
exactly the clean downshift point the model table describes, arriving as a mid-session switch rather
than a fresh-session handoff this time. Worth noting for the eventual build-in-public page: the
downshift didn't need a new session or a re-briefing, because `CLAUDE.md` and the plan file had
already absorbed everything load-bearing from the Opus portion.

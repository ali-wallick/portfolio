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

---

## Phase 5 gate — conversation, 2026-08-17

### The gate's verification step corrected a fact the project had repeated for three phases

`CLAUDE.md`, the plan file, and a comment block in `tokens.css` all said the same thing: the old
site's `nav.js` held "a hand-rolled easing sticky sidebar built before `position: sticky` existed."
It had been copied forward since Phase 2, and Phase 5's whole "preserve the one good idea" mandate
rested on it.

It is wrong. `nav.js` does no interpolation at all — no lerp, no `requestAnimationFrame`. It reads a
bounding rect and assigns `style.top` directly on every scroll event. The easing lives in four lines
of `templateStyles.css`: a `transition: top .5s` with `cubic-bezier(0,0,0.25,1)`, applied only while
a `.scrolled` class is on. The lag-and-settle everyone remembered is **emergent** — scroll events
fire faster than the 500ms transition, so the element chases a target it never reaches until
scrolling stops.

The generalizable bit isn't "check your facts." It's **which** facts a phase gate should check.
This claim had survived three phases precisely because it was never load-bearing before: nothing in
Phases 2–4 needed to know how the sidebar worked, only that it was worth keeping. The gate
verification step earns its keep by re-checking the facts _this_ phase is about to build on, not the
repo's facts in general — a claim can be inert for a year and become load-bearing the week you act
on it.

Two things fell out of the correction, and both made the phase cheaper:

- **The reinterpretation is two token values, not a component.** `--ease: cubic-bezier(0,0,0.25,1)`
  and `--duration: 500ms` land on `master`, and every direction inherits the character for free. The
  "is the reinterpretation literal or abstract?" question the gate was supposed to argue about
  mostly dissolved once the mechanism was understood — it stopped being either/or.
- **One remembered feature turned out to be a bug.** The transition exists only while `.scrolled` is
  applied, so scrolling back up snaps instead of settling. Worth _not_ reproducing. Nostalgia would
  have shipped the asymmetry along with the good part.

The Phase 2 placeholders being replaced were also further off than anyone would have guessed:
`cubic-bezier(0.2,0,0,1)` at 240ms, against a real curve with **zero** ease-in at 500ms. Twice the
duration and a fundamentally different attack.

### A "dead end" from Phase 3 turned out to be the strongest design lead in the phase

Phase 3 listed `palette.html` and "the unlinked `colors.css`" under dead ends to kill. Correct about
the _served files_ — and it meant nobody opened them. `snapshot/misc/colors.css` is a Paletton export
documenting a color system the old site genuinely used throughout: peach ground, cream content, mint
sections with a hard un-blurred offset shadow, deep green headings, rust links, and Georgia for body
copy.

Contrast was **measured at the gate rather than assumed**, which changed the conclusion. The instinct
was to call a 2014 hobbyist palette inaccessible; body text on mint is actually 7.65:1 (AAA) and links
on cream are 6.96:1. Only the accents fail — headings 3.45:1, hover 2.63:1. So the hues are sound and
the accent lightnesses need retuning, which is a reinterpretation job, not a rescue.

That produced the phase's one real structural change to the plan: **editorial was dropped as a
direction and replaced with a palette revival.** The reasoning is worth keeping, because it applies
past this project. The brief is "not obvious which template they used," and every _invented_
direction has to argue its way there — it can always be accused of resembling something. A direction
derived from a palette the site's owner chose herself has no template to be mistaken for. The
constraint that looked like archaeology was the cheapest available source of genuine distinctiveness.

Editorial went rather than playful or dense because the revival absorbs most of its territory — both
type-led, warm, reading-focused. Three directions only pay for themselves if they're actually three.

### Cost notes

Opus 5, one session, gate only. Zero subagents, and the call was easy: the entire evidence base was
two CSS files, one 50-line JS file, and a plan file. Every finding came from reading a primary source
directly — a subagent's summary of "the old site's stylesheet" would have flattened exactly the
four-line transition block the whole correction turned on. The single most valuable tool call in the
session was seven lines of Node computing contrast ratios, which converted a confident assumption
into a measurement that pointed the opposite way.

---

## Phase 5 — findings that landed on master mid-phase, 2026-08-18

_Two fixes and a methodology note, all found while building direction 02 (dense / craft). Recorded
here rather than on that branch because they are direction-agnostic and only one of the three directions gets merged — the same reasoning
that put the fixes themselves on `master` in [#14](https://github.com/ali-wallick/Portfolio/pull/14),
following the precedent [#11](https://github.com/ali-wallick/Portfolio/pull/11) set._

The generalizable thing about the two fixes: **a defect that only exists in the gap between two
subsystems is invisible to everything that tests either one.** Neither is a bug in the design, and
neither is a bug in the resume pipeline. Both live in the seam.

### `ch` is a font-dependent unit, so a measure written in it is a layout that resizes

CI's Lighthouse gate failed a direction branch at 0.91 performance against a 0.95 threshold. Every
speed metric scored 1 — FCP, LCP, TBT, Speed Index. The whole loss was **cumulative layout shift at
0.197**, identical across three runs, so not noise.

The obvious diagnosis was "self-hosted webfonts, of course there is CLS", and it was wrong in a way
worth keeping. Measuring instead of assuming — rendering the page with the real faces and again with
the fallback stack forced — showed the prose column itself changing size: **`--measure: 64ch` resolved
to 682px in the loaded face and 570px in the fallback.** `1ch` is the width of the `0` glyph, so every
max-width written in `ch` is a box that changes width by a fifth when the font arrives, taking
everything below it with it. Only the longest prose page failed; the same three fonts on `/contact`
produced 0.000. The fonts were a participant, not the cause.

`ch` is genuinely seductive for a measure because it means exactly the right thing — characters per
line, which is what typographic advice is actually about. The trap is that it can only mean that
_after_ the font has loaded, and before then it means something else by 20%.

The fix is to pin every max-width to the rem value `ch` was already producing: the rendered layout is
identical and simply stops moving. Verified by diffing block positions across five routes, the
offending page went from a 50px shift to **0px**, and CI came back with performance 1.00 and **CLS
0.000 on all five audited pages** — including three that had small non-zero shifts nobody had noticed.

**The token on `master` is deliberately still `68ch`.** The correct rem value depends on which face a
direction picks, so pinning one would be picking it for them. What landed instead is the warning, on
the token itself and in `CLAUDE.md`'s Phase 5 standing rules — both places someone would look, rather
than only in a document.

Two lessons, and the second generalizes furthest:

- **A CI threshold caught a defect that every local signal called clean.** The same page scored a
  perfect 1.00 locally, because a fast machine loads the font before first paint and the swap never
  happens at all. The gate was not being pedantic; it was the only thing in the loop running on
  hardware slow enough to see the bug. Worth remembering the next time a threshold looks annoying.
- **When a metric fails, measure the mechanism before believing the obvious cause.** "Webfonts cause
  CLS" would have led to `font-display: optional` — which scores well, costs the first-visit
  appearance of the direction's entire identity, and would have left the real defect in place for
  whatever the next long page turned out to be.

### A leak has one wrong value; a race has a new one every time

The print-geometry differ that `CLAUDE.md` books as Phase 6 work was run early, against a direction
branch. It found the expected class of problem — an unpinned token would have condensed every heading
in the PDF — and then something that was not a leak at all.

Three resume contact links printed at `rgb(15,16,19)` on one capture and `rgb(16,18,21)` on the next.
The instability _is_ the diagnostic. The cause: switching to print media **starts** any transition
whose property the print rules change, and `scripts/build-pdf.mjs` navigates and then prints inside
that window. A design that puts `transition: color` on `a` therefore does not put a wrong colour in
the committed PDF — it puts a different one in on every build.

Worth recording because the fix has a different shape from every other rule in that block. Those are
denylists that a later design walks around by using a property nobody enumerated; `*  { transition:
none !important; animation: none !important }` cannot be walked around, because animation on paper is
never correct regardless of the design. **When a guard can be written as a universal truth rather than
an enumeration, write it that way** — and the reverse is the tell that the block's own comment already
admits to, that it is a denylist wearing a design system's clothes.

### A diff where every row differs is a broken harness, not a broken build

Methodology note from the same session, learned the expensive way. The differ's first run reported
that _everything_ differed, including the font family on every element. It was measuring nothing:
Astro links its CSS by absolute path, so the `file://` pages had rendered with no stylesheet at all.

The tell was `body` sitting at an 8px offset — the browser's default margin, and not a value anywhere
in this repo. Re-run over a local HTTP server it came back 0 visible elements moved. **When a
measurement disagrees with everything you know, suspect the instrument before the subject**, which is
the same shape as the Phase 2 lesson that a check you cannot read is not a check.

Git produced the identical failure later in the phase, in the other direction: rebasing the direction
branch onto this work, it merged the two copies of the new print rule **cleanly and wrongly** into two
duplicated blocks, while raising conflicts only in the files that mattered less. The conflicts it
reports are not the same set as the mistakes it makes.

---

## Phase 5, direction 3 — playful / toy

The direction whose brief was carried by _behaviour_: "obvious a game developer made this" expressed
as how the site responds rather than as what colour it is.

### Putting the play in the interaction layer is what makes it forwardable

The named risk was whimsy undercutting credibility on a portfolio with a Marvel Snap credit on it. The
resolution turned out not to be "less playful" but **a different place to put the playfulness**.

A hiring manager decides whether to forward a link from a _still_ — a two-second scan of a page they
did not interact with. Interaction is only ever discovered by someone already engaged. So the two
audiences never see the same artefact, and the direction can be restrained in the one they judge and
maximal in the one they explore. Concretely: the colour split puts coral almost entirely in the
interaction layer (reticle, focus, current-page pill), leaves navigation to violet, and gives the
content layer five status hues; a screenshot reads as an information-dense portfolio, and using it
does not.

**The generalisation worth keeping: when a design has two audiences who consume it through different
channels, "how much personality" stops being one dial.** It was being argued as one until the split
became obvious.

The corollary is a restraint budget with a _rule_ behind it rather than a taste judgement. Height
means pressable — anything on a plate can be pressed and presses flat, and nothing decorative gets
height. Reading surfaces (About, write-up bodies, the resume) get the palette and the type and
nothing else. Both are checkable by someone who is not the author, which is the property a taste
judgement lacks.

### The recovered motion character generalises better than expected

The gate established that `nav.js` did no interpolation — it assigned `top` directly on every scroll
event, and CSS eased each assignment, so the sidebar chased and settled. This direction built a
selection reticle on exactly that mechanism: the script assigns a target and does no animation at all,
and one CSS transition eases every assignment.

It paid off in a way that was not obvious up front. **The character comes free on any target that
moves for a reason of its own**, because "retarget faster than the transition can finish" is a
property of the mechanism rather than of scrolling. Measured, following a focused card through a
500px scroll jump — gap in px between reticle and target, sampled every 90ms:

```
353 → 186 → 96 → 40 → 8 → 0
```

That is the zero-ease-in curve doing what it does, with no animation code anywhere. The old
implementation's _bug_ — dropping the transition along with the `.scrolled` class, so the return trip
snapped — is not reproduced, because nothing here is conditional.

Two smaller findings from building it, both about the difference between a device and an affordance:

- **It decorates, never informs.** The real `:focus-visible` outline stays underneath, so a blocked or
  failed script costs nothing. Verified with JS disabled: zero reticle elements in the DOM (it builds
  its own), every card still present and navigable.
- **Reduced motion is not a disabled state.** Zeroing the two duration tokens leaves the reticle
  _cutting_ to each target instead of travelling — the device survives, only the travel goes. Nothing
  on the site sets a raw duration, which is what makes that a two-line guarantee rather than an audit.

### The second thing the print-geometry differ caught, and it was not a token

`CLAUDE.md` says to add every new token to `resume.css`'s print block. Doing that faithfully was not
enough.

`font-variant-numeric: tabular-nums` on `body` — an ordinary screen choice on a site full of years —
reached paper and widened every element containing a digit. The resume's dates grew by up to 7pt, and
two job titles grew with them because their company names contain a digit.

It cost nothing that day. The dates are right-aligned in a `space-between` row, so the extra width ate
slack; every `y` was byte-identical and the page count never moved. **That is exactly what makes it
worth finding** — `maxPages` cannot see a leak this size, and the next one lands on a paragraph that
wraps.

The detection method is the part to keep. The PDF _shrank by 84 bytes_, which says nothing at all —
PDF bytes move with font subsetting. The differ named seven elements and their exact widths. Fixed at
both ends: scoped to the two Phase-5-only classes that wanted it, and pinned `normal` on `body` in the
print block.

**This is the third distinct bug that differ has caught across two directions** (an unpinned token, a
transition race, and now a non-token inherited property). The Phase 4 follow-up argues for committing
it as a build guard; three-for-three is the argument.

### Small ones

- **A hover effect on the target breaks a measurement taken at `pointerover`.** The reticle parked 3px
  low on cards, because the card lifts 3px on hover and `pointerover` fires before it has. Fixed by
  re-measuring on the target's own `transitionend` rather than by subtracting `--lift`, which would
  have gone stale the moment the token changed.
- **A test can fail for the right reason.** "Scroll while hovering" reported the reticle abandoning its
  card — correct behaviour, since after a 500px scroll the pointer is genuinely over different content.
  The assertion was wrong, not the code. Isolating the case with _focus_ (which survives scrolling)
  measured what was actually intended.
- **Deepening the page ground to make cards pop failed a contrast check**, dropping the accent to
  2.91:1 against the 3:1 non-text floor the reticle is held to. The cards got their presence from the
  plate instead — no contrast touched. Worth noting that the constraint picked the better fix.

---

## Phase 5 close — what a four-way design bake-off actually taught, 2026-08-20

Direction 03 merged in the arcade-dimmed palette. Three directions closed. The interesting material
is not which one won — it is what the process surfaced that a single-direction build would not have.

### Building four palettes found bugs that building one palette hid

This is the generalizable finding of the whole phase, and it is not about colour.

Every latent defect below had existed since the direction was first built, passed CI, and was
invisible while the palette sat still. **Moving the palette is what made them show themselves** —
and each one is a case of a value being correct by accident rather than by construction.

- **A border token used as a text colour.** The featured list's ranking numbers took
  `--color-border`. That reads as a deliberate "very quiet number" right up until a palette whose
  rules are dark enough to be legible, at which point it is either a contrast failure (1.43:1 as
  originally shipped) or an accidentally loud number. It now has its own token. The tell: a token
  whose _name_ describes a different job than the one it is doing.
- **A shadow that disappeared in dark mode.** The plate — the unblurred shadow that carries "height
  means pressable" — was darker than an already near-black ground, at 1.06:1. One of the direction's
  two signature devices simply was not there in dark mode, and nobody had noticed across a full
  gate, a build and a review. Near black, a shadow has to become a _raised edge_ — lighter than the
  page — because that is the only direction with anywhere to go.
- **A CLS pass that was luck.** The direction cleared the layout-shift gate without font preloads,
  because its sans and the system fallback happen to break lines in similar places. A sibling
  direction's serif proved how thin that was: same rem-pinned `--measure`, 0.199 CLS, because the
  prose reflowed by whole lines rather than the column resizing. Two different mechanisms, nearly
  identical scores — and the guard for one does nothing for the other.

The lesson worth carrying: **a value that only works for the current inputs is not a decision, it is
a coincidence with good manners.** Varying an input you did not intend to ship is a cheap way to
find out which is which.

### The print block can be beaten on specificity, not only on omission

`CLAUDE.md` has warned since Phase 4 that `resume.css`'s `@media print` block is "a denylist wearing
a design system's clothes" — it pins the tokens that existed when it was written and silently passes
anything added later. That was right, and it was not the whole risk.

Making a palette the _default_ rather than an option put **28 elements of the résumé PDF in the wrong
colour** — a token the print block explicitly pins. The block pins on `:root`, specificity (0,1,0).
The palette rules were `:root[data-palette='…']`, (0,2,0). **Media queries do not affect
specificity.** So the more specific screen rule won on paper, and the page-count assertion caught
nothing, because colour costs no height.

Two things generalize:

- **Pinning is a claim about values, not about precedence.** A guard that redefines a variable only
  holds while nothing outranks it. `@media screen` around the screen half is a claim about _where
  rules may apply at all_, which is the stronger shape and cannot be walked around by adding a
  selector.
- **The differ earned its keep for the fourth time.** It has now caught an unpinned token, a
  transition race, a font-condensation leak, and a specificity override — four distinct failure
  modes, none of which the page-count assertion could see. It is still a throwaway script. It should
  be a build guard; that is booked in `CLAUDE.md` and is now overdue rather than speculative.

### Findings worth keeping from the directions that lost

Recorded here because the branches close unmerged and this material is direction-agnostic.

**From 01, the palette revival — the archaeology kept paying after the gate closed.** The Phase 5
gate had already corrected one wrong belief about the old stylesheet. Reading it _again_ to build
the direction turned up a third idea nobody had mentioned in five phases: `.navButtonSelected` sets
`position: relative; top: 7px`, so the selected nav tab physically drops. State expressed as
displacement rather than as colour — arguably more useful than the chase-and-settle curve everyone
remembered, because it generalizes to anything with a selected state. **Two of that direction's
three devices came out of a file the project had already read twice for other reasons.** The
"we've been through that file" instinct nearly cost both.

**From 01 — a distinctiveness risk that is checkable rather than a matter of taste.** A hard
unblurred offset shadow in 2026 reads as neo-brutalism unless something makes it read otherwise. The
difference turned out to be specific: neo-brutalism offsets down-**right**, in black, behind a heavy
keyline; the 2014 CSS offset down-**left**, in a darker tint of the block's own hue, with no keyline
at all. Keeping the left fall and the tonal colour yields a different reading entirely — offset-litho
misregistration — and that reading then settled every open question by itself. **When "does this look
borrowed?" can be reduced to three checkable properties, it stops being an argument.**

**From 01 — the strongest choice was a negative one.** Warm cream plus rust is simultaneously that
direction's whole claim to authenticity _and_ the most over-produced look in current AI-assisted
design. The single decision doing the most work to keep it distinct was refusing a high-contrast
display serif in favour of a screen-reading one — a constraint about what _not_ to pick, which is
exactly the kind of decision that is easy to skip when choosing faces.

**From 04, the hybrid — a probe is a legitimate thing to build.** It was never expected to win. Ali
had settled on 03's behaviour but still felt a pull toward 01 that neither of us could name, so 04
put 01's surface on 03's structure to find out what the pull was. Answer: **the palette, not the
structure** — which is what turned the palette exploration from a guess into the obvious next step.
Both bugs CI caught on that branch were real defects in 03 too and were carried forward. The one
thing that died with it, deliberately: the register-on-press gesture, which only works on a plate
that falls diagonally and does not transplant to one that falls straight down.

### Cost notes

The switcher was the highest-leverage tool of the phase. Four palettes on one preview with a live
toggle cost roughly what one extra branch would have, and it is the only setup that permits the
comparison anyone actually wants to make — the same page, two palettes, back to back, on a phone.
Four deploy URLs would have produced four opinions about four pages.

Generating the palettes rather than hand-writing them mattered for the same reason the contrast
script mattered at the gate: 4 palettes x 2 themes x ~28 tokens is over 200 values, and the status
chips each have two constraints at once. That is past the point where eyeballing degrades quietly
rather than loudly.

**Verifying the model is not verifying the page.** The generator asserted every pair it knew about;
a real-DOM sweep across 50 renders was what confirmed no pair it _didn't_ know about had appeared.
Both passed, which is the point — the second check is cheap and the day it disagrees is the day it
pays for itself.

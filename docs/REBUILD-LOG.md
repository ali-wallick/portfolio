# Rebuild log

Running notes on rebuilding aliwallick.com with agentic workflows — what was tried, what worked,
what didn't, and what it cost. **Phase 7 turns this into a build-in-public page.** Keeping notes as
we go is much cheaper than reconstructing them at the end, and the details that make this
interesting are exactly the ones that evaporate a week later.

Append as you go. Newest phase last.

**Phases 0 and 1, the process layer, and the verification record were folded in from `docs/PLAN.md`
on 2026-08-20**, when that file was retired — it had become a second, thinner source for the same
page this one feeds, and two sources for one deliverable is the duplication this project keeps
removing. Those four sections read as summary rather than as running notes, because that is what
they were.

## How this was run

The process layer, folded in from `docs/PLAN.md` when that file was retired on 2026-08-20. It was a
deliverable in its own right rather than overhead around the real work, and it is the part of this
project that transfers back to a day job.

### Phase gates

**Work stopped for a conversation before each phase began.** Every gate covered the same five
questions, and they held for all six:

1. **Scope** — what's actually in this phase, and what got deferred.
2. **Verification** — _added after the Phase 3 gate, which earned it._ Before trusting the brief, check this phase's load-bearing facts against **primary sources** rather than against the repo's own notes. `CLAUDE.md` and the plan are a cache, and caches go stale between phases. The Phase 3 gate produced five factual corrections this way — a wrong job title in two places, a settled phrasing that had been overtaken by a public announcement, an overclaimed credit, a "needs sourcing" TODO answered by an image already in the repo, and a schema constraint nobody had noticed applied more broadly than assumed. Four of the five would otherwise have shipped as confident, wrong prose. Budget a few tool calls for this at every gate; it is the cheapest verification in the project.
3. **Handoff** — fresh session or continue? Most phases started clean, with the plan and `CLAUDE.md` carrying context forward instead of a long scrollback. That's cheaper _and_ produces better work — a session carrying 80 turns of unrelated history reasons worse than one that starts with a tight brief.
4. **Model** — which model does the bulk of this phase (see below).
5. **Cost** — rough expectation going in, and a look at actual spend coming out.

**A corollary for the gate itself:** a gate is where the expensive model earns its keep, so keep gates short and run them on the good model rather than economising. The judgment-per-token is the whole product of the session.

### Model allocation

Current lineup and list pricing, per million tokens:

| Model         | Input / Output | Use for                                                                                               |
| ------------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| **Haiku 4.5** | $1 / $5        | Mechanical bulk — scraping WordPress to Markdown, asset inventory, link checking, bulk find/replace   |
| **Sonnet 5**  | $3 / $15       | Most implementation — building components, writing content from source material, wiring the build     |
| **Opus 5**    | $5 / $25       | Architecture and judgment — content model design, design exploration, `CLAUDE.md`, anything ambiguous |

If you're on a Claude Code subscription rather than API billing, you aren't paying per token — but the same ratios govern how fast you burn plan limits, so the allocation still matters. _(Sonnet 5 was on introductory pricing at $2/$10 through 2026-08-31 for most of this project.)_

### What actually drove cost

Worth internalizing early, since it's the part enterprise access hides:

- **Context length dominates everything.** Every turn re-sends the whole conversation. One 100-turn session costs far more than five focused sessions doing the same work — the last turn of a long session can cost 20× the first. This is the single biggest lever, and it's why the phase-gate handoff question matters.
- **Subagents multiply spend.** Each one starts cold and builds its own context. Genuinely parallel fan-out (surveying an unknown codebase) earns it; a task you could do inline doesn't.
- **Prompt caching works within a session, not across.** Cached context reads at ~10% of input price. This cuts both ways: don't `/clear` mid-phase for no reason, but don't drag a finished phase's context into the next one either.
- **Design iteration is the expensive phase** — lots of visual back-and-forth, large outputs. Budget for it; it's also the highest-value work.

Run `/usage` any time to see where a session went, and there's an `explain-usage` skill that breaks it down in more detail. Worth doing after the first couple of phases while the intuition is still forming.

---

---

## Phase 0 — Preserve ✅ Complete (2026-08-15/16)

_Nothing is reversible until the old content is out of the old system._ Runs first, blocks nothing once complete. Mostly mechanical — planned as Haiku work. **In practice it ran on Sonnet 5**, and the HTML-to-Markdown judgment calls (a malformed `<s>` tag, an undated post, mojibake in a quoted excerpt) were worth the difference over Haiku.

Landed via [PR #1](https://github.com/ali-wallick/Portfolio/pull/1), merged to `master` at `d2de27f`.

- **Scrape the WordPress blog to Markdown.** Done — 20 posts (top of the ~15-20 estimate), 2010-2019, walked `?offset=0,5,10,15` until "Older" stopped appearing. One file per post in `content/archive/` with title/date/source front matter. One post ("Website Live!") had no published date on the live site — flagged in front matter with a `2010-xx-xx` filename rather than a guessed date.
  - **Follow-up fix:** the first pass only verified the posts' images currently resolved on DreamHost — it didn't commit the binaries, so they were still hotlinking to `aliwallick.com/blog/wp-content/uploads/`. Caught in review before merge. All 14 images across the 6 affected posts are now downloaded into `content/archive/images/` (2.8 MB) and referenced locally. Worth remembering for any future scrape-style task: "verify it resolves" is not the same as "preserved."
- **Snapshot the live site** (full crawl) — done, in `snapshot/`. Every top-level page, all 15 project pages at their live (mixed-case) URLs, the blog's 4 pagination pages, and stray public files still live at time of capture (`todo.txt`, `palette.html`, `colors.css`, `wp-login.html`).
- **Tag the current repo** (`v1-legacy`) — done, pushed to origin.
- **Inventory assets.** Done — confirmed exactly as scoped: 86 of 90 social icons unused, 6 orphaned project logos, plus one more (`programming_actionscript.png`) tied to the known Art of Rescue icon bug. `resources/images/ASSET_INVENTORY.md` has the full keep/drop list. Nothing deleted — that's a Phase 3 cleanup action, not a Phase 0 one.
- **Pull source material** for the content rewrite (LinkedIn history, current resume PDF, Marvel Snap press/YouTube appearances) — **not done, and not agent-doable.** This is your material to gather, not DreamHost-only content at risk of disappearing, so it didn't block the Phase 0 merge. Still needed before the Phase 3 gate.

**Exit:** every piece of content that exists only on DreamHost is in git. ✅ Met.

---

---

## Phase 1 — Infrastructure ✅ Complete (2026-08-16)

_The only phase in this project with a deadline._ Domain, DNS, and registrar all landed on
Cloudflare and email went live on iCloud+ — verified send **and** receive in both directions on both
`ali@` and `contact@aliwallick.com` — **the same day it started**, roughly six weeks ahead of the
October 1 GoDaddy renewal. Merged via [PR #2](https://github.com/ali-wallick/Portfolio/pull/2).

**What the deadline actually was, since the reasoning outlived it.** A registrar transfer _adds_ a
year to the existing expiry rather than resetting it, so transferring before the renewal date lost
nothing — but letting it auto-renew first would have meant paying GoDaddy's renewal rate for a year
the domain was going to move anyway. The working target was ~September 20: transfers take 5–7 days
after approval, and Cloudflare requires the domain to be on Cloudflare DNS _before_ it will accept
the registration.

**The rule that mattered, and would again: do not turn off auto-renew as a cost-saving move.** If a
transfer slips for any reason, a lapsed domain is far worse than a duplicated renewal. Leave it on;
a completed transfer makes it moot.

### What it replaced

- **Domain** `aliwallick.com` at **GoDaddy** — registration only, nothing else on the account.
- **Site and email** on **DreamHost** — `ali@aliwallick.com` lived there.
- **A second household domain** registered **free as part of the DreamHost annual subscription**,
  with a site hosted there too.

**DreamHost retires when both are migrated off**, and temporary double-paying was accepted up front.
That is what removed the coupling as a blocker — it became a sequencing note rather than a
negotiation, and it is now [#52](https://github.com/ali-wallick/Portfolio/issues/52).

### The zone, the tooling, and the rest of Phase 1 are in `infra/README.md`

**Not summarised here, on purpose.** That file documents the zone as it currently stands, the three
things a summary can't ship — `capture-dns-baseline.sh`, the captured pre-migration zone, and
`verify-dns.sh`, which answers _"did we lose a record?"_ mechanically rather than by reading — and
the DKIM trap that explains why the verify script asserts a magic substring.

The step-by-step that actually ran is in git history (`git show 0eec28f:infra/PHASE-1-RUNBOOK.md`, the version that was actually used).
It was retired on 2026-08-20: a registrar transfer happens once, and 143 lines of imperative
instructions for a completed migration is a document that can only mislead — it still read _"target
completion ~2026-09-20"_ five days after the work was done.

**The Phase 1 follow-ups are GitHub issues**, not a list in either file —
[#41](https://github.com/ali-wallick/Portfolio/issues/41) DMARC, [#42](https://github.com/ali-wallick/Portfolio/issues/42) SPF hardfail, [#43](https://github.com/ali-wallick/Portfolio/issues/43) stale SPF includes,
[#44](https://github.com/ali-wallick/Portfolio/issues/44) `google-site-verification`, [#45](https://github.com/ali-wallick/Portfolio/issues/45) repo cleanup, [#52](https://github.com/ali-wallick/Portfolio/issues/52) the DreamHost
handoff, and [#55](https://github.com/ali-wallick/Portfolio/issues/55), which came out of actually running the verify script during that cleanup.

**One of them resolved during the phase and is worth keeping in the record**, because it is the kind
of thing that would otherwise be quietly rediscovered: the first test send landed at Gmail with
`spf=pass` but `dkim=permerror (no key for signature)`. The `sig1._domainkey` CNAME was correctly in
place and pointing at Apple's key host — Apple simply hadn't finished publishing the key on their
end yet. **A correct DNS record and a working DNS record are not the same thing when a third party
owns what it points at.** A retest an hour later came back `dkim=pass` on both addresses.

---

---

## What verification meant, per phase

Folded in from `docs/PLAN.md`. Worth keeping because it is what retroactively justifies trusting
anything else in this log — a record is only worth as much as the checking behind it. Per-phase, not
just at the end:

- **Phase 0:** post count in `content/archive/` matches the live blog's pagination; spot-check bodies and dates against the live site.
- **Phase 1:** after each migration step, verify independently — DNS records resolve identically, mail sends _and_ receives, the site still loads. Never stack two unverified steps.
- **Every phase after 2:** each branch gets a Cloudflare preview URL. Review on desktop _and_ phone before merge — the old site's core failure was never being looked at on a phone.
- **CI on every PR:** build succeeds, internal link check passes, no `http://` subresources, Lighthouse thresholds for performance and accessibility.
- **Phase 3:** read the full site top to bottom against the resume and LinkedIn; every claim true as of 2026. Explicitly re-verify nothing says "unannounced Marvel game."
- **Phase 6, pre-cutover:** crawl the old site's URL list against the new one and confirm every path resolves or redirects. Test OG previews by pasting links into Slack/Discord/iMessage.
- **Final:** load on a real phone over cellular, with an actual stranger's eyes if possible.

---

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

---

## Between Phase 5 and Phase 6 — moving the backlog out of prose, 2026-08-20

### The plan file had quietly become two documents

`~/.claude/plans/i-first-built-this-glistening-book.md` was 910 lines doing two incompatible jobs: a
**closed historical record** of Phases 0–5, and a **live list of what's left**. Those want opposite
things. The record wants to be immutable and complete; the list wants to be edited constantly and
kept short. Keeping both in one file meant the interesting part — twelve or so deferred follow-ups —
was distributed as prose across five phase sections, three "still open at the end of the gate"
subsections, and a plan appendix.

Nothing was lost, which is the point worth recording: **every one of the ~30 outstanding items was
written down somewhere**, because the habit of recording deferrals at the moment of deferring held
for five phases. The problem was purely retrieval. Answering _"what's actually left?"_ took reading
910 lines of plan plus 56KB of `CLAUDE.md` and grepping for `TODO(phase-`.

### Prose is the wrong shape for a backlog, and the tell is the blocking relationships

The thing prose genuinely cannot express is **what blocks what**. Scattered through the plan were
dependencies that only existed in a reader's head:

- The thumbnail work can't start until the media route is decided, because three of five featured
  projects have no usable image.
- The wording pass shouldn't run while the design revisit is still moving.
- The stale SPF includes can't be trimmed until DreamHost stops being able to send anything, which
  depends on a migration involving another person.
- The two files carrying a PO Box only matter if the repo goes public, which is most likely to
  happen _because of_ the build-in-public page.

That last one is a four-hop chain across three phases, and it existed only as a sentence in a
"flagged not acted on" subsection. As issues it's one link.

### 353 lines were deletable, and identifying which took one pass

The kickoff-brief appendices for Phases 0–5 were **single-use session starters** — paste-this-in
blocks for sessions that have since happened and merged. Every outcome they produced is recorded in
the phase sections above them, in `CLAUDE.md`, or here. The Phase 6 one survives because it hasn't
been used.

The generalizable version: **a document that accretes one section per phase needs a rule for what
leaves it, not just what enters it.** Without one it's monotonic, and a monotonic document gets read
less each time it grows — which is the failure mode the plan was written to prevent in the first
place.

### Writing the issues surfaced a thing the prose had lost

Three of the four genuinely-unsettled questions were _already written down_, in the Phase 6 gate
conversation starter — a section nobody would open until starting Phase 6. So the questions that
determine whether Phase 6 can start were stored inside the artifact you read once Phase 6 has
started. Splitting them out as `decision`-labelled issues is a small change that fixes a real
ordering problem.

The fourth wasn't written anywhere: **whether the DNS cutover belongs in Phase 6 or is its own
moment.** It's implied by the gate starter's warning that it's the one step with a blast radius
outside the repo, but never asked. Ali slowing down before launch is exactly the condition that
makes it matter — a Phase 6 that ends in an unshipped cutover is a phase that never closes.

### Cost notes

Cheap, and cheap for a specific reason: **this session read primary sources once and wrote 32
issues from them**, rather than iterating. No subagents — the work was a single reader holding one
plan file, `CLAUDE.md`, and a grep of `TODO(phase-` in their head at once, which is precisely the
shape that does _not_ fan out. Delegating it would have meant each agent rebuilding the same context
to write three issues.

The one avoidable cost was self-inflicted: issue bodies were written before their numbers existed,
so ten of them needed a follow-up edit pass to fix cross-references. Creating placeholder issues
first and filling bodies second would have avoided it.

### The narrowing pass found the drift it was hypothesising about

Splitting the backlog out left the plan as a record — and the obvious next question was whether a
574-line record earns its place next to a 56KB `CLAUDE.md`. Checking rather than assuming turned up
something better than a size argument.

**The plan's summary tables had drifted from `CLAUDE.md`, on the most sensitive fact in the
project.** Its "Decisions already made" row for Second Dinner still read _"current work only as 'an
unannounced mobile title in Godot'"_ — a phrasing `CLAUDE.md` **explicitly retired** at the Phase 3
gate for being vaguer than the studio's own public statement _and_ wrong about "mobile". The plan's
Context paragraph asserted the same thing in prose, dated 2025 rather than 2024. Two more rows in
the same table were stale: Deploy carried an inline correction instead of being corrected, and
Visual design said "2-3 directions" when the plan's own Phase 5 section, 350 lines further down,
opens by saying it took four.

So a fresh session following the standing instruction to _"read the plan for full context"_ would
have read a retired phrasing about an unannounced project, presented as settled. **That is the old
site's bug** — the Marvel game described as "upcoming" on four pages at once — reproduced in the
documentation layer of the project built to prevent it.

The fix was not to resync the tables. **It was to delete them**, on the same principle the content
model runs on: every fact lives in exactly one place. The narrowed file now asserts nothing
`CLAUDE.md` also asserts, which means it cannot drift, because there is nothing to drift from.

### "It's the only copy" is a claim to verify, not to assert

The first pass at this concluded the plan's 111-line Phase 1 section was the sole record of the
infrastructure migration. **It wasn't.** `infra/PHASE-1-RUNBOOK.md` (since restructured into `infra/README.md`) had been sitting in the repo
since Phase 1 with 257 lines covering the same ground more thoroughly — the executed steps with
their verification gates, a DKIM-trap section, and its own open-items list.

Worth noticing _how_ that error happened: the conclusion came from comparing the plan against
`CLAUDE.md`, and `CLAUDE.md` says almost nothing about Phase 1 because Phase 1 is closed and
out of scope. Absence from the file you happen to be diffing against is not absence from the repo.
A three-command grep across all four documents corrected it.

That changed the outcome materially. Instead of extracting a new document, the plan's genuinely
unique remainder — the architecture table, the cost comparison, the iCloud+ constraints — **moved
into the runbook**, and the plan's Phase 1 section became a pointer. Same principle again: the
record with the working scripts next to it is the one that should hold the reasoning.

### What a record keeps that a tracker doesn't

The narrowing kept three things and it is worth being explicit about why, since the default instinct
was to keep the phase-by-phase narrative and drop the process notes:

- **How the project was run** — the five gate questions, the model allocation, the cost mechanics.
  This is goal #2's actual content, and nothing else holds it.
- **What the plan got wrong**, per phase. More useful than what it got right, and it only exists
  because each phase wrote its corrections down at the time.
- **Per-phase verification.** What "verified" meant at each step, which is the thing that
  retroactively justifies trusting the record at all.

Everything else — settled decisions, open questions, the phase-6/7 task shape — had a better home
already. **353 lines of plan became 346 lines of record**, with 60 of them folded into the runbook
rather than deleted.

---

## Phase 6 — building an instrument instead of an answer, 2026-08-21

Ali asked for a plan for [#36](https://github.com/ali-wallick/Portfolio/issues/36) (thumbnails on
featured work) and added the thing that actually mattered: _"I think at the core I worry that the
site, especially the main pages, are too text heavy."_

#36 was blocked on [#22](https://github.com/ali-wallick/Portfolio/issues/22), a `decision` issue.
The useful move was not to pick a route but to **build the thing that lets the route be picked** —
so the deliverable is a preview with a live switcher
([PR #63](https://github.com/ali-wallick/Portfolio/pull/63)), not a merged treatment.

### Measuring the complaint changed its scope

The stated problem was about featured cards. One query answered whether that was the real problem:

| Page        | `<img>` |
| ----------- | ------- |
| `/`         | 0       |
| `/projects` | 0       |
| `/about`    | 0       |
| `/resume`   | 0       |
| `/contact`  | 0       |

**Zero images on every page a visitor lands on.** The only imagery on the site was on project detail
pages. #36's scope would have added thumbnails to two surfaces and left `/about` — the longest prose
page on the site — exactly as it was. Ali picked the wider scope once the number was in front of
her, which is the argument for measuring a complaint before designing against it: the fix she asked
for and the fix she wanted were different sizes.

### Reusing the Phase 5 switcher precedent, deliberately

`CLAUDE.md` already records why four palettes went behind one live switcher rather than four
branches: _"the only comparison that matters is flipping between them on the same page."_ The same
reasoning applied unchanged, so this reused the pattern rather than re-deriving it. The switcher
itself did not survive in git — no `data-palette` toggle exists on any branch or commit — so it was
rebuilt, which took about twenty lines. **Worth noting for next time: the pattern is more reusable
than the code, and the code was not kept.**

### No subagents, and that was the right call

Per the standing note on using them honestly: this was a single connected thread — measure, inventory
the media, build, verify — where every step depended on the previous one's output. Nothing fanned
out. A subagent would have started cold and rebuilt the same context.

The one place delegation would have paid was the poster-frame sweep across nine videos, and that
turned out to be a nine-line script rather than a research task.

### Two bugs the work walked into

Both were found by doing something adjacent, not by looking for them.

**Three archive projects embed a YouTube video that no longer exists**
([#61](https://github.com/ali-wallick/Portfolio/issues/61)). Found because the poster-frame script
got 404s. oEmbed returns 403 for all three; a live ID returns 200 from the same check. Those pages
serve a dead player today.

The interesting part is _why the content model missed it_. The guard table's whole thesis is making
the old site's mistakes unrepresentable, and `links[].dead` exists precisely because dead links
outlived their credits for years. **But `dead` only exists on `links[]` — `hero` and `gallery` have
no equivalent.** Storing YouTube as a bare ID removed the protocol bug and created the impression
the media problem was solved. A video ID is still a promise about a remote resource.

**The resume print block wins the cascade by load order, and the bundler decides load order**
([#62](https://github.com/ali-wallick/Portfolio/issues/62)). Adding a single component import to
`BaseLayout.astro` — a preview-only component with no styles — took `resume.pdf` from 1 page to 2
and `resume-full.pdf` from 2 to 3, with no CSS edited and no token added.

`resume.css` is small enough that Astro inlines it into a `<style>` tag; the bundle carrying
`tokens.css` and `base.css` is not, so it ships as a `<link>`. The two therefore reach `<head>` by
different mechanisms and their **relative order is a property of the module graph**. The print block
redefines tokens on `:root` and restyles `body` — same specificity as the screen rules it must beat
— so it wins only by coming last. Flip the order and the entire paper palette, type scale and 9.4pt
density stop applying at once.

This is the **third** distinct way that block has been beaten, and `CLAUDE.md` already documents the
other two (a denylist that misses new tokens; a selector that outranks a bare `:root`). The pattern
across all three is the same: _the print block is a pile of overrides that must win a fight it does
not control the terms of._

Two fixes were tried and rejected rather than shipped, which is worth recording because both look
right:

- **`:root:root`** fixes the tokens and does nothing for the plain `body`, `.layout` and `a` rules.
  A half-fix that leaves a comment claiming the hazard is handled is worse than none.
- **`inlineStylesheets: 'never'`** makes both files `<link>`s, but Astro then emits `resume.css`
  _first_ — converting an accidental correct order into a reliable incorrect one.

What shipped instead is a workaround with the cost stated plainly: the switcher is inline markup
plus gated inline strings, kept out of the module graph entirely. **That is a constraint no future
contributor would guess**, which is the argument for fixing it properly rather than living with it.

### The guard that worked

`npm run check:resume-print` — the print-geometry differ committed for
[#35](https://github.com/ali-wallick/Portfolio/issues/35) — diagnosed this in one run and named the
offending elements and values. It was the difference between "the PDF grew a page" and "the print
stylesheet is not applying at all."

Its limitation is that it only runs when someone runs it. The page-count assertion is what fires
automatically, and it only fires when the damage costs a **whole page**; the same failure at smaller
scale is the 19pt of silent reflow already recorded from Phase 5.

### A guard that was wrong, and only showed up when the site got its first decorative image

Thumbnails sit inside cards whose link text is already the project title, which makes them
decorative — `alt=""` is the correct markup, and alt text there would announce the name twice.

`scripts/check-links.mjs` rejected all of them. Its rule matched `alt="…"`, and the build minifier
collapses an empty alt to a valueless `alt`, which HTML5 defines as identical. So **every
correctly-marked decorative image failed a check written to catch missing alt text.** The rule now
distinguishes an explicitly empty alt from an absent one, which is the distinction it always meant
to draw — it had simply never been tested against an image that should not be described, because
until now the site had no images on those surfaces at all.

### Outcome: hybrid, and the site got a third width

Ali picked the hybrid on the preview — a photograph where one exists, generated
typographic art where none does. Recorded on
[#22](https://github.com/ali-wallick/Portfolio/issues/22), which unblocked
[#36](https://github.com/ali-wallick/Portfolio/issues/36).

**The comparison changed the answer rather than confirming it.** #22 had framed
the choice as _"a consistent set of five beats two real screenshots and three
compromises"_ — an argument for the all-generated route. Building it moved the
facts: poster frames covered all five featured projects, so the featured tier
stopped being where the media problem lived. **The archive tier is where the
decision actually bit**, and it was only visible by flipping — nine of twelve
tiles with a photo and three without reads as a broken grid, and the generated
fallback earns its place there and nowhere else.

That is the specific value a switcher has over a document: the argument on paper
was about the featured tier, and the answer was in the archive.

### The feedback that found a missing token

Ali, on the same preview: _"I wonder if we should reduce the max width of the
featured projects and increase the width of the 'current' box. It's kind of
strange they are different sizes."_

The cause was structural. The site had **two widths where it needed three**:
`--measure` is a _reading_ width, `--content-max` is the page, and a bordered
note or a card with a thumbnail in it is neither. Each had picked one, so they
sat 24rem apart with their right edges stacked. `--measure-wide: 52rem` is the
missing one, chosen against the content rather than as a midpoint.

Worth recording that **the first attempt fixed the homepage and broke
`/projects`** — narrowing the featured cards while leaving the archive grid at
full width reproduced the identical ragged edge one page across. The fix only
worked once every content block shared it. Narrowing the archive grid to three
columns also made each tile, and each thumbnail, bigger, which is the rare case
where the coherent answer is also the better-looking one.

### Deleting the instrument is part of the method

The scaffolding came out in one commit: **-341 lines**, and `BaseLayout.astro`
ended byte-identical to `master`. That equality is the point — it is the check
that proves preview-only machinery left no residue, and it is worth doing
deliberately rather than trusting a grep.

Two things the collapse had to get _right_ rather than merely delete, both of
which would have shipped silently:

- **The reticle script sat between the two switcher blocks** and came out with
  the first cut. Nothing would have failed; the site's signature interaction
  would simply have stopped existing.
- **`display: flex` lived on the rule that _showed_ the generated art**, not on
  the art itself, so removing the switcher collapsed its layout into a block
  stack. Caught by checking a computed style rather than by reading the diff.

The general lesson: **scaffolding that decides visibility tends to accumulate
layout declarations that belong to the thing being shown.** Deleting the
scaffold silently deletes those too. Both were found by verifying rendered
output after the removal, which is a step it is very tempting to skip when the
change is "just deleting the thing we already decided about."

---

## Phase 6 — the reticle's idle behaviour, 2026-08-21

#33 lists three soft design decisions, and tweening is the one that turned out to have a concrete
complaint attached rather than a vague unease. Ali's, verbatim: _"if you're navigating around the
screen it immediately starts reverting to the upper left and it gets really busy."_

### The busy part was the return trip, not the acquisitions

Worth separating, because the obvious fix — slow the reticle down, or damp it — would have been the
wrong one.

`reticle.ts` targeted `focused ?? hovered ?? home`, with no fourth state. So the brackets had exactly
two conditions: on something, or going home. Moving a pointer from one card to the next crosses a few
pixels of page background between them, and every one of those crossings was a full-width traverse
back to the nav pill and out again. **The motion nobody asked for outnumbered the motion that meant
something, roughly two to one, on any page with more than a couple of controls.**

The acquisitions themselves — the travel onto a thing you actually pointed at — were never the
problem. That is the device working.

### Idle is a state, so it gets a state machine and four candidate answers

The fix is structural rather than numeric: `current` (what the brackets are on) is now separate from
`focused ?? hovered` (what the pointer is on), and they are allowed to diverge. Everything else
follows from that one split.

| Mode     | On losing a target                                          |
| -------- | ----------------------------------------------------------- |
| `home`   | travel back immediately — Phase 5's behaviour, the baseline |
| `stay`   | hold the last target indefinitely                           |
| `linger` | hold, then travel home after a delay                        |
| `fade`   | hold, then fade out in place — and _cut_ to the next target |

Ali asked for the first three. `fade` is the one worth arguing for: if the long diagonal is what
reads as busy, then the honest fix is to stop travelling between distant targets at all rather than
to make the traverse gentler. It reuses `arm()`'s two-frame dance under a new `is-cutting` class that
suppresses the geometry transition while leaving opacity eased — so the brackets snap onto the new
box and fade up on it. An acquisition rather than a flight, which is also what a reticle in a game
actually does.

Two knobs came out of building it rather than out of the brief:

- **Settle** — a dwell before a _new_ target is acquired. The complaint is about the return trip, but
  there is a second source of chatter: a pointer travelling somewhere else drags the brackets through
  every control it crosses on the way. A 60–120ms threshold makes the reticle follow where you
  stopped rather than where you passed. Losing a target still takes effect immediately — delaying
  that would defeat the idle modes.
- **Travel** and **Curve**, which are #33's original tweening bullet: 500ms with zero ease-in is the
  old site's recovered character, adopted across all four Phase 5 directions and never once tuned to
  the one that shipped.

### Three things the switcher had to learn from #22

Same instrument, same three constraints, and none of them was obvious the first time:

1. **No new imports in `BaseLayout.astro`.** The bootstrap and the switcher are string constants, not
   components and not modules, because one component import reorders Astro's CSS bundles and takes
   `resume.css`'s print block out of the cascade — which silently turns a 1-page resume into 2 (#62).
2. **Bootstrap inline, in `<head>`.** `--duration` and `--ease` are read by every transition on the
   page. Applying them after first paint means the first hover of every navigation runs at the wrong
   speed, which is exactly the thing being judged.
3. **Gated on `showDrafts` at the markup _and_ the script.** A module imported from the bundled
   `<script>` ships to all 24 production pages whether or not the markup renders.

One constraint is new, and it is the kind of thing only building it surfaces: **the instrument must
not be a thing the reticle chases.** `FOCUS_SELECTOR` matches `input`, so without a guard every click
on a radio parks the brackets on the panel — in `stay` mode, the one where it is most distracting,
and while comparing the exact behaviour the panel exists to compare. One `closest()` call in
`match()`, deleted with the rest of the scaffolding.

### First pass on the preview narrowed four of the six groups

Ali's reactions, same session: 5s hold too long and 0.6s too short; 120ms settle definitely too long
and probably shorter than 60ms if anything; travel definitely not `Cut`, and 500ms too long. So the
option sets moved to sample the live region densely instead of spanning the whole plausible range —
hold 1.2–2.5s, settle 25–60ms, travel 200–400ms with the recovered 500ms kept only as the labelled
baseline to compare against.

She also asked for a knob the first pass didn't have: **the fade-out duration for mode D**, which had
been silently borrowing `--duration-fast`. Reasonable — how _long_ the brackets take to leave is a
different question from how long they wait before starting, and D is the mode where it's load-bearing.

That knob is a `var(--reticle-fade, var(--duration-fast))` **fallback rather than a token defined on
`:root`**, and the distinction is the one CLAUDE.md's standing rule is about: a real token has to be
added to `resume.css`'s `@media print` block too, because that block is a denylist and anything
nobody enumerated reaches the PDF. A name with no `:root` definition is not a token — there is
nothing to pin, and the reticle is `display: none` on paper regardless.

### A curve that overshoots is right for position and wrong for opacity

Second pass. Ali settled on D / 1.6s hold / 500ms fade / 25ms settle / 320ms travel / Overshoot, then
asked to test the fade-out duration against some fade-out **curves** — and the request turned out to
be pointing at a real defect rather than at a missing preference.

The fade was borrowing `--ease`, which at that moment was the overshoot curve. **Opacity is clamped
and position is not.** An overshoot sends a position past its target and back, which is the entire
appeal; sent through opacity it goes past fully transparent, clamps, and spends the overshoot sitting
at zero. Identical curve, and it reads as a bounce on one property and as a dead interval on the
other.

So `--reticle-fade-ease` is now separate from `--ease`, with four options that describe the _feel_
rather than the maths — Site curve, Linear, Hold-then-drop, Drop-then-trail. Worth keeping the
general form of it: **a shared motion token is shared across properties, not just across components,
and clamping is a property-level fact the token cannot know.**

Ali's answer to that group was ease-out, with a request for a couple of ease-outs to compare — so the
group became five of them and stopped offering anything else. The interesting part was **picking**
the five. Named curves (`easeOutCubic`, `easeOutQuint`, `easeOutExpo`) are a naming convention, not a
scale, and two of them can be perceptually identical at a given duration while two others are miles
apart. Computing the axis that actually differs — _how long the brackets stay readable_ — showed
`easeOutQuint` and `easeOutExpo` land 22ms apart at a 500ms fade, while `ease-out` and `easeOutExpo`
land 205ms apart:

| Curve                               | 90% faded by | Opacity at the halfway point |
| ----------------------------------- | ------------ | ---------------------------- |
| `ease-out` `(0, 0, 0.58, 1)`        | 370ms        | 31.5%                        |
| recovered `(0, 0, 0.25, 1)`         | 308ms        | 17.7%                        |
| `easeOutCubic` `(0.33, 1, 0.68, 1)` | 270ms        | 12.8%                        |
| `easeOutQuart` `(0.25, 1, 0.5, 1)`  | 220ms        | 6.6%                         |
| `easeOutExpo` `(0.16, 1, 0.3, 1)`   | 165ms        | 2.8%                         |

Quint was dropped for sitting on top of Quart and Expo; the five that shipped are evenly spaced on
the perceptual axis rather than evenly spaced in the easing catalogue. **A set of options is an
instrument, and an instrument with two identical marks on it is worse than one with fewer marks.**

The same measurement makes the labels honest: each option's tooltip says when it is 90% gone, which
is a fact about the fade rather than a bezier nobody can read.

**Settled the same day: `easeOutQuart`, written into `base.css` rather than left as a switcher
pick.** Locking a decision in means deleting its knob — the Fade curve group is gone and the value is
literal in the stylesheet with the measurement that chose it in a comment beside it. The general form
went into `CLAUDE.md`'s design standing rules, because "a shared easing token is shared across
_properties_, and clamping is a property-level fact the token cannot know" is exactly the sort of
thing a future session re-derives wrongly.

Worth noting what made this one lockable early, while the mode itself is still open: the fade curve
governs the scroll-off fade in **every** mode, not just D. A decision whose blast radius doesn't
depend on an undecided question can be closed out of order.

### Narrowing an option set strands whoever already picked a removed value

The bug this would have shipped is small and exactly the wrong kind. Ali's `localStorage` held
`hold: 600` and `settle: 120` — both removed. The panel would have rendered those groups with
**nothing checked while the old value stayed in effect**, so the instrument for judging behaviour
would have been quietly reporting the wrong behaviour, on precisely the settings she had just ruled
out.

The switcher now reconciles on load: a group whose stored value matches none of its options snaps to
its first option and writes that through. What is checked is always what is running.

Worth generalising, because it is the same shape as the `--reticle-fade` decision above and as
Phase 5's `:root[data-palette]` beat: **state that lives in two places needs one of them to be
authoritative, and the code has to say which.** Here the options are authoritative and storage is a
cache; the print block's failure was assuming `:root` was authoritative when a more specific selector
existed.

### Everything else settled the same day, and the scaffolding is gone

Ali took the rest of the panel in one pass: **D · linger-then-fade, 1.6s hold, 500ms fade, 25ms
settle, 320ms travel, overshoot curve.** All of it is written into `reticle.ts`, `tokens.css` and
`base.css`; the bootstrap, the panel, its script and its stylesheet are deleted, along with the
`match()` guard that existed only to stop the reticle chasing its own instrument. Net −18k characters
against the peak of the branch.

**The motion tokens are no longer the recovered values, and that is the headline.** `--ease` and
`--duration` had been `cubic-bezier(0, 0, 0.25, 1)` at 500ms — the old site's own curve and duration,
carried through all four Phase 5 directions untouched. They are now
`cubic-bezier(0.34, 1.28, 0.64, 1)` at 320ms. The family is unchanged: still zero real ease-in, still
launching at full speed and decelerating hard. 500ms was the part that read as sluggish rather than
characterful once the reticle put it in front of you on every hover.

Two measurements decided things that would otherwise have been assumptions:

- **`1.28` is a control-point ordinate, not a peak.** The curve's actual overshoot is **2.6%**.
  That matters because `--ease` also drives `color`, `background-color` and `border-color`, all of
  which clamp per channel — an overshoot distorting hue mid-transition would have been a real bug.
  At 2.6% the real colour pairs clamp by 3–6 RGB units for a few milliseconds. Imperceptible. The
  worry was worth having and the answer was worth measuring rather than guessing either way.
- **`--duration-fast` stayed at 250ms deliberately.** It used to be half of `--duration` and is now
  most of it, which nearly collapses the distinction between "fast" and "normal". Left alone because
  it was never in the comparison: the site was judged and approved with this exact pairing, and
  quietly changing it would have altered something already signed off. Recorded in `tokens.css` as
  something to revisit on purpose rather than as a side effect.

### What ships either way

The split that made the branch safe at every point: the modes ship, the panel does not. `MODE` was a
constant in `reticle.ts` defaulting to `home` while the comparison ran, so production behaviour was
unchanged until a mode was picked — the panel was scaffolding, the state machine was the feature.
The branch was mergeable before the decision as well as after it, which is a useful property for
anything gated on someone else's judgment.

### One issue was three issues, and the tell was that finishing one taught nothing about the others

#33 was booked as "the faces, colour calibration, tweening" — three things deferred in the same
conversation at the close of Phase 5, which is why they shared a number. Working one of them showed
that shared origin was the _only_ thing they shared.

The tweening turned out to be a state-machine change driven by a concrete usability complaint. The
faces are a comparison with a CLS hazard attached, because `--measure` is written in `ch` and `ch` is
font-dependent. The calibration is three hand-fitted contrast values plus a duration ratio. **Nothing
learned doing the first transfers to the other two**, which is the working definition of separate
work — and a single issue hid that by presenting them as a list.

So #33 was rescoped to the tweening, closed, and reissued as #66 (faces) and #67 (colour
calibration), each carrying its own constraints written in rather than referenced. #23, which
sequences the deferred revisit passes, went from three to four.

**The heuristic worth keeping:** an issue listing several things is fine when they will be worked in
one sitting and share a decision. When the list is really "things deferred at the same moment", it
will not survive contact with the first one, and splitting it _after_ doing that one is cheap —
splitting it before is guesswork.

### Verification

`npm run verify` clean. The switcher is absent from a production build (0 occurrences in
`dist/index.html`) and present on a `SHOW_DRAFTS=true` one. Print geometry matches the committed
baseline and both PDFs are still 1/1 and 2/2 — the regenerated `public/*.pdf` and lock file in this
branch are the base.css hash changing, not the document moving.

All four modes were driven with a real pointer in the browser rather than asserted: `linger` holds on
a card with the pointer parked elsewhere and then travels home; `stay` was still on card 03 three
seconds after the pointer left it; `fade` reaches `opacity: 0` after its hold and comes back with
`is-cutting` set.

**One thing to know if you verify this the same way:** the browser pane reports `document.hidden` as
true, which throttles `requestAnimationFrame` to nothing. Every placement in this file goes through
`schedule()`, so a synthetic-event harness reads as though _no_ mode does anything — all four return
identical transforms. That is the harness, not the code. Real pointer events and screenshots force
frames; synthetic `dispatchEvent` does not.

---

## Phase 6 — the faces, and what measuring them first changed, 2026-08-22

[#66](https://github.com/ali-wallick/Portfolio/issues/66), the first of #33's two survivors. This
entry covers building the instrument; the decision it exists to support has not been made yet.

### Choosing the option set by measurement ruled out a third of the catalogue picks

The issue carried a rule from the tweening pass — _"a set of options is an instrument, and an
instrument with two identical marks on it is worse than one with fewer marks"_ — and the cheapest way
to honour it turned out to be doing the measuring **before** writing any of the switcher.

Nineteen faces were loaded headless at a 100px em and measured for x-height, cap height, descender
depth and advance width. Seven were then dropped for landing on a mark another candidate already
occupied. Two of those were faces that would certainly have shipped on a catalogue pick:

- **Atkinson Hyperlegible Next** was on the list as the maximum-aperture end of the axis. It measures
  64.8 wide / 49.6 x-height against Figtree's 64.1 / 50.0 — the same mark to within a percent. Its
  differences are real but they are not on the axis a body face is judged on at 16px.
- **Familjen Grotesk** (56.7 / 0.769 x-cap) sits on top of Archivo (57.3 / 0.767). Indistinguishable
  as an option, so one of them is just a longer list.

**The measurement also refuted the reason `tokens.css` gives for the incumbent mono.** DM Mono is
justified there as "narrow enough to survive the metadata strip, which on this site can run to six
fields." Every credible mono measured is **exactly 0.600em per character** — DM Mono, IBM Plex Mono,
JetBrains Mono, Geist Mono and Roboto Mono are identical to two decimal places. The stated reason
does not discriminate between any of them, and picking on width would have been picking on nothing.
What does differ is apparent size: JetBrains sets an 11% taller lowercase than DM Mono at the same
nominal size, and Geist's descenders are a third shallower, which is very visible on a stacked
six-field strip. So the mono role's axis is x-height, and the instrument is graduated in x-height.

That is the generalisable part: **the axis you would name from the catalogue is not always the axis
the faces actually differ on**, and the only way to find out is to measure before choosing.

### `--measure` does not appear to be 68ch of Figtree

Not acted on, because the value was signed off visually and this branch is not the place to move it —
but it should be resolved when the face is picked, since the winner needs a correct number anyway.

`tokens.css` says, in a comment written to be load-bearing: _"Measured, not estimated: `68ch` in
Figtree Variable resolves to 40.4rem."_ Two independent methods disagree. Figtree's `0` advance is
0.6408em, so 68ch is 697px is **43.58rem**; a `width: 68ch` probe in the live page returns 43.58rem
as well. 40.4rem is about **63ch**, and it is not the fallback stack's number either — system-ui
measures 42.83rem in the same probe.

The rendered column is whatever was approved and nothing is visibly wrong. What is wrong is the
comment's claim about where the number came from, which is the kind of thing the guard table exists
to prevent, so it is written down rather than left to be re-derived.

### The panel is inline for a new reason as well as the old one

Two constraints carried straight over from #33's switcher and needed no rethinking: no new imports in
`BaseLayout.astro` ([#62](https://github.com/ali-wallick/Portfolio/issues/62)), and the bootstrap
inline in `<head>` so the first paint is not the previous selection reflowing into the new one.

A third is new. #33 put its panel's stylesheet in `base.css`, which meant every commit in that
comparison also regenerated `public/*.pdf` and `scripts/resume-pdf.lock.json`, because the lock hashes
`base.css`. Harmless there; wrong here. **This is a comparison of type, and `base.css` is where type
is applied** — a diff that touches it is a diff nobody can skim, exactly when skimming the diff is how
you check the comparison is fair. The panel's CSS is a gated inline `<style>` instead, and
`base.css`, `tokens.css` and `resume.css` are byte-identical to master for the whole exercise.

### Twelve font files cannot be imported, so they are generated

`import '@fontsource-variable/inter/wght.css'` is the obvious way to get a candidate onto the page and
it fails twice: imports are unconditional, so `showDrafts` cannot stop nine candidate faces shipping
in production CSS on all 24 pages, and any new import in `BaseLayout.astro` perturbs the module graph
that #62 is about.

So `scripts/preview-fonts.mjs` copies the latin `woff2`s out of `node_modules` into a gitignored
`public/preview-fonts/` and lifts each `@font-face` block out of the `@fontsource` package's own CSS,
rewriting only the `url()`. Lifting rather than hand-writing is deliberate: a hand-written block has
to restate the variable weight range, and getting that wrong produces a synthesized weight that then
gets judged as the face's fault.

`BaseLayout` reaches it through a literal `<link>` string, which the bundler cannot see. The controls
are built at runtime from a generated `faces.json`, so the candidate list, its labels and its measured
notes live in one file — and the panel cannot render a face whose file was not copied.

**Candidates are deliberately not preloaded**, unlike the three shipped faces. Twelve preloads would
fetch every candidate on every page to render one of them, and the loading behaviour worth measuring
is the winner's, which gets its own preload when it ships.

### Catching the reticle at the panel's edge beats teaching the reticle about the panel

`FOCUS_SELECTOR` in `reticle.ts` matches `input` and `summary`, so without a guard every click on a
radio parks the brackets on the instrument — while comparing the exact thing the instrument exists to
compare. #33 solved this by adding a `match()` guard inside `reticle.ts` and deleting it afterwards.

Stopping `pointerover` and `focusin` in the capture phase at the panel's own root is better on two
counts. `reticle.ts` stays byte-identical to master, so no production code changes for a preview-only
problem. And the brackets **hold** whatever they were last on instead of being cleared, which is what
`fade` should do while you fiddle with a knob — the guard produces the right behaviour rather than
merely suppressing the wrong one.

Verified rather than assumed: a document-level listener saw `pointerover` from the nav link and saw
nothing at all from a click on a radio, while the radio's selection still applied.

### Three bugs, all in the difference between "unlikely" and "impossible"

1. **The instrument measured the fallback, not the candidate.** Because candidates load lazily, the
   _first_ selection of any face computed `68ch` before that face arrived — reporting 42.83rem for IBM
   Plex Sans, whose real answer is 40.80. This is the CLS hazard `tokens.css` warns about, appearing
   inside the tool built to judge it. Fixed by re-measuring on `document.fonts` `loadingdone`;
   `ready` only ever covers the first paint.
2. **Deleting the source directory broke the running preview.** The first cut had a production build
   delete `public/preview-fonts/`. But `verify` runs `build`, and `astro dev` serves `public/` from
   disk per request — so a verify run mid-comparison silently pulled the candidate faces out from
   under the dev server. Pruning the _output_ (`dist/preview-fonts/`) leaves the running preview alone
   and still makes the leak impossible.
3. **A preview branch pruned its own fonts.** `build-ci.mjs` passed `SHOW_DRAFTS=true` in the child
   env for `astro build` only, so the prune step read it off its own process, found it unset, and
   deleted the 16 files it had just generated. The build looked completely healthy: 24 pages, switcher
   markup present, stylesheet linked, and a panel that would have removed itself on a 404. Fixed by
   hoisting one `env` object that every child gets.

The third is the one worth remembering. **A flag applied per-child-process is a flag that can be
applied to one step and missed by the next**, and the failure was invisible to every existing guard
because nothing it checks was wrong.

### Verification

`npm run verify` clean. Production build (`WORKERS_CI_BRANCH=master npm run build:ci`): zero
occurrences of `face-switcher` in `dist/about.html` and no `dist/preview-fonts/`. Preview build
(`WORKERS_CI_BRANCH=phase-6-faces`): switcher present, 16 font files served. `public/` intact after
both, so the dev server running the comparison survives a build.

All twelve faces were driven in the browser and confirmed to reach `--font-body`, `--font-display` and
`--font-mono`; selections persist across navigation; "fit column to face" reproduces the offline
measurements exactly (43.58 / 42.90 / 40.80 / 33.80rem) and "reset to shipped" leaves no inline style
behind. Print geometry matches the committed baseline and the PDFs are untouched — the design system
files were never edited, which was the point.

### Outcome: no change, and that is a real answer

Gabarito, Figtree and DM Mono held against all eleven alternatives. Nothing about the shipped type
changed — the switcher, `scripts/preview-fonts.mjs`, and the eleven candidate `@fontsource` packages
were deleted, and `BaseLayout.astro`, `tokens.css`'s declarations, `base.css` and `resume.css` are all
byte-identical to master again. `tokens.css`'s Type comment was corrected in place (DM Mono's
rationale was wrong — see above — and now says why the incumbents were confirmed) and now points here
rather than restating the measurement.

Asked separately, and worth recording because it was a real check rather than a formality: whether
any of the three read as a default an AI coding assistant would reach for unprompted, which is exactly
the "obvious a game developer made this, not obvious which template they used" brief Phase 5 opened
with, applied to type instead of layout. 2026's discussion of AI-generated-site tells names Inter,
Space Grotesk and Geist specifically and repeatedly — Inter as shadcn/ui's default and the most common
face in the training data itself, Space Grotesk as "the model's idea of edgy," Geist for its
saturation in Vercel/v0 output. None of the three shipped faces appear on any such list. Two of the
named offenders — Space Grotesk and Geist Mono — were in fact among the eleven the switcher compared
them against and rejected, which is a coincidence worth noting rather than a validation: the
comparison wasn't run to check for this, and would have kept whichever face won regardless.

One finding surfaced by the measurement was **not** acted on, on purpose: `tokens.css` claims `68ch`
of Figtree "measures" 40.4rem, and it measures 43.58rem by two independent methods (a headless glyph
measurement and a live `68ch` probe on `/about`). The rendered column is unaffected — 40.4rem was
signed off visually in Phase 5, not derived from that claim — so correcting it would mean touching
`--measure`, a layout decision this issue was never scoped to make. Filed as
[#68](https://github.com/ali-wallick/Portfolio/issues/68) rather than fixed quietly, per the standing
rule: a follow-up found mid-task is an issue, not a comment or a doc edit.

Closes #66.

## Phase 6 — the colour calibration, 2026-08-22

The last of the three items #33 split into. Ali asked to look at it directly by name — "let's explore
the site with some different versions" — rather than it surfacing from a punch-list sweep, which
turned out to matter for scoping: half of #67 had already shipped outside the switcher loop entirely.

### Part of the issue was already closed before the switcher existed

`--color-plate`'s retune from a 1.67:1/1.77:1 split to a flat 2.2:1 shipped directly in a prior
look-polish commit, not through a live comparison. That's not wrong — the fix was correct — but it
meant #67 as filed no longer matched the state of the repo, and building a switcher for "three
hand-fitted values" without checking which of the three still needed fitting would have compared the
wrong things. Asked first, via `AskUserQuestion`: scope to just `--color-index` (the genuinely open
item), or put the plate back on the switcher too for the scrutiny it skipped. Ali chose both — put the
plate back on, not to change it, but so the "confirmed on a live switcher" bar every other calibration
decision cleared also applied here.

### The switcher hit a real prettier bug neither prior one did

`prettier-plugin-astro` cannot parse a `<script>` with a braced statement body when it's nested
directly inside a `{condition && (…)}` JSX expression. Reproduced in isolation, methodically, because
the first four shapes tried all failed identically and that pattern was worth confirming before
working around it: `is:inline`, `define:vars`, a plain `function` declaration, and a true IIFE all hit
"Unexpected token" at the exact same place — the first real statement past the opening `{` of the
function body. A single-line script with no braced body of its own (`<script>import '...';</script>`)
parsed fine in the same nested position, which is what pinned the actual trigger down to "a block
body of its own," not "any content" or "any nesting."

Neither #65's tweening switcher nor #66's font switcher hit this, most likely by accident of how their
inline scripts happened to be shaped rather than because the bug doesn't apply to them. Worth a note
for whoever builds the next one: don't assume a nested `<script>` with real logic in it will format
cleanly just because the last two did.

The fix that stuck: the bootstrap script, which has to run synchronously in `<head>` before first
paint and so can't be a deferred `import`, is built as a template-literal string in the frontmatter
(with the candidate data embedded via `JSON.stringify`) and injected with `<Fragment
set:html={calBootstrapScript} />` — a JSX attribute expression, not a nested script tag, so prettier
never tries to re-parse its contents as JS-in-JSX at all. The panel's wiring script doesn't need to
run before paint, so it stayed a normal external module (`src/scripts/calibration-panel.ts`) referenced
by a single-line `<script>import ...;</script>` — the shape that was already safe.

### A ratio search landing under its own target, caught before shipping

The first pass of candidates for `--color-index` computed the darkest/lightest hex whose contrast was
_closest_ to each target ratio. For 4.5:1 that produced `#726c87` (light, actual 4.499:1) and
`#807aa1` (dark, actual 4.479:1) — both labelled "quiet (AA floor)" on the switcher and both, measured
precisely, just under it. Binary-searching for "closest to target" instead of "at least target"
is the kind of rounding error that reads as correct at a glance and isn't: 4.499 displays as 4.5 in
anything that rounds to one decimal, including a switcher label written by the same script that
computed it.

Fixed by changing the search itself — find the value closest to the ground that still clears the
target, not the value closest to the target ratio — and rerunning before anything shipped. The
corrected values, `#716c87` (4.512:1) and `#807ba1` (4.521:1), are the ones in `tokens.css` now. This
is the same category of bug the Phase 5 gate's contrast audit exists to catch — a number that looks
like a design choice and is actually a measurement error — just caught a step earlier this time,
before the candidate reached the switcher rather than after a decision was made from it.

### Outcome

`--color-index`: 4.5:1 (measured 4.512:1 light / 4.521:1 dark), down from the Phase 5 hand-fit of
5.5:1 — as quiet as the ranking numbers can go while still clearing the AA floor for text every other
text colour on the site is held to. `--color-plate`: confirmed at 2.2:1 in both themes, unchanged, but
now backed by the same live-comparison bar as everything else in this section rather than a
look-polish commit's say-so.

The switcher's scaffolding — the panel and bootstrap in `BaseLayout.astro`,
`src/scripts/calibration-data.ts`, `src/scripts/calibration-panel.ts` — is gone; `BaseLayout.astro` is
byte-identical to master again. `tokens.css`'s comments carry the decision and the corrected
40.4rem-style provenance note this time, rather than pointing back here for it — the three-values
list Ali flagged as "may read differently after living with the site" started right here, so the
answer belongs where the next person editing a contrast value will actually look.

Closes #67, and with it the last of the three things #33 split into on 2026-08-21.

---

## A voice skill, built from measurement rather than adjectives (2026-08-24)

Ali's ask before starting the wording pass (#31): a skill for writing copy, with enough direction to
dodge the obvious AI tells without writing strangled prose to avoid them. Her own framing of the
nuance was the useful part — _"groups of 3 is fine as long as it's not excessive and constant."_

### Describing a voice doesn't work; measuring one does

`CLAUDE.md` already had voice conventions, and they're good ones — first person, past tense, specific
over impressive. But every one of them is a quality an agent can believe it is satisfying while
producing something that reads nothing like Ali. "Specific over impressive" doesn't tell you her
sentences are 17 words long.

So the skill was built the same way the colour, font and motion decisions were: measure first, then
decide. Two corpora already in the repo turned out to be enough — `content/archive/` (20 blog posts,
2010–2019, ~5,100 words of unedited first-person Ali) and `snapshot/` (the old site's About and
project pages, more considered but still hers). The 2019 resume bullets preserved in
`src/content/jobs/*.md` are a third, in a different register.

Two gaps came out of it, both larger than expected:

|                        | Ali's blog           | Site copy, 2026-08-24 |
| ---------------------- | -------------------- | --------------------- |
| Mean sentence length   | **17 words**         | 32                    |
| Em dashes per 1k words | **0.2** (one, total) | 15                    |
| Exclamation points     | 117 in 5.1k words    | 2 in 5.7k             |

**The em dash was the tell everyone already suspected** — #31 flagged it from reading, Phase 4 had
noticed it in resume genre. The measurement is what makes it undeniable: one em dash in 5,404 words
of her own writing against 91 in the site's. She reaches for a spaced en dash 45 times instead
(_"check it out – I even got an interview"_) and for parentheses constantly.

**The sentence length was not suspected, and it's the bigger one.** The site's copy is not
occasionally long-winded; it is uniformly double her natural length. That's the kind of thing you
cannot see by reading a page you wrote, and it outranks any word-choice rule — a page can avoid every
banned phrase and still not sound like her if every sentence carries three clauses. The two are
related: splitting a 32-word em-dash sentence into two 16-word sentences fixes both at once.

**The exclamation gap is real and deliberately not being closed.** 117 to 2 is a genre difference, not
an error — a blog post about winning a game jam is not a portfolio page a hiring manager skims. What
it does establish is direction: her natural register is warmer than the site currently is, and
"warmer than this" is actionable where "add exclamations" would be a disaster.

### The trope guidance is dosage, not a denylist

A banned-word list produces prose that reads as strangled, which is its own tell. Running the trope
checker against Ali's own blog settled the design: she trips "not just X but Y", "journey", and a
hedging stack once each, and reads perfectly human. So the skill splits tells into two lists — things
bad only in bulk (triads, antithesis, punchy fragments, bolded lead-ins, all of which she uses) and
things not hers at any dosage (em dashes, _leverage_/_robust_/_seamless_, "passionate about", inflated
adjectives on real numbers). **One is a sentence, four is a signature.**

### The checker is advisory on purpose

`.claude/skills/write-copy/scripts/copy-stats.mjs` reports tell counts and drift from the measured
baseline, and `--baseline` re-derives Ali's numbers from `content/archive/` so the comparison can't go
stale silently. It is deliberately **not** wired into `npm run verify`, which is a departure from this
repo's usual instinct to turn every finding into a build guard. Tone isn't gateable: every number in
it has a legitimate reason to be exceeded, and a CI job that fails on em-dash density would be
optimising the one metric instead of the writing. The point is that exceeding a number happens on
purpose rather than by accident.

Two bugs while building it, both the same shape as ones this log has recorded before: a `rather \w+`
hedging pattern that fired on every "rather than", and an "off baseline" flag that scolded text for
using **fewer** em dashes than the baseline. Both are the failure mode of a measurement whose
direction was never stated — the same category as the contrast search that found the value _closest
to_ 4.5:1 instead of the one that _clears_ it.

### Still thin

The corpus is real but it is mostly 2010–2015 Ali, and there are exactly two posts after 2015. Nothing
in it is her writing at Second Dinner, and nothing is her writing about senior engineering work. Ali
offered to look through Google Docs for more; anything from the last five years would sharpen the
baseline considerably, and the checker's numbers are cheap to re-derive when it turns up.

### The second corpus confirmed the finding and corrected the reasoning (2026-08-24)

The section above was written from the blog alone, and flagged its own weakness: mostly 2010–2015
Ali, two posts after 2015, nothing about senior engineering work. Ali then supplied five documents —
two cover letters (2016, 2019), a client email, a warranty escalation letter, and a volunteer
synthesis doc, 2016 to 2024. About 4,200 words of adult writing, most of it persuasive.

**It confirmed the sentence-length finding in the strongest possible way.** Blog: 17.0 words. Documents:
17.2. Fifteen years apart, different genres, different decades of her life, and they agree to within
two tenths of a word. That moves "17 words" from an observation about a blog to a fact about how Ali
writes, which is a much better thing to hand an agent. The em dash held up too — zero across 4,200
words, so the combined figure is one em dash in 9,331 words of hers against 91 in the site's 5,743.

**It corrected two things.**

The reference file had claimed Ali never used "utilize" or "passionate about." She uses both — in the
cover letters. The interesting part is _where_: the cover letters are, by a distance, the least
her-sounding writing in either corpus. No specifics, no parentheticals, no stated motive, no evident
interest in anything. So the guidance survived with a better reason attached. Those words aren't
banned because she dislikes them; they're a symptom of writing to a form instead of about a thing,
and hitting one is a prompt to check whether the whole paragraph has gone generic. That's a more
useful rule than a denylist entry, and it could only come from a corpus that contained her writing
badly.

The other correction: contractions and exclamations are **genre-dependent, not voice traits**. 17
contractions per 1k words in the blog, 0.7 in the formal documents. The first version of the skill
carried a single sitewide contraction baseline, which would have pushed résumé bullets toward blog
register. Both metrics are now reported for context and explicitly marked as not-to-tune.

**And it added three devices the blog didn't show.** The documents are structured in a way the blog
isn't: she concedes the other side's point in full and then declines to drop hers (_"This is pretty
clearly a problem caused by Dometic and not HC. […] However, I did several hours of free research."_),
she presses with rhetorical questions in bursts, and she organises long arguments as a bolded label,
a colon, and plain explanation. That last one is independent confirmation that the Marvel Snap page's
bolded lead-ins — written months earlier, from instinct — are genuinely her shape.

**The documents are not in the repo, and that was a real trade.** They carry phone numbers,
third-party names, and personal matters with nothing to do with the portfolio, and #48 may make this
repo public. So their measurements are recorded in the reference rather than being re-derivable, and
`--baseline` on the checker still only re-derives the blog numbers. Recording a number you can't
recompute is exactly the kind of thing this repo's content model exists to prevent, so it's worth
being explicit that it was chosen rather than overlooked: Ali has the files, and the alternative was
committing someone's phone number to a repo that may go public.

### A fourth corpus, and a number that had been wrong the whole time (2026-08-24)

The section above closed by naming the gap: nothing in the corpus was Ali writing about technical
work for someone else to read. A web search for her name surfaced exactly that — MobilityWare's 2017
"Meet Ali Wallick" Q&A — and then couldn't retrieve it. Tumblr is outside this environment's egress
allowlist, and the only version available was a search-engine summary.

**That summary was deliberately not used, and the reasoning is worth keeping.** A search summary is
the engine's sentences about her answers, not her answers. Folding it into a voice reference would
have contaminated the instrument with precisely the smoothed-out generic register the reference
exists to detect — and nothing downstream would ever have flagged it, because it would have been
sitting in the file labelled as evidence. Ali pasted the real text instead.

**Four corpora now agree.** Blog 16.9, documents 17.2, interview 14.6, chat 17.5. Sixteen years, five
genres, careful writing and unedited writing. The sharpest single statement of it: **the longest
sentence in the entire 2017 interview is 27 words, which is shorter than the site's average of 32.**

**And the em dash count was wrong.** Every prior version of this log, the skill, and `CLAUDE.md` said
"one em dash in Ali's writing." Computing the total across all four corpora with consistent stripping
found zero, and located the phantom: it is in a `note:` field in `content/archive/`'s front matter,
written by a previous agent explaining a missing publication date. An agent's own prose, counted as
Ali's, inside the file that documents what Ali sounds like.

The error was harmless in its conclusion — one and zero point the same way — but it is a clean
example of the thing this repo keeps rediscovering: **a measurement is only as good as its extraction
step, and the extraction step is where the bug lives.** Same family as the contrast search that found
the value closest to 4.5:1 instead of the one clearing it, and the `ch`-unit measure that was
correct in every way except which font was loaded. The fix was to compute all corpora through one
stripping function and print the total, rather than accumulating per-corpus figures across three
commits and adding them up.

**One finding from the interview isn't about voice at all.** Ali describes her draw to front-end work
as combining "the logic of programming and creativity of design." The old `about.html` independently
says the Computational Media major "provided the perfect blend of creativity and logic." Same claim,
unprompted, years apart, in two sources neither of which was written with the other in view. That is
her own thesis about her work, and it is a better answer to "why UI engineering" than a wording pass
would invent. Recorded in the reference so #31 uses the line she already has rather than writing a
new one.

The interview also supplied two positive markers the earlier corpora had underweighted: she leads
with an enthusiasm verb constantly (five "I love"s in 320 words, against a site that records what she
did and almost never that she enjoyed it), and she names specific things rather than categories —
Blendoku, Carcassone, Castles of the Mad King Ludwig, not "board games."

---

## The resume formality pass (2026-08-26, #32)

Ali's brief was one sentence of direction and one of latitude: significantly more formal than the
rest of the site, and "don't be constrained by" the existing skills. Both mattered. The formality
call turned the pass into a genre problem rather than a wording one, and the latitude is what made
it fine to change the schema instead of only the strings.

### The primary source had to be decoded before anything could be judged

"Revisit the original resume content" pointed at `resources/WallickAli-Resume.pdf`, which is kept
deliberately (#40) and had never actually been read by an agent. It's a subset-font PDF: `grep`
returns nothing, the machine has no `pdftotext`, and the Read tool needs `pdftoppm`. Decoding it
meant pulling the `/ToUnicode` CMaps out of the object table and mapping the two-byte codes by hand,
about thirty lines of Python.

Worth the detour, because the document turned out to disagree with the current one structurally, not
just tonally. It had a **Summary** section and a **Personal Projects** section that Phase 4 dropped,
and — the finding that shaped the whole pass — **every bullet was labelled**: "Vegas Blvd Slots:",
"UI Programming:", "Client Engineering:", a short topic label then a clipped clause.

That reframed the register question. The choice put to Ali wasn't "how formal" in the abstract, it
was wording-only versus **restoring a format she had chosen herself in 2019**, which is the same
not-a-template-by-construction argument the Phase 5 palette revival won on. She picked the format.

### The voice checker had never measured a resume bullet

`copy-stats.mjs`'s `strip()` removes front matter. Resume bullets _live_ in front matter. So
pointing the default mode at `src/content/jobs/*.md` measured the "Source material (2019 resume,
verbatim)" bodies — the 2019 bullets — and reported them as if they were shipped copy. Silently,
for as long as the script had existed, while `write-copy`'s own description listed "resume bullets"
as in scope and §7 said to measure.

A `--resume` mode fixes it: reads `highlights` + `highlightsExtended`, joins each bullet the way a
reader meets it (`Label: text`), and scores against a résumé baseline where contractions and first
person are zero _by definition of the genre_ rather than by measurement. It also carries four
formality tells the prose mode doesn't — colloquial verbs, "plus" as a conjunction, contractions,
label-shaped fragments.

The opening measurement it produced is the number the pass ran on: **20.2 words per sentence against
the 2019 resume's 13.2**, with seven colloquial verbs and three narrative fragments. The same shape
as #31's finding, in a different genre, pointing the other way — the bullets read like site prose.
Shipped state is 17w, longest sentence down from 39w to 25w, and the remaining excess is
enumerations, which are the genre and were left alone.

**The parser had to be rewritten mid-pass**, which is its own small lesson: it was written against
the flat `- >-` string format and kept working after the schema changed to `{ label, text }`,
quietly counting `label:` and `text: >-` as words and reporting no improvement at all. A tool that
silently keeps running against a changed format is worse than one that breaks.

### A measurement taken at the wrong viewport inverted a conclusion

The one thing in this pass that went properly wrong. #32 asked whether the print density (9.4pt/1.3)
should loosen, having assumed it was "tuned to fit, not chosen".

Probed with Playwright at its **default 1280px viewport**, the one-pager rendered 740px into a 960px
budget and the two-pager came to 1.05 pages. Read as: 2.3 inches of slack, type has been small for no
reason since Phase 4, and the two-pager is a one-page document with four lines dangling. All three
conclusions were wrong, and they were wrong for one reason — **prose wraps to far fewer lines at
1280px than it does at paper width**, so every height came out roughly 200px light.

Raising the type to 11pt on that basis overflowed both documents. `build-pdf.mjs`'s page-count
assertion caught it immediately, which is exactly the guard Phase 4 built it to be.

Measured properly (701px: letter's 8.5in less `@page`'s 0.6in side margins, times 96), the shipped
one-pager renders **954px into 960px**. Six pixels of slack. **#32's premise was wrong and its
instinct was right**: the density really can't loosen, and the honest lever really is fewer bullets,
which it had already said. Raising to ~10.25pt costs roughly two one-pager bullets, so it went back
to Ali as a content decision rather than being taken as a CSS one.

Two things generalize. **A geometry measurement carries its viewport as a hidden argument** — the
number is meaningless without it, and "0.77 pages" looked authoritative enough that it went into a
source comment before anything checked it. And the layered guards did their job in order: the
page-count assertion caught the overflow, then the #35 print-geometry differ caught a _second_,
quieter bug in the revert — a `sed`-style replacement whose pattern matched `.resume-role` before
`.resume-job-meta`, leaving one at 9pt and the other at 10.5pt. Nothing about the page count would
ever have shown that. The differ named the element and the property.

The final diff across both routes: **214 elements moved, zero non-geometry property changes.** Every
difference was position or size, which is what adding labels and two sections should do, and
confirmation that no colour or type token leaked to paper.

### Scope that was flagged rather than absorbed

- **`docs/LINKEDIN.md`'s hand-authored `About`** had never been through #31, because #31 walked the
  site's rendered pages and this text lives in a generator script. It still carried three em dashes
  and the exact "taught me a lesson" closer `write-copy` bans by name, stacked with a thesis-colon
  and a "not X, but Y" antithesis in one paragraph. Reworded here, register left warmer than the
  resume. **A generated file is a place a wording pass forgets to look.**
- **The apostrophes**, which #32 listed. Not a resume problem: the resume is internally consistent
  and the mismatch is sitewide, and the original deferral note's reasoning (fixing only the resume
  creates a _third_ state) still holds. Opened as #188.
- **Game Over Ever After** has no `projects` entry — removed at `906efc9` (#61) for lack of a `hero`.
  A resume line needs no image, so it appears in Personal Projects sourced from the 2019 resume and
  the snapshot, and `resume.ts` records why it can't be derived.

### Cost notes

Opus 5, one session, no subagents. The judgment was easy and the same as Phase 4's: the surface was
four job files, one schema, one component, one stylesheet, two skills, and a generator — all
readable directly, none of it a genuine unknown worth a cold context. The expensive part wasn't
breadth, it was the three build-measure-revert cycles on density, which no amount of fan-out would
have helped.

### A third viewport trap, and this one was in a guard (2026-08-26)

The density measurement inverted a conclusion by probing at 1280px instead of paper width. Then the
`update-resume` skill's own guidance repeated the mistake. The third instance was the guard itself.

`scripts/check-resume-print.mjs` set no viewport, so it ran at Playwright's default 1280px while
calling `emulateMedia({ media: 'print' })` — print CSS at a screen width, a rendering that exists on
no page and no sheet of paper. It still caught every bug #35 built it for, because colour, font,
weight and tracking are width-independent. Reflow is not. Trimming the I Fits I Sits bullet from
three printed lines to two moved **zero** elements through the differ; at 1280px both versions
occupied the same two lines. Set to 701px, the same edit moves **92**.

Two things worth keeping from it. **A guard that emulates one thing and measures under another is
not obviously broken** — this one was demonstrably working, on real bugs, for its whole life, which
is exactly why nobody looked. And the fix was verified by putting the old wording back and watching
the count go 0 → 92, rather than by regenerating the baseline and trusting it, which would have
proved nothing.

### Spending the slack, and a measurement that finally paid (2026-08-26)

The pass has two halves, and the second one only became possible because the first one shortened the
document. Once the "Previously …" line and the per-entry locations came off, the one-pager had ~110px
of room, and the question flipped from _what has to go_ to _what is missing_.

**The gap was found by reading the subtitle against the bullets.** Marvel Snap's group intro says
"client then feature engineer" — and the one-pager then showed four bullets of architecture,
platform and pipeline work, nothing a player touches. The feature-engineering bullet existed the
whole time, stranded on the two-pager. Promoting it moved it unchanged, which is what the superset
invariant is _for_: a bullet is promoted, never rewritten, so the two densities cannot drift.

**The project pages held three facts the resume had never carried** — the card credits feature, the
CJK/Thai font work, and the Unity Editor tooling. That is the resume's version of `content-pass`'s
rule about reading `snapshot/` first: a job's `highlights` are a compression of its project page, and
compressions lose things silently. Worth flowing the other way too — the language count went onto
both surfaces, since the project page had no number either.

**The best scale number turned out to be the one Ali owned.** She raised awards and downloads and
named the discomfort herself: those were out of her control. "15 languages" is scale attached to the
thing she owned end to end, and it reads as a competency and a quantified outcome in one clause.
It also cost nothing, which is the other half of the story.

**Character headroom, not line count, is what governs a wording edit.** Measuring it means mutating a
bullet's text node in an already-rendered print-emulated page and appending characters until the line
count breaks. Hand-rolled four times across this session before becoming `scripts/resume-headroom.mjs`
and `npm run resume:headroom`. Each time it decided the edit rather than describing it: the language
count was free (62 characters of slack), `the artists' card art tool` fit where the spelled-out
version wrapped (7), and title-casing fifteen labels cost **zero height** — 25 differ changes, every
one width-only. Three of five candidate phrasings for one bullet wrapped; the winner was chosen on
measured headroom, not on which read best in isolation.

It also explains why the leftover slack never converts to type size. Four bullets sit at 2–5
characters, so they wrap **together** on any size increase. The density curve is a cliff, not a
slope, and it is a property of the wording rather than of the type.

**The differ's ratios lie about mid-list insertions**, and this cost real verification time twice.
The baseline keys on `li:nth-of-type(N)`, so inserting a bullet renumbers every sibling under it and
the tool compares a one-line bullet against whatever used to hold that slot — ratios of 0.5, 0.33 and
2.0 that look exactly like reflow and are not. The reliable check is per-bullet line counts keyed by
label. Both signatures are now written into the `update-resume` skill, along with the two that _are_
meaningful: width-only-with-equal-heights means a casing change that reflowed nothing, and every
height scaling by one small factor means a leading change with no rewrap.

**One question answered entirely from a primary source.** Whether bullet labels should be title case
looked like a taste call and wasn't: every label in the four job files' verbatim 2019 sections is
title case, `Unreleased Casino` included — which is the exact label the repo was rendering as
`Unreleased casino` fifteen lines below its own quotation of it. Sentence case had also never been
self-consistent, since proper-noun labels are title case regardless. Note this is _not_ #182, which
title-cased headers; a run-in `<b>` inside an `<li>` is not a header, which is why that pass never
reached these.

---

## One apostrophe, sitewide (2026-08-26, #188)

Split out of #32, which found the mismatch and deliberately refused to half-fix it. YAML front
matter does not go through Astro's smartypants and Markdown bodies do, so `summary`, `caption`,
`role` and `alt` rendered `didn't` while the paragraph beside them rendered `didn’t`. Both are on
the same page — a project page shows a caption and a body paragraph within an inch of each other.

### The issue was a decision, not a task

There was no correctness argument either way, and the two answers had wildly different costs.
Straight everywhere was one line (`smartypants: false`) plus one stray character; curly everywhere
meant converting ~210 characters across front matter, `.astro` prose, `src/config/`, and the
LinkedIn generator. Straight was also the de facto convention already, 202 to 1 in `src/content/`.

**Ali picked curly.** Worth recording that the cheap option was cheap for a reason that does not
survive contact with the actual question: `smartypants: false` does not make the site consistent,
it makes it consistently wrong-looking, and the majority-rules argument was counting a mistake.

### Bodies carry the character too, even though they do not have to

Smartypants would curl a Markdown body's apostrophes on its own, so converting body source changes
nothing about the output. It was done anyway, and that is the decision most likely to look like
busywork later.

The alternative rule is "type `’` in front matter, `'` in bodies" — which is a rule about which
_surface_ you are on, and needing to know that is precisely the bug being fixed. One character
everywhere is a rule you cannot be on the wrong side of.

### The guard checks the output, not the source

`scripts/check-links.mjs` gained rule 6. Checking source would need one rule per file type and would
still miss the seam, because the seam is not in any file — it is where three sources land on one
page. The rendered HTML is the only place they meet, so that is where the assertion lives. It covers
text nodes, `alt`, and meta descriptions, and exempts `<code>`/`<pre>`: a straight apostrophe inside
backticks is quoting source, not writing prose. `about.astro` already discusses `{' '}` in a comment,
and a write-up that quoted it in a code span would be correct to leave it straight.

Verified by breaking it deliberately in a copy of `dist/` — both branches fire, and a synthetic
`<code>{' '}</code>` does not.

### Two things the sweep found that a grep for `'` would not have

- **`Dalí's`** in art-of-rescue. The first pass matched on `[A-Za-z0-9³` + backtick`]` and `í` is in
  none of those. Widening to `\w` caught it. The lesson generalises past this repo: an
  ASCII-letter class is a bug in any text that has been through a name.
- **An escaped `\'`** inside a single-quoted JS string in `build-linkedin.mjs`. Invisible to a
  lookbehind for a word character, because the preceding character is a backslash. Found by
  regenerating `docs/LINKEDIN.md` and grepping the _output_ — the same argument as the guard above,
  arriving a second time in one session.

### Cost notes

Opus 5, one session, no subagents. Fan-out would have bought nothing: the sweep is one regex applied
to twenty-one files, and the only judgment in the whole task was a question for Ali. The expensive
part was deciding what "everywhere" includes — `docs/LINKEDIN.md` is generated from front matter, so
its bullets went curly on their own and its hand-authored `About` would have stayed straight in the
same paste-ready block. That is the #31 and #32 miss recurring for a third time: **a generated file
is where a wording pass forgets to look, and it forgets again each time.**

---

## Preserving the old site (2026-08-26, PR #196)

Prompted by a plain question — _how do I keep the old site so a before/after is easy later?_ — a few
days before the DNS cutover. The answer turned out to be mostly "it already is preserved," with one
defect that made the preservation less useful than it looked.

### The archive recorded what the site said, not what it looked like

`snapshot/` held 30 pages of faithful markup. It also held **50 dead asset references out of 54**,
because Phase 3 deleted `resources/images/` at the cleanup commit (tagged `assets-pre-cleanup` since #360) after migrating the keep-list into
`src/assets/`. `snapshot/README.md` still asserted the assets were "already committed under
`resources/`" — true when written, quietly false for months.

Nobody would have noticed by reading either file. `snapshot/README.md` describes a relationship
between two directories, and the statement went stale when _the other one_ changed. **Cross-directory
claims have no owner**, which is the same failure mode CLAUDE.md's guard table exists to rule out,
appearing in prose instead of in data.

### The check that asserted the property found the bugs

The archive's whole value is not depending on anyone else's servers — the original decayed exactly
that way, with html5shiv 404ing since Google Code shut in 2015 and nobody noticing for a decade. So
the verification is a Playwright pass that fails if any page requests anything off-origin.

It found **26 external requests on its first run**, in three classes the hand-written patterns had
all missed:

- the blog's **14 images**, referenced by absolute URL against `aliwallick.com` — in neither
  `snapshot/` nor git, and about to become unrecoverable at the cutover
- `wp-login.html`'s stylesheets and scripts — WordPress writes **single-quoted** attributes, and
  pulls from `wp-admin` as well as `wp-includes`, so a pattern written against the hand-authored
  pages matched none of it
- the Unity install badge, an `<img>` outside the `<object>` the regex covered

Each fix revealed the next; the count went 26, then 15, then 0. **The generalisable bit: "I removed
the external dependencies" is a claim, and the difference between the claim and an assertion of it
was three real bugs, one of which was load-bearing.** The blog images had no other copy under their
original names.

### Faithful restoration reproduced a privacy problem

The first run restored all 54 assets from git, faithfully — including the 2019 resume PDF and its PO
Box. That manufactured a **second copy** of the exact exposure two open issues exist to reduce, and
it was committed before anyone noticed, by a script whose entire purpose was careful preservation.

The fix is a `PREFER_WORKTREE` set naming the one path where the current file supersedes the
historical blob. The lesson is not about PDFs: **preservation and privacy are different goals, and a
tool built wholeheartedly for one will quietly work against the other.** Worth asking of any
archiving task what it is faithfully preserving that someone spent effort removing.

### Redaction, done properly, was cheaper than expected

The address came out by deleting its `BT…ET` block from the page content stream rather than by
drawing a rectangle over it — the covering-rectangle approach leaves the text extractable
underneath, which is the standard way redactions fail in public. Verified four ways: text
extraction (102 items to 101, exactly the right one), keyword probes, raw byte grep, and a pixel
diff that put **every one of 2,439 changed pixels inside the address bounding box**.

Two things made this tractable that were not obvious going in. **CLAUDE.md said the PDF "has to be
decoded to read" and that `grep` gets nothing — true of the shell tools to hand, and false of
`pdfjs-dist`**, which reads its ToUnicode map without complaint. And the text block was locatable by
_computed position_ rather than byte offset, which is what makes the script survive the file being
regenerated.

The three libraries needed went in **outside the repo**. `package.json` is untouched. Carrying three
dependencies for something that runs once is a bad trade, and the method is written down instead.

### What could not be preserved

**Three of the nine embedded videos are gone from YouTube** — all 403, deleted or private. There is
no copy anywhere in the repo and never was; they were third-party embeds. The pages say so now.

That is the honest shape of link rot on a fifteen-year-old site: the parts you hosted survive if you
kept them, and the parts you embedded are gone on somebody else's schedule.

### A decision that cannot be deferred, and was declined knowingly

Ali chose to skip fresh Wayback captures of the site's final form, initially reasoning it could wait
until the old site was fully down so nothing got re-indexed. **That reasoning inverts the mechanism**
— Save Page Now fetches the URL live, so after the cutover it captures the new site, and after
DreamHost is retired there is nothing behind it. Waiting is declining.

She declined anyway once that was clear. **Then the premise turned out to be wrong**, which is the
part actually worth recording.

The claim that the final form was unarchived came from a CDX query using `collapse=urlkey` — which
returns the **first** capture per URL, not the latest. First-seen dates were read as last-seen
dates, and an argument about urgency was built on top of them. archive.org has the homepage from
2025-11-10 and `/about` from 2025-08-30, both verified to contain the final Second Dinner content.
**The capture was never at risk; it already existed.**

Two things generalise. **"Let's do it later" is a reasonable instinct that some tasks silently do not
support**, and it is on the agent to say which ones before the window shuts. But also: **an urgency
claim deserves the same scrutiny as any other claim and tends to get less**, because urgency reads
as a reason to move rather than a reason to check. This one survived into four documents, a PR body
and an issue, and was caught only when Ali asked a casual follow-up about it.

### Cost notes

One session, no subagents past the initial survey. The survey was worth delegating — it swept
`snapshot/`, `content/archive/`, `resources/`, the docs and the issue list in parallel, and returned
the asset-commit fact that reframed the whole task. Everything after it was sequential work on known
files, where a cold subagent would have cost more than it saved.

The expensive part was iterating the self-containment check, and it was expensive in the right way:
three rebuild-and-verify cycles, each finding a real class of bug.

## The agent review (2026-08-27, #128)

#128 asks for a final review of the site, half agent and half human. The agent half ran 2026-08-27
against `70ecd15` and delivered fifteen recommendations, prioritized and effort-tagged, as
[a comment on the issue](https://github.com/ali-wallick/Portfolio/issues/128#issuecomment-5436019674).
This entry records the method and what it says about the tooling, not the findings — those live on
the issue, per the rule that issues track work.

### What only reading caught

The guards all held: links, alt text, apostrophes, PDF freshness, LinkedIn freshness green, and the
voice numbers still at target after a week of content passes (17.0-word mean across the seven main
prose surfaces, zero em dashes in rendered prose). What no guard caught is drift _between prose
surfaces_: three different verbs for the MVVM claim on three surfaces, /about crediting "leading the
UI team" at Kaneva while the Firefall page says she was "the UI team", and the LinkedIn doc's
derived half naming the platform its own hand-authored guidance still bans. Fact _fields_ can't
drift here by construction; sentences still can. No guard for that exists or plausibly could — it is
what a review is for, which is presumably why #128 exists.

The most productive single technique was the one #188 already recorded for apostrophes: check the
rendered output, because the output is the only place the sources meet. The LinkedIn contradiction
is invisible from either file alone.

### Two environment notes

`check:resume-print` reproduced #191 exactly — 223 elements "moved" on an untouched tree once a
browser was wired up, font rendering rather than content, with the `check:pdf` hash guard green
beside it. And the review sandbox's egress policy blocked every external fetch, so link _liveness_ —
the one class of rot this site's whole `dead:` philosophy is about — was unreviewable from here and
became a recommendation instead of a finding.

### Cost notes

One session, no subagents. The file set was fully known (16 projects, 4 jobs, 9 pages, 2 docs), so
fan-out had nothing to discover — sequential reads with the standing brief already in context beat
cold subagents on both cost and quality. The expensive part was verifying candidate findings against
their sources before flagging them, and it paid twice: #178 turned out to be already narrowed by a
same-day comment, and the "million downloads" figure traced to a sourced commit — so it went into
the review as a staleness note rather than a wrong accusation of invention.

## Re-baselining DNS before the cutover (2026-08-27, #55)

The first Launch-milestone item, and the precondition `docs/LAUNCH.md` puts ahead of every other
step. `infra/verify-dns.sh` had been printing `STOP` since the Phase 1 migration — not because
anything was wrong, but because its expected set was captured from DreamHost on 2026-08-16, _before_
the migration it was then used to check. It reported the iCloud MX records and the amended SPF as
failures: the changes Phase 1 existed to make.

### The interesting part is not fixing it, it's what "fixed" had to mean

A re-baseline that only swapped in today's values would have re-created the same bug on a delay,
because three of the records it asserts are _scheduled to change_: the SPF loses two dead includes
when [#43](https://github.com/ali-wallick/Portfolio/issues/43) lands, Apple can rotate the DKIM key
whenever it likes, and the apex and `www` addresses change at the cutover itself — which is the whole
point of the exercise.

So the rule the rewrite is built on: **every assertion must be true both before and after the
cutover, and an assertion known to break on a scheduled future change is the same bug in a new
costume.** Where a value is expected to move, the script asserts the invariant instead:

| Instead of pinning         | It asserts                                             |
| -------------------------- | ------------------------------------------------------ |
| the full SPF string        | `v=spf1` + `include:icloud.com` + `-all`               |
| the DKIM key's bytes       | a `DKIM1` key resolves, with **no whitespace in `p=`** |
| the apex / `www` `A` value | that the hostname resolves at all                      |

### The DKIM assertion got stronger by becoming less specific

`infra/README.md` carried a standing instruction to keep a hardcoded substring spanning the two
halves of the DKIM key — the junction where a dashboard rejoining strings with a space would show up,
silently failing signature validation. That made sense when the key was a TXT record Ali pasted by
hand. It is a CNAME to Apple now, so pinning key bytes would turn a routine rotation into a `STOP`.

The generalisation was sitting in the problem itself: **a base64 DKIM key contains no whitespace, so
any space inside `p=` is the bug** — for this key and every future one. Same trap, no brittleness,
and it now covers keys nobody has seen yet. Negative-tested against four crafted values (good,
space-joined, truncated, not-a-DKIM-record); all four behave.

The script also asserts _both ends_ of the CNAME, because the migration produced exactly that
failure: the first test send returned `dkim=permerror (no key for signature)` with a perfectly
correct CNAME, because Apple had not published the key yet.

### The capture script was hiding the record that mattered most

`capture-dns-baseline.sh` was described in `infra/README.md` as "generic — no changes needed to
re-baseline," and #55 repeated that. Both were wrong. AXFR is refused, so the zone is probed by name
from a hand-maintained list, and that list was written against DreamHost: it named
`dreamhost._domainkey` (superseded) and **not `sig1._domainkey`** — iCloud's selector, and the zone's
only live DKIM record. Every capture between 2026-08-16 and this one silently omitted it.

Worth stating plainly because it is the same shape as the print block's denylist under Phase 5: a
list that passes anything nobody enumerated, wearing the clothes of a complete record.

### Four leftovers, not two

#55 named `mail` and `autoconfig` as DreamHost leftovers. The capture found two more nobody had
recorded: `ftp` and the superseded `dreamhost._domainkey` TXT. All four are queued with #43's dead
SPF includes. **The script asserts none of them** — asserting their presence schedules a false
failure for the day #43 lands, and asserting their absence fails today. They live in the baseline and
the README, which is where a record nobody should depend on belongs.

### Cost notes

One session, no subagents, and fan-out would have been actively wrong here: every question was a
`dig` against one zone, and the findings only became visible by holding the whole zone in view at
once — the missing `sig1` selector is only interesting _next to_ the present `dreamhost` one.

## The DNS cutover (2026-08-27, #34, #74)

The domain moved. `aliwallick.com` serves the Astro site from Cloudflare Workers, `www` 301s to the
apex, and mail was verified send-and-receive on both addresses before and after. `docs/LAUNCH.md`'s
ten steps ran in order and the runbook held up — the two things that went wrong were both outside it.

### The gate that mattered was not the one the runbook named

Step 4 says to confirm the production build goes green in the Workers Builds log, because
`workers_dev: false` means there is nowhere to browse to yet. Cloudflare had an active incident that
evening — **"Workers Builds are Degraded ... builds are not running"** — so the build queued and sat
at `Initializing build environment...` for nineteen minutes without starting.

Two diagnoses were formed and **both were wrong**. The first was head-of-line blocking: a `main`
build had queued 37 seconds earlier and was equally stuck, which is a tidy story that cancelling it
disproved in one call. The second was `previews_enabled: false` in the build config, which reads like
non-production builds being disabled and is not that — branch previews build fine, as the write-up
PR's own preview later proved. Both were plausible, internally consistent, and derived from real
observations.

What actually settled it was **asking a different question**: not "what is the build doing" but
"does a production deployment exist." The Worker's deployment list still ended at 2026-08-22, and
every version uploaded that evening was tagged `version_upload` — the `wrangler versions upload`
preview path, not `wrangler deploy`. That is a fact about the world rather than a status field's
opinion of itself, and it was available the whole time.

**The generalisable version: when a status field and an outcome disagree, go and look at the
outcome.** A build system reporting `queued` is a claim; a deployment record with a timestamp is
evidence. The cutover was blocked for an hour on a question that one API call answered.

A related trap worth naming, because it looks like failure and isn't: a fully green build log ends
with `No targets deployed for portfolio`. That is not an error. It means no route or Custom Domain
exists to serve the version yet, which is precisely the intended state between steps 4 and 5.

### `dig` cannot be trusted from Ali's machine

Step 2 records the rollback values, and the TTLs read back wrong: 258, then 300, then 75, then 53 →
50 → 47 across three seconds. TTLs that **decrement** are a cache answering. This persisted when
querying Cloudflare's nameservers by IP with `+norecurse`, which should be unambiguous — so something
on the network path intercepts port 53 and answers from its own cache.

Every DNS reading that mattered afterwards went over DNS-over-HTTPS instead, cross-checked against
two independent resolvers:

```bash
curl -s -H 'accept: application/dns-json' \
  "https://cloudflare-dns.com/dns-query?name=aliwallick.com&type=A"
curl -s "https://dns.google/resolve?name=aliwallick.com&type=A"
```

**`infra/verify-dns.sh` is unaffected, and it is worth being precise about why.** Interception
corrupts TTLs, not record values, and the script asserts values and resolvability — never a TTL. So
it stayed correct throughout and exited 0 on both sides of the cutover, which is exactly what #55
re-baselined it to do. The hazard is to a human reading `dig` output by hand mid-cutover, which is
why the warning lives in `infra/README.md` next to the tool rather than in this log.

### Two steps turned out to be no-ops, for opposite reasons

Step 3 lowers the apex and `www` TTLs so rollback bites quickly; step 10 raises them back. **Step 10
had nothing to do.** Steps 5 and 6 replace both records with _proxied_ ones — the Custom Domain
writes a proxied `AAAA 100::` on the apex, and `www` becomes a proxied `A 192.0.2.0` — and Cloudflare
forces proxied records to Auto (300s). The 60s TTLs were attached to records that no longer exist by
the time step 10 runs.

Ali's call on the timing is also worth recording, because the reasoning generalises past this site:
the argument for leaving TTLs low is fast rollback during the window you are most likely to want it,
and she declined it — a portfolio is not a service, and closing the task out the same day was worth
more than an hour of theoretical revert speed. Correct for the blast radius involved.

### The runbook's own preconditions caught a stale checkout

Step 1 requires `verify-dns.sh` to exit 0, and it exited 1 with four failures — against a #55 that
was already closed and merged. The cause was a local `main` sitting one commit behind `origin/main`.
Trivial, and the point is that **the precondition worked**: a check written to be trustworthy failed
loudly instead of being waved through, which is the entire argument #55 was filed on. Had it still
had three known-bad results, a fourth would have been noise.

### What is still open

`robots.txt` as served is not the file this repo generates — Cloudflare injects a Managed block
disallowing nine AI crawlers ahead of it. Search indexing is unaffected (`Allow: /` and the sitemap
line are intact, which is what step 7 asserts), so it was not launch-blocking and was deliberately
not touched during the cutover. It is a content-licensing posture applied by a platform default
rather than chosen, and it is [#215](https://github.com/ali-wallick/Portfolio/issues/215).

### Cost notes

One session, no subagents, and this is the clearest case yet where fan-out would have been wrong:
the work is a strictly ordered procedure with an irreversible step in the middle, and every decision
depended on the previous step's observed result. There was nothing to parallelise and a great deal
to get wrong by acting on stale context.

The hour lost to the Cloudflare incident was not agent cost — it was wall-clock waiting — but the
two wrong diagnoses were, and both came from reasoning about a status field instead of querying for
an outcome. Cheaper instinct: when something claims to be in progress, ask what it has actually
produced.

## The first post-launch sweep (2026-08-27, #144, #157, #191, #114, #103, #106, #105, #152)

The first session after the cutover, and the first one whose brief was a question rather than a
task: _are there any issues you can knock out without much input from me?_ Forty-one open issues,
all post-launch. Eight came out self-contained, in five PRs.

The sorting criterion is the reusable part. Not "is this small" — several of these were not — but
**does closing it require a call only Ali can make.** That put #212 (previews indexable),
#215 (the injected AI-crawler `robots.txt`), #178 (the LinkedIn `ABOUT` rewrite) and #142 (whether
the It Fits I Sits team list can be made complete) out of scope despite three of them being small,
while keeping #103 in despite it needing a judgment call — because the call was one a measurement
could settle rather than a preference.

### Three fixes verified green, and none of the greens meant anything

The through-line of the session, and it turned up three separate times in three different tools.

**#157's audit-script fix produced output byte-identical to the code it replaced.** Every orphan
the issue listed had since been wired up by content passes, so a diff of the tool's output proved
nothing either way. It had to be verified against a synthetic bug instead — an unreferenced
`Cards.jpg` dropped into `prodigal/`, colliding with `critter-3`'s referenced one. Old code:
`none`. New code: the orphan. **A regression guard with no live regression can only be tested by
manufacturing one.**

The same fix also shipped a false-positive on its first pass, caught only because the diff was
_not_ empty: matching literal paths reported all five `poster.jpg` frames as orphans, because
`POSTERS` in `src/lib/content.ts` globs them rather than naming them. The fix for a false negative
introduced a false positive in the same function, and the empty-diff expectation is what surfaced
it.

**#103's Lighthouse `assertMatrix` failed open, and reported success.** Put at `ci.assertMatrix`
instead of `ci.assert.assertMatrix`, lhci ran **zero assertions** and printed
`Done running autorun.` That is indistinguishable from a passing gate. It surfaced only by trying
to force a failure and getting `Error: No assertions to use`. Once nested correctly, both matrix
entries were confirmed by negative control: tightening the project entry fails `marvel-snap` alone;
tightening the catch-all fails exactly the seven non-project pages and neither project page.

The first negative control was itself useless — it set `performance` to 1.0, and performance is
already 1.0 on every page. **A control has to be chosen against a metric that actually varies.**

**#152's schema change could have failed open too.** A refactor whose entire claim is "rendered
output is byte-identical" looks identical to a schema that silently stopped validating. Two
controls: a bare string is rejected, and so is an empty array.

### #103 found something worth more than the issue it closed

The issue asked what a YouTube iframe costs. Answer: exactly the 0.93 the four-year-old
`TODO(phase-3)` predicted, and it is one audit — a `youtube-nocookie.com` cookie.

The finding nobody was looking for is that **`errors-in-console` fails on every page, gated ones
included, and always has.** The Cloudflare Insights beacon POSTs to a host whose CORS preflight
cannot match lhci's random localhost port, so every page scores 0.96 against a 0.95 bar. The
sitewide gate has been running on one hundredth of headroom, spent on an artifact of serving
`dist/` locally. Filed as [#221](https://github.com/ali-wallick/Portfolio/issues/221) rather than
fixed, since the good fix is a separate change.

**Measuring a new page taught more about the five old ones than about the new one.**

Also learned, and general: `categories:best-practices` asserts the score _Lighthouse computes_. An
audit-level `off` does not raise it. When a third-party cost has to be absorbed, the threshold is
the only lever — which is why the issue's preferred remedy ("carve out that audit") was not
available.

### Cost notes

One session, no subagents, five branches. Fan-out was considered and rejected on the same grounds
as the cutover session, for a different reason: the issues were genuinely independent, but each one
was two to six tool calls of work against a repo whose context this session already held. A
subagent per issue would have paid full cold-start cost eight times to save nothing.

The one thing that _would_ have justified fan-out — surveying 41 unknown issues — was cheap inline
because `gh issue list` plus one batched `gh issue view` answered it in two calls.

The expensive part was not reasoning, it was Lighthouse: four full lhci runs at 27 page-loads each,
three of them controls. Worth it. The run that mattered was the one that failed.

## Fixing the Lighthouse beacon artifact (2026-08-27, #221)

#221 filed itself with two candidate fixes and a lean toward the second: don't emit the beacon
during a Lighthouse-measured build, or serve `dist/` on a fixed port matching Cloudflare's echoed
origin, "cheap to test." Neither survived contact.

### The "cheap" fix wasn't

Probing `cloudflareinsights.com`'s preflight directly, with a spread of `Origin` headers, settled
what the issue only inferred from one browser error: the endpoint always strips the port from
whatever origin it echoes back, for every host tried — `localhost`, `127.0.0.1`, and arbitrary
hostnames alike. That means the only origin that can ever match is a **portless** one, which for
`http://` means literally port 80. Reading lhci's own `staticDistDir` source confirmed the second
option was never going to be cheap: `FallbackServer.listen()` hardcodes `server.listen(0)`, and even
an explicit `url` list gets its port forcibly overwritten to match. Getting to port 80 means
abandoning `staticDistDir` and its `express.static` + `compression` server entirely, standing up a
replacement, and binding a privileged port in CI — real surface area, and a risk to the very
performance budget this gate protects, not the "cheap to test" the issue guessed at.

### The actual fix is a third option nobody had written down

Strip the beacon `<script>` tag from the **downloaded copy** of `dist/` inside the `lighthouse` job,
right before lhci runs — `scripts/strip-lighthouse-beacon.mjs`. Touches nothing upstream: the
`build` job's uploaded artifact is untouched, Astro's build logic gains no new mode, and Cloudflare's
actual deployment still carries the beacon exactly as before. `errors-in-console` measures the site
again instead of a third party's CORS policy.

Verified against the live endpoint, not assumed: an OPTIONS preflight with `Origin: http://localhost`
(no port) comes back `Access-Control-Allow-Origin: http://localhost` — matches. The same request with
any port, including `:80` spelled out explicitly, still comes back portless — doesn't match. That is
what makes "just fix the port" a dead end regardless of which port is picked, short of 80 itself.

Verified end to end locally, not just read: built the real production `dist/`, ran `lhci collect`
against it once and reproduced the exact two-line console error from the issue (`errors-in-console`
0, `best-practices` 0.96). Ran the strip script against a copy, re-ran the identical collect — `1`
and `1`. The `dist/` the `build` job uploads was left alone throughout; only a scratch copy was ever
mutated.

### Cost notes

One session, no subagents. The work was almost entirely verification rather than writing code: two
curl probes into a third-party CORS policy, a read of `@lhci/cli`'s installed source to confirm a
negative (staticDistDir cannot be pinned to a port), and a real local lhci run before and after the
fix. The script itself is nine lines of logic. Confidence came from measuring the actual endpoint
and the actual before/after scores, not from the issue's own reasoning — which was plausible and
wrong about which option was cheap.

## The resume density toggle (2026-08-29)

Ali asked for something more dynamic than the "Switch to two pages" link between /resume and
/resume/full. Four options went to her in one pass — an in-place animated toggle, cross-document
view transitions between the existing routes, per-section disclosure, and a game-settings framing
of the toggle — and she picked the in-place toggle, after one good question: does it lock the
two-pager into being a superset of the one-pager forever? (Answer: no more than the schema already
does — `extended` must _continue_ `text` by contract — but it does make that property load-bearing
in one more place. Recorded in CLAUDE.md.)

The build leaned entirely on a Phase 4 decision paying off: because `full` is a strict superset of
`concise` by construction, "concise" is literally the full DOM with full-only nodes hidden. So the
whole feature is: render the superset always, mark full-only nodes with `data-full-only`, flip
`data-density` on the article, and let one CSS rule — deliberately outside both `@media` scopes in
resume.css, the file's single both-media rule — decide visibility on screen and paper alike. The
animation is `document.startViewTransition`, feature-detected, skipped under reduced motion.
/resume/full survives untouched as the no-JS fallback and the two-page PDF's source.

### What the guards did, which is the interesting part

The change is exactly the shape the resume's guard stack was built to interrogate, and every guard
had something to say:

- **The page-count assertion** proved the core claim directly: with the full superset in /resume's
  DOM, `resume.pdf` still came out 1/1 pages — hidden `display:none` content adds zero print height.
- **The print-geometry baseline** churned massively (its `nth-of-type` paths count hidden
  siblings), which forced a value-level comparison instead of a wave-through: strip the paths,
  align old rows against new, require the values to hold. Result: zero y/height deltas across all
  97 + 138 laid-out rows on the two routes, six new inline spans on /resume/full (the `extended`
  continuations, now real elements), and x/width drift up to ~29px that is the known
  CoreText-to-FreeType rasterization gap — this baseline was regenerated on Linux against a
  macOS-recorded predecessor.
- **The input hash** gained `src/scripts/resume-density.ts`, the opposite call from the links.ts
  exclusion and worth the comment: the script runs inside the exact Playwright navigation that
  prints the PDFs, and its entire job is mutating the attribute the density rule keys off. Its
  init is read-only w.r.t. the article for the same reason.

One environment note for future remote sessions: the container's pre-installed Chromium (v1194 /
Chrome 141) predates the repo's Playwright pin (v1234 / Chrome 151) and cdn.playwright.dev is
proxy-blocked, so the browser was shimmed in via symlinks at the expected registry paths. The
value-level baseline comparison doubled as the safety check on that substitution: zero y/height
drift against the committed baseline means the version gap moved nothing that matters.

### Cost notes

One session: options first (a short exploration of the existing switch), then a plan pass with one
Plan subagent to pressure-test the design against the print pipeline before writing code — it
caught the baseline path-renumbering and the all-extended-group edge case in advance, both of which
would otherwise have surfaced as mid-implementation surprises. Implementation itself was small
(~six files); the verification sequence was most of the work, as it should be on this document.

## The résumé actions bar (2026-08-30)

The density switch shipped in #219 worked and looked like a settings control bolted above a
document. This pass replaced it with document tabs on a panel, with the download inside the
résumé's header. The interesting part is not the result but the loop that produced it, which ran
almost entirely on rendered evidence rather than description.

### The switcher pattern, run harder than before

Same shape as the motion, faces and colour-calibration passes — one `noindex` route, live radios,
every candidate on the same page against the real document. Two things were different this time.

**The axes were narrowed by the reviewer, not by the builder.** It opened with eight controls and
nine arrangements; Ali cut to one control immediately, then the placement question replaced the
arrangement question, then the weight axis collapsed from four to two to settled. Every round the
switcher got shorter. The rule that emerged and is worth keeping: **a switcher that still offers a
decided question is a switcher nobody trusts the rest of** — so a settled axis comes off in the same
commit that settles it, and the CSS deletes the overrides rather than promoting one of them.

**Contact sheets beat the switcher for the comparisons that matter.** A live switcher is sequential;
"which of these four is loudest" is a simultaneous question. Rendering all four states into one
image, with the measurement under each, turned several rounds into one look. It also caught things
the switcher could not: the notch under a hovered tab only exists in one of four state
combinations, and it took a 2×3 grid with both tab states to see that a flush tab supplies the
panel's corner only while it is the selected one.

### What measuring first actually bought

Three times a complaint turned out to have a different cause than the words suggested, and each time
measuring before building changed what got built.

- **"Make the tabs and the button the same height."** They already were, within 1px — the difference
  was a 13px vertical offset. The axis that shipped varied altitude, not size, and the padding it
  was competing with turned out to be 7px more than the plate's shadow needed.
- **"The tabs look claustrophobic."** True, and the padding axis was the obvious answer. Ali's own
  follow-up — what drives the font size — was the better one: type carries its own line box, so a
  step up grew the strip 2.6px while making it 11% larger, where the padding mark spent 8px making
  it emptier. That question also surfaced that the tabs had inherited `--text-sm` from `.nav-link`
  and `.button` rather than choosing it, which is what turned a tweak into a deliberate deviation.
- **"Can the border go all the way around?"** It can, and a 14px corner then eats the first 14px of
  the panel's top edge, so a tab in that span has no straight line to join. That was rendered at 5×
  rather than argued, and the picture did the explaining.

### The reviewer caught two things the measurements did not

Worth recording plainly, because both were failures of what was measured rather than of the
measuring. **The first panel bled outward from the text column** to keep the text, dates and button
from moving — which put it 24px wider than the header and footer on each side and 8px outside
`.layout`'s own box. Every alignment that had been asserted still held; nobody had asserted the one
that mattered. **And the corner rule keyed off the active tab**, which is correct until you notice a
tab also paints on hover. Ali saw both by eye before either was rendered.

The generalisable version: an assertion suite proves the things it was pointed at, and a reviewer
looking at the page is still the thing that decides where to point it.

### One pixel, four times

The rule's own thickness, the tab's left border, the panel's border, and finally a `+ 1px` ported
straight from the lab that was right there and 1px wrong in the shipped component, because the port
dropped an inner flex wrapper and a negative margin resolved differently against a block parent.
Hence the habit now written into `resume.css`: **when a border or a negative margin is added to
anything an alignment is measured from, re-measure — do not port the number.** The download's
vertical and horizontal offsets are asymmetric today because two 1px effects cancel on one axis and
not the other, and that asymmetry is correct rather than a fudge.

### Landing it, and what the guards said

The panel styles `.resume` itself, which is the element that prints, so the whole treatment had to
land inside `resume.css`'s `@media screen` scope. Three independent checks agreed it did:
`check:resume-print` reported changes only inside `.resume-actions` and nothing in the document; the
page-count assertion held at 1/1 and 2/2; and a content-stream diff of the regenerated PDFs against
their predecessors found **zero differing text-placement operators** across 3,137 and 6,107.

That last check was built for a different reason and paid for itself twice. The container's
Chromium (v1194) predates the repo's Playwright pin (v1234) and `cdn.playwright.dev` is
proxy-blocked, so the browser was shimmed in at the expected registry paths — the same trick as the
density-toggle session, plus a headless-shell alias this time. Rendering the shipped PDFs with a
browser the project does not pin is a real risk, and the operator diff is what retired it: byte
identical output means the version gap moved nothing here. It also unblocked `check:resume-print`,
which the session brief had assumed could not run in this container at all.

### Cost notes

One long session, and the token cost sat almost entirely in rendering rather than reasoning — every
round was build, screenshot, measure, hand back an image. No subagents: the work was a single
serial conversation with one reviewer, where each answer changed the next question, which is the
shape delegation is worst at. The scaffolding was rewritten from scratch once, mid-session, after
six rounds of index-based patching left a duplicated section and four contradictory `.ra-lab`
blocks — cheaper than a seventh patch, and worth noticing as a signal: when surgical edits start
producing contradictions rather than changes, the file is telling you to rewrite it.

## The switcher loop becomes a skill (2026-08-30)

[#246](https://github.com/ali-wallick/Portfolio/issues/246). Four passes had run the live-switcher
loop — the motion values (#33), the faces (#66), the colour calibration (#67) and the résumé actions
bar (#239) — and every one of them built the scaffolding from scratch and deleted it. The method was
transmitted only by example, which meant a new session learned it by reading this log and CLAUDE.md's
records of past passes rather than by having it to hand.

### What was worth codifying, and what was not

The panel is radios, `localStorage`, and writing `data-*` onto a target. Roughly 120 lines, and it
was different in all four passes because the axis was different. The rules around it are what made
those passes work, and every one of them cost a real mistake: measure the candidates before choosing
which go on the instrument, take a settled axis off in the commit that settles it, never let the
panel cover what it compares, keep everything outside `byteHashedFiles`, judge every state rather
than the default one, and seven measurement traps that each produced a plausible wrong number.

So the skill carries the discipline, `references/scaffolding.md` carries the working shapes of the
four files, and there is no shared component. **That is the issue's own second question answered:
the panel does not become reusable code.** Three of the rules rule it out directly — scaffolding
must duplicate a hashed module rather than import it, a shared component in `src/` is exactly an
import, and permanent code has to be gated out of production forever where a deleted route cannot
leak at all.

### Recovering the source material

The scaffolding was deleted before each merge, so none of it is on `main`. It is all still in the
pull-request refs: `git fetch origin 'refs/pull/239/head:refs/remotes/pr/239'` brings back
twenty-two commits of the actions-bar comparison, panel and all. Worth knowing generally — **a
delete-before-merge convention does not lose the artifact, it just moves it somewhere `git log` on
`main` will never show you.**

### The contact sheet is the half a switcher cannot do

`scripts/contact-sheet.mjs` is the one piece that became code. A live switcher is sequential; "which
of these four is loudest" is simultaneous, and so is anything about a state you cannot be in twice at
once. It takes a spec of states — theme, `data-*` writes, an optional click, hover or focus, and an
expression to measure — and renders each into a tile, then lays the tiles out **in the browser** as
an HTML grid and screenshots that. Compositing was the obvious approach and laying it out in the
browser is better: labels and wrapping come free, and there is no SVG text to hand-place.

Running it against `/resume` found four things that would otherwise have been rediscovered by
whoever built the next sheet, and one of them is a fact about the site:

- **There is no `data-theme` on this site.** `tokens.css` selects dark on `prefers-color-scheme`
  alone. The first version wrote an attribute and produced a light tile labelled "dark" — the exact
  category of convincing wrong answer the skill's traps section is about, appearing inside the tool
  built to avoid it. It emulates the media feature now.
- **The reticle parks its brackets on whatever the sheet just clicked**, so a tile of a selected tab
  arrived framed in magenta that is not part of the candidate. The panel does the same thing to any
  tile wider than its clip. Hence a `hide` list, which is the same problem #33 and #66 both solved
  inside the live instrument, arriving a third time in a different tool.
- **`attrs` writes state and `click` drives it**, and they are not interchangeable: where a script
  owns a control, the attribute alone leaves `aria-current` and the href on the other state, so the
  tile shows a combination that cannot occur.
- **`fullPage` on the sheet page pads the grid with the rest of the viewport.** Screenshotting the
  `body` locator crops to content.

A fifth is a UX point rather than a bug: a bare Playwright timeout on a selector that moved does not
say which of twelve tiles was being drawn, so every failure names its state now.

### Cost notes

One short session, no subagents — the work was reading four existing records and one recovered
branch, which is a sequential read rather than a fan-out. Most of the cost was in the sources, not
the writing: the four passes are documented across ~400 lines of this log and ~150 of CLAUDE.md, and
the skill is a compression of them rather than anything new.

One thing did not survive the trip. The issue body is truncated in every GitHub read path available
to this session — it stops mid-sentence in rule 8, at the point where the text contains a literal
`<script>`, which the API's HTML sanitiser appears to swallow along with everything after it. Rule 8
is recoverable (it is the `prettier-plugin-astro` finding, recorded in full above and in CLAUDE.md),
but whatever followed it is not. Flagged on the pull request rather than guessed at.

## The gallery scroller (2026-08-30)

[#166](https://github.com/ali-wallick/Portfolio/issues/166), one line long: _"Might be nice to have
horizontal scrollable dynamic library instead of the static wrapping one we have in place now."_ Ali
added the shape she wanted in session — larger images, one row, scroll left and right past the page
width. The settled decisions are in `CLAUDE.md`; what belongs here is how the session ran.

### Measuring the content first turned two design questions into one

The obvious plan was a scroller plus a switcher for the open look questions. What made it cheap was
computing the gallery inventory before designing anything: thirty images across twelve galleries,
with intrinsic sizes.

That measurement did most of the work. It said the archive tier is 137–296px files from 2009–2013,
so "larger images" and "sharper images" are in direct tension on nine of the twelve galleries — which
is a fact to put in front of Ali rather than a preference to guess at. It said the aspect ratios span
0.45 to 1.78, which is why a fixed-height row is a better answer to #93's no-cropping constraint than
the grid it replaced. And when Ali later asked which galleries to compare rather than checking all
twelve, the answer was already computed: `mini-mages` is the only gallery mixing one modern asset
with two legacy ones, so it is the single page that discriminates every sizing option.

**The zoom threshold is the clearest case.** Asked for "click to zoom, maybe just for larger photos",
the instinct is to pick a multiplier and defend it. Computed, there was nothing to defend: at a 16rem
row every image is either at least 1.60× its rendered height or at most 0.72×, with **nothing in
between**. Any threshold from 0.8× to 1.5× selects the same twelve images. That is not a tuned
number, it is a natural cleavage in the assets, and knowing it turned a design argument into a
one-line rule with a comment explaining why the value does not matter.

### Two bugs that only rendering could find

**`width: min-content` plus `max-width: 100%` is a cyclic dependency.** The first implementation
sized each slide to its image so the caption could not set the width. It typechecked, built clean,
and collapsed every gallery image on the site to about 60px. Nothing in the CSS reads as wrong; a
headless measurement pass found it in one run. The fix was to stop asking the browser and hand it the
aspect ratio from build time, which `astro:assets` already knows.

**An orphaned selector that was harmless by luck.** A slice-based rewrite left a bare
`.embed { height: var(--gallery-h) }` where a `.gallery`-scoped one was intended, so in principle
every YouTube hero on the site was squashed. Measured, the heroes were fine — `--gallery-h` is only
declared on `.gallery`, so outside one the declaration is invalid at computed-value time and drops.
Correct output, latent trap: defining that token anywhere higher would have broken three pages. Worth
the general note that **an unscoped rule reading a scoped custom property fails silently in the right
direction**, which is exactly the kind of bug that survives review.

### The reticle fix that was correctly deferred and then correctly taken

The design agent flagged early that element-level scroll does not bubble, so a focused element inside
a horizontal scroller would leave the reticle's brackets parked. It also said the bug was latent
rather than live, because nothing focusable sat inside the row — the arrows were deliberately placed
outside it. That was right, and the listener was left out.

Adding click-to-zoom put focusable links inside the scroller and made it live. The one-word fix went
in then, with the reasoning attached. **Both calls were correct**, which is the point: "cheap
insurance" is a bad reason to add code, and a changed premise is a good one.

### The scaffolding, and a conflict that arrived mid-session

The switcher followed the three before it, with one improvement available because this one was
page-scoped rather than sitewide: it lived in the project-page template, so `BaseLayout.astro` was
never touched at all and #62's CSS-bundle hazard was never engaged rather than worked around. It
carried three axes, lost one per round as Ali settled them, and was deleted whole at the end.

This pass and [#246](https://github.com/ali-wallick/Portfolio/issues/246) ran the same day and did
not know about each other, so the loop was rebuilt from the records here rather than from the
`design-switcher` skill that now holds it — which is exactly the cost that issue was opened to stop
paying. The page-scoped variant above is the one finding from this pass worth folding back into it:
where nothing outside one route can use the axis, the skill's "no new imports in `BaseLayout`" rule
is satisfied by never touching the file at all.

[#239](https://github.com/ali-wallick/Portfolio/pull/239) merged to `main` mid-session and conflicted
on exactly three files — both resume PDFs and `resume-pdf.lock.json` — while no source file
conflicted at all. Both branches touch `base.css`, which is a byte-hashed PDF input, so both
regenerate the same artifacts. **Resolved by taking main's and then rebuilding from the merged tree**,
because the correct lock hash is neither branch's; it is the merged input set's, and picking a side
would have passed locally and failed CI.

### Cost notes

Two subagents, both worth it and both at the start: one exploring the gallery rendering path and
inventory, one designing against those findings. The design agent returned four corrections to the
brief, two of which changed the implementation — the cyclic-dependency warning about slide widths,
and the observation that the reticle bug was latent rather than live. After that it was a single
serial conversation, which is the shape delegation is worst at.

Rendering dominated the cost again, as with the resume actions bar: every claim about layout was
measured in a headless browser rather than argued, including the two bugs above. Chromium needed the
same shim as the last two sessions — the container's build predates the repo's Playwright pin and
`cdn.playwright.dev` is proxy-blocked.

## The width system (2026-08-31)

The fifth run of the switcher loop, and the first one that started as a question rather than a task.
Ali asked why the résumé's text stopped short of its own panel; answering that honestly turned into
the widths being a system instead of five values that had each made sense once.

### The question kept getting better, and the work followed it

Five distinct asks, in order: why is the résumé text narrow, is there an accessibility standard for
line length, what about the rest of the site, what's most standard, and does the résumé need an
exception. Each answer was measured before it was given, and three of the five overturned what the
previous answer had implied. That is the shape to notice — not that the first answer was wrong, but
that a question asked one level up kept being available.

The résumé fix ([#244](https://github.com/ali-wallick/Portfolio/issues/244)) shipped twice as a
result. The first version removed the cap entirely and matched paper, which is defensible and was
wrong: it put bullets at 103–128 characters per line. The second pinned them to 701px, the print
column, after Ali asked whether a standard existed. **The trigger was her question, not a check** —
nothing in CI measures line length, and nothing could have.

### `ch` had been hiding the real number for the life of the project

The single finding worth the whole pass. `--measure` had been discussed in `ch` since Phase 5, and
[#68](https://github.com/ali-wallick/Portfolio/issues/68) had already corrected the arithmetic once.
The arithmetic was never the problem: `1ch` is the `0` glyph and real prose is mostly narrower
characters and spaces, so characters per line run ~1.38× the `ch` count. "63ch" was ~87 characters,
and 86% of the site's prose lines were over the 80 that WCAG 1.4.8 names.

Nobody had measured it because measuring it requires walking text nodes and bucketing them by their
rendered `top` — the number is not available from CSS, from the token, or from any check the repo
runs. **A value can be correct-looking, documented, reviewed, and corrected once, and still never
have been measured.**

### Three widths found by looking, none by reading the stylesheet

The résumé's prose, the project hero (a raw `44rem`, the only width on the site not expressed as a
token), and the contact card. Every one was spotted on a preview — two of them by Ali, in passing,
while looking at something else. A grep over `max-width` found none of them, because each was
syntactically fine and only wrong relative to its neighbours.

The rule that fell out and now lives in `CLAUDE.md`: **a frame has an edge, and an edge that agrees
with nothing reads as a mistake.** Prose can sit narrower without looking wrong; a bordered box
cannot. That one sentence decided all three and predicts the next one.

### What rendering caught that reasoning did not

- **The full-bleed header option scrolled the page sideways.** A `::before` at `inset: 0 -50vw`
  moved the page 400px at 1280 and 195px at 390. Scoping `overflow-x: clip` to `:root` did not
  contain it and neither did moving it to `body`; both were tried and measured. A `box-shadow`
  spread paints outside the border box without contributing scrollable overflow, which is the
  version that worked. #166 had removed a root-level clip for this exact reason and the trap was
  walked straight back into.
- **The résumé-as-sheet option detached the download button**, which is positioned against
  `.resume-actions` rather than the panel. Invisible in the numbers, obvious in the screenshot.
- **A P3 label claimed the shared edge landed at 976.** It lands at 1040, because `.layout` includes
  its own padding. Caught by measuring the option rather than trusting the token it was derived from
  — the same class of error as the `ch` finding, in miniature, inside the instrument built to find
  it.

### Two of my own assertions were wrong before the code was

Worth recording because both were caught by the check rather than by review. A line-count method
using `Range.getClientRects()` over a flex container returned one rect per item rather than per
line, reporting "10 rows" for every card; and the final verification asserted a prose width of 744
that came from an earlier _right-edge_ number, so it failed six times against correct code. **A
failing assertion is not evidence the code is wrong**, and the instinct to trust the assertion over
the artifact is the expensive one.

Three template-literal backticks broke the build in the same way on three separate commits, which
is a mechanical mistake that a guard would have caught faster than I did.

### Cost notes

No subagents, and that was right: this was one serial conversation where every step depended on the
last measurement, which is the shape delegation is worst at.

Rendering dominated again — roughly thirty headless measurement runs, every one answering a question
that could have been argued instead. The ratio to argue about is that the measurements changed the
outcome five times: the résumé width, the `ch` finding, the P3 narrowness, the hero-height coupling,
and the full-bleed overflow. Chromium needed the same shim as the last three sessions.

The rebase at the end conflicted on exactly the three generated artifacts — both PDFs and the lock —
on both commits that touch `base.css`, and for the same reason [#239](https://github.com/ali-wallick/Portfolio/pull/239)
did. Resolved the same way: take main's, rebuild from the merged tree, because the correct hash is
the merged input set's and belongs to neither side.

---

## #247 — one page title edge, and cross-fading between pages (2026-08-31)

Ali's report was three words of symptom — "different heights" clicking around — and the useful part
was that the cause was not where it sounds like it is. `main` already started at a constant y on
every route. The spread was entirely in **what each page happened to put first**, and six routes had
six answers: nothing, a bare h1 margin, an eyebrow, a loose backlink, the hero's own padding, the
résumé's tabs. 75px between adjacent nav items.

**The measurement reframed the fix.** Coming in, the plausible shape was "hunt down the per-page
margins and equalise them" — and `base.css` already had two rules doing exactly that, added in the
flex-column pass to _restore_ collapsed h1 margins. They were faithfully preserving the bug: each
one reproduced the height a page's title had always rendered at, which was a different height per
page. The fix was not another nudge but a reserved slot that makes the nudges unnecessary, and
deleting both rules was part of the change rather than a risk to it.

### Reserving beat equalising, and the component is why

The slot is reserved by `PageHead.astro`, never by the caller. A page with nothing above its title
renders the same slot as one that does. The alternative — a CSS rule each page opts into — is a
convention every future page has to remember, which is the same failure the content model's guard
table exists to rule out, one layer up.

Fitting the value to `/projects` rather than picking a round number was worth the minute it took.
That was the one page whose top had actually been composed (an eyebrow above the title) rather than
landing where it landed, so anchoring to it means the only page that looked deliberate does not
move.

### The bug the first build introduced, and the general form of it

Pinning the slot with `height` aligned everything and drew "ENGINEER" straight through "Ali Wallick"
at 320px, where the hero's eyebrow wraps to three lines. `min-height` renders identically wherever
the line fits and degrades to a nudge instead of an overlap.

**The general form: when a fix works by constraining something, ask what the constraint does to the
case that does not fit.** The screenshot caught it; no assertion I had written would have. The three
measurement passes before it all reported perfect alignment at 320 — because the h1's top edge _was_
at 166, exactly as intended, with a word sitting on it.

### Two things found by looking rather than by being asked

`scrollbar-gutter` was absent, so the two routes short enough not to scroll also shifted the centred
column sideways relative to every other page. It is a no-op on default macOS — the machine this site
is reviewed on physically cannot show the bug, which is why it survived this long. That is the same
shape as the `errors-in-console` finding and the `cf-cache-status` one: **the review environment's
own defaults hide a class of defect, and the only defence is knowing which class.**

The second was the résumé, which does not align and is left not aligning. Its tab strip is taller
than the slot, and both ways of closing the gap spend something settled — 51px of empty air above
`About`, or #239's control size. Reporting a documented 14px residual is a better answer than
picking one silently, and the whole cost of changing it later is one token value.

### Cost notes

No subagents. Same shape as #253: one serial thread where each step depended on the previous
measurement.

Rendering dominated again — six headless passes, and the ratio worth noting is that two of them
changed the outcome (the initial survey, which relocated the bug from "margins" to "what each page
puts first", and the screenshot that caught the overlap) while four confirmed. The confirmations
were still cheap insurance: this change touches every route on the site, and the only alternative to
measuring all nine was asserting about all nine.

Chromium needed the same shim as the last four sessions — the pinned Playwright expects a headless
shell build the image does not carry, symlinked into a scratch `PLAYWRIGHT_BROWSERS_PATH`. Worth
noting that it has now cost setup time in five consecutive sessions.

### The switcher that corrected its own author (2026-08-31)

The sixth run of the live-switcher loop, and the first one where the instrument overturned the
recommendation the person who built it had already put in writing.

The PR description for #247 shipped with a documented residual and two suggested fixes: grow the
reserved slot to the tab strip's 51px, or shrink the tabs to 37px. Both were measured, both were
correct at 1280, and **both were wrong.** Below 48em the résumé's actions bar goes `column-reverse`
and stacks to 103px, so anything sized to the tab strip fixes the desktop and leaves ~53px on a
phone. Only the two candidates that put something OTHER than the strip at the title edge — a page
title, or the panel's own border — held at every width.

**Nothing about that required a switcher to discover; it required measuring four viewports instead
of one.** But the switcher is what made measuring four viewports the obvious next step, because
five candidates in one DOM made "check them all at 390" a single loop rather than five branches.

**The instrument's own design carried the finding.** It rendered two blocks — an ordinary page's
title block and the résumé top — rather than the résumé alone, because the axis is a relationship
between two pages and one candidate's entire cost lands on the page it does not touch. A lab
showing only `/resume` would have scored that candidate as identical to doing nothing, and
recommended it.

### Two measurement bugs, both of which returned believable numbers

`parseFloat` on a `--page-kicker` of `"2.25rem"` yields `2.25`, which printed as a `2px` guide and
looked like a plausible small offset rather than a unit error. And the résumé's leading edge is a
different element per candidate — a title, a wrapper that has become the panel, or the panel — so
reading the layout wrapper reported `1px` for three options that visibly differed, because the
wrapper starts at the top whether or not anything paints there.

Both are the same class as the traps already in the skill: a number that looks like a measurement
and is not one. The fix in each case was to measure a rendered box rather than parse a declaration.

### The question worth having been asked

Ali's reply to the shortlist was "why does the name NEED to stop being an H1?" — and the honest
answer was that it does not. Multiple `<h1>`s are valid HTML5, are not an axe rule, and measured at
accessibility 1.0 with `heading-order` passing. The claim had been carried into the shortlist as a
cost of her preferred option without being checked, which would have either talked her out of the
right answer or bought a print-side change for a convention.

**A constraint asserted in passing is still an assertion.** It cost one Lighthouse run to settle.

### Cost notes

No subagents; same serial shape as the two passes before it.

The teardown was the cheapest part, which is the argument for the route-scoped variant of the loop:
four new files, nothing existing edited, so settling it was `git rm` plus a two-line change to the
two résumé routes. Every shipped file was byte-identical for the whole life of the instrument.

Chromium needed the same shim for a sixth consecutive session, and Lighthouse additionally needed
`--no-sandbox` because the container runs as root. Worth automating if a seventh session wants it.

---

## #163 — Every picture is matted (2026-09-01)

The seventh run of the live-switcher loop, and the first where the reviewer's questions found more
of the answer than the instrument did.

### The measurement came first, and it reframed the issue

The issue was three words and a shrug: "Border / Shadow on Images? Thumb, hero, gallery?" Before
building anything I measured the 1px edge ring of all 63 project assets against each theme's ground.
**Nine images sit under 1.5:1 on the light ground; a _different_ seventeen sit under 1.5:1 on the
dark one.** `marvel-snap/thumb-wide.jpg` — the homepage's headline card — measures **1.03:1**, and
`kaneva/thumb-logo-v2.png` measures 1.16:1 because someone matted it to `--color-surface` by hand
years ago.

That turned "should images have a border?" into something answerable: a frame is load-bearing, on a
different set of images in each theme, and the incumbent hairline was 1.31:1 / 1.43:1 — weakest
exactly where it was needed. Every later round was judged against that number.

### The reviewer found two whole surfaces the instrument had missed

Round 1 covered thumbnails, hero and gallery — the three the issue named. Ali's first question was
"does it only work on the home page right now?" It did not, but `/about` was inert, because its two
photographs go through `.aside-figure` and the homepage headshot through `.hero-portrait` — a fourth
and fifth surface nobody had listed. Her second question added a sixth: the YouTube `.embed`.

**All three already carried the identical `1px solid var(--color-border)`.** They were on the
incumbent treatment and simply were not being offered the alternatives. Had the pass settled after
round 1, the site would have shipped every project image on a new frame and every photograph of Ali
on the old one.

The generalisable bit: **when a change is expressed as a list of selectors, the list is the bug
surface, not the rule.** Rewriting the scaffolding to generate every rule from one array is what
made the sixth surface a one-line addition — and it immediately caught a real defect, a dark-theme
override still carrying the three-surface list.

### One flat list became three crossed axes, and that was the reviewer's call too

Round 1 shipped nine whole treatments. Ali kept three ("the others I'm not big about anyways") and
asked for version, colour and weight to be separated.

She was right, and the reason is worth keeping: **two candidates that differ on two dimensions
cannot settle either.** C2 (plate violet) and C3 (bold neutral) differed in hue _and_ strength, so
"C3 reads better in light, C2 in dark" — my own observation, offered confidently — was not
attributable to either variable. Crossed axes move one thing at a time. 3 versions x 5 colours x
3 weights x 7 mat insets is 315 treatments, which is unmaintainable as a matrix and about twenty
lines as three custom properties.

### What the reviewer picked, and why it is better than my recommendation

I recommended a new colour: the plate's hue pushed to ~4:1, on the theory that 2.20:1 does too
little work at 1px. Ali picked **plate violet at 2.20:1, with a mat**.

That is the better answer and my reasoning had a hole in it. 2.20:1 is weak _for a flush border_,
where the line is the only separation. **With a mat the gap does the separating and the line only
has to read as a frame.** The analysis was right about the number and wrong about what the number
had to accomplish.

### The regression the visual check caught, and the pre-existing one under it

Applying the mat, the gallery's bottom edges went out of alignment — the one thing #166 says the
row exists to guarantee. Measured on `/projects/i-fits-i-sits`, whose five slides run 0.45 to 1.78:

| Border on the slide image | Bottom-edge spread |
| ------------------------- | ------------------ |
| none                      | 1px                |
| 1px (`main` today)        | **3px**            |
| 2px mat                   | **7px**            |
| 2px mat + `aspect-ratio`  | **0px**            |

With `height: auto` the browser derives height from the _content_ box, so a slide's outer height is
a function of its own aspect ratio. **The 3px was already on `main` and nobody had measured it** —
the mat widened an existing defect rather than inventing one, and `aspect-ratio` (which resolves
against the border box under `box-sizing: border-box`) makes the shared bottom line exact for the
first time.

Third time in this project's history that measuring something everyone had looked at overturned it.

### Cost notes

No subagents; the work was serial and each round depended on the last. Six rounds, five pushes.

**GitHub Actions failed six consecutive times across five commits** with a zero-runner signature —
`runner_id: 0`, ~3 seconds, no steps, log endpoint 404 — while Cloudflare built every one of the
same commits successfully and `main` had been green half an hour earlier. Diagnosed as runner
availability, one re-run spent, one comment posted, and then deliberately left alone through five
further check-ins rather than pushing speculative fixes at it. It recovered on its own and the first
real run passed in 55 seconds. **The discipline that mattered was not fixing it**, and the evidence
that made that safe was that a second CI system was building the identical commits.

One piece of repo tooling was fixed in passing: `contact-sheet.mjs` was the only Chromium caller not
going through `launchChromium`, so the skill's own contact sheet could not run in a Claude Code web
session — the environment most of this work happens in.

## #272 — archiving the source video behind every hero embed (2026-08-31)

Every project hero on the site is a YouTube embed, which means six of the site's most prominent
assets live on somebody else's server. Three videos embedded in the old blog posts are already gone
— 403, deleted or made private — and `yt-dlp` cannot fetch a video after that has happened. So this
was insurance with a deadline nobody can see coming.

Six heroes captured, 291 MB, with uploader, channel and upload date recorded alongside each file.
The four Marvel Snap `press` videos were scoped out: 1.9 GB between them, and `Rw1FWK1yhDk` alone is
a 69-minute community show at 1.1 GB that CLAUDE.md already tiers as entertainment rather than
source material.

### The environment split was the whole reason this was a `needs-ali` issue

A Claude Code web session cannot reach YouTube at all — the egress proxy answers
`CONNECT tunnel failed, response 403` — and most of this project's work happens in one. A local
session can. That is the same shape as [#245](https://github.com/ali-wallick/Portfolio/issues/245),
where the web session's proxy blocked `cdn.playwright.dev` and broke `npm ci`. **Twice now the
binding constraint on a piece of work has been which session type it runs in**, which is not a
distinction the repo represents anywhere.

### A quiet failure that a success message covered for

The first run reported errors — but they were about _subtitles_, and they scrolled past under a
`tail`. Two of the six videos never downloaded at all.

The cause is worth writing down because the wrong option is the obvious one. `--sub-langs "en.*"`
looks like "English subtitles"; it actually matches YouTube's auto-**translated** tracks too
(`en-fr`, `en-de`, and so on), and the resulting burst of requests earns an `HTTP 429`. That error
aborts the whole item, including the video download that had not started yet. `"en,en-orig"` plus
`--ignore-errors` fixes it.

**What caught it was a size and duration check, not the download's own output.** Re-probing every
merged file with `ffprobe` for duration and stream presence turned up two missing videos and
confirmed the other four matched their source durations exactly. A run that says `ERROR` about the
thing you did not care about, while silently skipping the thing you did, is the failure mode to
design checks against — the same lesson as the page-count assertion passing a resume that was 64px
over budget ([#191](https://github.com/ali-wallick/Portfolio/issues/191)).

### The location is the one fact deliberately not committed

The archive is in Ali's own cold storage. `docs/VIDEO-ARCHIVE.md` records what was captured, the
sha256 of every file, how to verify a copy, and both `yt-dlp` traps — but not where the files are,
because a repo that may go public is the wrong place for the path to someone's personal storage.
Hashes are the half a checkout can usefully hold: they let a future session prove an archive it has
been pointed at is intact, without the archive being mounted. Same measurement-over-inspection move
as verifying the old-site snapshot by sha256 against the live server.

### Cost notes

No subagents — serial work, each step depending on the last. One capability probe, one metadata-only
probe to price the download before asking, one download, one repair, one verification.

**The metadata probe was the useful bit of process.** `--skip-download -J` across all ten candidate
IDs cost nothing and turned "roughly how big is this?" into an exact table, which is what let the
scoping decision be made on real numbers — and 1.1 GB of the 2.2 GB total turned out to sit in a
single video nobody had flagged as large.

---

## #284 — the guard that was red on one machine and green on the other (2026-08-31)

`check:resume-print` failed on Ali's Mac against a clean `main` while CI passed on the same commit,
on exactly one element. The issue had already ruled out the branch, the browser channel and a stale
`dist/`, and left four possible directions plus a leading hypothesis.

### The hypothesis was half right, and the missing half was in the baseline file

The issue's guess — that a multi-line inline box's union rect is where shaping drift crosses into
apparent reflow — was the correct mechanism. What it did not have was why that mechanism had only
just started firing.

**The answer was sitting in the committed baseline, as a distribution.** Every width in it is a
whole number. Whole-pixel glyph advances are FreeType rounding; #191's baseline, recorded on macOS,
is a roughly even mix of integers and fractions. Counting integer widths per revision of the file
took one script and dated the change precisely: mixed at `a0c7f73` (#191), all-integer from
`65fe24f` (#238) onward. The baseline had been regenerated in a Linux environment three commits
running, and macOS had been the odd one out ever since with nothing in the repo saying so.

That reframed the issue. It was not a guard that had grown brittle; it was a guard measuring one
platform against another, silently, in the one place where the tolerance model could not absorb it.

### The issue's own first recommendation was the one to skip

"Test under Node 22 first — cheapest discriminator." It is cheap, and it could not have discriminated
anything: Node launches the browser, it does not lay out text. Worth noting because the reasoning
that killed it is the same reasoning that found the real cause — ask which component actually
produces the number in front of you.

The other tempting direction died on measurement rather than on argument.
`--font-render-hinting=none`, `--disable-font-subpixel-positioning` and `--disable-lcd-text` are the
standard recipe for cross-platform text stability, and on macOS all three produce **byte-identical**
output, because they act on FreeType. A fix that can only be verified on the platform that is not
failing is not a fix.

### What could and could not be verified before pushing

The change needs a baseline regeneration — advance sums cannot be reconstructed from a stored union
rect — and regenerating on macOS is the thing the issue explicitly warned against. So the question
was whether a Linux run would pass against a macOS baseline, which is not answerable on a Mac.

**It is answerable approximately, and that was enough to proceed.** For every element that was
single-line on the old Linux baseline, its union width _is_ its advance, so the old file could be
replayed against the new one under the new comparison: 154 of 154 comparable elements on `/resume`
and 175 of 179 on `/resume/full`, zero failures, worst relative drift 4.81% against a 6% tolerance.
The four unverifiable ones are the multi-line inlines, whose advances differ only by ordinary text
drift plus a collapsed space. The tolerance is also symmetric — `within()` divides by
`max(base, cur)` — so flipping which platform records the baseline moves no margin.

### Negative tests, because a guard that passes proves nothing

Relaxing an assertion is the kind of change that can quietly gut a check while turning it green, so
three leaks were injected into the print block and measured:

| Injected                                                                         | Flagged                                                  |
| -------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `letter-spacing` on the bullet labels                                            | caught on the captured style property _and_ on `advance` |
| `padding-inline: 3px` on the labels — invisible to every captured style property | 23 elements, all on `advance`                            |
| `word-spacing: 4px` on the bullets — a real reflow                               | 119 elements, on block `height`                          |

The middle row is the one that mattered: it is a geometry-only leak on an inline element, exactly the
class the relaxation could have dropped.

One honest limit came out of the same exercise. `word-spacing: 1.5px` — a real leak — flags only two
elements, because a few percent of extra text width sits inside the cross-platform tolerance. That is
inherent to tolerating rasterizer drift at all and predates this change; it is not something the
advance switch introduced.

### The line that would have started the investigation instead of ending it

The baseline now records `{ platform, chromium }` and the script prints the mismatch above any diff.
An hour went into establishing "your baseline came from a different operating system," which is one
line of output. **Any artifact compared across machines should say which machine wrote it** — the
same shape as the video archive recording sha256s so a future session can prove an archive is
intact.

### Cost notes

No subagents; a single investigation thread where each probe depended on the last. Four probe
scripts, all disposable: one to dump the failing element's line boxes, one to characterise drift
across all 333 elements, one to test the font flags, one to replay the old baseline under the new
rules. **The integer-width count was the cheapest and by far the most valuable** — a few lines over
five revisions of one JSON file, and it turned an open-ended "why does this machine differ" into a
dated fact.

## #260 — The density toggle's motion (2026-09-01)

Ali's issue was two sentences: "Try Tweening Highlight -> Detailed. Could look cool if it slid over
time into place." The eighth run of the switcher loop, and the shortest — two rounds, settled at
**C + T0 + S1**: sections and jobs named so they tween to their new positions, the tab strip left
alone, `--duration` at 320ms.

### The diagnosis was not what the issue described

The toggle already ran inside `document.startViewTransition`. What was missing was never the
transition — it was that nothing on the résumé carried a `view-transition-name`, which makes the
entire page one snapshot. So the document cross-faded into its taller self and no part of it
appeared to move. The fix is naming, not animating.

### Measuring first changed the shape of the answer

The résumé is 2.75x the viewport at concise and 4.32x at full on a desktop; 4.49x and 7.56x on a
phone. **At the top of the page, where you actually click the tabs, the whole visible event is a
93px paragraph appearing and everything under it moving down 142px.** Everything else the toggle
reveals is below the fold at the moment of the click.

That is worth more than it sounds. It is the difference between designing a document-wide reflow
and designing one small local event, and it is invisible until someone measures the fold.

### The risk that nearly closed off the winning option was imaginary

Round one was pitched to Ali with a warning attached to the named-elements candidate: view
transitions snapshot the viewport, the Experience section is 1215px against an 800px viewport, so
it would clip. **It does not.** Chromium captures those elements at full height — 1215.44px, and
2562.31px for the phone's Second Dinner entry — read off the pseudo-elements mid-flight.

A fourth candidate existed only as insurance against that clipping, and was cut before it ever went
in front of Ali: it also looked worse, because naming only the headings detaches each from its own
body text, which then cross-fades in place underneath and prints the old Skills rows through the new
Summary paragraph. **The instrument got shorter because of measurement, not because of a round.**

### Three claims in the repo were wrong, and one was wrong in three places

- `CLAUDE.md` and `base.css` both said no custom property can reach a view transition's animation.
  It can: the pseudo tree is anchored on the root and inherits from it. What no token can express is
  a transition's **absence**, which is the actual reason the reduced-motion opt-out is
  `animation: none`. Corrected in all three sites.
- `resume-density.ts` said Firefox lacks `startViewTransition`. Firefox 144 shipped same-document
  view transitions in October 2025 — the toggle had been animating there for most of a year.
- The switcher's own label for the incumbent tab behaviour said "the fill jumps". It cross-fades:
  `.resume-actions` sits outside `article.resume` and is named by nothing, so it rides the root
  snapshot for the full duration. Caught by looking at a mid-transition screenshot rather than by
  reading the CSS, and probably the reason a sliding fill read as too much motion — it was adding a
  slide on top of a cross-fade, not motion to a still control.

### What the reviewer settled, and the round that only existed because she asked

Ali picked C on round one and asked for the option I had described but not built: keep C and let the
revealed sections slide in rather than fade. Round two dropped the two losing candidates, added
that, and she chose the fade anyway.

**That is a good outcome for a round, not a wasted one.** The literal reading of "slid over time
into place" was the thing the issue asked for, and it needed to be seen next to the alternative to
be rejected. It is now recorded in `CLAUDE.md` as declined-on-purpose, because it is exactly the
kind of thing a future session proposes as an obvious improvement.

### One implementation decision worth keeping

The names are written for the duration of the toggle and removed afterwards, rather than assigned
once. Two reasons, and the second was not obvious: at rest the DOM is untouched, so the PDF build
and the print-geometry baseline measure what they always did; and `base.css` opts the site into
cross-document transitions, so a name left behind would make navigating _away_ from `/resume`
animate that element separately from the page.

### Cost notes

No subagents — serial work, each round depending on the last, and the measuring was a handful of
Playwright probes rather than anything that fans out. Two rounds, three pushes.

Verification that earned its keep: comparing the regenerated PDFs byte-for-byte against the
committed ones rather than trusting `check:pdf`. They differ only in `/CreationDate`, `/ModDate` —
and, in the two-pager, an ephemeral localhost port inside two link annotations, which turned out to
be a pre-existing defect in a file Ali attaches to job applications. Filed rather than fixed here.

## #273 — a poster and a dead flag on the youtube media variant (2026-09-01)

Piece 2 of #159, and the user-visible half of it. `hero` is the one field the content model refuses
to let a published project omit, so a taken-down video was a required field rendering as a black box
carrying YouTube's own error text on a page the schema considered complete. `links[].dead: true` had
covered this class of problem on outbound links since Phase 2; the `youtube` media variant had no
equivalent.

### The half of the issue that was wrong twice, and the second time only a reviewer could see

The issue's second half — _"when `dead` is false the poster is the iframe's own poster frame"_ —
was wrong on the mechanism and then wrong on the idea, and the two failures needed completely
different instruments.

**The mechanism, caught by measuring.** Layering a still behind the embed does nothing, because a
loading iframe is not transparent: a frame whose navigation is still in flight is displaying its
initial `about:blank`, and that document paints an opaque canvas over whatever sits behind it. A
hanging `src` in headless Chromium, a green image underneath, a screenshot — the green was not
there. That is the fourth time in this project's history that measuring something plausible
overturned it, and the first where the thing overturned was a premise in the issue rather than a
number in the code. Ten lines of script fixed it, holding the player hidden until it loaded.

**The idea, caught by Ali on the preview**, which no amount of measuring would have produced. The
player paints its OWN thumbnail when it arrives, so a still underneath turns one transition into
two, between two different pictures. Blank to video reads as loading; picture to a different picture
to video reads as a flash. Her words: _"I don't think I like that flash."_

Reverted, and the code came out cleanly — the live embed's markup is byte-identical to `main` again,
the script is deleted, and `base.css` is untouched, which also stopped the résumé PDFs regenerating
for a change that no longer reaches them.

**Worth naming as a pattern rather than an incident: a fix for a problem nobody reported.** Nothing
about a cold embed was ever a complaint. It was a plausible improvement, written into the issue as
an aside, and it survived a schema, a component, a script, a CSS layer and a Lighthouse finding
before anyone looked at what it actually did on a page. The measurement discipline this file keeps
congratulating itself on had nothing to say about it, because everything about the implementation
was correct.

The one piece kept: **the backstop on `window`'s load event is not belt-and-braces.** A cached
iframe can finish loading before a module runs, spending its own `load` event; `window`'s own load
event waits for iframes, so at that moment it has not fired yet and it always arrives. Not in the
codebase any more, and true the next time something hides an iframe.

### The posters cost nothing to source and one rule to choose

The rule: **a poster is local imagery, and never a frame lifted from a video Ali doesn't own** — that
frame carries the video's licensing the way the trailer does, so committing Marvel's thumbnail is the
same act as committing Marvel's trailer, only smaller.

The issue's table of candidates was written without checking dimensions, and three of its picks are
too small to lead an ~864px hero box: It Will Kill You's best is 183px, Secret Garden's 221px, Vegas
Blvd Slots' 405px. So the rule had to do real work rather than just ratify the table. It Will Kill
You takes a frame from its own video — a 2010 class project on a personal channel, which is not a
studio's marketing asset, and is exactly the call the issue's own table already makes for Mini Mages.
Secret Garden does not, because its best YouTube still is a 640x480 `sddefault` with the letterbox
bars baked in, and bars inside a mat read worse than an upscale does. Vegas Blvd Slots keeps its
405px store screenshot and the softness, because the only larger thing that exists is
MobilityWare's trailer.

### A required field made an existing mechanism redundant

`poster.jpg` next to a project's assets had been globbed by slug to feed card and tile thumbnails,
and that was the right answer while nothing named a poster in front matter — _"adding a project is
one Markdown file."_ Once `poster` is required on a video hero, the glob is a **second source for one
picture**: set a hero poster and the tile would still have shown whatever file happened to sit beside
it. Removed from both consumers (`projectThumb()` and `generate-og-images.mjs`), behaviour identical,
because the only three projects the glob actually fed resolve to the same files.

Worth noticing generally: adding a field is a moment to check what the field makes unnecessary. The
drift was not there before this change and would have been there after it.

**And removing it was reasoned to be behaviour-identical, and was not.** Diffing the built site
against `main` — 23 pages, byte for byte — turned up one `<img>` on `/projects` where Secret
Garden's tile had silently swapped a 640x480 source for a 221px one, because its poster is
deliberately not its video's own frame. Fixed with a `thumbWide` override, which is what that field
is for. Two things generalise: **a fallback chain is worth diffing the OUTPUT of rather than reading**,
and the first fix was wrong too — `thumb` looked obviously right and the archive tiles ask for the
wide aspect, which only the diff showed.

### Cost notes

No subagents. The work was serial and small. The expensive part was not the measurement — that cost
one throwaway script — it was building the live poster at all, which is most of what was written and
all of what was then deleted.

## #268 — the gallery's ends and its controls (2026-09-02)

Two axes on one switcher — how much room the row leaves at its ends, and what the scroll controls
are — and two bugs found on the preview on the way. The decisions are in CLAUDE.md; what belongs
here is how the pass went wrong and what that is worth.

### The first diagnosis I offered was wrong, and Ali's own was right

The issue said the bottom-right arrows felt "stuck on there," and I answered that they sat under a
large dead gap. Measured, the gap is 24px, which is normal spacing. The emptiness Ali was seeing is
caption line-count spread — 23px on marvel-snap against 69px on i-fits-i-sits — which is a content
concern, not a layout one.

The instinct to reach for was hers, not mine: the arrows are 78–124px below the pictures they
scroll. **Distance was the real argument and I nearly buried it under a wrong one.** Worth writing
down because the wrong version was more specific-sounding, which is exactly what makes a wrong
diagnosis stick.

### The pips were removed on correctness, not on taste

Round one put pips between the arrows. Ali caught what I had not: "the pages/pips only go to 2." A
row of variable-width slides has no page count. `scroll-snap-align: start` on slides running 160px
to 630px means the number of distinct resting positions is a function of viewport width, so a fixed
pip count either points at indices the row cannot reach or hides content behind the last pip.

**That is not a bug in the pip implementation, it is a category error in the control**, and the
proportional bar Ali proposed sidesteps it by reporting a ratio instead of an index. It degrades
into "nearly all of this is visible" (98.5% on critter-3's 11px of overflow) rather than into a
wrong number.

### Two of my own measurements lied, in the same way

Both were colour samples, and both went wrong by sampling geometry I had not looked at.

- Sampling a button's contrast ring at a fixed inset crossed its 14px corner radius on two of the
  four sides, so the sampler read the photograph behind it. Reported 1.39:1 for a ring that measures
  15:1.
- Sampling all four sides of an edge-positioned arrow mixed page ground into what was supposed to be
  the image behind it.

Both were fixed the same way: sample only the vertical middle band of one side, at
`deviceScaleFactor: 3`. **A colour measurement is a geometry measurement first**, and a sampler that
returns a plausible number is indistinguishable from one that returns a right number until you draw
where it sampled.

### A comment justified its value by someone else's bug, and that bug got fixed

The 8px padding shipped with two reasons: the focus ring, and #163's frame line being clipped at
rest. Five days later #283 pulled the frame line inside its own border box, which retired the second
reason silently. Nothing failed — the padding is still right — and nothing in the repo would have
told the next session that half its justification had expired.

Caught only because bringing `origin/main` in meant reading what had landed. Re-measured both shapes by
pixel rather than trusting either the old claim or the new arithmetic (my first pass at the new
arithmetic had the sign of a negative `outline-offset` backwards, and would have "confirmed" the
dead claim). The comment now says what stopped being true and why.

**The general form: a justification that points at a bug elsewhere has a lifetime, and nothing
enforces it.** A justification that points at a rule — here, the focus ring's 3px+3px — does not.

### The contact sheet needed the lab state to be a pure function of an attribute

`contact-sheet.mjs` applies its `hide` list before its `click` list, so any state reached by
clicking a control inside the hidden panel is uncapturable. Rather than reorder the renderer, the
lab was rewritten so its state is a pure function of `data-control` on the root, applied by a
`MutationObserver` — which let the sheet drive it with `attrs` and no clicking at all.

Worth keeping as a constraint on the next lab: **make the panel a view of the state, never the owner
of it.**

### Cost notes

No subagents; the work was serial and every question was about this one component. The switcher was
most of the spend and all of the deletion — five scaffolding files, gone in the settle commit, per
the skill's own rule. The two throwaway measurement scripts were cheap and paid for themselves
twice: once catching the fade misalignment's exact size, once catching that the frame claim had
died.

## #278 — the container's ring wasn't one thing (2026-09-02)

The issue named a single mechanism — the CSS `:focus-visible` ring on `.gallery-viewport` reading as
"this whole region is selected." The decision is in CLAUDE.md; what belongs here is that the first
switcher answered a narrower question than the one Ali actually had.

### The switcher's first round compared candidates for the wrong half of the bug

Three candidates went up — colour, weight, and inset-vs-outside on the CSS ring — built directly
from the issue's own "Options" list. Ali's first reaction to the preview: "I'm confused what this is
testing out — my concern is this reticle that goes around the whole gallery." The screenshot she
sent showed four corner brackets and no connecting line — `reticle.ts`'s own decoration, not the
outline any of the three candidates touched.

**The issue's diagnosis was accurate but incomplete, and I built the instrument from the issue
rather than from the screenshot.** `reticle.ts`'s `FOCUS_SELECTOR` matches any `[tabindex]`, so it
tracks `.gallery-viewport` independently of whatever the CSS ring does — a second mechanism with the
same root cause (the container being the tab stop) but no shared code path with the first. Nothing
in the filed issue mentioned it, because the issue was written before #268's fix landed and the
zoom-path bug it was actually reporting made the reticle's role harder to isolate.

**The general lesson: a switcher built to answer a filed issue's own framing can still miss what the
reviewer reacts to, if the issue's framing was itself incomplete.** The fix wasn't to distrust the
issue — the CSS ring genuinely did need the three candidates — it was to treat the first preview
reaction as new information rather than confirmation, and add the axis that was actually missing
rather than defending the one already built.

### The reticle exclusion needed a debug listener, not a screenshot, to trust

Verifying "skip" mode by eye was unreliable on its own: the reticle's `fade` idle mode holds its
last target for 1.6s before fading, so a quick click-then-tab test in a scaffolding round showed
stale brackets that looked like the exclusion had failed, when the real cause was leftover state
from the _previous_ candidate's target still finishing its hold-and-fade. Confirmed correct instead
by attaching a throwaway `document`-level `focusin` listener and checking it received zero events
while "skip" was active — a direct test of the capture-phase interception rather than an inference
from a screenshot taken at an arbitrary moment in a 1.6-second animation.

**Worth keeping as a general habit for this reticle's idle modes**: `fade` and `linger` both keep
displaying a stale target for up to `HOLD` after the thing that caused it changes, so a screenshot
taken immediately after a state change can show either the new state or the tail of the old one, and
they can look identical. Wait past `HOLD`, or verify the underlying event/state directly.

### Cost notes

No subagents. Serial, single-component work, same shape as #268. The scaffolding grew by one file's
worth of logic (the reticle-intercept axis) mid-pass rather than needing a second branch — cheap
because the panel and route were already built and only needed a third `data-*` axis and a few lines
in the wiring script. Four scaffolding files deleted in the settle commit.

## #207 — the current-work line was a shared sentence wearing a shared fact's clothes (2026-09-04)

Filed on 2026-08-27 as a `decision`: About's career paragraph named Second Dinner twice in twenty
words because `currentNote` had to name the studio for the homepage, and Ali's framing was that she
might want to rethink single-sourcing itself for this case rather than tweak the wording.

### The code had already answered the question by the time anyone asked it

The issue argued from the prose. What settled it was what had happened to the field in the eight
days since it was filed. `about.astro` was splitting the string on the word "Godot" to inject a
citation link, with a comment admitting a reword would silently drop it — the page wanted a fact and
was parsing a sentence to get one. #253 had put a 90-character ceiling on the field for the
homepage's one-line box, which is how "the studio's first game" became "our first game": a layout
constraint on one surface rewriting copy on another. And the field's own comment listed three things
any edit had to preserve. **A field with a three-clause contract for its consumers is a sentence
with dependents.** The fix was to store `{ since, doing }` and let each page compose its own
sentence; the decision record is in CLAUDE.md.

### The guard moved to the page that owns the constraint

The 90-character ceiling was a fact about the homepage's box, written as a comment in a content
file. It is a build-time assertion in `index.astro` now — the page composes the line, so the page
asserts it. Checked by lengthening `doing` and watching the build fail with the composed sentence in
the error, which is the "expressed as a build error rather than a note in a document nobody reads"
rule from the content model, applied to layout for once.

### Counting the copies changed the framing

Before touching anything, grepping for the claim found it hand-written in five places in four
different wordings (the field, the résumé group `intro`, `resumeSummary`, LinkedIn's `ABOUT`, and
the group label). Single-sourcing the _sentence_ between home and About was protecting two of six
surfaces, and the guard on the other four was CLAUDE.md, not the schema. That is what made writing
"a new team" in two page files an acceptable cost rather than a betrayal of the content model.

### Cost notes

No subagents; the whole change touches five source files and was cheaper to do inline than to brief.
The PDFs regenerated because `content.config.ts` and the job file are hash inputs; `check:resume-print`
confirmed nothing on paper moved.

## #290 — the links were camouflaged as prose, and a rule got invented mid-pass (2026-09-05)

Ali's question was open in the most useful way: "the links are pretty plain, is there a better way?
Maybe the answer is no." The tenth run of the design-switcher loop, and four rounds.

### Measuring turned a taste question into a defect

The issue reads like a polish request. The measurement did not. On `/projects/marvel-snap` three
`<ul>`s render down the page, and the outbound-links one had **every computed property identical**
to the two body-copy lists above it — family, size, line-height, `disc` marker, 40px indent, 600px
max-width. Only the anchor's blue differed, which is what a link inside a paragraph gets too. Add
that it carried no heading while `Team` above it had an `<h2>`, and the block meaning "leave the
site" was rendered as prose and never introduced.

That reframed the whole pass. "Plain" is a preference; "indistinguishable from body copy" is a
defect with a fix, and it is only visible if you read the computed styles rather than the source.

### The reviewer's instinct was right and the stated reason was not the mechanism

Ali ruled out the plated-rows candidate as "sacrifices readability, pretty heavyweight" and picked
the quiet stack. Both true — 306px against 160px for five links — but the mechanism underneath is
sharper: **a plated row turns the link's label into a button's label**, neither link-coloured nor
underlined, while every other outbound reference on a project page is both. `i-fits-i-sits` links
Puzzle Cats in its prose _and_ in that block, so the plate gave one destination two treatments on
one page. Worth naming the mechanism rather than just agreeing, because the mechanism is what tells
you the pills on `/contact` are still right there and wrong here.

### A candidate I invented to dissolve a trade-off, which did not

`kind` discriminates on two of nine pages and indents every link 72px on all nine to do it. A
trailing tag looked like it kept the information and the page-column alignment. It does not: the
tags rag out at a different x per row, so they stop being scannable, and scanning was the entire
reason to want the aligned column. Built, rendered, rejected, and reported as underdelivering
rather than quietly dropped — the contact sheet is what made it obvious in one look.

### The rule I invented, and Ali catching it

Nine of nine headings on this site are plain nouns or first-person phrases; none is imperative. I
measured that, then cited it back as a **constraint** and used it to exclude "See Also" — the
canonical phrase for exactly this block — across two rounds. Ali: "I think the lack of imperative
headers is an accident rather than on purpose." She was right, and checking took one grep: nothing
in CLAUDE.md or the `write-copy` skill has ever said it.

**An observed regularity is evidence, not a rule, until someone writes it down.** The failure mode
is specific to a repo like this one, where a lot of real rules _are_ written down — a measured
pattern presented in the same register as a settled decision is hard for a reviewer to tell apart,
and the person who can overrule it is the one least able to see it happening. It is the drift the
content model's guard table exists to prevent, arriving through prose instead of through a second
copy of a fact.

### The frame that decided the wording was Ali's, not the switcher's

Round 3 offered six labels for _what the links are_. Ali's counter was better: the block is
additional references for **what the page does not contain**, since the hero, shots and description
already carry the project. That is relational, it survives the block's composition changing, and it
immediately killed `Elsewhere` and `Off the Page` for naming a location — she wants it open to an
on-site cross-link one day. Which turned up a real constraint worth recording: `links[].url` is
`z.url()` and rejects `/projects/kaneva`, so that openness is a schema change, not a heading choice.

One number closed it: at n=1 `More` is the weakest option, a heading promising more above a single
item, and that is seven of the nine pages.

### Cost notes

No subagents — nine content files and four scaffolding files, all cheaper inline than briefed. Two
contact sheets per round did most of the work the switcher could not: "which of these is loudest"
and "does this still hold at one link" are both simultaneous questions. The gate cost one real bug:
`showDrafts` correctly kept the lab's markup and script out of production while a plain
`import '~/styles/links-lab.css'` inlined the whole stylesheet into all 16 project pages, because
**Astro bundles CSS off the module graph, not off what renders**. Found by grepping `dist/`, fixed
with a `?raw` string import injected by the gated component. Worth knowing for the next switcher
that needs a stylesheet on an existing route.

## #306 — the résumé PDF was set in the wrong font for four months (2026-09-05)

Filed as a small one: the committed PDFs drift by whoever last built them, 9 embedded font subsets
on Ali's Mac against 3 in a Claude Code web session, identical geometry. The issue's own framing was
"is the difference worth caring about at all?", with retiring a sentence in CLAUDE.md as the cheapest
outcome.

### The first measurement dissolved the question

The issue is about a difference between two renders, so the obvious first move is to look at what
each one embeds. Both were wrong. The web-session render is **Liberation Sans**, Ali's Mac is
**Helvetica**, and the face the résumé is supposed to be set in — Public Sans, chosen on a
comparison in #191 — appears in neither. The subset-count difference everyone was looking at was a
side effect of two different fallbacks, not of two subsetting engines.

That reframed it from a housekeeping question into the exact bug #191 believed it had closed:
a distributed document set in whatever face the rendering machine happened to have, and on macOS a
face not licensed for embedding.

### Load order, not configuration

`--font-body` named Public Sans correctly the whole time. `@fontsource` was installed and imported on
both résumé routes. The face simply never loaded: a webfont is fetched when something uses it, and
`--font-body` points at Public Sans only inside `resume.css`'s `@media print` block. On screen the
résumé is Figtree, so nothing requested it, `document.fonts.ready` resolved without it, and
`page.pdf()` — which emulates print internally — took its snapshot before the fetch it had just
triggered could land. The fix is `page.emulateMedia({ media: 'print' })` one line earlier.

### Why three green guards missed it

`check-resume-print.mjs` does emulate print media, so it has always measured the real Public Sans
layout, matched its baseline, and passed. `check:pdf` hashes inputs. The page-count assertion counts
pages. **Nothing looked at the PDF's own bytes**, so the two guards were each internally consistent
about a different document. The strongest tell was available and nobody was in a position to see it:
the on-screen `/resume` page is Figtree, so **no human had ever seen the Public Sans rendering** —
the face was picked on a switcher, measured, and then never shipped. Its content height is 927.92px
against the 928px #191 recorded, which is how you can tell the geometry was right all along.

### The guard that closed it is smaller than any option in the issue

The issue listed regenerate-and-compare in CI (needs a tolerance), regenerate-and-commit (a bot
pushing to `main`), and recording the subset count in the lock file. All three treat the PDF as
something you compare against a reference render. It isn't: Chromium stamps a fresh `/CreationDate`
and `/ID` into every render, and glyph IDs are indices into the embedded subset, so identical
documents diff as thousands of meaningless changes — a trap this repo had already hit and written
down. **The property that was drifting is one the file states about itself.** Reading `/BaseFont`
needs no browser, no reference and no tolerance, so it runs in `--check` on Cloudflare next to the
staleness hash, and it explicitly tolerates the subset-count difference the issue was filed about.

### What generalises

**A hash of the inputs is not a check on the output.** `check:pdf` proved the PDFs were built from
today's résumé and said nothing about how they were built. Every guard here was watching an input or
a derived measurement; the artifact itself was unexamined, which is how a wrong-face document shipped
for four months with CI green.

### Cost notes

No subagents. The whole investigation was five Bash calls — enumerate `/BaseFont` in the committed
PDFs, walk `git log` for the same field across twelve commits, probe what the browser requests under
each media type, then an A/B render. Delegating any of it would have cost more than doing it, and the
git-history walk is what turned one suspicious render into a four-month pattern.

## #240 — the reticle was indicating what the browser had declined to indicate (2026-09-05)

Two lines in the issue: _"a bit of bugginess where it can hang around"_ and _"do we want it to travel
between the header and the body? Or just exist in only the body?"_. They turned out to be a bug and
a preference, and separating them was most of the work.

### The bug was one pseudo-class

The temptation was to treat "hangs around" as a tuning question — lengthen `HOLD`, add a timeout to
the focus path — and put it on the switcher with everything else. Probing it first is what stopped
that. Five scenarios went into a Playwright harness before any code changed: hover a card and move to
prose, click a card and move away, hover and wheel-scroll off, leave the document, blur the window.
Three came back clean. One did not, and it named its own cause:

```
after MOUSE click     op=1  focus=A  :focus-visible=false
+2.2s pointer away    op=1  focus=A  :focus-visible=false
+3.5s pointer away    op=1  focus=A  :focus-visible=false
```

The reticle tracked `:focus`; the ring it exists to decorate is `:focus-visible`. So after any mouse
click it drew a selection marker on a control the browser had specifically chosen not to mark, and
then held it for the life of the page, because `retarget()` only starts the idle countdown when
nothing is active and a focused element is active. Both halves had to be true for the hang: the wrong
pseudo-class put it there, and the idle rule kept it there.

**The first probe's scenario A was a false negative and nearly cost the diagnosis.** "Hover a card,
move the pointer to prose" reported no fade — the reticle had simply moved to a _second card_,
because the coordinate picked for "prose" was inside one. Re-run against a real paragraph found by
querying the DOM rather than by guessing a coordinate, it faded correctly. A scenario that measures
the wrong pixel returns a plausible failure, which is the same shape of convincing wrong answer the
switcher skill's traps section is about, arriving before the switcher existed.

### The measurement reframed the design question

`fade` (#33) had already settled idle behaviour, so the obvious reading was that the long-diagonal
problem was solved and this was about taste. Measuring said otherwise. On `/projects` the resting nav
pill is 353px from the first card and 1515px from the furthest tile — against a 1509px viewport
diagonal, so the header-to-body traverse is longer than the screen. And `fade` cannot reach it: the
brackets are placed at home on every page load and are not dormant, so the traverse fires on the
first acquisition of every navigation. **An idle behaviour settles what happens after a pause and
says nothing about the first move after a page load.**

That turned "should it travel between the header and the body" from a preference between two feels
into a question with a number attached, and it is what made a four-mark instrument worth building
rather than a two-way A/B.

### The instrument

Sitewide axis, so no lab route — the panel, its CSS and its `<head>` bootstrap were string constants
in `BaseLayout.astro` injected with `<Fragment set:html>`, gated on `showDrafts` at the markup and at
the script. `src/scripts/reticle-lab.ts` was a deliberate copy of `reticle.ts` rather than an import,
so the shipped file stayed byte-identical for the life of the comparison.

The candidates were verified distinct before Ali saw them, by sampling how far the brackets had got
85ms after crossing from a nav link to a card:

```
h1  49% of the way there    (a flight — the incumbent)
h2 100%                     (a cut)
h3  61%                     (no home, still flies across)
h4 100%                     (no home, header never targeted)
```

**One rule of the loop earned itself again here: the panel is the thing the subject would otherwise
chase.** `FOCUS_SELECTOR` matches `input` and `summary`, so every click on a radio would have parked
the brackets on the instrument while comparing exactly where the brackets go. Swallowing
`pointerover`/`focusin` in the capture phase at the panel's root is what kept the comparison about
the page.

### Ali picked H2, and what it preserves is the point

_"Feels like it balances the uniqueness and the usability."_ The resting pill stays, so the reticle is
still a selection cursor that is on screen before you touch anything; chase-and-settle stays
everywhere it was legible as a chase. The one move removed is the one that was never legible as a
chase, because it spanned the page.

Verified on the shipped build: nav→card 100% (cut), card→card 62% (travel), card→nav 100% (cut),
nav→brand 49% (travel inside the header). The character is intact within each region and gone between
them, which is a sharper outcome than "less motion".

H3 and H4 both lost on costs invisible from a desktop, recorded in CLAUDE.md so they are not
rediscovered: dropping the home retires the sticky header's stated justification, and on a phone —
no pointer below 40em — the brackets on the nav pill are the entire reticle, so a homeless one renders
nothing at all.

### Cost notes

No subagents. The whole pass is one script, one layout file and a probe harness, and the expensive
part was measurement rather than breadth — five probe scripts against a locally-served `dist/`, none
of which another agent could have run more cheaply than inline. The teardown left the diff at a single
file: `git diff --stat origin/main` reports `src/scripts/reticle.ts` and nothing else, and `check:pdf`
reported nothing to regenerate, confirming no `byteHashedFiles` input was ever touched.

## #299 — the drop shadow was fine, the silhouette was not (2026-09-05)

Ali's issue was two sentences: "The drop shadow on them looks weird. Maybe we do something other
than round buttons?" The eleventh run of the switcher loop, and the first where the measurement
mattered more than the candidates.

### Measuring first turned a taste question into a geometry one

The instinct on reading the issue is to reach for the shadow — soften it, shrink it, scale `--lift`
down on small controls. Measuring the silhouettes instead said the shadow was never the variable.
The plate is an unblurred copy offset straight down, so it reads as thickness only where there is a
flat bottom under it: `.card` 97% of its width, `.tile` 90%, a pill 61–81%, an icon-only button
**0%**, because square padding plus a pill radius is a circle.

Then the measurement that actually shaped the candidate set: **for any convex shape the visible
plate is a band of constant _vertical_ thickness**, so a circle's plate covers exactly the area a
36px slab's would. It is not too big — what collapses at the sides is its _perpendicular_ thickness,
which is why it ends in two cusps rather than two corners. That killed the whole "scale the lift"
family before a line of the switcher was written, and it would have been a plausible, shippable,
wrong fix that also broke a shared token.

### The contact sheet found what the strip could not

Twelve variants went onto a cloned arrow first, which was enough to rank the treatments and not
enough to judge them. The contact sheet at rest / hover / dark is where A1 lost decisively: at hover
the plate grows to 8px and the border turns magenta, so the incumbent is two misregistered
concentric circles — the artifact at its worst, in the state nobody screenshots.

### Ali narrowed twice, and the second question was the better one

First pass: **A3 + B3**, one radius everywhere. Then the question worth recording — "would this make
the site look more cohesive or too samey?" — which is answerable rather than a matter of feel.
`border-radius` is absolute and these elements differ ~8× in size, so 14px is 10% of the maximum
possible radius on a `.tile` and 78% on a 36px arrow. One rule, a visibly different corner at every
size. And the site had already run the experiment: `.card` and `.tile` have shared a radius since
Phase 5 without ever reading as one object.

Answering it surfaced the opposite risk, which is what moved the pick to **A4 + B3**: at 78% the
arrow was still nearly a circle, enough to fix the plate and not enough to look chosen. Two values
rather than one, and the second is `--radius` because that is what `.reticle` draws its brackets at.

### Two mistakes of mine, both caught before they shipped

The contact sheet's caption formula clamped `border-radius` by half-width but not half-height, so it
printed **"0% flat bottom"** for a pill — a confidently wrong number in the exact place the skill's
own traps section warns about, on the axis it was measuring. And the first cohesion answer was going
to be argued from the composite rather than computed; the ratio table is what made it a fact instead
of a second opinion.

### Cost notes

No subagents — the whole pass is one component family and a stylesheet, and a delegated agent would
have rebuilt the same context to measure the same five elements. One dev server, one Playwright
process reused across every measurement, and the scaffolding never left the branch.

The egress proxy 403s `*.workers.dev`, so the preview could not be opened from the session at all;
the local branch build (24 pages against main's 23, `noindex`, absent from the sitemap) and
Cloudflare's own green deploy stood in for it. Worth knowing for any future pass whose deliverable
is a preview URL: **the session can build the thing it cannot look at.**

`base.css` is a `byteHashedFiles` input, so both PDFs regenerated for a change the résumé renders
nothing of. `check:resume-print` reported the geometry unmoved, which is the assertion that means
something here.

**One claim in this entry was falsified by the rebase that closed it, which is worth keeping.** It
originally said the PDFs had been subset differently by the #245 fallback Chromium and wanted a real
rebuild on Ali's machine. Checking the embedded face instead of trusting that reasoning showed
`main` and this branch both carrying **Liberation Sans** — a platform fallback, not the Public Sans
#191 self-hosted — so the advice would have swapped one fallback for another (Helvetica on a Mac)
and fixed nothing. That is #306, and #308 landed on `main` while this branch was open. Rebasing onto
it and regenerating is what actually put Public Sans in these files. **The lesson is the cheap one:
the PDF states its own `/BaseFont`, and reading it took one line where the inference took a
paragraph and was wrong.**

## #305 — the lightbox's three leftovers (2026-09-05)

Split out of #249 after it closed: an accessible name that promised the wrong thing, a counter that
could lie later, and swipe on touch. None blocking, none of them what #249 was about.

### Two of the three were one decision wearing two hats

The counter item read as a display bug and the stepping-set item read as a behaviour question, and
they are the same question. Stepping through every slide — the option that makes the counter true by
construction — loses to the pinned box #249 shipped: the box is sized to the widest picture in the
row, so a slide under the zoom threshold lands in a box several times its width. That is #249's own
8%-fill complaint, reintroduced one step in. Once stepping stays scoped, the counter's set is
provably not the row, and the honest move is to state no position rather than a misreadable one.

**The precedent that made the answer feel less arbitrary was already in the repo.** `Gallery.astro`
argues the scroll rail can be `aria-hidden` because "a screen-reader user learns the same fact from
the arrows' disabled state." The same sentence justifies suppressing a counter that cannot be
phrased truthfully, so this is applying a rule rather than inventing one.

### The case being guarded does not exist yet, so it had to be synthesized

Every gallery on the site is either all-zoomable or has one zoomable image, which means no page can
exercise the branch this change adds. Verified by serving `dist/` through a proxy that injected one
extra non-zoomable `.gallery-slide` into `/projects/marvel-snap` before the script ran: 5 slides, 4
zoomable, counter `display: none`, both arrows still rendered with the previous one correctly
disabled at index 0. **A guard for a hypothetical is worth exactly as much as the test that
hypothetical gets**, and route-rewriting the built HTML was cheaper than committing a fixture page.

### The swipe's design is what it does NOT do

No `preventDefault` anywhere and every listener `passive`, so the gesture is decided at `touchend`
from two coordinates rather than claimed at `touchstart`. That is what keeps pinch-zoom, scrolling
and the platform back gesture working while a swipe is in flight, and it means a swipe that turns
out not to be one costs nothing. Measured in headless Chromium with synthesized `Touch` sequences at
390x844 and 1280x800: left steps forward, right steps back, a vertical-dominant drag does not step,
a 20px drag does not step, and one starting 8px from the edge does not step. A swipe past either end
is a no-op because `show()` already clamps.

Nothing animates, which is the whole reduced-motion story — there was no branch to write, only a
comment saying why.

### Cost notes

No subagents; three small changes to two files and a stylesheet comment. The PDFs regenerated
because `base.css` is a `byteHashedFiles` input and this touched a comment in it, and
`check:resume-print` confirms the geometry did not move.

**The rebase onto #306 is what makes that a non-event**, and it is worth recording as the first
time that fix paid. This branch was opened saying the regenerated PDFs wanted redoing on Ali's
machine, because a web session's fallback Chromium subsetted them differently. #306 found that the
subset count was a symptom of the face never loading at all, fixed the load order, and added a
`/BaseFont` assertion to `--check`. Rebased, this branch's own regenerated PDFs embed Public Sans
and pass that assertion, so there is nothing left to redo somewhere else.

## #49 — the issue was about the wrong product, and the draft mechanism was already there (2026-09-05)

Ali reopened #49 by saying it need not be Godot projects, and listing what she actually wants to
write up: the current job, this site, maybe a grant-funded game, non-game projects, talks. She also
wanted draft pages that never reach production but can be added to over time.

### The two halves of the ask had opposite answers

**The draft half needed no code.** `draft: true` has excluded a page from production, the sitemap,
the OG set and the completeness check since Phase 2, and shown it on every branch preview. It had
just never been described as a way to keep a page for months. The most useful sentence in the whole
session was probably "that already exists."

**The content half needed a schema change, and not the one the issue proposed.** #49 wanted a
second, looser collection, which was right for the notes it described and wrong for what Ali
listed. Everything on her list is a real write-up; what blocked each one was the `projects` schema
assuming every entry is a game with a picture of it. `kind` is the axis that moved, and `art` is the
hero for the one page whose subject cannot be pictured. The completeness check did not loosen at
all, which is the part worth noticing: the fix for "the strictness blocks a true page" was to give
the strictness an honest way to be satisfied, not to make it optional.

### What the first render said that the reasoning did not

The hero card was built at 21:9 with a confident comment about why. On the page it read as a
picture that failed to load: 370px of neutral tint with a title in the corner. A 3:1 band reads as
a title card. The comment was rewritten to say what was measured rather than what was intended,
and the square featured card clipped "Unreleased" mid-word at `--text-xl`, which no production
project had ever exercised because every featured project carries a thumbnail. **Two of the three
visible defects in this change were in slots no existing content had ever rendered into**, which is
the argument for looking at a mock-up rather than reasoning about it.

### Issues moved rather than closed

#49 was retitled to what it turned out to be. The original low-friction-posting idea is #323, with
its test intact, because nothing Ali listed needs it and it is still the only thing that keeps a
site alive. #60 closes with the decision going the other way from its own steer, on the argument
that a draft answers its thinness objection.

### Cost notes

No subagents. One session, about forty tool calls, most of them reading: the content model, the
three components that consume a hero, the OG generator and the draft plumbing, before writing
anything. The two draft bodies are scaffolds from sourced material (the Godot résumé bullets, the
rebuild log's own strongest-material list) with `TODO(#60)` and `TODO(#48)` markers where only Ali
can write. The PDFs regenerated because `base.css` is a `byteHashedFiles` input;
`check:resume-print` confirms the geometry did not move.

## #314 — the project backlink (2026-09-05)

The twelfth run of the live-switcher loop, and the one where measuring reframed the issue twice
before a candidate existed. The decisions are in CLAUDE.md under "A project page opens with a
breadcrumb and closes with its neighbours"; what belongs here is how the pass went.

**Ali's issue was two sentences and one of them was ambiguous.** "Just a regular link - is that the
best call? Maybe make a picker of other options" reads either as "build a switcher" (which is how
this repo has phrased it eleven times) or as "maybe the answer is a picker of other projects". Rather
than ask, the instrument covered both: a switcher, with a literal `<details>` picker of all sixteen
projects as one of its end-of-page candidates. That cost one radio and removed the question.

**The measurement that mattered was not about the link.** `Projects` turned out to be on a project
page three times, and the header is sticky on a desktop and deliberately static below 40em — so the
backlink is redundant where the nav is pinned and unreachable where it is not (4,722px behind you at
the bottom of Marvel Snap on a phone). That is what turned a one-axis question about a link's
styling into two axes: what the slot above the title should hold, and whether anything belongs at
the foot of the page.

**Four rounds, and the switcher got shorter every time**, which is the loop working as documented.
Five top candidates and four end ones; then Ali picked the breadcrumb, so the weight question came
off and three variants of the crumb's _content_ went on; then she settled the crumb, so that axis
came off entirely and the end-of-page axis grew label variants; then one more candidate (a
tier-scoped pair) that only existed because settling the crumb created the seam it fixes.

**Twice the reviewer's own instinct was right about the problem and wrong about the fix, and
measuring is what separated them.** "Doesn't really add anything unless I added sub project pages"
was pointing at a crumb rendered as plain text — not a location, so not a breadcrumb; the fix was two
`id`s on `/projects` and an `href`, not a different candidate. And "maybe Newer / Older" was pointing
at "Previous in _what_?" being unanswered — true before the breadcrumb named a set, and the labels
themselves would have been false on 6 of 15 steps because the catalogue has year ties.

**One candidate was put on the switcher specifically to be disproved.** `Newer / Older` went up with
a panel note naming the page where it breaks, rather than being argued away in chat. That is cheaper
than a paragraph and it is the thing a switcher is for.

### Cost notes

No subagents — this was one repo, one component, and a lot of measurement, which is exactly the
"could do it inline in a few tool calls" case. The expensive part was Playwright measurement, not
generation: page geometry at three viewports, string widths in the kicker's own font, the
tier/status cross-tab, thumbnail sources, and the adjacency table that settled the labels.

**The scaffolding was four files and never touched a shipped one** except two `id` attributes on
`/projects`, which were part of a candidate rather than of the instrument. Production builds were
checked at 23 pages with no `dist/design/` on every round, per the skill's own teardown check — the
one that earned itself during #249.

**A local dev-server bug produced one confidently wrong measurement.** `build.format` is `'file'`,
so `/projects` is `dist/projects.html` — but `dist/projects/` also exists, holding the detail pages,
and the throwaway static server resolved the directory first and 404'd. It reported "0 archive
tiles" for a page with eleven. Worth remembering that a measurement harness can be the thing that is
broken, which is the same shape as the traps the switcher skill already lists.

**#318 came out of this pass and is unrelated to it**: every project page with a gallery scrolls
sideways on `main`, because the visually-hidden zoom hint is absolutely positioned and the scroller
is not, so the hints escape its clip. Found while checking whether the lab had introduced horizontal
overflow — it had not, and the same number came back on the real page.

## #318 — the zoom hint escaped the scroller (2026-09-05)

Found while measuring for #314 and fixed on its own. Every project page with a gallery panned
sideways, on `main`, at every viewport: `/projects/marvel-snap` reported a `scrollWidth` of 1384
against a 390px window and really scrolled, and 1568 against 1280. The decision is in CLAUDE.md
under the gallery section; what belongs here is that the one-line fix the issue proposed was right
and incomplete, and only measurement said so.

### The diagnosis was already in the issue, so the work was proving the fix

`.gallery-zoom-hint` — the visually-hidden "opens larger" text that joins each zoom link's
accessible name — is `position: absolute`, and `.gallery-viewport` was `position: static`. An
absolutely-positioned box is clipped by an ancestor's `overflow` only when that ancestor sits
between it and its containing block, and the scroller did not: the hints resolved against
`.gallery`, so each was laid out at its slide's real x inside a track up to 1782px wide and handed
that straight to the document. The last hint's right edge measured 1383.72 against a `scrollWidth`
of 1384.

That is why `overflow-x: clip` on the scroller changed nothing, which the issue had already
measured. The escape is about which box the hint is laid out against, not about how hard the
scroller clips.

**The fix is the rule rather than the surface.** `position: relative` on the scroller contains
anything absolutely positioned inside a slide; pinning the hint's own `inset` fixes the same
symptom and leaves the class of bug live. #163 already paid for that lesson three surfaces at a
time.

### The obvious fix broke the left edge fade, and nothing would have said so

The scroller joining the positioned paint layer is not free. `.gallery`'s two edge fades are
`::before` and `::after` on it, both `position: absolute` with no `z-index`, and they used to paint
over a static scroller for nothing. Positioned, the scroller lands between them in tree order — so
`::after` still paints above it and `::before` does not.

Measured on `/projects/marvel-snap` mid-scroll: the right fade was pixel-identical and the left one
was simply gone, reading the raw image at 2,4,5 where it had been a gradient stepping 141 → 94 → 47
across its 3rem. The build was green, `verify` was green, and the page still scrolled correctly.
Only a screenshot showed it.

`z-index: 1` on both fades restores it, and `1` is deliberate rather than arbitrary: the site's
scale is header 40, reticle 50, skip link 100, so a fade still passes beneath a sticky header.

### The residual pixel diff was Chromium, and one control proved it

With the fade restored, `/projects/marvel-snap` at 390 still differed from `main` by 21,311 pixels,
scattered across the whole page including sections far from the gallery. The top deltas were green
and orange against neutral greys — subpixel text fringes against grayscale antialiasing.

Four one-line variants on `main` settled it in one run:

| Patch                                    | `scrollWidth` | Differing px vs `main` |
| ---------------------------------------- | ------------- | ---------------------- |
| `z-index` on the fades alone             | 1384          | **0**                  |
| `position: relative` alone               | 375           | 31,533                 |
| both (shipped)                           | 375           | 21,311                 |
| `.gallery-zoom-hint { left: 0; top: 0 }` | 375           | **21,311**             |

The arithmetic is the argument. The `z-index` rule is inert until the scroller is positioned, and
adding it back recovers exactly the 10,222px the fade was worth. And a completely different fix,
touching no positioning layer at all, produces the identical 21,311 — so the residue is Chromium
re-rasterizing text once the document stops being horizontally scrollable, not anything this change
chose. Any fix for #318 produces it.

**Worth generalising: "the page is still 21k pixels different" is not a finding until you know what
a different fix does.** The instinct is to hunt the diff; the cheaper move was to produce the same
outcome another way and compare.

### One stale comment retired with the bug

`overscroll-behavior-x: contain` was justified by a swipe past the end not turning into a back
gesture "or starting to scroll the page sideways behind it". The issue noticed that the second half
described a property the page did not have. It has it now, so that half is gone — the same shape as
the `--gallery-pad` comment #268 wrote and #283 quietly expired.

### Cost notes

No subagents, no switcher — this is a defect with a right answer, not a question for Ali, so the
design-switcher loop would have been ceremony. One repo, one file, two rules.

The expense was Playwright, and it bought three things a build could not: the repro across 7 pages
at 3 viewports, the pixel proof that the gallery renders identically to `main` (0 differing pixels
across 22 full-page captures and 10 interaction states — mid-scroll, under the sticky header,
region focus, link focus, lightbox open), and the antialiasing control above. Two determinism
controls were run first, capturing each build twice, so "0 px" means something.

## The résumé's paper look, twelve rounds on a sheet (#235, 2026-09-05 → 06)

The first design-switcher pass on paper. Ali's brief was two sentences — make the résumé a little
less simple, and the PDF may diverge from the site where something looks good printed and would not
on a webpage — and the answer was the thirteenth run of the review loop, on a new instrument.

### The instrument

A PDF is a still frame, so flipping treatments on the same sheet is the comparison that carries
information, not opening N PDFs. The lab route rendered the résumé **as the printed page**: 816px
wide at letter geometry, the print block's token pins on the sheet instead of `:root`, its rules
transcribed under it, `resume.css` deliberately not imported so its screen half could not style
the sheet as the panel. Before anything was judged on it, a script walked every element of
`/resume` under real print emulation and diffed y, height, width, face, size, weight and colour
against the sheet: **94 of 94 matched.**

The panel opened with seven axes and 22 marks. Ali narrowed it round by round — face, size, ink,
header, role line, skills, groups, subtitle, marker, page-2 header, bar colour, group dates, job
line — and every round closed an axis or replaced it with a narrower one. The switcher's shorter
each time, which the skill says is the loop working.

### What measurement changed

- **The one-pager had 32px of slack, not 102.** CLAUDE.md carried #32's number; bullets had landed
  since. `resume:headroom` read 928 of 960 before the first candidate was built, and that number
  put a live budget readout on the panel — every mark labelled with its cost, and a gutter layout
  Ali would otherwise have liked labelled "over by 120px" instead of argued against.
- **Ali could not tell where the two-pager broke.** The sheet's fixed line at 960px was never where
  the break fell, because a job never splits and a heading never ends a page. The lab was taught
  those two rules, split the sheet into real pages with a margin band, and reported each page's
  fill. It matched the committed PDF: the break falls before MobilityWare, and page 1 keeps 128px
  white as the price of never splitting a job.
- **Her name on page 2.** Page margin boxes turned out to be supported in the Chromium `build-pdf`
  runs, `:first` keeps them off page 1, and later pages can carry a taller top margin — so the
  running header lives in the margin. She preferred the full-size version that takes 48px of page 2
  over the free one, which was the right call: at fit-to-width on a phone the free one was invisible.
- **The name was Type 3.** The first port set it in Gabarito Variable and the PDF looked right;
  Chromium had embedded the instance as glyph procedures, invisible to the font guard and unreadable
  to the parsers a résumé actually meets. Static Gabarito now, and the guard reads `FontName` and
  fails on Type 3.

### What Ali decided, and why it reads as one document

Gabarito on the name only — two faces, one decision, the display face on nothing inside the text
register. Magenta on the name, the section heads and their rules, and nowhere else. Company first
and bold on the job line, against her own 2019 résumé's title-first, because on this document the
studios are the recognisable half. A bar down each Second Dinner group and no other job: she asked
whether uniformity was worth it and answered it herself — the bar means something under H2 and
nothing under H4. Skills aligned, the subtitle italic, 14pt above each section heading chosen
knowing it spent the slack to 13px.

The screen took the structure and kept its own paint. The bars are in the frame colour there, not
the accent, because on screen magenta means _where you are_. The contact block is hidden on the
site, Ali's idea, since the download button wanted the slot and the links are three places already.

### What the instrument is now

Ali asked whether it should become a reusable preview. Same answer #246 gave the panel: a template
in the skill, not code in `src/`. The sheet is a transcription of the print block and would drift
from it the moment anyone edited paper; copied per pass, it is re-checked by the fidelity script
before it is trusted. The three files and the checker live under the design-switcher skill's
`references/resume-paper-sheet/`, with every trap this pass found written beside them.

### Cost notes

No subagents. One long session for the twelve rounds, which the loop's shape wants — each round
was a reaction, an edit, a measurement and a push, and a cold session per round would have re-read
the whole record every time. Playwright bought the fidelity check, the per-candidate height sweep
(every mark measured alone against the incumbent, both densities), the pagination check against the
committed PDF, and the three paper experiments (margin boxes, a fixed header, the Type 3 embed).
Every one of those returned a confident wrong answer somewhere that the measurement corrected.

## #108 — the architecture read (2026-09-06)

The issue asked for `src/` and `scripts/` to be read as a whole once, after roughly forty
post-launch passes had each touched their own corner without anyone looking at the result as one
codebase. Scope was set before any code moved: read, do the fixes that are safe by construction in
one PR, and open an issue for anything that is a decision rather than a cleanup. Eleven findings
were small enough to fix directly. Two were not, and became issues instead of edits.

### What shipped and what didn't

Eleven items went in: a dead `.project-list` rule in `base.css` whose comment claimed a consumer
that no longer exists, a zero-caller `formatSpan()` (and the `formatDatePart`/`MONTHS` helpers that
existed only to serve it), an unimplemented `--verify-live` flag left in a usage banner, three
duplicated helpers consolidated into `scripts/lib/` (a directory walker, the print viewport and
page-height budgets, and the `goto` then `emulateMedia('print')` then `fonts.ready` sequence the
#306 fix depends on), a hand-rolled front-matter parser replaced with the shared `readEntries`, two
duplicated fallback chains merged into `content.ts`, a doc-block gap in `reticle.ts` closed with one
sentence, and two unread tokens (`--font-sans`, an alias with no `var()` consumer, and
`--color-on-accent-link`) deleted along with the print pins that existed only for them. The `src/`
agent went one step past its literal brief, removing `formatDatePart` and `MONTHS` once `formatSpan`
was gone rather than leaving them as newly dead code; correct, and flagged rather than done quietly.
`scripts/fetch-posters.mjs` and `capture-comparison.mjs` got rows in CLAUDE.md's "Where things are"
table instead of a code change, since both are real manual tools that were discoverable only by
`ls`.

Everything above was checked against a baseline `dist/` built from the unmodified tree. All 23
pages are byte-identical once stylesheet hashes are normalised, the built CSS differs by exactly two
removed tokens and one dead rule, and the 18 project OG cards plus 4 brand cards hash identical.
`check:resume-print` matches its committed baseline. The PDFs were regenerated exactly once, at the
end, and pass at 1/1 and 2/2 pages with the print face asserted as Public Sans.

### The print block was already an allowlist

The headline finding, and it corrects something `tokens.css` and this repo's own notes had said
since #62. Every one of `tokens.css`'s `:root` blocks sits inside `@media screen`, so a token the
print block never pins is not leaking onto paper; it is undefined there and the declaration falls to
its initial value. Of the 56 tokens the print block pins, three do anything: `--font-body`,
`--leading-tight` and `--measure`. Deleting the other 53 moved zero of 108 rendered elements on the
one-pager and zero of 155 on the two-pager. `tokens.css`'s header is corrected on this branch.
Whether to delete the 53 inert pins is deferred to Ali as
[#327](https://github.com/ali-wallick/Portfolio/issues/327), with the measurement attached rather
than argued in prose. `resume.css` is otherwise untouched; its only change is losing the two pins
that went with the deleted tokens.

### Two more questions, and one survey miss

[#328](https://github.com/ali-wallick/Portfolio/issues/328) tracks the `src/` to `scripts/`
boundary: five pieces of content logic (a job sort, an education sort, the current-title derivation,
the résumé bullet grouping, and the thumbnail fallback order) are written twice because
`content.ts` imports `astro:content` and no script can. The fix is a mechanism question, not a
rewrite: Node 22 needs `--experimental-strip-types` to import `.ts` directly, so the choice is
between a `.mjs` module both sides can import, a Node bump, or a check that fails when the copies
disagree.

One survey claim did not survive verification. An Explore agent reported `fetch-posters.mjs` as
referenced by nothing; its grep set had not included CLAUDE.md, which names the script. Caught
before it became a deletion, and it is why every deletion-driving claim in this pass was re-grepped
by the planning session rather than taken from the survey as given. The non-findings are recorded in
CLAUDE.md's new section so nobody re-derives them: component boundaries sound, no dead props, no
`variant` branching, no verbatim duplicate CSS, zero raw px font sizes, no scoped `<style>` blocks,
`reticle.ts` matching its own header, Chromium launch and `serve-dist` already consolidated.

### The model allocation is the finding worth keeping

Three Sonnet Explore subagents ran the survey in parallel, one each on styles, on components plus
lib plus the content model, and on scripts plus client code: 354k tokens combined, 48, 54 and 58
tool uses, three to four and a half minutes apiece. Cheap, fast, and wrong often enough (the
`fetch-posters.mjs` miss) that nothing they reported drove a deletion without a second grep.
Execution ran as two sequential Sonnet implementation agents rather than parallel ones, because both
needed a build in the same checkout: `src/` first (5 commits, ~202k tokens, 106 tool uses), then
`scripts/` (7 commits, ~210k tokens, 110 tool uses). Each carried a brief that named every item
with a file and line and the exact verification command, which is what made Sonnet the right model:
the judgment had already been spent in the plan.

The print-block spike ran on Opus, in parallel with the `src/` agent against a frozen copy of the
baseline `dist/`, because it was measurement whose plausible wrong answers this repo has documented
at length (a hidden ancestor's `display` inflating a count from 3 to 21; a large diff meaning nothing
until a second method agrees). It ran 44 tool uses over 13 minutes and its traps are in #327's body.
A Sonnet agent drafted this entry from the plan; a `code-review` pass at medium effort found three
real things (an error message discarded in the new print-page helper's callers, a viewport height the
geometry extraction had left hand-written, a CLAUDE.md table row the same PR had made false), all
fixed before push. Fable planned, verified the surveys, made the token and header edits, regenerated
the PDFs once, triaged the review, opened the issues and edited this record.

### Cost notes

Seven agent sessions and one review fork, around 1.4M subagent tokens in total, against a Fable
session that stayed short because it never read a stylesheet end to end. The one place parallelism
was rejected on purpose was `src/` against `scripts/` execution, both of which wanted a build in the
same checkout. The spike was the expensive agent and the one that changed a conclusion; the surveys
were the cheap ones and the ones that needed checking.

The `scripts/` agent's OG verification covered only the 4 brand cards, because the 18 project cards
are build output rather than tracked files and its brief pointed it at a hash list that only had
four lines. Closed by hashing all 18 against the frozen baseline `dist/` afterwards, which is where
the "18 + 4" figure above comes from. Worth generalising: a verification step is only as wide as the
baseline handed to it.

## #327 — the print block's 51 inert pins (2026-09-06)

The decision #108's spike deferred. The spike had measured it thoroughly and recommended leaving the
pins alone; Ali's answer reframed it — she is trying to get the site into a state she can call
shipped, does not mind churn, and asked whether the pins with a connected decision could be kept.

**Applying that criterion is what settled it, because it collapses to the three that were already
load-bearing.** Every one of the 51 inert pins was justified by one argument — pin it so a future
rule that picks it up prints something sane rather than a surprise — and that argument is exactly
what #62 retired: an unpinned token on paper is undefined, so it prints nothing rather than
something wrong. There was no second criterion left to separate them by.

The pleasing part: **the two best-documented pins were the clearest deletes.** `--measure-wide` and
`--color-index` were the only two carrying a comment written specifically to justify their own
existence, and both said "pinned per the rule at the top of `tokens.css`" — a rule #108 had already
corrected out from under them. A pin justified only by a rule is worth what the rule is worth.

### Verification

The session re-measured rather than trusting the spike, which was the right call twice over. The
spike's baseline `783f51f` turned out to _be_ the paper-look commit, so #235 was already priced in
and the numbers held — but two commits had landed since, and the live counts (54/70/16, not 56/72/16)
had to be confirmed before anything could be deleted.

Three methods, agreeing:

- **Static.** 54 pins, 70 tokens, 16 unpinned — matching #108's updated live counts exactly.
- **Dynamic, per pin.** Injecting `--pin: initial` — the guaranteed-invalid value, i.e. genuinely
  "undefined" — one pin at a time under print emulation, diffing rendered elements only with an
  ancestor walk for `display: none`. Result: 3 load-bearing, 51 inert. A different mechanism from the
  spike's served-CSS rewrite, same answer.
- **All at once.** Pruning to 3 and running the real guard: zero elements under `article.resume`, and
  the page-count assertion still 1/1 and 2/2.

**Two findings the spike did not have**, both from running things rather than reading them:

`check:resume-print` reports **42 diff rows** for a change that moves nothing on paper, because its
baseline captures the four chrome blocks the print block hides. The spike had noted the shape and
called it harmless; it is the difference between a zero-row change and a 42-row one, and it is #330
now.

And the proposed inverted guard is mostly redundant. Injecting a print-reaching rule both ways: with
a **pinned** token it applies, moves geometry, and the guard fails loudly; with an **unpinned** token
it silently no-ops and the guard passes, correctly, because nothing moved. So the PDF is already
guarded and the only uncovered case is "your print rule is dead," which is a linter for authors
rather than a guard for paper. Dropped from the change.

**#235 had left a stale claim inside the block and the prune surfaced it**: `--font-mono`'s comment
said "Paper is set in one face," false since `.resume-head h1` started naming static Gabarito
literally. Paper is two faces, and `--font-display` was being bypassed rather than being the
mechanism.

### The shape that shipped

Three pins, each annotated with its consumer and the measured cost of removing it, plus a header
saying paper's vocabulary _is_ this list and that a print rule wanting a token should pin it then and
say why. Two real observations were rescued as prose rather than as 19 pins — that Phase 5's
interaction layer has nothing to say on paper by nature, and that a height device reaching paper is a
page-count hazard visible only as a build failure several bullets later.

Literalising instead (the spike's Shape B, 3 declarations replacing 56 pins) was rejected on a cost
the spike had understated: `p, ul, ol { max-width: var(--measure) }` is a top-level `base.css` rule,
so a pin tracks that selector while a literal copy of it in the print block is a second copy free to
desync. Trading 51 inert lines for a real coupling is the wrong direction on a site whose content
model exists to rule that out.

Four stale "denylist" sites corrected — `resume.css`'s in-block comment (which contradicted
`tokens.css`'s corrected header outright, two files giving opposite instructions for the same act),
the `design-switcher` skill (instruction to a future session, so the one most likely to cause harm),
`base.css`'s reticle-timing comment, and `check-resume-print.mjs`'s own header. One deliberately
kept: the universal-`transition` comment calls the block's _property_ rules a denylist, which is
still true and is now the only live half of the hazard.

### Cost notes

One session, no subagents. The work was measurement against a known question with the traps already
written down in #327's body, which is the case where delegating costs more than it saves — a
subagent would have started cold on the one thing the issue was already carrying. The expensive step
was builds: five full `npm run build` runs, four of them only to put a modified stylesheet in front
of the guard. The per-pin bisect avoided a sixth through fifty-ninth by patching the live CSSOM
instead of rebuilding, which took 54 pins from roughly an hour of builds to about a minute.

---

## #328 — the `src/` ↔ `scripts/` boundary (2026-09-06)

Split out of #108's read, and the one finding there that was a mechanism decision rather than a
cleanup. Five pieces of content logic — the résumé job filter and sort, the education sort,
`currentTitle`, `bulletBlocks`, and `projectThumb`'s fallback chain — were written twice, once in
`src/` and once in a `.mjs` script, each second copy carrying a "keep in sync with …" comment. The
content model's own failure mode, applied to code.

### The blocker the issue named had expired

#328's body costed the good answer — one pure module both sides import — at "a Node bump or a flag
on every npm script", because Node 22 was documented as having `--experimental-strip-types` behind a
flag. Unflagged stripping landed in **22.18.0**. Verified in a session container on 22.22.2: a
`.mjs` importing `./shared.ts` runs with no flag, and the only requirement is that the specifier
carry the extension. That turns the cost into one line of `engines.node`, which is what made the
copies collapsible instead of merely checkable — and a check that two copies agree is a hedge
against having two copies.

The module imports **nothing at runtime**, not even `import type` from `astro:content`. That import
does work, but the guarantee would then rest on one keyword nothing in `verify` fails fast on, and
on a file `astro sync` generates; twelve hand-written structural interfaces cost less and are not
weaker, since `astro check` still type-checks the real `CollectionEntry` at each `content.ts` call
site. Its other constraint — erasable syntax only — became `erasableSyntaxOnly: true` in
`tsconfig.json`, which is the answer to "should this get a check too": a compiler error on the
`npm run check` every PR already runs, at zero new code.

### Three divergences, found while planning and fixed rather than pinned

Ali's call to fix them here. Two are invisible today and one is not.

`onResume` on jobs was `truthy` on one side and `!== false` on the other, equivalent only because
Zod's default runs inside Astro and not in `readEntries`. `onResume` on **education** was filtered
by LinkedIn and not by `/resume`, so the site was ignoring a field its own schema declares — the
build diff cannot show that one, which is why it is written down instead. And the OG script never
read `thumbWide`, so **six share cards changed on purpose**; four of them were logo art
cover-cropped to a 1.9:1 band while the front matter already named a 16:9 capture for that exact
shape.

A latent crash went with them: `renderEducationSection` read `.honors.length` with no `??` on a
field that is `.default([])`, so an entry omitting it would have failed `check:linkedin`. Same class
as the first divergence — it worked only because the one committed entry happens to declare it.

### What the verification could and couldn't prove

The built-output diff (#108/#273's test — build `main` in a worktree, build the branch, compare all
23 pages with stylesheet hashes normalised) came back with exactly the six predicted OG hashes
differing and **nothing else**: same file list, byte-identical HTML and CSS. `check:linkedin` is a
byte comparison against a committed artifact, so it is simultaneously the proof for four of the five
duplications and the proof the module loads under plain `node`. `check:resume-print` reported the
geometry unmoved.

What no check can vouch for is whether the six new cards are better, which is why they need an eye
on the preview. That is the honest cost of fixing a divergence rather than pinning it, and the
reason it's worth paying is on the page.

### Cost notes

One session, no subagents — the plan was already written and approved on the issue, and the work was
following it. Step 0 was a throwaway probe push, before any real code, to learn what Cloudflare's
build image resolves `.nvmrc`'s bare `22` to; the container's egress proxy blocks `workers.dev`, so
the answer had to come from the branch's own build rather than from polling the preview URL. Two
full builds (baseline and branch) plus one forced PDF regeneration were the expensive part.

## #107 — the agentic layer, read as a whole (2026-09-07)

Filed 2026-08-23 as three stale Phase 2 skills, corrected 2026-09-05 to the real scope: ten skills,
two hooks, `settings.json` and `launch.json`, sequenced after #108 so it could reuse that pass's
model rather than re-derive one. Ali's lens carried the whole thing: the site is live and
maintained, so a file is judged by what a cold session six months out needs from it to do a routine
job, not by whether every sentence in it is still accurate. The plan went up as a page and onto the
issue before any file moved, and her four calls came back on it: grow the hook, rename
pre-launch-check, keep content-pass and write-copy as they stand, keep launch.json.

### What shipped

`guard-preserved.sh` covered two of CLAUDE.md's five Don't-touch paths going in; it covers all five
now, tested by piping the harness's own block payload for eleven paths and checking each landed as
expected. One exemption survived the addition on purpose: `infra/README.md` is already treated as a
live document in `.prettierignore`, so blocking `infra/` wholesale would have contradicted a
decision three lines from the one that named it. `settings.json` went from five of nineteen npm
scripts allowed to the whole résumé and LinkedIn family, minus `dig *` (intercepted on Ali's own
machine per `infra/README.md`) and `npx astro build` (nothing invokes it); `update:resume-print`
stays prompting on purpose, since it is the one script that can rewrite a guard's own baseline. Two
prose rules became schema guards rather than sentences a skill has to remember to repeat: `draft` is
required on a project instead of defaulting to `false`, and the per-job bullet floor CLAUDE.md
settled on 2026-08-23 is a `superRefine` on `jobs` now. Both were proven the same way, by writing
the mistake and watching `astro sync` fail naming the rule. `pre-launch-check` is `pre-merge-check`
now, its launch half cut to the three checks that are actually periodic after a release, its dead
`TODO(phase-3-revisit)` grep swapped for the live `TODO(#n)` convention. Six more skills picked up
smaller corrections. `content.config.ts` is a `byteHashedFiles` input, so both PDFs regenerated for
the schema change and `check:resume-print` matched its baseline.

### What the surveys got wrong

Survey 2 called the Homebrew `PATH` line in both hooks stale, "a no-op on every environment this
hook runs in," wrong on the one fact that mattered: Ali runs Claude Code locally on a Mac where the
hooks actually fire. It also proposed blocking `infra/` wholesale, which is the exemption above
working backward, and would have broken a decision `.prettierignore` had already made. Survey 1 ran
`SHOW_DRAFTS=true npm run build` despite a read-only brief; it changed nothing and reported having
done it, which is the only reason it is a note here rather than an incident. Every claim behind a
rename or a deletion was re-grepped before it reached a brief, the same rule #108 set, and this is
the run that shows why: two claims that would have shipped wrong went into a plan instead.

### The surveys' best findings

`add-project`'s own template was handing out a `youtube` hero with no `poster`, a field the schema
has required since #273, so a session following the skill literally would have failed its own
build. Two skills, `write-copy` and `update-resume`, still said the Second Dinner ceiling meant "no
platform," the exact phrasing #32 corrected on 2026-08-26 on Ali's own statement that mobile is
sayable; the correction had never propagated past this file. And `content-pass` enumerated
`build-pdf.mjs`'s hashed inputs by hand, one file behind after #328 landed the day before. Survey
3's table carried several more guards past these three: title-cased labels, kebab-case filenames, a
stale-content grep run against `dist/`, and each was judged rather than built, since every one needs
a heuristic with false positives on today's content, or catches a mistake nobody has actually made.

### The model allocation

Three Sonnet Explore surveys ran in parallel: five content skills (187k tokens, 48 tool uses, 6.5
min), the process skills plus both hooks plus settings (113k, 43, 3.3 min), and every imperative
sentence in all ten skills checked against whatever guard enforces it (171k, 39, 5.2 min). Two
Sonnet general-purpose executors then ran in parallel on disjoint files, since neither needed the
other's output: the hook, settings.json and .prettierignore (142k, 13 tool uses, 1.2 min), and the
skill text edits plus the rename (201k, 68, 4.6 min). A Sonnet agent drafted this entry from the
plan. Fable wrote every brief, re-grepped each claim that would rename or delete something, made the
two schema edits by hand, ran the build, wrote CLAUDE.md's record, and ran a medium `code-review` before push, which found nothing. Subagent
tokens ran to about 815k before that review.

### Cost notes

One process slip is worth recording plainly. Executor B's rename staged with `git mv`, and the
planning session's first commit of the hook work swept the staged rename in along with it, caught on
`git show --stat` before push, undone, and redone as two commits with `git commit -o` against named
paths. Ten skills turned out not to be "too many to load," a non-finding worth keeping: only
descriptions load at session start, about a thousand tokens for all ten combined, so the real
question this pass answered was routing rather than count. CLAUDE.md's own size came out of scope
rather than being trimmed here: 3,507 lines at the start of this pass, read in full by every session
that opens it, filed as #335, a decision, with a proposed cut line rather than a cut.

---

## #275 — the link check runs itself now (2026-09-07)

`npm run links:external` has always been the half of link-checking that fetches, and it has always
been run by hand. Nothing ran it on a cadence, so the first notice of a dead hero video was whenever
somebody thought to check — which on a portfolio nobody is actively working could be months. Now a
monthly Action runs it and opens an issue.

The interesting part is that this had to argue against a rule the repo already had. CLAUDE.md is
explicit that this check stays out of CI, because a deploy failing over somebody else's downtime is
worse than the rot it catches. The issue's own framing is what unlocked it: **that is an argument
against gating, not against noticing.** A job that opens an issue instead of failing a build changes
nothing about whether a deploy succeeds — it is the missing half of the same reasoning rather than a
reversal of it. The workflow cannot reach a deploy at all.

Ali's call on cadence was monthly, and on a clean run the job closes the issue rather than leaving it
for her.

### Auto-closing is safe for a structural reason, and it is worth being explicit about why

The obvious objection to a bot closing its own issue is that a clean run might mean the far end came
back rather than that anyone fixed anything. That cannot happen here, and not by luck: every
remediation this site offers **removes the URL from the built HTML.** `dead: true` renders a link as
plain text with no `href`, and a dead video hero renders its `poster` instead of the iframe. So a
fixed link genuinely leaves the checker's input, and a clean run means the fix shipped. The property
is load-bearing enough that the script's header says the job has to stop closing if it ever stops
being true.

### Two things the shape is defending against

**Crying wolf.** The check buckets three ways rather than two precisely because LinkedIn answers HTTP
999 to anything that is not a browser, and a datacenter IP collects 403s from several more hosts. A
job that filed on those would be ignored by its third run. Only the dead bucket can file; unverifiable
reaches an issue as a count, inside an issue a dead link already justified. This session's own run is
the demonstration: 29 outbound links, **28 unverifiable and 0 dead**, because the Claude Code egress
proxy 403s essentially everything. A two-bucket version would have filed 28 false alarms.

**Notification noise in the other direction.** One issue exists at a time. Its body carries a
fingerprint of the sorted dead URLs in an HTML comment, so a rerun finding the same set edits the
body quietly — an edit does not notify — and only a _changed_ set comments. A monthly "still dead"
comment on an issue Ali has not got to yet is the same crying-wolf wearing different clothes.

### The report is data because the alternative was parsing prose

`check-links-external.mjs` prints for a person, in a format written to be read. The reporter needed
the same three buckets, so the flag added is `--report <path>`, emitting JSON; stdout and the exit
code are byte-identical with and without it, because the hand-run tool is still the primary use.
Parsing the pretty output would have made prose into a contract nobody declared — the drift the
content model's guard table exists to rule out, one directory over.

### Proving it without being able to run it

`schedule` and `workflow_dispatch` both refuse to run a workflow that is not on the default branch,
so there is no way to exercise this on a feature branch. The reporter therefore carries a `--dry-run`
mode with a dry-run-only `--simulate-open <fingerprint|none>`, and all four transitions plus the
no-op and the flag guard were proven locally against synthetic reports. The build-and-check half was
run for real: `npm run build`, then the check with `--report`, then the reporter against the actual
output.

### The fact most likely to bite later

**GitHub disables a scheduled workflow after 60 days with no commit activity in the repository.**
That is exactly the quiet-portfolio case this job exists for, so its reliability degrades when it is
most needed. GitHub emails the owner when it happens, so the failure is loud rather than silent, and
`workflow_dispatch` is the manual fallback — but it is worth knowing that a guard against neglect is
itself switched off by neglect. It is in the workflow's own header for whoever meets it first.

## #338 — build guards for the rules that have none (2026-09-07)

Filed by Ali off the back of #335's split: "wondering if it makes sense to do a pass to add more
things to guards so we can reduce what's in context." #335 had made the cut line between the brief
and `docs/decisions/` mechanical — is the rule enforced by a build guard? — which turns adding a
check into the only lever that shrinks the one document every session reads in full.

### What shipped

Six rules. Three source-tree in a new `scripts/check-source.mjs` (raw colours, raw `px` font sizes,
`TODO(#n)`), two output rules in `check-links.mjs` (a word welded to an inline element, title case
on `<h2>`), and one baseline diff in a new `check-line-length.mjs`. Two of five "no guard behind
them" entries are gone, so is the "Use the variables" standing rule and the title-case convention,
and the 701×960 entry shrank to a pointer at the module that already owns the constant. Each guard
was proven the way #107 proved its two — write the mistake, watch the build name the rule, revert —
and the whole `verify` chain is green at eight steps.

**The brief went 693 → 686 lines, and that number is worth stating plainly rather than dressing
up.** Twenty-two lines of rules came out; six went back as a note on why the remaining three are
staying, and four more as pointers to the new scripts. A net seven lines is a thin return if lines
were the point. **They are not** — the return is that four rules are now enforced instead of
remembered, and a rule a session cannot violate silently costs nothing per session whether or not
its sentence is still in the file. The line count is the visible proxy for that, not the thing
itself, and a pass that optimised the proxy would have skipped the note that keeps the next session
from mechanically guarding the last three.

### The finding worth carrying: the naive form of a guard measures the wrong population

Three of the four candidates were narrowed by measurement, and in none of them was the obvious
version _slightly_ wrong. It was measuring something else entirely.

The welded-word rule, unscoped, reported two hits and both were correct code — the résumé's download
button is an `inline-flex` with a `gap`, so `Download PDF` abuts a `<span>` in the HTML and renders
with a space anyway. That button had been flagged going in as a _likely live instance of the bug_,
which is what a source-level read of it looks like; checking it against a real build is the only
thing that found the gap. Scoped to `<p>` and `<li>` the rule reports nothing.

The title-case checker, run over all headings, breaks on four strings that are all correct:
`Dead Booty: An Atari 2600 Game` and `KinoClue: A Tangible Tabletop Mystery` (both styles capitalise
after a colon), `aliwallick.com`, and `Critter³`. Every one is a data-driven `<h3>`. Every `<h2>` is
hand-authored, and all thirteen are clean. #107 declined this candidate as "too heuristic" and was
right about the general case and wrong about the scoped one.

The line-length ceiling would have been **red on merge**: 80 is WCAG AAA, the site is held to AA,
and `/about` runs 83 average at today's 37.5rem. It shipped as a ratchet against a committed
baseline instead — Ali's call, asked before anything was built.

The line-length scope itself took three passes and the first two were the same mistake in a
different costume: `main p, main li` put the homepage at 6.4 average characters, because card and
tile grids are lists of `<li>` link tiles. An accurate measurement of a card, averaged into a
statistic about prose, moved the site's figure from 76.5 to 63.

**So the method, stated once: before building a guard, run its naive form over the real tree and
read every hit.** Two of these would have shipped as false-positive machines otherwise.

### The instrument got checked before it was trusted

#253's own run produced two confidently wrong numbers — a `getClientRects()` line count over a flex
container that returned one rect per item, and an assertion built from a right-edge coordinate that
failed six times against correct code. So the new measurement was validated against a known
quantity before its baseline was committed: `/about`'s paragraphs render at exactly 600px, which is
37.5rem as the token says, and 83 average agrees with #253's probe table for that width. The
baseline was also run twice to confirm it does not drift between identical runs.

### What did not get built, and one that needed nothing

Three entries stay in "Rules with no guard behind them" and should. The frame-is-a-constant rule and
the `--ease`-on-a-clamped-property rule are judgment about how to express a change; the
observed-regularity rule is about how to reason. Each would need a heuristic that fires on correct
code, which #107 established is worse than the sentence it would replace. **The list reaching zero
is not the goal.**

The résumé's 701×960 entry came off for a different reason, and it is the cheapest result of the
pass: it needed no guard at all, because `scripts/lib/print-geometry.mjs` already exports the
constant and both consumers import it. The brief was restating arithmetic a module already owned.
Worth checking for before building anything.

### The guard's own first CI run found a defect in the guard

Worth recording because it is the pass's best evidence for its own thesis. The line-length ratchet
went red on its first CI run, and the site was fine — the guard was wrong. Two routes moved past a
flat ±1.5 tolerance: `it-will-kill-you` 51.8 → 58.7 on **8** full lines, `mini-mages` 65.6 → 69.9 on
**9**. The sitewide figure moved **0.7**.

That spread is the entire diagnosis. Text rasterization differs between browser builds, and this
baseline was recorded in a Claude Code web session, which falls back to the session image's Chromium
(#245) rather than the pinned revision CI and Ali's machine both run — verified directly, not
assumed. A different build moves a word across a line break, and where that happens two lines' counts
change: everything on an 8-line page, nothing across 300. **The standard error of a mean falls as
1/√n, so one flat tolerance could never have fitted both**, and the number was never the bug.

So the sitewide average became the real assertion, with per-route bands that widen as a route
shortens (`1.0 + 20/√lines`). Per-route maximum is recorded and no longer asserted — one unlucky long
word either way, carrying no signal the average does not. The fix was checked against **both** real
datasets rather than tuned until the failing one passed: the cross-environment deltas are absorbed
(6.9 vs ±8.1, 4.3 vs ±7.7, 0.7 vs ±1.5) and narrowing `--measure` to 34rem is still caught
decisively — sitewide 76.5 → 71.3 against ±1.5, plus five named routes.

**The lesson is the one this pass already wrote down, turned on itself.** Every other candidate was
narrowed by measuring its naive form against the real tree; this one was measured against the real
tree _in one environment_ and shipped as though that were the tree. A guard is only validated in the
environments it will run in, and there were three here rather than one.

Two smaller notes from the same round. The baseline now records its platform and Chromium version and
prints a mismatch as the first line of any failure — `check-resume-print.mjs` added exactly that line
after #284, where its absence cost an hour, and this run cost the same hour for want of it. And the
GitHub Actions steps API lagged badly throughout: it reported "Build in progress" for tens of minutes
on a job that had already finished in 87 seconds. **The job log is authoritative; the steps view is
not** — reading the log is what turned a suspected hang into a diagnosis.

### A 43-fold edit, caught by reading the diffstat

The commit that first added the section above inserted it **43 times**. `str.replace` in Python
replaces every occurrence, the anchor chosen (`### Cost notes`) was a heading from #107's entry
rather than this one, and it appears 43 times across the log. 1,419 insertions for a 30-line
addition.

Nothing caught it: it is a Markdown document, so no guard in `verify` has an opinion, and Prettier
formatted all 43 copies happily. What caught it was reading `git diff --stat` and finding a number
that made no sense for the change described. **The habit is the guard here** — and the fix is to
assert the anchor is unique before replacing on it, which is what the script that finally landed
this section does.

### Model allocation and cost

Three Sonnet Explore surveys ran in parallel against a read-only brief: the check infrastructure and
where a new rule is wired (59k tokens, 15 tool uses, 1.5 min), an exhaustive raw-colour and
font-size inventory (56k, 27, 2.7 min), and the whitespace/line-length/heading evidence (87k, 47,
4.6 min). The third could not sample `dist/` — no build existed and its brief was read-only — so it
reported from source and flagged the `ResumeActions` case as unresolvable without one, which is
exactly the right failure and is what made checking it the first execution step.

Opus wrote the plan, put the three genuine calls to Ali before any file moved (ratchet vs. ceiling,
scoped title case vs. dropping it, and how to handle the live suspect), and did all the
implementation, measurement and record-writing inline — no executor subagents, because the work was
one connected thread where every step depended on the last measurement rather than fanning out.

Two process notes. The drafts build was run as well as the production one, since drafts render more
prose and carry the two curly-apostrophe headings the title-case tokeniser had to survive. And the
PDFs regenerated for a one-line comment change, because `base.css` is a `byteHashedFiles` input —
`check:resume-print` matching its baseline is what proves the résumé did not actually move, not the
bytes being identical.

## #340 — thinning the decision records (2026-09-07)

The cleanup half of #335, deliberately deferred out of PR #337 because rewriting in the same pass
would have destroyed the check that proved the move was safe. #337's verification was 3,065 of 3,074
non-blank lines preserved byte-for-byte, and that number only means something if nothing was
reworded.

### What the deferral actually bought

A clean instrument. Because the move was verbatim, every oddity found in this pass is
_unambiguously_ a split artifact rather than something that was always slightly off — there is no
third possibility to rule out. That turned the read from "is this prose good?" into "does this
sentence still point at something?", which is a question with an answer.

The same check ran again here, one level finer: a **token multiset** against the pre-thinning tree
rather than a line count, since this pass was allowed to reword. 96 tokens removed, 88 added, net
−8 words across 3,414 lines — and the removal list is short enough to read in full, which is the
whole point of choosing that check. Every entry on it traces to one of six edits.

### The find rate

Six broken prose pointers, four misfiled paragraphs, and two structural scars, in a document set
that had passed review two commits earlier. **None of them are catchable by a build guard**, and
that is not a gap to close: `check-links.mjs` reads `dist/`, and these are cross-references in
Markdown that never ships. A `"see X below"` whose target moved to a sibling file is still a
grammatical English sentence pointing at a real heading — just not one in the same document.

The highest-yield grep, in hindsight, was `\b(above|below)\b` across the split files, then reading
each hit for which document it assumed. 41 hits, 6 wrong. Second was `"this file"`: 8 hits, 1
wrong, and that one — `design.md` saying "This file and the plan both described \[a thing that was
wrong\]" — was the most misleading of the lot, because it turned `CLAUDE.md`'s confession into a
false claim about `design.md`'s own history.

### The overlap check came back clean, and the method is reusable

The issue asked for one read of the `docs/REBUILD-LOG.md` overlap to confirm it was a seam and not
a second copy. Rather than read 4,800 lines, I shingled every ≥10-word sentence in the records
against every sentence in the log and sorted by Jaccard similarity. About thirty pairs came back
over 0.6, and reading those thirty settled the question: the log explains how a pass ran, the record
states what it decided, and where they share a sentence they are using it for different work.

The same script found the two things worth acting on — `resume.md`'s duplicated header framing at
0.83 internal similarity, which was the issue's own first bullet, and the record-to-record header
formula at 0.81, which turned out to be deliberate consistency and was left alone. **Cheap enough to
be worth re-running after any future document split.**

### Model allocation and cost

Opus, inline, no subagents. The work was one thread — every finding came from a grep whose next
grep depended on reading the hit — and the fan-out shape this repo uses subagents for (independent
surveys of unknown territory) does not apply to reading four documents you have to hold in your head
at once anyway. Two throwaway Python scripts did the mechanical parts: the near-duplicate shingler
and the token-multiset differ.

One process note. The pre-split `CLAUDE.md` at `9490e32^` was the single most useful artifact in the
pass — `git show 9490e32^:CLAUDE.md | grep -n '^#'` gave the original heading tree in one command,
which is what turned "these headings look odd" into "the `## Phase 3 gate outcome` parent stayed
behind." **After a split, the parent commit is the map.**

## #344 — the verify command was a rebuild (2026-09-08)

The issue arrived well-diagnosed: `restore-snapshot.mjs --check-selfcontained` deletes
`snapshot/rendered/` at module top level, 245 lines before it reads its own flags, and the asset
recovery it then attempts needs a commit a shallow clone cannot resolve. The archive had already
been observed going from 102 files to 27 and recovered with `git checkout`.

The issue proposed three fixes in order of value: a real verify-only path, a preflight on
`ASSET_COMMIT` before the `rm`, and a temp-directory rebuild that swaps on success. The session
delivered the first two and argued the third down to a follow-up, on the grounds that a temp-dir
swap **without** a completeness assertion is a regression — it converts a loud crash into a clean
swap that silently drops files. That argument came out of the one measurement the issue did not
have.

### Counting the archive is what reframed the fix

102 committed files. 26 pages, `archive.css`, README — 28 derived from `snapshot/`. The remaining 74
split 54 / 14 / 6 across a git commit, the old blog host, and i.ytimg.com. So the shallow clone is
half the problem: this session could reach none of the three, and a preflight on the commit alone
would still have deleted 20 irreplaceable files and reported it as a `console.log`.

The count also falsified a sentence in `docs/PRESERVATION.md` that had been written specifically to
reassure a future rebuilder — the blog images are committed, so a post-cutover rebuild "will still
produce a correct archive from what is on disk". They are committed _inside_ the directory the `rm`
takes. That the doc was wrong about the same script's same first line is the strongest evidence the
`rm`'s reach was genuinely non-obvious, and it is now recorded as a correction rather than a
deletion.

### The first preflight passed while everything was unreachable

Worth keeping, because it was a plausible design that a weaker test would have shipped. The first
version probed one representative URL per host and treated _any_ HTTP response as proof the host was
up, on the reasoning that three of the nine videos are gone and answer 403, so a status cannot be
read as a verdict about i.ytimg.com. Sound reasoning, wrong conclusion: the session's egress proxy
answers **403 to every CONNECT**, so the probe read "host is up" while all 20 remote files were
unfetchable. It only surfaced because the probe was tested against the two hosts directly rather
than trusted from the preflight's own output.

The rewrite asks a narrower question with no heuristic in it — per file, and only about files
already committed: can this exact byte range be fetched back? The dead videos have no poster
committed, so they are never asked about. 20 of 20 came back unfetchable here, which is correct.

### Verification, in an environment that cannot run the thing being fixed

A rebuild is unrunnable in this session, so the fix was verified from the other direction. The two
authored files (`archive.css`, the generated README) were hoisted to module scope so the 190-line
build region could be indented into `if (REBUILD)` without a template literal's own content being
re-indented; the indenter refused to run if it found a multi-line literal in the region, and the
hoisted `ARCHIVE_CSS` was then evaluated and compared byte-for-byte against the committed file.
`--check-selfcontained` was run for real — 26 pages through Chromium, zero external requests, zero
broken refs — and the archive hashed identically before and after, which is the actual claim the
issue makes.

### Model allocation and cost

Opus, inline, no subagents. Same shape as #340: one thread where each step depended on reading the
last, and the two candidates for fan-out were both cheaper inline — the archive census is one `find`
plus arithmetic, and the doc sweep is one grep across three files. Three throwaway Python scripts
did the mechanical edits, each asserting its anchor matched exactly once before writing, which is
what made a 353-line restructure of a 530-line file safe to do without reading the whole diff twice.

## #339 — what makes a session read the record, measured rather than solved (2026-09-08)

The #335 split named a risk and left it open: `CLAUDE.md` is read in full at session start,
`docs/decisions/*.md` is read when something says to read it, and the session that skips the skill
gets neither. The issue listed four options and asked for a call. **It is still open** — the
recommendation below is a recommendation, and the decision is Ali's. What shipped is the part that
is true either way.

### The issue was two days stale, and both stale facts pointed the same direction

#342 (#338) had merged in between, and it answered this question one level down. It took four
unguarded rules, built guards for two, and declined the other three because a guard for them
_"would need a heuristic that fires on correct code."_ That is exactly what a `SessionStart` hook or
a path-triggered pointer does — it fires on every résumé edit, and almost all of them are correct.
**The repo's own most recent precedent for this class of decision says don't build it**, which is a
stronger argument than the one the issue made for itself.

The same PR raised the guard floor the risk sits on: `verify` gained `check:source` and
`check:lines`, and the "rules with no guard" list went 5 → 3. The issue's "the failure mode is waste,
not breakage" paragraph got more true while the issue sat there.

### The growth prediction was right about the rate and wrong about the location

The issue measured ~190 lines/day of `CLAUDE.md` growth pre-split and worried design.md would face
#335's problem on its own timescale. The rate held — the records went 3,184 → 3,463 in the first day
— but the distribution inverted: **tooling +177, design +72, content +56, resume −26.**

The mechanism is worth keeping because it retires the metric. **A record grows when its domain is
worked, and a pass that tidies a record is itself a pass on that domain.** #343 — the _thinning_ PR,
whose entire purpose was to remove redundant prose — net-added 49 lines, because recording the
thinning in tooling.md cost more than the thinning saved in resume.md. Growth tracks what is being
built that week, not which file it lands in. One day is not a trend, and that day was unusually
tooling-heavy.

### design.md does not need splitting, and the reason is not its size

1,457 lines, but the comparison to #335 does not hold: that was 3,774 lines read _unconditionally at
session start_, and these are read _conditionally, by the session that needs them_. Different
problem, not the same one at a smaller scale.

It is also already navigable, which is what the shipped change makes explicit. 18 `##` headings,
each stating the decision it settled rather than its topic, so `grep '^## '` is a usable index and a
split would replace descriptive headings with a directory listing that says less. One section (the
gallery, #166) is 304 lines; the other 17 average 68. **The trigger to watch is a session reading it
for one question and finding most of it irrelevant** — observable when it happens, and not
observable one day in.

### A fifth option, rejected on a timing argument

Not in the issue: a `PreToolUse` pointer keyed on the edited path, reusing `guard-preserved.sh`'s
mechanism, which already exists and is already wired to `Write|Edit`. It fires precisely in the
uncovered case and costs nothing otherwise, which made it the most attractive option on the list.

**It fires at the write, which is after the reasoning.** The waste #339 describes happens while
reading and thinking, before the `Edit` call is made. It would convert "wrote something contradicting
a settled decision" into "told at the last moment" — but the guards already cover that half, and the
half they don't cover is the half a write-time hook cannot reach. Recorded so it is not reinvented.

### The pointer pass found a stale fact, which is the argument for doing passes

`update-resume` was the only skill carrying an imperative "read the record". The rest were passing
mentions, one footnote at line 352, or nothing. Bringing seven up to that one was cheap and does
**not** close the gap #339 names — a session that skips the skill still skips the pointer — but it
stops one skill being the sole one that instructs.

Reading `pre-merge-check` closely enough to place a pointer turned up an unrelated error: it
described `verify` as "exactly the seven steps" and listed seven, when #338 had made it nine.
#338 edited that same file — it updated the `TODO(` section that `check:source` replaced — and left
the chain enumeration beside it stale. **A stale enumeration of the gate is worse than no
enumeration**, because it reads as authoritative. Corrected here.

### Two skills turned out not to want the pointer they were listed for

`release` is routed to the tooling record by CLAUDE.md's skill table, and writing the pointer is
what exposed that the content does not back it. The mechanism a release needs is
`docs/CLOUDFLARE.md`'s "release is production"; the failure its preconditions defend against —
"Deployed state drifts from the repo, and it has now happened three times" — is a section of
`CLAUDE.md`, which every session has already read. tooling.md carries one relevant section, the
Phase 6 gate. **A pointer added for uniformity would have sent a session to a 610-line file that
does not answer its question**, so the skill now says where its record actually is. The routing
table is left alone; the correction lives where it is read.

The first draft of that pointer also asserted tooling.md carried the drift record. It does not — it
cites it, in CLAUDE.md. Checking a claim about a file against the file is cheap, and this pass
produced two wrong ones (the other credited #338 with declining three candidates, when #338 narrowed
three and #107 declined four).

### `steward` is the one skill where the pointer must not be an imperative

Every other skill got "read `docs/decisions/<x>.md`". `steward` got a citation instead, and the
asymmetry is the point: the harness loads that file from the PR's head branch **on every PR event**,
and the file exists to stop a session spending a full-context wake on a PR that has not moved. A
read-the-record line there would spend the budget it protects, once per wake. It says to follow the
pointer when the rule is being _changed_, not when it is being _applied_.

The same session then exercised that rule live. It stood down on #348 once CI was green with no
conflict and nothing open, was woken by `ready_for_review` rather than by a check-in, re-applied the
test, and stood down again — which is the shape the #275 link-check argument and the #339
recommendation both land on independently: **subscribe to what changes, don't poll for it.**

### Verification

The index claim was measured before it was written, and then narrowed twice. The first draft said
every heading names its decision _and the issue that closed it_; 27 of 42 cite an issue. The second
added "and carries the date"; 41 of 42 do. Both clauses were dropped rather than hedged, leaving the
one property that holds for all 42 and is the one that makes the file navigable anyway.

### Model allocation and cost

Opus, inline, no subagents — the same call as #340 and #344, for the same reason: every step
depended on reading the last, and the two things that looked like fan-out were one `git ls-tree`
loop over four commits and one `grep` across ten skill files. The whole investigation was cheaper
than the analysis it produced would suggest, because the decisive evidence was four line counts and
one merged PR's stated rationale.

## #352 — a bug with no repro, found by reading the bail-out rather than the motion (2026-09-07)

The report was a description of motion: no reticle on any header, then brackets travelling in from
the corner on the first hover, and no idea when it happens. The instinct that motion is where the
bug is would have been wrong — nothing about the travel was broken. What was broken is a
**measurement that declined to happen**, three states earlier, and the travel was the only place it
became visible.

### The environment reproduced it before the reasoning got there

Three candidate triggers were on the table from reading `place()`'s bail-out — a null home, a
zero-width target, and an off-screen home — and all three looked impossible on a site whose header
is sticky and whose layout always renders a wordmark. Then the preview pane loaded `/projects` and
the reticle came up unplaced, with the nav pill measuring a real rect and `window.innerHeight`
reporting 0. **The browser pane is a hidden document, which is the same thing as a background tab.**
The unfalsifiable-looking condition was the one the tooling was already sitting in.

Worth keeping as a method note rather than a fact about this bug: an agent verifying visual
behaviour in a hidden preview is testing a page-visibility state a foreground browser never
occupies, which is a source of both false alarms and — here — a free reproduction of a bug a human
could not trigger on purpose.

### The fix was two generalisations, not two patches

Both halves already existed as special cases that had been added one at a time — `dormant` (#33),
then `crossing` (#240) — and the new state (never placed) would have been a third `if`. Replacing
them with `shown` costs a line and removes the class. Same shape as the "every picture is matted"
note: a treatment written as a list of surfaces misses the next surface, and `reticle.ts` had a list
of reasons-to-cut with the same failure mode. The reasoning is in
[`docs/decisions/design.md`](decisions/design.md).

### Verification

Instrumented rather than eyeballed, because the whole bug is an ordering: a `MutationObserver` on
the reticle recorded that geometry is now assigned first and `is-armed` lands 9ms later, where
before the class went on over an unplaced element. The three behaviours that had to survive were
each checked separately — a header→header hover still travels (no `is-cutting`), an acquisition from
an off-screen target now cuts, and a normal foreground load still rests on the wordmark and arms.

### The fix shipped, and the report came back — which is the argument for shipping to a preview

Ali retested the preview and still had a fly-in, with a repro this time: refresh with the pointer
over the wordmark. It was a **second** cause with the same appearance — the first acquisition after
a page load, travelling the width of the header — and no amount of further reasoning about the first
one would have found it, because the first one was genuinely fixed.

Two method notes fell out of that round:

- **The verification environment could not see it.** The preview pane is a hidden document, so it
  never dispatches the load-time `pointerover` a stationary cursor produces in a foreground tab.
  The bug's whole trigger is a foreground behaviour. The pane reproduced cause one for free and was
  structurally blind to cause two; the tell was reaching for a real browser and finding the Chrome
  extension unavailable, at which point the honest move was to reproduce the _decision_ — dispatch
  the event by hand and watch which branch `retarget()` took — rather than the frame timing.
- **"Did the fix reach the thing being tested?" is a question to answer with a timestamp, not an
  assumption.** Before treating the second report as a second bug, the Workers build check said
  02:53 against a test some fourteen minutes later. Had it been the other way round the whole
  investigation would have been chasing a stale bundle.

### The third round was a wrong fix, and it was wrong in a way worth recording

The second cause was diagnosed correctly and answered badly: the load-time move was made a cut
instead of a travel, which Ali rejected immediately — _"that actually seems worse. I see the
movement always on reload now."_ A teleport is still the brackets appearing somewhere they never
belonged.

**Both attempts were arguments about the 500ms when the complaint was about the two positions.**
Having a fix in hand for one symptom made the next symptom look like the same kind of question, and
it wasn't. The move existed because a stationary pointer's target is not knowable until after first
paint, so the answer was to stop painting a provisional position at all rather than to restyle the
correction — which also has the property the cut version lacked of leaving #240's settled travel
untouched.

Three rounds on one issue, each shipped to a preview and each caught by Ali in under fifteen
minutes. That loop is the thing CLAUDE.md's review-loop section is actually for, and it is worth
noting that **none of the three would have been caught by `npm run verify`**, which was green
throughout — including for the version she rejected.

### Model allocation and cost

Opus, inline, no subagents. The whole investigation is one file and its stylesheet, and every step
was a consequence of the last — the fan-out test in CLAUDE.md's "Notes for agents" says don't, and
the cheapest step (loading the page in the pane) settled the question the reasoning was still
circling.

## #48 — the build-in-public page, drafted from the log it describes (2026-09-08)

Ali's ask was a copy and content pass on the draft #49 left at `/projects/aliwallick-com`. The page
stays `draft: true`, its `role` stays empty (the completeness check is what holds it back, on
purpose), and the two TODOs that survive mark what only Ali can write: what the tooling cost in
money and time, and what she would keep or not do again.

### The scaffold's first sentence was wrong about the old site

The scaffold said the old site "kept saying 'Present' about a job I left in 2019." `snapshot/`
says no such thing — the 2020 straggler commit had already corrected Firefall's dates, and what the
old About page actually said in 2026 was "our upcoming mobile Marvel game," nearly four years after
the game shipped. The fix was to quote the page rather than characterise it, which is what the
issue's own comments already recommended. The hero's alt text was wrong in the same way: it
described a blank YouTube embed on a homepage whose lead image is a strip of project art, and the
new About alt said "childhood photo" for a headshot. **Neither matched its image**, and both were
caught by reading the `.webp` files directly, the same habit the Phase 3 gate recorded for the
KinoClue poster.

### Length is the open question, and it was measured rather than guessed

The first full draft rendered at 1,574 words, against 947 on the Marvel Snap page, the longest on
the site. Two failure entries and a preservation paragraph came out; it renders at 1,318 now, mean
sentence 15.7 words, zero em dashes, no sentence over 31 words. Still the longest page on the site,
and flagged on the PR as a call for Ali rather than trimmed to a number: the issue's own brief is
that the failures are the content, and the "What Went Wrong" list is two thirds of the length.

That section is a third `##` heading, which no other featured page has. Recorded here rather than
in `docs/decisions/content.md` because it is not settled — the PR offers folding it into "What I
Learned" as the alternative.

### The second round cut it by a third, on one sentence of direction

Ali's read of the first draft: "a bit more concise, especially What Went Wrong," and keep the
focus on learning agentic workflows from scratch against her work setup, where the agents and
skills are established and team-driven. The from-scratch framing was the thing the first draft had
not said out loud, and it is what the page is for. Each failure bullet went from four or five
sentences to two; the preservation paragraph became one sentence; the probe paragraph went. 1,318
rendered words became 960, mean sentence 16.8, longest 32 in source. The two TODOs and the empty
`role` are unchanged.

### Round three: the lens was wrong, not the length

Ali's second read: still too long, and "the wrong focus - if we're talking about things that went
wrong it should be focused on cases where I improved on the agentic workflow to avoid it in the
future. The lens shouldn't be on building and releasing a website (that is not my job), but on
learning agentic workflows. This applies to the whole page."

That reframes the whole draft, and it is worth recording why the first two rounds missed it. The
issue body's "strongest material" list is mostly engineering failures (the `ch` unit, the wrong CI,
the wrong font), and the log is written from the agent's side, so a page drafted from those sources
inherits their lens: a site being built. Ali's lens is a study being run. **The failures worth
listing are the ones that changed the workflow**, and by that test six of the eight bullets went:
the stale brief (which added the gate's verification step), the copy not sounding like her (which
produced the voice skill), rules skipped in a 3,774-line brief (the records split and the guards),
design argued across branches (the switcher, then its skill), the plan drifting from the brief (the
move to issues), and the hourly PR check-in (the steward skill). "What I Built" became one paragraph
on the content model and a labelled list of the agentic layer; the summary now says "learn
small-scale agentic workflows from scratch." 960 rendered words became 804.

**The general form: a page's source material carries its own lens, and the audit cannot see that.**
Every measurement passed on all three rounds. What was wrong was which failures counted, and only
the person whose page it is could say.

### Model allocation and cost

Fable, inline, no subagents. The source material was the log itself (5,000-odd lines) plus the content
record and the issue's comments, read directly because the specific wording of each failure is
what the page is made of — the Phase 2 rule about fan-out losing when you need the material itself,
applied to the document that states it. Four builds, four audits, one screenshot pass, three verify runs.

## #357 — a spelling leak, and the first measured feedback loop in the workflow (2026-09-09)

The #355 copy review found a published page saying "the colours". The reader-facing fix is one
word. **The interesting part is where it came from, and it is the clearest instance so far of an
agentic workflow feeding its own output back into itself.**

### The control was already in the repo

Ali's own primary sources — `snapshot/` and `content/archive/`, ~42,000 words of her writing across
2013–2019 — carry **zero** British spellings. The old site's stylesheet is literally `css/colors.css`.
So the variant did not come from her, and this is a rebuild-era artifact end to end.

That control existing at all is a Phase 0 dividend nobody planned. **The preservation work was done
to keep the old site honest, and it turned out to double as a baseline for what Ali's writing looks
like** — which is also what made the voice reference (2026-08-24) measurable rather than asserted.
Two separate passes now depend on `snapshot/` being a faithful copy rather than an improved one.

### Patient zero, and what it says about the mechanism

The clone this ran in was shallow (50 commits), which produced a confident wrong answer first: every
British form appeared to enter on 2026-09-03, in one commit. That was the shallow boundary, not a
finding. `git fetch --unshallow` gave the real history, 260 commits back to 2016.

The first instance is `totalling`, in `docs/REBUILD-LOG.md` — **this file** — in commit `3a16736`,
_"Add the agentic layer: CLAUDE.md, three skills, settings, and hooks"_. The document that spreads
the leak and the leak itself were added together.

### The curve

British spellings in `docs/`, `src/`, `scripts/`, `.claude/` and CLAUDE.md, per commit:

| Date       | Count | Commit                                      |
| ---------- | ----: | ------------------------------------------- |
| 2026-08-16 |     1 | the agentic layer                           |
| 2026-08-19 |    52 | Phase 5 — direction 03 (+34)                |
| 2026-08-21 |   116 | reticle idle behaviour (+28)                |
| 2026-08-29 |   242 | the design-switcher skill (+30)             |
| 2026-09-05 |   363 | the résumé paper look (+26)                 |
| 2026-09-07 |   413 | #338's guards, moved out of the brief (+39) |
| 2026-09-09 |   452 | today                                       |

Monotonic. The count fell exactly five times, always by one, always incidental to a deleted line.
**In 260 commits nobody ever corrected one deliberately** — there was no negative term in the loop
until the issue was opened.

Density is the better measure, since the docs were growing the whole time. Per 1,000 words of docs
prose it ramps **0.41 → 2.2 over the first week**, then sits flat at **~1.8** for the next six.
Seeded, amplified, saturated — the shape of a feedback loop reaching equilibrium, not a constant
author bias, which would have been flat at ~2 from day one. (Caveat: the earliest docs were shorter
and more list-shaped, so some of the initial ramp may be register rather than feedback.)

### The finding worth carrying forward: the leak is register-selective

Same model, same sessions, same repo. Rendered user-facing copy: **1 instance**. Docs, records,
skills, comments: **451**.

Writing _as Ali_ — first person, through `write-copy`, against a voice reference — the American
default held across 25 pages. Writing _as an engineer explaining a decision_, British forms appeared
at ~1.8 per 1,000 words, in a specific vocabulary: `behaviour`, `normalised`, `generalises`,
`centred`, `labelled`. **So "the model writes British English" is the wrong shape of explanation.**
Something register-shaped is doing the work, and the skill that pins a voice is evidently strong
enough to suppress it while the surrounding documents are not.

The practical read for this project: **the documents an agent reads before its first tool call are
not neutral context, they are style input.** That is not a spelling observation. Anything consistent
in CLAUDE.md, the records or the skills — sentence length, hedging, em dashes — is being taught the
same way, and the em-dash and sentence-length gaps the wording pass chased (2026-08-24) look
different in that light. Worth a measurement of its own; not made here.

### What was decided

The sweep stops at the reader: the one rendered word, two comments in shipped files, and the ~20 in
CLAUDE.md and `write-copy/`. **~430 left in place deliberately** — 80 of them are byte-hashed inputs
to `build-pdf.mjs`, so a comment edit would churn both résumé PDFs for nothing, and most of the rest
is this file and the decision records, which are records. Rule 12 in `check-links.mjs` makes the
narrow scope safe by catching the leak at the boundary that has a reader behind it. Reasoning in
[`docs/decisions/content.md`](decisions/content.md).

### The guard nearly shipped a much worse bug than the one it fixes

Two drafts of the wordlist matched the **American** spellings: `colou?rs?` matches "color",
`favou?rite` matches "favorite", `honou?red` matches "honored". A guard that fires on correct copy
fails the build on every page at once. Both were caught only because the site happens to use those
words — a broken entry for a word the site does not use yet would have shipped green.

So the list is now asserted against ~40 correct forms before it runs. **The lesson generalises past
this guard: a check whose failure mode is "rejects valid input" needs a negative test, because its
own green run is not evidence.** The existing guards are all shaped the other way — they assert a
property of real output — which is why none of them needed one before.

### Model allocation and cost

Opus, inline, no subagents. The work was one grep refined against its own false positives, then git
archaeology on a single history — sequential by nature, each step reading the last step's output, so
there was nothing to fan out. One `--unshallow` fetch, one `npm ci`, five builds, and a scripted
per-commit scan across 260 commits (the slowest part, ~4 minutes, and the thing that turned a
plausible story about training data into a measurement).

## #360 — the copy in HEAD nobody had looked at (2026-09-09)

**The finding was in the issue, not in this session**, which is worth recording because it is the
first time that has been true: the issue arrived with the three files, their sizes, their hashes and
their provenance already established. The session's work was the fix, the guard, and the
demonstration.

What made the finding possible was a question nobody had asked. The PO Box has been tracked since
#40, redacted out of the PDF in #197, and is the subject of #109's history rewrite. **Every one of
those looked at git history.** Three files in HEAD rendered the address as pixels, where no grep for
a string would ever find it and no examination of history would think to look.

### The number that would have been read wrong

Comparing the new 200-DPI render against the historical PNG at full resolution: **2.0% of pixels
differ**, spread over a bounding box covering most of the page. Read literally that is a different
document.

Downsampled to 425×550 first, the same comparison gives **0.23%**, and the diff image is the address
line plus a scatter of single-pixel marks in the bullet column. The 2.0% was two rasterisers
antialiasing the same glyphs differently — real, and meaningless.

**The more precise comparison was the more misleading one.** That is the same trap the résumé record
already carries about diffing two PDFs' content streams, arriving by a different route, and it is
now twice that a confident wrong answer came from the higher-resolution measurement. The general
form: when comparing two renders of the same thing, the question is whether the _content_ moved, and
the comparison has to be run at a resolution where rendering noise cannot answer it.

### What the guard cost, and what it is worth

`scripts/check-preserved-blobs.mjs` is 180 lines of which maybe 30 do anything: hash 437 tracked
files, compare against three constants. Most of it is the header explaining what it does not catch.

That ratio is right. The guard's value is not the hashing, which is trivial — it is that the next
session to reintroduce one of these blobs gets a build failure naming the file and its redacted
replacement, instead of a commit that nobody notices for three weeks. And the honest limits belong
next to the code, because the failure mode of a security-shaped guard is someone trusting it past
what it checks. Re-encode any of these images and it is blind.

**The demonstration was worth more than the check.** Pointing it at the three real pre-fix blobs —
two renamed, one moved into a subdirectory — is what proved it matches content rather than paths,
which is the entire claim. A guard nobody has watched fail is a guard nobody has tested; this repo
learned that in #357, where two drafts of a wordlist would have failed the build on correct copy.

### The reusable lesson

**A path is not a class.** The first fix for this named one path, in a `Set`, with a comment saying
the problem was solved. The next rebuild reintroduced the address one file over. Nothing about that
fix was wrong except its shape — and the document recording it repeated the shape, asserting "a
rebuild can no longer do that", which stayed on the page as a false statement for two weeks.

The tell is available in advance: **if a fix enumerates instances, ask what the instances have in
common and whether anything checks for that.** Here the common property was "renders the 2019
résumé", and nothing checked it until now.

### Model allocation and cost

Opus, inline, no subagents — and the honest note is that this was never a fan-out candidate. The
steps are a chain: record the hashes before anything changes, render the PNG, replace the snapshot
copy, measure the webps, redact them, then write a guard whose denylist is the hashes from step one.
Every step reads the previous step's output. One `npm ci`, one out-of-repo install of `pdfjs-dist`
and `@napi-rs/canvas`, and about a dozen `sharp` passes measuring and re-measuring three images.

The one thing that would have been worth delegating — sweeping the repo for other rasterised copies
of the résumé — was already done, in the issue.

## #45 / #109 — the pre-rewrite half, and an issue body that had gone stale (2026-09-09)

Straight after #362 merged. #109's checklist made the next step unambiguous — its item 2 — which is
worth noting on its own: **an ordered checklist in an issue removed the "what now?" question
entirely**, where the same information spread across three issue bodies would not have.

### Half the named work did not exist

#45 listed four things. `.DS_Store` was already untracked and already in `.gitignore`. `infra/` was
labelled a historical record and is a live one — two `docs/LAUNCH.md` commands run out of it.

Both claims were true when #45 was written on 2026-08-20. **The issue was accurate and stale, which
is not a contradiction**, and it is the same failure mode CLAUDE.md's "keep status out of this file"
rule guards against, arriving one level down in an issue rather than in the brief. There is no fix
that scales — you cannot re-verify every open issue continuously — so the working defense is the
cheap one: **check each claim against the tree before acting on it.** That cost about four commands
here and avoided a move that would have broken two runbook commands.

The one real item, the root `.htaccess`, took one `git rm` and a paragraph saying where to read it.

### The runbook, and what a machine is actually for

The rest of the pass was preparing #109 item 3 for Ali to run. The judgment in it is hers; what a
session is genuinely better at is the enumeration, so that is what went in: every blob reachable from
every ref — 1,868 — hashed and matched against the guard's denylist. Four matched, and the useful
detail is that `f485f41` is **one blob that lived at two paths**. A path-based rewrite would have had
to know both. That is #360's lesson showing up again one step later, which is a decent sign it was
the right lesson.

Also enumerated, because none of it was written down: the 8 branches and 3 tags still carrying the
blobs, and the consequence that `v1-legacy` stops being a byte-complete capture of the old site. That
last one is a real cost and it belongs in front of the person deciding, not discovered afterwards.

**A false alarm worth recording.** The first ref sweep reported `refs/heads/main` still carrying three
bad blobs, minutes after the merge that removed them. That was the _local_ `main`, stale from the
original clone; `origin/main` was clean. Caught by checking both SHAs instead of reporting the
finding. In a shallow, agent-run clone, `main` is very often not what `main` means — and the sweep
had listed a ref-name column without a SHA column, which is what made it possible to misread.

### Model allocation and cost

Opus, inline, no subagents. The unshallow was the only expensive step (262 commits), and the blob
sweep is 1,868 `git cat-file` calls, which is ~30 seconds and not something to delegate. Sequential
again: the enumeration cannot start until the clone is full, and the runbook cannot be written until
the enumeration is done.

## #109 — a question that improved the artifact more than the answer did (2026-09-10)

Ali read the runbook and asked whether contacting GitHub Support is a common thing to do. It is —
GitHub documents it as the final step of removing sensitive data — but checking rather than asserting
turned up three things the document was missing and one it got wrong.

**The wrong one was mine.** "A rewrite without this request is theatre" is too strong. What is true
is narrower: the blobs stay fetchable through `refs/pull/N/head`, which the owner cannot delete, so
they are retrievable by anyone holding the SHA. Not published, not gone. The same word is used
correctly one document over — purging history while `HEAD` ships the image really is theatre — which
is a small lesson about reusing a phrase that landed well the first time.

**The missing ones were in GitHub's docs all along**: the ticket wants an affected-PR count, the
first changed commit from `filter-repo`, and any orphaned LFS objects.

### Testing a document

The interesting part was writing it. A runbook is pasted under stress, months after it was written,
by someone who will not debug it — so the standard has to be the one the rest of this repo already
applies to guards: **run it before shipping it.**

Four commands were executed verbatim against the live repo. Two defects fell out that no amount of
re-reading would have caught:

- The hash-extraction step was written **after** the check that consumes its output file. Pasted in
  order, step (a) reads a file that does not exist yet and silently reports nothing wrong.
- The verification pipeline **exits non-zero on a completely normal run**, because the last blob it
  examines is usually not a match. An operator watching exit codes would read a clean result as a
  failure.

Both are the kind of thing that only appears when a human — or a shell — actually runs the thing.

**And the check was run in its failing direction deliberately.** Against the un-rewritten repo it
printed all four blob ids. That output is now quoted in the runbook, which is what converts a silent
run afterwards from "probably fine" into evidence. Same reasoning as #360's guard demonstration and
#357's negative test; three passes in a row have now landed on it, so it is starting to look like a
house rule rather than a habit.

### The list that was already stale

The 2026-09-09 runbook hardcoded eight stale branch names. Twenty-four hours later there were ten.
The document that had just recorded #45's "an issue can be accurate and stale at once" lesson
contained a fresh instance of it. It computes the list now.

### Model allocation and cost

Opus, inline. One web search to check GitHub's current process, since the answer feeds a step Ali
executes and the training cutoff is months back. The rest was running the runbook's own commands —
which is cheap, and was the whole value of the pass.

## #367 — the step that was really a decision (2026-09-11)

Two questions from Ali in sequence, each one cheap to ask and each one changing the shape of the
work more than the previous day's building had.

First: _"What would I get if I do this all except the part where I email GitHub support? Is there a
point in that at all?"_ Then, after the answer: _"So basically a consequence of going public is that
I'd lose all PR history?"_

**The second question caught an error in my answer to the first.** I had framed the purge as a cost
of going public. It is not. Going public costs nothing, the rewrite costs nothing, and the purge
costs the diff view on all 202 pull requests. Three separate things I had collapsed into one chain,
and it took someone reading it back to me to notice.

### The measurement that reframed it

Checking GitHub's docs rather than reasoning from memory turned up the sentence that settles it: the
purge removes the diff-view references from **any PR built on history after the sensitive-data
commit, even PRs that never touched the file.** Combined with a fact already measured for the
runbook — first changed commit `b541155`, 2020-09-01, predating every PR here — that is all 202.

And checking the repo rather than assuming turned up the other half: **private, 0 forks, 1 watcher.**
Which means today nobody without repo access can reach those refs at all, and the urgency I had been
writing into the runbook was imaginary. The deadline is the public flip, not a date.

### What was actually wrong with the runbook

Not the content — the shape. It was an unconditional procedure with one conditional step buried at
position 7, and the condition was an entirely different issue's outcome (#200). A reader following
it top to bottom would either run step 7 without knowing what it costs, or stall on the whole
document because one step was blocked.

Splitting it out made the runbook honest in a second way that was not the point but might be the
better outcome: **it now states what it does not do.** After a clean run the blobs are still
reachable through `refs/pull/N/head`. Without that sentence, finishing the document reads as
finishing the job.

### The generalizable bit

**A step with a precondition that lives outside the procedure is not a step.** It is a decision
wearing a step's clothes, and it belongs where decisions live — which in this repo is an issue, with
"decided not to, here is why" as a legitimate close.

The tell was available earlier than it was noticed: step 7 was the only item in the runbook whose
own text had to argue for itself. Everything else said what to type.

### Model allocation and cost

Opus, inline, two web searches — one per question, both because the answers fed a document Ali
executes and both about a third party's current behaviour rather than anything in the repo. No
subagents; the work was reading two doc pages and one API response.

## The rewrite rehearsal (2026-09-11)

_"Want to make sure it all looks ok before I start it since it's irreversible."_ One sentence from
Ali, and the right response to it was not to read the document more carefully. It was to run it.

### What the run found

A mirror in the scratch directory, the stale branches deleted, `filter-repo` for real, every
verification step against the result. The commands all worked; the 2026-09-10 pass had made sure of
that. What the pass had not done was look at the tree that came out, and the tree that came out
still had a résumé in it — an older one, with a street address and phone number where the PO Box
had been. Six blobs from 2016, at the same two paths the four known ones had lived at, never on the
denylist because nothing from 2016 had ever leaked into `HEAD`.

The mechanism is worth one sentence because it is counterintuitive: stripping a blob from a commit
does not delete the path, it reverts the path to the parent's version. So the runbook as written
would have made `v1-legacy` worse, and its own section 3 said the opposite.

Then four commands that would have failed at the keyboard — the mirror push fighting GitHub's
pull-request refs, a deploy of a tree no commit ever had, a fetch that would have left the tags
stale, and a "first changed commit" that read the wrong line of the map. The decision record has
them; the runbook has the fixes.

### The generalizable bit

**Reviewing a runbook means running it on a copy.** Not reading it, not running its commands against
the live repo and recording the output — the previous pass did both, carefully, and shipped a
document that would have promoted a worse exposure into the tag it was cleaning. The commands were
right. The procedure was wrong. Only the output tells you which.

### Model allocation and cost

Opus, inline, no subagents, no web. The rehearsal itself is a few seconds of `filter-repo` on a
267-commit repo; the expensive part was reading three 2016 renders to confirm what they showed,
which is one image each and cannot be delegated to a grep. The session's own clone was shallow, and
un-shallowing it plus fetching every tag was the first thing that had to happen — a reminder that a
web session starts without the history a history rewrite is about.

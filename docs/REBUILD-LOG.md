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
because Phase 3 deleted `resources/images/` at `ce4533e` after migrating the keep-list into
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
the `ce4533e` fact that reframed the whole task. Everything after it was sequential work on known
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

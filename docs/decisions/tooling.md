# Decision record — tooling

Why the build, the deploy, the guards and the agentic layer work the way they do. **Everything
here is settled: do not relitigate it.** [`CLAUDE.md`](../../CLAUDE.md) is the standing brief and
carries the runbook and the deploy rules; this file carries the reasoning.

Sections are in the order they were decided. Append a new pass at the end.

---

## Phase 6 gate outcome (2026-08-23)

Two questions, settled together. The second is the reason the "Phases" table above no longer counts
past 5.

### The DNS cutover is its own moment, not the end of a phase

Closes [#21](https://github.com/ali-wallick/Portfolio/issues/21). **Ali's call.** The domain cutover
is a separate, short, deliberate session — favicon, OG, a11y, redirects, the wording pass, and
everything else that used to be "Phase 6" land as they finish, and the cutover happens afterward,
with mail verified on both `ali@` and `contact@aliwallick.com` before and after, per the plan's
standing instruction on [#34](https://github.com/ali-wallick/Portfolio/issues/34).

The reasoning that won: Ali intends to slow down and keep improving the site before actually
launching it. A phase that doesn't close until the domain moves is a phase that never closes under
that plan — better to let the launch basics merge as they finish and treat the cutover as its own
event whenever she's ready for it. [#55](https://github.com/ali-wallick/Portfolio/issues/55)
(re-baseline `verify-dns.sh`) and [#34](https://github.com/ali-wallick/Portfolio/issues/34) can run
whenever Ali decides to launch, independent of whether everything else still open is closed first.

### "Phase 6" and "Phase 7" are retired as names for current work

Ali's motivation, plainly: numbered phases stopped being legible once the build (0–5) was done —
there was no way to tell from "Phase 6" or "Phase 7" what was actually in them without reading this
file. Combined with #21 splitting the cutover out on its own, the natural replacement is a name for
each stage relative to the one event that matters — **pre-launch, launch, post-launch**:

- **Pre-launch** — everything that must be true before the domain moves. What "Phase 6" tracked,
  minus the cutover itself. GitHub milestone `Pre-launch` (was `Phase 6 — Launch`).
- **Launch** — the cutover session itself: #34, #55, and [#74](https://github.com/ali-wallick/Portfolio/issues/74)
  (flip `live` to `true` in the same PR as the cutover). New GitHub milestone `Launch`.
- **Post-launch** — everything after. What "Phase 7" tracked. GitHub milestone `Post-launch` (was
  `Phase 7 — Keep it alive`).

**Stage is tracked by milestone alone, not a matching label.** Phase 6 originally paired each
milestone with an identically-named label (`pre-launch`, `launch`, `post-launch`), but by
2026-08-23 every issue's label was a 1:1 echo of its milestone — pure duplication, and it had
already drifted out of sync on two issues. The three labels were deleted; `decision` and
`needs-ali` stay, since those cut across milestones rather than mirroring one. `launch-blocker`
also stays — coincidentally 1:1 with the Launch milestone today, but conceptually distinct (a
pre-launch issue could someday be a genuine blocker too), so it isn't redundant the way the stage
labels were.

**Phases 0–5 keep their numbers.** They're a closed historical record — each has a dated gate
outcome and an execution outcome below, and renaming them buys nothing while breaking every
cross-reference to "Phase 3", "Phase 4", "Phase 5" in CLAUDE.md and in old issues. Only the _current_
and _future_ work gets the new vocabulary. Historical prose that describes what happened during the
old "Phase 6" or "Phase 7" window (the motion-values tuning, the faces switcher, REBUILD-LOG.md's
own phase entries) is untouched — it's describing the past, not naming ongoing work.

## Preserving the old site (2026-08-26)

The old DreamHost site is preserved well enough that `snapshot/` can eventually be tagged and
deleted (#45) with nothing lost. **`docs/PRESERVATION.md` is the index** — where each artifact
lives, how to view it, what could not be preserved. Read that rather than re-deriving any of it.
What belongs here is only the decisions.

**`snapshot/` did not render, and that was a defect rather than a property.** `snapshot/README.md`
says its assets "are already committed under `resources/`" — true when Phase 0 wrote it, false since
`ce4533e` deleted `resources/images/`. **50 of 54 asset references were dead**, so the snapshot
preserved what the old site _said_ and not what it _looked like_. `scripts/restore-snapshot.mjs`
repairs that into **`snapshot/rendered/`**.

**The 26 original files are still byte-faithful and still guarded.** The reconstruction is a
separate, clearly-derived subtree. `guard-preserved.sh` has one narrow exception for
`snapshot/rendered/` — derived output, where hand-editing is pointless rather than destructive since
the next run overwrites it. **Change the script, not its output.** It lives _under_ `snapshot/` on
purpose: the whole archive is then one `git rm -r` when #45 comes around.

**The output is committed, not regenerated on demand.** Same reasoning as the resume PDFs, with a
sharper edge — the point of the archive is that `snapshot/` can be deleted, at which moment a
regenerating script has no inputs left. One step also genuinely cannot be repeated: the blog's 14
images live only on the old host, and were fetched while it was still up.

**Self-containment is the property to protect, and it is asserted rather than assumed.**
`--check-selfcontained` fails the archive if any page requests anything from another host. The
original decayed precisely because it depended on other people's servers — html5shiv went down with
Google Code in 2015 and nobody noticed for a decade. **This check earned itself on first run**,
finding 26 requests still going out in three classes the patterns had missed, including the blog
images that were about to become unrecoverable.

**Three of the nine embedded videos are gone from YouTube** — deleted or private, all 403. Those
pages say so explicitly now. No copy exists anywhere; those bytes were never Ali's to keep. Don't
try to "fix" those placeholders.

**Two things a future session would otherwise get wrong:**

- **Faithful is not always the right default.** The first run restored the _unredacted_ resume PDF
  into the archive, manufacturing a second copy of the exposure #197 and #200 exist to reduce — and
  it was committed before anyone noticed. `PREFER_WORKTREE` in the restore script now supersedes
  that one file. When preservation and privacy conflict, the conflict is the thing to notice.
- **The verification worth copying is measurement, not inspection.** Everything asserted about this
  archive was checked against the live server while it still answered: 54/54 assets and 14/14 blog
  images byte-identical by sha256. That closes Phase 0's own lesson — _"verify it resolves" is not
  the same as "preserved"_ — by measurement, and it doubles as the spot-check
  [#51](https://github.com/ali-wallick/Portfolio/issues/51) wants before retiring WordPress.

**Not done, and it turned out not to be needed: fresh Wayback captures of the site's final form.**
Ali's call 2026-08-27, and the reason is stronger than the one first given. **archive.org already
holds the final form** — the homepage was captured 2025-11-10, About 2025-08-30, and the Vegas Blvd
page that was added in 2020 on 2025-09-17, all verified to contain the final Second Dinner content.

**A correction worth keeping, because the mistake is easy to repeat.** This section first said the
newest real capture was 2019-07-19 and that the final form was unarchived. That came from a CDX
query using `collapse=urlkey`, which returns the **first** capture per URL, not the latest —
first-seen dates read as last-seen dates. Anything asking "when was this last archived?" must not
collapse, or must sort explicitly.

The timing constraint is still real if it ever comes up for another reason: Save Page Now fetches
the URL live, so after the cutover it captures the new site, and after DreamHost is retired there is
nothing behind it. It just is not protecting anything that is missing.

**If the archive is ever published** — a separate decision, currently not taken — three things need
handling first, and they are in `docs/PRESERVATION.md`: don't serve `wp-login.html`, neuter
`contact.html`'s form, and re-check the expired outbound domains, which is the exact bug
`links[].dead: true` exists to prevent on the new site.

### Project pages are held to a lower best-practices bar, and the reason is one audit (2026-08-27)

Settled with [#103](https://github.com/ali-wallick/Portfolio/issues/103), which added
`/projects/marvel-snap`, `/projects/prodigal`, `/resume/full` and `/404` to `lighthouserc.json` —
before it, the most complex template on the site was the one Lighthouse never measured.

**Project detail pages assert `categories:best-practices` at 0.90; everything else stays at 0.95.**
Split with `assertMatrix`, so the looser bar reaches project pages and nothing else. Measured, the
whole gap is a single audit: `inspector-issues`, reporting a cookie set by `youtube-nocookie.com`
inside the hero embed. Third party, inside an iframe, not ours to fix. Every other page and every
other category — accessibility still at a flat 1.0, which the newly-gated pages meet — holds the
original bar.

**Carving out the audit instead does not work, and that is the part worth remembering.**
`categories:best-practices` asserts the score _Lighthouse computes_, so switching an audit
assertion off leaves the category score exactly where it was. When a third-party cost has to be
absorbed, the threshold is the only lever; an audit-level `off` is not.

**`errors-in-console` used to fail on every page, gated ones included, and it was never about the
site.** The Cloudflare Insights beacon's CORS preflight can never match lhci's random localhost
port — `cloudflareinsights.com` always echoes back a portless `http://localhost` on
`Access-Control-Allow-Origin`, confirmed by probing the endpoint directly with several origins —
so it cost a flat 0.04 on every page against the 0.95 bar, and the audit was guarding nothing: it
was already failing, so a real console error wouldn't have moved the score. **Fixed
([#221](https://github.com/ali-wallick/Portfolio/issues/221)), not by loosening the threshold or
skipping the audit** — `scripts/strip-lighthouse-beacon.mjs` strips the beacon `<script>` tag from
the CI job's own downloaded copy of `dist/` before lhci runs, so the audit measures the site again
instead of a third party. The `build` job's uploaded artifact, and everything Cloudflare actually
deploys, still carry the beacon — only the disposable copy Lighthouse reads is touched.

### `public/_headers` carries the safe set, and two headers are deliberately not in it (2026-08-27)

Settled with [#105](https://github.com/ali-wallick/Portfolio/issues/105), which was a gap rather
than a position — nothing had ever decided either way. `nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin` and `X-Frame-Options: DENY` ship; **`CSP` and
`HSTS` do not, and the file says why so the absence reads as a choice.** CSP needs
`Report-Only` against real traffic before it is enforced, because the site loads a YouTube iframe
and the Insights beacon and a guessed policy breaks them silently. HSTS is also a zone-level
Cloudflare setting, and it belongs in exactly one of the two places — Ali's call which.

### The homepage's JSON-LD is derived, and that is the whole design (2026-08-27)

[#106](https://github.com/ali-wallick/Portfolio/issues/106). `src/lib/structured-data.ts` builds a
schema.org `Person` from `site.ts`, the `active` socials, and the current job's own
`roles`/`company` — the same sources `/resume` and the About timeline read. **A literal JSON-LD
block would be a second place every fact on it could go stale**, which is the failure the content
model exists to rule out. The Marvel Snap credit URL is read off that project's `press` link rather
than retyped, the same way `scripts/build-linkedin.mjs` reads it.

**The Second Dinner ceiling applies to structured data exactly as it does to prose.** `worksFor`
names the studio and stops; a machine-readable claim is not a lesser one.

### A green PR waiting on Ali is not work (2026-09-02)

Claude Code on the web subscribes a session to a PR's activity **and** re-arms a self check-in
roughly hourly until the PR is merged or closed. On a `design-switcher` branch — parked on Ali's
eye by design, sometimes for days — that second half runs forever and learns nothing. The check-in
that prompted this said so in its own prompt: _"ninth consecutive quiet check since the rebase."_
Nine full-context wakes, each re-sending the whole conversation, to confirm nothing had moved. That
is CLAUDE.md's own "Context length dominates cost" note, paid once an hour.

**Ali's call: a session stands down once CI is green, there is no merge conflict, and nothing is
left for an agent to do.** It says so once — to Ali, not as a PR comment — stops re-arming, and
ends. It does **not** unsubscribe: a push, a review, or CI going red still wakes it through the
subscription, which costs nothing while nothing happens. **The subscription is the cheap half and
the check-in loop is the redundant one**, so the loop is what goes.

**A red or conflicted PR is untouched by this** and is still work now, at every event. Standing
down is a statement about polling, not about the drive-to-green posture, and every "never" in the
harness's rules still stands.

**The lever is `.claude/skills/steward/SKILL.md`, and it is the only one there is.** The harness
reads that path from the PR's head branch before acting on a CI or review event, and defers to it
on _how proactive to be_. Nothing else in a checkout can reach this behaviour — the same shape as
the `release` branch and `workers_dev` under "Deployed state drifts from the repo" below: the thing
determining behaviour lives somewhere a checkout cannot show you.

**Two consequences worth knowing.** The file governs only a PR whose **head branch carries it**, so
a branch cut before this merged keeps the old behaviour until it picks up `main`. And a check-in
already scheduled is a Routine on Ali's account, not a repo fact — an in-flight one is stopped by
deleting the Routine, which is what closed out the two live loops on the day this landed.

## The architecture read (2026-09-06, closes #108)

`src/` and `scripts/` were read as a whole once, which #108 defined as done. Three survey agents
read, the planning session re-grepped every claim that would drive a deletion, eleven fixes shipped
on one PR, and the two questions that were decisions rather than cleanups became
[#327](https://github.com/ali-wallick/Portfolio/issues/327) and
[#328](https://github.com/ali-wallick/Portfolio/issues/328). What belongs here is what a future
session would otherwise re-derive.

**The test for a refactor on this site is a diff of the built output, not a reading of the diff.**
Build the unmodified tree into a scratch copy, make the change, build again, and compare all 23
pages with stylesheet hashes normalised, the built CSS, and the OG cards. Every fix on #108 was
held to byte-identical output by that check, and `check:resume-print` covers the one surface HTML
cannot. It is the same check #273 established for a fallback-chain change; it is the general one.

**The print block is an allowlist, and CLAUDE.md's older prose calling it a denylist is
historical.** Since #62 every `:root` in `tokens.css` sits inside `@media screen`, so on paper an
unpinned token is undefined and its declaration drops to the initial value; nothing leaks. Only three
of the 56 pins do any work (`--font-body`, `--leading-tight`, `--measure`). The hazard the block was
built for has moved: it is now a rule in `base.css` outside `@media screen` reaching paper. The
"denylist" passages under Phase 4 ([`resume.md`](resume.md)) and Phase 5 ([`design.md`](design.md))
describe the pre-#62 cascade and are left as the
record of why the block exists; `tokens.css`'s header carries the corrected rule. What to do with
the 53 inert pins was #327 — settled below.

## The rules cross the `src/` ↔ `scripts/` boundary; the fetching does not (2026-09-06, closes #328)

The five pieces of content logic #108 found written twice are one file:
**`src/lib/content-rules.ts`** — `selectJobs`, `selectEducation`, `currentTitle`, `bulletBlocks`,
`thumbSource`. `src/lib/content.ts` and `ResumeDocument.astro` import it by alias; the `.mjs`
scripts import it **relative and with the extension** (`'../src/lib/content-rules.ts'`), because
`~/*` is a TS/Vite alias plain `node` cannot resolve.

**The seam is rules vs. fetching, and that is the whole design.** `content.ts` stays the query
layer (`getCollection`, `astro:content`); a script stays a raw-YAML reader
(`scripts/lib/frontmatter.mjs`). What both need is the _ordering, grouping and fallback_, and that
is what moved. `getJobs`, `getEducation`, `currentTitle` and `projectThumb` keep their names and
signatures and are thin delegates, so nothing that imported them changed — and there are **no
re-exports**, since a symbol reachable by two import paths is the next session's coin flip.

**The issue's own stated blocker was out of date, and that is what unlocked collapsing rather than
merely checking.** #328 costed a `.ts` under `src/lib/` at "a Node bump or a flag on every npm
script". Unflagged type stripping landed in **Node 22.18.0**, so it costs a floor in `engines.node`
and nothing else. A check that two copies agree is a hedge against having two copies.

**Two rules keep it loadable, and both are enforced rather than remembered.** The module **imports
nothing at runtime** — not even `import type` from `astro:content`, because that guarantee would
rest on one keyword nothing in `npm run verify` fails fast on; its twelve structural interfaces are
hand-written instead, and `astro check` still type-checks the real `CollectionEntry` at each
`content.ts` call site. And it is **erasable-syntax-only** — no `enum`, `namespace`, parameter
properties or `import x = require()` — which `erasableSyntaxOnly: true` in `tsconfig.json` turns
into a compiler error on the `npm run check` every PR already runs. **No new sync check and no test
framework**: a runtime import or a sub-22.18 Node throws inside `npm run build` and inside
Cloudflare's `build:ci`, and a fixture of the jobs collection would be a fourth copy of résumé
facts, which is the failure this content model exists to prevent.

**`npm run check:linkedin` is load-bearing for more than `docs/LINKEDIN.md`'s freshness now.** It
is the one thing in `verify` that exercises the cross-boundary import under plain `node`.

**`scripts/build-pdf.mjs`'s `byteHashedFiles()` gained the module.** Four things visible on the
printed page moved out of two hashed files into one the list didn't know about. That is the #32 miss
exactly, and it is the step a refactor forgets: **logic moving between files moves out of that list
silently.**

### Three divergences the copies had, all fixed rather than pinned to today's output

Ali's call: fix them here. None was previously known.

- **`onResume` on jobs.** `content.ts` filtered truthy; the script filtered `!== false`. Equivalent
  only because Zod's `.default(true)` runs in Astro and not in `readEntries`. The shared helper
  types the field optional and uses `!== false`, correct on both. No output change.
- **`onResume` on education.** `getEducation()` applied no filter at all, so `/resume` was quietly
  ignoring a field the schema declares — the dead-data shape the guard table rules out. It honours
  it now. `georgia-tech.md` is the only entry and doesn't set it, so **the build diff cannot be the
  evidence for this one; this line is.**
- **OG cards and `thumbWide`.** The OG script only ever read `data.thumb`, so **six share cards
  changed on purpose**: firefall, i-fits-i-sits, kaneva, marvel-snap, secret-garden,
  vegas-blvd-slots. Four of those were **logo art cover-cropped to a 1.9:1 band** while the same
  front matter already named a 16:9 capture for exactly that shape. A card is 1200×630, so the OG
  script asks for `'wide'` and says so out loud — `thumbSource` takes **no `aspect` default**.

**Two behavioural notes worth keeping.** `renderEducationSection` read `entry.data.honors.length`
with no `??`, so an entry omitting a `.default([])` field would have crashed `check:linkedin` —
same class as the first divergence, fixed while here. And the OG script's
`if (data.hero?.type === 'art') return undefined` early return is gone: it was behaviourally dead,
since an `art` hero matches neither remaining test and both functions already returned `undefined`.

**Declined, with the measurement: the CLI-flag parsing does not get folded in, and does not become
its own issue.** The "five ways" is mostly one idiom counted several times — `argv.includes('--flag')`
in five scripts is one idiom used six times, `argv[2] ?? 'dist'` is a positional operand rather than
flag parsing, and converting the two `new Set(argv.slice(2))` sites is _behaviour-changing_
(`parseArgs` is strict and throws on an unknown argument where the Set form ignores it). Exactly one
site genuinely wins. **None of it is shared state, so none of it can drift**, which is the entire
subject of #328 — and `scripts/lib/`'s own rule already settles it: a helper _two scripts need_ goes
there. One script's parser is not shared logic.

## The agentic layer, read as a whole (2026-09-07, closes #107)

Ten skills, two hooks, `settings.json` and `launch.json`, read against the codebase once, under the
lens Ali set for it: **the site is live and being maintained, so each file is judged by what a
cold session six months from now needs from it to do a routine job**, not by whether it is still
accurate. Run the way #108 was: three Sonnet surveys in parallel, every deletion- or rename-driving
claim re-grepped here before it entered a brief, two Sonnet executors on disjoint files, one PR.
What belongs here is what changed and the four things a future session would otherwise re-derive.

**Two prose rules became guards, and that is the pass's real output.** `draft` is required on a
project, not defaulted to `false`: the default never fired during the build, when every entry was
seeded `draft: true` by hand, and in maintenance the failure it allows is a new file with no
`draft:` line publishing silently the moment its metadata happens to be complete. And the per-job
bullet floor settled on 2026-08-23 (one in `highlights`, two across both densities) is a
`superRefine` on `jobs` now — until this pass it was a sentence in `update-resume`, so the trim the
recency rule asks for could empty an old job with no build error. Both were proven by injecting the
mistake: a project with no `draft` and a job cut to one bullet each fail `astro sync` with the
message that names the rule. **The rest of survey 3's table — every imperative in the ten skills
against the guard that enforces it — was judged, not built.** Title-cased labels, kebab-case
filenames and the stale-content grep were all cheap to guard and were left as prose, because each
would either need a heuristic with false positives on today's content or protects against a
mistake nobody has made.

**The hook covers the whole Don't-touch list now, and one path needed an exemption the doc had
already made.** `infra/README.md` is formatted with everything else per `.prettierignore` and is
the DNS tooling's own notes, so blocking `infra/` wholesale would have contradicted a decision
recorded three lines from the one that said to block it. It is exempt, the way `snapshot/rendered/`
is. **The Homebrew `PATH` line in both hooks is not stale** — a survey called it so, and it is
there because Ali runs Claude Code on a Mac where the hooks fire locally.

**A correction recorded in CLAUDE.md had leaked into two skills, in the wrong direction.**
`write-copy` and `update-resume` both still said the Second Dinner ceiling meant "no platform",
which #32 corrected on 2026-08-26 (mobile is sayable, on Ali's own statement) and which the résumé
itself has said since. Same class of miss as `ABOUT` under "The resume formality pass": a
correction to CLAUDE.md does not propagate to a skill, and no generator catches it. **When a
ceiling or a convention changes here, grep the skills for the old wording in the same commit.**

**`pre-launch-check` is `pre-merge-check`**, and the rename is the point rather than the edits
inside it: its description was the trigger text, and "launch readiness" and "before a DNS cutover"
are phrases nobody will type again. It keeps the pre-merge sweep and three after-release checks
(`links:external`, the `www` 301, the served `robots.txt`); the cutover it also carried is
`docs/LAUNCH.md`'s record. Its stale `TODO(phase-3-revisit)` grep became the live convention,
recorded under "What this is" above.

**`settings.json` allows every npm script a routine job runs, with one deliberate omission.**
`update:resume-print` rewrites the print-geometry baseline and is the one command that can weaken
a guard silently, so it keeps prompting. `dig *` came off (intercepted on Ali's machine, per
`infra/README.md`) and so did `npx astro build` (nothing invokes it).

**Non-findings, so nobody re-derives them.** Ten skills are not "too many to load": only the
descriptions load at session start, about a thousand tokens for all ten, and the bodies load on
invocation. The real question was routing, and it resolved to one word — `content-pass` no longer
claims "wording pass", so that phrase routes to `write-copy` while the two still name each other.
`steward` and `release` stay beside the content skills because `.claude/skills/` is the only path
the harness reads. `launch.json` is eleven lines that make `/run` work and was simply never
listed. `add-project`'s own template was handing out a `youtube` hero with no `poster`, a field
the schema has required since #273; it failed the build on the first `SHOW_DRAFTS=true` run, which
is the guard doing its job and the skill not keeping up. `content-pass` enumerated
`byteHashedFiles()`'s inputs and had already drifted from the list by one file (#328); it points
at the function now, so it cannot drift again.

**Out of scope, filed:** CLAUDE.md's own size is #335, a `decision`, with a proposed cut line.

## The link check runs itself, and notices without gating (2026-09-07, closes #275)

`npm run links:external` was run by hand and nothing ran it on a cadence, so the first notice of a
dead hero video was whenever somebody thought to check — which on a portfolio nobody is actively
working could be months. `.github/workflows/link-check.yml` runs it monthly now (Ali's call on
cadence) and hands the report to `scripts/report-link-rot.mjs`, which opens an issue.

**This does not reverse the rule that keeps the check out of `verify`.** That rule — a deploy
failing over somebody else's downtime is worse than the rot it catches — **is an argument against
gating, not against noticing.** A job that opens an issue instead of failing a build changes nothing
about whether a deploy succeeds; it is the missing half of the same reasoning. Nothing the workflow
does can reach a deploy.

**Only the dead bucket may file.** The check already buckets three ways because LinkedIn answers
HTTP 999 to anything that is not a browser and a datacenter IP collects 403s from several more
hosts; a job filing on those would be ignored by its third run, which is worse than not having one.
Unverifiable reaches an issue as a count, inside an issue a dead link already justified. This
session's own run is the demonstration: **29 outbound links, 28 unverifiable, 0 dead**, because the
Claude Code egress proxy 403s essentially everything. A two-bucket version would have filed 28 false
alarms on its first run.

**One issue at a time, and the anti-noise mechanism runs the other way too.** The body carries a
fingerprint of the sorted dead URLs in an HTML comment. A rerun finding the same set rewrites the
body quietly — an edit does not notify — and only a _changed_ set comments. A monthly "still dead"
note on an issue Ali has not got to yet is the same crying-wolf wearing different clothes.

**Closing on a clean run is safe structurally, not hopefully.** The obvious objection is that a
clean run might mean the far end came back rather than that anyone fixed anything. It cannot: every
remediation this site offers **removes the URL from the built HTML.** `dead: true` renders a link as
plain text with no `href` (`LinkList.astro`), and a dead video hero renders its `poster` instead of
the iframe (`Media.astro`). **If that ever stops being true, the job has to stop closing** — the
script's header says so where someone changing it will be.

**The report is data because the alternative was parsing prose.** `--report <path>` emits the three
buckets as JSON; stdout and the exit code are byte-identical with and without it, because the
hand-run tool is still the primary use. Parsing the pretty output would turn prose written to be
read by a person into a contract nobody declared — the drift the content model's guard table exists
to rule out, one directory over.

### Two facts about `schedule`, both in the workflow's own header

**It only fires from the default branch**, and `workflow_dispatch` will not run off one either — so
there is no way to exercise this on a feature branch. Hence the reporter's `--dry-run` and its
dry-run-only `--simulate-open <fingerprint|none>`: all four transitions were proven locally against
synthetic reports, and the build-and-report half was run for real.

**GitHub disables a scheduled workflow after 60 days with no commit activity in the repository.**
That is exactly the quiet-portfolio case this job exists for, so a guard against neglect is itself
switched off by neglect. GitHub emails Ali when it happens, so the failure is loud rather than
silent, and `workflow_dispatch` is the manual fallback — but it is worth knowing before trusting the
cadence.

## Guards are how the brief shrinks, and the list should not reach zero (2026-09-07, closes #338)

#335 made the cut line between `CLAUDE.md` and these records mechanical: **is the rule enforced by a
build guard?** If it is, the guard is the reminder and the reasoning lives here at no per-session
cost. If it is not, the rule stays in the brief, where every session pays for it.

#338 is the other half of that. **Every guard built lets its rule leave the brief**, which turns
"add a check" from tidiness into the only lever that shrinks the one document every session reads in
full. Six rules shipped: three source-tree (`scripts/check-source.mjs`), two output
(`check-links.mjs` rules 6 and 7), one baseline diff (`check-line-length.mjs`). The brief lost two
of its five no-guard entries, the "Use the variables" standing rule and the title-case convention,
and its 701×960 entry shrank to a pointer.

### The counter-pressure is the load-bearing part

#107 declined four candidates because **a guard with false positives on today's content is worse
than the prose it replaces**, and that rule decided the shape of every rule here. Three were
narrowed by measurement rather than by taste:

| Candidate   | Naive form                   | What measuring found                                        | Shipped as                     |
| ----------- | ---------------------------- | ----------------------------------------------------------- | ------------------------------ |
| Welded word | any text abutting an element | 2 hits, 0 bugs — a flex `gap` supplies the space            | open side, inside `<p>`/`<li>` |
| Title case  | all headings                 | colon subtitles, `aliwallick.com`, `Critter³` all correct   | `<h2>` only                    |
| Line length | an 80-character ceiling      | red on merge; 80 is AAA, not the AA baseline the site meets | a ratchet against a baseline   |

**In each case the naive version was not slightly wrong, it was measuring the wrong population.**
That is the generalisable finding: before building a guard, run its naive form over the real tree
and read every hit. Two of these three would have shipped as false-positive machines otherwise, and
the third would have failed on its first CI run.

### Where a new check goes

`check-source.mjs` reads `src/` and runs **before** the build, so it fails in seconds rather than
after a full render — the right home for anything invisible in `dist/` (a raw colour renders as a
colour; a `TODO(` marker never ships at all). `check-links.mjs` owns anything that is a property of
the render. `check-line-length.mjs` is separate because it needs a browser, like
`check-resume-print.mjs`, and pairs `launch-chromium.mjs` with `serve-dist.mjs` the same way.

Check-only logic stays in `scripts/`. `src/lib/content-rules.ts` is for logic `src/` and `scripts/`
must **share**, under hard no-runtime-import and erasable-syntax constraints; a check with no `src/`
consumer does not belong there.

`update:line-length` is deliberately **not** in the settings allow-list, for the same reason
`update:resume-print` is not: it rewrites a guard's own baseline and should prompt.

### The list should not reach zero

Three entries stay under "Rules with no guard behind them", and #338 measured each and declined:
the frame-is-a-constant rule and the `--ease`-on-a-clamped-property rule are judgment about how to
express a change rather than properties of any output, and the observed-regularity rule is about how
to reason. **A guard for any of them would need a heuristic that fires on correct code**, which is
the thing #107 established is worse than the sentence.

The résumé's 701×960 came off the list for a different reason worth separating: it needed no guard
because the constant was already centralised in `scripts/lib/print-geometry.mjs`, which both
consumers import. **The brief was restating an arithmetic that a module already owned** — so the
entry shrank to a pointer, which is a brief-line win with no code written. Worth checking for before
building anything: the rule may already have a home.

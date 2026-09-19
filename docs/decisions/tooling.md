# Decision record — tooling

Why the build, the deploy, the guards and the agentic layer work the way they do. **Everything
here is settled: do not relitigate it.** [`CLAUDE.md`](../../CLAUDE.md) is the standing brief and
carries the runbook and the deploy rules; this file carries the reasoning.

Sections are in the order they were decided. Append a new pass at the end.

**`grep '^## ' docs/decisions/tooling.md` is the index.** A heading here states the decision it
settled rather than its topic, so scanning the headings beats scrolling the file.

---

## Phase 6 gate outcome (2026-08-23)

Two questions, settled together. The second is the reason [`CLAUDE.md`](../../CLAUDE.md)'s "Phases"
table no longer counts past 5.

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
the Phase 3 cleanup commit deleted `resources/images/`. **50 of 54 asset references were dead**, so the snapshot
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
the `release` branch and `workers_dev` under "Deployed state drifts from the repo" in
[`CLAUDE.md`](../../CLAUDE.md): the thing determining behaviour lives somewhere a checkout cannot
show you.

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

**Shared script logic lives in `scripts/lib/`, and the list is the rule.** Chromium launch,
serving `dist/`, front matter, the directory walker, the 701×960 print geometry, and the
print-page setup whose ordering is the #306 fix are all there now. A helper two scripts need goes
there; a second hand-written copy is how the #306 ordering would regress unnoticed.

**Five pieces of content logic were written twice across the `src/`/`scripts/` boundary. They are
one module now** — see "The rules cross the `src/` ↔ `scripts/` boundary" below.

**Non-findings, so they are not re-derived.** Component boundaries are sound and no component has a
dead prop; the single-consumer components each carry a written reason. `variant` branching no longer
exists. `base.css` has no verbatim duplicate blocks (its four split selectors are documented,
differently scoped pairs), no raw `px` font sizes, and one raw colour, the lightbox scrim, which is
now commented. No component carries a scoped `<style>` block. `reticle.ts` matches its own header;
its `home` and `linger` branches are unreachable under `MODE='fade'` and are kept on purpose as the
switcher's other candidates. The trailing narrow-viewport block at the end of `base.css` is
deliberately one place to look for phone overrides, not scattered per component.

**A survey's "referenced by nothing" must include CLAUDE.md in the grep.** One agent reported
`scripts/fetch-posters.mjs` as orphaned; CLAUDE.md names it. Re-grep every deletion-driving claim
from a survey before acting on it.

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
recorded under "What this is" in [`CLAUDE.md`](../../CLAUDE.md).

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

## The split's scars, and the log/record seam measured (2026-09-07, closes #340)

[#337](https://github.com/ali-wallick/Portfolio/pull/337) moved 3,100 lines verbatim so that a
token count could prove nothing was lost. That check is what made the move safe, and it is also
what left the residue this pass cleaned up: text that read correctly inside one document and reads
oddly split across five. **Held to the same check — a token multiset against the pre-thinning tree
— which came back 96 words removed and 88 added, every one of them enumerated.**

**A pointer that survived the move can still be wrong, and `check-links.mjs` cannot see it.** The
guard checks links in `dist/`; these are prose pointers in Markdown that never ships. Six were
broken by position rather than by target: `"the Phases table above"`, `"Deployed state drifts from
the repo below"` and `"What this is above"` all named `CLAUDE.md` headings; `"the Phase 4 note
below"` named `resume.md` from inside `design.md`; and `design.md`'s `"This file and the plan both
described"` was `CLAUDE.md` confessing an error, which now reads as `design.md` confessing one it
never made. **The failure mode is that every one of them is a true sentence in the wrong document**,
so nothing but reading finds them.

**Four paragraphs were filed by position instead of by subject.** #108's architecture-read findings
sat physically after #327's section in the pre-split file, so they went to `resume.md` while their
`"see the section below"` target (#328) went to `tooling.md`. They are back under
"The architecture read" here. **When a move is mechanical, the misfilings are wherever two topics
were adjacent** — worth grepping a split for cross-file `"below"` before trusting it.

**A heading is orientation, not decoration.** `content.md` opened on `### 2.` with no 1 and no
parent, because the `## Phase 3 gate outcome` heading and its first question stayed in the brief;
`design.md`'s first 300 lines dangled at `###` under a `## Design` that had gone. Both are repaired,
and the convention across all four records is now uniform: **`##` is a dated gate or pass, `###` a
subsection of one**, in the order they were decided.

### The overlap with `docs/REBUILD-LOG.md` is a seam, and it was measured

Shingled every sentence of the four records against the log. **The overlap is real and it is
correct.** #163's measurement — 63 assets, 1.03:1 on the homepage card — is in both because the log
uses it to explain how a three-word issue got reframed and the record uses it to justify why the
frame is load-bearing. Same number, two different jobs. Where sentences are near-verbatim (#273's
"blank to video reads as loading" is a 1.00 match) the log still surrounds it with the round-by-round
narrative and the record with the rule that came out.

**Nothing was deleted from either side, and the rule is that nothing should be.** The log is #48's
source material; deleting from it to tidy a record trades a page's raw material for a readability
win nobody asked for. **This was a readability pass, not a cost pass** — the records are not read at
session start, so a merely-slightly-redundant passage costs nothing and was left alone. That is the
standard to judge the next one by too.

## `--check-selfcontained` destroyed the thing it verified (2026-09-08, #344)

`scripts/restore-snapshot.mjs --check-selfcontained` read as a read-only assertion. [#201] cited it
that way, `snapshot/rendered/README.md` said so, and `docs/PRESERVATION.md` listed it under
"rebuild and verify" without anyone noticing those were two different claims. It was a full
destructive rebuild that happened to end in a check.

Two facts combined. The `rm(OUT, …)` ran at module top level; the flag check sat 245 lines below it,
so every invocation deleted `snapshot/rendered/` before reading its own arguments. And asset
recovery does `git cat-file blob <asset commit>:<ref>`, which does not resolve in a shallow clone. **A
Claude Code web session gets a shallow clone** — 50 commits, `is-shallow-repository` true — so the
run died partway through writing pages and left the archive at **27 of its 102 files**.
`git checkout -- snapshot/rendered` restored all 102, which is the script header's own argument for
committing the artifact holding up under exactly the failure it was written against.

### The environment breaks more of the rebuild than the shallow clone does

The issue found the commit. Measuring the rest of the archive found the shape of the fix: **only 28
of the 102 files are derived from `snapshot/`** — 26 pages, `archive.css`, and the README. The other
74 come from somewhere the process may not be able to reach: 54 asset blobs at the asset commit, 14 blog
images off the old host, 6 poster frames off i.ytimg.com. The same web session that cannot resolve
the commit also cannot reach either host.

That is why the fix is a preflight rather than only a commit check. It is also why
`docs/PRESERVATION.md` was wrong in a way worth recording: it said the committed blog images meant a
post-cutover rebuild "will report them as failures but still produce a correct archive from what is
on disk." They are committed **inside** `snapshot/rendered/`, so the `rm` takes them first. The same
`rm` is why the poster loop's `existsSync(dest)` skip has never once been true.

### What shipped

- **Every mode is a flag and there is no default.** `--check-selfcontained` and `--serve` read the
  archive on disk and write nothing; `--rebuild` is the only destructive mode. A bare invocation
  prints usage and exits 2 rather than rebuilding, and an unrecognised flag exits rather than
  falling through — `--check-self-contained` is an easy thing to type.
- **The check asserts against `snapshot/rendered/`, not against its inputs.** The page list comes
  from `htmlPages(OUT)` in the read-only modes. The two sets are identical, verified: the rebuild
  writes one output page per source page, and the 26 relative paths diff clean.
- **A rebuild proves it can reach every source before deleting anything.** It resolves
  `ASSET_COMMIT`, then HEADs every committed remote-sourced file. `--allow-missing-remote` overrides
  the remote half and deliberately not the commit half: the blog going dark is permanent, a shallow
  clone is one `git fetch --unshallow` away.

**The preflight probes the committed files rather than the source references, and that is the whole
design.** "Is the host up" cannot be answered from a status code — the session's egress proxy
answers 403 to every CONNECT, and three of the nine videos are genuinely gone and answer 403 too. So
the question is asked per file and only about files the `rm` would take: can this exact byte range
be fetched back? The three dead videos have no poster committed, so they are never asked about, and
a first build with no `snapshot/rendered/` on disk has nothing to lose and is not blocked. An
earlier draft of this preflight tested one representative URL per host and treated any HTTP response
as proof of reachability; the sandbox's blanket 403 passed it cleanly while all 20 files were in
fact unfetchable.

### Not promoted to the brief

The rule this fixes — a command whose name asserts must not write — has no build guard, which is the
brief's test for promotion. It stays here anyway. The three entries under "Rules with no guard
behind them" are judgment that applies to work a session might do next; this one is a defect in one
script, now enforced by that script, in a mode structure that makes the old shape unwritable. A
fourth entry would cost every future session a read to prevent nothing.

[#201]: https://github.com/ali-wallick/Portfolio/issues/201

## Canonicals are checked in the build, because Google found them first (2026-09-08, #345)

Two Search Console emails on 2026-09-06 reported pages on the live site as **"Duplicate without
user-selected canonical"** — crawled, and no canonical found — on a site where `BaseLayout.astro`
emits one on every page it builds. The second email was the sitemap-filtered variant, so at least
one URL the site actively submits was affected.

**The invariant was never written down anywhere, which is why nothing enforced it.** #338's frame is
that a guard lets its rule leave the brief; this is the case that frame doesn't cover. The brief's
"Rules with no guard behind them" list is still three entries and still correct — canonical
correctness was not on it, and not in the records either. It was an assumption load-bearing enough
that the Settled table's canonical-hostname row asserts it in passing ("this is what `site.url`,
every `canonical`, every `og:url` and all 22 sitemap entries already say") and thin enough that no
document ever stated it as a rule. **An unstated invariant costs nothing per session and fails
silently, which is the worst of both halves of the cut line.**

`check-links.mjs` is the home by #338's own routing: canonical correctness is a property of the
render, not of `src/`. Two rules, and the second is the one that matches the email Google sent.

### Rule 9 splits three failures because they fail differently

A **missing** canonical leaves Google to pick a URL. A **second** one is ignored wholesale, so a
page with two has effectively none. A **relative** one resolves against whatever host served the
page — which on this site means every branch preview canonicalising to itself instead of to the
apex, the exact bug `cleanPath` exists to prevent. Then the value has to name the route the file is
actually served at.

**The route transform is copied verbatim from `BaseLayout.astro`'s `cleanPath`, and sharing it is
deliberate rather than sloppy.** One application runs against the route Astro knows, the other
against the path the file landed at. That means the guard cannot catch a bug _in_ the transform —
it can only catch the two drifting, which is what a page canonicalising at a URL it is not served
from means. Rule 10 covers the other side.

### Rules 10 and 11 watch the one hand-maintained index left, in both directions

`sitemap.xml.ts` generates project entries from the collections, so a project cannot drift out of
it. `STATIC_ROUTES` in that same file is a hand-kept list — the one place this site still has the
shape the content model exists to forbid, and the only one "never a second place to update" does not
reach.

**Rule 10 is the removal direction**: an entry whose page canonicalises elsewhere, carries
`noindex`, or no longer exists asks Google to index a page and then tells it not to. That is what a
rename leaves behind.

**Rule 11 is the addition direction, and it is the likelier failure.** A new page in `src/pages/`
that nobody adds to `STATIC_ROUTES` ships unlisted, is invisible to Google, and nothing says so —
[#48](https://github.com/ali-wallick/Portfolio/issues/48)'s build-in-public page is exactly that
shape. **It was not in the first cut of this guard**, which checked only that every entry had a
page. Ali asking whether the PR was worth keeping at all is what surfaced the gap, which is an
argument for the question being asked rather than against it.

Rule 11 has **two exclusions and only two**. `/404` is not a page anyone submits. A `noindex` page
is by definition not for the index, which covers draft project pages on preview deploys and makes
the rule vacuous before the cutover, when `live` is `false` and `BaseLayout` noindexes the whole
site — the same reasoning behind rule 10's `live` gate, reached from the other side, so rule 11
needs no gate of its own.

**The `noindex` half is gated on `live`, and that gate is not optional.** Before the cutover `live`
is `false` and `BaseLayout` noindexes every page sitewide, so an ungated check would fail on all 22
entries for being correct. `robots.txt` says `Disallow` in that state anyway, so there is nothing
being submitted to contradict.

### Measured the way #338 requires

The naive form ran over the real tree first. Rules 9 and 10: **0 hits on 23 pages**. Rule 11's
naive form — every built page must appear in the sitemap — reported **exactly one**, `/404`, and
that one was correct, so it took a single carve-out rather than a list. No exemption for correct
output was invented anywhere.

Then nine faults were injected into a copy of `dist/`: missing canonical, duplicate canonical, a
preview-host canonical, a canonical naming another page, a sitemap entry with no page, a sitemap
entry carrying `noindex`, a deleted `sitemap.xml`, an offsite `<loc>`, and a page dropped from the
sitemap. All nine reported, each naming the URL and what it disagreed with.

**The two negative cases were checked too**, because a guard that fires on correct output is the
thing #107 established is worse than the prose it replaces: `/404` absent from the sitemap and a
`noindex` draft absent from it both stay silent.

### The emails turned out to be about a site that no longer exists

Worth recording, because it is the outcome that justifies the guard rather than the one that
prompted it. **There was no bug.** Search Console's index was a pre-cutover crawl of the old PHP
site: six of the eight indexed URLs were last crawled between June 2 and August 22, three of them on
`www`, and one with a trailing slash. The old site had no canonical tags anywhere, so every one of
those URLs was a duplicate with nothing to break the tie — which is the reported reason, verbatim.
Ali confirmed the `www` → apex 301 from LAUNCH.md step 6 is live, ruling out the one candidate for a
live defect.

**So this guard would not have caught the thing that produced it, and that is the honest reading.**
What it protects is the invariant the incident made visible: nothing asserted that a page's
canonical named the URL it is served at, or that the sitemap and the built site agreed, and a break
in either surfaces as a Search Console email weeks later. That feedback loop cost several rounds
here and ended in "nothing was wrong". The next one will not be free either. #345 carries the
triage and the re-check criteria.

## The address was in HEAD the whole time, and the first fix is why (2026-09-09, #360)

The 2019 résumé's PO Box was redacted out of `resources/WallickAli-Resume.pdf` on 2026-08-26, and
[#109](https://github.com/ali-wallick/Portfolio/issues/109) has been tracking the harder half —
purging it from git history. Both of those looked at the same place. **Nobody looked at HEAD**,
where three files rendered the address in plain sight:
`snapshot/rendered/resources/images/resume.png` (a 1700×2200 render of the unredacted résumé,
restored from the asset commit by a rebuild), and the two `docs/before-after/old/` résumé captures,
which photographed the old résumé page — a page that embedded that exact PNG.

### The lesson: the first fix guarded a path when the risk was a class

This is the second occurrence, and the first one produced the bug.

`restore-snapshot.mjs`'s first run faithfully restored the **unredacted PDF** into
`snapshot/rendered/` and it was committed before anyone noticed. The fix was `PREFER_WORKTREE`, a
`Set` with one path in it. The next rebuild then did the identical thing one file over. The risk was
never "this path" — it was "any historical asset that pictures the résumé", and a set of paths
cannot express that. `docs/PRESERVATION.md`'s claim that "a rebuild can no longer do that" was false
from the moment it was written, for exactly that reason, and is corrected there now.

**So the shape of the fix matters more than the fix.** `SUPERSEDE` is still a path map, because a
rebuild needs to know which file to substitute — that part is irreducibly path-shaped. What closes
the class is `scripts/check-preserved-blobs.mjs`, which hashes every tracked file and fails the
build on any match against a committed denylist. Content, not paths: it fires wherever the blob
lands, under whatever name, whether a script or a person put it there. The demonstration is the
proof it works — the three pre-fix blobs were dropped into a scratch directory, two of them renamed
and one moved into a subdirectory, and all three were caught.

**Hashes are safe to commit and the denylist says so.** SHA-256 is preimage-resistant; the digest of
an image is not the image. That is what makes a committed denylist a better artifact than a
regex or an OCR pass over every tracked byte.

### What the guard deliberately does not do

It is not an address detector. Re-encode one of these images — a different compressor, a WebP
round-trip, one pixel — and the address is just as legible and the hash is gone. That is stated in
the script's header rather than left to be discovered.

The alternative was rejected on #338's own test: a recogniser over every tracked byte is slow,
non-deterministic, and fires on correct files. What is left is narrow and exact, aimed at the
failure that has actually happened twice — a script faithfully restoring a known historical blob.
A narrow guard for a demonstrated bug beats a broad one for an imagined one.

It runs beside `check:source` and before `build` in `verify`, for the reason `check-source.mjs`'s
header gives: it needs no build, so making it wait for one only delays the failure.

### Two techniques, because they are two different problems

**The PNG was replaced, not patched.** `resources/resume-redacted.png` is a 200-DPI render of the
already-redacted PDF (612 × 200/72 = 1700, 792 × 200/72 = 2200 — the original's geometry exactly),
rendered with `pdfjs-dist` and `@napi-rs/canvas` installed outside the repo, on the same precedent
as the PDF redaction: `package.json` stays untouched for something that runs once. It lives at
`resources/resume-redacted.png` rather than under `resources/images/`, which nothing should ever
recreate.

**A downsampled pixel diff is what proved the render honest.** At full resolution 2.0% of pixels
differ, which says nothing — two rasterisers antialias differently. Downsampled to 425×550 the
difference collapses to 0.23%, and it is the address line plus a scatter of list-bullet glyphs.
Same layout, same content, one line gone. **The full-resolution number would have been read as a
problem and the downsampled one is the measurement**, which is the same trap as comparing two PDFs'
content streams (see the résumé record): a confident wrong answer from the more precise-looking
comparison.

**The two captures got a composited bar**, Ali's call. They cannot be re-captured —
`capture-comparison.mjs`'s header is explicit that the "before" side comes from the _live_ old site,
gone since the 2026-08-27 cutover — and deleting them to remove one line throws away the only
photograph of a site that no longer exists. A bar is a genuine redaction on a raster: PRESERVATION's
warning about filled rectangles is a fact about PDFs, which keep a text layer under their
appearance. A raster has nothing under the pixels once compositing happens before encoding.

The bar rectangles came from the measured ink bounding box of the address line — every pixel below
luminance 150 inside a band containing only that line — then padded. **Measured, not eyeballed**,
which is the standing rule the résumé record already carries for a different geometry.
`docs/before-after/README.md` is new and says the captures are modified, because a modified capture
that does not say so is worse than either alternative.

### `ASSET_COMMIT` is a tag now, which un-blocks #109 rather than adding to it

`restore-snapshot.mjs` hardcoded `ce4533e~1`. #109 rewrites history, which invalidates it, and #109
asks for that to be fixed "in the same change" — but the replacement SHA does not exist until the
rewrite has run, so a SHA can only ever be fixed afterwards. That is the follow-up nobody remembers.

Naming the commit `assets-pre-cleanup` removes the follow-up entirely: `git filter-repo` re-points
tags automatically. The tag needs a full clone to push, so it could not be created in the session
that wrote the code — hence a resolve-with-fallback rather than an assumption. **Ali pushed it the
same day**, at `090f1ce`, verified as the pre-cleanup tree by its 144 files under
`resources/images/`. `verify` never runs `restore-snapshot.mjs`, confirmed rather than assumed, so
CI is unaffected either way.

**Pushing the tag also closed the denylist's one gap, which is the part worth noticing.** The
unredacted PDF's blob was unreachable from a shallow clone, so the guard shipped without it and said
so. The tag made it reachable in one fetch: `3216da67…`, 98,088 bytes, all four address probes
present against zero in the committed copy. **The thing that was supposed to be a durable
_name_ turned out to also be a durable _handle_** — a rewrite-proof way to reach the pre-cleanup
tree at all, which is what let the gap close in the same PR rather than waiting on #109. The
fallback's own justification shifted underneath it at the same moment: it was sequencing, and it is
now clone shape, since a shallow clone fetched without tags still cannot see it.

### Not promoted to the brief

The measurement technique (downsample before diffing two renders) stayed here. It is a specific
instance of a rule the résumé record already carries — the bytes are not the guard — and CLAUDE.md's
cut test asks whether a rule is caught by a build guard, not whether it is interesting.

### Model allocation and cost

Opus, inline, no subagents. Sequential by construction: hashes had to be recorded before anything
changed, the PNG render had to exist before the snapshot copy could be replaced, and the guard had
to be written after the hashes. Nothing to fan out. One `npm ci`, one out-of-repo dependency install
for the render, and roughly a dozen `sharp` measurement passes over three images.

## The pre-rewrite cleanup, and one premise that was wrong (2026-09-09, #45, #109)

#109's checklist put [#360](https://github.com/ali-wallick/Portfolio/issues/360) first and #45's
pre-rewrite half second. That half named four things. **Two of them turned out not to be work.**

**`.DS_Store` was already done.** #45 says it is "currently tracked at the repo root despite
`.gitignore` existing". It is not tracked, and `.gitignore` line 33 covers it. Something cleaned it up
without updating the issue — the exact staleness CLAUDE.md's "keep status out of this file" rule is
about, arriving in an issue instead.

**`infra/` is not a historical record, and #45's premise was wrong.** The issue calls it "Phase 1's
DNS baseline, verify script, BIND zone file, runbook. Historical record; not load-bearing for the
build." The last clause is true and the label is not: `docs/LAUNCH.md` runs `./infra/verify-dns.sh`
in two places, `infra/README.md` documents the zone **as it stands** (re-verified after the cutover),
CLAUDE.md's own map calls it "the live zone", and `guard-preserved.sh` exempts that README from the
preservation hook precisely because it is a live document. Moving it would have broken two runbook
commands to tidy a top level that has nine entries. **Ali's call, 2026-09-09: leave it, correct the
issue.**

The general form is worth keeping, because this repo keeps rediscovering it: **an issue written
months before it is worked describes the repo as it was.** #45 was opened 2026-08-20 and both wrong
items were true then. The cheap defense is the one that worked here — check each claim against the
tree before acting on it, rather than treating the issue body as the specification.

**What was actually work: the root `.htaccess`.** Removed. It was #25's source material and #25
closed 2026-08-23, which is the gate #45 named. Removing it is lossless — `v1-legacy`'s copy is
byte-identical, verified by sha256 first — and it was never served, since it sat at the repo root
rather than in `public/`. Five files cite it and **none reads it**; they describe how the old site
behaved, which stays true. `docs/PRESERVATION.md` now says where to read it.

### The runbook is a document, not a checklist item

`docs/HISTORY-REWRITE.md` is new, and it takes the shape `docs/LAUNCH.md` already established: the
issue holds the decision and the ordering, the document holds the procedure. Writing the procedure
into #109 would have made a second source for the same thing, which is the drift this project has
caught itself in more than once.

**What only a machine should produce is in it.** The four blob ids were found by hashing every one of
the 1,868 blobs reachable from every ref and matching against the guard's denylist — content, not
paths. Exactly four matched, one per denylist entry, and `f485f41` is a single blob that appeared at
two different paths, which is the concrete vindication of keying the denylist on content. Also
recorded: the 8 branches and 3 tags that still carry them, and the consequence nobody had written
down — **`v1-legacy` stops being a byte-complete capture of the old site**, since it carries two of
the four.

**Ali runs it.** It needs a full clone, force-push on every ref, a GitHub support purge request, and
it lands a production deploy because `release` is the production branch. (**The purge left the
runbook on 2026-09-11** — see "The Support purge is a decision, not a step" at the end of this file.
The rest of this sentence still holds.) None of that is an agent's
to do unsupervised, and the runbook says so at the top rather than leaving it implied.

## The rewrite runbook became executable, and one claim was walked back (2026-09-10, #109)

`docs/HISTORY-REWRITE.md` shipped on 2026-09-09 as prose with the blob ids in it. Ali's question —
"is asking GitHub support to purge the old objects a common thing to do?" — turned out to be worth
more than the answer, because checking it produced two corrections and a much better document.

### "A rewrite without this request is theatre" was overstated

That was the original wording of step 6. **It is not theatre.** The accurate statement: force-pushed
commits stay fetchable through `refs/pull/N/head`, which are server-side refs a push does not touch
and the repo owner cannot delete — so without the support request the blobs are _retrievable by
anyone who knows the SHA_. That is a real gap and it is not the same as still-published. The step
still matters; the sentence claiming the rest of the rewrite was worthless without it did not
survive contact.

**The other "theatre" in `docs/PRESERVATION.md` is correct and stays** — purging history while
`HEAD` ships the same image genuinely does accomplish nothing, which is what #360 was about. Two
sentences with the same word, one right and one wrong, is a decent argument for checking a rhetorical
flourish the second time you reach for it.

### The step is GitHub's own, and the docs specify the ticket contents

Confirmed against GitHub's _Removing sensitive data from a repository_: contacting Support is the
documented final step, and on the ticket they dereference or delete affected PRs, run a server-side
`gc`, and drop cached views. The docs also name what the ticket should carry — the affected-PR count,
the first changed commit from `git-filter-repo`, and any orphaned LFS objects — none of which the
runbook had. All three are in it now, with the commands that produce them.

**Calibration worth keeping**, because it is the part that generalizes: for a leaked _credential_ the
purge is secondary, since rotation is the real remedy. **An address cannot be rotated**, so here the
purge is the only lever on the GitHub copy. Cutting the other way, #109 already establishes this is
the _least_-exposed copy — public in nine archive.org captures and Google's index. Worth doing
because it is cheap and the window is now, not because it is what protects anything.

### Every command is tested, and the numbers are measured

The rule the rest of this repo follows, applied to a document: a runbook that is pasted under stress
should not contain a command nobody has run. Four were executed verbatim against the live repo
before shipping — the blob enumeration (10 seconds, returns exactly 4), the hash extraction from the
guard, the ref sweep, and the post-rewrite verification.

**That last one was run in its failing direction on purpose**, which is the only thing that makes a
silent pass meaningful later: against the un-rewritten repo it printed all four blobs. Its expected
output is now in the document, so a clean run reads as evidence rather than as a command that might
be broken. Testing also caught two defects a read-through would not: the hash-extraction step was
written _after_ the check that consumes its file, and the verification pipeline exits non-zero on a
normal run, which a careful operator would have read as failure.

Measured rather than left as placeholders: **240 of 263 commits rewritten**, first changed commit
`b541155` (2020-09-01) — which predates every pull request in the repo, and is therefore why the
affected-PR count is **all 202** rather than a subset.

### The stale-branch list is computed, not listed

The 2026-09-09 version hardcoded eight branch names. By the next day there were ten — a new
Dependabot branch, plus the branch that shipped the runbook itself. **A hardcoded list in a document
that runs once, months later, is the #45 staleness lesson with the serial numbers filed off**, so it
is a `git ls-remote` one-liner now.

## The Support purge is a decision, not a step (2026-09-11, #367, #109)

`docs/HISTORY-REWRITE.md` carried the GitHub Support purge as step 7 of the rewrite. **It is not a
step of the rewrite**, and Ali's call was to split it into
[#367](https://github.com/ali-wallick/Portfolio/issues/367) and take it out of the runbook entirely.

Two properties separate it from everything else in that document, and either one on its own would
have been enough.

### It costs something, and the rest of the rewrite costs nothing

The rewrite renames commits; it does not delete them. Every diff survives in `git log -p`, the
records and the log are files in the tree, the issues are untouched. Run it and you lose nothing.

The purge is different. GitHub's docs are explicit that it removes "the internal references used for
displaying the diff view", and that this hits **any PR built on history after the sensitive-data
commit, even PRs that never touched the file.** The first changed commit is `b541155`, dated
2020-09-01, which predates every pull request in this repo — so it is all **202** of them. What
survives is the commits; what goes is the ability to click "Files changed" on any PR ever opened
here.

**And one row of that table is undocumented**: the docs say "dereference **or** delete", which are
very different outcomes for the PR titles, bodies and review threads. Nobody can answer that from
the docs, so #367's ticket copy _asks Support to confirm before acting_ rather than instructing them
to proceed. A ticket that asks a question first is the right shape when the cost is irreversible and
unquantified.

### It is gated on #200, and nothing else in the runbook is

The PO Box is public right now in roughly ten archive.org captures and Google's index. Spending 202
PRs' diff views to close the GitHub copy while those stand closes one door in a building with no
walls.

**The trade only makes sense in one order:** if
[#200](https://github.com/ali-wallick/Portfolio/issues/200) succeeds and archive.org removes the
captures, GitHub becomes the last public copy and the cost is worth paying. If #200 is refused,
the honest answer may be to never file #367 at all — and the issue says so, with "Ali decides not to
file it and records why" as a legitimate close.

There is also a tension worth naming, because #109's case for going public is _"the repo says here
is how she runs an agentic project, with the failures left in."_ Some of that evidence is exactly
what the purge spends.

### What the split fixes about the runbook

A procedure that contains one conditional step is a procedure people either half-run or
over-run. The runbook is now unconditional end to end — every step is safe, cheap, and has no
precondition beyond the previous one.

**And it says what it does not do**, which matters more than it sounds: after a clean run the blobs
are still reachable through `refs/pull/N/head`, and a reader who finished the document without that
sentence would reasonably conclude the bytes were gone from GitHub. That note is now in the header,
not buried at the end.

The measured fact that makes the whole thing low-urgency, and that was not written down anywhere
before: **the repo is private with 0 forks** (verified 2026-09-11). Nobody without repo access can
reach those PR refs today, so there is no clock on any of this. The deadline is the public flip, not
a date.

## The list was declared complete at four, and a rehearsal found ten (2026-09-11, #109)

Ali asked for a read-through of `docs/HISTORY-REWRITE.md` before running it, on the grounds that it
is irreversible. The read-through was done by running it: a `--no-local` mirror in a scratch
directory, the stale branches deleted, `filter-repo` run for real, and every verification step
executed against the result. That is the only kind of review an irreversible procedure can have,
and it is different from what the 2026-09-10 pass did. That pass ran each command _against the live
repo_ and recorded its output, which tests that the commands work. It does not test what the
procedure produces, and the two failures below were both in the product, not the commands.

### The 2016 résumé was in history the whole time, with a street address

The denylist in `scripts/check-preserved-blobs.mjs` had four entries, all 2019 material, because it
was built from what had leaked into `HEAD` (#360) and everything in `HEAD` was 2019. Nobody had
listed what the same two paths held _before_ 2019. `resources/WallickAli-Resume.pdf` had three 2016
revisions and `resources/images/resume.png` had a 1700×2200 render of each, from the initial
checkin onward, and all six carry a **full street address and a phone number** in the header. The
2019 PO Box was the smaller exposure. #109's survey states that the résumé with the home address
and phone number "is not in git anywhere"; it was thinking of the 2010 one, and it was wrong about
the class.

**#360's lesson was applied one step short.** It moved the guard from paths to content, which is
right, but the content it guarded was only the content that had already surfaced. A denylist built
from incidents is a list of incidents. The runbook now carries the check that would have caught
this on day one: enumerate every blob the two paths ever held, and account for each one by name.

### `--strip-blobs-with-ids` reverts a path, it does not delete it

The second finding is the one that turned "incomplete" into "harmful". Stripping a blob drops that
commit's change to the path, so the file falls back to whatever the parent commit had. With only the
2019 PDF on the list, the `b541155` commit that `v1-legacy` points at reverts its résumé to the
April 2016 revision. The rewrite as written would have removed the PO Box from the tag and put the
street address in its place, in the one tree the runbook promised to leave clean apart from two
deletions. The post-rewrite tree listing showed both résumé files still present; the runbook's own
section 3 said they would be gone.

With all ten on the list, the paths have no revision left to fall back to and disappear from every
tree, which is what section 3 claimed all along. **266 of 267 commits** are rewritten, not 240 of
263, and the oldest changed commit is the initial checkin rather than 2020's `b541155`.

### Four steps that would have failed at the keyboard

None of these is a judgment call, and none was visible from reading the document.

- **`git push --mirror` against GitHub.** A mirror clone from GitHub fetches `refs/pull/*` (206
  here), and a mirror push then tries to update every one; GitHub rejects each as a hidden ref. The
  branch and tag updates go through, but they are buried in 200 rejection lines and a non-zero
  exit, at the exact moment the operator most needs a clean signal. The dry run does not show it,
  because the rejections are server-side. Explicit `refs/heads/*` and `refs/tags/*` refspecs with
  `--prune` do the same job and touch nothing else.
- **`release` was 8 commits behind `main` and still carried three bad blobs.** The force-push
  deploys `release`, and the rewrite deletes files from any tree that still holds one, so the deploy
  would have shipped a tree no commit ever had. Now a preflight: `release` must be at `main` first,
  which also makes "the content is identical" true rather than asserted.
- **Step 7's plain `git fetch` would not have moved the tags.** Git refuses to clobber an existing
  tag without `--force`, so the everyday checkout would have kept the old `assets-pre-cleanup`, and
  `restore-snapshot.mjs` would have silently read pre-rewrite history through it — the exact trap
  #360 introduced the tag to close.
- **The "first changed commit" command read the wrong line.** `filter-repo`'s commit map is in
  processing order, not date order, so the first differing line was a 2026 commit. The runbook now
  looks the initial checkin up by id.

Two smaller ones: the `v1-legacy` grep was case-sensitive and the PDF is capitalised, so it showed
one file where two would go; and deleting the stale branches closes any open pull request whose head
is among them (one was, the Dependabot bump), which is now a preflight rather than a surprise.

### What generalises

**Testing the commands is not testing the procedure.** Every command in the 2026-09-10 runbook was
run and its output recorded, and the document was still wrong about what it would do, because the
commands were run against the input and never against the output. For anything irreversible the
rehearsal on a throwaway copy is the test, and a runbook that has not had one has not been reviewed.

**A denylist built from what leaked is a list of what leaked.** The guard is still the right shape
(content, not paths, exact hashes, no OCR) and it is now ten entries; the reusable part is the
enumeration step in the runbook, which asks "what else has ever lived at this path?" instead of
"which files have bitten us?".

## The rehearsal's counts came from a mirror without pull-request refs (2026-09-13, #109)

Ali asked for one more read of `docs/HISTORY-REWRITE.md` before running it. The read was done the
way the 2026-09-11 record says it has to be: a mirror cloned from GitHub into a scratch directory,
the stale branches deleted, `filter-repo` run for real, every step-5 check run against the output.
The rewrite itself came out exactly as the runbook says — no denylisted blob reachable from any ref,
`main`'s tree byte-identical, `v1-legacy` at 183 files, `release` and the launch tag each losing the
same three files, the tags re-pointed. Three of the runbook's expected numbers were wrong, and all
three for one reason.

**The 2026-09-11 figures match a copy with no `refs/pull/*`.** A mirror from GitHub has 209 of
them, filter-repo rewrites every ref it can see, and pull requests here are squash-merged, so each
PR's branch commits are reachable only through its pull ref. The commit-map therefore covers 854
commits, not 267, and reports 853 rewritten. Step 5(c) prints four commits rather than two, because
the two redaction PRs' original branch commits sit behind pull refs as well as their squash commits
on `main`. Neither is a problem — step 6 never pushes pull refs — but a runbook that says "expect
266 of 267" in front of an operator who sees 853 of 854 has just told her the rewrite went wrong,
at the one moment she cannot afford to guess. The runbook now names the denominator's actual source
(`git rev-list --count --all` in the backout) and says why it is what it is.

**One commit is pruned, and the runbook did not say so.** `1065039` ("Fixed resume typo", 2016)
changed only the two résumé files; with both blobs stripped it is empty, `--prune-empty auto` drops
it, and `main` goes from 270 commits to 269. Expected and harmless, and now written down with a
command that lists the pruned commits, so a shorter count is not read as a failure.

Also refreshed: the blob count (2,791 in a GitHub mirror, about 2,000 in the everyday checkout),
the enumeration loop's running time (a minute, not ten seconds), and a step-7 addition. The
everyday checkout keeps thirteen local branches and three worktrees on pre-rewrite commits, and
pushing any one of them would re-upload the stripped blobs; `cleanup-branches` before the next push.
Also confirmed, since it is the one thing that could stop step 6 cold: branch protection and
rulesets are a paid feature on a private repo, so nothing on GitHub's side refuses the force-push.

### What generalises

**A rehearsal is only as faithful as its copy.** The 2026-09-11 run tested the procedure on a
mirror missing the one ref namespace GitHub adds, and every number it recorded was true of that copy
and false of the real one. The mechanism was right, the expectations were not, and expectations are
what an operator judges an irreversible step by. The counts a runbook quotes have to come from the
same shape of input the operator will have.

### Read again the same day, against the live repo

Ali asked for one more pass before starting, hours after the one above. This one ran the runbook's
own enumeration and tip-tree checks in the everyday checkout rather than a mirror, and checked the
prose against GitHub. The mechanics held again: ten blobs, the same seven stale branches plus
`release` and three tags, `1065039` the only empty commit, `0d0046a` the only root. Four sentences
did not.

**Two merges had already moved the counts.** The morning's figures were pinned to `c41e1b0`; by the
afternoon `main` was at `283d69c`, 273 commits rather than 270, and "270 becomes 269" was false
again. The pull-ref count appeared three times in the runbook as 202, 206 and 209, none of them the
day's 210. A count re-measured that morning was stale by the time it was read, which is the
2026-09-11 lesson at a shorter wavelength: it is not enough for a number to come from the right
shape of input, it also has to stay true until the operator reads it, and a number that changes on
every merge never will. **The runbook now states its expectations as invariants where it can** —
exactly one commit pruned, exactly one untouched, `main` exactly one shorter, one pull ref per pull
request — and gives a command instead of a figure where it cannot.

**#200 had closed.** archive.org removed all three captures, verified 2026-09-11, and the runbook
still called #367 "worth filing only if #200 has succeeded". It has, so #367 stopped being
conditional and became the step after the push; the runbook and the issue both say so now, and the
issue's paste-ready ticket was refreshed from the four-blob version it still carried.

**And preflight (d) was failing.** `release` was 14 commits behind `main`, the same state the
2026-09-11 rehearsal had found at 8. The check is written correctly and the runbook already said
what to do; what it now also says is that this is the check to expect to fail, since it has on both
occasions anyone looked.

## The rewrite ran, and check (b) found what the list could not (2026-09-18, #109)

Ali ran `docs/HISTORY-REWRITE.md` end to end, one step at a time, with a session reading each
output before the next command. Preflight failed once, on (e): Dependabot had opened #379 that
morning. Merging it put `release` one commit behind, so (d) failed next, and a release put it right —
the runbook had said to expect (d) to be the one. Steps 1 through 4 then matched every expectation:
ten blobs, 8 of 10 in the enumeration plus the two redacted ones, three tags and no branches, 867 of
868 commits rewritten, `1065039` the only one pruned.

**Check 5(b) then found the 2019 address in plain text, in a file nobody had put on any list.**
Ali's zip-code probe matched hundreds of `commit:docs/PRESERVATION.md` lines. From 2026-08-26 to
2026-09-09 that file's verification table carried a row naming the redaction's probe strings — the
city, the zip, and the box number — which is the whole mailing address in pieces. #360 took the line
out of the working tree, and that is why the runbook says probe strings are "deliberately not
written down". Nobody went back for the four versions still in history, and the rewrite could not
see them either. `--strip-blobs-with-ids` matches exact content, and a Markdown file that mentions an
address is not the address's PDF.

A blob-level sweep of all 2,820 blobs in the rewritten mirror bounded it. The city and zip appeared
in exactly those four versions, on that one line, and nowhere else. The fix was one filter-repo text
rule, built from the old blob so nobody typed the address, padded to the same length so the table
stayed aligned. The rewrite was redone from a fresh copy of the backout with both flags in one pass.
Every count came out the same. `main` and `release` were byte-identical to the backout's, and each of
the four new versions was verified as exactly the old one with that row swapped. The push went out
after that, with the dry run showing five forced updates and no deletions.

**The runbook now finds text copies before the rewrite rather than after it.** Step 1 has a "Text
copies" sweep that names the blob, and step 4's command carries `--replace-text`. Check (b) stays
where it was, as the proof. The runbook is marked executed, like `LAUNCH.md`, with the before-and-
after refs in its header. The SHA fallback in `restore-snapshot.mjs` was deleted in the same change,
as its `TODO(#109)` asked.

### What generalises

**The record of a redaction is itself a copy of what was redacted.** The table existed to prove the
address was gone, and to prove that, it named the address. #360's lesson was "a path rule is
necessary and never sufficient; the guard is what closes a class", and this is the class one level
out. The blob denylist closes "this file's bytes", and nothing closes "text that describes this
file". The only thing that caught it was a check phrased as the actual question: is the address
anywhere? It was also cheap to catch only because verification came before the push. The runbook's
insistence on that ordering is what made this a redo of step 4 and not a support ticket.

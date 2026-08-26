---
name: content-pass
description: Run the per-page content revisit pass on aliwallick.com — one sub-issue of #31 at a time. Use when the user names a content-pass issue, says "let's do the content pass on /projects/X", wants a page compared against its old version on the pre-2026 site, or asks why a page reads thin. Handles the method and the audit; write-copy governs how the resulting sentences sound.
---

# Run a content pass on one page

The per-page pass behind [#31](https://github.com/ali-wallick/Portfolio/issues/31) and its 21
sub-issues. One page per branch, one PR per page.

**This skill is the method. `write-copy` is the voice.** Both apply, and `write-copy` gets read
before a word is written — it carries the measured evidence (17-word mean, zero em dashes) that the
sentences are judged against.

## The thing this skill exists to stop

#31 calls itself "an edit pass, not a re-reporting pass," and that framing is right about **facts**
and misleading about **coverage**. Phase 3 wrote every page by compressing an old page down to a
summary. A tone pass that only reads the current page inherits every compression silently.

On the first page worked ([#97](https://github.com/ali-wallick/Portfolio/issues/97)), the current
copy was clean — 23 words, two sentences, no em dash, well inside Ali's measured baseline. Read on
its own it needed nothing. Read against the old page it had dropped the biblical parable the game is
named for, the two-mode design that was the whole engineering story, and Ali's own note about which
art wasn't hers. **The last one had quietly made a claim broader than the source supported.**

So: **read the old page every time, before deciding the current one is fine.**

## 1. Read the issue, then the issue's comments

The body may be stale. #97's quoted a summary that
[#134](https://github.com/ali-wallick/Portfolio/pull/134) had already rewritten, and only a comment
said so.

```bash
gh issue view <n> --comments
```

Note what the issue puts **out** of scope. Most say "read for tone, length, and voice consistency,
not fact-correctness — Phase 3's facts hold."

## 2. Run the audit

Build first — the audit reads `dist/`, because several checks only work on rendered output.

```bash
SHOW_DRAFTS=true npm run build
node .claude/skills/content-pass/scripts/audit-page.mjs /projects/<slug>
```

It reports four things, each of which was missed by hand at least once:

| Check                          | Why it needs a script                                                                                                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Em dashes in rendered copy** | `role`, `summary`, `caption`, and link `label` are front matter that **renders as visible copy**. A grep of body prose sees none of them. It also attributes each hit back to its source line and key. |
| **Sentence stats on the page** | `copy-stats.mjs` measures the file. This measures what a reader sees, which includes the summary and captions.                                                                                         |
| **The old page's prose**       | Printed in full, so what the summary dropped is visible rather than remembered. Snapshot filenames are the old site's camelCase and don't match slugs, so it fuzzy-matches and prints what it matched. |
| **Unused media**               | The Phase 3 migration moved the whole keep-list into `src/assets/`; only heroes ever got wired up. 9 of 11 archive entries have unused images sitting in the repo right now.                           |

`--all` sweeps every project. Use it to find cross-page patterns, not to batch the pass.

**Two deliberate asymmetries in the script**, so its output isn't confusing:

- **Em dashes are scanned across all of `<main>`; sentence stats exclude the metadata strip and
  backlink.** An em dash in `role` is a real finding, but "Game jam 2011 Unity Georgia Tech" is not
  a sentence and wrecks the mean on a short page.
- **The `<title>` / `og:title` template (`{title} — Ali Wallick`) carries an em dash on all 23
  routes and stays.** It's a structural separator, not prose. It lives outside `<main>`, so it never
  appears in the audit.

## 3. Read the old page for content, not wording

The old prose is 2009–2016 Ali. Don't port its voice. Do ask what it knew that the current page
doesn't:

- **Why is it called that?** Titles frequently carry a fact the summary dropped.
- **What was the actual design or system?** This is what makes an entry interesting rather than a
  credit.
- **What did she say about her own contribution?** Especially any limit she put on it. A Phase 3
  `role` field can be broader than the sentence it was compressed from.
- **What is safe to drop?** Old pages carry control manuals, "click here to play" for dead
  downloads, and second-person instructions. Cut those without ceremony.
- **Before marking a `links[]` entry `dead: true`, check the Wayback Machine.** A citation worth
  keeping clickable — a press writeup that corroborates a credit, especially — is worth more as a
  working archived link than as the "No longer online: X" plain text `dead: true` renders. Store
  listings and a project's own dead homepage are a weaker case: the fact of having existed usually
  isn't the point, so plain `dead: true` (or dropping the link) is fine there. Settled on
  secret-garden (#98): its Qualcomm AR Game Studio writeup swapped a 404'd `argamestudio.org` URL
  for a working `web.archive.org` snapshot, label suffixed `(via Wayback Machine)`, `dead` dropped
  entirely since the link now resolves. See `content.config.ts`'s `link` schema comment, which
  carries the same rule. **Worth a look on kaneva.com, firefall.com, and Vegas Blvd Slots' two dead
  store links when those pages' own passes come around — not done here.**
  **Within the weaker case, prefer dropping over `dead: true` for a broken interaction, not just a
  broken citation.** Settled on cor-ex-machina (#90): its "Play online" link was a Unity Web Player
  build, dead regardless of whether the host answers, and the first draft kept it as `dead: true`
  because the skill's wording above treats both options as equally fine. Ali's reaction to seeing
  "No longer online: Play online" render on the page was to cut it outright. The distinction that
  makes the call: **a dead homepage is proof the thing existed; a dead "play now" link is a broken
  action offering nothing once it fails.** Ask "does the reader lose information if this link
  disappears, or just a broken button?" before defaulting to `dead: true` on the weaker case.
  **Correction, 2026-08-25 (#140): a dead homepage isn't actually a reason to stop at `dead: true`
  either, if a good Wayback snapshot exists.** An earlier version of this section named kaneva.com
  and firefall.com as the case that should stay `dead: true` rather than get a Wayback swap, reading
  the guard table's own example (CLAUDE.md: "firefall.com, kaneva.com ... linked as live calls to
  action for years after going dark") as a rule about those specific domains. It isn't — that
  sentence is about the _old site's_ bug (a dead homepage staying up as a live-looking call to
  action), not an instruction to keep the current site's citation inert forever. Once kaneva.com's
  page actually rendered "No longer online: kaneva.com," Ali's real reaction was to ask for a
  Wayback link instead — swapped to a June 2013 snapshot, during her time there, labeled `kaneva.com
(via Wayback Machine)`, `dead` dropped. Same fix as secret-garden, applied to the case this
  section previously said didn't need it. **The actual rule: check Wayback before settling for
  `dead: true` on any homepage, not only on citations** — a working snapshot of the real product
  beats inert text even when "the fact of having existed" is the whole point, because the snapshot
  _shows_ that fact instead of just asserting it. **Checked on firefall.com too (#139, 2026-08-25):**
  same fix, swapped to a November 2015 snapshot (during Ali's time at Red 5), labeled `firefall.com
(via Wayback Machine)`, `dead` dropped.
- **A Wayback snapshot returning 200 is not proof it works — verify a swap in an actual browser, not
  just `curl`.** Found on vegas-blvd-slots ([#137](https://github.com/ali-wallick/Portfolio/issues/137), 2026-08-26). An archived App Store listing had a full 200
  response and complete HTML via `curl`, and shipped as a Wayback swap on that evidence alone.
  Opened for real in a browser, it never showed the listing — it hung indefinitely on the App
  Store's own "Connecting to Apple Music..." iTunes-redirect interstitial, which archived replay can
  never resolve, because that's client-side JS trying to open a native app that isn't there. The
  same page tripped the opposite failure in the other direction: MobilityWare's own product page (a
  Wix site) `curl`'d back as almost no visible text, because Wix is entirely client-rendered and
  `curl` never executes the JS that builds the page — opened in a browser, it was the fuller, working
  page that ended up shipping instead. `curl`/the availability API only prove a URL _responds_; they
  can't tell you whether the page that loads is the real thing, a stuck redirect, or an empty shell.
  For any Wayback swap, load it in a browser (the Browser pane tools, not a raw fetch) and read what
  a visitor would actually see before treating it as the fix. The site's three prior Wayback swaps
  (kaneva.com, firefall.com, secret-garden's argamestudio.org) were spot-checked the same way after
  this was found and all render correctly — the risk is specific to client-redirect pages like app
  stores, not to Wayback swaps in general, but there's no way to know which kind a given URL is
  without looking.
- **Is there context only Ali has?** The old page and the blog archive are not the only place a
  fact can live. Prodigal's strongest material — a named Georgia Tech course, built on real
  hardware in C and assembly — was in neither. No amount of re-reading old pages would have
  surfaced it; it only came out once Ali saw the draft and reacted. Don't treat "the sources are
  exhausted" as "the facts are exhausted." If a page still reads generic after the audit and the
  old page, ask her directly before writing final copy.
- **What does the old page call the thing itself?** Not every project is comfortable being called
  "a game." Night Light's draft defaulted to "the whole game" out of habit; Ali's reaction was
  "game is a stretch for what this is." The old page had already hedged this, unread until then —
  "Although this is considered a 'scene,' it has definite game elements" — so the fix was sitting
  in the primary source the whole time. Check what noun the old page reaches for (scene, piece,
  demo, sketch) before defaulting to "game," especially for coursework and non-interactive pieces.
- **A comparison used for shape or feel can silently donate a mechanic that was never actually
  there.** Critter³'s source called it "a cross between Rubik's Cube and Sudoku" — about the
  cube's six sides and the placement logic, not about twisting anything. The draft nonetheless
  credited Ali with building "the cube's rotation," inferred from the comparison plus the old
  page's own "the turning and clicking mechanism" line — except "turning" there meant the camera
  orbit ("use the right mouse button and drag to look around"), not a puzzle mechanic. Nothing in
  the audit or the stats script can catch this; it took Ali reading the draft and knowing her own
  game. When a source pitches a project as "X, but like [famous thing]," verify the comparison
  against the actual how-to-play instructions before writing what it implies into a mechanics
  description — the famous thing's own mechanic is not evidence.
- **The Wayback Machine is also a content source, not just a dead-link fix.** Checking it for
  critter-3's broken Global Game Jam link (per the rule above) surfaced the game's own credits
  page — full names for all seven team members, split by discipline — which confirmed `teamSize`
  and populated `collaborators` with real names neither the old page nor the blog archive had.
  Worth fetching even when the current `url` still resolves, if the page might carry credits, a
  brief description, or other structured detail the site's own old page compressed away.
- **Check that every `links[].url` on the page actually resolves before shipping — don't assume a
  link is fine because nothing flagged it.** `check-links.mjs` deliberately does not fetch external
  links (by design, for CI speed — see its header comment), and the audit script doesn't either, so
  a dead outbound link only gets caught if a human tries it. tilting-at-windmills'
  ([#99](https://github.com/ali-wallick/Portfolio/issues/99)) Global Game Jam link had shipped
  through an earlier pass undetected — `curl -I` on it 403s. A `curl -sIL <url>` per link (or the
  Wayback-availability API, `archive.org/wayback/available?url=<url>`) takes seconds and would have
  caught it before merge instead of after, on Ali's own click-through. Same rule as the dead-link
  guidance above applies once you find one: check Wayback before deciding `dead: true` vs. an
  archived-link swap.
- **`content/archive/` (the blog) is a separate source from `snapshot/`, and the audit script only
  reads the latter.** tilting-at-windmills' first draft used only the old site page and produced a
  flat "my first multiplayer jam prototype that actually worked" — accurate, but read as a boast on
  review. `content/archive/2014-02-02-global-game-jam-2014.md`, Ali's own post about that exact jam,
  had the real story: multiplayer was the stretch goal, a locked-down network at the jam site made
  it a real fight, and the team pulled through anyway. The audit's "old page" section is a genuine
  aid but it is not the whole primary-source surface — `grep -ril <project-or-theme-keyword>
content/archive/` for a matching post is worth doing every time a project has a plausible
  publication-year match, not just when the current copy already reads thin.
- **"X, Y among them" implies an open set — check the source's actual count before using it.**
  Art of Rescue's pre-pass summary read "levels made from their own famous motifs, Monet's lily
  pads among them," naming one artist as if it were a sample from a longer list. The old page
  says the team built exactly two levels, Monet and Dalí — a closed set of two, not a list worth
  gesturing at. Ali's fix on the branch preview (#89) was to name both in the body instead
  ("one modeled on Monet's garden and one on Dalí's melting clocks") rather than hedge with
  "among them" over a two-item list. Reach for "among them" / "such as" only when the source
  actually supports more items than you're naming; when the full list is short, just state it.
- **A named team/group credit in the summary or body duplicates what `collaborators` already
  renders, and no other archive entry does it.** Art of Rescue's summary named the team
  ("built by an all-women team, Team Femtastic Four") in prose; checking the other eight archive
  entries with `collaborators` (critter-3, dead-booty, i-fits-i-sits, it-will-kill-you,
  kinoclue, mini-mages, night-light, secret-garden) found none repeat the team's name or
  composition in the summary or body — the rendered "Team" section from `collaborators` is the
  only place it appears. Ali cut it on review (#89). Treat a team name/description sitting in
  prose as a sitewide-convention mismatch to flag proactively, not just something to wait for
  Ali to catch.

## 4. Decide the shape before writing

The tiers behave differently, and `src/content.config.ts` is the contract:

- **Featured** — a real write-up, `## What I built` / `## What I learned`. Already exists on all
  five; the pass is editing, not expanding.
- **Archive** — one line, and **optionally a short body plus a `gallery`** where there is material
  worth having. Settled 2026-08-24 via #97. **Permission, not a quota**: an entry with nothing more
  to say stays summary-only, and that is a correct outcome. What preserves the tier is **no
  featured-tier section headings** (`## What I built` / `## What I learned`) — length itself is a
  **guideline, not a hard cap**. It was written as "one paragraph" on the first pass and loosened
  the same day once Ali flagged the case that broke it: she expects to eventually move Kaneva into
  this tier and doesn't want that to mean losing much of its existing detail. The guideline is
  calibrated to what the tier mostly is — early student and jam work that doesn't need much — not a
  ceiling on a richer entry demoted into it later. Prodigal shipped at one short paragraph after two
  rounds of trimming a longer draft — that trend (write more than you'll need, then cut on review)
  is the working reference, not a word count. **Nor is it a one-paragraph rule.** Night Light shipped
  two — a concept sentence, then the contribution detail — once Ali asked for the split. One
  paragraph is the common shape because most archive entries only have one idea; add a second when
  there are genuinely two (what it is, versus what she built), don't force a run-on to preserve a
  paragraph count nobody asked for.
- **The summary/body split for the concept sentence is negotiable, not fixed.** Every summary so far
  has paired a context sentence with a concept/hook sentence, contribution detail going in the body.
  Night Light moved the hook sentence ("Comfort a boy afraid of the dark...") out of the summary and
  into the body instead, on Ali's call, leaving the summary as a single context-only sentence. If a
  body exists for a page, the concept sentence doesn't have to live in the summary by default — ask
  if it's not obvious which reads better.

**If the shape changes, that is a decision, not an edit.** Stop and get Ali's call, because it sets
a pattern across a tier rather than fixing one page. Then record it in `CLAUDE.md` _and_ in
`content.config.ts`'s tier comment, since a decision recorded in one place drifts.

**A bulleted list is a valid shape for an archive body when there are 3+ enumerable named things.**
Settled 2026-08-24 on mini-mages ([#95](https://github.com/ali-wallick/Portfolio/issues/95)). The
first draft described three named mini-games as three sentences run together, each starting with the
game's name as its subject ("Summon is...", "Potions is...", "Dragon Battle..."). Ali's read on the
branch preview: a scannable list beats that pattern once every sentence has the same shape. Use the
bold-label convention Marvel Snap's featured write-up already established
(`**Label.** Explanation.`), but at list-item scale: `**Label:** clause.` — colon rather than period,
because a list item is usually one clause, not a full sentence, and the word after the colon is
capitalized. This isn't a general license for lists in archive bodies; reach for it specifically when
the alternative is several sentences that all open with a proper noun and a linking verb.

**Extended to a featured body, on kaneva ([#140](https://github.com/ali-wallick/Portfolio/issues/140)), 2026-08-25 — this isn't archive-only after all.** Kaneva's `## What I built` buried eight
menu categories in two dense, comma-heavy sentences — the same "several parallel items dumped into
prose" shape mini-mages hit, just in a featured page rather than an archive one. Ali's fix was the
same device: `- **Label:** clause.` Nothing in the reasoning above was actually archive-specific; the
qualifier was just untested until a featured page needed it. Reach for this whenever the alternative
is a prose list of 3+ parallel items, regardless of tier.

## 5. Write it

Follow `write-copy`. Then measure both ways — they answer different questions:

```bash
node .claude/skills/write-copy/scripts/copy-stats.mjs src/content/projects/<slug>.md
SHOW_DRAFTS=true npm run build
node .claude/skills/content-pass/scripts/audit-page.mjs /projects/<slug>
```

The audit should come back with **no em dashes** and a mean in the neighbourhood of 17. Under 17 is
fine and common on archive pages, where most of the text describes a game rather than an argument.
A low first-person count on an archive page is also fine and not worth chasing.

**Apostrophes:** Markdown body text gets typographic quotes (`didn’t`); front matter does not
(`didn't`). Both render on the same page, and a caption next to a paragraph shows the difference.
Type the curly apostrophe directly in YAML when the two sit near each other.

**Lean third person when describing gameplay, not "you."** Not a hard rule — but "You play a pirate
hunting..." can read a little like an instruction manual for a portfolio site, where "A pirate
hunts..." reads more like a synopsis. Prodigal's body already does this ("A wolf leaves its pack to
find food..."). Worth a second look whenever "you" shows up describing a mechanic, since it's an
easy default to reach for without noticing. Caught on dead-booty ([#92](https://github.com/ali-wallick/Portfolio/issues/92)) after shipping with "you"
first.

**Asked to bring one page's register closer to named sibling pages, `grep` the site for the flagged
phrase before rewriting it.** vegas-blvd-slots ([#137](https://github.com/ali-wallick/Portfolio/issues/137)): asked to make the page read more formal like
I Fits I Sits, Firefall, and Kaneva, the specific casual phrases worth fixing weren't obvious from
feel alone — "cut my teeth," "entirely myself," and the "I went in... I came out..." narrative
bookend all sound perfectly normal read once. `grep -rn "<phrase>" src/content/projects/
src/content/jobs/` confirmed all three were unique to this one page, used nowhere else on the site —
that's the actual signal a phrase is a register outlier rather than just an ordinary casual word the
rest of the site also uses at the same rate. Don't reach for this on every wording tweak; it's for
the specific ask of matching one page's tone to others by name.

**Check a caption against the body it sits next to.** The audit script measures each field in
isolation, so it won't catch a gallery caption restating a fact the body paragraph right above it
already made — a caption reading "Touching one is instant death" next to a body sentence ending
"...and touching a zombie means instant death" is a straight repeat a reader hits within one
paragraph. Read the rendered page, not just the audit output, before calling a page done ([#92](https://github.com/ali-wallick/Portfolio/issues/92)).

**Check inline bold for a reason, not just a pattern.** kaneva ([#140](https://github.com/ali-wallick/Portfolio/issues/140)) had a single word bolded mid-sentence in body prose ("a menu
**animation** system") with no comment or issue tying it to a decision — a leftover from the
original Phase 3 draft that four separate revisits of this page never questioned. The site's actual
bold convention is structural: bulleted-list labels (`**Label:**`), paragraph lead-ins (Marvel Snap's
`**Championing a migration...**`). A bold word sitting inside an ordinary sentence, with nothing else
like it on the page, is worth asking about rather than assuming it's deliberate emphasis — the audit
script has no way to flag this, since it isn't wrong markdown, just unexplained.

**Prefer real game-dev vocabulary over a familiar everyday metaphor when describing a mechanic.**
Mini-mages' first draft described Dragon Battle's controls as the iPhones becoming "steering
wheels" — accurate, but a car metaphor for what a game developer would just call tilt controls.
Ali's fix on [#95](https://github.com/ali-wallick/Portfolio/issues/95): "tilt controllers." Same
accelerometer input either way; only one phrasing sounds like it was written by someone who builds
games, which is the whole brief (CLAUDE.md: "obvious a game developer made this"). Worth a second
look whenever a mechanic is described via a real-world analogy instead of its actual game-dev name.

**Gallery image misalignment is fixed at the CSS level now, not by trimming captions.** `.gallery`
used to bottom-align (`align-items: end`, added for #96,
[#148](https://github.com/ali-wallick/Portfolio/pull/148)), which flushed each _card's_ bottom edge to
the row but let each image's top float independently. The original theory was that a caption wrapping
one line longer than its row-mates was the cause — true on it-will-kill-you's third caption
([#93](https://github.com/ali-wallick/Portfolio/issues/93)), which is where this was first caught, but
not the whole story: a 2026-08-24 sweep of every archive gallery found the same misalignment on 6 of 8
pages, including ones where every caption in the row matched line for line (critter-3). The real cause
is that gallery images keep their source aspect ratio and are never cropped, so two images of the same
column width render at different heights regardless of their captions. `.gallery` now uses
`align-items: start` (`src/styles/base.css`), which pins every image's top to the row — the one
alignment a mixed-aspect-ratio row can actually guarantee — and no longer needs a caption-length fix to
do it. **Caption-length matching is still worth doing**, just for a smaller reason: it keeps the row's
_bottom_ edge (now the one that can go ragged) from looking uneven. Check with the rendered page —
`getBoundingClientRect()` on each `.gallery img` and its `figure`, or eyeball it at a normal desktop
width — and shorten the outlier caption to match its neighbors' line count if the ragged bottom bothers
you. It's cosmetic now, not a correctness bug.

**The archive tier's descriptive-only caption convention is a default, not an absolute.** Dead Booty
and Prodigal's captions avoid "I"/"Ali" on purpose, matching the tier's lower-key framing. Night
Light's ceiling-fan caption is first person anyway ("The ceiling fan: a prop I modeled for the
scene.") because Ali asked for it directly, to credit a specific contribution the caption sits next
to. Reach for the descriptive default; don't defend it against a direct request to do otherwise.

## 6. Verify

```bash
npm run verify
```

Two known traps:

- **`npm run verify` may be red before you start.** Prettier scans git worktrees under
  `.claude/worktrees/`, which `.prettierignore` can't reach — tracked in
  [#144](https://github.com/ali-wallick/Portfolio/issues/144). Confirm it fails on a clean tree
  before blaming your branch, and check your own files directly:
  `npx prettier --check <files>`.
- **Touching `src/content.config.ts` invalidates the resume PDFs.** It's one of
  `build-pdf.mjs`'s hashed inputs, so even a comment edit changes `scripts/resume-pdf.lock.json`.
  `npm run build` regenerates them; commit `public/*.pdf` and the lock with your change or
  `npm run check:pdf` fails the deploy.

## 7. Branch, preview, PR

Per `CLAUDE.md`'s review loop. Copy is Ali's, and "it builds" proves nothing about tone.

```bash
git checkout -b content-pass-<slug>
git push -u origin content-pass-<slug>
gh pr create --title "Content pass: /projects/<slug> (#<n>)" --body "..."
```

The PR body should say **what the old page had that the new one didn't**, what you cut on purpose,
and the measured numbers. Not a diff summary — the diff is right there.

**Lead the PR body with `Closes #<n>`, naming the page's own sub-issue.** GitHub only auto-closes an
issue on merge if the closing keyword (`Closes`, `Fixes`, `Resolves`) appears in the PR body or a
commit message — a title like `Content pass: /projects/<slug> (#<n>)` references the issue but does
not close it, which is why this has landed inconsistently across earlier passes. Put it as the first
line of the body (`Closes #99`, not buried mid-paragraph in a `[#99](...)` markdown link), so the
issue actually closes when the PR merges instead of sitting open for a human to close by hand.

**Offer options on lines that carry weight, not just a single rewrite.** For a sentence doing real
interpretive work — the summary's hook, a body's framing sentence, anything Ali is likely to have a
personal reaction to — draft two or three genuine alternatives and let her pick, rather than
committing to one and waiting to be corrected. It's cheaper for her to react to three short options
than to describe in prose what's off about a single line, and it's how the dead-booty pass
([#92](https://github.com/ali-wallick/Portfolio/issues/92)) actually landed its best sentences — including the fix for the "thesis-colon aphorism" tell
in `write-copy`. Not every line needs this: captions, plumbing, and anything low-stakes are fine as
a single pass.

**Budget for more than one round.** Prodigal's PR went through three rounds of changes after the
first audit-driven draft — dropping a credit that didn't hold up, a full reframe around a fact only
Ali had, then a further trim once the reframe made two earlier paragraphs read as clutter. None of
that was the audit or the old page failing; it's what "branch → push → look at it → react" in
`CLAUDE.md`'s review loop actually produces once there's a real page to react to. Keep the PR
description current as the page moves — a comment noting what changed and why is fine mid-flight,
but rewrite the description itself before the PR is done, so it reflects where the page landed and
not just where it started.

**Rebase onto `main` before finishing, especially with several content-pass branches active at
once.** It-will-kill-you's branch picked up `align-items: end` (from #96/#148) partway through
review after a rebase, which is what surfaced the caption/bottom-alignment interaction above — a
stale branch would have merged without ever exercising that CSS. Content-pass PRs land in quick
succession and several touch shared CSS (`.gallery`, `.media`), not just their own content file, so
a branch opened even a day earlier can be missing a fix a sibling pass already shipped.

**If the branch contains a revert of something later merged separately, diff against `origin/main`
after rebasing — don't trust a clean rebase alone.** Secret Garden's branch (#154, #98) picked up an
unrelated tooling change mid-pass, so it was reverted locally and re-landed as its own PR (#155),
which merged first. Rebasing #154 onto the now-updated `main` replayed the _revert_ commit for
real: git's rebase recognizes an add-commit as already-upstream by patch-id and skips it
automatically, but a revert commit's patch has no upstream match (the upstream version merged
through a different, separately-authored commit), so it replayed as a genuine deletion of content
`main` had just gained from the sibling PR. `git diff origin/main -- <files>` after the rebase
showed it plainly — files being _removed_, not left alone. Fix: `git rebase --onto
<commit-before-the-revert> <revert-commit>` to drop the now-redundant revert, then re-diff to
confirm the file list matches what the branch is actually supposed to touch.

## 8. File what you found sideways

A per-page pass keeps surfacing cross-page problems. **Comment on the affected page's own
content-pass issue rather than opening a new one** — every page has one, listed on #31. Open a new
issue only for something no existing issue covers (tooling, build, a sitewide mechanism).

Issue numbers, for reference: #89 art-of-rescue, #90 cor-ex-machina, #91 critter-3, #92 dead-booty,
#93 it-will-kill-you, #94 kinoclue, #95 mini-mages, #96 night-light, #97 prodigal, #98 secret-garden,
#99 tilting-at-windmills, #100 /contact, #101 /projects, #104 /404, #129 homepage, #136 marvel-snap,
#137 vegas-blvd-slots, #138 i-fits-i-sits, #139 firefall, #140 kaneva, #141 /about. `/resume` and
`/resume/full` are #32.

**And correct `CLAUDE.md` when the pass disproves something in it.** It's the file every session
reads first, which makes a false line there more expensive than anywhere else. #97 found that its
claim about em dashes being eliminated was wrong by four instances.

## 9. Before merging, pass the skills themselves

A page-level pass is also a data point on `content-pass` and `write-copy` — every conversation is a
live test of whether the guidance in them actually holds up against a real page and Ali's real
reactions. Before the PR merges, look back over what happened: a tell that slipped through every
mechanical check until Ali caught it on read, a line of guidance that turned out too rigid (or was
missing entirely), a working pattern worth naming so the next pass starts with it instead of
reinventing it. If a future pass would hit the same thing blind, write it into the skill that governs
it now rather than leaving it to be rediscovered.

This is exactly how #92 produced three things: `write-copy`'s "thesis-colon aphorism" tell (a
construction that passed every existing check and still read as generated), `content-pass`'s "offer
options on lines that carry weight" preference, and the lean toward third person over "you" in
gameplay descriptions. None of them were anticipated going in — they came from reading back over the
pass once the content itself was settled.

#96 (Night Light) produced a second round of these, this time from several rounds of Ali reacting to
the live preview across one PR rather than a single pre-merge draft: checking what the old page
itself calls the thing before defaulting to "game" (§3), the summary/body split for the concept
sentence being negotiable rather than fixed (§4), archive bodies not being capped at one paragraph
(§4), and the descriptive-only archive caption convention being a default to reach for, not a rule to
defend against a direct request (§5).

#93 (It Will Kill You) added one more, this time mechanical rather than a wording judgment call:
the gallery caption/bottom-alignment interaction (§5), caught only because a post-merge rebase pulled
in a sibling pass's CSS change mid-review, not because anything in the pass itself was looking for
it. It also surfaced a real front-matter question — whether a multi-hat, non-job-title `role` should
be a short comma-separated tag list (`Designer, Artist`) rather than a sentence — which turned out to
already be `add-project`'s territory, not this skill's; see that skill's `role` guidance and
[#152](https://github.com/ali-wallick/Portfolio/issues/152).

#99 (Tilting at Windmills) produced three more, all from Ali's review of the merged-looking PR
rather than anything the mechanical checks caught: the `content/archive/` blog-as-source gap and the
verify-every-link gap (both §3, above), and a new `write-copy` positive move. The draft's closing
line — "My first multiplayer jam prototype that actually worked" — passed every mechanical check
(no em dash, in-range sentence length, no banned vocabulary) and still read to Ali as a flex. Her own
description of why: "like in the past I made things that didn't work?" — the "first X that actually
worked" construction implies a string of past failures nothing in the piece supports, and it isn't a
comparison to anyone else, it's an unsourced claim about her own track record. Her fix request was
concrete: state the obstacle, then let a short exclamation carry the payoff ("But we pulled it
off!"), the same shape as her own blog's "It ended up being quite tough […] but we pulled through
with a great little prototype." That's now `write-copy`'s positive move §4.12 — the "first X that
actually worked" phrasing is the tell; the fix is earning the win with the specific difficulty
instead.

#137 (Vegas Blvd Slots) produced the Wayback in-browser verification finding above (§3) — the biggest
single miss so far, since it shipped a genuinely broken link and only got caught because Ali asked a
follow-up question rather than anything in the pass itself flagging it. It also surfaced a smaller,
narrower method: asked to bring one page's register in line with named sibling pages, `grep` the rest
of the site for the flagged phrase before rewriting it. "Cut my teeth," "entirely myself," and "went
in... came out..." were all confirmed unique to this one page across every other project and job
file before being reworded — the check is what separates "this phrase is casual" (true of plenty of
words on the site and not a problem) from "this phrase is an outlier nowhere else uses" (the actual
signal a register mismatch exists). Not added as a new `write-copy` tell, since none of the three are
AI-tell material — a sentence-initial "But" in particular is called out as a positive move
elsewhere in that skill (§3) and reworking one here was a local choice for this page, not a rule.

**Not every pass will find something, and that's a fine outcome.** Don't manufacture a finding to
fill the step. A page that needed no back-and-forth on wording is a page that confirmed the skills
already cover it.

## 10. Sweep previously-updated content for what step 9 just found

The skills only improve going forward. A page that content-pass or write-copy already touched can
still be carrying a pattern that didn't have a name yet when it was written — #92's own summary
shipped a thesis-colon aphorism that every mechanical check waved through. When step 9 produces a
new tell or preference, spend a few minutes checking whether it already shipped somewhere else.

- **Mechanical patterns** (em dashes, a caption repeating its body) — the audit script's `--all`
  sweep or a targeted grep gets there fast.
- **Phrasing patterns that aren't mechanically detectable** (the thesis-colon aphorism, second-person
  gameplay descriptions) — spot-check pages a content-pass has already run on, since those are the
  ones written under a version of the skill that didn't know about the pattern yet. The issue list in
  step 8 is the roster; sitewide passes like #31/#134 count too.

**Suggest, don't fix.** This step produces candidates for other pages' own content-pass issues (step
8's mechanism), not new edits bundled into the current PR. A finding on another page is that page's
pass, with its own branch and its own PR, per the one-page-one-PR rule this skill opened with.

**#93's sweep for the caption/bottom-alignment interaction found it already live on two merged pages,
and a fuller sweep on 2026-08-24 found it on four more.** Every project's `gallery` array with 2+ items
was checked at desktop width via rendered `getBoundingClientRect()`, not by eyeballing captions or
counting characters. The first pass (Dead Booty, Night Light) assumed caption line-wrap was the whole
cause; checking the rest of the archive tier (art-of-rescue, critter-3, mini-mages, it-will-kill-you,
plus secret-garden and prodigal as controls) found the same misalignment on pages with matching caption
line counts too — critter-3's two captions are both 2 lines and its images still sat 17px apart, and
art-of-rescue's images were 110px apart. That ruled out "shorten the caption" as a real fix; the actual
cause and the fix (`align-items: start` in `.gallery`) are under §5 above. Nothing needed re-editing on
any of the six pages — this shipped as one CSS change instead of six separate caption edits.

**When a finding from step 9 turns out to be a `content/archive/` blog-matching gap, sweep the blog
against every already-passed page, not just the one that surfaced it.** #99 established "grep
`content/archive/` for a matching post whenever a project has a plausible publication-year match" (§3),
but that check was never run backward against the pages passed before #99 — only applied going
forward. A 2026-08-24 sweep ran it against the other ten archive pages and found two real hits
immediately: cor-ex-machina's own GGJ 2013 recap post has the team scrapping most of the game and
restarting around a steampunk look with 18 hours left (missing from #90's page, the same
struggle-then-pulled-it-off shape #99 itself established), and critter-3's GGJ 2011 post names the
game's two difficulty modes (also missing, now added) and the actual team name, "Team Pandas is
Stupid" (Ali's call to leave out — cute, not load-bearing). Same failure shape as the caption sweep
above: a check learned mid-pass doesn't retroactively apply to pages that shipped before it existed, so
it has to be swept on purpose.

## Open findings this skill has not resolved

Recorded here rather than lost, because they're judgment calls for Ali and they recur:

- **Link `label` fields use `Title — Source` as a citation format** (`Kaneva — Virtual Worlds
Museum`, `"Welcome Ali!" — Second Dinner`). Rendered as visible copy, so the audit flags them.
  They read as a deliberate convention rather than prose, like the `<title>` template. **Not
  changed. Ask before treating one as a finding.**
- **Archive cards on `/projects` don't render `summary` at all** — only featured cards do. So an
  archive page's summary is seen on the detail page and in the meta description, and nowhere else.
  Worth knowing when judging how hard a summary has to work.

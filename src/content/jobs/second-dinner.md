---
company: Second Dinner
companyUrl: https://www.seconddinner.com
location: Irvine, CA
# Year only, deliberately. No source gives the start month, and the resume
# prints the job span as "2019 – Present" where a month would add nothing. The
# promotion date below is month-precise because there it changes what's printed.
start: '2019'
roles:
  # Current title confirmed at marvelsnap.com/credits; the promotion date is
  # Ali's own, supplied 2026-08-17.
  #
  # Recorded as `2021-12` rather than a bare year on purpose. She noted that if
  # forced to pick a single year she'd say 2022, since a December promotion sits
  # a fortnight from the year boundary and "2021" would undersell the time spent
  # at the senior title. Month precision makes the rounding question disappear.
  #
  # Updated 2026-08-26 (#32): the resume no longer prints this. It used to
  # render "· Previously Software Engineer II (2019 – Dec 2021)"; Ali's call is
  # that the current title alone is what the page needs, so `roles[]` is now
  # recorded-not-shown there, the same as `honors` on the education entry.
  # **The progression and its month still have a reader** — docs/LINKEDIN.md
  # prints both, and LinkedIn models multiple positions under one company
  # natively. Don't delete either on the theory that nothing consumes them.
  - title: Software Engineer II
    start: '2019'
  - title: Senior Software Engineer I
    start: '2021-12'
# Restructured 2026-08-26 (#32), Ali's call. Second Dinner is two bodies of
# work under one employer, and Phase 4 rendered it as one undifferentiated run
# of seven bullets -- the reader had to infer from the word "Godot" in bullet
# six that the last two weren't also about Marvel Snap.
#
# Three tiers now: `intro` for what belongs to the company, then a group per
# body of work, newest first. The old "Marvel Snap" bullet is gone rather than
# reworded: its first sentence was always a company fact riding on a game
# bullet (it is `intro` now), and its second said "spent five years on Marvel
# Snap", which is what the group heading and its dates say without a sentence.
#
# Written in Phase 4 from the Phase 3 Marvel Snap write-up and the systems
# account in CLAUDE.md -- NOT the 2019 bullet below, which predates everything
# that matters here and describes the game as unannounced.
#
# The Godot bullets are sourced directly from Ali on issue #37, 2026-08-23 --
# the CLAUDE.md Phase 3 ceiling applies to them exactly as it does to the rest
# of this era: craft, not product. No title, platform, genre, feature, or
# monetization detail.
#
# **The heading names the platform, and the subtitle names the engine.** Both
# are public. This was the other way round until 2026-08-26: the W4 Games
# announcement of August 2024 is silent about platform, and CLAUDE.md's Phase 3
# gate read that silence as "mobile" being wrong, so the heading said Godot and
# nothing else. Ali's own statement settles it -- "we have been public that it's
# a mobile game" -- and CLAUDE.md is corrected to match. Nothing else the gate
# fenced off moved: no title, no genre, no features, no monetization.
# Reworked 2026-08-26 (#32). The old version -- "before the studio had shipped
# a title" -- dated the arrival and stopped there. Ali wanted the company-level
# line to carry her part in building the company, not only her seniority in it.
#
# "Interviewing", not "hiring": she interviews, and "hiring" would claim a
# decision authority the source does not support. The dropped clause is not
# really lost -- "eleventh employee" carries early-stage on its own, and the
# Marvel Snap subtitle directly below says "from prototype through production".
#
# **The 100 figure is Ali's, supplied 2026-08-26, and is sourced nowhere else in
# this repo.** Written as a floor ("past 100") rather than a snapshot, so it
# cannot go stale as the studio keeps growing.
intro: >-
  Joined as the eleventh employee, interviewing and helping shape the culture as the studio grew
  past 100.
bulletGroups:
  godot:
    label: Unreleased Mobile Game
    dates: 2024 – Present
    # Carries the 2024 date onto the one-pager, where the group's own `dates`
    # do not render. "A new team", not "the studio's next team" -- CLAUDE.md's
    # #129 correction: Marvel Snap's team is still active and Second Dinner has
    # several projects underway, so "next" implies a succession that did not
    # happen. "The studio's first game in Godot" is the narrower claim that is
    # true, checked with Ali directly.
    intro: >-
      Joined a new team in 2024 to build the studio's first game in Godot.
  snap:
    label: Marvel Snap
    dates: 2019 – 2024
    # The arc is the fact none of the bullets below could carry: each of them
    # names a system, and "was on this title for its whole life" is a property
    # of the span. Ali's call (#32).
    #
    # Fits one printed line at 701px with five characters to spare. That is
    # thin -- a longer verb or a serial comma more and it wraps to two. Measure
    # before editing it.
    intro: >-
      Client then feature engineer, from prototype through production, the mobile and PC releases,
      and live operations.
highlights:
  - group: godot
    label: UI Framework
    # "For the studio's first game on the engine" moved up into the group
    # intro, where it is a fact about the project rather than about the
    # framework. One copy, and this bullet drops to one printed line.
    text: >-
      Built the game's UI framework. Other engineers develop reusable interface code against it.
  # Split from one three-line "Developer tooling" bullet on Ali's call (#32).
  # The two halves were doing different jobs under one label, and the first
  # half named a GitHub Action that is still in progress -- pitched a level up
  # now, deliberately, until it is done.
  - group: godot
    label: Client Engineering
    text: >-
      Built client testing workflows and Godot editor tooling for the team. Reported and fixed
      engine bugs with partners at W4 Games.
    extended: >-
      Also delivered engine version updates and native mobile plugin integration on the project.
  - group: godot
    label: Agentic Workflows
    # "Contributed to", not "authored" -- the commands and skills are the team's
    # and she is one of the people writing them, which "authored the team's"
    # implied she was not. Ali's call (#32).
    #
    # The second clause is deliberately broad. It stood for the in-progress
    # GitHub Action that turns a Jira or Sentry issue into a reproduction case,
    # and the CI work belongs here too; naming one of them undersold the other.
    # The label already says "agentic", so the text does not repeat it.
    #
    # One printed line with ten characters to spare.
    text: >-
      Contributed to the team's agentic commands and skills, and built automation into CI.
  - group: snap
    label: Architecture
    # "Drove" softened on Ali's call (#32) -- the migration was collaborative,
    # and CLAUDE.md's own 2026-08-26 correction (#136) says the seniority claim
    # rests on the tooling and its adoption rather than on leading a push. Same
    # framing the Marvel Snap project page settled on. "Built tooling", not
    # "built the tooling" -- the definite article implied she built all of it.
    text: >-
      Built tooling that made an MVVM architecture practical to adopt on a live product,
      alongside the PC client launch. Helped teammates migrate their working patterns onto it.
  - group: snap
    label: PC Launch
    # The Early Access / full-release staging came out entirely on Ali's call
    # (#32). It was three printed lines to tell a story the resume does not
    # need; the project page still carries it in full, with both dates.
    text: >-
      Shipped the PC client, reworking much of the mobile UI for landscape and mouse-and-keyboard
      play.
  # Promoted from `highlightsExtended` to the one-pager 2026-08-26 (#32), Ali's
  # call. The group intro says "client then feature engineer" and the one-pager
  # then showed four bullets of architecture, platform, and pipeline work --
  # nothing a player touches. This is the bullet the subtitle was promising.
  # Text unchanged by the promotion; it renders on both densities now, which is
  # what the superset invariant means (a bullet moves up, it is not rewritten).
  - group: snap
    label: Feature Engineering
    text: >-
      Built meta gameplay systems spanning client and server code, the interfaces for them, card
      and deck cosmetics, and the deckbuilding UI.
  # Promoted out of Feature engineering's `extended` on Ali's call, 2026-08-26
  # (#32), and it is the one bullet here that is not work Ali was assigned or
  # handed ownership of. Card art shipped with no attribution, players had been
  # asking since launch, and she argued for the feature and built it. Initiative
  # plus a player-facing ship plus outside coverage is a combination no other
  # bullet on this resume carries, which is what bought it a one-pager line.
  #
  # The date and the press stay on the two-pager, where they cost nothing.
  - group: snap
    label: Card Credits
    # Five characters of headroom on one printed line, measured. "Proposed and
    # shipped" over "Proposed and built" for two of them, and because the
    # clipped passive that follows is the register the rest of the page is in.
    # The initiative verb is the load-bearing word and does not come out.
    text: >-
      Proposed and shipped in-game artist attribution for card art, requested by players since
      launch.
    extended: >-
      Covered by gaming press, GamesRadar among them, at its January 2023 release.
  # Sourced directly from Ali, 2026-08-26 (#32), and represented nowhere on the
  # site before this -- not on the resume and not on the Marvel Snap page. It is
  # also the through-line to the Godot era's "Client engineering" bullet
  # above, which names editor tooling on the current project: the same
  # competency, eight years apart, which is worth a reader seeing twice.
  - group: snap
    label: Tooling
    # "Including", not a list of two -- Ali built more tooling than the two
    # named here and the first draft read as an inventory. The two are examples
    # chosen to span the range (authoring-side and in-client), not the whole of
    # it.
    #
    # "The artists' card art tool" rather than "the card art tool": it is the
    # Unity Editor tool artists authored card art through, and naming the
    # discipline is the signal worth having -- tooling built for people who are
    # not engineers. Costs nothing; the bullet still fits one printed line, with
    # seven characters to spare. Measure before editing it.
    text: >-
      Built Unity Editor and in-game tooling, including the artists' card art tool and the
      developer console.
  - group: snap
    label: Localization
    text: >-
      Owned the feature end to end in 15 languages, including Unity's Localization package, the
      import and export pipeline, font handling, and the team's UI text workflow.
    # Two-pager only, and free. "Font handling" above is three words standing in
    # for a project of its own -- the four items here are from the Marvel Snap
    # page's own list and reached no version of the resume before now.
    extended: >-
      Extended font support with CJK fallback to OS typefaces and correct rendering for Thai's
      stacked diacritics. Kept only shipped glyphs resident, loading player-typed text
      dynamically.
  - group: snap
    label: Live-Ops Content
    text: >-
      Built the Braze integration that allowed live-ops and marketing to publish the main-screen
      carousel, news page, and modal pop-ups without an app update.
highlightsExtended:
  - group: snap
    label: Client Engineering
    text: >-
      Delivered push notifications, deep linking, the first pass of localization, and live-ops
      tooling integration in the Unity client.
  # Two-pager only, and its own bullet rather than a continuation of PC launch
  # -- Ali's call, 2026-08-26, and she is right about why: both awards are for
  # best *mobile* game, so hanging them off the bullet about the PC client
  # would attach them to the one release they are not about.
  #
  # Not in the group's `intro` either, which was the other candidate. That
  # field renders on BOTH densities (see content.config.ts), and it sits at
  # four characters of headroom, so it would have cost a one-pager line for a
  # credential Ali would rather not lead with.
  #
  # The subject is named rather than dropped, against the resume's usual
  # verb-first register. That is the point: the award belongs to the game, and
  # a subjectless "Won Best Mobile Game" would read as a personal one.
  - group: snap
    label: Awards
    text: >-
      Marvel Snap won Best Mobile Game at The Game Awards in 2022, and Mobile Game of the Year at
      the DICE Awards in 2023.
# The exclamation is deliberate and is the site's second one in visible prose
# (see `write-copy`'s settled note on dosage). Ali's call, 2026-08-26: the
# homepage wanted a warmth beat, and the current work is the thing worth being
# glad about. Read by both the homepage and About, so it lands on both.
currentNote: >-
  Since 2024, I've been on a new team at Second Dinner, building the studio's
  first game in Godot!
---

## Source material (2019 resume, verbatim — not current copy)

- _Client Engineering_: Developing systems within Unity for an unannounced mobile Marvel game.

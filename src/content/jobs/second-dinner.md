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
  # at the senior title. Month precision makes the rounding question disappear —
  # `datePart` accepts `YYYY-MM` and `formatDatePart` renders it "Dec 2021", so
  # the exact truth is also the least ambiguous thing to print.
  - title: Software Engineer II
    start: '2019'
  - title: Senior Software Engineer I
    start: '2021-12'
# Written in Phase 4. Source is the Phase 3 Marvel Snap write-up and the systems
# account in CLAUDE.md — NOT the 2019 bullet below, which predates everything
# that matters here and describes the game as unannounced.
#
# The final two `highlights` bullets and the third `highlightsExtended` bullet
# (2024–present, the Godot team) are sourced directly from Ali on issue #37,
# 2026-08-23 — the CLAUDE.md Phase 3 ceiling applies to them exactly as it
# does to the rest of this era: craft, not product. No title, platform,
# genre, feature, or monetization detail.
highlights:
  - >-
    Joined as the studio's 11th employee, before it had shipped anything. Five
    years on Marvel Snap, which launched in October 2022, then its next team from
    2024, on the studio's first game in Godot.
  - >-
    Drove a migration to MVVM architecture on a live product. Built the
    supporting tooling and brought teammates onto the new working patterns,
    alongside the push to ship the PC client.
  - >-
    Shipped Snap on PC in two stages. Stage one was a direct mobile port for Steam
    Early Access at the October 2022 launch. Stage two reworked much of the UI to
    be landscape- and mouse-and-keyboard-native for the Early Access exit in
    August 2023.
  - >-
    Owned localization end to end: Unity's Localization package, the
    import/export pipeline, font handling, and the workflow the team localized UI
    text through.
  - >-
    Built the Braze integration that let live-ops and marketing ship content
    without an app update: main-screen carousel, news page, and modal pop-ups.
  - >-
    On the studio's next team, built a UI framework for other engineers to build
    reusable UI on top of, keeping the team moving quickly in Godot.
  - >-
    Built a GitHub Action that turns a Jira or Sentry issue into an automated
    repro. It hands the ticket to a model harness (Cursor cloud agents) and
    outputs screenshots plus a command script that reproduces the bug in the
    game. Part of adopting Cursor as a multi-model harness for the team, and
    authoring its agentic commands and skills.
highlightsExtended:
  - >-
    Early client engineering in Unity: push notifications, deep linking, the
    first pass of localization, and integrating live-ops tooling into the client.
  - >-
    Later feature engineering: meta gameplay systems spanning client and server
    code plus the UI for them, card and deck cosmetics, and the deckbuilding UI.
  - >-
    General client and platform work on the studio's Godot project: engine
    updates, reporting and fixing engine bugs with partners at W4 Games,
    integrating native mobile plugins, and standing up unit testing.
summary: >-
  Joined as the studio's 11th employee and spent five years on Marvel Snap,
  which shipped in October 2022. Moved to Second Dinner's next team in 2024,
  building the studio's first game in Godot.
currentNote: >-
  Since 2024, I've been on Second Dinner's next team, building the studio's
  first game in Godot.
---

## Source material (2019 resume, verbatim — not current copy)

- _Client Engineering_: Developing systems within Unity for an unannounced mobile Marvel game.

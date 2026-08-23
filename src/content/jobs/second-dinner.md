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
highlights:
  - >-
    Joined as the studio's 11th employee, before it had shipped anything. Five
    years on Marvel Snap, which launched in October 2022, then its next team from
    2024 — the studio's first game in Godot.
  - >-
    Championed and helped lead a migration to MVVM architecture on a live
    product, alongside the push to ship the PC client.
  - >-
    Shipped Snap on PC in two stages: a direct mobile port for Steam Early Access
    at the October 2022 launch, then reworked much of the UI to be landscape- and
    mouse-and-keyboard-native for the Early Access exit in August 2023.
  - >-
    Owned localization end to end — Unity's Localization package, the
    import/export pipeline, font handling, and the workflow the team localized UI
    text through.
  - >-
    Built the Braze integration that let live-ops and marketing ship content
    without an app update: main-screen carousel, news page, and modal pop-ups.
highlightsExtended:
  - >-
    Early client engineering in Unity: push notifications, deep linking, the
    first pass of localization, and integrating live-ops tooling into the client.
  - >-
    Later feature engineering: meta gameplay systems spanning client and server
    code plus the UI for them, card and deck cosmetics, and the deckbuilding UI.
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

---
title: Marvel Snap
tier: featured
featureOrder: 1
startYear: 2019
# Ali's involvement, not the product's lifespan — Snap is still live, she moved to
# Second Dinner's Godot project in 2024.
endYear: 2024
status: shipped
engine: [Unity]
tech: [C#]
platforms: [iOS, Android, PC]
job: second-dinner
role: Client Engineer, then Feature Engineer
# Card/tile thumbnail override — the official app icon, not the video poster
# frame `projectThumb()` would otherwise fall back to (which has a burned-in
# "OFFICIAL ANNOUNCE" / "© 2022 MARVEL" bug). See #64.
thumb: ../../assets/images/projects/marvel-snap/thumb-logo.jpg
# Wide (homepage) thumbnail — official key art (character roster + wordmark),
# sourced by Ali from MobyGames. Chosen over an in-game screenshot (a card
# reveal moment, tried first) because it reads more clearly at the rendered
# thumbnail size — that legibility test, not the source type, is what
# actually decided it. See #64.
thumbWide: ../../assets/images/projects/marvel-snap/thumb-wide.jpg
hero:
  type: youtube
  id: 61zjv1HcJDI
  title: MARVEL SNAP — Official Announcement & Gameplay First Look
  # Cued to Ali's segment. This is the whole reason `start` exists in the schema.
  start: 256
links:
  - label: Credited on the official Marvel Snap site
    url: https://marvelsnap.com/credits/
    kind: press
  - label: '"Welcome Ali!" — Second Dinner'
    url: https://www.youtube.com/watch?v=ntORfECH56s
    kind: video
  - label: Hellfire Gala Developer Update, December 2023
    url: https://www.youtube.com/watch?v=MHqai3bwCoE
    kind: video
  # Community appearances, a different register from the three first-party
  # videos above. Kept on the "err toward more" call from the gate — now that
  # the whole site is readable, they still read as a fun, honest complement
  # to the systems write-up rather than a mismatch.
  - label: The Weekly Snap Show, Episode 01
    url: https://www.youtube.com/watch?v=Rw1FWK1yhDk
    kind: video
  - label: MARVEL SNAP Pictionary!
    url: https://www.youtube.com/watch?v=ALvP-EyOkBo
    kind: video
summary: Five years on Marvel Snap's client and server systems, from an early client engineer to leading its MVVM migration and PC launch.
draft: false
---

I joined Second Dinner in 2019, its 11th employee, before the studio had shipped anything.
Marvel Snap took about three years to reach launch, and I spent that time — and the years after —
helping build both the game and the studio around it. If you've played Snap, you know the game; this
is about the systems underneath it.

## What I built

Early on I was a client engineer, doing core Unity work: push notifications, deep linking, and the
first pass of localization, alongside integrating live-ops tooling like Braze into the client. Later
I moved into feature engineering — meta gameplay systems spanning client and server code plus the UI
for them, card and deck cosmetics, and the deckbuilding UI. Four things from that span stand out.

**Championing a migration to MVVM.** Alongside the push to get the PC client out the door, I argued
for and helped lead a migration to an MVVM architecture — the kind of work that's easy to defer on a
live product and correspondingly valuable to actually do.

**The PC launch, in two stages.** Snap's Steam Early Access launched globally on 18 October 2022 as a
direct port of the mobile client — the fastest path to getting Snap on PC, and a reasonable one for a
first release. The more interesting work came when we exited Early Access on 22 August 2023,
announced at Gamescom: that meant going back through a large chunk of the UI to make it genuinely
landscape- and mouse-and-keyboard-native rather than a mobile layout stretched onto a monitor.

**Owning localization end to end.** I integrated Unity's Localization package and owned the process
around it — the import/export pipeline, font handling, and the workflow the rest of the team used to
get UI text localized.

**Enabling live-ops and marketing through Braze.** I built the client-side integration that let
live-ops and marketing put content in front of players without an app update: the main-screen
carousel, the news page, and modal pop-ups.

## What's still missing

This is a first pass at five years of work, and I know it's incomplete — there's more here I haven't
gotten to yet, particularly from the earlier client-engineering years. I'll keep filling this in.

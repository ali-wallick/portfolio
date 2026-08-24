---
title: Vegas Blvd Slots
tier: featured
featureOrder: 2
startYear: 2017
endYear: 2019
status: shipped
engine: [Unity]
tech: [C#, DeltaDNA]
platforms: [iOS, Android]
job: mobilityware
role: Software Engineer II
# Card/tile thumbnail override — the app icon, not the video poster frame.
# Sourced via an APKPure mirror since the listing is delisted from both
# stores (see the dead store links below). See #64.
thumb: ../../assets/images/projects/vegas-blvd-slots/thumb-logo.png
# Wide (homepage) thumbnail — a "BIG WIN" store-listing screenshot Ali
# sourced, replacing the video poster frame (a trailer still, less crisp
# than a real gameplay capture). See #64.
thumbWide: ../../assets/images/projects/vegas-blvd-slots/thumb-wide.jpg
hero:
  type: youtube
  id: 8gtbz_T4-yY
  title: Vegas Blvd Slots trailer
summary: Live-ops and slot-machine engineering on a mobile casino game with 50+ machines.
links:
  # Checked 2026-08-16: both store listings now 404. The game appears to have
  # been delisted since 2019. Kept as dead credits rather than dropped.
  - label: Download for iOS
    url: https://itunes.apple.com/us/app/vegas-blvd-slots-casino-game/id894091264?mt=8
    kind: store
    dead: true
  - label: Download for Android
    url: https://play.google.com/store/apps/details?id=com.mobilityware.Slots&hl=en_US
    kind: store
    dead: true
draft: false
---

Vegas Blvd Slots was a mobile slots game built in Unity. By the time I moved on it carried over 50
machines, plus daily and weekly rewards, social gifting, leagues, and multiplayer tournaments. I
worked on it for most of my three years at MobilityWare. Before that I cut my teeth porting the
previous slots title, Hot Streak Slots, from native iOS to Unity. I also built blackjack, video
poker, and keno entirely myself for an early, unreleased casino app.

## What I built

Most of my time was client-side: engineering support for new machines, and the features and bonus
games that went with each one. But the more interesting work was underneath the machines. I
architected the live-ops systems that let the game change without a client update. That was a
server-controllable store, plus a DeltaDNA integration driving in-app messaging, promo carousels,
and eventing. All of it had customizable text, so marketing could run campaigns without engineering
in the loop. I also led a few cross-cutting projects that don't fit neatly into "features". GDPR
support was one, and keeping the game current through several major Unity version upgrades was
another.

## What I learned

I went in knowing nothing about slot machines. I came out with real respect for how much depth is
packed into what looks, from the outside, like a very simple loop. There's a whole discipline to how
a machine's features and bonus games are put together. Building the live-ops systems that let the
team iterate on that was some of the most satisfying work I did there.

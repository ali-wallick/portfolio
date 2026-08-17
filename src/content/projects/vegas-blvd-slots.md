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
# TODO(phase-3-revisit): first stab from the 2019 resume's job title. The resume
# bullets describe live-ops architecture work (server-customizable store, DeltaDNA
# integration, promo carousels) that a bare title undersells — Ali to react.
role: Software Engineer II
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
# Draft until the role TODO(phase-3-revisit) above is resolved — pre-launch-check
# doesn't let Phase 3 close with a deferred-decision marker on a published page.
draft: true
---

Vegas Blvd Slots is a mobile slots game built in Unity — over 50 machines by the time I moved on,
with daily and weekly rewards, social gifting, leagues, and multiplayer tournaments layered on top
of the core spinning. I worked on it for most of my three years at MobilityWare, after cutting my
teeth porting the previous slots title, Hot Streak Slots, from native iOS to Unity, and building out
an early, unreleased casino app with blackjack, video poker, and keno.

## What I built

Most of my time was client-side: engineering support for new machines, and the features and bonus
games that went with each one. But the more interesting work was underneath the machines. I
architected the live-ops systems that let the game change without a client update — a
server-controllable store, and a DeltaDNA integration that drove in-app messaging, promo carousels,
and eventing, all with customizable text so marketing could run campaigns without engineering in the
loop. I also led a handful of cross-cutting projects that don't fit neatly into "features" —
GDPR support, in particular, and keeping the game current through several major Unity version
upgrades.

## What I learned

I went in knowing nothing about slot machines and came out with genuine respect for how much depth
is packed into what looks, from the outside, like a very simple loop. There's a whole discipline to
how a machine's features and bonus games are put together, and building the live-ops systems that
let the team iterate on that without shipping a new client turned out to be some of the most
satisfying work I did there.

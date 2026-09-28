---
title: Vegas Blvd Slots
tier: featured
featureOrder: 3
startYear: 2017
endYear: 2019
status: shipped
engine: [Unity]
tech: [C#, DeltaDNA]
platforms: [iOS, Android]
job: mobilityware
role: [Software Engineer II]
# Card/tile thumbnail override — the app icon, not the video poster frame.
# Sourced via an APKPure mirror since the listing is delisted from both
# stores (see the Wayback link below). See #64.
thumb: ../../assets/images/projects/vegas-blvd-slots/thumb-logo.png
# Wide (homepage) thumbnail — a "BIG WIN" store-listing screenshot Ali
# sourced, replacing the video poster frame (a trailer still, less crisp
# than a real gameplay capture). See #64.
thumbWide: ../../assets/images/projects/vegas-blvd-slots/thumb-wide.jpg
hero:
  type: youtube
  id: 8gtbz_T4-yY
  title: Vegas Blvd Slots trailer
  # The store-listing screenshot `thumbWide` uses (#273). It is 405px wide
  # against a hero box around double that, so it upscales — the game is
  # delisted from both stores and nothing larger survives outside the trailer
  # itself, which is MobilityWare’s to license. Softness in a placeholder is
  # the cheaper of those two costs.
  poster:
    src: ../../assets/images/projects/vegas-blvd-slots/thumb-wide.jpg
    alt: >-
      A Vegas Blvd Slots machine mid-payout, its reels filled with matching
      symbols under a BIG WIN banner
summary: Live-ops and slot-machine engineering on a mobile casino game with 50+ machines.
links:
  # Checked 2026-08-16: both store listings 404 (delisted since 2019). Checked
  # 2026-08-26 for Wayback fixes, same pattern as kaneva.com/firefall.com. The
  # App Store snapshot looked good in raw HTML but actually hangs on a
  # "Connecting to Apple Music..." interstitial in a real browser — App
  # Store pages of that era redirect through the iTunes app-open flow, which
  # never resolves in archived replay. mobilityware.com’s own product page
  # (Dec 2019, during Ali’s tenure) renders for real: nav, logo, hero
  # banner, and copy, verified in-browser. No snapshot exists anywhere for
  # the Android listing’s URL, so it’s dropped rather than kept as a dead
  # link — a broken "Download for Android" offers nothing once the game
  # shipped on iOS too.
  - label: Vegas Blvd Slots on MobilityWare.com (via Wayback Machine)
    url: https://web.archive.org/web/20191206082849/https://www.mobilityware.com/vegas-blvd-slots
    kind: site
draft: false
---

Vegas Blvd Slots was a mobile slots game built in Unity. By the time I moved on, it carried over 50
machines. I worked on it for most of my three years at MobilityWare. Before that, I ported the previous slots
title, Hot Streak Slots, from native iOS to Unity. I also built blackjack, video poker, and keno for
an early, unreleased casino app. That team later merged into Vegas Blvd Slots, which shipped as
slots only.

## What I Built

Most of my time was client-side: engineering support for new machines, and the features and bonus
games that went with each one. I also worked on the meta systems around them, including daily and
weekly rewards, social gifting, leagues, and multiplayer tournaments. I architected the live-ops systems that let the game change without a client
update. That was a server-controllable store, plus a DeltaDNA integration driving in-app messaging,
promo carousels, and eventing. All of it had customizable text, so marketing could run campaigns
without engineering in the loop. I also led a few cross-cutting projects that don’t fit neatly into
"features." GDPR support was one, and keeping the game current through several major Unity version
upgrades was another.

## What I Learned

I had no background in slot machines starting out. I came away with real respect for how much depth
is packed into what looks, from the outside, like a simple loop. There’s a whole discipline to how a
machine’s features and bonus games are put together. Building the live-ops systems that let
the team iterate on that was some of the most satisfying work I did there.

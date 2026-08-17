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
# TODO(phase-3-revisit): first stab, written at the gate for Ali to react to in
# context rather than in the abstract. Her official title is Senior Software
# Engineer I (per the credits page); this field is the *work*, which changed
# discipline partway through. Overwrite freely.
role: Client Engineer, then Feature Engineer
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
  # TODO(phase-3-revisit): the two below are community appearances rather than
  # first-party ones — fun, and Ali representing the studio, but a different
  # register from the rest of the page. Included deliberately on the "err toward
  # more, trim later" call made at the gate. Revisit once the site can be read
  # end to end.
  - label: The Weekly Snap Show, Episode 01
    url: https://www.youtube.com/watch?v=Rw1FWK1yhDk
    kind: video
  - label: MARVEL SNAP Pictionary!
    url: https://www.youtube.com/watch?v=ALvP-EyOkBo
    kind: video
summary: Five years on Marvel Snap's client and server systems, from an early client engineer to leading its MVVM migration and PC launch.
draft: true
---

<!-- TODO(phase-3-revisit): draft write-up per the gate's framing. Ali flagged
     this systems list as provisional — five years on one title is a lot to
     recall in one sitting — so this stays draft: true until she's reviewed and
     extended it. Do not flip draft: false without her sign-off. -->

I joined Second Dinner in 2019, roughly its 11th employee, before the studio had shipped anything.
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

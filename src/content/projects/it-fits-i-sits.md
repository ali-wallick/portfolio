---
title: It Fits I Sits
tier: featured
featureOrder: 3
# Game Jam V, March 2018 — the award certificate is dated 03/23/18. One week, not
# a two-year project: the old `endYear: 2019` conflated Ali's jam entry with a
# release she had no hand in.
startYear: 2018
# `jam`, not `shipped`. Ali built the week-long prototype; other teams shipped it.
# The exact distinction the status enum exists to make.
status: jam
engine: [Unity]
# Deliberately empty. The Facebook Instant Games and iOS/Android releases were
# other teams' work — listing their platforms here would claim Ali shipped on
# them. The prose carries the release story instead.
platforms: []
job: mobilityware
role: Pitch, prototype, and level editor # TODO(phase-3-revisit): Ali to react
summary: Pitched and prototyped a mobile puzzle game about cats fitting in boxes at a company game jam, won People's Choice, and built the level editor that made the demo possible.
links:
  - label: 'Puzzle Cats — the game it eventually became'
    url: https://www.mobilityware.com/puzzle-cats/
    kind: store
draft: true
---

<!-- TODO(phase-3-media): the one hard blocker in Phase 3. No high-quality
     prototype captures exist. Plan agreed at the gate: use full-game media for
     the hero, with the lower-quality prototype shots inside the page where the
     contrast between "week-one jam build" and "shipped product" is the point
     rather than an embarrassment. Ali is sourcing both; she'll share them here.
     Page stays draft: true until the hero lands. -->

MobilityWare runs a week-long game jam every year: pitch on Friday, then build with a team for a
week. I'd jammed there before, but Game Jam V in March 2018 was the first time I pitched. Robert and
I had been watching our cats fold themselves into boxes and thought a tangram-style puzzle game about
it would be funny — and it was.

## What I built

My focus for the week was the level editor. I was convinced early on that having real tooling to
build levels fast would matter more than any individual level, so I built a system that exported to
JSON and let the team put together 61 levels in time for pitch day. It worked well enough that the
level designers were able to get the intro levels to teach the mechanics on their own — no separate
tutorial needed.

The pitch worked: the team won the studio's People's Choice Award, and the game was picked up for
full development. From there I stayed on Vegas Blvd Slots while other teams took it forward — first
to Facebook Instant Games, where I was kept in the loop and watched it peak at 188K daily active
users, and later to iOS and Android as
[Puzzle Cats](https://www.mobilityware.com/puzzle-cats/), which is still live. I didn't work on
either shipped release, but the core mechanic in both is close to what our week-one prototype played
like.

## What I learned

This is still one of my proudest game-dev moments, not because of what I personally shipped — I
didn't ship it — but because the pitch held up. A one-week prototype outliving my involvement by
years and still being a real, live game is a good reminder that the idea and the tooling you build to
prove it out can matter more than who's in the room for the launch.

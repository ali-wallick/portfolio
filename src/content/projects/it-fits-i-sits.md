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
role: Pitch, prototype, and level editor
# Ali co-pitched with Robert Spessard, per her own 2019 blog post ("Robert and I
# thought it would be hilarious", "pitched alongside Rob") and confirmed by her
# 2026-08-24. Same person as the `collaborators` entry on it-will-kill-you,
# mini-mages and secret-garden, so the URL matches theirs.
#
# NOTE: this is deliberately NOT the whole jam team. The blog post says "a really
# great team formed" and credits "our level designers" without naming anyone, and
# no source records the size or the other members. See #142 — the rendered "Team"
# section reads as a complete list, which it isn't.
collaborators:
  - name: Robert Spessard
    url: https://robertspessard.com
summary: Pitched and prototyped a mobile puzzle game about cats fitting in boxes at a company game jam, won People's Choice, and built the level editor that made the demo possible.
# Card/tile thumbnail override — a square crop of the same Puzzle Cats key
# art centered on its wordmark, rather than the wide banner `hero` uses.
# See #64.
thumb: ../../assets/images/projects/it-fits-i-sits/thumb-square.webp
# Wide (homepage) thumbnail — a tighter 16:9 crop of the same key art than
# the full `hero` banner falls back to by default: zoomed in enough that the
# wordmark reads clearly at thumbnail size. See #64.
thumbWide: ../../assets/images/projects/it-fits-i-sits/thumb-wide.webp
hero:
  type: image
  src: ../../assets/images/projects/it-fits-i-sits/puzzle-cats-banner.webp
  alt: >-
    Key art for Puzzle Cats, the shipped mobile game that grew out of Ali's
    jam prototype — she pitched and prototyped the concept but did not work
    on this release
# Phone/monitor photos and a couple of screen-recording stills from the jam
# itself — genuinely low quality, and that's the point (#46): the gap between
# a week-one jam build and a shipped product is what these are illustrating,
# not a weakness to hide. Nowhere else on the site gets this pass.
gallery:
  - type: image
    src: ../../assets/images/projects/it-fits-i-sits/gallery-paper-prototype.webp
    alt: >-
      Paper cutouts of a cat, cut apart into tangram-style pieces on blue
      construction paper, laid out on a desk
    caption: Where it started. Paper cutouts, before there was a game to open.
  - type: image
    src: ../../assets/images/projects/it-fits-i-sits/gallery-level-editor.webp
    alt: >-
      The custom level editor running in the Unity Editor, showing one
      level's puzzle grid laid out in a "Current Level" window
    caption: The level editor I built for the jam. Every level came out of this window.
  - type: image
    src: ../../assets/images/projects/it-fits-i-sits/gallery-level2-play.webp
    alt: >-
      The prototype's Level 2 screen: an empty puzzle grid shaped like a
      boot, with two cat pieces waiting to be placed
    caption: Level 2 on the jam build. Pick a cat, fit it in the shape.
  - type: image
    src: ../../assets/images/projects/it-fits-i-sits/gallery-level43.webp
    alt: >-
      The prototype's Level 43 screen, a more complex puzzle grid with five
      cat pieces and four identical bonus cats to place
    caption: Level 43, one of the 61 levels the editor let us build in a week.
  - type: image
    src: ../../assets/images/projects/it-fits-i-sits/gallery-award.webp
    alt: >-
      The People's Choice Award certificate from MobilityWare's Game Jam V,
      dated March 23, 2018
    caption: What pitch day got us, and the reason the game kept going after the jam ended.
links:
  - label: 'Puzzle Cats, the game it eventually became'
    url: https://www.mobilityware.com/puzzle-cats/
    kind: store
draft: false
---

MobilityWare runs a week-long game jam every year: pitch on Friday, then build with a team for a
week. I'd jammed there before, but Game Jam V in March 2018 was the first time I pitched. Robert and
I had been watching our cats fold themselves into boxes. We thought a tangram-style puzzle game
about it would be funny, and it was.

## What I built

My focus for the week was the level editor. I was convinced early on that real tooling would matter
more than any individual level. So I built a system that exported to JSON and let the team put
together 61 levels in time for pitch day. It worked well enough that the level designers got the
intro levels to teach the mechanics on their own. No separate tutorial needed.

The pitch worked. The team won the studio's People's Choice Award, and the game was picked up for
full development. From there I stayed on Vegas Blvd Slots while other teams took it forward. It went
first to Facebook Instant Games, where I was kept in the loop and watched it peak at 188K daily
active users. Later it came to iOS and Android as
[Puzzle Cats](https://www.mobilityware.com/puzzle-cats/), which is still live. I didn't work on
either shipped release. The core mechanic in both is close to what our week-one prototype played
like.

## What I learned

This is still one of my proudest game-dev moments, and not because of anything I shipped. I didn't
ship it. It's because the pitch held up. A one-week prototype outlived my involvement by years and
is still a real, live game. The idea, and the tooling you build to prove it out, can matter more
than who's in the room at launch.

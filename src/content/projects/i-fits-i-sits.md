---
# Ali pitched and prototyped this under its original name. MobilityWare
# renamed it "It Fits I Sits" for the Facebook Instant Games release because
# the original name was already taken there, then rebranded it again as
# "Puzzle Cats" for the iOS/Android release. This page is about the pitch and
# the prototype, so it uses the name she actually built under. Sourced
# directly from Ali, 2026-08-25 — see #138.
title: I Fits I Sits
tier: featured
featureOrder: 3
# Game Jam V, March 2018 — the award certificate is dated 03/23/18. One week, not
# a two-year project: the old `endYear: 2019` conflated Ali’s jam entry with a
# release she had no hand in.
startYear: 2018
# `jam`, not `shipped`. Ali built the week-long prototype; other teams shipped it.
# The exact distinction the status enum exists to make.
status: jam
engine: [Unity]
# Deliberately empty. The Facebook Instant Games and iOS/Android releases were
# other teams’ work — listing their platforms here would claim Ali shipped on
# them. The prose carries the release story instead.
platforms: []
job: mobilityware
role: [Designer, Programmer]
# Ali co-pitched with Robert Spessard, per her own 2019 blog post ("Robert and I
# thought it would be hilarious", "pitched alongside Rob") and confirmed by her
# 2026-08-24. Same person as the `collaborators` entry on it-will-kill-you,
# mini-mages and secret-garden, so the URL matches theirs.
#
# NOTE: this is deliberately NOT the whole jam team. The blog post says "a really
# great team formed" and credits "our level designers" without naming anyone, and
# no source records the size or the other members. See #142 — the rendered "Team"
# section reads as a complete list, which it isn’t.
collaborators:
  - name: Robert Spessard
    url: https://robertspessard.com
summary: >-
  Pitched and prototyped a puzzle game at a company game jam, winning People’s Choice, then
  other teams developed it into a popular mobile game.
# Card/tile thumbnail override — a square crop of the same Puzzle Cats key
# art centered on its wordmark, rather than the wide banner `hero` uses.
# See #64.
thumb: ../../assets/images/projects/i-fits-i-sits/thumb-square.webp
# Wide (homepage) thumbnail — a tighter 16:9 crop of the same key art than
# the full `hero` banner falls back to by default: zoomed in enough that the
# wordmark reads clearly at thumbnail size. See #64.
thumbWide: ../../assets/images/projects/i-fits-i-sits/thumb-wide.webp
hero:
  type: image
  src: ../../assets/images/projects/i-fits-i-sits/puzzle-cats-banner.webp
  alt: >-
    Key art for Puzzle Cats, the shipped mobile game that grew out of Ali’s
    jam prototype — she pitched and prototyped the concept but did not work
    on this release
# Phone/monitor photos and a couple of screen-recording stills from the jam
# itself — genuinely low quality, and that’s the point (#46): the gap between
# a week-one jam build and a shipped product is what these are illustrating,
# not a weakness to hide. Nowhere else on the site gets this pass.
gallery:
  - type: image
    src: ../../assets/images/projects/i-fits-i-sits/gallery-paper-prototype.webp
    alt: >-
      Paper cutouts of a cat, cut apart into tangram-style pieces on blue
      construction paper, laid out on a desk
    caption: The paper prototype.
  - type: image
    src: ../../assets/images/projects/i-fits-i-sits/gallery-level-editor.webp
    alt: >-
      The custom level editor running in the Unity Editor, showing one
      level’s puzzle grid laid out in a "Current Level" window
    caption: The level editor I built for the jam.
  - type: image
    src: ../../assets/images/projects/i-fits-i-sits/gallery-level2-play.webp
    alt: >-
      The prototype’s Level 2 screen: an empty puzzle grid shaped like a
      boot, with two cat pieces waiting to be placed
    caption: Level 2, one of the jam’s simpler layouts.
  - type: image
    src: ../../assets/images/projects/i-fits-i-sits/gallery-level43.webp
    alt: >-
      The prototype’s Level 43 screen, a more complex puzzle grid with five
      cat pieces and four identical bonus cats to place
    caption: Level 43, one of 61 levels built for pitch day.
  - type: image
    src: ../../assets/images/projects/i-fits-i-sits/gallery-award.webp
    alt: >-
      The People’s Choice Award certificate from MobilityWare’s Game Jam V,
      dated March 23, 2018
    caption: The award for winning People’s Choice.
links:
  - label: Puzzle Cats
    url: https://www.mobilityware.com/puzzle-cats/
    kind: store
draft: false
---

MobilityWare runs a week-long game jam every year: pitch on Friday, then build with a team for a
week. I had jammed there before, but Game Jam V in March 2018 was the first time I pitched. Robert
and I pitched a tangram-style puzzle game about cats fitting into boxes, inspired by watching our
own cats do exactly that. We called it I Fits I Sits.

## What I Built

My focus for the week was the level editor. I believed early on that tooling would matter more than
any individual level, so I built a system that exported to JSON and let the team assemble 61 levels
in time for pitch day. It worked well enough that the level designers built the intro levels to teach
the game’s mechanics with no separate tutorial.

The team won the studio’s People’s Choice Award, and the game was picked up for full development. I
stayed on Vegas Blvd Slots while other teams took it forward. It shipped first on Facebook Instant
Games as It Fits I Sits, renamed since our original name was already taken there. I stayed in the
loop and saw it peak at 188K daily active users. It later moved to iOS and Android under another new
name, [Puzzle Cats](https://www.mobilityware.com/puzzle-cats/), a better fit for marketing than a cat
pun, and is still live, downloaded more than a million times with a 4.7-star rating. I did not work
on either shipped release. The core mechanic in both stayed close to our week-one prototype.

## What I Learned

The level editor turned out to be the most durable thing I built that week. It came from something
I had already noticed at other jams: teams that got into trouble were usually the ones trying to
build too much. Robert and I scoped down to the smallest MVP we could pitch, then I built the level
editor before anything else. That let the level designers work in parallel with the rest of the
team, instead of waiting on engineering for every level. It also let us design a real difficulty
curve into the levels, from a trivial first one up to genuinely hard ones, instead of a bolted-on
tutorial. I think that finished, polished feel, more than the pitch itself, is what won us the
studio vote that week.

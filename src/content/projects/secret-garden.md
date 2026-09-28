---
title: Secret Garden
tier: archive
startYear: 2011
status: prototype
engine: [Unity]
tech: [Qualcomm AR SDK]
platforms: [Android]
event: Georgia Tech, Qualcomm AR Game Studio
collaborators:
  - name: Rose Peng
  - name: Robert Spessard
role: [Programmer]
summary: >-
  A handheld augmented-reality maze game for Qualcomm’s AR Game Studio at
  Georgia Tech. Players place markers on a printed maze to redirect a girl
  past traps and enemies.
# Card/tile thumbnail override, and the one place dropping the `poster.jpg`
# glob would otherwise have changed a rendered page (#273). The hero `poster`
# below is the gallery screenshot, which is 221px and reads soft in a tile,
# while the video's own frame is 640x480. Its letterbox bars are exactly why
# it is not the poster: a tile crops them, a hero would not.
#
# `thumbWide` rather than `thumb` because the archive tiles on /projects ask
# for the wide aspect — the square slot is the featured cards, which this
# entry is not in.
thumbWide: ../../assets/images/projects/secret-garden/poster.jpg
hero:
  type: youtube
  id: OHjZMJ68UjI
  title: Secret Garden gameplay
  # The gallery’s own screenshot rather than a frame from the video (#273):
  # this video’s best YouTube still is a 640x480 `sddefault` with the
  # letterbox bars baked in, which is worse in a matted frame than an upscale
  # is. Duplicated in the gallery below, and accepted for the same reason.
  poster:
    src: ../../assets/images/projects/secret-garden/screenshot.png
    alt: >-
      A hand holding an Android phone over the printed maze, its screen
      showing the AR view of leafy hedges layered on top
gallery:
  - type: image
    src: ../../assets/images/projects/secret-garden/screenshot.png
    alt: >-
      A hand holding an Android phone over the printed maze, its screen
      showing the AR view of leafy hedges layered on top
    caption: Viewing the maze through the phone’s AR camera.
  - type: image
    src: ../../assets/images/projects/secret-garden/design.png
    alt: >-
      A top-down photo of Secret Garden’s printed hedge maze, its paths made
      from a leaf-and-flower texture
    caption: The printed maze the game’s camera tracked.
links:
  - label: Qualcomm AR Game Studio writeup (via Wayback Machine)
    url: https://web.archive.org/web/20120221135847/http://www.argamestudio.org/2011/05/13/secret-garden/
    kind: press
draft: false
---

A bamboo marker, for example, blocks a path and turns the girl aside. Each maze also hides three
loaves of bread, worth collecting to raise a level’s ranking.

I built the grid and node system the maze ran on, the girl’s automatic movement, and the
integration with Qualcomm’s AR plugin. I also wired in artwork from Rose, our artist. The team
designed the core mechanic and its enemies and plants together, and I designed the one level in
the finished game. More levels were planned but never built.

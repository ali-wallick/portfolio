---
title: Kaneva
tier: featured
featureOrder: 5
startYear: 2011
endYear: 2015
status: shipped
engine: [Kaneva proprietary engine]
tech: [Lua]
platforms: [PC]
job: kaneva
role: Software Engineer
# Square card/tile thumbnail (on /projects) — the Kaneva cube icon, cropped
# from the full lockup Ali provided and padded to a square canvas. Icon only,
# no wordmark: the full lockup's text reads too small in the shared square
# frame (the wordmark is proportionally wider than Firefall's badge was), and
# the card title already carries the name. Padded onto a fixed light plate
# (--color-surface, light mode) rather than left transparent — the logo's
# wordmark is near-black and was unreadable against the dark theme's card
# background. `-v2`: renamed, not just re-saved — Astro's dev image endpoint
# caches by URL for a year, so overwriting the same filename left Safari
# showing the pre-fix version indefinitely. See #64.
thumb: ../../assets/images/projects/kaneva/thumb-logo-v2.png
# Wide card thumbnail (on the homepage) — the full lockup this time, cropped
# tight and padded to 16:9, same fixed light plate as `thumb` above. Ali's
# call: the best available, given there's no real capture from her time
# there.
thumbWide: ../../assets/images/projects/kaneva/thumb-logo-wide-v2.png
hero:
  type: image
  src: ../../assets/images/projects/kaneva/screenshot1.png
  alt: Kaneva's virtual-world events menu and object panel
summary: Grew from technical support into leading UI programming on a social virtual-world platform, building many of the game's menus.
links:
  - label: kaneva.com
    url: http://www.kaneva.com/
    kind: site
    dead: true
  - label: 'Kaneva — Virtual Worlds Museum'
    url: https://www.virtualworlds.museum/exhibits/kaneva
    kind: press
draft: false
---

The World of Kaneva was a social virtual world and game platform: avatars, user-generated content,
and full worlds built with integrated scripting. It was my first job out of college. Four years
there took me from technical support to leading UI programming for the whole game.

## What I built

I started as a Technical Support Engineer, helping players with their scripting. I also built game
templates (Treasure Hunt and Adventure among them) that let players assemble small games of their
own by dropping items and defining levels. I liked UI work more than support, so I moved to it full
time. By the end of four years I was Lead UI Programmer. I worked on many of the game's menus end to
end in the studio's in-house Lua menu system. That ran from design collaboration, through laying
them out off the artists' comps, to programming the functionality.

That list ended up being long. The player and build/creator HUDs, inventory and bank menus, the
travel menu for browsing user-created worlds, and the events menu for finding and joining player-run
events. Also a visual property editor for scripted objects, menus for swapping video and Flash
content on in-game objects, context menus for right-clicking people and objects, and the welcome and
builder tutorials. I worked closely with the engine and web teams whenever a menu touched either.

## What I learned

The project I'm proudest of from this job isn't on that list, because it isn't a menu. It's a menu
**animation** system I built after getting fed up with hand-coding every transition. It ended up
being adopted by both the UI and game teams. That taught me something that's stuck. The most
valuable thing I build is sometimes not the feature, but the tool that makes the next ten features
cheaper.

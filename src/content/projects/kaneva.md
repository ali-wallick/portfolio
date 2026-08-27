---
title: Kaneva
tier: featured
featureOrder: 5
startYear: 2011
endYear: 2015
status: shipped
engine: [Kaneva Engine]
tech: [Lua]
platforms: [PC]
job: kaneva
role: Software Engineer
# Square card/tile thumbnail (on /projects) — the Kaneva cube icon, cropped
# from the full lockup Ali provided and padded to a square canvas. Icon only,
# no wordmark: the full lockup’s text reads too small in the shared square
# frame (the wordmark is proportionally wider than Firefall’s badge was), and
# the card title already carries the name. Padded onto a fixed light plate
# (--color-surface, light mode) rather than left transparent — the logo’s
# wordmark is near-black and was unreadable against the dark theme’s card
# background. `-v2`: renamed, not just re-saved — Astro’s dev image endpoint
# caches by URL for a year, so overwriting the same filename left Safari
# showing the pre-fix version indefinitely. See #64.
thumb: ../../assets/images/projects/kaneva/thumb-logo-v2.png
# Wide card thumbnail (on the homepage) — the full lockup this time, cropped
# tight and padded to 16:9, same fixed light plate as `thumb` above. Ali’s
# call: the best available, given there’s no real capture from her time
# there.
thumbWide: ../../assets/images/projects/kaneva/thumb-logo-wide-v2.png
hero:
  type: image
  src: ../../assets/images/projects/kaneva/screenshot1.png
  alt: Kaneva’s virtual-world events menu and object panel
# Confirmed unused by #140’s audit sweep (audit-page.mjs false-negatives on
# generic filenames shared across projects). Both are real UI Ali built and
# describes in prose, not decorative — the property editor and the
# inventory/building menu.
gallery:
  - type: image
    src: ../../assets/images/projects/kaneva/screenshot2.png
    alt: >-
      The property editor for a scripted teleporter object, showing its
      editable fields next to a preview of the object
    caption: The property editor for scripted objects.
  - type: image
    src: ../../assets/images/projects/kaneva/screenshot3.png
    alt: >-
      The Building tab of the inventory menu, showing a grid of placeable
      objects like wall panels, stairs, and furniture
    caption: The inventory menu’s Building tab.
summary: Grew from technical support into leading UI programming on a social virtual-world platform, building many of the game’s menus.
links:
  # kaneva.com itself is a dead domain now (parked/squatted). Swapped for a
  # Wayback Machine snapshot from June 2013, during Ali’s time there, so the
  # link shows the actual product instead of a 404 or a parking page. `dead`
  # dropped since the archived URL resolves — same pattern as secret-garden’s
  # argamestudio.org fix (#98).
  - label: kaneva.com (via Wayback Machine)
    url: https://web.archive.org/web/20130604063555/http://www.kaneva.com/
    kind: site
  - label: 'Kaneva — Virtual Worlds Museum'
    url: https://www.virtualworlds.museum/exhibits/kaneva
    kind: press
draft: false
---

The World of Kaneva was a social virtual world and game platform: avatars, user-generated content,
and full worlds built with integrated scripting. It was my first job out of college, and over four
years there I moved from technical support into leading UI programming for the entire game.

## What I Built

I began as a Technical Support Engineer, helping players with their scripting. I also built game
templates (Treasure Hunt and Adventure among them) that let players assemble small games of their
own by dropping items and defining levels.

I later moved into UI work full time, where I built many of the game’s menus end to end in the
studio’s in-house Lua menu system, from design collaboration through layout and implementation. I
worked closely with the engine and web teams whenever a menu touched either.

- **HUD:** Player and build/creator HUD menus.
- **Inventory:** Player inventory and storage/bank menus.
- **Travel:** Browsing user-created worlds.
- **Events:** Finding and joining player-run events.
- **Smart objects:** A visual property editor for scripted objects.
- **Media select:** Swapping video and Flash content on in-game objects.
- **Context menus:** Right-click info and actions for people and objects.
- **Tutorials:** Welcome and builder walkthroughs.

In 2014, I led a full overhaul of the HUD, from the code design document through to release.

I also built a menu animation system after growing frustrated with hand-coding each transition
individually. It was later adopted by both the UI and game teams.

## What I Learned

Kaneva is where I discovered a love for UI programming that I have carried forward ever since.
Beyond that, much of what I took from the job concerned working in a professional environment more
broadly. That included coordinating with a full team, working within established source control,
supporting real customers, and using project-tracking tools such as Jira.

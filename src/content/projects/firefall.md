---
title: Firefall
tier: featured
featureOrder: 4
startYear: 2015
endYear: 2016
status: shipped
engine: [Red 5 proprietary engine]
tech: [Lua, XML, C++]
platforms: [PC]
job: red-5-studios
role: UI Programmer
# Card/tile thumbnail override — the official wordmark, padded to a square
# canvas so it isn't cropped by the shared 1:1 thumbnail frame. See #64.
thumb: ../../assets/images/projects/firefall/thumb-logo.png
# Wide (homepage) thumbnail — the game's own in-engine title screen, sourced
# by Ali from MobyGames. Replaced an MMORPG.com press screenshot (mech vs.
# sky) that was the best available before this turned up. `-v2`: renamed
# after a crop tweak, not just re-saved — see the note on Kaneva's `thumb`
# for why. See #64.
thumbWide: ../../assets/images/projects/firefall/thumb-wide-v2.jpg
hero:
  type: youtube
  id: 2cxeAhxSoyo
  title: Firefall trailer
summary: UI programming on a PC MMO shooter, across its Chinese launch and a worldwide relaunch overhaul.
links:
  - label: firefall.com
    url: http://www.firefall.com/
    kind: site
    dead: true
draft: false
---

Firefall was Red 5 Studios' massively multiplayer shooter, part shooter and part RPG. It ran on the
studio's own C++ engine, with a Lua/XML scripting layer on top for UI. I joined as a UI programmer
for its Chinese launch and the worldwide relaunch overhaul that followed. It was my first time on a
team and a codebase this much bigger than Kaneva's.

## What I built

I worked across most of the game's HUD and menus: the radar, PvP elements, character progression and
elite-level screens, and reward screens. A good chunk of that was less about any one screen than the
layer underneath. I built libraries for common menu and HUD elements so new UI didn't start from
scratch. I also optimized the UI system itself, which mattered on a game already asking a lot of the
client.

## What I learned

The real education was working at the boundary between the Lua/XML scripting layer and the core
engine. That's a different problem from owning a UI system end to end, the way I had at Kaneva. It's
where I learned to think about UI performance as a systems problem rather than a screen-by-screen
one. Firefall shut down in 2017. The credit is worth keeping even though the game isn't playable
anymore.

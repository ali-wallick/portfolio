---
title: Firefall
tier: featured
featureOrder: 4
startYear: 2015
endYear: 2016
status: shipped
engine: [Firefall Engine]
tech: [Lua, XML, C++]
platforms: [PC]
job: red-5-studios
role: UI Programmer
# Card/tile thumbnail override — the official wordmark, padded to a square
# canvas so it isn’t cropped by the shared 1:1 thumbnail frame. See #64.
thumb: ../../assets/images/projects/firefall/thumb-logo.png
# Wide (homepage) thumbnail — the game’s own in-engine title screen, sourced
# by Ali from MobyGames. Replaced an MMORPG.com press screenshot (mech vs.
# sky) that was the best available before this turned up. `-v2`: renamed
# after a crop tweak, not just re-saved — see the note on Kaneva’s `thumb`
# for why. See #64.
thumbWide: ../../assets/images/projects/firefall/thumb-wide-v2.jpg
hero:
  type: youtube
  id: 2cxeAhxSoyo
  title: Firefall trailer
summary: UI programming on a PC MMO shooter, across its Chinese launch and a worldwide relaunch overhaul.
links:
  - label: firefall.com (via Wayback Machine)
    url: https://web.archive.org/web/20151106072209/http://www.firefall.com/
    kind: site
draft: false
---

Firefall was Red 5 Studios’ massively multiplayer shooter, part shooter and part RPG. It ran on the
studio’s own C++ engine, with a Lua/XML scripting layer on top for UI. I joined as a UI programmer
for its Chinese launch and the worldwide relaunch overhaul that followed. It was my first time on a
team and a codebase far larger than Kaneva’s.

## What I Built

I worked across most of the game’s HUD and menus: the radar, PvP elements, character progression and
elite-level screens, and reward screens. Much of that work was less about any one screen than the
layer underneath. I built libraries for common menu and HUD elements so new UI didn’t start from
scratch. I also optimized the UI system itself, which mattered on a game that was already demanding
on the client.

## What I Learned

Kaneva’s whole company was about 20 people. Firefall was the first time I worked on a UI team
instead of being the UI team. It had several engineers, designers, and artists on UI alone, plus full
teams for QA, audio, and more. I worked right at the boundary between the Lua/XML layer and the core
engine. That put me in the engine team’s code almost as often as my own.

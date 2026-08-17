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

Firefall was Red 5 Studios' massively multiplayer shooter — part shooter, part RPG, built on the
studio's own C++ engine with a Lua/XML scripting layer on top for UI. I joined as a UI programmer for
its Chinese launch and the worldwide relaunch overhaul that followed, my first time working on a team
and a codebase this much bigger than what I'd worked on at Kaneva.

## What I built

I worked across most of the game's HUD and menus: the radar, PvP elements, character progression and
elite-level screens, and reward screens. A good chunk of that work was less about any one screen and
more about the layer underneath them — building libraries for common menu and HUD elements so new UI
didn't mean starting from scratch, and optimizing the UI system itself, which mattered on a game
already asking a lot of the client.

## What I learned

Working at the boundary between the Lua/XML scripting layer and the core engine was the real
education here — it's a different kind of problem than owning a UI system end to end the way I had at
Kaneva, and it's where I learned to think about UI performance as a systems problem, not just a
screen-by-screen one. Firefall shut down in 2017; the credit is worth keeping even though the game
isn't playable anymore.

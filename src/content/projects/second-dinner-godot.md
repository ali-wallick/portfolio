---
title: Unreleased Mobile Game
tier: featured
featureOrder: 1
# The first entry to use `kind` (#49), and it takes the default. It IS a game;
# what is unusual about it is that it cannot be pictured, and `hero: art`
# below is the schema’s way of saying that honestly.
kind: game
startYear: 2024
# `unannounced` sat in the enum with its own colour pair and no user from
# Phase 5 until this entry. It is what the value was reserved for.
status: unannounced
engine: [Godot]
tech: [GDScript]
# “Mobile” is public — Ali’s own statement, 2026-08-26, recorded in CLAUDE.md
# under the Phase 3 gate. Not a platform list: iOS/Android would be a claim the
# public statement does not make.
platforms: [Mobile]
job: second-dinner
role: [Senior Software Engineer]
# The résumé group heading is `Unreleased Mobile Game` and its subtitle names
# Godot (src/content/jobs/second-dinner.md). This page uses the same name, so
# the résumé, the homepage card and this page agree about what to call a thing
# that has no public name.
summary: >-
  A new team at Second Dinner, building the studio’s first game in Godot.
# No picture of this project can exist on the site: the Phase 3 ceiling in
# CLAUDE.md fences off the product entirely, and a photo of the Godot team is
# ruled out there by name. `art` is the generated card at hero size — the
# page states up front that its lead image is a stand-in, which is the truth.
# See `heroSchema` in src/content.config.ts.
hero:
  type: art
links:
  # The one public source for the project’s existence, engine and ambition.
  # Same URL About’s “Currently” sentence links (src/pages/about.astro).
  - label: Second Dinner becomes a strategic investor in W4 Games
    url: https://www.w4games.com/blog/w4-games-news-1/second-dinner-studios-becomes-a-strategic-investor-in-w4-games-and-plans-to-build-the-largest-game-in-godot-yet-37
    kind: press
# A draft on purpose, and it may stay one for a long time (#60). Drafts render
# in `astro dev` and on branch previews and are excluded from production, so
# this page can grow at whatever pace the ceiling allows and go live only when
# Ali says it has enough on it. Flipping this to `false` is the whole launch.
draft: true
---

<!-- TODO(#60): This body is a scaffold built from the two Godot résumé bullets, which are the only
sourced detail on the 2024–present work. Everything here is within the Phase 3 ceiling (craft, not
product). Ali is the only source for more, and the ceiling still applies to whatever she adds: no
title, genre, features, monetization, or studio internals. -->

In 2024 I moved to a new team at Second Dinner to build the studio’s first game in Godot. Second
Dinner announced the engine choice itself, alongside becoming a strategic investor in W4 Games.
Beyond that the game is unannounced, so this page is about the engineering and not the product.

## What I’m Building

I built the game’s UI framework. Other engineers write their reusable interface code against it, so
the framework’s job is to make the right structure the easy one.

A lot of the rest is tooling. I built client testing workflows and Godot editor tooling for the
team. Working in a young engine on a large project means finding engine bugs, and I have reported
and fixed them with our partners at W4 Games. I have also delivered engine version updates and the
native mobile plugin integration.

The team writes agentic commands and skills for its own workflows, and I contribute to those. I
have built some of that automation into CI.

<!-- TODO(#60): Ali to add the parts only she can: what the framework’s shape actually is, what the
editor tooling does for a designer, and which of the CI automation is worth naming. -->

## What I’m Learning

<!-- TODO(#60): Ali to write. Candidate threads: coming to Godot from fifteen years of Unity, what
transfers and what does not; owning a UI framework from the start rather than migrating a live one
onto it, as on Marvel Snap; and building with agents inside a team, which is the same study this
website is (see /projects/aliwallick-com). -->

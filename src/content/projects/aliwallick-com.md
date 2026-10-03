---
title: aliwallick.com
# Archive, not featured, 2026-09-13 (Ali's call, reversing #358): Firefall
# reads better as a featured write-up. The body is untouched, the same rule
# #358 applied to Firefall. See docs/decisions/content.md.
tier: archive
# The first non-game entry in the collection (#49), and the reason `kind`
# exists: it has no engine, no platform in the game sense, no `job` and no
# `event`, and a `status` only because “shipped” happens to be true. The meta
# strip shows a “Website” chip for it, so a reader scanning /projects knows
# what it is before reading the summary.
kind: site
startYear: 2026
status: shipped
engine: []
tech: [Astro, TypeScript, Claude Code]
platforms: [Web]
# Ali’s call, 2026-09-09. The plain craft word, matching the register every
# other entry uses. What she actually did (directing agents, reviewing,
# deciding) is the body’s job to describe, not a role chip’s.
role: [Developer]
summary: >-
  This site, rebuilt in 2026 as a way to practice small-scale agentic workflows from scratch.
# The old homepage, captured from the live DreamHost site before the cutover
# (docs/before-after/, from #196). It leads the page rather than the new site
# because the new site is what you are looking at; the old one is the thing
# this project replaced, and it is the picture that carries the story.
hero:
  type: image
  src: ../../assets/images/projects/aliwallick-com/old-home-desktop.webp
  alt: >-
    The old aliwallick.com homepage in 2026, a peach and mint layout with a strip of project art,
    a welcome paragraph, and a Quick Info sidebar giving a headshot and a “Client Engineer” title
  caption: The old site as it stood in 2026, right before the cutover.
# Desktop captures only. The mobile ones are honest (the old site had no
# viewport meta, so they render zoomed out) but at 390 x 844 full-page they
# become slivers in a height-normalised gallery row. Three pairs, in the
# order a visitor meets them: home, About, Projects.
gallery:
  - type: image
    src: ../../assets/images/projects/aliwallick-com/new-home-desktop.webp
    alt: >-
      The new aliwallick.com homepage, a headshot beside the name, a “Currently” line, and a
      numbered list of featured work
    caption: The same page after the rebuild.
  - type: image
    src: ../../assets/images/projects/aliwallick-com/old-about-desktop.webp
    alt: >-
      The old About page, a long single column of text with a hiking photo and a Kerbal costume
      photo set into it
    caption: About, before.
  - type: image
    src: ../../assets/images/projects/aliwallick-com/new-about-desktop.webp
    alt: >-
      The new About page, a childhood photo of Ali holding up a PC game box beside the opening
      paragraph, and her Crypt of the NecroDancer cosplay beside “Off the Clock”
    caption: About, after.
  - type: image
    src: ../../assets/images/projects/aliwallick-com/old-projects-desktop.webp
    alt: >-
      The old Projects page, two Spotlight banners for Vegas Blvd Slots and Firefall above a
      list of projects by year that files Critter³ under 2013
    caption: Projects, before.
  - type: image
    src: ../../assets/images/projects/aliwallick-com/new-projects-desktop.webp
    alt: >-
      The new Projects page, five numbered featured cards led by Marvel Snap above a
      three-column grid of archive tiles
    caption: Projects, after.
# Published 2026-09-09, Ali's call, after the copy pass in #355. It was a draft
# on purpose until then: the page is the build-in-public write-up and its source
# material keeps growing, so it shipped when Ali said it was the page she wanted
# rather than when the scaffold was filled. The one marker left in the body is
# hers to fill in later, and #48 stays open for it.
# The repo link landed with the flip to public (2026-10-03, #378 step 7). Before
# that it would have 404’d, so the page and the repo went live pointing at each other.
links:
  - label: The repo on GitHub
    url: https://github.com/ali-wallick/portfolio
    kind: source
draft: false
---

The site is not the interesting part of this project. The old one was hand-written PHP from college
that had not been meaningfully updated since 2016. Replacing it was overdue. What I wanted from the
rebuild was to practice agentic workflows from scratch. At work the agents and skills are
established, built by a team I contribute to. Here there was no preexisting brief, no skills, no
guards, and one person to decide everything. So the tooling was over-built on purpose, and the site
was the excuse. The rebuild took twelve days.

## What I Built

The site itself is small. Five deep project write-ups, a compact archive for the rest, and a résumé
that renders to PDF in two densities from one source. It is Astro with a Markdown content model, and
the model is the first agentic decision in the project. Every fact lives in one file, and the old
site’s mistakes are unrepresentable rather than fixed. A YouTube embed is a bare video ID, a
published project fails the build without a summary and a hero, and a link can be marked dead while
its credit stays. An agent cannot get those wrong, and neither can I.

- **Brief:** A standing document every session reads before its first tool call, so it starts
  informed instead of re-deriving context from scrollback.
- **Gates:** A conversation before each phase, with the same five questions every time. Scope,
  verification, handoff, model, cost.
- **Log:** Kept as the work happened. This page is written from it.
- **Skills:** For adding a project, writing in my voice, running a design comparison, and cutting a
  release.
- **Guards:** A hook that refuses edits to the archived old site, and a build check for every rule I
  could express as one.
- **Review loop:** Push a branch, get a preview URL, look at it on my phone.

## What Went Wrong

- **The brief went stale:** It is a cache of what I knew when I wrote it. One phase gate checked it
  against primary sources and found five facts wrong, my own job title among them. Every gate since
  has started with that check.
- **The copy did not sound like me:** Sentences ran 32 words against my natural 17, with 91 em
  dashes to my zero. Describing my voice to an agent had not worked, so I measured it from my own
  writing instead and built the voice skill and its checker from the numbers.
- **Rules got skipped:** The brief hit 3,774 lines, read in full by every session, and a rule in
  prose is a rule someone forgets. The reasoning moved to a decision record, and every rule the
  build could enforce became a guard.
- **Design got argued instead of compared:** Separate branches produced opinions about different
  pages. Putting the options on one preview behind a switcher, flipped on a phone, settled each
  question in a round. After four runs it became a skill.
- **Two documents drifted apart:** The plan and the brief held the same decisions, and one went
  stale on the most sensitive fact in the project. The backlog moved to issues, and a decision is
  now written down exactly once.
- **Watching a PR cost more than the PR:** The harness re-checked a parked branch every hour,
  re-sending the whole conversation each time. A steward skill tells it that green and waiting on me
  is not work.

## What I Learned

Nineteen typefaces were measured before any of them went on a preview, and the color candidates were
computed rather than picked by eye. None of it settled until I saw it in context on a phone, which is
the whole reason I built the loop.

Write the side quest down and keep going. Every stray idea and bug became an issue with enough
context to pick it up cold, so the main work never stopped for it. That is why the site was accurate
before it was pretty, and launched before it was finished.

Each skill here started as something I had already done by hand two or three times, and each has
been edited since, as the way I work moved. One lost a step once it had been run on every page. A
skill describing how I used to work is worse than none, because the next session will follow it.

At work the tooling already exists, so nobody sees the mistake each piece was made to prevent.
Building it from nothing made that visible. Next I want skills for writing skills, for checking a
plan says what I meant before anything gets built, and for debriefing work after it ships. Building
the tooling was the part of this project I enjoyed most.

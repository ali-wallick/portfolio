---
title: aliwallick.com
tier: featured
featureOrder: 7
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
# TODO(#48): `role` is Ali’s to name. She is the only person on this project,
# but the honest word for what she did (directed, reviewed, decided, built with
# agents) is hers to pick, not an agent’s to guess. The page cannot publish
# without one, which is the completeness check doing its job.
summary: >-
  This site, rebuilt in 2026 from a hand-written PHP relic as a hands-on study of agentic
  workflows at small scale.
# The old homepage, captured from the live DreamHost site before the cutover
# (docs/before-after/, from #196). It leads the page rather than the new site
# because the new site is what you are looking at; the old one is the thing
# this project replaced, and it is the picture that carries the story.
hero:
  type: image
  src: ../../assets/images/projects/aliwallick-com/old-home-desktop.webp
  alt: >-
    The old aliwallick.com homepage in 2026, a peach and mint layout with a photo sidebar and a
    blank space where a YouTube embed no longer loads
  caption: The old site as it stood in 2026, right before the cutover.
# Desktop captures only. The mobile ones are honest (the old site had no
# viewport meta, so they render zoomed out) but at 390 x 844 full-page they
# become slivers in a height-normalised gallery row.
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
      The old About page, a long single column of text with a photo of a Kerbal costume
    caption: About, before.
  - type: image
    src: ../../assets/images/projects/aliwallick-com/new-about-desktop.webp
    alt: >-
      The new About page, with a childhood photo floated beside the origin paragraph
    caption: About, after.
# A draft on purpose (#48). The page is the build-in-public write-up, and its
# source material (docs/REBUILD-LOG.md, CLAUDE.md) keeps growing; it publishes
# when Ali says it is the page she wants, not when the scaffold is filled.
draft: true
---

<!-- TODO(#48): This body is a scaffold. The outline follows the issue’s own list of the strongest
material in docs/REBUILD-LOG.md; every claim below is drawn from the log or from CLAUDE.md, and the
sections are where Ali’s own account goes. The failures are the content: a page that only reports
wins is a marketing page. -->

This site is a project in its own right. The one it replaced was hand-written PHP from college. Its
content froze in April 2016 and it kept saying “Present” about a job I left in 2019. It never
mentioned Marvel Snap at all. The biggest credit on this site did not exist on the old one.

I rebuilt it in 2026 for two reasons. The first was to have a portfolio that was true. The second
was to use the rebuild as a hands-on study of agentic workflows at small scale, on a project where I
could afford to over-invest in tooling and process and see what that bought.

## What I Built

The site is Astro, with every project and job as a Markdown file and one schema that all of them
share. The resume, the About page and the project pages read the same collections, so a fact cannot
drift between them the way it did on the old site. The old site’s mistakes are unrepresentable here
rather than fixed. A YouTube embed is stored as a bare video ID, so there is no protocol to get
wrong. A published project fails the build without a summary, a role and a hero.

The résumé is generated from the same content, as a one-pager and a two-pager that is a strict
superset of it. A page-count check fails the build if either overflows.

Most of the work was not the site. It was the process around it: a standing brief every session
reads before doing anything, phase gates with a conversation at each one, a running log kept as the
work happened, and a set of skills that encode how to add a project or write in my voice. The
review loop was the thing that made visual work possible at all. Push a branch, get a preview URL,
look at it on my phone, react.

<!-- TODO(#48): Ali to add what the tooling actually cost, in money and in time, and which of the
process pieces she would keep for a day job. The log has the numbers. -->

## What I Learned

The brief and the plan are a cache, and caches go stale between phases. Checking primary sources at
each gate produced five factual corrections at one of them. Four would have shipped as confident,
wrong prose.

Building four palettes found three bugs that building one palette hid, all of which had passed CI.
A value that only works for the current inputs is not a decision.

The live switcher was the highest-leverage tool of the design phase. The only comparison that
matters is flipping between options on the same page. Separate branches produce opinions about
different pages.

Measure the output, not the source. A font-dependent unit looked perfect locally and scored 0.197
CLS in CI. A page-count check passed a résumé that was 64px over budget. Line length reasoned about
in `ch` was 38% longer in characters than anyone thought.

<!-- TODO(#48): Ali to write the parts that are hers: what surprised her about working this way,
what she would not do again, and what it changed about how she works at Second Dinner. -->

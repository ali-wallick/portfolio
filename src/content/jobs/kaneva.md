---
company: Kaneva, LLC
location: Atlanta, GA
start: '2011'
end: '2015'
roles:
  # Settled 2026-08-17: stays a SINGLE entry. Ali's call — the progression is
  # fifteen years old and she is comfortable with the flattening, and no date is
  # needed to keep one entry. Don't reopen this looking for a promotion year;
  # the year was only ever needed to *split* the entry.
  #
  # `Software Engineer` is sourced — it is how her own 2019 resume flattened the
  # Technical Support Engineer → Lead UI Programmer progression that about.php
  # describes. Settled 2026-08-23 (closes #38): `Software Engineer` everywhere,
  # including the Kaneva project page's `role` field, which used to say
  # `Lead UI Programmer` and disagreed with this entry.
  #
  # Additional context from Ali (2026-08-25, #140): she believes Kaneva
  # inflated that title as a retention play and doesn't consider it a real
  # SSE-equivalent role. Don't reintroduce "Lead UI Programmer" as a title
  # claim anywhere on the site on the theory that the flattening above was
  # just tidiness — it wasn't. The project page's prose no longer names it
  # either, for the same reason.
  - title: Software Engineer
    start: '2011'
# The progression itself lives in `roles[]`, not here — no bullet should
# duplicate what the title line already says.
#
# Trimmed to a single one-pager bullet 2026-08-23 (issue #37): Ali's rule is a
# 1-bullet floor per job on the one-pager (2 on the two-pager), weighted
# toward recency, so the oldest job on the resume carries the least space.
# See CLAUDE.md's Phase 4 weighting section for the general rule.
highlights:
  - label: UI Programming
    text: >-
      Built many of Kaneva's core menus end to end in the in-house Lua menu system. Architected
      the menu animation system that replaced hand-coded transitions, which both the UI and game
      teams adopted.
    # The menu list stays whole -- settled, and it is the only concrete evidence
    # of this job's scope -- but it has now been through two shapes in one day
    # (2026-08-26, two-page pass), so read both before moving it again. It was
    # split across `UI Programming` and an `Additional UI` bullet two positions
    # away, which met the reader twice under a label named for its place on the
    # page. Folding it into one bullet fixed the label and produced a six-line
    # wall, the heaviest bullet on either density.
    #
    # Split again, this time on a seam the Kaneva project page already uses:
    # menus everyone sees stay here, and the ones for players *building* the
    # world are `Creator Tools` below. Four lines plus two, so the same six as
    # the wall, with two subjects instead of one run-on. Nothing was cut.
    #
    # Two smaller things came out of the rewrite. "End to end" in `text` and
    # "from artists' comps through layout to functionality" here were the same
    # claim twice, so this keeps the artists' comps (a collaboration fact `text`
    # does not carry) and drops the re-explanation. And leading on `Took` avoids
    # `Worked ... Worked ...` opening two consecutive sentences.
    extended: >-
      Took the player and creator HUDs, inventory and bank, travel, events, context menus, and
      the welcome tutorial from artists' comps through to release. Worked with the engine and web
      teams whenever a menu touched either.
highlightsExtended:
  # The creator-facing half of the menu list, split out of `UI Programming`
  # above 2026-08-26 (two-page pass), Ali's call. Kaneva was a user-generated
  # virtual world, so "the menus for building the world" is a real body of work
  # and not a leftovers bucket -- which is what the old `Additional UI` label
  # was. It also puts the resume's strongest through-line at its earliest point:
  # the menu animation system, the I Fits I Sits level editor, Marvel Snap's
  # card art tool and developer console, and the Godot editor tooling are all
  # the same instinct, and nothing on the page said it started here.
  - label: Creator Tools
    text: >-
      Built a visual property editor for scripted objects, menus for swapping video and Flash
      content onto them, and the builder walkthrough.
  - label: Game Programming
    text: >-
      Helped design and script a Lua-based game development environment built on top of the
      virtual world.
  - label: Technical Support
    text: >-
      Joined Kaneva in support, helping players with their in-world scripting. Built game
      templates, Treasure Hunt and Adventure among them, which players used to assemble small
      games of their own.
---

## Source material (2019 resume, verbatim — not current copy)

- _UI Programming:_ Constructed and coded many of Kaneva's core menus. Architected and programmed the menu animation system.
- _Game Programming:_ Part of a team responsible for designing and scripting a Lua-based game development environment built on top of the virtual world.

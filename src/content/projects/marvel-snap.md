---
title: Marvel Snap
tier: featured
featureOrder: 1
startYear: 2019
# Ali’s involvement, not the product’s lifespan — Snap is still live, she moved to
# Second Dinner’s Godot project in 2024.
endYear: 2024
status: shipped
engine: [Unity]
tech: [C#]
platforms: [iOS, Android, PC]
job: second-dinner
role: [Senior Software Engineer]
# Card/tile thumbnail override — the official app icon, not the video poster
# frame `projectThumb()` would otherwise fall back to (which has a burned-in
# "OFFICIAL ANNOUNCE" / "© 2022 MARVEL" bug). See #64.
thumb: ../../assets/images/projects/marvel-snap/thumb-logo.jpg
# Wide (homepage) thumbnail — official key art (character roster + wordmark),
# sourced by Ali from MobyGames. Chosen over an in-game screenshot (a card
# reveal moment, tried first) because it reads more clearly at the rendered
# thumbnail size — that legibility test, not the source type, is what
# actually decided it. See #64.
thumbWide: ../../assets/images/projects/marvel-snap/thumb-wide.jpg
hero:
  type: youtube
  id: 61zjv1HcJDI
  title: MARVEL SNAP — Official Announcement & Gameplay First Look
  # Cued to Ali’s segment. This is the whole reason `start` exists in the schema.
  start: 256
# Two official screenshots from Marvel Snap’s Steam store page, picked by Ali
# as the two that best cover the systems described in this page’s "What I
# built": the collection/deckbuilding screen (search + filter) and the card
# detail screen (variants, cosmetics, artist credit). Plus a still Ali
# supplied from her own segment in the hero video, cued at `start: 256` above.
gallery:
  - type: image
    src: ../../assets/images/projects/marvel-snap/gallery-collection-screen.jpg
    alt: >-
      The collection screen, showing a deck-in-progress panel next to a
      searchable, filterable grid of cards
    caption: >-
      The collection and deckbuilding screen, with search and filter by
      cost, ability, and series.
  - type: image
    src: ../../assets/images/projects/marvel-snap/gallery-card-detail-wolverine.jpg
    alt: >-
      The card detail screen for a Wolverine variant, showing its cosmetic
      options, equipped cosmetics, and artist credit
    caption: The card detail screen, with variants, cosmetics, and artist credit.
  - type: image
    src: ../../assets/images/projects/marvel-snap/gallery-announcement-still.jpg
    alt: >-
      Ali Wallick speaking on camera in Marvel Snap’s official announcement
      video, with an on-screen lower third reading her name and title
    caption: On camera for the official announcement video.
links:
  - label: Credited on the official Marvel Snap site
    url: https://marvelsnap.com/credits/
    kind: press
  - label: '"Welcome Ali!" — Second Dinner'
    url: https://www.youtube.com/watch?v=ntORfECH56s
    kind: video
  - label: Hellfire Gala Developer Update, December 2023
    url: https://www.youtube.com/watch?v=MHqai3bwCoE
    kind: video
  # Community appearances, a different register from the three first-party
  # videos above. Kept on the "err toward more" call from the gate — now that
  # the whole site is readable, they still read as a fun, honest complement
  # to the systems write-up rather than a mismatch.
  - label: The Weekly Snap Show, Episode 01
    url: https://www.youtube.com/watch?v=Rw1FWK1yhDk
    kind: video
  - label: MARVEL SNAP Pictionary!
    url: https://www.youtube.com/watch?v=ALvP-EyOkBo
    kind: video
summary: >-
  Five years of client and feature engineering on Marvel Snap, from early UI and localization
  work to the tooling behind its MVVM migration and its PC launch.
draft: false
---

I joined Second Dinner in 2019 as its 11th employee, before the studio had shipped anything. Marvel
Snap took about three years to reach launch. I spent that time, and the years after, helping build
both the game and the studio around it.

## What I Built

Early on I was a client engineer doing core Unity work. The local notification plugin we used for
iOS and Android had no shared interface between the two. I built one on top of a ScriptableObject,
so design could set up a notification once and have it work on both platforms. I added deep linking
so a link could open the app straight to any screen, like the shop. The game’s UI wasn’t localized
at all when I got there. I organized the effort to get every menu translated, and did the first
integration of Unity’s Localization package to run it. I also built the client-side integration for
live-ops tooling like Braze. Later I moved into feature engineering: meta gameplay systems spanning
client and server code plus the UI for them, card and deck cosmetics, and the deckbuilding UI. I built a lot of
tooling for the team too, both in the Unity Editor and in the game itself. The card art tool was
one, which our artists authored card art through. The in-game developer console was another. Four things from that span stand out.

**Building the tooling for an MVVM migration.** Alongside the push to launch the PC client, I built
the tooling that made an MVVM architecture practical to adopt on a live product, and encouraged
teammates to migrate their working patterns onto it.

**The PC launch, in two stages.** Snap’s Steam Early Access launched globally on October 18, 2022 as
a direct port of the mobile client, the fastest path to PC and a reasonable one for a first release.
That December, Snap
[won Best Mobile Game at The Game Awards](https://www.marvel.com/articles/games/marvel-snap-mobile-game-of-the-year-2022).
It went on to [win Mobile Game of the Year at the DICE Awards](https://www.pocketgamer.biz/marvel-snap-wins-mobile-game-of-the-year-at-the-dice-awards/)
the following February. Then we exited Early Access on August 22, 2023, announced at Gamescom. That
meant going back through a large chunk of the UI. We rebuilt it for a landscape screen and
mouse-and-keyboard input, instead of a phone layout stretched onto a monitor.

**The card and collection systems.** I built and owned the screen players use to inspect
an individual card:

- **Sub-cards:** Toggling through a card’s sub-cards.
- **Upgrading:** Spending boosters and credits to upgrade a card.
- **Variants:** Browsing and selecting a card’s cosmetic variants.
- **Stats and abilities:** The card’s stats and ability text.
- **Animation preview:** Previewing a variant’s animation and effects.

The screen also carries artist credits. Card art shipped with no in-game attribution for who drew
it, something players had been asking for since launch. I argued for the feature and built it:
tapping a card’s nameplate surfaces who sketched, inked, and colored it, with an icon for each role.
It shipped in January 2023 and was covered by gaming press, including
[GamesRadar](https://www.gamesradar.com/marvel-snap-adds-full-creator-credits-to-all-card-art/).
I also built the screens players use to browse their collection, build decks, and apply cosmetic
variants across their cards. Search and filtering had to work correctly against localized text and
a card’s full metadata, not just its name in English. I built all of it for both mobile and PC,
which meant two different input models.

**Building the localization and live-ops pipelines.** We shipped in 15 languages. I owned
localization end to end: the import/export pipeline, and the workflow the rest of the team
localized UI text through. I worked
directly with our publishers on all of it. Fonts were a project of their own:

- **CJK fallback:** Proper support for CJK fonts, falling back to OS-level fonts when a given
  typeface didn’t cover a character.
- **Memory footprint:** Only the game’s own shipped characters stayed in memory by default, instead
  of loading every supported language’s full glyph set up front.
- **User-generated text:** Glyphs for text players typed themselves loaded in dynamically, rather
  than paying that overhead for every player.
- **Thai diacritics:** Correct rendering of Thai’s stacked diacritic marks.

I also built the client-side integration that let live-ops and marketing put content in front of
players without an app update. The main-screen carousel pulled its content dynamically from Braze,
so live-ops could update it directly. The same integration also drove the news page and modal
pop-ups.

## What I Learned

Five years on Snap took me through the whole arc: prototype, pre-production, launch, live ops. Until
then, I’d only ever joined a game already in production or already shipped, never seen the full
cycle through. I got to watch systems I built early get stress-tested by years of real content, and
see how live-ops needs shaped what came after.

More than the game itself, I’m proud of watching Second Dinner grow up around me over those five
years, from a small team still finding its footing to a studio that could launch and sustain a live
global game.

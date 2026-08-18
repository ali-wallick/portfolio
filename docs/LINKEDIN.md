# LinkedIn — paste-ready copy

Phase 4 deliverable. **This is copy for Ali to paste in herself, not a sync.** Nothing automated
touches the LinkedIn account: an agent logging into a personal profile is an account-access boundary
worth keeping bright, and LinkedIn's own terms are unfriendly to it besides. So this file is the
handoff format.

**Where this comes from.** The role descriptions below are the `highlights` + `highlightsExtended`
bullets from `src/content/jobs/*.md` — i.e. exactly the two-page resume at `/resume/full`. That is
deliberate: LinkedIn has no page limit, so it gets the long version, and it stays the same single
source as the site and both PDFs rather than becoming a fourth place a fact can go stale. When a
bullet changes in the collection, re-read this file rather than editing LinkedIn from memory.

**One thing still open** — see "Still needed" at the bottom. The job titles and dates are settled.

---

## Headline

220 characters max. Three options, most conservative first — pick one, they're all true.

1. `Senior Software Engineer I at Second Dinner`
2. `Senior Software Engineer I at Second Dinner · Marvel Snap · 15 years in game UI and systems`
3. `Game developer, 15 years in UI and systems engineering · Senior Software Engineer I at Second Dinner`

Option 1 is what LinkedIn defaults to and says the least. Option 2 carries the shipped credit, which
is the thing a recruiter scanning a list actually stops on.

---

## About

2,600 characters max; this runs about 1,900.

```text
I've been building games for fifteen years, mostly in UI and systems engineering — the layer where a game's interface, its live-ops plumbing, and its meta systems all have to agree with each other.

I'm at Second Dinner now, where I joined in 2019 as the studio's 11th employee, before it had shipped anything. I spent five years on Marvel Snap: early on as a client engineer in Unity, doing notifications, deep linking, localization, and live-ops integration, and later as a feature engineer on meta gameplay systems spanning client and server, card and deck cosmetics, and the deckbuilding UI. The work I'm proudest of there is championing a migration to an MVVM architecture on a live product, owning localization end to end, and the two-stage PC launch — a direct mobile port for Steam Early Access, then rebuilding much of the UI to be genuinely landscape- and mouse-and-keyboard-native when we exited Early Access in 2023. Since 2024 I've been on Second Dinner's next team, building the studio's first game in Godot.

Before that: three years at MobilityWare on Vegas Blvd Slots, architecting the live-ops systems that let the game change without a client update; a year at Red 5 Studios on Firefall's HUD and menus, on a much bigger team and codebase than I'd worked on before; and four years at Kaneva, where I started in technical support and grew into leading UI programming for a social virtual world.

Something I keep relearning: the most valuable thing I can build is often not the feature itself, but the tool that makes the next ten features cheaper. That was true of the menu animation system at Kaneva that both the UI and game teams ended up adopting, and it was true of the level editor I built in a week for a game jam pitch that went on to outlive my time at the studio.
```

---

## Experience — Second Dinner

**Title:** Senior Software Engineer I · **Irvine, CA** · 2019 – Present

**Two positions under one company.** Software Engineer II, 2019 – Dec 2021, then Senior Software
Engineer I, Dec 2021 – present. LinkedIn models this natively: add a second position under the same
Second Dinner entry rather than editing the title in place, so the promotion shows on your profile.
Put the bullets below on the current role.

```text
• Joined as the studio's 11th employee, before it had shipped anything. Five years on Marvel Snap, which launched in October 2022, then its next team from 2024 — the studio's first game in Godot.
• Championed and helped lead a migration to MVVM architecture on a live product, alongside the push to ship the PC client.
• Shipped Snap on PC in two stages: a direct mobile port for Steam Early Access at the October 2022 launch, then reworked much of the UI to be landscape- and mouse-and-keyboard-native for the Early Access exit in August 2023.
• Owned localization end to end — Unity's Localization package, the import/export pipeline, font handling, and the workflow the team localized UI text through.
• Built the Braze integration that let live-ops and marketing ship content without an app update: main-screen carousel, news page, and modal pop-ups.
• Early client engineering in Unity: push notifications, deep linking, the first pass of localization, and integrating live-ops tooling into the client.
• Later feature engineering: meta gameplay systems spanning client and server code plus the UI for them, card and deck cosmetics, and the deckbuilding UI.
```

---

## Experience — MobilityWare

**Title:** Software Engineer II · **Irvine, CA** · 2016 – 2019

```text
• Architected Vegas Blvd Slots' live-ops systems — a server-controllable store and a DeltaDNA integration driving in-app messaging, promo carousels, and eventing, with customizable text so marketing could run campaigns without engineering.
• Engineered new slot machines and their features and bonus games, on a title carrying 50+ machines plus rewards, gifting, leagues, and tournaments.
• Pitched It Fits I Sits at the studio game jam and built the week-long prototype, focused on a level editor that exported JSON and let us author 61 levels for pitch day. Won People's Choice; other teams took it to release, later as Puzzle Cats.
• Led cross-cutting work that spanned the whole title, including GDPR support and keeping the game current through several major Unity version upgrades.
• Ported the previous slots title, Hot Streak Slots, from native iOS to Unity, and built blackjack, video poker, and keno for an early unreleased casino app.
```

> **Don't soften the It Fits I Sits bullet.** "Other teams took it to release" is doing real work: it
> is the difference between an accurate credit and implying a credit on Puzzle Cats, which Ali does
> not have. The honest version is the better story anyway — a one-week jam pitch that outlived her
> time at the studio and is still live years later.

---

## Experience — Red 5 Studios

**Title:** UI Programmer · **Irvine, CA** · June 2015 – 2016

```text
• Built UI across Firefall's HUD and menus — radar, PvP HUD, character progression and elite-level screens, reward screens — through its Chinese launch and worldwide relaunch overhaul.
• Created shared libraries for common menu and HUD elements, and optimized the UI system itself on an already-loaded client.
• Worked at the boundary between the Lua/XML UI scripting layer and the studio's C++ engine, on a team and codebase substantially larger than anything I'd worked on before.
```

---

## Experience — Kaneva, LLC

**Title:** see below · **Atlanta, GA** · 2011 – 2015

**One entry, by Ali's decision** — the progression is old enough that she's fine with the
flattening, and no date is needed to keep it as is. Whatever title your LinkedIn already carries for
Kaneva is fine; the site says `Software Engineer` (from the 2019 resume) while the Kaneva project
page says `Lead UI Programmer`, so either is defensible.

```text
• Architected a menu animation system adopted by both the UI and game teams, after hand-coding every transition became the bottleneck.
• Built many of Kaneva's core menus end to end in the in-house Lua menu system — player and creator HUDs, inventory and bank, travel, events, and a visual property editor for scripted objects — from artists' comps through layout to functionality.
• Part of the team that designed and scripted a Lua-based game development environment on top of the virtual world.
• Started in technical support, helping players with their in-world scripting and building game templates — Treasure Hunt and Adventure among them — that let players assemble small games of their own.
• Also built context menus for people and objects, menus for swapping video and Flash content on in-game objects, and the welcome and builder tutorials, working with the engine and web teams whenever a menu touched either.
```

---

## Education

**Georgia Institute of Technology** · B.S., Computational Media · 2011

The 2011 GPA and the Dean's List entries are recorded in
`src/content/education/georgia-tech.md` and deliberately not shown — fifteen years into a career
they are not load-bearing. Same call on LinkedIn: leave the honors fields empty.

---

## Featured / links

- `https://aliwallick.com` — the site
- `https://aliwallick.com/resume.pdf` — one-page resume
- `https://marvelsnap.com/credits/` — the official Marvel Snap credit, listed as Senior Software
  Engineer I. Worth linking rather than asserting.

---

## Still needed

Both are Ali's to supply; neither can be guessed without inventing a fact.

1. ~~**Two promotion years.**~~ **Done 2026-08-17.** Second Dinner split at December 2021; Kaneva
   stays a single entry by Ali's decision.
2. **Current toolchain**, for the resume's Tools line. **Partly answered** — GDScript added
   2026-08-17, so it now reads `Unity · C# · Godot · GDScript · DeltaDNA · Lua · XML · C++`. Still
   derived strictly from each job's `tech` field, so there is no workflow tooling in it, and
   DeltaDNA (2016–2019 vintage) still sits next to Godot with nothing to signal the gap.

---

## What not to do here

LinkedIn is the one surface in this project that an agent can't verify after the fact, so the rules
are stricter, not looser:

- **Don't name or characterise Second Dinner's current game.** The studio said publicly on 7 August
  2024, via the [W4 Games investment](https://www.w4games.com/blog/w4-games-news-1/second-dinner-studios-becomes-a-strategic-investor-in-w4-games-and-plans-to-build-the-largest-game-in-godot-yet-37),
  that it's building its next game in Godot. That is the ceiling. No title, platform, or genre.
- **Don't restore "unannounced mobile Marvel game."** It was accurate in 2019 and has been wrong
  since October 2022.
- **Don't claim a Puzzle Cats credit.** See the note under MobilityWare.

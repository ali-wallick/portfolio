# Asset inventory — `resources/images/`

Phase 0 audit, 2026-08-15. Cross-referenced every file under `resources/images/` against every `.php`, `.css`, and `.js` file in the repo (`grep -r` for `resources/images/...` paths, including the leading-slash form used in some project pages). No image is deleted here — this is a keep/drop list for a later cleanup pass.

**Actioned in Phase 3 (2026-08-16).** The 50 keep-listed files, plus `programming_actionscript.png`, moved to `src/assets/images/` (project subdirectories renamed to match the content collection's slugs, e.g. `artofrescue/` → `projects/art-of-rescue/`) so Astro's `image()` can resolve them. The full drop list — 86 unused social icons, the 6 orphaned logo/banner files, and `projects/downloads/nightLight.unity3d` — was deleted. This file stays as the historical record of the audit; nothing under `resources/images/` should exist going forward.

**143 files, 4.7 MB total. 50 referenced, 93 unreferenced (~3.5 MB of dead weight, roughly 75% of the directory's size).**

No broken references were found in the other direction — every image path referenced in code resolves to a file that exists.

## Keep (50 files, actually referenced)

- Top-level: `banner.png`, `me.jpg`, `me2.jpg`, `quickImage.jpg`, `resume.png`
- Social icons in active use (4 of 90): `facebook-dreamstale25.png`, `linkedin-dreamstale45.png`, `steam-dreamstale65.png`, `twitter2-dreamstale72.png`
- Generic project icons: `projects/design_whiteboard.jpg`, `projects/programming_blueprints.png`, `projects/programming_unity.png`
- Per-project images: `artofrescue/` (design, screenshot, screenshot2), `corexmachina/` (banner, design, screenshot), `critter/` (Cards, banner, design, screenshot), `deadbooty/` (DeadBooty, art, design), `firefall/banner.png`, `itwillkillyou/` (character, design, level, modeling), `kaneva/` (banner, screenshot1-3), `kinoclue/KinoClue.png`, `minimages/` (banner, design, screenshot), `nightlight/` (design, modeling, screenshot), `prodigal/` (screenshot1-3), `secretgarden/` (banner, design, screenshot), `tiltingwindmills/` (banner, screenshot), `vegasblvd/banner.png`

## Drop (93 files, ~3.5 MB)

**86 of 90 social icons (~344 KB).** The `socialmedia/` directory is a full third-party icon pack; only 4 icons (Facebook, LinkedIn, Steam, Twitter) are ever used, in `contact.php` and `includes/footer.php`. The other 86 — Amazon, AOL, Bing, Dropbox, ICQ, MySpace (both versions), Xbox, Zynga, and so on — have no references anywhere in the codebase. Full list in the audit; every `socialmedia/*` file not in the Keep list above is a drop candidate.

**6 orphaned project logo/banner files (~400 KB combined with the item below):**
- `projects/artofrescue/ArtOfRescue_Logo.png`
- `projects/artofrescue/ArtOfRescue_Logo2.png`
- `projects/gameover/banner.png` — `gameOverEverAfter.php` uses the generic whiteboard/blueprints icons instead
- `projects/itwillkillyou/ItWillKillYou_logo.png`
- `projects/nightlight/NightLight_logo.jpg`
- `projects/prodigal/Prodigal_logo.png`

**1 more, closely related to a known content bug:** `projects/programming_actionscript.png` is unreferenced. Art of Rescue is a Flash/ActionScript game, but `artofrescue.php` uses `programming_unity.png` instead — the wrong technology icon (already flagged in the Phase 3 content-bugs list in the rebuild plan). The correct icon exists and sits unused. Worth fixing as part of that same Phase 3 pass rather than here.

## Also flagged (not in `resources/images/`, but same category of dead weight)

`projects/downloads/nightLight.unity3d` — 6.3 MB. Embedded by `nightlight.php` via the Unity Web Player NPAPI plugin (`webplayer.unity3d.com`), which stopped being served years ago and which no browser has supported a plugin API for since the mid-2010s. The embed is already fully dead on any current browser; the binary is pure download weight with no path to ever working again.

## Not evaluated here

Two directories exist under `resources/` beyond `images/` — `resources/css/` and `resources/js/` — plus `resources/data/` (`todo.txt`, `palette.html`). Those are out of scope for this image inventory; `colors.css`/`todo.txt`/`palette.html` are already flagged for removal in the rebuild plan's Phase 3 (content bugs / dead ends) section.

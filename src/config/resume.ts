/**
 * The resume's "Skills" section (labelled "Tools" internally and in CLAUDE.md,
 * since that's the name it was settled under) — Engines & Tools, Languages,
 * Platforms.
 *
 * Settled directly with Ali (issue #39, decision comment 2026-08-23). This
 * list does NOT derive from any job's `tech` — jobs no longer have a `tech`
 * field at all, because it had exactly one consumer (this section) and this
 * section isn't a derivation any more. It's a cross-career depth claim,
 * curated by hand: some entries (Cursor, Claude Code) trace to no single job,
 * and several things that WERE in some job's `tech` are deliberately absent.
 *
 * The principle, worth repeating here because it did the actual cutting: *the
 * Tools line is a depth claim, not an exposure claim.* Anything Ali would
 * rather not be interviewed on doesn't go here; if it's true and interesting,
 * it goes in a dated bullet instead, where it carries scope. Corollary: this
 * section holds nameable things, not capabilities. See CLAUDE.md and the full
 * cut list on #39.
 *
 * This list is settled. Do not reopen it, re-derive it, or add anything you
 * think is missing — every entry and every omission traces to a direct answer
 * from Ali, not to a job's `tech`, a plan, or an inference.
 *
 * `Record<ResumeToolCategory, string[]>` rather than a flat array with a
 * `category` field per entry: a tool is written down *inside* one of the
 * three category keys, so there is no way to add one without classifying it,
 * and TypeScript's excess-property checking on this literal rejects a
 * category that isn't one of the three declared below — `npm run check`
 * (part of `npm run verify`) fails to compile rather than silently dropping
 * the entry. Same shape as `STATUS_LABEL` in `src/lib/content.ts`: a status
 * without a colour pair is a compile error there, not a silent fallback, and
 * this is that rule applied to tools.
 */
export const RESUME_TOOL_CATEGORIES = ['Engines & Tools', 'Languages', 'Platforms'] as const;

export type ResumeToolCategory = (typeof RESUME_TOOL_CATEGORIES)[number];

export const resumeTools: Record<ResumeToolCategory, string[]> = {
  'Engines & Tools': ['Unity', 'Godot', 'Git', 'Cursor', 'Claude Code'],
  Languages: ['C#', 'GDScript', 'Lua'],
  Platforms: ['iOS', 'Android', 'PC'],
};

/**
 * The two-pager's opening Summary. **`/resume/full` only — the one-pager has
 * none.** Ali's call, 2026-08-26 (#32).
 *
 * Her 2019 resume opened with one and the Phase 4 rebuild dropped it. Restored
 * to the long version only, because the one-pager is the document you attach to
 * an application, where a summary mostly restates the title line and the first
 * bullet it sits above. On the two-pager it has room to orient a reader before
 * four jobs of detail.
 *
 * Written fresh, not recovered. The 2019 original opened "Programmer passionate
 * about developing games of all varieties", which is exactly the throat-clearing
 * the `write-copy` skill bans -- and the skill is explicit that the ban is on the
 * opening-line formula, not on the word "passionate", which is genuinely hers.
 *
 * **It restates the two entries below it, and that is the chosen job for it.**
 * Ali's call, 2026-08-26 (two-page pass), picking an "orientation" summary over
 * a "through-line" one. The alternative said what no entry says -- the pattern
 * across four studios, UI and the tooling other people build on -- and was
 * rejected as reading more like a pitch than a resume line. So overlap with the
 * Experience section is deliberate here: a skimmer who reads only this leaves
 * with the current role and the headline credit.
 *
 * What is NOT allowed is the near-verbatim overlap this had until now. It ended
 * "on a new team at Second Dinner, building the studio's first game in Godot",
 * which is the Godot group's `intro` almost word for word, fifteen printed
 * lines below it on the same page. Restating a fact is the job; restating a
 * *sentence* is a bug. It also lost a printed line in the trim (3 to 2).
 *
 * **Not the same text as `ABOUT` in scripts/build-linkedin.mjs, on purpose.**
 * That one is ~1,900 characters of first-person prose for LinkedIn's About
 * field; this is three sentences at resume register. Different genres, different
 * lengths, both hand-authored. If you change a *fact* in one, change it in the
 * other -- they are the two places on this site where a career-level claim is
 * written rather than derived, which makes them the two places it can drift.
 */
export const resumeSummary =
  'Senior software engineer with fifteen years building game clients, UI systems, and the ' +
  "tooling behind them. Seven of those at Second Dinner, through Marvel Snap's launch, its " +
  'PC release, and now a new project in Godot.';

/**
 * The two-pager's Personal Projects section. **`/resume/full` only.** Ali's
 * call, 2026-08-26 (#32).
 *
 * Her 2019 resume carried this section and the Phase 4 rebuild dropped it, on
 * the reasonable theory that /projects covers all 16 entries properly. What that
 * missed: **the PDF travels on its own.** A recruiter who opens the attachment
 * has the site's URL in the header and no particular reason to follow it, so the
 * jam record was reachable only by someone already convinced.
 *
 * Hand-curated rather than derived from the `projects` collection, same
 * precedent as `resumeTools` above (#39): which entries belong on a resume is a
 * curation decision, not a query. It also could not be a derivation even if we
 * wanted one, because **the achievements are not in the schema** -- Critter³'s
 * Entelechy placing and Cor Ex Machina's second place live in those files'
 * *prose bodies*, `projects` has no `award` field, and adding one to serve a
 * single consumer is the `tech`-field mistake (#39) again.
 *
 * **Game Over Ever After was here and was cut, Ali's call 2026-08-26.** Her 2019
 * resume listed it, and it was carried over on that basis. It was also the one
 * entry with no page to link: removed from the collection at `906efc9` (#61)
 * because the schema requires a `hero` and no usable image survives anywhere,
 * in the repo or the snapshot. **Don't restore it from the 2019 resume** on the
 * theory that it was dropped for lack of media -- the credit is true, and it was
 * still cut on purpose.
 *
 * `slug` stays optional because "Speaking" is not a project and has none. Every
 * *project* entry here now links; if you add one that can't, ask first, because
 * that is the property that just got bought. It is used only by the HTML resume;
 * the PDF ignores it.
 *
 * **Verb-first past tense, same register as a job bullet.** Ali's call,
 * 2026-08-26 (two-page pass). These entries used to open with a noun phrase
 * ("Global Game Jam 2011 prototype, and a finalist in ...") and were not even
 * consistent with each other -- one verbless, one a fragment plus a verb-first
 * clause, one two fragments -- which read as a different document pasted in
 * under the Experience section. The two jam verbs are sourced from each
 * project's `role` field (`Programmer`; `Programmer, Designer`), not inferred:
 * both were seven-person teams, so "Built" would have overclaimed.
 */
export interface ResumePersonalProject {
  /** Short topic label, same convention as a job bullet's `label`. */
  label: string;
  text: string;
  /** A `projects` collection slug, where the entry has a page. */
  slug?: string;
}

export const resumePersonalProjects: ResumePersonalProject[] = [
  {
    label: 'Critter³',
    slug: 'critter-3',
    text: "Programmed a cube-world puzzle game at Global Game Jam 2011. Reached the finals of SCAD's Entelechy prototype contest that May.",
  },
  {
    label: 'Cor Ex Machina',
    slug: 'cor-ex-machina',
    text: 'Programmed and designed a herding game at Global Game Jam 2013. Placed second at Atlanta, the largest jam site in the country that year.',
  },
  {
    label: 'Speaking',
    text: 'Spoke on panels at the Museum of Design Atlanta and SIEGE in 2013. Gave talks for a Girl Scout troop in 2020 and a college class on the work itself in 2023.',
  },
];

/**
 * The resume header's location line. Ali's call, 2026-08-26 (#32).
 *
 * **This supersedes half of a Phase 4 decision, so read that one first.** The
 * Phase 4 gate settled "no PO Box, and no home address at all", and the reason
 * given was twofold: the PO Box in `resources/WallickAli-Resume.pdf` is a real
 * privacy exposure (#40, #132), and *there was no sourced current city*. Ali
 * supplied one here, so the second reason is gone. The first is untouched --
 * a metro region is not a street address, and nothing about this reopens the
 * PO Box question.
 *
 * It replaces the per-entry location lines on the one-pager rather than adding
 * to them (see ResumeDocument.astro). Three of the four jobs said "Irvine, CA";
 * stating the region once in the header says the same thing in one line instead
 * of five, and buys 78px on a document that had 24px of slack.
 *
 * Spelled out rather than "Orange County, CA" because that is how Ali wrote it,
 * and because the header is the one place on the document with room for it. The
 * two-pager still abbreviates in its per-job lines, which is the normal
 * convention for an entry list.
 *
 * Resume-scoped deliberately, and NOT in `src/config/site.ts` next to name,
 * role, and email. Those are sitewide and reachable by any page or meta tag;
 * this is one line on one document, and a location is exactly the kind of fact
 * that should have to be imported on purpose.
 */
export const resumeLocation = 'Orange County, California';

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

#!/usr/bin/env node
/**
 * Source-tree checks on `src/`.
 *
 * The companion to `check-links.mjs`, which checks the built output. These
 * three rules are properties of the *source* — a raw colour is invisible in
 * `dist/` (it renders as a colour, indistinguishable from a token's), and a
 * `TODO(` marker never reaches `dist/` at all. So this is the one guard that
 * reads `src/` on purpose rather than for want of a build.
 *
 * Same house style as `check-links.mjs`: zero dependencies, one `problems[]`
 * collector, no early exit, every rule a regression guard for a rule this repo
 * settled and then had no way to enforce.
 *
 *   1. No raw colours in components   — hex, functional or named. `tokens.css`
 *                                       holds the palette. A raw
 *                                       colour in a component makes a palette
 *                                       change a hunt through every file
 *                                       instead of a token swap.
 *   2. No raw `px` font sizes         — same reason, for the type scale.
 *   3. Every `TODO(` cites an issue   — `TODO(#48)`, never `TODO(soon)`. A
 *                                       marker with no issue number is a dead
 *                                       end; the issues are what get worked.
 *
 * Rules 1 and 2 close CLAUDE.md's "Use the variables" standing rule and rule 3
 * closes the `TODO(#n)` convention, both of which were prose until #338. Rule 3
 * was a manual grep in the `pre-merge-check` skill.
 *
 * Usage: node scripts/check-source.mjs [src-dir]
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { walkFiles } from './lib/walk-files.mjs';

const SRC = path.resolve(process.argv[2] ?? 'src');

if (!existsSync(SRC)) {
  console.error(`✗ ${SRC} does not exist.`);
  process.exit(1);
}

/** @type {{file: string, message: string}[]} */
const problems = [];
const report = (file, message) => problems.push({ file, message });

const allFiles = await walkFiles(SRC);

/* Rules 1 and 2 govern CSS: the stylesheets, plus any `<style>` block or
   `style=` attribute in a component. As of #338 no `.astro` file carries a
   scoped `<style>` at all, so the `.astro` half is purely a regression guard
   against the first one arriving with a raw value in it. */
const styleFiles = allFiles.filter((f) => f.endsWith('.css') || f.endsWith('.astro'));

/* Rule 3 governs every source file — a `TODO(` is as likely in a `.ts` config
   or a Markdown body's front matter as in a stylesheet.
   An ALLOWLIST of text extensions, not a blocklist of image ones: `src/` holds
   .webp and .jpeg too, and an image whose EXIF happens to contain "TODO" would
   fail a build with no way to fix it, since rule 3 has no exemption. */
const TEXT_EXTENSIONS = new Set([
  '.astro',
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.cjs',
  '.css',
  '.md',
  '.mdx',
  '.json',
  '.yml',
  '.yaml',
  '.txt',
  '.svg',
]);
const todoFiles = allFiles.filter((f) => TEXT_EXTENSIONS.has(path.extname(f)));

/**
 * Blank out `/* … *\/` comments, `//` line comments and HTML comments, keeping
 * the byte count so line numbers survive.
 *
 * Not cosmetic: issue references are pervasive in this repo's comments — 136
 * of them across the three stylesheets against a single real raw colour — and
 * `#327` matches every hex pattern anyone would write. Anchoring the match to
 * the value side of a declaration cuts most of it, but not a comment that
 * wraps a `#nnn` mid-sentence, which is why the comments go first.
 */
function blankComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + ' '.repeat(m.length - p.length));
}

/**
 * The line number a character offset falls on, 1-based.
 */
function lineAt(text, index) {
  return text.slice(0, index).split('\n').length;
}

/**
 * Whether the declaration spanning `start`–`end` opts out with `guard-allow`.
 *
 * Read from the ORIGINAL text, not the comment-blanked copy, because the
 * marker lives in a comment by design — an exemption should have to say why it
 * exists, right where it is.
 *
 * `start` must be the PROPERTY NAME, never the `{` or `;` the match anchors on.
 * Those routinely sit on the previous line, and searching from there let one
 * exemption silently cover the declaration underneath it: a raw colour written
 * directly below the scrim inherited the scrim's marker and went unreported.
 * An exemption covers exactly the declaration it is written on.
 */
function allowed(raw, start, end) {
  const lines = raw.split('\n').slice(lineAt(raw, start) - 1, lineAt(raw, end));
  return lines.some((l) => l.includes('guard-allow'));
}

/** The offset of the property name in a match anchored on a leading `{` or `;`. */
function propertyStart(text, m) {
  let i = m.index + m[1].length;
  while (i < text.length && /\s/.test(text[i])) i++;
  return i;
}

/**
 * Blank everything in an `.astro` file that is not CSS, preserving byte count.
 *
 * Keeps `<style>` block contents and the value of any `style=` attribute; the
 * frontmatter fence, the markup and every expression go to spaces.
 */
function cssOnly(text) {
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  const keep = [];
  for (const m of text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    keep.push([m.index + m[0].indexOf('>') + 1, m.index + m[0].length - '</style>'.length]);
  }
  for (const m of text.matchAll(/\bstyle\s*=\s*"([^"]*)"/gi)) {
    keep.push([m.index + m[0].indexOf('"') + 1, m.index + m[0].length - 1]);
  }
  let out = blank(text);
  for (const [a, b] of keep) out = out.slice(0, a) + text.slice(a, b) + out.slice(b);
  return out;
}

/**
 * The character offsets of every region this guard does not govern.
 *
 * Paper is the whole exemption, and it is a scope rather than a line list.
 * `resume.css`'s `@media print` block opens by stating that paper pins three
 * tokens and nothing else — every other token is *undefined* there, so a
 * `var()` inside it would fall back to the property's initial value rather
 * than to the palette. Print declarations are raw because they have to be.
 *
 * `@page` is the same story one level out: its margin boxes are painted by the
 * print engine, outside any element the cascade reaches.
 */
function exemptRanges(text) {
  const ranges = [];
  const re = /@(?:media\s+print\b|page\b)/g;
  for (const m of text.matchAll(re)) {
    // Walk to the block's opening brace, then to its matching close.
    let i = text.indexOf('{', m.index);
    if (i === -1) continue;
    let depth = 0;
    let j = i;
    for (; j < text.length; j++) {
      if (text[j] === '{') depth++;
      else if (text[j] === '}' && --depth === 0) break;
    }
    ranges.push([m.index, j]);
  }
  return ranges;
}

const inRange = (ranges, i) => ranges.some(([a, b]) => i >= a && i <= b);

/*
 * Named colours are raw colours, and a hex-only rule enforced half the rule it
 * claimed to: `color: white` sailed through a check whose message says "use a
 * token". The list is the ones a stylesheet actually reaches for, not all 148
 * CSS keywords — a name nobody would type is a false-positive surface with no
 * upside.
 *
 * `transparent` and `currentColor` are still absent on purpose: neither is
 * paint, and neither has a light/dark pair a token could hold.
 */
const NAMED_COLOURS = [
  'white',
  'black',
  'red',
  'green',
  'blue',
  'yellow',
  'orange',
  'purple',
  'pink',
  'gray',
  'grey',
  'silver',
  'gold',
  'navy',
  'teal',
  'cyan',
  'magenta',
  'brown',
  'beige',
  'ivory',
  'lime',
  'olive',
  'maroon',
  'aqua',
  'fuchsia',
  'violet',
  'indigo',
  'coral',
  'salmon',
  'crimson',
  'lavender',
  'turquoise',
].join('|');

for (const file of styleFiles) {
  const rel = path.relative(process.cwd(), file);
  const raw = await readFile(file, 'utf8');
  /* In a .astro file only the CSS is CSS. Scanning the whole file reported
     `const theme = { accent: '#ff8800' }` in the frontmatter as a raw colour,
     which is a JS object literal and none of this rule's business. Everything
     outside a <style> block or a style="" attribute is blanked, keeping the
     byte count so reported line numbers stay true. */
  const text = file.endsWith('.astro') ? blankComments(cssOnly(raw)) : blankComments(raw);
  const exempt = exemptRanges(text);

  /* `tokens.css` is the definition site — it is where the raw values are
     supposed to be, and the rule it states in its own header is the rule this
     script enforces everywhere else. */
  const isTokens = file.endsWith(path.join('styles', 'tokens.css'));

  // --- 1. No raw colours in components ---
  /*
   * Matched on the value side of a declaration only, and after comments are
   * blanked, so an issue reference cannot reach here from either direction.
   *
   * `transparent` and `currentColor` are deliberately NOT matched. Neither is
   * paint: they are keyword mechanics with no light/dark pair a token could
   * hold, so there is nothing for them to be a token *of*. Seven sites use
   * them correctly, and allowlisting seven correct lines is worse than writing
   * a pattern that never had an opinion about them.
   *
   * A `guard-allow` in the declaration opts it out, and the site that needs it
   * says why in place: the lightbox scrim is black at partial opacity in both
   * themes, so it too has no pair, and it sits behind a native <dialog> where
   * nothing else is painted. Declared at the site rather than held in a list
   * here — the same move as the content model's explicit `hero: { type: art }`.
   */
  if (!isTokens) {
    const colour = new RegExp(
      `(^|[;{])\\s*[a-z-]+\\s*:[^;{}]*?` +
        `(#[0-9a-fA-F]{3,8}\\b|\\b(?:rgba?|hsla?|oklch|lab|lch)\\s*\\(|(?<![\\w-])(?:${NAMED_COLOURS})(?![\\w-]))`,
      'g',
    );
    for (const m of text.matchAll(colour)) {
      if (inRange(exempt, m.index)) continue;
      if (allowed(raw, propertyStart(text, m), m.index + m[0].length)) continue;
      const line = lineAt(text, m.index + m[0].length - m[2].length);
      report(rel, `${line}: raw colour \`${m[2]}\` — use a token from tokens.css (#338)`);
    }

    // --- 2. No raw px font sizes ---
    /*
     * `px` only, which is the rule as written. The nine raw sizes on paper are
     * `pt`, inside the exempt print block, and are correct there — a sheet has
     * physical units and the type scale is a screen construct.
     */
    const size = /(^|[;{])\s*font-size\s*:\s*([0-9.]+px)/g;
    for (const m of text.matchAll(size)) {
      if (inRange(exempt, m.index)) continue;
      if (allowed(raw, propertyStart(text, m), m.index + m[0].length)) continue;
      const line = lineAt(text, m.index + m[0].length - m[2].length);
      report(rel, `${line}: raw font size \`${m[2]}\` — use a \`--text-*\` token (#338)`);
    }
  }
}

// --- 3. Every TODO cites an issue number ---
/*
 * Exact, with no heuristic in it: the marker is `TODO(#n)`, the issue number
 * and nothing else. The stage-name form (`TODO(launch)`) and the phase form
 * (`TODO(phase-3-revisit)`) are both retired with zero markers left, so this
 * starts green and stays a guard against either coming back.
 *
 * Checked on source because a front-matter comment never reaches `dist/`,
 * which is exactly why the `pre-merge-check` skill had to carry it as a
 * separate manual grep from its `dist/` staleness sweep.
 */
for (const file of todoFiles) {
  const rel = path.relative(process.cwd(), file);
  const text = await readFile(file, 'utf8');
  if (!text.includes('TODO')) continue;
  for (const m of text.matchAll(/TODO\s*\(([^)]*)\)/g)) {
    if (/^#\d+$/.test(m[1].trim())) continue;
    report(
      rel,
      `${lineAt(text, m.index)}: \`TODO(${m[1]})\` cites no issue — use \`TODO(#n)\` (#338)`,
    );
  }
  for (const m of text.matchAll(/\bTODO\b(?!\s*\()/g)) {
    report(
      rel,
      `${lineAt(text, m.index)}: bare \`TODO\` — every marker cites its issue, \`TODO(#n)\` (#338)`,
    );
  }
}

const fileWord = allFiles.length === 1 ? 'file' : 'files';
if (problems.length === 0) {
  console.log(
    `✓ ${allFiles.length} source ${fileWord} checked — colours and font sizes are tokens, every TODO cites an issue.`,
  );
  process.exit(0);
}

console.error(`✗ ${problems.length} problem(s) in ${path.relative(process.cwd(), SRC)}:\n`);
for (const { file, message } of problems) console.error(`  ${file}: ${message}`);
process.exit(1);

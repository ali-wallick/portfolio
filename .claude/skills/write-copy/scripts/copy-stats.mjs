#!/usr/bin/env node
// Advisory copy metrics for aliwallick.com. NOT a CI gate — tone isn't gateable,
// and every number here has a legitimate reason to be exceeded. It exists so a
// wording pass argues from measurement instead of vibes, the same way the colour
// and font passes did.
//
//   node .claude/skills/write-copy/scripts/copy-stats.mjs src/content/projects/*.md
//   node .claude/skills/write-copy/scripts/copy-stats.mjs --baseline   # Ali's own blog, for comparison
//
// Baselines are measured from content/archive/ (20 posts, 2010–2019, ~5.1k words).

import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';

// Measured from content/archive/ (blog, ~5.1k words) and cross-checked against three
// corpora not in this repo (see references/ali-voice.md): 4.2k words of adult documents,
// a 2017 employer Q&A, and her 2026 chat messages. All four land between 14.6 and 17.5
// words per sentence, and none of them contains a single em dash.
//
// contractionsPer1k and firstPersonPer1k are genre-dependent, not voice traits —
// 17/1k in the blog against 0.7/1k in formal writing. They are reported for context
// and should not be tuned toward. Sentence length and em dashes are the real signals.
const BASELINE = {
  meanSentenceWords: 17.0,
  emDashPer1k: 0.0,
  contractionsPer1k: 17.0,
  firstPersonPer1k: 41.7,
};

// Each pattern is a *prompt to look*, not a verdict. Several are fine in moderation —
// the count is what matters, not the hit. See SKILL.md §3.
const TELLS = [
  [
    'em-dash aside',
    /—/g,
    'She uses parentheses, a spaced hyphen, or a full stop. Zero em dashes in 9,937 words of hers.',
  ],
  [
    '"not just X, but Y"',
    /\bnot (just|only|merely) [^.;]{2,40}?,? but\b/gi,
    'The single most recognisable LLM cadence. Rewrite as a plain claim.',
  ],
  [
    '"isn\'t about X, it\'s about Y"',
    /\bis(n't| not) (about|just) [^.;]{2,40}?[,.] it'?s\b/gi,
    'Same shape as above.',
  ],
  ['"more than just"', /\bmore than (just|simply)\b/gi, ''],
  [
    'delve / leverage / robust',
    /\b(delve[sd]?|leverag(e|ed|ing)|robust|seamless(ly)?|myriad|plethora)\b/gi,
    'Words Ali has never once used.',
  ],
  ['"it\'s worth noting"', /\b(it'?s worth (noting|mentioning)|notably|importantly),?\b/gi, ''],
  ['"testament to"', /\b(a )?testament to\b/gi, ''],
  ['"deep dive" / "dive into"', /\b(deep[- ]div\w+|div(e|ed|ing) into)\b/gi, ''],
  ['"at the end of the day"', /\bat the end of the day\b/gi, ''],
  [
    '"in today\'s ... landscape"',
    /\bin today'?s [^.]{0,30}(landscape|world|market|industry)\b/gi,
    '',
  ],
  [
    '"journey"',
    /\b(my|the|this) journey\b/gi,
    'Ali used it once, in 2013, about learning on the job. Not a keyword.',
  ],
  [
    '"passionate about"',
    /\bpassionate about\b/gi,
    'She did write this in 2010. It has aged badly; earn it instead.',
  ],
  [
    'hedging stack',
    /\b(somewhat|fairly|quite|arguably|essentially|effectively|basically|virtually) \w+|\brather (?!than\b)\w+/gi,
    'One is fine. A cluster reads evasive.',
  ],
  [
    '"ensure" / "utilize" / "facilitate"',
    /\b(ensur\w+|utiliz\w+|facilitat\w+|endeavor\w*)\b/gi,
    'Use "make sure", "use", "help".',
  ],
  [
    'title-case bolding of a claim',
    /\*\*[A-Z][^*]{0,60}\*\*\./g,
    'Fine as a section lead-in; a wall of them is a slide deck.',
  ],
];

function strip(md) {
  return md
    .replace(/^---\n[\s\S]*?\n---\n/, '') // frontmatter
    .replace(/```[\s\S]*?```/g, '') // code fences
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // link text only
    .replace(/^#{1,6} .*$/gm, '') // headings
    .replace(/<!--[\s\S]*?-->/g, ''); // comments
}

function measure(text) {
  const words = text.split(/\s+/).filter(Boolean);
  const n = words.length || 1;
  const per1k = (c) => +((c / n) * 1000).toFixed(1);
  const sentences = text
    .split(/(?<=[.!?])[\s\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length > 2);
  const lens = sentences.map((s) => s.split(/\s+/).length);
  const mean = lens.length ? lens.reduce((a, b) => a + b, 0) / lens.length : 0;
  return {
    words: n,
    sentences: lens.length,
    meanSentenceWords: +mean.toFixed(1),
    longest: Math.max(0, ...lens),
    over35: lens.filter((l) => l > 35).length,
    emDashPer1k: per1k((text.match(/—/g) || []).length),
    contractionsPer1k: per1k((text.match(/\w'(s|t|ll|ve|re|m|d)\b/g) || []).length),
    firstPersonPer1k: per1k((text.match(/\b(I|my|me|I'm|I've|I'd|I'll)\b/g) || []).length),
  };
}

// `lowerIsBetter` metrics only flag when they run *high* — nobody needs telling
// they used too few em dashes.
function drift(label, got, want, unit = '', lowerIsBetter = false) {
  const ratio = want === 0 ? (got === 0 ? 1 : 99) : got / want;
  const high = ratio > 1.6;
  const flag = high || (!lowerIsBetter && ratio < 0.5) ? '  <-- off baseline' : '';
  return `  ${label.padEnd(26)} ${String(got).padStart(6)}${unit}   (Ali: ${want}${unit})${flag}`;
}

const args = process.argv.slice(2);
const files = args.includes('--baseline')
  ? globSync('content/archive/*.md')
  : args.flatMap((a) => (a.includes('*') ? globSync(a) : [a]));

if (!files.length) {
  console.error('usage: copy-stats.mjs <files...>   |   --baseline');
  process.exit(1);
}

let all = '';
for (const file of files) {
  const text = strip(readFileSync(file, 'utf8'));
  all += text + '\n';
  const hits = TELLS.map(([name, re, note]) => {
    const m = text.match(re) || [];
    return m.length ? { name, count: m.length, sample: m[0].trim().slice(0, 48), note } : null;
  }).filter(Boolean);
  if (!hits.length) continue;
  console.log(`\n${file}`);
  for (const h of hits) {
    console.log(`  ${String(h.count).padStart(3)}x  ${h.name}  ·  "${h.sample}"`);
    if (h.note) console.log(`        ${h.note}`);
  }
}

const m = measure(all);
console.log(
  `\n${'='.repeat(64)}\n${files.length} file(s), ${m.words} words, ${m.sentences} sentences\n`,
);
console.log(drift('mean sentence length', m.meanSentenceWords, BASELINE.meanSentenceWords, 'w'));
console.log(drift('em dashes / 1k words', m.emDashPer1k, BASELINE.emDashPer1k, '', true));
console.log(drift('contractions / 1k', m.contractionsPer1k, BASELINE.contractionsPer1k));
console.log(drift('I / my / me per 1k', m.firstPersonPer1k, BASELINE.firstPersonPer1k));
console.log(
  `  ${'sentences over 35 words'.padEnd(26)} ${String(m.over35).padStart(6)}    (longest: ${m.longest}w)`,
);
console.log(
  '\nAdvisory only. Every number here has a legitimate reason to be exceeded —\nif you exceed one on purpose, that is a fine answer. Just do it on purpose.',
);

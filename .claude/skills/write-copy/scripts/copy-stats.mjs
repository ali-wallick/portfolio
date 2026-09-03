#!/usr/bin/env node
// Advisory copy metrics for aliwallick.com. NOT a CI gate — tone isn't gateable,
// and every number here has a legitimate reason to be exceeded. It exists so a
// wording pass argues from measurement instead of vibes, the same way the colour
// and font passes did.
//
//   node .claude/skills/write-copy/scripts/copy-stats.mjs src/content/projects/*.md
//   node .claude/skills/write-copy/scripts/copy-stats.mjs --baseline   # Ali's own blog, for comparison
//   node .claude/skills/write-copy/scripts/copy-stats.mjs --resume     # the resume bullets, at resume register
//
// Baselines are measured from content/archive/ (20 posts, 2010–2019, ~5.1k words).
//
// `--resume` exists because `strip()` below removes front matter, and a resume bullet
// lives *in* front matter (`highlights` / `highlightsExtended` in src/content/jobs/*.md).
// Pointing the default mode at those files therefore measured the "Source material
// (2019 resume, verbatim)" bodies and never one line of shipped resume copy — silently,
// for as long as the script has existed. `--resume` reads the bullets instead, and
// scores them against the résumé-register baseline rather than the blog one.

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

// Résumé register is a different genre and needs its own marks, or every bullet reads
// as "off baseline" for being subject-dropped and uncontracted, which is the point of
// the genre. Sentence length is taken from the 2019 resume Ali actually sent out, whose
// experience bullets survive verbatim in the "Source material" bodies of the four job
// files -- so the mark is reproducible with this same script:
//
//   node .claude/skills/write-copy/scripts/copy-stats.mjs src/content/jobs/*.md   # 13.2w
//
// Rounded to 13.5 rather than pinned at 13.2, because four jobs' bullets is a small
// sample and the mark is a direction, not a target. Em dashes and first person are zero
// *by definition* of the register, not by measurement.
//
// contractionsPer1k is the one mark here that is measured, and it has to be: CONTRACTION
// below counts possessive ’s alongside contracted ’s, so a résumé that carries no
// contractions at all still scores. The same command reports 10.1 for the 2019 resume
// itself, whose only two hits are "Kaneva’s" and "People’s Choice". A definitional 0
// is therefore a mark no real résumé can hit, which is a mark that always flags — and it
// only ever read clean before #295 because the counter was returning 0 for everything.
// The genre rule is unchanged and is enforced where it can be: the per-file 'contraction'
// tell prints the hit, so a real contraction is visible rather than averaged away.
const RESUME_BASELINE = {
  meanSentenceWords: 13.5,
  emDashPer1k: 0.0,
  contractionsPer1k: 10.1,
  firstPersonPer1k: 0.0,
};

// One pattern, two readers: the résumé formality tell below and the prose
// contraction count in measure(). It used to be written out twice, and only one
// copy learned that #188 curled the apostrophes sitewide — so prose mode reported
// 0 contractions for every file on the site, and flagged every one of them as far
// under Ali's baseline on a metric this skill says not to tune toward (#295).
// Written once now, so the next apostrophe question gets answered in one place.
//
// Both forms are matched because the repo carries both: rendered prose and front
// matter are curly, quoted source and code stay straight.
//
// Possessive ’s is counted as well as contracted ’s, which reads high. Telling
// "Ali’s" from "she’s" needs a parser rather than a pattern, and the number is
// advisory — read it as a direction, not a count.
const CONTRACTION = /\w['\u2019](s|t|ll|ve|re|m|d)\b/g;

// Formality tells. These are NOT general AI tells — they are the specific colloquialisms
// that read fine in site prose and read casual in a resume bullet. Added 2026-08-26 for
// the #32 formality pass; see SKILL.md's résumé-register row.
const RESUME_TELLS = [
  [
    'colloquial verb',
    /\b(hands?|handed|brought \w+ onto|took it to|let us|kept? the team|moving quickly|got \w+ to|came along|push to)\b/gi,
    'Resume register wants the plain formal verb: "passes", "migrated", "released".',
  ],
  ['"plus" as a conjunction', /\bplus\b/gi, 'Reads as a note to self. Use "and", or a colon list.'],
  [
    'contraction',
    CONTRACTION,
    'Résumé register carries none. (Possessive \u2019s is fine — check the hit.)',
  ],
  [
    'sentence fragment opener',
    /(^|\. )(Early|Later|General|Also|Stage \w+ (was|reworked))\b/g,
    'A label-shaped fragment. Either make it a §4.11 bolded label or a full clause.',
  ],
];

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
    /\bis(n['\u2019]t| not) (about|just) [^.;]{2,40}?[,.] it['\u2019]?s\b/gi,
    'Same shape as above.',
  ],
  ['"more than just"', /\bmore than (just|simply)\b/gi, ''],
  [
    'delve / leverage / robust',
    /\b(delve[sd]?|leverag(e|ed|ing)|robust|seamless(ly)?|myriad|plethora)\b/gi,
    'Words Ali has never once used.',
  ],
  [
    '"it\'s worth noting"',
    /\b(it['\u2019]?s worth (noting|mentioning)|notably|importantly),?\b/gi,
    '',
  ],
  ['"testament to"', /\b(a )?testament to\b/gi, ''],
  ['"deep dive" / "dive into"', /\b(deep[- ]div\w+|div(e|ed|ing) into)\b/gi, ''],
  ['"at the end of the day"', /\bat the end of the day\b/gi, ''],
  [
    '"in today\'s ... landscape"',
    /\bin today['\u2019]?s [^.]{0,30}(landscape|world|market|industry)\b/gi,
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
    contractionsPer1k: per1k((text.match(CONTRACTION) || []).length),
    firstPersonPer1k: per1k((text.match(/\b(I|my|me|I'm|I've|I'd|I'll)\b/g) || []).length),
  };
}

// `lowerIsBetter` metrics only flag when they run *high* — nobody needs telling
// they used too few em dashes.
function drift(label, got, want, unit = '', lowerIsBetter = false, who = 'Ali') {
  const ratio = want === 0 ? (got === 0 ? 1 : 99) : got / want;
  const high = ratio > 1.6;
  const flag = high || (!lowerIsBetter && ratio < 0.5) ? '  <-- off baseline' : '';
  return `  ${label.padEnd(26)} ${String(got).padStart(6)}${unit}   (${who}: ${want}${unit})${flag}`;
}

// Deliberately a line reader, not a YAML parser: the job files are hand-written with
// block scalars (`>-`) and comments, and pulling in a dependency to read four files
// would be worse than the twenty lines below.
function resumeBullets(md) {
  const fm = md.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return [];
  const out = [];
  let inList = false;
  let bullet = null; // { label, text }
  let field = null; // which key the wrapped continuation lines belong to

  const flush = () => {
    if (!bullet) return;
    // Measured the way a reader meets it: "Localization: Owned the feature
    // end to end, ...". The label is part of the first sentence on the page,
    // so counting only `text` would under-report sentence length.
    //
    // `extended` is included because it is real shipped copy — it is what
    // /resume/full and docs/LINKEDIN.md render after `text`. Note the key list
    // in the two regexes above has to name it: an unrecognised `extended:` line
    // does not start a new field, it gets appended to whatever field was open,
    // which silently measured the literal string "extended: >-" as part of the
    // bullet. Add any future key to both regexes.
    const body = [bullet.text, bullet.extended].filter(Boolean).join(' ');
    const joined = [bullet.label, body].filter(Boolean).join(': ');
    if (joined.trim()) out.push(joined.trim());
    bullet = null;
    field = null;
  };

  for (const raw of fm[1].split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (/^(highlights|highlightsExtended):\s*$/.test(line)) {
      flush();
      inList = true;
      continue;
    }
    if (!inList) continue;
    if (/^\S/.test(line)) {
      flush();
      inList = false;
      continue;
    }
    if (/^\s*#/.test(line)) continue;

    const startItem = line.match(/^\s*-\s*(.*)$/);
    if (startItem) {
      flush();
      bullet = { label: '', text: '', extended: '' };
      field = null;
      const rest = startItem[1];
      const kv = rest.match(/^(label|text|extended):\s*(>-|>|\|-|\|)?\s*(.*)$/);
      if (kv) {
        field = kv[1];
        bullet[field] = kv[3] || '';
      }
      continue;
    }
    if (!bullet) continue;

    const kv = line.match(/^\s*(label|text|extended):\s*(>-|>|\|-|\|)?\s*(.*)$/);
    if (kv) {
      field = kv[1];
      bullet[field] = kv[3] || '';
      continue;
    }
    if (field) bullet[field] = (bullet[field] + ' ' + line.trim()).trim();
  }
  flush();
  return out;
}

const args = process.argv.slice(2);
const resumeMode = args.includes('--resume');
const files = args.includes('--baseline')
  ? globSync('content/archive/*.md')
  : resumeMode
    ? globSync('src/content/jobs/*.md')
    : args.flatMap((a) => (a.includes('*') ? globSync(a) : [a]));

if (!files.length) {
  console.error('usage: copy-stats.mjs <files...>   |   --baseline');
  process.exit(1);
}

const tells = resumeMode ? [...TELLS, ...RESUME_TELLS] : TELLS;
const baseline = resumeMode ? RESUME_BASELINE : BASELINE;

let all = '';
for (const file of files) {
  const raw = readFileSync(file, 'utf8');
  const bullets = resumeMode ? resumeBullets(raw) : null;
  const text = resumeMode ? bullets.join('\n') : strip(raw);
  all += text + '\n';
  if (resumeMode) console.log(`\n${file}  (${bullets.length} bullets)`);
  const hits = tells
    .map(([name, re, note]) => {
      const m = text.match(re) || [];
      return m.length ? { name, count: m.length, sample: m[0].trim().slice(0, 48), note } : null;
    })
    .filter(Boolean);
  if (!hits.length) continue;
  if (!resumeMode) console.log(`\n${file}`);
  for (const h of hits) {
    console.log(`  ${String(h.count).padStart(3)}x  ${h.name}  ·  "${h.sample}"`);
    if (h.note) console.log(`        ${h.note}`);
  }
}

const m = measure(all);
console.log(
  `\n${'='.repeat(64)}\n${files.length} file(s), ${m.words} words, ${m.sentences} sentences\n`,
);
const who = resumeMode ? '2019 resume' : 'Ali';
console.log(
  drift('mean sentence length', m.meanSentenceWords, baseline.meanSentenceWords, 'w', false, who),
);
console.log(drift('em dashes / 1k words', m.emDashPer1k, baseline.emDashPer1k, '', true, who));
console.log(
  drift('contractions / 1k', m.contractionsPer1k, baseline.contractionsPer1k, '', resumeMode, who),
);
console.log(
  drift('I / my / me per 1k', m.firstPersonPer1k, baseline.firstPersonPer1k, '', resumeMode, who),
);
console.log(
  `  ${'sentences over 35 words'.padEnd(26)} ${String(m.over35).padStart(6)}    (longest: ${m.longest}w)`,
);
console.log(
  '\nAdvisory only. Every number here has a legitimate reason to be exceeded —\nif you exceed one on purpose, that is a fine answer. Just do it on purpose.',
);

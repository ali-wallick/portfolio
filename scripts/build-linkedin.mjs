#!/usr/bin/env node
/**
 * Generates `docs/LINKEDIN.md` — paste-ready LinkedIn copy — from the `jobs`
 * and `education` collections.
 *
 * Before this script existed, the file was 160 lines maintained by hand, and
 * its own header admitted what it was: "the role descriptions below are the
 * `highlights` + `highlightsExtended` bullets from `src/content/jobs/*.md`."
 * A fourth copy of every resume fact, with nothing checking it against the
 * other three (the site, `/resume`, `/resume/full`). See issue #54.
 *
 * ## What's generated vs. hand-authored
 *
 * The Experience and Education sections are fully derived: company, title,
 * location, dates, and bullets all come straight from the collections, the
 * same way `ResumeDocument.astro` builds `/resume/full`. Changing a bullet in
 * `src/content/jobs/*.md` is the only way to change what those sections say.
 *
 * The Headline, About, and "What not to do here" sections are NOT derived —
 * they're LinkedIn-specific prose (an essay, not a bullet list) and editorial
 * decisions about what's safe to say. That's a decision, not data, so it lives
 * as static content in this script rather than being reconstructed from the
 * collections on every run. See `HEADLINE_OPTIONS`, `ABOUT`, and
 * `WHAT_NOT_TO_DO` below.
 *
 * ## Why this isn't rendered with Astro/Vite content APIs
 *
 * `astro:content` only resolves inside Astro's own build graph. This script
 * runs standalone, so — like `scripts/generate-og-images.mjs` — it reads the
 * same YAML front matter directly off disk instead. If the jobs/education
 * schema in `src/content.config.ts` changes shape, update the parsing below
 * too.
 *
 * ## Why the output is committed, unlike `public/og/`
 *
 * This generates no browser dependency (unlike the resume PDFs) and nothing
 * the deployed site serves (unlike the OG images), so it never runs as part
 * of `npm run build` or Cloudflare's build. It exists purely for Ali to read —
 * on GitHub, from a checkout, whenever she's about to update her profile — so
 * it's committed like the PDFs, not gitignored like `public/og/`.
 *
 * That means it can go stale the same way the hand-written version could: by
 * someone editing a job's bullets and not re-running this script. `--check`
 * catches that without needing a lock file at all — regeneration is cheap and
 * fully deterministic (no Chromium, no font rendering), so it just regenerates
 * in memory and diffs against what's committed.
 *
 * Usage:
 *   node scripts/build-linkedin.mjs            # regenerate docs/LINKEDIN.md
 *   node scripts/build-linkedin.mjs --check    # verify the committed file is current
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

const CHECK_ONLY = process.argv.includes('--check');
const ROOT = path.resolve(import.meta.dirname, '..');
const JOBS_DIR = path.join(ROOT, 'src/content/jobs');
const EDUCATION_DIR = path.join(ROOT, 'src/content/education');
const PROJECTS_DIR = path.join(ROOT, 'src/content/projects');
const OUT_FILE = path.join(ROOT, 'docs/LINKEDIN.md');

// ---------------------------------------------------------------------------
// Read the same front matter src/content.config.ts validates, without Astro.
// ---------------------------------------------------------------------------

async function readEntries(dir) {
  const files = (await readdir(dir)).filter((f) => f.endsWith('.md')).sort();
  const entries = [];
  for (const file of files) {
    const raw = await readFile(path.join(dir, file), 'utf8');
    const match = raw.match(/^---\n([\s\S]*?)\n---/);
    entries.push({ slug: file.replace(/\.md$/, ''), data: parseYaml(match[1]) });
  }
  return entries;
}

/** Mirrors `getJobs('resume')` in src/lib/content.ts: onResume jobs, most recent first. */
async function loadResumeJobs() {
  const all = await readEntries(JOBS_DIR);
  return all
    .filter((j) => j.data.onResume !== false)
    .sort((a, b) => (b.data.end ?? '9999').localeCompare(a.data.end ?? '9999'));
}

async function loadEducation() {
  const all = await readEntries(EDUCATION_DIR);
  return all
    .filter((e) => e.data.onResume !== false)
    .sort((a, b) => b.data.end.localeCompare(a.data.end));
}

/** The official Marvel Snap credit link, read off the project rather than retyped here. */
async function loadMarvelSnapCreditUrl() {
  const raw = await readFile(path.join(PROJECTS_DIR, 'marvel-snap.md'), 'utf8');
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  const data = parseYaml(match[1]);
  const credit = data.links.find((l) => l.kind === 'press');
  if (!credit) throw new Error('marvel-snap.md has no press-kind link for the official credit');
  return credit.url;
}

// ---------------------------------------------------------------------------
// Formatting — mirrors formatSpan()/currentTitle() in src/lib/content.ts.
// Duplicated for the same reason resolveProjectImage() duplicates
// projectThumb() in generate-og-images.mjs: that module imports
// 'astro:content' and can't be loaded from a standalone script. Keep both in
// sync if the date/title formatting rules ever change.
// ---------------------------------------------------------------------------

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDatePart(value) {
  const [year, month] = value.split('-');
  return month ? `${MONTHS[Number(month) - 1]} ${year}` : year;
}

function formatSpan(start, end) {
  return `${formatDatePart(start)} – ${end ? formatDatePart(end) : 'Present'}`;
}

function currentTitle(job) {
  return job.data.roles.at(-1).title;
}

/**
 * When a job carries more than one role, LinkedIn wants that modeled as
 * separate positions under one company rather than as a title edited in
 * place — this note explains that, built from whatever `roles[]` actually
 * says rather than retyped per company. Only Second Dinner has more than one
 * role today, but this isn't Second-Dinner-specific: it fires for any job
 * that is.
 */
function multiRoleNote(job) {
  if (job.data.roles.length < 2) return null;
  const roles = job.data.roles;
  const earlier = roles
    .slice(0, -1)
    .map((r, i) => `${r.title} (${formatSpan(r.start, roles[i + 1].start)})`)
    .join(', then ');
  return (
    `**${roles.length} positions under one company.** ${earlier}, then ${currentTitle(job)}, ` +
    `${formatSpan(roles.at(-1).start, job.data.end)}. LinkedIn models this natively: add a ` +
    `further position under the same ${job.data.company} entry rather than editing the title in ` +
    `place, so the promotion shows on your profile. Put the bullets below on the current role.`
  );
}

/** Editorial asides tied to a specific job's story, not reconstructable from the collection. */
const JOB_NOTES = {
  kaneva: {
    after:
      "**One entry, by Ali's decision** — the progression from Technical Support Engineer to " +
      "Lead UI Programmer is old enough that she's comfortable flattening it to a single title on " +
      'the resume, and it needs no promotion date to stay one entry.',
  },
  mobilityware: {
    after:
      '> **Don\'t soften the I Fits I Sits bullet.** "Other teams took it to release" is doing ' +
      'real work: it is the difference between an accurate credit and implying a credit on Puzzle ' +
      'Cats, which Ali does not have. The honest version is the better story anyway — a one-week ' +
      'jam pitch that outlived her time at the studio and is still live years later.',
  },
};

// ---------------------------------------------------------------------------
// Hand-authored prose — not derived, and not meant to be. See the header note.
// ---------------------------------------------------------------------------

const HEADLINE_OPTIONS = [
  'Senior Software Engineer I at Second Dinner',
  'Senior Software Engineer I at Second Dinner · Marvel Snap · 15 years in game UI and systems',
  'Game developer, 15 years in UI and systems engineering · Senior Software Engineer I at Second Dinner',
];

const ABOUT = `I've been building games for fifteen years, mostly in UI and systems engineering — the layer where a game's interface, its live-ops plumbing, and its meta systems all have to agree with each other.

I'm at Second Dinner now, where I joined in 2019 as the studio's 11th employee, before it had shipped anything. I spent five years on Marvel Snap: early on as a client engineer in Unity, doing notifications, deep linking, localization, and live-ops integration, and later as a feature engineer on meta gameplay systems spanning client and server, card and deck cosmetics, and the deckbuilding UI. The work I'm proudest of there is championing a migration to an MVVM architecture on a live product, owning localization end to end, and the two-stage PC launch — a direct mobile port for Steam Early Access, then rebuilding much of the UI to be genuinely landscape- and mouse-and-keyboard-native when we exited Early Access in 2023. Since 2024 I've been on Second Dinner's next team, building the studio's first game in Godot.

Before that: three years at MobilityWare on Vegas Blvd Slots, architecting the live-ops systems that let the game change without a client update; a year at Red 5 Studios on Firefall's HUD and menus, on a much bigger team and codebase than I'd worked on before; and four years at Kaneva, where I started in technical support and grew into leading UI programming for a social virtual world.

Something I keep relearning: the most valuable thing I can build is often not the feature itself, but the tool that makes the next ten features cheaper. That was true of the menu animation system at Kaneva that both the UI and game teams ended up adopting, and it was true of the level editor I built in a week for a game jam pitch that went on to outlive my time at the studio.`;

const WHAT_NOT_TO_DO = `LinkedIn is the one surface in this project that an agent can't verify after the fact, so the rules are stricter, not looser:

- **Don't name or characterise Second Dinner's current game.** The studio said publicly on 7 August
  2024, via the [W4 Games investment](https://www.w4games.com/blog/w4-games-news-1/second-dinner-studios-becomes-a-strategic-investor-in-w4-games-and-plans-to-build-the-largest-game-in-godot-yet-37),
  that it's building its next game in Godot. That is the ceiling. No title, platform, or genre.
- **Don't restore "unannounced mobile Marvel game."** It was accurate in 2019 and has been wrong
  since October 2022.
- **Don't claim a Puzzle Cats credit.** See the note under MobilityWare.`;

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

function renderJobSection(job) {
  const lines = [
    `## Experience — ${job.data.company}`,
    '',
    `**Title:** ${currentTitle(job)} · **${job.data.location}** · ${formatSpan(job.data.start, job.data.end)}`,
  ];

  const note = multiRoleNote(job) ?? JOB_NOTES[job.slug]?.before;
  if (note) lines.push('', note);

  const bullets = [...job.data.highlights, ...job.data.highlightsExtended];
  if (bullets.length > 0) {
    lines.push('', '```text', ...bullets.map((b) => `• ${b}`), '```');
  }

  const after = JOB_NOTES[job.slug]?.after;
  if (after) lines.push('', after);

  return lines.join('\n');
}

function renderEducationSection(education) {
  const lines = ['## Education', ''];
  for (const entry of education) {
    lines.push(
      `**${entry.data.school}** · ${entry.data.degree}, ${entry.data.field} · ${entry.data.end.slice(0, 4)}`,
    );
    if (entry.data.honors.length > 0) {
      lines.push(
        '',
        `The ${entry.data.end.slice(0, 4)} GPA and Dean's List entries are recorded in ` +
          `\`src/content/education/${entry.slug}.md\` and deliberately not shown — fifteen years ` +
          'into a career they are not load-bearing. Same call on LinkedIn: leave the honors fields ' +
          'empty.',
      );
    }
  }
  return lines.join('\n');
}

async function buildDocument() {
  const jobs = await loadResumeJobs();
  const education = await loadEducation();
  const marvelSnapCredit = await loadMarvelSnapCreditUrl();

  return (
    [
      '# LinkedIn — paste-ready copy',
      '',
      '**Generated by `scripts/build-linkedin.mjs` — do not edit by hand.** Run ' +
        '`npm run build:linkedin` after changing `src/content/jobs/*.md` or ' +
        '`src/content/education/*.md`, then commit the result.',
      '',
      '**This is copy for Ali to paste in herself, not a sync.** Nothing automated touches the ' +
        'LinkedIn account: an agent logging into a personal profile is an account-access boundary ' +
        "worth keeping bright, and LinkedIn's own terms are unfriendly to it besides. So this file " +
        'is the handoff format.',
      '',
      '**Where the Experience and Education sections come from.** Straight off the `jobs` and ' +
        '`education` collections — company, title, location, dates, and the `highlights` + ' +
        '`highlightsExtended` bullets, i.e. exactly the two-page resume at `/resume/full`. LinkedIn ' +
        'has no page limit, so it gets the long version. When a bullet changes in the collection, ' +
        'regenerate this file rather than editing LinkedIn from memory.',
      '',
      '**The Headline and About sections below are hand-authored**, not derived — they are ' +
        "LinkedIn-specific prose, not resume bullets, so there's nothing in the collections to " +
        'generate them from. Revisit them by editing `HEADLINE_OPTIONS` and `ABOUT` in the ' +
        'generator script.',
      '',
      '---',
      '',
      '## Headline',
      '',
      "220 characters max. Three options, most conservative first — pick one, they're all true.",
      '',
      ...HEADLINE_OPTIONS.map((h, i) => `${i + 1}. \`${h}\``),
      '',
      'Option 1 is what LinkedIn defaults to and says the least. Option 2 carries the shipped ' +
        'credit, which is the thing a recruiter scanning a list actually stops on.',
      '',
      '---',
      '',
      '## About',
      '',
      '2,600 characters max; this runs about 1,900.',
      '',
      '```text',
      ABOUT,
      '```',
      '',
      '---',
      '',
      jobs.map((job) => renderJobSection(job)).join('\n\n---\n\n'),
      '',
      '---',
      '',
      renderEducationSection(education),
      '',
      '---',
      '',
      '## Featured / links',
      '',
      `- \`https://aliwallick.com\` — the site`,
      '- `https://aliwallick.com/resume.pdf` — one-page resume',
      `- \`${marvelSnapCredit}\` — the official Marvel Snap credit, listed as Senior Software ` +
        'Engineer I. Worth linking rather than asserting.',
      '',
      '---',
      '',
      '## Notes',
      '',
      "- **The résumé's Tools line has no workflow tooling** — version control, CI, profiling. " +
        "It's derived strictly from each job's `tech` field, same as the skills implied above. " +
        'Tracked as [#39](https://github.com/ali-wallick/Portfolio/issues/39), not fixed here.',
      '- **The 2024–present Godot work is a single clause** in the Second Dinner bullets above, ' +
        'same as the resume. Tracked as [#37](https://github.com/ali-wallick/Portfolio/issues/37); ' +
        'the Phase 3 ceiling in `WHAT_NOT_TO_DO` governs whatever gets added.',
      '',
      '---',
      '',
      '## What not to do here',
      '',
      WHAT_NOT_TO_DO,
    ].join('\n') + '\n'
  );
}

// ---------------------------------------------------------------------------

const generated = await buildDocument();

if (CHECK_ONLY) {
  if (!existsSync(OUT_FILE)) {
    console.error(`✗ ${path.relative(ROOT, OUT_FILE)} does not exist.`);
    console.error('  Run: npm run build:linkedin');
    process.exit(1);
  }
  const committed = await readFile(OUT_FILE, 'utf8');
  if (committed !== generated) {
    console.error(`✗ ${path.relative(ROOT, OUT_FILE)} is stale.`);
    console.error('  Job or education content changed since it was last generated.');
    console.error('  Run: npm run build:linkedin   (then commit docs/LINKEDIN.md)');
    process.exit(1);
  }
  console.log(`✓ ${path.relative(ROOT, OUT_FILE)} is current.`);
  process.exit(0);
}

await writeFile(OUT_FILE, generated);
console.log(`✓ wrote ${path.relative(ROOT, OUT_FILE)} from the jobs and education collections.`);

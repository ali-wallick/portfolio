#!/usr/bin/env node
/**
 * Turns a `check-links-external.mjs --report` file into exactly one GitHub
 * issue. Run by `.github/workflows/link-check.yml` after the monthly check;
 * see #275.
 *
 * ## Only the dead bucket may file anything
 *
 * The check buckets three ways for a reason recorded in its own header: a host
 * answering 401/403/405/406/429/999 to a script is UNVERIFIABLE, not dead, and
 * LinkedIn answers that way every single time. A job that filed on those would
 * cry wolf monthly until it was ignored, which is worse than not having it.
 * So `unverifiable` reaches an issue only as a count, inside an issue that a
 * genuinely dead link already justified.
 *
 * ## One issue, four transitions
 *
 *   dead > 0, no open issue   create it
 *   dead > 0, issue open      rewrite the body; comment ONLY if the dead set
 *                             changed. An edit does not notify, and a monthly
 *                             "still dead" comment on an issue Ali has not got
 *                             to yet is the same crying-wolf in a second form.
 *   dead = 0, issue open      comment and close
 *   dead = 0, no open issue   nothing at all. No all-clear notification.
 *
 * "Changed?" is a fact rather than a diff of prose: the body carries a
 * fingerprint of the sorted dead URLs in an HTML comment, and this reads it
 * back.
 *
 * ## Why closing is safe here
 *
 * A remediated link LEAVES the checker's input. `dead: true` renders a link as
 * plain text with no `href` (LinkList.astro), and a dead video hero renders its
 * `poster` instead of the iframe (Media.astro) — so the URL is no longer in the
 * built HTML this check reads. A clean run therefore means the fix shipped, not
 * that somebody else's server came back. That property is what makes an
 * auto-close honest; if it ever stops being true, this script has to stop
 * closing.
 *
 * Usage:
 *   node scripts/report-link-rot.mjs <report.json>
 *   node scripts/report-link-rot.mjs <report.json> --dry-run [--simulate-open <fp|none>]
 *
 * `--simulate-open` is dry-run only, and exists because `schedule` and
 * `workflow_dispatch` both refuse to run a workflow that is not on the default
 * branch — so all four transitions have to be provable before merge, from a
 * machine with no issue to look at.
 */

import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const LABEL = 'link-rot';
const TITLE = 'Dead outbound links found by the scheduled check';
const MARKER = 'link-rot-fingerprint';

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const simulateAt = argv.indexOf('--simulate-open');
const simulate = simulateAt === -1 ? undefined : argv[simulateAt + 1];
const reportPath = argv.find((a) => !a.startsWith('--') && a !== simulate);

if (!reportPath) {
  console.error('Usage: node scripts/report-link-rot.mjs <report.json> [--dry-run]');
  process.exit(1);
}
if (simulate !== undefined && !dryRun) {
  console.error('✗ --simulate-open is only meaningful with --dry-run.');
  process.exit(1);
}

const report = JSON.parse(await readFile(reportPath, 'utf8'));
const dead = report.dead ?? [];

/** Sorted dead URLs, hashed. Stable across reruns; changes when the set does. */
function fingerprint(entries) {
  const urls = entries
    .map((d) => d.url)
    .sort()
    .join('\n');
  return createHash('sha256').update(urls).digest('hex').slice(0, 12);
}

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8' });
}

/** The one open `link-rot` issue, or null. */
function findOpenIssue() {
  if (simulate !== undefined) {
    return simulate === 'none' ? null : { number: 0, fingerprint: simulate };
  }
  let raw;
  try {
    raw = gh(['issue', 'list', '--label', LABEL, '--state', 'open', '--json', 'number,body']);
  } catch (e) {
    // In a real run this is fatal: acting on "no issue" when the lookup simply
    // failed would file a duplicate every month.
    if (!dryRun) throw e;
    console.warn(`⚠ could not query GitHub (${e.message.trim()}); assuming no open issue.`);
    return null;
  }
  const [issue] = JSON.parse(raw);
  if (!issue) return null;
  const found = issue.body?.match(new RegExp(`<!-- ${MARKER}: ([0-9a-f]+) -->`));
  return { number: issue.number, fingerprint: found?.[1] };
}

const runUrl =
  process.env.GITHUB_RUN_ID && process.env.GITHUB_REPOSITORY
    ? `${process.env.GITHUB_SERVER_URL ?? 'https://github.com'}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : undefined;

const runLine = [
  `Checked ${report.checked} outbound URLs on ${report.generatedAt?.slice(0, 10) ?? 'an unknown date'}`,
  runUrl ? `([run log](${runUrl}))` : undefined,
]
  .filter(Boolean)
  .join(' ');

function buildBody(entries) {
  const rows = entries.map(
    (d) =>
      `| ${d.url} | ${d.detail}${d.note ? ` <br><sub>${d.note}</sub>` : ''} | ${(d.pages ?? []).join('<br>') || '—'} |`,
  );
  const unverifiable = report.counts?.unverifiable ?? 0;
  return [
    `${entries.length === 1 ? 'One outbound link looks' : `${entries.length} outbound links look`} genuinely gone.`,
    '',
    '| Link | Result | On |',
    '| --- | --- | --- |',
    ...rows,
    '',
    'Fix by updating the URL, swapping in a Wayback snapshot, or setting `dead: true` on the link in the ' +
      "project's front matter — see `src/content.config.ts`. A `dead: true` link renders as plain text with no " +
      '`href`, so the fix removes the URL from the built site and the next scheduled run closes this issue.',
    '',
    unverifiable > 0
      ? `${unverifiable} other link${unverifiable === 1 ? ' was' : 's were'} unverifiable — a host answering, but ` +
        'not to a script. LinkedIn always is. That is not evidence of rot and is never why this issue exists; ' +
        'the run log lists them.'
      : undefined,
    '',
    runLine,
    '',
    `<!-- ${MARKER}: ${fingerprint(entries)} -->`,
  ]
    .filter((line) => line !== undefined)
    .join('\n');
}

/** `gh issue create --label` fails on a label that does not exist yet. */
function ensureLabel() {
  gh([
    'label',
    'create',
    LABEL,
    '--color',
    'B60205',
    '--description',
    'An outbound link on the site is gone (filed by the scheduled link check)',
    '--force',
  ]);
}

function act(what, run) {
  if (dryRun) {
    console.log(`[dry run] ${what}`);
    return;
  }
  console.log(what);
  run();
}

const open = findOpenIssue();

if (dead.length === 0) {
  if (!open) {
    console.log('✓ no dead outbound links, and no open issue. Nothing to do.');
  } else {
    act(`Closing #${open.number} — the scheduled check came back clean.`, () => {
      gh([
        'issue',
        'close',
        String(open.number),
        '--reason',
        'completed',
        '--comment',
        `Every link this issue listed is gone from the built site, so the fix shipped.\n\n${runLine}`,
      ]);
    });
  }
} else if (!open) {
  const body = buildBody(dead);
  act(`Opening an issue for ${dead.length} dead link(s).`, () => {
    ensureLabel();
    gh(['issue', 'create', '--title', TITLE, '--label', LABEL, '--body', body]);
  });
  if (dryRun) console.log(`\n--- body ---\n${body}\n--- end ---`);
} else {
  const body = buildBody(dead);
  const changed = open.fingerprint !== fingerprint(dead);
  act(
    changed
      ? `Updating #${open.number} and commenting — the dead set changed.`
      : `Updating #${open.number} quietly — same ${dead.length} dead link(s) as last run.`,
    () => {
      gh(['issue', 'edit', String(open.number), '--body', body]);
      if (changed) {
        gh([
          'issue',
          'comment',
          String(open.number),
          '--body',
          `The scheduled check found a different set of dead links. Updated above.\n\n${runLine}`,
        ]);
      }
    },
  );
  if (dryRun) console.log(`\n--- body ---\n${body}\n--- end ---`);
}

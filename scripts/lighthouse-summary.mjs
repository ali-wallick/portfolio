#!/usr/bin/env node
/**
 * Print Lighthouse category scores as a table, and on failure the specific
 * audits that cost points.
 *
 * Exists because the uploaded artifact turned out to be unretrievable, and a
 * gate whose numbers you cannot read when it fails is only half a gate. Numbers
 * in the job log need no download and no artifact retention.
 *
 * Usage: node scripts/lighthouse-summary.mjs [report-dir]
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const DIR = path.resolve(process.argv[2] ?? 'lighthouse-report');

if (!existsSync(DIR)) {
  console.log(`No Lighthouse reports at ${DIR} — nothing to summarise.`);
  process.exit(0);
}

const reports = readdirSync(DIR).filter((f) => /^lhr-.*\.json$/.test(f));
if (reports.length === 0) {
  console.log(`No lhr-*.json in ${DIR} — nothing to summarise.`);
  process.exit(0);
}

/** @type {Map<string, {scores: Record<string, number[]>, audits: Map<string, string>}>} */
const byPage = new Map();

for (const file of reports) {
  const lhr = JSON.parse(readFileSync(path.join(DIR, file), 'utf8'));
  const page = new URL(lhr.finalDisplayedUrl ?? lhr.finalUrl).pathname;
  if (!byPage.has(page)) byPage.set(page, { scores: {}, audits: new Map() });
  const entry = byPage.get(page);

  for (const [key, category] of Object.entries(lhr.categories)) {
    (entry.scores[key] ??= []).push(category.score ?? 0);
    // Record which audits actually failed, so a red build explains itself.
    for (const ref of category.auditRefs ?? []) {
      const audit = lhr.audits?.[ref.id];
      if (!audit || audit.score === null || audit.score >= 0.9) continue;
      if (audit.scoreDisplayMode === 'notApplicable') continue;
      entry.audits.set(ref.id, audit.title);
    }
  }
}

const CATS = ['performance', 'accessibility', 'best-practices', 'seo'];
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const cell = (n) => (n === undefined ? '   — ' : n.toFixed(2).padStart(5));

const width = Math.max(4, ...[...byPage.keys()].map((p) => p.length));
console.log(`${'page'.padEnd(width)}  ${CATS.map((c) => c.slice(0, 5).padStart(5)).join('  ')}`);
console.log('-'.repeat(width + CATS.length * 7 + 2));

for (const [page, { scores }] of [...byPage].sort()) {
  const row = CATS.map((c) => cell(scores[c] ? mean(scores[c]) : undefined)).join('  ');
  console.log(`${page.padEnd(width)}  ${row}`);
}

const withFailures = [...byPage].filter(([, v]) => v.audits.size > 0);
if (withFailures.length > 0) {
  console.log('\nAudits below 0.9:');
  for (const [page, { audits }] of withFailures) {
    console.log(`\n  ${page}`);
    for (const [id, title] of audits) console.log(`    - ${id}: ${title}`);
  }
}

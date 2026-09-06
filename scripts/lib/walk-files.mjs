/**
 * Recursively list every file under a directory.
 *
 * Extracted from `scripts/check-links.mjs`, `scripts/check-links-external.mjs`
 * and `scripts/strip-lighthouse-beacon.mjs`, which each wrote this loop by
 * hand — two of them byte-identical, the third a sync variant that also
 * filtered to `.html`. One copy here, filtered by each caller instead.
 *
 * `strip-lighthouse-beacon.mjs` runs with no `npm ci` in the CI Lighthouse
 * job (see CLAUDE.md's "Working here"), so this file must keep needing
 * nothing from `node_modules` — Node builtins only.
 */

import { readdir } from 'node:fs/promises';
import path from 'node:path';

/** Every file path under `dir`, recursing into subdirectories. */
export async function walkFiles(dir) {
  /** @type {string[]} */
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walkFiles(full)));
    else files.push(full);
  }
  return files;
}

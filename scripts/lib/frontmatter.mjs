/**
 * Read a content collection's front matter without booting Astro.
 *
 * Extracted from scripts/build-linkedin.mjs (#114), which had the only copy,
 * so that scripts/build-pdf.mjs's staleness hash could read the same thing.
 * Two scripts parsing front matter two different ways is the shape this repo
 * avoids everywhere else.
 *
 * This deliberately does NOT validate — src/content.config.ts is the contract,
 * and the build enforces it. What callers get here is the same data the schema
 * would parse, minus the comments and formatting that never survive parsing.
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

/** The parsed front matter of one `.md` file. */
export async function readFrontmatter(file) {
  const raw = await readFile(file, 'utf8');
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error(`no front matter in ${file}`);
  return parseYaml(match[1]);
}

/** `[{ slug, data }]` for every `.md` in `dir`, sorted by filename. */
export async function readEntries(dir) {
  const files = (await readdir(dir)).filter((f) => f.endsWith('.md')).sort();
  const entries = [];
  for (const file of files) {
    entries.push({
      slug: file.replace(/\.md$/, ''),
      data: await readFrontmatter(path.join(dir, file)),
    });
  }
  return entries;
}

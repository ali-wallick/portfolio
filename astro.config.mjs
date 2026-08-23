// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';

const SITE_HOST = new URL('https://aliwallick.com').host;

/**
 * Opens markdown body links to a different origin in a new tab — the same
 * rule `src/lib/links.ts` applies to hand-written `<a>` tags in components,
 * so a project write-up and a project's LinkList agree on what counts as
 * external without either one having to remember the other exists. No
 * dependency needed: hast nodes are just `{ tagName, properties, children }`,
 * so a plain recursive walk covers it.
 *
 * @returns {(tree: any) => void}
 */
function rehypeExternalLinks() {
  /** @param {any} node */
  const visit = (node) => {
    if (node.type === 'element' && node.tagName === 'a' && node.properties?.href) {
      const href = String(node.properties.href);
      if (/^https?:\/\//.test(href) && new URL(href).host !== SITE_HOST) {
        node.properties.target = '_blank';
        node.properties.rel = ['noopener', 'noreferrer'];
      }
    }
    node.children?.forEach(visit);
  };
  return (tree) => tree.children.forEach(visit);
}

// https://astro.build/config
export default defineConfig({
  site: 'https://aliwallick.com',

  // Static output. Cloudflare Pages serves `dist/` directly — no adapter,
  // no server runtime, nothing to keep alive. (Phase 2 decision; see CLAUDE.md.)
  output: 'static',

  // Old DreamHost URLs were extensionless (`/about`, `/projects/critter`)
  // via .htaccess rewrites. `trailingSlash: 'never'` + `format: 'file'`
  // reproduces that exactly, so Phase 6's redirect map stays small.
  trailingSlash: 'never',
  build: {
    format: 'file',
  },

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
    processor: unified({ rehypePlugins: [rehypeExternalLinks] }),
  },
});

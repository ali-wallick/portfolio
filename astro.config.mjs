// @ts-check
import { defineConfig } from 'astro/config';

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
  },
});

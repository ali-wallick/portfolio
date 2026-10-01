# Security policy

This is a personal portfolio: a static site built with Astro and served from Cloudflare. It has no
backend, no forms, no accounts and no user data, so the realistic things to report are small:

- a vulnerable dependency that Dependabot hasn’t caught
- a secret, or a personal detail that shouldn’t be public, in the repo or its history
- a problem with the deployed site’s headers, or a link on it that leads somewhere it shouldn’t

## Reporting

Please don’t open a public issue for any of those.

Use GitHub’s [private vulnerability reporting](https://github.com/ali-wallick/portfolio/security/advisories/new),
or email [contact@aliwallick.com](mailto:contact@aliwallick.com).

I’m one person and this isn’t my day job, so I can’t promise a response time. I’ll reply when I can,
and I’ll say so if I can’t fix something quickly.

## Supported versions

Only what’s live at [aliwallick.com](https://aliwallick.com), which is the `release` branch. Older
commits and the `v1-legacy` tag aren’t maintained.

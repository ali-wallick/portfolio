# The launch runbook

**One document, one order, for the DNS cutover.** Point `aliwallick.com` at the new site without
breaking Ali's email.

This is the procedure. **What's still open is tracked in the
[`Launch` milestone](https://github.com/ali-wallick/Portfolio/milestone/3)**, not here — the same
split CLAUDE.md draws everywhere else: this file says _how_, the issues say _what's left_. Issue
numbers below are pointers, not a second copy of their contents.

Before this existed, the order lived in [#34](https://github.com/ali-wallick/Portfolio/issues/34)'s
body plus an appended amendment section that corrected steps out of sequence, and the one step it
delegated to `docs/CLOUDFLARE.md` landed on a section titled _"Do NOT add a custom domain yet."_
Fixed here.

---

## Before you start

**Do it deliberately, and don't let it ride along at the end of a long session.** This is the only
step in the project with a blast radius outside the repo — Ali's mail runs on this domain.

Three things should be true before step 1. None of them is "every other issue is closed" — per
[#21](https://github.com/ali-wallick/Portfolio/issues/21) the cutover is its own moment and is not
gated on the `Pre-launch` milestone emptying.

| Precondition                                                                                                        | Why                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#55](https://github.com/ali-wallick/Portfolio/issues/55) closed — `verify-dns.sh` exits 0                          | It's the tool you reach for in steps 1 and 9. Re-baselined 2026-08-27, and every assertion in it is now written to hold both before _and_ after the cutover — so a non-zero exit at step 9 is a real signal rather than the expected noise it used to be. **Run it anyway at step 1 and confirm it exits 0**; that is the point of the precondition. |
| [#132](https://github.com/ali-wallick/Portfolio/issues/132) answered — what `/resources/WallickAli-Resume.pdf` does | It's indexed by Google with a PO Box in the result title, and right now it 404s at cutover by omission rather than by choice.                                                                                                                                                                                                                        |
| [#128](https://github.com/ali-wallick/Portfolio/issues/128) done — final review                                     | Last look at the site while it's still cheap to fix.                                                                                                                                                                                                                                                                                                 |

### Facts you'll need in front of you

| Thing                  | Value                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| Worker                 | `portfolio`                                                                                |
| Production branch      | **`release`** — not `main`. See `docs/CLOUDFLARE.md`.                                      |
| Apex `A` record today  | `173.236.243.216` (DreamHost) — **re-read it live, don't trust this number**               |
| `www` `A` record today | `173.236.243.216` (DreamHost)                                                              |
| Mail                   | iCloud+, `MX 10 mx01/mx02.mail.icloud.com` — **untouched by this procedure**               |
| Addresses to verify    | `ali@aliwallick.com` and `contact@aliwallick.com`                                          |
| The noindex flag       | `export const live = false` at `src/config/site.ts:48`                                     |
| Apex / `www` TTL today | **300s** (Cloudflare "Auto"), measured 2026-08-27 — so step 3's wait is minutes, not hours |

**`workers_dev` is `false`**, so production has no public URL of its own before step 5. That's why
step 4 can't be verified by browsing to it and has to be verified from the build log.

---

## The order

### 1. Confirm mail works, both directions

Send _and_ receive on both `ali@` and `contact@aliwallick.com`. Capture the working state **before**
touching anything, so that if something looks wrong in step 9 you know whether this procedure caused
it.

```bash
./infra/verify-dns.sh
```

Requires #55 closed, and must exit 0. If it doesn't, stop — re-baselining mid-cutover means deciding
what "correct" looks like at the exact moment you most need a reference you already trust.

### 2. Record the rollback values

```bash
dig +short aliwallick.com A @dilbert.ns.cloudflare.com
dig +short www.aliwallick.com A @dilbert.ns.cloudflare.com
```

**Write down what comes back, and the TTLs.** Once Cloudflare overwrites the apex record in step 5,
this repo is the only place the old value survives. This is the revert target.

### 3. Lower the TTLs, then wait

Drop the apex and `www` record TTLs to the minimum in the Cloudflare dashboard and **let the previous
TTL elapse before continuing** — otherwise resolvers are still holding the old value at the length
you were trying to shorten.

This cuts both the propagation wait in step 7 and, more to the point, the time a rollback takes to
bite. Raise them back after step 9.

### 4. Flip `live`, and ship it to `release`

Two commits, one merge, in this order:

1. **Flip the flag** ([#74](https://github.com/ali-wallick/Portfolio/issues/74)):
   `export const live = true` in `src/config/site.ts`. That single constant un-noindexes every page
   (`BaseLayout.astro:98`) _and_ opens `robots.txt`'s crawl directives _and_ adds its `Sitemap:` line
   (`robots.txt.ts:15`). Don't also hand-edit `robots.txt` — it's downstream. Merge to `main` the
   normal way, via a PR.
2. **Merge `main` → `release`.** _This push is the production deploy_ — Workers Builds runs
   `wrangler deploy` off `release`.

Nothing is publicly reachable yet, which is what makes doing this before the DNS change safe.

**Confirm the build goes green in the Workers Builds log before continuing.** Not by browsing to it —
there's nowhere to browse to yet.

> `release` has historically run far behind `main` (80 commits, last measured 2026-08-27). A large
> diff here is expected, not a symptom.

### 5. Attach the apex as a Custom Domain

**Delete the apex `A` record first** (the DreamHost one from step 2), then attach the domain. A
Custom Domain makes Cloudflare create the DNS record and issue the certificate itself, and it will
not sit on top of a conflicting record you left behind.

Dashboard: **Workers & Pages → `portfolio` → Settings → Domains & Routes → Add → Custom Domain →**
`aliwallick.com`.

**This is the irreversible step.** Everything before it was reversible by doing nothing.

**Mail is not affected.** A Custom Domain creates a proxied address record on the apex; `MX`, `SPF`,
DKIM and DMARC are different record types and are not touched. That's worth knowing _before_ you do
it, because it's the part that feels dangerous and isn't.

> **Codify it afterwards, not now.** Custom Domains can live in `wrangler.jsonc` as
> `"routes": [{ "pattern": "aliwallick.com", "custom_domain": true }]`, and they _should_ end up
> there for the same reason `workers_dev: false` is there — dashboard state gets silently undone by
> the next `wrangler deploy`. But adding it before step 4 collapses steps 4 and 5 into one event and
> takes away your chance to confirm the build is green before DNS moves. Dashboard first, commit the
> config after step 9.

### 6. Handle `www`

**Settled on [#193](https://github.com/ali-wallick/Portfolio/issues/193): the apex is the real
address, and `www` 301s to it.** Both hostnames work after this step — typing `www` lands on the
right page rather than failing. It just doesn't stay there.

1. Replace the `www` `A` record with a **proxied** `A` record pointing at `192.0.2.0` — the reserved
   placeholder for originless setups. Proxied is the load-bearing word: requests never reach that
   address, Cloudflare intercepts them.
2. Add a **Single Redirect** rule (Rules → Redirect Rules) matching `http.host eq "www.aliwallick.com"`,
   to `https://aliwallick.com` **preserving path and query**, 301.

A Custom Domain matches its hostname exactly, so attaching the apex in step 5 does nothing for `www`.
And `public/_redirects` can't do this — it matches paths, not hosts.

**301, not 302.** The status code is what tells Google the two hostnames are one site and consolidates
the old `www` URLs' ranking onto the apex. A `www` that merely also served the site, with no redirect,
is the duplicate-content bug #193 was filed about.

### 7. Confirm the site serves

```bash
curl -sI https://aliwallick.com | head -1
curl -s https://aliwallick.com/robots.txt
curl -sI https://www.aliwallick.com/projects/firefall | head -3
```

- Apex serves over **HTTPS**, with a valid certificate.
- `robots.txt` reads `Allow: /` and names the sitemap — if it still says `Disallow`, step 4's flag
  didn't ship.
- No `<meta name="robots" content="noindex">` in the page source.
- `www` 301s **to the same path**, not to the homepage.

**This curl is the only check that covers `www`, on purpose.** Once `www` is proxied, `dig` returns
Cloudflare's anycast addresses rather than the `192.0.2.0` placeholder — even against the authoritative
nameserver — so there is no IP for `verify-dns.sh` to assert. #193 settled that it checks only that `www`
still resolves, and the redirect is verified here at the HTTP level where it is actually visible.

### 8. Re-run the redirect map against the real domain

[#25](https://github.com/ali-wallick/Portfolio/issues/25) is closed, but it was only ever verified
against a preview URL. Every rule in `public/_redirects` is about old DreamHost URLs, and this is the
first time those URLs have resolved against the new site.

```bash
curl -sI https://aliwallick.com/projects/vegasBlvd | head -2
curl -sI https://aliwallick.com/blog | head -2
curl -sI https://aliwallick.com/resources/WallickAli-Resume.pdf | head -2
```

The third one is [#132](https://github.com/ali-wallick/Portfolio/issues/132) — confirm it does what
you decided it should do, rather than whatever it happens to do.

### 9. Re-verify mail, both directions

`MX` is untouched by this change, **which is exactly why it's easy to skip.** Do it anyway. Same test
as step 1, both addresses, both directions, plus:

```bash
./infra/verify-dns.sh
```

It should still exit 0 — with the apex now legitimately different from step 1's value, which is what
#55 re-baselines it to tolerate.

### 10. After it's up

- Raise the TTLs from step 3 back to normal.
- **Submit `https://aliwallick.com/sitemap.xml`** in Search Console.
  [#44](https://github.com/ali-wallick/Portfolio/issues/44) verified the domain as a property under
  Ali's own Google account specifically so data starts flowing from launch.
- **Confirm the Cloudflare Web Analytics beacon reports a pageview.** The token's in
  `src/config/site.ts` and `release` builds without drafts, so it should — but "should" and a number
  in the dashboard are different claims.
- Commit the Custom Domain into `wrangler.jsonc` (see step 5's note).
- Replace `docs/CLOUDFLARE.md`'s "Do NOT add a custom domain yet" section with a pointer here.
- Close [#34](https://github.com/ali-wallick/Portfolio/issues/34),
  [#74](https://github.com/ali-wallick/Portfolio/issues/74), and the rest of the milestone.

---

## Rollback

**The old site is still up, and that's deliberate.**
[#51](https://github.com/ali-wallick/Portfolio/issues/51) (retire WordPress) and
[#52](https://github.com/ali-wallick/Portfolio/issues/52) (close out DreamHost) are in `Post-launch`
for this reason: **do not tear down DreamHost until this runbook has been completed and the new site
confirmed good.**

To revert: delete the Custom Domain from the `portfolio` Worker, and recreate the apex `A` record
with the value from **step 2**. With step 3's lowered TTLs this takes minutes rather than hours.

Mail needs no rollback, because nothing here touched it. If mail _does_ look broken at step 9, that
is a signal to stop and diagnose rather than to revert — the cause is somewhere other than this
procedure.

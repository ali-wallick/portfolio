# `infra/` — DNS and mail

The zone for `aliwallick.com`, the tooling that checks it, and the record of how it got here.

**Phase 1 is closed.** Registrar, DNS and email moved to Cloudflare + iCloud+ on 2026-08-16, six
weeks ahead of the GoDaddy renewal, and `CLAUDE.md`'s **Don't touch** rule covers all three. Read
this to understand the zone or to verify it; don't re-run a migration that has already happened. The
narrative is in [`docs/REBUILD-LOG.md`](../docs/REBUILD-LOG.md) under Phase 1, and the step-by-step
that produced it is in git history at `git show 0eec28f:infra/PHASE-1-RUNBOOK.md`.

## The zone as it stands

Verified live 2026-08-27, re-baselined the same day ([#55](https://github.com/ali-wallick/portfolio/issues/55)) and updated again after the cutover ([#34](https://github.com/ali-wallick/portfolio/issues/34)) the same evening.

| Name                   | Type   | Value                                                                                              | Notes                                                                                                                                                                                               |
| ---------------------- | ------ | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aliwallick.com`       | NS     | `dilbert` / `adele.ns.cloudflare.com.`                                                             | Cloudflare                                                                                                                                                                                          |
| `aliwallick.com`       | AAAA   | `100::`, **proxied**                                                                               | **The site.** Written by the `portfolio` Worker's Custom Domain at the cutover, not by hand — the dashboard shows it as a `Worker` row. Codified in `wrangler.jsonc`.                               |
| `aliwallick.com`       | MX     | `10 mx01` / `10 mx02.mail.icloud.com.`                                                             | **Mail. Do not break.**                                                                                                                                                                             |
| `aliwallick.com`       | TXT    | `v=spf1 mx include:netblocks.dreamhost.com include:relay.mailchannels.net include:icloud.com -all` | Tightened to `-all` 2026-08-22 ([#42](https://github.com/ali-wallick/portfolio/issues/42), closed). Two dead includes remain, tracked as [#43](https://github.com/ali-wallick/portfolio/issues/43). |
| `aliwallick.com`       | TXT    | `apple-domain=…`                                                                                   | iCloud+ custom-domain proof.                                                                                                                                                                        |
| `aliwallick.com`       | TXT    | `google-site-verification=SNE4…`                                                                   | **Re-verified under Ali's own account** ([#44](https://github.com/ali-wallick/portfolio/issues/44), closed). Not the DreamHost-era value — that one is gone.                                        |
| `sig1._domainkey`      | CNAME  | `sig1.dkim.…icloudmailadmin.com.`                                                                  | DKIM, confirmed passing 2026-08-16.                                                                                                                                                                 |
| `_dmarc`               | TXT    | `v=DMARC1; p=none; rua=mailto:contact@aliwallick.com`                                              | Added 2026-08-22 ([#41](https://github.com/ali-wallick/portfolio/issues/41), closed). Monitoring only — never existed here or on DreamHost.                                                         |
| `www`                  | A      | `192.0.2.0`, **proxied**                                                                           | Originless placeholder. Requests never reach it; a zone-level Single Redirect rule 301s `www` to the apex, path and query preserved ([#193](https://github.com/ali-wallick/portfolio/issues/193)).  |
| `mail`                 | A / MX | `64.90.62.162`, MailChannels                                                                       | **Leftover.** Nothing sends through it now.                                                                                                                                                         |
| `autoconfig`           | CNAME  | `autoconfig.dreamhost.com.`                                                                        | **Leftover.** Mail-client auto-setup for a mailbox that's gone.                                                                                                                                     |
| `ftp`                  | A      | `173.236.243.216`                                                                                  | **Leftover.** DreamHost FTP, unused.                                                                                                                                                                |
| `dreamhost._domainkey` | TXT    | DKIM, 2 strings                                                                                    | **Leftover.** The superseded key; `sig1` is the live one.                                                                                                                                           |

**Four leftovers, not two.** The re-baseline (#55) found `ftp` and the superseded `dreamhost._domainkey`
alongside the two already recorded. All four are the same family of staleness as the dead SPF includes
in [#43](https://github.com/ali-wallick/portfolio/issues/43) and should go with it. `verify-dns.sh`
deliberately asserts none of them — see its closing comment for why asserting either their presence or
their absence would be wrong.

**They survived the cutover on purpose, and the sequencing is not arbitrary.** #43 is blocked on
[#51](https://github.com/ali-wallick/portfolio/issues/51) rather than on the cutover, because
WordPress can still originate mail through `wp_mail()` until it is gone — pulling the SPF includes
while it can send is how you get a silent delivery failure. `ftp` is the one worth keeping longest:
retiring the WordPress install may well mean reaching DreamHost over FTP to retrieve files first.
Delete it and you have removed a route to the thing you are still working on.

## The files

| File                                                   | What it's for                                                                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `capture-dns-baseline.sh`                              | Re-runnable, read-only capture of the authoritative zone. **Its probe list is hand-maintained** — see the warning below. |
| `dns-baseline-aliwallick.com.txt`                      | **The current zone**, captured 2026-08-27 from Cloudflare. What `verify-dns.sh` reads.                                   |
| `dns-baseline-aliwallick.com.dreamhost-2026-08-16.txt` | **The pre-migration DreamHost zone.** A historical record, and the only copy. Never overwrite it.                        |
| `verify-dns.sh`                                        | Asserts the zone is intact, mail above all. Exit 0 = safe to proceed.                                                    |

```bash
./infra/verify-dns.sh                          # check public resolution
./infra/verify-dns.sh dilbert.ns.cloudflare.com  # check one nameserver directly
```

### `verify-dns.sh` exits 0, and every assertion in it must survive the cutover

Re-baselined 2026-08-27, closing [#55](https://github.com/ali-wallick/portfolio/issues/55). It used
to print `STOP` for three expected reasons — the iCloud MX records and the amended SPF, i.e. the
changes Phase 1 existed to make. The script was right; its reference point was a world that had been
deliberately replaced.

**The lesson generalises, and it is the reason the rewritten script is shaped the way it is.** The
danger was never believing the `STOP`; it was learning to ignore it, because three expected failures
is exactly the state in which a fourth, real one gets waved through — during the one irreversible
step in the project. So the standing rule is now: **every assertion must be true both before and
after the cutover, and an assertion known to break on a scheduled future change is the same bug in a
new costume.**

Three assertions are written as invariants rather than values for exactly that reason, each marked
`WHY` in the script:

| Instead of pinning            | It asserts                                                     | Because                                                                                                                       |
| ----------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| the full SPF string           | `v=spf1` + `include:icloud.com` + `-all`                       | [#43](https://github.com/ali-wallick/portfolio/issues/43) will remove two dead includes; pinning would schedule a false STOP. |
| the DKIM key's bytes          | key exists, is a `DKIM1` record, and has no whitespace in `p=` | Apple owns the key and may rotate it. See the DKIM trap below.                                                                |
| the apex and `www` `A` values | that they resolve at all                                       | Both legitimately change at the cutover. See below.                                                                           |

**The site's `A` records are asserted as "resolves", not as a value.** Before the cutover both are
DreamHost's `173.236.243.216`; after it the apex is a Custom Domain and `www` is a proxied
placeholder, so both answer with Cloudflare anycast addresses even against the authoritative
nameserver. There is no fixed IP left to assert.
[#193](https://github.com/ali-wallick/portfolio/issues/193) settled this for `www` and the same
reasoning covers the apex. Whether the hostname serves the **right site** is an HTTP question, and
[`docs/LAUNCH.md`](../docs/LAUNCH.md) step 7 checks it there, where it is actually visible.

### ⚠️ `dig` is intercepted on Ali's machine — read DNS over HTTPS instead

Found during the cutover (2026-08-27). `dig` from this machine does **not** reach the nameserver you
name. TTLs come back decrementing across repeated queries — 53, then 50, then 47 three seconds later
— which is a cache answering, not an authoritative server. It persists when querying Cloudflare's
nameservers _by IP_ with `+norecurse`, so something on the network path is intercepting port 53.

**This matters most at exactly the wrong moment.** A cutover is when someone reads a TTL by hand to
decide whether it is safe to continue, and an intercepted `dig` will quietly tell them the old value
is still live, or that a change they just made has not landed. During the launch it briefly made a
completed TTL change look like it had not applied.

Use DNS-over-HTTPS, and cross-check two resolvers:

```bash
curl -s -H 'accept: application/dns-json' \
  "https://cloudflare-dns.com/dns-query?name=aliwallick.com&type=A"
curl -s "https://dns.google/resolve?name=aliwallick.com&type=A"
```

**`verify-dns.sh` is not affected, and the reason is worth knowing rather than assuming.**
Interception corrupts TTLs, not record values. The script asserts values and resolvability and never
reads a TTL, so it stayed correct throughout the cutover and exited 0 on both sides of it. Don't
"fix" it to use DoH on the strength of this warning — the warning is about humans reading `dig`
output, not about the tool.

### ⚠️ `capture-dns-baseline.sh` is only as good as its probe list

AXFR is refused, so the zone is probed by name and **anything the list does not name is invisible.**
That is not hypothetical. Its `TXT_HOSTS` list was written against DreamHost and never updated, so
between the 2026-08-16 migration and 2026-08-27 every capture omitted `sig1._domainkey` — iCloud's
selector, and the zone's **only live DKIM record** — while still dutifully capturing
`dreamhost._domainkey`, the selector that had been replaced. A baseline that silently drops the
record you most need is worse than no baseline. **Add the selector when you add the provider.**

### The DKIM trap — now caught as an invariant, not a magic substring

DNS caps a single TXT string at 255 bytes, so a DKIM key is split across strings that rejoin with
**no separator**. A dashboard that rejoins them with a space produces a record that looks right and
silently fails signature validation — mail starts landing in spam with no obvious cause.

`verify-dns.sh` used to assert a hardcoded substring spanning that junction. **It doesn't any more,
and the change is a strengthening rather than a removal.** That assertion made sense when the key was
a TXT record Ali pasted by hand. It is a CNAME now: Apple publishes the key and can rotate it
whenever it likes, so pinning key bytes would turn a routine rotation into a `STOP`.

The bug is caught generically instead — **a base64 DKIM key contains no whitespace, so any space
inside `p=` is the bug**, for this key and every future one. Same trap, no brittleness, and it now
covers keys nobody has seen yet. (The old README said "keep the assertion; the string will change,
the trap won't." This is that instruction honoured, not overruled.)

**Assert both ends of a CNAME'd key.** The migration produced the failure that proves why: the first
test send passed SPF but returned `dkim=permerror (no key for signature)`. The CNAME was correct and
pointed at Apple's key host — Apple simply hadn't published the key yet. **A correct DNS record and a
working DNS record are not the same thing when a third party owns what it points at.** A retest an
hour later passed. So the script checks the CNAME (Ali's record) _and_ that a plausible key actually
resolves through it (Apple's).

## The pre-migration zone, for reference

What DreamHost served before 2026-08-16. Confirmed at capture: **no wildcard, no DMARC**, no AAAA,
no CAA, no SRV. AXFR is refused, so subdomains were probed by name — the probe list is in
`capture-dns-baseline.sh`.

| Name                   | Type   | Value                                                                           |
| ---------------------- | ------ | ------------------------------------------------------------------------------- |
| `aliwallick.com`       | A      | `173.236.243.216` (shared host `iad1-shared-b8-06`)                             |
| `aliwallick.com`       | MX     | `0 mx1` / `0 mx2.mailchannels.net.`                                             |
| `aliwallick.com`       | TXT    | `v=spf1 mx include:netblocks.dreamhost.com include:relay.mailchannels.net -all` |
| `dreamhost._domainkey` | TXT    | DKIM, 2 strings                                                                 |
| `www` / `ftp`          | A      | `173.236.243.216`                                                               |
| `mail`                 | A / MX | `64.90.62.162` / MailChannels                                                   |
| `autoconfig`           | CNAME  | `autoconfig.dreamhost.com.`                                                     |

Delegation was `ns1/ns2/ns3.dreamhost.com`. Record TTLs were **60s** — unusually low, which made
mistakes cheap to revert. Registrar NS records were 14400s, so the nameserver switch was the slow
part.

Note that the old SPF ended in `-all` (hardfail) and Apple's default ends in `~all` (softfail), which
is why #42 is a restoration rather than a hardening.

## Not here

- **The site cutover** — [#34](https://github.com/ali-wallick/portfolio/issues/34). Deploy setup is
  in [`docs/CLOUDFLARE.md`](../docs/CLOUDFLARE.md).
- **Retiring DreamHost** — [#52](https://github.com/ali-wallick/portfolio/issues/52), which also
  covers putting a second household domain on the same iCloud+ plan and carries what to know about
  iCloud+ before doing it.

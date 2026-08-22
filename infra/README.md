# `infra/` — DNS and mail

The zone for `aliwallick.com`, the tooling that checks it, and the record of how it got here.

**Phase 1 is closed.** Registrar, DNS and email moved to Cloudflare + iCloud+ on 2026-08-16, six
weeks ahead of the GoDaddy renewal, and `CLAUDE.md`'s **Don't touch** rule covers all three. Read
this to understand the zone or to verify it; don't re-run a migration that has already happened. The
narrative is in [`docs/REBUILD-LOG.md`](../docs/REBUILD-LOG.md) under Phase 1, and the step-by-step
that produced it is in git history at `git show 0eec28f:infra/PHASE-1-RUNBOOK.md`.

## The zone as it stands

Verified live 2026-08-20.

| Name              | Type   | Value                                                                                              | Notes                                                                                                                                                                                               |
| ----------------- | ------ | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aliwallick.com`  | NS     | `dilbert` / `adele.ns.cloudflare.com.`                                                             | Cloudflare                                                                                                                                                                                          |
| `aliwallick.com`  | A      | `173.236.243.216`                                                                                  | **Still DreamHost.** The site cutover is [#34](https://github.com/ali-wallick/Portfolio/issues/34).                                                                                                 |
| `aliwallick.com`  | MX     | `10 mx01` / `10 mx02.mail.icloud.com.`                                                             | **Mail. Do not break.**                                                                                                                                                                             |
| `aliwallick.com`  | TXT    | `v=spf1 mx include:netblocks.dreamhost.com include:relay.mailchannels.net include:icloud.com -all` | Tightened to `-all` 2026-08-22 ([#42](https://github.com/ali-wallick/Portfolio/issues/42), closed). Two dead includes remain, tracked as [#43](https://github.com/ali-wallick/Portfolio/issues/43). |
| `aliwallick.com`  | TXT    | `apple-domain=…`                                                                                   | iCloud+ custom-domain proof.                                                                                                                                                                        |
| `aliwallick.com`  | TXT    | `google-site-verification=…`                                                                       | Carried over from DreamHost, never re-checked ([#44](https://github.com/ali-wallick/Portfolio/issues/44)).                                                                                          |
| `sig1._domainkey` | CNAME  | `sig1.dkim.…icloudmailadmin.com.`                                                                  | DKIM, confirmed passing 2026-08-16.                                                                                                                                                                 |
| `_dmarc`          | —      | **absent**                                                                                         | Never existed here or on DreamHost ([#41](https://github.com/ali-wallick/Portfolio/issues/41)).                                                                                                     |
| `www`             | A      | `173.236.243.216`                                                                                  | DreamHost, same as apex.                                                                                                                                                                            |
| `mail`            | A / MX | `64.90.62.162`, MailChannels                                                                       | **Leftover.** Nothing sends through it now.                                                                                                                                                         |
| `autoconfig`      | CNAME  | `autoconfig.dreamhost.com.`                                                                        | **Leftover.** Mail-client auto-setup for a mailbox that's gone.                                                                                                                                     |

The two leftovers are the same family of staleness as #43 and should go with it.

## The files

| File                              | What it's for                                                                                         |
| --------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `capture-dns-baseline.sh`         | Re-runnable, read-only capture of the authoritative zone. Generic — no changes needed to re-baseline. |
| `dns-baseline-aliwallick.com.txt` | **The pre-migration DreamHost zone**, captured 2026-08-16. A historical record, and the only copy.    |
| `verify-dns.sh`                   | Diffs a candidate nameserver against the baseline. Exit 0 = every record matches.                     |

```bash
./infra/verify-dns.sh                          # check public resolution
./infra/verify-dns.sh dilbert.ns.cloudflare.com  # check one nameserver directly
```

### ⚠️ `verify-dns.sh` currently exits 1, and that is expected

Its baseline predates the migration, so it reports the iCloud MX records and the amended SPF as
failures — **the three changes Phase 1 existed to make.** The script is correct; its reference point
is a world that was deliberately replaced.

**This matters at cutover.** [#34](https://github.com/ali-wallick/Portfolio/issues/34) requires
verifying mail before and after, and this is the obvious tool to reach for. The danger isn't
believing the `STOP` — it's learning to ignore it, because three expected failures is exactly the
state in which a fourth, real one gets waved through. **Re-baseline first:
[#55](https://github.com/ali-wallick/Portfolio/issues/55).** Note that the expected set inside
`verify-dns.sh` is hand-derived, so a fresh baseline file alone will not fix it.

### The DKIM trap — why `verify-dns.sh` asserts a magic substring

DNS caps a single TXT string at 255 bytes, so a DKIM key is split across strings that rejoin with
**no separator**:

```
...c9E+eYr4Un | Jsu89oJkt9ilov3pnJMcep...
```

A dashboard that rejoins them with a space produces a record that looks right and silently fails
signature validation — mail starts landing in spam with no obvious cause. `verify-dns.sh` asserts the
junction substring `c9E+eYr4UnJsu89oJkt9ilov3pnJMcep` for that reason alone. Keep the assertion when
re-baselining; the string will change, the trap won't.

The related lesson, from the migration itself: the first test send passed SPF but returned
`dkim=permerror (no key for signature)`. The CNAME was correct and pointed at Apple's key host —
Apple simply hadn't published the key yet. **A correct DNS record and a working DNS record are not
the same thing when a third party owns what it points at.** A retest an hour later passed.

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

- **The site cutover** — [#34](https://github.com/ali-wallick/Portfolio/issues/34). Deploy setup is
  in [`docs/CLOUDFLARE.md`](../docs/CLOUDFLARE.md).
- **Retiring DreamHost** — [#52](https://github.com/ali-wallick/Portfolio/issues/52), which also
  covers putting a second household domain on the same iCloud+ plan and carries what to know about
  iCloud+ before doing it.

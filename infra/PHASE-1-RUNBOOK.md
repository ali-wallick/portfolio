# Phase 1 — Infrastructure Runbook

Moving `aliwallick.com` from **GoDaddy (registrar) + DreamHost (DNS, site, email)**
to **Cloudflare (registrar + DNS) + iCloud+ (email)**.

**Hard deadline: the domain renews at GoDaddy on 2026-10-01.**
Baseline captured 2026-08-16 — that's ~6 weeks of runway, comfortably ahead of the
"start by early September at the latest" floor. The schedule below is not tight;
that slack is the safety margin, so spend it on verification rather than on delay.

## Files in this directory

| File | What it's for |
|---|---|
| `capture-dns-baseline.sh` | Re-runnable read-only capture of the authoritative zone. |
| `dns-baseline-aliwallick.com.txt` | The captured pre-migration zone. **The source of truth for "did we lose a record?"** |
| `verify-dns.sh` | Diffs a candidate nameserver against the baseline. Exit 0 = safe to proceed. |

`verify-dns.sh` was self-tested against DreamHost's live nameserver at capture
time and passes 13/13. If it ever fails against DreamHost, the script is wrong,
not the zone.

---

## The pre-migration zone

Captured from `ns1.dreamhost.com` on 2026-08-16. Confirmed: **no wildcard record**,
**no DMARC record**, no AAAA, no CAA, no SRV. AXFR is refused, so subdomains were
probed by name — the probe list is in `capture-dns-baseline.sh`.

| Name | Type | Value | Notes |
|---|---|---|---|
| `aliwallick.com` | A | `173.236.243.216` | DreamHost shared host `iad1-shared-b8-06` |
| `aliwallick.com` | MX | `0 mx1.mailchannels.net.` | **Mail. Do not break.** |
| `aliwallick.com` | MX | `0 mx2.mailchannels.net.` | **Mail. Do not break.** |
| `aliwallick.com` | TXT | `v=spf1 mx include:netblocks.dreamhost.com include:relay.mailchannels.net -all` | SPF |
| `aliwallick.com` | TXT | `google-site-verification=Q1KMu8...` | Probably a long-dead Search Console verification. Harmless; carry it over rather than making two changes at once. |
| `www` | A | `173.236.243.216` | |
| `mail` | A | `64.90.62.162` | `pop.dreamhost.com` |
| `mail` | MX | `0 mx1/mx2.mailchannels.net.` | Real records, not a wildcard artifact — verified. |
| `ftp` | A | `173.236.243.216` | |
| `autoconfig` | CNAME | `autoconfig.dreamhost.com.` | Mail client auto-setup |
| `dreamhost._domainkey` | TXT | `v=DKIM1; ...` (2 strings) | **See the DKIM trap below.** |

Delegation is `ns1/ns2/ns3.dreamhost.com`. Record TTLs are **60s** — unusually low,
which is good news: mistakes revert fast. The NS records at the registrar are 14400s
(4h), so the nameserver switch itself is the slow part.

### The DKIM trap

The DKIM record is a **multi-string TXT** — DNS caps a single string at 255 bytes,
so the key is split. The two strings join with **no separator**:

```
...c9E+eYr4Un | Jsu89oJkt9ilov3pnJMcep...
```

If a dashboard rejoins them with a space, DKIM signature validation silently fails
and mail starts landing in spam with no obvious cause. `verify-dns.sh` explicitly
asserts the junction substring `c9E+eYr4UnJsu89oJkt9ilov3pnJMcep` — that check exists
solely to catch this.

The paste-ready single-string form is at the bottom of
`dns-baseline-aliwallick.com.txt`. Copy from there, never from `dig` output.

---

## Step 1 — Add the zone to Cloudflare DNS

**Reversible.** Nothing points at Cloudflare yet; this is just building a zone that
sits unused.

1. Cloudflare dashboard → **Add a site** → `aliwallick.com` → **Free** plan.
2. Cloudflare auto-scans and imports what it can find. **Do not trust the import.**
   Its scan uses the same guess-the-hostname approach as our baseline and it is not
   guaranteed to find everything.
3. Reconcile the imported list against the table above, record by record. Add
   anything missing; delete anything invented.
4. **Set every A / CNAME record to DNS-only (grey cloud), not proxied (orange).**

   This is the single most important setting in this step. Proxying puts Cloudflare
   in front of DreamHost, which changes TLS termination and can cause redirect loops
   against DreamHost's own Let's Encrypt cert. That is a *serving* change, and step 2
   is a *DNS* change — stacking them violates the "never stack two unverified steps"
   rule. Proxying can be turned on deliberately later, or simply never, since Phase 6
   moves serving to Pages anyway.

   `mail` and `ftp` must be grey regardless — Cloudflare's proxy only handles HTTP,
   so proxying them breaks mail and FTP outright.
5. Cloudflare will show you two assigned nameservers (e.g. `xxx.ns.cloudflare.com`).
   Write them down.

**Verify before going further:**

```bash
./infra/verify-dns.sh <one-of-your-cloudflare-nameservers>
```

Cloudflare answers for the zone even before delegation, so this tests the real thing.
**Must be 13/13 PASS.** If it isn't, fix the zone at Cloudflare — do not proceed.

---

## Step 2 — Point nameservers at Cloudflare (GoDaddy)

**Reversible** (put DreamHost's NS back), but slow to revert — NS TTL is 4h.
Only do this after step 1 passes.

Site still serves from DreamHost. Mail still delivers via MailChannels. The only
change is *who answers DNS queries*.

1. GoDaddy → Domain Portfolio → `aliwallick.com` → **Nameservers** → Change.
2. Choose "I'll use my own nameservers", enter the two Cloudflare nameservers,
   remove the three DreamHost ones. Save.
3. Wait. Usually under an hour, allow up to 24h. Cloudflare's dashboard flips the
   zone to **Active** when it sees the delegation — that flag is also the
   precondition for step 3.

**Verify — all three, not just the first:**

```bash
dig +short NS aliwallick.com          # should show the Cloudflare nameservers
./infra/verify-dns.sh                 # public resolution, must be 13/13
curl -sSI -o /dev/null -w '%{http_code}\n' -L https://aliwallick.com/
```

Then the check no script can do: **send an email to `ali@aliwallick.com` from an
outside account and confirm it arrives**, and send one *from* it. Mail is the part
with no undo and no error message when it breaks.

Leave it running a full day before step 3.

---

## Step 3 — Transfer the registrar to Cloudflare

**This is the deadline-bearing step. Target completion ~2026-09-20.**

Not reversible on a whim — a completed transfer starts a 60-day ICANN lock during
which the domain cannot be transferred again. It is not *dangerous* (you still own
the domain either way), but it is a one-way door for two months.

Prerequisites: the Cloudflare zone must be **Active** (step 2 done and verified).

**At GoDaddy:**
1. Domain settings → turn **off** the domain lock.
2. Turn **off** WHOIS/domain privacy if it blocks the transfer — some registrars
   route the approval email to a proxy address. Cloudflare provides free WHOIS
   privacy once the transfer lands.
3. Request the **authorization code** (EPP code). GoDaddy emails it.
4. **Leave auto-renew ON.** Per the plan constraint: if the transfer slips past
   Oct 1, a duplicated renewal charge is a far better outcome than a lapsed domain.
   A completed transfer makes the charge moot, and a transfer *adds* a year to the
   existing expiry rather than resetting it — so nothing is lost either way.

**At Cloudflare:**
5. Domain Registration → **Transfer Domains** → select `aliwallick.com` → paste the
   auth code → pay (~$10-12, at cost). This payment buys the added year.
6. Approve the transfer-away confirmation email from GoDaddy. **Approving it is what
   turns a 5-7 day wait into roughly a day** — otherwise it sits until the clock
   expires. Watch for that email; it goes to the registrant address on file.

**Verify:**

```bash
whois aliwallick.com | grep -i -E 'registrar:|expiry|expiration'
./infra/verify-dns.sh
```

Registrar should read Cloudflare, and expiry should have moved to **2027-10-01**.
DNS must still be 13/13 — a registrar transfer should not touch records, but verify
rather than assume.

---

## Step 4 — Move email to iCloud+

Do this **last**, and only after step 3 has settled. This is the step with real data
loss potential, because it is the only one where the old system stops receiving.

### 4a. Copy the mail off DreamHost first — before touching any record

Apple has **no IMAP import tool**. The migration is manual, in a desktop client:

1. In Apple Mail (or Thunderbird), add the DreamHost account over IMAP
   (`imap.dreamhost.com`) and let it fully sync — check every folder, including
   Sent and Archive. Wait for the sync to actually finish; a partial sync that
   *looks* done is the failure mode here.
2. Add the iCloud account in the same client.
3. Create a folder under iCloud (e.g. `DreamHost archive`) and **drag** the messages
   across. Copies over IMAP, so the DreamHost copy stays put as a fallback.
4. Spot-check: oldest message, newest message, one with an attachment, one in Sent.

**Do not delete anything from DreamHost.** It keeps running until your husband is
migrated anyway, so the old mailbox is a free safety net.

### 4b. Set up the custom domain at Apple

iCloud.com → Mail → Settings → **Custom Email Domain** → add `aliwallick.com`
(iCloud+ allows 5 domains / 3 addresses each, shareable via Family Sharing — which
is how your husband's domain can ride the same plan at no extra cost).

Apple generates the records to add. Typically MX, an SPF TXT, and DKIM.

### 4c. Swap the records at Cloudflare

This is the cutover. In one sitting:

- **Replace** both MailChannels MX records with Apple's.
- **Replace** the SPF TXT with Apple's (`include:icloud.com`). SPF permits only one
  record — do not add a second, it invalidates both.
- **Add** Apple's DKIM record.
- **Leave** `dreamhost._domainkey` in place for now. It's inert once DreamHost stops
  sending, and removing it is a separate change for a separate day.
- **Leave** `mail`, `ftp`, `autoconfig` alone — they point at DreamHost, which is
  still running.

TTLs are 60s, so a mistake here reverts within a minute. Keep this runbook's baseline
table open; it is the rollback.

### 4d. Verify both directions — this is the definition of done

- Send **from** `ali@aliwallick.com` **to** an outside address (Gmail). Confirm it
  arrives *and* lands in inbox, not spam.
- Send **from** that outside address **to** `ali@aliwallick.com`. Confirm arrival.
- In the received Gmail message: Show original → confirm **SPF pass** and **DKIM pass**.
- Re-check after 24h, once caches have turned over.

---

## Not in this phase

- **Cloudflare Pages deploy and domain cutover** — Phase 6.
- **Retiring DreamHost** — after your husband migrates too. It stays paid and running
  throughout Phase 1 on purpose; it is the rollback for every step above.
- Anything touching the Astro rebuild or the Phase 0 asset keep/drop list.

## Open items needing your input

1. **How much mail is in the DreamHost mailbox?** Drives how long 4a takes. If it's
   large, start the sync early — it can run in the background during steps 2-3.
2. **Husband's domain onto the same iCloud+ plan — now or later?** Doesn't block
   anything here, but if it's "now", it's cheapest to do while you're already in the
   Apple dashboard at step 4b.
3. **Is the `google-site-verification` TXT still needed?** Carried over as-is either
   way; worth a look at whether that Search Console property is still yours.

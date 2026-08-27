#!/usr/bin/env bash
# Assert that aliwallick.com's zone is intact -- above all, that mail still
# works. Run it before and after the DNS cutover (docs/LAUNCH.md steps 1 and 9).
#
# Read-only: queries only, changes nothing.
#
# Usage:
#   ./verify-dns.sh <nameserver>   # e.g. dilbert.ns.cloudflare.com
#   ./verify-dns.sh                # no arg: check public resolution
#
# Exit 0 = everything that must hold, holds. Exit 1 = a difference needs eyes.
#
# ---------------------------------------------------------------------------
# Re-baselined 2026-08-27 (#55). The previous expected set was captured from
# DreamHost on 2026-08-16, BEFORE the migration Phase 1 existed to perform, so
# it reported the iCloud MX records and the amended SPF as failures and always
# printed STOP. The script was right; its reference point had been deliberately
# replaced. Three expected failures is exactly the state in which a fourth, real
# one gets waved through -- and the one moment you need this tool is the one
# irreversible step in the project.
#
# THE RULE THAT FOLLOWS, and the reason this file is shaped the way it is:
# every assertion below must be true both before AND after the cutover. An
# assertion known to break on a scheduled future change is the same bug in a
# new costume, so where a value is expected to change, this script asserts the
# invariant rather than the value. Three places do that, each marked WHY.
# ---------------------------------------------------------------------------
set -uo pipefail

DOMAIN="${DOMAIN:-aliwallick.com}"
BASELINE="$(dirname "$0")/dns-baseline-$DOMAIN.txt"
CANDIDATE="${1:-}"

[ -f "$BASELINE" ] || { echo "FAIL: no baseline at $BASELINE"; exit 1; }

if [ -n "$CANDIDATE" ]; then
  AT="@$CANDIDATE"; LABEL="$CANDIDATE"
else
  AT=""; LABEL="public resolver"
fi

fail=0
pass=0

ok()   { printf '  OK   %-30s %-5s %s\n' "$1" "$2" "$3"; pass=$((pass + 1)); }
bad()  { printf '  FAIL %-30s %-5s %s\n' "$1" "$2" "$3"; fail=$((fail + 1)); }
note() { printf '       %-30s %-5s %s\n' "" "" "$1"; }

echo "Verifying $DOMAIN against: $LABEL"
echo "Baseline: $BASELINE"
echo

# ===========================================================================
# 1. MAIL -- must not change. Ali's email runs on this domain.
# ===========================================================================
echo "-- mail (must not change) --"

# --- MX, exact ---
read -r -d '' EXPECTED_MX <<EOF
10 mx01.mail.icloud.com.
10 mx02.mail.icloud.com.
EOF

got_mx=$(dig +short $AT "$DOMAIN" MX 2>/dev/null | sort | tr '\n' ' ' | sed 's/ *$//')
while read -r value; do
  [ -z "${value:-}" ] && continue
  if printf '%s' "$got_mx" | grep -qF "$value"; then
    ok "$DOMAIN" MX "$value"
  else
    bad "$DOMAIN" MX "expected $value"
    note "got: $got_mx"
  fi
done <<< "$EXPECTED_MX"

# --- TXT helper: compares on the CONCATENATED form ---
# DNS caps one TXT string at 255 bytes, so long values arrive split. They must
# rejoin with NO separator; a dashboard that reintroduces a space produces a
# record that looks right and silently fails validation.
txt_of() {
  dig +short $AT "$1" TXT 2>/dev/null | sed 's/" "//g; s/"//g'
}

check_txt() {
  local host="$1" needle="$2" label="$3" got
  got=$(txt_of "$host")
  if printf '%s' "$got" | grep -qF "$needle"; then
    ok "$host" TXT "$label"
  else
    bad "$host" TXT "$label missing/altered"
    note "got: $got"
  fi
}

# --- SPF, asserted by component rather than as a whole string ---
# WHY (1/3): the live value still carries two dead includes,
# `netblocks.dreamhost.com` and `relay.mailchannels.net`, which #43 will remove.
# Pinning the full string would schedule this script to start printing STOP the
# day that cleanup lands -- re-creating the exact problem #55 was filed about.
# So assert the three things that decide whether mail is deliverable: that an
# SPF record exists, that iCloud is authorised to send, and that the policy is
# still hardfail. The full string is printed for eyes either way.
spf=$(txt_of "$DOMAIN" | grep '^v=spf1' || true)
if [ -z "$spf" ]; then
  bad "$DOMAIN" TXT "SPF record absent"
else
  for needle in "v=spf1" "include:icloud.com" "-all"; do
    # `--` is load-bearing: one of the needles is `-all`, which grep would
    # otherwise parse as a bundle of flags.
    if printf '%s' "$spf" | grep -qF -- "$needle"; then
      ok "$DOMAIN" TXT "SPF carries $needle"
    else
      bad "$DOMAIN" TXT "SPF missing $needle"
    fi
  done
  note "SPF: $spf"
fi

check_txt "_dmarc.$DOMAIN" \
  "v=DMARC1; p=none; rua=mailto:contact@$DOMAIN" "DMARC"
check_txt "$DOMAIN" \
  "apple-domain=FoNGZEINgjKEF5qN" "iCloud+ custom-domain proof"

# --- DKIM: the record Ali owns, then the key Apple owns ---
# These are two different failures and the migration produced the second one:
# the CNAME was correct and Apple simply had not published the key yet, so the
# first test send returned `dkim=permerror (no key for signature)`. A correct
# DNS record and a working DNS record are not the same thing when a third party
# owns what it points at. Assert both ends.
dkim_cname=$(dig +short $AT "sig1._domainkey.$DOMAIN" CNAME 2>/dev/null | head -1)
if [ "$dkim_cname" = "sig1.dkim.$DOMAIN.at.icloudmailadmin.com." ]; then
  ok "sig1._domainkey.$DOMAIN" CNAME "-> $dkim_cname"
else
  bad "sig1._domainkey.$DOMAIN" CNAME "expected sig1.dkim.$DOMAIN.at.icloudmailadmin.com."
  note "got: ${dkim_cname:-<empty>}"
fi

# WHY (2/3): this used to assert a magic substring spanning the two halves of
# the key -- the junction, where a dashboard rejoining with a space would show
# up. That worked when the key was a TXT record Ali pasted by hand. It is a
# CNAME now: Apple publishes the key and can rotate it whenever it likes, so
# pinning key bytes would turn a routine, legitimate rotation into a STOP.
# The junction bug is instead caught as a general invariant -- a base64 DKIM
# key contains no whitespace, so ANY space inside `p=` is the bug, for this key
# and every future one. The trap survives; the brittleness does not.
dkim_txt=$(txt_of "sig1._domainkey.$DOMAIN")
dkim_key=$(printf '%s' "$dkim_txt" | sed 's/.*p=//; s/;.*//')
if [ -z "$dkim_txt" ]; then
  bad "sig1._domainkey.$DOMAIN" TXT "no key published (CNAME may be correct anyway)"
elif ! printf '%s' "$dkim_txt" | grep -qF "v=DKIM1"; then
  bad "sig1._domainkey.$DOMAIN" TXT "resolves, but is not a DKIM record"
  note "got: $dkim_txt"
elif [ "${#dkim_key}" -lt 100 ]; then
  bad "sig1._domainkey.$DOMAIN" TXT "key implausibly short (${#dkim_key} chars)"
elif printf '%s' "$dkim_key" | grep -q '[[:space:]]'; then
  bad "sig1._domainkey.$DOMAIN" TXT "whitespace inside p= -- strings rejoined wrongly"
  note "this is the junction bug; mail will silently fail DKIM"
else
  ok "sig1._domainkey.$DOMAIN" TXT "key published, ${#dkim_key} chars, junction intact"
fi

# ===========================================================================
# 2. THE SITE -- expected to change at the cutover. Assert that it resolves.
# ===========================================================================
echo
echo "-- site (value changes at cutover; asserted as 'resolves') --"

# WHY (3/3): before the cutover both of these are DreamHost's 173.236.243.216;
# after it, the apex is a Custom Domain and `www` is a proxied placeholder, so
# both answer with Cloudflare's anycast addresses -- even when queried against
# the authoritative nameserver, which is why there is no fixed IP left to
# assert. #193 settled this for `www` and the same reasoning covers the apex.
# What this script owes the cutover is "the hostname still answers"; whether it
# answers with the RIGHT SITE is an HTTP question, and docs/LAUNCH.md step 7
# checks it there, where it is actually visible.
for host in "$DOMAIN" "www.$DOMAIN"; do
  got=$(dig +short $AT "$host" A 2>/dev/null | tr '\n' ' ' | sed 's/ *$//')
  if [ -n "$got" ]; then
    ok "$host" A "resolves -> $got"
  else
    bad "$host" A "does not resolve"
  fi
done

# ===========================================================================
# 3. Ownership
# ===========================================================================
echo
echo "-- ownership --"
# Re-verified under Ali's own Google account (#44, closed) -- this is NOT the
# DreamHost-era value, which the old expected set still named.
check_txt "$DOMAIN" \
  "google-site-verification=SNE4xKwubQ0GXNwM3MOL7AoqVVqfrXG6Uotu2-h4aec" \
  "google-site-verification"

# ===========================================================================
# Deliberately NOT asserted: the DreamHost leftovers.
#
#   mail.$DOMAIN          A 64.90.62.162 + MailChannels MX
#   autoconfig.$DOMAIN    CNAME autoconfig.dreamhost.com.
#   ftp.$DOMAIN           A 173.236.243.216
#   dreamhost._domainkey  TXT (the superseded DKIM key)
#
# All four are still in the zone and nothing sends or resolves through any of
# them. They are queued for deletion with the dead SPF includes (#43), so
# asserting them would schedule a false failure for the day that lands, and
# asserting their ABSENCE would fail today. They are recorded in the baseline
# and in infra/README.md, which is where a record nobody should depend on
# belongs. If #43 removes them, nothing here needs to change.
# ===========================================================================

echo
echo "  $pass passed, $fail failed"
if [ "$fail" -eq 0 ]; then
  echo "  PASS -- zone is intact. Mail records unchanged."
else
  echo "  STOP -- do not proceed until these resolve."
fi
exit $([ "$fail" -eq 0 ] && echo 0 || echo 1)

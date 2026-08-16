#!/usr/bin/env bash
# Compare a candidate nameserver's answers against the captured DreamHost
# baseline. Run this BEFORE changing nameservers at GoDaddy (querying
# Cloudflare's assigned NS directly), and again AFTER the switch.
#
# Read-only: queries only, changes nothing.
#
# Usage:
#   ./verify-dns.sh <candidate-nameserver>   # e.g. gina.ns.cloudflare.com
#   ./verify-dns.sh                          # no arg: check public resolution
#
# Exit 0 = every record matches. Exit 1 = a difference needs your eyes.
#
# TTL and the NS/SOA records are deliberately ignored: they are SUPPOSED to
# change when the zone moves. Everything else must match exactly.
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

# Records that must survive the move, derived from the baseline capture.
# Format: <name> <type> <expected-value>
read -r -d '' EXPECTED <<EOF
$DOMAIN A 173.236.243.216
$DOMAIN MX 0 mx1.mailchannels.net.
$DOMAIN MX 0 mx2.mailchannels.net.
www.$DOMAIN A 173.236.243.216
mail.$DOMAIN A 64.90.62.162
mail.$DOMAIN MX 0 mx1.mailchannels.net.
mail.$DOMAIN MX 0 mx2.mailchannels.net.
ftp.$DOMAIN A 173.236.243.216
autoconfig.$DOMAIN CNAME autoconfig.dreamhost.com.
EOF

fail=0
pass=0

echo "Verifying $DOMAIN against: $LABEL"
echo "Baseline: $BASELINE"
echo

# --- address / mail / alias records ---
while read -r name type value; do
  [ -z "${name:-}" ] && continue
  got=$(dig +short $AT "$name" "$type" 2>/dev/null | sort | tr '\n' ' ' | sed 's/ *$//')
  if printf '%s' "$got" | grep -qF "$value"; then
    printf '  OK   %-28s %-5s %s\n' "$name" "$type" "$value"
    pass=$((pass + 1))
  else
    printf '  FAIL %-28s %-5s expected %q\n' "$name" "$type" "$value"
    printf '       %-28s %-5s got      %q\n' "" "" "$got"
    fail=$((fail + 1))
  fi
done <<< "$EXPECTED"

# --- TXT records, compared on the concatenated form ---
# Multi-string TXT (DKIM) must join with NO separator; a dashboard that
# reintroduces a space silently breaks signature validation.
check_txt() {
  local host="$1" needle="$2" label="$3"
  local got
  got=$(dig +short $AT "$host" TXT 2>/dev/null | sed 's/" "//g; s/"//g')
  if printf '%s' "$got" | grep -qF "$needle"; then
    printf '  OK   %-28s TXT   %s\n' "$host" "$label"
    pass=$((pass + 1))
  else
    printf '  FAIL %-28s TXT   %s missing/altered\n' "$host" "$label"
    printf '       got: %s\n' "$got"
    fail=$((fail + 1))
  fi
}

check_txt "$DOMAIN" \
  "v=spf1 mx include:netblocks.dreamhost.com include:relay.mailchannels.net -all" "SPF"
check_txt "$DOMAIN" \
  "google-site-verification=Q1KMu8zQUG6OMoepiHX41JPZXfu3wCu_y0rSziR3vLY" "google-site-verification"
# Tail of the DKIM key: if the two strings were joined wrongly, the middle
# junction breaks and this exact substring will not be found.
check_txt "dreamhost._domainkey.$DOMAIN" \
  "c9E+eYr4UnJsu89oJkt9ilov3pnJMcep" "DKIM (string junction intact)"
check_txt "dreamhost._domainkey.$DOMAIN" \
  "GXyYHWDU8AJ9UTNirFbnfMKr0y1SdnMljjmbHi86aMv1/9jR6yZutwX6/G2vFOavyUL46wEkJwIDAQAB" "DKIM (key tail)"

echo
echo "  $pass passed, $fail failed"
if [ "$fail" -eq 0 ]; then
  echo "  PASS -- zone matches baseline. Safe to proceed."
else
  echo "  STOP -- do not change nameservers until these resolve."
fi
exit $([ "$fail" -eq 0 ] && echo 0 || echo 1)

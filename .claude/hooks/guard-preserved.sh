#!/bin/bash
# PreToolUse guard: refuse writes to the Phase 0/1 preservation records.
#
# `content/archive/` (the scraped WordPress blog) and `snapshot/` (a full crawl
# of the live PHP site) exist to be *faithful*. Their whole value is that they
# record what was actually there, so "improving", reformatting, or fixing typos
# in them destroys the point. `content/archive/` in particular holds the only
# copy of 20 blog posts that lived nowhere but a DreamHost database.
#
# Exit 2 blocks the tool call and shows stderr to the agent.

set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

payload=$(cat)

file_path=$(node -e '
let d = "";
process.stdin.on("data", (c) => (d += c)).on("end", () => {
  try { process.stdout.write(JSON.parse(d)?.tool_input?.file_path ?? ""); } catch { }
});
' <<<"$payload")

[[ -z "$file_path" ]] && exit 0

case "$file_path" in
  */content/archive/* | */snapshot/*)
    cat >&2 <<EOF
Blocked: $file_path is a preservation record from Phase 0.

content/archive/ and snapshot/ capture the old site and blog exactly as they
were. Their value is being faithful, so editing them is almost never right —
content/archive/ holds the only surviving copy of 20 posts that existed nowhere
but a DreamHost database.

If you need the material, read it and write somewhere else. If you genuinely
need to change it, ask the user first.
EOF
    exit 2
    ;;
esac

exit 0

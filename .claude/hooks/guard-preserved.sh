#!/bin/bash
# PreToolUse guard: refuse writes to the "Don't touch" paths CLAUDE.md names —
# the Phase 0/1 preservation records, plus the old site's only-copy assets and
# the redacted 2019 résumé PDF.
#
# `content/archive/` (the scraped WordPress blog) and `snapshot/` (a full crawl
# of the live PHP site) exist to be *faithful*. Their whole value is that they
# record what was actually there, so "improving", reformatting, or fixing typos
# in them destroys the point. `content/archive/` in particular holds the only
# copy of 20 blog posts that lived nowhere but a DreamHost database.
# `infra/` (minus its own README) is the Phase 1 DNS record. `resources/css/`
# and `resources/js/` are the only copy of the old site's stylesheet and scroll
# handler. `resources/WallickAli-Resume.pdf` is the redacted 2019 résumé, kept
# deliberately.
#
# Two exceptions. `snapshot/rendered/` is *derived*, not captured: it is written
# by `scripts/restore-snapshot.mjs --rebuild` from the faithful pages beside it,
# so hand-editing it is pointless rather than destructive — the next rebuild
# overwrites it. Note that only 28 of its 102 files come from those pages; the
# rest are recovered from a commit and two remote hosts, which is why a rebuild
# preflights before it deletes (#344). It sits under snapshot/ deliberately, so the whole
# archive stays one directory to tag and remove later (see #45). And
# `infra/README.md` is a live document (the DNS tooling's own notes), not part
# of the captured record.
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
  # Derived output, not a preservation record — see the header. Must come
  # first: the arm below would otherwise match it.
  */snapshot/rendered/*)
    exit 0
    ;;
  # infra/README.md is a live document (the DNS tooling's own notes; see
  # .prettierignore, which formats it with everything else). The captured
  # zone, the baselines and the scripts beside it are the Phase 1 record.
  */infra/README.md)
    exit 0
    ;;
  */content/archive/* | */snapshot/*)
    cat >&2 <<EOF
Blocked: $file_path is a preservation record from Phase 0.

content/archive/ and snapshot/ capture the old site and blog exactly as they
were. Their value is being faithful, so editing them is almost never right —
content/archive/ holds the only surviving copy of 20 posts that existed nowhere
but a DreamHost database.

If you need the material, read it and write somewhere else. If you genuinely
need to change it, ask the user first.

Looking for a version that renders? That is snapshot/rendered/ — derived,
writable, and rebuilt by \`node scripts/restore-snapshot.mjs --rebuild\`. Change
the script, not its output.
EOF
    exit 2
    ;;
  */infra/*)
    cat >&2 <<EOF
Blocked: $file_path is part of the Phase 1 infrastructure record.

infra/ holds the domain/DNS/email setup — the captured zone file, the DNS
baselines, and the capture and verify scripts beside them. Phase 1 is closed
and out of scope; DNS, the registrar, and email are not to be touched.

If you genuinely need to change it, ask the user first.
EOF
    exit 2
    ;;
  */resources/css/* | */resources/js/*)
    cat >&2 <<EOF
Blocked: $file_path is the old site's only copy of its stylesheet or scroll
handler.

resources/css/ and resources/js/ are the ONLY surviving copy of
templateStyles.css and nav.js — snapshot/ has colors.css and nothing else.
They are the primary source for the recovered motion curve (--ease,
--duration) documented in CLAUDE.md, and editing them destroys that record.

If you genuinely need to change it, ask the user first.
EOF
    exit 2
    ;;
  */resources/WallickAli-Resume.pdf)
    cat >&2 <<EOF
Blocked: $file_path is the redacted 2019 résumé PDF, kept deliberately
(settled #40).

It is a historical artifact, not the site's live résumé — that's
/resume and /resume/full, generated from the jobs and education collections.
Changing anything about this file is a decision tracked as an issue, not an
edit a session makes in passing.

If you genuinely need to change it, ask the user first.
EOF
    exit 2
    ;;
esac

exit 0

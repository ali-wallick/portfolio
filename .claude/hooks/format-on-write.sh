#!/bin/bash
# PostToolUse: run Prettier on whatever file was just written.
#
# Cheap, repeatable, and it removes a whole class of pointless CI failure —
# `npm run format:check` gates every PR, and nothing is more annoying than a red
# build over a trailing comma. Formatting the file at write time means the agent
# never has to think about it.
#
# Deliberately silent and non-blocking: if Prettier isn't installed yet, or the
# file is one Prettier ignores, that is not an error worth interrupting for.

set -uo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

file_path=$(node -e '
let d = "";
process.stdin.on("data", (c) => (d += c)).on("end", () => {
  try { process.stdout.write(JSON.parse(d)?.tool_input?.file_path ?? ""); } catch { }
});
')

[[ -z "$file_path" || ! -f "$file_path" ]] && exit 0
# Only files inside this repo, and only types Prettier handles here.
[[ "$file_path" != "$repo_root"/* ]] && exit 0
[[ "$file_path" =~ \.(astro|ts|tsx|js|mjs|cjs|css|md|json|ya?ml)$ ]] || exit 0
[[ -x "$repo_root/node_modules/.bin/prettier" ]] || exit 0

"$repo_root/node_modules/.bin/prettier" --write --ignore-unknown "$file_path" >/dev/null 2>&1 || true
exit 0

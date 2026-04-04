#!/usr/bin/env bash
set -euo pipefail

# Derive the Pages base path from the git remote URL.
# GHES Pages pattern: /pages/{owner}/{repo}/
# Public GitHub Pages pattern: /{repo}/
remote_url=$(git remote get-url origin 2>/dev/null) || {
  echo "ERROR: No 'origin' git remote found." >&2
  echo "This script derives the Pages base path from the git remote URL." >&2
  exit 1
}

# Strip optional trailing .git
remote_url="${remote_url%.git}"

# Extract owner and repo from remote URL.
# Supported formats:
#   https://github.com/owner/repo[.git]
#   git@github.com:owner/repo[.git]
#   host:owner/repo              (SSH shorthand)
#   https://host/owner/repo[.git]
if [[ "$remote_url" =~ ([^/:]+)/([^/]+)$ ]]; then
  owner="${BASH_REMATCH[1]}"
  repo="${BASH_REMATCH[2]}"
else
  echo "ERROR: Could not parse owner/repo from remote URL: $remote_url" >&2
  exit 1
fi

# Public github.com serves at /{repo}/, GHES serves at /pages/{owner}/{repo}/
if [[ "$remote_url" == *"github.com"* ]]; then
  NOTEHUB_PAGES_BASE="/${repo}/"
else
  NOTEHUB_PAGES_BASE="/pages/${owner}/${repo}/"
fi

export VITE_BASE="$NOTEHUB_PAGES_BASE"

echo "Remote:    $remote_url"
echo "Base path: $NOTEHUB_PAGES_BASE"
echo ""

npm install --silent
npm run build
npx gh-pages -d dist

echo ""
echo "Deployed to Pages with base path: $NOTEHUB_PAGES_BASE"

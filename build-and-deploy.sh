#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

# --- Require workspace Makefile ---
workspace_dir="$(dirname "$(pwd)")"
[[ -f "${workspace_dir}/Makefile" ]] \
    || { echo "ERROR: workspace Makefile not found at ${workspace_dir}/Makefile. This script must be run from within the maintenance workspace." >&2; exit 1; }

# --- Derive Pages base path from git remote ---
remote_url=$(git remote get-url origin 2>/dev/null) || {
  echo "ERROR: No 'origin' git remote found." >&2
  echo "This script derives the Pages base path from the git remote URL." >&2
  exit 1
}

remote_url="${remote_url%.git}"

if [[ "$remote_url" =~ ([^/:]+)/([^/]+)$ ]]; then
  owner="${BASH_REMATCH[1]}"
  repo="${BASH_REMATCH[2]}"
else
  echo "ERROR: Could not parse owner/repo from remote URL: $remote_url" >&2
  exit 1
fi

if [[ "$remote_url" == *"github.com"* ]]; then
  NOTEHUB_PAGES_BASE="/${repo}/"
else
  NOTEHUB_PAGES_BASE="/pages/${owner}/${repo}/"
fi

echo "Remote:    $remote_url"
echo "Base path: $NOTEHUB_PAGES_BASE"
echo ""

# --- Resolve dependencies (veditor gh-pages) and build if src changed ---
make -C "${workspace_dir}" deploy-notehub-deps
make -C "${workspace_dir}" notehub VITE_BASE="$NOTEHUB_PAGES_BASE"

# --- Deploy to gh-pages ---
npx gh-pages -d dist

echo ""
echo "Deployed to Pages with base path: $NOTEHUB_PAGES_BASE"

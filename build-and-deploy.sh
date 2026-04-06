#!/usr/bin/env bash
# Build notehub.web and deploy dist/ to the gh-pages branch.
#
# This script is host-agnostic. The parent workspace Makefile supplies
# all host-specific configuration via environment variables.
#
# Required environment variables:
#   VITE_BASE          — Pages base path (e.g. /notehub.web/ or /pages/owner/notehub.web/)
#   VITE_VEDITOR_BASE  — URL base for veditor.web runtime import
#
# Usage (from parent Makefile):
#   VITE_BASE=/pages/owner/notehub.web/ VITE_VEDITOR_BASE=https://host/pages/owner/veditor.web/ ./build-and-deploy.sh
set -euo pipefail

cd "$(dirname "$0")"

# --- Validate required env vars ---
if [[ -z "${VITE_BASE:-}" ]]; then
  echo "ERROR: VITE_BASE environment variable is required." >&2
  echo "" >&2
  echo "Set it to the Pages base path for your deployment target." >&2
  echo "This is supplied by the parent workspace Makefile." >&2
  exit 1
fi

if [[ -z "${VITE_VEDITOR_BASE:-}" ]]; then
  echo "ERROR: VITE_VEDITOR_BASE environment variable is required." >&2
  echo "" >&2
  echo "Set it to the base URL where veditor.web is deployed." >&2
  echo "This is supplied by the parent workspace Makefile." >&2
  exit 1
fi

echo "VITE_BASE:         $VITE_BASE"
echo "VITE_VEDITOR_BASE: $VITE_VEDITOR_BASE"
echo ""

# --- Build ---
npm install --silent
npm run build

# --- Deploy ---
npx gh-pages -d dist

echo ""
echo "Deployed to Pages with base path: $VITE_BASE"

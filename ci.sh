#!/usr/bin/env bash
# CI script — runs type-check, lint, and build for all packages
set -euo pipefail

echo "==> Installing dependencies"
npm ci

echo "==> Type checking"
npm run type-check --workspaces --if-present

echo "==> Linting"
npm run lint

echo "==> Building all packages"
npm run build --workspaces --if-present

echo "==> CI passed ✓"

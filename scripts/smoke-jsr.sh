#!/usr/bin/env bash
# Post-publish smoke: requires @sarkarshubhdeep/jerry-lib on JSR.
set -euo pipefail
VERSION="${1:-0.1.0}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "== Deno JSR smoke (@$VERSION) =="
cd "$TMP"
deno init -q
deno add "jsr:@sarkarshubhdeep/jerry-lib@$VERSION"
cp "$ROOT/examples/external-smoke/deno-smoke.ts" ./deno-smoke.ts
deno check deno-smoke.ts
deno run --allow-read deno-smoke.ts

echo "== Node JSR smoke (@$VERSION) =="
NODE_DIR="$TMP/node"
mkdir -p "$NODE_DIR"
cd "$NODE_DIR"
npm init -y >/dev/null 2>&1
npx --yes jsr add "@sarkarshubhdeep/jerry-lib@$VERSION"
cp "$ROOT/examples/external-smoke/node-smoke.mjs" ./node-smoke.mjs
node node-smoke.mjs

echo "All JSR smokes passed"

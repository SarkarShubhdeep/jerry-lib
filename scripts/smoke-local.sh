#!/usr/bin/env bash
# Pre-publish smoke using the local repo (no JSR required).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
deno task smoke

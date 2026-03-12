#!/usr/bin/env bash
set -euo pipefail

printf "\n[release-gate] Installing dependencies...\n"
npm ci

printf "\n[release-gate] Running typecheck...\n"
npm run typecheck

printf "\n[release-gate] Running tests...\n"
npm run test

printf "\n[release-gate] ✅ PASS\n"

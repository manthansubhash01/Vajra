#!/usr/bin/env bash
set -euo pipefail

# Simple idempotent script: only reads deps and runs lint/tests.
cd server
npm ci
npm run lint
npm test

cd ../client
npm ci
npm run lint
npm test -- --run
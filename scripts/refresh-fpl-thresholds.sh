#!/bin/bash
# Refresh FPL and income thresholds nightly
cd "$(dirname "$0")/.."
node scripts/generate-fpl-mapping.js

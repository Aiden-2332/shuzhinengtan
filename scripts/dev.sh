#!/usr/bin/env bash
set -Eeuo pipefail

# Compatibility wrapper for environments that still invoke this file directly.
# The actual launcher is Node-based so `pnpm dev` behaves the same on Windows,
# macOS, Linux, VS Code tasks, and hosted workspaces.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "${SCRIPT_DIR}/dev.mjs"

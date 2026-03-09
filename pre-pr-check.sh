#!/usr/bin/env bash
# ABOUTME: Runs CI/CD checks locally before opening a PR.
# ABOUTME: Mirrors lint, security, and test workflows from .github/workflows/.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
RESET='\033[0m'

FAILURES=()

run_check() {
  local label="$1"
  shift
  echo -e "\n${BOLD}▶ $label${RESET}"
  if "$@"; then
    echo -e "${GREEN}✔ $label passed${RESET}"
  else
    echo -e "${RED}✘ $label failed${RESET}"
    FAILURES+=("$label")
  fi
}

echo -e "${BOLD}Pre-PR checks${RESET}"

# Load env vars for Playwright tests
set -a
[[ -f .env ]] && source .env
[[ -f .env.test ]] && source .env.test
set +a

run_check "Lint"           npm run lint
run_check "Type check"     npm run check
run_check "Build"          npm run build
run_check "Unit tests"     npm run test:unit
run_check "Security audit" npm audit --audit-level=high

# Playwright requires secrets — skip if env vars are missing
if [[ -n "${PUBLIC_SUPABASE_URL:-}" && -n "${PUBLIC_SUPABASE_ANON_KEY:-}" ]]; then
  run_check "Playwright tests" npx playwright test
else
  echo -e "\n${YELLOW}⚠ Playwright tests skipped — set PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, TEST_USER_EMAIL, TEST_USER_PASSWORD to run them${RESET}"
fi

echo -e "\n${YELLOW}ℹ Dependency Review runs on GitHub only (pull_request event)${RESET}"

echo ""
if [[ ${#FAILURES[@]} -gt 0 ]]; then
  echo -e "${RED}${BOLD}Failed: ${FAILURES[*]}${RESET}"
  exit 1
else
  echo -e "${GREEN}${BOLD}All checks passed.${RESET}"
fi

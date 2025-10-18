#!/usr/bin/env bash
set -euo pipefail

API_PORT=${API_PORT:-3001}
WEB_PORT=${WEB_PORT:-3000}
DATA_MODE=${DATA_MODE:-mock}
export DATA_MODE

cleanup() {
  if [[ -n "${API_PID:-}" ]] && kill -0 "$API_PID" 2>/dev/null; then
    kill "$API_PID" 2>/dev/null || true
  fi
  if [[ -n "${WEB_PID:-}" ]] && kill -0 "$WEB_PID" 2>/dev/null; then
    kill "$WEB_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT

pnpm -C api dev >/tmp/api-dev.log 2>&1 &
API_PID=$!
echo "Starting API (pid $API_PID)..."

wait_for_api() {
  until curl -sf "http://localhost:${API_PORT}/api/v1/dashboard/summary" >/dev/null 2>&1; do
    echo "Waiting for API on port ${API_PORT}..."
    sleep 1
  done
  echo "API ready."
}

wait_for_api &
API_READY_PID=$!

pnpm -C web dev >/tmp/web-dev.log 2>&1 &
WEB_PID=$!
echo "Starting Web (pid $WEB_PID)..."

wait_for_web() {
  until curl -sf "http://localhost:${WEB_PORT}/dashboard" >/dev/null 2>&1; do
    echo "Waiting for Web on port ${WEB_PORT}..."
    sleep 1
  done
  echo "Web ready."
}

wait_for_web &
WEB_READY_PID=$!

wait "$API_READY_PID"
wait "$WEB_READY_PID"
echo "Services warmed, running Playwright…"

pnpm -C web test:e2e

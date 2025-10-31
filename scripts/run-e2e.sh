#!/usr/bin/env bash
set -uo pipefail

API_PORT=${API_PORT:-3001}
WEB_PORT=${WEB_PORT:-3000}
DATA_MODE=${DATA_MODE:-mock}
export DATA_MODE
export NODE_ENV=test

API_PID=""
WEB_PID=""
EXIT_CODE=0

cleanup() {
  if [[ -n "$API_PID" ]] && kill -0 "$API_PID" 2>/dev/null; then
    echo "Killing API (pid $API_PID)..."
    kill "$API_PID" 2>/dev/null || true
  fi
  if [[ -n "$WEB_PID" ]] && kill -0 "$WEB_PID" 2>/dev/null; then
    echo "Killing Web (pid $WEB_PID)..."
    kill "$WEB_PID" 2>/dev/null || true
  fi
  exit "$EXIT_CODE"
}

trap cleanup EXIT

# Start API
echo "Starting API..."
pnpm -C api dev >/tmp/api-dev.log 2>&1 &
API_PID=$!
echo "API started (pid $API_PID)"

# Wait for API to be ready
echo "Waiting for API on port $API_PORT..."
for attempt in {1..30}; do
  if curl -sf -H "Authorization: Bearer demo-admin" "http://localhost:${API_PORT}/api/v1/dashboard/summary" >/dev/null 2>&1; then
    echo "✓ API ready"
    break
  fi
  if [ $attempt -eq 30 ]; then
    echo "✗ API failed to start after 30 attempts"
    echo "--- API logs ---"
    cat /tmp/api-dev.log || echo "(no logs)"
    EXIT_CODE=1
    exit 1
  fi
  echo "Waiting... (attempt $attempt/30)"
  sleep 1
done

# Start Web
echo "Starting Web..."
pnpm -C web dev >/tmp/web-dev.log 2>&1 &
WEB_PID=$!
echo "Web started (pid $WEB_PID)"

# Wait for Web to be ready
echo "Waiting for Web on port $WEB_PORT..."
for attempt in {1..30}; do
  if curl -sf "http://localhost:${WEB_PORT}/dashboard" >/dev/null 2>&1; then
    echo "✓ Web ready"
    break
  fi
  if [ $attempt -eq 30 ]; then
    echo "✗ Web failed to start after 30 attempts"
    echo "--- Web logs ---"
    cat /tmp/web-dev.log || echo "(no logs)"
    EXIT_CODE=1
    exit 1
  fi
  echo "Waiting... (attempt $attempt/30)"
  sleep 1
done

echo ""
echo "✓ Services ready, running Playwright..."
echo ""

# Run tests
pnpm -C web test:e2e
TEST_EXIT=$?

EXIT_CODE=$TEST_EXIT
exit $TEST_EXIT

#!/bin/bash

# Font Size Persistence Test Script
# Tests that font size changes are saved and persisted correctly

set -e

API_URL="http://localhost:3001"
COOKIE="demo_token=demo-admin"

echo "========================================="
echo "Font Size Persistence Test"
echo "========================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Test 1: Get initial preferences
echo "Step 1: Getting initial preferences..."
INITIAL_PREFS=$(curl -s -X GET -H "Cookie: $COOKIE" "$API_URL/api/v1/users/me/theme")

if [ -z "$INITIAL_PREFS" ]; then
    print_error "Failed to fetch initial preferences"
    exit 1
fi

echo "Initial preferences:"
echo "$INITIAL_PREFS" | python3 -m json.tool
echo ""

INITIAL_FONT=$(echo "$INITIAL_PREFS" | python3 -c "import sys, json; print(json.load(sys.stdin).get('fontSizePreference', 'NOT_FOUND'))")
INITIAL_THEME=$(echo "$INITIAL_PREFS" | python3 -c "import sys, json; print(json.load(sys.stdin).get('themePreference', 'NOT_FOUND'))")

print_info "Initial font size: $INITIAL_FONT"
print_info "Initial theme: $INITIAL_THEME"
echo ""

# Test 2: Update preferences with new font size
echo "Step 2: Updating preferences (theme=vibrant-blue, fontSize=20px)..."

UPDATE_RESPONSE=$(curl -s -X PATCH \
    -H "Cookie: $COOKIE" \
    -H "Content-Type: application/json" \
    -d '{
        "themePreference": "vibrant-blue",
        "themeDarkMode": false,
        "fontSizePreference": "20px"
    }' \
    "$API_URL/api/v1/users/me/theme")

if [ -z "$UPDATE_RESPONSE" ]; then
    print_error "Failed to update preferences"
    exit 1
fi

echo "Update response:"
echo "$UPDATE_RESPONSE" | python3 -m json.tool
echo ""

UPDATED_FONT=$(echo "$UPDATE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('fontSizePreference', 'NOT_FOUND'))")
UPDATED_THEME=$(echo "$UPDATE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('themePreference', 'NOT_FOUND'))")

if [ "$UPDATED_FONT" = "20px" ]; then
    print_success "Update response includes fontSizePreference: 20px"
else
    print_error "Update response fontSizePreference is $UPDATED_FONT (expected 20px)"
fi

if [ "$UPDATED_THEME" = "vibrant-blue" ]; then
    print_success "Update response includes themePreference: vibrant-blue"
else
    print_error "Update response themePreference is $UPDATED_THEME (expected vibrant-blue)"
fi
echo ""

# Test 3: Fetch preferences again to verify persistence
echo "Step 3: Fetching preferences again to verify persistence..."
sleep 1 # Small delay to ensure write completes

PERSISTED_PREFS=$(curl -s -X GET -H "Cookie: $COOKIE" "$API_URL/api/v1/users/me/theme")

if [ -z "$PERSISTED_PREFS" ]; then
    print_error "Failed to fetch persisted preferences"
    exit 1
fi

echo "Persisted preferences:"
echo "$PERSISTED_PREFS" | python3 -m json.tool
echo ""

PERSISTED_FONT=$(echo "$PERSISTED_PREFS" | python3 -c "import sys, json; print(json.load(sys.stdin).get('fontSizePreference', 'NOT_FOUND'))")
PERSISTED_THEME=$(echo "$PERSISTED_PREFS" | python3 -c "import sys, json; print(json.load(sys.stdin).get('themePreference', 'NOT_FOUND'))")

print_info "Persisted font size: $PERSISTED_FONT"
print_info "Persisted theme: $PERSISTED_THEME"
echo ""

# Test 4: Verify persistence
echo "========================================="
echo "Test Results"
echo "========================================="
echo ""

FONT_PASSED=false
THEME_PASSED=false

if [ "$PERSISTED_FONT" = "20px" ]; then
    print_success "Font size persisted correctly: 20px"
    FONT_PASSED=true
else
    print_error "Font size NOT persisted! Got: $PERSISTED_FONT (expected 20px)"
    print_warning "This is the bug we're tracking"
fi

if [ "$PERSISTED_THEME" = "vibrant-blue" ]; then
    print_success "Theme persisted correctly: vibrant-blue"
    THEME_PASSED=true
else
    print_error "Theme NOT persisted! Got: $PERSISTED_THEME (expected vibrant-blue)"
fi

echo ""

# Test 5: Restore original preferences
echo "Step 4: Restoring original preferences..."

RESTORE_RESPONSE=$(curl -s -X PATCH \
    -H "Cookie: $COOKIE" \
    -H "Content-Type: application/json" \
    -d "{
        \"themePreference\": \"$INITIAL_THEME\",
        \"themeDarkMode\": false,
        \"fontSizePreference\": \"$INITIAL_FONT\"
    }" \
    "$API_URL/api/v1/users/me/theme")

print_info "Restored to original: theme=$INITIAL_THEME, fontSize=$INITIAL_FONT"
echo ""

# Final summary
echo "========================================="
echo "Summary"
echo "========================================="
echo ""

if [ "$FONT_PASSED" = true ] && [ "$THEME_PASSED" = true ]; then
    print_success "ALL TESTS PASSED!"
    echo ""
    echo "Font size persistence is working correctly. ✓"
    exit 0
else
    print_error "TESTS FAILED!"
    echo ""
    if [ "$FONT_PASSED" = false ]; then
        print_error "Font size persistence: FAILED"
        echo "  Expected: 20px"
        echo "  Got: $PERSISTED_FONT"
    fi
    if [ "$THEME_PASSED" = false ]; then
        print_error "Theme persistence: FAILED"
        echo "  Expected: vibrant-blue"
        echo "  Got: $PERSISTED_THEME"
    fi
    echo ""
    echo "This indicates the mock database is not properly persisting fontSizePreference."
    echo "Check that the API server has been restarted after the mock database changes."
    exit 1
fi

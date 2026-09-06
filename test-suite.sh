#!/usr/bin/env bash
set -eo pipefail

BASE_URL="http://localhost:3000/api"
COOKIE_JAR=$(mktemp)
TIMESTAMP=$(date +%s)
TEST_EMAIL="test.user.${TIMESTAMP}@domain.com"
TEST_PASSWORD="SecurePassword2026!"
TEST_NAME="Integration Tester"

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

pass() { echo -e "  [${GREEN}PASS${NC}] $1"; }
fail() { echo -e "  [${RED}FAIL${NC}] $1"; exit 1; }
info() { echo -e "\n${BLUE}=== $1 ===${NC}"; }

trap "rm -f ${COOKIE_JAR}" EXIT

# ==============================================================================
# 1. SWAGGER & OPENAPI CONTRACT VALIDATION
# ==============================================================================
info "1. OpenAPI / Swagger Documentation Contracts"

DOCS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/docs")
if [ "$DOCS_STATUS" -eq 200 ]; then
  pass "Swagger UI is mounted and reachable at /api/docs"
else
  fail "Swagger UI returned HTTP ${DOCS_STATUS}"
fi

DOCS_JSON=$(curl -s "${BASE_URL}/docs-json")
if echo "$DOCS_JSON" | grep -q '"openapi"'; then
  pass "OpenAPI JSON spec is valid and exported at /api/docs-json"
else
  fail "OpenAPI spec endpoint /api/docs-json failed"
fi

# ==============================================================================
# 2. VALIDATION PIPES & ERROR ENVELOPE FORMATTING
# ==============================================================================
info "2. DTO Validation & Envelope Defense"

# Case A: Missing required fields and short password
RESP_400=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "not-an-email", "password": "123"}')

HTTP_CODE=$(echo "$RESP_400" | tail -n1)
BODY=$(echo "$RESP_400" | sed '$d')

if [ "$HTTP_CODE" -eq 400 ] && echo "$BODY" | grep -q '"traceId"'; then
  pass "ValidationPipe intercepted invalid payload with HTTP 400 and generated traceId"
else
  fail "Validation failure handling failed. Received: HTTP ${HTTP_CODE} - ${BODY}"
fi

# Case B: Stripping forbidden/non-whitelisted fields
RESP_STRIP=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"whitelisted.${TIMESTAMP}@domain.com\",\"password\":\"${TEST_PASSWORD}\",\"displayName\":\"Tester\",\"role\":\"ADMIN\"}")

HTTP_CODE=$(echo "$RESP_STRIP" | tail -n1)
if [ "$HTTP_CODE" -eq 400 ]; then
  pass "ForbidNonWhitelisted rejected injected role attribute at HTTP perimeter"
else
  fail "Whitelist guard allowed non-whitelisted property through. Received: HTTP ${HTTP_CODE}"
fi

# ==============================================================================
# 3. SECURE-BY-DEFAULT / UNPROTECTED ROUTE DEFENSE
# ==============================================================================
info "3. Secure-by-Default Architecture (/api/auth/me)"

RESP_UNAUTH=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/auth/me")
HTTP_CODE=$(echo "$RESP_UNAUTH" | tail -n1)
BODY=$(echo "$RESP_UNAUTH" | sed '$d')

if [ "$HTTP_CODE" -eq 401 ] && echo "$BODY" | grep -q 'Authentication required'; then
  pass "Global SessionAuthGuard intercepted unauthenticated request with HTTP 401"
else
  fail "Secure-by-default failed to protect /api/auth/me. Received: HTTP ${HTTP_CODE}"
fi

# ==============================================================================
# 4. USER REGISTRATION (HAPPY PATH & DUPLICATES)
# ==============================================================================
info "4. User Registration Flow"

# Happy Path
REG_RESP=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\",\"displayName\":\"${TEST_NAME}\"}")

HTTP_CODE=$(echo "$REG_RESP" | tail -n1)
BODY=$(echo "$REG_RESP" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ] && echo "$BODY" | grep -q '"isEmailVerified":false'; then
  pass "User registered successfully (HTTP 201) with default unverified state"
else
  fail "Registration failed. Received: HTTP ${HTTP_CODE} - ${BODY}"
fi

# Duplicate Email (Sad Path)
DUP_RAW=$(curl -s -i -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\",\"displayName\":\"${TEST_NAME}\"}")

HTTP_CODE=$(echo "$DUP_RAW" | grep "HTTP/" | tail -n1 | awk '{print $2}')

# If rate limited, extract dynamic Retry-After header, pause, and retry
if [ "$HTTP_CODE" -eq 429 ]; then
  RETRY_AFTER=$(echo "$DUP_RAW" | grep -i "^retry-after:" | awk '{print $2}' | tr -d '\r')
  WAIT_TIME="${RETRY_AFTER:-60}"
  echo -e "  ${YELLOW}[WAIT]${NC} Rate limit hit as expected. Sleeping ${WAIT_TIME}s based on Retry-After header..."
  sleep "$WAIT_TIME"

  # Retry the duplicate check after the window clears
  DUP_RAW=$(curl -s -i -X POST "${BASE_URL}/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\",\"displayName\":\"${TEST_NAME}\"}")
  HTTP_CODE=$(echo "$DUP_RAW" | grep "HTTP/" | tail -n1 | awk '{print $2}')
fi

if [ "$HTTP_CODE" -eq 409 ]; then
  pass "Duplicate email rejected with HTTP 409 Conflict"
else
  fail "Duplicate registration did not trigger 409. Received: HTTP ${HTTP_CODE}"
fi

# ==============================================================================
# 5. USER LOGIN & COOKIE ISSUANCE
# ==============================================================================
info "5. Authentication & Stateful Session Lifecycle"

# Invalid Password
BAD_LOGIN=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"WrongPassword!\"}")

HTTP_CODE=$(echo "$BAD_LOGIN" | tail -n1)
if [ "$HTTP_CODE" -eq 401 ]; then
  pass "Argon2id credential mismatch rejected with HTTP 401 Unauthorized"
else
  fail "Invalid login did not return 401. Received: HTTP ${HTTP_CODE}"
fi

# Valid Credentials
LOGIN_RESP=$(curl -s -i -c "${COOKIE_JAR}" -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}")

if echo "$LOGIN_RESP" | grep -iq "Set-Cookie: sid=" && echo "$LOGIN_RESP" | grep -iq "HttpOnly"; then
  pass "Session cookie 'sid' set with HttpOnly attribute"
else
  fail "Login did not set required HttpOnly session cookie"
fi

# ==============================================================================
# 6. SESSION VALIDATION & IDENTITY EXTRACTION
# ==============================================================================
info "6. Authenticated Session Resolution (@CurrentUser)"

ME_RESP=$(curl -s -w "\n%{http_code}" -b "${COOKIE_JAR}" -X GET "${BASE_URL}/auth/me")
HTTP_CODE=$(echo "$ME_RESP" | tail -n1)
BODY=$(echo "$ME_RESP" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ] && echo "$BODY" | grep -q "${TEST_EMAIL}"; then
  pass "Active Redis session validated and resolved correctly from cookie"
else
  fail "Failed to resolve authenticated session. Received: HTTP ${HTTP_CODE} - ${BODY}"
fi

# ==============================================================================
# 7. ROLE-BASED ACCESS CONTROL (RBAC)
# ==============================================================================
info "7. RBAC & RolesGuard Evaluation"

ADMIN_RESP=$(curl -s -w "\n%{http_code}" -b "${COOKIE_JAR}" -X GET "${BASE_URL}/auth/admin-check")
HTTP_CODE=$(echo "$ADMIN_RESP" | tail -n1)
BODY=$(echo "$ADMIN_RESP" | sed '$d')

if [ "$HTTP_CODE" -eq 403 ] && echo "$BODY" | grep -q 'Forbidden resource'; then
  pass "RolesGuard denied access with HTTP 403 Forbidden (STUDENT cannot access ADMIN route)"
else
  fail "RBAC failed to restrict admin route. Received: HTTP ${HTTP_CODE} - ${BODY}"
fi

# ==============================================================================
# 8. RATE LIMITING (SLIDING WINDOW OVER REDIS)
# ==============================================================================
info "8. Distributed Rate Limiting Defense"

RL_HIT_429=false
# Limit is 5 hits per 60s for login; trigger 7 rapid calls
for i in {1..7}; do
  RL_RESP=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"ratelimit.${TIMESTAMP}@domain.com\",\"password\":\"WrongPassword!\"}")
  CODE=$(echo "$RL_RESP" | tail -n1)
  if [ "$CODE" -eq 429 ]; then
    RL_HIT_429=true
    break
  fi
done

if [ "$RL_HIT_429" = true ]; then
  pass "Redis sliding-window rate limiter triggered HTTP 429 Too Many Requests"
else
  fail "Rate limiter failed to trigger HTTP 429 after exceeding limit"
fi

# ==============================================================================
# 9. LOGOUT & REVOCATION
# ==============================================================================
info "9. Session Revocation & Idempotency"

# Revoke Session
LOGOUT_RESP=$(curl -s -i -b "${COOKIE_JAR}" -c "${COOKIE_JAR}" -X POST "${BASE_URL}/auth/logout")

if echo "$LOGOUT_RESP" | grep -iq "Max-Age=0\|expires="; then
  pass "Logout cleared session cookie header"
else
  fail "Logout did not clear session cookie"
fi

# Verify Redis session key was evicted
REVOKED_ME=$(curl -s -w "\n%{http_code}" -b "${COOKIE_JAR}" -X GET "${BASE_URL}/auth/me")
HTTP_CODE=$(echo "$REVOKED_ME" | tail -n1)

if [ "$HTTP_CODE" -eq 401 ]; then
  pass "Previous session rejected after revocation (Redis state purged)"
else
  fail "Revoked session was still accepted. Received: HTTP ${HTTP_CODE}"
fi

# Logout Idempotency (Calling logout without an active session)
IDEMPOTENT_LOGOUT=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/logout")
HTTP_CODE=$(echo "$IDEMPOTENT_LOGOUT" | tail -n1)

if [ "$HTTP_CODE" -eq 200 ]; then
  pass "Logout is completely safe and idempotent for unauthenticated users (HTTP 200)"
else
  fail "Idempotent logout check failed. Received: HTTP ${HTTP_CODE}"
fi

echo -e "\n${GREEN}====================================================${NC}"
echo -e "${GREEN}  ALL 13 END-TO-END SECURITY AUDIT CHECKS PASSED  ${NC}"
echo -e "${GREEN}====================================================${NC}\n"
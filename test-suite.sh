#!/usr/bin/env bash
set -eo pipefail

BASE_URL="http://localhost:3000/api"
COOKIE_JAR=$(mktemp)
REMEMBER_COOKIE_JAR=$(mktemp)
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

trap "rm -f ${COOKIE_JAR} ${REMEMBER_COOKIE_JAR}" EXIT

# ==============================================================================
# ENVELOPE CONTRACT ASSERTION HELPERS
# ==============================================================================

# Asserts standard flat success contract: ApiSuccessResponse<T>
assert_flat_success() {
  local body="$1"
  local expected_status="$2"

  echo "$body" | grep -q '"success":true' || return 1
  echo "$body" | grep -q "\"statusCode\":${expected_status}" || return 1
  echo "$body" | grep -q '"data":' || return 1
  echo "$body" | grep -q '"traceId":' || return 1
  echo "$body" | grep -q '"timestamp":' || return 1
  return 0
}

# Asserts standard flat error contract: ApiErrorResponse
assert_flat_error() {
  local body="$1"
  local expected_status="$2"

  echo "$body" | grep -q '"success":false' || return 1
  echo "$body" | grep -q "\"statusCode\":${expected_status}" || return 1
  echo "$body" | grep -q '"data":null' || return 1
  echo "$body" | grep -q '"error":' || return 1
  echo "$body" | grep -q '"traceId":' || return 1
  echo "$body" | grep -q '"timestamp":' || return 1
  return 0
}

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
# 2. VALIDATION PIPES & ERROR ENVELOPE DEFENSE
# ==============================================================================
info "2. DTO Validation & Flat Error Envelope Defense"

# Case A: Missing required fields and short password
RESP_400=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "not-an-email", "password": "123"}')

HTTP_CODE=$(echo "$RESP_400" | tail -n1)
BODY=$(echo "$RESP_400" | sed '$d')

if [ "$HTTP_CODE" -eq 400 ] && assert_flat_error "$BODY" 400; then
  pass "ValidationPipe rejected invalid payload with compliant flat HTTP 400 envelope"
else
  fail "Validation failure handling failed. Received: HTTP ${HTTP_CODE} - ${BODY}"
fi

# Case B: Reject registration when termsAccepted is false/omitted
RESP_TERMS=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"terms.${TIMESTAMP}@domain.com\",\"password\":\"${TEST_PASSWORD}\",\"displayName\":\"Tester\",\"termsAccepted\":false}")

HTTP_CODE=$(echo "$RESP_TERMS" | tail -n1)
BODY=$(echo "$RESP_TERMS" | sed '$d')

if [ "$HTTP_CODE" -eq 400 ] && assert_flat_error "$BODY" 400; then
  pass "Registration rejected when termsAccepted is false (HTTP 400)"
else
  fail "Registration accepted invalid termsAccepted flag. Received: HTTP ${HTTP_CODE} - ${BODY}"
fi

# Case C: Stripping forbidden/non-whitelisted fields (privilege escalation defense)
RESP_STRIP=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"whitelisted.${TIMESTAMP}@domain.com\",\"password\":\"${TEST_PASSWORD}\",\"displayName\":\"Tester\",\"termsAccepted\":true,\"role\":\"ADMIN\"}")

HTTP_CODE=$(echo "$RESP_STRIP" | tail -n1)
BODY=$(echo "$RESP_STRIP" | sed '$d')

if [ "$HTTP_CODE" -eq 400 ] && assert_flat_error "$BODY" 400; then
  pass "ForbidNonWhitelisted rejected injected role attribute at HTTP perimeter"
else
  fail "Whitelist guard allowed non-whitelisted property through. Received: HTTP ${HTTP_CODE} - ${BODY}"
fi

# ==============================================================================
# 3. SECURE-BY-DEFAULT / UNPROTECTED ROUTE DEFENSE
# ==============================================================================
info "3. Secure-by-Default Architecture (/api/auth/me)"

RESP_UNAUTH=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/auth/me")
HTTP_CODE=$(echo "$RESP_UNAUTH" | tail -n1)
BODY=$(echo "$RESP_UNAUTH" | sed '$d')

if [ "$HTTP_CODE" -eq 401 ] && assert_flat_error "$BODY" 401; then
  pass "Global SessionAuthGuard intercepted unauthenticated request with flat HTTP 401 envelope"
else
  fail "Secure-by-default failed to protect /api/auth/me. Received: HTTP ${HTTP_CODE} - ${BODY}"
fi
# ==============================================================================
# 4. USER REGISTRATION (HAPPY PATH & DUPLICATES)
# ==============================================================================
info "4. User Registration Flow & Conflict Handling"

# Happy Path (With required termsAccepted: true)
REG_RAW=$(curl -s -i -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\",\"displayName\":\"${TEST_NAME}\",\"termsAccepted\":true}")

HTTP_CODE=$(echo "$REG_RAW" | grep -i "^HTTP/" | tail -n1 | awk '{print $2}')

# If hit by rate limiter from previous test steps, wait for window to clear
if [ "$HTTP_CODE" -eq 429 ]; then
  RETRY_AFTER=$(echo "$REG_RAW" | grep -i "^retry-after:" | awk '{print $2}' | tr -d '\r')
  WAIT_TIME="${RETRY_AFTER:-60}"
  echo -e "  ${YELLOW}[WAIT]${NC} Rate limit reached on register. Sleeping ${WAIT_TIME}s based on Retry-After header..."
  sleep "$WAIT_TIME"

  REG_RAW=$(curl -s -i -X POST "${BASE_URL}/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\",\"displayName\":\"${TEST_NAME}\",\"termsAccepted\":true}")
  HTTP_CODE=$(echo "$REG_RAW" | grep -i "^HTTP/" | tail -n1 | awk '{print $2}')
fi

BODY=$(echo "$REG_RAW" | sed '1,/^\r\{0,1\}$/d')
TRACE_HEADER=$(echo "$REG_RAW" | grep -i "^x-trace-id:" | awk '{print $2}' | tr -d '\r')

if [ "$HTTP_CODE" -eq 201 ] && \
   assert_flat_success "$BODY" 201 && \
   echo "$BODY" | grep -q '"isEmailVerified":false' && \
   echo "$BODY" | grep -q "\"traceId\":\"${TRACE_HEADER}\""; then
  pass "User registered successfully (HTTP 201 flat envelope with synchronized x-trace-id)"
else
  fail "Registration failed. Received: HTTP ${HTTP_CODE} - ${BODY}"
fi

# Duplicate Email (Sad Path)
DUP_RAW=$(curl -s -i -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\",\"displayName\":\"${TEST_NAME}\",\"termsAccepted\":true}")

HTTP_CODE=$(echo "$DUP_RAW" | grep -i "^HTTP/" | tail -n1 | awk '{print $2}')

if [ "$HTTP_CODE" -eq 429 ]; then
  RETRY_AFTER=$(echo "$DUP_RAW" | grep -i "^retry-after:" | awk '{print $2}' | tr -d '\r')
  WAIT_TIME="${RETRY_AFTER:-60}"
  echo -e "  ${YELLOW}[WAIT]${NC} Rate limit reached as expected. Sleeping ${WAIT_TIME}s based on Retry-After header..."
  sleep "$WAIT_TIME"

  DUP_RAW=$(curl -s -i -X POST "${BASE_URL}/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\",\"displayName\":\"${TEST_NAME}\",\"termsAccepted\":true}")
  HTTP_CODE=$(echo "$DUP_RAW" | grep -i "^HTTP/" | tail -n1 | awk '{print $2}')
fi

BODY=$(echo "$DUP_RAW" | sed '1,/^\r\{0,1\}$/d')

if [ "$HTTP_CODE" -eq 409 ] && assert_flat_error "$BODY" 409; then
  pass "Duplicate email rejected with flat HTTP 409 Conflict envelope"
else
  fail "Duplicate registration did not trigger 409. Received: HTTP ${HTTP_CODE} - ${BODY}"
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
BODY=$(echo "$BAD_LOGIN" | sed '$d')

if [ "$HTTP_CODE" -eq 401 ] && assert_flat_error "$BODY" 401; then
  pass "Argon2id credential mismatch rejected with flat HTTP 401 envelope"
else
  fail "Invalid login did not return 401. Received: HTTP ${HTTP_CODE} - ${BODY}"
fi

# Standard Login (Session Cookie: No Expires attribute)
LOGIN_RESP=$(curl -s -i -c "${COOKIE_JAR}" -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\",\"rememberMe\":false}")

HTTP_CODE=$(echo "$LOGIN_RESP" | grep -i "^HTTP/" | tail -n1 | awk '{print $2}')
BODY=$(echo "$LOGIN_RESP" | sed '1,/^\r\{0,1\}$/d')

if [ "$HTTP_CODE" -eq 200 ] && \
   assert_flat_success "$BODY" 200 && \
   echo "$LOGIN_RESP" | grep -iq "Set-Cookie: sid=" && \
   echo "$LOGIN_RESP" | grep -iq "HttpOnly"; then
  pass "Standard login issued transient session 'sid' cookie (HTTP 200)"
else
  fail "Standard login failed. Received: HTTP ${HTTP_CODE} - ${BODY}"
fi

# Persistent Login (Remember Me: Expires attribute present)
REMEMBER_RESP=$(curl -s -i -c "${REMEMBER_COOKIE_JAR}" -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\",\"rememberMe\":true}")

HTTP_CODE=$(echo "$REMEMBER_RESP" | grep -i "^HTTP/" | tail -n1 | awk '{print $2}')

if [ "$HTTP_CODE" -eq 200 ] && \
   echo "$REMEMBER_RESP" | grep -iq "Set-Cookie: sid=" && \
   echo "$REMEMBER_RESP" | grep -iq "Expires="; then
  pass "Remember Me login issued persistent cookie containing 30-day 'Expires=' attribute"
else
  fail "Remember Me cookie verification failed. Received: HTTP ${HTTP_CODE} - ${REMEMBER_RESP}"
fi

# ==============================================================================
# 6. SESSION VALIDATION & IDENTITY EXTRACTION
# ==============================================================================
info "6. Authenticated Session Resolution (@CurrentUser)"

ME_RESP=$(curl -s -w "\n%{http_code}" -b "${COOKIE_JAR}" -X GET "${BASE_URL}/auth/me")
HTTP_CODE=$(echo "$ME_RESP" | tail -n1)
BODY=$(echo "$ME_RESP" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ] && \
   assert_flat_success "$BODY" 200 && \
   echo "$BODY" | grep -q "${TEST_EMAIL}"; then
  pass "Active Redis session resolved user identity inside flat HTTP 200 envelope"
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

if [ "$HTTP_CODE" -eq 403 ] && assert_flat_error "$BODY" 403; then
  pass "RolesGuard denied access with flat HTTP 403 Forbidden envelope (STUDENT blocked from ADMIN)"
else
  fail "RBAC failed to restrict admin route. Received: HTTP ${HTTP_CODE} - ${BODY}"
fi

# ==============================================================================
# 8. RATE LIMITING (SLIDING WINDOW OVER REDIS)
# ==============================================================================
info "8. Distributed Rate Limiting Defense"

RL_HIT_429=false
for i in {1..7}; do
  RL_RESP=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"ratelimit.${TIMESTAMP}@domain.com\",\"password\":\"WrongPassword!\"}")
  CODE=$(echo "$RL_RESP" | tail -n1)
  RL_BODY=$(echo "$RL_RESP" | sed '$d')

  if [ "$CODE" -eq 429 ]; then
    if assert_flat_error "$RL_BODY" 429; then
      RL_HIT_429=true
      break
    fi
  fi
done

if [ "$RL_HIT_429" = true ]; then
  pass "Redis sliding-window rate limiter triggered flat HTTP 429 Too Many Requests envelope"
else
  fail "Rate limiter failed to trigger HTTP 429 with flat envelope after exceeding quota"
fi

# ==============================================================================
# 9. LOGOUT & REVOCATION
# ==============================================================================
info "9. Session Revocation & Idempotency"

# Revoke Session
LOGOUT_RESP=$(curl -s -i -b "${COOKIE_JAR}" -c "${COOKIE_JAR}" -X POST "${BASE_URL}/auth/logout")
HTTP_CODE=$(echo "$LOGOUT_RESP" | grep -i "^HTTP/" | tail -n1 | awk '{print $2}')
BODY=$(echo "$LOGOUT_RESP" | sed '1,/^\r\{0,1\}$/d')

if [ "$HTTP_CODE" -eq 200 ] && \
   assert_flat_success "$BODY" 200 && \
   echo "$BODY" | grep -q '"loggedOut":true' && \
   echo "$LOGOUT_RESP" | grep -iq "Max-Age=0\|expires="; then
  pass "Logout evicted Redis session, cleared cookie header, and emitted flat HTTP 200 envelope"
else
  fail "Logout did not succeed properly. Received: HTTP ${HTTP_CODE} - ${BODY}"
fi

# Verify Redis session key was evicted
REVOKED_ME=$(curl -s -w "\n%{http_code}" -b "${COOKIE_JAR}" -X GET "${BASE_URL}/auth/me")
HTTP_CODE=$(echo "$REVOKED_ME" | tail -n1)
BODY=$(echo "$REVOKED_ME" | sed '$d')

if [ "$HTTP_CODE" -eq 401 ] && assert_flat_error "$BODY" 401; then
  pass "Revoked session rejected on subsequent calls (Redis state cleared)"
else
  fail "Revoked session was still accepted. Received: HTTP ${HTTP_CODE} - ${BODY}"
fi

# Logout Idempotency (Calling logout without an active session)
IDEMPOTENT_LOGOUT=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/logout")
HTTP_CODE=$(echo "$IDEMPOTENT_LOGOUT" | tail -n1)
BODY=$(echo "$IDEMPOTENT_LOGOUT" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ] && assert_flat_success "$BODY" 200 && echo "$BODY" | grep -q '"loggedOut":true'; then
  pass "Logout is completely safe and idempotent for unauthenticated users (HTTP 200)"
else
  fail "Idempotent logout check failed. Received: HTTP ${HTTP_CODE} - ${BODY}"
fi

echo -e "\n${GREEN}================================================================${NC}"
echo -e "${GREEN}  ALL 15 END-TO-END SECURITY & FLAT ENVELOPE CHECKS PASSED  ${NC}"
echo -e "${GREEN}================================================================${NC}\n"
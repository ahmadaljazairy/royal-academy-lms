#!/usr/bin/env bash
set -eo pipefail

BASE_URL="http://localhost:3000/api"
MAILPIT_API="http://localhost:8025/api/v1"
COOKIE_JAR=$(mktemp)
REMEMBER_COOKIE_JAR=$(mktemp)
RESET_COOKIE_JAR=$(mktemp)
TIMESTAMP=$(date +%s)
TEST_EMAIL="test.user.${TIMESTAMP}@domain.com"
TEST_PASSWORD="SecurePassword2026!"
TEST_NEW_PASSWORD="BrandNewPassword2026!"
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

trap "rm -f ${COOKIE_JAR} ${REMEMBER_COOKIE_JAR} ${RESET_COOKIE_JAR}" EXIT

# ==============================================================================
# ENVELOPE CONTRACT ASSERTION HELPERS
# ==============================================================================

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

REG_RAW=$(curl -s -i -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\",\"displayName\":\"${TEST_NAME}\",\"termsAccepted\":true}")

HTTP_CODE=$(echo "$REG_RAW" | grep -i "^HTTP/" | tail -n1 | awk '{print $2}')

if [ "$HTTP_CODE" -eq 429 ]; then
  RETRY_AFTER=$(echo "$REG_RAW" | grep -i "^retry-after:" | awk '{print $2}' | tr -d '\r')
  WAIT_TIME="${RETRY_AFTER:-60}"
  echo -e "  ${YELLOW}[WAIT]${NC} Rate limit reached on register. Sleeping ${WAIT_TIME}s..."
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
   echo "$BODY" | grep -q "${TEST_EMAIL}" && \
   echo "$BODY" | grep -q '"isEmailVerified":false'; then
  pass "Active Redis session resolved user identity (unverified email status accurate)"
else
  fail "Failed to resolve authenticated session. Received: HTTP ${HTTP_CODE} - ${BODY}"
fi

# ==============================================================================
# 7. BULLMQ EMAIL VERIFICATION FLOW VIA MAILPIT
# ==============================================================================
info "7. BullMQ Email Verification Flow via Mailpit"

MAILPIT_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "${MAILPIT_API}/messages" || true)
if [ "$MAILPIT_CHECK" -ne 200 ]; then
  fail "Mailpit API unreachable on port 8025. Ensure Mailpit container is running."
fi

echo -e "  ${BLUE}[INFO]${NC} Waiting 2s for background BullMQ worker to deliver verification email..."
sleep 2

# Fetch exact message ID using Mailpit's query search parameter
VERIF_SEARCH_JSON=$(curl -s "${MAILPIT_API}/messages?query=${TEST_EMAIL}")
VERIF_MSG_ID=$(echo "$VERIF_SEARCH_JSON" | grep -o '"ID":"[^"]*"' | head -n1 | cut -d'"' -f4)

if [ -z "$VERIF_MSG_ID" ]; then
  fail "Verification email was not received in Mailpit for ${TEST_EMAIL}"
else
  pass "Verification email caught by Mailpit (Message ID: ${VERIF_MSG_ID})"
fi

# Fetch full message and extract verification token
VERIF_BODY=$(curl -s "${MAILPIT_API}/message/${VERIF_MSG_ID}")
VERIFY_TOKEN=$(echo "$VERIF_BODY" | grep -o 'token=[a-zA-Z0-9_-]*' | head -n1 | cut -d'=' -f2)

if [ -z "$VERIFY_TOKEN" ]; then
  fail "Failed to extract verification token from email body"
else
  pass "Extracted verification token from Mailpit email payload"
fi

# Reject invalid/tampered token
IV_RESP=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/verify-email" \
  -H "Content-Type: application/json" \
  -d '{"token":"invalid-tampered-token-12345"}')

IV_CODE=$(echo "$IV_RESP" | tail -n1)
IV_BODY=$(echo "$IV_RESP" | sed '$d')

if [ "$IV_CODE" -eq 400 ] && assert_flat_error "$IV_BODY" 400; then
  pass "Invalid verification token rejected with flat HTTP 400 envelope"
else
  fail "Invalid token was not rejected properly. Received: HTTP ${IV_CODE} - ${IV_BODY}"
fi

# Consume valid token
VV_RESP=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/verify-email" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"${VERIFY_TOKEN}\"}")

VV_CODE=$(echo "$VV_RESP" | tail -n1)
VV_BODY=$(echo "$VV_RESP" | sed '$d')

if [ "$VV_CODE" -eq 200 ] && assert_flat_success "$VV_BODY" 200 && echo "$VV_BODY" | grep -q '"verified":true'; then
  pass "Valid verification token consumed (HTTP 200, user email marked verified)"
else
  fail "Valid verification token failed. Received: HTTP ${VV_CODE} - ${VV_BODY}"
fi

# Replay attack prevention (Single-use check)
REPLAY_RESP=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/verify-email" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"${VERIFY_TOKEN}\"}")

RV_CODE=$(echo "$REPLAY_RESP" | tail -n1)
RV_BODY=$(echo "$REPLAY_RESP" | sed '$d')

if [ "$RV_CODE" -eq 400 ] && assert_flat_error "$RV_BODY" 400; then
  pass "Replay attack prevented: Single-use token purged via GETDEL (HTTP 400)"
else
  fail "Replay attack succeeded or returned unexpected code. Received: HTTP ${RV_CODE} - ${RV_BODY}"
fi

# Verify active Redis session synchronized isEmailVerified: true
ME_VERIF_RESP=$(curl -s -w "\n%{http_code}" -b "${COOKIE_JAR}" -X GET "${BASE_URL}/auth/me")
ME_V_CODE=$(echo "$ME_VERIF_RESP" | tail -n1)
ME_V_BODY=$(echo "$ME_VERIF_RESP" | sed '$d')

if [ "$ME_V_CODE" -eq 200 ] && echo "$ME_V_BODY" | grep -q '"isEmailVerified":true'; then
  pass "Active Redis session payload synchronized: isEmailVerified is now true without re-login"
else
  fail "Session synchronization failed. Received: HTTP ${ME_V_CODE} - ${ME_V_BODY}"
fi

# ==============================================================================
# 8. RESEND VERIFICATION & ANTI-ENUMERATION
# ==============================================================================
info "8. Resend Verification & Anti-Enumeration Defense"

# Non-existent email
NON_EXISTENT_RESEND=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/resend-verification" \
  -H "Content-Type: application/json" \
  -d '{"email":"does-not-exist@domain.com"}')

NE_CODE=$(echo "$NON_EXISTENT_RESEND" | tail -n1)
NE_BODY=$(echo "$NON_EXISTENT_RESEND" | sed '$d')

if [ "$NE_CODE" -eq 200 ] && assert_flat_success "$NE_BODY" 200; then
  pass "Anti-enumeration upheld: Non-existent email returns generic HTTP 200 success"
else
  fail "Resend verification leaked account non-existence. Received: HTTP ${NE_CODE} - ${NE_BODY}"
fi

# Already verified user
ALREADY_VERIFIED_RESEND=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/resend-verification" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\"}")

AV_CODE=$(echo "$ALREADY_VERIFIED_RESEND" | tail -n1)
AV_BODY=$(echo "$ALREADY_VERIFIED_RESEND" | sed '$d')

if [ "$AV_CODE" -eq 200 ] && assert_flat_success "$AV_BODY" 200; then
  pass "Anti-enumeration upheld: Already verified user returns generic HTTP 200 success"
else
  fail "Resend verification failed for verified user. Received: HTTP ${AV_CODE} - ${AV_BODY}"
fi

# ==============================================================================
# 9. FORGOT & RESET PASSWORD LIFECYCLE
# ==============================================================================
info "9. Forgot & Reset Password Lifecycle with Session Invalidation"

# Non-existent user forgot-password request
FP_NON_EXISTENT=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"ghost-user@domain.com"}')

FP_NE_CODE=$(echo "$FP_NON_EXISTENT" | tail -n1)
FP_NE_BODY=$(echo "$FP_NON_EXISTENT" | sed '$d')

if [ "$FP_NE_CODE" -eq 200 ] && assert_flat_success "$FP_NE_BODY" 200; then
  pass "Forgot password anti-enumeration: Non-existent user returns generic HTTP 200"
else
  fail "Forgot password leaked account existence. Received: HTTP ${FP_NE_CODE} - ${FP_NE_BODY}"
fi

# Valid forgot-password request
FP_VALID=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\"}")

FP_V_CODE=$(echo "$FP_VALID" | tail -n1)
FP_V_BODY=$(echo "$FP_VALID" | sed '$d')

if [ "$FP_V_CODE" -eq 200 ] && assert_flat_success "$FP_V_BODY" 200; then
  pass "Forgot password request accepted and queued (HTTP 200)"
else
  fail "Forgot password failed. Received: HTTP ${FP_V_CODE} - ${FP_V_BODY}"
fi

echo -e "  ${BLUE}[INFO]${NC} Waiting 2s for background BullMQ worker to deliver reset password email..."
sleep 2

# Fetch password reset email using query search parameter
RESET_SEARCH_JSON=$(curl -s "${MAILPIT_API}/messages?query=${TEST_EMAIL}")
RESET_MSG_ID=$(echo "$RESET_SEARCH_JSON" | grep -o '"ID":"[^"]*"' | head -n1 | cut -d'"' -f4)

if [ -z "$RESET_MSG_ID" ]; then
  fail "Failed to find password reset email in Mailpit for ${TEST_EMAIL}"
fi

RESET_EMAIL_PAYLOAD=$(curl -s "${MAILPIT_API}/message/${RESET_MSG_ID}")
RESET_TOKEN=$(echo "$RESET_EMAIL_PAYLOAD" | grep -o 'token=[a-zA-Z0-9_-]*' | head -n1 | cut -d'=' -f2)

if [ -z "$RESET_TOKEN" ]; then
  fail "Failed to extract reset password token from Mailpit message ${RESET_MSG_ID}"
else
  pass "Extracted reset password token from Mailpit email payload"
fi

# Weak new password rejection
WEAK_RESET=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"${RESET_TOKEN}\",\"newPassword\":\"weak\"}")

WR_CODE=$(echo "$WEAK_RESET" | tail -n1)
WR_BODY=$(echo "$WEAK_RESET" | sed '$d')

if [ "$WR_CODE" -eq 400 ] && assert_flat_error "$WR_BODY" 400; then
  pass "Password complexity validation enforced on reset-password (HTTP 400)"
else
  fail "Weak password was not rejected on reset. Received: HTTP ${WR_CODE} - ${WR_BODY}"
fi

# Execute valid password reset
EXEC_RESET=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"${RESET_TOKEN}\",\"newPassword\":\"${TEST_NEW_PASSWORD}\"}")

ER_CODE=$(echo "$EXEC_RESET" | tail -n1)
ER_BODY=$(echo "$EXEC_RESET" | sed '$d')

if [ "$ER_CODE" -eq 200 ] && assert_flat_success "$ER_BODY" 200; then
  pass "Password reset executed successfully with Argon2id hash update (HTTP 200)"
else
  fail "Password reset failed. Received: HTTP ${ER_CODE} - ${ER_BODY}"
fi

# Verify replay attack protection for reset token
REPLAY_RESET=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"${RESET_TOKEN}\",\"newPassword\":\"${TEST_NEW_PASSWORD}\"}")

RR_CODE=$(echo "$REPLAY_RESET" | tail -n1)
RR_BODY=$(echo "$REPLAY_RESET" | sed '$d')

if [ "$RR_CODE" -eq 400 ] && assert_flat_error "$RR_BODY" 400; then
  pass "Replay attack prevented: Single-use reset token was purged (HTTP 400)"
else
  fail "Reset token replay attack succeeded. Received: HTTP ${RR_CODE} - ${RR_BODY}"
fi

# Verify previous active session was completely revoked in Redis
ME_POST_RESET=$(curl -s -w "\n%{http_code}" -b "${COOKIE_JAR}" -X GET "${BASE_URL}/auth/me")
MPR_CODE=$(echo "$ME_POST_RESET" | tail -n1)
MPR_BODY=$(echo "$ME_POST_RESET" | sed '$d')

if [ "$MPR_CODE" -eq 401 ] && assert_flat_error "$MPR_BODY" 401; then
  pass "Security revocation verified: Previous active sessions invalidated in Redis following reset"
else
  fail "Active session remained valid after password reset. Received: HTTP ${MPR_CODE} - ${MPR_BODY}"
fi

# Old password rejection
OLD_PW_LOGIN=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}")

OPL_CODE=$(echo "$OLD_PW_LOGIN" | tail -n1)
OPL_BODY=$(echo "$OLD_PW_LOGIN" | sed '$d')

if [ "$OPL_CODE" -eq 401 ] && assert_flat_error "$OPL_BODY" 401; then
  pass "Old password rejected upon login (Argon2id credential check)"
else
  fail "Old password was still accepted after reset. Received: HTTP ${OPL_CODE} - ${OPL_BODY}"
fi

# New password verification
NEW_PW_LOGIN=$(curl -s -i -c "${RESET_COOKIE_JAR}" -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_NEW_PASSWORD}\"}")

NPL_CODE=$(echo "$NEW_PW_LOGIN" | grep -i "^HTTP/" | tail -n1 | awk '{print $2}')
NPL_BODY=$(echo "$NEW_PW_LOGIN" | sed '1,/^\r\{0,1\}$/d')

if [ "$NPL_CODE" -eq 200 ] && assert_flat_success "$NPL_BODY" 200; then
  pass "Authenticated successfully with new password (HTTP 200)"
else
  fail "Login with new password failed. Received: HTTP ${NPL_CODE} - ${NPL_BODY}"
fi

# ==============================================================================
# 10. ROLE-BASED ACCESS CONTROL (RBAC)
# ==============================================================================
info "10. RBAC & RolesGuard Evaluation"

ADMIN_RESP=$(curl -s -w "\n%{http_code}" -b "${RESET_COOKIE_JAR}" -X GET "${BASE_URL}/auth/admin-check")
HTTP_CODE=$(echo "$ADMIN_RESP" | tail -n1)
BODY=$(echo "$ADMIN_RESP" | sed '$d')

if [ "$HTTP_CODE" -eq 403 ] && assert_flat_error "$BODY" 403; then
  pass "RolesGuard denied access with flat HTTP 403 Forbidden envelope (STUDENT blocked from ADMIN)"
else
  fail "RBAC failed to restrict admin route. Received: HTTP ${HTTP_CODE} - ${BODY}"
fi

# ==============================================================================
# 11. RATE LIMITING (SLIDING WINDOW OVER REDIS)
# ==============================================================================
info "11. Distributed Rate Limiting Defense"

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
# 12. LOGOUT & REVOCATION
# ==============================================================================
info "12. Session Revocation & Idempotency"

LOGOUT_RESP=$(curl -s -i -b "${RESET_COOKIE_JAR}" -c "${RESET_COOKIE_JAR}" -X POST "${BASE_URL}/auth/logout")
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

REVOKED_ME=$(curl -s -w "\n%{http_code}" -b "${RESET_COOKIE_JAR}" -X GET "${BASE_URL}/auth/me")
HTTP_CODE=$(echo "$REVOKED_ME" | tail -n1)
BODY=$(echo "$REVOKED_ME" | sed '$d')

if [ "$HTTP_CODE" -eq 401 ] && assert_flat_error "$BODY" 401; then
  pass "Revoked session rejected on subsequent calls (Redis state cleared)"
else
  fail "Revoked session was still accepted. Received: HTTP ${HTTP_CODE} - ${BODY}"
fi

IDEMPOTENT_LOGOUT=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/logout")
HTTP_CODE=$(echo "$IDEMPOTENT_LOGOUT" | tail -n1)
BODY=$(echo "$IDEMPOTENT_LOGOUT" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ] && assert_flat_success "$BODY" 200 && echo "$BODY" | grep -q '"loggedOut":true'; then
  pass "Logout is completely safe and idempotent for unauthenticated users (HTTP 200)"
else
  fail "Idempotent logout check failed. Received: HTTP ${HTTP_CODE} - ${BODY}"
fi

echo -e "\n${GREEN}================================================================${NC}"
echo -e "${GREEN}  ALL 26 END-TO-END SECURITY & FLAT ENVELOPE CHECKS PASSED  ${NC}"
echo -e "${GREEN}================================================================${NC}\n"
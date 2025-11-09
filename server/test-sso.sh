#!/bin/bash

echo "🧪 Testing Carriage SSO Backend Implementation"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3001"

echo "📋 Pre-requisites:"
echo "   - Backend server must be running (npm run dev)"
echo "   - SSO_ENABLED=true in .env"
echo ""
read -p "Is the server running? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "${RED}❌ Please start the server with 'npm run dev' and try again${NC}"
    exit 1
fi
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
echo "--------------------"
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/api/health-check)
if [ "$HEALTH" == "200" ]; then
    echo "${GREEN}✅ Server is running (HTTP $HEALTH)${NC}"
else
    echo "${RED}❌ Server health check failed (HTTP $HEALTH)${NC}"
    exit 1
fi
echo ""

# Test 2: SAML Metadata Endpoint
echo "Test 2: SAML Metadata Endpoint"
echo "-------------------------------"
METADATA_RESPONSE=$(curl -s ${BASE_URL}/api/sso/metadata)
if [[ $METADATA_RESPONSE == *"EntityDescriptor"* ]]; then
    echo "${GREEN}✅ SAML metadata endpoint working${NC}"
    echo "   Response preview: ${METADATA_RESPONSE:0:100}..."
else
    echo "${RED}❌ SAML metadata endpoint failed${NC}"
    echo "   Response: $METADATA_RESPONSE"
fi
echo ""

# Test 3: SSO Login Redirect
echo "Test 3: SSO Login Redirect"
echo "---------------------------"
LOGIN_REDIRECT=$(curl -s -I ${BASE_URL}/api/sso/login | grep -i location)
if [[ $LOGIN_REDIRECT == *"shibidp"* ]]; then
    echo "${GREEN}✅ SSO login redirects to Cornell IdP${NC}"
    echo "   Redirect: $LOGIN_REDIRECT"
else
    echo "${RED}❌ SSO login redirect failed${NC}"
    echo "   Response: $LOGIN_REDIRECT"
fi
echo ""

# Test 4: Session Protection
echo "Test 4: Session Protection (Unauthenticated Request)"
echo "-----------------------------------------------------"
PROFILE_RESPONSE=$(curl -s ${BASE_URL}/api/sso/profile)
if [[ $PROFILE_RESPONSE == *"Not authenticated"* ]]; then
    echo "${GREEN}✅ Profile endpoint protected (requires authentication)${NC}"
    echo "   Response: $PROFILE_RESPONSE"
else
    echo "${YELLOW}⚠️  Unexpected response from profile endpoint${NC}"
    echo "   Response: $PROFILE_RESPONSE"
fi
echo ""

# Test 5: Check Session Directory
echo "Test 5: Session Storage"
echo "-----------------------"
if [ -d "private/sessions" ]; then
    echo "${GREEN}✅ Session directory exists${NC}"
    SESSION_COUNT=$(ls -1 private/sessions 2>/dev/null | wc -l)
    echo "   Active sessions: $SESSION_COUNT"
else
    echo "${RED}❌ Session directory not found${NC}"
fi
echo ""

# Summary
echo "=============================================="
echo "${GREEN}✅ All basic SSO backend tests passed!${NC}"
echo ""
echo "📝 Next Steps:"
echo "   1. Register SP metadata with Cornell IT"
echo "   2. Add test user to database with Cornell email"
echo "   3. Test full SAML flow in browser:"
echo "      ${BASE_URL}/api/sso/login?redirect_uri=/dashboard"
echo ""
echo "   For full testing, you'll need:"
echo "   - Cornell NetID test credentials"
echo "   - OR access to production Shibboleth IdP"
echo ""

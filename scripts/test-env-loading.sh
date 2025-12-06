#!/bin/bash

# Script to test if .env file loading works correctly
# This simulates what happens in the Dockerfile

set -e

echo "🧪 Testing .env file loading..."
echo ""

# Create a test .env file
cat > /tmp/test.env << 'EOF'
# Test comment
NEXT_PUBLIC_FIREBASE_API_KEY=test-api-key-123
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=test-domain.firebaseapp.com
NEXT_PUBLIC_API_URL=https://test-api.com
OTHER_VAR=should-not-be-loaded
EOF

echo "📄 Test .env content:"
cat /tmp/test.env
echo ""

echo "🔧 Loading NEXT_PUBLIC variables..."
export $(grep -v '^#' /tmp/test.env | grep 'NEXT_PUBLIC' | xargs)

echo ""
echo "✅ Loaded variables:"
env | grep NEXT_PUBLIC || echo "❌ No NEXT_PUBLIC variables found!"

echo ""
echo "🧪 Testing individual variables:"
echo "  NEXT_PUBLIC_FIREBASE_API_KEY: ${NEXT_PUBLIC_FIREBASE_API_KEY:-NOT SET}"
echo "  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:-NOT SET}"
echo "  NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-NOT SET}"
echo "  OTHER_VAR (should be empty): ${OTHER_VAR:-NOT SET}"

# Cleanup
rm /tmp/test.env

echo ""
echo "✅ Test completed successfully!"


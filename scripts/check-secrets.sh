#!/bin/bash

# Script to check if all required secrets exist in Google Cloud Secret Manager
# Usage: ./scripts/check-secrets.sh YOUR_PROJECT_ID

set -e

if [ -z "$1" ]; then
  echo "❌ Error: Project ID is required"
  echo "Usage: $0 YOUR_PROJECT_ID"
  exit 1
fi

PROJECT_ID="$1"

echo "🔍 Checking secrets in project: $PROJECT_ID"
echo ""

# Required secrets
REQUIRED_SECRETS=(
  "NEXT_PUBLIC_FIREBASE_API_KEY"
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
  "NEXT_PUBLIC_FIREBASE_APP_ID"
  "NEXT_PUBLIC_API_URL"
  "NEXT_PUBLIC_STRIPE_PUBLIC_KEY"
)

# Optional secrets
OPTIONAL_SECRETS=(
  "NEXT_PUBLIC_HEYGEN_API_KEY"
)

missing_required=0
missing_optional=0

echo "📋 Checking required secrets..."
for secret in "${REQUIRED_SECRETS[@]}"; do
  if gcloud secrets describe "$secret" --project="$PROJECT_ID" &> /dev/null; then
    echo "  ✅ $secret exists"
  else
    echo "  ❌ $secret is MISSING"
    ((missing_required++))
  fi
done

echo ""
echo "📋 Checking optional secrets..."
for secret in "${OPTIONAL_SECRETS[@]}"; do
  if gcloud secrets describe "$secret" --project="$PROJECT_ID" &> /dev/null; then
    echo "  ✅ $secret exists"
  else
    echo "  ⚠️  $secret is missing (optional)"
    ((missing_optional++))
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $missing_required -eq 0 ]; then
  echo "✅ All required secrets are configured!"
  if [ $missing_optional -gt 0 ]; then
    echo "⚠️  $missing_optional optional secret(s) missing"
  fi
  exit 0
else
  echo "❌ $missing_required required secret(s) are missing!"
  echo ""
  echo "Please create the missing secrets using:"
  echo "  See SECRETS_SETUP.md for detailed instructions"
  exit 1
fi


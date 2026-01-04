#!/bin/bash

# Onboarding Migration Script
# This script adds onboarding fields to the user_profiles table

echo "=========================================="
echo "Running Onboarding Migration"
echo "=========================================="
echo ""
echo "This migration will:"
echo "  1. Add onboarding fields to user_profiles table"
echo "  2. Mark existing active users as having completed onboarding"
echo "  3. Create triggers for auto-profile creation"
echo "  4. Set up RLS policies"
echo ""
echo "⚠️  IMPORTANT: Run this in your Supabase SQL Editor"
echo ""
echo "Steps:"
echo "  1. Go to your Supabase project dashboard"
echo "  2. Click 'SQL Editor' in the left sidebar"
echo "  3. Click 'New Query'"
echo "  4. Copy and paste the contents of: add-onboarding-fields.sql"
echo "  5. Click 'Run' to execute the migration"
echo ""
echo "=========================================="
echo "Migration file: add-onboarding-fields.sql"
echo "=========================================="

# Display the file path
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SQL_FILE="$SCRIPT_DIR/add-onboarding-fields.sql"

if [ -f "$SQL_FILE" ]; then
    echo "✅ Migration file found at: $SQL_FILE"
    echo ""
    echo "File preview (first 20 lines):"
    echo "=========================================="
    head -n 20 "$SQL_FILE"
    echo "..."
    echo "=========================================="
    echo ""
    echo "📋 Copy this file path to access it:"
    echo "$SQL_FILE"
else
    echo "❌ Migration file not found!"
    echo "Expected location: $SQL_FILE"
fi

echo ""
echo "After running the migration:"
echo "  ✅ Existing users will keep their data"
echo "  ✅ New users will see onboarding on first login"
echo "  ✅ Users with activity will skip onboarding automatically"
echo ""

#!/bin/bash

# ============================================================================
# Advanced Social Feed Schema Setup Script
# ============================================================================
# This script helps you set up the social feed database schema in Supabase
# ============================================================================

echo ""
echo "🚀 Advanced Social Feed Schema Setup"
echo "===================================="
echo ""

# Check if SQL file exists
if [ ! -f "database-social-schema.sql" ]; then
    echo "❌ Error: database-social-schema.sql not found!"
    echo "   Make sure you're running this from the project root directory."
    exit 1
fi

echo "✅ Found database-social-schema.sql"
echo ""

# Display file info
FILE_SIZE=$(wc -c < database-social-schema.sql | tr -d ' ')
LINE_COUNT=$(wc -l < database-social-schema.sql | tr -d ' ')
echo "📊 Schema file stats:"
echo "   • Size: ${FILE_SIZE} bytes"
echo "   • Lines: ${LINE_COUNT}"
echo ""

# Instructions
echo "📋 SETUP INSTRUCTIONS"
echo "===================="
echo ""
echo "Option 1: Supabase Dashboard (Recommended)"
echo "-------------------------------------------"
echo "1. Open your Supabase Dashboard: https://supabase.com/dashboard"
echo "2. Select your project"
echo "3. Go to 'SQL Editor' in the left sidebar"
echo "4. Click 'New Query'"
echo "5. Copy & paste the contents of 'database-social-schema.sql'"
echo "6. Click 'Run' (or press Cmd+Enter)"
echo ""
echo "Option 2: Copy to Clipboard (macOS)"
echo "------------------------------------"
read -p "Press Enter to copy SQL to clipboard (then paste in Supabase)..."
cat database-social-schema.sql | pbcopy
echo "✅ SQL copied to clipboard!"
echo "   Now paste it into Supabase SQL Editor and click Run."
echo ""

echo "Option 3: Supabase CLI"
echo "----------------------"
echo "If you have Supabase CLI installed:"
echo "  $ supabase db push --file database-social-schema.sql"
echo ""

# Offer to display the SQL
echo ""
read -p "Want to view the SQL content? (y/n): " VIEW_SQL
if [ "$VIEW_SQL" = "y" ] || [ "$VIEW_SQL" = "Y" ]; then
    echo ""
    echo "===================================="
    echo "SQL CONTENT"
    echo "===================================="
    cat database-social-schema.sql
    echo ""
fi

# Verification steps
echo ""
echo "📋 VERIFICATION STEPS (After running SQL)"
echo "========================================="
echo ""
echo "1. Check that these tables exist in Supabase:"
echo "   ✓ user_follows"
echo "   ✓ social_posts"
echo "   ✓ post_likes"
echo "   ✓ post_comments"
echo "   ✓ user_interactions"
echo "   ✓ post_saves"
echo "   ✓ user_profiles"
echo ""
echo "2. Go to: Table Editor in Supabase Dashboard"
echo "3. Verify you can see all 7 tables listed"
echo ""
echo "4. Optional: Create sample user profiles"
echo "   Run this in SQL Editor:"
echo ""
echo "   INSERT INTO user_profiles (user_id, username, bio, avatar_url)"
echo "   SELECT "
echo "     id,"
echo "     COALESCE(raw_user_meta_data->>'name', email),"
echo "     'Food enthusiast 🍕',"
echo "     'https://i.pravatar.cc/150?u=' || id"
echo "   FROM auth.users"
echo "   ON CONFLICT (user_id) DO NOTHING;"
echo ""
echo "===================================="
echo ""
echo "✨ Ready to run! Follow the instructions above."
echo ""

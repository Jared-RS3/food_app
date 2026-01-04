#!/bin/bash

# =====================================================
# COMPLETE APP RESTART SCRIPT
# This clears all caches and restarts fresh
# =====================================================

echo "🧹 Clearing all caches..."
echo ""

# Kill any running Metro bundlers
echo "1️⃣ Stopping any running Metro bundlers..."
pkill -f "react-native" || true
pkill -f "expo" || true
pkill -f "metro" || true
sleep 2
echo "✅ Stopped\n"

# Clear Metro bundler cache
echo "2️⃣ Clearing Metro bundler cache..."
rm -rf node_modules/.cache
rm -rf .expo
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*
echo "✅ Cleared\n"

# Clear watchman cache
echo "3️⃣ Clearing Watchman cache..."
if command -v watchman &> /dev/null; then
    watchman watch-del-all
    echo "✅ Cleared"
else
    echo "⚠️  Watchman not installed (skip)"
fi
echo ""

# Clear npm cache
echo "4️⃣ Clearing npm cache..."
npm cache clean --force
echo "✅ Cleared\n"

echo "🎉 ALL CACHES CLEARED!"
echo ""
echo "📱 Starting fresh Expo server..."
echo "================================"
echo ""

# Start Expo with clear cache
npx expo start --clear

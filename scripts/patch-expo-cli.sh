#!/bin/bash
# Fix Expo CLI toString bug in plist.js

PLIST_FILE="node_modules/@expo/cli/build/src/utils/plist.js"

if [ -f "$PLIST_FILE" ]; then
    echo "🔧 Patching Expo CLI plist.js to fix toString error..."
    
    # Backup original
    cp "$PLIST_FILE" "$PLIST_FILE.backup"
    
    # Apply fix
    sed -i '' 's/throw new _errors\.CommandError('\''PLIST'\'', `Cannot parse plist of type byte (0x\${contents\[0\]\.toString(16)})`);/const byteValue = contents[0] !== undefined ? contents[0].toString(16) : '\''undefined'\''; throw new _errors.CommandError('\''PLIST'\'', `Cannot parse plist of type byte (0x\${byteValue})`);/g' "$PLIST_FILE"
    
    # Add safety check at the start of parsePlistBuffer
    sed -i '' '/function parsePlistBuffer(contents) {/a\
    if (!contents || contents.length === 0) { _log.warn('\''Cannot parse empty plist buffer, skipping'\''); return {}; }
' "$PLIST_FILE"
    
    echo "✅ Expo CLI plist.js patched successfully!"
else
    echo "⚠️  Expo CLI plist.js not found, skipping patch"
fi

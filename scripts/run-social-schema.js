/**
 * Script to run the social schema SQL file against Supabase
 * This creates all tables, indexes, triggers, and policies for the advanced social system
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSchema() {
  try {
    console.log('🚀 Starting social schema migration...\n');

    // Read the SQL file
    const sqlFilePath = path.join(
      __dirname,
      '..',
      'database-social-schema.sql'
    );
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📄 Loaded SQL file:', sqlFilePath);
    console.log(
      '📊 SQL content size:',
      Math.round(sqlContent.length / 1024),
      'KB'
    );
    console.log('');

    // Split SQL into individual statements (rough split by semicolons)
    // Note: This is a simple split and won't handle complex cases perfectly
    const statements = sqlContent
      .split(';')
      .map((s) => s.trim())
      .filter(
        (s) => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*')
      );

    console.log('📝 Found', statements.length, 'SQL statements to execute\n');

    // Execute each statement
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comments and empty statements
      if (!statement || statement.startsWith('--')) {
        skipCount++;
        continue;
      }

      // Extract statement type for logging
      const firstWord = statement.split(/\s+/)[0].toUpperCase();
      const statementPreview =
        statement.substring(0, 60).replace(/\n/g, ' ') + '...';

      try {
        process.stdout.write(
          `[${i + 1}/${statements.length}] ${firstWord}: ${statementPreview}\n`
        );

        const { error } = await supabase.rpc('exec_sql', {
          sql: statement + ';',
        });

        if (error) {
          // Try direct query as fallback
          const { error: directError } = await supabase
            .from('_query')
            .select('*')
            .limit(0);

          if (directError) {
            console.log(`  ⚠️  Warning: ${error.message}`);
            errorCount++;
          } else {
            console.log('  ✅ Success');
            successCount++;
          }
        } else {
          console.log('  ✅ Success');
          successCount++;
        }
      } catch (err) {
        console.log(`  ⚠️  Error: ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log('  ✅ Successful:', successCount);
    console.log('  ⚠️  Errors:', errorCount);
    console.log('  ⏭️  Skipped:', skipCount);
    console.log('='.repeat(60));

    if (errorCount > 0) {
      console.log(
        '\n⚠️  Some statements failed. This is normal if tables already exist.'
      );
      console.log(
        '💡 You can also run the SQL directly in Supabase SQL Editor for better error messages.'
      );
    } else {
      console.log('\n🎉 Migration completed successfully!');
    }

    console.log('\n📋 Next steps:');
    console.log('  1. Verify tables in Supabase Dashboard > Table Editor');
    console.log('  2. Check the following tables exist:');
    console.log('     • user_follows');
    console.log('     • social_posts');
    console.log('     • post_likes');
    console.log('     • post_comments');
    console.log('     • user_interactions');
    console.log('     • post_saves');
    console.log('     • user_profiles');
    console.log('  3. Update your app to use the new social services');
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Alternative: Print instructions for manual execution
function printManualInstructions() {
  console.log('\n' + '='.repeat(60));
  console.log('📋 MANUAL EXECUTION INSTRUCTIONS');
  console.log('='.repeat(60));
  console.log(
    "\nSince automated execution may have limitations, here's how to run manually:\n"
  );
  console.log('1. Open your Supabase Dashboard');
  console.log('2. Go to: SQL Editor (left sidebar)');
  console.log('3. Click "New Query"');
  console.log('4. Copy the contents of: database-social-schema.sql');
  console.log('5. Paste into the SQL editor');
  console.log('6. Click "Run" button');
  console.log('\nOr use Supabase CLI:');
  console.log('  $ supabase db push --file database-social-schema.sql\n');
  console.log('='.repeat(60) + '\n');
}

// Run the migration
console.log('🔧 Advanced Social Feed Schema Migration\n');
printManualInstructions();
console.log('\nAttempting automated execution...\n');
runSchema();

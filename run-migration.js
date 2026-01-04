import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/"/g, '').trim() || '';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.replace(/"/g, '').trim() || '';

console.log('🔧 Supabase Migration Runner\n');
console.log('📍 Supabase URL:', supabaseUrl);
console.log('🔑 Anon Key:', supabaseAnonKey.substring(0, 20) + '...\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error(
    'Make sure .env file has EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY'
  );
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Read SQL file
const sqlFile = join(__dirname, 'add-onboarding-fields.sql');
console.log('📄 Reading migration file:', sqlFile);

try {
  const sql = readFileSync(sqlFile, 'utf8');
  console.log('✅ Migration file loaded\n');

  console.log('🚀 Running migration...\n');

  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const preview = statement.substring(0, 60).replace(/\n/g, ' ');

    console.log(`[${i + 1}/${statements.length}] Executing: ${preview}...`);

    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: statement + ';',
      });

      if (error) {
        // Try alternative method using raw query
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({ sql: statement + ';' }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        console.log('   ✅ Success (via REST API)');
        successCount++;
      } else {
        console.log('   ✅ Success');
        successCount++;
      }
    } catch (err) {
      console.log('   ⚠️  Error:', err.message);
      errorCount++;

      // Don't stop on errors for IF NOT EXISTS statements
      if (
        statement.includes('IF NOT EXISTS') ||
        statement.includes('IF EXISTS')
      ) {
        console.log('   ℹ️  Continuing (conditional statement)...');
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ⚠️  Errors: ${errorCount}`);
  console.log('='.repeat(50) + '\n');

  if (errorCount === 0) {
    console.log('🎉 Migration completed successfully!');
  } else if (successCount > 0) {
    console.log(
      '⚠️  Migration completed with some errors (this may be okay if tables/policies already exist)'
    );
  } else {
    console.log('❌ Migration failed!');
    process.exit(1);
  }
} catch (error) {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
}

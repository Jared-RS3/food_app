// Run this script to add the budget_preference column to your database
// Usage: node run-budget-migration.js

const { createClient } = require('@supabase/supabase-js');

// Replace these with your Supabase credentials
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

async function runMigration() {
  console.log('🚀 Starting budget_preference migration...');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // Execute the SQL to add the column
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE user_profiles 
        ADD COLUMN IF NOT EXISTS budget_preference TEXT;
      `,
    });

    if (error) {
      console.error('❌ Migration failed:', error);
      console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:');
      console.log(
        '\nALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS budget_preference TEXT;\n'
      );
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!');
    console.log(
      '✨ The budget_preference column has been added to user_profiles table'
    );
  } catch (err) {
    console.error('❌ Error running migration:', err);
    console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:');
    console.log('\n--- Copy and paste this SQL ---\n');
    console.log(
      'ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS budget_preference TEXT;\n'
    );
    console.log('--- End of SQL ---\n');
    process.exit(1);
  }
}

runMigration();

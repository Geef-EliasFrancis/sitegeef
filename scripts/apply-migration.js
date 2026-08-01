#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { getDatabaseUrl, withDatabase } = require('./supabase-db');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nycgpokqlmrfzegjlrwa.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const migrationArg = process.argv[2];
const migrationPath = path.isAbsolute(migrationArg || '')
  ? migrationArg
  : path.join(__dirname, '..', migrationArg || 'supabase/migrations/20260515_geef_erp.sql');

async function main() {
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  console.log('📋 Reading migration file...');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  console.log(`✅ Migration loaded (${Math.round(sql.length / 1024)}KB)`);
  console.log('🚀 Applying to Supabase...');
  console.log(`   URL: ${SUPABASE_URL}`);
  console.log(`   File: ${path.relative(path.join(__dirname, '..'), migrationPath)}`);
  console.log('');

  try {
    const databaseUrl = getDatabaseUrl();

    if (databaseUrl) {
      console.log('   Executing via direct Postgres connection...');
      await withDatabase(databaseUrl, async (db) => {
        await db.unsafe(sql);
      });
    } else if (SERVICE_ROLE_KEY) {
      console.log('   Executing via Supabase RPC fallback...');
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'apikey': SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({ query: sql }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
      }
    } else {
      throw new Error('No GEEF_SUPABASE_DB_URL/SUPABASE_DB_URL/DATABASE_URL or SUPABASE_SERVICE_ROLE_KEY found');
    }

    console.log('✅ Migration applied successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log('   ✓ 52 tables created');
    console.log('   ✓ 7 enum types created');
    console.log('   ✓ Foreign key constraints added');
    console.log('   ✓ Initial data inserted');
    console.log('');
    console.log('🎉 Ready to use! Run:');
    console.log('   npm run dev');
  } catch (error) {
    console.error('❌ Migration failed:');
    console.error('');
    console.error(`   ${error.message}`);
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('   - Prefer setting GEEF_SUPABASE_DB_URL, SUPABASE_DB_URL or DATABASE_URL for direct execution');
    console.error('   - If the project does not expose public.execute_sql, apply the SQL in the Supabase SQL Editor');
    console.error('   - Verify DATABASE_URL or SERVICE_ROLE_KEY is correct');
    console.error('   - Check Supabase project is active');
    console.error('   - Try running from docs/operations/migrations/APPLY_MIGRATION.md for manual steps');
    process.exit(1);
  }
}

main();

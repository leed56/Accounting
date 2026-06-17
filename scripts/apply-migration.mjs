/**
 * Apply BizManager schema to Supabase (local script — requires DATABASE_URL in supabase/.env.local)
 * Usage: node scripts/apply-migration.mjs
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const envPath = join(__dirname, '../supabase/.env.local');
    const content = readFileSync(envPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    }
  } catch {
    /* ignore */
  }
}

loadEnv();
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Set DATABASE_URL (e.g. in supabase/.env.local)');
  process.exit(1);
}

const sql = readFileSync(
  join(__dirname, '../supabase/migrations/20260617000001_initial_schema.sql'),
  'utf8'
);

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  console.log('Migration applied successfully.');
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}

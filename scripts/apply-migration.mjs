/**
 * Apply pending BizManager migrations to Supabase.
 * Requires DATABASE_URL in supabase/.env.local
 * Usage: node scripts/apply-migration.mjs
 */
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, '../supabase/migrations');

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

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS _bizmanager_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const { rows: applied } = await client.query(
    'SELECT name FROM _bizmanager_migrations'
  );
  const appliedSet = new Set(applied.map((r) => r.name));

  // Bootstrap: schema applied before tracking table existed
  const initial = '20260617000001_initial_schema.sql';
  if (!appliedSet.has(initial)) {
    const { rows: tables } = await client.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'companies' LIMIT 1`
    );
    if (tables.length > 0) {
      await client.query(
        'INSERT INTO _bizmanager_migrations (name) VALUES ($1) ON CONFLICT DO NOTHING',
        [initial]
      );
      appliedSet.add(initial);
      console.log(`Marked as applied (existing schema): ${initial}`);
    }
  }

  let count = 0;
  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`Skip (already applied): ${file}`);
      continue;
    }

    const sql = readFileSync(join(migrationsDir, file), 'utf8');
    console.log(`Applying: ${file}`);
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query(
        'INSERT INTO _bizmanager_migrations (name) VALUES ($1)',
        [file]
      );
      await client.query('COMMIT');
      console.log(`Applied: ${file}`);
      count++;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }
  }

  if (count === 0) {
    console.log('No pending migrations.');
  } else {
    console.log(`Migration complete (${count} applied).`);
  }
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}

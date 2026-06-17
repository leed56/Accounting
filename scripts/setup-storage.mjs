import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = join(__dirname, '../supabase/.env.local');
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

loadEnv();

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

const { data: buckets } = await supabase.storage.listBuckets();
const exists = buckets?.some((b) => b.name === 'attachments');

if (!exists) {
  const { error } = await supabase.storage.createBucket('attachments', {
    public: true,
    fileSizeLimit: 10485760,
  });
  if (error) {
    console.error('Bucket create error:', error.message);
    process.exit(1);
  }
  console.log('Created attachments bucket');
} else {
  console.log('attachments bucket already exists');
}

console.log('Storage setup complete');

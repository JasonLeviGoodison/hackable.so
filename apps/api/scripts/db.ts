import { Client } from 'pg';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DATABASE_URL = process.env.DATABASE_URL!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const MIGRATIONS_DIR = path.join(__dirname, '..', '..', '..', 'supabase', 'migrations');
const SEED_FILE = path.join(__dirname, '..', '..', '..', 'supabase', 'seed.sql');

// ── Auth users to create ──────────────────────────────────────────
const USERS = [
  { email: 'admin@hackable.test', password: 'password123', full_name: 'Sarah Chen', profileId: 1 },
  { email: 'marcus.johnson@hackable.test', password: 'marcus2024', full_name: 'Marcus Johnson', profileId: 2 },
  { email: 'priya.patel@hackable.test', password: 'priya2024', full_name: 'Priya Patel', profileId: 3 },
  { email: 'james.oconnor@hackable.test', password: 'james2024', full_name: "James O'Connor", profileId: 4 },
  { email: 'aisha.williams@hackable.test', password: 'aisha2024', full_name: 'Aisha Williams', profileId: 5 },
  { email: 'david.kim@hackable.test', password: 'david2024', full_name: 'David Kim', profileId: 6 },
  { email: 'rachel.torres@hackable.test', password: 'rachel2024', full_name: 'Rachel Torres', profileId: 7 },
  { email: 'alex.nakamura@hackable.test', password: 'alex2024', full_name: 'Alex Nakamura', profileId: 8 },
];

// ── Step 1: Run migrations ───────────────────────────────────────
async function migrate() {
  console.log('Step 1: Running migrations...\n');

  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    console.log(`  Running ${file}...`);
    await client.query(sql);
    console.log(`  Done.`);
  }

  await client.end();
  console.log(`\n  ${files.length} migration(s) applied.\n`);
}

// ── Step 2: Run seed ─────────────────────────────────────────────
async function seed() {
  console.log('Step 2: Seeding data...\n');

  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  const sql = fs.readFileSync(SEED_FILE, 'utf-8');
  await client.query(sql);

  await client.end();
  console.log('  Seed data inserted.\n');
}

// ── Step 3: Create auth users and link to profiles ───────────────
async function createAuthUsers() {
  console.log('Step 3: Creating auth users...\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  for (const user of USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.full_name },
    });

    if (error) {
      // If user already exists, try to find their ID and link anyway
      if (error.message.includes('already been registered')) {
        console.log(`  ${user.email} already exists, skipping.`);
        continue;
      }
      console.error(`  ERROR creating ${user.email}: ${error.message}`);
      continue;
    }

    const uid = data.user.id;
    console.log(`  Created ${user.email} (${uid})`);

    // Link auth user to profile row
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ user_id: uid })
      .eq('id', user.profileId);

    if (updateError) {
      console.error(`    ERROR linking to profile #${user.profileId}: ${updateError.message}`);
    } else {
      console.log(`    Linked to profile #${user.profileId}`);
    }
  }
  console.log('');
}

// ── Main ─────────────────────────────────────────────────────────
const command = process.argv[2] || 'setup';

async function main() {
  switch (command) {
    case 'migrate':
      await migrate();
      break;
    case 'seed':
      await seed();
      break;
    case 'users':
      await createAuthUsers();
      break;
    case 'setup':
      await migrate();
      await seed();
      await createAuthUsers();
      console.log('========================================');
      console.log('Setup complete!');
      console.log('========================================');
      console.log('\nLogin credentials:');
      for (const u of USERS) {
        console.log(`  ${u.full_name}: ${u.email} / ${u.password}`);
      }
      break;
    default:
      console.log('Usage: ts-node scripts/db.ts [migrate|seed|users|setup]');
      console.log('  migrate  - Run SQL migrations only');
      console.log('  seed     - Insert seed data only');
      console.log('  users    - Create auth users only');
      console.log('  setup    - All of the above (default)');
  }
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});

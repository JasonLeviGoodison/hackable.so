import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function resolveMigrationsDir(): string {
  const candidatePaths = [
    path.join(process.cwd(), 'migrations'),
    path.join(process.cwd(), '..', '..', 'supabase', 'migrations'),
    path.join(__dirname, '..', 'migrations'),
  ];

  for (const candidatePath of candidatePaths) {
    if (fs.existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  throw new Error(`Could not find a migrations directory. Looked in: ${candidatePaths.join(', ')}`);
}

async function runMigrations() {
  const migrationsDir = resolveMigrationsDir();
  const files = fs.readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    throw new Error(`No SQL migrations found in ${migrationsDir}`);
  }

  const client = new Client({ connectionString: getRequiredEnv('DATABASE_URL') });
  await client.connect();

  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`Applying migration ${file}...`);
      await client.query(sql);
    }
  } finally {
    await client.end();
  }
}

runMigrations().catch((err) => {
  console.error('Migration startup step failed:', err);
  process.exit(1);
});

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Admin and employee credentials (VULN 5: hardcoded in source)
const USERS = [
  { email: 'admin@hackable.test', password: 'password123', full_name: 'Sarah Chen', profileId: 1 },
  { email: 'marcus.johnson@hackable.test', password: 'marcus2024', full_name: 'Marcus Johnson', profileId: 2 },
  { email: 'priya.patel@hackable.test', password: 'priya2024', full_name: 'Priya Patel', profileId: 3 },
  { email: 'james.oconnor@hackable.test', password: 'james2024', full_name: 'James O\'Connor', profileId: 4 },
  { email: 'aisha.williams@hackable.test', password: 'aisha2024', full_name: 'Aisha Williams', profileId: 5 },
  { email: 'david.kim@hackable.test', password: 'david2024', full_name: 'David Kim', profileId: 6 },
  { email: 'rachel.torres@hackable.test', password: 'rachel2024', full_name: 'Rachel Torres', profileId: 7 },
  { email: 'alex.nakamura@hackable.test', password: 'alex2024', full_name: 'Alex Nakamura', profileId: 8 },
];

async function setup() {
  console.log('Setting up auth users and linking to profiles...\n');

  for (const user of USERS) {
    console.log(`Creating auth user: ${user.email}`);

    // Create the auth user
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.full_name },
    });

    if (error) {
      console.error(`  ERROR: ${error.message}`);
      continue;
    }

    const authUid = data.user.id;
    console.log(`  Auth UID: ${authUid}`);

    // Link the auth user to the existing profile row
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ user_id: authUid })
      .eq('id', user.profileId);

    if (updateError) {
      console.error(`  ERROR linking profile: ${updateError.message}`);
    } else {
      console.log(`  Linked to profile #${user.profileId}`);
    }
  }

  console.log('\n========================================');
  console.log('Setup complete!');
  console.log('========================================');
  console.log('\nLogin credentials:');
  for (const u of USERS) {
    console.log(`  ${u.full_name}: ${u.email} / ${u.password}`);
  }
}

setup().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

const SUPABASE_URL = getRequiredEnv('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ============================================
// VULN 5: Hardcoded credentials in source code
// ============================================

// Admin credentials - FLAG{admin_credentials_compromised}
const ADMIN_EMAIL = 'admin@hackable.test';
const ADMIN_PASSWORD = 'password123';

// Employee credentials (all use weak passwords)
const EMPLOYEES = [
  {
    email: 'sarah.chen@hackable.test',
    password: 'sarah2024',
    full_name: 'Sarah Chen',
    role: 'manager',
    department: 'Engineering',
    phone: '+1-555-0101',
    ssn_last_four: '4532',
    salary: 145000,
    notes: 'Team lead for Platform team. Has access to production infrastructure.',
    emergency_contact: 'Michael Chen - +1-555-0102',
    address: '142 Oak Street, San Francisco, CA 94102',
    date_of_birth: '1988-03-15',
    hire_date: '2021-06-01'
  },
  {
    email: 'james.wilson@hackable.test',
    password: 'james2024',
    full_name: 'James Wilson',
    role: 'employee',
    department: 'Marketing',
    phone: '+1-555-0201',
    ssn_last_four: '7891',
    salary: 95000,
    notes: 'Handles all social media campaigns. Recently promoted.',
    emergency_contact: 'Linda Wilson - +1-555-0202',
    address: '88 Pine Avenue, San Francisco, CA 94103',
    date_of_birth: '1992-07-22',
    hire_date: '2022-01-15'
  },
  {
    email: 'maria.garcia@hackable.test',
    password: 'maria2024',
    full_name: 'Maria Garcia',
    role: 'employee',
    department: 'Human Resources',
    phone: '+1-555-0301',
    ssn_last_four: '2156',
    salary: 105000,
    notes: 'HR lead. Has access to all employee records and compensation data.',
    emergency_contact: 'Carlos Garcia - +1-555-0302',
    address: '2301 Mission St, San Francisco, CA 94110',
    date_of_birth: '1990-11-08',
    hire_date: '2020-09-01'
  },
  {
    email: 'alex.kumar@hackable.test',
    password: 'alex2024',
    full_name: 'Alex Kumar',
    role: 'employee',
    department: 'Engineering',
    phone: '+1-555-0401',
    ssn_last_four: '8834',
    salary: 130000,
    notes: 'Senior backend engineer. Manages database migrations and API development.',
    emergency_contact: 'Priya Kumar - +1-555-0402',
    address: '567 Market Street, San Francisco, CA 94105',
    date_of_birth: '1985-05-30',
    hire_date: '2019-03-15'
  },
  {
    email: 'emily.johnson@hackable.test',
    password: 'emily2024',
    full_name: 'Emily Johnson',
    role: 'intern',
    department: 'Engineering',
    phone: '+1-555-0501',
    ssn_last_four: '1267',
    salary: 65000,
    notes: 'Summer intern. Working on frontend dashboard project.',
    emergency_contact: 'Robert Johnson - +1-555-0502',
    address: '1200 Valencia St, San Francisco, CA 94110',
    date_of_birth: '2000-01-12',
    hire_date: '2024-06-01'
  }
];

const SAMPLE_POSTS = [
  {
    title: 'Welcome to TeamPulse!',
    content: '<h2>Welcome to our new internal communication platform!</h2><p>We are excited to launch TeamPulse as our new company-wide communication tool. Please take some time to set up your profile and explore the features.</p><p>Best regards,<br/>The IT Team</p>',
    category: 'announcement'
  },
  {
    title: 'Q4 Planning Meeting - All Hands',
    content: '<p>Reminder: Our Q4 planning meeting is scheduled for <strong>Friday at 2:00 PM PST</strong>. All department leads are expected to present their quarterly goals.</p><ul><li>Engineering: Platform roadmap</li><li>Marketing: Campaign results</li><li>HR: Hiring plan</li></ul>',
    category: 'meeting'
  },
  {
    title: 'New Security Policy Update',
    content: '<p>Please review the updated security policy document. Key changes include:</p><ol><li>Mandatory 2FA for all accounts</li><li>Password rotation every 90 days</li><li>VPN required for remote access</li></ol><p>Contact the security team if you have questions.</p>',
    category: 'policy'
  },
  {
    title: 'Holiday Party Planning',
    content: '<p>The annual holiday party is coming up! We need volunteers for the planning committee. Reply to this post if you are interested.</p><p>Date: December 20th<br/>Location: TBD<br/>Budget: $5,000</p>',
    category: 'social'
  },
  {
    title: 'Engineering Sprint Retrospective',
    content: '<p>Sprint 47 retrospective notes:</p><p><strong>What went well:</strong> Shipped the new dashboard, reduced API latency by 40%</p><p><strong>What could improve:</strong> Better test coverage needed, deployment process still manual</p><p><strong>Action items:</strong> Set up CI/CD pipeline, add integration tests</p>',
    category: 'engineering'
  }
];

async function seed() {
  console.log('Starting database seed...\n');

  // ---- Create Admin User ----
  console.log('Creating admin user...');
  console.log(`  Email: ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);

  const { data: adminAuth, error: adminAuthError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: 'System Administrator' }
  });

  if (adminAuthError) {
    console.error('  Error creating admin auth:', adminAuthError.message);
  } else {
    console.log('  Admin auth created:', adminAuth.user.id);

    const { error: adminProfileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: adminAuth.user.id,
        email: ADMIN_EMAIL,
        full_name: 'System Administrator',
        role: 'admin',
        department: 'IT',
        phone: '+1-555-0001',
        ssn_last_four: '0001',
        salary: 200000,
        notes: 'System administrator. Full access to all systems. FLAG{admin_credentials_compromised}',
        emergency_contact: 'Security Team - +1-555-0000',
        address: '100 Nexus Drive, San Francisco, CA 94101',
        date_of_birth: '1980-01-01',
        hire_date: '2018-01-01',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (adminProfileError) {
      console.error('  Error creating admin profile:', adminProfileError.message);
    } else {
      console.log('  Admin profile created successfully');
    }
  }

  // ---- Create Employee Users ----
  console.log('\nCreating employee users...');
  const userIds: string[] = [];

  for (const emp of EMPLOYEES) {
    console.log(`  Creating: ${emp.full_name} (${emp.email})`);
    console.log(`    Password: ${emp.password}`);

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: emp.email,
      password: emp.password,
      email_confirm: true,
      user_metadata: { full_name: emp.full_name }
    });

    if (authError) {
      console.error(`    Error creating auth: ${authError.message}`);
      continue;
    }

    console.log(`    Auth created: ${authData.user.id}`);
    userIds.push(authData.user.id);

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: authData.user.id,
        email: emp.email,
        full_name: emp.full_name,
        role: emp.role,
        department: emp.department,
        phone: emp.phone,
        ssn_last_four: emp.ssn_last_four,
        salary: emp.salary,
        notes: emp.notes,
        emergency_contact: emp.emergency_contact,
        address: emp.address,
        date_of_birth: emp.date_of_birth,
        hire_date: emp.hire_date,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error(`    Error creating profile: ${profileError.message}`);
    } else {
      console.log(`    Profile created successfully`);
    }
  }

  // ---- Create Sample Posts ----
  console.log('\nCreating sample posts...');
  const authorId = adminAuth?.user?.id || userIds[0];

  for (const post of SAMPLE_POSTS) {
    const { error: postError } = await supabase
      .from('posts')
      .insert({
        title: post.title,
        content: post.content,
        author_id: authorId,
        category: post.category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (postError) {
      console.error(`  Error creating post "${post.title}": ${postError.message}`);
    } else {
      console.log(`  Created post: ${post.title}`);
    }
  }

  // ---- Create Sample Messages ----
  console.log('\nCreating sample messages...');

  const sampleMessages = [
    { content: 'Hey team, the new deployment is live!' },
    { content: 'Can someone review my PR #142?' },
    { content: 'Lunch plans anyone?' },
    { content: 'The Q4 budget spreadsheet has been shared with all managers.' },
    { content: 'Reminder: mandatory security training due by Friday.' }
  ];

  for (let i = 0; i < sampleMessages.length; i++) {
    const msg = sampleMessages[i];

    const { error: msgError } = await supabase
      .from('messages')
      .insert({
        content: msg.content,
        sender_id: i + 1,
        recipient_id: ((i + 1) % 8) + 1,
        created_at: new Date().toISOString()
      });

    if (msgError) {
      console.error(`  Error creating message: ${msgError.message}`);
    } else {
      console.log(`  Created message: "${msg.content.substring(0, 40)}..."`);
    }
  }

  // ---- Create Secrets/Flags Table Entries ----
  console.log('\nCreating secrets entries...');

  const secrets = [
    { key: 'admin_credentials', value: 'admin@hackable.test:password123', description: 'FLAG{admin_credentials_compromised}' },
    { key: 'jwt_secret', value: 'secret123', description: 'FLAG{jwt_weak_secret_forged_token}' },
    { key: 'internal_api_token', value: 'hackable-internal-demo-token', description: 'FLAG{env_file_exposed_with_secrets}' },
    { key: 'cors_config', value: 'Access-Control-Allow-Origin: *', description: 'FLAG{cors_wildcard_with_credentials}' },
    { key: 'debug_mode', value: 'enabled', description: 'FLAG{verbose_errors_leak_internals}' }
  ];

  for (const secret of secrets) {
    const { error: secretError } = await supabase
      .from('secrets')
      .upsert({
        key: secret.key,
        value: secret.value,
        description: secret.description,
        created_at: new Date().toISOString()
      });

    if (secretError) {
      console.error(`  Error creating secret "${secret.key}": ${secretError.message}`);
    } else {
      console.log(`  Created secret: ${secret.key}`);
    }
  }

  console.log('\n========================================');
  console.log('Seed completed!');
  console.log('========================================');
  console.log('\nTest credentials:');
  console.log(`  Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  EMPLOYEES.forEach(emp => {
    console.log(`  ${emp.full_name}: ${emp.email} / ${emp.password}`);
  });
  console.log('\nFlags seeded:');
  secrets.forEach(s => console.log(`  ${s.description}`));
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});

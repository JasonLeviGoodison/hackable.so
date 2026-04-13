import { createClient } from '@supabase/supabase-js';

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

const SUPABASE_URL = getRequiredEnv('SUPABASE_URL');
const SUPABASE_ANON_KEY = getRequiredEnv('SUPABASE_ANON_KEY');
const SUPABASE_SERVICE_ROLE_KEY = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');

// Public client - uses anon key
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin client - uses service role key (bypasses RLS)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

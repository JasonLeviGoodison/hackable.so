import { createClient } from '@supabase/supabase-js';

// VULN 1: Anon key exposed in client-side code via NEXT_PUBLIC_ prefix
// Combined with missing RLS policies, this allows direct database access
function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

const supabaseUrl = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

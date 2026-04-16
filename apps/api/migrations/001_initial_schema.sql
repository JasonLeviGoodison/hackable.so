-- TeamPulse Database Schema
-- Internal communication platform for Hackable Labs
-- NOTE: RLS is deliberately NOT enabled on any table (VULN 1)

-- Profiles table (sequential integer IDs for IDOR - VULN 3)
CREATE TABLE IF NOT EXISTS public.profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'employee' CHECK (role IN ('employee', 'admin', 'manager', 'intern')),
  department TEXT,
  phone TEXT,
  ssn_last_four TEXT,
  salary TEXT,
  notes TEXT,
  emergency_contact TEXT,
  address TEXT,
  date_of_birth TEXT,
  hire_date TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Posts table (content accepts unsanitized HTML for XSS - VULN 6)
CREATE TABLE IF NOT EXISTS public.posts (
  id SERIAL PRIMARY KEY,
  author_id INTEGER REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  content TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES public.profiles(id),
  recipient_id INTEGER REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Secrets table (CTF flags and fake credentials)
CREATE TABLE IF NOT EXISTS public.secrets (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Uploaded files tracking
CREATE TABLE IF NOT EXISTS public.uploaded_files (
  id SERIAL PRIMARY KEY,
  uploader_id INTEGER REFERENCES public.profiles(id),
  filename TEXT NOT NULL,
  filepath TEXT NOT NULL,
  mimetype TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vulnerable SQL function for search (string concatenation - VULN 4)
CREATE OR REPLACE FUNCTION public.search_posts(search_term TEXT)
RETURNS SETOF public.posts
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE
    'SELECT * FROM public.posts WHERE title ILIKE ''%' || search_term || '%'' OR content ILIKE ''%' || search_term || '%''';
END;
$$;

-- Grant access to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_posts(TEXT) TO anon, authenticated;

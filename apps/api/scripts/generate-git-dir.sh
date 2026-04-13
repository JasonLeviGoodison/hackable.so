#!/bin/bash
# generate-git-dir.sh
# Creates a fake .git directory with exposed secrets for the CTF challenge
# VULN 7: Exposed .git directory allows source code leak

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$(dirname "$SCRIPT_DIR")"
PUBLIC_DIR="$API_DIR/public"
TEMP_DIR=$(mktemp -d)

echo "Creating fake git repository in $TEMP_DIR..."

cd "$TEMP_DIR"
git init

# Configure git user for commits
git config user.email "devops@hackable.test"
git config user.name "Hackable DevOps"

# Create fake source files with secrets embedded

# 1. config.json with secrets
cat > config.json << 'CONFIGEOF'
{
  "app": "TeamPulse",
  "version": "1.2.0",
  "environment": "production",
  "database": {
    "host": "db.your-project.supabase.co",
    "port": 5432,
    "name": "postgres",
    "user": "postgres",
    "password": "postgres"
  },
  "auth": {
    "jwt_secret": "secret123",
    "session_secret": "nexus-session-key-2024",
    "admin_email": "admin@hackable.test",
    "admin_password": "password123"
  },
  "api_keys": {
    "internal": "hackable-internal-demo-token",
    "supabase_service_role": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-service-role-key"
  },
  "flag": "FLAG{git_directory_exposed_source_leaked}"
}
CONFIGEOF

# 2. deploy.sh with embedded credentials
cat > deploy.sh << 'DEPLOYEOF'
#!/bin/bash
# TeamPulse Deployment Script
# Last updated: 2024-10-15

export DATABASE_URL="postgresql://postgres:postgres@db.your-project.supabase.co:5432/postgres"
export JWT_SECRET="secret123"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-service-role-key"
export INTERNAL_API_TOKEN="hackable-internal-demo-token"

# FLAG{git_directory_exposed_source_leaked}

echo "Deploying TeamPulse API..."
npm run build
npm start
DEPLOYEOF

# 3. .env.production with all secrets
cat > .env.production << 'ENVEOF'
# Production Environment - DO NOT COMMIT
# FLAG{git_directory_exposed_source_leaked}

PORT=4000
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-service-role-key
DATABASE_URL=postgresql://postgres:postgres@db.your-project.supabase.co:5432/postgres
JWT_SECRET=secret123
INTERNAL_API_TOKEN=hackable-internal-demo-token
ADMIN_EMAIL=admin@hackable.test
ADMIN_PASSWORD=password123
ENVEOF

# 4. README.md
cat > README.md << 'READMEEOF'
# TeamPulse API

Internal communication platform for Hackable Labs.

## Setup
1. Copy `.env.production` to `.env`
2. Run `npm install`
3. Run `npm run seed`
4. Run `npm start`

## Default Admin
- Email: admin@hackable.test
- Password: password123

## API Docs
See `/api/admin/config` for system configuration.
READMEEOF

# 5. src/auth.ts with hardcoded secrets
mkdir -p src
cat > src/auth.ts << 'AUTHEOF'
// TeamPulse Authentication Module
// FLAG{git_directory_exposed_source_leaked}

const JWT_SECRET = 'secret123';
const ADMIN_CREDENTIALS = {
  email: 'admin@hackable.test',
  password: 'password123'
};

export function validateAdmin(email: string, password: string): boolean {
  return email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password;
}

export function getJwtSecret(): string {
  return JWT_SECRET;
}
AUTHEOF

# 6. database/migrations/001_initial.sql
mkdir -p database/migrations
cat > database/migrations/001_initial.sql << 'SQLEOF'
-- TeamPulse Initial Migration
-- Contains schema for all tables

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'employee',
  department TEXT,
  phone TEXT,
  ssn_last_four TEXT,
  salary INTEGER,
  notes TEXT,
  emergency_contact TEXT,
  address TEXT,
  date_of_birth DATE,
  hire_date DATE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  author_id UUID REFERENCES profiles(id),
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  sender_id UUID REFERENCES profiles(id),
  recipient_id UUID REFERENCES profiles(id),
  channel TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS secrets (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  flag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vulnerable search function (SQL Injection)
-- FLAG{sql_injection_in_search_query}
CREATE OR REPLACE FUNCTION search_posts(search_term TEXT)
RETURNS SETOF posts AS $$
BEGIN
  RETURN QUERY EXECUTE 'SELECT * FROM posts WHERE title ILIKE ''%' || search_term || '%'' OR content ILIKE ''%' || search_term || '%''';
END;
$$ LANGUAGE plpgsql;
SQLEOF

# Stage and commit all files
git add -A
git commit -m "Initial commit - TeamPulse API v1.2.0

Added:
- API source code and configuration
- Database migrations
- Deployment scripts
- Environment configuration"

# Add a second commit with "removed" secrets (but still in history)
rm .env.production
cat > .gitignore << 'IGNEOF'
.env
.env.production
node_modules/
dist/
IGNEOF

git add -A
git commit -m "Remove production env file and add gitignore

Cleaned up sensitive files that should not be in version control."

echo ""
echo "Copying .git directory to $PUBLIC_DIR/.git/"

# Ensure public directory exists
mkdir -p "$PUBLIC_DIR"

# Copy the .git directory
cp -r "$TEMP_DIR/.git" "$PUBLIC_DIR/.git"

# Clean up temp directory
rm -rf "$TEMP_DIR"

echo ""
echo "Done! The .git directory is now available at $PUBLIC_DIR/.git/"
echo ""
echo "Attackers can now access:"
echo "  GET /.git/HEAD"
echo "  GET /.git/config"
echo "  GET /.git/refs/heads/master"
echo "  GET /.git/objects/..."
echo ""
echo "And reconstruct the full source code including secrets from git history."

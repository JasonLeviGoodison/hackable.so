const REQUIRED_ENV_VARS = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
  'JWT_SECRET',
] as const;

const PLACEHOLDER_MARKERS = [
  'your-project.supabase.co',
  'db.your-project.supabase.co',
  'sb_publishable_replace_me',
  'sb_secret_replace_me',
  'replace-with-a-throwaway-demo-secret',
];

const SUPPORTED_DEPLOYMENT_MODES = new Set([
  'single-tenant',
  'ephemeral-lab',
  'classroom-isolated',
]);

function isPlaceholder(value: string | undefined): boolean {
  if (!value) {
    return true;
  }

  return PLACEHOLDER_MARKERS.some((marker) => value.includes(marker));
}

export function assertReleaseSafeRuntime() {
  if (process.env.ACKNOWLEDGE_INTENTIONALLY_VULNERABLE_APP !== 'yes') {
    throw new Error(
      'Refusing to start. Set ACKNOWLEDGE_INTENTIONALLY_VULNERABLE_APP=yes after reading the README safety notes.'
    );
  }

  const deploymentMode = process.env.HACKABLE_DEPLOYMENT_MODE || 'single-tenant';

  if (!SUPPORTED_DEPLOYMENT_MODES.has(deploymentMode)) {
    throw new Error(
      `Unsupported HACKABLE_DEPLOYMENT_MODE="${deploymentMode}". Shared public deployments are out of scope; use single-tenant, ephemeral-lab, or classroom-isolated.`
    );
  }

  const invalidEnvVars = REQUIRED_ENV_VARS.filter((name) => isPlaceholder(process.env[name]));

  if (invalidEnvVars.length > 0) {
    throw new Error(
      `Refusing to start with missing or placeholder lab configuration: ${invalidEnvVars.join(', ')}. Copy apps/api/.env.example and use throwaway infrastructure only.`
    );
  }
}

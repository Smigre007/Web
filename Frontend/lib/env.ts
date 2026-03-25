/**
 * Centralized environment variable validation.
 * Call validateEnv() in server-side code to fail fast with a clear error message.
 */

interface EnvVar {
  name: string;
  required: boolean;
  description: string;
}

const SERVER_ENV_VARS: EnvVar[] = [
  { name: "NEXT_PUBLIC_SUPABASE_URL", required: true, description: "Supabase project URL" },
  { name: "SUPABASE_SERVICE_ROLE_KEY", required: true, description: "Supabase service role key (server-side only)" },
  { name: "ANTHROPIC_API_KEY", required: true, description: "Anthropic API key for AI generation" },
  { name: "CLERK_SECRET_KEY", required: true, description: "Clerk secret key for auth" },
  { name: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", required: true, description: "Clerk publishable key (browser) — sem isto o app devolve 500" },
  { name: "NEXT_PUBLIC_APP_URL", required: false, description: "Public site URL (OAuth redirects, checkout)" },
  { name: "STRIPE_SECRET_KEY", required: false, description: "Stripe secret key (payments)" },
  { name: "STRIPE_WEBHOOK_SECRET", required: false, description: "Stripe webhook signing secret" },
  { name: "CLERK_WEBHOOK_SECRET", required: false, description: "Clerk webhook signing secret" },
  { name: "CRON_SECRET", required: false, description: "Bearer secret for /api/cron/reset-generations" },
  { name: "GITHUB_CLIENT_ID", required: false, description: "GitHub OAuth app client id" },
  { name: "GITHUB_CLIENT_SECRET", required: false, description: "GitHub OAuth app secret" },
  { name: "GITHUB_TOKEN_ENCRYPTION_KEY", required: false, description: "Min 32 chars — encrypts stored GitHub tokens" },
  { name: "ADMIN_USER_IDS", required: false, description: "Comma-separated Clerk user ids for /api/admin/stats" },
];

let validated = false;

/**
 * Validate all required environment variables.
 * Throws a descriptive error if any required variable is missing.
 * Safe to call multiple times (only validates once).
 */
/** Nomes das variáveis obrigatórias (para health checks e diagnóstico). */
export function getRequiredEnvVarNames(): string[] {
  return SERVER_ENV_VARS.filter((v) => v.required).map((v) => v.name);
}

/** Lista nomes em falta (sem valores). Útil em /api/ready na Vercel. */
export function getMissingRequiredEnvVarNames(): string[] {
  return SERVER_ENV_VARS.filter((v) => v.required && !process.env[v.name]?.trim()).map((v) => v.name);
}

export function validateEnv(): void {
  if (validated) return;

  const missing: string[] = [];

  for (const envVar of SERVER_ENV_VARS) {
    if (envVar.required && !process.env[envVar.name]?.trim()) {
      missing.push(`  - ${envVar.name}: ${envVar.description}`);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join("\n")}\n\n` +
        "Please check your .env.local file or deployment environment settings."
    );
  }

  assertValidUrlIfSet("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  assertValidUrlIfSet("NEXT_PUBLIC_APP_URL", process.env.NEXT_PUBLIC_APP_URL);

  validated = true;
}

function assertValidUrlIfSet(name: string, value: string | undefined): void {
  if (!value?.trim()) return;
  try {
    new URL(value);
  } catch {
    throw new Error(`Invalid URL for ${name}: ${value}`);
  }
}

/**
 * URL pública do site (metadata, sitemap, e-mails).
 * Usa `||` em vez de `??` para que string vazia na Vercel não quebre `new URL()` no layout.
 */
export function getPublicAppUrl(): string {
  const v = process.env.NEXT_PUBLIC_APP_URL?.trim();
  return v || "https://neurocode.ai";
}

/** Returns true if Stripe is configured */
export function hasStripe(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

/** Returns true if the app is in production */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

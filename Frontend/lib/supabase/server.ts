import { createClient } from "@supabase/supabase-js";

/**
 * Returns a Supabase client with the service role key (bypasses RLS).
 * Only use in server-side API routes — never expose to the client.
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase environment variables not configured: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required."
    );
  }

  return createClient(url, key);
}

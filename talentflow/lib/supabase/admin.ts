import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { env } from "@/config/env";

// Admin client with SERVICE_ROLE key — server-only, never expose to browser
// Used for: ingestion pipelines, seeding, admin operations
export function createAdminClient() {
  if (!env.supabase.serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createClient<Database>(
    env.supabase.url,
    env.supabase.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

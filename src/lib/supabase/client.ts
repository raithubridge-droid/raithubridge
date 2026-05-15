import { createBrowserClient } from "@supabase/ssr"

import type { Database } from "@/types/database"

/**
 * Supabase client for Client Components and browser-only code.
 * Uses a singleton internally — safe to call multiple times per page.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

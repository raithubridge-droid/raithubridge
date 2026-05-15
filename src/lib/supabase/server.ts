import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import type { Database } from "@/types/database"

/**
 * Supabase client for Server Components, Server Actions, and Route Handlers.
 * Always create a new client per request — never share across requests.
 *
 * Cookie writes from Server Components are limited; session refresh is handled
 * in `src/middleware.ts` (see `updateSession` in `src/lib/supabase/middleware.ts`).
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet, headers) {
          void headers
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component: cookies are not writable here. Middleware refreshes
            // the session and persists auth cookies on the response.
          }
        },
      },
    }
  )
}

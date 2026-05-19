import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import type { Database } from "@/types/database"

/**
 * Supabase client for Server Components and Server Actions.
 * Always create a new client per request — never share across requests.
 *
 * For OAuth callbacks, use `createRouteHandlerClient` in
 * `src/lib/supabase/route-handler.ts` so auth cookies are written on the response.
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

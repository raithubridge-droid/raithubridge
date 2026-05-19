import { NextResponse, type NextRequest } from "next/server"

import { syncProfileFromUser } from "@/lib/auth/sync-profile"
import { createClient } from "@/lib/supabase/server"
import { hasSupabaseEnv } from "@/lib/supabase/env"

function getSafeNextPath(next: string | null) {
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/"
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = getSafeNextPath(requestUrl.searchParams.get("next"))

  if (code && hasSupabaseEnv()) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      await syncProfileFromUser(supabase, data.user)
    }
  }

  return NextResponse.redirect(new URL(next, request.url))
}

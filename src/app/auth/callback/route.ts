import { NextResponse, type NextRequest } from "next/server"

import { syncProfileFromUser } from "@/lib/auth/sync-profile"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { createRouteHandlerClient } from "@/lib/supabase/route-handler"

function getSafeNextPath(next: string | null) {
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/"
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const next = getSafeNextPath(searchParams.get("next"))

  if (!code || !hasSupabaseEnv()) {
    return NextResponse.redirect(
      new URL("/sign-in?error=auth_callback_failed", request.url)
    )
  }

  const redirectUrl = new URL(next, origin)
  const response = NextResponse.redirect(redirectUrl)

  const supabase = createRouteHandlerClient(request, response)
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Auth callback exchangeCodeForSession failed:", error.message)
    }

    return NextResponse.redirect(
      new URL("/sign-in?error=auth_callback_failed", request.url)
    )
  }

  if (data.user) {
    await syncProfileFromUser(supabase, data.user)
  }

  return response
}

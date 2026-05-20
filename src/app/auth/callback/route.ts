import { revalidatePath } from "next/cache"
import { NextResponse, type NextRequest } from "next/server"

import { getRequestOrigin, getSafeNextPath } from "@/lib/auth/redirect"
import { syncProfileFromUser } from "@/lib/auth/sync-profile"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { createRouteHandlerClient } from "@/lib/supabase/route-handler"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get("code")
  const next = getSafeNextPath(searchParams.get("next"))
  const origin = getRequestOrigin(request)

  if (!code || !hasSupabaseEnv()) {
    return NextResponse.redirect(new URL("/sign-in?error=auth_callback_failed", origin))
  }

  const redirectUrl = new URL(next, origin)
  const response = NextResponse.redirect(redirectUrl)

  const supabase = createRouteHandlerClient(request, response)
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Auth callback exchangeCodeForSession failed:", error.message)
    }

    return NextResponse.redirect(new URL("/sign-in?error=auth_callback_failed", origin))
  }

  if (data.user) {
    await syncProfileFromUser(supabase, data.user)
  }

  revalidatePath("/", "layout")

  return response
}

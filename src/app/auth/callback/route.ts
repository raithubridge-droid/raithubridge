import { NextResponse, type NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"

function safeRedirectPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/products"
  }

  return value
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = safeRedirectPath(requestUrl.searchParams.get("next"))
  const role = requestUrl.searchParams.get("role")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const profile = {
          id: user.id,
          email: user.email ?? null,
          full_name: user.user_metadata.full_name ?? user.user_metadata.name ?? null,
          updated_at: new Date().toISOString(),
        }

        if (role === "farmer" || role === "buyer") {
          await supabase.from("profiles").upsert({ ...profile, role })
        } else {
          await supabase.from("profiles").upsert(profile)
        }
      }

      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  return NextResponse.redirect(new URL("/signin?error=auth", request.url))
}

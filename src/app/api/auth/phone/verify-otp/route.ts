import { revalidatePath } from "next/cache"
import { NextResponse, type NextRequest } from "next/server"

import { getFriendlyOtpError } from "@/lib/auth/otp-errors"
import { isValidIndianMobileDigits, isValidOtpCode, toIndianE164 } from "@/lib/auth/phone"
import { syncProfileFromUser } from "@/lib/auth/sync-profile"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { createRouteHandlerClient } from "@/lib/supabase/route-handler"

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 })
  }

  const body = (await request.json().catch(() => ({}))) as {
    mobileDigits?: string
    token?: string
  }

  const mobileDigits = body.mobileDigits ?? ""
  const token = body.token ?? ""

  if (!isValidIndianMobileDigits(mobileDigits)) {
    return NextResponse.json({ error: "Enter a valid 10-digit mobile number." }, { status: 400 })
  }

  if (!isValidOtpCode(token)) {
    return NextResponse.json({ error: "Enter the 6-digit OTP." }, { status: 400 })
  }

  const phone = toIndianE164(mobileDigits)
  const response = NextResponse.json({ ok: true })
  const supabase = createRouteHandlerClient(request, response)

  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  })

  if (error) {
    return NextResponse.json({ error: getFriendlyOtpError(error) }, { status: 400 })
  }

  if (!data.session) {
    return NextResponse.json(
      { error: "Sign-in did not complete. Request a new OTP and try again." },
      { status: 400 }
    )
  }

  if (data.user) {
    await syncProfileFromUser(supabase, data.user)
  }

  revalidatePath("/", "layout")

  return response
}

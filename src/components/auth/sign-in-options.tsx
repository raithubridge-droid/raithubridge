"use client"

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button"
import { PhoneOtpSignInForm } from "@/components/auth/phone-otp-sign-in-form"

type SignInOptionsProps = {
  nextPath?: string
}

export function SignInOptions({ nextPath = "/" }: SignInOptionsProps) {
  return (
    <div className="space-y-4">
      <PhoneOtpSignInForm nextPath={nextPath} />

      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleSignInButton nextPath={nextPath} />
    </div>
  )
}

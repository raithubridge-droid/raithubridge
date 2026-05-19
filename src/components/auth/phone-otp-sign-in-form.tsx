"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { syncProfileFromUser } from "@/lib/auth/sync-profile"
import {
  isValidIndianMobileDigits,
  isValidOtpCode,
  normalizeIndianMobileDigits,
  normalizeOtpCode,
  toIndianE164,
} from "@/lib/auth/phone"
import { createClient } from "@/lib/supabase/client"
import { hasSupabaseEnv, SUPABASE_ENV_MESSAGE } from "@/lib/supabase/env"

type PhoneOtpSignInFormProps = {
  nextPath?: string
}

function getSafeNextPath(nextPath: string) {
  return nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/"
}

function getFriendlyOtpError(error: unknown) {
  const message = error instanceof Error ? error.message : ""
  const normalized = message.toLowerCase()

  if (normalized.includes("invalid login") || normalized.includes("invalid otp")) {
    return "Invalid OTP. Check the code and try again."
  }

  if (normalized.includes("expired")) {
    return "This OTP has expired. Send a new code."
  }

  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Too many attempts. Please wait a few minutes and try again."
  }

  if (normalized.includes("phone")) {
    return "Unable to send OTP to this number. Check the number and try again."
  }

  return message || "Something went wrong. Please try again."
}

export function PhoneOtpSignInForm({ nextPath = "/" }: PhoneOtpSignInFormProps) {
  const router = useRouter()
  const safeNext = getSafeNextPath(nextPath)

  const [mobileDigits, setMobileDigits] = React.useState("")
  const [otp, setOtp] = React.useState("")
  const [otpSent, setOtpSent] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const [isSendingOtp, setIsSendingOtp] = React.useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = React.useState(false)

  const fullPhoneNumber = isValidIndianMobileDigits(mobileDigits)
    ? toIndianE164(mobileDigits)
    : null

  async function handleSendOtp() {
    if (!hasSupabaseEnv()) {
      setMessage(SUPABASE_ENV_MESSAGE)
      return
    }

    if (!isValidIndianMobileDigits(mobileDigits)) {
      setMessage("Enter a valid 10-digit mobile number.")
      return
    }

    setIsSendingOtp(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        phone: toIndianE164(mobileDigits),
      })

      if (error) {
        throw error
      }

      setOtpSent(true)
      setOtp("")
      setMessage("OTP sent. Enter the 6-digit code we sent to your phone.")
    } catch (error) {
      setMessage(getFriendlyOtpError(error))
    } finally {
      setIsSendingOtp(false)
    }
  }

  async function handleVerifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!hasSupabaseEnv()) {
      setMessage(SUPABASE_ENV_MESSAGE)
      return
    }

    if (!fullPhoneNumber) {
      setMessage("Enter a valid 10-digit mobile number.")
      return
    }

    if (!isValidOtpCode(otp)) {
      setMessage("Enter the 6-digit OTP.")
      return
    }

    setIsVerifyingOtp(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.verifyOtp({
        phone: fullPhoneNumber,
        token: otp,
        type: "sms",
      })

      if (error) {
        throw error
      }

      if (data.user) {
        await syncProfileFromUser(supabase, data.user)
      }

      router.push(safeNext)
      router.refresh()
    } catch (error) {
      setMessage(getFriendlyOtpError(error))
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="sign-in-mobile">Mobile number</Label>
        <div className="flex overflow-hidden rounded-2xl border border-border/80 bg-background shadow-sm focus-within:ring-2 focus-within:ring-primary/30">
          <span className="flex items-center border-r border-border/80 bg-muted/50 px-3 text-sm font-semibold text-foreground">
            +91
          </span>
          <Input
            id="sign-in-mobile"
            name="mobile"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="10-digit number"
            value={mobileDigits}
            disabled={isSendingOtp || isVerifyingOtp}
            className="h-12 rounded-none border-0 text-base shadow-none focus-visible:ring-0"
            maxLength={10}
            onChange={(event) => {
              setMobileDigits(normalizeIndianMobileDigits(event.target.value))
              setMessage(null)
            }}
          />
        </div>
      </div>

      <Button
        type="button"
        className="h-12 w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
        disabled={isSendingOtp || isVerifyingOtp || !isValidIndianMobileDigits(mobileDigits)}
        onClick={() => void handleSendOtp()}
      >
        {isSendingOtp ? "Sending OTP..." : otpSent ? "Resend OTP" : "Send OTP"}
      </Button>

      {otpSent ? (
        <form onSubmit={handleVerifyOtp} className="space-y-3 border-t border-border/70 pt-3">
          <div className="space-y-2">
            <Label htmlFor="sign-in-otp">Enter OTP</Label>
            <Input
              id="sign-in-otp"
              name="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit OTP"
              value={otp}
              disabled={isVerifyingOtp}
              className="h-12 rounded-2xl text-base tracking-[0.3em]"
              maxLength={6}
              onChange={(event) => {
                setOtp(normalizeOtpCode(event.target.value))
                setMessage(null)
              }}
            />
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
            disabled={isVerifyingOtp || !isValidOtpCode(otp)}
          >
            {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
          </Button>
        </form>
      ) : null}

      {message ? (
        <p className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}
    </div>
  )
}

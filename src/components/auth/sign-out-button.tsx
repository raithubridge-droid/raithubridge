"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { cn } from "@/lib/utils"

const CLOSE_MOBILE_MENU_EVENT = "raithubridge-close-mobile-menu"

type SignOutButtonProps = {
  buttonClassName?: string
  formClassName?: string
  label?: string
  signingOutLabel?: string
}

export function SignOutButton({
  buttonClassName,
  formClassName,
  label = "Sign Out",
  signingOutLabel = "Signing out...",
}: SignOutButtonProps = {}) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)

  async function handleSignOut() {
    setIsSigningOut(true)
    setMessage(null)

    try {
      if (hasSupabaseEnv()) {
        const supabase = createClient()
        const { error } = await supabase.auth.signOut()

        if (error) {
          throw error
        }
      }

      window.dispatchEvent(new Event(CLOSE_MOBILE_MENU_EVENT))
      router.push("/")
      router.refresh()
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Sign out failed:", error)
      }

      setMessage(
        error instanceof Error ? error.message : "Unable to sign out. Please try again."
      )
      setIsSigningOut(false)
    }
  }

  return (
    <div className={cn("w-full", formClassName)}>
      <Button
        type="button"
        variant="ghost"
        size="default"
        className={buttonClassName ?? "h-10 px-3 text-base"}
        disabled={isSigningOut}
        onClick={() => void handleSignOut()}
      >
        {isSigningOut ? signingOutLabel : label}
      </Button>
      {message ? (
        <p className="mt-2 text-sm text-destructive">{message}</p>
      ) : null}
    </div>
  )
}

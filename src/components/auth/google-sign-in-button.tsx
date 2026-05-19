"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { hasSupabaseEnv, SUPABASE_ENV_MESSAGE } from "@/lib/supabase/env"
import { cn } from "@/lib/utils"

type GoogleSignInButtonProps = {
  nextPath?: string
  className?: string
  disabled?: boolean
}

function getSafeNextPath(nextPath: string) {
  return nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/"
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
      />
    </svg>
  )
}

export function GoogleSignInButton({
  nextPath = "/",
  className,
  disabled = false,
}: GoogleSignInButtonProps) {
  const [message, setMessage] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const safeNext = getSafeNextPath(nextPath)

  async function handleGoogleSignIn() {
    if (!hasSupabaseEnv()) {
      setMessage(SUPABASE_ENV_MESSAGE)
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      })

      if (error) {
        throw error
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to start Gmail sign-in."
      )
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className={cn(
          "h-12 w-full rounded-2xl border-border/80 bg-card text-base font-semibold text-foreground shadow-sm hover:bg-muted/40",
          className
        )}
        disabled={disabled || isLoading}
        onClick={() => void handleGoogleSignIn()}
      >
        <GoogleIcon className="size-5 shrink-0" />
        {isLoading ? "Redirecting..." : "Continue with Gmail"}
      </Button>
      {message ? (
        <p className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}
    </div>
  )
}

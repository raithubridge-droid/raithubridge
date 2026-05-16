"use client"

import * as React from "react"
import { LogIn } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { hasSupabaseEnv, SUPABASE_ENV_MESSAGE } from "@/lib/supabase/env"

export function SignInForm() {
  const [message, setMessage] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!hasSupabaseEnv()) {
      setMessage(SUPABASE_ENV_MESSAGE)
      return
    }

    const formData = new FormData(e.currentTarget)
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")

    setIsSubmitting(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      router.push("/products")
      router.refresh()
    } catch (error) {
      const fallbackMessage = "Unable to sign in. Check your email and password."
      setMessage(error instanceof Error ? error.message : fallbackMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleGoogleSignIn() {
    setMessage("Google login coming soon.")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Button
        type="button"
        variant="outline"
        className="h-12 w-full rounded-xl text-base font-semibold"
        onClick={handleGoogleSignIn}
      >
        <LogIn className="size-5" aria-hidden />
        Continue with Google
      </Button>

      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        Email
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signin-password">Password</Label>
        <Input
          id="signin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Password"
        />
      </div>
      {message ? (
        <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}
      <Button
        type="submit"
        className="h-12 w-full rounded-xl text-base font-semibold"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  )
}

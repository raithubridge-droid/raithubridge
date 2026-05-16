"use client"

import * as React from "react"
import { LogIn } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { hasSupabaseEnv, SUPABASE_ENV_MESSAGE } from "@/lib/supabase/env"

export function SignUpForm() {
  const [message, setMessage] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const router = useRouter()

  function getFriendlyAuthMessage(error: unknown) {
    const message = error instanceof Error ? error.message : ""
    const normalized = message.toLowerCase()

    if (normalized.includes("rate limit")) {
      return "Too many signup attempts right now. Please wait a few minutes and try again."
    }

    if (normalized.includes("invalid")) {
      return "Enter a valid email address and password."
    }

    return message || "Unable to create account."
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!hasSupabaseEnv()) {
      setMessage(SUPABASE_ENV_MESSAGE)
      return
    }

    const formData = new FormData(e.currentTarget)
    const fullName = String(formData.get("name") ?? "").trim()
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")

    if (password.length < 8) {
      setMessage("Use a password with at least 8 characters.")
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/products`,
        },
      })

      if (error) {
        throw error
      }

      if (data.user) {
        await supabase
          .from("profiles")
          .upsert({
            email,
            full_name: fullName,
            id: data.user.id,
            role: "user",
          })
      }

      if (!data.session) {
        setMessage("Account created. Check your email to confirm your account, then sign in.")
        return
      }

      router.push("/products")
      router.refresh()
    } catch (error) {
      setMessage(getFriendlyAuthMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleGoogleSignUp() {
    setMessage("Google login coming soon.")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Button
        type="button"
        variant="outline"
        className="h-12 w-full rounded-xl text-base font-semibold"
        onClick={handleGoogleSignUp}
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
        <Label htmlFor="signup-name">Name</Label>
        <Input id="signup-name" name="name" autoComplete="name" required placeholder="Full name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="At least 8 characters"
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
        {isSubmitting ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  )
}

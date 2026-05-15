"use client"

import * as React from "react"
import { LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

export function SignUpForm() {
  const [message, setMessage] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [role, setRole] = React.useState("")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage("Email account creation is not enabled yet. Use Google to create your account.")
  }

  async function handleGoogleSignUp() {
    if (!role) {
      setMessage("Select Farmer or Buyer before continuing with Google.")
      return
    }

    setIsLoading(true)
    setMessage(null)

    const supabase = createClient()
    const origin = window.location.origin
    const params = new URLSearchParams({
      next: role === "farmer" ? "/farmer/register" : "/products",
      role,
    })

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?${params.toString()}`,
      },
    })

    if (error) {
      setMessage(error.message)
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
      <div className="space-y-2">
        <Label htmlFor="signup-role">Role</Label>
            <select
              id="signup-role"
              name="role"
              required
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className={cn(
                "h-11 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base outline-none",
                "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                "dark:bg-input/30"
              )}
            >
          <option value="">Select role</option>
          <option value="farmer">Farmer</option>
          <option value="buyer">Buyer</option>
        </select>
      </div>
      <Button
        type="button"
        variant="outline"
        className="h-12 w-full rounded-xl text-base font-semibold"
        disabled={isLoading}
        onClick={handleGoogleSignUp}
      >
        <LogIn className="size-5" aria-hidden />
        {isLoading ? "Redirecting..." : "Continue with Google"}
      </Button>

      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        Email
        <span className="h-px flex-1 bg-border" />
      </div>
      {message ? (
        <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}
      <Button type="submit" className="h-12 w-full rounded-xl text-base font-semibold">
        Create Account
      </Button>
    </form>
  )
}

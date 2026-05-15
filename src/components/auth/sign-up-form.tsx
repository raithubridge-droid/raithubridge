"use client"

import * as React from "react"
import { LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SignUpForm() {
  const [message, setMessage] = React.useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage("Static preview only. Account creation will be connected later.")
  }

  function handleGoogleSignUp() {
    setMessage("Google signup UI is static for now and will be connected later.")
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
      <Button type="submit" className="h-12 w-full rounded-xl text-base font-semibold">
        Create Account
      </Button>
    </form>
  )
}

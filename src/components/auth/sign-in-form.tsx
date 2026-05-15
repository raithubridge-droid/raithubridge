"use client"

import * as React from "react"
import { LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SignInForm() {
  const [message, setMessage] = React.useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage("Static preview only. Authentication will be connected later.")
  }

  function handleGoogleSignIn() {
    setMessage("Google login UI is static for now and will be connected later.")
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
      <Button type="submit" className="h-12 w-full rounded-xl text-base font-semibold">
        Sign In
      </Button>
    </form>
  )
}

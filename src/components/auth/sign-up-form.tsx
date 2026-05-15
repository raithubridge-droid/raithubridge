"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function SignUpForm() {
  const [message, setMessage] = React.useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage(
      "Account creation is not connected yet — you can still browse products and register as a farmer."
    )
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

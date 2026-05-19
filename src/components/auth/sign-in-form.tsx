"use client"

import { SignInOptions } from "@/components/auth/sign-in-options"

export function SignInForm({ nextPath = "/" }: { nextPath?: string }) {
  return <SignInOptions nextPath={nextPath} />
}

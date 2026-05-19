"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { SignInOptions } from "@/components/auth/sign-in-options"

type SignInPageClientProps = {
  nextPath: string
  authError?: string
}

function getAuthErrorMessage(authError?: string) {
  if (authError === "auth_callback_failed") {
    return "Gmail sign-in could not be completed. Please try again."
  }

  return null
}

export function SignInPageClient({ nextPath, authError }: SignInPageClientProps) {
  const authErrorMessage = getAuthErrorMessage(authError)

  return (
    <main className="flex flex-1 flex-col justify-center px-4 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          Back to home
        </Link>

        <section className="rounded-2xl border border-border/70 bg-card/95 p-5 shadow-lg ring-1 ring-primary/10 sm:p-6">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Sign in to RaithuBridge
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Use your mobile number or Gmail to continue.
          </p>

          {authErrorMessage ? (
            <p className="mt-3 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {authErrorMessage}
            </p>
          ) : null}

          <div className="mt-4">
            <SignInOptions nextPath={nextPath} />
          </div>
        </section>
      </div>
    </main>
  )
}

import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { SignInOptions } from "@/components/auth/sign-in-options"

export const metadata: Metadata = {
  title: "Sign in to RaithuBridge",
  description: "Sign in with your mobile number or Gmail to submit products, save your cart, and track orders.",
}

type SignInPageProps = {
  searchParams?: Promise<{
    next?: string
  }>
}

function getSafeNextPath(next?: string) {
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/"
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams
  const nextPath = getSafeNextPath(params?.next)

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

          <div className="mt-4">
            <SignInOptions nextPath={nextPath} />
          </div>
        </section>
      </div>
    </main>
  )
}

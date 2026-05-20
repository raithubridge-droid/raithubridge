import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { AuthRequiredCard } from "@/components/auth/auth-required-card"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { getAccountDisplayLabel, getAccountEmail, getAccountPhone, getLoginProviderLabel } from "@/lib/auth/account"
import { getCurrentProfile } from "@/lib/auth/roles"

export const metadata: Metadata = {
  title: "My Account",
  description: "View your RaithuBridge account details.",
}

export const dynamic = "force-dynamic"

function AccountDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/80 px-3 py-2.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-medium text-foreground">{value}</p>
    </div>
  )
}

export default async function AccountPage() {
  const { user, profile } = await getCurrentProfile()

  if (!user) {
    return (
      <main className="px-4 py-4">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-green-900"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            Back to home
          </Link>
          <h1 className="mt-3 font-heading text-3xl font-bold">My Account</h1>
          <div className="mt-4">
            <AuthRequiredCard
              message="Please sign in to view your account."
              nextPath="/account"
            />
          </div>
        </div>
      </main>
    )
  }

  const email = getAccountEmail(user, profile)
  const phone = getAccountPhone(user, profile)
  const displayLabel = getAccountDisplayLabel(user, profile)
  const provider = getLoginProviderLabel(user)

  return (
    <main className="px-4 py-4">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-green-900"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          Back to home
        </Link>

        <h1 className="mt-3 font-heading text-3xl font-bold">My Account</h1>

        <section className="mt-4 space-y-3 rounded-2xl border border-green-800/15 bg-card/95 p-4 shadow-sm ring-1 ring-green-800/10">
          {displayLabel ? (
            <div className="rounded-xl bg-green-800/5 px-3 py-2.5 ring-1 ring-green-800/10">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-900/70">
                Signed in as
              </p>
              <p className="mt-0.5 break-all text-base font-semibold text-foreground">{displayLabel}</p>
            </div>
          ) : null}

          {email ? <AccountDetail label="Email" value={email} /> : null}
          {phone ? <AccountDetail label="Phone" value={phone} /> : null}
          {provider ? <AccountDetail label="Sign-in method" value={provider} /> : null}

          <SignOutButton
            buttonClassName="h-12 w-full rounded-xl bg-green-800 text-base font-semibold text-white hover:bg-green-900"
          />
        </section>
      </div>
    </main>
  )
}

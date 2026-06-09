import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { AuthRequiredCard } from "@/components/auth/auth-required-card"
import { UserAccountPanel } from "@/components/auth/user-account-panel"
import {
  getAccountDisplayLabel,
  getLoginProviderLabel,
} from "@/lib/auth/account"
import { getCurrentProfile, ROLE_LABELS } from "@/lib/auth/roles"

export const metadata: Metadata = {
  title: "My Account",
  description: "View your RaithuBridge account details.",
}

export const dynamic = "force-dynamic"

export default async function AccountPage() {
  const { user, profile } = await getCurrentProfile()

  if (!user) {
    return (
      <main className="px-4 py-4 sm:py-8">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-green-900"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            Back to home
          </Link>
          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            My Account
          </h1>
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

  const accountLabel = getAccountDisplayLabel(user, profile)
  const loginProvider = getLoginProviderLabel(user)
  const role = profile?.role ?? "user"
  const isAdmin = role === "admin"

  return (
    <main className="px-4 py-4 sm:py-8">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-green-900"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          Back to home
        </Link>

        <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          My Account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your RaithuBridge profile and sign out securely.
        </p>

        <div className="mt-4">
          <UserAccountPanel
            accountLabel={accountLabel}
            loginProvider={loginProvider}
            roleLabel={ROLE_LABELS[role]}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </main>
  )
}

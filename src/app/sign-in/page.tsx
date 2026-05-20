import type { Metadata } from "next"

import { SignInPageClient } from "@/components/auth/sign-in-page-client"
import { getSafeNextPath } from "@/lib/auth/redirect"

export const metadata: Metadata = {
  title: "Sign in to RaithuBridge",
  description: "Sign in with your mobile number or Gmail to submit products, save your cart, and track orders.",
}

type SignInPageProps = {
  searchParams?: Promise<{
    next?: string
    error?: string
  }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams
  const nextPath = getSafeNextPath(params?.next)

  return <SignInPageClient nextPath={nextPath} authError={params?.error} />
}

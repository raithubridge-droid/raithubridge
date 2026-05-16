import type { Metadata } from "next"
import Link from "next/link"

import { SignInForm } from "@/components/auth/sign-in-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to RaithuBridge.",
}

type SignInPageProps = {
  searchParams?: Promise<{
    next?: string
  }>
}

function getSafeNextPath(next?: string) {
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/products"
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams
  const nextPath = getSafeNextPath(params?.next)

  return (
    <main className="flex flex-1 flex-col justify-center px-4 py-14 sm:py-20">
      <div className="mx-auto w-full max-w-md">
        <Card className="border-border/70 bg-card/95 shadow-lg ring-1 ring-primary/10">
          <CardHeader className="space-y-2 pb-2">
            <CardTitle className="text-2xl font-semibold tracking-tight">Sign in</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Access buying, selling, submissions, and review tools from one account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignInForm nextPath={nextPath} />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              No account?{" "}
              <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

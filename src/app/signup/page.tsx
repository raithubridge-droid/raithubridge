import type { Metadata } from "next"
import Link from "next/link"

import { SignUpForm } from "@/components/auth/sign-up-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a RaithuBridge account.",
}

export default function SignUpPage() {
  return (
    <main className="flex flex-1 flex-col justify-center px-4 py-14 sm:py-20">
      <div className="mx-auto w-full max-w-md">
        <Card className="border-border/70 bg-card/95 shadow-lg ring-1 ring-primary/10">
          <CardHeader className="space-y-2 pb-2">
            <CardTitle className="text-2xl font-semibold tracking-tight">Create account</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              One account lets you buy products and submit your own products for review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignUpForm />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already registered?{" "}
              <Link href="/signin" className="font-medium text-primary underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

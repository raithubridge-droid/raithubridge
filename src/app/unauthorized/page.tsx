import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentProfile, getRoleHome, ROLE_LABELS } from "@/lib/auth/roles"

export const metadata: Metadata = {
  title: "Unauthorized",
  description: "Your account role cannot access this page.",
}

export default async function UnauthorizedPage() {
  const { profile } = await getCurrentProfile()
  const home = getRoleHome(profile?.role)

  return (
    <main className="flex flex-1 flex-col justify-center px-4 py-14 sm:py-20">
      <Card className="mx-auto w-full max-w-lg border-border/70 bg-card/95 shadow-lg ring-1 ring-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl">Access restricted</CardTitle>
          <CardDescription className="text-base leading-relaxed">
            {profile
              ? `Your current role is ${ROLE_LABELS[profile.role]}. This area needs a different role.`
              : "Sign in with an account that has access to this area."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="h-11 rounded-xl px-5 text-base font-semibold">
            <Link href={home}>Go to your workspace</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}

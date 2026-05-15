import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Access Preview",
  description: "Static access preview page.",
}

export default function UnauthorizedPage() {
  return (
    <main className="flex flex-1 flex-col justify-center px-4 py-14 sm:py-20">
      <Card className="mx-auto w-full max-w-lg border-border/70 bg-card/95 shadow-lg ring-1 ring-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl">Static preview</CardTitle>
          <CardDescription className="text-base leading-relaxed">
            Role access will be connected later. For now, all product and submission screens
            use static sample UI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="h-11 rounded-xl px-5 text-base font-semibold">
            <Link href="/products">Go to products</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}

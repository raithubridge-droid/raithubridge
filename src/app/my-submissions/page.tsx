import type { Metadata } from "next"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SAMPLE_SUBMISSIONS, type SubmissionStatus } from "@/lib/marketplace-data"

export const metadata: Metadata = {
  title: "My Submissions",
  description: "Track product review status and admin comments.",
}

const statusTone: Record<SubmissionStatus, string> = {
  "Pending Review": "bg-amber-100 text-amber-900 border-amber-200",
  "On Hold": "bg-blue-100 text-blue-900 border-blue-200",
  Approved: "bg-emerald-100 text-emerald-900 border-emerald-200",
  Rejected: "bg-red-100 text-red-900 border-red-200",
}

export default function MySubmissionsPage() {
  return (
    <main className="px-4 py-14 sm:py-20">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              My Submissions
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Review sample product submissions, status changes, and admin comments visible
              to the user.
            </p>
          </div>
          <Button asChild className="h-11 rounded-xl px-5 text-base font-semibold">
            <Link href="/submit-product">Submit Product</Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {SAMPLE_SUBMISSIONS.map((item) => (
            <Card key={item.id} className="border-border/70 bg-card/95 shadow-md ring-1 ring-primary/5">
              <CardHeader className="space-y-3 border-b border-border/60">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-2xl">{item.productName}</CardTitle>
                    <p className="mt-1 text-base text-muted-foreground">
                      Submitted {item.submittedAt}
                    </p>
                  </div>
                  <Badge className={`border px-3 py-1 text-sm ${statusTone[item.status]}`}>
                    {item.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <div className="grid gap-4 text-base sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Product
                    </p>
                    <p className="mt-1 text-foreground">{item.category}</p>
                    <p className="text-muted-foreground">
                      {item.quantityAvailable} {item.unit} · {item.price}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Location
                    </p>
                    <p className="mt-1 text-foreground">
                      {item.villageCity}, {item.district}
                    </p>
                    <p className="text-muted-foreground">{item.state}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
                  <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                    Admin comment
                  </p>
                  <p className="mt-2 text-base text-foreground">{item.adminComment}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}

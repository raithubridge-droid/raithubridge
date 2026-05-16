/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { REVIEW_STATUS_TONE_CLASS } from "@/lib/domain"
import { getCurrentUserSubmissions } from "@/lib/product-submissions"

export const metadata: Metadata = {
  title: "My Submissions",
  description: "Track product review status and admin comments.",
}

export default async function MySubmissionsPage() {
  const submissions = await getCurrentUserSubmissions()

  if (!submissions) {
    redirect("/signin")
  }

  return (
    <main className="px-4 py-14 sm:py-20">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              My Submissions
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Track your submitted products, review status, and admin comments.
            </p>
          </div>
          <Button asChild className="h-11 rounded-xl px-5 text-base font-semibold">
            <Link href="/submit-product">Submit Product</Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {submissions.map((item) => (
            <Card key={item.id} className="border-border/70 bg-card/95 shadow-md ring-1 ring-primary/5">
              <CardHeader className="space-y-3 border-b border-border/60">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-2xl">{item.productName}</CardTitle>
                    <p className="mt-1 text-base text-muted-foreground">
                      Submitted {item.submittedAt}
                    </p>
                  </div>
                  <Badge className={`border px-3 py-1 text-sm ${REVIEW_STATUS_TONE_CLASS[item.status]}`}>
                    {item.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                {item.mediaAssets?.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {item.mediaAssets
                      .filter((asset) => asset.type === "image")
                      .slice(0, 2)
                      .map((asset) => (
                        <div
                          key={asset.path}
                          className="aspect-[4/3] overflow-hidden rounded-xl border border-border/70 bg-muted"
                        >
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                  </div>
                ) : null}
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
                      {item.sellerVillageCity}, {item.sellerDistrict}
                    </p>
                    <p className="text-muted-foreground">{item.sellerState}</p>
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
        {!submissions.length ? (
          <Card className="mt-10 border-border/70 bg-card/95 text-center shadow-md ring-1 ring-primary/5">
            <CardContent className="p-8">
              <p className="text-lg font-semibold text-foreground">No submissions yet.</p>
              <p className="mt-2 text-base text-muted-foreground">
                Submit a product and it will appear here with status and admin comments.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  )
}

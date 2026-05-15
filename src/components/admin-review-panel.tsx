"use client"

import * as React from "react"
import { CalendarDays, ImageIcon, MapPin, Phone, Video } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { PendingSubmission } from "@/lib/marketplace-data"

type ReviewState = "pending" | "approved" | "rejected"

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

export function AdminReviewPanel({ items }: { items: PendingSubmission[] }) {
  const [states, setStates] = React.useState<Record<string, ReviewState>>(() =>
    Object.fromEntries(items.map((i) => [i.id, "pending" as const]))
  )

  return (
    <div className="space-y-8">
      {items.map((row) => {
        const status = states[row.id] ?? "pending"
        return (
          <Card
            key={row.id}
            className="border-border/70 bg-card/95 shadow-md ring-1 ring-primary/5 data-[status=approved]:border-primary/45 data-[status=rejected]:opacity-75"
            data-status={status}
          >
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl">{row.productName}</CardTitle>
                <p className="mt-2 text-base text-muted-foreground">
                  Submission <span className="font-mono text-sm">{row.id}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{row.category}</Badge>
                {status !== "pending" ? (
                  <Badge variant={status === "approved" ? "default" : "destructive"}>
                    {status === "approved" ? "Approved" : "Rejected"}
                  </Badge>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 pt-4 lg:grid-cols-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Farmer
                </h3>
                <ul className="mt-3 space-y-2.5 text-base">
                  <li className="text-lg font-semibold text-foreground">{row.farmerName}</li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-4 shrink-0" aria-hidden />
                    {row.phone}
                  </li>
                  <li className="text-muted-foreground">WhatsApp: {row.whatsapp}</li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>
                      {row.village}, {row.district}, {row.state}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="size-4 shrink-0" aria-hidden />
                    Submitted {row.submittedAt}
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Product
                </h3>
                <ul className="mt-3 space-y-2.5 text-base text-muted-foreground">
                  <li>
                    <span className="text-foreground">Quantity:</span>{" "}
                    {row.quantityAvailable} {row.unit}
                  </li>
                  <li>
                    <span className="text-foreground">Price:</span> {row.price}
                  </li>
                  <li>
                    <span className="text-foreground">Description:</span>{" "}
                    {row.description}
                  </li>
                </ul>
                {row.mediaAssets?.length ? (
                  <div className="mt-5 rounded-xl border border-border/70 bg-background/70 p-4">
                    <h4 className="text-sm font-semibold text-foreground">
                      Uploaded media
                    </h4>
                    <ul className="mt-3 space-y-2">
                      {row.mediaAssets.map((asset) => {
                        const Icon = asset.type === "video" ? Video : ImageIcon

                        return (
                          <li key={asset.path}>
                            <a
                              href={asset.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <Icon className="size-4 shrink-0 text-primary" aria-hidden />
                              <span className="min-w-0 flex-1 truncate">{asset.name}</span>
                              <span className="shrink-0">{formatFileSize(asset.size)}</span>
                            </a>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3 border-t border-border/60 bg-muted/30 p-5">
              <Button
                type="button"
                className="h-11 min-w-[7.5rem] rounded-xl text-base font-semibold"
                disabled={status !== "pending"}
                onClick={() =>
                  setStates((s) => ({
                    ...s,
                    [row.id]: "approved",
                  }))
                }
              >
                Approve
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 min-w-[7.5rem] rounded-xl border-2 border-destructive/35 text-base font-semibold text-destructive hover:bg-destructive/10"
                disabled={status !== "pending"}
                onClick={() =>
                  setStates((s) => ({
                    ...s,
                    [row.id]: "rejected",
                  }))
                }
              >
                Reject
              </Button>
              {status !== "pending" ? (
                <p className="w-full text-sm text-muted-foreground sm:ml-auto sm:w-auto sm:text-right">
                  Preview only — changes are not saved to a database yet.
                </p>
              ) : null}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

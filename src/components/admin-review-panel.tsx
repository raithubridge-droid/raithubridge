"use client"

import * as React from "react"
import { CalendarDays, MapPin, Phone } from "lucide-react"

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

export function AdminReviewPanel({ items }: { items: PendingSubmission[] }) {
  const [states, setStates] = React.useState<Record<string, ReviewState>>(() =>
    Object.fromEntries(items.map((i) => [i.id, "pending" as const]))
  )

  return (
    <div className="space-y-6">
      {items.map((row) => {
        const status = states[row.id] ?? "pending"
        return (
          <Card
            key={row.id}
            className="border-border/80 bg-card/90 shadow-sm data-[status=approved]:border-primary/40 data-[status=rejected]:opacity-75"
            data-status={status}
          >
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-4">
              <div>
                <CardTitle className="text-lg">{row.productName}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Submission <span className="font-mono text-xs">{row.id}</span>
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
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Farmer
                </h3>
                <ul className="mt-2 space-y-2 text-sm">
                  <li className="font-medium text-foreground">{row.farmerName}</li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-3.5 shrink-0" aria-hidden />
                    {row.phone}
                  </li>
                  <li className="text-muted-foreground">WhatsApp: {row.whatsapp}</li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                    <span>
                      {row.village}, {row.district}, {row.state}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="size-3.5 shrink-0" aria-hidden />
                    Submitted {row.submittedAt}
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Product
                </h3>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
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
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3 border-t border-border/60 bg-muted/30">
              <Button
                type="button"
                className="rounded-lg"
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
                className="rounded-lg border-destructive/40 text-destructive hover:bg-destructive/10"
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
                <p className="w-full text-xs text-muted-foreground sm:w-auto sm:ml-auto">
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

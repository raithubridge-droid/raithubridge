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
import { Textarea } from "@/components/ui/textarea"
import type { PendingSubmission, SubmissionStatus } from "@/lib/marketplace-data"

const statusTone: Record<SubmissionStatus, string> = {
  "Pending Review": "bg-amber-100 text-amber-900 border-amber-200",
  "On Hold": "bg-blue-100 text-blue-900 border-blue-200",
  Approved: "bg-emerald-100 text-emerald-900 border-emerald-200",
  Rejected: "bg-red-100 text-red-900 border-red-200",
}

export function AdminReviewPanel({ items }: { items: PendingSubmission[] }) {
  const [states, setStates] = React.useState<Record<string, SubmissionStatus>>(() =>
    Object.fromEntries(items.map((i) => [i.id, i.status]))
  )
  const [comments, setComments] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(items.map((i) => [i.id, i.adminComment]))
  )

  function updateStatus(id: string, status: SubmissionStatus) {
    setStates((current) => ({
      ...current,
      [id]: status,
    }))
  }

  return (
    <div className="space-y-8">
      {items.map((row) => {
        const status = states[row.id] ?? row.status
        const comment = comments[row.id] ?? ""

        return (
          <Card
            key={row.id}
            className="overflow-hidden border-border/70 bg-card/95 shadow-md ring-1 ring-primary/5"
          >
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b border-border/60 bg-gradient-to-r from-card to-muted/40 pb-5">
              <div>
                <CardTitle className="text-2xl">{row.productName}</CardTitle>
                <p className="mt-2 text-base text-muted-foreground">
                  Submission <span className="font-mono text-sm">{row.id}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{row.category}</Badge>
                <Badge className={`border px-3 py-1 text-sm ${statusTone[status]}`}>
                  {status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-7 pt-6 lg:grid-cols-2">
              <div className="space-y-2 lg:col-span-2">
                <label
                  htmlFor={`status-${row.id}`}
                  className="text-sm font-semibold text-foreground"
                >
                  Status
                </label>
                <select
                  id={`status-${row.id}`}
                  value={status}
                  onChange={(event) =>
                    updateStatus(row.id, event.target.value as SubmissionStatus)
                  }
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:max-w-xs"
                >
                  <option value="Pending Review">Pending</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Seller / farmer
                </h3>
                <ul className="mt-3 space-y-2.5 text-base">
                  <li className="text-lg font-semibold text-foreground">{row.sellerName}</li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-4 shrink-0" aria-hidden />
                    {row.phone}
                  </li>
                  <li className="text-muted-foreground">WhatsApp: {row.whatsapp}</li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>
                      {row.villageCity}, {row.district}, {row.state}
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
              </div>
              <div className="space-y-2 lg:col-span-2">
                <label
                  htmlFor={`comment-${row.id}`}
                  className="text-sm font-semibold text-foreground"
                >
                  Admin comments
                </label>
                <Textarea
                  id={`comment-${row.id}`}
                  value={comment}
                  rows={3}
                  onChange={(event) =>
                    setComments((current) => ({
                      ...current,
                      [row.id]: event.target.value,
                    }))
                  }
                  placeholder="Add a clear comment for the user."
                />
                <p className="text-sm text-muted-foreground">
                  Comments entered here are visible to the user on My Submissions.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3 border-t border-border/60 bg-muted/30 p-5">
              <Button
                type="button"
                className="h-11 min-w-[7.5rem] rounded-xl text-base font-semibold"
                onClick={() => updateStatus(row.id, "Approved")}
              >
                Approve
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 min-w-[8.5rem] rounded-xl border-2 border-blue-300 text-base font-semibold text-blue-800 hover:bg-blue-50"
                onClick={() => updateStatus(row.id, "On Hold")}
              >
                Keep On Hold
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 min-w-[7.5rem] rounded-xl border-2 border-destructive/35 text-base font-semibold text-destructive hover:bg-destructive/10"
                onClick={() => updateStatus(row.id, "Rejected")}
              >
                Reject
              </Button>
              <p className="w-full text-sm text-muted-foreground sm:ml-auto sm:w-auto sm:text-right">
                Static preview only. Status and comments are not saved yet.
              </p>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

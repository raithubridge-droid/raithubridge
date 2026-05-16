"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { REVIEW_STATUS_TONE_CLASS } from "@/lib/domain"
import { type InventoryItem } from "@/lib/marketplace-data"

export function AdminInventoryClient({ initialItems }: { initialItems: InventoryItem[] }) {
  const [items, setItems] = React.useState<InventoryItem[]>(initialItems)
  const [isLoading, setIsLoading] = React.useState(true)
  const [message, setMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    let isMounted = true

    async function loadInventory() {
      setIsLoading(true)
      setMessage(null)

      try {
        const response = await fetch("/api/admin/inventory")
        const payload = (await response.json()) as { error?: string; items?: InventoryItem[] }

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load inventory.")
        }

        if (isMounted) {
          setItems(payload.items ?? [])
        }
      } catch (error) {
        if (isMounted) {
          setMessage(error instanceof Error ? error.message : "Unable to load inventory.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadInventory()

    return () => {
      isMounted = false
    }
  }, [])

  function toggleAvailability(id: string) {
    const nextItem = items.find((item) => item.id === id)

    if (nextItem) {
      const inStock = !nextItem.inStock
      const stockCount = inStock ? Math.max(1, nextItem.stockCount) : 0

      void fetch(`/api/admin/inventory/${id}`, {
        body: JSON.stringify({ inStock, stockCount }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      })
        .then(async (response) => {
          const payload = (await response.json()) as { error?: string }

          if (!response.ok) {
            throw new Error(payload.error ?? "Unable to update inventory.")
          }
        })
        .catch((error) => {
          setMessage(error instanceof Error ? error.message : "Unable to update inventory.")
        })
    }

    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              inStock: !item.inStock,
              stockCount: item.inStock ? 0 : Math.max(1, item.stockCount),
            }
          : item
      )
    )
  }

  return (
    <main className="px-4 py-14 sm:py-20">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              Inventory
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Admin-only inventory view with product status, stock counts, and availability
              toggles backed by Supabase.
            </p>
          </div>
          <Badge className="w-fit rounded-full px-4 py-2 text-sm">Admin access</Badge>
        </div>

        {message ? (
          <p className="mt-8 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-base text-destructive">
            {message}
          </p>
        ) : null}

        {isLoading ? (
          <Card className="mt-10 border-border/70 bg-card/95 shadow-md ring-1 ring-primary/5">
            <CardContent className="p-8 text-center text-base text-muted-foreground">
              Loading inventory...
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !items.length ? (
          <Card className="mt-10 border-border/70 bg-card/95 shadow-md ring-1 ring-primary/5">
            <CardContent className="p-8 text-center">
              <p className="text-xl font-semibold text-foreground">No inventory yet</p>
              <p className="mt-2 text-base text-muted-foreground">
                Submitted products will appear here after they are saved in Supabase.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && items.length ? (
        <div className="mt-10 overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-lg ring-1 ring-primary/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-base">
              <thead className="bg-muted/70 text-sm uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 font-semibold">Product name</th>
                  <th className="px-5 py-4 font-semibold">Seller / farmer</th>
                  <th className="px-5 py-4 font-semibold">Category</th>
                  <th className="px-5 py-4 font-semibold">Quantity</th>
                  <th className="px-5 py-4 font-semibold">Unit</th>
                  <th className="px-5 py-4 font-semibold">Price</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Stock count</th>
                  <th className="px-5 py-4 font-semibold">Availability</th>
                  <th className="px-5 py-4 font-semibold">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-muted/35">
                    <td className="px-5 py-4 font-semibold text-foreground">{item.productName}</td>
                    <td className="px-5 py-4 text-muted-foreground">{item.sellerName}</td>
                    <td className="px-5 py-4 text-muted-foreground">{item.category}</td>
                    <td className="px-5 py-4 text-muted-foreground">{item.quantity}</td>
                    <td className="px-5 py-4 text-muted-foreground">{item.unit}</td>
                    <td className="px-5 py-4 text-muted-foreground">{item.price}</td>
                    <td className="px-5 py-4">
                      <Badge className={`border px-3 py-1 text-sm ${REVIEW_STATUS_TONE_CLASS[item.status]}`}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 font-semibold text-foreground">{item.stockCount}</td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => toggleAvailability(item.id)}
                        className={`inline-flex h-9 min-w-32 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors ${
                          item.inStock
                            ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                            : "bg-red-100 text-red-900 hover:bg-red-200"
                        }`}
                      >
                        {item.inStock ? "In stock" : "Out of stock"}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{item.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        ) : null}
      </div>
    </main>
  )
}

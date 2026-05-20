"use client"

import * as React from "react"
import Link from "next/link"

import { ProductImage } from "@/components/product-image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { REVIEW_STATUS_TONE_CLASS } from "@/lib/domain"
import { type InventoryItem } from "@/lib/marketplace-data"

function InventoryCard({
  item,
  onToggleAvailability,
  isUpdating,
}: {
  item: InventoryItem
  onToggleAvailability: (id: string) => void
  isUpdating: boolean
}) {
  return (
    <article className="rounded-2xl border border-border/70 bg-card/95 p-3 shadow-sm ring-1 ring-primary/5">
      <div className="flex gap-3">
        <ProductImage
          category={item.category}
          mediaAssets={item.mediaAssets}
          alt={item.productName}
          includeManageableImages
          className="size-20 shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="line-clamp-2 text-base font-bold leading-snug">{item.productName}</h2>
              <p className="text-sm text-muted-foreground">{item.category}</p>
            </div>
            <Badge className={`shrink-0 border px-2 py-0.5 text-xs ${REVIEW_STATUS_TONE_CLASS[item.status]}`}>
              {item.status}
            </Badge>
          </div>

          <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
            <div>
              <dt className="text-muted-foreground">Quantity</dt>
              <dd className="font-medium">
                {item.quantity} {item.unit}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Price</dt>
              <dd className="font-medium">{item.price}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Availability</dt>
              <dd className="font-medium">{item.inStock ? "In stock" : "Out of stock"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Stock</dt>
              <dd className="font-medium">{item.stockCount}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 flex-1 rounded-xl text-sm font-semibold sm:flex-none"
              disabled={isUpdating}
              onClick={() => onToggleAvailability(item.id)}
            >
              {item.inStock ? "Mark out of stock" : "Mark in stock"}
            </Button>
            <Button
              asChild
              size="sm"
              className="h-10 flex-1 rounded-xl bg-green-800 text-sm font-semibold text-white hover:bg-green-900 sm:flex-none"
            >
              <Link href={`/admin/inventory/${item.id}/images`}>Manage Images</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

export function AdminInventoryClient({ initialItems }: { initialItems: InventoryItem[] }) {
  const [items, setItems] = React.useState<InventoryItem[]>(initialItems)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isUpdating, setIsUpdating] = React.useState(false)
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

    if (!nextItem) {
      return
    }

    const inStock = !nextItem.inStock
    const stockCount = inStock ? Math.max(1, nextItem.stockCount) : 0

    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              inStock,
              stockCount,
            }
          : item
      )
    )

    setIsUpdating(true)

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
        setItems((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  inStock: nextItem.inStock,
                  stockCount: nextItem.stockCount,
                }
              : item
          )
        )
      })
      .finally(() => {
        setIsUpdating(false)
      })
  }

  return (
    <main className="px-4 py-8 sm:py-14">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Inventory
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Manage stock, availability, and product images for each listing.
            </p>
          </div>
          <Badge className="w-fit rounded-full px-3 py-1.5 text-sm">Admin</Badge>
        </div>

        {message ? (
          <p className="mt-6 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {message}
          </p>
        ) : null}

        {isLoading ? (
          <Card className="mt-8 border-border/70 bg-card/95 shadow-md ring-1 ring-primary/5">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Loading inventory...
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !items.length ? (
          <Card className="mt-8 border-border/70 bg-card/95 shadow-md ring-1 ring-primary/5">
            <CardContent className="p-6 text-center">
              <p className="text-lg font-semibold text-foreground">No inventory yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Submitted products will appear here after they are saved in Supabase.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && items.length ? (
          <div className="mt-8 grid gap-3">
            {items.map((item) => (
              <InventoryCard
                key={item.id}
                item={item}
                isUpdating={isUpdating}
                onToggleAvailability={toggleAvailability}
              />
            ))}
          </div>
        ) : null}
      </div>
    </main>
  )
}

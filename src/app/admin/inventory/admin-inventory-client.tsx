"use client"

import * as React from "react"
import { LockKeyhole } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  INVENTORY_ITEMS,
  type InventoryItem,
  type SubmissionStatus,
} from "@/lib/marketplace-data"

const ADMIN_ACCESS_KEY = "raithubridge-admin-preview"

const statusTone: Record<SubmissionStatus, string> = {
  "Pending Review": "bg-amber-100 text-amber-900 border-amber-200",
  "On Hold": "bg-blue-100 text-blue-900 border-blue-200",
  Approved: "bg-emerald-100 text-emerald-900 border-emerald-200",
  Rejected: "bg-red-100 text-red-900 border-red-200",
}

export function AdminInventoryClient() {
  const [hasAccess, setHasAccess] = React.useState(false)
  const [accessCode, setAccessCode] = React.useState("")
  const [items, setItems] = React.useState<InventoryItem[]>(INVENTORY_ITEMS)

  React.useEffect(() => {
    let isMounted = true

    queueMicrotask(() => {
      if (isMounted) {
        setHasAccess(window.localStorage.getItem(ADMIN_ACCESS_KEY) === "granted")
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  React.useEffect(() => {
    if (!hasAccess) {
      return
    }

    let isMounted = true

    async function loadInventory() {
      try {
        const response = await fetch("/api/admin/inventory")
        const payload = (await response.json()) as { items?: InventoryItem[] }

        if (isMounted && payload.items?.length) {
          setItems(payload.items)
        }
      } catch {
        // Keep sample inventory when the API is not available.
      }
    }

    void loadInventory()

    return () => {
      isMounted = false
    }
  }, [hasAccess])

  function unlockAdminPreview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (accessCode.trim().toLowerCase() === "admin") {
      window.localStorage.setItem(ADMIN_ACCESS_KEY, "granted")
      setHasAccess(true)
    }
  }

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
      }).catch(() => undefined)
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

  if (!hasAccess) {
    return (
      <main className="px-4 py-14 sm:py-20">
        <div className="mx-auto w-full max-w-xl rounded-2xl border border-border/70 bg-card/95 p-8 text-center shadow-lg ring-1 ring-primary/5">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LockKeyhole className="size-7" aria-hidden />
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight">Admin-only inventory</h1>
          <p className="mt-3 text-base text-muted-foreground">
            Inventory management is restricted to admin accounts. This preview uses an
            admin code while the API enforces database access policies.
          </p>
          <form onSubmit={unlockAdminPreview} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Input
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              placeholder="Enter admin preview code"
              aria-label="Admin preview code"
            />
            <Button type="submit" className="h-11 rounded-xl px-6 text-base font-semibold">
              Unlock
            </Button>
          </form>
          <p className="mt-3 text-sm text-muted-foreground">Preview code: admin</p>
        </div>
      </main>
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
              Admin-only inventory view with stock counts and availability toggles backed by
              the inventory table when Supabase is configured.
            </p>
          </div>
          <Badge className="w-fit rounded-full px-4 py-2 text-sm">Admin access</Badge>
        </div>

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
                      <Badge className={`border px-3 py-1 text-sm ${statusTone[item.status]}`}>
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
      </div>
    </main>
  )
}

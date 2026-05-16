"use client"

import * as React from "react"

const CART_STORAGE_KEY = "raithubridge-cart"
const CART_GUEST_STORAGE_KEY = "raithubridge-cart-guest-id"

export type CartItem = {
  productId: string
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  itemCount: number
  guestId: string
  addItem: (productId: string, quantity?: number) => void
  updateItem: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  syncItems: (items: CartItem[]) => void
}

const CartContext = React.createContext<CartContextValue | null>(null)

function readStoredCart() {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : []

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .filter((item) => typeof item.productId === "string" && typeof item.quantity === "number")
      .map((item) => ({
        productId: item.productId,
        quantity: Math.max(1, Math.min(999, Math.floor(item.quantity))),
      }))
  } catch {
    return []
  }
}

function getStoredGuestId() {
  if (typeof window === "undefined") {
    return "server-preview"
  }

  const existingGuestId = window.localStorage.getItem(CART_GUEST_STORAGE_KEY)
  if (existingGuestId) {
    return existingGuestId
  }

  const guestId = crypto.randomUUID()
  window.localStorage.setItem(CART_GUEST_STORAGE_KEY, guestId)
  return guestId
}

function syncCartItem(guestId: string, productId: string, quantity: number) {
  void fetch("/api/cart/items", {
    body: JSON.stringify({ guestId, productId, quantity }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  }).catch(() => undefined)
}

function updateSyncedCartItem(guestId: string, productId: string, quantity: number) {
  void fetch(`/api/cart/items/${productId}?guestId=${encodeURIComponent(guestId)}`, {
    body: JSON.stringify({ quantity }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
  }).catch(() => undefined)
}

function deleteSyncedCartItem(guestId: string, productId: string) {
  void fetch(`/api/cart/items/${productId}?guestId=${encodeURIComponent(guestId)}`, {
    method: "DELETE",
  }).catch(() => undefined)
}

function clearSyncedCart(guestId: string) {
  void fetch(`/api/cart?guestId=${encodeURIComponent(guestId)}`, {
    method: "DELETE",
  }).catch(() => undefined)
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([])
  const [guestId, setGuestId] = React.useState("server-preview")
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    let isMounted = true

    queueMicrotask(() => {
      if (!isMounted) {
        return
      }

      setItems(readStoredCart())
      setGuestId(getStoredGuestId())
      setIsHydrated(true)
    })

    return () => {
      isMounted = false
    }
  }, [])

  React.useEffect(() => {
    if (!isHydrated) {
      return
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [isHydrated, items])

  const addItem = React.useCallback((productId: string, quantity = 1) => {
    syncCartItem(guestId, productId, quantity)
    setItems((current) => {
      const existing = current.find((item) => item.productId === productId)

      if (existing) {
        return current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(999, item.quantity + quantity) }
            : item
        )
      }

      return [...current, { productId, quantity: Math.max(1, quantity) }]
    })
  }, [guestId])

  const updateItem = React.useCallback((productId: string, quantity: number) => {
    updateSyncedCartItem(guestId, productId, quantity)
    setItems((current) =>
      current
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, Math.min(999, Math.floor(quantity))) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }, [guestId])

  const removeItem = React.useCallback((productId: string) => {
    deleteSyncedCartItem(guestId, productId)
    setItems((current) => current.filter((item) => item.productId !== productId))
  }, [guestId])

  const clearCart = React.useCallback(() => {
    clearSyncedCart(guestId)
    setItems([])
  }, [guestId])

  const syncItems = React.useCallback((serverItems: CartItem[]) => {
    setItems((current) => {
      const merged = new Map(current.map((item) => [item.productId, item.quantity]))

      for (const item of serverItems) {
        merged.set(
          item.productId,
          Math.max(1, Math.min(999, Math.floor(item.quantity)))
        )
      }

      return Array.from(merged, ([productId, quantity]) => ({ productId, quantity }))
    })
  }, [])

  const value = React.useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      guestId,
      addItem,
      updateItem,
      removeItem,
      clearCart,
      syncItems,
    }),
    [addItem, clearCart, guestId, items, removeItem, syncItems, updateItem]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const value = React.useContext(CartContext)

  if (!value) {
    throw new Error("useCart must be used inside CartProvider")
  }

  return value
}

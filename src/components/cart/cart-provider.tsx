"use client"

import * as React from "react"

const CART_STORAGE_KEY = "raithubridge-cart"

export type CartItem = {
  productId: string
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  itemCount: number
  addItem: (productId: string, quantity?: number) => void
  updateItem: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>(() => readStoredCart())

  React.useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = React.useCallback((productId: string, quantity = 1) => {
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
  }, [])

  const updateItem = React.useCallback((productId: string, quantity: number) => {
    setItems((current) =>
      current
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, Math.min(999, Math.floor(quantity))) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }, [])

  const removeItem = React.useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.productId !== productId))
  }, [])

  const clearCart = React.useCallback(() => {
    setItems([])
  }, [])

  const value = React.useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      addItem,
      updateItem,
      removeItem,
      clearCart,
    }),
    [addItem, clearCart, items, removeItem, updateItem]
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

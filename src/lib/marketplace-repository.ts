import { createClient } from "@/lib/supabase/server"
import {
  normalizeAvailabilityStatus,
  normalizeReviewStatus,
  type ProductAvailabilityStatus,
} from "@/lib/domain"
import {
  APPROVED_PRODUCTS,
  INVENTORY_ITEMS,
  type ApprovedProduct,
  type InventoryItem,
  type ProductMediaAsset,
  type SubmissionStatus,
} from "@/lib/marketplace-data"
import { sampleApprovedProducts } from "@/lib/sample-products"
import { shouldUseSampleData } from "@/lib/supabase/env"
import type { Database } from "@/types/database"

type ProductRow = Database["public"]["Tables"]["products"]["Row"]
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"]
type InventoryRow = Database["public"]["Tables"]["inventory"]["Row"]
type MediaRow = Database["public"]["Tables"]["product_media"]["Row"]

function getMarketplaceSellerInfo(value: string | null) {
  if (!value) {
    return "Verified RaithuBridge seller."
  }

  if (/\b(phone|whatsapp|\+?\d[\d\s-]{7,})\b/i.test(value)) {
    return "Seller details are verified by RaithuBridge. Add the item to cart to continue purchase."
  }

  return value
}

function getProductReviewStatus(row: ProductRow): SubmissionStatus {
  return normalizeReviewStatus(row.review_status ?? row.status)
}

function getProductAvailabilityStatus(
  row: ProductRow,
  inventory?: InventoryRow
): ProductAvailabilityStatus {
  if (inventory?.availability_status) {
    return normalizeAvailabilityStatus(inventory.availability_status, {
      quantityAvailable: Number(inventory.stock_count),
    })
  }

  return normalizeAvailabilityStatus(row.availability_status ?? row.status, {
    isActive: row.is_active,
    quantityAvailable: Number(row.quantity_available),
  })
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toString().replace(/\.0+$/, "")
}

function formatPrice(price: number, unit: string) {
  return `Rs. ${price.toLocaleString("en-IN")} / ${unit}`
}

function mapMedia(row: MediaRow): ProductMediaAsset {
  return {
    url: row.url,
    path: row.storage_path ?? row.id,
    type: row.media_type,
    mimeType: row.mime_type ?? "",
    name: row.name,
    size: row.size_bytes,
  }
}

function mapProduct(
  row: ProductRow,
  categoryName: string,
  mediaRows: MediaRow[],
  inventory?: InventoryRow
): ApprovedProduct {
  return {
    id: row.id,
    name: row.name,
    category: categoryName,
    sellerName: row.seller_name,
    sellerLocation: row.seller_location,
    price: formatPrice(Number(row.price), row.unit),
    quantity: formatNumber(Number(row.quantity_available)),
    unit: row.unit,
    unitSize: row.unit_size,
    status: getProductAvailabilityStatus(row, inventory),
    stockCount: Number(inventory?.stock_count ?? row.quantity_available),
    inStock: inventory?.in_stock ?? Number(row.quantity_available) > 0,
    description: row.description,
    deliveryInfo: row.delivery_info ?? "Delivery details will be confirmed during checkout.",
    sellerInfo: getMarketplaceSellerInfo(row.seller_info),
    mediaAssets: mediaRows.map(mapMedia),
  }
}

async function queryProducts(ids?: string[]) {
  const supabase = await createClient()
  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .or("review_status.eq.Approved,status.in.(Approved,approved,available,limited,seasonal)")
    .eq("availability_status", "Active")
    .order("created_at", { ascending: false })

  if (ids?.length) {
    query = query.in("id", ids)
  }

  const { data: products, error } = await query

  if (error || !products?.length) {
    return []
  }

  const productIds = products.map((product) => product.id)
  const categoryIds = products
    .map((product) => product.category_id)
    .filter((id): id is string => Boolean(id))

  const [{ data: categories }, { data: media }, { data: inventory }] = await Promise.all([
    categoryIds.length
      ? supabase.from("categories").select("*").in("id", categoryIds)
      : Promise.resolve({ data: [] as CategoryRow[] }),
    supabase
      .from("product_media")
      .select("*")
      .in("product_id", productIds)
      .order("sort_order", { ascending: true }),
    supabase.from("inventory").select("*").in("product_id", productIds),
  ])

  const categoriesById = new Map((categories ?? []).map((category) => [category.id, category.name]))
  const inventoryByProductId = new Map(
    (inventory ?? []).map((item) => [item.product_id, item])
  )
  const mediaByProductId = new Map<string, MediaRow[]>()

  for (const item of media ?? []) {
    const current = mediaByProductId.get(item.product_id) ?? []
    current.push(item)
    mediaByProductId.set(item.product_id, current)
  }

  return products.map((product) =>
    mapProduct(
      product,
      product.category_id
        ? categoriesById.get(product.category_id) ?? "Farm products"
        : "Farm products",
      mediaByProductId.get(product.id) ?? [],
      inventoryByProductId.get(product.id)
    )
  )
}

export async function getProducts(ids?: string[]) {
  try {
    const products = await queryProducts(ids)
    if (ids?.length) {
      const productsById = new Map(products.map((product) => [product.id, product]))

      for (const product of sampleApprovedProducts) {
        if (ids.includes(product.id) && !productsById.has(product.id)) {
          productsById.set(product.id, product)
        }
      }

      return ids.flatMap((id) => {
        const product = productsById.get(id)
        return product ? [product] : []
      })
    }

    if (products.length || !shouldUseSampleData()) {
      return products
    }
  } catch {
    // Local development can opt into sample fixtures before Supabase is ready.
  }

  if (!shouldUseSampleData()) {
    return []
  }

  const fallbackProducts = [...sampleApprovedProducts, ...APPROVED_PRODUCTS]

  return ids?.length
    ? fallbackProducts.filter((product) => ids.includes(product.id))
    : fallbackProducts
}

export async function getProduct(id: string) {
  const products = await getProducts([id])
  return products[0] ?? null
}

export async function getCategories() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true })

    if (!error && data?.length) {
      return data.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
      }))
    }
  } catch {
    // Fall back only when sample fixtures are explicitly enabled.
  }

  return shouldUseSampleData()
    ? Array.from(new Set([...sampleApprovedProducts, ...APPROVED_PRODUCTS].map((product) => product.category))).map((name) => ({
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: null,
      }))
    : []
}

async function queryInventoryItems() {
  const supabase = await createClient()
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  if (error || !products?.length) {
    return []
  }

  const productIds = products.map((product) => product.id)
  const categoryIds = products
    .map((product) => product.category_id)
    .filter((id): id is string => Boolean(id))

  const [{ data: categories }, { data: inventory }] = await Promise.all([
    categoryIds.length
      ? supabase.from("categories").select("id, name").in("id", categoryIds)
      : Promise.resolve({ data: [] as Pick<CategoryRow, "id" | "name">[] }),
    supabase.from("inventory").select("*").in("product_id", productIds),
  ])

  const categoriesById = new Map((categories ?? []).map((category) => [category.id, category.name]))
  const inventoryByProductId = new Map(
    (inventory ?? []).map((item) => [item.product_id, item])
  )

  return products.map<InventoryItem>((product) => {
    const inventoryItem = inventoryByProductId.get(product.id)
    const stockCount = Number(inventoryItem?.stock_count ?? product.quantity_available)

    return {
      id: product.id,
      productName: product.name,
      sellerName: product.seller_name,
      category: product.category_id
        ? categoriesById.get(product.category_id) ?? "Farm products"
        : "Farm products",
      quantity: formatNumber(Number(product.quantity_available)),
      unit: product.unit,
      price: formatPrice(Number(product.price), product.unit),
      status: getProductReviewStatus(product),
      location: product.seller_location,
      stockCount,
      inStock: inventoryItem?.in_stock ?? stockCount > 0,
    }
  })
}

export async function getInventory(options: { fallbackToSamples?: boolean } = {}) {
  const { fallbackToSamples = shouldUseSampleData() } = options

  try {
    const items = await queryInventoryItems()

    if (items.length || !fallbackToSamples) {
      return items
    }
  } catch {
    // Fall back below.
  }

  return fallbackToSamples ? INVENTORY_ITEMS : []
}

export async function getOrCreateCart(input: { userId?: string }) {
  const supabase = await createClient()

  if (!input.userId) {
    throw new Error("Sign in to use your cart.")
  }

  const identity = { user_id: input.userId }

  const { data: existingCart } = await supabase
    .from("carts")
    .select("*")
    .match(identity)
    .eq("status", "active")
    .maybeSingle()

  if (existingCart) {
    return existingCart
  }

  const { data: createdCart, error } = await supabase
    .from("carts")
    .insert(identity)
    .select("*")
    .single()

  if (error || !createdCart) {
    throw new Error(error?.message ?? "Unable to create cart.")
  }

  return createdCart
}

export async function updateInventoryAvailability(input: {
  productId: string
  inStock: boolean
  stockCount: number
}) {
  const supabase = await createClient()
  const availabilityStatus = input.inStock && input.stockCount > 0 ? "Active" : "Sold Out"
  const { error } = await supabase
    .from("inventory")
    .upsert({
      availability_status: availabilityStatus,
      in_stock: input.inStock,
      product_id: input.productId,
      stock_count: input.stockCount,
      updated_at: new Date().toISOString(),
    }, { onConflict: "product_id" })

  if (error) {
    throw new Error(error.message)
  }

  const { error: productError } = await supabase
    .from("products")
    .update({
      availability_status: availabilityStatus,
      is_active: availabilityStatus === "Active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.productId)

  if (productError) {
    throw new Error(productError.message)
  }
}

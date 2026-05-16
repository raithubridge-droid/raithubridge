import { createClient } from "@/lib/supabase/server"
import {
  APPROVED_PRODUCTS,
  INVENTORY_ITEMS,
  type ApprovedProduct,
  type InventoryItem,
  type ProductMediaAsset,
  type SubmissionStatus,
} from "@/lib/marketplace-data"
import type { Database } from "@/types/database"

type ProductRow = Database["public"]["Tables"]["products"]["Row"]
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"]
type InventoryRow = Database["public"]["Tables"]["inventory"]["Row"]
type MediaRow = Database["public"]["Tables"]["product_media"]["Row"]

const productStatusLabel: Record<ProductRow["status"], ApprovedProduct["status"]> = {
  "Approved": "Available",
  "On Hold": "Limited",
  "Pending": "Limited",
  "Pending Review": "Limited",
  "Rejected": "Limited",
  archived: "Limited",
  approved: "Available",
  available: "Available",
  draft: "Limited",
  limited: "Limited",
  on_hold: "Limited",
  pending: "Limited",
  rejected: "Limited",
  seasonal: "Seasonal",
}

const submissionStatusLabel: Record<ProductRow["status"], SubmissionStatus> = {
  Approved: "Approved",
  "On Hold": "On Hold",
  Pending: "Pending Review",
  "Pending Review": "Pending Review",
  Rejected: "Rejected",
  approved: "Approved",
  available: "Approved",
  limited: "Approved",
  on_hold: "On Hold",
  pending: "Pending Review",
  rejected: "Rejected",
  seasonal: "Approved",
  archived: "Rejected",
  draft: "Pending Review",
}

function getMarketplaceSellerInfo(value: string | null) {
  if (!value) {
    return "Verified RaithuBridge seller."
  }

  if (/\b(phone|whatsapp|\+?\d[\d\s-]{7,})\b/i.test(value)) {
    return "Seller details are verified by RaithuBridge. Add the item to cart to continue purchase."
  }

  return value
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
    status: productStatusLabel[row.status],
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
    .in("status", ["Approved", "approved", "available", "limited", "seasonal"])
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
    if (products.length) {
      return products
    }
  } catch {
    // Local development can run before Supabase env vars or schema are ready.
  }

  return ids?.length
    ? APPROVED_PRODUCTS.filter((product) => ids.includes(product.id))
    : APPROVED_PRODUCTS
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
    // Fall back to categories derived from sample products.
  }

  return Array.from(new Set(APPROVED_PRODUCTS.map((product) => product.category))).map((name) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: null,
  }))
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
      status: submissionStatusLabel[product.status],
      location: product.seller_location,
      stockCount,
      inStock: inventoryItem?.in_stock ?? stockCount > 0,
    }
  })
}

export async function getInventory(options: { fallbackToSamples?: boolean } = {}) {
  const { fallbackToSamples = true } = options

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

export async function getOrCreateCart(input: { guestId?: string; userId?: string }) {
  const supabase = await createClient()
  const identity: { user_id?: string; guest_id?: string } = input.userId
    ? { user_id: input.userId }
    : { guest_id: input.guestId }

  if (!identity.user_id && !identity.guest_id) {
    throw new Error("Cart requires a user id or guest id.")
  }

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
  const { error } = await supabase
    .from("inventory")
    .upsert({
      availability_status: input.inStock ? "in_stock" : "out_of_stock",
      in_stock: input.inStock,
      product_id: input.productId,
      stock_count: input.stockCount,
      updated_at: new Date().toISOString(),
    }, { onConflict: "product_id" })

  if (error) {
    throw new Error(error.message)
  }
}

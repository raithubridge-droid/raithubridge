import type { PendingSubmission, ProductMediaAsset } from "@/lib/marketplace-data"
import { normalizeReviewStatus } from "@/lib/domain"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database"

type ProductRow = Database["public"]["Tables"]["products"]["Row"]
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"]
type MediaRow = Database["public"]["Tables"]["product_media"]["Row"]

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
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

function mapProductToSubmission(
  product: ProductRow,
  categoryName: string,
  mediaRows: MediaRow[]
): PendingSubmission {
  return {
    adminComment: product.admin_comment ?? "No admin comments yet.",
    category: categoryName,
    description: product.description,
    sellerDistrict: product.seller_district ?? "",
    id: product.id,
    sellerPhone: product.seller_phone ?? "",
    price: formatPrice(Number(product.price), product.unit),
    productName: product.name,
    quantityAvailable: formatNumber(Number(product.quantity_available)),
    sellerName: product.seller_name,
    sellerState: product.seller_state ?? "",
    status: normalizeReviewStatus(product.review_status ?? product.status),
    submittedAt: formatDate(product.created_at),
    unit: product.unit,
    sellerVillageCity: product.seller_village_city ?? product.seller_location,
    sellerWhatsapp: product.seller_whatsapp ?? "",
    mediaAssets: mediaRows.map(mapMedia),
  }
}

async function getCategoryNames(categoryIds: string[]) {
  if (!categoryIds.length) {
    return new Map<string, string>()
  }

  const supabase = await createClient()
  const { data } = await supabase.from("categories").select("id, name").in("id", categoryIds)
  const rows = (data ?? []) as Pick<CategoryRow, "id" | "name">[]

  return new Map(rows.map((row) => [row.id, row.name]))
}

async function getMediaByProductId(productIds: string[]) {
  if (!productIds.length) {
    return new Map<string, MediaRow[]>()
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from("product_media")
    .select("*")
    .in("product_id", productIds)
    .order("sort_order", { ascending: true })

  const mediaByProductId = new Map<string, MediaRow[]>()

  for (const item of data ?? []) {
    const current = mediaByProductId.get(item.product_id) ?? []
    current.push(item)
    mediaByProductId.set(item.product_id, current)
  }

  return mediaByProductId
}

export async function getCurrentUserSubmissions() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const products = data ?? []
  const categories = await getCategoryNames(
    products
      .map((product) => product.category_id)
      .filter((id): id is string => Boolean(id))
  )
  const mediaByProductId = await getMediaByProductId(products.map((product) => product.id))

  return products.map((product) =>
    mapProductToSubmission(
      product,
      product.category_id
        ? categories.get(product.category_id) ?? "Farm products"
        : "Farm products",
      mediaByProductId.get(product.id) ?? []
    )
  )
}

export async function getAdminSubmissions() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const products = data ?? []
  const categories = await getCategoryNames(
    products
      .map((product) => product.category_id)
      .filter((id): id is string => Boolean(id))
  )
  const mediaByProductId = await getMediaByProductId(products.map((product) => product.id))

  return products.map((product) =>
    mapProductToSubmission(
      product,
      product.category_id
        ? categories.get(product.category_id) ?? "Farm products"
        : "Farm products",
      mediaByProductId.get(product.id) ?? []
    )
  )
}

export async function getAdminSubmissionById(productId: string) {
  const supabase = await createClient()
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!product) {
    return null
  }

  const categories = await getCategoryNames(
    product.category_id ? [product.category_id] : []
  )
  const mediaByProductId = await getMediaByProductId([product.id])

  return mapProductToSubmission(
    product,
    product.category_id
      ? categories.get(product.category_id) ?? "Farm products"
      : "Farm products",
    mediaByProductId.get(product.id) ?? []
  )
}

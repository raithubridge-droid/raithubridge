import type { PendingSubmission, SubmissionStatus } from "@/lib/marketplace-data"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database"

type ProductRow = Database["public"]["Tables"]["products"]["Row"]
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"]

const statusMap: Record<string, SubmissionStatus> = {
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
}

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

function mapProductToSubmission(
  product: ProductRow,
  categoryName: string
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
    status: statusMap[product.status] ?? "Pending Review",
    submittedAt: formatDate(product.created_at),
    unit: product.unit,
    sellerVillageCity: product.seller_village_city ?? product.seller_location,
    sellerWhatsapp: product.seller_whatsapp ?? "",
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

  return products.map((product) =>
    mapProductToSubmission(
      product,
      product.category_id
        ? categories.get(product.category_id) ?? "Farm products"
        : "Farm products"
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

  return products.map((product) =>
    mapProductToSubmission(
      product,
      product.category_id
        ? categories.get(product.category_id) ?? "Farm products"
        : "Farm products"
    )
  )
}

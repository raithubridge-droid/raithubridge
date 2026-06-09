import { NextResponse, type NextRequest } from "next/server"

import { resolveAdminCommentForSave } from "@/lib/admin-comments"
import {
  canAdminApproveOrReject,
  getAdminReviewUpdate,
  getReviewActionMessage,
  normalizeReviewStatus,
  PRODUCT_REVIEW_STATUSES,
  type ProductReviewStatus,
} from "@/lib/domain"
import { ensureInventoryForApprovedProduct } from "@/lib/marketplace-repository"
import {
  approveAllPendingFarmerMediaForProduct,
  unpublishAllMediaForProduct,
} from "@/lib/product-media"
import { createClient } from "@/lib/supabase/server"

type AdminSubmissionRouteContext = {
  params: Promise<{
    productId: string
  }>
}

const allowedStatuses = new Set<ProductReviewStatus>(PRODUCT_REVIEW_STATUSES)

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: "Sign in as admin first." }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Admin access is required." }, { status: 403 }) }
  }

  return { supabase }
}

type AdminProductEditBody = {
  categoryId?: string | null
  description?: string
  name?: string
  price?: number
  quantityAvailable?: number
  sellerDistrict?: string
  sellerName?: string
  sellerPhone?: string
  sellerState?: string
  sellerVillageCity?: string
  sellerWhatsapp?: string
  unit?: string
}

function parseEditBody(body: AdminProductEditBody) {
  const name = typeof body.name === "string" ? body.name.trim() : ""
  const description = typeof body.description === "string" ? body.description.trim() : ""
  const unit = typeof body.unit === "string" ? body.unit.trim() : ""
  const sellerName = typeof body.sellerName === "string" ? body.sellerName.trim() : ""
  const sellerPhone =
    typeof body.sellerPhone === "string" ? body.sellerPhone.trim() : undefined
  const sellerWhatsapp =
    typeof body.sellerWhatsapp === "string" ? body.sellerWhatsapp.trim() : undefined
  const sellerVillageCity =
    typeof body.sellerVillageCity === "string" ? body.sellerVillageCity.trim() : ""
  const sellerDistrict =
    typeof body.sellerDistrict === "string" ? body.sellerDistrict.trim() : ""
  const sellerState = typeof body.sellerState === "string" ? body.sellerState.trim() : ""
  const categoryId =
    body.categoryId === null || typeof body.categoryId === "string" ? body.categoryId : undefined
  const price = typeof body.price === "number" ? body.price : Number.NaN
  const quantityAvailable =
    typeof body.quantityAvailable === "number" ? body.quantityAvailable : Number.NaN

  if (!name) {
    return { ok: false as const, error: "Product name is required." }
  }

  if (!description) {
    return { ok: false as const, error: "Description is required." }
  }

  if (!unit) {
    return { ok: false as const, error: "Unit is required." }
  }

  if (!sellerName) {
    return { ok: false as const, error: "Farmer name is required." }
  }

  if (!sellerVillageCity || !sellerDistrict || !sellerState) {
    return { ok: false as const, error: "Complete location details are required." }
  }

  if (!Number.isFinite(price) || price <= 0) {
    return { ok: false as const, error: "Enter a valid price." }
  }

  if (!Number.isFinite(quantityAvailable) || quantityAvailable <= 0) {
    return { ok: false as const, error: "Enter a valid quantity." }
  }

  return {
    ok: true as const,
    values: {
      category_id: categoryId ?? null,
      description,
      name,
      price,
      quantity_available: quantityAvailable,
      seller_district: sellerDistrict,
      seller_location: [sellerVillageCity, sellerDistrict, sellerState].filter(Boolean).join(", "),
      seller_name: sellerName,
      seller_phone: sellerPhone || null,
      seller_state: sellerState,
      seller_village_city: sellerVillageCity,
      seller_whatsapp: sellerWhatsapp || null,
      unit,
    },
  }
}

export async function PUT(request: NextRequest, { params }: AdminSubmissionRouteContext) {
  const { productId } = await params
  const body = (await request.json().catch(() => ({}))) as AdminProductEditBody
  const parsed = parseEditBody(body)

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const auth = await requireAdmin()
  if ("error" in auth && auth.error) {
    return auth.error
  }

  try {
    const { data, error } = await auth.supabase
      .from("products")
      .update(parsed.values)
      .eq("id", productId)
      .select("id")
      .single()

    if (error || !data) {
      throw new Error(error?.message ?? "Unable to update product.")
    }

    return NextResponse.json({ product: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update product." },
      { status: 400 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: AdminSubmissionRouteContext) {
  const { productId } = await params
  const body = (await request.json().catch(() => ({}))) as {
    adminComment?: string
    status?: ProductReviewStatus
  }

  if (!body.status || !allowedStatuses.has(body.status)) {
    return NextResponse.json({ error: "Choose a valid review status." }, { status: 400 })
  }

  const resolvedComment = resolveAdminCommentForSave(
    body.status,
    typeof body.adminComment === "string" ? body.adminComment : ""
  )

  if (!resolvedComment.ok) {
    return NextResponse.json({ error: resolvedComment.error }, { status: 400 })
  }

  const auth = await requireAdmin()
  if ("error" in auth && auth.error) {
    return auth.error
  }

  try {
    const { data: existingProduct, error: existingError } = await auth.supabase
      .from("products")
      .select("id, review_status")
      .eq("id", productId)
      .maybeSingle()

    if (existingError) {
      throw new Error(existingError.message)
    }

    if (!existingProduct) {
      return NextResponse.json({ error: "Product submission not found." }, { status: 404 })
    }

    const currentStatus = normalizeReviewStatus(existingProduct.review_status)

    if (
      (body.status === "Approved" || body.status === "Rejected") &&
      !canAdminApproveOrReject(currentStatus)
    ) {
      return NextResponse.json(
        { error: "Only pending or on-hold submissions can be approved or rejected." },
        { status: 400 }
      )
    }

    const { data, error } = await auth.supabase
      .from("products")
      .update({
        ...getAdminReviewUpdate(body.status),
        ...(resolvedComment.comment != null
          ? { admin_comment: resolvedComment.comment }
          : {}),
      })
      .eq("id", productId)
      .select("id, status, review_status, availability_status, admin_comment, is_active")
      .single()

    if (error || !data) {
      throw new Error(error?.message ?? "Unable to update submission.")
    }

    if (body.status === "Approved") {
      await approveAllPendingFarmerMediaForProduct(auth.supabase, productId)
      await ensureInventoryForApprovedProduct(auth.supabase, productId)
    } else {
      await unpublishAllMediaForProduct(auth.supabase, productId)
    }

    return NextResponse.json({
      product: data,
      message: getReviewActionMessage(body.status),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update submission." },
      { status: 400 }
    )
  }
}

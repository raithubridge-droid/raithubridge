import { NextResponse, type NextRequest } from "next/server"

import {
  getAdminReviewUpdate,
  PRODUCT_REVIEW_STATUSES,
  type ProductReviewStatus,
} from "@/lib/domain"
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

export async function PATCH(request: NextRequest, { params }: AdminSubmissionRouteContext) {
  const { productId } = await params
  const body = (await request.json().catch(() => ({}))) as {
    adminComment?: string
    status?: ProductReviewStatus
  }

  if (!body.status || !allowedStatuses.has(body.status)) {
    return NextResponse.json({ error: "Choose a valid review status." }, { status: 400 })
  }

  const auth = await requireAdmin()
  if ("error" in auth && auth.error) {
    return auth.error
  }

  try {
    const { data, error } = await auth.supabase
      .from("products")
      .update(getAdminReviewUpdate(body.status, body.adminComment ?? ""))
      .eq("id", productId)
      .select("id, status, review_status, availability_status, admin_comment, is_active")
      .single()

    if (error || !data) {
      throw new Error(error?.message ?? "Unable to update submission.")
    }

    return NextResponse.json({ product: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update submission." },
      { status: 400 }
    )
  }
}

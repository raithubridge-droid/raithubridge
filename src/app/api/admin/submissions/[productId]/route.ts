import { NextResponse, type NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"
import {
  PRODUCT_REVIEW_STATUSES,
  type ProductReviewStatus,
} from "@/lib/domain"

type AdminSubmissionRouteContext = {
  params: Promise<{
    productId: string
  }>
}

const allowedStatuses = new Set<ProductReviewStatus>(PRODUCT_REVIEW_STATUSES)

export async function PATCH(request: NextRequest, { params }: AdminSubmissionRouteContext) {
  const { productId } = await params
  const body = (await request.json().catch(() => ({}))) as {
    adminComment?: string
    status?: ProductReviewStatus
  }

  if (!body.status || !allowedStatuses.has(body.status)) {
    return NextResponse.json({ error: "Choose a valid status." }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Sign in as admin first." }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access is required." }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("products")
      .update({
        admin_comment: body.adminComment ?? "",
        review_status: body.status,
        availability_status: body.status === "Approved" ? "Active" : "Inactive",
        status: body.status,
      })
      .eq("id", productId)
      .select("id, status, review_status, availability_status, admin_comment")
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

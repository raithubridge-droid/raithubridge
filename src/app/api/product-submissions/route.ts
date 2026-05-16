import { NextResponse, type NextRequest } from "next/server"

import { SUPABASE_ENV_MESSAGE, hasSupabaseEnv } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"

function parseNumber(value: string) {
  const match = value.match(/\d[\d,]*(?:\.\d+)?/)
  return match ? Number(match[0].replace(/,/g, "")) : Number.NaN
}

function requiredString(body: Record<string, unknown>, key: string) {
  const value = body[key]

  return typeof value === "string" ? value.trim() : ""
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: SUPABASE_ENV_MESSAGE }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json(
      { error: "Sign in before submitting a product." },
      { status: 401 }
    )
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const sellerName = requiredString(body, "sellerName")
  const sellerPhone = requiredString(body, "sellerPhone")
  const sellerWhatsapp = requiredString(body, "sellerWhatsapp")
  const sellerVillageCity = requiredString(body, "sellerVillageCity")
  const sellerDistrict = requiredString(body, "sellerDistrict")
  const sellerState = requiredString(body, "sellerState")
  const productName = requiredString(body, "productName")
  const categoryId = requiredString(body, "categoryId")
  const quantityText = requiredString(body, "quantity")
  const unit = requiredString(body, "unit")
  const priceText = requiredString(body, "price")
  const description = requiredString(body, "description")

  if (
    !sellerName ||
    !sellerPhone ||
    !sellerWhatsapp ||
    !sellerVillageCity ||
    !sellerDistrict ||
    !sellerState ||
    !productName ||
    !categoryId ||
    !quantityText ||
    !unit ||
    !priceText ||
    !description
  ) {
    return NextResponse.json({ error: "Fill all required product fields." }, { status: 400 })
  }

  const quantity = parseNumber(quantityText)
  const price = parseNumber(priceText)

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return NextResponse.json({ error: "Enter a valid quantity." }, { status: 400 })
  }

  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "Enter a valid price." }, { status: 400 })
  }

  try {
    const { data: existingCategory } = await supabase
      .from("categories")
      .select("id, name")
      .eq("id", categoryId)
      .maybeSingle()

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Choose a valid category from the list." },
        { status: 400 }
      )
    }

    const productSlug = `${productName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")}-${Date.now().toString(36)}`
    const sellerLocation = [sellerVillageCity, sellerDistrict, sellerState].filter(Boolean).join(", ")
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        category_id: existingCategory.id,
        description,
        delivery_info: "Seller will confirm pickup or delivery details after admin review.",
        is_active: true,
        name: productName,
        price,
        quantity_available: quantity,
        seller_id: user.id,
        seller_info: "Seller contact details are available to admins for review.",
        seller_location: sellerLocation,
        seller_name: sellerName,
        seller_phone: sellerPhone,
        seller_whatsapp: sellerWhatsapp,
        slug: productSlug,
        status: "Pending Review",
        unit,
        unit_size: unit,
        seller_village_city: sellerVillageCity,
        seller_district: sellerDistrict,
        seller_state: sellerState,
      })
      .select("id, status")
      .single()

    if (productError || !product) {
      throw new Error(productError?.message ?? "Unable to save product submission.")
    }

    return NextResponse.json({
      product,
      message: "Product submitted for review.",
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to submit product." },
      { status: 400 }
    )
  }
}

import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { AdminInventoryImagesClient } from "@/components/admin-inventory-images-client"
import { getProductWithMedia } from "@/lib/admin-product-media-server"
import { getCurrentProfile } from "@/lib/auth/roles"
import { createClient } from "@/lib/supabase/server"

type AdminInventoryImagesPageProps = {
  params: Promise<{
    id: string
  }>
}

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: AdminInventoryImagesPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const product = await getProductWithMedia(supabase, id).catch(() => null)

  return {
    title: product ? `Images · ${product.name}` : "Manage Images",
    description: "Manage product images for inventory listings.",
  }
}

export default async function AdminInventoryImagesPage({ params }: AdminInventoryImagesPageProps) {
  const { id } = await params
  const { user, profile } = await getCurrentProfile()

  if (!user) {
    redirect(`/sign-in?next=${encodeURIComponent(`/admin/inventory/${id}/images`)}`)
  }

  if (profile?.role !== "admin") {
    redirect("/unauthorized")
  }

  const supabase = await createClient()
  const product = await getProductWithMedia(supabase, id)

  if (!product) {
    notFound()
  }

  return <AdminInventoryImagesClient productId={id} initialProduct={product} />
}

import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AdminInventoryImagesClient } from "@/components/admin-inventory-images-client"
import { AdminAccessFallback } from "@/components/auth/admin-access-fallback"
import { getProductWithMedia } from "@/lib/admin-product-media-server"
import { getAdminPageAccess, isAdminProfile } from "@/lib/auth/admin-guard"
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
  const { profile } = await getCurrentProfile()

  if (!isAdminProfile(profile)) {
    return {
      title: "Manage Images",
      description: "Manage product images for inventory listings.",
    }
  }

  const supabase = await createClient()
  const product = await getProductWithMedia(supabase, id).catch(() => null)

  return {
    title: product ? `Images · ${product.name}` : "Manage Images",
    description: "Manage product images for inventory listings.",
  }
}

export default async function AdminInventoryImagesPage({ params }: AdminInventoryImagesPageProps) {
  const { id } = await params
  const access = await getAdminPageAccess()

  if (access.kind !== "ok") {
    return (
      <AdminAccessFallback
        access={access}
        nextPath={`/admin/inventory/${id}/images`}
        title="Manage Images"
      />
    )
  }

  const supabase = await createClient()
  const product = await getProductWithMedia(supabase, id)

  if (!product) {
    notFound()
  }

  return <AdminInventoryImagesClient productId={id} initialProduct={product} />
}

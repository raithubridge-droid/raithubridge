"use client"

import * as React from "react"

import { getCategoryPlaceholder, getDisplayImageUrl } from "@/lib/product-media"
import type { ProductMediaAsset } from "@/lib/marketplace-data"
import { cn } from "@/lib/utils"

type ProductImageProps = {
  category: string
  mediaAssets?: ProductMediaAsset[]
  alt: string
  className?: string
  imageClassName?: string
  includePendingForOwner?: boolean
  includeFarmerUploads?: boolean
  includeManageableImages?: boolean
}

function CategoryPlaceholderVisual({
  category,
  className,
}: {
  category: string
  className?: string
}) {
  const placeholder = getCategoryPlaceholder(category)

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center",
        placeholder.className,
        className
      )}
    >
      <span className="text-4xl sm:text-5xl" aria-hidden>
        {placeholder.emoji}
      </span>
      <span className="text-xs font-semibold sm:text-sm">{placeholder.label}</span>
    </div>
  )
}

export function ProductImage({
  category,
  mediaAssets = [],
  alt,
  className = "h-40",
  imageClassName,
  includePendingForOwner,
  includeFarmerUploads,
  includeManageableImages,
}: ProductImageProps) {
  const imageUrl = getDisplayImageUrl(mediaAssets, category, {
    includePendingForOwner,
    includeFarmerUploads,
    includeManageableImages,
  })
  const [imageError, setImageError] = React.useState(false)
  const showPlaceholder = !imageUrl || imageError

  return (
    <div className={cn("relative overflow-hidden bg-muted/80", className)}>
      {imageUrl && !showPlaceholder ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={imageUrl}
          src={imageUrl}
          alt={alt}
          className={cn("h-full w-full object-cover", imageClassName)}
          onError={() => setImageError(true)}
        />
      ) : (
        <CategoryPlaceholderVisual category={category} />
      )}
    </div>
  )
}

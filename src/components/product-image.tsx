"use client"

import * as React from "react"

import {
  getCategoryPlaceholderImageUrl,
  getDisplayImageUrl,
  resolveProductImageSrc,
} from "@/lib/product-media"
import type { ProductMediaAsset } from "@/lib/marketplace-data"
import { cn } from "@/lib/utils"

type ProductImageProps = {
  category: string
  mediaAssets?: ProductMediaAsset[]
  alt: string
  className?: string
  imageClassName?: string
  imageUrl?: string | null
  includePendingForOwner?: boolean
  includeFarmerUploads?: boolean
  includeManageableImages?: boolean
}

type SafeProductPhotoProps = {
  category: string
  alt: string
  className?: string
  imageClassName?: string
  src?: string | null
}

export function SafeProductPhoto({
  category,
  alt,
  className = "h-40",
  imageClassName,
  src,
}: SafeProductPhotoProps) {
  const placeholderUrl = getCategoryPlaceholderImageUrl(category)
  const initialSrc = resolveProductImageSrc(category, src)
  const [currentSrc, setCurrentSrc] = React.useState(initialSrc)

  React.useEffect(() => {
    setCurrentSrc(resolveProductImageSrc(category, src))
  }, [category, placeholderUrl, src])

  return (
    <div className={cn("relative overflow-hidden bg-muted/80", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentSrc}
        alt={alt}
        className={cn("h-full w-full object-cover", imageClassName)}
        onError={() => {
          if (currentSrc !== placeholderUrl) {
            setCurrentSrc(placeholderUrl)
          }
        }}
      />
    </div>
  )
}

export function ProductImage({
  category,
  mediaAssets = [],
  alt,
  className = "h-40",
  imageClassName,
  imageUrl,
  includePendingForOwner,
  includeFarmerUploads,
  includeManageableImages,
}: ProductImageProps) {
  const resolvedMediaUrl =
    imageUrl ??
    getDisplayImageUrl(mediaAssets, category, {
      includePendingForOwner,
      includeFarmerUploads,
      includeManageableImages,
    })

  return (
    <SafeProductPhoto
      category={category}
      alt={alt}
      className={className}
      imageClassName={imageClassName}
      src={resolvedMediaUrl}
    />
  )
}

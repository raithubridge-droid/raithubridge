/* eslint-disable @next/next/no-img-element */
"use client"

import * as React from "react"

type HomeProductImageProps = {
  src: string
  fallbackSrc: string
  alt: string
  className?: string
}

export function HomeProductImage({
  src,
  fallbackSrc,
  alt,
  className,
}: HomeProductImageProps) {
  const [imageSrc, setImageSrc] = React.useState(src)

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (imageSrc !== fallbackSrc) {
          setImageSrc(fallbackSrc)
        }
      }}
    />
  )
}

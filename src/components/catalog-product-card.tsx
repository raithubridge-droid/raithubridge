/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { MapPin, PackageCheck, UserRound } from "lucide-react"

import { AddToCartButton } from "@/components/cart/add-to-cart-button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type CatalogProductCardProps = {
  id: string
  name: string
  category: string
  sellerName: string
  sellerLocation: string
  price: string
  quantity: string
  unit: string
  status: string
  mediaUrl?: string
}

export function CatalogProductCard({
  id,
  name,
  category,
  sellerName,
  sellerLocation,
  price,
  quantity,
  unit,
  status,
  mediaUrl,
}: CatalogProductCardProps) {
  return (
    <Card className="flex h-full overflow-hidden border-border/70 bg-card/95 shadow-md ring-1 ring-primary/5 transition-[box-shadow,transform] hover:-translate-y-1 hover:shadow-xl">
      <div className="flex h-full w-full flex-col">
        <div className="h-2 bg-gradient-to-r from-primary via-lime-500 to-amber-400" />
        <Link
          href={`/products/${id}`}
          className="mx-4 mt-4 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-muted"
        >
          {mediaUrl ? (
            <img src={mediaUrl} alt={name} className="h-full w-full object-cover transition-transform hover:scale-105" />
          ) : (
            <span className="px-4 text-center text-sm font-semibold text-muted-foreground">
              Product media
            </span>
          )}
        </Link>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CardTitle className="text-2xl leading-snug">
              <Link href={`/products/${id}`} className="hover:text-primary">
                {name}
              </Link>
            </CardTitle>
            <Badge
              variant="secondary"
              className="h-auto min-h-8 shrink-0 border border-primary/10 bg-amber-50/90 px-3 py-1 text-sm font-semibold text-foreground"
            >
              {category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-5 pt-0">
          <div className="rounded-xl bg-muted/55 p-4">
            <p className="text-2xl font-bold tracking-tight text-foreground">{price}</p>
            <p className="mt-1 flex items-center gap-2 text-base text-muted-foreground">
              <PackageCheck className="size-5 text-primary" aria-hidden />
              {quantity} {unit} available
            </p>
          </div>
          <div className="space-y-3 text-base text-muted-foreground">
            <p className="flex items-center gap-2.5">
              <UserRound className="size-5 shrink-0 text-primary/80" aria-hidden />
              <span>{sellerName}</span>
            </p>
            <p className="flex items-start gap-2.5 leading-relaxed">
              <MapPin className="mt-0.5 size-5 shrink-0 text-primary/80" aria-hidden />
              <span>{sellerLocation}</span>
            </p>
          </div>
          <Badge className="w-fit rounded-full px-3 py-1 text-sm">{status}</Badge>
        </CardContent>
        <CardFooter className="border-t border-border/60 pt-5">
          <AddToCartButton productId={id} className="w-full rounded-xl font-semibold" />
        </CardFooter>
      </div>
    </Card>
  )
}

import Link from "next/link"
import { MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type DiscoveryProductCardProps = {
  name: string
  category: string
  priceNote: string
  locationLine: string
}

export function DiscoveryProductCard({
  name,
  category,
  priceNote,
  locationLine,
}: DiscoveryProductCardProps) {
  return (
    <Card className="flex h-full flex-col border-border/70 bg-card/95 shadow-md ring-1 ring-primary/5 transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader className="pb-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle className="text-xl leading-snug sm:text-[1.35rem]">{name}</CardTitle>
          <Badge
            variant="secondary"
            className="h-auto min-h-8 shrink-0 border border-primary/10 bg-amber-50/80 px-3 py-1 text-sm font-medium text-foreground dark:bg-amber-950/40 dark:text-amber-50"
          >
            {category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 pt-0">
        <p className="text-base font-semibold text-primary">{priceNote}</p>
        <p className="flex items-start gap-2.5 text-base leading-relaxed text-muted-foreground">
          <MapPin className="mt-0.5 size-5 shrink-0 text-primary/75" aria-hidden />
          <span>{locationLine}</span>
        </p>
      </CardContent>
      <CardFooter className="border-t border-border/60 pt-5">
        <Button asChild size="lg" className="w-full rounded-xl font-semibold">
          <Link href="/products">View Products</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

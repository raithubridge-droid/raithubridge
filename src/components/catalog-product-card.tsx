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

type CatalogProductCardProps = {
  name: string
  category: string
  farmerLocation: string
  price: string
  quantity: string
}

function inquiryHref(subject: string) {
  return `mailto:hello@raithubridge.com?subject=${encodeURIComponent(subject)}`
}

export function CatalogProductCard({
  name,
  category,
  farmerLocation,
  price,
  quantity,
}: CatalogProductCardProps) {
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
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-base">
          <span className="text-lg font-bold tracking-tight text-foreground">{price}</span>
          <span className="text-muted-foreground">{quantity}</span>
        </div>
        <p className="flex items-start gap-2.5 text-base leading-relaxed text-muted-foreground">
          <MapPin className="mt-0.5 size-5 shrink-0 text-primary/75" aria-hidden />
          <span>{farmerLocation}</span>
        </p>
      </CardContent>
      <CardFooter className="border-t border-border/60 pt-5">
        <Button asChild size="lg" className="w-full rounded-xl font-semibold">
          <a href={inquiryHref(`Inquiry: ${name}`)}>Send Inquiry</a>
        </Button>
      </CardFooter>
    </Card>
  )
}

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

function inquiryHref(subject: string) {
  return `mailto:hello@raithubridge.com?subject=${encodeURIComponent(subject)}`
}

export function DiscoveryProductCard({
  name,
  category,
  priceNote,
  locationLine,
}: DiscoveryProductCardProps) {
  const subject = `Inquiry: ${name}`
  return (
    <Card className="flex h-full flex-col border-border/80 bg-card/95 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug sm:text-lg">{name}</CardTitle>
          <Badge variant="secondary" className="shrink-0 font-normal">
            {category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 pt-0">
        <p className="text-sm font-medium text-primary">{priceNote}</p>
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0 text-primary/70" aria-hidden />
          <span>{locationLine}</span>
        </p>
      </CardContent>
      <CardFooter className="border-t border-border/60 pt-4">
        <Button asChild className="w-full rounded-lg" variant="default">
          <a href={inquiryHref(subject)}>Send Inquiry</a>
        </Button>
      </CardFooter>
    </Card>
  )
}

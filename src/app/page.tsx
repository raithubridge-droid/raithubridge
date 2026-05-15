import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  Leaf,
  PackageSearch,
  Sprout,
  Truck,
} from "lucide-react"

import { CatalogProductCard } from "@/components/catalog-product-card"
import { DiscoveryProductCard } from "@/components/discovery-product-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  APPROVED_PRODUCTS,
  DISCOVERY_LISTINGS,
  PRICE_VARIES_NOTE,
} from "@/lib/marketplace-data"

const bulkSteps = [
  {
    title: "Discover listings",
    description:
      "Filter by category and region. Every card shows farmer location and indicative pricing.",
    icon: PackageSearch,
  },
  {
    title: "Send an inquiry",
    description:
      "Share quantity, delivery window, and specs. Farmers respond with availability and quotes.",
    icon: Sprout,
  },
  {
    title: "Confirm bulk terms",
    description:
      "Align on grade, packing, and logistics. RaithuBridge keeps communication structured.",
    icon: CheckCircle2,
  },
  {
    title: "Schedule pickup or dispatch",
    description:
      "Coordinate directly with the farmer or nominated transport—built for repeat bulk orders.",
    icon: Truck,
  },
] as const

const whyDirect = [
  {
    title: "Closer to the harvest",
    body: "See what is in season and where it is grown—reducing surprises on quality and freshness.",
  },
  {
    title: "Transparent pricing",
    body: "Understand how quantity tiers affect rates before you commit to a full truckload.",
  },
  {
    title: "Stronger farmer relationships",
    body: "Ideal for caterers, hotels, and planners who want dependable supply with fewer middle layers.",
  },
] as const

export default function Home() {
  const popular = APPROVED_PRODUCTS.slice(0, 4)

  return (
    <main>
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-accent/45 via-background to-background px-4 pb-14 pt-12 sm:pb-20 sm:pt-16">
        <div
          className="pointer-events-none absolute -left-24 top-8 size-[26rem] rounded-full bg-primary/12 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-28 bottom-0 size-[22rem] rounded-full bg-secondary/70 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center text-center">
          <Badge variant="secondary" className="mb-5 px-3 py-1">
            Farm-to-bulk marketplace · India
          </Badge>
          <h1 className="font-heading max-w-4xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl md:leading-[1.08]">
            Buy Farm Products Directly From Farmers
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Browse chillies, pulses, nuts, grains, and more from listed origins. Compare
            categories, then send an inquiry when you are ready to buy in bulk.
          </p>
          <div className="mt-9 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-xl px-8 text-base shadow-md shadow-primary/15"
            >
              <Link href="/farmer/register">I am a Farmer</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 rounded-xl border-primary/25 bg-card/80 px-8 text-base backdrop-blur-sm hover:bg-accent"
            >
              <Link href="/products">I am a Buyer</Link>
            </Button>
          </div>
          <Button
            asChild
            variant="ghost"
            className="mt-6 text-primary hover:text-primary"
          >
            <Link href="/products" className="inline-flex items-center gap-1">
              View full product catalog
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      <section
        id="discover"
        className="scroll-mt-28 border-b border-border/60 bg-card/25 px-4 py-14 sm:py-20"
      >
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                Browse by category
              </h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Start with staples buyers ask for most. Listings highlight origin so you
                can plan procurement by region.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="shrink-0 rounded-lg">
              <Link href="/products">All approved products</Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {DISCOVERY_LISTINGS.map((item) => (
              <DiscoveryProductCard
                key={item.id}
                name={item.name}
                category={item.category}
                priceNote={PRICE_VARIES_NOTE}
                locationLine={item.locationLine}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/60 px-4 py-14 sm:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                Popular products
              </h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Verified sample listings with indicative farmer prices and available
                quantities.
              </p>
            </div>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((p) => (
              <CatalogProductCard
                key={p.id}
                name={p.name}
                category={p.category}
                farmerLocation={p.farmerLocation}
                price={p.price}
                quantity={p.quantity}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/60 bg-muted/30 px-4 py-14 sm:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            How bulk orders work
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            RaithuBridge is built for discovery first—then structured follow-up when both
            sides are ready to move volume.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {bulkSteps.map(({ title, description, icon: Icon }) => (
              <Card
                key={title}
                className="border-border/80 bg-card/90 shadow-sm"
              >
                <CardHeader className="pb-2">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm leading-relaxed">
                    {description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <Leaf className="size-3.5" aria-hidden />
                Why buy direct
              </div>
              <h2 className="font-heading mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                Why buy directly from farmers
              </h2>
              <p className="mt-3 text-muted-foreground sm:text-lg">
                Middlemen are not always bad—but opaque chains make pricing and quality
                harder to trust. Direct discovery puts both sides in the same conversation
                earlier.
              </p>
            </div>
            <ul className="space-y-4">
              {whyDirect.map(({ title, body }) => (
                <li
                  key={title}
                  className="flex gap-3 rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm"
                >
                  <CheckCircle2
                    className="mt-0.5 size-5 shrink-0 text-primary"
                    aria-hidden
                  />
                  <div>
                    <p className="font-medium text-foreground">{title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}

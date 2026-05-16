import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  Leaf,
  PackageSearch,
  Truck,
  Wheat,
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
import { shouldUseSampleData } from "@/lib/supabase/env"

const productSteps = [
  {
    title: "Discover listings",
    description: "Browse products by category, seller, location, price, and availability.",
    icon: PackageSearch,
  },
  {
    title: "Add products to cart",
    description: "Save products to your cart, adjust quantities, and review purchase details.",
    icon: Wheat,
  },
  {
    title: "Submit products",
    description: "Any signed-in user can submit farm products for review and listing.",
    icon: CheckCircle2,
  },
  {
    title: "Track review status",
    description: "Follow Pending, On Hold, Approved, and Rejected statuses with admin comments.",
    icon: Truck,
  },
] as const

const whyDirect = [
  {
    title: "Closer to the harvest",
    body: "See what is available, who is selling it, and where it is located before you contact the seller.",
  },
  {
    title: "Transparent pricing",
    body: "Compare prices and quantities across listings before deciding what to buy.",
  },
  {
    title: "Stronger seller relationships",
    body: "Buy with clearer product, price, and seller context, whether you are purchasing or listing your own products.",
  },
] as const

export default function Home() {
  const popular = shouldUseSampleData() ? APPROVED_PRODUCTS.slice(0, 4) : []

  return (
    <main>
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-amber-100/50 via-accent/35 to-background px-4 pb-16 pt-14 sm:pb-24 sm:pt-20 dark:from-amber-950/20 dark:via-primary/10 dark:to-background">
        <div
          className="pointer-events-none absolute -left-28 top-6 size-[28rem] rounded-full bg-primary/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-32 bottom-0 size-[24rem] rounded-full bg-amber-200/50 blur-3xl dark:bg-amber-900/20"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 size-[min(100vw,42rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/25 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center text-center">
          <Badge
            variant="secondary"
            className="mb-6 border border-primary/10 bg-card/90 px-4 py-1.5 text-sm font-medium shadow-sm"
          >
            Trusted farm product listings · India
          </Badge>
          <h1 className="font-heading max-w-4xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl md:leading-[1.08] lg:text-[3.25rem]">
            Buy farm products directly from trusted farmers and sellers.
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Browse chillies, pulses, nuts, grains, and more. Compare listings, add
            products to cart, and submit your own products for review from one simple
            interface.
          </p>
          <div className="mt-10 flex w-full max-w-lg flex-col gap-4 sm:max-w-none sm:flex-row sm:justify-center sm:gap-5">
            <Button
              asChild
              size="lg"
              className="h-12 min-h-12 rounded-xl px-10 text-base font-semibold shadow-lg shadow-primary/20 sm:h-14 sm:min-h-14 sm:px-12 sm:text-lg"
            >
              <Link href="/submit-product">Submit Product</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 min-h-12 rounded-xl border-2 border-primary/30 bg-card/90 px-10 text-base font-semibold backdrop-blur-sm hover:bg-accent sm:h-14 sm:min-h-14 sm:px-12 sm:text-lg"
            >
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
          <Button
            asChild
            variant="ghost"
            className="mt-8 text-base font-medium text-primary hover:bg-primary/5 hover:text-primary"
          >
            <Link href="/products" className="inline-flex items-center gap-2">
              View product catalog
              <ArrowRight className="size-5" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      <section
        id="discover"
        className="scroll-mt-28 border-b border-border/60 bg-gradient-to-b from-card/80 via-card/40 to-background px-4 py-16 sm:py-24"
      >
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                Browse by category
              </h2>
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
                Start with trusted product categories. Listings highlight seller location
                and indicative pricing.
              </p>
            </div>
            <Button asChild variant="outline" className="h-11 shrink-0 rounded-xl px-5 text-base font-semibold">
              <Link href="/products">All products</Link>
            </Button>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
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

      {popular.length ? (
      <section className="border-b border-border/60 bg-gradient-to-b from-background via-amber-50/20 to-background px-4 py-16 dark:via-primary/5 sm:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                Popular products
              </h2>
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
                Verified sample listings with indicative seller prices and available
                quantities.
              </p>
            </div>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {popular.map((p) => (
              <CatalogProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                category={p.category}
                sellerName={p.sellerName}
                sellerLocation={p.sellerLocation}
                price={p.price}
                quantity={p.quantity}
                unit={p.unit}
                status={p.status}
                mediaUrl={p.mediaAssets.find((asset) => asset.type === "image")?.url}
              />
            ))}
          </div>
        </div>
      </section>
      ) : null}

      <section className="border-b border-border/60 bg-gradient-to-br from-muted/50 via-background to-accent/25 px-4 py-16 sm:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            How RaithuBridge Works
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            RaithuBridge keeps buying, selling, review, and inventory workflows clear for
            everyone using the platform.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 md:gap-8">
            {productSteps.map(({ title, description, icon: Icon }) => (
              <Card
                key={title}
                className="border-border/70 bg-card/95 shadow-md ring-1 ring-primary/5"
              >
                <CardHeader className="pb-2">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-amber-100/60 text-primary dark:to-amber-950/40">
                    <Icon className="size-6" aria-hidden />
                  </div>
                  <CardTitle className="text-xl">{title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-base leading-relaxed">
                    {description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Leaf className="size-4" aria-hidden />
                Why buy direct
              </div>
              <h2 className="font-heading mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                Why buy directly from farmers and sellers
              </h2>
              <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
                Middlemen are not always bad—but opaque chains make pricing and quality
                harder to trust. Direct discovery puts both sides in the same conversation
                earlier.
              </p>
            </div>
            <ul className="space-y-5">
              {whyDirect.map(({ title, body }) => (
                <li
                  key={title}
                  className="flex gap-4 rounded-2xl border border-border/70 bg-card/90 p-5 shadow-md ring-1 ring-primary/5 sm:p-6"
                >
                  <CheckCircle2
                    className="mt-0.5 size-6 shrink-0 text-primary"
                    aria-hidden
                  />
                  <div>
                    <p className="text-lg font-semibold text-foreground">{title}</p>
                    <p className="mt-2 text-base leading-relaxed text-muted-foreground">{body}</p>
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

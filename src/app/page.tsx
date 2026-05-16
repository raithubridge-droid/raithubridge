import Link from "next/link"
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Handshake,
  HeartHandshake,
  Leaf,
  MapPin,
  SearchCheck,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Wheat,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { HomeProductImage } from "@/components/home-product-image"
import { shouldUseSampleData } from "@/lib/supabase/env"

const HOME_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80"

const productSteps = [
  {
    title: "Submit",
    description: "Farmers and sellers list product, price, quantity, location, and photos.",
    icon: Sprout,
  },
  {
    title: "Review",
    description: "RaithuBridge checks listings so buyers can browse with confidence.",
    icon: ClipboardCheck,
  },
  {
    title: "Go Live",
    description: "Approved products become visible to buyers without middlemen.",
    icon: ShieldCheck,
  },
  {
    title: "Connect",
    description: "Buyers discover products and contact or order directly.",
    icon: Handshake,
  },
] as const

const whyDirect = [
  {
    title: "Better price transparency",
    body: "Buyers can see product prices clearly before deciding who to contact.",
    icon: SearchCheck,
  },
  {
    title: "Fresher products",
    body: "Direct discovery helps buyers find products closer to the source.",
    icon: Leaf,
  },
  {
    title: "Supports local farmers and sellers",
    body: "More direct interest can help local sellers reach the right buyers.",
    icon: Sprout,
  },
  {
    title: "Easier trusted discovery",
    body: "Reviewed listings make it simpler to find sellers, products, and locations in one place.",
    icon: CheckCircle2,
  },
] as const

const homePopularProducts = [
  {
    id: "home-turmeric",
    name: "Salem Turmeric Fingers",
    category: "Spices",
    price: "Rs. 105 / kg",
    sellerName: "Mahadev Jadhav",
    sellerLocation: "Sangli, Maharashtra",
    imageUrl: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=1200&q=80",
    trustBadge: "Reviewed Listing",
  },
  {
    id: "home-red-chilli",
    name: "Byadgi Dried Red Chillies",
    category: "Spices",
    price: "Rs. 185 / kg",
    sellerName: "Lakshmi Gowda",
    sellerLocation: "Raichur, Karnataka",
    imageUrl: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=1200&q=80",
    trustBadge: "Direct Seller",
  },
  {
    id: "home-rice",
    name: "Sona Masoori Rice",
    category: "Grains",
    price: "Rs. 42 / kg",
    sellerName: "Kiran Kumar",
    sellerLocation: "Karimnagar, Telangana",
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80",
    trustBadge: "Reviewed Listing",
  },
  {
    id: "home-groundnuts",
    name: "Bold Groundnuts",
    category: "Oilseeds",
    price: "Rs. 92 / kg",
    sellerName: "Mehul Patel",
    sellerLocation: "Junagadh, Gujarat",
    imageUrl: "https://images.unsplash.com/photo-1567892737950-30c4db37cd89?auto=format&fit=crop&w=1200&q=80",
    trustBadge: "Direct Seller",
  },
  {
    id: "home-vegetables",
    name: "Fresh Seasonal Vegetables",
    category: "Vegetables",
    price: "Price varies",
    sellerName: "Local farm sellers",
    sellerLocation: "Telangana markets",
    imageUrl: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=1200&q=80",
    trustBadge: "Reviewed Listing",
  },
  {
    id: "home-mangoes",
    name: "Banganapalli Mangoes",
    category: "Fruits",
    price: "Seasonal price",
    sellerName: "Orchard sellers",
    sellerLocation: "Andhra Pradesh",
    imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=1200&q=80",
    trustBadge: "Direct Seller",
  },
] as const

type HomePopularProduct = (typeof homePopularProducts)[number]

function PopularProductCard({ product }: { product: HomePopularProduct }) {
  return (
    <Card className="group h-full overflow-hidden border-border/70 bg-card/95 shadow-md ring-1 ring-primary/5 transition-[box-shadow,transform] duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10">
      <Link
        href="/products"
        className="relative block aspect-[5/4] overflow-hidden bg-muted"
      >
        <HomeProductImage
          src={product.imageUrl}
          fallbackSrc={HOME_IMAGE_FALLBACK}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent opacity-80" />
        <Badge className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-900 shadow-sm hover:bg-white">
          Available
        </Badge>
        <Badge
          variant="secondary"
          className="absolute bottom-3 left-3 border border-white/30 bg-white/90 px-3 py-1 text-xs font-semibold text-foreground shadow-sm"
        >
          {product.category}
        </Badge>
      </Link>
      <CardHeader className="space-y-3 pb-2">
        <CardTitle className="text-xl leading-snug">
          <Link href="/products" className="hover:text-primary">
            {product.name}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xl font-bold tracking-tight text-foreground">{product.price}</p>
          <Badge variant="outline" className="border-primary/20 bg-primary/5 text-xs text-primary">
            {product.trustBadge}
          </Badge>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <ShoppingBag className="size-4 text-primary" aria-hidden />
            {product.sellerName}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" aria-hidden />
            {product.sellerLocation}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Home() {
  const popular = shouldUseSampleData() ? homePopularProducts : []

  return (
    <main>
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-amber-100/50 via-accent/35 to-background px-4 pb-14 pt-12 sm:pb-20 sm:pt-16 dark:from-amber-950/20 dark:via-primary/10 dark:to-background">
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
        <div className="animate-in fade-in slide-in-from-bottom-4 relative mx-auto grid w-full max-w-6xl items-center gap-10 duration-700 lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)]">
          <div className="text-center lg:text-left">
          <Badge
            variant="secondary"
            className="mb-6 border border-primary/10 bg-card/90 px-4 py-1.5 text-sm font-medium shadow-sm"
          >
            Trusted farm product listings · India
          </Badge>
          <h1 className="font-heading mx-auto max-w-4xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl md:leading-[1.08] lg:mx-0 lg:text-[3.25rem]">
            Helping farmers and sellers reach more buyers and earn better value for their products.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-8 text-muted-foreground sm:text-lg sm:leading-9 lg:mx-0">
            రైతులు మరియు చిన్న వ్యాపారులు తమ ఉత్పత్తులకు మంచి ధర మరియు ఎక్కువ కొనుగోలుదారులను పొందేందుకు సహాయం చేసే వేదిక.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl lg:mx-0">
            RaithuBridge helps farmers and sellers list their products, and helps buyers
            find trusted farm products in one simple place.
          </p>
          <div className="mt-8 flex w-full max-w-lg flex-col gap-4 sm:max-w-none sm:flex-row sm:justify-center sm:gap-5 lg:justify-start">
            <Button
              asChild
              size="lg"
              className="h-12 min-h-12 rounded-xl px-10 text-base font-semibold shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5 sm:h-14 sm:min-h-14 sm:px-12 sm:text-lg"
            >
              <Link href="/submit-product">Submit Product</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 min-h-12 rounded-xl border-2 border-primary/30 bg-card/90 px-10 text-base font-semibold backdrop-blur-sm transition-transform hover:-translate-y-0.5 hover:bg-accent sm:h-14 sm:min-h-14 sm:px-12 sm:text-lg"
            >
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
          <Button
            asChild
            variant="ghost"
            className="group mt-6 text-base font-medium text-primary hover:bg-primary/5 hover:text-primary"
          >
            <Link href="/products" className="inline-flex items-center gap-2">
              View product catalog
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </Button>
          </div>
          <div className="rounded-3xl border border-primary/15 bg-card/85 p-5 shadow-xl ring-1 ring-primary/5 backdrop-blur sm:p-6">
            <div className="rounded-2xl bg-gradient-to-br from-primary/15 via-amber-100/60 to-card p-5 dark:from-primary/20 dark:via-amber-950/30">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-card text-primary shadow-sm">
                <Wheat className="size-7" aria-hidden />
              </div>
              <h2 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
                A bridge between farms, sellers, and buyers
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                Built to make farm product discovery easier, RaithuBridge gives sellers a
                simple way to share what they have and gives buyers a clearer way to find it.
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {["Submit", "Review", "Discover"].map((item) => (
                <div key={item} className="rounded-xl border border-border/60 bg-background/80 px-4 py-3 text-center text-sm font-semibold text-foreground">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/60 bg-gradient-to-b from-card/80 via-card/30 to-background px-4 py-14 sm:py-18">
        <div className="mx-auto w-full max-w-6xl">
          <div className="animate-in fade-in slide-in-from-bottom-3 grid gap-8 duration-700 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="rounded-3xl border border-primary/15 bg-card/90 p-6 shadow-lg ring-1 ring-primary/5 sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <HeartHandshake className="size-4" aria-hidden />
                Farmer-first mission
              </div>
              <h2 className="font-heading mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                Why We Built RaithuBridge
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Many farmers work for months to grow their products, but still struggle
                to get fair visibility and better prices. RaithuBridge was created to help
                farmers and small sellers showcase their products directly to genuine buyers
                in a simpler and more transparent way.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-border/70 bg-card/95 shadow-md ring-1 ring-primary/5 transition-transform hover:-translate-y-1">
                <CardHeader>
                  <Sprout className="size-9 text-primary" aria-hidden />
                  <CardTitle>Better visibility</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-base leading-relaxed text-muted-foreground">
                  Sellers can present their products with clear details and photos.
                </CardContent>
              </Card>
              <Card className="border-border/70 bg-card/95 shadow-md ring-1 ring-primary/5 transition-transform hover:-translate-y-1">
                <CardHeader>
                  <ShoppingBag className="size-9 text-primary" aria-hidden />
                  <CardTitle>Genuine buyers</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-base leading-relaxed text-muted-foreground">
                  Buyers can discover trusted listings and connect more directly.
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {popular.length ? (
      <section className="border-b border-border/60 bg-gradient-to-b from-background via-amber-50/20 to-background px-4 py-14 dark:via-primary/5 sm:py-18">
        <div className="mx-auto w-full max-w-6xl">
          <div className="animate-in fade-in slide-in-from-bottom-3 flex flex-col gap-4 duration-700 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                Popular products
              </h2>
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
                A quick look at products buyers commonly search for.
              </p>
            </div>
            <Button asChild variant="outline" className="h-11 shrink-0 rounded-xl px-5 text-base font-semibold">
              <Link href="/products">View all products</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {popular.map((product) => (
              <PopularProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
      ) : null}

      <section className="border-b border-border/60 bg-gradient-to-br from-muted/50 via-background to-accent/25 px-4 py-10 sm:py-12">
        <div className="mx-auto w-full max-w-6xl">
          <div className="animate-in fade-in slide-in-from-bottom-3 mx-auto max-w-2xl text-center duration-700">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              How RaithuBridge Works
            </h2>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              Helping farmers and small sellers reach genuine buyers with fewer middlemen.
            </p>
          </div>
          <div className="mt-6 grid gap-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-center">
            {productSteps.map(({ title, description, icon: Icon }, index) => (
              <div key={title} className="contents">
                <Card className="border-border/70 bg-card/95 shadow-sm ring-1 ring-primary/5 transition-transform hover:-translate-y-0.5">
                  <CardContent className="flex gap-3 p-4">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" aria-hidden />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-primary">
                          Step {index + 1}
                        </span>
                        <CardTitle className="text-base">{title}</CardTitle>
                      </div>
                      <CardDescription className="mt-1 text-sm leading-relaxed">
                        {description}
                      </CardDescription>
                    </div>
                  </CardContent>
                </Card>
                {index < productSteps.length - 1 ? (
                  <div className="flex items-center justify-center text-primary/80 lg:px-1">
                    <ArrowDown className="size-4 lg:hidden" aria-hidden />
                    <ArrowRight className="hidden size-5 transition-transform lg:block lg:group-hover:translate-x-0.5" aria-hidden />
                    <span className="sr-only">Then</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:py-18">
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
                Direct discovery helps buyers understand what is available, where it comes
                from, and who is selling it.
              </p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {whyDirect.map(({ title, body, icon: Icon }) => (
                <li
                  key={title}
                  className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-md ring-1 ring-primary/5 sm:p-6"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <p className="mt-4 text-lg font-semibold text-foreground">{title}</p>
                  <p className="mt-2 text-base leading-relaxed text-muted-foreground">{body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}

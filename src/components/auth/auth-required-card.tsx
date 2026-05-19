import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

type AuthRequiredCardProps = {
  message: string
  nextPath: string
  signInLinkLabel?: string
  backHref?: string
}

export function AuthRequiredCard({
  message,
  nextPath,
  signInLinkLabel = "Sign In",
  backHref = "/",
}: AuthRequiredCardProps) {
  const signInHref = `/sign-in?next=${encodeURIComponent(nextPath)}`

  return (
    <section className="rounded-2xl border border-primary/15 bg-card/95 p-5 shadow-sm ring-1 ring-primary/10">
      <p className="text-base leading-relaxed text-muted-foreground">{message}</p>
      <div className="mt-4">
        <Button asChild className="h-12 w-full rounded-2xl text-base font-semibold">
          <Link href={signInHref}>{signInLinkLabel}</Link>
        </Button>
      </div>
      <Link
        href={backHref}
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="size-4 shrink-0" aria-hidden />
        Back to home
      </Link>
    </section>
  )
}

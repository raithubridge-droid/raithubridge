import Link from "next/link"
import { ClipboardList, LayoutDashboard, PenLine } from "lucide-react"

import { SignOutButton } from "@/components/auth/sign-out-button"
import { cn } from "@/lib/utils"

type UserAccountPanelProps = {
  accountLabel: string | null
  loginProvider?: string | null
  roleLabel: string
  isAdmin: boolean
  className?: string
}

const actionLinkClass =
  "flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border/70 bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-primary/5"

export function UserAccountPanel({
  accountLabel,
  loginProvider,
  roleLabel,
  isAdmin,
  className,
}: UserAccountPanelProps) {
  return (
    <section
      className={cn(
        "space-y-4 rounded-2xl border border-green-800/15 bg-card/95 p-4 shadow-sm ring-1 ring-green-800/10",
        className
      )}
    >
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Signed in as
        </p>
        <p className="break-all text-base font-semibold text-foreground sm:text-lg">
          {accountLabel ?? "Your account"}
        </p>
        {loginProvider ? (
          <p className="text-sm text-muted-foreground">via {loginProvider}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-xs font-semibold text-foreground">
          {roleLabel}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Link href="/my-submissions" className={actionLinkClass}>
          <ClipboardList className="size-4 shrink-0 text-primary" aria-hidden />
          My Submissions
        </Link>
        <Link href="/submit-product" className={actionLinkClass}>
          <PenLine className="size-4 shrink-0 text-primary" aria-hidden />
          Submit Product
        </Link>
        {isAdmin ? (
          <Link
            href="/admin"
            className={cn(actionLinkClass, "border-green-800/25 bg-green-800/5 text-green-900 sm:col-span-2")}
          >
            <LayoutDashboard className="size-4 shrink-0" aria-hidden />
            Admin
          </Link>
        ) : null}
      </div>

      <SignOutButton
        label="Log out"
        buttonClassName="h-12 w-full rounded-xl bg-green-800 text-base font-semibold text-white hover:bg-green-900"
      />
    </section>
  )
}

type UserAccountChipProps = {
  accountLabel: string | null
  className?: string
}

export function UserAccountChip({ accountLabel, className }: UserAccountChipProps) {
  if (!accountLabel) {
    return null
  }

  return (
    <div
      className={cn(
        "hidden min-w-0 max-w-[12rem] flex-col items-end sm:flex lg:max-w-[14rem]",
        className
      )}
    >
      <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        Signed in
      </span>
      <span className="w-full truncate text-sm font-semibold text-foreground" title={accountLabel}>
        {accountLabel}
      </span>
    </div>
  )
}

export function MobileAccountSignOutButton() {
  return (
    <SignOutButton
      label="Log out"
      formClassName="w-full"
      buttonClassName="min-h-12 w-full justify-start gap-3 rounded-xl border border-border/70 bg-card/90 px-4 text-base font-semibold shadow-sm"
    />
  )
}

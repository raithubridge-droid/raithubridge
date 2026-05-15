import { cn } from "@/lib/utils"

const sizeClass = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-14 w-14",
} as const

type LogoProps = {
  className?: string
  /** Icon mark — pair with visible wordmark, or set `accessibilityLabel` if used alone. */
  size?: keyof typeof sizeClass
  /** When set, exposes the mark to assistive tech; otherwise hidden (wordmark nearby). */
  accessibilityLabel?: string
}

/**
 * RaithuBridge mark: rolling fields, a bridge arc, wheat stalk, and a farmer silhouette.
 * Uses primary green + warm amber/yellow earth tones.
 */
export function Logo({ className, size = "md", accessibilityLabel }: LogoProps) {
  const a11yProps = accessibilityLabel
    ? { role: "img" as const, "aria-label": accessibilityLabel }
    : { "aria-hidden": true as const }

  return (
    <svg viewBox="0 0 48 48" className={cn(sizeClass[size], "shrink-0", className)} {...a11yProps}>
      {accessibilityLabel ? <title>{accessibilityLabel}</title> : null}
      {/* Sun / harvest */}
      <circle cx="38" cy="12" r="5" className="fill-amber-300/90 dark:fill-amber-200/80" />
      <circle cx="38" cy="12" r="2.5" className="fill-amber-100/90" />
      {/* Rolling fields */}
      <path
        d="M0 40 C8 32 16 36 24 33 C32 30 40 34 48 38 L48 48 L0 48 Z"
        className="fill-primary/85"
      />
      <path
        d="M0 42 C10 38 20 40 30 37 C36 35 42 37 48 40 L48 48 L0 48 Z"
        className="fill-primary/55"
      />
      {/* Bridge towers */}
      <rect x="9" y="22" width="3.5" height="10" rx="0.5" className="fill-amber-800/90 dark:fill-amber-600/90" />
      <rect x="35.5" y="22" width="3.5" height="10" rx="0.5" className="fill-amber-800/90 dark:fill-amber-600/90" />
      {/* Bridge deck + arch */}
      <path
        d="M11 26 H37"
        className="stroke-amber-800 stroke-[2.25] dark:stroke-amber-600"
        strokeLinecap="round"
      />
      <path
        d="M12 26 Q24 14 36 26"
        fill="none"
        className="stroke-amber-800/85 stroke-[2.25] dark:stroke-amber-600/90"
        strokeLinecap="round"
      />
      {/* Wheat stalk */}
      <path
        d="M6 34 L6 20 M6 24 L4 22 M6 22 L8 20 M6 26 L3 25 M6 26 L9 25"
        className="stroke-amber-500 stroke-[1.75]"
        strokeLinecap="round"
      />
      <ellipse cx="6" cy="19" rx="2" ry="3" className="fill-amber-400/85" transform="rotate(-12 6 19)" />
      {/* Farmer on bridge */}
      <circle cx="24" cy="22.5" r="2.2" className="fill-amber-950/80 dark:fill-amber-100/90" />
      <path
        d="M24 24.5 v5 M21 28 h6"
        className="stroke-amber-950/85 stroke-[1.75] dark:stroke-amber-100/90"
        strokeLinecap="round"
      />
    </svg>
  )
}

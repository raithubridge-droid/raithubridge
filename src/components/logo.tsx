import { cn } from "@/lib/utils"

const sizeClass = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-14 w-14",
} as const

type LogoProps = {
  className?: string
  size?: keyof typeof sizeClass
  accessibilityLabel?: string
}

export function Logo({ className, size = "md", accessibilityLabel }: LogoProps) {
  const a11yProps = accessibilityLabel
    ? { role: "img" as const, "aria-label": accessibilityLabel }
    : { "aria-hidden": true as const }

  return (
    <svg viewBox="0 0 48 48" className={cn(sizeClass[size], "shrink-0", className)} {...a11yProps}>
      {accessibilityLabel ? <title>{accessibilityLabel}</title> : null}
      <defs>
        <linearGradient id="rb-field" x1="6" x2="42" y1="38" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#157A45" />
          <stop offset="0.55" stopColor="#6FBF4A" />
          <stop offset="1" stopColor="#F4B740" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" className="fill-white" />
      <path
        d="M8 35 C15 29 21 31 27 27 C32 24 37 25 40 28 L40 40 L8 40 Z"
        fill="url(#rb-field)"
      />
      <path
        d="M10 30 C17 20 31 20 38 30"
        className="stroke-emerald-900"
        fill="none"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path
        d="M14 30 H34"
        className="stroke-emerald-900"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path
        d="M17 31 V22 M31 31 V22"
        className="stroke-emerald-900"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      <path
        d="M24 25 C24 18 29 14 36 13 C35 20 31 25 24 25 Z"
        className="fill-lime-500"
      />
      <path
        d="M24 25 C23 19 19 16 13 16 C14 22 18 26 24 25 Z"
        className="fill-emerald-500"
      />
      <circle cx="36" cy="12" r="4" className="fill-amber-300" />
    </svg>
  )
}

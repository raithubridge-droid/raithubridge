import Link from "next/link"

import { Logo } from "@/components/logo"

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="7" r="1.2" fill="currentColor" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M14.2 8.2V6.8c0-.7.5-1.1 1.2-1.1h1.4V3.2A19 19 0 0 0 14.7 3c-2.1 0-3.6 1.3-3.6 3.6v1.6H8.7V11h2.4v10h3.1V11h2.4l.4-2.8h-2.8Z" />
    </svg>
  )
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M21 8.2s-.2-1.5-.8-2.1c-.8-.8-1.7-.8-2.1-.9C15.2 5 12 5 12 5s-3.2 0-6.1.2c-.4.1-1.3.1-2.1.9C3.2 6.7 3 8.2 3 8.2S2.8 10 2.8 11.7v1.6C2.8 15 3 16.8 3 16.8s.2 1.5.8 2.1c.8.8 1.9.8 2.4.9 1.7.2 5.8.2 5.8.2s3.2 0 6.1-.2c.4-.1 1.3-.1 2.1-.9.6-.6.8-2.1.8-2.1s.2-1.8.2-3.5v-1.6c0-1.7-.2-3.5-.2-3.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path d="m10.2 9.2 5 2.8-5 2.8V9.2Z" fill="currentColor" />
    </svg>
  )
}

const socialLinks = [
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: InstagramIcon,
  },
  {
    name: "Facebook",
    href: "https://facebook.com",
    icon: FacebookIcon,
  },
  {
    name: "YouTube",
    href: "https://youtube.com",
    icon: YoutubeIcon,
  },
] as const

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-gradient-to-b from-muted/50 to-muted/70 px-4 py-8 sm:py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-12">
        <div className="max-w-md">
          <Link href="/" className="flex items-center gap-3 text-foreground">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 via-amber-100/35 to-primary/10 ring-1 ring-primary/15 dark:from-primary/25 dark:via-amber-950/25 dark:to-primary/10">
              <Logo size="sm" />
            </span>
            <span className="font-heading text-xl font-semibold">RaithuBridge</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Buy farm products directly from trusted farmers and sellers across India.
          </p>
          <div className="mt-5 rounded-2xl border border-primary/10 bg-background/55 p-4 shadow-sm ring-1 ring-primary/5">
            <p className="text-sm font-semibold text-foreground">Follow RaithuBridge</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Follow our journey, farmer stories, and latest product updates.
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              రైతుల కథలు మరియు తాజా ఉత్పత్తి వివరాల కోసం మమ్మల్ని అనుసరించండి.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {socialLinks.map(({ name, href, icon: Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Follow RaithuBridge on ${name}`}
                  className="group flex size-10 items-center justify-center rounded-full border border-primary/15 bg-card text-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:border-primary/30 hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/20"
                >
                  <Icon className="size-5 transition-transform group-hover:scale-110" aria-hidden />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm sm:gap-14 md:justify-self-start">
          <div>
            <p className="font-semibold text-foreground">Marketplace</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <Link href="/products" className="hover:text-foreground">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/submit-product" className="hover:text-foreground">
                  Submit Product
                </Link>
              </li>
              <li>
                <Link href="/my-submissions" className="hover:text-foreground">
                  My Submissions
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-foreground">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-foreground">
                  Admin
                </Link>
              </li>
              <li>
                <Link href="/signin" className="hover:text-foreground">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-foreground">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-foreground">Legal</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <span className="cursor-not-allowed opacity-70">Privacy</span>
              </li>
              <li>
                <span className="cursor-not-allowed opacity-70">Terms</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 w-full max-w-6xl border-t border-border/70 pt-5 text-center text-xs text-muted-foreground sm:text-left">
        © {new Date().getFullYear()} RaithuBridge. All rights reserved.
      </div>
    </footer>
  )
}

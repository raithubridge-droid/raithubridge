import type { NextRequest } from "next/server"

export const DEFAULT_AUTH_SUCCESS_PATH = "/products"

const LOCAL_HOST_PATTERN = /localhost|127\.0\.0\.1/i

export function getSafeNextPath(next?: string | null) {
  if (!next || next === "/") {
    return DEFAULT_AUTH_SUCCESS_PATH
  }

  return next.startsWith("/") && !next.startsWith("//") ? next : DEFAULT_AUTH_SUCCESS_PATH
}

/** Public site origin from env; ignored in production when it points at localhost. */
export function getPublicSiteOrigin() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (!raw) {
    return null
  }

  try {
    const origin = new URL(raw).origin

    if (process.env.NODE_ENV === "production" && LOCAL_HOST_PATTERN.test(origin)) {
      return null
    }

    return origin
  } catch {
    return null
  }
}

/** OAuth redirect URL for browser sign-in (Google, email confirmation links). */
export function getAuthCallbackRedirectTo(nextPath?: string) {
  if (typeof window === "undefined") {
    return undefined
  }

  const next = getSafeNextPath(nextPath)
  const callbackUrl = `${window.location.origin}/auth/callback`

  return `${callbackUrl}?next=${encodeURIComponent(next)}`
}

/** Resolve the app origin when handling /auth/callback on the server. */
export function getRequestOrigin(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim()
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "https"

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }

  const siteOrigin = getPublicSiteOrigin()

  if (siteOrigin) {
    return siteOrigin
  }

  const origin = request.nextUrl.origin

  if (process.env.NODE_ENV === "production" && LOCAL_HOST_PATTERN.test(origin)) {
    return siteOrigin ?? origin
  }

  return origin
}

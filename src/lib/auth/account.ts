import type { User } from "@supabase/supabase-js"

import type { AuthProfile } from "@/lib/auth/roles"

const PROVIDER_LABELS: Record<string, string> = {
  google: "Gmail",
  phone: "Mobile number (OTP)",
  email: "Email",
  apple: "Apple",
}

export function getAccountEmail(user: User | null, profile: AuthProfile | null) {
  return user?.email ?? profile?.email ?? null
}

export function getAccountPhone(user: User | null, profile: AuthProfile | null) {
  return user?.phone ?? profile?.phone ?? null
}

/** Primary sign-in identifier shown in UI: email first, then phone. */
export function getAccountDisplayLabel(user: User | null, profile: AuthProfile | null) {
  return getAccountEmail(user, profile) ?? getAccountPhone(user, profile)
}

export function getLoginProviderLabel(user: User | null) {
  if (!user) {
    return null
  }

  const metadataProvider = user.app_metadata?.provider
  if (typeof metadataProvider === "string" && metadataProvider.length) {
    return PROVIDER_LABELS[metadataProvider] ?? metadataProvider
  }

  const identityProvider = user.identities?.find((identity) => identity.provider)?.provider
  if (identityProvider) {
    return PROVIDER_LABELS[identityProvider] ?? identityProvider
  }

  if (user.phone) {
    return PROVIDER_LABELS.phone
  }

  if (user.email) {
    return PROVIDER_LABELS.email
  }

  return null
}

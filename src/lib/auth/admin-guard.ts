import type { User } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

import { getCurrentProfile, type AuthProfile } from "@/lib/auth/roles"

export type AdminPageAccess =
  | { kind: "sign_in_required" }
  | { kind: "access_denied"; user: User }
  | { kind: "ok"; user: User; profile: AuthProfile }

/**
 * Resolves admin page access using the current Supabase session and `profiles.role`.
 * Call before loading any admin-only data or actions.
 */
export async function getAdminPageAccess(): Promise<AdminPageAccess> {
  const { user, profile } = await getCurrentProfile()

  if (!user) {
    return { kind: "sign_in_required" }
  }

  if (!profile || profile.role !== "admin") {
    return { kind: "access_denied", user }
  }

  return { kind: "ok", user, profile }
}

/** Redirect-based guard for routes that prefer navigation over inline messages. */
export async function requireAdminPageAccess(nextPath: string) {
  const access = await getAdminPageAccess()

  if (access.kind === "sign_in_required") {
    redirect(`/sign-in?next=${encodeURIComponent(nextPath)}`)
  }

  if (access.kind === "access_denied") {
    redirect("/unauthorized")
  }

  return { user: access.user, profile: access.profile }
}

export function isAdminProfile(profile: AuthProfile | null | undefined) {
  return profile?.role === "admin"
}

import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database"

export type UserRole = Database["public"]["Tables"]["users"]["Row"]["role"]

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  buyer: "Buyer",
  seller: "Seller",
}

export const ROLE_HOME: Record<UserRole, string> = {
  admin: "/admin",
  buyer: "/products",
  seller: "/submit-product",
}

export type AuthProfile = {
  id: string
  email: string | null
  full_name: string | null
  role: UserRole
}

export async function getCurrentProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, profile: null }
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile) {
    return { user, profile }
  }

  const fallbackProfile = {
    id: user.id,
    email: user.email ?? null,
    full_name: user.user_metadata.full_name ?? user.user_metadata.name ?? null,
    role: "buyer" as const,
    updated_at: new Date().toISOString(),
  }

  const { data: createdProfile } = await supabase
    .from("users")
    .upsert(fallbackProfile)
    .select("id, email, full_name, role")
    .single()

  return { user, profile: createdProfile ?? fallbackProfile }
}

export async function requireRole(allowedRoles: UserRole[]) {
  const { user, profile } = await getCurrentProfile()

  if (!user) {
    redirect("/signin")
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    redirect("/unauthorized")
  }

  return { user, profile }
}

export function getRoleHome(role: UserRole | null | undefined) {
  return role ? ROLE_HOME[role] : "/products"
}

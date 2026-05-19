import type { SupabaseClient, User } from "@supabase/supabase-js"

import type { Database } from "@/types/database"

export function getProfileFieldsFromUser(user: User) {
  const metadata = user.user_metadata ?? {}

  return {
    id: user.id,
    email: user.email ?? null,
    phone: user.phone ?? null,
    full_name:
      (typeof metadata.full_name === "string" && metadata.full_name) ||
      (typeof metadata.name === "string" && metadata.name) ||
      null,
    role: "user" as const,
    updated_at: new Date().toISOString(),
  }
}

export async function syncProfileFromUser(
  supabase: SupabaseClient<Database>,
  user: User
) {
  const profile = getProfileFieldsFromUser(user)

  const { error } = await supabase.from("profiles").upsert(profile, {
    onConflict: "id",
  })

  if (error) {
    console.error("Failed to sync profile:", error.message)
  }
}

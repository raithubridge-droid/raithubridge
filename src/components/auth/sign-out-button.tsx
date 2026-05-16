import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"

export function SignOutButton() {
  async function signOut() {
    "use server"

    if (!hasSupabaseEnv()) {
      redirect("/signin")
    }

    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/signin")
  }

  return (
    <form action={signOut}>
      <Button type="submit" variant="ghost" size="default" className="h-10 px-3 text-base">
        Sign Out
      </Button>
    </form>
  )
}

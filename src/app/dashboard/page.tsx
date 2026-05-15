import { redirect } from "next/navigation"

import { getCurrentProfile, getRoleHome } from "@/lib/auth/roles"

export default async function DashboardPage() {
  const { user, profile } = await getCurrentProfile()

  if (!user) {
    redirect("/signin")
  }

  redirect(getRoleHome(profile?.role))
}

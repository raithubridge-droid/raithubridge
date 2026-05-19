import { redirect } from "next/navigation"

type SignInRedirectPageProps = {
  searchParams?: Promise<{
    next?: string
  }>
}

export default async function SignInRedirectPage({ searchParams }: SignInRedirectPageProps) {
  const params = await searchParams
  const next = params?.next

  if (next?.startsWith("/") && !next.startsWith("//")) {
    redirect(`/sign-in?next=${encodeURIComponent(next)}`)
  }

  redirect("/sign-in")
}

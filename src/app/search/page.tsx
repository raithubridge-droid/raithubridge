import type { Metadata } from "next"

import { SearchPageClient } from "@/app/search/search-page-client"

export const metadata: Metadata = {
  title: "Search Products",
  description: "Search farm products by name, category, or location.",
}

export default function SearchPage() {
  return <SearchPageClient />
}

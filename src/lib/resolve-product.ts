import type { ApprovedProduct } from "@/lib/marketplace-data"
import { getProduct } from "@/lib/marketplace-repository"
import {
  getSampleProduct,
  mapSampleProductToApprovedProduct,
} from "@/lib/sample-products"

export function resolveSampleProduct(id: string): ApprovedProduct | null {
  const sample = getSampleProduct(id)
  return sample ? mapSampleProductToApprovedProduct(sample) : null
}

export async function resolveProduct(id: string): Promise<ApprovedProduct | null> {
  const sampleProduct = resolveSampleProduct(id)
  if (sampleProduct) {
    return sampleProduct
  }

  try {
    return (await getProduct(id)) ?? null
  } catch {
    return null
  }
}

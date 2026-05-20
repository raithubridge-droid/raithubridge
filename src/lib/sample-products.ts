import type { ApprovedProduct } from "@/lib/marketplace-data"

export type SampleProductCategory = "Grains" | "Oils" | "Spices" | "Vegetables"

export type SampleProduct = {
  id: string
  name: string
  category: SampleProductCategory
  price: number
  unit: "Kg" | "Litre"
  availability: "In Stock" | "Out of Stock"
  location: string
  description: string
  images: string[]
}

export const sampleProducts: SampleProduct[] = [
  {
    id: "sona-masoori-rice",
    name: "Sona Masoori Rice",
    category: "Grains",
    price: 90,
    unit: "Kg",
    availability: "In Stock",
    location: "Karimnagar, Telangana",
    description:
      "Fresh Sona Masoori rice from local farmers. Cleaned and packed carefully. Suitable for daily household cooking and small shops.",
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: "green-chilli",
    name: "Green Chilli",
    category: "Vegetables",
    price: 60,
    unit: "Kg",
    availability: "In Stock",
    location: "Warangal, Telangana",
    description:
      "Fresh green chillies picked from local farms. Good spice level and suitable for home cooking, hotels, and small food businesses.",
    images: [
      "https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1627738667569-cf839716a3eb?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1526346698789-22fd84314424?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: "turmeric-powder",
    name: "Turmeric Powder",
    category: "Spices",
    price: 180,
    unit: "Kg",
    availability: "In Stock",
    location: "Nizamabad, Telangana",
    description:
      "Natural turmeric powder prepared from quality turmeric roots. Good color and aroma, suitable for daily cooking and traditional use.",
    images: [
      "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1615485925763-86786288908a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: "groundnut-oil",
    name: "Groundnut Oil",
    category: "Oils",
    price: 220,
    unit: "Litre",
    availability: "In Stock",
    location: "Siddipet, Telangana",
    description:
      "Groundnut oil made from selected groundnuts. Suitable for regular cooking with natural taste and aroma.",
    images: [
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: "red-chilli-powder",
    name: "Red Chilli Powder",
    category: "Spices",
    price: 240,
    unit: "Kg",
    availability: "In Stock",
    location: "Khammam, Telangana",
    description:
      "Fresh red chilli powder made from dried chillies. Strong color and spice, suitable for home kitchens and small restaurants.",
    images: [
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1599909533881-136f9e6a35b6?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: "tomatoes",
    name: "Tomatoes",
    category: "Vegetables",
    price: 40,
    unit: "Kg",
    availability: "In Stock",
    location: "Rangareddy, Telangana",
    description:
      "Fresh farm tomatoes picked carefully and packed for buyers. Suitable for household cooking, shops, and food preparation.",
    images: [
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80",
    ],
  },
]

export function formatSamplePrice(product: Pick<SampleProduct, "price" | "unit">) {
  return `Rs. ${product.price} / ${product.unit}`
}

export function getSampleProduct(id: string) {
  return sampleProducts.find((product) => product.id === id) ?? null
}

export function mapSampleProductToApprovedProduct(product: SampleProduct): ApprovedProduct {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    sellerName: "RaithuBridge verified seller",
    sellerLocation: product.location,
    price: formatSamplePrice(product),
    quantity: "1",
    unit: product.unit,
    unitSize: product.unit,
    status: product.availability === "In Stock" ? "Active" : "Sold Out",
    stockCount: product.availability === "In Stock" ? 1 : 0,
    inStock: product.availability === "In Stock",
    description: product.description,
    deliveryInfo: "Contact the seller to confirm pickup, delivery, and final quantity.",
    sellerInfo: "",
    mediaAssets: product.images.map((url, index) => ({
      url,
      path: `${product.id}-${index + 1}`,
      type: "image" as const,
      mimeType: "image/jpeg",
      name: `${product.name} image ${index + 1}`,
      size: 0,
      isPublic: true,
      isPrimary: index === 0,
      status: "approved" as const,
    })),
  }
}

export const sampleApprovedProducts = sampleProducts.map(mapSampleProductToApprovedProduct)

import type { ProductAvailabilityStatus, ProductReviewStatus } from "@/lib/domain"

export type DiscoveryListing = {
  id: string
  name: string
  category: string
  locationLine: string
}

export type ApprovedProduct = {
  id: string
  name: string
  category: string
  sellerName: string
  sellerLocation: string
  price: string
  quantity: string
  unit: string
  unitSize: string
  status: ProductAvailabilityStatus
  stockCount: number
  inStock: boolean
  description: string
  deliveryInfo: string
  sellerInfo: string
  mediaAssets: ProductMediaAsset[]
}

export type ProductMediaAsset = {
  id?: string
  url: string
  path: string
  type: "image" | "video"
  mimeType: string
  name: string
  size: number
  isPublic?: boolean
  isPrimary?: boolean
  uploadedBy?: "farmer" | "admin"
  status?: "pending" | "approved" | "ignored"
}

export type SubmissionStatus = ProductReviewStatus

export type PendingSubmission = {
  id: string
  sellerName: string
  sellerPhone: string
  sellerWhatsapp: string
  sellerVillageCity: string
  sellerDistrict: string
  sellerState: string
  productName: string
  category: string
  categoryId?: string | null
  quantityAvailable: string
  quantityValue?: number
  unit: string
  price: string
  priceValue?: number
  description: string
  status: SubmissionStatus
  adminComment: string
  mediaAssets?: ProductMediaAsset[]
  submittedAt: string
}

export type InventoryItem = {
  id: string
  productName: string
  sellerName: string
  category: string
  quantity: string
  unit: string
  price: string
  status: SubmissionStatus
  location: string
  stockCount: number
  inStock: boolean
  mediaAssets?: ProductMediaAsset[]
}

export const DISCOVERY_LISTINGS: DiscoveryListing[] = [
  {
    id: "disc-chilli-powder",
    name: "Guntur Chilli Powder",
    category: "Spices & masalas",
    locationLine: "Listed by sellers in Telangana",
  },
  {
    id: "disc-peanuts",
    name: "Bold Java Peanuts",
    category: "Oilseeds & nuts",
    locationLine: "Listed by sellers in Gujarat",
  },
  {
    id: "disc-cashews",
    name: "W320 Cashew Kernels",
    category: "Oilseeds & nuts",
    locationLine: "Listed by sellers in Andhra Pradesh",
  },
  {
    id: "disc-turmeric",
    name: "Turmeric Fingers",
    category: "Spices & masalas",
    locationLine: "Listed by sellers in Maharashtra",
  },
]

export const APPROVED_PRODUCTS: ApprovedProduct[] = [
  {
    id: "ap-1",
    name: "Guntur Chilli Powder",
    category: "Spices & masalas",
    sellerName: "Ramesh Reddy",
    sellerLocation: "Warangal, Telangana",
    price: "Rs. 118 / kg",
    quantity: "400",
    unit: "kg",
    unitSize: "1 kg packets and 25 kg sacks",
    status: "Active",
    stockCount: 400,
    inStock: true,
    description:
      "Medium-heat chilli powder made from dried Guntur chillies. Good color, clean aroma, and suitable for home kitchens, caterers, and small food businesses.",
    deliveryInfo: "Pickup from Warangal or local delivery by arrangement.",
    sellerInfo: "Family-run farm and spice processor with seasonal chilli sourcing.",
    mediaAssets: [
      {
        url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80",
        path: "sample/chilli-powder-photo",
        type: "image",
        mimeType: "image/jpeg",
        name: "Chilli powder photo",
        size: 420000,
      },
      {
        url: "",
        path: "sample/chilli-powder-video",
        type: "video",
        mimeType: "video/mp4",
        name: "Grinding and packing video",
        size: 1800000,
      },
    ],
  },
  {
    id: "ap-2",
    name: "Bold Java Peanuts",
    category: "Oilseeds & nuts",
    sellerName: "Mehul Patel",
    sellerLocation: "Junagadh, Gujarat",
    price: "Rs. 92 / kg",
    quantity: "2",
    unit: "tonnes",
    unitSize: "50 kg bags",
    status: "Active",
    stockCount: 2000,
    inStock: true,
    description:
      "Bold Java peanuts with clean sorting and low broken count. Suitable for roasting, oil extraction, and snack preparation.",
    deliveryInfo: "Seller can coordinate truck pickup from Junagadh.",
    sellerInfo: "Regional seller working with nearby groundnut farmers.",
    mediaAssets: [
      {
        url: "https://images.unsplash.com/photo-1567892737950-30c4db37cd89?auto=format&fit=crop&w=1200&q=80",
        path: "sample/peanuts-photo",
        type: "image",
        mimeType: "image/jpeg",
        name: "Peanuts photo",
        size: 390000,
      },
      {
        url: "",
        path: "sample/peanuts-video",
        type: "video",
        mimeType: "video/mp4",
        name: "Sorting table video",
        size: 2200000,
      },
    ],
  },
  {
    id: "ap-3",
    name: "W320 Cashew Kernels",
    category: "Oilseeds & nuts",
    sellerName: "Anitha Devi",
    sellerLocation: "Krishna, Andhra Pradesh",
    price: "Rs. 720 / kg",
    quantity: "350",
    unit: "kg",
    unitSize: "10 kg cartons",
    status: "Active",
    stockCount: 350,
    inStock: true,
    description:
      "W320 cashew kernels with bright color and consistent sizing. Packed for direct purchase after review.",
    deliveryInfo: "Courier and transport pickup options available from Krishna district.",
    sellerInfo: "Small processing unit listing verified cashew stock.",
    mediaAssets: [
      {
        url: "https://images.unsplash.com/photo-1563412885-139e4045ebf2?auto=format&fit=crop&w=1200&q=80",
        path: "sample/cashews-photo",
        type: "image",
        mimeType: "image/jpeg",
        name: "Cashew kernels photo",
        size: 510000,
      },
      {
        url: "",
        path: "sample/cashews-video",
        type: "video",
        mimeType: "video/mp4",
        name: "Packing video",
        size: 1750000,
      },
    ],
  },
  {
    id: "ap-4",
    name: "Salem Turmeric Fingers",
    category: "Spices & masalas",
    sellerName: "Mahadev Jadhav",
    sellerLocation: "Sangli, Maharashtra",
    price: "Rs. 105 / kg",
    quantity: "1.2",
    unit: "tonnes",
    unitSize: "25 kg bags",
    status: "Active",
    stockCount: 1200,
    inStock: true,
    description:
      "Dried turmeric fingers with strong color and earthy aroma. Suitable for grinding or direct resale.",
    deliveryInfo: "Seasonal dispatch from Sangli with buyer-arranged transport.",
    sellerInfo: "Farm seller with fresh-season turmeric stock.",
    mediaAssets: [
      {
        url: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=1200&q=80",
        path: "sample/turmeric-photo",
        type: "image",
        mimeType: "image/jpeg",
        name: "Turmeric fingers photo",
        size: 470000,
      },
      {
        url: "",
        path: "sample/turmeric-video",
        type: "video",
        mimeType: "video/mp4",
        name: "Drying yard video",
        size: 2100000,
      },
    ],
  },
  {
    id: "ap-5",
    name: "Byadgi Dried Red Chillies",
    category: "Fresh & dried produce",
    sellerName: "Lakshmi Gowda",
    sellerLocation: "Raichur, Karnataka",
    price: "Rs. 185 / kg",
    quantity: "800",
    unit: "kg",
    unitSize: "10 kg and 25 kg bags",
    status: "Active",
    stockCount: 800,
    inStock: true,
    description:
      "Byadgi dried red chillies with deep color and mild heat. Selected for color extraction, cooking, and resale.",
    deliveryInfo: "Pickup from Raichur market yard or seller-arranged delivery nearby.",
    sellerInfo: "Seller aggregates graded chillies from local growers.",
    mediaAssets: [
      {
        url: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=1200&q=80",
        path: "sample/red-chillies-photo",
        type: "image",
        mimeType: "image/jpeg",
        name: "Dried red chillies photo",
        size: 430000,
      },
      {
        url: "",
        path: "sample/red-chillies-video",
        type: "video",
        mimeType: "video/mp4",
        name: "Grade inspection video",
        size: 2000000,
      },
    ],
  },
  {
    id: "ap-6",
    name: "Sona Masoori Rice",
    category: "Grains",
    sellerName: "Kiran Kumar",
    sellerLocation: "Karimnagar, Telangana",
    price: "Rs. 42 / kg",
    quantity: "12",
    unit: "tonnes",
    unitSize: "26 kg bags",
    status: "Active",
    stockCount: 12000,
    inStock: true,
    description:
      "Sona Masoori rice with clean grains and standard bag packing. Suitable for household, shop, and food service use.",
    deliveryInfo: "Warehouse pickup from Karimnagar. Transport can be coordinated after confirmation.",
    sellerInfo: "Rice mill partner listing reviewed stock from local farms.",
    mediaAssets: [
      {
        url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80",
        path: "sample/rice-photo",
        type: "image",
        mimeType: "image/jpeg",
        name: "Sona Masoori rice photo",
        size: 460000,
      },
      {
        url: "",
        path: "sample/rice-video",
        type: "video",
        mimeType: "video/mp4",
        name: "Bagging video",
        size: 2400000,
      },
    ],
  },
]

export const SAMPLE_SUBMISSIONS: PendingSubmission[] = [
  {
    id: "sub-101",
    sellerName: "Ramesh Reddy",
    sellerPhone: "+91 98450 11223",
    sellerWhatsapp: "+91 98450 11223",
    sellerVillageCity: "Gopalpur",
    sellerDistrict: "Medak",
    sellerState: "Telangana",
    productName: "Cold-pressed Groundnut Oil",
    category: "Oils",
    quantityAvailable: "120",
    unit: "L",
    price: "Rs. 210 / litre",
    description: "First extract groundnut oil packed in clean cans.",
    status: "Pending Review",
    adminComment: "We are checking product details and contact information.",
    submittedAt: "May 14, 2026",
  },
  {
    id: "sub-102",
    sellerName: "Lakshmi Devi",
    sellerPhone: "+91 98765 44321",
    sellerWhatsapp: "+91 98765 44321",
    sellerVillageCity: "Kattumannarkoil",
    sellerDistrict: "Cuddalore",
    sellerState: "Tamil Nadu",
    productName: "Boiled Ponni Rice",
    category: "Grains",
    quantityAvailable: "45",
    unit: "quintal",
    price: "Rs. 48 / kg",
    description: "New season rice with moisture details available.",
    status: "On Hold",
    adminComment: "Please add clearer photos of the rice bags and update the packing size.",
    submittedAt: "May 13, 2026",
  },
  {
    id: "sub-103",
    sellerName: "Harpreet Singh",
    sellerPhone: "+91 98155 00900",
    sellerWhatsapp: "+91 98155 00901",
    sellerVillageCity: "Talwandi Sabo",
    sellerDistrict: "Bathinda",
    sellerState: "Punjab",
    productName: "Wheat",
    category: "Grains",
    quantityAvailable: "200",
    unit: "quintal",
    price: "Rs. 24 / kg",
    description: "Cleaned wheat available for direct purchase.",
    status: "Approved",
    adminComment: "Approved. This listing is ready to appear in inventory.",
    submittedAt: "May 11, 2026",
  },
  {
    id: "sub-104",
    sellerName: "Asha Naik",
    sellerPhone: "+91 99002 11445",
    sellerWhatsapp: "+91 99002 11445",
    sellerVillageCity: "Sirsi",
    sellerDistrict: "Uttara Kannada",
    sellerState: "Karnataka",
    productName: "Areca Nut",
    category: "Nuts",
    quantityAvailable: "75",
    unit: "bags",
    price: "Rs. 315 / kg",
    description: "Dried areca nut with mixed sizing.",
    status: "Rejected",
    adminComment: "Rejected for now because the pricing and grade information are incomplete.",
    submittedAt: "May 9, 2026",
  },
]

export const INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: "inv-1",
    productName: "Guntur Chilli Powder",
    sellerName: "Ramesh Reddy",
    category: "Spices & masalas",
    quantity: "400",
    unit: "kg",
    price: "Rs. 118 / kg",
    status: "Approved",
    location: "Warangal, Telangana",
    stockCount: 400,
    inStock: true,
  },
  {
    id: "inv-2",
    productName: "Boiled Ponni Rice",
    sellerName: "Lakshmi Devi",
    category: "Grains",
    quantity: "45",
    unit: "quintal",
    price: "Rs. 48 / kg",
    status: "On Hold",
    location: "Cuddalore, Tamil Nadu",
    stockCount: 45,
    inStock: true,
  },
  {
    id: "inv-3",
    productName: "Cold-pressed Groundnut Oil",
    sellerName: "Ramesh Reddy",
    category: "Oils",
    quantity: "120",
    unit: "L",
    price: "Rs. 210 / litre",
    status: "Pending Review",
    location: "Medak, Telangana",
    stockCount: 120,
    inStock: true,
  },
  {
    id: "inv-4",
    productName: "Areca Nut",
    sellerName: "Asha Naik",
    category: "Nuts",
    quantity: "75",
    unit: "bags",
    price: "Rs. 315 / kg",
    status: "Rejected",
    location: "Uttara Kannada, Karnataka",
    stockCount: 0,
    inStock: false,
  },
]

export const PRICE_VARIES_NOTE = "Price varies by seller and quantity"

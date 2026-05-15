export type DiscoveryListing = {
  id: string
  name: string
  category: string
  locationLine: string
}

/** Homepage category spotlight — sample discovery listings */
export const DISCOVERY_LISTINGS: DiscoveryListing[] = [
  {
    id: "disc-chilli-powder",
    name: "Chilli Powder",
    category: "Spices & masalas",
    locationLine: "Available from Telangana farmers",
  },
  {
    id: "disc-peanuts",
    name: "Peanuts",
    category: "Oilseeds & nuts",
    locationLine: "Available from Gujarat farmers",
  },
  {
    id: "disc-cashews",
    name: "Cashews",
    category: "Oilseeds & nuts",
    locationLine: "Available from Andhra Pradesh farmers",
  },
  {
    id: "disc-turmeric",
    name: "Turmeric",
    category: "Spices & masalas",
    locationLine: "Available from Maharashtra farmers",
  },
  {
    id: "disc-red-chillies",
    name: "Red Chillies",
    category: "Fresh & dried produce",
    locationLine: "Available from Karnataka farmers",
  },
  {
    id: "disc-rice",
    name: "Rice",
    category: "Grains",
    locationLine: "Available from Telangana farmers",
  },
  {
    id: "disc-jaggery",
    name: "Jaggery",
    category: "Sweeteners",
    locationLine: "Available from Uttar Pradesh farmers",
  },
  {
    id: "disc-pulses",
    name: "Pulses",
    category: "Pulses & lentils",
    locationLine: "Available from Madhya Pradesh farmers",
  },
]

export type ApprovedProduct = {
  id: string
  name: string
  category: string
  farmerLocation: string
  price: string
  quantity: string
}

/** Shown on /products — approved sample catalog only */
export const APPROVED_PRODUCTS: ApprovedProduct[] = [
  {
    id: "ap-1",
    name: "Guntur Chilli Powder (medium heat)",
    category: "Spices & masalas",
    farmerLocation: "Warangal district, Telangana",
    price: "₹118 / kg",
    quantity: "400 kg available",
  },
  {
    id: "ap-2",
    name: "Bold Java Peanuts",
    category: "Oilseeds & nuts",
    farmerLocation: "Junagadh district, Gujarat",
    price: "₹92 / kg",
    quantity: "2 tonnes available",
  },
  {
    id: "ap-3",
    name: "W320 Cashew Kernels",
    category: "Oilseeds & nuts",
    farmerLocation: "Krishna district, Andhra Pradesh",
    price: "₹720 / kg",
    quantity: "350 kg available",
  },
  {
    id: "ap-4",
    name: "Salem Turmeric Fingers",
    category: "Spices & masalas",
    farmerLocation: "Sangli district, Maharashtra",
    price: "₹105 / kg",
    quantity: "1.2 tonnes available",
  },
  {
    id: "ap-5",
    name: "Byadgi Dried Red Chillies",
    category: "Fresh & dried produce",
    farmerLocation: "Raichur district, Karnataka",
    price: "₹185 / kg",
    quantity: "800 kg available",
  },
  {
    id: "ap-6",
    name: "Sona Masoori Rice",
    category: "Grains",
    farmerLocation: "Karimnagar district, Telangana",
    price: "₹42 / kg",
    quantity: "12 tonnes available",
  },
  {
    id: "ap-7",
    name: "Organic Jaggery Blocks",
    category: "Sweeteners",
    farmerLocation: "Muzaffarnagar district, Uttar Pradesh",
    price: "₹58 / kg",
    quantity: "600 kg available",
  },
  {
    id: "ap-8",
    name: "Tur Dal (unpolished)",
    category: "Pulses & lentils",
    farmerLocation: "Hoshangabad district, Madhya Pradesh",
    price: "₹112 / kg",
    quantity: "3 tonnes available",
  },
]

export type PendingSubmission = {
  id: string
  farmerName: string
  phone: string
  whatsapp: string
  village: string
  district: string
  state: string
  productName: string
  category: string
  quantityAvailable: string
  unit: string
  price: string
  description: string
  submittedAt: string
}

/** Admin review queue — static sample data */
export const PENDING_SUBMISSIONS: PendingSubmission[] = [
  {
    id: "pend-1",
    farmerName: "Ramesh Reddy",
    phone: "+91 98450 11223",
    whatsapp: "+91 98450 11223",
    village: "Gopalpur",
    district: "Medak",
    state: "Telangana",
    productName: "Cold-pressed Groundnut Oil (bulk)",
    category: "Oils",
    quantityAvailable: "120",
    unit: "L",
    price: "₹210 / litre",
    description: "First extract; can supply monthly to hotels.",
    submittedAt: "2026-05-12",
  },
  {
    id: "pend-2",
    farmerName: "Lakshmi Devi",
    phone: "+91 98765 44321",
    whatsapp: "+91 98765 44321",
    village: "Kattumannarkoil",
    district: "Cuddalore",
    state: "Tamil Nadu",
    productName: "Boiled Ponni Rice",
    category: "Grains",
    quantityAvailable: "45",
    unit: "Quintal",
    price: "₹48 / kg",
    description: "New season; moisture tested.",
    submittedAt: "2026-05-11",
  },
  {
    id: "pend-3",
    farmerName: "Harpreet Singh",
    phone: "+91 98155 00900",
    whatsapp: "+91 98155 00901",
    village: "Talwandi Sabo",
    district: "Bathinda",
    state: "Punjab",
    productName: "Wheat (MP Sharbati)",
    category: "Grains",
    quantityAvailable: "200",
    unit: "Quintal",
    price: "₹24 / kg",
    description: "Bulk only; FSSAI-friendly packing available.",
    submittedAt: "2026-05-10",
  },
]

export const PRICE_VARIES_NOTE = "Price varies by quantity"

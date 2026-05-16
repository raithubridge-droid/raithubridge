export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type UserRole = "user" | "admin"
type ProductReviewStatus = "Pending Review" | "On Hold" | "Approved" | "Rejected"
type ProductAvailabilityStatus = "Active" | "Inactive" | "Sold Out"
type ProductStatus =
  | "Pending"
  | "Pending Review"
  | "On Hold"
  | "Approved"
  | "Rejected"
  | "pending"
  | "on_hold"
  | "approved"
  | "rejected"
  | "available"
  | "limited"
  | "seasonal"
  | "draft"
  | "archived"
type CartStatus = "active" | "converted" | "abandoned"
type OrderStatus = "pending" | "confirmed" | "cancelled" | "paid"
type PaymentStatus = "pending" | "authorized" | "paid" | "failed" | "refunded"

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          phone: string | null
          role: UserRole
          whatsapp: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          role?: UserRole
          whatsapp?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          role?: UserRole
          whatsapp?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          display_order?: number
          created_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          seller_id: string | null
          category_id: string | null
          name: string
          slug: string
          description: string
          price: number
          currency: string
          unit: string
          unit_size: string
          quantity_available: number
          seller_name: string
          seller_phone: string | null
          seller_whatsapp: string | null
          seller_village_city: string | null
          seller_district: string | null
          seller_state: string | null
          seller_location: string
          delivery_info: string | null
          seller_info: string | null
          status: ProductStatus
          review_status: ProductReviewStatus
          availability_status: ProductAvailabilityStatus
          is_active: boolean
          admin_comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id?: string | null
          category_id?: string | null
          name: string
          slug: string
          description: string
          price: number
          currency?: string
          unit: string
          unit_size: string
          quantity_available?: number
          seller_name: string
          seller_phone?: string | null
          seller_whatsapp?: string | null
          seller_village_city?: string | null
          seller_district?: string | null
          seller_state?: string | null
          seller_location: string
          delivery_info?: string | null
          seller_info?: string | null
          status?: ProductStatus
          review_status?: ProductReviewStatus
          availability_status?: ProductAvailabilityStatus
          is_active?: boolean
          admin_comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string | null
          category_id?: string | null
          name?: string
          slug?: string
          description?: string
          price?: number
          currency?: string
          unit?: string
          unit_size?: string
          quantity_available?: number
          seller_name?: string
          seller_phone?: string | null
          seller_whatsapp?: string | null
          seller_village_city?: string | null
          seller_district?: string | null
          seller_state?: string | null
          seller_location?: string
          delivery_info?: string | null
          seller_info?: string | null
          status?: ProductStatus
          review_status?: ProductReviewStatus
          availability_status?: ProductAvailabilityStatus
          is_active?: boolean
          admin_comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_media: {
        Row: {
          id: string
          product_id: string
          url: string
          storage_path: string | null
          media_type: "image" | "video"
          mime_type: string | null
          name: string
          size_bytes: number
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          storage_path?: string | null
          media_type: "image" | "video"
          mime_type?: string | null
          name: string
          size_bytes?: number
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          url?: string
          storage_path?: string | null
          media_type?: "image" | "video"
          mime_type?: string | null
          name?: string
          size_bytes?: number
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          id: string
          product_id: string
          stock_count: number
          in_stock: boolean
          availability_status: ProductAvailabilityStatus
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          stock_count?: number
          in_stock?: boolean
          availability_status?: ProductAvailabilityStatus
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          stock_count?: number
          in_stock?: boolean
          availability_status?: ProductAvailabilityStatus
          updated_at?: string
        }
        Relationships: []
      }
      carts: {
        Row: {
          id: string
          user_id: string | null
          guest_id: string | null
          status: CartStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          guest_id?: string | null
          status?: CartStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          guest_id?: string | null
          status?: CartStatus
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          product_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          product_id: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cart_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          cart_id: string | null
          status: OrderStatus
          items: Json
          subtotal_amount: number
          currency: string
          customer_name: string | null
          customer_email: string | null
          customer_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          cart_id?: string | null
          status?: OrderStatus
          items?: Json
          subtotal_amount?: number
          currency?: string
          customer_name?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          cart_id?: string | null
          status?: OrderStatus
          items?: Json
          subtotal_amount?: number
          currency?: string
          customer_name?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          order_id: string
          provider: string | null
          provider_payment_id: string | null
          amount: number
          currency: string
          status: PaymentStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          provider?: string | null
          provider_payment_id?: string | null
          amount: number
          currency?: string
          status?: PaymentStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          provider?: string | null
          provider_payment_id?: string | null
          amount?: number
          currency?: string
          status?: PaymentStatus
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

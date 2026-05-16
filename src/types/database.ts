export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type UserRole = "buyer" | "seller" | "admin"
type ProductStatus = "available" | "limited" | "seasonal" | "draft" | "archived"
type AvailabilityStatus = "in_stock" | "out_of_stock"
type CartStatus = "active" | "converted" | "abandoned"
type OrderStatus = "pending" | "confirmed" | "cancelled" | "paid"
type PaymentStatus = "pending" | "authorized" | "paid" | "failed" | "refunded"

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          role: UserRole
          phone: string | null
          whatsapp: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          role?: UserRole
          phone?: string | null
          whatsapp?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          role?: UserRole
          phone?: string | null
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
          seller_location: string
          delivery_info: string | null
          seller_info: string | null
          status: ProductStatus
          is_active: boolean
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
          seller_location: string
          delivery_info?: string | null
          seller_info?: string | null
          status?: ProductStatus
          is_active?: boolean
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
          seller_location?: string
          delivery_info?: string | null
          seller_info?: string | null
          status?: ProductStatus
          is_active?: boolean
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
          availability_status: AvailabilityStatus
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          stock_count?: number
          in_stock?: boolean
          availability_status?: AvailabilityStatus
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          stock_count?: number
          in_stock?: boolean
          availability_status?: AvailabilityStatus
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
    Views: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

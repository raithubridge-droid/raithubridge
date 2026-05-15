/**
 * Placeholder schema for `createClient<Database>()`.
 *
 * After you create tables in Supabase, replace this file with generated types:
 * `npx supabase gen types typescript --project-id <id> > src/types/database.ts`
 *
 * See `src/lib/supabase/schema.sql` for the intended tables (auth profiles, products,
 * farmer submissions, admin approval).
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      farmer_submissions: {
        Row: {
          id: string
          user_id: string | null
          farmer_name: string
          phone: string
          whatsapp: string
          village: string
          district: string
          state: string
          product_name: string
          category: string
          quantity_available: string
          unit: string
          price: string
          description: string
          media_assets: Json
          status: "pending" | "approved" | "rejected"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          farmer_name: string
          phone: string
          whatsapp: string
          village: string
          district: string
          state: string
          product_name: string
          category: string
          quantity_available: string
          unit: string
          price: string
          description: string
          media_assets?: Json
          status?: "pending" | "approved" | "rejected"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          farmer_name?: string
          phone?: string
          whatsapp?: string
          village?: string
          district?: string
          state?: string
          product_name?: string
          category?: string
          quantity_available?: string
          unit?: string
          price?: string
          description?: string
          media_assets?: Json
          status?: "pending" | "approved" | "rejected"
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          role: "farmer" | "buyer" | "admin"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          role?: "farmer" | "buyer" | "admin"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          role?: "farmer" | "buyer" | "admin"
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          submission_id: string | null
          farmer_user_id: string | null
          name: string
          category: string
          farmer_location: string
          price_display: string
          quantity_display: string
          media_assets: Json
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          submission_id?: string | null
          farmer_user_id?: string | null
          name: string
          category: string
          farmer_location: string
          price_display: string
          quantity_display: string
          media_assets?: Json
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          submission_id?: string | null
          farmer_user_id?: string | null
          name?: string
          category?: string
          farmer_location?: string
          price_display?: string
          quantity_display?: string
          media_assets?: Json
          is_approved?: boolean
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

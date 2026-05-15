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
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

/**
 * Supabase DB tipleri.
 * Gerçek projede `supabase gen types typescript` ile üretilebilir; burada
 * şema (0001_init.sql) ile birebir elle tutulan, tip güvenli bir sürüm.
 */

export type Database = {
  public: {
    Tables: {
      brands: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          catalog_pdf_url: string | null;
          sort_order: number | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          catalog_pdf_url?: string | null;
          sort_order?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["brands"]["Insert"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          sort_order: number | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          sort_order?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      subcategories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category_id: string | null;
          sort_order: number | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category_id?: string | null;
          sort_order?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["subcategories"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          sku: string | null;
          brand_id: string | null;
          category_id: string | null;
          subcategory_id: string | null;
          list_price: number;
          currency: string | null;
          unit: string | null;
          vat_rate: number | null;
          image_url: string | null;
          description: string | null;
          is_active: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          sku?: string | null;
          brand_id?: string | null;
          category_id?: string | null;
          subcategory_id?: string | null;
          list_price: number;
          currency?: string | null;
          unit?: string | null;
          vat_rate?: number | null;
          image_url?: string | null;
          description?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      quotes: {
        Row: {
          id: string;
          quote_number: string | null;
          customer_name: string;
          company: string | null;
          email: string;
          phone: string | null;
          note: string | null;
          status: string | null;
          global_discount_rate: number | null;
          subtotal: number | null;
          discount_total: number | null;
          vat_total: number | null;
          grand_total: number | null;
          valid_until: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          quote_number?: string | null;
          customer_name: string;
          company?: string | null;
          email: string;
          phone?: string | null;
          note?: string | null;
          status?: string | null;
          global_discount_rate?: number | null;
          subtotal?: number | null;
          discount_total?: number | null;
          vat_total?: number | null;
          grand_total?: number | null;
          valid_until?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["quotes"]["Insert"]>;
        Relationships: [];
      };
      quote_items: {
        Row: {
          id: string;
          quote_id: string | null;
          product_id: string | null;
          product_name: string | null;
          sku: string | null;
          qty: number;
          list_price: number;
          discount_rate: number | null;
          vat_rate: number | null;
          note: string | null;
        };
        Insert: {
          id?: string;
          quote_id?: string | null;
          product_id?: string | null;
          product_name?: string | null;
          sku?: string | null;
          qty?: number;
          list_price: number;
          discount_rate?: number | null;
          vat_rate?: number | null;
          note?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["quote_items"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Kısayol tipler
export type BrandRow = Database["public"]["Tables"]["brands"]["Row"];
export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
export type SubcategoryRow = Database["public"]["Tables"]["subcategories"]["Row"];
export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type QuoteRow = Database["public"]["Tables"]["quotes"]["Row"];
export type QuoteItemRow = Database["public"]["Tables"]["quote_items"]["Row"];

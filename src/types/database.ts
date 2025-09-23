export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      species: {
        Row: {
          id: string
          scientific_name: string
          common_name_de: string
          common_name_en: string | null
          description_de: string | null
          description_en: string | null
          care_notes_de: string | null
          care_notes_en: string | null
          flowering_period_start: number | null
          flowering_period_end: number | null
          hardiness_zone_min: number | null
          hardiness_zone_max: number | null
          max_height_cm: number | null
          max_width_cm: number | null
          sun_exposure: 'full_sun' | 'partial_shade' | 'shade' | null
          soil_type: 'acidic' | 'neutral' | 'alkaline' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          scientific_name: string
          common_name_de: string
          common_name_en?: string | null
          description_de?: string | null
          description_en?: string | null
          care_notes_de?: string | null
          care_notes_en?: string | null
          flowering_period_start?: number | null
          flowering_period_end?: number | null
          hardiness_zone_min?: number | null
          hardiness_zone_max?: number | null
          max_height_cm?: number | null
          max_width_cm?: number | null
          sun_exposure?: 'full_sun' | 'partial_shade' | 'shade' | null
          soil_type?: 'acidic' | 'neutral' | 'alkaline' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          scientific_name?: string
          common_name_de?: string
          common_name_en?: string | null
          description_de?: string | null
          description_en?: string | null
          care_notes_de?: string | null
          care_notes_en?: string | null
          flowering_period_start?: number | null
          flowering_period_end?: number | null
          hardiness_zone_min?: number | null
          hardiness_zone_max?: number | null
          max_height_cm?: number | null
          max_width_cm?: number | null
          sun_exposure?: 'full_sun' | 'partial_shade' | 'shade' | null
          soil_type?: 'acidic' | 'neutral' | 'alkaline' | null
          created_at?: string
          updated_at?: string
        }
      }
      cultivars: {
        Row: {
          id: string
          species_id: string
          cultivar_name: string
          breeder: string | null
          year_introduced: number | null
          flower_color: string | null
          flower_form: string | null
          flower_size: string | null
          foliage_type: string | null
          growth_habit: string | null
          special_characteristics: string | null
          hardiness_rating: number | null
          price_group: 'A' | 'B' | 'C' | null
          photo_url: string | null
          photo_alt_text_de: string | null
          photo_alt_text_en: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          species_id: string
          cultivar_name: string
          breeder?: string | null
          year_introduced?: number | null
          flower_color?: string | null
          flower_form?: string | null
          flower_size?: string | null
          foliage_type?: string | null
          growth_habit?: string | null
          special_characteristics?: string | null
          hardiness_rating?: number | null
          price_group?: 'A' | 'B' | 'C' | null
          photo_url?: string | null
          photo_alt_text_de?: string | null
          photo_alt_text_en?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          species_id?: string
          cultivar_name?: string
          breeder?: string | null
          year_introduced?: number | null
          flower_color?: string | null
          flower_form?: string | null
          flower_size?: string | null
          foliage_type?: string | null
          growth_habit?: string | null
          special_characteristics?: string | null
          hardiness_rating?: number | null
          price_group?: 'A' | 'B' | 'C' | null
          photo_url?: string | null
          photo_alt_text_de?: string | null
          photo_alt_text_en?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pricing_matrix: {
        Row: {
          id: string
          price_group: 'A' | 'B' | 'C'
          age_years: number
          pot_size: string
          base_price_euros: number
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          price_group: 'A' | 'B' | 'C'
          age_years: number
          pot_size: string
          base_price_euros: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          price_group?: 'A' | 'B' | 'C'
          age_years?: number
          pot_size?: string
          base_price_euros?: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      plants: {
        Row: {
          id: string
          cultivar_id: string
          plant_code: string | null
          age_years: number
          height_cm: number | null
          width_cm: number | null
          pot_size: string | null
          price_band: 'budget' | 'standard' | 'premium' | 'luxury' | null
          price_euros: number | null
          status: 'available' | 'reserved' | 'sold' | 'maintenance'
          location: string | null
          notes: string | null
          is_quick_buy: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cultivar_id: string
          plant_code?: string | null
          age_years: number
          height_cm?: number | null
          width_cm?: number | null
          pot_size?: string | null
          price_band?: 'budget' | 'standard' | 'premium' | 'luxury' | null
          price_euros?: number | null
          status?: 'available' | 'reserved' | 'sold' | 'maintenance'
          location?: string | null
          notes?: string | null
          is_quick_buy?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cultivar_id?: string
          plant_code?: string | null
          age_years?: number
          height_cm?: number | null
          width_cm?: number | null
          pot_size?: string | null
          price_band?: 'budget' | 'standard' | 'premium' | 'luxury' | null
          price_euros?: number | null
          status?: 'available' | 'reserved' | 'sold' | 'maintenance'
          location?: string | null
          notes?: string | null
          is_quick_buy?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          company_name: string | null
          phone: string | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          postal_code: string | null
          country: string
          language: string
          role_id: string | null
          is_b2b_customer: boolean
          b2b_discount_percentage: number
          notes: string | null
          profile_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          phone?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string
          language?: string
          role_id?: string | null
          is_b2b_customer?: boolean
          b2b_discount_percentage?: number
          notes?: string | null
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          phone?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string
          language?: string
          role_id?: string | null
          is_b2b_customer?: boolean
          b2b_discount_percentage?: number
          notes?: string | null
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          order_type: 'retail' | 'b2b' | 'quote'
          subtotal: number
          tax_amount: number
          discount_amount: number
          total_amount: number
          currency: string
          payment_method: string | null
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          shipping_address: Json | null
          billing_address: Json | null
          notes: string | null
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          user_id: string
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          order_type?: 'retail' | 'b2b' | 'quote'
          subtotal: number
          tax_amount?: number
          discount_amount?: number
          total_amount: number
          currency?: string
          payment_method?: string | null
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          shipping_address?: Json | null
          billing_address?: Json | null
          notes?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          order_type?: 'retail' | 'b2b' | 'quote'
          subtotal?: number
          tax_amount?: number
          discount_amount?: number
          total_amount?: number
          currency?: string
          payment_method?: string | null
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          shipping_address?: Json | null
          billing_address?: Json | null
          notes?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name_de: string
          name_en: string
          description_de: string | null
          description_en: string | null
          category: string
          sku: string
          price_euros: number
          stock_quantity: number
          min_stock_level: number
          weight_kg: number | null
          dimensions_cm: string | null
          image_url: string | null
          image_alt_text_de: string | null
          image_alt_text_en: string | null
          is_active: boolean
          is_featured: boolean
          sort_order: number
          seo_title_de: string | null
          seo_title_en: string | null
          seo_description_de: string | null
          seo_description_en: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name_de: string
          name_en: string
          description_de?: string | null
          description_en?: string | null
          category: string
          sku: string
          price_euros: number
          stock_quantity?: number
          min_stock_level?: number
          weight_kg?: number | null
          dimensions_cm?: string | null
          image_url?: string | null
          image_alt_text_de?: string | null
          image_alt_text_en?: string | null
          is_active?: boolean
          is_featured?: boolean
          sort_order?: number
          seo_title_de?: string | null
          seo_title_en?: string | null
          seo_description_de?: string | null
          seo_description_en?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name_de?: string
          name_en?: string
          description_de?: string | null
          description_en?: string | null
          category?: string
          sku?: string
          price_euros?: number
          stock_quantity?: number
          min_stock_level?: number
          weight_kg?: number | null
          dimensions_cm?: string | null
          image_url?: string | null
          image_alt_text_de?: string | null
          image_alt_text_en?: string | null
          is_active?: boolean
          is_featured?: boolean
          sort_order?: number
          seo_title_de?: string | null
          seo_title_en?: string | null
          seo_description_de?: string | null
          seo_description_en?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Add more tables as needed...
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

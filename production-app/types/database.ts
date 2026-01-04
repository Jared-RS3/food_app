/**
 * Database Types
 * Auto-generated from Supabase schema
 * Run: supabase gen types typescript --local > types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: 'customer' | 'admin' | 'restaurant_owner';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: 'customer' | 'admin' | 'restaurant_owner';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: 'customer' | 'admin' | 'restaurant_owner';
          updated_at?: string;
        };
      };
      restaurants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          cuisine_type: string;
          address: string;
          city: string;
          latitude: number | null;
          longitude: number | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          image_url: string | null;
          banner_url: string | null;
          rating: number;
          reviews_count: number;
          price_range: number;
          delivery_time: number | null;
          minimum_order: number | null;
          delivery_fee: number | null;
          is_active: boolean;
          is_featured: boolean;
          owner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          cuisine_type: string;
          address: string;
          city: string;
          latitude?: number | null;
          longitude?: number | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          image_url?: string | null;
          banner_url?: string | null;
          rating?: number;
          reviews_count?: number;
          price_range?: number;
          delivery_time?: number | null;
          minimum_order?: number | null;
          delivery_fee?: number | null;
          is_active?: boolean;
          is_featured?: boolean;
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          cuisine_type?: string;
          address?: string;
          city?: string;
          latitude?: number | null;
          longitude?: number | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          image_url?: string | null;
          banner_url?: string | null;
          rating?: number;
          reviews_count?: number;
          price_range?: number;
          delivery_time?: number | null;
          minimum_order?: number | null;
          delivery_fee?: number | null;
          is_active?: boolean;
          is_featured?: boolean;
          updated_at?: string;
        };
      };
      menu_items: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          description: string | null;
          category: string;
          price: number;
          image_url: string | null;
          is_available: boolean;
          is_vegetarian: boolean;
          is_vegan: boolean;
          is_gluten_free: boolean;
          calories: number | null;
          preparation_time: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          name: string;
          description?: string | null;
          category: string;
          price: number;
          image_url?: string | null;
          is_available?: boolean;
          is_vegetarian?: boolean;
          is_vegan?: boolean;
          is_gluten_free?: boolean;
          calories?: number | null;
          preparation_time?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          category?: string;
          price?: number;
          image_url?: string | null;
          is_available?: boolean;
          is_vegetarian?: boolean;
          is_vegan?: boolean;
          is_gluten_free?: boolean;
          calories?: number | null;
          preparation_time?: number | null;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          restaurant_id: string;
          status:
            | 'pending'
            | 'confirmed'
            | 'preparing'
            | 'ready'
            | 'out_for_delivery'
            | 'delivered'
            | 'cancelled';
          subtotal: number;
          delivery_fee: number;
          tax: number;
          total: number;
          delivery_address: Json;
          delivery_instructions: string | null;
          payment_method: string;
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_intent_id: string | null;
          estimated_delivery_time: string | null;
          delivered_at: string | null;
          cancelled_at: string | null;
          cancellation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          restaurant_id: string;
          status?:
            | 'pending'
            | 'confirmed'
            | 'preparing'
            | 'ready'
            | 'out_for_delivery'
            | 'delivered'
            | 'cancelled';
          subtotal: number;
          delivery_fee: number;
          tax: number;
          total: number;
          delivery_address: Json;
          delivery_instructions?: string | null;
          payment_method: string;
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_intent_id?: string | null;
          estimated_delivery_time?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?:
            | 'pending'
            | 'confirmed'
            | 'preparing'
            | 'ready'
            | 'out_for_delivery'
            | 'delivered'
            | 'cancelled';
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          estimated_delivery_time?: string | null;
          delivered_at?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          special_instructions: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          menu_item_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          special_instructions?: string | null;
          created_at?: string;
        };
        Update: {
          quantity?: number;
          special_instructions?: string | null;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          restaurant_id: string;
          order_id: string | null;
          rating: number;
          comment: string | null;
          photos: string[] | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          restaurant_id: string;
          order_id?: string | null;
          rating: number;
          comment?: string | null;
          photos?: string[] | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          rating?: number;
          comment?: string | null;
          photos?: string[] | null;
          updated_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          restaurant_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          restaurant_id: string;
          created_at?: string;
        };
        Update: {};
      };
      carts: {
        Row: {
          id: string;
          user_id: string;
          restaurant_id: string;
          items: Json;
          subtotal: number;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          restaurant_id: string;
          items: Json;
          subtotal: number;
          expires_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          items?: Json;
          subtotal?: number;
          expires_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          data: Json | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          data?: Json | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

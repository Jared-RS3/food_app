export interface DatabaseRestaurant {
  id: string;
  name: string;
  cuisine: string;
  description?: string;
  address?: string;
  phone?: string;
  image?: string;
  rating?: number;
  price_range?: string;
  tags?: string[];
  latitude?: number;
  longitude?: number;
  is_featured?: boolean;
  is_open?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseCollection {
  id: string;
  name: string;
  icon: string;
  color: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseFoodItem {
  id: string;
  name: string;
  description: string;
  restaurant_id: string;
  image?: string;
  rating?: number;
  price?: string;
  tags?: string[];
  user_id: string;
  created_at?: string;
  updated_at?: string;
}
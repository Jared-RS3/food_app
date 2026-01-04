export interface FoodStall {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  image: string;
  rating: number;
  price_range: 'budget' | 'moderate' | 'expensive';
  is_favorite: boolean;
  market_id: string;
}

export interface FoodMarket {
  id: string;
  name: string;
  description: string;
  location: string;
  address: string;
  image: string;
  banner_image: string;
  opening_hours: string;
  days_open: string[];
  rating: number;
  total_stalls: number;
  stalls: FoodStall[];
  latitude: number;
  longitude: number;
  is_favorite: boolean;
  tags: string[];
}

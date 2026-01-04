export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviews: number;
  distance: string;
  deliveryTime: string;
  deliveryFee: string;
  image: string;
  tags: string[];
  featured: boolean;
  isOpen: boolean;
  description?: string;
  address?: string;
  phone?: string;
  priceRange?: string;
  website?: string;
  instagramUrl?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  dateAdded?: string;
  lastVisited?: string;
  visitCount?: number; // Track how many times user has visited
  isFavorite: boolean;
  mustTry?: boolean; // High priority restaurant to try - removed on check-in
  isRecommended?: boolean; // Based on user feedback
  isLikedByFriends?: boolean; // Based on friends' likes
}

export interface Collection {
  id: string;
  name: string;
  icon: string;
  restaurantCount: number;
  recentAdditions: string[];
  color: string;
  restaurants: string[];
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  restaurant: string;
  image?: string;
  rating?: number;
  price?: string;
  tags: string[];
  dateAdded: string;
}

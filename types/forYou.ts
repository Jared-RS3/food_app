export interface UserPreferences {
  id: string;
  userId: string;
  favoriteCuisines: string[];
  priceRange: string[];
  dietaryRestrictions: string[];
  preferredAreas: string[];
  preferredMealTimes: string[];
  lastLocation?: {
    latitude: number;
    longitude: number;
  };
  updated_at: string;
}

export interface UserBehavior {
  savedRestaurants: string[];
  checkedInRestaurants: string[];
  viewedRestaurants: string[];
  recentSearches: string[];
  interactionScores: {
    [restaurantId: string]: number; // Higher score = more interest
  };
}

export interface ForYouPost {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  cuisine: string;
  priceRange: string;
  location: string;
  address: string;
  distance?: number; // km from user
  rating: number;
  reviewCount: number;
  isOpen?: boolean;
  // Recommendation metadata
  recommendationReason: string;
  recommendationScore: number;
  matchFactors: string[]; // e.g., ['cuisine_match', 'location_proximity', 'trending']
  sponsored?: boolean;
  // Post content
  featuredDish?: string;
  featuredDishImage?: string;
  description: string;
  tags: string[];
  createdAt: string;
}

export interface RecommendationContext {
  currentTime: Date;
  dayOfWeek: string;
  isWeekend: boolean;
  mealTime: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

export type RecommendationReason =
  | 'Popular in your area'
  | 'Similar to places you love'
  | 'New restaurant nearby'
  | 'Trending now'
  | 'Perfect for lunch'
  | 'Great dinner spot'
  | 'Matches your taste'
  | 'Your favorite cuisine'
  | 'Highly rated nearby'
  | 'Friends love this place'
  | 'Hot spot right now'
  | 'Hidden gem'
  | 'Opening soon'
  | 'Limited time offer';

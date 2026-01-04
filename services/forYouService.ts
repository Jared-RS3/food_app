import {
  ForYouPost,
  RecommendationContext,
  RecommendationReason,
  UserBehavior,
  UserPreferences,
} from '@/types/forYou';

// Mock restaurant data for For You feed
const mockRestaurantPosts: Omit<
  ForYouPost,
  'recommendationReason' | 'recommendationScore' | 'matchFactors'
>[] = [
  {
    id: '1',
    restaurantId: 'rest-1',
    restaurantName: 'The Test Kitchen',
    restaurantImage:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    cuisine: 'Contemporary',
    priceRange: '$$$$',
    location: 'Woodstock',
    address: '375 Albert Rd, Woodstock, Cape Town',
    distance: 2.5,
    rating: 4.8,
    reviewCount: 450,
    isOpen: true,
    featuredDish: 'Tasting Menu',
    featuredDishImage:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
    description:
      'Award-winning restaurant offering innovative tasting menus with locally sourced ingredients.',
    tags: ['Fine Dining', 'Tasting Menu', 'Wine Pairing'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    restaurantId: 'rest-2',
    restaurantName: 'Mama Africa',
    restaurantImage:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
    cuisine: 'African',
    priceRange: '$$',
    location: 'Long Street',
    address: '178 Long St, Cape Town City Centre',
    distance: 1.2,
    rating: 4.5,
    reviewCount: 890,
    isOpen: true,
    featuredDish: 'Bobotie',
    featuredDishImage:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
    description:
      'Authentic African cuisine with live music and vibrant atmosphere.',
    tags: ['African', 'Live Music', 'Traditional'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    restaurantId: 'rest-3',
    restaurantName: 'Kyoto Garden Sushi',
    restaurantImage:
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
    cuisine: 'Japanese',
    priceRange: '$$$',
    location: 'Gardens',
    address: 'Kloof St, Gardens, Cape Town',
    distance: 0.8,
    rating: 4.7,
    reviewCount: 320,
    isOpen: true,
    featuredDish: 'Omakase Selection',
    featuredDishImage:
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
    description:
      'Premium sushi and Japanese cuisine with fresh fish flown in daily.',
    tags: ['Sushi', 'Japanese', 'Omakase'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    restaurantId: 'rest-4',
    restaurantName: 'La Parada',
    restaurantImage:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop',
    cuisine: 'Spanish',
    priceRange: '$$',
    location: 'Bree Street',
    address: '107 Bree St, Cape Town City Centre',
    distance: 1.5,
    rating: 4.6,
    reviewCount: 620,
    isOpen: true,
    featuredDish: 'Tapas Platter',
    featuredDishImage:
      'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=800&h=600&fit=crop',
    description:
      'Vibrant tapas bar serving authentic Spanish small plates and sangria.',
    tags: ['Tapas', 'Spanish', 'Wine Bar'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    restaurantId: 'rest-5',
    restaurantName: 'The Pot Luck Club',
    restaurantImage:
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&h=600&fit=crop',
    cuisine: 'Fusion',
    priceRange: '$$$',
    location: 'Woodstock',
    address: 'The Old Biscuit Mill, 373 Albert Rd, Woodstock',
    distance: 2.8,
    rating: 4.7,
    reviewCount: 540,
    isOpen: false,
    featuredDish: 'Small Plates Selection',
    featuredDishImage:
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop',
    description:
      'Rooftop restaurant with stunning views and creative small plates.',
    tags: ['Fusion', 'Rooftop', 'Views'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    restaurantId: 'rest-6',
    restaurantName: "Clarke's Bar & Dining",
    restaurantImage:
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&h=600&fit=crop',
    cuisine: 'Burgers',
    priceRange: '$$',
    location: 'City Centre',
    address: '1 Buitengracht St, Cape Town',
    distance: 1.0,
    rating: 4.4,
    reviewCount: 780,
    isOpen: true,
    featuredDish: 'Signature Burger',
    featuredDishImage:
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&h=600&fit=crop',
    description:
      'Classic American-style burgers and craft beer in a relaxed setting.',
    tags: ['Burgers', 'Casual', 'Craft Beer'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '7',
    restaurantId: 'rest-7',
    restaurantName: 'Bombay Brasserie',
    restaurantImage:
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
    cuisine: 'Indian',
    priceRange: '$$',
    location: 'Sea Point',
    address: 'Main Rd, Sea Point, Cape Town',
    distance: 3.2,
    rating: 4.5,
    reviewCount: 410,
    isOpen: true,
    featuredDish: 'Butter Chicken',
    featuredDishImage:
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
    description: 'Authentic Indian flavors with a contemporary twist.',
    tags: ['Indian', 'Curry', 'Vegetarian Options'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '8',
    restaurantId: 'rest-8',
    restaurantName: 'Cafe Caprice',
    restaurantImage:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    cuisine: 'Mediterranean',
    priceRange: '$$$',
    location: 'Camps Bay',
    address: '37 Victoria Rd, Camps Bay',
    distance: 5.5,
    rating: 4.6,
    reviewCount: 920,
    isOpen: true,
    featuredDish: 'Seafood Platter',
    featuredDishImage:
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop',
    description:
      'Beachfront dining with Mediterranean cuisine and sunset views.',
    tags: ['Mediterranean', 'Seafood', 'Beach Views'],
    createdAt: new Date().toISOString(),
  },
];

class ForYouService {
  private userPreferences: UserPreferences | null = null;
  private userBehavior: UserBehavior | null = null;

  // Initialize with user data
  async initialize(userId: string): Promise<void> {
    // In production, fetch from Supabase
    this.userPreferences = await this.getUserPreferences(userId);
    this.userBehavior = await this.getUserBehavior(userId);
  }

  // Get user preferences (mock for now)
  private async getUserPreferences(userId: string): Promise<UserPreferences> {
    return {
      id: '1',
      userId,
      favoriteCuisines: ['Japanese', 'Contemporary', 'Mediterranean'],
      priceRange: ['$$', '$$$'],
      dietaryRestrictions: [],
      preferredAreas: ['Woodstock', 'City Centre', 'Gardens'],
      preferredMealTimes: ['lunch', 'dinner'],
      lastLocation: {
        latitude: -33.9249,
        longitude: 18.4241,
      },
      updated_at: new Date().toISOString(),
    };
  }

  // Get user behavior data (mock for now)
  private async getUserBehavior(userId: string): Promise<UserBehavior> {
    return {
      savedRestaurants: ['rest-1', 'rest-3', 'rest-8'],
      checkedInRestaurants: ['rest-1', 'rest-2', 'rest-4'],
      viewedRestaurants: ['rest-1', 'rest-2', 'rest-3', 'rest-4', 'rest-5'],
      recentSearches: ['sushi', 'fine dining', 'japanese'],
      interactionScores: {
        'rest-1': 10,
        'rest-3': 8,
        'rest-8': 7,
        'rest-2': 5,
        'rest-4': 4,
      },
    };
  }

  // Get current context (time of day, meal time, etc.)
  private getRecommendationContext(): RecommendationContext {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';

    let mealTime: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null = null;
    if (hour >= 7 && hour < 11) mealTime = 'breakfast';
    else if (hour >= 11 && hour < 15) mealTime = 'lunch';
    else if (hour >= 17 && hour < 22) mealTime = 'dinner';
    else if (hour >= 15 && hour < 17) mealTime = 'snack';

    return {
      currentTime: now,
      dayOfWeek,
      isWeekend,
      mealTime,
      userLocation: this.userPreferences?.lastLocation,
    };
  }

  // Calculate recommendation score using smart algorithm
  private calculateRecommendationScore(
    post: Omit<
      ForYouPost,
      'recommendationReason' | 'recommendationScore' | 'matchFactors'
    >,
    context: RecommendationContext
  ): { score: number; matchFactors: string[]; reason: RecommendationReason } {
    let score = 0;
    const matchFactors: string[] = [];
    let reason: RecommendationReason = 'Trending now';

    // 1. Cuisine Match (up to 30 points)
    if (this.userPreferences?.favoriteCuisines.includes(post.cuisine)) {
      score += 30;
      matchFactors.push('cuisine_match');
      reason = 'Your favorite cuisine';
    } else if (
      this.userBehavior?.savedRestaurants.some((id) => id === post.restaurantId)
    ) {
      score += 25;
      matchFactors.push('saved_before');
    }

    // 2. Location Proximity (up to 25 points)
    if (post.distance !== undefined) {
      if (post.distance < 1) {
        score += 25;
        matchFactors.push('very_close');
        reason = 'Highly rated nearby';
      } else if (post.distance < 2) {
        score += 20;
        matchFactors.push('nearby');
      } else if (post.distance < 5) {
        score += 10;
        matchFactors.push('accessible');
      }
    }

    // 3. Price Range Match (up to 15 points)
    if (this.userPreferences?.priceRange.includes(post.priceRange)) {
      score += 15;
      matchFactors.push('price_match');
    }

    // 4. Rating & Popularity (up to 15 points)
    const ratingScore = (post.rating / 5) * 10;
    const popularityScore = Math.min((post.reviewCount / 1000) * 5, 5);
    score += ratingScore + popularityScore;
    if (post.rating >= 4.5) {
      matchFactors.push('highly_rated');
    }
    if (post.reviewCount > 500) {
      matchFactors.push('popular');
      reason = 'Popular in your area';
    }

    // 5. Preferred Area (up to 10 points)
    if (this.userPreferences?.preferredAreas.includes(post.location)) {
      score += 10;
      matchFactors.push('preferred_area');
    }

    // 6. Time-based relevance (up to 10 points)
    if (context.mealTime === 'lunch' && post.priceRange === '$$') {
      score += 10;
      matchFactors.push('lunch_friendly');
      reason = 'Perfect for lunch';
    } else if (context.mealTime === 'dinner' && post.isOpen) {
      score += 10;
      matchFactors.push('dinner_spot');
      reason = 'Great dinner spot';
    }

    // 7. Previous interactions (up to 10 points)
    const interactionScore =
      this.userBehavior?.interactionScores[post.restaurantId] || 0;
    if (interactionScore > 0) {
      score += Math.min(interactionScore, 10);
      matchFactors.push('previous_interest');
      reason = 'Similar to places you love';
    }

    // 8. Trending boost (up to 5 points)
    const isRecent =
      new Date(post.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
    if (isRecent && post.reviewCount > 300) {
      score += 5;
      matchFactors.push('trending');
      reason = 'Trending now';
    }

    // 9. Currently open bonus
    if (post.isOpen) {
      score += 5;
      matchFactors.push('open_now');
    }

    // 10. Hidden gem bonus (high rating, lower review count)
    if (post.rating >= 4.6 && post.reviewCount < 200) {
      score += 8;
      matchFactors.push('hidden_gem');
      reason = 'Hidden gem';
    }

    return { score, matchFactors, reason };
  }

  // Get personalized For You feed
  async getForYouFeed(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ForYouPost[]> {
    // Initialize user data
    if (!this.userPreferences || !this.userBehavior) {
      await this.initialize(userId);
    }

    const context = this.getRecommendationContext();

    // Score all posts
    const scoredPosts = mockRestaurantPosts.map((post) => {
      const { score, matchFactors, reason } = this.calculateRecommendationScore(
        post,
        context
      );

      return {
        ...post,
        recommendationScore: score,
        matchFactors,
        recommendationReason: reason,
      } as ForYouPost;
    });

    // Sort by score (highest first)
    scoredPosts.sort((a, b) => b.recommendationScore - a.recommendationScore);

    // Paginate
    const start = (page - 1) * limit;
    const end = start + limit;

    // Add some randomization to avoid being too predictable (10% shuffle)
    const paginatedPosts = scoredPosts.slice(start, end);
    if (Math.random() > 0.9) {
      for (let i = paginatedPosts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [paginatedPosts[i], paginatedPosts[j]] = [
          paginatedPosts[j],
          paginatedPosts[i],
        ];
      }
    }

    return paginatedPosts;
  }

  // Refresh feed with new recommendations
  async refreshFeed(userId: string): Promise<ForYouPost[]> {
    await this.initialize(userId);
    return this.getForYouFeed(userId, 1, 10);
  }

  // Track user interaction to improve recommendations
  async trackInteraction(
    userId: string,
    restaurantId: string,
    interactionType: 'view' | 'save' | 'checkin'
  ): Promise<void> {
    // In production, update Supabase
    if (!this.userBehavior) return;

    if (interactionType === 'view') {
      this.userBehavior.viewedRestaurants.push(restaurantId);
      this.userBehavior.interactionScores[restaurantId] =
        (this.userBehavior.interactionScores[restaurantId] || 0) + 1;
    } else if (interactionType === 'save') {
      this.userBehavior.savedRestaurants.push(restaurantId);
      this.userBehavior.interactionScores[restaurantId] =
        (this.userBehavior.interactionScores[restaurantId] || 0) + 3;
    } else if (interactionType === 'checkin') {
      this.userBehavior.checkedInRestaurants.push(restaurantId);
      this.userBehavior.interactionScores[restaurantId] =
        (this.userBehavior.interactionScores[restaurantId] || 0) + 5;
    }
  }
}

export const forYouService = new ForYouService();

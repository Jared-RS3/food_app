import { FoodMarket, FoodStall } from '@/types/market';

// Mock data for Cape Town food markets
const mockMarkets: FoodMarket[] = [
  {
    id: '1',
    name: 'Oranjezicht City Farm Market',
    description:
      'A vibrant organic food market showcasing the best of local produce, artisanal goods, and delicious street food.',
    location: 'Granger Bay, V&A Waterfront',
    address: 'Granger Bay Blvd, V&A Waterfront, Cape Town',
    image:
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=600&fit=crop',
    banner_image:
      'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=1200&h=400&fit=crop',
    opening_hours: '08:00 - 14:00',
    days_open: ['Saturday', 'Sunday'],
    rating: 4.8,
    total_stalls: 12,
    latitude: -33.9069,
    longitude: 18.4194,
    is_favorite: false,
    tags: ['Organic', 'Artisanal', 'Family-friendly', 'Outdoor'],
    stalls: [],
  },
  {
    id: '2',
    name: 'Neighbourgoods Market',
    description:
      'Hip warehouse market with artisan food stalls, craft beer, live music and a buzzing atmosphere.',
    location: 'Old Biscuit Mill, Woodstock',
    address: '373-375 Albert Rd, Woodstock, Cape Town',
    image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
    banner_image:
      'https://images.unsplash.com/photo-1567696279555-6b8c025e6b69?w=1200&h=400&fit=crop',
    opening_hours: '09:00 - 15:00',
    days_open: ['Saturday'],
    rating: 4.7,
    total_stalls: 15,
    latitude: -33.9308,
    longitude: 18.4486,
    is_favorite: false,
    tags: ['Hip', 'Craft Beer', 'Live Music', 'Artisan'],
    stalls: [],
  },
  {
    id: '3',
    name: 'Bay Harbour Market',
    description:
      'Seaside market featuring local cuisine, handmade crafts, and stunning ocean views in a relaxed atmosphere.',
    location: 'Hout Bay',
    address: '31 Harbour Rd, Hout Bay, Cape Town',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop',
    banner_image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=400&fit=crop',
    opening_hours: '17:00 - 21:00',
    days_open: ['Friday', 'Saturday', 'Sunday'],
    rating: 4.6,
    total_stalls: 18,
    latitude: -34.0481,
    longitude: 18.3556,
    is_favorite: false,
    tags: ['Seaside', 'Evening', 'Crafts', 'Ocean Views'],
    stalls: [],
  },
  {
    id: '4',
    name: 'Blue Bird Garage Food & Goods Market',
    description:
      'Trendy indoor market in a converted garage with gourmet food trucks, artisan coffee, and vintage finds.',
    location: 'Muizenberg',
    address: 'Blue Bird Ctr, Main Rd, Muizenberg, Cape Town',
    image:
      'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&h=600&fit=crop',
    banner_image:
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&h=400&fit=crop',
    opening_hours: '08:00 - 14:00',
    days_open: ['Saturday'],
    rating: 4.5,
    total_stalls: 10,
    latitude: -34.1032,
    longitude: 18.4708,
    is_favorite: false,
    tags: ['Trendy', 'Food Trucks', 'Coffee', 'Vintage'],
    stalls: [],
  },
];

// Mock stalls for Oranjezicht Market
const oranjezichtStalls: FoodStall[] = [
  {
    id: 's1',
    name: 'The Paella Guys',
    description:
      'Authentic Spanish paella made fresh with local seafood and saffron rice',
    cuisine: 'Spanish',
    image:
      'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400&h=300&fit=crop',
    rating: 4.9,
    price_range: 'moderate',
    is_favorite: false,
    market_id: '1',
  },
  {
    id: 's2',
    name: 'Sausage Emporium',
    description:
      'Gourmet boerewors rolls and artisan sausages with homemade chutneys',
    cuisine: 'South African',
    image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
    rating: 4.8,
    price_range: 'budget',
    is_favorite: false,
    market_id: '1',
  },
  {
    id: 's3',
    name: 'Greek Street Food',
    description: 'Fresh gyros, halloumi wraps, and traditional Greek salads',
    cuisine: 'Greek',
    image:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop',
    rating: 4.7,
    price_range: 'budget',
    is_favorite: false,
    market_id: '1',
  },
  {
    id: 's4',
    name: 'Artisan Pizza Co',
    description: 'Wood-fired Neapolitan pizzas with organic toppings',
    cuisine: 'Italian',
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    rating: 4.9,
    price_range: 'moderate',
    is_favorite: false,
    market_id: '1',
  },
];

// Assign stalls to markets
mockMarkets[0].stalls = oranjezichtStalls;

class MarketService {
  async getMarkets(): Promise<FoodMarket[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockMarkets;
  }

  async getMarketById(id: string): Promise<FoodMarket | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockMarkets.find((market) => market.id === id) || null;
  }

  async getStallsByMarketId(marketId: string): Promise<FoodStall[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const market = mockMarkets.find((m) => m.id === marketId);
    return market?.stalls || [];
  }

  async searchMarkets(query: string): Promise<FoodMarket[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const lowerQuery = query.toLowerCase();
    return mockMarkets.filter(
      (market) =>
        market.name.toLowerCase().includes(lowerQuery) ||
        market.location.toLowerCase().includes(lowerQuery) ||
        market.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  async addStallToMarket(
    marketId: string,
    stall: Omit<FoodStall, 'id'>
  ): Promise<FoodStall> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const newStall: FoodStall = {
      ...stall,
      id: `s${Date.now()}`,
      market_id: marketId,
    };

    const market = mockMarkets.find((m) => m.id === marketId);
    if (market) {
      market.stalls.push(newStall);
      market.total_stalls = market.stalls.length;
    }

    return newStall;
  }

  async toggleFavoriteMarket(marketId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const market = mockMarkets.find((m) => m.id === marketId);
    if (market) {
      market.is_favorite = !market.is_favorite;
      return market.is_favorite;
    }
    return false;
  }

  async toggleFavoriteStall(stallId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    for (const market of mockMarkets) {
      const stall = market.stalls.find((s) => s.id === stallId);
      if (stall) {
        stall.is_favorite = !stall.is_favorite;
        return stall.is_favorite;
      }
    }
    return false;
  }
}

export const marketService = new MarketService();

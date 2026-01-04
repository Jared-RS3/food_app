import { Event } from '@/types/event';

// Mock events data for Cape Town
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Weekend Market Special',
    description:
      'Join us for our famous weekend market! Fresh produce, artisan foods, live music, and family-friendly activities. Over 50 local vendors.',
    business_name: 'Oranjezicht City Farm Market',
    image:
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&h=400&fit=crop',
    banner_image:
      'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=1200&h=400&fit=crop',
    event_type: 'market_day',
    location: 'V&A Waterfront',
    address: 'Granger Bay Blvd, V&A Waterfront, Cape Town',
    latitude: -33.9069,
    longitude: 18.4194,
    start_date: '2025-11-29',
    end_date: '2025-11-30',
    start_time: '08:00',
    end_time: '14:00',
    price: 'Free Entry',
    tags: ['Market', 'Organic', 'Family-friendly', 'Outdoor'],
    is_featured: true,
    is_recurring: true,
    recurrence_pattern: 'Every Saturday & Sunday',
    attendees_count: 250,
    max_attendees: 500,
    phone: '+27 21 123 4567',
    social_links: {
      instagram: '@oranjezichtmarket',
      website: 'www.ozcf.co.za',
    },
    created_at: '2025-11-20T10:00:00Z',
    created_by: 'market-admin',
  },
  {
    id: '2',
    title: '2-for-1 Burger Special',
    description:
      'Every Tuesday is Burger Day! Get 2 gourmet burgers for the price of 1. Includes our famous hand-cut fries.',
    business_name: "Clarke's Bar & Dining Room",
    image:
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&h=400&fit=crop',
    event_type: 'special',
    location: 'Power & Glory, Cape Town',
    address: '1 Buitengracht St, Cape Town City Centre',
    latitude: -33.9248,
    longitude: 18.4233,
    start_date: '2025-11-26',
    end_date: '2025-11-26',
    start_time: '18:00',
    end_time: '22:00',
    price: 'R120 for 2',
    tags: ['Special', 'Burgers', 'Dinner', 'City Centre'],
    is_featured: false,
    is_recurring: true,
    recurrence_pattern: 'Every Tuesday',
    created_at: '2025-11-15T12:00:00Z',
    created_by: 'clarkes-admin',
  },
  {
    id: '3',
    title: 'Festive Season Food Festival',
    description:
      "Cape Town's biggest food festival is back! 100+ food stalls, celebrity chef demos, wine tastings, and live entertainment.",
    business_name: 'Cape Town Food Festival',
    image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop',
    banner_image:
      'https://images.unsplash.com/photo-1567696279555-6b8c025e6b69?w=1200&h=400&fit=crop',
    event_type: 'festival',
    location: 'Green Point Urban Park',
    address: 'Fritz Sonnenberg Rd, Green Point, Cape Town',
    latitude: -33.9074,
    longitude: 18.4061,
    start_date: '2025-12-14',
    end_date: '2025-12-15',
    start_time: '10:00',
    end_time: '20:00',
    price: 'R150',
    tags: ['Festival', 'Food', 'Wine', 'Entertainment', 'Festive'],
    is_featured: true,
    is_recurring: false,
    attendees_count: 1200,
    max_attendees: 5000,
    booking_url: 'https://ctfoodfest.com',
    phone: '+27 21 555 1234',
    social_links: {
      instagram: '@ctfoodfestival',
      facebook: 'ctfoodfestival',
      website: 'www.ctfoodfest.com',
    },
    created_at: '2025-10-01T09:00:00Z',
    created_by: 'festival-org',
  },
  {
    id: '4',
    title: 'Bay Harbour Night Market',
    description:
      'Sunset market with ocean views! Fresh seafood, craft beer, handmade goods, and live acoustic music.',
    business_name: 'Bay Harbour Market',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop',
    event_type: 'market_day',
    location: 'Hout Bay',
    address: '31 Harbour Rd, Hout Bay, Cape Town',
    latitude: -34.0481,
    longitude: 18.3556,
    start_date: '2025-11-28',
    end_date: '2025-11-30',
    start_time: '17:00',
    end_time: '21:00',
    price: 'Free Entry',
    tags: ['Market', 'Seaside', 'Evening', 'Music', 'Seafood'],
    is_featured: false,
    is_recurring: true,
    recurrence_pattern: 'Friday to Sunday',
    attendees_count: 180,
    phone: '+27 21 790 8040',
    social_links: {
      instagram: '@bayharbourmarket',
      website: 'www.bayharbour.co.za',
    },
    created_at: '2025-11-18T14:00:00Z',
    created_by: 'bayharbour-admin',
  },
  {
    id: '5',
    title: 'Happy Hour - 50% Off Cocktails',
    description:
      'Join us for sundowners with 50% off all cocktails from 5-7pm. Enjoy stunning ocean views from our terrace.',
    business_name: 'The Bungalow',
    image:
      'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop',
    event_type: 'special',
    location: 'Clifton, Cape Town',
    address: '3rd Beach, Clifton, Cape Town',
    latitude: -33.938,
    longitude: 18.3772,
    start_date: '2025-11-25',
    end_date: '2025-11-25',
    start_time: '17:00',
    end_time: '19:00',
    price: 'From R40',
    tags: ['Happy Hour', 'Cocktails', 'Sunset', 'Beach', 'Clifton'],
    is_featured: false,
    is_recurring: true,
    recurrence_pattern: 'Daily',
    created_at: '2025-11-10T11:00:00Z',
    created_by: 'bungalow-admin',
  },
  {
    id: '6',
    title: 'Grand Opening - Free Tastings!',
    description:
      'Celebrate our grand opening with free wine tastings all day! Meet the winemakers, tour the cellar, and enjoy live jazz.',
    business_name: 'Constantia Glen',
    image:
      'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&h=400&fit=crop',
    event_type: 'launch',
    location: 'Constantia Valley',
    address: 'Constantia Main Rd, Constantia, Cape Town',
    latitude: -34.015,
    longitude: 18.4381,
    start_date: '2025-12-01',
    end_date: '2025-12-01',
    start_time: '10:00',
    end_time: '17:00',
    price: 'Free',
    tags: ['Wine', 'Tasting', 'Free', 'Launch', 'Constantia'],
    is_featured: true,
    is_recurring: false,
    attendees_count: 45,
    max_attendees: 200,
    booking_url: 'https://constantiaglen.com/opening',
    phone: '+27 21 794 5188',
    social_links: {
      instagram: '@constantiaglen',
      website: 'www.constantiaglen.com',
    },
    created_at: '2025-11-12T08:00:00Z',
    created_by: 'constantia-admin',
  },
  {
    id: '7',
    title: 'Sunday Roast Lunch Special',
    description:
      'Traditional Sunday roast with all the trimmings. Choose from beef, lamb, or chicken. Includes dessert and coffee.',
    business_name: 'The Pot Luck Club',
    image:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
    event_type: 'special',
    location: 'Woodstock, Cape Town',
    address: 'Old Biscuit Mill, 373 Albert Rd, Woodstock',
    latitude: -33.9308,
    longitude: 18.4486,
    start_date: '2025-11-30',
    end_date: '2025-11-30',
    start_time: '12:00',
    end_time: '15:00',
    price: 'R285',
    tags: ['Sunday Roast', 'Lunch', 'Traditional', 'Family'],
    is_featured: false,
    is_recurring: true,
    recurrence_pattern: 'Every Sunday',
    booking_url: 'https://potluckclub.co.za',
    phone: '+27 21 447 0804',
    created_at: '2025-11-16T13:00:00Z',
    created_by: 'potluck-admin',
  },
];

class EventService {
  async getEvents(): Promise<Event[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockEvents;
  }

  async getEventById(id: string): Promise<Event | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockEvents.find((event) => event.id === id) || null;
  }

  async getFeaturedEvents(): Promise<Event[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockEvents.filter((event) => event.is_featured);
  }

  async getUpcomingEvents(): Promise<Event[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const today = new Date();
    return mockEvents
      .filter((event) => new Date(event.start_date) >= today)
      .sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );
  }

  async searchEvents(query: string): Promise<Event[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const lowerQuery = query.toLowerCase();
    return mockEvents.filter(
      (event) =>
        event.title.toLowerCase().includes(lowerQuery) ||
        event.business_name.toLowerCase().includes(lowerQuery) ||
        event.location.toLowerCase().includes(lowerQuery) ||
        event.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  async filterEventsByType(type: string): Promise<Event[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (type === 'all') return mockEvents;
    if (type === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return mockEvents.filter((event) => event.start_date === today);
    }
    if (type === 'weekend') {
      const saturday = new Date();
      saturday.setDate(saturday.getDate() + (6 - saturday.getDay()));
      const sunday = new Date(saturday);
      sunday.setDate(sunday.getDate() + 1);

      const satStr = saturday.toISOString().split('T')[0];
      const sunStr = sunday.toISOString().split('T')[0];

      return mockEvents.filter(
        (event) => event.start_date === satStr || event.start_date === sunStr
      );
    }
    if (type === 'markets') {
      return mockEvents.filter((event) => event.event_type === 'market_day');
    }
    if (type === 'specials') {
      return mockEvents.filter((event) => event.event_type === 'special');
    }
    if (type === 'free') {
      return mockEvents.filter((event) =>
        event.price.toLowerCase().includes('free')
      );
    }

    return mockEvents;
  }

  async getEventsByBusiness(businessId: string): Promise<Event[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockEvents.filter((event) => event.business_id === businessId);
  }
}

export const eventService = new EventService();

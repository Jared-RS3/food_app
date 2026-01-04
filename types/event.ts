export interface Event {
  id: string;
  title: string;
  description: string;
  business_name: string;
  business_id?: string;
  image: string;
  banner_image?: string;
  event_type: 'special' | 'market_day' | 'festival' | 'promotion' | 'launch';
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time?: string;
  price: string; // e.g., "Free", "R50", "R100-R200"
  tags: string[];
  is_featured: boolean;
  is_recurring: boolean;
  recurrence_pattern?: string; // e.g., "Every Saturday"
  attendees_count?: number;
  max_attendees?: number;
  booking_url?: string;
  phone?: string;
  email?: string;
  social_links?: {
    instagram?: string;
    facebook?: string;
    website?: string;
  };
  created_at: string;
  created_by: string;
}

export type EventFilter =
  | 'all'
  | 'today'
  | 'weekend'
  | 'markets'
  | 'specials'
  | 'free';

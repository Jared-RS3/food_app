// Social Sharing Types

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  following?: boolean;
  followedBy?: boolean;
}

export interface FriendGroup {
  id: string;
  name: string;
  emoji: string;
  color: string;
  members: string[]; // user IDs
  createdBy: string;
  createdAt: Date;
  sharedPlaces: number;
}

export interface SharedPlace {
  id: string;
  restaurantId: string;
  restaurant: {
    id: string;
    name: string;
    cuisine: string;
    address: string;
    latitude: number;
    longitude: number;
    image: string;
    rating?: number;
    priceLevel?: number;
  };
  sharedBy: User;
  sharedWith: string[]; // user IDs or group IDs
  sharedAt: Date;
  note?: string;
  tags: string[];
  visitedBy: string[]; // user IDs who've been there
  wantToGo: string[]; // user IDs who want to go
  reactions: Reaction[];
  listId?: string; // if part of a collaborative list
}

export interface Reaction {
  userId: string;
  userName: string;
  userAvatar: string;
  type: '❤️' | '🔥' | '😋' | '👀' | '🤤' | '🎯' | '✨';
  timestamp: Date;
}

export interface CollaborativeList {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  createdBy: User;
  collaborators: User[];
  places: SharedPlace[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface MapInvite {
  id: string;
  from: User;
  to: User;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  permissions: {
    canAddPlaces: boolean;
    canViewHistory: boolean;
    canInviteOthers: boolean;
  };
  createdAt: Date;
  respondedAt?: Date;
}

export interface FoodJourneyPoint {
  id: string;
  userId: string;
  restaurantId: string;
  restaurant: {
    name: string;
    latitude: number;
    longitude: number;
  };
  visitedAt: Date;
  dish?: string;
  rating?: number;
  photo?: string;
}

export interface HeatMapZone {
  id: string;
  name: string;
  area: {
    latitude: number;
    longitude: number;
    radius: number; // in meters
  };
  visitCount: number;
  lastVisit: Date;
  topRestaurants: Array<{
    id: string;
    name: string;
    visits: number;
  }>;
  vibe: 'foodie_heaven' | 'comfort_zone' | 'explorer_territory' | 'date_night_district';
}

export interface MapFilter {
  showMyPlaces: boolean;
  showFriendPlaces: boolean;
  selectedFriends: string[];
  selectedGroups: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  priceRange?: [number, number];
  cuisines?: string[];
}

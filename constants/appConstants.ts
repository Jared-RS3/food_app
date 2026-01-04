/**
 * Application-wide constants
 * Centralized location for all magic numbers and hardcoded values
 */

// UI Constants
export const UI_CONSTANTS = {
  // Bottom Sheet Heights
  BOTTOM_SHEET_COLLAPSED: 160,
  BOTTOM_SHEET_EXPANDED: 550,
  BOTTOM_SHEET_SNAP_THRESHOLD: 350,

  // FAB Positioning
  FAB_BOTTOM_OFFSET: 90,
  FAB_RIGHT_OFFSET: 20,

  // Card Dimensions
  FEATURED_CARD_WIDTH: 140,
  FEATURED_CARD_IMAGE_HEIGHT: 80,
  RESTAURANT_CARD_WIDTH: 160,

  // Animation Durations
  ANIMATION_DURATION_FAST: 200,
  ANIMATION_DURATION_NORMAL: 400,
  ANIMATION_DURATION_SLOW: 600,
  ANIMATION_DAMPING: 20,

  // List Limits
  MAX_FEATURED_RESTAURANTS: 5,
  MAX_RECENT_EXPENSES: 5,
  MAX_SIMILAR_RESTAURANTS: 5,
} as const;

// Default Values
export const DEFAULT_VALUES = {
  // Restaurant Defaults
  DEFAULT_RATING: 4.5,
  DEFAULT_REVIEWS: 0,
  DEFAULT_DISTANCE: '2.1 km',
  DEFAULT_DELIVERY_TIME: '30-45 min',
  DEFAULT_DELIVERY_FEE: 'R25',
  DEFAULT_PRICE_RANGE: '$$' as const,

  // Location Defaults (Cape Town)
  DEFAULT_LATITUDE: -33.9249,
  DEFAULT_LONGITUDE: 18.4241,

  // Nutrition Defaults
  DEFAULT_DAILY_CALORIES: 2000,
  DEFAULT_PROTEIN_PERCENTAGE: 30,
  DEFAULT_CARBS_PERCENTAGE: 40,
  DEFAULT_FAT_PERCENTAGE: 30,
  DEFAULT_WATER_INTAKE: 2000, // ml

  // Budget Defaults
  WATER_INCREMENT: 250, // ml

  // Placeholder Images
  DEFAULT_RESTAURANT_IMAGE:
    'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800',
  DEFAULT_FOOD_IMAGE:
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
} as const;

// API Configuration
export const API_CONFIG = {
  // Timeouts
  REQUEST_TIMEOUT: 10000, // 10 seconds
  OVERPASS_TIMEOUT: 25, // 25 seconds

  // Retry Configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second

  // Cache Configuration
  CACHE_TTL: 300000, // 5 minutes
} as const;

// Validation Rules
export const VALIDATION = {
  // Input Limits
  MAX_RESTAURANT_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_PASSWORD_LENGTH: 8,
  MAX_TAGS: 10,

  // Numeric Limits
  MIN_RATING: 0,
  MAX_RATING: 5,
  MIN_PRICE: 0,
  MAX_PRICE: 10000,
  MIN_BUDGET: 0,
  MAX_BUDGET: 1000000,

  // Regex Patterns
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  URL_REGEX: /^https?:\/\/.+/,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: '@user_preferences',
  CACHED_RESTAURANTS: '@cached_restaurants',
  RECENT_SEARCHES: '@recent_searches',
  ONBOARDING_COMPLETE: '@onboarding_complete',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Auth Errors
  AUTH_REQUIRED: 'Please sign in to continue',
  INVALID_CREDENTIALS: 'Invalid email or password',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again',

  // Network Errors
  NETWORK_ERROR: 'Network error. Please check your connection',
  TIMEOUT_ERROR: 'Request timed out. Please try again',
  SERVER_ERROR: 'Server error. Please try again later',

  // Data Errors
  FETCH_ERROR: 'Failed to load data',
  SAVE_ERROR: 'Failed to save changes',
  DELETE_ERROR: 'Failed to delete item',

  // Validation Errors
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_AMOUNT: 'Please enter a valid amount',

  // Budget Errors
  BUDGET_EXCEEDED: 'You have exceeded your budget limit',
  INVALID_CATEGORY: 'Invalid category selected',
  NEGATIVE_AMOUNT: 'Amount cannot be negative',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: 'Changes saved successfully',
  DELETE_SUCCESS: 'Item deleted successfully',
  CREATE_SUCCESS: 'Item created successfully',
  UPDATE_SUCCESS: 'Item updated successfully',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_GAMIFICATION: true,
  ENABLE_NUTRITION_TRACKING: true,
  ENABLE_BUDGET_TRACKING: true,
  ENABLE_COLLECTIONS: true,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_PUSH_NOTIFICATIONS: false,
} as const;

// Categories
export const CUISINE_CATEGORIES = [
  'Fine Dining',
  'African',
  'Contemporary',
  'Asian',
  'Italian',
  'Japanese',
  'Family',
  'Fast Food',
  'Breakfast',
  'Seafood',
] as const;

export const EXPENSE_CATEGORIES = [
  { key: 'food', label: 'Food', emoji: '🍔', color: '#FF6B9D' },
  { key: 'restaurants', label: 'Restaurants', emoji: '🍽️', color: '#8B5CF6' },
  { key: 'drinks', label: 'Drinks', emoji: '🍹', color: '#06B6D4' },
  { key: 'groceries', label: 'Groceries', emoji: '🛒', color: '#10B981' },
  { key: 'takeout', label: 'Takeout', emoji: '🥡', color: '#F59E0B' },
  { key: 'other', label: 'Other', emoji: '💰', color: '#6B7280' },
] as const;

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

// Budget Thresholds
export const BUDGET_THRESHOLDS = {
  WARNING: 70, // Show yellow warning
  DANGER: 90, // Show red danger
  ALERT: 80, // Send alert notification
} as const;

// Development
export const DEV_CONFIG = {
  ENABLE_DEBUG_LOGGING: __DEV__,
  ENABLE_PERFORMANCE_MONITORING: __DEV__,
  MOCK_API_DELAY: 500, // ms
} as const;

// Onboarding text content and personality phrases
export const ONBOARDING_CONTENT = {
  welcome: {
    title: "Hey… I'm starving already 😭",
    subtitle: "Wanna discover food together?",
    buttonText: "Let's Go! 🍕",
    skipText: "Skip for now",
  },
  eatingStyle: {
    title: "Okay first… what kind of eater are you?",
    subtitle: "I promise no judgment 😌",
    stepLabel: "1/5",
  },
  foodMood: {
    title: "What's your vibe today?",
    subtitle: "Comfort? Spicy? Cute food?",
    stepLabel: "2/5",
  },
  categories: {
    title: "If we went out right now…",
    subtitle: "what would you crave most? 👀🍕🍣🍔",
    minSelection: "Select at least 3",
    stepLabel: "3/5",
  },
  location: {
    title: "Cool. Last thing —",
    subtitle: "where should I find places for you?",
    stepLabel: "4/5",
  },
  celebration: {
    title: "Got it! I think we're gonna get along REALLY well 😌",
    subtitle: "Let me prepare your perfect food world...",
    stepLabel: "5/5",
  },
};

export const DIETARY_OPTIONS = [
  {
    id: 'halaal',
    label: 'Halaal',
    emoji: '🥗',
    description: 'Islamic dietary law',
  },
  {
    id: 'vegan',
    label: 'Vegan',
    emoji: '🌱',
    description: 'Plant-based only',
  },
  {
    id: 'vegetarian',
    label: 'Vegetarian',
    emoji: '🥬',
    description: 'No meat',
  },
  {
    id: 'no-pork',
    label: 'No Pork',
    emoji: '🚫🥓',
    description: 'Pork-free',
  },
  {
    id: 'gluten-free',
    label: 'Gluten-Free',
    emoji: '🌾',
    description: 'No gluten',
  },
  {
    id: 'dairy-free',
    label: 'Dairy-Free',
    emoji: '🥛',
    description: 'No dairy',
  },
  {
    id: 'keto',
    label: 'Keto',
    emoji: '🥑',
    description: 'Low carb',
  },
  {
    id: 'everything',
    label: 'I eat everything',
    emoji: '😋',
    description: 'No restrictions',
  },
];

export const FOOD_MOODS = [
  {
    id: 'comfort',
    label: 'Comfort Food',
    emoji: '🥰',
    description: 'Mac & cheese vibes',
    gradient: ['#FFB347', '#FFCC33'],
  },
  {
    id: 'spicy',
    label: 'Spicy & Bold',
    emoji: '🔥',
    description: 'Bring the heat!',
    gradient: ['#FF6B6B', '#EE5A6F'],
  },
  {
    id: 'aesthetic',
    label: 'Aesthetic Eats',
    emoji: '✨',
    description: 'Instagram-worthy',
    gradient: ['#FFA6C1', '#FFD1DC'],
  },
  {
    id: 'quick',
    label: 'Quick Bites',
    emoji: '⚡',
    description: 'Fast & delicious',
    gradient: ['#FFD93D', '#FFC947'],
  },
  {
    id: 'healthy',
    label: 'Fresh & Healthy',
    emoji: '🥗',
    description: 'Clean eating',
    gradient: ['#A8E6CF', '#7FCFA4'],
  },
  {
    id: 'indulgent',
    label: 'Full Indulgence',
    emoji: '🍰',
    description: 'Treat yourself',
    gradient: ['#C5A3FF', '#B794F6'],
  },
];

export const FOOD_CATEGORIES = [
  {
    id: 'pizza',
    label: 'Pizza',
    emoji: '🍕',
    color: '#FF6B6B',
  },
  {
    id: 'burgers',
    label: 'Burgers',
    emoji: '🍔',
    color: '#FFD93D',
  },
  {
    id: 'sushi',
    label: 'Sushi',
    emoji: '🍣',
    color: '#FF8C94',
  },
  {
    id: 'pasta',
    label: 'Pasta',
    emoji: '🍝',
    color: '#FFB347',
  },
  {
    id: 'desserts',
    label: 'Desserts',
    emoji: '🍰',
    color: '#FFA6C1',
  },
  {
    id: 'street-food',
    label: 'Street Food',
    emoji: '🌮',
    color: '#FFCC33',
  },
  {
    id: 'cafes',
    label: 'Cafés',
    emoji: '☕',
    color: '#C5A3FF',
  },
  {
    id: 'grills',
    label: 'Grills & BBQ',
    emoji: '🍖',
    color: '#FF9671',
  },
  {
    id: 'breakfast',
    label: 'Breakfast',
    emoji: '🥞',
    color: '#FFD166',
  },
  {
    id: 'healthy',
    label: 'Healthy Bowls',
    emoji: '🥗',
    color: '#A8E6CF',
  },
  {
    id: 'seafood',
    label: 'Seafood',
    emoji: '🦞',
    color: '#6DD5FA',
  },
  {
    id: 'asian',
    label: 'Asian Fusion',
    emoji: '🍜',
    color: '#FF6B9D',
  },
];

export const FLOATING_EMOJIS = ['🍕', '🍣', '🍔', '☕', '🍰', '🌮', '🍜', '🥗'];

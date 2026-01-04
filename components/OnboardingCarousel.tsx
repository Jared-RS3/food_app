import { theme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Award,
  BookmarkCheck,
  Compass,
  Heart,
  MapPin,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: [string, string];
  emoji: string;
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    icon: <Compass size={80} color="#fff" strokeWidth={1.5} />,
    title: 'Discover Amazing Places',
    description:
      'Explore restaurants, cafes, and food markets near you. Find hidden gems and popular spots all in one place! 🗺️',
    gradient: ['#FF6B6B', '#FF8E53'],
    emoji: '🍽️',
  },
  {
    id: 2,
    icon: <Star size={80} color="#fff" strokeWidth={1.5} fill="#fff" />,
    title: 'Create Your Must-Try List',
    description:
      "Mark restaurants you're dying to try! They'll show up with a golden badge so you never forget where to eat next 🌟",
    gradient: ['#FFB800', '#FFA726'],
    emoji: '⭐',
  },
  {
    id: 3,
    icon: <MapPin size={80} color="#fff" strokeWidth={1.5} />,
    title: 'Check In & Earn XP',
    description:
      'Check in at restaurants to earn XP, level up, and unlock achievements! Track your foodie journey 🎯',
    gradient: ['#00C9FF', '#92FE9D'],
    emoji: '🎮',
  },
  {
    id: 4,
    icon: <BookmarkCheck size={80} color="#fff" strokeWidth={1.5} />,
    title: 'Organize Collections',
    description:
      'Create custom collections like "Date Night Spots" or "Best Brunch" to keep your favorites organized 📚',
    gradient: ['#A855F7', '#EC4899'],
    emoji: '📖',
  },
  {
    id: 5,
    icon: <Award size={80} color="#fff" strokeWidth={1.5} />,
    title: 'Complete Challenges',
    description:
      'Take on food challenges and unlock special badges! From "Seafood Explorer" to "Night Owl Diner" 🏆',
    gradient: ['#F093FB', '#F5576C'],
    emoji: '🏅',
  },
  {
    id: 6,
    icon: <Users size={80} color="#fff" strokeWidth={1.5} />,
    title: 'Connect with Friends',
    description:
      'See where your friends are eating, share recommendations, and discover new places together! 👥',
    gradient: ['#4FACFE', '#00F2FE'],
    emoji: '🤝',
  },
  {
    id: 7,
    icon: <TrendingUp size={80} color="#fff" strokeWidth={1.5} />,
    title: 'Track Your Progress',
    description:
      'Watch your food journey unfold with stats, streaks, and achievements. Become a local food expert! 📊',
    gradient: ['#FA709A', '#FEE140'],
    emoji: '📈',
  },
  {
    id: 8,
    icon: <Heart size={80} color="#fff" strokeWidth={1.5} fill="#fff" />,
    title: "Let's Get Started!",
    description:
      "You're all set! Start exploring, checking in, and building your ultimate foodie experience 🚀",
    gradient: ['#FF6B6B', '#556270'],
    emoji: '🎉',
  },
];

interface OnboardingCarouselProps {
  onComplete: () => void;
}

export default function OnboardingCarousel({
  onComplete,
}: OnboardingCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<any>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onComplete();
    }
  };

  const skip = () => {
    onComplete();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={slides[currentIndex].gradient}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Skip Button */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={skip}
          activeOpacity={0.8}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <Animated.FlatList
        data={slides}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            {/* Icon Container */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <View style={styles.iconBackground}>{item.icon}</View>
                <Sparkles
                  size={24}
                  color="#fff"
                  style={styles.sparkle1}
                  fill="#fff"
                />
                <Sparkles
                  size={20}
                  color="#fff"
                  style={styles.sparkle2}
                  fill="#fff"
                />
              </View>
            </View>

            {/* Emoji */}
            <Text style={styles.emoji}>{item.emoji}</Text>

            {/* Content */}
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id.toString()}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={32}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        {/* Pagination */}
        <View style={styles.pagination}>
          {slides.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 30, 10],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Next/Get Started Button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={scrollTo}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === slides.length - 1
                ? "Let's Go! 🚀"
                : 'Next'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 100,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(20px)',
  },
  sparkle1: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 30,
    left: 15,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  contentContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 17,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 10,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  pagination: {
    flexDirection: 'row',
    height: 64,
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  nextButton: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 30,
    ...theme.shadows.lg,
  },
  nextButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 30,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
});

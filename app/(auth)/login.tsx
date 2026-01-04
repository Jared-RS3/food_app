import OnboardingButton from '@/components/onboarding/OnboardingButton';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/constants';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Beautiful Pinterest-style images of food, restaurants, and Cape Town
const PINTEREST_IMAGES = [
  // Food close-ups
  {
    uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=500&fit=crop',
    height: 250,
  },
  {
    uri: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=600&fit=crop',
    height: 300,
  },
  {
    uri: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=450&fit=crop',
    height: 225,
  },

  // Cape Town scenery
  {
    uri: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400&h=550&fit=crop',
    height: 275,
  },
  {
    uri: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=400&h=500&fit=crop',
    height: 250,
  },
  {
    uri: 'https://images.unsplash.com/photo-1563656353898-febc9270a0f8?w=400&h=500&fit=crop',
    height: 250,
  },

  // People dining
  {
    uri: 'https://images.unsplash.com/photo-1529521678927-b2fc5b6eaa5b?w=400&h=600&fit=crop',
    height: 300,
  },
  {
    uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=450&fit=crop',
    height: 225,
  },
  {
    uri: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=400&h=550&fit=crop',
    height: 275,
  },

  // More food
  {
    uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=500&fit=crop',
    height: 250,
  },
  {
    uri: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=550&fit=crop',
    height: 275,
  },
  {
    uri: 'https://images.unsplash.com/photo-1481070555726-e2fe8357725c?w=400&h=600&fit=crop',
    height: 300,
  },

  // Restaurant ambiance
  {
    uri: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=600&fit=crop',
    height: 300,
  },
  {
    uri: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=400&h=450&fit=crop',
    height: 225,
  },
  {
    uri: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=500&fit=crop',
    height: 250,
  },
];

// Create 3 columns for masonry layout
const COLUMN_1 = PINTEREST_IMAGES.filter((_, i) => i % 3 === 0);
const COLUMN_2 = PINTEREST_IMAGES.filter((_, i) => i % 3 === 1);
const COLUMN_3 = PINTEREST_IMAGES.filter((_, i) => i % 3 === 2);

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const scrollY1 = useSharedValue(0);
  const scrollY2 = useSharedValue(0);
  const scrollY3 = useSharedValue(0);

  useEffect(() => {
    // Animate each column independently with different speeds and smooth easing
    scrollY1.value = withRepeat(
      withTiming(-height * 2, {
        duration: 35000,
        easing: Easing.linear, // Linear for smooth continuous scroll
      }),
      -1,
      false
    );
    scrollY2.value = withDelay(
      1000,
      withRepeat(
        withTiming(-height * 2, {
          duration: 40000,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );
    scrollY3.value = withDelay(
      2000,
      withRepeat(
        withTiming(-height * 2, {
          duration: 37000,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );
  }, []);

  const column1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY1.value }],
  }));

  const column2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY2.value }],
  }));

  const column3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY3.value }],
  }));

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Info', 'Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) throw error;

        if (data.user) {
          // Profile is created automatically by trigger, no need to create manually
          // Just mark as first time user in AsyncStorage
          await AsyncStorage.setItem('hasCompletedOnboarding', 'false');

          Alert.alert('Success! 🎉', "Account created! Let's get started.", [
            {
              text: 'Continue',
              onPress: () => router.replace('/(auth)/onboarding'),
            },
          ]);
        }
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) throw error;

        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('onboarding_complete')
          .eq('id', data.user.id)
          .single();

        if (profile?.onboarding_complete) {
          // Returning user - skip onboarding
          router.replace('/(tabs)');
        } else {
          // First time user - go to onboarding
          router.replace('/(auth)/onboarding');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Pinterest-style Masonry Grid Background */}
      <View style={styles.masonryContainer}>
        <View style={styles.masonryColumn}>
          <Animated.View style={[styles.columnContent, column1Style]}>
            {[...COLUMN_1, ...COLUMN_1, ...COLUMN_1].map((img, index) => (
              <Animated.View
                key={`col1-${index}`}
                entering={FadeInDown.delay(index * 50)}
                style={styles.imageWrapper}
              >
                <Image
                  source={{ uri: img.uri }}
                  style={[styles.masonryImage, { height: img.height }]}
                  resizeMode="cover"
                />
              </Animated.View>
            ))}
          </Animated.View>
        </View>

        <View style={styles.masonryColumn}>
          <Animated.View style={[styles.columnContent, column2Style]}>
            {[...COLUMN_2, ...COLUMN_2, ...COLUMN_2].map((img, index) => (
              <Animated.View
                key={`col2-${index}`}
                entering={FadeInDown.delay(100 + index * 50)}
                style={styles.imageWrapper}
              >
                <Image
                  source={{ uri: img.uri }}
                  style={[styles.masonryImage, { height: img.height }]}
                  resizeMode="cover"
                />
              </Animated.View>
            ))}
          </Animated.View>
        </View>

        <View style={styles.masonryColumn}>
          <Animated.View style={[styles.columnContent, column3Style]}>
            {[...COLUMN_3, ...COLUMN_3, ...COLUMN_3].map((img, index) => (
              <Animated.View
                key={`col3-${index}`}
                entering={FadeInDown.delay(200 + index * 50)}
                style={styles.imageWrapper}
              >
                <Image
                  source={{ uri: img.uri }}
                  style={[styles.masonryImage, { height: img.height }]}
                  resizeMode="cover"
                />
              </Animated.View>
            ))}
          </Animated.View>
        </View>
      </View>

      {/* Login Form Section */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formSection}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Logo/Title */}
          <Animated.View
            entering={FadeInUp.delay(200).springify()}
            style={styles.header}
          >
            <Text style={styles.logo}>🍽️</Text>
            <Text style={styles.title}>
              {isSignUp ? 'Join the Food Journey' : 'Welcome Back!'}
            </Text>
            <Text style={styles.subtitle}>
              {isSignUp
                ? 'Discover amazing food experiences'
                : 'Continue your culinary adventure'}
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={styles.form}
          >
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>

            <OnboardingButton
              text={
                loading
                  ? 'Loading...'
                  : isSignUp
                  ? 'Create Account'
                  : 'Continue'
              }
              onPress={handleAuth}
              disabled={loading}
              style={styles.authButton}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              onPress={() => setIsSignUp(!isSignUp)}
              style={styles.switchButton}
            >
              <Text style={styles.switchText}>
                {isSignUp
                  ? 'Already have an account? '
                  : "Don't have an account? "}
                <Text style={styles.switchTextBold}>
                  {isSignUp ? 'Log in' : 'Sign up'}
                </Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  masonryContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.55,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  masonryColumn: {
    flex: 1,
    paddingHorizontal: 2,
  },
  columnContent: {
    paddingVertical: SPACING.xs,
  },
  imageWrapper: {
    marginBottom: 4,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  masonryImage: {
    width: '100%',
    backgroundColor: COLORS.gray[100],
  },
  formSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: height * 0.4,
    paddingTop: SPACING.xl,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.massive,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: {
    fontSize: 56,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.sm + 1,
    fontWeight: '500',
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md + 4,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  authButton: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray[300],
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray[500],
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  switchText: {
    fontSize: FONT_SIZES.sm + 1,
    fontWeight: '500',
    color: COLORS.gray[600],
  },
  switchTextBold: {
    fontWeight: '700',
    color: '#E60023',
  },
});

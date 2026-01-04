import { Tabs } from 'expo-router';
import {
  Chrome as Home,
  MapPin,
  Sparkles,
  User,
  Users,
} from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF4081', // Vibrant food-app pink
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          paddingTop: 8,
          paddingBottom: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="foryou"
        options={{
          title: 'For You',
          tabBarIcon: ({ size, color }) => (
            <Sparkles size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: null, // Hidden - replaced by My Places
        }}
      />
      <Tabs.Screen
        name="my-places-simple"
        options={{
          title: 'My Places',
          tabBarIcon: ({ size, color }) => (
            <MapPin size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          href: null, // Hidden - integrated into My Places
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Social',
          tabBarIcon: ({ size, color }) => (
            <Users size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          href: null, // Hidden - moved to Social tab
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          href: null, // Hidden - moved to Profile tab
        }}
      />
      <Tabs.Screen
        name="gamification"
        options={{
          href: null, // Hidden - rewards integrated in profile
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}

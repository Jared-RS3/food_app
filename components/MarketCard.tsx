import { LinearGradient } from 'expo-linear-gradient';
import { Clock, MapPin, Star, Store } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../constants/theme';
import { FoodMarket } from '../types/market';

const COLORS = theme.colors;
const SPACING = theme.spacing;
const FONT_SIZES = theme.typography.sizes;
const BORDER_RADIUS = theme.borderRadius;

interface MarketCardProps {
  market: FoodMarket;
  onPress: () => void;
  width?: number;
}

export default function MarketCard({
  market,
  onPress,
  width = 320,
}: MarketCardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Image with Gradient Overlay */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: market.image }} style={styles.image} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        >
          {/* Tags at bottom */}
          <View style={styles.tagsContainer}>
            {market.tags.slice(0, 2).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Rating Badge */}
        <View style={styles.ratingBadge}>
          <Star size={14} color={COLORS.warning} fill={COLORS.warning} />
          <Text style={styles.ratingText}>{market.rating}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <Store size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {market.name}
          </Text>
        </View>

        <View style={styles.locationRow}>
          <MapPin size={14} color={COLORS.textSecondary} />
          <Text style={styles.location} numberOfLines={1}>
            {market.location}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoBadge}>
            <Clock size={12} color={COLORS.primary} />
            <Text style={styles.infoText}>{market.days_open[0]}</Text>
          </View>
          <View style={styles.infoBadge}>
            <Store size={12} color={COLORS.success} />
            <Text style={styles.infoText}>{market.total_stalls} stalls</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {market.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 20, // Rounder look
    overflow: 'hidden',
    marginBottom: 12, // Fresha spacing
    width: '100%',
    // Shadow for separation from gray background
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, // More visible shadow for contrast
    shadowRadius: 8,
    elevation: 4, // Higher elevation for better visibility
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.gray[100],
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: SPACING.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    backdropFilter: 'blur(10px)',
  },
  tagText: {
    fontSize: FONT_SIZES.xxs,
    fontWeight: '700',
    color: COLORS.white,
  },
  ratingBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    ...theme.shadows.md,
  },
  ratingText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700', // Fresha bold ratings
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  content: {
    padding: 16, // Fresha padding
    gap: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    flex: 1,
    fontSize: 16, // Fresha card title size
    fontWeight: '600', // Fresha semibold
    color: COLORS.text,
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  location: {
    flex: 1,
    fontSize: 14, // Fresha size
    color: COLORS.textSecondary,
    fontWeight: '500', // Medium
    letterSpacing: -0.2,
  },
  infoRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.gray[100], // Fresha gray-100
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6, // Tighter Fresha radius
  },
  infoText: {
    fontSize: 12, // Fresha size
    fontWeight: '500', // Medium
    color: COLORS.textSecondary,
    letterSpacing: -0.1,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

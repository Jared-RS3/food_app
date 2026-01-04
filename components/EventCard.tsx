import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, MapPin, Tag, Users } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../constants/theme';
import { Event } from '../types/event';

const COLORS = theme.colors;
const SPACING = theme.spacing;
const FONT_SIZES = theme.typography.sizes;
const BORDER_RADIUS = theme.borderRadius;

interface EventCardProps {
  event: Event;
  onPress: () => void;
  featured?: boolean;
}

export default function EventCard({
  event,
  onPress,
  featured = false,
}: EventCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'market_day':
        return COLORS.success;
      case 'special':
        return COLORS.warning;
      case 'festival':
        return COLORS.primary;
      case 'promotion':
        return COLORS.secondary;
      case 'launch':
        return COLORS.accent;
      default:
        return COLORS.primary;
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'market_day':
        return 'Market';
      case 'special':
        return 'Special';
      case 'festival':
        return 'Festival';
      case 'promotion':
        return 'Promo';
      case 'launch':
        return 'Launch';
      default:
        return type;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, featured && styles.featuredContainer]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: event.image }} style={styles.image} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageGradient}
        />

        {/* Event Type Badge */}
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: getEventTypeColor(event.event_type) },
          ]}
        >
          <Text style={styles.typeBadgeText}>
            {getEventTypeLabel(event.event_type)}
          </Text>
        </View>

        {/* Featured Badge */}
        {event.is_featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>⭐ Featured</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.businessName}>{event.business_name}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Calendar size={14} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>
              {formatDate(event.start_date)}
              {event.start_date !== event.end_date &&
                ` - ${formatDate(event.end_date)}`}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock size={14} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>
              {event.start_time}
              {event.end_time && ` - ${event.end_time}`}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MapPin size={14} color={COLORS.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.priceBadge}>
            <Tag size={12} color={COLORS.success} />
            <Text style={styles.priceText}>{event.price}</Text>
          </View>

          {event.attendees_count && (
            <View style={styles.attendeesBadge}>
              <Users size={12} color={COLORS.primary} />
              <Text style={styles.attendeesText}>
                {event.attendees_count} going
              </Text>
            </View>
          )}

          {event.is_recurring && (
            <View style={styles.recurringBadge}>
              <Text style={styles.recurringText}>🔄 Recurring</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    ...theme.shadows.md,
  },
  featuredContainer: {
    ...theme.shadows.lg,
    borderWidth: 2,
    borderColor: COLORS.warning,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.gray[100],
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  typeBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    ...theme.shadows.sm,
  },
  typeBadgeText: {
    fontSize: FONT_SIZES.xxs,
    fontWeight: '800',
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  featuredBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    ...theme.shadows.sm,
  },
  featuredBadgeText: {
    fontSize: FONT_SIZES.xxs,
    fontWeight: '800',
    color: COLORS.warning,
  },
  content: {
    padding: SPACING.lg,
  },
  businessName: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  metaText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    flexWrap: 'wrap',
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  priceText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.success,
  },
  attendeesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  attendeesText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.primary,
  },
  recurringBadge: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  recurringText: {
    fontSize: FONT_SIZES.xxs,
    fontWeight: '700',
    color: COLORS.text,
  },
});

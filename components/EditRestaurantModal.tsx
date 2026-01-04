import { theme } from '@/constants/theme';
import { restaurantService } from '@/services/restaurantService';
import { Restaurant } from '@/types/restaurant';
import { MapPin, Save, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface EditRestaurantModalProps {
  visible: boolean;
  onClose: () => void;
  restaurant: Restaurant | null;
  onSave: (updatedRestaurant: Restaurant) => void;
}

const cuisineTypes = [
  'Fine Dining',
  'Italian',
  'Japanese',
  'Mexican',
  'Indian',
  'Chinese',
  'Thai',
  'Mediterranean',
  'French',
  'American',
  'Korean',
  'Vietnamese',
  'African',
  'Contemporary',
  'European',
  'Seafood',
  'Asian',
  'Family',
  'Fast Food',
];

const quickTags = [
  'Fine Dining',
  'Casual Dining',
  'Family Friendly',
  'Date Night',
  'View',
  'Rooftop',
  'Outdoor Seating',
  'Live Music',
  'Happy Hour',
];

export default function EditRestaurantModal({
  visible,
  onClose,
  restaurant,
  onSave,
}: EditRestaurantModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    address: '',
    phone: '',
    website: '',
    instagramUrl: '',
    notes: '',
    priceLevel: '$$' as string,
    tags: [] as string[],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (restaurant && visible) {
      setFormData({
        name: restaurant.name || '',
        cuisine: restaurant.cuisine || '',
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        website: '',
        instagramUrl: '',
        notes: restaurant.description || '',
        priceLevel: restaurant.priceRange || '$$',
        tags: restaurant.tags || [],
      });
    }
  }, [restaurant, visible]);

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSave = async () => {
    if (!restaurant || !formData.name.trim()) {
      Alert.alert('Error', 'Restaurant name is required');
      return;
    }

    setLoading(true);
    try {
      const success = await restaurantService.updateRestaurant(restaurant.id, {
        name: formData.name.trim(),
        cuisine: formData.cuisine,
        address: formData.address,
        phone: formData.phone,
        website: formData.website,
        instagramUrl: formData.instagramUrl,
        notes: formData.notes,
        tags: formData.tags,
      });

      if (success) {
        const updatedRestaurant = {
          ...restaurant,
          name: formData.name.trim(),
          cuisine: formData.cuisine,
          address: formData.address,
          phone: formData.phone,
          website: formData.website,
          instagramUrl: formData.instagramUrl,
          notes: formData.notes,
          priceRange: formData.priceLevel,
          tags: formData.tags,
        };

        onSave(updatedRestaurant);
        onClose();
        Alert.alert('Success', 'Restaurant updated successfully!');
      }
    } catch (error) {
      console.error('Error updating restaurant:', error);
      Alert.alert('Error', 'Failed to update restaurant');
    } finally {
      setLoading(false);
    }
  };

  if (!restaurant) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Restaurant</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading || !formData.name.trim()}
            style={[
              styles.saveButton,
              (!formData.name.trim() || loading) && styles.disabledButton,
            ]}
          >
            <Save
              size={20}
              color={
                loading ? theme.colors.textSecondary : theme.colors.primary
              }
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Restaurant Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter restaurant name"
              value={formData.name}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, name: text }))
              }
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cuisine Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {cuisineTypes.map((cuisine) => (
                  <TouchableOpacity
                    key={cuisine}
                    style={[
                      styles.chip,
                      formData.cuisine === cuisine && styles.chipActive,
                    ]}
                    onPress={() =>
                      setFormData((prev) => ({ ...prev, cuisine }))
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        formData.cuisine === cuisine && styles.chipTextActive,
                      ]}
                    >
                      {cuisine}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price Level</Text>
            <View style={styles.priceContainer}>
              {['$', '$$', '$$$', '$$$$'].map((price) => (
                <TouchableOpacity
                  key={price}
                  style={[
                    styles.priceButton,
                    formData.priceLevel === price && styles.priceButtonActive,
                  ]}
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, priceLevel: price }))
                  }
                >
                  <Text
                    style={[
                      styles.priceButtonText,
                      formData.priceLevel === price &&
                        styles.priceButtonTextActive,
                    ]}
                  >
                    {price}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <View style={styles.locationInput}>
              <MapPin size={20} color={theme.colors.primary} />
              <TextInput
                style={styles.locationTextInput}
                placeholder="Restaurant address"
                value={formData.address}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, address: text }))
                }
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              value={formData.phone}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, phone: text }))
              }
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              placeholder="Website URL"
              value={formData.website}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, website: text }))
              }
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Instagram URL</Text>
            <TextInput
              style={styles.input}
              placeholder="Instagram profile URL"
              value={formData.instagramUrl}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, instagramUrl: text }))
              }
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Additional notes about this restaurant"
              value={formData.notes}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, notes: text }))
              }
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags</Text>
            <View style={styles.tagsContainer}>
              {quickTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tag,
                    formData.tags.includes(tag) && styles.tagActive,
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      formData.tags.includes(tag) && styles.tagTextActive,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  saveButton: {
    padding: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  chip: {
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  chipTextActive: {
    color: theme.colors.white,
  },
  priceContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priceButton: {
    flex: 1,
    backgroundColor: theme.colors.white,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  priceButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  priceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  priceButtonTextActive: {
    color: theme.colors.white,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  locationTextInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagActive: {
    backgroundColor: theme.colors.primary,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  tagTextActive: {
    color: theme.colors.white,
  },
});

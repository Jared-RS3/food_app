import { theme } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChefHat,
  CreditCard as Edit3,
  Heart,
  Plus,
  Star,
  Trash2,
  Utensils,
  X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { height, width } = Dimensions.get('window');

interface MenuBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  restaurant: any;
  menuItems: any[];
  onAddFood: (food: any) => void;
}

const foodCategories = [
  'Appetizer',
  'Main Course',
  'Dessert',
  'Beverage',
  'Snack',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Side Dish',
  'Salad',
  'Soup',
  'Pasta',
];

const quickTags = [
  'Spicy',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Popular',
  'Chef Special',
];

export default function MenuBottomSheet({
  visible,
  onClose,
  restaurant,
  menuItems,
  onAddFood,
}: MenuBottomSheetProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    tags: [] as string[],
  });

  const slideAnim = useSharedValue(height);
  const opacityAnim = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacityAnim.value = withTiming(1, { duration: 200 });
      slideAnim.value = withSpring(0, {
        damping: 30,
        stiffness: 400,
        mass: 0.5,
        overshootClamping: false,
      });
    } else {
      opacityAnim.value = withTiming(0, { duration: 200 });
      slideAnim.value = withTiming(height, { duration: 250 });
      setShowAddForm(false);
      resetForm();
    }
  }, [visible]);

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideAnim.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacityAnim.value,
  }));

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      description: '',
      tags: [],
    });
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const toggleFavorite = async (item: any, type: 'restaurant' | 'food') => {
    try {
      const tableName = type === 'restaurant' ? 'restaurants' : 'food_items';

      // Toggle the favorite status
      const { data, error } = await supabase
        .from(tableName)
        .update({ is_favorite: !item.is_favorite })
        .eq('id', item.id)
        .select()
        .single();

      if (error) throw error;

      Alert.alert(
        'Success',
        `${item.name} ${
          data.is_favorite ? 'added to' : 'removed from'
        } favorites`
      );

      // Update the item in the parent component if needed
      if (type === 'restaurant' && restaurant?.id === item.id) {
        // Update restaurant favorite status
        restaurant.is_favorite = data.is_favorite;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const handleAddFood = () => {
    if (!formData.name.trim()) {
      Alert.alert('Missing Info', 'Please enter a food name');
      return;
    }

    addFoodToSupabase();
  };

  const addFoodToSupabase = async () => {
    try {
      const { data: insertFood, error: insertError } = await supabase
        .from('food_items')
        .insert([
          {
            user_id: '10606b48-de66-4322-886b-ed13230a264e',
            name: formData.name,
            category: formData.category || 'Main Course',
            restaurant_id: restaurant?.id,
            description: formData.description,
            price: formData.price || `R${Math.floor(Math.random() * 200) + 50}`,
            rating: 4.0 + Math.random() * 1,
            image_url:
              'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
            is_favorite: false,
          },
        ])
        .select('*')
        .single();

      if (insertError) throw insertError;

      // Add tags if any
      if (formData.tags.length > 0) {
        const tagsRows = formData.tags.map((tag) => ({
          food_item_id: insertFood.id,
          tag: tag,
        }));

        const { error: tagsError } = await supabase
          .from('food_item_tags')
          .insert(tagsRows);

        if (tagsError) {
          console.error('Error adding tags:', tagsError);
        }
      }

      // Create the food object in the expected format for the parent component
      const newFood = {
        id: insertFood.id,
        name: insertFood.name,
        category: insertFood.category,
        price: insertFood.price,
        description: insertFood.description,
        restaurantId: insertFood.restaurant_id,
        restaurantName: restaurant?.name,
        tags: formData.tags,
        rating: insertFood.rating,
        image: insertFood.image_url,
        is_favorite: insertFood.is_favorite,
      };

      onAddFood(newFood);
      Alert.alert(
        'Success!',
        `${formData.name} added to ${restaurant?.name || 'restaurant'} menu`
      );
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding food to Supabase:', error);
      Alert.alert('Error', 'Failed to add food item');
    }
  };

  if (!visible) return null;

  // Show a default state if no restaurant is provided
  if (!restaurant) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={onClose}
      >
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
          <TouchableOpacity style={styles.backdropButton} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.modalContainer, animatedModalStyle]}>
          <LinearGradient
            colors={[theme.colors.white, '#f8f9fa']}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.handle} />

              <View style={styles.noRestaurantHeader}>
                <Text style={styles.noRestaurantTitle}>Menu Manager</Text>
                <Text style={styles.noRestaurantSubtitle}>
                  Select a restaurant to manage its menu
                </Text>
              </View>

              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View
                entering={FadeIn.delay(300)}
                style={styles.emptyState}
              >
                <ChefHat size={64} color={theme.colors.black} />
                <Text style={styles.emptyStateTitle}>
                  No Restaurant Selected
                </Text>
                <Text style={styles.emptyStateText}>
                  Add food to a restaurant first, or select from your favorites
                  to manage menus
                </Text>
                <TouchableOpacity
                  style={styles.selectRestaurantButton}
                  onPress={onClose}
                >
                  <Text style={styles.selectRestaurantButtonText}>
                    Browse Restaurants
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </ScrollView>
          </LinearGradient>
        </Animated.View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
        <TouchableOpacity style={styles.backdropButton} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[styles.modalContainer, animatedModalStyle]}>
        <LinearGradient
          colors={[theme.colors.white, '#f8f9fa']}
          style={styles.modalContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.handle} />

            <View style={styles.restaurantHeader}>
              <Image
                source={{
                  uri:
                    restaurant.image ||
                    'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg',
                }}
                style={styles.restaurantImage}
              />
              <View style={styles.restaurantInfo}>
                <View style={styles.restaurantTitleRow}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  <TouchableOpacity
                    onPress={() => toggleFavorite(restaurant, 'restaurant')}
                    style={styles.restaurantFavoriteButton}
                  >
                    <Heart
                      size={20}
                      color={
                        restaurant.is_favorite
                          ? theme.colors.secondary
                          : theme.colors.textSecondary
                      }
                      fill={
                        restaurant.is_favorite ? theme.colors.secondary : 'none'
                      }
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.restaurantMeta}>
                  <Star
                    size={16}
                    color={theme.colors.star}
                    fill={theme.colors.star}
                  />
                  <Text style={styles.restaurantRating}>
                    {restaurant.rating || '4.5'}
                  </Text>
                  <Text style={styles.restaurantCuisine}>
                    • {restaurant.cuisine}
                  </Text>
                </View>
                <Text style={styles.menuCount}>
                  {menuItems.length} {menuItems.length === 1 ? 'item' : 'items'}{' '}
                  on menu
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Quick Add Button */}
            <TouchableOpacity
              style={styles.quickAddButton}
              onPress={() => setShowAddForm(!showAddForm)}
            >
              <View style={styles.quickAddIcon}>
                <Plus size={20} color={theme.colors.white} />
              </View>
              <Text style={styles.quickAddText}>Add New Item to Menu</Text>
              <ChefHat size={20} color={theme.colors.primary} />
            </TouchableOpacity>

            {/* Add Form */}
            {showAddForm && (
              <Animated.View
                entering={SlideInDown.springify()}
                style={styles.addForm}
              >
                <Text style={styles.formTitle}>Add Menu Item</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Item Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter food name"
                    value={formData.name}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, name: text }))
                    }
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipContainer}>
                      {foodCategories.slice(0, 6).map((category) => (
                        <TouchableOpacity
                          key={category}
                          style={[
                            styles.chip,
                            formData.category === category && styles.chipActive,
                          ]}
                          onPress={() =>
                            setFormData((prev) => ({ ...prev, category }))
                          }
                        >
                          <Text
                            style={[
                              styles.chipText,
                              formData.category === category &&
                                styles.chipTextActive,
                            ]}
                          >
                            {category}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Price</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., R120"
                    value={formData.price}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, price: text }))
                    }
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe the dish"
                    value={formData.description}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, description: text }))
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

                <TouchableOpacity
                  style={[
                    styles.addButton,
                    !formData.name.trim() && styles.addButtonDisabled,
                  ]}
                  onPress={handleAddFood}
                  disabled={!formData.name.trim()}
                >
                  <Plus size={20} color={theme.colors.white} />
                  <Text style={styles.addButtonText}>Add to Menu</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Menu Items */}
            <View style={styles.menuSection}>
              <Text style={styles.menuTitle}>Current Menu</Text>

              {menuItems.length === 0 ? (
                <Animated.View
                  entering={FadeIn.delay(300)}
                  style={styles.emptyState}
                >
                  <Utensils size={48} color={theme.colors.black} />
                  <Text style={styles.emptyStateTitle}>No menu items yet</Text>
                  <Text style={styles.emptyStateText}>
                    Start building the menu for {restaurant.name}
                  </Text>
                </Animated.View>
              ) : (
                <View style={styles.menuItems}>
                  {menuItems.map((item, index) => (
                    <Animated.View
                      key={item.id}
                      entering={FadeIn.delay(index * 100)}
                      style={styles.menuItem}
                    >
                      <Image
                        source={{
                          uri:
                            item.image ||
                            item.image_url ||
                            'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
                        }}
                        style={styles.menuItemImage}
                      />
                      <View style={styles.menuItemContent}>
                        <View style={styles.menuItemHeader}>
                          <Text style={styles.menuItemName}>{item.name}</Text>
                          <View style={styles.menuItemHeaderRight}>
                            <TouchableOpacity
                              onPress={() => toggleFavorite(item, 'food')}
                              style={styles.menuItemFavoriteButton}
                            >
                              <Heart
                                size={16}
                                color={
                                  item.is_favorite
                                    ? theme.colors.secondary
                                    : theme.colors.textSecondary
                                }
                                fill={
                                  item.is_favorite
                                    ? theme.colors.secondary
                                    : 'none'
                                }
                              />
                            </TouchableOpacity>
                            <Text style={styles.menuItemPrice}>
                              {item.price}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.menuItemCategory}>
                          {item.category}
                        </Text>
                        {item.description && (
                          <Text
                            style={styles.menuItemDescription}
                            numberOfLines={2}
                          >
                            {item.description}
                          </Text>
                        )}
                      </View>
                      <View style={styles.menuItemActions}>
                        <TouchableOpacity style={styles.actionButton}>
                          <Edit3 size={16} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                          <Trash2 size={16} color={theme.colors.secondary} />
                        </TouchableOpacity>
                      </View>
                    </Animated.View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropButton: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.9,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  restaurantHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  restaurantName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: theme.colors.text,
    flex: 1,
  },
  restaurantFavoriteButton: {
    padding: 4,
    marginLeft: 8,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  restaurantRating: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 4,
  },
  restaurantCuisine: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  menuCount: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  noRestaurantHeader: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  noRestaurantTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: theme.colors.text,
    marginBottom: 4,
  },
  noRestaurantSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 16,
    padding: 8,
  },
  content: {
    padding: 20,
  },
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: theme.colors.primaryLight,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  quickAddIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickAddText: {
    flex: 1,
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: theme.colors.primary,
  },
  addForm: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Poppins-Regular',
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
    paddingBottom: 8,
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
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: theme.colors.text,
  },
  chipTextActive: {
    color: theme.colors.white,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    // backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagActive: {
    backgroundColor: theme.colors.primary,
  },
  tagText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: theme.colors.primary,
  },
  tagTextActive: {
    color: theme.colors.white,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonDisabled: {
    // backgroundColor: theme.colors.gray,
    shadowOpacity: 0,
    elevation: 0,
  },
  addButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: theme.colors.white,
  },
  menuSection: {
    marginTop: 8,
  },
  menuTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  selectRestaurantButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  selectRestaurantButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: theme.colors.white,
  },
  menuItems: {
    gap: 16,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  menuItemHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  menuItemFavoriteButton: {
    padding: 4,
    marginRight: 8,
  },
  menuItemPrice: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: theme.colors.primary,
  },
  menuItemCategory: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  menuItemDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  menuItemActions: {
    justifyContent: 'center',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

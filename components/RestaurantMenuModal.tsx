import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Star, Plus, Minus } from 'lucide-react-native';
import { Restaurant } from '@/types/restaurant';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image?: string;
  category: string;
  rating?: number;
  isPopular?: boolean;
}

interface RestaurantMenuModalProps {
  visible: boolean;
  onClose: () => void;
  restaurant: Restaurant | null;
}

const SAMPLE_MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with seasonal vegetables and lemon butter sauce',
    price: 'R285',
    image: 'https://images.pexels.com/photos/1516415/pexels-photo-1516415.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Main Course',
    rating: 4.8,
    isPopular: true,
  },
  {
    id: '2',
    name: 'Beef Tenderloin',
    description: 'Premium beef tenderloin with truffle mashed potatoes and red wine jus',
    price: 'R395',
    image: 'https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Main Course',
    rating: 4.9,
    isPopular: true,
  },
  {
    id: '3',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with parmesan, croutons and our signature dressing',
    price: 'R125',
    image: 'https://images.pexels.com/photos/1213710/pexels-photo-1213710.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Starters',
    rating: 4.5,
  },
  {
    id: '4',
    name: 'Chocolate Fondant',
    description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
    price: 'R145',
    image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Desserts',
    rating: 4.7,
  },
];

const MENU_CATEGORIES = ['All', 'Starters', 'Main Course', 'Desserts', 'Beverages'];

export default function RestaurantMenuModal({
  visible,
  onClose,
  restaurant,
}: RestaurantMenuModalProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartItems, setCartItems] = useState<{ [key: string]: number }>({});

  if (!restaurant) return null;

  const filteredItems = selectedCategory === 'All' 
    ? SAMPLE_MENU_ITEMS 
    : SAMPLE_MENU_ITEMS.filter(item => item.category === selectedCategory);

  const addToCart = (itemId: string) => {
    setCartItems(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 0) - 1, 0)
    }));
  };

  const getCartTotal = () => {
    return Object.entries(cartItems).reduce((total, [itemId, quantity]) => {
      const item = SAMPLE_MENU_ITEMS.find(i => i.id === itemId);
      if (item && quantity > 0) {
        const price = parseFloat(item.price.replace('R', ''));
        return total + (price * quantity);
      }
      return total;
    }, 0);
  };

  const getTotalItems = () => {
    return Object.values(cartItems).reduce((total, quantity) => total + quantity, 0);
  };

  const renderMenuItem = (item: MenuItem) => {
    const quantity = cartItems[item.id] || 0;
    
    return (
      <View key={item.id} style={styles.menuItem}>
        <View style={styles.menuItemContent}>
          <View style={styles.menuItemInfo}>
            <View style={styles.menuItemHeader}>
              <Text style={styles.menuItemName}>{item.name}</Text>
              {item.isPopular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>Popular</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.menuItemDescription}>{item.description}</Text>
            
            <View style={styles.menuItemFooter}>
              <Text style={styles.menuItemPrice}>{item.price}</Text>
              {item.rating && (
                <View style={styles.ratingContainer}>
                  <Star size={14} color="#FFB800" fill="#FFB800" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
              )}
            </View>
          </View>
          
          {item.image && (
            <Image source={{ uri: item.image }} style={styles.menuItemImage} />
          )}
        </View>
        
        <View style={styles.quantityControls}>
          {quantity > 0 ? (
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => removeFromCart(item.id)}
              >
                <Minus size={16} color={COLORS.primary} />
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>{quantity}</Text>
              
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => addToCart(item.id)}
              >
                <Plus size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addToCart(item.id)}
            >
              <Plus size={16} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={COLORS.gray[700]} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Text style={styles.headerSubtitle}>Menu</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.categoryTabs}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {MENU_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryTab,
                  selectedCategory === category && styles.activeCategoryTab,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    selectedCategory === category && styles.activeCategoryTabText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <ScrollView style={styles.menuContent} showsVerticalScrollIndicator={false}>
          {filteredItems.map(renderMenuItem)}
        </ScrollView>
        
        {getTotalItems() > 0 && (
          <View style={styles.cartSummary}>
            <View style={styles.cartInfo}>
              <Text style={styles.cartItemsText}>
                {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.cartTotalText}>R{getCartTotal().toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton}>
              <Text style={styles.checkoutButtonText}>View Cart</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  headerInfo: {
    alignItems: 'center',
  },
  restaurantName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.gray[900],
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
  categoryTabs: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  categoryTab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[50],
  },
  activeCategoryTab: {
    backgroundColor: COLORS.primary,
  },
  categoryTabText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.gray[600],
  },
  activeCategoryTabText: {
    color: COLORS.white,
  },
  menuContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  menuItem: {
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  menuItemContent: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  menuItemInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  menuItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  menuItemName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    flex: 1,
  },
  popularBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginLeft: SPACING.sm,
  },
  popularText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  menuItemDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  menuItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.gray[900],
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginLeft: 4,
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
  },
  quantityControls: {
    alignItems: 'flex-end',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.xs,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  quantityText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginHorizontal: SPACING.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginLeft: 4,
  },
  cartSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  cartInfo: {
    flex: 1,
  },
  cartItemsText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  cartTotalText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  checkoutButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
});
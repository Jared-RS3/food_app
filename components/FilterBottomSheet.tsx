import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/constants';
import { Check, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface FilterBottomSheetProps {
  isVisible?: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  currentFilters?: any;
}

const CUISINE_FILTERS: FilterOption[] = [
  { id: '1', label: 'Italian', value: 'Italian' },
  { id: '2', label: 'Asian', value: 'Asian' },
  { id: '3', label: 'Japanese', value: 'Japanese' },
  { id: '4', label: 'African', value: 'African' },
  { id: '5', label: 'Contemporary', value: 'Contemporary' },
  { id: '6', label: 'Seafood', value: 'Seafood' },
  { id: '7', label: 'Mexican', value: 'Mexican' },
  { id: '8', label: 'Indian', value: 'Indian' },
  { id: '9', label: 'French', value: 'French' },
  { id: '10', label: 'Mediterranean', value: 'Mediterranean' },
];

const PRICE_FILTERS: FilterOption[] = [
  { id: '1', label: 'R - Budget Friendly', value: '$' },
  { id: '2', label: 'RR - Moderate', value: '$$' },
  { id: '3', label: 'RRR - Fine Dining', value: '$$$' },
  { id: '4', label: 'RRRR - Luxury', value: '$$$$' },
];

const RATING_FILTERS: FilterOption[] = [
  { id: '1', label: '4.5+ Excellent', value: '4.5' },
  { id: '2', label: '4.0+ Very Good', value: '4.0' },
  { id: '3', label: '3.5+ Good', value: '3.5' },
  { id: '4', label: '3.0+ Average', value: '3.0' },
];

const DISTANCE_FILTERS: FilterOption[] = [
  { id: '1', label: 'Within 1km', value: '1' },
  { id: '2', label: 'Within 3km', value: '3' },
  { id: '3', label: 'Within 5km', value: '5' },
  { id: '4', label: 'Within 10km', value: '10' },
  { id: '5', label: 'Within 20km', value: '20' },
];

const MEAL_TYPE_FILTERS: FilterOption[] = [
  { id: '1', label: 'Breakfast', value: 'Breakfast' },
  { id: '2', label: 'Brunch', value: 'Brunch' },
  { id: '3', label: 'Lunch', value: 'Lunch' },
  { id: '4', label: 'Dinner', value: 'Dinner' },
  { id: '5', label: 'Late Night', value: 'Late Night' },
];

const DIETARY_FILTERS: FilterOption[] = [
  { id: '1', label: 'Vegetarian Options', value: 'Vegetarian' },
  { id: '2', label: 'Vegan Options', value: 'Vegan' },
  { id: '3', label: 'Gluten-Free', value: 'Gluten-Free' },
  { id: '4', label: 'Halal', value: 'Halal' },
  { id: '5', label: 'Kosher', value: 'Kosher' },
];

const AMENITIES_FILTERS: FilterOption[] = [
  { id: '1', label: 'Outdoor Seating', value: 'Outdoor' },
  { id: '2', label: 'Wifi Available', value: 'Wifi' },
  { id: '3', label: 'Parking Available', value: 'Parking' },
  { id: '4', label: 'Delivery Available', value: 'Delivery' },
  { id: '5', label: 'Reservations', value: 'Reservations' },
  { id: '6', label: 'Pet Friendly', value: 'Pet-Friendly' },
];

const ATMOSPHERE_FILTERS: FilterOption[] = [
  { id: '1', label: 'Romantic', value: 'Romantic' },
  { id: '2', label: 'Family Friendly', value: 'Family' },
  { id: '3', label: 'Business Casual', value: 'Business' },
  { id: '4', label: 'Trendy', value: 'Trendy' },
  { id: '5', label: 'Casual', value: 'Casual' },
];

export default function FilterBottomSheet({
  isVisible,
  onClose,
  onApplyFilters,
  currentFilters = {},
}: FilterBottomSheetProps) {
  // Use isVisible if provided, fallback to visible for compatibility
  const isModalVisible = isVisible !== undefined ? isVisible : false;

  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(
    currentFilters.cuisines || []
  );
  const [selectedPrices, setSelectedPrices] = useState<string[]>(
    currentFilters.prices || []
  );
  const [selectedRating, setSelectedRating] = useState<string>(
    currentFilters.rating || ''
  );
  const [selectedDistance, setSelectedDistance] = useState<string>(
    currentFilters.distance || ''
  );
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>(
    currentFilters.mealTypes || []
  );
  const [selectedDietary, setSelectedDietary] = useState<string[]>(
    currentFilters.dietary || []
  );
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    currentFilters.amenities || []
  );
  const [selectedAtmosphere, setSelectedAtmosphere] = useState<string[]>(
    currentFilters.atmosphere || []
  );

  const toggleSelection = (
    value: string,
    currentSelection: string[],
    setter: (values: string[]) => void
  ) => {
    if (currentSelection.includes(value)) {
      setter(currentSelection.filter((item) => item !== value));
    } else {
      setter([...currentSelection, value]);
    }
  };

  const handleApplyFilters = () => {
    const filters = {
      cuisines: selectedCuisines,
      prices: selectedPrices,
      rating: selectedRating,
      distance: selectedDistance,
      mealTypes: selectedMealTypes,
      dietary: selectedDietary,
      amenities: selectedAmenities,
      atmosphere: selectedAtmosphere,
    };
    onApplyFilters(filters);
    onClose();
  };

  const handleClearAll = () => {
    setSelectedCuisines([]);
    setSelectedPrices([]);
    setSelectedRating('');
    setSelectedDistance('');
    setSelectedMealTypes([]);
    setSelectedDietary([]);
    setSelectedAmenities([]);
    setSelectedAtmosphere([]);
  };

  const renderFilterSection = (
    title: string,
    options: FilterOption[],
    selectedValues: string[] | string,
    onToggle: (value: string) => void,
    multiSelect: boolean = true
  ) => (
    <View style={styles.filterSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = multiSelect
            ? (selectedValues as string[]).includes(option.value)
            : selectedValues === option.value;

          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionButton, isSelected && styles.selectedOption]}
              onPress={() => onToggle(option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.selectedOptionText,
                ]}
              >
                {option.label}
              </Text>
              {isSelected && <Check size={16} color={COLORS.white} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const getActiveFiltersCount = () => {
    return (
      selectedCuisines.length +
      selectedPrices.length +
      selectedMealTypes.length +
      selectedDietary.length +
      selectedAmenities.length +
      selectedAtmosphere.length +
      (selectedRating ? 1 : 0) +
      (selectedDistance ? 1 : 0)
    );
  };

  return (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={COLORS.gray[700]} />
          </TouchableOpacity>
          <Text style={styles.title}>Filters</Text>
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderFilterSection(
            'Cuisine Type',
            CUISINE_FILTERS,
            selectedCuisines,
            (value) =>
              toggleSelection(value, selectedCuisines, setSelectedCuisines)
          )}

          {renderFilterSection(
            'Price Range',
            PRICE_FILTERS,
            selectedPrices,
            (value) => toggleSelection(value, selectedPrices, setSelectedPrices)
          )}

          {renderFilterSection(
            'Minimum Rating',
            RATING_FILTERS,
            selectedRating,
            setSelectedRating,
            false
          )}

          {renderFilterSection(
            'Distance',
            DISTANCE_FILTERS,
            selectedDistance,
            setSelectedDistance,
            false
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApplyFilters}
          >
            <Text style={styles.applyButtonText}>
              Apply Filters{' '}
              {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
            </Text>
          </TouchableOpacity>
        </View>
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
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.gray[900],
  },
  clearText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  filterSection: {
    marginVertical: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[100],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  selectedOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.gray[700],
    marginRight: SPACING.xs,
  },
  selectedOptionText: {
    color: COLORS.white,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  applyButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
});

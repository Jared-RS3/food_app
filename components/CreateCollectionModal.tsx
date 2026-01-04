import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants';
import { generateId } from '@/utils/helpers';

interface CreateCollectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (collection: any) => void;
}

const COLLECTION_ICONS = ['🔥', '💖', '⭐', '🍕', '🍜', '🥗', '🍰', '☕', '🍷', '🎉'];
const COLLECTION_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export default function CreateCollectionModal({ visible, onClose, onSave }: CreateCollectionModalProps) {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(COLLECTION_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLLECTION_COLORS[0]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a collection name');
      return;
    }

    const newCollection = {
      id: generateId(),
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
      restaurantCount: 0,
      recentAdditions: [],
      restaurants: [],
      dateCreated: new Date().toISOString(),
    };

    onSave(newCollection);
    setName('');
    setSelectedIcon(COLLECTION_ICONS[0]);
    setSelectedColor(COLLECTION_COLORS[0]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={COLORS.gray[700]} />
          </TouchableOpacity>
          <Text style={styles.title}>Create Collection</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Collection Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Date Night, Must Try, Weekend Spots"
              value={name}
              onChangeText={setName}
              maxLength={30}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Choose Icon</Text>
            <View style={styles.iconGrid}>
              {COLLECTION_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconButton,
                    selectedIcon === icon && styles.selectedIconButton,
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Text style={styles.iconText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Choose Color</Text>
            <View style={styles.colorGrid}>
              {COLLECTION_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColorButton,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </View>
          
          <View style={styles.previewSection}>
            <Text style={styles.inputLabel}>Preview</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <View style={[styles.previewIcon, { backgroundColor: `${selectedColor}20` }]}>
                  <Text style={styles.previewIconText}>{selectedIcon}</Text>
                </View>
                <TouchableOpacity style={styles.previewViewButton}>
                  <Text style={[styles.previewViewText, { color: selectedColor }]}>View</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.previewName}>{name || 'Collection Name'}</Text>
              <Text style={styles.previewCount}>0 restaurants</Text>
              
              <View style={[styles.previewBorder, { borderLeftColor: selectedColor }]} />
            </View>
          </View>
        </ScrollView>
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Create Collection</Text>
        </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.xl,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginBottom: SPACING.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[900],
    backgroundColor: COLORS.white,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedIconButton: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  iconText: {
    fontSize: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColorButton: {
    borderColor: COLORS.gray[300],
  },
  previewSection: {
    marginTop: SPACING.lg,
  },
  previewCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  previewBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: BORDER_RADIUS.md,
    borderBottomLeftRadius: BORDER_RADIUS.md,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewIconText: {
    fontSize: 20,
  },
  previewViewButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray[50],
  },
  previewViewText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  previewName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  previewCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
});
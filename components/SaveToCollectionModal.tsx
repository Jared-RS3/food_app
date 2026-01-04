import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Check, Plus } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants';
import { Collection } from '@/types/restaurant';

interface SaveToCollectionModalProps {
  visible: boolean;
  onClose: () => void;
  collections: Collection[];
  restaurantId: string;
  restaurantName: string;
  onSaveToCollection: (collectionId: string, restaurantId: string) => void;
  onCreateNewCollection: () => void;
}

export default function SaveToCollectionModal({
  visible,
  onClose,
  collections,
  restaurantId,
  restaurantName,
  onSaveToCollection,
  onCreateNewCollection,
}: SaveToCollectionModalProps) {
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  const toggleCollection = (collectionId: string) => {
    setSelectedCollections(prev => 
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  const handleSave = () => {
    if (selectedCollections.length === 0) {
      Alert.alert('Error', 'Please select at least one collection');
      return;
    }

    selectedCollections.forEach(collectionId => {
      onSaveToCollection(collectionId, restaurantId);
    });

    setSelectedCollections([]);
    onClose();
    Alert.alert('Success', `${restaurantName} has been added to your selected collections!`);
  };

  const handleCreateNew = () => {
    onClose();
    onCreateNewCollection();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={COLORS.gray[700]} />
          </TouchableOpacity>
          <Text style={styles.title}>Save to Collection</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{restaurantName}</Text>
          <Text style={styles.subtitle}>Choose collections to save this restaurant</Text>
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.createNewButton} onPress={handleCreateNew}>
            <View style={styles.createNewIcon}>
              <Plus size={20} color={COLORS.primary} />
            </View>
            <View style={styles.createNewText}>
              <Text style={styles.createNewTitle}>Create New Collection</Text>
              <Text style={styles.createNewSubtitle}>Start a new collection for this restaurant</Text>
            </View>
          </TouchableOpacity>
          
          {collections.length > 0 && (
            <View style={styles.collectionsSection}>
              <Text style={styles.sectionTitle}>Your Collections</Text>
              {collections.map((collection) => {
                const isSelected = selectedCollections.includes(collection.id);
                const alreadyInCollection = collection.restaurants.includes(restaurantId);
                
                return (
                  <TouchableOpacity
                    key={collection.id}
                    style={[
                      styles.collectionItem,
                      isSelected && styles.selectedCollectionItem,
                      alreadyInCollection && styles.disabledCollectionItem,
                    ]}
                    onPress={() => !alreadyInCollection && toggleCollection(collection.id)}
                    disabled={alreadyInCollection}
                  >
                    <View style={styles.collectionLeft}>
                      <View style={[styles.collectionIcon, { backgroundColor: `${collection.color}20` }]}>
                        <Text style={styles.collectionEmoji}>{collection.icon}</Text>
                      </View>
                      <View style={styles.collectionInfo}>
                        <Text style={styles.collectionName}>{collection.name}</Text>
                        <Text style={styles.collectionCount}>
                          {collection.restaurantCount} restaurant{collection.restaurantCount !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.collectionRight}>
                      {alreadyInCollection ? (
                        <View style={styles.alreadyAddedBadge}>
                          <Check size={16} color={COLORS.success} />
                          <Text style={styles.alreadyAddedText}>Added</Text>
                        </View>
                      ) : (
                        <View style={[
                          styles.checkbox,
                          isSelected && styles.checkedCheckbox,
                        ]}>
                          {isSelected && <Check size={16} color={COLORS.white} />}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
        
        {selectedCollections.length > 0 && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              Save to {selectedCollections.length} Collection{selectedCollections.length !== 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
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
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.gray[900],
  },
  restaurantInfo: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.gray[50],
  },
  restaurantName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  createNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    backgroundColor: COLORS.primary + '05',
    marginBottom: SPACING.lg,
  },
  createNewIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  createNewText: {
    flex: 1,
  },
  createNewTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 2,
  },
  createNewSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  collectionsSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  selectedCollectionItem: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '05',
  },
  disabledCollectionItem: {
    opacity: 0.6,
  },
  collectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  collectionIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  collectionEmoji: {
    fontSize: 20,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginBottom: 2,
  },
  collectionCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
  collectionRight: {
    marginLeft: SPACING.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedCheckbox: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  alreadyAddedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.success + '10',
  },
  alreadyAddedText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 4,
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
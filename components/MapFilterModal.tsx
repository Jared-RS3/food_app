import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { X, Check, Users, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { MapFilter, User as UserType, FriendGroup } from '@/types/social';

const { width } = Dimensions.get('window');

interface MapFilterModalProps {
  visible: boolean;
  onClose: () => void;
  currentFilter: MapFilter;
  onApplyFilter: (filter: MapFilter) => void;
  friends: UserType[];
  groups: FriendGroup[];
}

export const MapFilterModal: React.FC<MapFilterModalProps> = ({
  visible,
  onClose,
  currentFilter,
  onApplyFilter,
  friends,
  groups,
}) => {
  const [filter, setFilter] = useState<MapFilter>(currentFilter);

  const toggleFriend = (friendId: string) => {
    setFilter(prev => ({
      ...prev,
      selectedFriends: prev.selectedFriends.includes(friendId)
        ? prev.selectedFriends.filter(id => id !== friendId)
        : [...prev.selectedFriends, friendId],
    }));
  };

  const toggleGroup = (groupId: string) => {
    setFilter(prev => ({
      ...prev,
      selectedGroups: prev.selectedGroups.includes(groupId)
        ? prev.selectedGroups.filter(id => id !== groupId)
        : [...prev.selectedGroups, groupId],
    }));
  };

  const toggleMyPlaces = () => {
    setFilter(prev => ({ ...prev, showMyPlaces: !prev.showMyPlaces }));
  };

  const toggleFriendPlaces = () => {
    setFilter(prev => ({ ...prev, showFriendPlaces: !prev.showFriendPlaces }));
  };

  const clearAll = () => {
    setFilter({
      showMyPlaces: true,
      showFriendPlaces: true,
      selectedFriends: [],
      selectedGroups: [],
      tags: [],
      cuisines: [],
    });
  };

  const handleApply = () => {
    onApplyFilter(filter);
    onClose();
  };

  const selectedCount = filter.selectedFriends.length + filter.selectedGroups.length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filter Map</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Place Type Toggles */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Show Places From</Text>
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    filter.showMyPlaces && styles.toggleButtonActive,
                  ]}
                  onPress={toggleMyPlaces}
                >
                  <User size={18} color={filter.showMyPlaces ? '#fff' : theme.colors.text} />
                  <Text
                    style={[
                      styles.toggleButtonText,
                      filter.showMyPlaces && styles.toggleButtonTextActive,
                    ]}
                  >
                    My Places
                  </Text>
                  {filter.showMyPlaces && <Check size={16} color="#fff" />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    filter.showFriendPlaces && styles.toggleButtonActive,
                  ]}
                  onPress={toggleFriendPlaces}
                >
                  <Users size={18} color={filter.showFriendPlaces ? '#fff' : theme.colors.text} />
                  <Text
                    style={[
                      styles.toggleButtonText,
                      filter.showFriendPlaces && styles.toggleButtonTextActive,
                    ]}
                  >
                    Friend Places
                  </Text>
                  {filter.showFriendPlaces && <Check size={16} color="#fff" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Friend Groups */}
            {filter.showFriendPlaces && groups.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Friend Groups</Text>
                <View style={styles.chipContainer}>
                  {groups.map(group => (
                    <TouchableOpacity
                      key={group.id}
                      style={[
                        styles.chip,
                        filter.selectedGroups.includes(group.id) && {
                          backgroundColor: group.color,
                        },
                      ]}
                      onPress={() => toggleGroup(group.id)}
                    >
                      <Text style={styles.chipEmoji}>{group.emoji}</Text>
                      <Text
                        style={[
                          styles.chipText,
                          filter.selectedGroups.includes(group.id) && styles.chipTextActive,
                        ]}
                      >
                        {group.name}
                      </Text>
                      <Text
                        style={[
                          styles.chipCount,
                          filter.selectedGroups.includes(group.id) && styles.chipCountActive,
                        ]}
                      >
                        {group.members.length}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Individual Friends */}
            {filter.showFriendPlaces && friends.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Friends</Text>
                <View style={styles.friendsList}>
                  {friends.map(friend => (
                    <TouchableOpacity
                      key={friend.id}
                      style={[
                        styles.friendItem,
                        filter.selectedFriends.includes(friend.id) && styles.friendItemActive,
                      ]}
                      onPress={() => toggleFriend(friend.id)}
                    >
                      <View style={styles.friendAvatar}>
                        <Text style={styles.friendAvatarText}>
                          {friend.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.friendInfo}>
                        <Text
                          style={[
                            styles.friendName,
                            filter.selectedFriends.includes(friend.id) && styles.friendNameActive,
                          ]}
                        >
                          {friend.name}
                        </Text>
                        <Text style={styles.friendUsername}>@{friend.username}</Text>
                      </View>
                      {filter.selectedFriends.includes(friend.id) && (
                        <View style={styles.checkIcon}>
                          <Check size={18} color={theme.colors.primary} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.applyButtonGradient}
              >
                <Text style={styles.applyButtonText}>
                  Apply {selectedCount > 0 && `(${selectedCount})`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    ...theme.shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  chipTextActive: {
    color: '#fff',
  },
  chipCount: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  chipCountActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  friendsList: {
    gap: 8,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  friendItemActive: {
    backgroundColor: '#f0f9ff',
    borderColor: theme.colors.primary,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  friendNameActive: {
    color: theme.colors.primary,
  },
  friendUsername: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  applyButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

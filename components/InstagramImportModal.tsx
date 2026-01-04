import { Check, Instagram, Link, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { theme } from '../constants/theme';
import { socialService } from '../services/socialService';

const COLORS = theme.colors;
const SPACING = theme.spacing;
const FONT_SIZES = theme.typography.sizes;
const BORDER_RADIUS = theme.borderRadius;

interface InstagramImportModalProps {
  visible: boolean;
  onClose: () => void;
  onImportSuccess: (restaurant: any) => void;
}

export default function InstagramImportModal({
  visible,
  onClose,
  onImportSuccess,
}: InstagramImportModalProps) {
  const [instagramUrl, setInstagramUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasClipboard, setHasClipboard] = useState(false);

  useEffect(() => {
    if (visible) {
      checkClipboard();
    }
  }, [visible]);

  const checkClipboard = async () => {
    const hasLink = await socialService.hasInstagramLinkInClipboard();
    setHasClipboard(hasLink);
  };

  const pasteFromClipboard = async () => {
    const content = await socialService.getClipboardContent();
    setInstagramUrl(content);
  };

  const handleImport = async () => {
    if (!instagramUrl.trim()) {
      Alert.alert('Error', 'Please enter an Instagram URL');
      return;
    }

    try {
      setLoading(true);
      const restaurant = await socialService.importFromInstagram(instagramUrl);

      Alert.alert(
        'Success! 🎉',
        `${restaurant.name} has been added to your search list`,
        [
          {
            text: 'OK',
            onPress: () => {
              onImportSuccess(restaurant);
              onClose();
              setInstagramUrl('');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Import Failed',
        'Could not import restaurant. Please check the URL and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View entering={FadeInDown} style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Instagram size={24} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.title}>Import from Instagram</Text>
                <Text style={styles.subtitle}>Add restaurants from IG</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.gray[600]} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Instructions */}
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>How it works:</Text>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>
                  Go to Instagram and tap "Share Profile"
                </Text>
              </View>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>Copy the link to clipboard</Text>
              </View>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>
                  Paste here to add to your list
                </Text>
              </View>
            </View>

            {/* Clipboard Detection */}
            {hasClipboard && (
              <Animated.View entering={FadeIn} style={styles.clipboardCard}>
                <Check size={20} color={COLORS.success} />
                <Text style={styles.clipboardText}>
                  Instagram link detected in clipboard
                </Text>
                <TouchableOpacity
                  onPress={pasteFromClipboard}
                  style={styles.pasteButton}
                >
                  <Text style={styles.pasteButtonText}>Paste</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Input */}
            <View style={styles.inputContainer}>
              <Link size={20} color={COLORS.gray[400]} />
              <TextInput
                style={styles.input}
                placeholder="Paste Instagram URL here..."
                value={instagramUrl}
                onChangeText={setInstagramUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>

            {/* Example */}
            <Text style={styles.exampleLabel}>Example:</Text>
            <Text style={styles.exampleText}>instagram.com/restaurantname</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.importButton,
                (!instagramUrl.trim() || loading) &&
                  styles.importButtonDisabled,
              ]}
              onPress={handleImport}
              disabled={!instagramUrl.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.importButtonText}>Import Restaurant</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modal: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginTop: 2,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  content: {
    padding: SPACING.lg,
  },
  instructionsCard: {
    backgroundColor: COLORS.gray[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  instructionsTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  stepText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
    flex: 1,
  },
  clipboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: `${COLORS.success}10`,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: `${COLORS.success}30`,
  },
  clipboardText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    fontWeight: '600',
    flex: 1,
  },
  pasteButton: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  pasteButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gray[50],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    marginBottom: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    paddingVertical: SPACING.xs,
  },
  exampleLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xxs,
  },
  exampleText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.gray[700],
  },
  importButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  importButtonDisabled: {
    backgroundColor: COLORS.gray[300],
  },
  importButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
});

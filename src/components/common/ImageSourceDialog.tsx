import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

interface ImageSourceDialogProps {
  visible: boolean;
  onClose: () => void;
  onCameraPress: () => void;
  onGalleryPress: () => void;
}

const ImageSourceDialog: React.FC<ImageSourceDialogProps> = ({
  visible,
  onClose,
  onCameraPress,
  onGalleryPress,
}) => {
  const handleCameraPress = () => {
    onCameraPress();
    onClose();
  };

  const handleGalleryPress = () => {
    onGalleryPress();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialogContainer}>
              <View style={styles.dialog}>
                <Text style={styles.title}>Выберите источник</Text>
                <Text style={styles.subtitle}>Откуда взять изображение?</Text>

                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={styles.option}
                    onPress={handleCameraPress}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconContainer, styles.cameraIcon]}>
                      <MaterialIcons name="camera-alt" size={32} color={colors.primary} />
                    </View>
                    <Text style={styles.optionText}>Камера</Text>
                    <Text style={styles.optionSubtext}>Сфотографировать</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.option}
                    onPress={handleGalleryPress}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconContainer, styles.galleryIcon]}>
                      <MaterialIcons name="photo-library" size={32} color={colors.secondary} />
                    </View>
                    <Text style={styles.optionText}>Галерея</Text>
                    <Text style={styles.optionSubtext}>Выбрать из галереи</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelText}>Отмена</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    width: '85%',
    maxWidth: 400,
  },
  dialog: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.xl,
    elevation: 10,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.light,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.background.paper,
    ...shadows.md,
    elevation: 4,
  },
  cameraIcon: {
    backgroundColor: colors.primaryLight + '20',
  },
  galleryIcon: {
    backgroundColor: colors.secondaryLight + '20',
  },
  optionText: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  optionSubtext: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cancelText: {
    ...typography.button,
    color: colors.text.primary,
    fontWeight: '600',
  },
});

export default ImageSourceDialog;


import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';

interface MealActionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onSaveAsTemplate: () => void;
  onCopy: () => void;
  onDelete: () => void;
}

const MealActionsMenu: React.FC<MealActionsMenuProps> = ({
  visible,
  onClose,
  onSaveAsTemplate,
  onCopy,
  onDelete,
}) => {
  const handleSaveAsTemplate = () => {
    onSaveAsTemplate();
    onClose();
  };

  const handleCopy = () => {
    onCopy();
    onClose();
  };

  const handleDelete = () => {
    onDelete();
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
                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={handleSaveAsTemplate}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="bookmark-outline"
                    size={20}
                    color={colors.text.primary}
                    style={styles.actionIcon}
                  />
                  <Text style={styles.actionText}>Сохранить как шаблон</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.text.hint}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={handleCopy}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="copy-outline"
                    size={20}
                    color={colors.text.primary}
                    style={styles.actionIcon}
                  />
                  <Text style={styles.actionText}>Скопировать</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.text.hint}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  testID="meal_actions_menu_delete_button"
                  accessibilityLabel="Удалить прием пищи"
                  style={[styles.actionItem, styles.deleteAction]}
                  onPress={handleDelete}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={colors.error}
                    style={styles.actionIcon}
                  />
                  <Text style={[styles.actionText, styles.deleteText]}>
                    Удалить
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.text.hint}
                  />
                </TouchableOpacity>

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
    padding: spacing.md,
    ...shadows.xl,
    elevation: 10,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.light,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  actionIcon: {
    marginRight: spacing.sm,
  },
  actionText: {
    ...typography.body2,
    color: colors.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  deleteAction: {
    borderColor: colors.error + '40',
    backgroundColor: colors.error + '10',
  },
  deleteText: {
    color: colors.error,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.light,
    alignItems: 'center',
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  cancelText: {
    ...typography.button,
    color: colors.text.primary,
    fontWeight: '600',
  },
});

export default MealActionsMenu;


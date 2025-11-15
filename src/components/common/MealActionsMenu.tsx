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
                  <Text style={styles.actionIcon}>📌</Text>
                  <Text style={styles.actionText}>Сохранить как шаблон</Text>
                  <MaterialIcons
                    name="chevron-right"
                    size={20}
                    color={colors.text.hint}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={handleCopy}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionIcon}>📋</Text>
                  <Text style={styles.actionText}>Скопировать</Text>
                  <MaterialIcons
                    name="chevron-right"
                    size={20}
                    color={colors.text.hint}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionItem, styles.deleteAction]}
                  onPress={handleDelete}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionIcon}>🗑️</Text>
                  <Text style={[styles.actionText, styles.deleteText]}>
                    Удалить
                  </Text>
                  <MaterialIcons
                    name="chevron-right"
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
    fontSize: 20,
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

export default MealActionsMenu;


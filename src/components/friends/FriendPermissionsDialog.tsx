import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Switch,
} from 'react-native';
import { typography, spacing, borderRadius, shadows } from '../../theme';
import { colors } from '../../theme/colors';
import { useTheme } from '../../hooks/useTheme';
import Button from '../common/Button';
import type { FriendPermissionUpdate } from '../../types/friends.types';

interface FriendPermissionsDialogProps {
  visible: boolean;
  permissions: FriendPermissionUpdate | null;
  onSave: (permissions: FriendPermissionUpdate) => void;
  onCancel: () => void;
  friendName?: string;
}

const FriendPermissionsDialog: React.FC<FriendPermissionsDialogProps> = ({
  visible,
  permissions,
  onSave,
  onCancel,
  friendName,
}) => {
  const { colors: themeColors } = useTheme();
  const [localPermissions, setLocalPermissions] = useState<FriendPermissionUpdate>({
    canViewMeals: false,
    canAddMeals: false,
    canViewAnalytics: false,
  });

  useEffect(() => {
    if (permissions) {
      setLocalPermissions(permissions);
    }
  }, [permissions]);

  const handleSave = () => {
    // Validate that at least one permission is enabled
    if (
      !localPermissions.canViewMeals &&
      !localPermissions.canAddMeals &&
      !localPermissions.canViewAnalytics
    ) {
      return;
    }
    onSave(localPermissions);
  };

  const togglePermission = (key: keyof FriendPermissionUpdate) => {
    setLocalPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.dialog, { backgroundColor: themeColors.background.paper }]}>
              <Text style={[styles.title, { color: themeColors.text.primary }]}>
                Права доступа{friendName ? ` для ${friendName}` : ''}
              </Text>

              <View style={styles.permissionsContainer}>
                <View style={styles.permissionRow}>
                  <View style={styles.permissionInfo}>
                    <Text style={[styles.permissionLabel, { color: themeColors.text.primary }]}>
                      Просмотр приемов пищи
                    </Text>
                    <Text style={[styles.permissionDescription, { color: themeColors.text.secondary }]}>
                      Может видеть ваши приемы пищи
                    </Text>
                  </View>
                  <Switch
                    value={localPermissions.canViewMeals}
                    onValueChange={() => togglePermission('canViewMeals')}
                    trackColor={{
                      false: themeColors.border.light,
                      true: themeColors.primary,
                    }}
                    thumbColor={themeColors.white}
                  />
                </View>

                <View style={styles.permissionRow}>
                  <View style={styles.permissionInfo}>
                    <Text style={[styles.permissionLabel, { color: themeColors.text.primary }]}>
                      Добавление приемов пищи
                    </Text>
                    <Text style={[styles.permissionDescription, { color: themeColors.text.secondary }]}>
                      Может добавлять приемы пищи за вас
                    </Text>
                  </View>
                  <Switch
                    value={localPermissions.canAddMeals}
                    onValueChange={() => togglePermission('canAddMeals')}
                    trackColor={{
                      false: themeColors.border.light,
                      true: themeColors.primary,
                    }}
                    thumbColor={themeColors.white}
                  />
                </View>

                <View style={styles.permissionRow}>
                  <View style={styles.permissionInfo}>
                    <Text style={[styles.permissionLabel, { color: themeColors.text.primary }]}>
                      Просмотр аналитики
                    </Text>
                    <Text style={[styles.permissionDescription, { color: themeColors.text.secondary }]}>
                      Может видеть вашу статистику и аналитику
                    </Text>
                  </View>
                  <Switch
                    value={localPermissions.canViewAnalytics}
                    onValueChange={() => togglePermission('canViewAnalytics')}
                    trackColor={{
                      false: themeColors.border.light,
                      true: themeColors.primary,
                    }}
                    thumbColor={themeColors.white}
                  />
                </View>
              </View>

              <View style={styles.buttonsContainer}>
                <Button
                  title="Отмена"
                  onPress={onCancel}
                  variant="outline"
                  size="medium"
                  style={styles.button}
                />
                <Button
                  title="Сохранить"
                  onPress={handleSave}
                  variant="primary"
                  size="medium"
                  style={styles.button}
                  disabled={
                    !localPermissions.canViewMeals &&
                    !localPermissions.canAddMeals &&
                    !localPermissions.canViewAnalytics
                  }
                />
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
    padding: spacing.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.xl,
    elevation: 10,
  },
  title: {
    ...typography.h3,
    fontWeight: '600',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  permissionsContainer: {
    marginBottom: spacing.xl,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  permissionInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  permissionLabel: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  permissionDescription: {
    ...typography.caption,
    fontSize: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
  },
});

export default FriendPermissionsDialog;


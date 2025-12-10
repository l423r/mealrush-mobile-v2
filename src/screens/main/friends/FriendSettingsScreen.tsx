import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../../types/navigation.types';
import { useStores } from '../../../stores';
import { spacing, typography, borderRadius, componentSpacing } from '../../../theme';
import { useTheme } from '../../../hooks/useTheme';
import Header from '../../../components/common/Header';
import Loading from '../../../components/common/Loading';
import Button from '../../../components/common/Button';
import AlertDialog from '../../../components/common/AlertDialog';
import { friendsService } from '../../../api/services/friends.service';
import type { FriendPermissionUpdate } from '../../../types/friends.types';

type FriendSettingsScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'FriendSettings'
>;

const FriendSettingsScreen: React.FC = observer(() => {
  const navigation = useNavigation<FriendSettingsScreenNavigationProp>();
  const route = useRoute();
  const { friendsStore } = useStores();
  const { colors } = useTheme();
  const { friendId } = route.params as { friendId: number };

  const [permissions, setPermissions] = useState<FriendPermissionUpdate>({
    canViewMeals: false,
    canAddMeals: false,
    canViewAnalytics: false,
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  const friend = friendsStore.friends.find((f) => f.friendId === friendId);

  useEffect(() => {
    loadPermissions();
  }, [friendId]);

  const loadPermissions = async () => {
    if (!friend) return;

    setLoadingPermissions(true);
    try {
      const response = await friendsService.getFriendPermissions(friendId);
      setPermissions({
        canViewMeals: response.data.canViewMeals,
        canAddMeals: response.data.canAddMeals,
        canViewAnalytics: response.data.canViewAnalytics,
      });
    } catch (error) {
      // Use friend's permissions from the list
      if (friend.permissions) {
        setPermissions({
          canViewMeals: friend.permissions.canViewMeals,
          canAddMeals: friend.permissions.canAddMeals,
          canViewAnalytics: friend.permissions.canViewAnalytics,
        });
      }
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleSave = async () => {
    if (
      !permissions.canViewMeals &&
      !permissions.canAddMeals &&
      !permissions.canViewAnalytics
    ) {
      Alert.alert('Ошибка', 'Необходимо включить хотя бы одно право доступа');
      return;
    }

    await friendsStore.updatePermissions(friendId, permissions);
    navigation.goBack();
  };

  const handleDelete = async () => {
    setShowDeleteDialog(false);
    await friendsStore.removeFriend(friendId);
    navigation.goBack();
  };

  const togglePermission = (key: keyof FriendPermissionUpdate) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!friend) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.default }]}>
        <Header title="Настройки друга" showBackButton />
        <Loading message="Загрузка..." />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <Header title={friend.name} showBackButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={[styles.section, { backgroundColor: colors.background.paper }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Права доступа
          </Text>

          <View style={styles.permissionRow}>
            <View style={styles.permissionInfo}>
              <Text style={[styles.permissionLabel, { color: colors.text.primary }]}>
                Просмотр приемов пищи
              </Text>
              <Text style={[styles.permissionDescription, { color: colors.text.secondary }]}>
                Может видеть ваши приемы пищи
              </Text>
            </View>
            <Switch
              value={permissions.canViewMeals}
              onValueChange={() => togglePermission('canViewMeals')}
              trackColor={{
                false: colors.border.light,
                true: colors.primary,
              }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.permissionRow}>
            <View style={styles.permissionInfo}>
              <Text style={[styles.permissionLabel, { color: colors.text.primary }]}>
                Добавление приемов пищи
              </Text>
              <Text style={[styles.permissionDescription, { color: colors.text.secondary }]}>
                Может добавлять приемы пищи за вас
              </Text>
            </View>
            <Switch
              value={permissions.canAddMeals}
              onValueChange={() => togglePermission('canAddMeals')}
              trackColor={{
                false: colors.border.light,
                true: colors.primary,
              }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.permissionRow}>
            <View style={styles.permissionInfo}>
              <Text style={[styles.permissionLabel, { color: colors.text.primary }]}>
                Просмотр аналитики
              </Text>
              <Text style={[styles.permissionDescription, { color: colors.text.secondary }]}>
                Может видеть вашу статистику и аналитику
              </Text>
            </View>
            <Switch
              value={permissions.canViewAnalytics}
              onValueChange={() => togglePermission('canViewAnalytics')}
              trackColor={{
                false: colors.border.light,
                true: colors.primary,
              }}
              thumbColor={colors.white}
            />
          </View>

          <Button
            title="Сохранить"
            onPress={handleSave}
            variant="primary"
            size="medium"
            style={styles.saveButton}
            disabled={
              !permissions.canViewMeals &&
              !permissions.canAddMeals &&
              !permissions.canViewAnalytics
            }
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.background.paper }]}>
          <Text style={[styles.dangerTitle, { color: colors.error }]}>
            Опасная зона
          </Text>
          <Text style={[styles.dangerDescription, { color: colors.text.secondary }]}>
            Удаление друга приведет к потере всех прав доступа и истории взаимодействий
          </Text>
          <Button
            title="Удалить друга"
            onPress={() => setShowDeleteDialog(true)}
            variant="outline"
            size="medium"
            style={[styles.deleteButton, { borderColor: colors.error }]}
          />
        </View>
      </ScrollView>

      <AlertDialog
        visible={showDeleteDialog}
        title="Удалить друга?"
        message={`Вы уверены, что хотите удалить ${friend.name} из друзей?`}
        type="warning"
        confirmText="Удалить"
        cancelText="Отмена"
        showCancel
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: componentSpacing.screenHorizontal,
    paddingBottom: spacing.xl,
  },
  section: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E8EF',
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
  saveButton: {
    marginTop: spacing.md,
  },
  dangerTitle: {
    ...typography.h4,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  dangerDescription: {
    ...typography.body2,
    marginBottom: spacing.md,
  },
  deleteButton: {
    borderWidth: 2,
  },
});

export default FriendSettingsScreen;


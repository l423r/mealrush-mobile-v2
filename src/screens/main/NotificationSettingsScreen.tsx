import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { useStores } from '../../stores';
import Loading from '../../components/common/Loading';
import MealNotificationCard from '../../components/notifications/MealNotificationCard';
import SnackEnableDialog from '../../components/notifications/SnackEnableDialog';

const NotificationSettingsScreen: React.FC = observer(() => {
  const { notificationStore, uiStore } = useStores();
  const [snackDialogVisible, setSnackDialogVisible] = useState(false);
  const [lateSnackDialogVisible, setLateSnackDialogVisible] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    if (notificationStore.notificationsEnabled && !notificationStore.preferences) {
      notificationStore.fetchPreferences();
    }
  }, [notificationStore.notificationsEnabled]);

  const handleToggleNotifications = async () => {
    if (notificationStore.notificationsEnabled) {
      // Подтверждение отключения
      Alert.alert(
        'Отключить уведомления?',
        'Вы не будете получать push-уведомления',
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Отключить',
            style: 'destructive',
            onPress: async () => {
              await notificationStore.toggleNotifications();
            },
          },
        ]
      );
    } else {
      await notificationStore.toggleNotifications();
    }
  };

  const handleRequestPermissions = async () => {
    const result = await notificationStore.registerForPushNotifications();
    if (!result) {
      uiStore.showSnackbar(
        'Разрешите уведомления в настройках вашего устройства',
        'warning'
      );
    }
  };

  const renderStatusCard = () => {
    const isEnabled = notificationStore.notificationsEnabled;
    const hasToken = !!notificationStore.fcmToken;

    return (
      <View style={[styles.card, shadows.small]}>
        <View style={styles.statusHeader}>
          <Ionicons
            name={isEnabled ? 'checkmark-circle' : 'close-circle'}
            size={32}
            color={isEnabled ? colors.success : colors.error}
          />
          <View style={styles.statusText}>
            <Text style={styles.statusTitle}>
              {isEnabled ? 'Уведомления включены' : 'Уведомления выключены'}
            </Text>
            <Text style={styles.statusSubtitle}>
              {hasToken
                ? 'Устройство зарегистрировано'
                : 'Устройство не зарегистрировано'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Handler for globallyEnabled toggle
  const handleToggleGlobal = async () => {
    const success = await notificationStore.toggleGloballyEnabled();
    if (success) {
      const enabled = notificationStore.preferences?.globallyEnabled;
      uiStore.showSnackbar(
        enabled ? 'Все уведомления включены' : 'Все уведомления отключены',
        'success'
      );
    } else {
      uiStore.showSnackbar('Ошибка обновления настроек', 'error');
    }
  };

  // Handler for meal notification cards
  const handleMealToggle = async (
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'lateSnack'
  ) => {
    // Special handling for snack/lateSnack
    if (mealType === 'snack' && !notificationStore.preferences?.snack.enabled) {
      setSnackDialogVisible(true);
      return;
    }
    if (mealType === 'lateSnack' && !notificationStore.preferences?.lateSnack.enabled) {
      setLateSnackDialogVisible(true);
      return;
    }

    const success = await notificationStore.toggleMealNotification(mealType);
    if (success) {
      uiStore.showSnackbar('Настройки обновлены', 'success');
    } else {
      uiStore.showSnackbar('Ошибка обновления настроек', 'error');
    }
  };

  // Handler for snack enable
  const handleSnackConfirm = async (time: string, minutesBefore: number) => {
    const success = await notificationStore.enableSnack(time, minutesBefore);
    if (success) {
      setSnackDialogVisible(false);
      uiStore.showSnackbar('Полдник включен', 'success');
    } else {
      uiStore.showSnackbar(
        notificationStore.preferencesError || 'Ошибка включения',
        'error'
      );
    }
  };

  // Handler for late snack enable
  const handleLateSnackConfirm = async (time: string, minutesBefore: number) => {
    const success = await notificationStore.enableLateSnack(time, minutesBefore);
    if (success) {
      setLateSnackDialogVisible(false);
      uiStore.showSnackbar('Поздний перекус включен', 'success');
    } else {
      uiStore.showSnackbar(
        notificationStore.preferencesError || 'Ошибка включения',
        'error'
      );
    }
  };

  // Handler for achievements toggle
  const handleToggleAchievements = async () => {
    const success = await notificationStore.toggleAchievements();
    if (success) {
      uiStore.showSnackbar('Настройки обновлены', 'success');
    } else {
      uiStore.showSnackbar('Ошибка обновления настроек', 'error');
    }
  };

  // Handler for reset
  const handleReset = () => {
    Alert.alert(
      'Сбросить настройки?',
      'Все настройки будут возвращены к значениям по умолчанию',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сбросить',
          style: 'destructive',
          onPress: async () => {
            const success = await notificationStore.resetPreferences();
            if (success) {
              uiStore.showSnackbar('Настройки сброшены', 'success');
            } else {
              uiStore.showSnackbar('Ошибка сброса настроек', 'error');
            }
          },
        },
      ]
    );
  };

  const { preferences, preferencesLoading } = notificationStore;

  // Loading state
  if (preferencesLoading && !preferences) {
    return <Loading message="Загрузка настроек..." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Device Registration Status */}
      {renderStatusCard()}

      {/* Push Notifications Toggle */}
      <View style={[styles.card, shadows.small]}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications" size={24} color={colors.primary} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Push-уведомления</Text>
              <Text style={styles.settingSubtitle}>
                {notificationStore.notificationsEnabled
                  ? 'Устройство зарегистрировано'
                  : 'Включите для получения уведомлений'}
              </Text>
            </View>
          </View>
          <Switch
            value={notificationStore.notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{
              false: colors.gray[300],
              true: colors.primaryLight || colors.primary,
            }}
            thumbColor={
              notificationStore.notificationsEnabled
                ? colors.primary
                : colors.gray[100]
            }
            disabled={notificationStore.loading}
          />
        </View>
      </View>

      {/* v2.4.0: Global Enable/Disable Switch */}
      {notificationStore.notificationsEnabled && preferences && (
        <>
          <View style={[styles.card, shadows.small]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="toggle" size={24} color={colors.primary} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>
                    Глобальный переключатель
                  </Text>
                  <Text style={styles.settingSubtitle}>
                    {preferences.globallyEnabled
                      ? 'Все уведомления активны'
                      : 'Все уведомления отключены'}
                  </Text>
                </View>
              </View>
              <Switch
                value={preferences.globallyEnabled}
                onValueChange={handleToggleGlobal}
                trackColor={{
                  false: colors.gray[300],
                  true: colors.primaryLight || colors.primary,
                }}
                thumbColor={
                  preferences.globallyEnabled ? colors.primary : colors.gray[100]
                }
              />
            </View>
          </View>

          {/* Timezone Display (read-only) */}
          <View style={[styles.card, styles.infoCard, shadows.small]}>
            <Ionicons name="time" size={24} color={colors.primary} />
            <View style={styles.timezoneInfo}>
              <Text style={styles.timezoneTitle}>
                Часовой пояс: {preferences.timezone}
              </Text>
              <Text style={styles.timezoneSubtitle}>
                Все времена указаны в вашем локальном времени
              </Text>
            </View>
          </View>

          {/* Meal Notifications Section */}
          <Text style={styles.sectionTitle}>Напоминания о приемах пищи</Text>

          <MealNotificationCard
            mealType="breakfast"
            title="Завтрак"
            icon="sunny"
            settings={preferences.breakfast}
            disabled={!preferences.globallyEnabled}
            onToggle={() => handleMealToggle('breakfast')}
            onTimeChange={(time) =>
              notificationStore.updateMealTime('breakfast', time)
            }
            onMinutesBeforeChange={(minutes) =>
              notificationStore.updateMinutesBefore('breakfast', minutes)
            }
          />

          <MealNotificationCard
            mealType="lunch"
            title="Обед"
            icon="partly-sunny"
            settings={preferences.lunch}
            disabled={!preferences.globallyEnabled}
            onToggle={() => handleMealToggle('lunch')}
            onTimeChange={(time) =>
              notificationStore.updateMealTime('lunch', time)
            }
            onMinutesBeforeChange={(minutes) =>
              notificationStore.updateMinutesBefore('lunch', minutes)
            }
          />

          <MealNotificationCard
            mealType="dinner"
            title="Ужин"
            icon="moon"
            settings={preferences.dinner}
            disabled={!preferences.globallyEnabled}
            onToggle={() => handleMealToggle('dinner')}
            onTimeChange={(time) =>
              notificationStore.updateMealTime('dinner', time)
            }
            onMinutesBeforeChange={(minutes) =>
              notificationStore.updateMinutesBefore('dinner', minutes)
            }
          />

          {/* Snack - special handling for null time */}
          <View style={[styles.card, shadows.small]}>
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Ionicons name="cafe" size={24} color={colors.primary} />
                <Text style={styles.title}>Полдник</Text>
              </View>
              <Switch
                value={preferences.snack.enabled && preferences.globallyEnabled}
                onValueChange={() => handleMealToggle('snack')}
                trackColor={{
                  false: colors.gray[300],
                  true: colors.primaryLight || colors.primary,
                }}
                thumbColor={
                  preferences.snack.enabled && preferences.globallyEnabled
                    ? colors.primary
                    : colors.gray[100]
                }
                disabled={!preferences.globallyEnabled}
              />
            </View>
            {preferences.snack.enabled && preferences.snack.time && (
              <View style={styles.snackDetails}>
                <Text style={styles.snackTime}>Время: {preferences.snack.time}</Text>
                {preferences.snack.reminderAt && (
                  <Text style={styles.snackReminder}>
                    Напомню в {preferences.snack.reminderAt}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Late Snack - special handling for null time */}
          <View style={[styles.card, shadows.small]}>
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Ionicons name="ice-cream" size={24} color={colors.primary} />
                <Text style={styles.title}>Поздний перекус</Text>
              </View>
              <Switch
                value={
                  preferences.lateSnack.enabled && preferences.globallyEnabled
                }
                onValueChange={() => handleMealToggle('lateSnack')}
                trackColor={{
                  false: colors.gray[300],
                  true: colors.primaryLight || colors.primary,
                }}
                thumbColor={
                  preferences.lateSnack.enabled && preferences.globallyEnabled
                    ? colors.primary
                    : colors.gray[100]
                }
                disabled={!preferences.globallyEnabled}
              />
            </View>
            {preferences.lateSnack.enabled && preferences.lateSnack.time && (
              <View style={styles.snackDetails}>
                <Text style={styles.snackTime}>
                  Время: {preferences.lateSnack.time}
                </Text>
                {preferences.lateSnack.reminderAt && (
                  <Text style={styles.snackReminder}>
                    Напомню в {preferences.lateSnack.reminderAt}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Achievements Toggle */}
          <Text style={styles.sectionTitle}>Прочее</Text>

          <View style={[styles.card, shadows.small]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="trophy" size={24} color={colors.secondary} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Достижения</Text>
                  <Text style={styles.settingSubtitle}>
                    Уведомления о достижениях и целях
                  </Text>
                </View>
              </View>
              <Switch
                value={preferences.achievementsEnabled}
                onValueChange={handleToggleAchievements}
                trackColor={{
                  false: colors.gray[300],
                  true: colors.primaryLight || colors.primary,
                }}
                thumbColor={
                  preferences.achievementsEnabled
                    ? colors.primary
                    : colors.gray[100]
                }
                disabled={!preferences.globallyEnabled}
              />
            </View>
          </View>

          {/* Reset Button */}
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Ionicons name="refresh" size={20} color={colors.error} />
            <Text style={styles.resetButtonText}>
              Сбросить к настройкам по умолчанию
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* Dialogs */}
      <SnackEnableDialog
        visible={snackDialogVisible}
        mealName="Полдник"
        onConfirm={handleSnackConfirm}
        onCancel={() => setSnackDialogVisible(false)}
      />

      <SnackEnableDialog
        visible={lateSnackDialogVisible}
        mealName="Поздний перекус"
        onConfirm={handleLateSnackConfirm}
        onCancel={() => setLateSnackDialogVisible(false)}
      />

      {/* Debug info */}
      {__DEV__ && notificationStore.fcmToken && (
        <View style={[styles.card, styles.debugCard]}>
          <Text style={styles.debugTitle}>Debug Info</Text>
          <Text style={styles.debugText}>
            FCM Token: {notificationStore.fcmToken.substring(0, 30)}...
          </Text>
        </View>
      )}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  statusTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  statusSubtitle: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  settingTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  settingSubtitle: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    ...typography.button,
    color: 'white',
    fontSize: 14,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    ...typography.body2,
    color: colors.text.secondary,
    marginLeft: spacing.md,
    flex: 1,
    lineHeight: 20,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  notificationTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  notificationTypeText: {
    ...typography.body1,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: spacing.xs,
  },
  debugCard: {
    backgroundColor: colors.gray[100],
  },
  debugTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  debugText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontFamily: 'monospace',
  },
  timezoneInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  timezoneTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  timezoneSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
  snackDetails: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  snackTime: {
    ...typography.body1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  snackReminder: {
    ...typography.body2,
    color: colors.success,
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  resetButtonText: {
    ...typography.button,
    color: colors.error,
    marginLeft: spacing.sm,
  },
});

export default NotificationSettingsScreen;


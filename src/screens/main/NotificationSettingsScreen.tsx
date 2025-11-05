import React from 'react';
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

const NotificationSettingsScreen: React.FC = observer(() => {
  const { notificationStore, uiStore } = useStores();

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

  const renderPermissionStatus = () => {
    const { permissionStatus } = notificationStore;
    let statusText = '';
    let statusColor = colors.text.secondary;
    let icon: keyof typeof Ionicons.glyphMap = 'help-circle';

    switch (permissionStatus) {
      case 'granted':
        statusText = 'Разрешение предоставлено';
        statusColor = colors.success;
        icon = 'checkmark-circle';
        break;
      case 'denied':
        statusText = 'Разрешение отклонено';
        statusColor = colors.error;
        icon = 'close-circle';
        break;
      case 'undetermined':
        statusText = 'Разрешение не запрошено';
        statusColor = colors.warning || '#FF9800';
        icon = 'alert-circle';
        break;
    }

    return (
      <View style={[styles.card, shadows.small]}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name={icon} size={24} color={statusColor} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Статус разрешений</Text>
              <Text style={[styles.settingSubtitle, { color: statusColor }]}>
                {statusText}
              </Text>
            </View>
          </View>
          {permissionStatus === 'denied' && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRequestPermissions}
            >
              <Text style={styles.retryButtonText}>Запросить</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Статус уведомлений */}
      {renderStatusCard()}

      {/* Основной переключатель */}
      <View style={[styles.card, shadows.small]}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons
              name="notifications"
              size={24}
              color={colors.primary}
            />
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Push-уведомления</Text>
              <Text style={styles.settingSubtitle}>
                {notificationStore.notificationsEnabled
                  ? 'Вы получаете уведомления'
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

      {/* Статус разрешений */}
      {renderPermissionStatus()}

      {/* Информация */}
      <View style={[styles.card, styles.infoCard, shadows.small]}>
        <Ionicons
          name="information-circle"
          size={24}
          color={colors.primary}
        />
        <Text style={styles.infoText}>
          Уведомления помогают не забывать о записи приёмов пищи и отслеживать
          ваш прогресс к цели. Вы сможете получать напоминания и персональные
          рекомендации.
        </Text>
      </View>

      {/* Типы уведомлений */}
      <Text style={styles.sectionTitle}>Типы уведомлений</Text>
      
      <View style={[styles.card, shadows.small]}>
        <View style={styles.notificationTypeRow}>
          <Ionicons name="restaurant" size={20} color={colors.primary} />
          <Text style={styles.notificationTypeText}>Напоминания о приёмах пищи</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.notificationTypeRow}>
          <Ionicons name="trophy" size={20} color={colors.secondary} />
          <Text style={styles.notificationTypeText}>Достижения и цели</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.notificationTypeRow}>
          <Ionicons name="bulb" size={20} color={colors.warning || '#FF9800'} />
          <Text style={styles.notificationTypeText}>
            Рекомендации по питанию
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.notificationTypeRow}>
          <Ionicons name="trending-up" size={20} color={colors.success} />
          <Text style={styles.notificationTypeText}>Еженедельные отчёты</Text>
        </View>
      </View>

      {/* Debug info (только в dev mode) */}
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
});

export default NotificationSettingsScreen;


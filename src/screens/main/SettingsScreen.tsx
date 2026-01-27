import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation.types';
import { useStores } from '../../stores';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import AlertDialog from '../../components/common/AlertDialog';
import { useAlert } from '../../hooks/useAlert';

type SettingsScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'Settings'
>;

const SettingsScreen: React.FC = observer(() => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { authStore, profileStore } = useStores();
  const { alertState, showConfirm, hideAlert } = useAlert();

  // Check if onboarding needs to be completed
  const needsOnboardingCompletion = 
    profileStore.profile && 
    !profileStore.profile.onboardingCompleted;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNamePress = () => {
    navigation.navigate('SettingsName');
  };

  const handleEmailPress = () => {
    navigation.navigate('SettingsEmail');
  };

  const handlePasswordPress = () => {
    navigation.navigate('SettingsPassword');
  };

  const handleAccountPress = () => {
    navigation.navigate('Account');
  };

  const handleDeleteAccountPress = () => {
    navigation.navigate('SettingsDeleteAccount');
  };

  const handleCompleteOnboardingPress = () => {
    // Navigate to ProfileSetup to complete onboarding
    // The AppNavigator will handle showing ProfileSetup when onboarding is incomplete
    navigation.getParent()?.navigate('ProfileSetup' as never);
  };

  const handleLogout = () => {
    showConfirm('Выход', 'Вы уверены, что хотите выйти из аккаунта?', async () => {
      await authStore.logout();
    });
  };

  const settingsOptions = [
    ...(needsOnboardingCompletion
      ? [
          {
            title: 'Завершить настройку профиля',
            onPress: handleCompleteOnboardingPress,
            icon: '✨',
            showArrow: true,
          },
        ]
      : []),
    {
      title: 'Аккаунт',
      onPress: handleAccountPress,
      icon: '👤',
      showArrow: true,
    },
    {
      title: 'Изменить имя',
      onPress: handleNamePress,
      icon: '✏️',
      showArrow: true,
    },
    {
      title: 'Изменить email',
      onPress: handleEmailPress,
      icon: '📧',
      showArrow: true,
    },
    {
      title: 'Изменить пароль',
      onPress: handlePasswordPress,
      icon: '🔒',
      showArrow: true,
    },
    {
      title: 'Удалить аккаунт',
      onPress: handleDeleteAccountPress,
      icon: '🗑️',
      showArrow: true,
      isDestructive: true,
    },
  ];

  return (
    <View style={styles.container}>
      <Header title="Настройки" showBackButton onBackPress={handleBack} />

      <ScrollView style={styles.content}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {authStore.user?.name?.charAt(0) || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>
            {authStore.user?.name || 'Пользователь'}
          </Text>
          <Text style={styles.userEmail}>{authStore.user?.email}</Text>
        </View>

        {/* Settings Options */}
        <View style={styles.optionsContainer}>
          {settingsOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionItem,
                index === settingsOptions.length - 1 && styles.lastOptionItem,
              ]}
              onPress={option.onPress}
            >
              <View style={styles.optionLeft}>
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <Text
                  style={[
                    styles.optionTitle,
                    option.isDestructive && styles.destructiveText,
                  ]}
                >
                  {option.title}
                </Text>
              </View>
              {option.showArrow && <Text style={styles.optionArrow}>›</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoTitle}>О приложении</Text>
          <Text style={styles.appInfoText}>MealRush v2.0.0</Text>
          <Text style={styles.appInfoText}>Отслеживание питания и калорий</Text>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            title="Выйти из аккаунта"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>

      {/* Alert Dialog */}
      <AlertDialog
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        showCancel={alertState.showCancel}
        onConfirm={alertState.onConfirm}
        onCancel={alertState.onCancel}
        onDismiss={hideAlert}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    flex: 1,
  },
  userInfo: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
  },
  userName: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  optionsContainer: {
    margin: spacing.lg,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  lastOptionItem: {
    borderBottomWidth: 0,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  optionTitle: {
    ...typography.body1,
    color: colors.text.primary,
  },
  destructiveText: {
    color: colors.error,
  },
  optionArrow: {
    ...typography.h3,
    color: colors.text.secondary,
  },
  appInfo: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  appInfoTitle: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  appInfoText: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  logoutContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  logoutButton: {
    width: '100%',
  },
});

export default SettingsScreen;

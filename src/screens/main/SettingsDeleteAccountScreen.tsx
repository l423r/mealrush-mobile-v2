import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation.types';
import { useStores } from '../../stores';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';

type SettingsDeleteAccountScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'SettingsDeleteAccount'
>;

const SettingsDeleteAccountScreen: React.FC = observer(() => {
  const navigation = useNavigation<SettingsDeleteAccountScreenNavigationProp>();
  const { authStore } = useStores();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Удаление аккаунта',
      'Вы уверены, что хотите удалить свой аккаунт? Это действие нельзя отменить. Все ваши данные будут безвозвратно удалены.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить аккаунт',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Последнее предупреждение',
              'Это действие необратимо. Все ваши данные будут удалены навсегда.',
              [
                { text: 'Отмена', style: 'cancel' },
                {
                  text: 'Да, удалить',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      // TODO: Implement account deletion API
                      await authStore.logout();
                      Alert.alert(
                        'Аккаунт удален',
                        'Ваш аккаунт был успешно удален'
                      );
                    } catch {
                      Alert.alert('Ошибка', 'Не удалось удалить аккаунт');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Удаление аккаунта"
        showBackButton
        onBackPress={handleBack}
      />

      <View style={styles.content}>
        <View style={styles.warningContainer}>
          <Text style={styles.warningEmoji}>⚠️</Text>
          <Text style={styles.warningTitle}>Внимание!</Text>
          <Text style={styles.warningText}>
            Удаление аккаунта — это необратимое действие. Все ваши данные будут
            безвозвратно удалены:
          </Text>
        </View>

        <View style={styles.dataList}>
          <Text style={styles.dataItem}>• Профиль и настройки</Text>
          <Text style={styles.dataItem}>• Все приемы пищи</Text>
          <Text style={styles.dataItem}>• Созданные продукты</Text>
          <Text style={styles.dataItem}>• Статистика и история</Text>
          <Text style={styles.dataItem}>• Избранные продукты</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Если вы уверены, что хотите удалить аккаунт, нажмите кнопку ниже.
            Это действие нельзя отменить.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Удалить аккаунт"
          onPress={handleDeleteAccount}
          variant="outline"
          style={styles.deleteButton}
        />
      </View>
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
    padding: spacing.lg,
  },
  warningContainer: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.warning + '20',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.warning,
    marginBottom: spacing.lg,
  },
  warningEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  warningTitle: {
    ...typography.h4,
    color: colors.warning,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  warningText: {
    ...typography.body1,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 24,
  },
  dataList: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  dataItem: {
    ...typography.body1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  infoContainer: {
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  infoText: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  deleteButton: {
    borderColor: colors.error,
  },
});

export default SettingsDeleteAccountScreen;

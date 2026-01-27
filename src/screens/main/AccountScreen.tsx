import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation.types';
import { useStores } from '../../stores';
import {
  typography,
  spacing,
  borderRadius,
  colors,
} from '../../theme';
import Header from '../../components/common/Header';
import Loading from '../../components/common/Loading';

type AccountScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'Settings'
>;

const AccountScreen: React.FC = observer(() => {
  const navigation = useNavigation<AccountScreenNavigationProp>();
  const { accountStore } = useStores();

  useEffect(() => {
    if (!accountStore.account) {
      accountStore.getAccountInfo();
    }
  }, [accountStore]);

  const handleBack = () => {
    navigation.goBack();
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Не указано';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (accountStore.loading) {
    return <Loading message="Загрузка информации об аккаунте..." />;
  }

  if (accountStore.error) {
    return (
      <View style={styles.container}>
        <Header title="Аккаунт" showBackButton onBackPress={handleBack} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{accountStore.error}</Text>
        </View>
      </View>
    );
  }

  const account = accountStore.account;

  return (
    <View style={styles.container}>
      <Header title="Аккаунт" showBackButton onBackPress={handleBack} />

      <ScrollView style={styles.content}>
        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Информация об аккаунте</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{account?.email || 'Не указано'}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Дата создания</Text>
              <Text style={styles.infoValue}>
                {formatDate(account?.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* OAuth Providers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Подключенные аккаунты</Text>
          
          <View style={styles.infoCard}>
            {account?.oauthProviders && account.oauthProviders.length > 0 ? (
              account.oauthProviders.map((provider, index) => (
                <View key={index}>
                  {index > 0 && <View style={styles.divider} />}
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>
                      {provider === 'GOOGLE' ? 'Google' : provider === 'APPLE' ? 'Apple' : provider}
                    </Text>
                    <Text style={styles.infoValue}>Подключен</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>
                Нет подключенных OAuth аккаунтов
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
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
  section: {
    margin: spacing.lg,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    ...typography.body1,
    color: colors.text.secondary,
    flex: 1,
  },
  infoValue: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.xs,
  },
  emptyText: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.body1,
    color: colors.error,
    textAlign: 'center',
  },
});

export default AccountScreen;

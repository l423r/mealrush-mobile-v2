import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation.types';
import { useStores } from '../../stores';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';
import {
  formatTargetWeightType,
  formatActivityLevel,
} from '../../utils/formatting';
import { getBMICategory } from '../../utils/calculations';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'HomeTabs'
>;

const ProfileScreen: React.FC = observer(() => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { profileStore, authStore } = useStores();

  useEffect(() => {
    if (!profileStore.profile) {
      profileStore.getProfile();
    }
  }, [profileStore]);

  const handleEditProfile = () => {
    navigation.navigate('ProfileEdit');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleLogout = () => {
    Alert.alert('Выход', 'Вы уверены, что хотите выйти из аккаунта?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: async () => {
          await authStore.logout();
        },
      },
    ]);
  };

  if (profileStore.loading) {
    return <Loading message="Загрузка профиля..." />;
  }

  if (!profileStore.profile) {
    return (
      <View style={styles.container}>
        <Header title="Профиль" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Не удалось загрузить профиль</Text>
          <Button
            title="Попробовать снова"
            onPress={() => profileStore.getProfile()}
            style={styles.retryButton}
          />
        </View>
      </View>
    );
  }

  const profile = profileStore.profile;
  const bmi = profileStore.bmi;
  const bmiCategory = bmi ? getBMICategory(bmi) : 'Не рассчитан';
  const recommendedCalories = profileStore.recommendedCalories;

  return (
    <View style={styles.container}>
      <Header
        title="Профиль"
        rightComponent={
          <TouchableOpacity onPress={handleSettings}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.gender === 'MALE' ? '👨' : '👩'}
            </Text>
          </View>
          <Text style={styles.userName}>
            {authStore.user?.name || 'Пользователь'}
          </Text>
          <Text style={styles.userEmail}>{authStore.user?.email}</Text>
        </View>

        {/* Current Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Текущие показатели</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.weight}</Text>
              <Text style={styles.statLabel}>кг</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.height}</Text>
              <Text style={styles.statLabel}>см</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profileStore.age}</Text>
              <Text style={styles.statLabel}>лет</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {bmi ? Math.round(bmi * 10) / 10 : '—'}
              </Text>
              <Text style={styles.statLabel}>ИМТ</Text>
            </View>
          </View>

          {bmi && (
            <View style={styles.bmiInfo}>
              <Text style={styles.bmiCategory}>{bmiCategory}</Text>
            </View>
          )}
        </View>

        {/* Goals */}
        <View style={styles.goalsCard}>
          <Text style={styles.cardTitle}>Цели и активность</Text>

          <View style={styles.goalItem}>
            <Text style={styles.goalLabel}>Цель</Text>
            <Text style={styles.goalValue}>
              {formatTargetWeightType(profile.targetWeightType)}
            </Text>
          </View>

          {profile.targetWeightType !== 'SAVE' && (
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Целевой вес</Text>
              <Text style={styles.goalValue}>{profile.targetWeight} кг</Text>
            </View>
          )}

          <View style={styles.goalItem}>
            <Text style={styles.goalLabel}>Активность</Text>
            <Text style={styles.goalValue}>
              {formatActivityLevel(profile.physicalActivityLevel)}
            </Text>
          </View>
        </View>

        {/* Calorie Info */}
        <View style={styles.calorieCard}>
          <Text style={styles.cardTitle}>Калорийность</Text>

          <View style={styles.calorieItem}>
            <Text style={styles.calorieLabel}>Установленный лимит</Text>
            <Text style={styles.calorieValue}>{profile.dayLimitCal} ккал</Text>
          </View>

          {recommendedCalories && (
            <View style={styles.calorieItem}>
              <Text style={styles.calorieLabel}>Рекомендуемый лимит</Text>
              <Text style={styles.calorieValue}>
                {recommendedCalories} ккал
              </Text>
            </View>
          )}

          <View style={styles.calorieNote}>
            <Text style={styles.calorieNoteText}>
              Рекомендуемая калорийность рассчитана на основе ваших параметров и
              целей
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Редактировать профиль"
            onPress={handleEditProfile}
            style={styles.actionButton}
          />

          <Button
            title="Выйти из аккаунта"
            onPress={handleLogout}
            variant="outline"
            style={styles.actionButton}
          />
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
  settingsIcon: {
    fontSize: 24,
  },
  userInfo: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 0,
    marginBottom: spacing.lg,
    ...shadows.md,
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
    fontSize: 40,
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
  statsCard: {
    margin: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.xl,
    borderWidth: 0,
    ...shadows.lg,
  },
  cardTitle: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  bmiInfo: {
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  bmiCategory: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  goalsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.xl,
    borderWidth: 0,
    ...shadows.lg,
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  goalLabel: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  goalValue: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '600',
  },
  calorieCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.xl,
    borderWidth: 0,
    ...shadows.lg,
  },
  calorieItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  calorieLabel: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  calorieValue: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
  },
  calorieNote: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.md,
  },
  calorieNoteText: {
    ...typography.caption,
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 18,
  },
  actions: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  actionButton: {
    marginBottom: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    minWidth: 200,
  },
});

export default ProfileScreen;

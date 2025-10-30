import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { userProfileSchema } from '../../utils/validation';
import type { MainStackParamList } from '../../types/navigation.types';
import { useStores } from '../../stores';
import { colors, typography, spacing, borderRadius } from '../../theme';
import {
  GENDER_OPTIONS,
  TARGET_WEIGHT_TYPES,
  ACTIVITY_LEVELS,
} from '../../utils/constants';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';

type ProfileEditScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'ProfileEdit'
>;

const ProfileEditScreen: React.FC = observer(() => {
  const navigation = useNavigation<ProfileEditScreenNavigationProp>();
  const { profileStore } = useStores();

  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showTargetPicker, setShowTargetPicker] = useState(false);
  const [showActivityPicker, setShowActivityPicker] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(userProfileSchema),
    mode: 'onChange',
    defaultValues: {
      height: profileStore.profile?.height || 170,
      weight: profileStore.profile?.weight || 70,
      gender: profileStore.profile?.gender || 'MALE',
      birthday:
        profileStore.profile?.birthday ||
        new Date().toISOString().split('T')[0],
      targetWeightType: profileStore.profile?.targetWeightType || 'SAVE',
      targetWeight: profileStore.profile?.targetWeight || 70,
      physicalActivityLevel:
        profileStore.profile?.physicalActivityLevel || 'SECOND',
      dayLimitCal: profileStore.profile?.dayLimitCal || 2000,
    },
  });

  const watchedTargetType = watch('targetWeightType');

  const onSubmit = async (data: any) => {
    try {
      await profileStore.updateProfile(data);
      Alert.alert('Успех', 'Профиль обновлен');
      navigation.goBack();
    } catch {
      Alert.alert(
        'Ошибка',
        profileStore.error || 'Не удалось обновить профиль'
      );
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleGenderSelect = (gender: 'MALE' | 'FEMALE') => {
    setValue('gender', gender);
    setShowGenderPicker(false);
  };

  const handleTargetSelect = (target: 'LOSE' | 'SAVE' | 'GAIN') => {
    setValue('targetWeightType', target);
    setShowTargetPicker(false);
  };

  const handleActivitySelect = (
    activity: 'FIRST' | 'SECOND' | 'THIRD' | 'FOURTH' | 'FIFTH'
  ) => {
    setValue('physicalActivityLevel', activity);
    setShowActivityPicker(false);
  };

  if (profileStore.loading) {
    return <Loading message="Загрузка профиля..." />;
  }

  return (
    <View style={styles.container}>
      <Header
        title="Редактирование профиля"
        showBackButton
        onBackPress={handleBack}
      />

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Основная информация</Text>

            <Controller
              control={control}
              name="height"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Рост (см)"
                  placeholder="170"
                  value={value?.toString() || ''}
                  onChangeText={(text) => onChange(parseFloat(text) || 0)}
                  onBlur={onBlur}
                  error={errors.height?.message}
                  keyboardType="numeric"
                />
              )}
            />

            <Controller
              control={control}
              name="weight"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Вес (кг)"
                  placeholder="70"
                  value={value?.toString() || ''}
                  onChangeText={(text) => onChange(parseFloat(text) || 0)}
                  onBlur={onBlur}
                  error={errors.weight?.message}
                  keyboardType="numeric"
                />
              )}
            />

            <Controller
              control={control}
              name="gender"
              render={({ field: { value } }) => (
                <View>
                  <Text style={styles.label}>Пол</Text>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowGenderPicker(true)}
                  >
                    <Text style={styles.pickerButtonText}>
                      {
                        GENDER_OPTIONS.find((option) => option.value === value)
                          ?.label
                      }
                    </Text>
                    <Text style={styles.pickerArrow}>▼</Text>
                  </TouchableOpacity>
                  {errors.gender && (
                    <Text style={styles.errorText}>
                      {errors.gender.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="birthday"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Дата рождения"
                  placeholder="YYYY-MM-DD"
                  value={value}
                  onChangeText={onChange}
                  error={errors.birthday?.message}
                />
              )}
            />
          </View>

          {/* Goals */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Цели</Text>

            <Controller
              control={control}
              name="targetWeightType"
              render={({ field: { value } }) => (
                <View>
                  <Text style={styles.label}>Цель</Text>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowTargetPicker(true)}
                  >
                    <Text style={styles.pickerButtonText}>
                      {
                        TARGET_WEIGHT_TYPES.find(
                          (option) => option.value === value
                        )?.label
                      }
                    </Text>
                    <Text style={styles.pickerArrow}>▼</Text>
                  </TouchableOpacity>
                  {errors.targetWeightType && (
                    <Text style={styles.errorText}>
                      {errors.targetWeightType.message}
                    </Text>
                  )}
                </View>
              )}
            />

            {watchedTargetType !== 'SAVE' && (
              <Controller
                control={control}
                name="targetWeight"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Целевой вес (кг)"
                    placeholder="70"
                    value={value?.toString() || ''}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    onBlur={onBlur}
                    error={errors.targetWeight?.message}
                    keyboardType="numeric"
                  />
                )}
              />
            )}

            <Controller
              control={control}
              name="physicalActivityLevel"
              render={({ field: { value } }) => (
                <View>
                  <Text style={styles.label}>Уровень активности</Text>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowActivityPicker(true)}
                  >
                    <Text style={styles.pickerButtonText}>
                      {
                        ACTIVITY_LEVELS.find((option) => option.value === value)
                          ?.label
                      }
                    </Text>
                    <Text style={styles.pickerArrow}>▼</Text>
                  </TouchableOpacity>
                  {errors.physicalActivityLevel && (
                    <Text style={styles.errorText}>
                      {errors.physicalActivityLevel.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </View>

          {/* Calorie Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Калорийность</Text>

            <Controller
              control={control}
              name="dayLimitCal"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Дневной лимит калорий"
                  placeholder="2000"
                  value={value?.toString() || ''}
                  onChangeText={(text) => onChange(parseFloat(text) || 0)}
                  onBlur={onBlur}
                  error={errors.dayLimitCal?.message}
                  keyboardType="numeric"
                />
              )}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Сохранить изменения"
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || profileStore.loading}
          loading={profileStore.loading}
        />
      </View>

      {/* Gender Picker Modal */}
      {showGenderPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Выберите пол</Text>
            {GENDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.modalOption}
                onPress={() => handleGenderSelect(option.value)}
              >
                <Text style={styles.modalOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
            <Button
              title="Отмена"
              onPress={() => setShowGenderPicker(false)}
              variant="outline"
              style={styles.modalButton}
            />
          </View>
        </View>
      )}

      {/* Target Picker Modal */}
      {showTargetPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Выберите цель</Text>
            {TARGET_WEIGHT_TYPES.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.modalOption}
                onPress={() => handleTargetSelect(option.value)}
              >
                <Text style={styles.modalOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
            <Button
              title="Отмена"
              onPress={() => setShowTargetPicker(false)}
              variant="outline"
              style={styles.modalButton}
            />
          </View>
        </View>
      )}

      {/* Activity Picker Modal */}
      {showActivityPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Выберите уровень активности</Text>
            {ACTIVITY_LEVELS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.modalOption}
                onPress={() => handleActivitySelect(option.value)}
              >
                <Text style={styles.modalOptionText}>{option.label}</Text>
                <Text style={styles.modalOptionDescription}>
                  {option.description}
                </Text>
              </TouchableOpacity>
            ))}
            <Button
              title="Отмена"
              onPress={() => setShowActivityPicker(false)}
              variant="outline"
              style={styles.modalButton}
            />
          </View>
        </View>
      )}
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
  form: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    minHeight: 44,
  },
  pickerButtonText: {
    ...typography.body1,
    color: colors.text.primary,
  },
  pickerArrow: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    ...typography.h5,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalOption: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalOptionText: {
    ...typography.body1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  modalOptionDescription: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  modalButton: {
    marginTop: spacing.lg,
  },
});

export default ProfileEditScreen;

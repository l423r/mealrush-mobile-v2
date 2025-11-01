import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores';
import { weightEntrySchema } from '../../utils/validation';
import { formatDateTimeForAPI } from '../../utils/formatting';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';
import Input from '../common/Input';
import Button from '../common/Button';

interface WeightEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface WeightFormData {
  weight: number;
  recordedAt: string;
  notes?: string;
}

const WeightEntryModal: React.FC<WeightEntryModalProps> = observer(
  ({ visible, onClose, onSuccess }) => {
    const { weightStore, uiStore } = useStores();
    const [submitting, setSubmitting] = useState(false);

    const {
      control,
      handleSubmit,
      formState: { errors },
      reset,
    } = useForm<WeightFormData>({
      resolver: yupResolver(weightEntrySchema),
      defaultValues: {
        weight: 0,
        recordedAt: formatDateTimeForAPI(new Date()),
        notes: '',
      },
    });

    const handleClose = () => {
      reset();
      onClose();
    };

    const onSubmit = async (data: WeightFormData) => {
      setSubmitting(true);
      try {
        await weightStore.addEntry({
          weight: data.weight,
          recordedAt: data.recordedAt,
          notes: data.notes || undefined,
        });

        uiStore.showSnackbar('Вес успешно записан', 'success');
        handleClose();
        onSuccess?.();
      } catch (error) {
        uiStore.showSnackbar(
          weightStore.error || 'Не удалось записать вес',
          'error'
        );
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={handleClose}
          />

          <View style={styles.modal}>
            <ScrollView
              style={styles.scrollView}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.header}>
                <Text style={styles.title}>Записать вес</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.form}>
                <Controller
                  control={control}
                  name="weight"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Вес (кг)"
                      placeholder="75"
                      value={value ? value.toString() : ''}
                      onChangeText={(text) => {
                        const num = parseFloat(text);
                        onChange(isNaN(num) ? 0 : num);
                      }}
                      onBlur={onBlur}
                      error={errors.weight?.message}
                      keyboardType="decimal-pad"
                      autoFocus
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="notes"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Заметки (опционально)"
                      placeholder="Утреннее взвешивание натощак"
                      value={value || ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.notes?.message}
                      multiline
                      numberOfLines={3}
                      style={styles.notesInput}
                    />
                  )}
                />

                <Text style={styles.hint}>
                  Время записи: сейчас
                </Text>
              </View>

              <View style={styles.actions}>
                <Button
                  title="Отмена"
                  onPress={handleClose}
                  variant="outline"
                  style={styles.button}
                />
                <Button
                  title="Сохранить"
                  onPress={handleSubmit(onSubmit)}
                  loading={submitting}
                  style={styles.button}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: colors.background.paper,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    ...shadows.lg,
  },
  scrollView: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeText: {
    ...typography.h4,
    color: colors.text.secondary,
  },
  form: {
    marginBottom: spacing.lg,
  },
  notesInput: {
    minHeight: 80,
  },
  hint: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  button: {
    flex: 1,
  },
});

export default WeightEntryModal;


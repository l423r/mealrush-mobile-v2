import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import {
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';
import Input from '../common/Input';
import Button from '../common/Button';
import { validateEmail } from '../../utils/validation';

interface AddFriendDialogProps {
  visible: boolean;
  onClose: () => void;
  onSendRequest: (email: string) => Promise<void>;
  loading?: boolean;
}

const AddFriendDialog: React.FC<AddFriendDialogProps> = ({
  visible,
  onClose,
  onSendRequest,
  loading = false,
}) => {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setEmail('');
      setError(null);
    }
  }, [visible]);

  const handleSend = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Введите email пользователя');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Введите корректный email');
      return;
    }

    try {
      await onSendRequest(trimmedEmail);
      setEmail('');
      setError(null);
      onClose();
    } catch (err: any) {
      // Error will be handled by parent component
      setError(err.response?.data?.message || 'Не удалось отправить запрос');
    }
  };

  const handleCancel = () => {
    setEmail('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <TouchableWithoutFeedback onPress={handleCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardView}
            >
              <View style={styles.dialogContainer}>
                <View style={[styles.dialog, { backgroundColor: colors.background.paper }]}>
                  <Text style={[styles.title, { color: colors.text.primary }]}>
                    Добавить друга
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                    Введите email пользователя, которого хотите добавить в друзья
                  </Text>

                  <Input
                    label="Email пользователя"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (error) setError(null);
                    }}
                    placeholder="Например: friend@example.com"
                    error={error || undefined}
                    autoFocus
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    containerStyle={styles.inputContainer}
                    editable={!loading}
                  />

                  <View style={styles.hintContainer}>
                    <Text style={[styles.hintText, { color: colors.text.hint }]}>
                      💡 Введите email пользователя, зарегистрированного в приложении
                    </Text>
                  </View>

                  <View style={styles.buttonsContainer}>
                    <Button
                      title="Отмена"
                      onPress={handleCancel}
                      variant="outline"
                      style={styles.cancelButton}
                      disabled={loading}
                    />
                    <Button
                      title="Отправить запрос"
                      onPress={handleSend}
                      style={styles.confirmButton}
                      loading={loading}
                      disabled={loading}
                    />
                  </View>
                </View>
              </View>
            </KeyboardAvoidingView>
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
  keyboardView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    width: '85%',
    maxWidth: 400,
  },
  dialog: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.xl,
    elevation: 10,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.xs,
    textAlign: 'center',
    fontWeight: '600',
  },
  subtitle: {
    ...typography.body2,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  hintContainer: {
    marginBottom: spacing.lg,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  hintText: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});

export default AddFriendDialog;


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
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';
import Input from './Input';
import Button from './Button';

interface TemplateNameDialogProps {
  visible: boolean;
  defaultName: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

const TemplateNameDialog: React.FC<TemplateNameDialogProps> = ({
  visible,
  defaultName,
  onConfirm,
  onCancel,
}) => {
  const [templateName, setTemplateName] = useState(defaultName);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setTemplateName(defaultName);
      setError(null);
    }
  }, [visible, defaultName]);

  const handleConfirm = () => {
    const trimmedName = templateName.trim();
    if (!trimmedName) {
      setError('Имя шаблона обязательно');
      return;
    }
    onConfirm(trimmedName);
  };

  const handleCancel = () => {
    setTemplateName(defaultName);
    setError(null);
    onCancel();
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
                <View style={styles.dialog}>
                  <Text style={styles.title}>Сохранить как шаблон</Text>
                  <Text style={styles.subtitle}>
                    Введите название шаблона для быстрого поиска
                  </Text>

                  <Input
                    label="Название шаблона"
                    value={templateName}
                    onChangeText={(text) => {
                      setTemplateName(text);
                      if (error) setError(null);
                    }}
                    placeholder="Например: Завтрак от 15.11.2025"
                    error={error || undefined}
                    autoFocus
                    maxLength={100}
                    containerStyle={styles.inputContainer}
                  />

                  <View style={styles.buttonsContainer}>
                    <Button
                      title="Отмена"
                      onPress={handleCancel}
                      variant="outline"
                      style={styles.cancelButton}
                    />
                    <Button
                      title="Сохранить"
                      onPress={handleConfirm}
                      style={styles.confirmButton}
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
    width: '90%',
    maxWidth: 400,
  },
  dialog: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.xl,
    elevation: 10,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
    fontWeight: '600',
  },
  subtitle: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: spacing.lg,
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

export default TemplateNameDialog;


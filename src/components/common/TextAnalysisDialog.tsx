import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import Button from './Button';

interface TextAnalysisDialogProps {
  visible: boolean;
  onClose: () => void;
  onAnalyze: (description: string, language: string) => void;
  analyzing?: boolean;
}

const TextAnalysisDialog: React.FC<TextAnalysisDialogProps> = ({
  visible,
  onClose,
  onAnalyze,
  analyzing = false,
}) => {
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<'ru' | 'en'>('ru');

  const handleAnalyze = () => {
    if (description.trim().length === 0) {
      return;
    }
    onAnalyze(description.trim(), language);
  };

  const handleClose = () => {
    setDescription('');
    setLanguage('ru');
    onClose();
  };

  const isValid = description.trim().length >= 10 && description.trim().length <= 1000;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.dialog}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.title}>Анализ по описанию</Text>
              <Text style={styles.subtitle}>
                Опишите блюдо и его ингредиенты с указанием количества
              </Text>

              {/* Description Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Описание блюда</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Например: Овсяная каша на молоке 200 грамм, банан 1 штука, мед чайная ложка"
                  placeholderTextColor={colors.text.secondary}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  maxLength={1000}
                  editable={!analyzing}
                />
                <Text style={styles.charCount}>
                  {description.length}/1000 символов
                </Text>
                {description.length > 0 && description.length < 10 && (
                  <Text style={styles.hint}>
                    Минимум 10 символов
                  </Text>
                )}
              </View>

              {/* Language Selector */}
              <View style={styles.languageContainer}>
                <Text style={styles.label}>Язык анализа</Text>
                <View style={styles.languageButtons}>
                  <TouchableOpacity
                    style={[
                      styles.languageButton,
                      language === 'ru' && styles.languageButtonActive,
                    ]}
                    onPress={() => setLanguage('ru')}
                    disabled={analyzing}
                  >
                    <Text
                      style={[
                        styles.languageButtonText,
                        language === 'ru' && styles.languageButtonTextActive,
                      ]}
                    >
                      🇷🇺 Русский
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.languageButton,
                      language === 'en' && styles.languageButtonActive,
                    ]}
                    onPress={() => setLanguage('en')}
                    disabled={analyzing}
                  >
                    <Text
                      style={[
                        styles.languageButtonText,
                        language === 'en' && styles.languageButtonTextActive,
                      ]}
                    >
                      🇬🇧 English
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Tips */}
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>💡 Советы:</Text>
                <Text style={styles.tipText}>
                  • Указывайте количество ингредиентов
                </Text>
                <Text style={styles.tipText}>
                  • Будьте максимально детальны
                </Text>
                <Text style={styles.tipText}>
                  • Используйте граммы, штуки, ложки и т.д.
                </Text>
              </View>

              {/* Buttons */}
              <View style={styles.buttons}>
                <Button
                  title="Отмена"
                  onPress={handleClose}
                  variant="outline"
                  style={styles.button}
                  disabled={analyzing}
                />
                <Button
                  title="Анализировать"
                  onPress={handleAnalyze}
                  style={styles.button}
                  disabled={!isValid || analyzing}
                  loading={analyzing}
                />
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.xl,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body2,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  textArea: {
    ...typography.body1,
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 120,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: colors.border.light,
    color: colors.text.primary,
  },
  charCount: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: colors.warning,
    marginTop: spacing.xs,
  },
  languageContainer: {
    marginBottom: spacing.lg,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  languageButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.background.default,
    alignItems: 'center',
  },
  languageButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  languageButtonText: {
    ...typography.body2,
    color: colors.text.primary,
  },
  languageButtonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  tipsContainer: {
    backgroundColor: colors.background.light,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  tipsTitle: {
    ...typography.body2,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  tipText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});

export default TextAnalysisDialog;


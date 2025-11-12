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
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import Button from './Button';
import AnalysisModeSelector from './AnalysisModeSelector';
import type { AnalysisMode } from '../../types/api.types';
import { getDeviceLanguage } from '../../utils/localeUtils';

interface TextAnalysisDialogProps {
  visible: boolean;
  onClose: () => void;
  onAnalyze: (description: string, language: string, analysisMode?: AnalysisMode) => void;
  analyzing?: boolean;
}

const TextAnalysisDialog: React.FC<TextAnalysisDialogProps> = ({
  visible,
  onClose,
  onAnalyze,
  analyzing = false,
}) => {
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<'ru' | 'en'>(getDeviceLanguage());
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('AUTO');

  const handleAnalyze = () => {
    if (description.trim().length === 0) {
      return;
    }
    onAnalyze(description.trim(), language, analysisMode);
  };

  const handleClose = () => {
    setDescription('');
    setLanguage(getDeviceLanguage());
    setAnalysisMode('AUTO');
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
            style={styles.dialogContainer}
          >
            <View style={styles.dialog}>
              {/* Header with close button */}
              <View style={styles.headerRow}>
                <Text style={styles.title}>Анализ по описанию</Text>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeButton}
                  disabled={analyzing}
                >
                  <MaterialIcons name="close" size={24} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>

              {/* Buttons always visible at top */}
              <View style={styles.buttonsRow}>
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

              {/* Scrollable content */}
              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
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
                    numberOfLines={4}
                    textAlignVertical="top"
                    maxLength={1000}
                    editable={!analyzing}
                  />
                  <View style={styles.inputFooter}>
                    <Text style={styles.charCount}>{description.length}/1000</Text>
                    {description.length > 0 && description.length < 10 && (
                      <Text style={styles.hint}>Минимум 10 символов</Text>
                    )}
                  </View>
                </View>

                {/* Analysis Mode Selector */}
                <AnalysisModeSelector value={analysisMode} onChange={setAnalysisMode} />

                {/* Tips */}
                <View style={styles.tipsContainer}>
                  <Text style={styles.tipsTitle}>💡 Советы:</Text>
                  <Text style={styles.tipText}>
                    • Указывайте количество ингредиентов{'\n'}
                    • Будьте максимально детальны{'\n'}
                    • Используйте граммы, штуки, ложки и т.д.
                  </Text>
                </View>
              </ScrollView>
            </View>
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
    padding: spacing.md,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
  },
  dialog: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.xl,
    maxHeight: '100%',
    height: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  buttonsRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  button: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  content: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: spacing.md,
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
    minHeight: 100,
    maxHeight: 150,
    borderWidth: 1,
    borderColor: colors.border.light,
    color: colors.text.primary,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  charCount: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  hint: {
    ...typography.caption,
    color: colors.warning,
  },
  tipsContainer: {
    backgroundColor: colors.background.light,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  tipsTitle: {
    ...typography.body2,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  tipText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
  },
});

export default TextAnalysisDialog;

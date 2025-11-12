import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';
import Button from './Button';
import AnalysisModeSelector from './AnalysisModeSelector';
import type { AnalysisMode } from '../../types/api.types';

interface PhotoAnalysisDialogProps {
  visible: boolean;
  onClose: () => void;
  onAnalyze: (comment?: string, analysisMode?: AnalysisMode) => void;
  analyzing: boolean;
}

const PhotoAnalysisDialog: React.FC<PhotoAnalysisDialogProps> = ({
  visible,
  onClose,
  onAnalyze,
  analyzing,
}) => {
  const [comment, setComment] = useState('');
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('AUTO');

  const handleAnalyze = () => {
    onAnalyze(
      comment.trim() ? comment.trim() : undefined,
      analysisMode
    );
    setComment('');
    setAnalysisMode('AUTO');
  };

  const handleClose = () => {
    setComment('');
    setAnalysisMode('AUTO');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialogContainer}>
              <View style={styles.dialog}>
                {/* Header with close button */}
                <View style={styles.headerRow}>
                  <Text style={styles.title}>Анализ фотографии</Text>
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
                    title={analyzing ? 'Анализ...' : 'Анализировать'}
                    onPress={handleAnalyze}
                    disabled={analyzing}
                    loading={analyzing}
                    style={styles.button}
                  />
                </View>

                {/* Scrollable content */}
                <ScrollView
                  style={styles.content}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Comment Input */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Комментарий (опционально)</Text>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Домашний обед с макаронами и котлетой, порция примерно 300г"
                      placeholderTextColor={colors.text.secondary}
                      value={comment}
                      onChangeText={setComment}
                      multiline
                      numberOfLines={3}
                      maxLength={500}
                      textAlignVertical="top"
                      editable={!analyzing}
                    />
                    <Text style={styles.charCount}>{comment.length}/500</Text>
                  </View>

                  {/* Analysis Mode Selector */}
                  <AnalysisModeSelector value={analysisMode} onChange={setAnalysisMode} />

                  {/* Tip */}
                  <View style={styles.tipContainer}>
                    <Text style={styles.tipText}>
                      💡 Комментарий помогает AI лучше определить блюдо и его количество
                    </Text>
                  </View>
                </ScrollView>
              </View>
            </View>
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
    padding: spacing.md,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 480,
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
  commentInput: {
    ...typography.body1,
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 70,
    maxHeight: 100,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  charCount: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  tipContainer: {
    backgroundColor: colors.background.light,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  tipText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
  },
});

export default PhotoAnalysisDialog;

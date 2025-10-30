import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
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

interface PhotoAnalysisDialogProps {
  visible: boolean;
  onClose: () => void;
  onAnalyze: (comment?: string) => void;
  analyzing: boolean;
}

const PhotoAnalysisDialog: React.FC<PhotoAnalysisDialogProps> = ({
  visible,
  onClose,
  onAnalyze,
  analyzing,
}) => {
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);

  const handleAnalyze = () => {
    onAnalyze(showComment && comment.trim() ? comment.trim() : undefined);
    // Сбрасываем состояние после отправки
    setComment('');
    setShowComment(false);
  };

  const handleClose = () => {
    setComment('');
    setShowComment(false);
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
                <Text style={styles.title}>Анализ фотографии</Text>
                <Text style={styles.subtitle}>
                  Добавьте комментарий для более точного анализа (опционально)
                </Text>

                {/* Кнопка для раскрытия комментария */}
                {!showComment && (
                  <TouchableOpacity
                    style={styles.commentToggle}
                    onPress={() => setShowComment(true)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name="add-comment"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.commentToggleText}>
                      Добавить комментарий
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Поле комментария */}
                {showComment && (
                  <View style={styles.commentContainer}>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Например: Домашний обед с макаронами и котлетой, порция примерно 300г"
                      placeholderTextColor={colors.text.hint}
                      value={comment}
                      onChangeText={setComment}
                      multiline
                      maxLength={500}
                      textAlignVertical="top"
                    />
                    <View style={styles.commentFooter}>
                      <Text style={styles.commentLength}>
                        {comment.length}/500
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setShowComment(false);
                          setComment('');
                        }}
                        activeOpacity={0.7}
                      >
                        <MaterialIcons
                          name="close"
                          size={18}
                          color={colors.text.secondary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleClose}
                    activeOpacity={0.7}
                    disabled={analyzing}
                  >
                    <Text style={styles.cancelText}>Отмена</Text>
                  </TouchableOpacity>
                  <Button
                    title={analyzing ? 'Анализ...' : 'Анализировать'}
                    onPress={handleAnalyze}
                    disabled={analyzing}
                    loading={analyzing}
                    style={styles.analyzeButton}
                  />
                </View>
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
  },
  dialogContainer: {
    width: '85%',
    maxWidth: 400,
  },
  dialog: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.xl,
    elevation: 10,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  commentToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  commentToggleText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '500',
  },
  commentContainer: {
    marginBottom: spacing.md,
  },
  commentInput: {
    ...typography.body1,
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 80,
    maxHeight: 120,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  commentLength: {
    ...typography.caption,
    color: colors.text.hint,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelText: {
    ...typography.button,
    color: colors.text.primary,
    fontWeight: '600',
  },
  analyzeButton: {
    flex: 1,
  },
});

export default PhotoAnalysisDialog;

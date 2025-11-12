import React, { useState, useEffect } from 'react';
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
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import Button from './Button';
import AnalysisModeSelector from './AnalysisModeSelector';
import type { AnalysisMode } from '../../types/api.types';
import {
  startRecording,
  stopRecording,
  getRecordingStatus,
  formatDuration,
  validateAudioSize,
  audioUriToBase64,
} from '../../utils/audioUtils';
import { useStores } from '../../stores';
import { getDeviceLanguage } from '../../utils/localeUtils';

interface AudioRecordDialogProps {
  visible: boolean;
  onClose: () => void;
  onAnalyze: (audioBase64: string, language: string, comment?: string, analysisMode?: AnalysisMode) => void;
  analyzing?: boolean;
}

const AudioRecordDialog: React.FC<AudioRecordDialogProps> = ({
  visible,
  onClose,
  onAnalyze,
  analyzing = false,
}) => {
  const { uiStore } = useStores();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [comment, setComment] = useState('');
  const [language, setLanguage] = useState<'ru' | 'en'>(getDeviceLanguage());
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('AUTO');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (recording) {
      interval = setInterval(async () => {
        const status = await getRecordingStatus(recording);
        if (status) {
          setDuration(status.durationMillis);
        }
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recording]);

  const handleStartRecording = async () => {
    const rec = await startRecording();
    if (rec) {
      setRecording(rec);
      setRecordingUri(null);
      setDuration(0);
    }
  };

  const handleStopRecording = async () => {
    if (!recording) return;

    const uri = await stopRecording(recording);
    setRecording(null);
    setRecordingUri(uri);
  };

  const handleAnalyze = async () => {
    if (!recordingUri) return;

    setIsProcessing(true);

    try {
      const isValidSize = await validateAudioSize(recordingUri);
      if (!isValidSize) {
        uiStore.showSnackbar('Файл слишком большой. Максимум: 25MB', 'error');
        setIsProcessing(false);
        return;
      }

      const base64 = await audioUriToBase64(recordingUri);
      if (!base64) {
        uiStore.showSnackbar('Не удалось обработать аудио', 'error');
        setIsProcessing(false);
        return;
      }

      setIsProcessing(false);
      onAnalyze(base64, language, comment.trim() || undefined, analysisMode);
    } catch (error) {
      console.error('Error processing audio:', error);
      uiStore.showSnackbar('Ошибка обработки аудио', 'error');
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (recording) {
      stopRecording(recording);
    }
    setRecording(null);
    setRecordingUri(null);
    setDuration(0);
    setComment('');
    setLanguage(getDeviceLanguage());
    setAnalysisMode('AUTO');
    onClose();
  };

  const handleReset = () => {
    setRecordingUri(null);
    setDuration(0);
  };

  const isRecording = recording !== null;
  const hasRecording = recordingUri !== null;
  const canAnalyze = hasRecording && duration > 0;

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
                <Text style={styles.title}>Анализ по голосу</Text>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeButton}
                  disabled={analyzing || isProcessing}
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
                  disabled={analyzing || isProcessing}
                />
                <Button
                  title={isProcessing ? 'Обработка...' : 'Анализировать'}
                  onPress={handleAnalyze}
                  style={styles.button}
                  disabled={!canAnalyze || analyzing || isProcessing}
                  loading={analyzing || isProcessing}
                />
              </View>

              {/* Scrollable content */}
              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
              {/* Recording Area - Compact Horizontal Layout */}
              <View style={styles.recordingContainer}>
                <View
                  style={[
                    styles.recordingCircle,
                    isRecording && styles.recordingCircleActive,
                  ]}
                >
                  <Text style={styles.recordingIcon}>
                    {isRecording ? '🔴' : hasRecording ? '✅' : '🎤'}
                  </Text>
                </View>

                <View style={styles.recordingInfo}>
                  <Text style={styles.durationText}>{formatDuration(duration)}</Text>
                  
                  {isRecording ? (
                    <Button
                      title="Остановить"
                      onPress={handleStopRecording}
                      variant="outline"
                      style={styles.recordButton}
                      size="small"
                    />
                  ) : hasRecording ? (
                    <Button
                      title="Записать заново"
                      onPress={handleReset}
                      variant="outline"
                      style={styles.recordButton}
                      disabled={analyzing || isProcessing}
                      size="small"
                    />
                  ) : (
                    <Button
                      title="Начать запись"
                      onPress={handleStartRecording}
                      style={styles.recordButton}
                      disabled={analyzing || isProcessing}
                      size="small"
                    />
                  )}
                </View>
              </View>

                {/* Settings (only when recording exists) */}
                {hasRecording && (
                  <>
                    {/* Comment Input */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Комментарий (опционально)</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Примерно стандартная порция"
                        placeholderTextColor={colors.text.secondary}
                        value={comment}
                        onChangeText={setComment}
                        multiline
                        numberOfLines={2}
                        textAlignVertical="top"
                        maxLength={500}
                        editable={!analyzing && !isProcessing}
                      />
                      <Text style={styles.charCount}>{comment.length}/500</Text>
                    </View>

                    {/* Analysis Mode Selector */}
                    <AnalysisModeSelector value={analysisMode} onChange={setAnalysisMode} />
                  </>
                )}

                {/* Tips */}
                <View style={styles.tipsContainer}>
                  <Text style={styles.tipsTitle}>💡 Советы:</Text>
                  <Text style={styles.tipText}>
                    • Говорите четко и разборчиво{'\n'}
                    • Указывайте количество ингредиентов{'\n'}
                    • Процесс анализа занимает больше времени
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
    maxHeight: '95%',
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
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.lg,
  },
  recordingCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background.paper,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border.light,
    marginRight: spacing.md,
  },
  recordingCircleActive: {
    borderColor: colors.error,
    backgroundColor: colors.error + '10',
  },
  recordingIcon: {
    fontSize: 28,
  },
  recordingInfo: {
    flex: 1,
    alignItems: 'center',
  },
  durationText: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
    fontVariant: ['tabular-nums'],
  },
  recordButton: {
    width: '100%',
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
  textInput: {
    ...typography.body1,
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 60,
    maxHeight: 80,
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

export default AudioRecordDialog;

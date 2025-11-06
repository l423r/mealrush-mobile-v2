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
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import Button from './Button';
import {
  startRecording,
  stopRecording,
  getRecordingStatus,
  formatDuration,
  validateAudioSize,
  audioUriToBase64,
} from '../../utils/audioUtils';
import { useStores } from '../../stores';

interface AudioRecordDialogProps {
  visible: boolean;
  onClose: () => void;
  onAnalyze: (audioBase64: string, language: string, comment?: string) => void;
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
  const [language, setLanguage] = useState<'ru' | 'en'>('ru');
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
      if (interval) {
        clearInterval(interval);
      }
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
      // Validate file size
      const isValidSize = await validateAudioSize(recordingUri);
      if (!isValidSize) {
        uiStore.showSnackbar('Файл слишком большой. Максимальный размер: 25MB', 'error');
        setIsProcessing(false);
        return;
      }

      // Convert to base64
      const base64 = await audioUriToBase64(recordingUri);
      if (!base64) {
        uiStore.showSnackbar('Не удалось обработать аудио файл', 'error');
        setIsProcessing(false);
        return;
      }

      setIsProcessing(false);
      onAnalyze(base64, language, comment.trim() || undefined);
    } catch (error) {
      console.error('Error processing audio:', error);
      uiStore.showSnackbar('Произошла ошибка при обработке аудио', 'error');
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
    setLanguage('ru');
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
            style={styles.dialog}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.title}>Анализ по голосу</Text>
              <Text style={styles.subtitle}>
                Запишите описание блюда голосом
              </Text>

              {/* Recording Area */}
              <View style={styles.recordingContainer}>
                <View
                  style={[
                    styles.recordingCircle,
                    isRecording && styles.recordingCircleActive,
                  ]}
                >
                  <Text style={styles.recordingIcon}>
                    {isRecording ? '🔴' : hasRecording ? '✓' : '🎤'}
                  </Text>
                </View>

                <Text style={styles.durationText}>{formatDuration(duration)}</Text>

                {isRecording ? (
                  <Button
                    title="Остановить запись"
                    onPress={handleStopRecording}
                    variant="outline"
                    style={styles.recordButton}
                  />
                ) : hasRecording ? (
                  <View style={styles.buttonRow}>
                    <Button
                      title="Записать заново"
                      onPress={handleReset}
                      variant="outline"
                      style={styles.halfButton}
                      disabled={analyzing || isProcessing}
                    />
                  </View>
                ) : (
                  <Button
                    title="Начать запись"
                    onPress={handleStartRecording}
                    style={styles.recordButton}
                    disabled={analyzing || isProcessing}
                  />
                )}
              </View>

              {/* Comment Input */}
              {hasRecording && (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>
                      Дополнительный комментарий (опционально)
                    </Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Например: Примерно стандартная порция"
                      placeholderTextColor={colors.text.secondary}
                      value={comment}
                      onChangeText={setComment}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      maxLength={500}
                      editable={!analyzing && !isProcessing}
                    />
                    <Text style={styles.charCount}>{comment.length}/500</Text>
                  </View>

                  {/* Language Selector */}
                  <View style={styles.languageContainer}>
                    <Text style={styles.label}>Язык для транскрипции</Text>
                    <View style={styles.languageButtons}>
                      <TouchableOpacity
                        style={[
                          styles.languageButton,
                          language === 'ru' && styles.languageButtonActive,
                        ]}
                        onPress={() => setLanguage('ru')}
                        disabled={analyzing || isProcessing}
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
                        disabled={analyzing || isProcessing}
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
                </>
              )}

              {/* Tips */}
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>💡 Советы:</Text>
                <Text style={styles.tipText}>
                  • Говорите четко и разборчиво
                </Text>
                <Text style={styles.tipText}>
                  • Указывайте количество ингредиентов
                </Text>
                <Text style={styles.tipText}>
                  • Процесс анализа занимает больше времени
                </Text>
              </View>

              {/* Buttons */}
              <View style={styles.buttons}>
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
  },
  recordingContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.lg,
  },
  recordingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.light,
    borderWidth: 3,
    borderColor: colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  recordingCircleActive: {
    borderColor: colors.error,
    backgroundColor: colors.error + '10',
  },
  recordingIcon: {
    fontSize: 48,
  },
  durationText: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  recordButton: {
    minWidth: 200,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    justifyContent: 'center',
  },
  halfButton: {
    minWidth: 200,
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
  textInput: {
    ...typography.body1,
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 80,
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

export default AudioRecordDialog;


import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useRoute, useNavigation } from '@react-navigation/native';
import type {
  RouteProp,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useStores } from '../../stores';
import type { MainStackParamList } from '../../types/navigation.types';
import { useTheme } from '../../hooks/useTheme';
import { borderRadius, spacing, typography, shadows } from '../../theme';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';

type DietChatRouteProp = RouteProp<MainStackParamList, 'DietChat'>;
type DietChatNavProp = NativeStackNavigationProp<MainStackParamList, 'DietChat'>;

const DietChatScreen: React.FC = observer(() => {
  const route = useRoute<DietChatRouteProp>();
  const navigation = useNavigation<DietChatNavProp>();
  const { dietChatStore, uiStore } = useStores();
  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { sessionId, title } = route.params;

  const isStreamingHere =
    dietChatStore.streaming.isStreaming &&
    dietChatStore.streaming.sessionId === sessionId;

  useEffect(() => {
    dietChatStore.setCurrentSession(sessionId);
    dietChatStore.loadMessages(sessionId);
  }, [dietChatStore, sessionId]);

  const chatTitle = useMemo(
    () => title || dietChatStore.currentSession?.title || `Чат #${sessionId}`,
    [sessionId, title, dietChatStore.currentSession]
  );

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setMessage('');
    try {
      await dietChatStore.sendMessage(sessionId, trimmed);
    } catch {
      Alert.alert('Ошибка', 'Не удалось отправить сообщение. Попробуйте снова.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await dietChatStore.loadMessages(sessionId);
    setRefreshing(false);
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isUser = item.role === 'USER';
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.assistantMessage,
          {
            backgroundColor: isUser
              ? colors.primary + '20'
              : colors.background.paper,
            alignSelf: isUser ? 'flex-end' : 'flex-start',
            borderColor: colors.border.light,
          },
        ]}
      >
        {!isUser && (
          <TouchableOpacity
            onPress={async () => {
              await Clipboard.setStringAsync(item.content || '');
              uiStore.showSnackbar('Скопировано', 'success');
            }}
            style={[
              styles.copyButton,
              { backgroundColor: colors.background.light, borderColor: colors.border.light },
            ]}
          >
            <Ionicons
              name="copy-outline"
              size={16}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        )}
        <Text
          style={[
            styles.messageText,
            { color: colors.text.primary },
            isUser && { fontWeight: '600' },
          ]}
        >
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <Header
        title={chatTitle}
        leftComponent={
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        }
        rightComponent={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            {isStreamingHere && (
              <TouchableOpacity onPress={() => dietChatStore.cancelStream()}>
                <Text style={{ color: colors.error }}>Стоп</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => navigation.navigate('HomeTabs', { screen: 'Main' })}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="home" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        }
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <FlatList
          data={dietChatStore.currentMessages}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={renderMessage}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View
              style={[
                styles.emptyState,
                {
                  backgroundColor: colors.background.paper,
                  borderColor: colors.border.light,
                },
              ]}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={48}
                color={colors.text.secondary}
              />
              <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                Сообщений пока нет
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
                Задайте вопрос диетологу, чтобы начать диалог
              </Text>
            </View>
          }
        />

        {isStreamingHere && (
          <View
            style={[
              styles.streamingBadge,
              { backgroundColor: colors.primary + '15', borderColor: colors.primary },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.streamingText, { color: colors.text.primary }]}>
              AI печатает...
            </Text>
            <TouchableOpacity onPress={() => dietChatStore.cancelStream()}>
              <Text style={{ color: colors.error, marginLeft: spacing.sm }}>
                Остановить
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {dietChatStore.streaming.error && (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {dietChatStore.streaming.error}
          </Text>
        )}

        <View
          style={[
            styles.inputRow,
            {
              borderTopColor: colors.border.light,
              backgroundColor: colors.background.paper,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <View style={styles.inputWrapper}>
            <Input
              placeholder="Введите сообщение"
              value={message}
              onChangeText={setMessage}
              editable={!isStreamingHere}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              containerStyle={styles.inputContainer}
            />
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={isStreamingHere || !message.trim()}
            style={[
              styles.sendFab,
              {
                backgroundColor: isStreamingHere || !message.trim()
                  ? colors.border.light
                  : colors.primary,
              },
            ]}
          >
            <Ionicons
              name="send"
              size={18}
              color={isStreamingHere || !message.trim() ? colors.text.secondary : colors.text.inverse}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  messageContainer: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    maxWidth: '85%',
    ...shadows.sm,
    position: 'relative',
  },
  userMessage: {},
  assistantMessage: {},
  copyButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    padding: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  messageText: {
    ...typography.body1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    gap: spacing.sm,
    ...shadows.sm,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  inputWrapper: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 0,
  },
  sendFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  emptyTitle: {
    ...typography.h3,
    marginTop: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body2,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  streamingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.xs,
  },
  streamingText: {
    ...typography.body2,
    flex: 1,
  },
  errorText: {
    ...typography.caption,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
});

export default DietChatScreen;



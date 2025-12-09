import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useStores } from '../../stores';
import type { MainStackParamList } from '../../types/navigation.types';
import { useTheme } from '../../hooks/useTheme';
import { borderRadius, spacing, typography, shadows } from '../../theme';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import type { DietChatSession } from '../../types/api.types';

type DietChatListNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'DietChatList'
>;

const DietChatListScreen: React.FC = observer(() => {
  const navigation = useNavigation<DietChatListNavigationProp>();
  const { dietChatStore } = useStores();
  const { colors } = useTheme();
  const [title, setTitle] = useState('');

  useEffect(() => {
    dietChatStore.loadSessions();
  }, [dietChatStore]);

  const handleCreate = async () => {
    const trimmedTitle = title.trim();
    try {
      const session = await dietChatStore.createSession(
        trimmedTitle ? trimmedTitle : undefined
      );
      setTitle('');
      navigation.navigate('DietChat', {
        sessionId: session.id,
        title: session.title,
      });
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось создать чат. Попробуйте снова.');
    }
  };

  const renderItem = ({ item }: { item: DietChatSession }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.background.paper, borderColor: colors.border.light }]}
      onPress={() =>
        navigation.navigate('DietChat', {
          sessionId: item.id,
          title: item.title,
        })
      }
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
          {item.title || `Чат #${item.id}`}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
      </View>
      <Text style={[styles.cardSubtitle, { color: colors.text.secondary }]}>
        Модель: {item.model}
      </Text>
      {item.lastMessageAt && (
        <Text style={[styles.cardFooter, { color: colors.text.hint }]}>
          Последнее сообщение: {new Date(item.lastMessageAt).toLocaleString()}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (dietChatStore.loading.sessions) {
    return <Loading message="Загрузка чатов..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <Header title="АИ диетолог" />

      <View style={styles.form}>
        <Input
          placeholder="Название чата (опционально)"
          value={title}
          onChangeText={setTitle}
          containerStyle={{ marginBottom: spacing.sm }}
        />
        <Button
          title={dietChatStore.loading.creating ? 'Создание...' : 'Новый чат'}
          onPress={handleCreate}
          disabled={dietChatStore.loading.creating}
        />
      </View>

      <FlatList
        data={dietChatStore.sessions}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={[styles.emptyState, { backgroundColor: colors.background.paper, borderColor: colors.border.light }]}>
            <Ionicons name="chatbox-ellipses-outline" size={48} color={colors.text.secondary} />
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
              Чатов пока нет
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
              Создайте первый чат, чтобы задать вопрос
            </Text>
          </View>
        }
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    ...typography.h3,
  },
  cardSubtitle: {
    ...typography.body2,
  },
  cardFooter: {
    ...typography.caption,
    marginTop: spacing.xs,
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
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default DietChatListScreen;



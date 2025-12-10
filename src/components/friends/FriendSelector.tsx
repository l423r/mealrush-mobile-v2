import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import { typography, spacing, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { CachedImage } from '../common/CachedImage';
import type { Friend } from '../../types/friends.types';

interface FriendSelectorProps {
  friends: Friend[];
  selectedFriend: Friend | null;
  onSelectFriend: (friend: Friend | null) => void;
}

const FriendSelector: React.FC<FriendSelectorProps> = observer(({
  friends,
  selectedFriend,
  onSelectFriend,
}) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (friend: Friend | null) => {
    onSelectFriend(friend);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.container,
          {
            borderColor: colors.border.light,
            backgroundColor: colors.background.light,
          },
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        {selectedFriend ? (
          <>
            <View style={[styles.avatarContainer, { backgroundColor: colors.background.light }]}>
              {selectedFriend.avatarUrl ? (
                <CachedImage
                  uri={selectedFriend.avatarUrl}
                  style={styles.avatar}
                />
              ) : (
                <Ionicons
                  name="person"
                  size={16}
                  color={colors.text.secondary}
                />
              )}
            </View>
            <Text style={[styles.text, { color: colors.text.primary }]} numberOfLines={1}>
              {selectedFriend.name}
            </Text>
          </>
        ) : (
          <>
            <Ionicons
              name="person-outline"
              size={16}
              color={colors.text.secondary}
            />
            <Text style={[styles.text, { color: colors.text.secondary }]}>
              Мои данные
            </Text>
          </>
        )}
        <Ionicons
          name="chevron-down"
          size={16}
          color={colors.text.secondary}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: colors.background.paper }]}>
                <TouchableOpacity
                  style={[styles.option, selectedFriend === null && styles.selectedOption]}
                  onPress={() => handleSelect(null)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={selectedFriend === null ? colors.primary : colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      { color: selectedFriend === null ? colors.primary : colors.text.primary },
                    ]}
                  >
                    Мои данные
                  </Text>
                </TouchableOpacity>

                <FlatList
                  data={friends}
                  keyExtractor={(item) => item.friendId.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.option,
                        selectedFriend?.friendId === item.friendId && styles.selectedOption,
                      ]}
                      onPress={() => handleSelect(item)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.avatarContainer, { backgroundColor: colors.background.light }]}>
                        {item.avatarUrl ? (
                          <CachedImage
                            uri={item.avatarUrl}
                            style={styles.avatar}
                          />
                        ) : (
                          <Ionicons
                            name="person"
                            size={16}
                            color={colors.text.secondary}
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          {
                            color:
                              selectedFriend?.friendId === item.friendId
                                ? colors.primary
                                : colors.text.primary,
                          },
                        ]}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 32,
    ...shadows.sm,
  },
  avatarContainer: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.round,
  },
  text: {
    ...typography.caption,
    fontSize: 12,
    maxWidth: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 300,
    maxHeight: '60%',
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    ...shadows.xl,
    elevation: 10,
    zIndex: 1000,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  selectedOption: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  optionText: {
    ...typography.body1,
    flex: 1,
  },
});

export default FriendSelector;


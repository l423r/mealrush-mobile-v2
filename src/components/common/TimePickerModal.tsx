import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    FlatList,
    Dimensions,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

interface TimePickerModalProps {
    visible: boolean;
    initialTime: Date;
    onClose: () => void;
    onConfirm: (time: Date) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5; // Should be odd

const TimePickerModal: React.FC<TimePickerModalProps> = ({
    visible,
    initialTime,
    onClose,
    onConfirm,
}) => {
    const [selectedHour, setSelectedHour] = useState(initialTime.getHours());
    const [selectedMinute, setSelectedMinute] = useState(initialTime.getMinutes());

    const hourListRef = useRef<FlatList>(null);
    const minuteListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (visible) {
            setSelectedHour(initialTime.getHours());
            setSelectedMinute(initialTime.getMinutes());
            // Scroll to position after a short delay to ensure layout is ready
            setTimeout(() => {
                hourListRef.current?.scrollToIndex({ index: initialTime.getHours(), animated: false, viewPosition: 0.5 });
                minuteListRef.current?.scrollToIndex({ index: initialTime.getMinutes(), animated: false, viewPosition: 0.5 });
            }, 100);
        }
    }, [visible, initialTime]);

    const handleConfirm = () => {
        const newTime = new Date(initialTime);
        newTime.setHours(selectedHour);
        newTime.setMinutes(selectedMinute);
        newTime.setSeconds(0);
        newTime.setMilliseconds(0);
        onConfirm(newTime);
    };

    const renderItem = (item: number, isHour: boolean) => {
        const isSelected = isHour ? item === selectedHour : item === selectedMinute;
        return (
            <TouchableOpacity
                testID={isHour ? `time_picker_hour_${item}` : `time_picker_minute_${item}`}
                accessibilityLabel={isHour ? `Выбрать час ${item}` : `Выбрать минуту ${item}`}
                style={[styles.timeItem, isSelected && styles.selectedTimeItem]}
                onPress={() => {
                    if (isHour) {
                        setSelectedHour(item);
                        hourListRef.current?.scrollToIndex({ index: item, animated: true, viewPosition: 0.5 });
                    } else {
                        setSelectedMinute(item);
                        minuteListRef.current?.scrollToIndex({ index: item, animated: true, viewPosition: 0.5 });
                    }
                }}
            >
                <Text style={[styles.timeText, isSelected && styles.selectedTimeText]}>
                    {item.toString().padStart(2, '0')}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.overlayTouchable}
                    activeOpacity={1}
                    onPress={onClose}
                >
                    <View style={styles.modalContainer}>
                        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                            <View style={styles.container}>
                                <Text style={styles.title}>Выберите время</Text>

                                <View style={styles.pickerContainer}>
                                    {/* Hours */}
                                    <View style={styles.columnContainer}>
                                        <Text style={styles.columnLabel}>Часы</Text>
                                        <View style={styles.listWrapper} testID="time_picker_hours_list">
                                            <FlatList
                                                ref={hourListRef}
                                                data={HOURS}
                                                keyExtractor={(item) => `h-${item}`}
                                                renderItem={({ item }) => renderItem(item, true)}
                                                showsVerticalScrollIndicator={false}
                                                getItemLayout={(_, index) => ({
                                                    length: ITEM_HEIGHT,
                                                    offset: ITEM_HEIGHT * index,
                                                    index,
                                                })}
                                                initialNumToRender={24}
                                            />
                                            <View style={styles.selectionHighlight} pointerEvents="none" />
                                        </View>
                                    </View>

                                    <Text style={styles.separator}>:</Text>

                                    {/* Minutes */}
                                    <View style={styles.columnContainer}>
                                        <Text style={styles.columnLabel}>Минуты</Text>
                                        <View style={styles.listWrapper} testID="time_picker_minutes_list">
                                            <FlatList
                                                ref={minuteListRef}
                                                data={MINUTES}
                                                keyExtractor={(item) => `m-${item}`}
                                                renderItem={({ item }) => renderItem(item, false)}
                                                showsVerticalScrollIndicator={false}
                                                getItemLayout={(_, index) => ({
                                                    length: ITEM_HEIGHT,
                                                    offset: ITEM_HEIGHT * index,
                                                    index,
                                                })}
                                                initialNumToRender={60}
                                            />
                                            <View style={styles.selectionHighlight} pointerEvents="none" />
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.footer}>
                                    <TouchableOpacity 
                                        testID="time_picker_cancel_button"
                                        accessibilityLabel="Отмена выбора времени"
                                        style={styles.button} 
                                        onPress={onClose}
                                    >
                                        <Text style={styles.cancelButtonText}>Отмена</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        testID="time_picker_confirm_button"
                                        accessibilityLabel="Подтвердить выбор времени"
                                        style={styles.button} 
                                        onPress={handleConfirm}
                                    >
                                        <Text style={styles.confirmButtonText}>Готово</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </View>
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
    overlayTouchable: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 340,
    },
    container: {
        backgroundColor: colors.background.paper,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        ...shadows.xl,
    },
    title: {
        ...typography.h4,
        color: colors.text.primary,
        textAlign: 'center',
        marginBottom: spacing.lg,
        fontWeight: '600',
    },
    pickerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 250,
        marginBottom: spacing.md,
    },
    columnContainer: {
        alignItems: 'center',
        width: 80,
        height: '100%',
    },
    columnLabel: {
        ...typography.caption,
        color: colors.text.secondary,
        marginBottom: spacing.xs,
    },
    listWrapper: {
        flex: 1,
        width: '100%',
        position: 'relative',
        backgroundColor: colors.background.light,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },
    timeItem: {
        height: ITEM_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedTimeItem: {
        // Background is handled by selectionHighlight
    },
    timeText: {
        ...typography.h4,
        color: colors.text.secondary,
        fontWeight: '400',
    },
    selectedTimeText: {
        color: colors.background.default, // Assuming this provides good contrast on primary
        fontWeight: 'bold',
    },
    separator: {
        ...typography.h3,
        color: colors.text.primary,
        marginHorizontal: spacing.sm,
        marginTop: 20, // Adjust to align with the center of the lists
    },
    selectionHighlight: {
        position: 'absolute',
        top: '50%', // Centered
        left: 0,
        right: 0,
        height: ITEM_HEIGHT,
        marginTop: -ITEM_HEIGHT / 2, // Offset by half height
        backgroundColor: colors.primary,
        borderRadius: borderRadius.sm,
        opacity: 1, // Solid color
        zIndex: -1, // Behind text
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
    },
    button: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    cancelButtonText: {
        ...typography.body1,
        color: colors.text.secondary,
    },
    confirmButtonText: {
        ...typography.body1,
        color: colors.primary,
        fontWeight: '600',
    },
});

export default TimePickerModal;

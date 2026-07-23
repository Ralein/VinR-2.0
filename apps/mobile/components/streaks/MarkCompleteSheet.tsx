/**
 * MarkCompleteSheet — Bottom sheet for daily habit completion
 *
 * Reflection input, mood stars (1-5), confirm button.
 * Uses same Modal pattern as InstructionSheet.
 */

import { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, Modal } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { colors } from '../../constants/theme';
import { haptics } from '../../services/haptics';

interface MarkCompleteSheetProps {
    visible: boolean;
    habitName?: string;
    habitEmoji?: string;
    onConfirm: (reflectionNote: string | null, moodRating: number | null) => void;
    onClose: () => void;
}

const STARS = [1, 2, 3, 4, 5];

export function MarkCompleteSheet({
    visible, habitName, habitEmoji, onConfirm, onClose,
}: MarkCompleteSheetProps) {
    const [reflection, setReflection] = useState('');
    const [mood, setMood] = useState<number | null>(null);

    const handleConfirm = () => {
        haptics.success();
        onConfirm(reflection || null, mood);
        setReflection('');
        setMood(null);
    };

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
                <Pressable style={styles.overlayPress} onPress={onClose} />
                <Animated.View entering={SlideInDown.duration(400)} style={styles.sheet}>
                    {/* Handle */}
                    <View style={styles.handle} />

                    {/* Habit Reminder */}
                    {habitName && (
                        <View style={styles.habitCard}>
                            <Text style={styles.habitEmoji}>{habitEmoji || '✨'}</Text>
                            <Text style={styles.habitName}>{habitName}</Text>
                            <Text style={styles.habitLabel}>Today's habit</Text>
                        </View>
                    )}

                    {/* Reflection */}
                    <Text style={styles.sectionLabel}>How did it go today?</Text>
                    <TextInput
                        style={styles.reflectionInput}
                        placeholder="Optional — share a thought..."
                        placeholderTextColor={colors.textGhost}
                        value={reflection}
                        onChangeText={setReflection}
                        multiline
                        maxLength={200}
                    />

                    {/* Mood Stars */}
                    <Text style={styles.sectionLabel}>How are you feeling now?</Text>
                    <View style={styles.starsRow}>
                        {STARS.map((star) => (
                            <Pressable
                                key={star}
                                style={styles.starButton}
                                onPress={() => { haptics.selection(); setMood(star); }}
                            >
                                <Text style={[
                                    styles.starText,
                                    mood !== null && star <= mood && styles.starActive,
                                ]}>
                                    ★
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Confirm */}
                    <Pressable style={styles.confirmButton} onPress={handleConfirm}>
                        <Text style={styles.confirmText}>I did it! ✓</Text>
                    </Pressable>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    overlayPress: { flex: 1 },
    sheet: {
        backgroundColor: colors.elevated,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    handle: {
        width: 40, height: 4, borderRadius: 2,
        backgroundColor: colors.textGhost,
        alignSelf: 'center', marginBottom: 24,
    },
    habitCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 24,
    },
    habitEmoji: { fontSize: 36, marginBottom: 8 },
    habitName: {
        fontFamily: 'DMSans_600SemiBold', fontSize: 17,
        color: colors.textPrimary, marginBottom: 4,
    },
    habitLabel: {
        fontFamily: 'DMSans_300Light', fontSize: 12,
        color: colors.textGhost, textTransform: 'uppercase', letterSpacing: 1,
    },
    sectionLabel: {
        fontFamily: 'DMSans_400Regular', fontSize: 15,
        color: colors.textMuted, marginBottom: 10,
    },
    reflectionInput: {
        backgroundColor: colors.surface,
        borderRadius: 14,
        padding: 16,
        fontFamily: 'DMSans_400Regular', fontSize: 15,
        color: colors.textPrimary,
        borderWidth: 1, borderColor: colors.border,
        minHeight: 80,
        marginBottom: 24,
        lineHeight: 22,
        textAlignVertical: 'top',
    },
    starsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 28,
    },
    starButton: { padding: 4 },
    starText: {
        fontSize: 32,
        color: colors.textGhost,
    },
    starActive: {
        color: colors.gold,
    },
    confirmButton: {
        backgroundColor: colors.emerald,
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: colors.emerald,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
    },
    confirmText: {
        fontFamily: 'DMSans_600SemiBold', fontSize: 17,
        color: '#FFFFFF', letterSpacing: 0.3,
    },
});

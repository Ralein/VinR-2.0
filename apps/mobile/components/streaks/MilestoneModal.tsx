/**
 * MilestoneModal — Celebration modal for streak milestones
 *
 * Day 5/10/15/21 specific messages, gold card, scale bounce.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import Animated, {
    FadeIn,
    ZoomIn,
} from 'react-native-reanimated';
import { colors } from '../../constants/theme';
import { haptics } from '../../services/haptics';

const MILESTONE_CONFIG: Record<number, { emoji: string; title: string; message: string }> = {
    5: {
        emoji: '🌱',
        title: "You're sprouting!",
        message: '5 days strong. Most people quit by day 3 — not you.',
    },
    10: {
        emoji: '🌿',
        title: 'Halfway hero!',
        message: 'Habits are forming in your brain. Neurons that fire together, wire together.',
    },
    15: {
        emoji: '🌸',
        title: 'Almost there!',
        message: "You're in the top 5% of people who stick with this. Incredible.",
    },
    21: {
        emoji: '🏆',
        title: 'YOU ARE A WINNER!',
        message: '21 days. New habits. New you. The old you wouldn\'t believe this.',
    },
};

interface MilestoneModalProps {
    day: number | null;
    visible: boolean;
    onDismiss: () => void;
}

export function MilestoneModal({ day, visible, onDismiss }: MilestoneModalProps) {
    if (!day || !MILESTONE_CONFIG[day]) return null;

    const config = MILESTONE_CONFIG[day];

    const handleDismiss = () => {
        haptics.medium();
        onDismiss();
    };

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onDismiss}>
            <Animated.View entering={FadeIn.duration(300)} style={styles.overlay}>
                <Animated.View entering={ZoomIn.duration(500).springify()} style={styles.card}>
                    {/* Emoji */}
                    <Text style={styles.emoji}>{config.emoji}</Text>

                    {/* Day Badge */}
                    <View style={styles.dayBadge}>
                        <Text style={styles.dayNumber}>Day {day}</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{config.title}</Text>

                    {/* Message */}
                    <Text style={styles.message}>{config.message}</Text>

                    {/* Progress Summary */}
                    <View style={styles.progressRow}>
                        <View style={styles.progressItem}>
                            <Text style={styles.progressNumber}>{day}</Text>
                            <Text style={styles.progressLabel}>days done</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.progressItem}>
                            <Text style={styles.progressNumber}>{21 - day}</Text>
                            <Text style={styles.progressLabel}>days left</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.progressItem}>
                            <Text style={styles.progressNumber}>{Math.round((day / 21) * 100)}%</Text>
                            <Text style={styles.progressLabel}>complete</Text>
                        </View>
                    </View>

                    {/* CTA */}
                    <Pressable style={styles.ctaButton} onPress={handleDismiss}>
                        <Text style={styles.ctaText}>
                            {day === 21 ? 'Celebrate! 🎉' : 'Keep going →'}
                        </Text>
                    </Pressable>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    card: {
        backgroundColor: colors.elevated,
        borderRadius: 28,
        padding: 32,
        width: '100%',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.gold,
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 12,
    },
    emoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    dayBadge: {
        backgroundColor: 'rgba(212,168,83,0.15)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 6,
        marginBottom: 16,
    },
    dayNumber: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 14,
        color: colors.gold,
        letterSpacing: 1,
    },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 26,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 12,
    },
    message: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 15,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 28,
        gap: 16,
    },
    progressItem: {
        alignItems: 'center',
    },
    progressNumber: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 22,
        color: colors.gold,
    },
    progressLabel: {
        fontFamily: 'DMSans_300Light',
        fontSize: 11,
        color: colors.textGhost,
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: 32,
        backgroundColor: colors.border,
    },
    ctaButton: {
        backgroundColor: colors.gold,
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 48,
        alignItems: 'center',
    },
    ctaText: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 16,
        color: colors.void,
    },
});

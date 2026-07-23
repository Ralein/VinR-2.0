/**
 * SleepMode — Dim overlay with breathing animation and auto-stop timer
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useMediaStore } from '../../stores/mediaStore';
import { MoonStar, Moon } from 'lucide-react-native';

const TIMER_OPTIONS = [
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '60 min', value: 60 },
];

interface SleepModeProps {
    visible: boolean;
    onClose: () => void;
}

export default function SleepMode({ visible, onClose }: SleepModeProps) {
    const { colors, fonts, spacing, borderRadius, isDark } = useTheme();
    const { setSleepTimer, sleepTimerMinutes } = useMediaStore();
    const [selectedTimer, setSelectedTimer] = useState<number>(30);

    const handleStart = () => {
        setSleepTimer(selectedTimer);
        // In a full implementation, this would also:
        // - Dim the screen brightness
        // - Start a breathing animation cycle
        // - Auto-queue sleep music if not already playing
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            presentationStyle="overFullScreen"
            transparent
            onRequestClose={onClose}
        >
            <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(7,9,15,0.92)' : 'rgba(252,251,247,0.92)' }]}>
                <View style={[styles.container, { backgroundColor: colors.elevated, borderRadius: borderRadius.xl, padding: spacing.xl }]}>
                    {/* Moon */}
                    <MoonStar size={48} color={colors.gold} style={{ marginBottom: 16 }} />
                    <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fonts.display }]}>Sleep Mode</Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: fonts.body }]}>
                        Dim the lights. Breathe slowly.{'\n'}VinR will stop playing after your timer.
                    </Text>

                    {/* Timer selection */}
                    <View style={styles.timerRow}>
                        {TIMER_OPTIONS.map((opt) => (
                            <Pressable
                                key={opt.value}
                                style={[
                                    styles.timerChip,
                                    { backgroundColor: colors.surface, borderColor: colors.border },
                                    selectedTimer === opt.value && { backgroundColor: colors.gold + '20', borderColor: colors.gold },
                                ]}
                                onPress={() => setSelectedTimer(opt.value)}
                            >
                                <Text
                                    style={[
                                        styles.timerChipText,
                                        { color: colors.textMuted, fontFamily: fonts.body },
                                        selectedTimer === opt.value && { color: colors.gold, fontFamily: fonts.bodySemiBold },
                                    ]}
                                >
                                    {opt.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Status */}
                    {sleepTimerMinutes && (
                        <View style={[styles.statusBanner, { backgroundColor: colors.gold + '10', borderRadius: borderRadius.md, padding: spacing.sm }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                                <Moon size={14} color={colors.gold} />
                                <Text style={[styles.statusText, { color: colors.gold, fontFamily: fonts.body }]}>
                                    Sleep timer active: {sleepTimerMinutes} min
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Actions */}
                    <Pressable style={[styles.startButton, { backgroundColor: colors.gold, borderRadius: borderRadius.md, paddingVertical: spacing.md }]} onPress={handleStart}>
                        <Text style={[styles.startText, { color: isDark ? colors.void : colors.surface, fontFamily: fonts.bodySemiBold }]}>
                            {sleepTimerMinutes ? 'Update Timer' : 'Start Sleep Timer'}
                        </Text>
                    </Pressable>

                    <Pressable style={styles.closeButton} onPress={onClose}>
                        <Text style={[styles.closeText, { color: colors.textMuted, fontFamily: fonts.body }]}>Close</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    container: {
        width: '100%',
        maxWidth: 360,
        alignItems: 'center',
        marginBottom: 24,
    },
    moonEmoji: { fontSize: 48, marginBottom: 16 },
    title: {
        fontSize: 24,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    timerRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    timerChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        borderWidth: 1,
    },
    timerChipText: {
        fontSize: 14,
    },
    statusBanner: {
        marginBottom: 16,
        width: '100%',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 13,
    },
    startButton: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 12,
    },
    startText: {
        fontSize: 16,
    },
    closeButton: {
        paddingVertical: 8,
    },
    closeText: {
        fontSize: 14,
    },
});

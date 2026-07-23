/**
 * FullPlayer — Full-screen audio player modal
 */

import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../../constants/theme';
import { useMediaStore } from '../../stores/mediaStore';

const SLEEP_OPTIONS = [
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '60 min', value: 60 },
    { label: 'Off', value: null },
];

interface FullPlayerProps {
    visible: boolean;
    onClose: () => void;
}

function formatTime(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

export default function FullPlayer({ visible, onClose }: FullPlayerProps) {
    const {
        currentTrack, isPlaying, positionMs, durationMs,
        sleepTimerMinutes,
        play, pause, stop, setSleepTimer,
    } = useMediaStore();

    if (!currentTrack) return null;

    const progress = durationMs > 0 ? positionMs / durationMs : 0;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Close handle */}
                <Pressable onPress={onClose} style={styles.closeHandle}>
                    <View style={styles.handle} />
                </Pressable>

                {/* Album art placeholder */}
                <View style={styles.artContainer}>
                    <Text style={styles.artEmoji}>{currentTrack.thumbnail_emoji}</Text>
                </View>

                {/* Track info */}
                <Text style={styles.title}>{currentTrack.title}</Text>
                <Text style={styles.artist}>
                    {currentTrack.artist || currentTrack.category}
                </Text>

                {/* Progress bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                    </View>
                    <View style={styles.timeRow}>
                        <Text style={styles.timeText}>{formatTime(positionMs)}</Text>
                        <Text style={styles.timeText}>{formatTime(durationMs)}</Text>
                    </View>
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    <Pressable
                        style={styles.playButton}
                        onPress={isPlaying ? pause : play}
                    >
                        <Text style={styles.playIcon}>
                            {isPlaying ? '⏸' : '▶️'}
                        </Text>
                    </Pressable>
                </View>

                {/* Sleep Timer */}
                <View style={styles.sleepSection}>
                    <Text style={styles.sleepLabel}>🌙 Sleep Timer</Text>
                    <View style={styles.sleepOptions}>
                        {SLEEP_OPTIONS.map((opt) => (
                            <Pressable
                                key={opt.label}
                                style={[
                                    styles.sleepChip,
                                    sleepTimerMinutes === opt.value && styles.sleepChipActive,
                                ]}
                                onPress={() => setSleepTimer(opt.value)}
                            >
                                <Text
                                    style={[
                                        styles.sleepChipText,
                                        sleepTimerMinutes === opt.value && styles.sleepChipTextActive,
                                    ]}
                                >
                                    {opt.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Stop */}
                <Pressable style={styles.stopButton} onPress={() => { stop(); onClose(); }}>
                    <Text style={styles.stopText}>Stop & Close</Text>
                </Pressable>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.void,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
    },
    closeHandle: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.textGhost,
    },
    artContainer: {
        width: 200,
        height: 200,
        borderRadius: borderRadius.xl,
        backgroundColor: colors.surface,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing['2xl'],
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.gold + '30',
    },
    artEmoji: { fontSize: 72 },
    title: {
        fontFamily: fonts.display,
        fontSize: 24,
        color: colors.textPrimary,
        textAlign: 'center',
    },
    artist: {
        fontFamily: fonts.body,
        fontSize: 15,
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: spacing.xs,
        marginBottom: spacing.xl,
    },
    progressContainer: { marginBottom: spacing.lg },
    progressBar: {
        height: 4,
        backgroundColor: colors.surface,
        borderRadius: 2,
    },
    progressFill: {
        height: 4,
        backgroundColor: colors.gold,
        borderRadius: 2,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.xs,
    },
    timeText: {
        fontFamily: fonts.mono,
        fontSize: 12,
        color: colors.textGhost,
    },
    controls: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    playButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.gold,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playIcon: { fontSize: 28 },
    sleepSection: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    sleepLabel: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 14,
        color: colors.textMuted,
        marginBottom: spacing.sm,
    },
    sleepOptions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    sleepChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sleepChipActive: {
        backgroundColor: colors.gold + '20',
        borderColor: colors.gold,
    },
    sleepChipText: {
        fontFamily: fonts.body,
        fontSize: 13,
        color: colors.textMuted,
    },
    sleepChipTextActive: {
        color: colors.gold,
        fontFamily: fonts.bodySemiBold,
    },
    stopButton: {
        alignSelf: 'center',
        paddingVertical: spacing.sm,
    },
    stopText: {
        fontFamily: fonts.body,
        fontSize: 14,
        color: colors.crimson,
    },
});

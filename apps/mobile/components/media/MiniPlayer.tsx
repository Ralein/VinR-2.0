/**
 * MiniPlayer — Persistent bottom bar for currently playing audio
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../../constants/theme';
import { useMediaStore } from '../../stores/mediaStore';

export default function MiniPlayer() {
    const { currentTrack, isPlaying, showMiniPlayer, play, pause, stop } = useMediaStore();

    if (!showMiniPlayer || !currentTrack) return null;

    const progressPercent = useMediaStore((s) =>
        s.durationMs > 0 ? (s.positionMs / s.durationMs) * 100 : 0
    );

    return (
        <View style={styles.container}>
            {/* Progress bar */}
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>

            <View style={styles.content}>
                {/* Track info */}
                <Text style={styles.emoji}>{currentTrack.thumbnail_emoji}</Text>
                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={1}>
                        {currentTrack.title}
                    </Text>
                    <Text style={styles.subtitle} numberOfLines={1}>
                        {currentTrack.artist || currentTrack.category}
                    </Text>
                </View>

                {/* Controls */}
                <Pressable
                    style={styles.controlButton}
                    onPress={isPlaying ? pause : play}
                >
                    <Text style={styles.controlIcon}>
                        {isPlaying ? '⏸' : '▶️'}
                    </Text>
                </Pressable>
                <Pressable style={styles.closeButton} onPress={stop}>
                    <Text style={styles.closeIcon}>✕</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.elevated,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    progressBar: {
        height: 2,
        backgroundColor: colors.surface,
    },
    progressFill: {
        height: 2,
        backgroundColor: colors.gold,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 2,
    },
    emoji: {
        fontSize: 28,
        marginRight: spacing.sm,
    },
    info: {
        flex: 1,
        marginRight: spacing.sm,
    },
    title: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 14,
        color: colors.textPrimary,
    },
    subtitle: {
        fontFamily: fonts.body,
        fontSize: 12,
        color: colors.textMuted,
    },
    controlButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.full,
        backgroundColor: colors.gold + '20',
        marginRight: spacing.xs,
    },
    controlIcon: {
        fontSize: 18,
    },
    closeButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeIcon: {
        fontSize: 16,
        color: colors.textGhost,
    },
});

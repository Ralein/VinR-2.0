/**
 * AudioCategoryCard v3 — Premium with graceful fallback
 *
 * Shows audio tracks from the backend. When the API fails or returns
 * no tracks, renders beautiful placeholder cards so the UI never
 * looks empty.
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle, withSpring, useSharedValue, FadeInDown,
} from 'react-native-reanimated';
import { Play, Music, Radio, Wifi, WifiOff, Clock } from 'lucide-react-native';
import { colors, fonts, spacing, borderRadius } from '../../constants/theme';
import { useAudioLibrary, usePlayTrack, type AudioTrack } from '../../hooks/useMedia';

interface AudioCategoryCardProps {
    category: string;
    /** Lucide icon component */
    Icon?: any;
    /** Accent color for the icon circle */
    iconColor?: string;
    label: string;
    /** Placeholder tracks to show when API is unavailable */
    placeholderTracks?: Array<{ title: string; duration: string }>;
}

// Default placeholder tracks shown when the backend is unavailable
const FALLBACK_TRACKS: Record<string, Array<{ title: string; duration: string }>> = {
    sleep: [
        { title: 'Gentle Rain', duration: '30 min' },
        { title: 'Ocean Waves', duration: '45 min' },
        { title: 'White Noise', duration: '60 min' },
    ],
    breathing: [
        { title: 'Box Breathing (4-4-4-4)', duration: '5 min' },
        { title: '4-7-8 Breathing', duration: '5 min' },
        { title: 'Coherent Breathing', duration: '10 min' },
    ],
    meditation: [
        { title: 'Quick Calm', duration: '5 min' },
        { title: 'Mindful Reset', duration: '10 min' },
        { title: 'Deep Presence', duration: '15 min' },
    ],
    affirmation: [
        { title: 'Morning Power', duration: '3 min' },
        { title: 'I Am Enough', duration: '5 min' },
        { title: 'Peace Within', duration: '3 min' },
    ],
};

function TrackItem({ track, onPlay }: { track: AudioTrack; onPlay: (t: AudioTrack) => void }) {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(scale.value, { stiffness: 300, damping: 20 }) }],
    }));

    return (
        <Pressable
            onPressIn={() => { scale.value = 0.97; }}
            onPressOut={() => { scale.value = 1; }}
            onPress={() => onPlay(track)}
        >
            <Animated.View style={[styles.trackItem, animStyle]}>
                <View style={styles.trackIconWrap}>
                    <Music size={14} color={colors.textMuted} strokeWidth={1.8} />
                </View>
                <View style={styles.trackInfo}>
                    <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                    <Text style={styles.trackDuration}>{track.duration_label}</Text>
                </View>
                <View style={styles.playBtn}>
                    <Play size={12} color={colors.gold} strokeWidth={2} fill={colors.gold} />
                </View>
            </Animated.View>
        </Pressable>
    );
}

function PlaceholderTrackItem({
    title, duration, index,
}: { title: string; duration: string; index: number }) {
    return (
        <Animated.View
            entering={FadeInDown.delay(index * 60).duration(400)}
            style={styles.trackItem}
        >
            <View style={styles.trackIconWrap}>
                <Music size={14} color={colors.textGhost} strokeWidth={1.8} />
            </View>
            <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={1}>{title}</Text>
                <View style={styles.durationRow}>
                    <Clock size={10} color={colors.textGhost} strokeWidth={1.8} />
                    <Text style={styles.trackDuration}>{duration}</Text>
                </View>
            </View>
            <View style={[styles.playBtn, styles.playBtnOffline]}>
                <Play size={12} color={colors.textGhost} strokeWidth={2} />
            </View>
        </Animated.View>
    );
}

export default function AudioCategoryCard({
    category, Icon, iconColor, label,
}: AudioCategoryCardProps) {
    const { data, isLoading, isError } = useAudioLibrary(category);
    const playTrack = usePlayTrack();
    const accentColor = iconColor ?? colors.gold;
    const IconComp = Icon ?? Radio;

    const fallback = FALLBACK_TRACKS[category] ?? [];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={[styles.iconCircle, { backgroundColor: `${accentColor}18` }]}>
                    <IconComp size={18} color={accentColor} strokeWidth={1.8} />
                </View>
                <Text style={styles.headerLabel}>{label}</Text>
                {(isError || (!isLoading && !data?.tracks?.length)) && (
                    <View style={styles.offlineBadge}>
                        <WifiOff size={10} color={colors.textGhost} strokeWidth={2} />
                        <Text style={styles.offlineBadgeText}>Offline</Text>
                    </View>
                )}
            </View>

            {/* Content */}
            {isLoading ? (
                /* Skeleton loader */
                <View>
                    {[0, 1, 2].map((i) => (
                        <View key={i} style={[styles.trackItem, styles.skeleton]}>
                            <View style={[styles.trackIconWrap, styles.skeletonBox]} />
                            <View style={styles.trackInfo}>
                                <View style={[styles.skeletonLine, { width: '70%' }]} />
                                <View style={[styles.skeletonLine, { width: '35%', marginTop: 5 }]} />
                            </View>
                        </View>
                    ))}
                </View>
            ) : data?.tracks && data.tracks.length > 0 ? (
                /* Live tracks from API */
                <View>
                    {data.tracks.map((track) => (
                        <TrackItem key={track.id} track={track} onPlay={playTrack} />
                    ))}
                </View>
            ) : (
                /* Fallback tracks — shown when offline or API returns empty */
                <View>
                    {fallback.map((item, i) => (
                        <PlaceholderTrackItem
                            key={item.title}
                            title={item.title}
                            duration={item.duration}
                            index={i}
                        />
                    ))}
                    {isError && (
                        <View style={styles.offlineNote}>
                            <Wifi size={12} color={colors.textGhost} strokeWidth={1.8} />
                            <Text style={styles.offlineNoteText}>
                                Connect to stream audio
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    iconCircle: {
        width: 36, height: 36, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
    },
    headerLabel: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 15,
        color: colors.textPrimary,
        flex: 1,
    },
    offlineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: `${colors.textGhost}15`,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: borderRadius.sm,
    },
    offlineBadgeText: {
        fontFamily: fonts.body,
        fontSize: 10,
        color: colors.textGhost,
    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: spacing.sm,
    },
    trackIconWrap: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: colors.elevated,
        alignItems: 'center', justifyContent: 'center',
    },
    trackInfo: { flex: 1 },
    trackTitle: {
        fontFamily: fonts.body,
        fontSize: 14,
        color: colors.textPrimary,
    },
    durationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    trackDuration: {
        fontFamily: fonts.body,
        fontSize: 11,
        color: colors.textGhost,
    },
    playBtn: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: `${colors.gold}15`,
        alignItems: 'center', justifyContent: 'center',
    },
    playBtnOffline: {
        backgroundColor: colors.elevated,
    },
    // Skeleton
    skeleton: {
        opacity: 0.6,
    },
    skeletonBox: {
        backgroundColor: colors.elevated,
    },
    skeletonLine: {
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.elevated,
    },
    // Offline note
    offlineNote: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingTop: spacing.sm,
    },
    offlineNoteText: {
        fontFamily: fonts.body,
        fontSize: 12,
        color: colors.textGhost,
        fontStyle: 'italic',
    },
});

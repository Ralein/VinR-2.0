/**
 * EventCard — Premium event card with Google Maps deep-link,
 * source badge, star rating, photo thumbnail, and schedule action.
 *
 * Zero emoji — all Lucide vector icons.
 */

import { View, Text, Pressable, StyleSheet, Linking, Platform, Image } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import {
    Wind, Brain, Leaf, Users, Trees, Footprints, PersonStanding,
    Palette, Dumbbell, Sparkles, Heart, Sun, Bookmark, MapPin,
    CalendarDays, Monitor, ExternalLink, Star, Navigation, Clock,
    CalendarPlus,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { type EventResult } from '../../hooks/useEvents';
import { haptics } from '../../services/haptics';

interface EventCardProps {
    event: EventResult;
    isBookmarked?: boolean;
    onBookmarkToggle?: () => void;
}

export default function EventCard({ event, isBookmarked, onBookmarkToggle }: EventCardProps) {
    const { colors, fonts, spacing, borderRadius, isDark } = useTheme();

    // Map category → Lucide icon + accent color
    const CATEGORY_CONFIG: Record<string, { Icon: any; color: string }> = {
        yoga:            { Icon: PersonStanding, color: colors.lavender },
        meditation:      { Icon: Brain,          color: colors.sapphire },
        breathwork:      { Icon: Wind,           color: colors.emerald  },
        'support group': { Icon: Users,          color: colors.sapphire },
        outdoor:         { Icon: Trees,          color: colors.emerald  },
        hiking:          { Icon: Footprints,     color: colors.emerald  },
        walking:         { Icon: Footprints,     color: colors.gold     },
        'art therapy':   { Icon: Palette,        color: colors.lavender },
        fitness:         { Icon: Dumbbell,       color: colors.crimson  },
        wellness:        { Icon: Sparkles,       color: colors.gold     },
        mindfulness:     { Icon: Heart,          color: colors.crimson  },
        'self-care':     { Icon: Sun,            color: colors.gold     },
        social:          { Icon: Users,          color: colors.emerald  },
        therapy:         { Icon: Heart,          color: colors.sapphire },
    };
    const DEFAULT_CONFIG = { Icon: Sparkles, color: colors.gold };

    const cfg = CATEGORY_CONFIG[event.category || ''] ?? DEFAULT_CONFIG;
    const { Icon: CatIcon, color: catColor } = cfg;

    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(scale.value, { stiffness: 300, damping: 20 }) }],
    }));

    // ── Open Google Maps ──
    const handleOpenMaps = () => {
        haptics.light();
        if (event.google_maps_url) {
            Linking.openURL(event.google_maps_url);
        } else if (event.latitude && event.longitude) {
            const url = Platform.select({
                ios: `maps:0,0?q=${event.latitude},${event.longitude}`,
                android: `geo:${event.latitude},${event.longitude}?q=${event.latitude},${event.longitude}(${encodeURIComponent(event.name)})`,
                default: `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`,
            });
            if (url) Linking.openURL(url);
        }
    };

    // ── Schedule to calendar (Google Calendar URL) ──
    const handleSchedule = () => {
        haptics.light();
        const title = encodeURIComponent(event.name);
        const details = encodeURIComponent(event.description || '');
        const location = encodeURIComponent(event.address || event.venue || '');
        const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
        Linking.openURL(calUrl);
    };

    // ── Open event URL ──
    const handleOpenUrl = () => {
        haptics.light();
        if (event.url) Linking.openURL(event.url);
    };

    // ── Source badge colors ──
    const sourceColor = event.source === 'eventbrite' ? colors.sapphire : colors.emerald;
    const sourceLabel = event.source === 'eventbrite' ? 'Eventbrite' : 'Nearby';

    return (
        <Pressable
            onPressIn={() => { scale.value = 0.975; }}
            onPressOut={() => { scale.value = 1; }}
            onPress={event.url ? handleOpenUrl : handleOpenMaps}
        >
            <Animated.View style={[
                styles.container,
                {
                    backgroundColor: isDark ? colors.surface : '#FAF8F4',
                    borderColor: isDark ? colors.border : '#E8E1D0',
                    borderRadius: borderRadius.lg,
                    marginBottom: spacing.sm,
                },
                animStyle
            ]}>
                {/* Photo thumbnail + overlay */}
                {event.photo_url && (
                    <View style={[styles.photoWrap, { borderRadius: borderRadius.md }]}>
                        <Image
                            source={{ uri: event.photo_url }}
                            style={[styles.photo, { borderRadius: borderRadius.md }]}
                            resizeMode="cover"
                        />
                        {/* Gradient overlay for readability */}
                        <View style={[styles.photoOverlay, { borderRadius: borderRadius.md }]} />
                    </View>
                )}

                <View style={{ padding: spacing.md }}>
                    {/* Top row: category + source + bookmark */}
                    <View style={styles.topRow}>
                        <View style={styles.topRowLeft}>
                            <View style={[
                                styles.categoryChip,
                                {
                                    backgroundColor: isDark ? `${catColor}12` : `${catColor}15`,
                                    borderColor: isDark ? `${catColor}25` : `${catColor}30`,
                                    borderRadius: borderRadius.full,
                                },
                            ]}>
                                <CatIcon size={11} color={catColor} strokeWidth={2} />
                                <Text style={[styles.categoryText, { color: catColor, fontFamily: fonts.bodySemiBold }]}>
                                    {event.category || 'wellness'}
                                </Text>
                            </View>
                            {/* Source badge */}
                            <View style={[
                                styles.sourceBadge,
                                {
                                    backgroundColor: isDark ? `${sourceColor}10` : `${sourceColor}12`,
                                    borderRadius: borderRadius.full,
                                },
                            ]}>
                                <View style={[styles.sourceDot, { backgroundColor: sourceColor }]} />
                                <Text style={[styles.sourceText, { color: sourceColor, fontFamily: fonts.body }]}>
                                    {sourceLabel}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.topRowRight}>
                            {onBookmarkToggle && (
                                <Pressable onPress={() => { haptics.light(); onBookmarkToggle(); }} style={styles.bookmarkBtn} hitSlop={8}>
                                    <Bookmark
                                        size={16}
                                        color={isBookmarked ? colors.gold : colors.textGhost}
                                        fill={isBookmarked ? colors.gold : 'none'}
                                        strokeWidth={1.8}
                                    />
                                </Pressable>
                            )}
                        </View>
                    </View>

                    {/* Name */}
                    <Text style={[styles.name, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]} numberOfLines={2}>
                        {event.name}
                    </Text>

                    {/* Rating (Google Places) */}
                    {event.rating != null && (
                        <View style={styles.ratingRow}>
                            <Star size={12} color={colors.gold} fill={colors.gold} strokeWidth={0} />
                            <Text style={[styles.ratingText, { color: colors.gold, fontFamily: fonts.bodySemiBold }]}>
                                {event.rating.toFixed(1)}
                            </Text>
                            {event.rating_count != null && (
                                <Text style={[styles.ratingCount, { color: colors.textGhost, fontFamily: fonts.body }]}>
                                    ({event.rating_count.toLocaleString()})
                                </Text>
                            )}
                        </View>
                    )}

                    {/* Description */}
                    {event.description && (
                        <Text style={[styles.description, { color: colors.textMuted, fontFamily: fonts.body }]} numberOfLines={2}>
                            {event.description}
                        </Text>
                    )}

                    {/* Details row: location + date */}
                    <View style={[styles.detailsRow, { gap: spacing.md }]}>
                        {(event.venue || event.address) && (
                            <Pressable style={styles.detail} onPress={handleOpenMaps}>
                                <MapPin size={11} color={colors.emerald} strokeWidth={2} />
                                <Text style={[styles.detailText, { color: colors.emerald, fontFamily: fonts.body }]} numberOfLines={1}>
                                    {event.venue || event.address}
                                </Text>
                                <Navigation size={9} color={colors.emerald} strokeWidth={2} />
                            </Pressable>
                        )}
                        {event.date && (
                            <View style={styles.detail}>
                                <CalendarDays size={11} color={colors.textGhost} strokeWidth={1.8} />
                                <Text style={[styles.detailText, { color: colors.textGhost, fontFamily: fonts.body }]} numberOfLines={1}>
                                    {event.date}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Action row: virtual badge OR schedule + directions */}
                    <View style={styles.actionRow}>
                        {event.is_virtual ? (
                            <View style={[
                                styles.virtualBadge,
                                {
                                    backgroundColor: `${colors.sapphire}12`,
                                    borderRadius: borderRadius.sm,
                                    paddingHorizontal: spacing.sm,
                                },
                            ]}>
                                <Monitor size={11} color={colors.sapphire} strokeWidth={2} />
                                <Text style={[styles.virtualText, { color: colors.sapphire, fontFamily: fonts.bodySemiBold }]}>
                                    Virtual Event
                                </Text>
                            </View>
                        ) : (
                            <>
                                {/* Directions button */}
                                {(event.latitude && event.longitude) && (
                                    <Pressable
                                        style={[
                                            styles.actionBtn,
                                            {
                                                backgroundColor: isDark ? `${colors.emerald}12` : `${colors.emerald}15`,
                                                borderColor: isDark ? `${colors.emerald}25` : `${colors.emerald}35`,
                                                borderRadius: borderRadius.sm,
                                            },
                                        ]}
                                        onPress={handleOpenMaps}
                                    >
                                        <Navigation size={12} color={colors.emerald} strokeWidth={2} />
                                        <Text style={[styles.actionBtnText, { color: colors.emerald, fontFamily: fonts.bodySemiBold }]}>
                                            Directions
                                        </Text>
                                    </Pressable>
                                )}
                            </>
                        )}

                        {/* Schedule button */}
                        <Pressable
                            style={[
                                styles.actionBtn,
                                {
                                    backgroundColor: isDark ? `${colors.gold}12` : `${colors.gold}15`,
                                    borderColor: isDark ? `${colors.gold}25` : `${colors.gold}35`,
                                    borderRadius: borderRadius.sm,
                                },
                            ]}
                            onPress={handleSchedule}
                        >
                            <CalendarPlus size={12} color={colors.gold} strokeWidth={2} />
                            <Text style={[styles.actionBtnText, { color: colors.gold, fontFamily: fonts.bodySemiBold }]}>
                                Schedule
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        overflow: 'hidden',
    },
    // Photo
    photoWrap: {
        width: '100%',
        height: 140,
        overflow: 'hidden',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    photoOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.08)',
    },
    // Top row
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    topRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
        flexWrap: 'wrap',
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 1,
    },
    categoryText: {
        fontSize: 10,
        textTransform: 'capitalize',
        letterSpacing: 0.2,
    },
    sourceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },
    sourceDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
    },
    sourceText: {
        fontSize: 10,
    },
    topRowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    bookmarkBtn: {
        width: 28, height: 28,
        alignItems: 'center', justifyContent: 'center',
    },
    // Name
    name: {
        fontSize: 15,
        marginBottom: 4,
        lineHeight: 21,
    },
    // Rating
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 6,
    },
    ratingText: {
        fontSize: 12,
    },
    ratingCount: {
        fontSize: 11,
    },
    // Description
    description: {
        fontSize: 13,
        lineHeight: 19,
        marginBottom: 8,
    },
    // Details
    detailsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: 10,
    },
    detail: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    detailText: {
        fontSize: 12,
        maxWidth: 140,
    },
    // Action row
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
    },
    actionBtnText: {
        fontSize: 11,
    },
    // Virtual
    virtualBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingVertical: 3,
    },
    virtualText: {
        fontSize: 11,
    },
});

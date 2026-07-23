/**
 * Events Tab — Premium event discovery with real Google Places + Eventbrite data.
 *
 * Features:
 * - Discover / Saved toggle
 * - Real GPS location via expo-location
 * - Search bar with keyword search
 * - Horizontal category filter chips
 * - Pull-to-refresh
 * - Source-aware sections (Nearby / Upcoming / Virtual)
 * - Open venue in Google Maps on tap
 * - Schedule to calendar
 *
 * Zero emoji — all Lucide vector icons.
 */

import { useState, useCallback, useRef } from 'react';
import {
    View, Text, TextInput, Pressable, StyleSheet, ScrollView,
    Keyboard, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInRight, FadeInUp, Layout } from 'react-native-reanimated';
import {
    Calendar, MapPin, Search, X, Sparkles, PersonStanding, Brain,
    Wind, Dumbbell, Trees, Users, Heart, Palette, Sun, Leaf,
    Navigation, RefreshCw, Bookmark, Compass, BookmarkCheck,
    MapPinOff,
} from 'lucide-react-native';
import { fonts, spacing, borderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import {
    useEventSearch, useUserLocation, useEventBookmarks,
    useRemoveBookmark, type EventResult,
} from '../../hooks/useEvents';
import { useQueryClient } from '@tanstack/react-query';
import EventsList from '../../components/events/EventsList';
import EventCard from '../../components/events/EventCard';
import AmbientBackground from '../../components/ui/AmbientBackground';
import { haptics } from '../../services/haptics';

// ── Category filter chips ───────────────────────────────────────────────

interface CategoryChip {
    key: string;
    label: string;
    Icon: any;
    keyword: string;
}

const CATEGORIES: CategoryChip[] = [
    { key: 'all',        label: 'All',          Icon: Sparkles,        keyword: '' },
    { key: 'yoga',       label: 'Yoga',         Icon: PersonStanding,  keyword: 'yoga' },
    { key: 'meditation', label: 'Meditation',   Icon: Brain,           keyword: 'meditation' },
    { key: 'fitness',    label: 'Fitness',       Icon: Dumbbell,        keyword: 'fitness gym' },
    { key: 'parks',      label: 'Parks',         Icon: Trees,           keyword: 'park nature trail' },
    { key: 'breathwork', label: 'Breathwork',    Icon: Wind,            keyword: 'breathwork breathing' },
    { key: 'therapy',    label: 'Therapy',       Icon: Heart,           keyword: 'therapy counseling mental health' },
    { key: 'art',        label: 'Art Therapy',   Icon: Palette,         keyword: 'art therapy creative' },
    { key: 'support',    label: 'Support',       Icon: Users,           keyword: 'support group community' },
    { key: 'spa',        label: 'Spa & Wellness', Icon: Sun,            keyword: 'spa wellness center' },
];

// ── Main Screen ─────────────────────────────────────────────────────────

export default function EventsScreen() {
    const { colors, isDark } = useTheme();
    const queryClient = useQueryClient();

    // GPS location
    const { location, loading: locationLoading, refresh: refreshLocation } = useUserLocation();

    // Search state
    const [searchText, setSearchText] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'discover' | 'saved'>('discover');
    const searchInputRef = useRef<TextInput>(null);

    // Build keyword from search + category
    const activeChip = CATEGORIES.find(c => c.key === activeCategory);
    const combinedKeyword = [searchText.trim(), activeChip?.keyword || '']
        .filter(Boolean)
        .join(' ')
        .trim() || undefined;

    // Fetch events
    const {
        data: eventsData,
        isLoading,
        refetch,
    } = useEventSearch(
        location?.latitude ?? null,
        location?.longitude ?? null,
        combinedKeyword,
    );

    // Bookmarks
    const { data: bookmarks, isLoading: bookmarksLoading } = useEventBookmarks();
    const removeBookmark = useRemoveBookmark();

    // Convert bookmarks to EventResult[]
    const savedEvents: EventResult[] = (bookmarks || []).map(b => ({
        ...b.event_data,
        event_id: b.event_id,
    } as EventResult));

    // Pull-to-refresh
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        haptics.light();
        if (activeTab === 'discover') {
            await refreshLocation();
            queryClient.invalidateQueries({ queryKey: ['events-search'] });
            await refetch();
        } else {
            queryClient.invalidateQueries({ queryKey: ['event-bookmarks'] });
        }
        setIsRefreshing(false);
    }, [refetch, refreshLocation, queryClient, activeTab]);

    // Category chip press
    const handleCategoryPress = (key: string) => {
        haptics.light();
        setActiveCategory(key);
    };

    // Clear search
    const handleClearSearch = () => {
        setSearchText('');
        searchInputRef.current?.blur();
        Keyboard.dismiss();
    };

    // Tab switch
    const handleTabSwitch = (tab: 'discover' | 'saved') => {
        haptics.light();
        setActiveTab(tab);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]} edges={['top']}>
            <AmbientBackground hideBlobs={true} />

            {/* Header */}
            <Animated.View entering={FadeInDown.delay(60).duration(400)} style={styles.header}>
                <View style={styles.headerRow}>
                    <View style={[styles.iconWrap, { backgroundColor: `${colors.emerald}15` }]}>
                        <Calendar size={22} color={colors.emerald} strokeWidth={1.8} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>Events</Text>
                        <Pressable style={styles.locationRow} onPress={refreshLocation}>
                            <MapPin size={11} color={colors.emerald} strokeWidth={2} />
                            {locationLoading ? (
                                <ActivityIndicator size={10} color={colors.textGhost} />
                            ) : (
                                <Text style={[styles.locationText, { color: colors.emerald }]}>
                                    {location?.city || 'Locating...'}
                                </Text>
                            )}
                            <Navigation size={9} color={colors.textGhost} strokeWidth={2} />
                        </Pressable>
                    </View>
                </View>
            </Animated.View>

            {/* ── Discover / Saved toggle ── */}
            <Animated.View entering={FadeInDown.delay(90).duration(400)} style={styles.tabRow}>
                <View style={[
                    styles.tabContainer,
                    {
                        backgroundColor: isDark ? colors.surface : '#F2EFE9',
                        borderColor: isDark ? colors.border : '#E0DAC8',
                    },
                ]}>
                    <Pressable
                        style={[
                            styles.tab,
                            activeTab === 'discover' && [
                                styles.tabActive,
                                {
                                    backgroundColor: isDark ? colors.void : '#FFFFFF',
                                    borderColor: isDark ? colors.border : '#D4CDB8',
                                },
                            ],
                        ]}
                        onPress={() => handleTabSwitch('discover')}
                    >
                        <Compass
                            size={14}
                            color={activeTab === 'discover' ? colors.emerald : colors.textGhost}
                            strokeWidth={activeTab === 'discover' ? 2.2 : 1.6}
                        />
                        <Text style={[
                            styles.tabText,
                            {
                                color: activeTab === 'discover' ? colors.textPrimary : colors.textGhost,
                                fontFamily: activeTab === 'discover' ? fonts.bodySemiBold : fonts.body,
                            },
                        ]}>
                            Discover
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[
                            styles.tab,
                            activeTab === 'saved' && [
                                styles.tabActive,
                                {
                                    backgroundColor: isDark ? colors.void : '#FFFFFF',
                                    borderColor: isDark ? colors.border : '#D4CDB8',
                                },
                            ],
                        ]}
                        onPress={() => handleTabSwitch('saved')}
                    >
                        <Bookmark
                            size={14}
                            color={activeTab === 'saved' ? colors.gold : colors.textGhost}
                            strokeWidth={activeTab === 'saved' ? 2.2 : 1.6}
                            fill={activeTab === 'saved' ? colors.gold : 'none'}
                        />
                        <Text style={[
                            styles.tabText,
                            {
                                color: activeTab === 'saved' ? colors.textPrimary : colors.textGhost,
                                fontFamily: activeTab === 'saved' ? fonts.bodySemiBold : fonts.body,
                            },
                        ]}>
                            Saved
                        </Text>
                        {savedEvents.length > 0 && (
                            <View style={[styles.badge, { backgroundColor: colors.gold }]}>
                                <Text style={styles.badgeText}>{savedEvents.length}</Text>
                            </View>
                        )}
                    </Pressable>
                </View>
            </Animated.View>

            {/* ── DISCOVER TAB ── */}
            {activeTab === 'discover' && (
                <>
                    {/* Search bar */}
                    <Animated.View entering={FadeInDown.delay(120).duration(400)} style={styles.searchWrap}>
                        <View style={[
                            styles.searchBar,
                            {
                                backgroundColor: isDark ? colors.surface : '#F2EFE9',
                                borderColor: isDark ? colors.border : '#E0DAC8',
                            },
                        ]}>
                            <Search size={16} color={colors.textGhost} strokeWidth={2} />
                            <TextInput
                                ref={searchInputRef}
                                style={[
                                    styles.searchInput,
                                    {
                                        color: colors.textPrimary,
                                        fontFamily: fonts.body,
                                    },
                                ]}
                                placeholder="Search yoga, meditation, parks..."
                                placeholderTextColor={colors.textGhost}
                                value={searchText}
                                onChangeText={setSearchText}
                                returnKeyType="search"
                                onSubmitEditing={() => Keyboard.dismiss()}
                            />
                            {searchText.length > 0 && (
                                <Pressable onPress={handleClearSearch} hitSlop={8}>
                                    <X size={16} color={colors.textMuted} strokeWidth={2} />
                                </Pressable>
                            )}
                        </View>
                    </Animated.View>

                    {/* Category chips */}
                    <Animated.View entering={FadeInDown.delay(180).duration(400)}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.chipsContainer}
                        >
                            {CATEGORIES.map((cat, index) => {
                                const isActive = activeCategory === cat.key;
                                const chipColor = isActive ? colors.gold : colors.textGhost;

                                return (
                                    <Animated.View
                                        key={cat.key}
                                        entering={FadeInRight.delay(200 + index * 40).duration(300)}
                                    >
                                        <Pressable
                                            style={[
                                                styles.chip,
                                                {
                                                    backgroundColor: isActive
                                                        ? (isDark ? `${colors.gold}20` : `${colors.gold}18`)
                                                        : (isDark ? colors.surface : '#F2EFE9'),
                                                    borderColor: isActive
                                                        ? colors.gold
                                                        : (isDark ? colors.border : '#E0DAC8'),
                                                },
                                            ]}
                                            onPress={() => handleCategoryPress(cat.key)}
                                        >
                                            <cat.Icon
                                                size={13}
                                                color={chipColor}
                                                strokeWidth={isActive ? 2.2 : 1.6}
                                            />
                                            <Text style={[
                                                styles.chipText,
                                                {
                                                    color: chipColor,
                                                    fontFamily: isActive ? fonts.bodySemiBold : fonts.body,
                                                },
                                            ]}>
                                                {cat.label}
                                            </Text>
                                        </Pressable>
                                    </Animated.View>
                                );
                            })}
                        </ScrollView>
                    </Animated.View>

                    {/* Results count */}
                    {eventsData && !isLoading && (
                        <Animated.View entering={FadeIn.delay(300).duration(300)} style={styles.resultsMeta}>
                            <Text style={[styles.resultsCount, { color: colors.textMuted, fontFamily: fonts.body }]}>
                                {eventsData.total} {eventsData.total === 1 ? 'result' : 'results'} found
                            </Text>
                        </Animated.View>
                    )}

                    {/* Events List */}
                    <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.listContainer}>
                        <EventsList
                            events={eventsData?.events || []}
                            isLoading={isLoading || locationLoading}
                            onRefresh={handleRefresh}
                            isRefreshing={isRefreshing}
                        />
                    </Animated.View>
                </>
            )}

            {/* ── SAVED TAB ── */}
            {activeTab === 'saved' && (
                <Animated.View entering={FadeIn.duration(350)} style={styles.listContainer}>
                    {bookmarksLoading ? (
                        <View style={styles.savedEmpty}>
                            <ActivityIndicator color={colors.gold} />
                        </View>
                    ) : savedEvents.length === 0 ? (
                        <View style={styles.savedEmpty}>
                            <View style={[styles.savedEmptyIconWrap, { backgroundColor: `${colors.gold}10` }]}>
                                <BookmarkCheck size={40} color={colors.gold} strokeWidth={1.2} />
                            </View>
                            <Text style={[styles.savedEmptyTitle, { color: colors.textPrimary, fontFamily: fonts.display }]}>
                                No saved events
                            </Text>
                            <Text style={[styles.savedEmptyBody, { color: colors.textMuted, fontFamily: fonts.body }]}>
                                Bookmark events you're interested in and they'll appear here for easy access.
                            </Text>
                            <Pressable
                                style={[styles.savedEmptyBtn, { borderColor: `${colors.emerald}40` }]}
                                onPress={() => handleTabSwitch('discover')}
                            >
                                <Compass size={14} color={colors.emerald} strokeWidth={2} />
                                <Text style={[styles.savedEmptyBtnText, { color: colors.emerald, fontFamily: fonts.bodySemiBold }]}>
                                    Discover events
                                </Text>
                            </Pressable>
                        </View>
                    ) : (
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 120 }}
                        >
                            {/* Saved header */}
                            <View style={styles.savedHeader}>
                                <Bookmark size={14} color={colors.gold} fill={colors.gold} strokeWidth={0} />
                                <Text style={[styles.savedHeaderText, { color: colors.textPrimary, fontFamily: fonts.display }]}>
                                    Your Saved Events
                                </Text>
                                <Text style={[styles.savedCount, { color: colors.textGhost, fontFamily: fonts.body }]}>
                                    {savedEvents.length}
                                </Text>
                            </View>

                            {savedEvents.map((event, index) => (
                                <Animated.View
                                    key={event.event_id}
                                    entering={FadeInDown.delay(index * 60).duration(350)}
                                >
                                    <EventCard
                                        event={event}
                                        isBookmarked={true}
                                        onBookmarkToggle={() => removeBookmark.mutate(event.event_id)}
                                    />
                                </Animated.View>
                            ))}
                        </ScrollView>
                    )}
                </Animated.View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontFamily: fonts.display,
        fontSize: 28,
        letterSpacing: -0.5,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    locationText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 12,
    },
    // ── Discover / Saved tabs ──
    tabRow: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.sm,
    },
    tabContainer: {
        flexDirection: 'row',
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        padding: 3,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        borderRadius: borderRadius.md,
    },
    tabActive: {
        borderWidth: 1,
    },
    tabText: {
        fontSize: 13,
    },
    badge: {
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontFamily: fonts.bodySemiBold,
    },
    // Search
    searchWrap: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.sm,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 0,
    },
    // Category chips
    chipsContainer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.sm,
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: borderRadius.full,
        borderWidth: 1,
    },
    chipText: {
        fontSize: 12,
    },
    // Results meta
    resultsMeta: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xs,
    },
    resultsCount: {
        fontSize: 12,
    },
    // List
    listContainer: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    // Saved tab
    savedEmpty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        paddingHorizontal: spacing.xl,
    },
    savedEmptyIconWrap: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    savedEmptyTitle: {
        fontSize: 20,
        letterSpacing: -0.3,
    },
    savedEmptyBody: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },
    savedEmptyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        marginTop: 8,
    },
    savedEmptyBtnText: {
        fontSize: 13,
    },
    savedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        paddingTop: 4,
    },
    savedHeaderText: {
        fontSize: 18,
        letterSpacing: -0.3,
        flex: 1,
    },
    savedCount: {
        fontSize: 13,
    },
});

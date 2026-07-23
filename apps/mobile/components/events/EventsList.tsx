/**
 * EventsList — Sectioned event list with pull-to-refresh.
 * Groups: "Nearby Places" (Google) + "Upcoming Events" (Eventbrite) + "Virtual"
 */

import React from 'react';
import { View, Text, SectionList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { MapPinOff } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import EventCard from './EventCard';
import {
    type EventResult,
    useEventBookmarks,
    useBookmarkEvent,
    useRemoveBookmark,
} from '../../hooks/useEvents';

interface EventsListProps {
    events: EventResult[];
    isLoading: boolean;
    scrollEnabled?: boolean;
    onRefresh?: () => void;
    isRefreshing?: boolean;
}

export default function EventsList({
    events,
    isLoading,
    scrollEnabled = true,
    onRefresh,
    isRefreshing = false,
}: EventsListProps) {
    const { colors, fonts, spacing } = useTheme();
    const { data: bookmarks } = useEventBookmarks();
    const bookmarkEvent = useBookmarkEvent();
    const removeBookmark = useRemoveBookmark();

    const bookmarkedIds = new Set(bookmarks?.map((b) => b.event_id.toString()) || []);

    const handleToggleBookmark = (event: EventResult) => {
        const idStr = event.event_id.toString();
        if (bookmarkedIds.has(idStr)) {
            removeBookmark.mutate(event.event_id);
        } else {
            bookmarkEvent.mutate(event);
        }
    };

    /**
     * Grouping logic:
     * 1. "Nearby Places" — Google Places (in-person)
     * 2. "Upcoming Events" — Eventbrite (in-person)
     * 3. "Virtual Experiences" — all virtual events
     */
    const nearbyPlaces = events.filter(e => !e.is_virtual && e.source === 'google_places');
    const upcomingEvents = events.filter(e => !e.is_virtual && e.source === 'eventbrite');
    const virtualEvents = events.filter(e => e.is_virtual);

    const sections = [
        {
            title: 'Nearby Wellness',
            description: 'Wellness spots and spaces near you',
            data: nearbyPlaces,
        },
        {
            title: 'Upcoming Events',
            description: 'Scheduled wellness events and workshops',
            data: upcomingEvents,
        },
        {
            title: 'Digital Sanctuaries',
            description: 'Guided sessions you can join from anywhere',
            data: virtualEvents,
        },
    ].filter(s => s.data.length > 0);

    if (isLoading && events.length === 0) {
        return (
            <View style={[styles.center, { padding: spacing.xl }]}>
                <ActivityIndicator color={colors.gold} />
                <Text style={[styles.loadingText, { color: colors.textMuted, fontFamily: fonts.body, marginTop: spacing.md }]}>
                    Discovering nearby sanctuaries...
                </Text>
            </View>
        );
    }

    if (events.length === 0) {
        return (
            <View style={[styles.center, { padding: spacing.xl, gap: spacing.md }]}>
                <MapPinOff size={48} color={colors.textGhost} strokeWidth={1} />
                <View style={styles.emptyTextCol}>
                    <Text style={[styles.emptyTitle, { color: colors.textPrimary, fontFamily: fonts.display }]}>
                        No events found
                    </Text>
                    <Text style={[styles.emptySub, { color: colors.textMuted, fontFamily: fonts.body }]}>
                        We couldn't find wellness spots nearby. Try expanding your search or check back later.
                    </Text>
                </View>
            </View>
        );
    }

    if (!scrollEnabled) {
        return (
            <View style={styles.staticContainer}>
                {sections.map((section, sIndex) => (
                    <View key={`section-${sIndex}`} style={{ marginBottom: spacing.lg }}>
                        <View style={[styles.header, { paddingVertical: spacing.sm }]}>
                            <Text style={[styles.headerTitle, { color: colors.textPrimary, fontFamily: fonts.display }]}>
                                {section.title}
                            </Text>
                            <Text style={[styles.headerDesc, { color: colors.textMuted, fontFamily: fonts.body }]}>
                                {section.description}
                            </Text>
                        </View>
                        {section.data.map((item, iIndex) => (
                            <EventCard
                                key={`${item.event_id}-${iIndex}`}
                                event={item}
                                isBookmarked={bookmarkedIds.has(item.event_id.toString())}
                                onBookmarkToggle={() => handleToggleBookmark(item)}
                            />
                        ))}
                    </View>
                ))}
            </View>
        );
    }

    return (
        <SectionList
            sections={sections}
            keyExtractor={(item, index) => `${item.event_id}-${index}`}
            renderItem={({ item }) => (
                <EventCard
                    event={item}
                    isBookmarked={bookmarkedIds.has(item.event_id.toString())}
                    onBookmarkToggle={() => handleToggleBookmark(item)}
                />
            )}
            renderSectionHeader={({ section: { title, description } }) => (
                <View style={[styles.header, { backgroundColor: colors.void, paddingVertical: spacing.md }]}>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary, fontFamily: fonts.display }]}>
                        {title}
                    </Text>
                    <Text style={[styles.headerDesc, { color: colors.textMuted, fontFamily: fonts.body }]}>
                        {description}
                    </Text>
                </View>
            )}
            contentContainerStyle={[styles.listContent, { paddingBottom: 120 }]}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
            refreshControl={
                onRefresh ? (
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.gold}
                        colors={[colors.gold]}
                    />
                ) : undefined
            }
        />
    );
}

const styles = StyleSheet.create({
    listContent: {},
    staticContainer: {},
    header: {
        gap: 4,
    },
    headerTitle: {
        fontSize: 18,
        letterSpacing: -0.3,
    },
    headerDesc: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 8,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: 14,
    },
    emptyTextCol: {
        alignItems: 'center',
        gap: 8,
    },
    emptyTitle: {
        fontSize: 18,
    },
    emptySub: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },
});

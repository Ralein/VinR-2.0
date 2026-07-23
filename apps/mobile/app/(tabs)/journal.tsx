/**
 * Journal Screen — Full gratitude journal with calendar, entries, and AI reflections
 */

import { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, TextInput, StyleSheet,
    ActivityIndicator, Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, PenLine, BookOpen, CheckCircle2, FileText, BarChart2, ChevronRight, Sparkles } from 'lucide-react-native';
import { fonts, spacing, glass, borderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import AmbientBackground from '../../components/ui/AmbientBackground';
import GlassCard from '../../components/ui/GlassCard';
import {
    useJournalEntries,
    useJournalCalendar,
    useWeeklyInsight,
    useCreateJournalEntry,
    useSearchJournal,
    type JournalEntry as JournalEntryType,
} from '../../hooks/useJournal';
import JournalCalendar from '../../components/journal/JournalCalendar';
import GratitudeInput from '../../components/journal/GratitudeInput';
import AIReflectionCard from '../../components/journal/AIReflectionCard';
import JournalEntryCard from '../../components/journal/JournalEntry';

function getCurrentMonth(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getToday(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type ViewMode = 'write' | 'entries';

export default function JournalScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const [month, setMonth] = useState(getCurrentMonth);
    const [selectedDate, setSelectedDate] = useState<string | null>(getToday());
    const [viewMode, setViewMode] = useState<ViewMode>('write');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [lastAiReflection, setLastAiReflection] = useState<string | null>(null);

    // Data hooks
    const { data: entries, isLoading: entriesLoading } = useJournalEntries(month);
    const { data: calendar } = useJournalCalendar(month);
    const { data: weeklyInsight } = useWeeklyInsight();
    const { data: searchResults } = useSearchJournal(searchQuery);
    const createEntry = useCreateJournalEntry();

    // Month navigation
    const navigateMonth = useCallback((delta: number) => {
        setMonth((prev) => {
            const [y, m] = prev.split('-').map(Number);
            const d = new Date(y, m - 1 + delta, 1);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        });
    }, []);

    // Handle entry creation
    const handleSubmit = useCallback((data: {
        gratitude_items: string[];
        reflection_text?: string;
        mood_at_entry?: number;
    }) => {
        createEntry.mutate(data, {
            onSuccess: (entry) => {
                if (entry.ai_response) {
                    setLastAiReflection(entry.ai_response);
                }
                setViewMode('entries');
            },
        });
    }, [createEntry]);

    // Check if today already has an entry
    const todayStr = getToday();
    const todayEntry = entries?.find((e) => e.date === todayStr);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]}>
            <AmbientBackground hideBlobs={true} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Gratitude Journal</Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>What are you grateful for today?</Text>
                </View>

                {/* Search toggle */}
                <Pressable
                    style={styles.searchToggle}
                    onPress={() => setShowSearch(!showSearch)}
                >
                    <Search size={14} color={colors.gold} strokeWidth={2} />
                    <Text style={[styles.searchToggleText, { color: colors.gold }]}>
                        {showSearch ? 'Hide search' : 'Search entries'}
                    </Text>
                </Pressable>

                {/* Search bar */}
                {showSearch && (
                    <GlassCard accent="gold" style={{ marginBottom: spacing.md }}>
                        <View style={styles.searchContainer}>
                            <TextInput
                                style={[styles.searchInput, { color: colors.textPrimary, backgroundColor: colors.elevated, borderColor: colors.border }]}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Search gratitude & reflections..."
                                placeholderTextColor={colors.textGhost}
                                autoFocus
                            />
                            {searchResults && searchResults.length > 0 && (
                                <View style={styles.searchResults}>
                                    <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing.sm, opacity: 0.5 }} />
                                    <Text style={[styles.searchResultsLabel, { color: colors.textGhost }]}>
                                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                                    </Text>
                                    {searchResults.slice(0, 5).map((entry) => (
                                        <JournalEntryCard key={entry.id} entry={entry} />
                                    ))}
                                </View>
                            )}
                        </View>
                    </GlassCard>
                )}

                {/* Calendar */}
                <View style={styles.section}>
                    <GlassCard noAnimation elevated>
                        <JournalCalendar
                            month={month}
                            entryDates={calendar?.dates || []}
                            selectedDate={selectedDate}
                            onSelectDate={setSelectedDate}
                            onPrevMonth={() => navigateMonth(-1)}
                            onNextMonth={() => navigateMonth(1)}
                        />
                    </GlassCard>
                </View>

                {/* Weekly Insight */}
                {weeklyInsight && weeklyInsight.entry_count > 0 && (
                    <View style={styles.section}>
                        <GlassCard accent="sapphire" glow shimmer>
                            <View style={styles.insightHeader}>
                                <Sparkles size={18} color={colors.sapphire} strokeWidth={2} />
                                <Text style={[styles.insightLabel, { color: colors.sapphire }]}>Weekly Insight</Text>
                            </View>
                            <Text style={[styles.insightText, { color: colors.textPrimary }]}>{weeklyInsight.insight}</Text>
                            <Text style={[styles.insightMeta, { color: colors.textGhost }]}>
                                {weeklyInsight.entry_count} entries this week
                            </Text>
                        </GlassCard>
                    </View>
                )}

                {/* View Mode Toggle */}
                <View style={styles.modeToggle}>
                    <Pressable
                        style={[
                            styles.modeButton,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                            viewMode === 'write' && { backgroundColor: `${colors.gold}15`, borderColor: `${colors.gold}50` },
                        ]}
                        onPress={() => setViewMode('write')}
                    >
                        <PenLine size={14} color={viewMode === 'write' ? colors.gold : colors.textMuted} strokeWidth={2} />
                        <Text
                            style={[
                                styles.modeButtonText,
                                { color: colors.textMuted },
                                viewMode === 'write' && { color: colors.gold },
                            ]}
                        >
                            Write
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[
                            styles.modeButton,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                            viewMode === 'entries' && { backgroundColor: `${colors.gold}15`, borderColor: `${colors.gold}50` },
                        ]}
                        onPress={() => setViewMode('entries')}
                    >
                        <BookOpen size={14} color={viewMode === 'entries' ? colors.gold : colors.textMuted} strokeWidth={2} />
                        <Text
                            style={[
                                styles.modeButtonText,
                                { color: colors.textMuted },
                                viewMode === 'entries' && { color: colors.gold },
                            ]}
                        >
                            Entries
                        </Text>
                    </Pressable>
                </View>

                {/* Write Mode */}
                {viewMode === 'write' && (
                    <View style={styles.section}>
                        {todayEntry ? (
                            <GlassCard accent="emerald" glow>
                                <View style={styles.alreadyDoneCard}>
                                    <CheckCircle2 size={32} color={colors.emerald} strokeWidth={1.8} />
                                    <Text style={[styles.alreadyDoneText, { color: colors.textPrimary }]}>
                                        You've already journaled today. Beautiful work!
                                    </Text>
                                    <Pressable
                                        style={styles.viewEntryButton}
                                        onPress={() => setViewMode('entries')}
                                    >
                                        <Text style={[styles.viewEntryText, { color: colors.gold }]}>View today's entry</Text>
                                        <ChevronRight size={14} color={colors.gold} strokeWidth={2} />
                                    </Pressable>
                                </View>
                            </GlassCard>
                        ) : (
                            <GratitudeInput
                                onSubmit={handleSubmit}
                                isSubmitting={createEntry.isPending}
                            />
                        )}

                        {/* Show AI reflection after submit */}
                        {lastAiReflection && (
                            <View style={{ marginTop: spacing.md }}>
                                <AIReflectionCard reflection={lastAiReflection} />
                            </View>
                        )}
                    </View>
                )}

                {/* Entries Mode */}
                {viewMode === 'entries' && (
                    <View style={styles.section}>
                        {entriesLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator color={colors.gold} />
                            </View>
                        ) : entries && entries.length > 0 ? (
                            entries.map((entry) => (
                                <JournalEntryCard key={entry.id} entry={entry} />
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <View style={[styles.emptyIconWrap, { backgroundColor: `${colors.textGhost}0A` }]}>
                                    <FileText size={36} color={colors.textGhost} strokeWidth={1.5} />
                                </View>
                                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                                    No entries this month yet.{'\n'}Start writing to build your gratitude practice.
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollView: { flex: 1 },
    scrollContent: { padding: spacing.lg },

    // Header
    header: { marginBottom: spacing.lg },
    title: {
        fontFamily: fonts.display, fontSize: 28,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontFamily: fonts.body, fontSize: 15,
    },

    // Search
    searchToggle: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        marginBottom: spacing.md,
    },
    searchToggleText: {
        fontFamily: fonts.body, fontSize: 14,
    },
    searchContainer: { marginBottom: spacing.md },
    searchInput: {
        fontFamily: fonts.body, fontSize: 15,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 2,
        borderWidth: 1,
    },
    searchResults: { marginTop: spacing.sm },
    searchResultsLabel: {
        fontFamily: fonts.bodySemiBold, fontSize: 12,
        marginBottom: spacing.sm,
        textTransform: 'uppercase', letterSpacing: 1,
    },

    // Section
    section: { marginBottom: spacing.lg },

    // Weekly Insight
    insightCard: {
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderLeftWidth: 3,
    },
    insightHeader: {
        flexDirection: 'row', alignItems: 'center',
        marginBottom: spacing.sm,
    },
    insightLabel: {
        fontFamily: fonts.bodySemiBold, fontSize: 13,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: spacing.xs,
    },
    insightText: {
        fontFamily: fonts.body, fontSize: 14,
        lineHeight: 21,
        marginBottom: spacing.xs,
    },
    insightMeta: {
        fontFamily: fonts.body, fontSize: 12,
    },

    // Mode Toggle
    modeToggle: {
        flexDirection: 'row', gap: spacing.sm, alignItems: 'center',
        marginBottom: spacing.md,
    },
    modeButton: {
        flex: 1, paddingVertical: spacing.sm + 2,
        alignItems: 'center', borderRadius: borderRadius.md,
        borderWidth: 1,
        flexDirection: 'row', gap: 6, justifyContent: 'center',
    },
    modeButtonText: {
        fontFamily: fonts.bodySemiBold, fontSize: 14,
    },

    // Already Done
    alreadyDoneCard: {
        borderRadius: borderRadius.lg,
        padding: spacing.lg, alignItems: 'center',
        borderWidth: 1, gap: spacing.sm,
    },
    alreadyDoneText: {
        fontFamily: fonts.body, fontSize: 15,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    viewEntryButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        flexDirection: 'row', alignItems: 'center', gap: 4,
    },
    viewEntryText: {
        fontFamily: fonts.bodySemiBold, fontSize: 14,
    },

    // Loading & Empty
    loadingContainer: {
        paddingVertical: spacing['2xl'],
        alignItems: 'center',
    },
    emptyState: {
        paddingVertical: spacing['2xl'],
        alignItems: 'center', gap: spacing.md,
    },
    emptyIconWrap: {
        width: 72, height: 72, borderRadius: 36,
        alignItems: 'center', justifyContent: 'center',
    },
    emptyText: {
        fontFamily: fonts.body, fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
});

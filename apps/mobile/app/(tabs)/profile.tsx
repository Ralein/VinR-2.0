/**
 * Profile → "My Journey" Analytics Dashboard
 * 
 * Redesigned for Midnight Gold aesthetic.
 */

import React, { useState } from 'react';
import {
    View, Text, ScrollView, Pressable, StyleSheet,
    Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    MessageSquare, CalendarDays, Flame, BookText,
    BarChart2, TrendingUp, Settings, User
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import {
    useAnalyticsSummary,
    useAnalyticsTrends,
    MoodTrendPoint,
    EmotionSlice,
    InsightCard,
} from '../../hooks/useAnalytics';
import GlassCard from '../../components/ui/GlassCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 180;

// Emotion color mapping for donut - Refined for Midnight Gold
const EMOTION_COLORS: Record<string, string> = {
    happy: '#D4AF37', // Gold
    grateful: '#C5A028', // Darker Gold
    calm: '#4ECBA0', // Emerald
    hopeful: '#4A90D9', // Blue
    okay: '#7A8099', // Muted
    neutral: '#7A8099',
    anxious: '#E8A85D', // Orange
    stressed: '#E8875D', // Salmon
    lonely: '#9B59B6', // Purple
    sad: '#5D8CE8', // Light Blue
    angry: '#E85D5D', // Crimson
    overwhelmed: '#E85D75', // Pink
};

// ──────────────────────────── Mini Line Chart ────────────────────────────

function MoodLineChart({ trends }: { trends: MoodTrendPoint[] }) {
    const { colors } = useTheme();

    if (trends.length < 2) {
        return (
            <View style={chartStyles.empty}>
                <Text style={[chartStyles.emptyText, { color: colors.textSecondary }]}>
                    Check in a few more times to see your mood trend
                </Text>
            </View>
        );
    }

    const maxScore = 5;
    const minScore = 1;
    const range = maxScore - minScore;
    const padding = 8;
    const usableWidth = CHART_WIDTH - padding * 2;
    const usableHeight = CHART_HEIGHT - padding * 2 - 20;

    const points = trends.map((t, i) => ({
        x: padding + (i / (trends.length - 1)) * usableWidth,
        y: padding + 10 + usableHeight - ((t.mood_score - minScore) / range) * usableHeight,
        isStreak: t.is_streak_day,
        score: t.mood_score,
    }));

    return (
        <View style={[chartStyles.container, { height: CHART_HEIGHT }]}>
            {[5, 4, 3, 2, 1].map((val) => {
                const y = padding + 10 + usableHeight - ((val - minScore) / range) * usableHeight;
                return (
                    <View key={val} style={[chartStyles.gridLine, { top: y }]}>
                        <Text style={[chartStyles.yLabel, { color: colors.textSecondary, opacity: 0.3 }]}>{val}</Text>
                        <View style={[chartStyles.gridDash, { backgroundColor: colors.border, opacity: 0.3 }]} />
                    </View>
                );
            })}

            {points.slice(0, -1).map((p, i) => {
                const next = points[i + 1];
                const dx = next.x - p.x;
                const dy = next.y - p.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                return (
                    <View
                        key={`line-${i}`}
                        style={[
                            chartStyles.lineSegment,
                            {
                                left: p.x,
                                top: p.y,
                                width: length,
                                backgroundColor: colors.gold,
                                transform: [{ rotate: `${angle}deg` }],
                                transformOrigin: 'left center',
                            },
                        ]}
                    />
                );
            })}

            {points.map((p, i) => (
                <View
                    key={`dot-${i}`}
                    style={[
                        chartStyles.dot,
                        {
                            left: p.x - 4,
                            top: p.y - 4,
                            backgroundColor: p.isStreak ? colors.emerald : colors.gold,
                            borderColor: colors.void,
                        },
                    ]}
                />
            ))}
        </View>
    );
}

// ──────────────────────────── Donut Chart ────────────────────────────

function EmotionDonut({ distribution }: { distribution: EmotionSlice[] }) {
    const { colors } = useTheme();

    if (distribution.length === 0) {
        return (
            <View style={donutStyles.empty}>
                <Text style={[chartStyles.emptyText, { color: colors.textSecondary }]}>No emotion data yet</Text>
            </View>
        );
    }

    return (
        <View style={donutStyles.container}>
            <View style={donutStyles.bars}>
                {distribution.map((slice) => (
                    <View key={slice.emotion} style={donutStyles.barRow}>
                        <View style={donutStyles.labelRow}>
                            <View
                                style={[
                                    donutStyles.colorDot,
                                    { backgroundColor: EMOTION_COLORS[slice.emotion] || colors.textSecondary },
                                ]}
                            />
                            <Text style={[donutStyles.label, { color: colors.textPrimary }]}>{slice.emotion}</Text>
                            <Text style={[donutStyles.pct, { color: colors.textSecondary }]}>{slice.percentage}%</Text>
                        </View>
                        <View style={[donutStyles.barBg, { backgroundColor: colors.elevated }]}>
                            <View
                                style={[
                                    donutStyles.barFill,
                                    {
                                        width: `${slice.percentage}%`,
                                        backgroundColor: EMOTION_COLORS[slice.emotion] || colors.gold,
                                    },
                                ]}
                            />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

// ──────────────────────────── Stat Card ────────────────────────────

function StatCard({ value, label, Icon, color }: { value: number; label: string; Icon: any; color: string }) {
    const { colors } = useTheme();
    return (
        <GlassCard style={statStyles.cardWrapper} delay={300}>
            <View style={statStyles.cardInner}>
                <View style={[statStyles.iconWrap, { backgroundColor: `${color}15` }]}>
                    <Icon size={18} color={color} strokeWidth={2} />
                </View>
                <Text style={[statStyles.value, { color: colors.textPrimary }]}>{value}</Text>
                <Text style={[statStyles.label, { color: colors.textSecondary }]}>{label}</Text>
            </View>
        </GlassCard>
    );
}

// ──────────────────────────── Insight Card ────────────────────────────

function InsightCardView({ insight }: { insight: InsightCard }) {
    const { colors, spacing, isDark } = useTheme();
    return (
        <View style={{ marginBottom: spacing.sm }}>
            <GlassCard accent="gold" elevated={isDark} shimmer={!isDark} noBorder={isDark} hideGlow={isDark} style={{ padding: spacing.md }}>
                <View style={insightStyles.contentRow}>
                    <View style={[insightStyles.iconWrap, { backgroundColor: `${colors.gold}10` }]}>
                        <TrendingUp size={18} color={colors.gold} strokeWidth={2} />
                    </View>
                    <Text style={[insightStyles.text, { color: colors.textPrimary }]}>{insight.text}</Text>
                </View>
            </GlassCard>
        </View>
    );
}

import AmbientBackground from '../../components/ui/AmbientBackground';

export default function ProfileScreen() {
    const { colors, spacing, fonts, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const [period, setPeriod] = useState('30d');
    const { data: summary, isLoading: loadingSummary } = useAnalyticsSummary();
    const { data: trends, isLoading: loadingTrends } = useAnalyticsTrends(period);
    const router = useRouter();

    const isLoading = loadingSummary || loadingTrends;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]}>
            <AmbientBackground minimal={true} />
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={[styles.avatarCircle, { backgroundColor: `${colors.gold}05`, borderColor: colors.gold }]}>
                        <User size={40} color={colors.gold} strokeWidth={1} />
                    </View>
                    <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fonts.display }]}>My Journey</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: fonts.body }]}>Refinement statistics</Text>
                    <Pressable
                        style={styles.settingsButton}
                        onPress={() => router.push('/settings')}
                    >
                        <Settings size={24} color={colors.textSecondary} strokeWidth={1.5} />
                    </Pressable>
                </View>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.gold} />
                        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Synthesizing data...</Text>
                    </View>
                ) : (
                    <>
                        {/* Stats Row */}
                        {summary && (
                            <View style={styles.statsRow}>
                                <StatCard value={summary.total_checkins}     label="Checks"  Icon={MessageSquare} color={colors.gold} />
                                <StatCard value={summary.total_days_completed} label="Days"      Icon={CalendarDays}  color={colors.emerald} />
                                <StatCard value={summary.best_streak}        label="Streak"    Icon={Flame}         color='#E84545' />
                                <StatCard value={summary.journal_entries}    label="Journals"  Icon={BookText}      color={colors.sapphire} />
                            </View>
                        )}

                        {/* Period Selector */}
                        <View style={styles.periodRow}>
                            {['7d', '14d', '30d'].map((p) => (
                                <Pressable
                                    key={p}
                                    style={[
                                        styles.periodChip,
                                        { backgroundColor: colors.elevated, borderColor: colors.border },
                                        period === p && { backgroundColor: `${colors.gold}15`, borderColor: colors.gold },
                                    ]}
                                    onPress={() => setPeriod(p)}
                                >
                                    <Text
                                        style={[
                                            styles.periodText,
                                            { color: colors.textSecondary, fontFamily: fonts.bodySemiBold },
                                            period === p && { color: colors.gold },
                                        ]}
                                    >
                                        {p.replace('d', ' days')}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        {/* Mood Trend Chart */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: fonts.display }]}>Evolving State</Text>
                            <GlassCard style={styles.chartCardWrapper}>
                                <MoodLineChart trends={trends?.mood_trends || []} />
                                <View style={styles.legendRow}>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: colors.gold }]} />
                                        <Text style={[styles.legendText, { color: colors.textSecondary }]}>Mood</Text>
                                    </View>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: colors.emerald }]} />
                                        <Text style={[styles.legendText, { color: colors.textSecondary }]}>Consistency</Text>
                                    </View>
                                </View>
                            </GlassCard>
                        </View>

                        {/* Emotion Distribution */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: fonts.display }]}>Emotional Spectrum</Text>
                            <GlassCard style={styles.chartCardWrapper}>
                                <EmotionDonut distribution={trends?.emotion_distribution || []} />
                            </GlassCard>
                        </View>

                        {/* Streak Correlation */}
                        {trends?.streak_correlation && trends.streak_correlation.improvement_percent > 0 && (
                            <View style={{ marginHorizontal: 24, marginBottom: 24 }}>
                                <GlassCard accent="emerald" elevated={!isDark} shimmer={!isDark} hideGlow={isDark} style={{ padding: 20 }}>
                                    <View style={styles.correlationRow}>
                                        <View style={[styles.correlationIconWrap, { backgroundColor: `${colors.emerald}10` }]}>
                                            <BarChart2 size={24} color={colors.emerald} strokeWidth={1.5} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.correlationText, { color: colors.textPrimary, fontFamily: fonts.body }]}>
                                                Your state improves by{' '}
                                                <Text style={{ color: colors.emerald, fontFamily: fonts.bodySemiBold }}>
                                                    {trends.streak_correlation.improvement_percent}%
                                                </Text>{' '}
                                                with consistent practice.
                                            </Text>
                                        </View>
                                    </View>
                                </GlassCard>
                            </View>
                        )}

                        {/* AI Insights */}
                        {trends?.insights && trends.insights.length > 0 && (
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: fonts.display }]}>Path Insights</Text>
                                {trends.insights.map((insight, i) => (
                                    <InsightCardView key={i} insight={insight} />
                                ))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingBottom: 100 },
    header: {
        alignItems: 'center', paddingVertical: 40,
    },
    avatarCircle: {
        width: 100, height: 100, borderRadius: 50,
        borderWidth: 1,
        alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    },
    title: {
        fontSize: 32,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        opacity: 0.6,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    settingsButton: {
        position: 'absolute',
        top: 40,
        right: 24,
        padding: 8,
    },
    loadingContainer: {
        alignItems: 'center', justifyContent: 'center',
        paddingVertical: 100,
    },
    loadingText: {
        fontSize: 16,
        marginTop: 20,
        opacity: 0.6,
    },
    statsRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingHorizontal: 24, marginBottom: 32,
        gap: 8,
    },
    periodRow: {
        flexDirection: 'row', justifyContent: 'center',
        gap: 12, marginBottom: 32,
    },
    periodChip: {
        paddingHorizontal: 16, paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    periodText: {
        fontSize: 13,
    },
    section: {
        paddingHorizontal: 24, marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 22,
        marginBottom: 20,
    },
    chartCardWrapper: {
        padding: 20,
    },
    legendRow: {
        flexDirection: 'row', justifyContent: 'center',
        gap: 24, marginTop: 16,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: {
        fontSize: 12,
        opacity: 0.7,
    },
    correlationRow: {
        flexDirection: 'row', alignItems: 'center',
        gap: 16,
    },
    correlationIconWrap: {
        width: 44, height: 44, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
    },
    correlationText: {
        fontSize: 15,
        lineHeight: 22,
    },
});

const chartStyles = StyleSheet.create({
    container: {
        width: CHART_WIDTH, position: 'relative',
    },
    empty: {
        height: CHART_HEIGHT, justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.6,
    },
    gridLine: {
        position: 'absolute', left: 0, right: 0,
        flexDirection: 'row', alignItems: 'center',
    },
    yLabel: {
        fontSize: 10,
        width: 16, textAlign: 'right',
        marginRight: 8,
    },
    gridDash: {
        flex: 1, height: 1,
    },
    lineSegment: {
        position: 'absolute', height: 2,
        borderRadius: 1,
    },
    dot: {
        position: 'absolute', width: 8, height: 8,
        borderRadius: 4, borderWidth: 2,
    },
});

const donutStyles = StyleSheet.create({
    container: { paddingVertical: 10 },
    empty: {
        height: 100, justifyContent: 'center', alignItems: 'center',
    },
    bars: { gap: 16 },
    barRow: { gap: 8 },
    labelRow: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
    },
    colorDot: { width: 10, height: 10, borderRadius: 5 },
    label: {
        fontSize: 14,
        flex: 1, textTransform: 'capitalize',
        fontWeight: '500',
    },
    pct: {
        fontSize: 13,
        opacity: 0.6,
    },
    barBg: {
        height: 6,
        borderRadius: 3, overflow: 'hidden',
    },
    barFill: { height: 6, borderRadius: 3 },
});

const statStyles = StyleSheet.create({
    cardWrapper: {
        flex: 1,
    },
    cardInner: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    iconWrap: {
        width: 40, height: 40, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 12,
    },
    value: {
        fontSize: 22,
        fontWeight: '700',
    },
    label: {
        fontSize: 11,
        marginTop: 4, textAlign: 'center',
        opacity: 0.6,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
});

const insightStyles = StyleSheet.create({
    contentRow: {
        flexDirection: 'row', alignItems: 'center',
        gap: 16,
    },
    iconWrap: {
        width: 40, height: 40, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    text: {
        fontSize: 14,
        flex: 1,
        lineHeight: 20,
    },
});

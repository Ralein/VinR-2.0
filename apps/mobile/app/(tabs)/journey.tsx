/**
 * Journey Screen — 21-day streak tracker (redesigned)
 *
 * Uses Lucide icons, ProgressRing, and zero emoji throughout.
 * Replaces emoji milestone badges with vector icon badges.
 * Replaces ✓ checkmark text with Lucide Check icon.
 * Replaces 🔥 streak label with Flame icon inline.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
    FadeIn,
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import {
    Check, Flame, Leaf, Flower, Trophy, CheckCircle2, ChevronRight,
} from 'lucide-react-native';
import { fonts, spacing, borderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { haptics } from '../../services/haptics';
import { useStreakStore } from '../../stores/streakStore';
import { useActiveStreak, useCompleteDay } from '../../hooks/useStreak';
import { MarkCompleteSheet } from '../../components/streaks/MarkCompleteSheet';
import { MilestoneModal } from '../../components/streaks/MilestoneModal';
import ProgressRing from '../../components/ui/ProgressRing';
import GlassCard from '../../components/ui/GlassCard';
import AmbientBackground from '../../components/ui/AmbientBackground';

const TOTAL_DAYS = 21;

function DayCell({ day, status, color }: {
    day: number;
    status: 'completed' | 'today' | 'missed' | 'future';
    color: string;
}) {
    const { colors } = useTheme();
    const pulseOpacity = useSharedValue(1);

    useEffect(() => {
        if (status === 'today') {
            pulseOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.45, { duration: 1000 }),
                    withTiming(1, { duration: 1000 })
                ),
                -1, true
            );
        }
    }, [status]);

    const animatedStyle = useAnimatedStyle(() => {
        if (status === 'today') return { opacity: pulseOpacity.value };
        return {};
    });

    const cellStyle = [
        styles.dayCell,
        status === 'completed' && { backgroundColor: `${color}22`, borderColor: color },
        status === 'today' && { backgroundColor: `${color}0A`, borderColor: color, borderWidth: 2 },
        status === 'missed' && { backgroundColor: `${colors.crimson}08`, borderColor: `${colors.crimson}25` },
        status === 'future' && { backgroundColor: 'transparent', borderColor: colors.border },
    ];

    return (
        <Animated.View style={[cellStyle, status === 'today' && animatedStyle]}>
            {status === 'completed' ? (
                <Check size={13} color={color} strokeWidth={2.5} />
            ) : (
                <Text style={[
                    styles.dayNumber,
                    { color: colors.textMuted },
                    status === 'today' && [styles.dayNumberToday, { color: color }],
                    status === 'future' && { color: colors.textGhost },
                    status === 'missed' && { color: `${colors.crimson}70` },
                ]}>
                    {day}
                </Text>
            )}
        </Animated.View>
    );
}

export default function JourneyScreen() {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();

    const MILESTONES = useMemo(() => [
        { day: 5,  Icon: Leaf,    label: 'Day 5',  color: colors.emerald },
        { day: 10, Icon: Flower,  label: 'Day 10', color: colors.lavender },
        { day: 15, Icon: Flame,   label: 'Day 15', color: colors.gold },
        { day: 21, Icon: Trophy,  label: 'Day 21', color: '#F5C842' },
    ], [colors]);

    const {
        activeStreakId, currentStreak, totalDaysCompleted,
        startDate, dailyCompletions, isCompletedToday, milestone,
        setMilestone,
    } = useStreakStore();

    const { isLoading } = useActiveStreak();
    const completeDay = useCompleteDay();

    const [sheetVisible, setSheetVisible] = useState(false);
    const [milestoneDay, setMilestoneDay] = useState<number | null>(null);

    useEffect(() => {
        if (milestone) {
            const dayMatch = milestone.match(/(\d+)/);
            if (dayMatch) setMilestoneDay(parseInt(dayMatch[1], 10));
        }
    }, [milestone]);

    const dayStatuses = useMemo(() => {
        const completedDays = new Set(dailyCompletions.map((c) => c.dayNumber));
        const statuses: Array<'completed' | 'today' | 'missed' | 'future'> = [];
        for (let i = 1; i <= TOTAL_DAYS; i++) {
            if (completedDays.has(i) || i <= totalDaysCompleted) {
                statuses.push('completed');
            } else if (i === totalDaysCompleted + 1) {
                statuses.push(isCompletedToday ? 'future' : 'today');
            } else if (i < totalDaysCompleted + 1) {
                statuses.push('missed');
            } else {
                statuses.push('future');
            }
        }
        return statuses;
    }, [dailyCompletions, totalDaysCompleted, isCompletedToday]);

    const progress = Math.min(totalDaysCompleted / TOTAL_DAYS, 1);

    const handleMarkComplete = useCallback(() => {
        haptics.medium();
        setSheetVisible(true);
    }, []);

    const handleConfirmComplete = useCallback((reflectionNote: string | null, moodRating: number | null) => {
        setSheetVisible(false);
        if (activeStreakId) {
            completeDay.mutate({ streak_id: activeStreakId, reflection_note: reflectionNote, mood_rating: moodRating });
        }
    }, [activeStreakId, completeDay]);

    const handleDismissMilestone = useCallback(() => {
        setMilestoneDay(null);
        setMilestone(null);
    }, [setMilestone]);

    // Empty state
    if (!isLoading && !activeStreakId) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]} edges={['top']}>
                <AmbientBackground hideBlobs={true} />
                <View style={styles.emptyState}>
                    <Animated.View entering={FadeIn.duration(600)} style={styles.emptyInner}>
                        <View style={[styles.emptyIconWrap, { backgroundColor: `${colors.gold}10`, borderColor: `${colors.gold}30` }]}>
                            <Flame size={52} color={colors.gold} strokeWidth={1.5} fill={`${colors.gold}30`} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Your Journey Awaits</Text>
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                            Complete a check-in and start your 21-day journey to become a winner.
                        </Text>
                        <Pressable
                            style={[styles.emptyButton, { backgroundColor: colors.gold }]}
                            onPress={() => { haptics.light(); router.push('/(tabs)/checkin'); }}
                        >
                            <Text style={[styles.emptyButtonText, { color: colors.void }]}>Start a check-in</Text>
                            <ChevronRight size={16} color={colors.void} strokeWidth={2.2} />
                        </Pressable>
                    </Animated.View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]} edges={['top']}>
            <AmbientBackground hideBlobs={true} />
            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
                showsVerticalScrollIndicator={false}
            >

                {/* Streak Header */}
                <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                    <GlassCard accent="gold" elevated shimmer noAnimation noBorder={!isDark}>
                        <View style={styles.streakCard}>
                            <View style={styles.streakLeft}>
                                <Text style={[styles.streakCount, { color: colors.gold }]}>{currentStreak}</Text>
                                <View style={styles.streakLabelRow}>
                                    <Text style={[styles.streakLabel, { color: colors.textMuted }]}>day streak</Text>
                                    <Flame size={16} color={colors.gold} fill={`${colors.gold}40`} strokeWidth={1.5} />
                                </View>
                                {startDate && (
                                    <Text style={[styles.startDate, { color: colors.textGhost }]}>Started {startDate}</Text>
                                )}
                            </View>
                            <ProgressRing
                                progress={progress}
                                size={88}
                                strokeWidth={7}
                                variant="gold"
                                label={`${totalDaysCompleted}/${TOTAL_DAYS}`}
                                sublabel="days done"
                            />
                        </View>
                    </GlassCard>
                </Animated.View>

                {/* 21-Day Grid */}
                <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
                    <Text style={[styles.gridTitle, { color: colors.textMuted }]}>21-Day Progress</Text>
                    <View style={styles.dayGrid}>
                        {dayStatuses.map((status, index) => (
                            <DayCell key={index} day={index + 1} status={status} color={colors.gold} />
                        ))}
                    </View>
                </Animated.View>

                {/* Milestone Badges */}
                <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.milestonesRow}>
                    {MILESTONES.map((m) => {
                        const unlocked = totalDaysCompleted >= m.day;
                        const { Icon } = m;
                        return (
                            <View key={m.day} style={[
                                styles.milestoneBadge,
                                { 
                                    borderColor: isDark ? colors.border : 'transparent',
                                    backgroundColor: isDark ? 'transparent' : colors.elevated 
                                },
                                unlocked && { borderColor: m.color, backgroundColor: `${m.color}10` },
                            ]}>
                                <View style={[
                                    styles.milestoneIconWrap,
                                    { backgroundColor: `${m.color}${unlocked ? '22' : '0A'}` },
                                ]}>
                                    <Icon
                                        size={20}
                                        color={unlocked ? m.color : colors.textGhost}
                                        strokeWidth={unlocked ? 2 : 1.5}
                                    />
                                </View>
                                <Text style={[
                                    styles.milestoneLabel,
                                    { color: colors.textGhost },
                                    unlocked && { color: m.color, fontFamily: fonts.bodySemiBold },
                                ]}>
                                    {m.label}
                                </Text>
                            </View>
                        );
                    })}
                </Animated.View>

                {/* Mark Complete CTA */}
                {!isCompletedToday && activeStreakId && (
                    <Animated.View entering={FadeInDown.delay(700).duration(400)}>
                        <Pressable style={[styles.markButton, { backgroundColor: colors.emerald, shadowColor: colors.emerald }]} onPress={handleMarkComplete}>
                            <CheckCircle2 size={20} color="#FFFFFF" strokeWidth={2} />
                            <Text style={styles.markButtonText}>Mark today complete</Text>
                        </Pressable>
                    </Animated.View>
                )}

                {isCompletedToday && (
                    <Animated.View entering={FadeIn.delay(200).duration(400)} style={[styles.completedBanner, { backgroundColor: `${colors.emerald}0F`, borderColor: `${colors.emerald}28` }]}>
                        <CheckCircle2 size={24} color={colors.emerald} strokeWidth={2} />
                        <Text style={[styles.completedText, { color: colors.emerald }]}>Today is done! See you tomorrow.</Text>
                    </Animated.View>
                )}
            </ScrollView>

            <MarkCompleteSheet
                visible={sheetVisible}
                onConfirm={handleConfirmComplete}
                onClose={() => setSheetVisible(false)}
            />
            <MilestoneModal
                day={milestoneDay}
                visible={milestoneDay !== null}
                onDismiss={handleDismissMilestone}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    emptyInner: { alignItems: 'center' },
    emptyIconWrap: {
        width: 88, height: 88, borderRadius: 44,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 24,
        borderWidth: 1,
    },
    emptyTitle: {
        fontFamily: fonts.display, fontSize: 28,
        textAlign: 'center', marginBottom: 12,
    },
    emptyText: {
        fontFamily: fonts.body, fontSize: 15,
        textAlign: 'center', lineHeight: 24, marginBottom: 28,
    },
    emptyButton: {
        borderRadius: borderRadius.md,
        paddingVertical: 16, paddingHorizontal: 32,
        flexDirection: 'row', alignItems: 'center', gap: 8,
    },
    emptyButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 16 },
    // Streak Card
    section: { marginTop: spacing.lg },
    streakCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    streakLeft: { flex: 1 },
    streakCount: {
        fontFamily: fonts.displayBlack, fontSize: 64,
        lineHeight: 70, letterSpacing: -2,
    },
    streakLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: -4 },
    streakLabel: { fontFamily: fonts.body, fontSize: 16 },
    startDate: { fontFamily: fonts.bodyLight, fontSize: 12, marginTop: 4 },
    // Grid
    gridTitle: {
        fontFamily: fonts.bodySemiBold, fontSize: 14,
        marginBottom: 14, letterSpacing: 0.5, textTransform: 'uppercase',
    },
    dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
    dayCell: {
        width: '12%', aspectRatio: 1,
        borderRadius: 10, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1.5,
    },
    dayNumber: { fontFamily: fonts.body, fontSize: 11 },
    dayNumberToday: { fontFamily: fonts.bodySemiBold },
    // Milestones
    milestonesRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        marginTop: spacing.lg, marginBottom: spacing.lg,
    },
    milestoneBadge: {
        alignItems: 'center', gap: 6, padding: 10,
        borderRadius: borderRadius.md, borderWidth: 1.5,
        flex: 1, marginHorizontal: 3,
    },
    milestoneIconWrap: {
        width: 36, height: 36, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
    },
    milestoneLabel: { fontFamily: fonts.body, fontSize: 11 },
    // Mark Complete
    markButton: {
        borderRadius: borderRadius.md,
        paddingVertical: 18, alignItems: 'center', justifyContent: 'center',
        flexDirection: 'row', gap: 10,
        shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
    },
    markButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 17, color: '#FFFFFF', letterSpacing: 0.3 },
    // Completed
    completedBanner: {
        borderRadius: borderRadius.md, padding: 20,
        flexDirection: 'row', alignItems: 'center',
        gap: 12, borderWidth: 1,
    },
    completedText: { fontFamily: fonts.body, fontSize: 15, flex: 1 },
});

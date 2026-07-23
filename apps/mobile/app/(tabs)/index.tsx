/**
 * Home / Dashboard v3 — Premium animated home screen
 *
 * - Date chip + time-based greeting with staggered FadeInDown
 * - Daily quote pill (italic, Cormorant font)
 * - Streak hero with glowing gold card
 * - Adaptive nudge cards with spring entrance
 * - AudioCategoryCard: now uses Icon prop (no emoji)
 * - Every section staggered for cinematic entrance
 * - Zero emoji — all icons are Lucide vector
 */

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeIn, FadeInUp, SlideInRight } from 'react-native-reanimated';
import {
    Moon, ChevronRight, Calendar, MapPin,
    Activity, Brain, Sparkles, Wind, Heart, Quote,
    CalendarDays, LogOut, MessageCircle, Flame, BookOpen
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { fonts, spacing, borderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useStreak } from '../../hooks/useStreak';
import { useAdaptiveHome } from '../../hooks/useAdaptive';
import { useEventSearch, useUserLocation } from '../../hooks/useEvents';

import SleepMode from '../../components/media/SleepMode';
import GlassCard from '../../components/ui/GlassCard';
import GoldButton from '../../components/ui/GoldButton';
import AvatarRing from '../../components/ui/AvatarRing';
import SectionHeader from '../../components/ui/SectionHeader';
import StreakHero from '../../components/ui/StreakHero';
import NudgeCard from '../../components/ui/NudgeCard';
import EventsList from '../../components/events/EventsList';
import AmbientBackground from '../../components/ui/AmbientBackground';

// ── Utilities ──────────────────────────────────────────────

function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 5)  return 'Late night';
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

function getDateChip(): string {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
    });
}

const DAILY_QUOTES = [
    'Small steps every day lead to seismic change.',
    'Healing is not linear — every moment counts.',
    'You showed up today. That already matters.',
    'Be patient and gentle with yourself.',
    'Progress, not perfection.',
] as const;

function getDailyQuote() {
    const day = new Date().getDate();
    return DAILY_QUOTES[day % DAILY_QUOTES.length];
}

// ── Nudge icon map ──────────────────────────────────────────

const NUDGE_ICON_MAP: Record<string, any> = {
    therapist_directory: Brain,
    journal: BookOpen,
    journey: Activity,
    breathing: Wind,
    affirmation: Sparkles,
    buddy: MessageCircle,
    default: Heart,
};



// ── Main Component ─────────────────────────────────────────

export default function HomeScreen() {
    const { colors, isDark } = useTheme();
    const [showSleepMode, setShowSleepMode] = useState(false);
    const { streak, todayDone, weeklyDays } = useStreak();
    const { data: adaptiveData } = useAdaptiveHome();
    const { location: userLocation } = useUserLocation();
    const { data: eventsData, isLoading: eventsLoading } = useEventSearch(
        userLocation?.latitude ?? null,
        userLocation?.longitude ?? null,
    );
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]}>
            <AmbientBackground hideBlobs={true} />
            <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]} showsVerticalScrollIndicator={false}>

                {/* ── Header ───────────────────────────────── */}
                <Animated.View entering={FadeIn.duration(350)} style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                        {/* Date chip */}
                        <View style={[styles.dateChip, { backgroundColor: `${colors.gold}10`, borderColor: `${colors.gold}20` }]}>
                            <CalendarDays size={11} color={colors.gold} strokeWidth={2} />
                            <Text style={[styles.dateChipText, { color: colors.gold }]}>{getDateChip()}</Text>
                        </View>
                        <Text style={[styles.greeting, { color: colors.textGhost, opacity: 1 }]}>{getGreeting()}</Text>
                        <Animated.Text
                            entering={FadeInDown.delay(80).duration(450)}
                            style={[styles.welcomeName, { color: colors.textPrimary }]}
                        >
                            Welcome to VinR
                        </Animated.Text>
                    </View>
                    <Animated.View entering={FadeIn.delay(150).duration(400)} style={{ alignItems: 'center' }}>
                        <AvatarRing initials="VR" size={48} pulse style={{ marginTop: 6 }} />
                        <Pressable onPress={() => useAuthStore.getState().signOut()} style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <LogOut size={12} color={colors.crimson} />
                            <Text style={{ color: colors.crimson, fontSize: 10, fontFamily: fonts.bodySemiBold }}>Sign Out</Text>
                        </Pressable>
                    </Animated.View>
                </Animated.View>

                {/* ── Daily Quote ────────────────────────────── */}
                <Animated.View entering={FadeInDown.delay(160).duration(420)} style={[styles.quoteCard, { backgroundColor: `${colors.gold}08`, borderColor: `${colors.gold}15` }]}>
                    <Quote size={14} color={colors.gold} strokeWidth={1.8} style={{ opacity: 0.7 }} />
                    <Text style={[styles.quoteText, { color: colors.textSecondary }]}>{getDailyQuote()}</Text>
                </Animated.View>

                {/* ── Streak Hero ───────────────────────────── */}
                <Animated.View entering={FadeInDown.delay(240).duration(480)}>
                    <GlassCard accent="gold" elevated shimmer glow>
                        <StreakHero
                            streak={streak}
                            todayDone={todayDone}
                            weeklyDays={weeklyDays}
                        />
                    </GlassCard>
                </Animated.View>

                {/* ── Adaptive Nudge Cards ──────────────────── */}
                {adaptiveData?.nudge_cards && adaptiveData.nudge_cards.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(320).duration(480)} style={styles.section}>
                        <SectionHeader title="For You" Icon={Sparkles} iconColor={colors.gold} delay={0} />
                        {adaptiveData.nudge_cards.map((card: any, i: number) => {
                            const IconComp = NUDGE_ICON_MAP[card.action] ?? NUDGE_ICON_MAP.default;
                            const isTherapist = card.type === 'therapist';
                            return (
                                <NudgeCard
                                    key={i}
                                    title={card.title}
                                    message={card.message}
                                    Icon={IconComp}
                                    accent={isTherapist ? 'sapphire' : 'gold'}
                                    delay={i * 60}
                                    onPress={() => {
                                        if (card.action === 'therapist_directory') router.push('/therapist');
                                        else if (card.action === 'journey' || card.action === 'journal') router.push('/(tabs)/journal');
                                        else if (card.action === 'buddy') router.push('/buddy/chat');
                                    }}
                                />
                            );
                        })}
                    </Animated.View>
                )}

                {/* ── VinR Buddy Promo ──────────────────────── */}
                <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.section}>
                    <SectionHeader title="Your AI Companion" Icon={MessageCircle} iconColor={colors.lavender} delay={0} />
                    <Pressable onPress={() => router.push('/buddy/chat')}>
                        <GlassCard noAnimation accent="lavender">
                            <View style={styles.habitRow}>
                                <View style={[styles.habitIconWrap, { backgroundColor: `${colors.lavender}15` }]}>
                                    <Sparkles size={22} color={colors.lavender} strokeWidth={1.8} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.habitTitle, { color: colors.textPrimary }]}>Talk to VinR Buddy</Text>
                                    <Text style={[styles.habitText, { color: colors.textMuted }]}>
                                        I'm always here to listen. Share what's on your mind.
                                    </Text>
                                </View>
                                <ChevronRight size={16} color={colors.textGhost} strokeWidth={1.5} />
                            </View>
                        </GlassCard>
                    </Pressable>
                </Animated.View>

                {/* ── How are you feeling? ──────────────────── */}
                <Animated.View entering={FadeInDown.delay(480).duration(400)} style={styles.section}>
                    <SectionHeader title="How Are You Feeling?" Icon={Heart} iconColor={colors.crimson} delay={0} />
                    <GoldButton label="Start a Check-In" onPress={() => router.push('/(tabs)/checkin')} />
                </Animated.View>

                {/* ── Daily Gratitude Journal ────────────────────── */}
                <Animated.View entering={FadeInDown.delay(560).duration(400)} style={styles.section}>
                    <SectionHeader title="Gratitude Journal" Icon={BookOpen} iconColor={colors.gold} delay={0} />
                    <Pressable onPress={() => router.push('/(tabs)/journal')}>
                        <GlassCard accent="gold" elevated={isDark} shimmer={isDark} noAnimation noBorder={!isDark} hideGlow={!isDark}>
                            <View style={styles.journeyCard}>
                                <View style={[styles.journeyIconWrap, { backgroundColor: `${colors.gold}15`, borderColor: `${colors.gold}30` }]}>
                                    <BookOpen size={28} color={colors.gold} strokeWidth={1.8} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.journeyTitle, { color: colors.textPrimary }]}>
                                        Daily Gratitude
                                    </Text>
                                    <Text style={[styles.journeyStreak, { color: colors.gold }]}>
                                        Reflect & Grow
                                    </Text>
                                    <Text style={[styles.journeyText, { color: colors.textMuted }]}>
                                        Document your daily wins and positive moments.
                                    </Text>
                                </View>
                                <ChevronRight size={18} color={colors.gold} strokeWidth={2} />
                            </View>
                        </GlassCard>
                    </Pressable>
                </Animated.View>

                {/* ── Events Near You ─────────────────────────── */}
                <Animated.View entering={FadeInDown.delay(640).duration(400)} style={styles.section}>
                    <SectionHeader title="Events Near You" Icon={Calendar} iconColor={colors.emerald} delay={0} />
                    <View style={styles.eventsContainer}>
                        <EventsList
                            events={(eventsData?.events || []).slice(0, 3)}
                            isLoading={eventsLoading}
                            scrollEnabled={false}
                        />
                        {eventsData?.events && eventsData.events.length > 3 && (
                            <Pressable
                                onPress={() => router.push('/(tabs)/events')}
                                style={[styles.seeAllButton, { borderColor: `${colors.emerald}30` }]}
                            >
                                <Text style={[styles.seeAllText, { color: colors.emerald }]}>See all events</Text>
                                <ChevronRight size={14} color={colors.emerald} strokeWidth={2} />
                            </Pressable>
                        )}
                    </View>
                </Animated.View>



                {/* ── Sleep Mode ────────────────────────────── */}
                <Animated.View entering={FadeInDown.delay(880).duration(400)} style={styles.section}>
                    <GlassCard accent="sapphire" shimmer onPress={() => setShowSleepMode(true)}>
                        <View style={styles.sleepRow}>
                            <View style={[styles.sleepIconWrap, { backgroundColor: `${colors.sapphire}15` }]}>
                                <Moon size={24} color={colors.sapphire} strokeWidth={1.8} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.sleepTitle, { color: colors.textPrimary }]}>Sleep Mode</Text>
                                <Text style={[styles.sleepSubtitle, { color: colors.textMuted }]}>Dim lights · breathing · auto-stop</Text>
                            </View>
                            <ChevronRight size={18} color={colors.textGhost} strokeWidth={1.5} />
                        </View>
                    </GlassCard>
                </Animated.View>

            </ScrollView>

            <SleepMode visible={showSleepMode} onClose={() => setShowSleepMode(false)} />
        </SafeAreaView>
    );
}

// ── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
    },
    // Header
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    headerLeft: { flex: 1 },
    dateChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderRadius: borderRadius.full,
        paddingHorizontal: 10,
        paddingVertical: 4,
        alignSelf: 'flex-start',
        marginBottom: 8,
        borderWidth: 1,
    },
    dateChipText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 10.5,
        letterSpacing: 0.3,
    },
    greeting: {
        fontFamily: fonts.bodyLight,
        fontSize: 12,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    welcomeName: {
        fontFamily: fonts.display,
        fontSize: 26,
        marginTop: 3,
        lineHeight: 32,
    },
    // Quote
    quoteCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 4,
        marginBottom: spacing.lg,
        marginTop: spacing.sm,
    },
    quoteText: {
        fontFamily: fonts.italic,
        fontSize: 14,
        lineHeight: 20,
        flex: 1,
        fontStyle: 'italic',
    },
    // Sections
    section: { marginTop: spacing.lg },
    // Habit
    habitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    habitIconWrap: {
        width: 44, height: 44, borderRadius: 22,
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    habitTitle: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 14,
        marginBottom: 2,
    },
    habitText: {
        fontFamily: fonts.body,
        fontSize: 13,
        lineHeight: 18,
    },
    // Journey Card
    journeyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    journeyIconWrap: {
        width: 52, height: 52, borderRadius: 26,
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        borderWidth: 1,
    },
    journeyTitle: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 16,
        marginBottom: 2,
    },
    journeyStreak: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 12,
        marginBottom: 3,
    },
    journeyText: {
        fontFamily: fonts.body,
        fontSize: 13,
        lineHeight: 18,
    },
    // Events
    eventsContainer: {
        marginTop: 4,
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 14,
        borderTopWidth: 1,
        marginTop: 8,
    },
    seeAllText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 13,
        letterSpacing: 0.3,
    },
    // Sleep
    sleepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    sleepIconWrap: {
        width: 44, height: 44, borderRadius: 22,
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    sleepTitle: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 16,
    },
    sleepSubtitle: {
        fontFamily: fonts.body,
        fontSize: 12,
        marginTop: 1,
    },
});

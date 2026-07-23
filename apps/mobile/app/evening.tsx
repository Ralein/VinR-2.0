/**
 * Evening Wind-Down Screen — Premium animated experience
 *
 * Features:
 * - Full useTheme() light/dark support
 * - Mood Tap (1–5 with Lucide icons)
 * - Gratitude prompt card
 * - Sleep sounds quick links
 * - 4-7-8 Breathing card
 * - Streak banner
 * - Habit check (done / tomorrow)
 * - All Lucide icons, zero emoji
 */

import { useState } from 'react';
import {
    View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
    FadeIn, FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';
import {
    ChevronLeft, Moon, Frown, Meh, Smile, SmilePlus, Star,
    Wind, Brain, Headphones, CheckCircle, RefreshCw,
    Quote, Flame, Sparkles, AlarmClock, CloudMoon,
    Music, Volume2, Waves, TreePine,
} from 'lucide-react-native';
import { fonts, spacing, borderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useEveningWindDown } from '../hooks/useRituals';
import AmbientBackground from '../components/ui/AmbientBackground';
import { haptics } from '../services/haptics';

// ── Types ──

interface MoodOption {
    score: number;
    Icon: any;
    label: string;
    color: string;
}

const MOOD_OPTIONS: MoodOption[] = [
    { score: 1, Icon: Frown,     label: 'Rough',  color: '#E05C5C' },
    { score: 2, Icon: Meh,       label: 'Meh',    color: '#D4A853' },
    { score: 3, Icon: Smile,     label: 'Okay',   color: '#4DB6A9' },
    { score: 4, Icon: SmilePlus, label: 'Good',    color: '#5B8CF5' },
    { score: 5, Icon: Star,      label: 'Great',   color: '#B07FE0' },
];

interface SleepSound {
    name: string;
    Icon: any;
    color: string;
    query: string;
}

const SLEEP_SOUNDS: SleepSound[] = [
    { name: 'Rain',    Icon: Waves,    color: '#4A90D9', query: 'rain sounds sleep' },
    { name: 'Nature',  Icon: TreePine, color: '#4ECBA0', query: 'forest nature sounds' },
    { name: 'Lo-fi',   Icon: Music,    color: '#B07FE0', query: 'lofi sleep music' },
    { name: 'White Noise', Icon: Volume2, color: '#D4A853', query: 'white noise sleep' },
];

// ── Mood chip ──

function MoodChip({ option, selected, onPress }: {
    option: MoodOption; selected: boolean; onPress: () => void;
}) {
    const { colors, isDark } = useTheme();
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(scale.value, { stiffness: 320, damping: 18 }) }],
    }));
    const { Icon } = option;

    return (
        <Pressable
            onPressIn={() => { scale.value = 0.92; }}
            onPressOut={() => { scale.value = 1; }}
            onPress={onPress}
            style={{ flex: 1 }}
        >
            <Animated.View
                style={[
                    styles.moodChip,
                    {
                        backgroundColor: isDark ? colors.surface : '#FAF8F4',
                        borderColor: selected ? option.color : (isDark ? colors.border : '#E8E1D0'),
                    },
                    selected && { backgroundColor: `${option.color}15` },
                    animStyle,
                ]}
            >
                <Icon
                    size={22}
                    color={selected ? option.color : colors.textGhost}
                    strokeWidth={1.8}
                />
                <Text style={[styles.moodLabel, {
                    color: selected ? option.color : colors.textGhost,
                    fontFamily: selected ? fonts.bodySemiBold : fonts.body,
                }]}>
                    {option.label}
                </Text>
            </Animated.View>
        </Pressable>
    );
}

// ── Breathing card ──

function BreathingCard({ name, instructions, onPress }: {
    name: string; instructions?: string; onPress: () => void;
}) {
    const { colors, isDark } = useTheme();
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(scale.value, { stiffness: 300, damping: 20 }) }],
    }));

    return (
        <Pressable
            onPressIn={() => { scale.value = 0.98; }}
            onPressOut={() => { scale.value = 1; }}
            onPress={onPress}
        >
            <Animated.View style={[styles.breathingCard, {
                backgroundColor: isDark ? colors.surface : '#FAF8F4',
                borderColor: isDark ? `${colors.sapphire}25` : `${colors.sapphire}18`,
            }, animStyle]}>
                <View style={[styles.breathingCircle, {
                    backgroundColor: `${colors.sapphire}12`,
                    borderColor: `${colors.sapphire}35`,
                }]}>
                    <Wind size={20} color={colors.sapphire} strokeWidth={1.8} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.breathingName, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>{name}</Text>
                    {instructions ? (
                        <Text style={[styles.breathingDesc, { color: colors.textMuted, fontFamily: fonts.body }]} numberOfLines={2}>
                            {instructions}
                        </Text>
                    ) : null}
                </View>
                <View style={[styles.breathingBadge, { backgroundColor: `${colors.sapphire}12` }]}>
                    <AlarmClock size={11} color={colors.sapphire} strokeWidth={2} />
                    <Text style={[styles.breathingBadgeText, { color: colors.sapphire, fontFamily: fonts.bodySemiBold }]}>5 min</Text>
                </View>
            </Animated.View>
        </Pressable>
    );
}

// ── Main Screen ──

export default function EveningScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { data, isLoading, error } = useEveningWindDown();
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [habitDone, setHabitDone] = useState<boolean | null>(null);

    const handleSleepSoundPress = (sound: SleepSound) => {
        haptics.light();
        Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(sound.query)}`);
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.gold} />
                    <Text style={[styles.loadingText, { color: colors.textMuted, fontFamily: fonts.body }]}>
                        Preparing your wind-down...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]}>
            <AmbientBackground hideBlobs={true} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
                    <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                        <ChevronLeft size={20} color={colors.gold} strokeWidth={2} />
                    </Pressable>

                    <View style={styles.headerHero}>
                        <View style={[styles.moonCircle, {
                            backgroundColor: `${colors.sapphire}15`,
                            borderColor: `${colors.sapphire}30`,
                            shadowColor: colors.sapphire,
                        }]}>
                            <Moon size={28} color={colors.sapphire} strokeWidth={1.5} />
                        </View>
                        <Text style={[styles.greeting, { color: colors.textPrimary, fontFamily: fonts.display }]}>
                            {data?.greeting ?? 'Good evening.'}
                        </Text>
                        <Text style={[styles.subtitleText, { color: colors.textMuted, fontFamily: fonts.body }]}>
                            Time to wind down.
                        </Text>
                    </View>
                </Animated.View>

                {/* Mood Tap */}
                <Animated.View entering={FadeInDown.delay(120).duration(500)} style={styles.section}>
                    <View style={styles.sectionLabelRow}>
                        <Sparkles size={13} color={colors.gold} strokeWidth={2} />
                        <Text style={[styles.sectionLabel, { color: colors.gold, fontFamily: fonts.bodySemiBold }]}>
                            HOW DID YOUR DAY GO?
                        </Text>
                    </View>
                    <View style={styles.moodRow}>
                        {MOOD_OPTIONS.map((opt) => (
                            <MoodChip
                                key={opt.score}
                                option={opt}
                                selected={selectedMood === opt.score}
                                onPress={() => { haptics.light(); setSelectedMood(opt.score); }}
                            />
                        ))}
                    </View>
                </Animated.View>

                {/* Gratitude Prompt */}
                <Animated.View entering={FadeInDown.delay(220).duration(500)} style={styles.section}>
                    <View style={[styles.gratitudeCard, {
                        backgroundColor: isDark ? colors.surface : '#FAF8F4',
                        borderColor: isDark ? `${colors.gold}20` : `${colors.gold}15`,
                    }]}>
                        <View style={styles.gratitudeLabelRow}>
                            <Quote size={13} color={colors.gold} strokeWidth={2} />
                            <Text style={[styles.gratitudeLabel, { color: colors.gold, fontFamily: fonts.bodySemiBold }]}>
                                TONIGHT'S REFLECTION
                            </Text>
                        </View>
                        <Text style={[styles.gratitudePrompt, {
                            color: colors.textPrimary,
                            fontFamily: fonts.body,
                            fontStyle: 'italic',
                        }]}>
                            {data?.gratitude_prompt ?? 'What went well today, even if it was small?'}
                        </Text>
                    </View>
                </Animated.View>

                {/* Sleep Sounds */}
                <Animated.View entering={FadeInDown.delay(320).duration(500)} style={styles.section}>
                    <View style={styles.sectionLabelRow}>
                        <CloudMoon size={13} color={colors.sapphire} strokeWidth={2} />
                        <Text style={[styles.sectionLabel, { color: colors.sapphire, fontFamily: fonts.bodySemiBold }]}>
                            SLEEP SOUNDS
                        </Text>
                    </View>
                    <View style={styles.soundsRow}>
                        {SLEEP_SOUNDS.map((sound, index) => {
                            const SoundIcon = sound.Icon;
                            return (
                                <Pressable
                                    key={sound.name}
                                    style={[styles.soundCard, {
                                        backgroundColor: isDark ? colors.surface : '#FAF8F4',
                                        borderColor: isDark ? colors.border : '#E8E1D0',
                                    }]}
                                    onPress={() => handleSleepSoundPress(sound)}
                                >
                                    <View style={[styles.soundIconWrap, {
                                        backgroundColor: `${sound.color}12`,
                                        borderColor: `${sound.color}30`,
                                    }]}>
                                        <SoundIcon size={18} color={sound.color} strokeWidth={1.5} />
                                    </View>
                                    <Text style={[styles.soundLabel, {
                                        color: colors.textMuted,
                                        fontFamily: fonts.body,
                                    }]}>{sound.name}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </Animated.View>

                {/* Breathing Exercise */}
                <Animated.View entering={FadeInDown.delay(420).duration(500)} style={styles.section}>
                    <View style={styles.sectionLabelRow}>
                        <Wind size={13} color={colors.sapphire} strokeWidth={2} />
                        <Text style={[styles.sectionLabel, { color: colors.sapphire, fontFamily: fonts.bodySemiBold }]}>
                            SLEEP BREATHING
                        </Text>
                    </View>
                    <BreathingCard
                        name={data?.breathing_suggestion?.name ?? '4-7-8 Sleep Breath'}
                        instructions={data?.breathing_suggestion?.instructions}
                        onPress={() => router.push('/breathing')}
                    />
                </Animated.View>

                {/* Habit Check */}
                <Animated.View entering={FadeInDown.delay(520).duration(500)} style={styles.section}>
                    <View style={styles.sectionLabelRow}>
                        <CheckCircle size={13} color={colors.emerald} strokeWidth={2} />
                        <Text style={[styles.sectionLabel, { color: colors.emerald, fontFamily: fonts.bodySemiBold }]}>
                            TODAY'S HABIT
                        </Text>
                    </View>
                    <View style={styles.habitRow}>
                        <Pressable
                            style={[styles.habitBtn, {
                                backgroundColor: isDark ? colors.surface : '#FAF8F4',
                                borderColor: habitDone === true ? colors.emerald : (isDark ? colors.border : '#E8E1D0'),
                            },
                            habitDone === true && { backgroundColor: `${colors.emerald}10` },
                            ]}
                            onPress={() => { haptics.light(); setHabitDone(true); }}
                        >
                            <CheckCircle
                                size={18}
                                color={habitDone === true ? colors.emerald : colors.textGhost}
                                strokeWidth={2}
                            />
                            <Text style={[styles.habitBtnText, {
                                color: habitDone === true ? colors.emerald : colors.textMuted,
                                fontFamily: fonts.bodySemiBold,
                            }]}>
                                Yes, I did it!
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[styles.habitBtn, {
                                backgroundColor: isDark ? colors.surface : '#FAF8F4',
                                borderColor: habitDone === false ? `${colors.gold}60` : (isDark ? colors.border : '#E8E1D0'),
                            },
                            habitDone === false && { backgroundColor: `${colors.gold}08` },
                            ]}
                            onPress={() => { haptics.light(); setHabitDone(false); }}
                        >
                            <RefreshCw
                                size={18}
                                color={habitDone === false ? colors.gold : colors.textGhost}
                                strokeWidth={2}
                            />
                            <Text style={[styles.habitBtnText, {
                                color: habitDone === false ? colors.gold : colors.textMuted,
                                fontFamily: fonts.bodySemiBold,
                            }]}>
                                Tomorrow
                            </Text>
                        </Pressable>
                    </View>
                </Animated.View>

                {/* Streak Banner */}
                {(data?.current_streak ?? 0) > 0 && (
                    <Animated.View entering={FadeInUp.delay(600).duration(500)}
                        style={[styles.streakBanner, {
                            backgroundColor: `${colors.gold}08`,
                            borderColor: `${colors.gold}20`,
                        }]}
                    >
                        <Flame size={18} color={colors.gold} strokeWidth={2} />
                        <Text style={[styles.streakText, {
                            color: colors.textMuted,
                            fontFamily: fonts.body,
                            fontStyle: 'italic',
                        }]}>
                            {data!.current_streak} day streak — rest well, champion.
                        </Text>
                    </Animated.View>
                )}

                {/* Error state */}
                {error && !data && (
                    <Animated.View entering={FadeIn.duration(400)}
                        style={[styles.errorCard, {
                            backgroundColor: `${colors.crimson}10`,
                            borderColor: `${colors.crimson}25`,
                        }]}
                    >
                        <Text style={[styles.errorText, { color: colors.crimson, fontFamily: fonts.body }]}>
                            Unable to load your wind-down. Check your connection.
                        </Text>
                    </Animated.View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// ── Styles ──

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingBottom: 100 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
    loadingText: { fontSize: 14 },
    // Header
    header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.lg },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    headerHero: { alignItems: 'center', gap: spacing.sm },
    moonCircle: {
        width: 64, height: 64, borderRadius: 32,
        borderWidth: 1, alignItems: 'center', justifyContent: 'center',
        marginBottom: spacing.sm,
        shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 6,
    },
    greeting: { fontSize: 30, textAlign: 'center' },
    subtitleText: { fontSize: 15, textAlign: 'center' },
    // Sections
    section: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
    sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md },
    sectionLabel: { fontSize: 11, letterSpacing: 1.4 },
    // Mood
    moodRow: { flexDirection: 'row', gap: spacing.xs },
    moodChip: {
        alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: 4,
        borderRadius: borderRadius.md, borderWidth: 1, gap: 5,
    },
    moodLabel: { fontSize: 10 },
    // Gratitude
    gratitudeCard: {
        borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1,
    },
    gratitudeLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
    gratitudeLabel: { fontSize: 11, letterSpacing: 1.4 },
    gratitudePrompt: { fontSize: 18, lineHeight: 27 },
    // Sleep sounds
    soundsRow: { flexDirection: 'row', gap: spacing.sm },
    soundCard: {
        flex: 1, alignItems: 'center', gap: 8,
        paddingVertical: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1,
    },
    soundIconWrap: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1,
    },
    soundLabel: { fontSize: 11 },
    // Breathing
    breathingCard: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: borderRadius.lg, padding: spacing.md, borderWidth: 1, gap: spacing.md,
    },
    breathingCircle: {
        width: 48, height: 48, borderRadius: 24,
        borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
    },
    breathingName: { fontSize: 15 },
    breathingDesc: { fontSize: 12, marginTop: 3 },
    breathingBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: borderRadius.sm,
    },
    breathingBadgeText: { fontSize: 11 },
    // Habit check
    habitRow: { flexDirection: 'row', gap: spacing.md },
    habitBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: spacing.sm, borderRadius: borderRadius.md, paddingVertical: spacing.md,
        borderWidth: 1,
    },
    habitBtnText: { fontSize: 13 },
    // Streak banner
    streakBanner: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: spacing.sm, marginHorizontal: spacing.lg, marginBottom: spacing.lg,
        paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg, borderWidth: 1,
    },
    streakText: { fontSize: 14 },
    // Error
    errorCard: {
        marginHorizontal: spacing.lg, padding: spacing.lg,
        borderRadius: borderRadius.md, borderWidth: 1,
    },
    errorText: { fontSize: 13, textAlign: 'center' },
});

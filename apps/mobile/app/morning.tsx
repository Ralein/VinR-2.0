/**
 * Morning Ritual Screen — Time-aware greeting, affirmation, habits, breathing
 *
 * Accessible 6–10 AM via Home navigation
 */

import { useState } from 'react';
import {
    View, Text, ScrollView, Pressable, StyleSheet,
    ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Flame, Target, Wind, Sun, ChevronRight } from 'lucide-react-native';
import { colors, fonts, spacing, glass, typography, borderRadius, animation, shadows, gradients } from '../constants/theme';
import { useMorningRitual } from '../hooks/useRituals';

export default function MorningScreen() {
    const router = useRouter();
    const { data, isLoading } = useMorningRitual();
    const [gratitude, setGratitude] = useState(['', '', '']);

    const updateGratitude = (index: number, value: string) => {
        const updated = [...gratitude];
        updated[index] = value;
        setGratitude(updated);
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.gold} />
                    <Text style={styles.loadingText}>Preparing your morning...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backText}>← Back</Text>
                </Pressable>

                {/* Greeting */}
                <Text style={styles.greeting}>{data?.greeting || 'Good morning.'}</Text>
                <Text style={styles.subtitle}>Let's set the tone for today</Text>

                {/* Affirmation */}
                <View style={styles.affirmationCard}>
                    <Text style={styles.affirmationLabel}>Today's Affirmation</Text>
                    <Text style={styles.affirmationText}>
                        "{data?.affirmation || 'I am worthy of good things.'}"
                    </Text>
                    <Pressable style={styles.playButton}>
                        <Text style={styles.playButtonText}>▶ Listen</Text>
                    </Pressable>
                </View>

                {/* Streak Status */}
                {data?.streak_status && (
                    <View style={styles.streakCard}>
                        <View style={styles.streakIconWrap}>
                            <Flame size={22} color={colors.emerald} fill={colors.emerald} strokeWidth={1.5} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.streakTitle}>
                                Day {data.streak_status.current_streak}
                            </Text>
                            <Text style={styles.streakMessage}>
                                {data.streak_status.message}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Today's Daily Habit */}
                {data?.daily_habit && (
                    <View style={styles.habitCard}>
                        <Text style={styles.sectionTitle}>Today's Habit</Text>
                        <View style={styles.habitContent}>
                            <View style={styles.habitIconWrap}>
                                <Target size={22} color={colors.gold} strokeWidth={1.8} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.habitName}>
                                    {data.daily_habit.name}
                                </Text>
                                <Text style={styles.habitDuration}>
                                    {data.daily_habit.duration}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Gratitude Capture */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3 Things to Be Grateful For</Text>
                    <Text style={styles.promptText}>{data?.gratitude_prompt}</Text>
                    {[0, 1, 2].map((i) => (
                        <TextInput
                            key={i}
                            style={styles.gratitudeInput}
                            placeholder={`${i + 1}. I'm grateful for...`}
                            placeholderTextColor={colors.textGhost}
                            value={gratitude[i]}
                            onChangeText={(v) => updateGratitude(i, v)}
                        />
                    ))}
                </View>

                {/* Morning Breathing */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Morning Breathing</Text>
                    <Pressable
                        style={styles.breathingCard}
                        onPress={() => router.push('/breathing')}
                    >
                        <View style={styles.breathingIconWrap}>
                            <Wind size={22} color={colors.sapphire} strokeWidth={1.8} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.breathingName}>
                                {data?.breathing_suggestion?.name || 'Morning Energizer'}
                            </Text>
                            <Text style={styles.breathingDesc}>
                                {data?.breathing_suggestion?.instructions}
                            </Text>
                        </View>
                        <ChevronRight size={18} color={colors.gold} strokeWidth={2} />
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.void },
    scroll: { paddingBottom: 100 },
    loadingContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
    },
    loadingText: {
        fontFamily: fonts.body, fontSize: 14,
        color: colors.textMuted, marginTop: spacing.md,
    },
    backButton: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
    backText: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.gold },
    greeting: {
        fontFamily: fonts.display, fontSize: 32,
        color: colors.textPrimary,
        paddingHorizontal: spacing.lg, marginTop: spacing.md,
    },
    subtitle: {
        fontFamily: fonts.body, fontSize: 15,
        color: colors.textMuted,
        paddingHorizontal: spacing.lg, marginTop: spacing.xs,
        marginBottom: spacing.xl,
    },
    affirmationCard: {
        marginHorizontal: spacing.lg, marginBottom: spacing.lg,
        backgroundColor: colors.surface, borderRadius: borderRadius.lg,
        padding: spacing.lg, borderWidth: 1,
        borderColor: colors.gold + '30',
    },
    affirmationLabel: {
        fontFamily: fonts.bodySemiBold, fontSize: 12,
        color: colors.gold, textTransform: 'uppercase',
        letterSpacing: 1.5, marginBottom: spacing.sm,
    },
    affirmationText: {
        fontFamily: fonts.italic, fontSize: 20,
        color: colors.textPrimary, lineHeight: 30,
        marginBottom: spacing.md,
    },
    playButton: {
        alignSelf: 'flex-start', paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm, borderRadius: borderRadius.full,
        backgroundColor: colors.goldGlow, borderWidth: 1,
        borderColor: colors.gold + '40',
    },
    playButtonText: {
        fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.gold,
    },
    streakCard: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: spacing.lg, marginBottom: spacing.lg,
        backgroundColor: colors.surface, borderRadius: borderRadius.md,
        padding: spacing.md, gap: spacing.sm,
        borderWidth: 1, borderColor: colors.emerald + '30',
    },
    streakIconWrap: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: `${colors.emerald}15`,
        alignItems: 'center', justifyContent: 'center',
    },
    streakTitle: {
        fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.emerald,
    },
    streakMessage: {
        fontFamily: fonts.body, fontSize: 13, color: colors.textMuted,
    },
    habitCard: {
        marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontFamily: fonts.display, fontSize: 20,
        color: colors.textPrimary, marginBottom: spacing.md,
    },
    habitContent: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.surface, borderRadius: borderRadius.md,
        padding: spacing.md, gap: spacing.sm,
        borderWidth: 1, borderColor: colors.border,
    },
    habitIconWrap: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: `${colors.gold}15`,
        alignItems: 'center', justifyContent: 'center',
    },
    habitName: {
        fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.textPrimary,
    },
    habitDuration: {
        fontFamily: fonts.body, fontSize: 13, color: colors.textMuted,
    },
    section: {
        paddingHorizontal: spacing.lg, marginBottom: spacing.lg,
    },
    promptText: {
        fontFamily: fonts.italic, fontSize: 15,
        color: colors.gold, marginBottom: spacing.md,
    },
    gratitudeInput: {
        backgroundColor: colors.surface, borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md, paddingVertical: 14,
        fontFamily: fonts.body, fontSize: 15,
        color: colors.textPrimary, marginBottom: spacing.sm,
        borderWidth: 1, borderColor: colors.border,
    },
    breathingCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.surface, borderRadius: borderRadius.lg,
        padding: spacing.md, gap: spacing.sm,
        borderWidth: 1, borderColor: colors.sapphire + '30',
    },
    breathingIconWrap: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: `${colors.sapphire}15`,
        alignItems: 'center', justifyContent: 'center',
    },
    breathingName: {
        fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.textPrimary,
    },
    breathingDesc: {
        fontFamily: fonts.body, fontSize: 13, color: colors.textMuted,
    },

});

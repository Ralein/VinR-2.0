import { useState } from 'react';
import {
    View, Text, ScrollView, Pressable, StyleSheet,
    ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Flame, Target, Wind, Coffee, ChevronRight, Sun } from 'lucide-react-native';
import { colors, fonts, spacing, glass, typography, borderRadius, animation, shadows, gradients } from '../constants/theme';
import { useAfternoonRitual } from '../hooks/useRituals';
import AmbientBackground from '../components/ui/AmbientBackground';
import { useTheme } from '../context/ThemeContext';

export default function AfternoonScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { data, isLoading } = useAfternoonRitual();
    const [wins, setWins] = useState(['', '', '']);

    const updateWins = (index: number, value: string) => {
        const updated = [...wins];
        updated[index] = value;
        setWins(updated);
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <AmbientBackground topColor={isDark ? 'rgba(212,168,83,0.1)' : 'rgba(212,168,83,0.15)'} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.gold} />
                    <Text style={styles.loadingText}>Aligning your afternoon...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <AmbientBackground topColor={isDark ? 'rgba(212,168,83,0.12)' : 'rgba(212,168,83,0.18)'} />
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backText}>← Home</Text>
                </Pressable>

                {/* Greeting */}
                <View style={styles.header}>
                    <Sun size={28} color={colors.gold} strokeWidth={1.5} style={styles.sunIcon} />
                    <Text style={styles.greeting}>{data?.greeting || 'Good afternoon.'}</Text>
                    <Text style={styles.subtitle}>Take a moment to reset and recharge</Text>
                </View>

                {/* Affirmation */}
                <View style={styles.affirmationCard}>
                    <Text style={styles.affirmationLabel}>Afternoon Affirmation</Text>
                    <Text style={styles.affirmationText}>
                        "{data?.affirmation || 'I am focused, present, and capable.'}"
                    </Text>
                    <Pressable style={styles.focusButton}>
                        <Coffee size={14} color={colors.gold} />
                        <Text style={styles.focusButtonText}>Stay Present</Text>
                    </Pressable>
                </View>

                {/* Momentum Status */}
                {data?.streak_status && (
                    <View style={styles.streakCard}>
                        <View style={styles.momentumIconWrap}>
                            <Flame size={22} color={colors.gold} fill={colors.gold} strokeWidth={1.5} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.streakTitle}>
                                Day {data.streak_status.current_streak} Momentum
                            </Text>
                            <Text style={styles.streakMessage}>
                                {data.streak_status.message}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Mid-day Reflection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Today's Wins So Far</Text>
                    <Text style={styles.promptText}>{data?.gratitude_prompt || "What's one thing you've accomplished today?"}</Text>
                    {[0, 1, 2].map((i) => (
                        <TextInput
                            key={i}
                            style={styles.reflectionInput}
                            placeholder={`${i + 1}. A small victory...`}
                            placeholderTextColor={colors.textGhost}
                            value={wins[i]}
                            onChangeText={(v) => updateWins(i, v)}
                        />
                    ))}
                </View>

                {/* Afternoon Breathing */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mid-day Reset</Text>
                    <Pressable
                        style={styles.breathingCard}
                        onPress={() => router.push('/breathing')}
                    >
                        <View style={styles.breathingIconWrap}>
                            <Wind size={22} color={colors.gold} strokeWidth={1.8} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.breathingName}>
                                {data?.breathing_suggestion?.name || 'Quick Reset'}
                            </Text>
                            <Text style={styles.breathingDesc}>
                                {data?.breathing_suggestion?.instructions || 'Box Breathing to clear the mind.'}
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
    header: {
        paddingHorizontal: spacing.lg, marginTop: spacing.md,
        marginBottom: spacing.xl,
    },
    sunIcon: { marginBottom: spacing.sm },
    greeting: {
        fontFamily: fonts.display, fontSize: 32,
        color: colors.textPrimary,
    },
    subtitle: {
        fontFamily: fonts.body, fontSize: 16,
        color: colors.textMuted, marginTop: spacing.xs,
    },
    affirmationCard: {
        marginHorizontal: spacing.lg, marginBottom: spacing.lg,
        backgroundColor: colors.surface, borderRadius: borderRadius.lg,
        padding: spacing.lg, borderWidth: 1,
        borderColor: colors.gold + '25',
        ...shadows.goldSubtle,
    },
    affirmationLabel: {
        fontFamily: fonts.bodySemiBold, fontSize: 12,
        color: colors.gold, textTransform: 'uppercase',
        letterSpacing: 1.5, marginBottom: spacing.sm,
    },
    affirmationText: {
        fontFamily: fonts.display, fontSize: 22,
        color: colors.textPrimary, lineHeight: 32,
        marginBottom: spacing.lg,
    },
    focusButton: {
        flexDirection: 'row', alignItems: 'center',
        alignSelf: 'flex-start', paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm, borderRadius: borderRadius.full,
        backgroundColor: `${colors.gold}10`, borderWidth: 1,
        borderColor: colors.gold + '30', gap: spacing.xs,
    },
    focusButtonText: {
        fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.gold,
    },
    streakCard: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: spacing.lg, marginBottom: spacing.lg,
        backgroundColor: colors.surface, borderRadius: borderRadius.md,
        padding: spacing.md, gap: spacing.sm,
        borderWidth: 1, borderColor: colors.gold + '20',
    },
    momentumIconWrap: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: `${colors.gold}15`,
        alignItems: 'center', justifyContent: 'center',
    },
    streakTitle: {
        fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.gold,
    },
    streakMessage: {
        fontFamily: fonts.body, fontSize: 13, color: colors.textMuted,
    },
    section: {
        paddingHorizontal: spacing.lg, marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontFamily: fonts.display, fontSize: 22,
        color: colors.textPrimary, marginBottom: spacing.md,
    },
    promptText: {
        fontFamily: fonts.body, fontSize: 15,
        color: colors.gold, marginBottom: spacing.md,
        opacity: 0.9,
    },
    reflectionInput: {
        backgroundColor: colors.surface, borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md, paddingVertical: 16,
        fontFamily: fonts.body, fontSize: 15,
        color: colors.textPrimary, marginBottom: spacing.sm,
        borderWidth: 1, borderColor: colors.border,
    },
    breathingCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.surface, borderRadius: borderRadius.xl,
        padding: spacing.lg, gap: spacing.md,
        borderWidth: 1, borderColor: colors.gold + '25',
        ...shadows.goldSubtle,
    },
    breathingIconWrap: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: `${colors.gold}15`,
        alignItems: 'center', justifyContent: 'center',
    },
    breathingName: {
        fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.textPrimary,
    },
    breathingDesc: {
        fontFamily: fonts.body, fontSize: 14, color: colors.textMuted,
        marginTop: 2,
    },
});

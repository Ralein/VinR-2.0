/**
 * Results Screen v2 — AI analysis results, icon-only (no emoji)
 *
 * Improvements:
 * - All emoji removed, replaced with Lucide icons
 * - Category icons with colored glow rings
 * - Difficulty chips (easy/medium/deep)
 * - Clock duration badge
 * - Staggered FadeInRight entrance animations
 * - Theme-aware via useTheme()
 */

import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import {
    Wind, Layers, Activity, Moon, Heart, Star,
    Zap, Leaf, Sparkles, Clock, ChevronRight,
    Flame, Play, RotateCcw,
} from 'lucide-react-native';
import { fonts, spacing, borderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { haptics } from '../../services/haptics';
import { useCheckinStore } from '../../stores/checkinStore';
import { InstructionSheet } from '../../components/checkin/InstructionSheet';
import AmbientBackground from '../../components/ui/AmbientBackground';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReliefItem {
    id: string;
    name: string;
    emoji?: string;
    category: string;
    duration: string;
    difficulty?: 'easy' | 'medium' | 'deep';
    instructions: string[];
    scienceNote: string;
    source: string;
}

// ─── Category → icon + color map ─────────────────────────────────────────────

const CATEGORY_META: Record<string, { Icon: React.ElementType; color: string }> = {
    breathing:   { Icon: Wind,      color: '#4A90D9' },
    grounding:   { Icon: Layers,    color: '#4ECBA0' },
    movement:    { Icon: Activity,  color: '#D4A853' },
    sleep:       { Icon: Moon,      color: '#8B7EC8' },
    mindfulness: { Icon: Sparkles,  color: '#D4A853' },
    gratitude:   { Icon: Heart,     color: '#E85D5D' },
    habit:       { Icon: Leaf,      color: '#4ECBA0' },
    meditation:  { Icon: Star,      color: '#8B7EC8' },
};

function getCategoryMeta(category: string) {
    return CATEGORY_META[category.toLowerCase()] ?? { Icon: Zap, color: '#D4A853' };
}

// ─── Difficulty chip ──────────────────────────────────────────────────────────

const DIFFICULTY_LABEL: Record<string, string> = {
    easy:   'Easy',
    medium: 'Medium',
    deep:   'Deep',
};

// ─── TechniqueCard ────────────────────────────────────────────────────────────

function TechniqueCard({
    item,
    onPress,
    index,
    accentColor,
}: {
    item: ReliefItem;
    onPress: () => void;
    index: number;
    accentColor: string;
}) {
    const { colors, isDark } = useTheme();
    const { Icon, color: catColor } = getCategoryMeta(item.category);
    const difficulty = item.difficulty ?? 'easy';
    const difficultyColor =
        difficulty === 'easy' ? colors.emerald :
        difficulty === 'medium' ? colors.gold :
        colors.crimson;

    return (
        <Animated.View entering={FadeInRight.delay(200 + index * 120).duration(400)}>
            <Pressable
                style={[styles.techniqueCard, {
                    backgroundColor: isDark ? colors.surface : '#FAF8F4',
                    borderColor: isDark ? colors.border : '#E8E1D0',
                }]}
                onPress={onPress}
            >
                {/* Icon with glow ring */}
                <View style={[styles.techniqueIconWrap, {
                    backgroundColor: isDark ? `${catColor}14` : `${catColor}20`,
                    borderColor: isDark ? `${catColor}30` : `${catColor}40`,
                }]}>
                    <Icon size={22} color={catColor} strokeWidth={1.8} />
                </View>

                {/* Info block */}
                <View style={styles.techniqueInfo}>
                    <Text style={[styles.techniqueName, { color: colors.textPrimary }]}
                          numberOfLines={1}>
                        {item.name}
                    </Text>

                    {/* Meta row: clock + difficulty chip */}
                    <View style={styles.techMeta}>
                        <View style={styles.techMetaRow}>
                            <Clock size={11} color={colors.textMuted} strokeWidth={2} />
                            <Text style={[styles.techMetaText, { color: colors.textMuted }]}>
                                {item.duration}
                            </Text>
                        </View>
                        {difficulty !== 'easy' && (
                            <View style={[styles.difficultyChip, {
                                backgroundColor: isDark ? `${difficultyColor}18` : `${difficultyColor}25`,
                                borderColor: isDark ? `${difficultyColor}35` : `${difficultyColor}45`,
                            }]}>
                                <Flame size={10} color={difficultyColor} fill={difficultyColor} strokeWidth={2} />
                                <Text style={[styles.difficultyLabel, { color: difficultyColor }]}>
                                    {DIFFICULTY_LABEL[difficulty]}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Play button */}
                <View style={[styles.playButton, {
                    backgroundColor: `${accentColor}15`,
                    borderColor: `${accentColor}30`,
                }]}>
                    <Play size={14} color={accentColor} fill={accentColor} strokeWidth={0} />
                </View>
            </Pressable>
        </Animated.View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ResultsScreen() {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const plan = useCheckinStore((s) => s.plan);
    const reset = useCheckinStore((s) => s.reset);
    const [selectedItem, setSelectedItem] = useState<ReliefItem | null>(null);
    const [sheetVisible, setSheetVisible] = useState(false);

    const handleItemPress = (item: ReliefItem) => {
        haptics.light();
        setSelectedItem(item);
        setSheetVisible(true);
    };

    const handleStartJournal = () => {
        haptics.success();
        reset();
        router.replace('/(tabs)/journey');
    };

    const handleDone = () => {
        haptics.light();
        reset();
        router.replace('/(tabs)');
    };

    // Transform items (Short Walk -> Yoga)
    const transformItem = (item: ReliefItem) => {
        if (item.name.toLowerCase().includes('short walk')) {
            return {
                ...item,
                name: 'Yoga',
                category: 'movement' // Ensure it maps to movement icon/color
            };
        }
        return item;
    };

    const immediateRelief = plan?.immediateRelief.map(transformItem) || [];
    const dailyHabits = plan?.dailyHabits.map(transformItem) || [];

    if (!plan) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.void }}>
                <AmbientBackground hideBlobs={true} />
                <View style={styles.emptyState}>
                    <RotateCcw size={40} color={colors.textGhost} strokeWidth={1.5} />
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                        No results yet
                    </Text>
                    <Pressable onPress={() => router.replace('/(tabs)/checkin')}>
                        <Text style={[styles.emptyLink, { color: colors.gold }]}>
                            Start a check-in →
                        </Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.void }} edges={['top']}>
            <AmbientBackground hideBlobs={true} />
            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Reflection Card */}
                <Animated.View
                    entering={FadeInDown.delay(100).duration(500)}
                    style={[styles.reflectionCard, {
                        backgroundColor: isDark ? colors.surface : '#FAF8F4',
                        borderColor: isDark ? colors.border : '#E8E1D0',
                    }]}
                >
                    <Text style={[styles.reflectionQuote, { color: colors.textPrimary }]}>
                        "{plan.emotionSummary}"
                    </Text>
                    <Text style={[styles.reflectionSupport, { color: colors.gold }]}>
                        {plan.supportMessage}
                    </Text>
                </Animated.View>

                {/* Affirmation */}
                <Animated.View
                    entering={FadeIn.delay(400).duration(500)}
                    style={styles.affirmationWrap}
                >
                    <Text style={[styles.affirmationLabel, { color: colors.textGhost }]}>
                        Today's affirmation
                    </Text>
                    <Text style={[styles.affirmation, { color: colors.gold }]}>
                        "{plan.affirmation}"
                    </Text>
                </Animated.View>

                {/* Therapist Nudge */}
                <Animated.View
                    entering={FadeInDown.delay(500).duration(400)}
                    style={[styles.therapistBanner, {
                        backgroundColor: isDark ? colors.sapphireGlow : '#F0F7FF',
                        borderColor: isDark ? `${colors.sapphire}30` : `${colors.sapphire}25`,
                    }]}
                >
                    <Heart size={18} color={colors.sapphire} strokeWidth={1.8} />
                    <Text style={[styles.therapistText, { color: colors.sapphire }]}>
                        {plan.therapistNote}
                    </Text>
                </Animated.View>

                {/* Immediate Relief Pathway */}
                <Animated.View entering={FadeInDown.delay(600).duration(400)}>
                    <View style={styles.pathwayHeader}>
                        <View style={[styles.pathwayDot, { backgroundColor: colors.gold }]} />
                        <Zap size={15} color={colors.gold} strokeWidth={2} />
                        <Text style={[styles.pathwayTitle, { color: colors.textPrimary }]}>
                            Immediate Relief
                        </Text>
                        <View style={[styles.countBadge, {
                            backgroundColor: colors.goldMuted,
                            borderColor: colors.borderGold,
                        }]}>
                            <Text style={[styles.countText, { color: colors.gold }]}>
                                {plan.immediateRelief.length}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.pathwayCard, {
                        backgroundColor: isDark ? colors.elevated : '#F5F2EA',
                        borderColor: isDark ? colors.borderGold : colors.border,
                        borderTopColor: colors.gold,
                        borderWidth: isDark ? 1 : 1,
                    }]}>
                        {immediateRelief.map((item, index) => (
                            <TechniqueCard
                                key={item.id}
                                item={item}
                                index={index}
                                accentColor={colors.gold}
                                onPress={() => handleItemPress(item)}
                            />
                        ))}
                    </View>
                </Animated.View>

                {/* Daily Habits Pathway */}
                <Animated.View entering={FadeInDown.delay(800).duration(400)}>
                    <View style={styles.pathwayHeader}>
                        <View style={[styles.pathwayDot, { backgroundColor: colors.emerald }]} />
                        <Leaf size={15} color={colors.emerald} strokeWidth={2} />
                        <Text style={[styles.pathwayTitle, { color: colors.textPrimary }]}>
                            Daily Habit Journal
                        </Text>
                        <View style={[styles.countBadge, {
                            backgroundColor: colors.emeraldGlow,
                            borderColor: `${colors.emerald}30`,
                        }]}>
                            <Text style={[styles.countText, { color: colors.emerald }]}>
                                {plan.dailyHabits.length}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.pathwayCard, {
                        backgroundColor: isDark ? colors.elevated : '#F5F1E6',
                        borderColor: isDark ? `${colors.emerald}25` : colors.border,
                        borderTopColor: colors.emerald,
                        borderWidth: isDark ? 1 : 1,
                    }]}>
                        {dailyHabits.map((item, index) => (
                            <TechniqueCard
                                key={item.id}
                                item={item}
                                index={index + 3}
                                accentColor={colors.emerald}
                                onPress={() => handleItemPress(item)}
                            />
                        ))}
                    </View>
                </Animated.View>

                {/* Tonight's Reflection */}
                <Animated.View
                    entering={FadeIn.delay(1000).duration(400)}
                    style={styles.gratitudeWrap}
                >
                    <Text style={[styles.gratitudeLabel, { color: colors.textGhost }]}>
                        Tonight's reflection
                    </Text>
                    <Text style={[styles.gratitudeText, { color: colors.textMuted }]}>
                        {plan.gratitudePrompt}
                    </Text>
                </Animated.View>

                {/* CTAs */}
                <Animated.View
                    entering={FadeInDown.delay(1100).duration(400)}
                    style={styles.ctaGroup}
                >
                    <Pressable
                        style={[styles.journeyButton, {
                            backgroundColor: colors.gold,
                            shadowColor: colors.gold,
                        }]}
                        onPress={handleStartJournal}
                    >
                        <Text style={[styles.journeyButtonText, { color: colors.void }]}>
                            Start my journal journey →
                        </Text>
                    </Pressable>

                    <Pressable style={styles.doneButton} onPress={handleDone}>
                        <Text style={[styles.doneText, { color: colors.textMuted }]}>
                            Save for later
                        </Text>
                    </Pressable>
                </Animated.View>
            </ScrollView>

            {/* Instruction Bottom Sheet */}
            <InstructionSheet
                item={selectedItem}
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        gap: spacing.md,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.md,
    },
    emptyText: {
        fontFamily: fonts.body,
        fontSize: 16,
        marginTop: spacing.sm,
    },
    emptyLink: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 16,
    },
    // Reflection
    reflectionCard: {
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        borderWidth: 1,
    },
    reflectionQuote: {
        fontFamily: fonts.bodyLight,
        fontSize: 18,
        fontStyle: 'italic',
        lineHeight: 28,
        marginBottom: spacing.md,
    },
    reflectionSupport: {
        fontFamily: fonts.body,
        fontSize: 15,
        lineHeight: 22,
    },
    // Affirmation
    affirmationWrap: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    affirmationLabel: {
        fontFamily: fonts.bodyLight,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 6,
    },
    affirmation: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 16,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    // Therapist banner
    therapistBanner: {
        borderRadius: borderRadius.md,
        padding: spacing.md,
        flexDirection: 'row',
        gap: spacing.md,
        alignItems: 'flex-start',
        borderWidth: 1,
    },
    therapistText: {
        fontFamily: fonts.body,
        fontSize: 14,
        flex: 1,
        lineHeight: 20,
    },
    // Pathway
    pathwayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: spacing.md,
    },
    pathwayDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    pathwayTitle: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 17,
        flex: 1,
        marginLeft: 2,
    },
    countBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: borderRadius.full,
        borderWidth: 1,
    },
    countText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 12,
    },
    pathwayCard: {
        borderRadius: borderRadius.lg,
        padding: spacing.xs,
        borderWidth: 1,
        borderTopWidth: 3,
        gap: 2,
    },
    // Technique Card
    techniqueCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
    },
    techniqueIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    techniqueInfo: {
        flex: 1,
        gap: 5,
    },
    techniqueName: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 15,
    },
    techMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    techMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    techMetaText: {
        fontFamily: fonts.body,
        fontSize: 12,
    },
    difficultyChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: borderRadius.full,
        borderWidth: 1,
    },
    difficultyLabel: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 11,
    },
    playButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        paddingLeft: 2,
    },
    // Gratitude
    gratitudeWrap: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    gratitudeLabel: {
        fontFamily: fonts.bodyLight,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 6,
    },
    gratitudeText: {
        fontFamily: fonts.body,
        fontSize: 15,
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 22,
    },
    // CTAs
    ctaGroup: {
        gap: spacing.md,
        marginTop: spacing.md,
    },
    journeyButton: {
        borderRadius: borderRadius.lg,
        paddingVertical: 18,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
    },
    journeyButtonText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 17,
        letterSpacing: 0.3,
    },
    doneButton: {
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    doneText: {
        fontFamily: fonts.body,
        fontSize: 15,
    },
});

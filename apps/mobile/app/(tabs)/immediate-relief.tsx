/**
 * Immediate Relief Hub — Comprehensive toolkit for quick relief
 *
 * Features:
 * - Relief hub with multiple technique categories
 * - Quick Breathing shortcuts
 * - 5-4-3-2-1 Grounding link
 * - Progressive Muscle Relaxation guide
 * - Guided Visualization
 * - Creative Expression prompt
 * - Full theme support
 */

import { useState, useRef } from 'react';
import {
    View, Text, ScrollView, Pressable, StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
    FadeIn, FadeInDown, FadeInRight,
    useSharedValue, useAnimatedStyle, withTiming, withRepeat,
    withSequence, Easing,
} from 'react-native-reanimated';
import {
    Wind, Layers, Dumbbell, Eye, PenTool,
    Play, ChevronRight, Clock, Flame, Sparkles,
    ArrowRight, ChevronLeft, X, Heart, Zap,
} from 'lucide-react-native';
import { fonts, spacing, borderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import AmbientBackground from '../../components/ui/AmbientBackground';
import { haptics } from '../../services/haptics';

// ── Types ──

type ActiveView = 'hub' | 'muscle' | 'visualization' | 'creative';

interface ReliefSection {
    id: string;
    name: string;
    description: string;
    Icon: any;
    iconColor: string;
    duration: string;
    difficulty: 'easy' | 'medium' | 'deep';
    action: 'navigate' | 'modal';
    route?: string;
    view?: ActiveView;
}

const RELIEF_SECTIONS: ReliefSection[] = [
    {
        id: 'box', name: 'Box Breathing', description: 'Equal 4-count inhale, hold, exhale, hold pattern',
        Icon: Wind, iconColor: '#4A90D9', duration: '1–5 min', difficulty: 'easy',
        action: 'navigate', route: '/breathing',
    },
    {
        id: '478', name: '4-7-8 Sleep Breath', description: 'Tranquilizer for your nervous system',
        Icon: Wind, iconColor: '#4A90D9', duration: '2–5 min', difficulty: 'easy',
        action: 'navigate', route: '/breathing',
    },
    {
        id: 'grounding', name: '5-4-3-2-1 Grounding', description: 'Engage all five senses to reconnect',
        Icon: Layers, iconColor: '#4ECBA0', duration: '3–5 min', difficulty: 'easy',
        action: 'navigate', route: '/grounding',
    },
    {
        id: 'muscle', name: 'Progressive Muscle Relaxation', description: 'Systematic tension and release through each muscle group',
        Icon: Dumbbell, iconColor: '#D4A853', duration: '8–12 min', difficulty: 'medium',
        action: 'modal', view: 'muscle',
    },
    {
        id: 'visualization', name: 'Guided Visualization', description: 'Imagine a peaceful safe place in vivid detail',
        Icon: Eye, iconColor: '#8B7EC8', duration: '5–10 min', difficulty: 'medium',
        action: 'modal', view: 'visualization',
    },
    {
        id: 'creative', name: 'Creative Expression', description: 'Free-write or draw to process what you\'re feeling',
        Icon: PenTool, iconColor: '#E85D5D', duration: '5–15 min', difficulty: 'easy',
        action: 'modal', view: 'creative',
    },
];

// ── Muscle Relaxation Steps ──

const MUSCLE_STEPS = [
    { muscle: 'Feet', instruction: 'Curl your toes tightly for 5 seconds, then release. Notice the warmth spreading.' },
    { muscle: 'Calves', instruction: 'Point your toes up toward your shins. Hold for 5 seconds, then let go.' },
    { muscle: 'Thighs', instruction: 'Squeeze your thigh muscles tightly. Hold, then release.' },
    { muscle: 'Abs', instruction: 'Tighten your stomach as if bracing for a punch. Hold, then relax.' },
    { muscle: 'Hands', instruction: 'Make tight fists. Squeeze hard for 5 seconds, then open and spread your fingers.' },
    { muscle: 'Arms', instruction: 'Flex your biceps hard. Hold the tension, then let your arms go limp.' },
    { muscle: 'Shoulders', instruction: 'Raise your shoulders up to your ears. Hold tightly, then drop them down.' },
    { muscle: 'Face', instruction: 'Scrunch your entire face — eyes, nose, mouth. Hold, then let it all relax.' },
];

// ── Visualization Script ──

const VISUALIZATION_STEPS = [
    'Close your eyes and take three slow breaths.',
    'Imagine yourself walking toward a peaceful place — maybe a beach, a forest, or a warm room.',
    'Look around this place. Notice the colors. What do you see?',
    'Listen carefully. What sounds are here? Birds, water, wind?',
    'Feel the ground beneath your feet. Is it soft sand, cool grass, or warm wood?',
    'Breathe in deeply. What does this place smell like?',
    'Find a comfortable spot to sit. Let your body relax completely.',
    'Stay here as long as you need. This place is always available to you.',
];

// ── Creative Prompts ──

const CREATIVE_PROMPTS = [
    'If your feelings had a color and shape, what would they look like?',
    'Write a letter to your anxiety. What would you say?',
    'Describe the last moment you felt completely at peace.',
    'What would you tell your younger self right now?',
    'List 5 things that make you feel safe.',
];

// ── Difficulty Badge ──

const DIFFICULTY_COLORS: Record<string, string> = {
    easy: '#4ECBA0',
    medium: '#D4A853',
    deep: '#E85D5D',
};

// ── TechniqueCard ──

function TechniqueCard({ section, index, onPress }: {
    section: ReliefSection; index: number; onPress: () => void;
}) {
    const { colors, isDark } = useTheme();
    const SIcon = section.Icon;
    const diffColor = DIFFICULTY_COLORS[section.difficulty];

    return (
        <Animated.View entering={FadeInDown.delay(150 + index * 60).duration(400)}>
            <Pressable
                style={[styles.techCard, {
                    backgroundColor: isDark ? colors.surface : '#FAF8F4',
                    borderColor: isDark ? colors.border : '#E8E1D0',
                }]}
                onPress={onPress}
            >
                <View style={[styles.techIconWrap, {
                    backgroundColor: `${section.iconColor}14`,
                    borderColor: `${section.iconColor}30`,
                }]}>
                    <SIcon size={22} color={section.iconColor} strokeWidth={1.8} />
                </View>
                <View style={styles.techInfo}>
                    <Text style={[styles.techName, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>
                        {section.name}
                    </Text>
                    <Text style={[styles.techDesc, { color: colors.textMuted, fontFamily: fonts.body }]} numberOfLines={1}>
                        {section.description}
                    </Text>
                    <View style={styles.techMeta}>
                        <View style={styles.techMetaRow}>
                            <Clock size={11} color={colors.textGhost} strokeWidth={2} />
                            <Text style={[styles.techMetaText, { color: colors.textGhost, fontFamily: fonts.body }]}>
                                {section.duration}
                            </Text>
                        </View>
                        <View style={[styles.diffChip, { backgroundColor: `${diffColor}18`, borderColor: `${diffColor}35` }]}>
                            <Flame size={10} color={diffColor} fill={diffColor} strokeWidth={2} />
                            <Text style={[styles.diffText, { color: diffColor, fontFamily: fonts.bodySemiBold }]}>
                                {section.difficulty.charAt(0).toUpperCase() + section.difficulty.slice(1)}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={[styles.playBtn, { backgroundColor: `${section.iconColor}12`, borderColor: `${section.iconColor}30` }]}>
                    <Play size={14} color={section.iconColor} fill={section.iconColor} strokeWidth={0} />
                </View>
            </Pressable>
        </Animated.View>
    );
}

// ── Step Guide ──

function StepGuide({ steps, title, onClose }: {
    steps: { label?: string; text: string }[];
    title: string;
    onClose: () => void;
}) {
    const { colors, isDark } = useTheme();
    const [currentStep, setCurrentStep] = useState(0);

    const step = steps[currentStep];
    const isLast = currentStep === steps.length - 1;

    return (
        <View style={[guideStyles.container]}>
            {/* Header */}
            <View style={guideStyles.header}>
                <Pressable onPress={onClose} style={[guideStyles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                    <X size={18} color={colors.textPrimary} strokeWidth={2} />
                </Pressable>
                <Text style={[guideStyles.title, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>{title}</Text>
                <Text style={[guideStyles.counter, { color: colors.textGhost, fontFamily: fonts.mono }]}>
                    {currentStep + 1}/{steps.length}
                </Text>
            </View>

            {/* Progress */}
            <View style={guideStyles.progressRow}>
                {steps.map((_, i) => (
                    <View
                        key={i}
                        style={[guideStyles.progressDot, {
                            backgroundColor: i <= currentStep ? colors.gold : (isDark ? colors.surface : '#E0DAC8'),
                            flex: 1, height: 3, borderRadius: 2,
                        }]}
                    />
                ))}
            </View>

            {/* Step Content */}
            <View style={guideStyles.content}>
                {step.label && (
                    <Text style={[guideStyles.stepLabel, { color: colors.gold, fontFamily: fonts.bodySemiBold }]}>
                        {step.label}
                    </Text>
                )}
                <Animated.Text
                    key={currentStep}
                    entering={FadeIn.duration(400)}
                    style={[guideStyles.stepText, { color: colors.textPrimary, fontFamily: fonts.body }]}
                >
                    {step.text}
                </Animated.Text>
            </View>

            {/* Nav */}
            <View style={guideStyles.nav}>
                {currentStep > 0 ? (
                    <Pressable
                        style={[guideStyles.navBtn, { borderColor: isDark ? colors.border : '#E0DAC8' }]}
                        onPress={() => setCurrentStep(currentStep - 1)}
                    >
                        <ChevronLeft size={16} color={colors.textMuted} strokeWidth={2} />
                        <Text style={[guideStyles.navText, { color: colors.textMuted, fontFamily: fonts.body }]}>Back</Text>
                    </Pressable>
                ) : <View />}

                {isLast ? (
                    <Pressable style={[guideStyles.navBtn, { backgroundColor: colors.gold, borderColor: colors.gold }]} onPress={onClose}>
                        <Text style={[guideStyles.navText, { color: colors.void, fontFamily: fonts.bodySemiBold }]}>Done</Text>
                        <Heart size={14} color={colors.void} strokeWidth={2} />
                    </Pressable>
                ) : (
                    <Pressable
                        style={[guideStyles.navBtn, { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary }]}
                        onPress={() => setCurrentStep(currentStep + 1)}
                    >
                        <Text style={[guideStyles.navText, { color: colors.void, fontFamily: fonts.bodySemiBold }]}>Next</Text>
                        <ArrowRight size={14} color={colors.void} strokeWidth={2} />
                    </Pressable>
                )}
            </View>
        </View>
    );
}

// ── Main Screen ──

export default function ImmediateReliefScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const [activeView, setActiveView] = useState<ActiveView>('hub');
    const [creativeSeed] = useState(() => Math.floor(Math.random() * CREATIVE_PROMPTS.length));

    const handleSectionPress = (section: ReliefSection) => {
        haptics.light();
        if (section.action === 'navigate' && section.route) {
            router.push(section.route as any);
        } else if (section.view) {
            setActiveView(section.view);
        }
    };

    // Muscle relaxation guide
    if (activeView === 'muscle') {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]} edges={['top']}>
                <AmbientBackground hideBlobs={true} />
                <StepGuide
                    title="Progressive Muscle Relaxation"
                    steps={MUSCLE_STEPS.map(s => ({ label: s.muscle, text: s.instruction }))}
                    onClose={() => setActiveView('hub')}
                />
            </SafeAreaView>
        );
    }

    // Visualization guide
    if (activeView === 'visualization') {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]} edges={['top']}>
                <AmbientBackground hideBlobs={true} />
                <StepGuide
                    title="Guided Visualization"
                    steps={VISUALIZATION_STEPS.map(s => ({ text: s }))}
                    onClose={() => setActiveView('hub')}
                />
            </SafeAreaView>
        );
    }

    // Creative expression view
    if (activeView === 'creative') {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]} edges={['top']}>
                <AmbientBackground hideBlobs={true} />
                <View style={creativeStyles.container}>
                    <View style={creativeStyles.header}>
                        <Pressable onPress={() => setActiveView('hub')} style={[creativeStyles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                            <X size={18} color={colors.textPrimary} strokeWidth={2} />
                        </Pressable>
                        <Text style={[creativeStyles.title, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>
                            Creative Expression
                        </Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <Animated.View entering={FadeIn.delay(200).duration(600)} style={creativeStyles.promptArea}>
                        <View style={[creativeStyles.promptCard, {
                            backgroundColor: isDark ? colors.surface : '#FAF8F4',
                            borderColor: isDark ? `${colors.gold}20` : `${colors.gold}15`,
                        }]}>
                            <PenTool size={20} color={colors.gold} strokeWidth={1.8} />
                            <Text style={[creativeStyles.promptLabel, { color: colors.gold, fontFamily: fonts.bodySemiBold }]}>
                                Today's Prompt
                            </Text>
                            <Text style={[creativeStyles.promptText, { color: colors.textPrimary, fontFamily: fonts.body }]}>
                                {CREATIVE_PROMPTS[creativeSeed]}
                            </Text>
                        </View>

                        <Text style={[creativeStyles.hint, { color: colors.textGhost, fontFamily: fonts.body }]}>
                            Write in your journal, draw on paper, or just think about it. There are no rules.
                        </Text>

                        <Pressable
                            style={[creativeStyles.journalBtn, { backgroundColor: colors.gold, shadowColor: colors.gold }]}
                            onPress={() => { haptics.light(); router.push('/(tabs)/journey'); }}
                        >
                            <Text style={[creativeStyles.journalBtnText, { color: colors.void, fontFamily: fonts.bodySemiBold }]}>
                                Open My Journal →
                            </Text>
                        </Pressable>
                    </Animated.View>
                </View>
            </SafeAreaView>
        );
    }

    // ── Hub View ──
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]} edges={['top']}>
            <AmbientBackground hideBlobs={true} />
            <ScrollView
                contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero */}
                <Animated.View entering={FadeIn.duration(400)} style={styles.hero}>
                    <View style={[styles.heroCircle, {
                        backgroundColor: `${colors.gold}12`,
                        borderColor: `${colors.gold}30`,
                    }]}>
                        <Zap size={28} color={colors.gold} strokeWidth={1.5} />
                    </View>
                    <Text style={[styles.heroTitle, { color: colors.textPrimary, fontFamily: fonts.display }]}>
                        Immediate Relief
                    </Text>
                    <Text style={[styles.heroSubtitle, { color: colors.textMuted, fontFamily: fonts.body }]}>
                        Evidence-based techniques to help you feel better right now.
                    </Text>
                </Animated.View>

                {/* Technique Cards */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Sparkles size={14} color={colors.gold} strokeWidth={2} />
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>
                            Choose a Technique
                        </Text>
                        <View style={[styles.countBadge, { backgroundColor: colors.goldMuted, borderColor: colors.borderGold }]}>
                            <Text style={[styles.countText, { color: colors.gold, fontFamily: fonts.bodySemiBold }]}>{RELIEF_SECTIONS.length}</Text>
                        </View>
                    </View>
                    {RELIEF_SECTIONS.map((section, index) => (
                        <TechniqueCard
                            key={section.id}
                            section={section}
                            index={index}
                            onPress={() => handleSectionPress(section)}
                        />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ── Styles ──

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingBottom: 80 },
    // Hero
    hero: {
        alignItems: 'center', paddingHorizontal: spacing.xl,
        paddingTop: spacing.md, paddingBottom: spacing.lg, gap: spacing.sm,
    },
    heroCircle: {
        width: 64, height: 64, borderRadius: 32,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, marginBottom: spacing.xs,
    },
    heroTitle: { fontSize: 28, textAlign: 'center', letterSpacing: -0.5 },
    heroSubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
    // Sections
    section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
    sectionHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md,
    },
    sectionTitle: { flex: 1, fontSize: 16 },
    countBadge: {
        paddingHorizontal: 10, paddingVertical: 3,
        borderRadius: borderRadius.full, borderWidth: 1,
    },
    countText: { fontSize: 12 },
    // TechniqueCard
    techCard: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.md,
        padding: spacing.md, borderRadius: borderRadius.lg,
        borderWidth: 1, marginBottom: spacing.sm,
    },
    techIconWrap: {
        width: 44, height: 44, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1,
    },
    techInfo: { flex: 1, gap: 3 },
    techName: { fontSize: 15 },
    techDesc: { fontSize: 12, lineHeight: 17 },
    techMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 3 },
    techMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    techMetaText: { fontSize: 11 },
    diffChip: {
        flexDirection: 'row', alignItems: 'center', gap: 3,
        paddingHorizontal: 7, paddingVertical: 2.5,
        borderRadius: borderRadius.full, borderWidth: 1,
    },
    diffText: { fontSize: 10 },
    playBtn: {
        width: 34, height: 34, borderRadius: 17,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, paddingLeft: 2,
    },
});

const guideStyles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    closeBtn: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
    },
    title: { fontSize: 17, textAlign: 'center' },
    counter: { fontSize: 13, minWidth: 40, textAlign: 'right' },
    progressRow: { flexDirection: 'row', gap: 4, marginBottom: spacing.xl },
    progressDot: {},
    content: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    stepLabel: { fontSize: 18, marginBottom: spacing.sm, letterSpacing: 0.5 },
    stepText: { fontSize: 18, lineHeight: 28, textAlign: 'center' },
    nav: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: spacing.xl,
    },
    navBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
        borderRadius: borderRadius.full, borderWidth: 1,
    },
    navText: { fontSize: 14 },
});

const creativeStyles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: spacing.lg, paddingTop: spacing.md,
    },
    closeBtn: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
    },
    title: { fontSize: 17, textAlign: 'center' },
    promptArea: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
        paddingHorizontal: spacing.xl, gap: spacing.xl,
    },
    promptCard: {
        borderRadius: borderRadius.xl, padding: spacing.xl,
        borderWidth: 1, gap: spacing.md, alignItems: 'center',
        width: '100%',
    },
    promptLabel: { fontSize: 11, letterSpacing: 1.2 },
    promptText: { fontSize: 20, lineHeight: 30, textAlign: 'center' },
    hint: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
    journalBtn: {
        paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
        borderRadius: borderRadius.full,
        shadowOpacity: 0.3, shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 }, elevation: 6,
    },
    journalBtnText: { fontSize: 15 },
});

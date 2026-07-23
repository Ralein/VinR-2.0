/**
 * Guided Yoga Screen — Premium pose selector + timed session
 *
 * Features:
 * - Lucide icons (no emoji)
 * - Category filter chips
 * - Animated PoseCards with glow rings
 * - Circular countdown session view
 * - Full light/dark theme support
 */

import { useState, useEffect, useRef } from 'react';
import {
    View, Text, ScrollView, Pressable, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
    FadeIn, FadeInDown, FadeInRight, FadeInUp,
    useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence,
    Easing,
} from 'react-native-reanimated';
import {
    ChevronLeft, Baby, Cat, ArrowDown, Footprints, Gem,
    Snail, Sword, TreePine, RotateCcw, Flower2, ArrowDownFromLine,
    Bird, Check, Clock, Flame, Play, Square, Heart,
    Sparkles, Zap, Brain,
} from 'lucide-react-native';
import { fonts, spacing, borderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import AmbientBackground from '../components/ui/AmbientBackground';
import { haptics } from '../services/haptics';

// ── Types ──

interface YogaPose {
    id: string;
    name: string;
    Icon: any;
    iconColor: string;
    holdSeconds: number;
    benefit: string;
    source: string;
    category: 'anxiety' | 'depression' | 'stress' | 'general';
}

const YOGA_POSES: YogaPose[] = [
    { id: 'child', name: "Child's Pose", Icon: Baby, iconColor: '#4A90D9', holdSeconds: 30, benefit: 'Calms the nervous system and reduces anxiety', source: 'Mayo Clinic', category: 'anxiety' },
    { id: 'cat_cow', name: 'Cat-Cow', Icon: Cat, iconColor: '#D4A853', holdSeconds: 30, benefit: 'Releases spinal tension and promotes mindful breathing', source: 'Johns Hopkins', category: 'stress' },
    { id: 'forward_fold', name: 'Standing Forward Fold', Icon: ArrowDownFromLine, iconColor: '#4A90D9', holdSeconds: 30, benefit: 'Reduces tension headaches and calms the mind', source: 'APA', category: 'anxiety' },
    { id: 'legs_up', name: 'Legs Up the Wall', Icon: Footprints, iconColor: '#4A90D9', holdSeconds: 60, benefit: 'Activates parasympathetic response, reduces insomnia', source: 'Mayo Clinic', category: 'anxiety' },
    { id: 'bridge', name: 'Bridge Pose', Icon: Gem, iconColor: '#8B7EC8', holdSeconds: 30, benefit: 'Opens the chest and counteracts depressive posture', source: 'Johns Hopkins', category: 'depression' },
    { id: 'cobra', name: 'Cobra Pose', Icon: Snail, iconColor: '#8B7EC8', holdSeconds: 20, benefit: 'Elevates mood by opening the heart center', source: 'APA', category: 'depression' },
    { id: 'warrior2', name: 'Warrior II', Icon: Sword, iconColor: '#8B7EC8', holdSeconds: 30, benefit: 'Builds confidence and mental focus', source: 'Mayo Clinic', category: 'depression' },
    { id: 'tree', name: 'Tree Pose', Icon: TreePine, iconColor: '#4ECBA0', holdSeconds: 30, benefit: 'Improves balance and present-moment awareness', source: 'Johns Hopkins', category: 'general' },
    { id: 'seated_twist', name: 'Seated Twist', Icon: RotateCcw, iconColor: '#D4A853', holdSeconds: 30, benefit: 'Releases stored tension in the spine', source: 'Mayo Clinic', category: 'stress' },
    { id: 'corpse', name: 'Savasana', Icon: Flower2, iconColor: '#4ECBA0', holdSeconds: 120, benefit: 'Induces deep relaxation and stress relief', source: 'APA', category: 'general' },
    { id: 'downward_dog', name: 'Downward Dog', Icon: ArrowDown, iconColor: '#4ECBA0', holdSeconds: 30, benefit: 'Full body stretch that energizes and calms', source: 'Johns Hopkins', category: 'general' },
    { id: 'pigeon', name: 'Pigeon Pose', Icon: Bird, iconColor: '#D4A853', holdSeconds: 45, benefit: 'Releases stored emotional tension in the hips', source: 'Mayo Clinic', category: 'stress' },
];

interface CategoryFilter {
    key: string;
    label: string;
    Icon: any;
}

const CATEGORIES: CategoryFilter[] = [
    { key: 'all', label: 'All', Icon: Sparkles },
    { key: 'anxiety', label: 'Anxiety', Icon: Brain },
    { key: 'depression', label: 'Depression', Icon: Heart },
    { key: 'stress', label: 'Stress', Icon: Zap },
    { key: 'general', label: 'General', Icon: Flower2 },
];

// ── PoseCard ──

function PoseCard({
    pose, selected, onToggle, index,
}: {
    pose: YogaPose; selected: boolean; onToggle: () => void; index: number;
}) {
    const { colors, isDark } = useTheme();
    const PoseIcon = pose.Icon;

    return (
        <Animated.View entering={FadeInDown.delay(100 + index * 50).duration(350)}>
            <Pressable
                style={[
                    poseStyles.card,
                    {
                        backgroundColor: isDark ? colors.surface : '#FAF8F4',
                        borderColor: selected
                            ? colors.gold
                            : (isDark ? colors.border : '#E8E1D0'),
                    },
                    selected && { backgroundColor: isDark ? colors.goldMuted : `${colors.gold}08` },
                ]}
                onPress={onToggle}
            >
                <View style={[poseStyles.iconWrap, {
                    backgroundColor: `${pose.iconColor}14`,
                    borderColor: `${pose.iconColor}30`,
                }]}>
                    <PoseIcon size={20} color={pose.iconColor} strokeWidth={1.8} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[poseStyles.name, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>
                        {pose.name}
                    </Text>
                    <View style={poseStyles.metaRow}>
                        <View style={poseStyles.metaChip}>
                            <Clock size={10} color={colors.textMuted} strokeWidth={2} />
                            <Text style={[poseStyles.metaText, { color: colors.textMuted, fontFamily: fonts.body }]}>
                                {pose.holdSeconds}s hold
                            </Text>
                        </View>
                    </View>
                    <Text style={[poseStyles.benefit, { color: colors.textMuted, fontFamily: fonts.body }]} numberOfLines={2}>
                        {pose.benefit}
                    </Text>
                </View>
                {selected ? (
                    <View style={[poseStyles.checkCircle, { backgroundColor: colors.gold }]}>
                        <Check size={14} color={colors.void} strokeWidth={3} />
                    </View>
                ) : (
                    <View style={[poseStyles.emptyCircle, { borderColor: isDark ? colors.border : '#D4CDB8' }]} />
                )}
            </Pressable>
        </Animated.View>
    );
}

// ── Main Screen ──

export default function YogaScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [activeCategory, setActiveCategory] = useState('all');
    const [activeSession, setActiveSession] = useState(false);
    const [currentPoseIdx, setCurrentPoseIdx] = useState(0);
    const [countdown, setCountdown] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Pulse animation for session
    const sessionPulse = useSharedValue(1);

    const togglePose = (id: string) => {
        haptics.light();
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else if (next.size < 5) {
            next.add(id);
        }
        setSelectedIds(next);
    };

    const filteredPoses = activeCategory === 'all'
        ? YOGA_POSES
        : YOGA_POSES.filter(p => p.category === activeCategory);

    const selectedPoses = YOGA_POSES.filter((p) => selectedIds.has(p.id));

    const startSession = () => {
        if (selectedPoses.length < 3) return;
        haptics.success();
        setActiveSession(true);
        setCurrentPoseIdx(0);
        setCountdown(selectedPoses[0].holdSeconds);

        sessionPulse.value = withRepeat(
            withSequence(
                withTiming(1.08, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            ),
            -1, true
        ) as any;
    };

    useEffect(() => {
        if (!activeSession) return;
        const interv = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    setCurrentPoseIdx((idx) => {
                        const nextIdx = idx + 1;
                        if (nextIdx >= selectedPoses.length) {
                            setActiveSession(false);
                            clearInterval(interv);
                            return idx;
                        }
                        setCountdown(selectedPoses[nextIdx].holdSeconds);
                        return nextIdx;
                    });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        timerRef.current = interv;
        return () => clearInterval(interv);
    }, [activeSession, selectedPoses]);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: sessionPulse.value }],
    }));

    // ── Active Session View ──
    if (activeSession && selectedPoses.length > 0) {
        const pose = selectedPoses[currentPoseIdx];
        const PoseIcon = pose.Icon;
        const totalHold = pose.holdSeconds;
        const elapsed = totalHold - countdown;

        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]}>
                <AmbientBackground hideBlobs={true} />
                <View style={styles.sessionContainer}>
                    {/* Progress chips */}
                    <Animated.View entering={FadeIn.duration(400)} style={styles.sessionProgressRow}>
                        {selectedPoses.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.sessionDot,
                                    {
                                        backgroundColor: i < currentPoseIdx ? colors.gold
                                            : i === currentPoseIdx ? colors.sapphire
                                            : (isDark ? colors.surface : '#E0DAC8'),
                                        borderColor: i === currentPoseIdx ? colors.sapphire
                                            : i < currentPoseIdx ? colors.gold
                                            : (isDark ? colors.border : '#D4CDB8'),
                                    },
                                ]}
                            />
                        ))}
                    </Animated.View>

                    <Text style={[styles.sessionCounter, { color: colors.textMuted, fontFamily: fonts.body }]}>
                        {currentPoseIdx + 1} of {selectedPoses.length}
                    </Text>

                    {/* Pose icon with pulse */}
                    <Animated.View style={[styles.sessionIconOuter, { backgroundColor: `${pose.iconColor}10`, borderColor: `${pose.iconColor}25` }, pulseStyle]}>
                        <View style={[styles.sessionIconInner, { backgroundColor: `${pose.iconColor}18` }]}>
                            <PoseIcon size={48} color={pose.iconColor} strokeWidth={1.2} />
                        </View>
                    </Animated.View>

                    <Text style={[styles.sessionName, { color: colors.textPrimary, fontFamily: fonts.display }]}>{pose.name}</Text>

                    {/* Countdown */}
                    <Text style={[styles.sessionCountdown, { color: colors.gold, fontFamily: fonts.mono }]}>{countdown}</Text>
                    <Text style={[styles.sessionCountdownLabel, { color: colors.textGhost, fontFamily: fonts.body }]}>seconds remaining</Text>

                    <Text style={[styles.sessionBenefit, { color: colors.textMuted, fontFamily: fonts.body }]}>{pose.benefit}</Text>

                    <Pressable
                        style={[styles.sessionStop, { backgroundColor: `${colors.crimson}12`, borderColor: `${colors.crimson}30` }]}
                        onPress={() => {
                            haptics.light();
                            setActiveSession(false);
                            sessionPulse.value = withTiming(1, { duration: 500 });
                            if (timerRef.current) clearInterval(timerRef.current);
                        }}
                    >
                        <Square size={14} color={colors.crimson} fill={colors.crimson} strokeWidth={0} />
                        <Text style={[styles.sessionStopText, { color: colors.crimson, fontFamily: fonts.bodySemiBold }]}>End Session</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    // ── Pose Selection View ──
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]}>
            <AmbientBackground hideBlobs={true} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <Animated.View entering={FadeIn.duration(400)} style={styles.headerRow}>
                    <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                        <ChevronLeft size={20} color={colors.textPrimary} strokeWidth={2} />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fonts.display }]}>Guided Yoga</Text>
                        <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: fonts.body }]}>
                            Select 3–5 poses for your sequence
                        </Text>
                    </View>
                </Animated.View>

                {/* Category filters */}
                <Animated.View entering={FadeInDown.delay(80).duration(400)}>
                    <ScrollView
                        horizontal showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chipsRow}
                    >
                        {CATEGORIES.map((cat, i) => {
                            const isActive = activeCategory === cat.key;
                            const chipColor = isActive ? colors.gold : colors.textGhost;
                            return (
                                <Animated.View key={cat.key} entering={FadeInRight.delay(100 + i * 40).duration(300)}>
                                    <Pressable
                                        style={[styles.chip, {
                                            backgroundColor: isActive ? (isDark ? `${colors.gold}18` : `${colors.gold}12`) : (isDark ? colors.surface : '#F2EFE9'),
                                            borderColor: isActive ? colors.gold : (isDark ? colors.border : '#E0DAC8'),
                                        }]}
                                        onPress={() => { haptics.light(); setActiveCategory(cat.key); }}
                                    >
                                        <cat.Icon size={12} color={chipColor} strokeWidth={isActive ? 2.2 : 1.6} />
                                        <Text style={[styles.chipText, { color: chipColor, fontFamily: isActive ? fonts.bodySemiBold : fonts.body }]}>
                                            {cat.label}
                                        </Text>
                                    </Pressable>
                                </Animated.View>
                            );
                        })}
                    </ScrollView>
                </Animated.View>

                {/* Selection bar */}
                <Animated.View entering={FadeInDown.delay(160).duration(400)} style={styles.selectionBar}>
                    <View style={[styles.selectionBadge, { backgroundColor: isDark ? colors.surface : '#F2EFE9', borderColor: isDark ? colors.border : '#E0DAC8' }]}>
                        <Text style={[styles.selectionText, { color: colors.textMuted, fontFamily: fonts.mono }]}>
                            {selectedIds.size} / 5
                        </Text>
                    </View>
                    {selectedIds.size >= 3 && (
                        <Pressable style={[styles.startButton, { backgroundColor: colors.gold, shadowColor: colors.gold }]} onPress={startSession}>
                            <Play size={13} color={colors.void} fill={colors.void} strokeWidth={0} />
                            <Text style={[styles.startText, { color: colors.void, fontFamily: fonts.bodySemiBold }]}>Start Sequence</Text>
                        </Pressable>
                    )}
                </Animated.View>

                {/* Pose Cards */}
                {filteredPoses.map((pose, index) => (
                    <PoseCard
                        key={pose.id}
                        pose={pose}
                        index={index}
                        selected={selectedIds.has(pose.id)}
                        onToggle={() => togglePose(pose.id)}
                    />
                ))}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// ── Styles ──

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingBottom: 100 },
    // Header
    headerRow: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 28, letterSpacing: -0.5 },
    subtitle: { fontSize: 14, marginTop: 2 },
    // Chips
    chipsRow: { paddingHorizontal: spacing.lg, gap: 8, paddingBottom: spacing.sm },
    chip: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 12, paddingVertical: 7,
        borderRadius: borderRadius.full, borderWidth: 1,
    },
    chipText: { fontSize: 12 },
    // Selection
    selectionBar: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: spacing.lg, marginBottom: spacing.md,
    },
    selectionBadge: {
        paddingHorizontal: 12, paddingVertical: 5,
        borderRadius: borderRadius.full, borderWidth: 1,
    },
    selectionText: { fontSize: 12 },
    startButton: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: spacing.md, paddingVertical: 10,
        borderRadius: borderRadius.full,
        shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6,
    },
    startText: { fontSize: 13 },
    // Session
    sessionContainer: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: spacing.xl,
    },
    sessionProgressRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.lg },
    sessionDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1.5 },
    sessionCounter: { fontSize: 13, marginBottom: spacing.md },
    sessionIconOuter: {
        width: 130, height: 130, borderRadius: 65,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, marginBottom: spacing.lg,
    },
    sessionIconInner: {
        width: 100, height: 100, borderRadius: 50,
        alignItems: 'center', justifyContent: 'center',
    },
    sessionName: { fontSize: 26, marginBottom: spacing.sm, letterSpacing: -0.3 },
    sessionCountdown: { fontSize: 56 },
    sessionCountdownLabel: { fontSize: 12, marginBottom: spacing.md },
    sessionBenefit: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: spacing.xl },
    sessionStop: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
        borderRadius: borderRadius.full, borderWidth: 1,
    },
    sessionStopText: { fontSize: 14 },
});

const poseStyles = StyleSheet.create({
    card: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.md,
        marginHorizontal: spacing.lg, marginBottom: spacing.sm,
        padding: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1,
    },
    iconWrap: {
        width: 44, height: 44, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1,
    },
    name: { fontSize: 15 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
    metaChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    metaText: { fontSize: 11 },
    benefit: { fontSize: 12, lineHeight: 17, marginTop: 3 },
    checkCircle: {
        width: 28, height: 28, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
    },
    emptyCircle: {
        width: 28, height: 28, borderRadius: 14, borderWidth: 1.5,
    },
});

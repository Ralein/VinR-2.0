/**
 * Grounding Screen — 5-4-3-2-1 Sensory Exercise
 *
 * Features:
 * - Lucide icons per sense (Eye, Hand, Ear, Flower2, Coffee)
 * - Animated progress bar
 * - Gentle fade between steps
 * - Theme-aware throughout
 * - Animated completion with checkmark
 * - AmbientBackground
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, Pressable, StyleSheet, TextInput, KeyboardAvoidingView, Platform,
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
    FadeIn, FadeInDown, FadeInUp, FadeOut,
    useSharedValue, useAnimatedStyle, withTiming, withSpring,
    withSequence, withRepeat, Easing,
} from 'react-native-reanimated';
import {
    ChevronLeft, Eye, Hand, Ear, Flower2, Coffee,
    ArrowRight, Check, Heart, RotateCcw,
} from 'lucide-react-native';
import { fonts, spacing, borderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import AmbientBackground from '../components/ui/AmbientBackground';
import { haptics } from '../services/haptics';

// ── Types ──

interface GroundingStep {
    count: number;
    sense: string;
    prompt: string;
    Icon: any;
    iconColor: string;
    placeholder: string;
}

const GROUNDING_STEPS: GroundingStep[] = [
    {
        count: 5, sense: 'Sight', prompt: 'Name 5 things you can see',
        Icon: Eye, iconColor: '#4A90D9', placeholder: 'e.g. the ceiling, my phone, a lamp...',
    },
    {
        count: 4, sense: 'Touch', prompt: 'Name 4 things you can feel',
        Icon: Hand, iconColor: '#4ECBA0', placeholder: 'e.g. the chair, my shirt, the air...',
    },
    {
        count: 3, sense: 'Sound', prompt: 'Name 3 things you can hear',
        Icon: Ear, iconColor: '#D4A853', placeholder: 'e.g. a fan, traffic, my breath...',
    },
    {
        count: 2, sense: 'Smell', prompt: 'Name 2 things you can smell',
        Icon: Flower2, iconColor: '#8B7EC8', placeholder: 'e.g. coffee, soap...',
    },
    {
        count: 1, sense: 'Taste', prompt: 'Name 1 thing you can taste',
        Icon: Coffee, iconColor: '#E85D5D', placeholder: 'e.g. toothpaste, tea...',
    },
];

export default function GroundingScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const [currentStep, setCurrentStep] = useState(0);
    const [input, setInput] = useState('');
    const [completed, setCompleted] = useState(false);
    const inputRef = useRef<TextInput>(null);

    // Animation values
    const progressWidth = useSharedValue(0);
    const checkScale = useSharedValue(0);

    // Update progress
    useEffect(() => {
        progressWidth.value = withTiming(
            ((currentStep) / GROUNDING_STEPS.length) * 100,
            { duration: 500, easing: Easing.out(Easing.quad) }
        );
    }, [currentStep]);

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progressWidth.value}%`,
    }));

    const handleNext = useCallback(() => {
        haptics.light();
        setInput('');
        Keyboard.dismiss();

        if (currentStep >= GROUNDING_STEPS.length - 1) {
            // Complete!
            progressWidth.value = withTiming(100, { duration: 400 });
            setCompleted(true);
            haptics.success();
            checkScale.value = withSpring(1, { stiffness: 200, damping: 15 });
        } else {
            setCurrentStep(currentStep + 1);
            setTimeout(() => inputRef.current?.focus(), 400);
        }
    }, [currentStep]);

    const handleRestart = () => {
        haptics.light();
        setCurrentStep(0);
        setInput('');
        setCompleted(false);
        progressWidth.value = withTiming(0, { duration: 400 });
        checkScale.value = withTiming(0, { duration: 300 });
    };

    const checkAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkScale.value }],
    }));

    // ── Completion View ──
    if (completed) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]}>
                <AmbientBackground hideBlobs={true} />
                <View style={styles.completeContainer}>
                    <Animated.View
                        style={[styles.completeCircle, {
                            backgroundColor: `${colors.emerald}15`,
                            borderColor: `${colors.emerald}35`,
                        }, checkAnimStyle]}
                    >
                        <Check size={48} color={colors.emerald} strokeWidth={2} />
                    </Animated.View>
                    <Animated.Text
                        entering={FadeInUp.delay(300).duration(500)}
                        style={[styles.completeTitle, { color: colors.textPrimary, fontFamily: fonts.display }]}
                    >
                        You're grounded.
                    </Animated.Text>
                    <Animated.Text
                        entering={FadeInUp.delay(500).duration(500)}
                        style={[styles.completeSubtitle, { color: colors.textMuted, fontFamily: fonts.body }]}
                    >
                        Take a moment to notice how your body feels right now. You engaged all five senses and brought yourself back to the present.
                    </Animated.Text>

                    <Animated.View entering={FadeInUp.delay(700).duration(400)} style={styles.completeActions}>
                        <Pressable
                            style={[styles.completeBtn, {
                                backgroundColor: colors.gold,
                                shadowColor: colors.gold,
                            }]}
                            onPress={() => { haptics.light(); router.back(); }}
                        >
                            <Text style={[styles.completeBtnText, { color: colors.void, fontFamily: fonts.bodySemiBold }]}>
                                Done — I feel better
                            </Text>
                            <Heart size={14} color={colors.void} strokeWidth={2} />
                        </Pressable>

                        <Pressable
                            style={[styles.restartBtn, { borderColor: isDark ? colors.border : '#E0DAC8' }]}
                            onPress={handleRestart}
                        >
                            <RotateCcw size={14} color={colors.textMuted} strokeWidth={2} />
                            <Text style={[styles.restartText, { color: colors.textMuted, fontFamily: fonts.body }]}>
                                Do it again
                            </Text>
                        </Pressable>
                    </Animated.View>
                </View>
            </SafeAreaView>
        );
    }

    // ── Active Step ──
    const step = GROUNDING_STEPS[currentStep];
    const StepIcon = step.Icon;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]}>
            <AmbientBackground hideBlobs={true} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
                    <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                        <ChevronLeft size={20} color={colors.textPrimary} strokeWidth={2} />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>
                            5-4-3-2-1 Grounding
                        </Text>
                    </View>
                    <View style={[styles.stepBadge, {
                        backgroundColor: isDark ? colors.surface : '#F2EFE9',
                        borderColor: isDark ? colors.border : '#E0DAC8',
                    }]}>
                        <Text style={[styles.stepBadgeText, { color: colors.textMuted, fontFamily: fonts.mono }]}>
                            {currentStep + 1}/{GROUNDING_STEPS.length}
                        </Text>
                    </View>
                </Animated.View>

                {/* Progress Bar */}
                <View style={[styles.progressTrack, { backgroundColor: isDark ? colors.surface : '#E0DAC8' }]}>
                    <Animated.View style={[styles.progressFill, { backgroundColor: step.iconColor }, progressStyle]} />
                </View>

                {/* Step content */}
                <Animated.View
                    key={currentStep}
                    entering={FadeIn.duration(500)}
                    style={styles.stepContainer}
                >
                    {/* Icon */}
                    <View style={[styles.stepIconOuter, {
                        backgroundColor: `${step.iconColor}10`,
                        borderColor: `${step.iconColor}25`,
                    }]}>
                        <View style={[styles.stepIconInner, { backgroundColor: `${step.iconColor}18` }]}>
                            <StepIcon size={36} color={step.iconColor} strokeWidth={1.5} />
                        </View>
                    </View>

                    {/* Count badge */}
                    <View style={[styles.countCircle, { backgroundColor: `${step.iconColor}18`, borderColor: `${step.iconColor}35` }]}>
                        <Text style={[styles.countNumber, { color: step.iconColor, fontFamily: fonts.display }]}>
                            {step.count}
                        </Text>
                    </View>

                    <Text style={[styles.senseLabel, { color: step.iconColor, fontFamily: fonts.bodySemiBold }]}>
                        {step.sense.toUpperCase()}
                    </Text>
                    <Text style={[styles.promptText, { color: colors.textPrimary, fontFamily: fonts.display }]}>
                        {step.prompt}
                    </Text>

                    {/* Input */}
                    <View style={[styles.inputWrap, {
                        backgroundColor: isDark ? colors.surface : '#FAF8F4',
                        borderColor: input.length > 0 ? step.iconColor : (isDark ? colors.border : '#E8E1D0'),
                    }]}>
                        <TextInput
                            ref={inputRef}
                            style={[styles.textInput, {
                                color: colors.textPrimary,
                                fontFamily: fonts.body,
                            }]}
                            placeholder={step.placeholder}
                            placeholderTextColor={colors.textGhost}
                            value={input}
                            onChangeText={setInput}
                            multiline
                            returnKeyType="next"
                            blurOnSubmit={false}
                            onSubmitEditing={handleNext}
                        />
                    </View>
                </Animated.View>

                {/* Next Button */}
                <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.footer}>
                    <Pressable
                        style={[
                            styles.nextBtn,
                            {
                                backgroundColor: input.length > 0 ? colors.textPrimary : (isDark ? colors.surface : '#E0DAC8'),
                                shadowColor: input.length > 0 ? colors.textPrimary : 'transparent',
                            },
                        ]}
                        onPress={handleNext}
                        disabled={input.length === 0}
                    >
                        <Text style={[styles.nextBtnText, {
                            color: input.length > 0 ? colors.void : colors.textGhost,
                            fontFamily: fonts.bodySemiBold,
                        }]}>
                            {currentStep >= GROUNDING_STEPS.length - 1 ? 'Complete' : 'Next'}
                        </Text>
                        {input.length > 0 && <ArrowRight size={16} color={colors.void} strokeWidth={2} />}
                    </Pressable>
                </Animated.View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ── Styles ──

const styles = StyleSheet.create({
    container: { flex: 1 },
    // Header
    header: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
    },
    title: { fontSize: 17 },
    stepBadge: {
        paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: borderRadius.full, borderWidth: 1,
    },
    stepBadgeText: { fontSize: 12 },
    // Progress
    progressTrack: {
        height: 3, marginHorizontal: spacing.lg,
        borderRadius: 2, overflow: 'hidden', marginBottom: spacing.lg,
    },
    progressFill: { height: '100%', borderRadius: 2 },
    // Step
    stepContainer: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: spacing.xl, gap: spacing.md,
    },
    stepIconOuter: {
        width: 100, height: 100, borderRadius: 50,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1,
    },
    stepIconInner: {
        width: 72, height: 72, borderRadius: 36,
        alignItems: 'center', justifyContent: 'center',
    },
    countCircle: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1.5, marginTop: -spacing.sm,
    },
    countNumber: { fontSize: 22 },
    senseLabel: { fontSize: 12, letterSpacing: 2 },
    promptText: { fontSize: 24, textAlign: 'center', letterSpacing: -0.3, lineHeight: 32 },
    // Input
    inputWrap: {
        width: '100%', borderRadius: borderRadius.lg,
        borderWidth: 1, minHeight: 56,
    },
    textInput: {
        fontSize: 15, padding: spacing.md,
        lineHeight: 22,
    },
    // Footer
    footer: {
        paddingHorizontal: spacing.lg, paddingBottom: spacing.xl,
    },
    nextBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, borderRadius: borderRadius.lg,
        paddingVertical: 18,
        shadowOpacity: 0.2, shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 }, elevation: 6,
    },
    nextBtnText: { fontSize: 16 },
    // Complete
    completeContainer: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: spacing.xl, gap: spacing.md,
    },
    completeCircle: {
        width: 110, height: 110, borderRadius: 55,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, marginBottom: spacing.md,
    },
    completeTitle: { fontSize: 28, textAlign: 'center', letterSpacing: -0.5 },
    completeSubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, paddingHorizontal: spacing.md },
    completeActions: { gap: spacing.md, width: '100%', marginTop: spacing.lg },
    completeBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, borderRadius: borderRadius.lg, paddingVertical: 18,
        shadowOpacity: 0.3, shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 }, elevation: 6,
    },
    completeBtnText: { fontSize: 16 },
    restartBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, borderRadius: borderRadius.lg, paddingVertical: spacing.md,
        borderWidth: 1,
    },
    restartText: { fontSize: 14 },
});

/**
 * Breathing Screen — Guided breathing visualizer with theme support
 *
 * Features:
 * - Expandable circle animation with gradient orb
 * - Duration picker (1, 3, 5 min)
 * - Phase indicator (inhale / hold / exhale)
 * - Progress ring on play/pause
 * - Technique info panel
 * - Full light/dark theme support
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedProps,
    withTiming,
    withRepeat,
    withSequence,
    Easing,
    interpolate,
    FadeIn,
    FadeOut,
    FadeInDown,
    runOnJS,
    withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { X, Play, Pause, Wind, Clock, Info, ChevronLeft, Timer, Sparkles } from 'lucide-react-native';
import { fonts, spacing, borderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import AmbientBackground from '../components/ui/AmbientBackground';
import { haptics } from '../services/haptics';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);


const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Phase = 'inhale' | 'holdInhale' | 'exhale' | 'holdExhale' | 'idle';

interface BreathingConfig {
    inhale: number;
    holdInhale: number;
    exhale: number;
    holdExhale: number;
    label: string;
    description: string;
}

const DURATION_OPTIONS = [
    { label: '1 min', seconds: 60 },
    { label: '3 min', seconds: 180 },
    { label: '5 min', seconds: 300 },
];

export default function BreathingScreen() {
    const { name } = useLocalSearchParams();
    const { colors, isDark } = useTheme();
    const breathingType = name?.toString().toLowerCase() || 'relax';

    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState<Phase>('idle');
    const [selectedDuration, setSelectedDuration] = useState(1); // index into DURATION_OPTIONS
    const [timeRemaining, setTimeRemaining] = useState(DURATION_OPTIONS[1].seconds);
    const [showInfo, setShowInfo] = useState(false);

    // Animation values
    const progress = useSharedValue(0);
    const pulse = useSharedValue(1);

    const config: BreathingConfig = React.useMemo(() => {
        if (breathingType.includes('box')) {
            return {
                inhale: 4000, holdInhale: 4000, exhale: 4000, holdExhale: 4000,
                label: 'Box Breathing (4-4-4-4)',
                description: 'Equal counts of inhale, hold, exhale, hold. Used by Navy SEALs to control stress response.',
            };
        } else if (breathingType.includes('4-7-8') || breathingType.includes('478')) {
            return {
                inhale: 4000, holdInhale: 7000, exhale: 8000, holdExhale: 0,
                label: '4-7-8 Sleep Breath',
                description: 'A natural tranquilizer for the nervous system. Developed by Dr. Andrew Weil.',
            };
        }
        return {
            inhale: 4000, holdInhale: 2000, exhale: 6000, holdExhale: 0,
            label: 'Relaxation Breathing',
            description: 'Extended exhale activates your parasympathetic nervous system, promoting calm.',
        };
    }, [breathingType]);

    // Timer countdown
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining((t) => t - 1);
            }, 1000);
        } else if (timeRemaining === 0) {
            stopExercise();
        }
        return () => clearInterval(interval);
    }, [isActive, timeRemaining]);

    const phaseColor = useSharedValue<string>(colors.sapphire as string);

    const updatePhase = (newPhase: Phase) => {
        setPhase(newPhase);
        // Map phase to color for interpolation
        let targetColor: string = colors.sapphire;
        if (newPhase === 'inhale') targetColor = colors.sapphire;
        else if (newPhase === 'holdInhale') targetColor = colors.lavender || '#8B7EC8';
        else if (newPhase === 'exhale') targetColor = colors.emerald;
        else if (newPhase === 'holdExhale') targetColor = colors.gold;
        
        phaseColor.value = withTiming(targetColor, { duration: 800 });
    };

    const runCycle = useCallback(() => {
        if (!isActive) return;

        runOnJS(updatePhase)('inhale');
        haptics.medium();
        
        progress.value = withTiming(1, { duration: config.inhale, easing: Easing.inOut(Easing.quad) }, (finished) => {
            if (finished && isActive) {
                const startExhale = () => {
                    if (!isActive) return;
                    runOnJS(updatePhase)('exhale');
                    haptics.medium();
                    progress.value = withTiming(0, { duration: config.exhale, easing: Easing.inOut(Easing.quad) }, (exFinished) => {
                        if (exFinished && isActive) {
                            const startNextCycle = () => {
                                if (isActive) runCycle();
                            };
                            if (config.holdExhale > 0) {
                                runOnJS(updatePhase)('holdExhale');
                                progress.value = withTiming(0, { duration: config.holdExhale }, (hkFinished) => {
                                    if (hkFinished && isActive) runOnJS(startNextCycle)();
                                });
                            } else {
                                runOnJS(startNextCycle)();
                            }
                        }
                    });
                };

                if (config.holdInhale > 0) {
                    runOnJS(updatePhase)('holdInhale');
                    progress.value = withTiming(1, { duration: config.holdInhale }, (holdFinished) => {
                        if (holdFinished && isActive) runOnJS(startExhale)();
                    });
                } else {
                    runOnJS(startExhale)();
                }
            }
        });
    }, [isActive, config]);


    useEffect(() => {
        if (isActive) {
            runCycle();
            pulse.value = withRepeat(
                withSequence(
                    withTiming(1.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            ) as any;
        } else {
            setPhase('idle');
            progress.value = withTiming(0, { duration: 1000 });
            pulse.value = withTiming(1, { duration: 1000 });
        }
    }, [isActive]);

    const toggleExercise = () => {
        haptics.light();
        if (!isActive) {
            setTimeRemaining(DURATION_OPTIONS[selectedDuration].seconds);
        }
        setIsActive(!isActive);
    };

    const stopExercise = () => {
        haptics.light();
        setIsActive(false);
    };

    const handleDurationSelect = (index: number) => {
        if (isActive) return;
        haptics.light();
        setSelectedDuration(index);
        setTimeRemaining(DURATION_OPTIONS[index].seconds);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // ── Animated styles ──

    const circleStyle = useAnimatedStyle(() => {
        const scale = interpolate(progress.value, [0, 1], [1, 2.5]);
        const opacity = interpolate(progress.value, [0, 1], [0.4, 0.9]);
        return { 
            transform: [{ scale }], 
            opacity,
            backgroundColor: phaseColor.value
        };
    });

    const outerRingStyle = useAnimatedStyle(() => {
        const scale = interpolate(progress.value, [0, 1], [1.2, 3.2]);
        const opacity = interpolate(progress.value, [0, 1], [0.15, 0.5]);
        return { 
            transform: [{ scale: scale * pulse.value }], 
            opacity,
            backgroundColor: phaseColor.value
        };
    });

    const getPhaseText = () => {
        switch (phase) {
            case 'inhale': return 'Breathe In';
            case 'holdInhale': return 'Hold';
            case 'exhale': return 'Breathe Out';
            case 'holdExhale': return 'Wait';
            default: return 'Tap to begin';
        }
    };

    const getPhaseColor = () => {
        switch (phase) {
            case 'inhale': return colors.sapphire;
            case 'holdInhale': return colors.lavender || colors.gold;
            case 'exhale': return colors.emerald;
            case 'holdExhale': return colors.gold;
            default: return colors.textMuted;
        }
    };

    const totalDuration = DURATION_OPTIONS[selectedDuration].seconds;
    const progressPercent = 1 - (timeRemaining / totalDuration);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]}>
            <AmbientBackground 
                topColor={isActive ? `${phaseColor.value}15` : undefined} 
                hideBlobs={!isActive}
            />

            {/* Header */}
            <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
                <Pressable onPress={() => router.back()} style={[styles.closeButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                    <ChevronLeft size={20} color={colors.textPrimary} strokeWidth={2} />
                </Pressable>
                <View style={{ alignItems: 'center' }}>
                    <Text style={[styles.titleText, { color: colors.textMuted, fontFamily: fonts.body }]}>
                        {name || 'Breathing'}
                    </Text>
                    <Text style={[styles.timer, { color: colors.textPrimary, fontFamily: fonts.display }]}>
                        {formatTime(timeRemaining)}
                    </Text>
                </View>
                <Pressable
                    onPress={() => setShowInfo(!showInfo)}
                    style={[styles.closeButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
                >
                    <Info size={18} color={colors.textMuted} strokeWidth={2} />
                </Pressable>
            </Animated.View>

            {/* Duration Picker */}
            {!isActive && (
                <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.durationRow}>
                    {DURATION_OPTIONS.map((opt, index) => (
                        <Pressable
                            key={opt.seconds}
                            style={[
                                styles.durationChip,
                                {
                                    backgroundColor: selectedDuration === index
                                        ? (isDark ? `${colors.sapphire}25` : `${colors.sapphire}15`)
                                        : (isDark ? colors.elevated : '#FAF8F4'),
                                    borderColor: selectedDuration === index
                                        ? colors.sapphire
                                        : (isDark ? colors.border : '#E2DBC8'),
                                    transform: [{ scale: selectedDuration === index ? 1.05 : 1 }],
                                },
                            ]}
                            onPress={() => handleDurationSelect(index)}
                        >
                            {selectedDuration === index && (
                                <Animated.View entering={FadeIn.duration(200)}>
                                    <Sparkles size={12} color={colors.sapphire} strokeWidth={2.5} />
                                </Animated.View>
                            )}
                            <Text style={[
                                styles.durationText,
                                {
                                    color: selectedDuration === index ? colors.sapphire : colors.textMuted,
                                    fontFamily: selectedDuration === index ? fonts.bodySemiBold : fonts.body,
                                },
                            ]}>
                                {opt.label}
                            </Text>
                        </Pressable>
                    ))}
                </Animated.View>
            )}


            {/* Visualizer & Progress Ring */}
            <View style={styles.content}>
                <View style={styles.visualizerContainer}>
                    {/* SVG Progress Ring */}
                    <Svg width={SCREEN_WIDTH * 0.85} height={SCREEN_WIDTH * 0.85} style={StyleSheet.absoluteFill}>
                        <Circle
                            cx={(SCREEN_WIDTH * 0.85) / 2}
                            cy={(SCREEN_WIDTH * 0.85) / 2}
                            r={(SCREEN_WIDTH * 0.85) / 2 - 4}
                            stroke={isDark ? colors.surface : '#E0DAC8'}
                            strokeWidth={3}
                            fill="transparent"
                        />
                        <AnimatedCircle
                            cx={(SCREEN_WIDTH * 0.85) / 2}
                            cy={(SCREEN_WIDTH * 0.85) / 2}
                            r={(SCREEN_WIDTH * 0.85) / 2 - 4}
                            stroke={colors.sapphire}
                            strokeWidth={4}
                            fill="transparent"
                            strokeDasharray={(SCREEN_WIDTH * 0.85 - 8) * Math.PI}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${(SCREEN_WIDTH * 0.85) / 2} ${(SCREEN_WIDTH * 0.85) / 2})`}
                            animatedProps={useAnimatedProps(() => ({
                                strokeDashoffset: ((SCREEN_WIDTH * 0.85 - 8) * Math.PI) * (1 - (1 - (timeRemaining / DURATION_OPTIONS[selectedDuration].seconds))),
                                stroke: phaseColor.value,
                            }))}
                        />
                    </Svg>

                    <Animated.View style={[styles.outerRing, outerRingStyle]} />
                    <Animated.View style={[styles.circle, circleStyle]}>
                        <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={StyleSheet.absoluteFill}>
                            <Defs>
                                <LinearGradient id="orbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <Stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                                    <Stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
                                    <Stop offset="100%" stopColor="rgba(255,255,255,0)" />
                                </LinearGradient>
                            </Defs>
                            <Circle cx={CIRCLE_SIZE/2} cy={CIRCLE_SIZE/2} r={CIRCLE_SIZE/2} fill="url(#orbGrad)" />
                        </Svg>
                    </Animated.View>

                    <View style={styles.textOverlay}>
                        <Text style={[styles.phaseText, {
                            color: colors.textPrimary,
                            fontFamily: fonts.display,
                            fontSize: phase === 'idle' ? 20 : 26,
                        }]}>
                            {getPhaseText()}
                        </Text>
                        {phase !== 'idle' && (
                            <View style={[styles.phaseBadge, { backgroundColor: `${getPhaseColor()}18`, borderColor: `${getPhaseColor()}40` }]}>
                                <View style={[styles.phaseDot, { backgroundColor: getPhaseColor() }]} />
                                <Text style={[styles.phaseBadgeText, { color: getPhaseColor(), fontFamily: fonts.bodySemiBold }]}>
                                    {phase === 'inhale' ? 'Expanding' : phase === 'exhale' ? 'Releasing' : 'Holding'}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Controls */}
                <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.controls}>
                    <Pressable
                        style={[styles.playButton, {
                            backgroundColor: colors.textPrimary,
                            shadowColor: colors.textPrimary,
                        }]}
                        onPress={toggleExercise}
                    >
                        {isActive ? (
                            <Pause size={28} color={colors.void} fill={colors.void} />
                        ) : (
                            <Play size={28} color={colors.void} fill={colors.void} style={{ marginLeft: 3 }} />
                        )}
                    </Pressable>
                </Animated.View>
            </View>


            {/* Technique Info Panel */}
            {showInfo && (
                <Animated.View
                    entering={FadeInDown.duration(350)}
                    style={[styles.infoPanel, {
                        backgroundColor: isDark ? colors.surface : '#FFFFFF',
                        borderColor: isDark ? colors.border : '#E0DAC8',
                    }]}
                >
                    <View style={styles.infoPanelHeader}>
                        <Wind size={16} color={colors.sapphire} strokeWidth={2} />
                        <Text style={[styles.infoPanelTitle, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>
                            {config.label}
                        </Text>
                    </View>
                    <Text style={[styles.infoPanelDesc, { color: colors.textMuted, fontFamily: fonts.body }]}>
                        {config.description}
                    </Text>
                    <View style={styles.infoPanelPattern}>
                        {[
                            { label: 'Inhale', value: `${config.inhale / 1000}s`, color: colors.sapphire },
                            ...(config.holdInhale > 0 ? [{ label: 'Hold', value: `${config.holdInhale / 1000}s`, color: colors.lavender || colors.gold }] : []),
                            { label: 'Exhale', value: `${config.exhale / 1000}s`, color: colors.emerald },
                            ...(config.holdExhale > 0 ? [{ label: 'Hold', value: `${config.holdExhale / 1000}s`, color: colors.gold }] : []),
                        ].map((item, i) => (
                            <View key={i} style={[styles.patternChip, { backgroundColor: `${item.color}12`, borderColor: `${item.color}30` }]}>
                                <Text style={[styles.patternLabel, { color: item.color, fontFamily: fonts.bodySemiBold }]}>{item.label}</Text>
                                <Text style={[styles.patternValue, { color: item.color, fontFamily: fonts.mono }]}>{item.value}</Text>
                            </View>
                        ))}
                    </View>
                </Animated.View>
            )}
        </SafeAreaView>
    );
}

const CIRCLE_SIZE = 110;

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: spacing.lg, paddingTop: spacing.sm,
    },
    closeButton: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
    },
    timer: { fontSize: 22, fontVariant: ['tabular-nums'] },
    titleText: { fontSize: 13, marginBottom: 2, textTransform: 'capitalize' },
    // Duration picker
    durationRow: {
        flexDirection: 'row', justifyContent: 'center',
        gap: 10, paddingHorizontal: spacing.lg, marginTop: spacing.md,
    },
    durationChip: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: borderRadius.full, borderWidth: 1,
    },
    durationText: { fontSize: 13 },
    // Visualizer
    content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    visualizerContainer: {
        width: SCREEN_WIDTH * 0.85, height: SCREEN_WIDTH * 0.85,
        alignItems: 'center', justifyContent: 'center',
    },

    outerRing: {
        position: 'absolute', width: CIRCLE_SIZE, height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
    },
    circle: {
        position: 'absolute', width: CIRCLE_SIZE, height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2, overflow: 'hidden',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    textOverlay: {
        position: 'absolute', alignItems: 'center', justifyContent: 'center', gap: 10,
    },
    phaseText: {
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 8,
    },
    phaseBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 12, paddingVertical: 5,
        borderRadius: borderRadius.full, borderWidth: 1,
    },
    phaseDot: { width: 6, height: 6, borderRadius: 3 },
    phaseBadgeText: { fontSize: 11 },
    // Controls
    controls: { marginTop: 20, marginBottom: 20 },
    playButton: {
        width: 72, height: 72, borderRadius: 36,
        alignItems: 'center', justifyContent: 'center',
        shadowOpacity: 0.25, shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 }, elevation: 8,
    },
    // Info panel
    infoPanel: {
        marginHorizontal: spacing.lg, marginBottom: spacing.xl,
        borderRadius: borderRadius.lg, padding: spacing.md,
        borderWidth: 1,
    },
    infoPanelHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8,
    },
    infoPanelTitle: { fontSize: 15 },
    infoPanelDesc: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
    infoPanelPattern: {
        flexDirection: 'row', gap: 8, flexWrap: 'wrap',
    },
    patternChip: {
        alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: borderRadius.md, borderWidth: 1, gap: 2,
    },
    patternLabel: { fontSize: 10 },
    patternValue: { fontSize: 14 },
});

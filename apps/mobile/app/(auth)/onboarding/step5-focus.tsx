import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressDots } from '../../../components/onboarding/ProgressDots';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useTheme } from '../../../context/ThemeContext';
import Animated, {
    FadeIn,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
} from 'react-native-reanimated';
import {
    ArrowLeft,
    Check,
    Wind,
    Target,
    Sparkles,
    Shield,
    Zap,
    Brain,
} from 'lucide-react-native';
import GlassCard from '../../../components/ui/GlassCard';
import { haptics } from '../../../services/haptics';
import { OnboardingBackground } from '../../../components/ui/OnboardingBackground';
import { LiquidCTA } from '../../../components/ui/LiquidCTA';

const { height } = Dimensions.get('window');

const GOALS = [
    { id: 'stress', label: 'Reduce Stress & Anxiety', icon: Wind },
    { id: 'focus', label: 'Sharpen Focus', icon: Target },
    { id: 'self_care', label: 'Daily Self-Care', icon: Sparkles },
    { id: 'discipline', label: 'Build Discipline', icon: Shield },
    { id: 'productivity', label: 'Boost Productivity', icon: Zap },
    { id: 'mindfulness', label: 'Daily Mindfulness', icon: Brain },
];

export default function Step5Focus() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { focusAreas, setFocusAreas } = useOnboardingStore();

    // Animations
    const headerOp = useSharedValue(0);
    const titleOp = useSharedValue(0);
    const subtitleOp = useSharedValue(0);

    useEffect(() => {
        headerOp.value = withDelay(80, withTiming(1, { duration: 400 }));
        titleOp.value = withDelay(200, withTiming(1, { duration: 500 }));
        subtitleOp.value = withDelay(350, withTiming(1, { duration: 500 }));
    }, []);

    const headerStyle = useAnimatedStyle(() => ({
        opacity: headerOp.value,
    }));

    const titleStyle = useAnimatedStyle(() => ({
        opacity: titleOp.value,
    }));

    const subtitleStyle = useAnimatedStyle(() => ({
        opacity: subtitleOp.value,
    }));

    const toggleGoal = (id: string) => {
        if (focusAreas.includes(id)) {
            setFocusAreas(focusAreas.filter((g) => g !== id));
        } else {
            setFocusAreas([...focusAreas, id]);
        }
    };

    const handleNext = () => {
        if (focusAreas.length > 0) {
            router.push('/onboarding/step6-identity');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.void }]}>
            <OnboardingBackground />

            <View
                style={[
                    styles.content,
                    {
                        paddingTop: insets.top + (height > 800 ? 28 : 12),
                        paddingBottom: insets.bottom + 20,
                    },
                ]}
            >
                {/* ─── Header ─── */}
                <Animated.View style={[styles.header, headerStyle]}>
                    <Pressable
                        onPress={() => router.back()}
                        style={[styles.backButton, { backgroundColor: '#FFFFFF05', borderColor: colors.border }]}
                    >
                        <ArrowLeft size={24} color={colors.textPrimary} strokeWidth={1.5} />
                    </Pressable>
                    <ProgressDots currentStep={5} totalSteps={9} />
                </Animated.View>

                {/* ─── Title ─── */}
                <Animated.View style={[styles.titleSection, titleStyle]}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>
                        Focus your intent
                    </Text>
                </Animated.View>

                {/* ─── Subtitle ─── */}
                <Animated.View style={[styles.subtitleSection, subtitleStyle]}>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        A journey without a destination is just a walk. Define your zenith.
                    </Text>
                </Animated.View>

                {/* ─── Goals Grid ─── */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.grid}
                    showsVerticalScrollIndicator={false}
                >
                    {GOALS.map((goal, index) => {
                        const isSelected = focusAreas.includes(goal.id);
                        const Icon = goal.icon;
                        return (
                            <Animated.View
                                key={goal.id}
                                entering={FadeIn.duration(700)
                                    .delay(500 + index * 35)}
                                style={styles.goalWrapper}
                            >
                                <Pressable
                                    onPress={() => {
                                        haptics.light();
                                        toggleGoal(goal.id);
                                    }}
                                    style={({ pressed }) => [
                                        styles.goalPressable,
                                        pressed && styles.goalPressed,
                                    ]}
                                >
                                    <GlassCard
                                        glow={isSelected}
                                        hideGlow={true}
                                    >
                                        <View style={styles.goalCard}>
                                            <View
                                                style={[
                                                    styles.iconContainer,
                                                    {
                                                        backgroundColor: isSelected
                                                            ? `${colors.gold}15`
                                                            : colors.surface,
                                                    },
                                                ]}
                                            >
                                                <Icon
                                                    size={24}
                                                    color={
                                                        isSelected
                                                            ? colors.gold
                                                            : colors.textGhost
                                                    }
                                                    strokeWidth={1.5}
                                                />
                                            </View>
                                            <Text
                                                style={[
                                                    styles.label,
                                                    {
                                                        color: isSelected
                                                            ? colors.gold
                                                            : colors.textPrimary,
                                                    },
                                                    isSelected && styles.labelSelected,
                                                ]}
                                            >
                                                {goal.label}
                                            </Text>

                                            <View
                                                style={[
                                                    styles.checkbox,
                                                    {
                                                        borderColor: isSelected
                                                            ? colors.gold
                                                            : colors.border,
                                                    },
                                                    isSelected && {
                                                        backgroundColor: colors.gold,
                                                    },
                                                ]}
                                            >
                                                {isSelected && (
                                                    <Check
                                                        size={12}
                                                        color={colors.void}
                                                        strokeWidth={4}
                                                    />
                                                )}
                                            </View>
                                        </View>
                                    </GlassCard>
                                </Pressable>
                            </Animated.View>
                        );
                    })}
                </ScrollView>

                {/* ─── Footer ─── */}
                <View style={[styles.footer, { paddingTop: 16 }]}>
                    <LiquidCTA
                        label="SET FOCUS"
                        delay={1200}
                        onPress={handleNext}
                        isDisabled={focusAreas.length === 0}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 28,
    },
    header: {
        marginBottom: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    titleSection: {
        marginBottom: 12,
    },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 32,
        lineHeight: 40,
    },
    subtitleSection: {
        marginBottom: 20,
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        lineHeight: 24,
        opacity: 0.7,
    },
    scrollView: {
        flex: 1,
    },
    grid: {
        paddingVertical: 8,
        gap: 12,
    },
    goalWrapper: {
        width: '100%',
    },
    goalPressable: {
        width: '100%',
    },
    goalPressed: {
        transform: [{ scale: 0.985 }],
    },
    goalCard: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    label: {
        fontFamily: 'DMSans_500Medium',
        fontSize: 16,
        flex: 1,
    },
    labelSelected: {
        fontFamily: 'DMSans_700Bold',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        width: '100%',
    },
});
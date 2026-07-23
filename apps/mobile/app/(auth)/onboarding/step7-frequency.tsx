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
import { ArrowLeft } from 'lucide-react-native';
import GlassCard from '../../../components/ui/GlassCard';
import { haptics } from '../../../services/haptics';
import { OnboardingBackground } from '../../../components/ui/OnboardingBackground';
import { LiquidCTA } from '../../../components/ui/LiquidCTA';

const { height } = Dimensions.get('window');

const COMMITMENTS = [
    { id: '1-2', label: '1-2 days / week', sub: 'The balanced introduction' },
    { id: '3-5', label: '3-5 days / week', sub: 'The path of discipline' },
    { id: 'daily', label: 'Every day', sub: 'The standard of excellence' },
];

export default function Step7Frequency() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { dailyTime, setDailyTime } = useOnboardingStore();

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

    const handleNext = () => {
        if (dailyTime) {
            router.push('/onboarding/step8-reminder');
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
                    <ProgressDots currentStep={7} totalSteps={9} />
                </Animated.View>

                {/* ─── Title ─── */}
                <Animated.View style={[styles.titleSection, titleStyle]}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>
                        Define your pace
                    </Text>
                </Animated.View>

                {/* ─── Subtitle ─── */}
                <Animated.View style={[styles.subtitleSection, subtitleStyle]}>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Consistency is the bedrock of refinement. How often shall you dedicate yourself?
                    </Text>
                </Animated.View>

                {/* ─── Options Scroll ─── */}
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {COMMITMENTS.map((item, index) => {
                        const isSelected = dailyTime === item.id;
                        return (
                            <Animated.View
                                key={item.id}
                                entering={FadeIn.duration(800)
                                    .delay(500 + index * 100)}
                                style={styles.optionWrapper}
                            >
                                <Pressable
                                    onPress={() => {
                                        haptics.light();
                                        setDailyTime(item.id);
                                    }}
                                    style={({ pressed }) => [
                                        styles.optionPressable,
                                        pressed && styles.optionPressed,
                                    ]}
                                >
                                    <GlassCard
                                        accent={isSelected ? 'gold' : undefined}
                                        glow={isSelected}
                                    >
                                        <View style={styles.optionCard}>
                                            <View style={styles.optionInfo}>
                                                <Text
                                                    style={[
                                                        styles.optionLabel,
                                                        {
                                                            color: isSelected
                                                                ? colors.gold
                                                                : colors.textPrimary,
                                                        },
                                                        isSelected && styles.optionLabelSelected,
                                                    ]}
                                                >
                                                    {item.label}
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.optionSub,
                                                        {
                                                            color: colors.textSecondary,
                                                            opacity: 0.6,
                                                        },
                                                    ]}
                                                >
                                                    {item.sub}
                                                </Text>
                                            </View>

                                            <View
                                                style={[
                                                    styles.radio,
                                                    {
                                                        borderColor: isSelected
                                                            ? colors.gold
                                                            : colors.border,
                                                    },
                                                ]}
                                            >
                                                {isSelected && (
                                                    <View
                                                        style={[
                                                            styles.radioInner,
                                                            { backgroundColor: colors.gold },
                                                        ]}
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
                        label="SET FREQUENCY"
                        delay={1000}
                        onPress={handleNext}
                        isDisabled={!dailyTime}
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
        marginBottom: 16,
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
        marginBottom: 10,
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
    scrollContent: {
        paddingVertical: 12,
    },
    optionWrapper: {
        marginBottom: 16,
    },
    optionPressable: {
        width: '100%',
    },
    optionPressed: {
        transform: [{ scale: 0.985 }],
    },
    optionCard: {
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionInfo: {
        flex: 1,
    },
    optionLabel: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 18,
        marginBottom: 6,
    },
    optionLabelSelected: {
        fontFamily: 'DMSans_700Bold',
    },
    optionSub: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 16,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    footer: {
        width: '100%',
    },
});

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Switch,
    Platform,
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
import { ArrowLeft, Bell, Calendar, Trophy } from 'lucide-react-native';
import GlassCard from '../../../components/ui/GlassCard';
import { OnboardingBackground } from '../../../components/ui/OnboardingBackground';
import { LiquidCTA } from '../../../components/ui/LiquidCTA';

const { height } = Dimensions.get('window');

export default function Step8Reminder() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { notificationsEnabled, setNotificationsEnabled } = useOnboardingStore();
    const [isEnabled, setIsEnabled] = useState(notificationsEnabled);

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

    const toggleSwitch = (value: boolean) => {
        setIsEnabled(value);
        setNotificationsEnabled(value);
    };

    const handleNext = () => {
        router.push('/onboarding/step9-finish');
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
                    <ProgressDots currentStep={8} totalSteps={9} />
                </Animated.View>

                {/* ─── Title ─── */}
                <Animated.View style={[styles.titleSection, titleStyle]}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>
                        Maintain the rhythm
                    </Text>
                </Animated.View>

                {/* ─── Subtitle ─── */}
                <Animated.View style={[styles.subtitleSection, subtitleStyle]}>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        A gentle nudge to keep you aligned. Reminders are the anchors of daily discipline.
                    </Text>
                </Animated.View>

                {/* ─── Content ─── */}
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <Animated.View
                        entering={FadeIn.duration(800).delay(500)}
                    >
                        <GlassCard
                            accent={isEnabled ? 'gold' : undefined}
                            glow={isEnabled}
                            style={styles.card}
                        >
                            <View style={styles.iconContainer}>
                                <View
                                    style={[
                                        styles.iconCircle,
                                        {
                                            backgroundColor: isEnabled
                                                ? `${colors.gold}15`
                                                : colors.surface,
                                            borderColor: isEnabled
                                                ? colors.gold
                                                : colors.border,
                                        },
                                    ]}
                                >
                                    <Bell
                                        size={32}
                                        color={isEnabled ? colors.gold : colors.textGhost}
                                        strokeWidth={1.5}
                                    />
                                </View>
                            </View>

                            <View style={styles.toggleRow}>
                                <View style={styles.toggleTextContainer}>
                                    <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>
                                        Presence Notifications
                                    </Text>
                                    <Text style={[styles.toggleSub, { color: colors.textSecondary, opacity: 0.6 }]}>
                                        Receive a refined cue for your daily practice.
                                    </Text>
                                </View>
                                <Switch
                                    trackColor={{ false: colors.elevated, true: colors.gold }}
                                    thumbColor={
                                        Platform.OS === 'ios'
                                            ? undefined
                                            : isEnabled
                                            ? colors.textPrimary
                                            : colors.surface
                                    }
                                    ios_backgroundColor={colors.elevated}
                                    onValueChange={toggleSwitch}
                                    value={isEnabled}
                                />
                            </View>

                            {isEnabled && (
                                <Animated.View
                                    entering={FadeIn.duration(400)}
                                    style={[styles.detailRow, { borderTopColor: colors.border }]}
                                >
                                    <Calendar
                                        size={18}
                                        color={colors.gold}
                                        style={{ marginRight: 8 }}
                                        strokeWidth={2}
                                    />
                                    <Text style={[styles.detailText, { color: colors.gold }]}>
                                        Scheduled for 9:00 AM daily
                                    </Text>
                                </Animated.View>
                            )}
                        </GlassCard>
                    </Animated.View>

                    <Animated.View
                        entering={FadeIn.duration(800).delay(700)}
                    >
                        <GlassCard accent="gold">
                            <View style={styles.quoteBox}>
                                <Trophy
                                    size={20}
                                    color={colors.gold}
                                    style={styles.quoteIcon}
                                    strokeWidth={1.5}
                                />
                                <Text style={[styles.quoteText, { color: colors.gold }]}>
                                    "Consistency is what transforms average into excellence."
                                </Text>
                            </View>
                        </GlassCard>
                    </Animated.View>
                </ScrollView>

                {/* ─── Footer ─── */}
                <View style={[styles.footer, { paddingTop: 16 }]}>
                    <LiquidCTA
                        label={isEnabled ? 'ENABLE & CONTINUE' : 'CONTINUE'}
                        delay={1000}
                        onPress={handleNext}
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
    card: {
        padding: 20,
        marginBottom: 20,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    toggleTextContainer: {
        flex: 1,
        marginRight: 16,
    },
    toggleTitle: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 18,
    },
    toggleSub: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
        marginTop: 4,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 18,
        paddingTop: 18,
        borderTopWidth: 1,
    },
    detailText: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 15,
    },
    quoteBox: {
        alignItems: 'center',
        padding: 20,
    },
    quoteIcon: {
        marginBottom: 10,
        opacity: 0.6,
    },
    quoteText: {
        fontFamily: 'DMSans_400Regular',
        fontStyle: 'italic',
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        opacity: 0.8,
    },
    footer: {
        width: '100%',
    },
});

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressDots } from '../../../components/onboarding/ProgressDots';
import { useTheme } from '../../../context/ThemeContext';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import Animated, {
    FadeInDown,
    FadeIn,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSpring,
} from 'react-native-reanimated';
import { ArrowLeft } from 'lucide-react-native';
import GlassCard from '../../../components/ui/GlassCard';
import { OnboardingBackground } from '../../../components/ui/OnboardingBackground';
import { LiquidCTA } from '../../../components/ui/LiquidCTA';

export default function Step3Age() {
    const { colors, fonts } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const onboarding = useOnboardingStore();
    const [age, setAge] = useState(onboarding.age || '');
    const [isFocused, setIsFocused] = useState(false);

    // Animations
    const headerOp = useSharedValue(0);
    const titleOp = useSharedValue(0);
    const subtitleOp = useSharedValue(0);
    const inputOp = useSharedValue(0);

    useEffect(() => {
        headerOp.value = withDelay(150, withTiming(1, { duration: 400 }));
        titleOp.value = withDelay(350, withTiming(1, { duration: 500 }));
        subtitleOp.value = withDelay(550, withTiming(1, { duration: 500 }));
        inputOp.value = withDelay(750, withTiming(1, { duration: 500 }));
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

    const inputStyle = useAnimatedStyle(() => ({
        opacity: inputOp.value,
    }));

    const handleNext = () => {
        if (age.length > 0 && isAgeValid) {
            router.push('/onboarding/step5-focus');
        }
    };

    const isAgeValid = parseInt(age) >= 13 && parseInt(age) <= 100;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.container, { backgroundColor: colors.void }]}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <OnboardingBackground />

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.flexFill}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* ─── Header ─── */}
                        <Animated.View style={[styles.header, { marginTop: insets.top + 20 }, headerStyle]}>
                            <Pressable
                                onPress={() => router.back()}
                                style={[styles.backButton, { backgroundColor: '#FFFFFF05', borderColor: colors.border }]}
                            >
                                <ArrowLeft size={24} color={colors.textPrimary} strokeWidth={1.5} />
                            </Pressable>
                            <ProgressDots currentStep={3} totalSteps={9} />
                        </Animated.View>

                        {/* ─── Title ─── */}
                        <Animated.View style={[styles.titleSection, titleStyle]}>
                            <Text style={[styles.title, { color: colors.textPrimary }]}>
                                How old are you?
                            </Text>
                        </Animated.View>

                        {/* ─── Subtitle ─── */}
                        <Animated.View style={[styles.subtitleSection, subtitleStyle]}>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                Wisdom matures with time, and every season brings its own clarity.
                            </Text>
                        </Animated.View>

                        {/* ─── Input ─── */}
                        <Animated.View style={[styles.inputSection, inputStyle]}>
                            <GlassCard
                                accent={isFocused || isAgeValid ? 'gold' : undefined}
                                glow={isFocused}
                            >
                                <View style={styles.ageInputContainer}>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            {
                                                color: colors.gold,
                                                fontFamily: 'DMSans_700Bold',
                                            },
                                        ]}
                                        placeholder="00"
                                        placeholderTextColor={`${colors.gold}20`}
                                        value={age}
                                        onChangeText={(text) =>
                                            setAge(
                                                text
                                                    .replace(/[^0-9]/g, '')
                                                    .slice(0, 2)
                                            )
                                        }
                                        keyboardType="number-pad"
                                        maxLength={2}
                                        autoFocus
                                        selectionColor={colors.gold}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                    />
                                    <Text
                                        style={[
                                            styles.yearsText,
                                            {
                                                color: colors.textSecondary,
                                                fontFamily: fonts.body,
                                            },
                                        ]}
                                    >
                                        years
                                    </Text>
                                </View>
                            </GlassCard>
                            {!isAgeValid && age.length === 2 && (
                                <Animated.View entering={FadeIn}>
                                    <Text style={[styles.errorText, { color: colors.crimson }]}>
                                        Must be 13 or older.
                                    </Text>
                                </Animated.View>
                            )}
                        </Animated.View>

                        <View style={{ flex: 1, minHeight: 40 }} />

                        {/* ─── CTA ─── */}
                        <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
                            <LiquidCTA
                                label="CONTINUE"
                                delay={1250}
                                onPress={() => {
                                    onboarding.setAge(age);
                                    handleNext();
                                }}
                                isDisabled={!isAgeValid}
                            />
                        </View>
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flexFill: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 28,
    },
    header: {
        marginBottom: 28,
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
        marginBottom: 16,
    },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 36,
        lineHeight: 44,
    },
    subtitleSection: {
        marginBottom: 36,
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        lineHeight: 24,
        opacity: 0.7,
    },
    inputSection: {
        alignItems: 'center',
        marginTop: 8,
    },
    ageInputContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        paddingHorizontal: 32,
        paddingVertical: 20,
    },
    input: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 88,
        textAlign: 'center',
        minWidth: 100,
    },
    yearsText: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 22,
        marginLeft: 12,
    },
    errorText: {
        marginTop: 16,
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
    },
    footer: {
        width: '100%',
    },
});
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
import Animated, {
    FadeIn,
    FadeOut,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSpring,
} from 'react-native-reanimated';
import { User, Check, ArrowLeft } from 'lucide-react-native';
import GlassCard from '../../../components/ui/GlassCard';
import { OnboardingBackground } from '../../../components/ui/OnboardingBackground';
import { LiquidCTA } from '../../../components/ui/LiquidCTA';

export default function Step2Name() {
    const { colors, fonts, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [name, setName] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Animations
    const headerOp = useSharedValue(0);
    const titleOp = useSharedValue(0);
    const subtitleOp = useSharedValue(0);
    const inputOp = useSharedValue(0);

    useEffect(() => {
        headerOp.value = withDelay(200, withTiming(1, { duration: 500 }));
        titleOp.value = withDelay(450, withTiming(1, { duration: 500 }));
        subtitleOp.value = withDelay(650, withTiming(1, { duration: 500 }));
        inputOp.value = withDelay(850, withTiming(1, { duration: 500 }));
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
        if (name.trim().length >= 2) {
            router.push('/onboarding/step3-age');
        }
    };

    const isNameValid = name.trim().length >= 2;

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
                        {/* ─── Header with Progress ─── */}
                        <Animated.View
                            style={[styles.header, { marginTop: insets.top + 32 }, headerStyle]}
                        >
                            <Pressable
                                onPress={() => router.back()}
                                style={[styles.backButton, { backgroundColor: '#FFFFFF05', borderColor: colors.border }]}
                            >
                                <ArrowLeft size={24} color={colors.textPrimary} strokeWidth={1.5} />
                            </Pressable>
                            <ProgressDots currentStep={2} totalSteps={9} />
                        </Animated.View>

                        {/* ─── Title ─── */}
                        <Animated.View style={[styles.titleSection, titleStyle]}>
                            <Text style={[styles.title, { color: colors.textPrimary }]}>
                                How shall we address you?
                            </Text>
                        </Animated.View>

                        {/* ─── Subtitle ─── */}
                        <Animated.View style={[styles.subtitleSection, subtitleStyle]}>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                Your digital legacy begins with a name.
                            </Text>
                        </Animated.View>

                        {/* ─── Input Section ─── */}
                        <Animated.View style={[styles.inputSection, inputStyle]}>
                            <GlassCard
                                accent={isFocused ? 'gold' : undefined}
                                glow={isFocused}
                                noBorder={!isDark}
                            >
                                <View style={styles.inputContainer}>
                                    <View
                                        style={[
                                            styles.iconWrapper,
                                            {
                                                backgroundColor: `${colors.gold}15`,
                                            },
                                        ]}
                                    >
                                        <User
                                            size={22}
                                            color={
                                                isFocused
                                                    ? colors.gold
                                                    : colors.textGhost
                                            }
                                            strokeWidth={1.5}
                                        />
                                    </View>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            {
                                                color: colors.textPrimary,
                                                fontFamily: fonts.bodySemiBold,
                                            },
                                        ]}
                                        placeholder="Full Name"
                                        placeholderTextColor={colors.textGhost}
                                        value={name}
                                        onChangeText={setName}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                        autoFocus
                                        autoCorrect={false}
                                        selectionColor={colors.gold}
                                    />
                                    {isNameValid && (
                                        <Animated.View
                                            entering={FadeIn}
                                            exiting={FadeOut}
                                            style={styles.validBadge}
                                        >
                                            <Check
                                                size={14}
                                                color={colors.gold}
                                                strokeWidth={4}
                                            />
                                        </Animated.View>
                                    )}
                                </View>
                            </GlassCard>
                        </Animated.View>

                        {/* Spacer to push footer to bottom */}
                        <View style={{ flex: 1, minHeight: 40 }} />

                        {/* ─── CTA Section ─── */}
                        <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
                            <LiquidCTA
                                label="CONTINUE"
                                delay={1350}
                                onPress={handleNext}
                                isDisabled={!isNameValid}
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
        marginBottom: 32,
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
        marginTop: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 16,
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        fontFamily: 'DMSans_500Medium',
        fontSize: 18,
    },
    validBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        width: '100%',
    },
});
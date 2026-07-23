/**
 * Check-in Screen — Daily mood check-in (redesigned)
 *
 * MoodOrb grid (8 moods with Lucide icons), text area with rotating placeholders,
 * char counter, privacy badge with Lock icon, "Analyze my feelings" CTA.
 * Zero emoji — all replaced with Lucide vector icons.
 */

import { useState, useEffect } from 'react';
import {
    View, Text, TextInput, Pressable, StyleSheet,
    ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
    Cloud, Zap, Sun, CloudRain, Target, BatteryLow,
    Heart, Flame, Lock, ArrowRight,
} from 'lucide-react-native';
import { fonts, spacing, glass, borderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { config } from '../../constants/config';
import { haptics } from '../../services/haptics';
import { useCheckinStore } from '../../stores/checkinStore';
import MoodOrb, { type MoodOption } from '../../components/ui/MoodOrb';
import AmbientBackground from '../../components/ui/AmbientBackground';

export default function CheckinScreen() {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { selectedMood, setMood, inputText, setText } = useCheckinStore();
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [textFocused, setTextFocused] = useState(false);
    const canSubmit = selectedMood !== null;

    // Mood options with Lucide icons and accent colors
    const MOOD_OPTIONS: MoodOption[] = [
        { value: 'calm',       label: 'Calm',      Icon: Cloud,     color: colors.sapphire },
        { value: 'anxious',    label: 'Anxious',   Icon: Zap,       color: colors.gold },
        { value: 'happy',      label: 'Happy',     Icon: Sun,       color: '#F5C842' },
        { value: 'sad',        label: 'Sad',       Icon: CloudRain, color: '#7AB5E8' },
        { value: 'focused',    label: 'Focused',   Icon: Target,    color: colors.emerald },
        { value: 'tired',      label: 'Tired',     Icon: BatteryLow,color: colors.lavender },
        { value: 'grateful',   label: 'Grateful',  Icon: Heart,     color: colors.crimson },
        { value: 'frustrated', label: 'Frustrated',Icon: Flame,    color: '#E84545' },
    ];

    // Rotate placeholders every 4 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setPlaceholderIndex((prev) =>
                (prev + 1) % config.CHECKIN_PLACEHOLDERS.length
            );
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const handleMoodSelect = (value: string) => {
        setMood(value);
    };

    const handleSubmit = () => {
        if (!canSubmit) return;
        haptics.medium();
        router.push('/(tabs)/loading');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]} edges={['top']}>
            <AmbientBackground hideBlobs={true} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView
                    contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <Animated.View entering={FadeInDown.delay(80).duration(450)}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>How are you feeling?</Text>
                        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                            Select your mood — we'll personalize your experience
                        </Text>
                    </Animated.View>

                    {/* Mood Orb Grid */}
                    <Animated.View
                        entering={FadeInDown.delay(180).duration(450)}
                        style={styles.moodSection}
                    >
                        <MoodOrb
                            moods={MOOD_OPTIONS}
                            selected={selectedMood}
                            onSelect={handleMoodSelect}
                            columns={4}
                        />
                    </Animated.View>

                    {/* Text Area */}
                    <Animated.View
                        entering={FadeInDown.delay(500).duration(450)}
                        style={styles.textAreaWrapper}
                    >
                        <TextInput
                            style={[
                                styles.textArea,
                                { 
                                    backgroundColor: isDark ? glass.background : '#FAF8F4', 
                                    color: colors.textPrimary, 
                                    borderColor: isDark ? colors.border : '#E8E1D0' 
                                },
                                textFocused && {
                                    borderColor: `${colors.gold}90`,
                                    shadowColor: colors.gold,
                                    shadowOpacity: isDark ? 0.15 : 0.08,
                                    shadowRadius: 12,
                                    shadowOffset: { width: 0, height: 0 },
                                },
                            ]}
                            placeholder={config.CHECKIN_PLACEHOLDERS[placeholderIndex]}
                            placeholderTextColor={colors.textGhost}
                            value={inputText}
                            onChangeText={setText}
                            multiline
                            maxLength={config.CHECKIN_TEXT_MAX_LENGTH}
                            textAlignVertical="top"
                            onFocus={() => setTextFocused(true)}
                            onBlur={() => setTextFocused(false)}
                        />
                        <Text style={[styles.charCounter, { color: colors.textGhost }]}>
                            {inputText.length}/{config.CHECKIN_TEXT_MAX_LENGTH}
                        </Text>
                    </Animated.View>

                    {/* Submit Button */}
                    <Animated.View entering={FadeInDown.delay(700).duration(400)}>
                        <Pressable
                            style={[styles.submitButton, { backgroundColor: colors.gold, shadowColor: colors.gold }, !canSubmit && styles.buttonDisabled]}
                            onPress={handleSubmit}
                            disabled={!canSubmit}
                        >
                            <Text style={[styles.submitText, { color: colors.void }]}>Analyze my feelings</Text>
                            <ArrowRight
                                size={18}
                                color={colors.void}
                                strokeWidth={2.2}
                                style={{ opacity: canSubmit ? 1 : 0.5 }}
                            />
                        </Pressable>
                    </Animated.View>

                    {/* Privacy Badge */}
                    <Animated.View
                        entering={FadeInDown.delay(900).duration(400)}
                        style={styles.privacyBadge}
                    >
                        <Lock size={12} color={colors.textGhost} strokeWidth={2} />
                        <Text style={[styles.privacyText, { color: colors.textGhost }]}>Private & secure — your data is encrypted</Text>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    flex: { flex: 1 },
    content: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
    },
    title: {
        fontFamily: fonts.display,
        fontSize: 30,
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontFamily: fonts.body,
        fontSize: 15,
        marginBottom: 28,
        lineHeight: 22,
    },
    moodSection: {
        marginBottom: 28,
    },
    textAreaWrapper: {
        marginBottom: 24,
    },
    textArea: {
        borderRadius: borderRadius.lg,
        padding: 18,
        fontFamily: fonts.body,
        fontSize: 15,
        borderWidth: 1,
        minHeight: 120,
        lineHeight: 24,
        elevation: 2,
    },
    charCounter: {
        fontFamily: fonts.bodyLight,
        fontSize: 12,
        textAlign: 'right',
        marginTop: 8,
    },
    submitButton: {
        borderRadius: borderRadius.md,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        flexDirection: 'row',
        gap: 8,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
    },
    buttonDisabled: {
        opacity: 0.4,
    },
    submitText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 17,
        letterSpacing: 0.3,
    },
    privacyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
    },
    privacyText: {
        fontFamily: fonts.bodyLight,
        fontSize: 12,
        textAlign: 'center',
    },
});

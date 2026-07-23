import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useTheme } from '../../../context/ThemeContext';
import { AuthService } from '../../../services/auth';
import Animated, {
    FadeIn,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
} from 'react-native-reanimated';
import PremiumLogo from '../../../components/ui/PremiumLogo';
import { OnboardingBackground } from '../../../components/ui/OnboardingBackground';
import { LiquidCTA } from '../../../components/ui/LiquidCTA';

const { height } = Dimensions.get('window');

export default function Step9Finish() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { name, age, focusAreas, completeOnboarding } = useOnboardingStore();
    const [saving, setSaving] = useState(false);

    // Animations
    const logoOp = useSharedValue(0);
    const titleOp = useSharedValue(0);
    const subtitleOp = useSharedValue(0);

    useEffect(() => {
        logoOp.value = withDelay(100, withTiming(1, { duration: 600 }));
        titleOp.value = withDelay(300, withTiming(1, { duration: 500 }));
        subtitleOp.value = withDelay(450, withTiming(1, { duration: 500 }));
    }, []);

    const logoStyle = useAnimatedStyle(() => ({
        opacity: logoOp.value,
        transform: [{ scale: logoOp.value }],
    }));

    const titleStyle = useAnimatedStyle(() => ({
        opacity: titleOp.value,
    }));

    const subtitleStyle = useAnimatedStyle(() => ({
        opacity: subtitleOp.value,
    }));

    const handleFinish = async () => {
        if (saving) return;
        setSaving(true);
        try {
            await AuthService.updateProfile({
                name: name || undefined,
                age: age || undefined,
                relaxationMethods: focusAreas,
                onboardingComplete: true,
            });
            completeOnboarding();
        } catch (error) {
            console.error('Failed to save onboarding:', error);
            completeOnboarding();
            router.replace('/(tabs)');
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.void }]}>
            <OnboardingBackground />

            <View
                style={[
                    styles.content,
                    {
                        paddingTop: insets.top + (height > 800 ? 100 : 60),
                        paddingBottom: insets.bottom + 20,
                    },
                ]}
            >
                <Animated.View style={[styles.logoContainer, logoStyle]}>
                    <PremiumLogo />
                </Animated.View>

                <View style={styles.textContainer}>
                    <Animated.View style={titleStyle}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>
                            Welcome to the Circle, {name}.
                        </Text>
                    </Animated.View>
                    <Animated.View style={subtitleStyle}>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Your personalized path is established. Precision and refinement await you within the VinR sanctuary.
                        </Text>
                    </Animated.View>
                </View>

                <View style={[styles.footer, { paddingBottom: 16, marginTop: 'auto' }]}>
                    <LiquidCTA
                        label="ENTER YOUR SANCTUARY"
                        delay={1000}
                        onPress={handleFinish}
                        isLoading={saving}
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
        alignItems: 'center',
        paddingHorizontal: 28,
    },
    logoContainer: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 60,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 32,
        lineHeight: 40,
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        opacity: 0.8,
        paddingHorizontal: 10,
    },
    footer: {
        width: '100%',
    },
});

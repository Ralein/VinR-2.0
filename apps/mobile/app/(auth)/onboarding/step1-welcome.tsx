import React, { useEffect } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSpring,
    Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../../context/ThemeContext';
import { fonts, spacing } from '../../../constants/theme';
import PremiumLogo from '../../../components/ui/PremiumLogo';
import { haptics } from '../../../services/haptics';
import { OnboardingBackground } from '../../../components/ui/OnboardingBackground';
import { LiquidCTA } from '../../../components/ui/LiquidCTA';

const { height } = Dimensions.get('window');

export default function Step1Welcome() {
    const { colors } = useTheme();
    const router = useRouter();

    // Logo animations
    const logoOp = useSharedValue(0);
    const logoScale = useSharedValue(0.8);

    // Quote animations
    const quoteOp = useSharedValue(0);

    // Divider animations
    const dividerOp = useSharedValue(0);
    const dividerW = useSharedValue(0);

    // Tagline animations
    const tagline1Op = useSharedValue(0);
    const tagline2Op = useSharedValue(0);

    // CTA animations
    const ctaContainerOp = useSharedValue(0);

    useEffect(() => {
        logoOp.value = withDelay(200, withTiming(1, { duration: 500 }));
        logoScale.value = withDelay(200, withSpring(1, { stiffness: 90, damping: 15 }));

        quoteOp.value = withDelay(600, withTiming(1, { duration: 600 }));

        dividerOp.value = withDelay(1000, withTiming(1, { duration: 400 }));
        dividerW.value = withDelay(1000, withTiming(40, {
            duration: 400,
            easing: Easing.out(Easing.quad),
        }));

        tagline1Op.value = withDelay(1300, withTiming(1, { duration: 500 }));
        tagline2Op.value = withDelay(1500, withTiming(1, { duration: 500 }));

        ctaContainerOp.value = withDelay(2000, withTiming(1, { duration: 500 }));
    }, []);

    const logoStyle = useAnimatedStyle(() => ({
        opacity: logoOp.value,
        transform: [{ scale: logoScale.value }],
    }));

    const quoteStyle = useAnimatedStyle(() => ({
        opacity: quoteOp.value,
    }));

    const dividerStyle = useAnimatedStyle(() => ({
        opacity: dividerOp.value,
        width: dividerW.value,
    }));

    const tagline1Style = useAnimatedStyle(() => ({
        opacity: tagline1Op.value,
    }));

    const tagline2Style = useAnimatedStyle(() => ({
        opacity: tagline2Op.value,
    }));

    const ctaContainerStyle = useAnimatedStyle(() => ({
        opacity: ctaContainerOp.value,
    }));

    const handleNext = () => {
        router.push('/onboarding/step2-name');
    };

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: colors.void }]}
            edges={['top', 'bottom']}
        >
            <OnboardingBackground />

            <View style={styles.content}>
                <Animated.View style={[styles.heroSection, logoStyle]}>
                    <PremiumLogo delay={0} scale={1.1} />
                </Animated.View>

                <Animated.View style={[styles.quoteSection, quoteStyle]}>
                    <Animated.Text
                        style={[
                            styles.quote,
                            { color: colors.textPrimary },
                        ]}
                    >
                        "Mastery is the silent refinement of the soul."
                    </Animated.Text>

                    <Animated.View
                        style={[
                            styles.divider,
                            { backgroundColor: colors.gold },
                            dividerStyle,
                        ]}
                    />

                    <View style={styles.taglineReveal}>
                        <Animated.Text
                            style={[
                                styles.tagline,
                                { color: colors.textSecondary },
                                tagline1Style,
                            ]}
                        >
                            Welcome to your digital sanctuary.
                        </Animated.Text>
                        <Animated.Text
                            style={[
                                styles.tagline,
                                {
                                    color: colors.gold,
                                    fontFamily: fonts.bodySemiBold,
                                },
                                tagline2Style,
                            ]}
                        >
                            Exclusivity in every moment.
                        </Animated.Text>
                    </View>
                </Animated.View>
            </View>

            <Animated.View style={[styles.ctaContainer, ctaContainerStyle]}>
                <LiquidCTA
                    label="BEGIN YOUR JOURNEY"
                    delay={2000}
                    onPress={handleNext}
                />
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: height * 0.06,
    },
    quoteSection: {
        alignItems: 'center',
        marginBottom: height * 0.05,
    },
    quote: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 32,
        lineHeight: 42,
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: spacing.lg,
    },
    divider: {
        height: 1.5,
        marginBottom: spacing.lg,
        opacity: 0.7,
    },
    taglineReveal: {
        alignItems: 'center',
        gap: 6,
    },
    tagline: {
        fontFamily: fonts.body,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    ctaContainer: {
        width: '100%',
        paddingHorizontal: spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? 60 : 80,
        alignItems: 'center',
    },
});
/**
 * VinRLogo — shared premium wordmark component
 *
 * "vin" in ivory PlayfairDisplay + "ℛ" in gold italic.
 * Sizes: sm | md | lg | xl (splash)
 * Optional gold glow ring behind the ℛ symbol.
 */

import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { colors } from '../../constants/theme';

type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

interface VinRLogoProps {
    size?: LogoSize;
    glow?: boolean;        // pulsing background glow orb
    style?: object;
}

const SIZE_MAP: Record<LogoSize, { vin: number; r: number; spacing: number }> = {
    sm:  { vin: 24, r: 28,  spacing: -2 },
    md:  { vin: 36, r: 42,  spacing: -3 },
    lg:  { vin: 48, r: 56,  spacing: -5 },
    xl:  { vin: 72, r: 82,  spacing: -6 },
};

export default function VinRLogo({ size = 'md', glow = false, style }: VinRLogoProps) {
    const { vin: vinSize, r: rSize, spacing } = SIZE_MAP[size];
    const glowOpacity = useSharedValue(0.28);
    const glowScale   = useSharedValue(0.85);

    useEffect(() => {
        if (!glow) return;
        glowOpacity.value = withRepeat(
            withSequence(
                withTiming(0.55, { duration: 2200 }),
                withTiming(0.18, { duration: 2200 }),
            ),
            -1, true
        );
        glowScale.value = withRepeat(
            withSequence(
                withTiming(1.15, { duration: 2200 }),
                withTiming(0.88, { duration: 2200 }),
            ),
            -1, true
        );
    }, [glow]);

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
        transform: [{ scale: glowScale.value }],
    }));

    const orbSize = rSize * 2.4;

    return (
        <View style={[styles.wrapper, style]}>
            {/* Pulsing gold glow orb behind the ℛ */}
            {glow && (
                <Animated.View
                    style={[
                        styles.glowOrb,
                        {
                            width: orbSize,
                            height: orbSize,
                            borderRadius: orbSize / 2,
                            /* offset to sit behind the R */
                            right: -(orbSize * 0.15),
                            top: -(orbSize * 0.25),
                        },
                        glowStyle,
                    ]}
                />
            )}

            {/* "vin" text */}
            <Text
                style={[
                    styles.vin,
                    { fontSize: vinSize },
                ]}
            >
                vin
            </Text>

            {/* Elegant cursive ℛ */}
            <Text
                style={[
                    styles.r,
                    {
                        fontSize: rSize,
                        marginLeft: spacing,
                        /* Add a subtle text shadow for luminosity */
                        textShadowColor: `${colors.gold}60`,
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: rSize * 0.25,
                    },
                ]}
            >
                ℛ
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'baseline',
        position: 'relative',
    },
    vin: {
        fontFamily: 'PlayfairDisplay_700Bold',
        color: colors.textPrimary,
        letterSpacing: -1.5,
    },
    r: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontStyle: 'italic',
        color: colors.gold,
    },
    glowOrb: {
        position: 'absolute',
        backgroundColor: '#D4A85318',
    },
});

/**
 * GlassCard — Frosted glass surface component (upgraded)
 *
 * Midnight Gold glassmorphism card with optional accent borders,
 * shimmer border animation, pressable variant, and glow effect.
 */

import React, { useEffect } from 'react';
import { View, Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, {
    FadeIn,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    withSpring,
    Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

type AccentColor = 'gold' | 'emerald' | 'sapphire' | 'crimson' | 'lavender' | 'none';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GlassCardProps {
    children: React.ReactNode;
    accent?: AccentColor;
    /** Left accent border stripe */
    accentBorder?: boolean;
    /** Entrance animation delay in ms */
    delay?: number;
    /** Disable entrance animation */
    noAnimation?: boolean;
    /** Disable default 1px border */
    noBorder?: boolean;
    /** Additional styles */
    style?: StyleProp<ViewStyle>;
    /** Use elevated shadow */
    elevated?: boolean;
    /** Animated shimmer border glow */
    shimmer?: boolean;
    /** Make card pressable with spring animation */
    onPress?: () => void;
    /** Colored drop shadow/glow using accent */
    glow?: boolean;
    /** Force hide any glow/shimmer effects */
    hideGlow?: boolean;
}

export default function GlassCard({
    children,
    accent = 'none',
    accentBorder = false,
    delay = 0,
    noAnimation = false,
    noBorder = false,
    style,
    elevated = false,
    shimmer = false,
    onPress,
    glow = false,
    hideGlow = false,
}: GlassCardProps) {
    const { colors, glass, borderRadius, spacing, shadows, isDark } = useTheme();
    const shimmerOpacity = useSharedValue(0.1);
    const pressScale = useSharedValue(1);

    const ACCENT_COLORS: Record<AccentColor, string> = {
        gold: colors.gold,
        emerald: colors.emerald,
        sapphire: colors.sapphire,
        crimson: colors.crimson,
        lavender: colors.lavender,
        none: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
    };

    const accentHex = ACCENT_COLORS[accent];

    useEffect(() => {
        if (shimmer && accent !== 'none' && !hideGlow) {
            shimmerOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.45, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0.1, { duration: 1800, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                false
            );
        }
    }, [shimmer, accent]);

    const shimmerStyle = useAnimatedStyle(() => ({
        borderColor: (noBorder || accent === 'none' || hideGlow)
            ? 'transparent'
            : `${accentHex}${Math.round(shimmerOpacity.value * 255).toString(16).padStart(2, '0')}`,
    }));

    const pressStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pressScale.value }],
    }));

    const handlePress = () => {
        if (!onPress) return;
        pressScale.value = withSequence(
            withSpring(0.97, { stiffness: 300, damping: 20 }),
            withSpring(1, { stiffness: 120, damping: 14 })
        );
        onPress();
    };

    const glowShadow = (glow && accent !== 'none' && !hideGlow) ? {
        shadowColor: accentHex,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: isDark ? 0.25 : 0.15,
        shadowRadius: 16,
        elevation: 8,
    } : {};

    const staticBorderColor = accent !== 'none'
        ? `${accentHex}40`
        : glass.border;

    const cardBaseStyle: ViewStyle = {
        backgroundColor: accent !== 'none' ? `${accentHex}06` : glass.background,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: noBorder ? 0 : 1,
        borderColor: noBorder ? 'transparent' : staticBorderColor,
        overflow: 'hidden',
        ...(elevated ? (isDark ? shadows.card : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 12,
            elevation: 4,
        }) : {}),
        ...(glowShadow),
    };

    const inner = (
        <>
            {accentBorder && accent !== 'none' && (
                <View
                    style={[
                        styles.accentStripe,
                        { backgroundColor: `${accentHex}99`, borderTopLeftRadius: borderRadius.lg, borderBottomLeftRadius: borderRadius.lg },
                    ]}
                />
            )}
            <View style={accentBorder ? { paddingLeft: spacing.sm } : undefined}>
                {children}
            </View>
        </>
    );

    const wrappedContent = (
        <Animated.View style={[cardBaseStyle, shimmer ? shimmerStyle : {}, style]}>
            {onPress ? (
                <AnimatedPressable
                    onPress={handlePress}
                    style={[styles.pressableArea, pressStyle]}
                >
                    {inner}
                </AnimatedPressable>
            ) : (
                inner
            )}
        </Animated.View>
    );

    if (noAnimation) return wrappedContent;

    return (
        <Animated.View entering={FadeIn.delay(delay).duration(400)}>
            {wrappedContent}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    pressableArea: {
        width: '100%',
    },
    accentStripe: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
    },
});


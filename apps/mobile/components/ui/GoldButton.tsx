/**
 * GoldButton — Premium CTA button with gold glow
 *
 * Press scale animation, gold shadow halo, loading spinner,
 * disabled state. The primary action button for VinR.
 */

import React from 'react';
import { Text, Pressable, StyleSheet, ActivityIndicator, ViewStyle, StyleProp } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withSequence,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { haptics } from '../../services/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GoldButtonProps {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    /** Use emerald instead of gold */
    variant?: 'gold' | 'emerald' | 'ghost';
    /** Full-width button */
    fullWidth?: boolean;
    style?: StyleProp<ViewStyle>;
}

export default function GoldButton({
    label,
    onPress,
    disabled = false,
    loading = false,
    variant = 'gold',
    fullWidth = true,
    style,
}: GoldButtonProps) {
    const { colors, fonts, borderRadius, spacing, shadows, animation, isDark } = useTheme();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
        if (disabled || loading) return;
        haptics.medium();
        scale.value = withSequence(
            withSpring(animation.pressScale, animation.springStiff),
            withSpring(1, animation.spring)
        );
        onPress();
    };

    const buttonColors = {
        gold: {
            bg: colors.gold,
            text: isDark ? colors.void : colors.surface,
            shadow: shadows.gold,
        },
        emerald: {
            bg: colors.emerald,
            text: '#FFFFFF',
            shadow: shadows.emerald,
        },
        ghost: {
            bg: 'transparent',
            text: colors.textPrimary,
            shadow: {},
        },
    };

    const { bg, text, shadow } = buttonColors[variant];

    return (
        <AnimatedPressable
            onPress={handlePress}
            disabled={disabled || loading}
            style={[
                styles.button,
                { 
                    backgroundColor: bg, 
                    borderRadius: borderRadius.lg,
                    paddingHorizontal: spacing.xl,
                },
                shadow,
                variant === 'ghost' && { borderWidth: 1, borderColor: colors.border },
                !fullWidth && { alignSelf: 'center' },
                (disabled || loading) && { opacity: 0.45 },
                animatedStyle,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={text} size="small" />
            ) : (
                <Text style={[styles.label, { color: text, fontFamily: fonts.bodySemiBold }]}>{label}</Text>
            )}
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
    },
    label: {
        fontSize: 17,
        letterSpacing: 0.3,
    },
});

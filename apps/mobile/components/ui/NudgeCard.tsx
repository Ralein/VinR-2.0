import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
    FadeInDown,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    withSpring,
    withSequence,
} from 'react-native-reanimated';
import { type LucideIcon, ChevronRight } from 'lucide-react-native';
import { haptics } from '../../services/haptics';
import { useTheme } from '../../context/ThemeContext';

type NudgeAccent = 'gold' | 'emerald' | 'sapphire' | 'lavender' | 'crimson';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function NudgeCard({
    title,
    message,
    Icon,
    accent = 'gold',
    onPress,
    delay = 0,
}: NudgeCardProps) {
    const { colors, fonts, spacing, borderRadius, glass, animation, isDark } = useTheme();
    
    const ACCENT_MAP: Record<NudgeAccent, string> = {
        gold: colors.gold,
        emerald: colors.emerald,
        sapphire: colors.sapphire,
        lavender: colors.lavender,
        crimson: colors.crimson,
    };

    const accentColor = ACCENT_MAP[accent];
    const scale = useSharedValue(1);
    const borderGlow = useSharedValue(isDark ? 0.2 : 0.1);

    useEffect(() => {
        // Subtle pulsing border glow
        borderGlow.value = withRepeat(
            withTiming(isDark ? 0.5 : 0.35, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
            -1,
            true
        );
    }, []);

    const animatedBorder = useAnimatedStyle(() => ({
        borderColor: `${accentColor}${Math.round(borderGlow.value * 255).toString(16).padStart(2, '0')}`,
    }));

    const animatedScale = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
        if (!onPress) return;
        haptics.light();
        scale.value = withSequence(
            withSpring(0.97, animation?.springStiff || { stiffness: 200, damping: 20 }),
            withSpring(1, animation?.spring || { stiffness: 100, damping: 10 })
        );
        onPress();
    };

    return (
        <Animated.View
            entering={FadeInDown.delay(delay).duration(450).springify()}
            style={animatedScale}
        >
            <AnimatedPressable
                onPress={handlePress}
                disabled={!onPress}
                style={[
                    styles.card, 
                    { 
                        backgroundColor: glass.background,
                        borderColor: glass.border,
                        borderRadius: borderRadius.lg,
                        padding: spacing.md,
                        marginBottom: spacing.sm,
                        gap: spacing.md
                    }, 
                    animatedBorder
                ]}
            >
                {/* Icon Column */}
                <View style={[
                    styles.iconCol, 
                    { 
                        backgroundColor: `${accentColor}15`,
                        borderRadius: borderRadius.md,
                    }
                ]}>
                    <Icon size={22} color={accentColor} strokeWidth={2} />
                </View>
                {/* Text Column */}
                <View style={styles.textCol}>
                    <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>{title}</Text>
                    <Text style={[styles.message, { color: colors.textMuted, fontFamily: fonts.body }]} numberOfLines={2}>{message}</Text>
                </View>
                {/* Arrow */}
                {onPress && (
                    <ChevronRight size={16} color={colors.textGhost} strokeWidth={1.5} />
                )}
            </AnimatedPressable>
        </Animated.View>
    );
}

interface NudgeCardProps {
    title: string;
    message: string;
    Icon: LucideIcon;
    accent?: NudgeAccent;
    onPress?: () => void;
    delay?: number;
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
    },
    iconCol: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    textCol: {
        flex: 1,
        gap: 3,
    },
    title: {
        fontSize: 14,
        letterSpacing: 0.1,
    },
    message: {
        fontSize: 12,
        lineHeight: 17,
    },
});


import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSpring,
    withSequence,
    Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { haptics } from '../../services/haptics';
import { animation } from '../../constants/theme';

const { width } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Constants ────────────────────────────────────────────────────────────────
const GOLD = '#D4AF37';
const GOLD_BRIGHT = '#F2C84B';
const VOID = '#05040E';

interface LiquidCTAProps {
    label: string;
    onPress: () => void;
    isDisabled?: boolean;
    isLoading?: boolean;
    delay?: number;
    showArrow?: boolean;
}

export const LiquidCTA: React.FC<LiquidCTAProps> = ({
    label,
    onPress,
    isDisabled = false,
    isLoading = false,
    delay = 0,
}) => {
    const CTA_W = width - 56;
    const borderOp = useSharedValue(0);
    const glowOp = useSharedValue(0);
    const fillW = useSharedValue(0);
    const shimmerX = useSharedValue(-80);
    const shimmerOp = useSharedValue(0);
    const labelOp = useSharedValue(0);
    const labelSpc = useSharedValue(3);
    const scale = useSharedValue(1);
    const containerOp = useSharedValue(0);

    useEffect(() => {
        // Remove entrance animations, set final values instantly
        containerOp.value = 1;

        if (!isDisabled) {
            borderOp.value = 1;
            glowOp.value = 1;
            fillW.value = CTA_W;
            shimmerOp.value = 0;
            shimmerX.value = CTA_W + 80;
            labelOp.value = 1;
            labelSpc.value = 0.5;
        } else {
            borderOp.value = 0.4;
            glowOp.value = 0.2;
            fillW.value = CTA_W;
            labelOp.value = 0.5;
        }
    }, [isDisabled, CTA_W]);

    const borderStyle = useAnimatedStyle(() => ({ opacity: borderOp.value }));
    const glowStyle = useAnimatedStyle(() => ({ opacity: glowOp.value }));
    const fillStyle = useAnimatedStyle(() => ({ width: fillW.value }));
    const shimmerStyle = useAnimatedStyle(() => ({
        opacity: shimmerOp.value,
        transform: [{ translateX: shimmerX.value }],
    }));
    const labelStyle = useAnimatedStyle(() => ({
        opacity: labelOp.value,
        letterSpacing: labelSpc.value,
    }));
    const pressStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));
    const containerStyle = useAnimatedStyle(() => ({
        opacity: containerOp.value,
    }));

    const handlePress = () => {
        if (isDisabled) return;
        haptics.medium();
        scale.value = withSequence(
            withSpring(0.96, { stiffness: 400 }),
            withSpring(1, animation.spring)
        );
        onPress();
    };

    return (
        <Animated.View style={[styles.container, containerStyle]}>
            <AnimatedPressable
                onPress={handlePress}
                style={[styles.ctaOuter, pressStyle]}
                disabled={isDisabled}
            >
                <Animated.View style={[StyleSheet.absoluteFill, styles.ctaGlow, glowStyle]} />
                <Animated.View style={[StyleSheet.absoluteFill, styles.ctaBorder, borderStyle]} />

                <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 16 }]}>
                    <Animated.View style={[{ height: '100%' }, fillStyle]}>
                        <LinearGradient
                            colors={
                                isDisabled
                                    ? [
                                        'rgba(212,175,55,0.1)',
                                        'rgba(212,175,55,0.05)',
                                        'rgba(212,175,55,0.02)',
                                    ]
                                    : [GOLD_BRIGHT, GOLD, '#C9981C']
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ flex: 1 }}
                        />
                    </Animated.View>
                    {!isDisabled && (
                        <Animated.View style={[styles.ctaShimmer, shimmerStyle]}>
                            <LinearGradient
                                colors={[
                                    'transparent',
                                    'rgba(255,255,255,0.35)',
                                    'transparent',
                                ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{ flex: 1 }}
                            />
                        </Animated.View>
                    )}
                </View>

                <Animated.View style={[StyleSheet.absoluteFill, styles.ctaLabelRow]}>
                    {isLoading ? (
                        <ActivityIndicator color={VOID} />
                    ) : (
                        <Animated.Text
                            numberOfLines={1}
                            style={[
                                styles.ctaText,
                                {
                                    color: isDisabled ? 'rgba(236,234,246,0.3)' : VOID,
                                },
                                labelStyle,
                            ]}
                        >
                            {label}
                        </Animated.Text>
                    )}
                </Animated.View>
            </AnimatedPressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaOuter: {
        width: width - 56,
        height: 60,
        borderRadius: 16,
    },
    ctaGlow: {
        borderRadius: 16,
        shadowColor: GOLD_BRIGHT,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.55,
        shadowRadius: 32,
        backgroundColor: 'transparent',
    },
    ctaBorder: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(212,175,55,0.38)',
    },
    ctaShimmer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: -80,
        width: 80,
    },
    ctaLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    ctaText: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 17,
        letterSpacing: 0.5,
        textAlign: 'center',
    },
});

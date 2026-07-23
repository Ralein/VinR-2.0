/**
 * AvatarRing — User avatar with animated gold ring
 *
 * Shows user initials in a circle with a glowing animated ring.
 * Supports image URL, initials fallback, and size variants.
 */

import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

interface AvatarRingProps {
    initials?: string;
    imageUrl?: string;
    size?: number;
    ringColor?: string;
    /** If true, subtly pulses the ring */
    pulse?: boolean;
    style?: ViewStyle;
}

export default function AvatarRing({
    initials = 'U',
    imageUrl,
    size = 44,
    ringColor,
    pulse = false,
    style,
}: AvatarRingProps) {
    const { colors, fonts, isDark } = useTheme();
    const ringOpacity = useSharedValue(1);
    const activeRingColor = ringColor || colors.gold;

    useEffect(() => {
        if (pulse) {
            ringOpacity.value = withRepeat(
                withTiming(0.4, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
                -1,
                true
            );
        }
    }, [pulse]);

    const animatedRingStyle = useAnimatedStyle(() => ({
        opacity: ringOpacity.value,
    }));

    const ring = size + 8;
    const innerSize = size - 4;

    return (
        <View style={[{ width: ring, height: ring, alignItems: 'center', justifyContent: 'center' }, style]}>
            <Animated.View
                style={[
                    {
                        width: ring,
                        height: ring,
                        borderRadius: ring / 2,
                        borderWidth: 2,
                        borderColor: activeRingColor,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: activeRingColor,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: isDark ? 0.6 : 0.3,
                        shadowRadius: 8,
                    },
                    pulse && animatedRingStyle,
                ]}
            >
                <View
                    style={{
                        width: innerSize,
                        height: innerSize,
                        borderRadius: innerSize / 2,
                        backgroundColor: isDark ? colors.elevated : colors.surface,
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                    }}
                >
                    {imageUrl ? (
                        <Image
                            source={{ uri: imageUrl }}
                            style={{ width: innerSize, height: innerSize, borderRadius: innerSize / 2 }}
                        />
                    ) : (
                        <Text
                            style={{
                                fontFamily: fonts.bodySemiBold,
                                fontSize: size * 0.33,
                                color: activeRingColor,
                                letterSpacing: 0.5,
                            }}
                        >
                            {initials.slice(0, 2).toUpperCase()}
                        </Text>
                    )}
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({});

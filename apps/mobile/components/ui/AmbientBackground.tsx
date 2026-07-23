import React, { useEffect } from 'react';
import { Dimensions, ViewStyle, StyleSheet, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    withDelay,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const { height } = Dimensions.get('window');

export function AmbientBlob({ color, size, top, left, right, bottom, delay: d, duration, minimal = false }: {
    color: string; size: number; top?: number; left?: number; right?: number; bottom?: number;
    delay: number; duration: number; minimal?: boolean;
}) {
    const scale = useSharedValue(minimal ? 1 : 0.85);
    const op    = useSharedValue(0);

    useEffect(() => {
        op.value    = withDelay(d, withTiming(minimal ? 0.35 : 1, { duration: 1400 }));
        // Removed scale animation for a cleaner, static look
    }, [minimal]);

    const style = useAnimatedStyle(() => ({
        opacity: op.value,
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View pointerEvents="none" style={[{
            position: 'absolute', width: size, height: size,
            borderRadius: size / 2, backgroundColor: color, top, left, right, bottom
        }, style]} />
    );
}

const adjustAlpha = (color: string, alpha: number) => {
    if (typeof color !== 'string' || !color.includes('rgba')) return color;
    return color.replace(/,[\s\d.]+\)$/, `, ${alpha})`);
};

export function OrbitRing({ size, duration, delay: d, color = 'rgba(212,175,55,0.6)', reverse = false }: {
    size: number; duration: number; delay: number; color?: string; reverse?: boolean;
}) {
    const rot = useSharedValue(0);
    const op  = useSharedValue(0);

    useEffect(() => {
        op.value  = withDelay(d, withTiming(0.4, { duration: 800 }));
        rot.value = withRepeat(
            withTiming(reverse ? -360 : 360, { duration, easing: Easing.linear }),
            -1, false
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rot.value}deg` }],
        opacity: op.value,
    }));

    return (
        <Animated.View pointerEvents="none" style={[{
            position: 'absolute',
            width: size, height: size, borderRadius: size / 2,
            borderWidth: 1,
            borderTopColor: color,
            borderRightColor: adjustAlpha(color, 0.1),
            borderBottomColor: 'transparent',
            borderLeftColor: adjustAlpha(color, 0.1),
        }, style]} />
    );
}

export function PulseRing({ size, delay: d, color = 'rgba(212,175,55,0.5)' }: { size: number; delay: number; color?: string }) {
    const scale = useSharedValue(1);
    const op    = useSharedValue(0);

    useEffect(() => {
        op.value    = withDelay(d, withTiming(0.4, { duration: 600 }));
        scale.value = withDelay(d, withRepeat(
            withSequence(
                withTiming(1.3, { duration: 2000, easing: Easing.out(Easing.quad) }),
                withTiming(1,   { duration: 2000, easing: Easing.in(Easing.quad) })
            ), -1, false
        ));
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: interpolate(scale.value, [1, 1.3], [0.35, 0]),
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View pointerEvents="none" style={[{
            position: 'absolute',
            width: size, height: size, borderRadius: size / 2,
            borderWidth: 1.5,
            borderColor: color,
        }, style]} />
    );
}

export default function AmbientBackground({
    topColor,
    minimal = false,
    hideBlobs = false,
    blobs: customBlobs
}: {
    topColor?: string;
    minimal?: boolean;
    hideBlobs?: boolean;
    blobs?: { color: string; size: number; top?: number; left?: number; right?: number; bottom?: number; delay: number; duration: number; }[];
}) {
    const { colors, isDark } = useTheme();

    // Theme-aware defaults
    const defaultTopColor = topColor ?? (isDark ? 'rgba(212,175,55,0.04)' : 'rgba(212,175,55,0.08)');
    
    const defaultBlobs = [
        { 
            color: isDark ? 'rgba(212,175,55,0.05)' : 'rgba(212,175,55,0.06)', 
            size: 380, top: -80, left: -100, delay: 200, duration: 5400 
        },
        { 
            color: isDark ? 'rgba(123,94,248,0.06)' : 'rgba(212,175,55,0.04)', 
            size: 300, top: height * 0.6, right: -80, delay: 400, duration: 6600 
        }
    ];

    const finalBlobs = customBlobs ?? defaultBlobs;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <LinearGradient
                colors={[defaultTopColor, 'transparent', colors.void]}
                style={StyleSheet.absoluteFill}
                locations={[0, 0.45, 1]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            />
            {!hideBlobs && finalBlobs.map((blob, idx) => (
                <AmbientBlob key={`blob-${idx}`} {...blob} minimal={minimal} />
            ))}
        </View>
    );
}

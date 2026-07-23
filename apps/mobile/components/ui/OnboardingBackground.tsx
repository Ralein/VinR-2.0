import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing,
    interpolate,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// ─── Constants ────────────────────────────────────────────────────────────────
const GOLD_BRIGHT = '#F2C84B';
const VOID = '#05040E';
const VOID_MID = '#0A0818';


function AmbientBlob({
    color,
    size,
    top,
    left,
    right,
    delay: d,
}: {
    color: string;
    size: number;
    top: number;
    left?: number;
    right?: number;
    delay: number;
}) {
    const op = useSharedValue(0);

    useEffect(() => {
        op.value = withDelay(d, withTiming(1, { duration: 800 }));
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: op.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                    top,
                    left,
                    right,
                },
                style,
            ]}
        />
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface OnboardingBackgroundProps {
    delay?: number;
}

export const OnboardingBackground: React.FC<OnboardingBackgroundProps> = ({
    delay = 0,
}) => {
    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Background Gradient */}
            <LinearGradient
                colors={[VOID, VOID_MID, VOID, VOID]}
                style={StyleSheet.absoluteFill}
                locations={[0, 0.3, 0.7, 1]}
                start={{ x: 0.25, y: 0 }}
                end={{ x: 0.75, y: 1 }}
            />

            <LinearGradient
                colors={['rgba(123,94,248,0.05)', 'transparent']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0.25 }}
                end={{ x: 0.5, y: 1 }}
            />


            {/* Ambient Blobs */}
            <AmbientBlob
                color="rgba(212,175,55,0.05)"
                size={340}
                top={height * 0.1}
                left={-50}
                delay={delay + 50}
            />
            <AmbientBlob
                color="rgba(123,94,248,0.06)"
                size={280}
                top={height * 0.65}
                right={-60}
                delay={delay + 200}
            />
        </View>
    );
};

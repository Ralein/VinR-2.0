import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDelay,
    withSequence,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

// ─── Components ───

function OrbitRing({
    size,
    duration,
    reverse = false,
    delay: d,
    variant = 'primary',
}: {
    size: number;
    duration: number;
    reverse?: boolean;
    delay: number;
    variant?: 'primary' | 'secondary' | 'micro';
}) {
    const { colors } = useTheme();
    const rot = useSharedValue(0);
    const op  = useSharedValue(0);

    useEffect(() => {
        op.value  = withDelay(d, withTiming(1, { duration: 800 }));
        rot.value = withDelay(
            d,
            withRepeat(
                withTiming(reverse ? -360 : 360, { duration, easing: Easing.linear }),
                -1,
                false
            )
        );
    }, [d, duration, reverse]);

    const style = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rot.value}deg` }],
        opacity: op.value,
    }));

    const ringStyle = variant === 'primary'
        ? {
            borderTopColor:    `${colors.gold}BF`, // 0.75
            borderRightColor:  `${colors.gold}2E`, // 0.18
            borderBottomColor: 'transparent',
            borderLeftColor:   `${colors.gold}2E`,
            borderWidth: 1,
        }
        : variant === 'secondary'
        ? {
            borderTopColor:    'rgba(123,94,248,0.4)',
            borderRightColor:  'rgba(123,94,248,0.08)',
            borderBottomColor: 'transparent',
            borderLeftColor:   'rgba(123,94,248,0.08)',
            borderWidth: 0.75,
        }
        : {
            borderTopColor:    `${colors.gold}26`, // 0.15
            borderRightColor:  'transparent',
            borderBottomColor: `${colors.gold}0F`, // 0.06
            borderLeftColor:   'transparent',
            borderWidth: 0.5,
        };

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    ...ringStyle,
                },
                style,
            ]}
        />
    );
}

export default function PremiumLogo({ delay = 0, scale = 1 }: { delay?: number; scale?: number }) {
    const { colors } = useTheme();

    // Logo Animations
    const vinOp    = useSharedValue(0);
    const vinY     = useSharedValue(24);
    const rX       = useSharedValue(170);
    const rOp      = useSharedValue(0);
    const streakOp = useSharedValue(0);
    const uLineX   = useSharedValue(-60);
    const uLineOp  = useSharedValue(0);
    const logoOp   = useSharedValue(0);

    useEffect(() => {
        logoOp.value   = withDelay(delay + 0,    withTiming(1, { duration: 250 }));
        vinOp.value    = withDelay(delay + 60,   withTiming(1, { duration: 500 }));
        vinY.value     = withDelay(delay + 60,   withSpring(0, { stiffness: 90, damping: 15 }));

        rOp.value      = withDelay(delay + 260,  withTiming(1, { duration: 100 }));
        rX.value       = withDelay(delay + 260,  withSpring(0, { stiffness: 130, damping: 18, velocity: -60 }));
        streakOp.value = withDelay(delay + 260,  withSequence(
            withTiming(1,   { duration: 55  }),
            withTiming(0.7, { duration: 280 }),
            withTiming(0,   { duration: 200 })
        ));

        uLineOp.value  = withDelay(delay + 750, withSequence(
            withTiming(1, { duration: 60 }),
            withDelay(520, withTiming(0, { duration: 220 }))
        ));
        uLineX.value   = withDelay(delay + 750, withTiming(230, {
            duration: 520, easing: Easing.out(Easing.quad),
        }));
    }, [delay]);

    const vinStyle    = useAnimatedStyle(() => ({ opacity: vinOp.value,  transform: [{ translateY: vinY.value }] }));
    const rStyle      = useAnimatedStyle(() => ({ opacity: rOp.value,    transform: [{ translateX: rX.value   }] }));
    const streakStyle = useAnimatedStyle(() => ({ opacity: streakOp.value }));
    const uLineStyle  = useAnimatedStyle(() => ({ opacity: uLineOp.value, transform: [{ translateX: uLineX.value }] }));
    const logoStyle   = useAnimatedStyle(() => ({ opacity: logoOp.value, transform: [{ scale }] }));

    return (
        <Animated.View style={[styles.logoZone, logoStyle]}>
            {/* Gyroscope rings — 4 layers */}
            <OrbitRing size={158 * scale} duration={7200}  delay={delay + 200}  variant="primary"   />
            <OrbitRing size={198 * scale} duration={12000} delay={delay + 400} variant="secondary" reverse />
            <OrbitRing size={244 * scale} duration={18000} delay={delay + 600} variant="primary"   />
            <OrbitRing size={290 * scale} duration={28000} delay={delay + 800} variant="micro"     reverse />

            {/* Enhanced Background Orbs/Halos */}
            <View style={[styles.logoBedOuter2, { width: 320 * scale, height: 320 * scale, borderRadius: 160 * scale }]} />
            <View style={[styles.logoBedOuter, { width: 220 * scale, height: 220 * scale, borderRadius: 110 * scale }]} />
            <View style={[styles.logoBed, { width: 130 * scale, height: 130 * scale, borderRadius: 65 * scale, backgroundColor: `${colors.gold}14` }]} />
            <View style={[styles.logoRingStatic, { width: 120 * scale, height: 120 * scale, borderRadius: 60 * scale, borderColor: `${colors.gold}52` }]} />

            {/* Wordmark */}
            <View style={styles.wordmarkWrap}>
                <View style={[styles.uLineTrack, { bottom: -7 * scale }]} pointerEvents="none">
                    <Animated.View style={[styles.uLineBeam, uLineStyle]}>
                        <LinearGradient
                            colors={['transparent', colors.goldLight, colors.gold, 'transparent']}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={{ flex: 1, borderRadius: 1 }}
                        />
                    </Animated.View>
                </View>

                <Animated.Text style={[styles.logoVin, vinStyle, { fontSize: 47 * scale, lineHeight: 54 * scale, color: colors.textPrimary }]}>vin</Animated.Text>

                <Animated.View style={[styles.rContainer, rStyle]}>
                    <Animated.View style={[styles.cometStreakHalo, streakStyle]} pointerEvents="none">
                        <LinearGradient
                            colors={[`${colors.gold}26`, 'transparent']}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={{ flex: 1, borderRadius: 4 }}
                        />
                    </Animated.View>
                    <Animated.View style={[styles.cometStreak, streakStyle]} pointerEvents="none">
                        <LinearGradient
                            colors={[colors.goldLight, `${colors.gold}4D`, 'transparent']}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={{ flex: 1, borderRadius: 1 }}
                        />
                    </Animated.View>
                    <Text style={[styles.logoR, { 
                        fontSize: 55 * scale, 
                        lineHeight: 60 * scale, 
                        color: colors.gold,
                    }]}>R</Text>
                </Animated.View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    logoZone: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoBedOuter2: {
        position: 'absolute',
        backgroundColor: 'rgba(212,175,55,0.02)',
    },
    logoBedOuter: {
        position: 'absolute',
        backgroundColor: 'rgba(212,175,55,0.04)',
    },
    logoBed: {
        position: 'absolute',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.55,
        shadowRadius: 48,
    },
    logoRingStatic: {
        position: 'absolute',
        borderWidth: 0.5,
    },
    wordmarkWrap: {
        flexDirection: 'row',
        alignItems: 'baseline',
        position: 'relative',
    },
    uLineTrack: {
        position: 'absolute',
        left: -8, right: -8,
        height: 1.5,
        overflow: 'hidden',
    },
    uLineBeam: {
        position: 'absolute',
        top: 0, bottom: 0,
        left: -60, width: 60,
    },
    logoVin: {
        fontFamily: 'DMSans_300Light',
        letterSpacing: -1,
    },
    rContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        position: 'relative',
    },
    logoR: {
        fontFamily: 'DMSans_600SemiBold',
        letterSpacing: -1,
    },
    cometStreakHalo: {
        position: 'absolute',
        left: '100%',
        top: '38%',
        width: 90, height: 10,
        marginLeft: 3,
    },
    cometStreak: {
        position: 'absolute',
        left: '100%',
        top: '44%',
        width: 78, height: 2.5,
        marginLeft: 3,
    },
});


import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue, useAnimatedStyle,
    withRepeat, withSequence, withTiming, withDelay,
    withSpring, Easing, interpolate,
} from 'react-native-reanimated';
import { haptics } from '../../services/haptics';
import { useCheckinStore } from '../../stores/checkinStore';
import { useCheckin } from '../../hooks/useCheckin';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const AFFIRMATIONS = [
    "You are not your worst moments.",
    "Every emotion is valid.",
    "Asking for help is strength.",
    "This feeling will pass.",
    "You deserve to feel better.",
    "Small steps lead to big changes.",
    "You are worth fighting for.",
];

// ─── Orbit Ring ───────────────────────────────────────────────────────────────
function OrbitRing({ size, duration, reverse = false, delay: d, variant = 'primary' }: {
    size: number; duration: number; reverse?: boolean;
    delay: number; variant?: 'primary' | 'secondary' | 'micro';
}) {
    const { colors, isDark } = useTheme();
    const rot = useSharedValue(0);
    const op  = useSharedValue(0);

    useEffect(() => {
        op.value  = withDelay(d, withTiming(1, { duration: 800 }));
        rot.value = withRepeat(
            withTiming(reverse ? -360 : 360, { duration, easing: Easing.linear }),
            -1, false
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rot.value}deg` }],
        opacity: op.value,
    }));

    const ringStyle = variant === 'primary' ? {
        borderTopColor:    isDark ? 'rgba(212,175,55,0.75)' : 'rgba(184,131,42,0.4)',
        borderRightColor:  isDark ? 'rgba(212,175,55,0.18)' : 'rgba(184,131,42,0.1)',
        borderBottomColor: 'transparent',
        borderLeftColor:   isDark ? 'rgba(212,175,55,0.18)' : 'rgba(184,131,42,0.1)',
        borderWidth: 1,
    } : variant === 'secondary' ? {
        borderTopColor:    isDark ? 'rgba(123,94,248,0.4)' : 'rgba(142,108,184,0.25)',
        borderRightColor:  isDark ? 'rgba(123,94,248,0.08)' : 'rgba(142,108,184,0.05)',
        borderBottomColor: 'transparent',
        borderLeftColor:   isDark ? 'rgba(123,94,248,0.08)' : 'rgba(142,108,184,0.05)',
        borderWidth: 0.75,
    } : {
        borderTopColor:    isDark ? 'rgba(212,175,55,0.15)' : 'rgba(184,131,42,0.15)',
        borderRightColor:  'transparent',
        borderBottomColor: isDark ? 'rgba(212,175,55,0.06)' : 'rgba(184,131,42,0.05)',
        borderLeftColor:   'transparent',
        borderWidth: 0.5,
    };

    return (
        <Animated.View style={[{
            position: 'absolute',
            width: size, height: size, borderRadius: size / 2,
            ...ringStyle,
        }, style]} />
    );
}

// ─── Ambient Blob ─────────────────────────────────────────────────────────────
function AmbientBlob({ color, size, top, left, right, delay: d, duration }: {
    color: string; size: number; top: number;
    left?: number; right?: number; delay: number; duration: number;
}) {
    const scale = useSharedValue(0.85);
    const op    = useSharedValue(0);
    const tx    = useSharedValue(0);
    const ty    = useSharedValue(0);

    useEffect(() => {
        op.value    = withDelay(d, withTiming(1, { duration: 1400 }));
        scale.value = withRepeat(
            withSequence(
                withTiming(1.18, { duration, easing: Easing.inOut(Easing.sin) }),
                withTiming(0.85, { duration, easing: Easing.inOut(Easing.sin) })
            ), -1, true
        );
        tx.value = withDelay(d + 400, withRepeat(
            withSequence(
                withTiming(28, { duration: duration * 1.3, easing: Easing.inOut(Easing.sin) }),
                withTiming(-28, { duration: duration * 1.3, easing: Easing.inOut(Easing.sin) })
            ), -1, true
        ));
        ty.value = withDelay(d + 900, withRepeat(
            withSequence(
                withTiming(-22, { duration: duration * 1.1, easing: Easing.inOut(Easing.sin) }),
                withTiming(22,  { duration: duration * 1.1, easing: Easing.inOut(Easing.sin) })
            ), -1, true
        ));
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: op.value,
        transform: [{ scale: scale.value }, { translateX: tx.value }, { translateY: ty.value }],
    }));

    return (
        <Animated.View style={[{
            position: 'absolute', width: size, height: size,
            borderRadius: size / 2, backgroundColor: color, top, left, right,
        }, style]} />
    );
}

// ─── Particle ─────────────────────────────────────────────────────────────────
function Particle({ x, y, r, delay: d, color }: {
    x: number; y: number; r: number; delay: number; color?: string;
}) {
    const { colors } = useTheme();
    const op = useSharedValue(0);
    const ty = useSharedValue(0);
    const particleColor = color || colors.gold;

    useEffect(() => {
        op.value = withDelay(d, withTiming(0.7, { duration: 1000 }));
        ty.value = withDelay(d, withRepeat(
            withSequence(
                withTiming(-14, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
                withTiming(14,  { duration: 2800, easing: Easing.inOut(Easing.sin) })
            ), -1, true
        ));
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: op.value,
        transform: [{ translateY: ty.value }],
    }));

    return (
        <Animated.View style={[{
            position: 'absolute', left: x, top: y,
            width: r, height: r, borderRadius: r / 2,
            backgroundColor: particleColor,
            shadowColor: particleColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1, shadowRadius: r * 3,
        }, style]} />
    );
}

// ─── Pulse Ring (breathing halo around logo) ──────────────────────────────────
function PulseRing({ size, delay: d }: { size: number; delay: number }) {
    const { colors } = useTheme();
    const scale = useSharedValue(1);
    const op    = useSharedValue(0);

    useEffect(() => {
        op.value    = withDelay(d, withTiming(0.5, { duration: 600 }));
        scale.value = withDelay(d, withRepeat(
            withSequence(
                withTiming(1.35, { duration: 2000, easing: Easing.out(Easing.quad) }),
                withTiming(1,    { duration: 2000, easing: Easing.in(Easing.quad) })
            ), -1, false
        ));
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: interpolate(scale.value, [1, 1.35], [0.35, 0]),
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[{
            position: 'absolute',
            width: size, height: size, borderRadius: size / 2,
            borderWidth: 1,
            borderColor: colors.gold + '99',
        }, style]} />
    );
}

// ─── Wave Dots ────────────────────────────────────────────────────────────────
function WaveDots() {
    const dots = [0, 1, 2, 3, 4];

    return (
        <View style={s.dotsRow}>
            {dots.map(i => <WaveDot key={i} index={i} />)}
        </View>
    );
}

function WaveDot({ index }: { index: number }) {
    const { colors } = useTheme();
    const ty = useSharedValue(0);
    const op = useSharedValue(0);

    useEffect(() => {
        op.value = withDelay(300 + index * 80, withTiming(1, { duration: 400 }));
        ty.value = withDelay(500 + index * 100, withRepeat(
            withSequence(
                withTiming(-8, { duration: 400, easing: Easing.inOut(Easing.sin) }),
                withTiming(0,  { duration: 400, easing: Easing.inOut(Easing.sin) })
            ), -1, false
        ));
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: op.value,
        transform: [{ translateY: ty.value }],
    }));

    return (
        <Animated.View style={[s.dot, { backgroundColor: colors.gold, shadowColor: colors.gold }, style]} />
    );
}

// ─── Affirmation Text (focus-pull cross-fade) ─────────────────────────────────
function AffirmationDisplay({ text }: { text: string }) {
    const { colors, fonts } = useTheme();
    const op  = useSharedValue(0);
    const spc = useSharedValue(4);

    useEffect(() => {
        op.value  = withTiming(1,    { duration: 500 });
        spc.value = withTiming(0.15, { duration: 600, easing: Easing.out(Easing.quad) });
        return () => {
            op.value  = withTiming(0, { duration: 300 });
        };
    }, [text]);

    const style = useAnimatedStyle(() => ({
        opacity: op.value,
        letterSpacing: spc.value,
    }));

    return (
        <Animated.Text style={[s.affirmation, { color: colors.gold + 'B3', fontFamily: fonts.bodyLight }, style]}>
            "{text}"
        </Animated.Text>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LoadingScreen() {
    const { colors, fonts, isDark } = useTheme();
    const { selectedMood, inputText, setAnalyzing } = useCheckinStore();
    const checkin = useCheckin();
    const [affirmationIndex, setAffirmationIndex] = useState(0);

    // Entrance animations
    const logoOp = useSharedValue(0);
    const logoY  = useSharedValue(20);
    const subOp  = useSharedValue(0);
    const subY   = useSharedValue(10);
    const statusOp = useSharedValue(0);

    useEffect(() => {
        logoOp.value  = withDelay(200, withTiming(1, { duration: 600 }));
        logoY.value   = withDelay(200, withSpring(0, { stiffness: 90, damping: 16 }));
        subOp.value   = withDelay(600, withTiming(1, { duration: 500 }));
        subY.value    = withDelay(600, withSpring(0, { stiffness: 100, damping: 18 }));
        statusOp.value = withDelay(900, withTiming(1, { duration: 500 }));
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setAffirmationIndex(prev => (prev + 1) % AFFIRMATIONS.length);
        }, 3200);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!selectedMood) { router.back(); return; }
        setAnalyzing(true);
        checkin.mutate(
            { mood_tag: selectedMood, text: inputText || null },
            {
                onSuccess: (data) => {
                    setAnalyzing(false);
                    haptics.success();
                    if (data.plan.isEmergency) {
                        router.replace('/(tabs)/emergency');
                    } else {
                        router.replace('/(tabs)/results');
                    }
                },
                onError: () => {
                    setAnalyzing(false);
                    haptics.error();
                    router.replace('/(tabs)/results');
                },
            }
        );
    }, []);

    const logoStyle   = useAnimatedStyle(() => ({ opacity: logoOp.value, transform: [{ translateY: logoY.value }] }));
    const subStyle    = useAnimatedStyle(() => ({ opacity: subOp.value,  transform: [{ translateY: subY.value  }] }));
    const statusStyle = useAnimatedStyle(() => ({ opacity: statusOp.value }));

    // Mode-specific gradients
    const bgColors = isDark 
        ? ['#05040E', '#0C0A1C', '#120F28', '#080614', '#05040E'] 
        : ['#FDFCF9', '#F5F2EC', '#EAE6DB', '#F1EDE4', '#FDFCF9'];
    
    const subtleGradient = isDark
        ? ['rgba(123,94,248,0.06)', 'transparent']
        : ['rgba(184,131,42,0.08)', 'transparent'];

    return (
        <View style={[s.container, { backgroundColor: colors.void }]}>
            {/* Background */}
            <LinearGradient
                colors={bgColors as any}
                style={StyleSheet.absoluteFill}
                locations={[0, 0.25, 0.5, 0.75, 1]}
                start={{ x: 0.25, y: 0 }}
                end={{ x: 0.75, y: 1 }}
            />
            <LinearGradient
                colors={subtleGradient as any}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0.2 }}
                end={{ x: 0.5, y: 1 }}
            />

            {/* Ambient blobs */}
            <AmbientBlob color={isDark ? "rgba(212,175,55,0.06)" : "rgba(184,131,42,0.05)"} size={420} top={height * 0.02} left={-90} delay={200} duration={5400} />
            <AmbientBlob color={isDark ? "rgba(123,94,248,0.08)" : "rgba(44,109,179,0.04)"} size={360} top={height * 0.08} right={-100} delay={400} duration={6600} />
            <AmbientBlob color={isDark ? "rgba(40,90,210,0.05)" : "rgba(46,168,126,0.03)"} size={280} top={height * 0.62} right={-60} delay={300} duration={7800} />

            {/* Particles */}
            <Particle x={width * 0.08} y={height * 0.14} r={2.5} delay={500} />
            <Particle x={width * 0.84} y={height * 0.10} r={2}   delay={800} />
            <Particle x={width * 0.06} y={height * 0.66} r={2}   delay={1400} />

            {/* ── Logo zone ── */}
            <Animated.View style={[s.logoZone, logoStyle]}>
                <OrbitRing size={158} duration={7200}  delay={300} variant="primary"   />
                <OrbitRing size={198} duration={12000} delay={500} variant="secondary" reverse />
                <OrbitRing size={244} duration={18000} delay={700} variant="primary"   />

                <PulseRing size={130} delay={800} />
                <PulseRing size={158} delay={1400} />

                <View style={[s.logoBedOuter, { shadowColor: colors.gold, backgroundColor: colors.gold + (isDark ? '0A' : '10') }]} />
                <View style={[s.logoBed, { shadowColor: colors.gold, backgroundColor: colors.gold + (isDark ? '14' : '1A') }]} />
                <View style={[s.logoRingStatic, { borderColor: colors.gold + '4D' }]} />

                <View style={s.wordmark}>
                    <Text style={[s.logoVin, { color: colors.textPrimary, fontFamily: fonts.bodyLight }]}>vin</Text>
                    <Text style={[s.logoR, { 
                        color: colors.gold, 
                        fontFamily: fonts.bodySemiBold, 
                        textShadowColor: isDark ? colors.gold : 'transparent',
                        textShadowRadius: isDark ? 20 : 0
                    }]}>R</Text>
                </View>
            </Animated.View>

            {/* ── Subtitle ── */}
            <Animated.View style={[s.subtitleWrap, subStyle]}>
                <Text style={[s.subtitle, { color: colors.textMuted, fontFamily: fonts.bodyLight }]}>Reading your signal</Text>
                <WaveDots />
            </Animated.View>

            {/* ── Affirmation ── */}
            <AffirmationDisplay text={AFFIRMATIONS[affirmationIndex]} />

            {/* ── Status line ── */}
            <Animated.Text style={[s.status, { color: colors.textGhost, fontFamily: fonts.bodyLight }, statusStyle]}>
                AI analysis in progress
            </Animated.Text>
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    logoZone: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    logoBedOuter: {
        position: 'absolute',
        width: 220, height: 220, borderRadius: 110,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3, shadowRadius: 90,
    },
    logoBed: {
        position: 'absolute',
        width: 130, height: 130, borderRadius: 65,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6, shadowRadius: 48,
    },
    logoRingStatic: {
        position: 'absolute',
        width: 120, height: 120, borderRadius: 60,
        borderWidth: 0.5,
    },
    wordmark: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    logoVin: {
        fontSize: 38,
        letterSpacing: -0.5,
    },
    logoR: {
        fontSize: 46,
        letterSpacing: -0.5,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    subtitleWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 28,
    },
    subtitle: {
        fontSize: 16,
        letterSpacing: 0.2,
    },
    dotsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    dot: {
        width: 4, height: 4, borderRadius: 2,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8, shadowRadius: 4,
    },
    affirmation: {
        fontSize: 15.5,
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 24,
        marginBottom: 36,
        paddingHorizontal: 16,
    },
    status: {
        fontSize: 11,
        letterSpacing: 2.5,
        textTransform: 'uppercase',
    },
});
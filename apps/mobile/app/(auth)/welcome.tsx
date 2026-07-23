/**
 * WelcomeScreen — "Void Emergence" v2
 *
 * Six signature animation moments:
 *
 * 1. WARP SPEED INTRO (t=0ms)
 *    28 gold streaks explode radially from screen center, with dual-layer
 *    rendering (bright core + soft halo). Elongating scaleX 1→16 as they
 *    accelerate outward — the "awakening from void" moment.
 *
 * 2. GYROSCOPE RINGS (t=700ms)
 *    Four concentric arcs rotate at different speeds. Inner two use gold
 *    asymmetric opacity for the sweeping arc effect. Outer two are ultra-
 *    thin with micro-dashes, adding depth and a precision-instrument feel.
 *
 * 3. COMET LOGO ASSEMBLY (t=760ms)
 *    "vin" rises from y+24 with spring snap. "R" rockets in from x+170
 *    with a dual-layer comet tail (bright core + wide halo). Underline sweep
 *    with a glowing gold beam races beneath the full "vinR" wordmark.
 *
 * 4. RADAR LINE DRAW (t=1200ms)
 *    A 0.5px rule expands from a glowing center node. Two bright dots race
 *    along each arm simultaneously. A second pass of faint tick marks appear
 *    along the line, like a distance scale materializing.
 *
 * 5. FOCUS-PULL TYPOGRAPHY (t=1850ms–2350ms)
 *    Headlines start with wide letterSpacing (soft-focus blur feel), then
 *    compress to tight tracking — photographic rack-focus technique.
 *    Each line staggered 250ms. Sub-headline character-reveals with opacity.
 *
 * 6. LIQUID FILL CTA (t=2550ms)
 *    Button border with corner-accent animations glows in first. Molten gold
 *    floods left→right over 600ms with a shimmer highlight chasing the fill.
 *    Label materializes only once fill completes with a letter-spacing snap.
 */

import { useEffect } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Dimensions,
    Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDelay,
    withSequence,
    withRepeat,
    withTiming,
    Easing,
    interpolate,
    interpolateColor,
} from 'react-native-reanimated';
import { animation } from '../../constants/theme';
import { haptics } from '../../services/haptics';

const { width, height } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Palette ──────────────────────────────────────────────────────────────────
const GOLD           = '#D4AF37';
const GOLD_BRIGHT    = '#F2C84B';
const GOLD_DIM       = '#9A7B1A';
const VOID           = '#05040E';
const VOID_MID       = '#0A0818';
const PURPLE_ACCENT  = '#7B5EF8';
const PURPLE_SOFT    = 'rgba(123,94,248,0.15)';
const TEXT_HI        = '#ECEAF6';
const TEXT_MID       = 'rgba(236,234,246,0.52)';
const TEXT_LO        = 'rgba(236,234,246,0.22)';
const CTA_W          = width - 56;
const HALF_W         = (width - 56) / 2;

// ─── 1. Warp Streak (enhanced dual-layer) ────────────────────────────────────

const STREAK_COUNT  = 28;
const STREAK_ANGLES = Array.from({ length: STREAK_COUNT }, (_, i) => i * (360 / STREAK_COUNT));
const WARP_DIST     = Math.max(width, height) * 0.82;

function WarpStreak({
    angleDeg,
    delay: d,
    isCore,
}: {
    angleDeg: number;
    delay: number;
    isCore: boolean;
}) {
    const p = useSharedValue(0);

    useEffect(() => {
        p.value = withDelay(
            d,
            withTiming(1, { duration: 1300, easing: Easing.out(Easing.cubic) })
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: isCore
            ? interpolate(p.value, [0, 0.04, 0.55, 1], [0, 1, 0.7, 0])
            : interpolate(p.value, [0, 0.06, 0.6, 1], [0, 0.5, 0.3, 0]),
        transform: [
            { rotate: `${angleDeg}deg` },
            { translateX: WARP_DIST * p.value },
            { scaleX: interpolate(p.value, [0, 0.08, 1], [1, 6, 16]) },
        ],
    }));

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    width: isCore ? 2.5 : 5,
                    height: isCore ? 1.2 : 2.5,
                    borderRadius: 2,
                    backgroundColor: isCore ? GOLD_BRIGHT : 'rgba(212,175,55,0.25)',
                    left: width / 2 - (isCore ? 1.25 : 2.5),
                    top: height / 2 - (isCore ? 0.6 : 1.25),
                },
                style,
            ]}
        />
    );
}

// ─── 2. Gyroscope Rings (enhanced — 4 layers) ────────────────────────────────

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
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rot.value}deg` }],
        opacity: op.value,
    }));

    const ringStyle = variant === 'primary'
        ? {
            borderTopColor:    'rgba(212,175,55,0.75)',
            borderRightColor:  'rgba(212,175,55,0.18)',
            borderBottomColor: 'transparent',
            borderLeftColor:   'rgba(212,175,55,0.18)',
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
            borderTopColor:    'rgba(212,175,55,0.15)',
            borderRightColor:  'transparent',
            borderBottomColor: 'rgba(212,175,55,0.06)',
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

// ─── Ambient Blob (enhanced) ──────────────────────────────────────────────────

function AmbientBlob({
    color,
    size,
    top,
    left,
    right,
    delay: d,
    duration,
}: {
    color: string;
    size: number;
    top: number;
    left?: number;
    right?: number;
    delay: number;
    duration: number;
}) {
    const scale = useSharedValue(0.85);
    const op    = useSharedValue(0);
    const tx    = useSharedValue(0);
    const ty    = useSharedValue(0);

    useEffect(() => {
        op.value    = withDelay(d, withTiming(1, { duration: 1400 }));
        scale.value = withDelay(
            d,
            withRepeat(
                withSequence(
                    withTiming(1.18, { duration, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0.85, { duration, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                true
            )
        );
        tx.value = withDelay(
            d + 400,
            withRepeat(
                withSequence(
                    withTiming(32, { duration: duration * 1.3, easing: Easing.inOut(Easing.sin) }),
                    withTiming(-32, { duration: duration * 1.3, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                true
            )
        );
        ty.value = withDelay(
            d + 900,
            withRepeat(
                withSequence(
                    withTiming(-24, { duration: duration * 1.1, easing: Easing.inOut(Easing.sin) }),
                    withTiming(24, { duration: duration * 1.1, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                true
            )
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: op.value,
        transform: [
            { scale: scale.value },
            { translateX: tx.value },
            { translateY: ty.value },
        ],
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

// ─── Particle (enhanced with inner glow ring) ─────────────────────────────────

function Particle({
    x,
    y,
    r,
    delay: d,
    color = GOLD_BRIGHT,
    pulseSpeed = 2600,
}: {
    x: number;
    y: number;
    r: number;
    delay: number;
    color?: string;
    pulseSpeed?: number;
}) {
    const op    = useSharedValue(0);
    const ty    = useSharedValue(0);
    const tx    = useSharedValue(0);
    const pulse = useSharedValue(1);

    useEffect(() => {
        op.value = withDelay(d, withTiming(0.8, { duration: 1200 }));
        ty.value = withDelay(
            d,
            withRepeat(
                withSequence(
                    withTiming(-16, { duration: pulseSpeed + d * 0.15, easing: Easing.inOut(Easing.sin) }),
                    withTiming(16, { duration: pulseSpeed + d * 0.15, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                true
            )
        );
        tx.value = withDelay(
            d + 400,
            withRepeat(
                withSequence(
                    withTiming(-8, { duration: 3800, easing: Easing.inOut(Easing.sin) }),
                    withTiming(8, { duration: 3800, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                true
            )
        );
        pulse.value = withDelay(
            d,
            withRepeat(
                withSequence(
                    withTiming(1.6, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
                    withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                true
            )
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: op.value,
        transform: [{ translateY: ty.value }, { translateX: tx.value }],
    }));

    const haloStyle = useAnimatedStyle(() => ({
        opacity: op.value * 0.35,
        transform: [
            { translateY: ty.value },
            { translateX: tx.value },
            { scale: pulse.value },
        ],
    }));

    return (
        <>
            {/* Halo glow */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        left: x - r * 1.5,
                        top: y - r * 1.5,
                        width: r * 4,
                        height: r * 4,
                        borderRadius: r * 2,
                        backgroundColor: color,
                    },
                    haloStyle,
                ]}
            />
            {/* Core */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        left: x,
                        top: y,
                        width: r,
                        height: r,
                        borderRadius: r / 2,
                        backgroundColor: color,
                        shadowColor: color,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 1,
                        shadowRadius: r * 3,
                    },
                    style,
                ]}
            />
        </>
    );
}







// ─── Noise Overlay ────────────────────────────────────────────────────────────
// Subtle film-grain texture via tiled micro-pattern
function NoiseOverlay() {
    return (
        <View style={s.noiseOverlay} pointerEvents="none">
            <LinearGradient
                colors={['rgba(255,255,255,0.015)', 'transparent', 'rgba(255,255,255,0.01)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
        </View>
    );
}

// ─── 6. Liquid Fill CTA (enhanced shimmer + corner accents) ──────────────────

function LiquidCTA({ delay: d }: { delay: number }) {
    const borderOp  = useSharedValue(0);
    const glowOp    = useSharedValue(0);
    const fillW     = useSharedValue(0);
    const shimmerX  = useSharedValue(-80);
    const shimmerOp = useSharedValue(0);
    const labelOp   = useSharedValue(0);
    const labelSpc  = useSharedValue(3);
    const scale     = useSharedValue(1);

    useEffect(() => {
        borderOp.value  = withDelay(d,        withTiming(1, { duration: 360 }));
        glowOp.value    = withDelay(d + 200,  withTiming(1, { duration: 420 }));
        fillW.value     = withDelay(d + 360,  withTiming(CTA_W, {
            duration: 600, easing: Easing.inOut(Easing.quad),
        }));
        shimmerOp.value = withDelay(d + 380,  withTiming(1, { duration: 80 }));
        shimmerX.value  = withDelay(d + 380,  withTiming(CTA_W + 80, {
            duration: 600, easing: Easing.inOut(Easing.quad),
        }));
        labelOp.value   = withDelay(d + 980,  withTiming(1, { duration: 320 }));
        labelSpc.value  = withDelay(d + 980,  withTiming(0.2, {
            duration: 300, easing: Easing.out(Easing.quad),
        }));
    }, []);

    const borderStyle  = useAnimatedStyle(() => ({ opacity: borderOp.value }));
    const glowStyle    = useAnimatedStyle(() => ({ opacity: glowOp.value }));
    const fillStyle    = useAnimatedStyle(() => ({ width: fillW.value }));
    const shimmerStyle = useAnimatedStyle(() => ({
        opacity: shimmerOp.value,
        transform: [{ translateX: shimmerX.value }],
    }));
    const labelStyle   = useAnimatedStyle(() => ({
        opacity: labelOp.value,
        letterSpacing: labelSpc.value,
    }));
    const pressStyle   = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
        haptics.medium();
        scale.value = withSequence(
            withSpring(0.96, { stiffness: 400 }),
            withSpring(1, animation.spring)
        );
        setTimeout(() => router.push('/(auth)/sign-up'), 150);
    };

    return (
        <AnimatedPressable onPress={handlePress} style={[s.ctaOuter, pressStyle]}>
            {/* Outer glow */}
            <Animated.View style={[StyleSheet.absoluteFill, s.ctaGlow, glowStyle]} />
            {/* Border */}
            <Animated.View style={[StyleSheet.absoluteFill, s.ctaBorder, borderStyle]} />

            {/* Liquid fill */}
            <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 16 }]}>
                <Animated.View style={[{ height: '100%' }, fillStyle]}>
                    <LinearGradient
                        colors={[GOLD_BRIGHT, GOLD, '#C9981C']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ flex: 1 }}
                    />
                </Animated.View>
                {/* Shimmer highlight */}
                <Animated.View style={[s.ctaShimmer, shimmerStyle]}>
                    <LinearGradient
                        colors={['transparent', 'rgba(255,255,255,0.35)', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ flex: 1 }}
                    />
                </Animated.View>
            </View>
            {/* Label */}
            <Animated.View style={[StyleSheet.absoluteFill, s.ctaLabelRow]}>
                <Animated.Text style={[s.ctaText, labelStyle]}>Begin your winning journey</Animated.Text>
                <View style={s.ctaArrowCircle}>
                    <Text style={s.ctaArrow}>›</Text>
                </View>
            </Animated.View>
        </AnimatedPressable>
    );
}

// ─── Trust Pill ───────────────────────────────────────────────────────────────

function TrustPill({ icon, label }: { icon: string; label: string }) {
    return (
        <View style={s.trustPill}>
            <Text style={s.trustIcon}>{icon}</Text>
            <Text style={s.trustLabel}>{label}</Text>
        </View>
    );
}



// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function WelcomeScreen() {
    // Logo
    const vinOp    = useSharedValue(0);
    const vinY     = useSharedValue(24);
    const rX       = useSharedValue(170);
    const rOp      = useSharedValue(0);
    const streakOp = useSharedValue(0);
    const uLineX   = useSharedValue(-60);
    const uLineOp  = useSharedValue(0);
    const logoOp   = useSharedValue(0);

    // Headline
    const h1Op   = useSharedValue(0);
    const h1Y    = useSharedValue(20);
    const h1Spc  = useSharedValue(8);
    const h2Op   = useSharedValue(0);
    const h2Y    = useSharedValue(20);
    const h2Spc  = useSharedValue(8);
    const subOp  = useSharedValue(0);
    const subY   = useSharedValue(14);

    // Bottom
    const hudOp    = useSharedValue(0);
    const signInOp = useSharedValue(0);
    const trustOp  = useSharedValue(0);

    useEffect(() => {
        logoOp.value   = withDelay(700,  withTiming(1, { duration: 250 }));

        vinOp.value    = withDelay(760,  withTiming(1, { duration: 500 }));
        vinY.value     = withDelay(760,  withSpring(0, { stiffness: 90, damping: 15 }));

        rOp.value      = withDelay(960,  withTiming(1, { duration: 100 }));
        rX.value       = withDelay(960,  withSpring(0, { stiffness: 130, damping: 18, velocity: -60 }));
        streakOp.value = withDelay(960,  withSequence(
            withTiming(1,   { duration: 55  }),
            withTiming(0.7, { duration: 280 }),
            withTiming(0,   { duration: 200 })
        ));

        uLineOp.value  = withDelay(1450, withSequence(
            withTiming(1, { duration: 60 }),
            withDelay(520, withTiming(0, { duration: 220 }))
        ));
        uLineX.value   = withDelay(1450, withTiming(230, {
            duration: 520, easing: Easing.out(Easing.quad),
        }));

        h1Op.value     = withDelay(1850, withTiming(1,  { duration: 520 }));
        h1Y.value      = withDelay(1850, withSpring(0,  { stiffness: 90, damping: 16 }));
        h1Spc.value    = withDelay(1850, withTiming(-1.5, { duration: 580, easing: Easing.out(Easing.quad) }));
        h2Op.value     = withDelay(2100, withTiming(1,  { duration: 520 }));
        h2Y.value      = withDelay(2100, withSpring(0,  { stiffness: 90, damping: 16 }));
        h2Spc.value    = withDelay(2100, withTiming(-2, { duration: 580, easing: Easing.out(Easing.quad) }));
        subOp.value    = withDelay(2350, withTiming(1,  { duration: 500 }));
        subY.value     = withDelay(2350, withSpring(0,  { stiffness: 110, damping: 20 }));

        signInOp.value = withDelay(3300, withTiming(1, { duration: 500 }));
        trustOp.value  = withDelay(3500, withTiming(1, { duration: 500 }));
    }, []);

    const vinStyle    = useAnimatedStyle(() => ({ opacity: vinOp.value,  transform: [{ translateY: vinY.value }] }));
    const rStyle      = useAnimatedStyle(() => ({ opacity: rOp.value,    transform: [{ translateX: rX.value   }] }));
    const streakStyle = useAnimatedStyle(() => ({ opacity: streakOp.value }));
    const uLineStyle  = useAnimatedStyle(() => ({ opacity: uLineOp.value, transform: [{ translateX: uLineX.value }] }));
    const logoStyle   = useAnimatedStyle(() => ({ opacity: logoOp.value }));
    const hudStyle    = useAnimatedStyle(() => ({ opacity: hudOp.value  }));
    const h1Style     = useAnimatedStyle(() => ({ opacity: h1Op.value,   transform: [{ translateY: h1Y.value   }], letterSpacing: h1Spc.value }));
    const h2Style     = useAnimatedStyle(() => ({ opacity: h2Op.value,   transform: [{ translateY: h2Y.value   }], letterSpacing: h2Spc.value }));
    const subStyle    = useAnimatedStyle(() => ({ opacity: subOp.value,  transform: [{ translateY: subY.value  }] }));
    const signInStyle = useAnimatedStyle(() => ({ opacity: signInOp.value }));
    const trustStyle  = useAnimatedStyle(() => ({ opacity: trustOp.value  }));

    return (
        <View style={s.container}>

            {/* ── Base gradient — richer layered void ── */}
            <LinearGradient
                colors={['#05040E', '#0C0A1C', '#120F28', '#080614', '#05040E']}
                style={StyleSheet.absoluteFill}
                locations={[0, 0.25, 0.5, 0.75, 1]}
                start={{ x: 0.25, y: 0 }}
                end={{ x: 0.75, y: 1 }}
            />

            {/* ── Radial vignette center highlight ── */}
            <LinearGradient
                colors={['rgba(123,94,248,0.06)', 'transparent']}
                style={[StyleSheet.absoluteFill, { borderRadius: 0 }]}
                start={{ x: 0.5, y: 0.3 }}
                end={{ x: 0.5, y: 1 }}
            />

            {/* ── 1. Warp field — dual layer ── */}
            {STREAK_ANGLES.map((a, i) => (
                <WarpStreak key={`c${i}`} angleDeg={a} delay={i * 18}  isCore />
            ))}
            {STREAK_ANGLES.map((a, i) => (
                <WarpStreak key={`h${i}`} angleDeg={a + 2} delay={i * 18 + 60} isCore={false} />
            ))}

            {/* ── Noise film-grain overlay ── */}
            <NoiseOverlay />



            {/* ── Aurora blobs — enhanced depth ── */}
            <AmbientBlob color="rgba(212,175,55,0.065)" size={460} top={height * 0.03}  left={-90}          delay={200} duration={5400} />
            <AmbientBlob color="rgba(123,94,248,0.10)"  size={380} top={height * 0.08}  right={-110}        delay={500} duration={6600} />
            <AmbientBlob color="rgba(212,175,55,0.04)"  size={300} top={height * 0.52}  left={width * 0.25} delay={800} duration={4800} />
            <AmbientBlob color="rgba(40,90,210,0.07)"   size={340} top={height * 0.58}  right={-70}         delay={300} duration={8000} />
            <AmbientBlob color="rgba(123,94,248,0.05)"  size={200} top={height * 0.38}  left={-40}          delay={700} duration={6200} />

            {/* ── Starfield ── */}
            <Particle x={width * 0.10} y={height * 0.17} r={2.5}  delay={900}  />
            <Particle x={width * 0.83} y={height * 0.11} r={3}    delay={1200} />
            <Particle x={width * 0.65} y={height * 0.29} r={2}    delay={1500} />
            <Particle x={width * 0.21} y={height * 0.39} r={3}    delay={1800} />
            <Particle x={width * 0.91} y={height * 0.45} r={2}    delay={2100} />
            <Particle x={width * 0.45} y={height * 0.68} r={2}    delay={2400} color="rgba(160,110,255,0.9)" pulseSpeed={3000} />
            <Particle x={width * 0.06} y={height * 0.57} r={2.5}  delay={2700} color="rgba(160,110,255,0.9)" pulseSpeed={2800} />
            <Particle x={width * 0.95} y={height * 0.25} r={2}    delay={3000} />
            <Particle x={width * 0.35} y={height * 0.82} r={1.8}  delay={1600} color="rgba(212,175,55,0.7)"  pulseSpeed={3400} />
            <Particle x={width * 0.72} y={height * 0.75} r={1.5}  delay={2200} color="rgba(160,110,255,0.6)" pulseSpeed={2400} />

            {/* ── 2 + 3. Logo zone ── */}
            <Animated.View style={[s.logoZone, logoStyle]}>

                {/* 2. Gyroscope rings — 4 layers */}
                <OrbitRing size={158} duration={7200}  delay={900}  variant="primary"   />
                <OrbitRing size={198} duration={12000} delay={1100} variant="secondary" reverse />
                <OrbitRing size={244} duration={18000} delay={1300} variant="primary"   />
                <OrbitRing size={290} duration={28000} delay={1500} variant="micro"     reverse />

                {/* Large diffuse outer halo */}
                <View style={s.logoBedOuter2} />
                <View style={s.logoBedOuter} />

                {/* Inner glow bed */}
                <View style={s.logoBed} />

                {/* Inner static precision ring */}
                <View style={s.logoRingStatic} />

                {/* Secondary micro ring */}
                <View style={s.logoRingMicro} />



                {/* 3. vinR wordmark */}
                <View style={s.wordmarkWrap}>
                    {/* Underline sweep */}
                    <View style={s.uLineTrack} pointerEvents="none">
                        <Animated.View style={[s.uLineBeam, uLineStyle]}>
                            <LinearGradient
                                colors={['transparent', GOLD_BRIGHT, GOLD, 'transparent']}
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 1, y: 0.5 }}
                                style={{ flex: 1, borderRadius: 1 }}
                            />
                        </Animated.View>
                    </View>

                    {/* "vin" */}
                    <Animated.Text style={[s.logoVin, vinStyle]}>vin</Animated.Text>

                    {/* "R" + comet streak */}
                    <Animated.View style={[s.rContainer, rStyle]}>
                        {/* Wide halo streak */}
                        <Animated.View style={[s.cometStreakHalo, streakStyle]} pointerEvents="none">
                            <LinearGradient
                                colors={['rgba(242,200,75,0.15)', 'transparent']}
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 1, y: 0.5 }}
                                style={{ flex: 1, borderRadius: 4 }}
                            />
                        </Animated.View>
                        {/* Core streak */}
                        <Animated.View style={[s.cometStreak, streakStyle]} pointerEvents="none">
                            <LinearGradient
                                colors={[GOLD_BRIGHT, 'rgba(212,175,55,0.3)', 'transparent']}
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 1, y: 0.5 }}
                                style={{ flex: 1, borderRadius: 1 }}
                            />
                        </Animated.View>
                        <Text style={s.logoR}>R</Text>
                    </Animated.View>
                </View>
            </Animated.View>



            {/* ── 5. Headlines ── */}
            <View style={s.headlineBlock}>
                <Animated.Text style={[s.h1, h1Style]}>Win your</Animated.Text>
                <Animated.Text style={[s.h2, h2Style]}>life back.</Animated.Text>
                <Animated.Text style={[s.sub, subStyle]}>
                    The science-based system that rebuilds{'\n'}your habits, identity & momentum.
                </Animated.Text>
            </View>

            <View style={s.spacer} />

            {/* ── 6. Liquid CTA ── */}
            <LiquidCTA delay={2550} />



            {/* ── Sign in ── */}
            <Animated.View style={signInStyle}>
                <Pressable
                    onPress={() => { haptics.light(); router.push('/(auth)/sign-in'); }}
                    style={s.signInRow}
                    hitSlop={12}
                >
                    <Text style={s.signInBase}>Already winning?</Text>
                    <Text style={s.signInAccent}> Sign in →</Text>
                </Pressable>
            </Animated.View>

            {/* ── Trust bar ── */}
            <Animated.View style={[s.trustBar, trustStyle]}>
                <TrustPill icon="⚡" label="Science-backed" />
                <View style={s.trustSep} />
                <TrustPill icon="✦"  label="AI-powered" />
                <View style={s.trustSep} />
                <TrustPill icon="◎"  label="21-day engine" />
            </Animated.View>

        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
    },

    // Noise
    noiseOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
        pointerEvents: 'none',
    },

    // HUD


    // Logo
    logoZone: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
    },
    logoBedOuter2: {
        position: 'absolute',
        width: 300, height: 300, borderRadius: 150,
        backgroundColor: 'rgba(123,94,248,0.03)',
        shadowColor: PURPLE_ACCENT,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 100,
    },
    logoBedOuter: {
        position: 'absolute',
        width: 220, height: 220, borderRadius: 110,
        backgroundColor: 'rgba(212,175,55,0.04)',
        shadowColor: GOLD,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.22,
        shadowRadius: 90,
    },
    logoBed: {
        position: 'absolute',
        width: 130, height: 130, borderRadius: 65,
        backgroundColor: 'rgba(212,175,55,0.08)',
        shadowColor: GOLD,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.55,
        shadowRadius: 48,
    },
    logoRingStatic: {
        position: 'absolute',
        width: 120, height: 120, borderRadius: 60,
        borderWidth: 0.5,
        borderColor: 'rgba(212,175,55,0.32)',
    },
    logoRingMicro: {
        position: 'absolute',
        width: 96, height: 96, borderRadius: 48,
        borderWidth: 0.5,
        borderColor: 'rgba(212,175,55,0.12)',
    },
    wordmarkWrap: {
        flexDirection: 'row',
        alignItems: 'baseline',
        position: 'relative',
    },
    uLineTrack: {
        position: 'absolute',
        bottom: -7, left: -8, right: -8,
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
        fontSize: 47,
        color: TEXT_HI,
        letterSpacing: -1,
        lineHeight: 54,
    },
    rContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        position: 'relative',
    },
    logoR: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 55,
        color: GOLD,
        letterSpacing: -1,
        lineHeight: 60,
        textShadowColor: 'rgba(212,175,55,0.65)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
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



    // Headline
    headlineBlock: { alignItems: 'center' },
    h1: {
        fontFamily: 'DMSans_300Light',
        fontSize: 52, lineHeight: 54,
        color: 'rgba(236,234,246,0.48)',
        textAlign: 'center',
    },
    h2: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 60, lineHeight: 62,
        color: TEXT_HI,
        textAlign: 'center',
        marginBottom: 22,
        textShadowColor: 'rgba(236,234,246,0.08)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 20,
    },
    sub: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 15, lineHeight: 24,
        color: TEXT_MID,
        textAlign: 'center',
        letterSpacing: 0.15,
    },

    spacer: { height: 44 },

    // CTA
    ctaOuter: {
        width: CTA_W, height: 60,
        borderRadius: 16,
        marginBottom: 14,
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
        top: 0, bottom: 0,
        left: -80, width: 80,
    },
    ctaLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24, gap: 12,
    },
    ctaText: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 17,
        color: VOID,
        flex: 1,
    },
    ctaArrowCircle: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.16)',
        alignItems: 'center', justifyContent: 'center',
    },
    ctaArrow: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 22, color: VOID,
        lineHeight: 26, marginLeft: 1,
    },



    // Sign in
    signInRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 10, paddingHorizontal: 16,
    },
    signInBase: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 14.5,
        color: TEXT_LO,
    },
    signInAccent: {
        fontFamily: 'DMSans_500Medium',
        fontSize: 14.5,
        color: GOLD,
    },

    // Trust bar
    trustBar: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 46 : 70,
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 8,
        backgroundColor: 'rgba(255,255,255,0.025)',
        borderRadius: 30,
        borderWidth: 0.5,
        borderColor: 'rgba(236,234,246,0.06)',
    },
    trustPill: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 8, gap: 6,
    },
    trustIcon: {
        fontSize: 9,
        color: 'rgba(212,175,55,0.45)',
    },
    trustLabel: {
        fontFamily: 'DMSans_300Light',
        fontSize: 10,
        color: TEXT_LO,
        letterSpacing: 0.7,
        textTransform: 'uppercase',
    },
    trustSep: {
        width: 0.5, height: 13,
        backgroundColor: 'rgba(236,234,246,0.07)',
    },
});
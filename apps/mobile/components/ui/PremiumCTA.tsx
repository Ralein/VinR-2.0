import React, { useEffect } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDelay,
    withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { haptics } from '../../services/haptics';
import { ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CTA_W = width - 64;

export default function PremiumCTA({ 
    onPress, 
    label = "Begin Your Journey", 
    delay = 0,
    disabled = false,
    loading = false
}: { 
    onPress: () => void; 
    label?: string;
    delay?: number;
    disabled?: boolean;
    loading?: boolean;
}) {
    const { colors, fonts } = useTheme();
    
    // Animations
    const opacity   = useSharedValue(0);
    const scale     = useSharedValue(0.9);
    const pressScale = useSharedValue(1);
    const glowOp    = useSharedValue(0);

    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
        scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 90 }));
        glowOp.value = withDelay(delay + 400, withTiming(1, { duration: 800 }));
    }, [delay]);

    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value * pressScale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOp.value * (disabled ? 0 : 1),
    }));

    const handlePressIn = () => {
        if (disabled) return;
        haptics.light();
        pressScale.value = withSpring(0.97, { damping: 10, stiffness: 300 });
    };

    const handlePressOut = () => {
        if (disabled) return;
        pressScale.value = withSpring(1, { damping: 10, stiffness: 300 });
    };

    const handlePress = () => {
        if (disabled || loading) return;
        haptics.medium();
        onPress();
    };

    return (
        <AnimatedPressable 
            onPress={handlePress} 
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            style={[styles.container, containerStyle]}
        >
            {/* Subtle Outer Glow */}
            {!disabled && (
                <Animated.View style={[StyleSheet.absoluteFill, styles.glow, glowStyle, { shadowColor: colors.gold }]} />
            )}
            
            {/* Button Body */}
            <View style={[StyleSheet.absoluteFill, styles.body, { backgroundColor: colors.gold, opacity: disabled ? 0.4 : 1 }]}>
                <LinearGradient
                    colors={[colors.goldLight, colors.gold, colors.goldMuted]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                />
            </View>

            {/* Label Content */}
            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="small" color={colors.void} />
                ) : (
                    <>
                        {/* Space for centering */}
                        <View style={{ width: 30 }} />
                        <Text style={[styles.text, { color: colors.void, fontFamily: fonts.bodySemiBold }]}>
                            {label.toUpperCase()}
                        </Text>
                        <View style={[styles.arrowCircle, { backgroundColor: 'rgba(0,0,0,0.12)' }]}>
                            <ChevronRight size={18} color={colors.void} strokeWidth={3} />
                        </View>
                    </>
                )}
            </View>
            
            {/* Refined Border */}
            <View style={[StyleSheet.absoluteFill, styles.border, { borderColor: `${colors.gold}45` }]} />
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: CTA_W,
        height: 62,
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 16,
        alignSelf: 'center',
    },
    glow: {
        borderRadius: 18,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    body: {
        borderRadius: 18,
        overflow: 'hidden',
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        gap: 12,
    },
    text: {
        fontSize: 16,
        letterSpacing: 2,
        flex: 1,
        textAlign: 'center',
    },
    arrowCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    border: {
        borderRadius: 18,
        borderWidth: 1,
    },
});

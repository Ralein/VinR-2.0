import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing,
    runOnJS,
    cancelAnimation
} from 'react-native-reanimated';
import { colors, fonts } from '../constants/theme';

export type BreathingPattern = 'box' | '478';

interface BreathingAnimationProps {
    pattern: BreathingPattern;
    isActive: boolean;
}

export default function BreathingAnimation({ pattern, isActive }: BreathingAnimationProps) {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.5);
    const [instruction, setInstruction] = useState('Ready');

    useEffect(() => {
        if (!isActive) {
            cancelAnimation(scale);
            cancelAnimation(opacity);
            scale.value = withTiming(1);
            opacity.value = withTiming(0.5);
            setInstruction('Ready');
            return;
        }

        const runBoxBreathing = () => {
            if (!isActive) return;
            setInstruction('Inhale...');
            scale.value = withTiming(2, { duration: 4000, easing: Easing.inOut(Easing.ease) });
            opacity.value = withTiming(1, { duration: 4000 }, () => {
                runOnJS(setInstruction)('Hold...');
                scale.value = withDelay(4000, withTiming(2, { duration: 0 }, () => {
                    runOnJS(setInstruction)('Exhale...');
                    scale.value = withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) });
                    opacity.value = withTiming(0.5, { duration: 4000 }, () => {
                        runOnJS(setInstruction)('Hold...');
                        scale.value = withDelay(4000, withTiming(1, { duration: 0 }, () => {
                            if (isActive) {
                                runOnJS(runBoxBreathing)();
                            }
                        }));
                    });
                }));
            });
        };

        const run478Breathing = () => {
            if (!isActive) return;
            setInstruction('Inhale (4s)...');
            scale.value = withTiming(2, { duration: 4000, easing: Easing.inOut(Easing.ease) });
            opacity.value = withTiming(1, { duration: 4000 }, () => {
                runOnJS(setInstruction)('Hold (7s)...');
                scale.value = withDelay(7000, withTiming(2, { duration: 0 }, () => {
                    runOnJS(setInstruction)('Exhale (8s)...');
                    scale.value = withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) });
                    opacity.value = withTiming(0.5, { duration: 8000 }, () => {
                        if (isActive) {
                            runOnJS(run478Breathing)();
                        }
                    });
                }));
            });
        };

        if (pattern === 'box') {
            runBoxBreathing();
        } else {
            run478Breathing();
        }

        return () => {
            cancelAnimation(scale);
            cancelAnimation(opacity);
        };
    }, [isActive, pattern]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    });

    return (
        <View style={styles.container}>
            <View style={styles.animationContainer}>
                <Animated.View style={[styles.circle, animatedStyle]} />
                <View style={styles.textContainer}>
                    <Text style={styles.instructionText}>{instruction}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 40,
    },
    animationContainer: {
        width: 250,
        height: 250,
        alignItems: 'center',
        justifyContent: 'center',
    },
    circle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.gold,
        position: 'absolute',
    },
    textContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    instructionText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 18,
        color: colors.textPrimary,
        textAlign: 'center',
    },
});

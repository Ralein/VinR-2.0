/**
 * ProgressDots — Animated step progress indicator
 *
 * Active step = gold pill, completed = gold circle, future = dim circle
 * Used across the 9-step onboarding.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';

interface ProgressDotsProps {
    currentStep: number;
    totalSteps?: number;
}

export function ProgressDots({ currentStep, totalSteps = 9 }: ProgressDotsProps) {
    return (
        <View style={styles.container}>
            {Array.from({ length: totalSteps }, (_, i) => (
                <Dot 
                    key={i} 
                    isActive={i + 1 === currentStep} 
                    isCompleted={i + 1 < currentStep} 
                />
            ))}
        </View>
    );
}

function Dot({ isActive, isCompleted }: { isActive: boolean; isCompleted: boolean }) {
    const animatedStyle = useAnimatedStyle(() => {
        const width = withSpring(isActive ? 24 : 8, { damping: 15 });
        const backgroundColor = isActive || isCompleted ? Colors.gold : 'rgba(255,255,255,0.25)';
        const opacity = withSpring(isActive ? 1 : isCompleted ? 0.6 : 0.2, { damping: 15 });

        return {
            width,
            backgroundColor,
            opacity,
        };
    });

    return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 40,
    },
    dot: {
        height: 6,
        borderRadius: 3,
    },
});


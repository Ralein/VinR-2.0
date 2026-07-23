import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface SafeBlurViewProps {
    intensity?: number;
    tint?: 'light' | 'dark' | 'default';
    style?: ViewStyle | ViewStyle[];
    children?: React.ReactNode;
}

/**
 * SafeBlurView: A robust wrapper for expo-blur that provides high-fidelity
 * translucent backgrounds with a safe fallback to semi-transparent views.
 */
export const SafeBlurView: React.FC<SafeBlurViewProps> = ({
    intensity = 60,
    tint = 'dark',
    style,
    children
}) => {
    return (
        <View style={[styles.container, style]}>
            <BlurView
                intensity={intensity}
                tint={tint}
                style={StyleSheet.absoluteFill}
            />
            {/* Fallback overlay for extra contrast */}
            <View style={[
                styles.overlay,
                { backgroundColor: tint === 'dark' ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.45)' }
            ]} />
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.1, // Subtle extra layering
    }
});

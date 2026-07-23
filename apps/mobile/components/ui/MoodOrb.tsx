/**
 * MoodOrb — Premium animated mood selector grid
 *
 * Displays mood options as glassmorphism pill cards with Lucide vector icons.
 * Selected state: gold border ring + glow + spring scale.
 * Replaces the emoji-based MoodChip component in checkin.tsx.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { type LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { haptics } from '../../services/haptics';

export interface MoodOption {
    value: string;
    label: string;
    Icon: LucideIcon;
    color?: string;
}

interface MoodOrbProps {
    moods: MoodOption[];
    selected: string | null;
    onSelect: (value: string) => void;
    columns?: 4 | 3;
}

function OrbItem({
    mood,
    isSelected,
    onPress,
    index,
}: {
    mood: MoodOption;
    isSelected: boolean;
    onPress: () => void;
    index: number;
}) {
    const { colors, fonts, glass, animation, isDark } = useTheme();
    const scale = useSharedValue(1);
    const { Icon, color = colors.gold } = mood;

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        borderColor: isSelected ? color : isDark ? colors.border : '#E8E1D0',
        borderWidth: isSelected ? 1.5 : 1,
        backgroundColor: isSelected 
            ? (isDark ? `${color}14` : `${color}18`) 
            : (isDark ? glass.background : '#FAF8F4'),
    }));

    const handlePress = () => {
        haptics.selection();
        scale.value = withSpring(0.93, animation.springStiff, () => {
            scale.value = withSpring(isSelected ? 1.04 : 1.02, animation.spring);
        });
        onPress();
    };

    return (
        <Animated.View
            entering={FadeInDown.delay(80 + index * 55).duration(380).springify()}
            style={{ flex: 1 }}
        >
            <Pressable onPress={handlePress}>
                <Animated.View style={[styles.orb, animatedStyle]}>
                    {/* Icon container with glow on selected */}
                    <View
                        style={[
                            styles.iconWrap,
                            { backgroundColor: isSelected ? `${color}22` : (isDark ? `${color}0A` : `${color}0D`) },
                        ]}
                    >
                        <Icon
                            size={22}
                            color={isSelected ? color : colors.textMuted}
                            strokeWidth={isSelected ? 2.2 : 1.8}
                        />
                    </View>
                    <Text style={[styles.label, { color: colors.textMuted, fontFamily: fonts.bodyLight }, isSelected && { color, fontFamily: fonts.bodySemiBold }]}>
                        {mood.label}
                    </Text>
                    {/* Gold dot indicator on selected */}
                    {isSelected && (
                        <View style={[styles.dot, { backgroundColor: color }]} />
                    )}
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
}

export default function MoodOrb({ moods, selected, onSelect, columns = 4 }: MoodOrbProps) {
    const { spacing } = useTheme();
    const rows: MoodOption[][] = [];
    for (let i = 0; i < moods.length; i += columns) {
        rows.push(moods.slice(i, i + columns));
    }

    return (
        <View style={styles.container}>
            {rows.map((row, rowIdx) => (
                <View key={rowIdx} style={[styles.row, { gap: spacing.sm }]}>
                    {row.map((mood, colIdx) => (
                        <OrbItem
                            key={mood.value}
                            mood={mood}
                            isSelected={selected === mood.value}
                            onPress={() => onSelect(mood.value)}
                            index={rowIdx * columns + colIdx}
                        />
                    ))}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    row: {
        flexDirection: 'row',
    },
    orb: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderRadius: 16,
        gap: 5,
        minHeight: 80,
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 11,
        textAlign: 'center',
        letterSpacing: 0.2,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
});

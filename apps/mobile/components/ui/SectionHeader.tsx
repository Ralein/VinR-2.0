import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { type LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface SectionHeaderProps {
    title: string;
    Icon?: LucideIcon;
    badge?: string | number;
    onSeeAll?: () => void;
    delay?: number;
    iconColor?: string;
}

export default function SectionHeader({
    title,
    Icon,
    badge,
    onSeeAll,
    delay = 0,
    iconColor,
}: SectionHeaderProps) {
    const { colors, fonts, spacing, isDark } = useTheme();
    const activeIconColor = iconColor || colors.gold;

    return (
        <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.row}>
            <View style={styles.left}>
                {Icon && (
                    <View style={[styles.iconBox, { backgroundColor: `${activeIconColor}18` }]}>
                        <Icon size={14} color={activeIconColor} strokeWidth={2.2} />
                    </View>
                )}
                <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>{title}</Text>
                {badge !== undefined && (
                    <View style={[styles.badge, { backgroundColor: isDark ? colors.goldMuted : `${colors.gold}12` }]}>
                        <Text style={[styles.badgeText, { color: colors.gold, fontFamily: fonts.bodySemiBold }]}>{badge}</Text>
                    </View>
                )}
            </View>
            {onSeeAll && (
                <Pressable onPress={onSeeAll} hitSlop={8}>
                    <Text style={[styles.seeAll, { color: colors.textMuted, fontFamily: fonts.body }]}>See all</Text>
                </Pressable>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconBox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        letterSpacing: -0.1,
    },
    badge: {
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    badgeText: {
        fontSize: 11,
    },
    seeAll: {
        fontSize: 13,
    },
});

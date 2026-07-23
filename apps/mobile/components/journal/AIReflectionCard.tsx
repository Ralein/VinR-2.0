/**
 * AIReflectionCard — Displays AI-generated reflection in Cormorant italic
 */

import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../../constants/theme';

interface AIReflectionCardProps {
    reflection: string;
}

export default function AIReflectionCard({ reflection }: AIReflectionCardProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.sparkle}>✨</Text>
                <Text style={styles.headerText}>VinR Reflects</Text>
            </View>
            <Text style={styles.reflectionText}>{reflection}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md + 4,
        borderWidth: 1,
        borderColor: colors.gold + '30',
        borderLeftWidth: 3,
        borderLeftColor: colors.gold,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    sparkle: {
        fontSize: 16,
        marginRight: spacing.xs + 2,
    },
    headerText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 13,
        color: colors.gold,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    reflectionText: {
        fontFamily: fonts.italic,
        fontSize: 17,
        color: colors.textPrimary,
        lineHeight: 26,
    },
});

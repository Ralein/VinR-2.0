/**
 * Notification Settings Screen
 * Toggle notification types, set reminder time, snooze
 * Redesigned for Midnight Gold aesthetic.
 */

import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Switch, Pressable,
    ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    Clock, AlertTriangle, Trophy, Heart, Moon, ArrowLeft
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useNotificationSettings } from '../hooks/useNotificationSettings';
import type { LucideIcon } from 'lucide-react-native';
import GlassCard from '../components/ui/GlassCard';

const NOTIFICATION_TYPES: {
    key: 'daily_reminder_enabled' | 'streak_at_risk_enabled' | 'milestone_enabled' | 're_engagement_enabled';
    title: string;
    description: string;
    Icon: LucideIcon;
    iconColor: string;
}[] = [
    {
        key: 'daily_reminder_enabled',
        title: 'Daily Protocol',
        description: 'Synchronized alignment at your preferred hour',
        Icon: Clock,
        iconColor: '#D4AF37',
    },
    {
        key: 'streak_at_risk_enabled',
        title: 'Continuity Alert',
        description: 'Warning at 11 PM to prevent path disruption',
        Icon: AlertTriangle,
        iconColor: '#E8A85D',
    },
    {
        key: 'milestone_enabled',
        title: 'Achievement Sync',
        description: 'Celebrate progression milestones (5, 10, 21 days)',
        Icon: Trophy,
        iconColor: '#D4AF37',
    },
    {
        key: 're_engagement_enabled',
        title: 'Re-alignment Nudge',
        description: 'Gentle recall if session attendance lapses',
        Icon: Heart,
        iconColor: '#4A90D9',
    },
];

const REMINDER_TIMES = [
    { label: '6:00 AM', value: '06:00:00' },
    { label: '7:00 AM', value: '07:00:00' },
    { label: '8:00 AM', value: '08:00:00' },
    { label: '9:00 AM', value: '09:00:00' },
    { label: '10:00 AM', value: '10:00:00' },
    { label: '12:00 PM', value: '12:00:00' },
    { label: '6:00 PM', value: '18:00:00' },
    { label: '8:00 PM', value: '20:00:00' },
];

export default function NotificationSettingsScreen() {
    const { colors, fonts, spacing } = useTheme();
    const router = useRouter();
    const {
        preferences,
        isLoading,
        updatePreferences,
        isUpdating,
        snooze,
        isSnoozeing,
    } = useNotificationSettings();

    const [showTimePicker, setShowTimePicker] = useState(false);

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.gold} />
                </View>
            </SafeAreaView>
        );
    }

    const currentTime = preferences?.daily_reminder_time || '08:00:00';
    const currentTimeLabel = REMINDER_TIMES.find(t => t.value === currentTime)?.label || '8:00 AM';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]}>
            
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: `#FFFFFF05`, borderColor: colors.border }]}>
                    <ArrowLeft size={24} color={colors.textPrimary} strokeWidth={1.5} />
                </Pressable>
                <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fonts.display }]}>Notifications</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                    Configure how VinR maintains your focus protocol.
                </Text>

                {/* Snooze Banner */}
                {preferences?.snooze_until && new Date(preferences.snooze_until) > new Date() && (
                    <View style={{ marginBottom: 24 }}>
                        <GlassCard accent="gold" glow={true} style={styles.snoozeBanner}>
                            <Moon size={20} color={colors.gold} strokeWidth={1.8} />
                            <Text style={[styles.snoozeText, { color: colors.textPrimary, fontFamily: fonts.body }]}>
                                Protocol paused until{' '}
                                <Text style={{ fontFamily: fonts.bodySemiBold }}>
                                    {new Date(preferences.snooze_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </Text>
                        </GlassCard>
                    </View>
                )}

                {/* Notification Toggles */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.gold, fontFamily: fonts.bodySemiBold }]}>Alert Types</Text>
                    <GlassCard accent="gold">
                        {NOTIFICATION_TYPES.map((type, index) => (
                            <View key={type.key}>
                                <View style={styles.toggleRow}>
                                    <View style={styles.toggleInfo}>
                                        <View style={[styles.toggleIconWrap, { backgroundColor: `${type.iconColor}10` }]}>
                                            <type.Icon size={18} color={type.iconColor} strokeWidth={1.8} />
                                        </View>
                                        <View style={styles.toggleText}>
                                            <Text style={[styles.toggleTitle, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>{type.title}</Text>
                                            <Text style={[styles.toggleDescription, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                                                {type.description}
                                            </Text>
                                        </View>
                                    </View>
                                    <Switch
                                        value={preferences?.[type.key] ?? true}
                                        onValueChange={(value) => updatePreferences({ [type.key]: value })}
                                        trackColor={{ false: `#FFFFFF10`, true: `${colors.gold}80` }}
                                        thumbColor={preferences?.[type.key] ? colors.gold : colors.textSecondary}
                                        disabled={isUpdating}
                                    />
                                </View>
                                {index < NOTIFICATION_TYPES.length - 1 && (
                                    <View style={[styles.divider, { backgroundColor: colors.border, opacity: 0.1, marginLeft: 68 }]} />
                                )}
                            </View>
                        ))}
                    </GlassCard>
                </View>

                {/* Reminder Time */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.gold, fontFamily: fonts.bodySemiBold }]}>Protocol Recurrence</Text>
                    <Pressable
                        onPress={() => setShowTimePicker(!showTimePicker)}
                    >
                        <GlassCard accent="gold" style={styles.timePickerButton}>
                            <Text style={[styles.timePickerLabel, { color: colors.textPrimary, fontFamily: fonts.body }]}>Scheduled Sync</Text>
                            <Text style={[styles.timePickerValue, { color: colors.gold, fontFamily: fonts.bodySemiBold }]}>{currentTimeLabel}</Text>
                        </GlassCard>
                    </Pressable>

                    {showTimePicker && (
                        <View style={styles.timeGrid}>
                            {REMINDER_TIMES.map((time) => (
                                <Pressable
                                    key={time.value}
                                    style={[
                                        styles.timeChip,
                                        { backgroundColor: `#FFFFFF05`, borderColor: colors.border },
                                        currentTime === time.value && { backgroundColor: `${colors.gold}20`, borderColor: colors.gold },
                                    ]}
                                    onPress={() => {
                                        updatePreferences({ daily_reminder_time: time.value });
                                        setShowTimePicker(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.timeChipText,
                                            { color: colors.textSecondary, fontFamily: fonts.body },
                                            currentTime === time.value && { color: colors.gold, fontFamily: fonts.bodySemiBold },
                                        ]}
                                    >
                                        {time.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>

                {/* Snooze */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.gold, fontFamily: fonts.bodySemiBold }]}>Temporary Silence</Text>
                    <Pressable
                        onPress={() => snooze(2)}
                        disabled={isSnoozeing}
                    >
                        <GlassCard accent="gold" style={styles.snoozeButton}>
                            <Moon size={18} color={colors.textPrimary} strokeWidth={1.8} />
                            <Text style={[styles.snoozeButtonText, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold, marginLeft: 12 }]}>
                                Snooze for 120 Minutes
                            </Text>
                        </GlassCard>
                    </Pressable>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
    },
    backButton: {
        width: 44, height: 44, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1,
    },
    title: {
        fontSize: 22,
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.6,
        marginBottom: 32,
        lineHeight: 24,
    },

    snoozeBanner: {
        flexDirection: 'row', alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    snoozeText: {
        fontSize: 14,
        flex: 1,
    },

    section: { marginBottom: 32 },
    sectionTitle: {
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 16,
        paddingHorizontal: 4,
        opacity: 0.7,
    },

    toggleRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 16,
    },
    toggleInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 16 },
    toggleIconWrap: {
        width: 36, height: 36, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
        marginRight: 16,
    },
    toggleText: { flex: 1 },
    toggleTitle: {
        fontSize: 16, marginBottom: 2,
    },
    toggleDescription: {
        fontSize: 13,
        opacity: 0.6,
    },
    divider: {
        height: 1,
    },

    timePickerButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 16,
    },
    timePickerLabel: {
        fontSize: 16,
    },
    timePickerValue: {
        fontSize: 16,
    },
    timeGrid: {
        flexDirection: 'row', flexWrap: 'wrap',
        marginTop: 12, gap: 8,
    },
    timeChip: {
        paddingHorizontal: 16, paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    timeChipText: {
        fontSize: 13,
    },

    snoozeButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        padding: 16,
    },
    snoozeButtonText: {
        fontSize: 16,
    },
});

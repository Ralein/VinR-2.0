/**
 * InstructionSheet — Expandable technique detail card
 *
 * Shows full instructions, science note, and source
 * for an immediate relief or daily habit technique.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { colors } from '../../constants/theme';
import { haptics } from '../../services/haptics';
import { router } from 'expo-router';
import { Wind, Layers, Activity, Moon, Heart, Star, Zap, Leaf, Sparkles } from 'lucide-react-native';

interface ReliefItem {
    id: string;
    name: string;
    emoji?: string;
    category: string;
    duration: string;
    difficulty?: 'easy' | 'medium' | 'deep';
    instructions: string[];
    scienceNote: string;
    source: string;
}

interface InstructionSheetProps {
    item: ReliefItem | null;
    visible: boolean;
    onClose: () => void;
}

const CATEGORY_META: Record<string, { Icon: any; color: string }> = {
    breathing:   { Icon: Wind,      color: '#4A90D9' },
    grounding:   { Icon: Layers,    color: '#4ECBA0' },
    movement:    { Icon: Activity,  color: '#D4A853' },
    sleep:       { Icon: Moon,      color: '#8B7EC8' },
    mindfulness: { Icon: Sparkles,  color: '#D4A853' },
    gratitude:   { Icon: Heart,     color: '#E85D5D' },
    habit:       { Icon: Leaf,      color: '#4ECBA0' },
    meditation:  { Icon: Star,      color: '#8B7EC8' },
    reframing:   { Icon: Zap,       color: '#D4A853' },
};

export function InstructionSheet({ item, visible, onClose }: InstructionSheetProps) {
    if (!item) return null;

    const meta = CATEGORY_META[item.category?.toLowerCase()] ?? { Icon: Star, color: colors.gold };
    const Icon = meta.Icon;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
                <Pressable style={styles.overlayPress} onPress={onClose} />
                <Animated.View entering={SlideInDown.duration(400)} style={styles.sheet}>
                    {/* Handle */}
                    <View style={styles.handle} />

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Header */}
                        <View style={styles.iconContainer}>
                            <Icon size={48} color={meta.color} strokeWidth={1.5} />
                        </View>
                        <Text style={styles.name}>{item.name}</Text>
                        <View style={styles.metaRow}>
                            <Text style={styles.duration}>⏱ {item.duration}</Text>
                            <Text style={styles.category}>{item.category}</Text>
                        </View>

                        {/* Instructions */}
                        <View style={styles.instructionsWrap}>
                            {item.instructions.map((step, index) => (
                                <View key={index} style={styles.stepRow}>
                                    <Text style={styles.stepNumber}>{index + 1}</Text>
                                    <Text style={styles.stepText}>{step}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Science Note */}
                        <View style={styles.scienceCard}>
                            <Text style={styles.scienceLabel}>🧬 Why this works</Text>
                            <Text style={styles.scienceText}>{item.scienceNote}</Text>
                            <Text style={styles.source}>Source: {item.source}</Text>
                        </View>

                        {/* Start Action Mapping */}
                        {(() => {
                            const cat = item.category?.toLowerCase();
                            const hours = new Date().getHours();
                            
                            // Time-based ritual routing
                            let ritualPath: '/morning' | '/afternoon' | '/evening' = '/evening';
                            if (hours >= 5 && hours < 11) ritualPath = '/morning';
                            else if (hours >= 11 && hours < 17) ritualPath = '/afternoon';

                            const mapping = {
                                breathing: { path: '/breathing', label: 'Start Breathing', color: colors.sapphire, params: { name: item.name } },
                                grounding: { path: '/grounding', label: 'Start Grounding', color: colors.emerald },
                                movement:  { path: '/yoga', label: 'Start Yoga Session', color: colors.gold },
                                sleep:     { path: '/evening', label: 'Go to Evening Screen', color: colors.lavender },
                                mindfulness: { path: '/breathing', label: 'Start Meditation', color: colors.sapphire, params: { name: item.name } },
                                therapist: { path: '/therapist', label: 'Talk to Therapist', color: colors.sapphire },
                                reframing: { path: '/therapist', label: 'Open Therapist Chat', color: colors.sapphire },
                                habit:     { path: ritualPath, label: 'Start Today\'s Ritual', color: colors.gold },
                            }[cat];

                            if (!mapping) return null;

                            return (
                                <Pressable
                                    style={[styles.closeButton, { backgroundColor: mapping.color, marginBottom: 12 }]}
                                    onPress={() => {
                                        haptics.light();
                                        onClose();
                                        if (mapping.params) {
                                            router.push({ pathname: mapping.path as any, params: mapping.params });
                                        } else {
                                            router.push(mapping.path as any);
                                        }
                                    }}
                                >
                                    <Text style={styles.closeText}>{mapping.label}</Text>
                                </Pressable>
                            );
                        })()}


                        {/* Close */}
                        <Pressable
                            style={styles.closeButton}
                            onPress={() => { haptics.light(); onClose(); }}
                        >
                            <Text style={styles.closeText}>Got it</Text>
                        </Pressable>
                    </ScrollView>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    overlayPress: {
        flex: 1,
    },
    sheet: {
        backgroundColor: colors.elevated,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    scrollContent: {
        paddingBottom: 24,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.textGhost,
        alignSelf: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    name: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 24,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 24,
    },
    duration: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
        color: colors.textMuted,
    },
    category: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
        color: colors.gold,
        textTransform: 'capitalize',
    },
    instructionsWrap: {
        gap: 12,
        marginBottom: 24,
    },
    stepRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
    },
    stepNumber: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 14,
        color: colors.gold,
        width: 20,
        textAlign: 'center',
    },
    stepText: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 15,
        color: colors.textPrimary,
        flex: 1,
        lineHeight: 22,
    },
    scienceCard: {
        backgroundColor: colors.surface,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 24,
    },
    scienceLabel: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 13,
        color: colors.emerald,
        marginBottom: 6,
    },
    scienceText: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
        color: colors.textMuted,
        lineHeight: 20,
        marginBottom: 8,
    },
    source: {
        fontFamily: 'DMSans_300Light',
        fontSize: 11,
        color: colors.textGhost,
    },
    closeButton: {
        backgroundColor: colors.gold,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
    },
    closeText: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 16,
        color: colors.void,
    },
});

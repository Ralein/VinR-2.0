/**
 * Emergency Screen — Crisis intervention hub
 *
 * Features:
 * - Lucide icons (no emoji)
 * - Call/Text CTAs with proper Linking
 * - Grounding & Breathing quick-actions
 * - "What to expect when you call" expandable
 * - Theme-aware throughout
 * - Pulsing urgency border
 */

import { useState } from 'react';
import {
    View, Text, ScrollView, Pressable, StyleSheet, Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
    FadeIn, FadeInDown, useSharedValue, useAnimatedStyle,
    withRepeat, withTiming, Easing, withSequence,
} from 'react-native-reanimated';
import {
    Phone, MessageSquare, ExternalLink, Shield, Heart,
    Wind, Layers, ChevronDown, ChevronUp, Info,
    Siren, HeartHandshake, Globe, CheckCircle2,
} from 'lucide-react-native';
import { fonts, spacing, borderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import AmbientBackground from '../../components/ui/AmbientBackground';
import { haptics } from '../../services/haptics';

// ── Types ──

interface CrisisResource {
    name: string;
    phone: string;
    text?: string;
    description: string;
    Icon: any;
    iconColor: string;
}

const CRISIS_RESOURCES: CrisisResource[] = [
    {
        name: '988 Suicide & Crisis Lifeline',
        phone: '988',
        text: '741741',
        description: 'Free, confidential support 24/7 for people in distress',
        Icon: Siren,
        iconColor: '#E05C5C',
    },
    {
        name: 'Crisis Text Line',
        phone: '',
        text: '741741',
        description: 'Text HOME to 741741 for free, 24/7 crisis support',
        Icon: MessageSquare,
        iconColor: '#5B8CF5',
    },
    {
        name: 'SAMHSA Helpline',
        phone: '1-800-662-4357',
        description: 'Treatment referral service for mental health & substance use',
        Icon: HeartHandshake,
        iconColor: '#4ECBA0',
    },
    {
        name: 'International Association for Suicide Prevention',
        phone: '',
        description: 'Find crisis centers in your country',
        Icon: Globe,
        iconColor: '#8B7EC8',
    },
];

const WHAT_TO_EXPECT = [
    'A trained counselor will answer, not a recording',
    'They\'ll ask how you\'re feeling — just be honest',
    'You can talk, you don\'t have to have everything figured out',
    'Everything is confidential',
    'They can help you make a safety plan',
    'You can hang up at any time — you\'re in control',
];

// ── Crisis Card ──

function CrisisCard({ resource, index }: { resource: CrisisResource; index: number }) {
    const { colors, isDark } = useTheme();
    const CIcon = resource.Icon;

    return (
        <Animated.View entering={FadeInDown.delay(200 + index * 80).duration(400)}>
            <View style={[cardStyles.card, {
                backgroundColor: isDark ? colors.surface : '#FAF8F4',
                borderColor: isDark ? colors.border : '#E8E1D0',
            }]}>
                <View style={cardStyles.header}>
                    <View style={[cardStyles.iconWrap, {
                        backgroundColor: `${resource.iconColor}12`,
                        borderColor: `${resource.iconColor}30`,
                    }]}>
                        <CIcon size={20} color={resource.iconColor} strokeWidth={1.5} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[cardStyles.name, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>
                            {resource.name}
                        </Text>
                        <Text style={[cardStyles.desc, { color: colors.textMuted, fontFamily: fonts.body }]}>
                            {resource.description}
                        </Text>
                    </View>
                </View>

                <View style={cardStyles.actions}>
                    {resource.phone ? (
                        <Pressable
                            style={[cardStyles.actionBtn, {
                                backgroundColor: `${colors.emerald}12`,
                                borderColor: `${colors.emerald}30`,
                            }]}
                            onPress={() => { haptics.medium(); Linking.openURL(`tel:${resource.phone}`); }}
                        >
                            <Phone size={15} color={colors.emerald} strokeWidth={2} />
                            <Text style={[cardStyles.actionText, { color: colors.emerald, fontFamily: fonts.bodySemiBold }]}>
                                Call {resource.phone}
                            </Text>
                        </Pressable>
                    ) : null}
                    {resource.text ? (
                        <Pressable
                            style={[cardStyles.actionBtn, {
                                backgroundColor: `${colors.sapphire}12`,
                                borderColor: `${colors.sapphire}30`,
                            }]}
                            onPress={() => { haptics.medium(); Linking.openURL(`sms:${resource.text}`); }}
                        >
                            <MessageSquare size={15} color={colors.sapphire} strokeWidth={2} />
                            <Text style={[cardStyles.actionText, { color: colors.sapphire, fontFamily: fonts.bodySemiBold }]}>
                                Text {resource.text}
                            </Text>
                        </Pressable>
                    ) : null}
                    {!resource.phone && !resource.text && (
                        <Pressable
                            style={[cardStyles.actionBtn, {
                                backgroundColor: `${resource.iconColor}12`,
                                borderColor: `${resource.iconColor}30`,
                            }]}
                            onPress={() => { haptics.light(); Linking.openURL('https://www.iasp.info/resources/Crisis_Centres/'); }}
                        >
                            <ExternalLink size={14} color={resource.iconColor} strokeWidth={2} />
                            <Text style={[cardStyles.actionText, { color: resource.iconColor, fontFamily: fonts.bodySemiBold }]}>
                                Find a Center
                            </Text>
                        </Pressable>
                    )}
                </View>
            </View>
        </Animated.View>
    );
}

// ── Main Screen ──

export default function EmergencyScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const [showExpected, setShowExpected] = useState(false);

    // Pulsing urgency ring
    const pulseScale = useSharedValue(1);
    pulseScale.value = withRepeat(
        withSequence(
            withTiming(1.06, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        ), -1, true,
    );
    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]} edges={['top']}>
            <AmbientBackground hideBlobs={true} />
            <ScrollView
                contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero */}
                <Animated.View entering={FadeIn.duration(500)} style={styles.hero}>
                    <Animated.View style={pulseStyle}>
                        <View style={[styles.heroCircle, {
                            backgroundColor: `${colors.crimson}12`,
                            borderColor: `${colors.crimson}30`,
                        }]}>
                            <Shield size={32} color={colors.crimson} strokeWidth={1.2} />
                        </View>
                    </Animated.View>
                    <Text style={[styles.heroTitle, { color: colors.textPrimary, fontFamily: fonts.display }]}>
                        You're Not Alone
                    </Text>
                    <Text style={[styles.heroSubtitle, { color: colors.textMuted, fontFamily: fonts.body }]}>
                        Help is available right now. Reach out — it's free and confidential.
                    </Text>
                </Animated.View>

                {/* Crisis Resources */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Phone size={14} color={colors.crimson} strokeWidth={2} />
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>
                            Crisis Resources
                        </Text>
                    </View>
                    {CRISIS_RESOURCES.map((r, i) => (
                        <CrisisCard key={r.name} resource={r} index={i} />
                    ))}
                </View>

                {/* What to Expect */}
                <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.section}>
                    <Pressable
                        style={[styles.expectHeader, {
                            backgroundColor: isDark ? colors.surface : '#FAF8F4',
                            borderColor: isDark ? colors.border : '#E8E1D0',
                        }]}
                        onPress={() => { haptics.light(); setShowExpected(!showExpected); }}
                    >
                        <Info size={16} color={colors.sapphire} strokeWidth={1.8} />
                        <Text style={[styles.expectTitle, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>
                            What to expect when you call
                        </Text>
                        {showExpected
                            ? <ChevronUp size={18} color={colors.textGhost} strokeWidth={2} />
                            : <ChevronDown size={18} color={colors.textGhost} strokeWidth={2} />}
                    </Pressable>
                    {showExpected && (
                        <Animated.View entering={FadeInDown.duration(300)} style={[styles.expectBody, {
                            backgroundColor: isDark ? colors.surface : '#FAF8F4',
                            borderColor: isDark ? colors.border : '#E8E1D0',
                        }]}>
                            {WHAT_TO_EXPECT.map((tip, i) => (
                                <View key={i} style={styles.expectRow}>
                                    <CheckCircle2 size={14} color={colors.sapphire} strokeWidth={2} />
                                    <Text style={[styles.expectText, { color: colors.textMuted, fontFamily: fonts.body }]}>{tip}</Text>
                                </View>
                            ))}
                        </Animated.View>
                    )}
                </Animated.View>

                {/* Quick Actions */}
                <Animated.View entering={FadeInDown.delay(700).duration(400)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Heart size={14} color={colors.emerald} strokeWidth={2} />
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>
                            Need something right now?
                        </Text>
                    </View>

                    <View style={styles.quickRow}>
                        <Pressable
                            style={[styles.quickCard, {
                                backgroundColor: isDark ? colors.surface : '#FAF8F4',
                                borderColor: isDark ? `${colors.sapphire}25` : `${colors.sapphire}18`,
                            }]}
                            onPress={() => { haptics.light(); router.push('/breathing'); }}
                        >
                            <View style={[styles.quickIcon, {
                                backgroundColor: `${colors.sapphire}12`,
                                borderColor: `${colors.sapphire}30`,
                            }]}>
                                <Wind size={22} color={colors.sapphire} strokeWidth={1.5} />
                            </View>
                            <Text style={[styles.quickLabel, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>
                                Slow Breathing
                            </Text>
                            <Text style={[styles.quickDesc, { color: colors.textMuted, fontFamily: fonts.body }]}>
                                Calm your body in 60 seconds
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[styles.quickCard, {
                                backgroundColor: isDark ? colors.surface : '#FAF8F4',
                                borderColor: isDark ? `${colors.emerald}25` : `${colors.emerald}18`,
                            }]}
                            onPress={() => { haptics.light(); router.push('/grounding'); }}
                        >
                            <View style={[styles.quickIcon, {
                                backgroundColor: `${colors.emerald}12`,
                                borderColor: `${colors.emerald}30`,
                            }]}>
                                <Layers size={22} color={colors.emerald} strokeWidth={1.5} />
                            </View>
                            <Text style={[styles.quickLabel, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>
                                5-4-3-2-1 Grounding
                            </Text>
                            <Text style={[styles.quickDesc, { color: colors.textMuted, fontFamily: fonts.body }]}>
                                Reconnect with the present
                            </Text>
                        </Pressable>
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ── Styles ──

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingBottom: 80 },
    // Hero
    hero: {
        alignItems: 'center', paddingHorizontal: spacing.xl,
        paddingTop: spacing.xl, paddingBottom: spacing.xl, gap: spacing.sm,
    },
    heroCircle: {
        width: 76, height: 76, borderRadius: 38,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, marginBottom: spacing.sm,
    },
    heroTitle: { fontSize: 28, textAlign: 'center', letterSpacing: -0.5 },
    heroSubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
    // Sections
    section: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
    sectionHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md,
    },
    sectionTitle: { fontSize: 16 },
    // Expect
    expectHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        padding: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1,
    },
    expectTitle: { flex: 1, fontSize: 14 },
    expectBody: {
        padding: spacing.md, paddingTop: 0, gap: 10,
        borderBottomLeftRadius: borderRadius.lg, borderBottomRightRadius: borderRadius.lg,
        borderWidth: 1, borderTopWidth: 0, marginTop: -1,
    },
    expectRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingTop: 10 },
    expectText: { flex: 1, fontSize: 13, lineHeight: 19 },
    // Quick actions
    quickRow: { flexDirection: 'row', gap: spacing.md },
    quickCard: {
        flex: 1, borderRadius: borderRadius.lg, padding: spacing.md,
        borderWidth: 1, alignItems: 'center', gap: spacing.xs,
    },
    quickIcon: {
        width: 50, height: 50, borderRadius: 25,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, marginBottom: 4,
    },
    quickLabel: { fontSize: 13, textAlign: 'center' },
    quickDesc: { fontSize: 11, textAlign: 'center', lineHeight: 16 },
});

const cardStyles = StyleSheet.create({
    card: {
        borderRadius: borderRadius.lg, padding: spacing.md,
        marginBottom: spacing.sm, borderWidth: 1,
    },
    header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.sm },
    iconWrap: {
        width: 44, height: 44, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1,
    },
    name: { fontSize: 15 },
    desc: { fontSize: 13, lineHeight: 18, marginTop: 2 },
    actions: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
    actionBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: spacing.md, paddingVertical: 9,
        borderRadius: borderRadius.full, borderWidth: 1,
    },
    actionText: { fontSize: 13 },
});

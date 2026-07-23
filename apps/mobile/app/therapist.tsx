/**
 * Therapist Directory — Find professional support
 *
 * Features:
 * - Lucide icons (no emoji)
 * - Theme-aware cards with hover effects
 * - Specialty filter chips
 * - Crisis banner with phone icon
 * - First-session tips expandable section
 * - Entrance animations
 */

import { useState } from 'react';
import {
    View, Text, ScrollView, Pressable, StyleSheet,
    Linking, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import {
    ChevronLeft, ChevronDown, ChevronUp, Video, Shield,
    Phone, ExternalLink, Heart, Brain, Zap, Users, Sparkles,
    HeartHandshake, MessageCircle, Info, Lightbulb, CheckCircle2,
} from 'lucide-react-native';
import { fonts, spacing, borderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import AmbientBackground from '../components/ui/AmbientBackground';
import { useTherapistDirectory, TherapistProvider, WhyTherapy } from '../hooks/useAdaptive';
import { haptics } from '../services/haptics';

const SPECIALTIES = [
    { key: 'all', label: 'All', Icon: Sparkles },
    { key: 'anxiety', label: 'Anxiety', Icon: Brain },
    { key: 'depression', label: 'Depression', Icon: Heart },
    { key: 'stress', label: 'Stress', Icon: Zap },
    { key: 'trauma', label: 'Trauma', Icon: HeartHandshake },
    { key: 'relationships', label: 'Relationships', Icon: Users },
];

const FIRST_SESSION_TIPS = [
    'Write down your main concerns or questions beforehand',
    "It's okay to feel nervous — your therapist expects it",
    'There are no wrong answers; be as honest as you can',
    'Ask about their approach and if it feels like a good fit',
    "You don't have to share everything in the first session",
];

// ── Provider Card ──

function ProviderCard({ provider, index }: { provider: TherapistProvider; index: number }) {
    const { colors, isDark } = useTheme();

    return (
        <Animated.View entering={FadeInDown.delay(200 + index * 80).duration(400)}>
            <Pressable
                style={[providerStyles.card, {
                    backgroundColor: isDark ? colors.surface : '#FAF8F4',
                    borderColor: isDark ? colors.border : '#E8E1D0',
                }]}
                onPress={() => Linking.openURL(provider.url)}
            >
                <View style={providerStyles.header}>
                    <View style={[providerStyles.iconWrap, {
                        backgroundColor: isDark ? `${colors.sapphire}14` : `${colors.sapphire}10`,
                        borderColor: `${colors.sapphire}30`,
                    }]}>
                        <HeartHandshake size={22} color={colors.sapphire} strokeWidth={1.5} />
                    </View>
                    <View style={providerStyles.info}>
                        <Text style={[providerStyles.name, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>
                            {provider.name}
                        </Text>
                        <View style={providerStyles.badges}>
                            {provider.telehealth && (
                                <View style={[providerStyles.badge, { borderColor: `${colors.sapphire}35`, backgroundColor: `${colors.sapphire}08` }]}>
                                    <Video size={10} color={colors.sapphire} strokeWidth={2} />
                                    <Text style={[providerStyles.badgeText, { color: colors.sapphire, fontFamily: fonts.body }]}>Telehealth</Text>
                                </View>
                            )}
                            {provider.accepts_insurance && (
                                <View style={[providerStyles.badge, { borderColor: `${colors.emerald}35`, backgroundColor: `${colors.emerald}08` }]}>
                                    <Shield size={10} color={colors.emerald} strokeWidth={2} />
                                    <Text style={[providerStyles.badgeText, { color: colors.emerald, fontFamily: fonts.body }]}>Insurance</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
                <Text style={[providerStyles.description, { color: colors.textMuted, fontFamily: fonts.body }]}>
                    {provider.description}
                </Text>
                <View style={[providerStyles.linkRow, { borderTopColor: isDark ? colors.border : '#E8E1D0' }]}>
                    <ExternalLink size={13} color={colors.gold} strokeWidth={2} />
                    <Text style={[providerStyles.linkText, { color: colors.gold, fontFamily: fonts.bodySemiBold }]}>
                        Visit {provider.name}
                    </Text>
                </View>
            </Pressable>
        </Animated.View>
    );
}

// ── Why Therapy Card ──

function WhyTherapyCard({ item, index }: { item: WhyTherapy; index: number }) {
    const { colors, isDark } = useTheme();
    return (
        <Animated.View entering={FadeInDown.delay(400 + index * 60).duration(350)}>
            <View style={[whyStyles.card, {
                backgroundColor: isDark ? colors.surface : '#F5F2FF',
                borderColor: isDark ? `${colors.sapphire}20` : `${colors.sapphire}15`,
            }]}>
                <Lightbulb size={16} color={colors.sapphire} strokeWidth={1.8} />
                <View style={{ flex: 1 }}>
                    <Text style={[whyStyles.title, { color: colors.sapphire, fontFamily: fonts.bodySemiBold }]}>{item.title}</Text>
                    <Text style={[whyStyles.text, { color: colors.textMuted, fontFamily: fonts.body }]}>{item.text}</Text>
                </View>
            </View>
        </Animated.View>
    );
}

// ── Main Screen ──

export default function TherapistScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const [specialty, setSpecialty] = useState<string | undefined>(undefined);
    const [showTips, setShowTips] = useState(false);
    const { data, isLoading } = useTherapistDirectory(specialty);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]}>
            <AmbientBackground hideBlobs={true} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <Animated.View entering={FadeIn.duration(400)} style={styles.headerRow}>
                    <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                        <ChevronLeft size={20} color={colors.textPrimary} strokeWidth={2} />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fonts.display }]}>Find Support</Text>
                        <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: fonts.body }]}>
                            Professional help is a sign of strength.
                        </Text>
                    </View>
                </Animated.View>

                {/* Specialty Filter */}
                <Animated.View entering={FadeInDown.delay(80).duration(400)}>
                    <ScrollView
                        horizontal showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chipsRow}
                    >
                        {SPECIALTIES.map((s, i) => {
                            const isActive = specialty === (s.key === 'all' ? undefined : s.key) ||
                                (!specialty && s.key === 'all');
                            const chipColor = isActive ? colors.gold : colors.textGhost;
                            return (
                                <Animated.View key={s.key} entering={FadeInRight.delay(100 + i * 40).duration(300)}>
                                    <Pressable
                                        style={[styles.chip, {
                                            backgroundColor: isActive ? (isDark ? `${colors.gold}18` : `${colors.gold}12`) : (isDark ? colors.surface : '#F2EFE9'),
                                            borderColor: isActive ? colors.gold : (isDark ? colors.border : '#E0DAC8'),
                                        }]}
                                        onPress={() => { haptics.light(); setSpecialty(s.key === 'all' ? undefined : s.key); }}
                                    >
                                        <s.Icon size={12} color={chipColor} strokeWidth={isActive ? 2.2 : 1.6} />
                                        <Text style={[styles.chipText, { color: chipColor, fontFamily: isActive ? fonts.bodySemiBold : fonts.body }]}>
                                            {s.label}
                                        </Text>
                                    </Pressable>
                                </Animated.View>
                            );
                        })}
                    </ScrollView>
                </Animated.View>

                {isLoading ? (
                    <ActivityIndicator size="large" color={colors.gold} style={{ marginTop: 40 }} />
                ) : (
                    <>
                        {/* Providers */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <HeartHandshake size={14} color={colors.gold} strokeWidth={2} />
                                <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>
                                    Recommended Platforms
                                </Text>
                            </View>
                            {data?.providers.map((provider, i) => (
                                <ProviderCard key={provider.id} provider={provider} index={i} />
                            ))}
                        </View>

                        {/* First Session Tips */}
                        <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.section}>
                            <Pressable
                                style={[styles.tipsHeader, {
                                    backgroundColor: isDark ? colors.surface : '#FAF8F4',
                                    borderColor: isDark ? colors.border : '#E8E1D0',
                                }]}
                                onPress={() => { haptics.light(); setShowTips(!showTips); }}
                            >
                                <Info size={16} color={colors.emerald} strokeWidth={1.8} />
                                <Text style={[styles.tipsTitle, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>
                                    Tips for your first session
                                </Text>
                                {showTips ? (
                                    <ChevronUp size={18} color={colors.textGhost} strokeWidth={2} />
                                ) : (
                                    <ChevronDown size={18} color={colors.textGhost} strokeWidth={2} />
                                )}
                            </Pressable>
                            {showTips && (
                                <Animated.View entering={FadeInDown.duration(300)} style={[styles.tipsBody, {
                                    backgroundColor: isDark ? colors.surface : '#FAF8F4',
                                    borderColor: isDark ? colors.border : '#E8E1D0',
                                }]}>
                                    {FIRST_SESSION_TIPS.map((tip, i) => (
                                        <View key={i} style={styles.tipRow}>
                                            <CheckCircle2 size={14} color={colors.emerald} strokeWidth={2} />
                                            <Text style={[styles.tipText, { color: colors.textMuted, fontFamily: fonts.body }]}>{tip}</Text>
                                        </View>
                                    ))}
                                </Animated.View>
                            )}
                        </Animated.View>

                        {/* Why Therapy */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Lightbulb size={14} color={colors.sapphire} strokeWidth={2} />
                                <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>
                                    Why therapy?
                                </Text>
                            </View>
                            {data?.why_therapy.map((item, i) => (
                                <WhyTherapyCard key={i} item={item} index={i} />
                            ))}
                        </View>

                        {/* Crisis Banner */}
                        <Animated.View entering={FadeInDown.delay(700).duration(400)} style={styles.section}>
                            <Pressable
                                style={[styles.crisisBanner, {
                                    backgroundColor: isDark ? `${colors.crimson}12` : `${colors.crimson}08`,
                                    borderColor: `${colors.crimson}25`,
                                }]}
                                onPress={() => Linking.openURL('tel:988')}
                            >
                                <View style={[styles.crisisIcon, { backgroundColor: `${colors.crimson}18`, borderColor: `${colors.crimson}35` }]}>
                                    <Phone size={20} color={colors.crimson} strokeWidth={1.8} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.crisisTitle, { color: colors.crimson, fontFamily: fonts.bodySemiBold }]}>In immediate danger?</Text>
                                    <Text style={[styles.crisisText, { color: colors.textMuted, fontFamily: fonts.body }]}>
                                        Call 988 (Suicide & Crisis Lifeline) — available 24/7
                                    </Text>
                                </View>
                                <ExternalLink size={16} color={colors.crimson} strokeWidth={2} />
                            </Pressable>
                        </Animated.View>
                    </>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// ── Styles ──

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingBottom: 100 },
    headerRow: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 28, letterSpacing: -0.5 },
    subtitle: { fontSize: 14, marginTop: 2, lineHeight: 20 },
    // Chips
    chipsRow: { paddingHorizontal: spacing.lg, gap: 8, marginBottom: spacing.lg },
    chip: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 12, paddingVertical: 7,
        borderRadius: borderRadius.full, borderWidth: 1,
    },
    chipText: { fontSize: 12 },
    // Sections
    section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
    sectionHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md,
    },
    sectionTitle: { fontSize: 16 },
    // Tips
    tipsHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        padding: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1,
    },
    tipsTitle: { flex: 1, fontSize: 14 },
    tipsBody: {
        padding: spacing.md, paddingTop: 0, gap: 10,
        borderBottomLeftRadius: borderRadius.lg, borderBottomRightRadius: borderRadius.lg,
        borderWidth: 1, borderTopWidth: 0,
        marginTop: -1,
    },
    tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingTop: 10 },
    tipText: { flex: 1, fontSize: 13, lineHeight: 19 },
    // Crisis
    crisisBanner: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.md,
        borderRadius: borderRadius.lg, padding: spacing.md, borderWidth: 1,
    },
    crisisIcon: {
        width: 44, height: 44, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1,
    },
    crisisTitle: { fontSize: 15 },
    crisisText: { fontSize: 13, marginTop: 2, lineHeight: 18 },
});

const providerStyles = StyleSheet.create({
    card: {
        borderRadius: borderRadius.lg, padding: spacing.md,
        marginBottom: spacing.sm, borderWidth: 1,
    },
    header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
    iconWrap: {
        width: 44, height: 44, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1,
    },
    info: { flex: 1 },
    name: { fontSize: 16 },
    badges: { flexDirection: 'row', gap: spacing.xs, marginTop: 4 },
    badge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 8, paddingVertical: 3,
        borderRadius: borderRadius.full, borderWidth: 1,
    },
    badgeText: { fontSize: 11 },
    description: { fontSize: 14, lineHeight: 20, marginBottom: spacing.sm },
    linkRow: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingTop: spacing.sm, borderTopWidth: 1,
    },
    linkText: { fontSize: 14 },
});

const whyStyles = StyleSheet.create({
    card: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 12,
        borderRadius: borderRadius.lg, padding: spacing.md,
        marginBottom: spacing.sm, borderWidth: 1,
    },
    title: { fontSize: 14, marginBottom: 3 },
    text: { fontSize: 13, lineHeight: 19 },
});

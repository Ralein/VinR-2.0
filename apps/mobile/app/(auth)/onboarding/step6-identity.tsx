import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressDots } from '../../../components/onboarding/ProgressDots';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useTheme } from '../../../context/ThemeContext';
import Animated, {
    FadeIn,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
} from 'react-native-reanimated';
import {
    ArrowLeft,
    GraduationCap,
    Briefcase,
    Palette,
    Heart,
    Rocket,
    Activity,
    Cpu,
    Compass,
    Check,
} from 'lucide-react-native';
import GlassCard from '../../../components/ui/GlassCard';
import { haptics } from '../../../services/haptics';
import { OnboardingBackground } from '../../../components/ui/OnboardingBackground';
import { LiquidCTA } from '../../../components/ui/LiquidCTA';

const { height } = Dimensions.get('window');

const IDENTITIES = [
    { id: 'student', label: 'Student', icon: GraduationCap },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'creative', label: 'Creative', icon: Palette },
    { id: 'parent', label: 'Parent', icon: Heart },
    { id: 'entrepreneur', label: 'Entrepreneur', icon: Rocket },
    { id: 'athlete', label: 'Athlete', icon: Activity },
    { id: 'techie', label: 'Techie', icon: Cpu },
    { id: 'other', label: 'Explorer', icon: Compass },
];

export default function Step6Identity() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { identity, setIdentity } = useOnboardingStore();

    // Animations
    const headerOp = useSharedValue(0);
    const titleOp = useSharedValue(0);
    const subtitleOp = useSharedValue(0);

    useEffect(() => {
        headerOp.value = withDelay(80, withTiming(1, { duration: 400 }));
        titleOp.value = withDelay(200, withTiming(1, { duration: 500 }));
        subtitleOp.value = withDelay(350, withTiming(1, { duration: 500 }));
    }, []);

    const headerStyle = useAnimatedStyle(() => ({
        opacity: headerOp.value,
    }));

    const titleStyle = useAnimatedStyle(() => ({
        opacity: titleOp.value,
    }));

    const subtitleStyle = useAnimatedStyle(() => ({
        opacity: subtitleOp.value,
    }));

    const handleNext = () => {
        if (identity) {
            router.push('/onboarding/step7-frequency');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.void }]}>
            <OnboardingBackground />

            <View
                style={[
                    styles.content,
                    {
                        paddingTop: insets.top + (height > 800 ? 28 : 12),
                        paddingBottom: insets.bottom + 20,
                    },
                ]}
            >
                {/* ─── Header ─── */}
                <Animated.View style={[styles.header, headerStyle]}>
                    <Pressable
                        onPress={() => router.back()}
                        style={[styles.backButton, { backgroundColor: '#FFFFFF05', borderColor: colors.border }]}
                    >
                        <ArrowLeft size={24} color={colors.textPrimary} strokeWidth={1.5} />
                    </Pressable>
                    <ProgressDots currentStep={6} totalSteps={9} />
                </Animated.View>

                {/* ─── Title ─── */}
                <Animated.View style={[styles.titleSection, titleStyle]}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>
                        Identify your role
                    </Text>
                </Animated.View>

                {/* ─── Subtitle ─── */}
                <Animated.View style={[styles.subtitleSection, subtitleStyle]}>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        The roles we play are but costumes. Find the actor beneath.
                    </Text>
                </Animated.View>

                {/* ─── Grid ─── */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.grid}>
                        {IDENTITIES.map((item, index) => {
                            const isSelected = identity === item.id;
                            const Icon = item.icon;
                            return (
                                <Animated.View
                                    key={item.id}
                                    entering={FadeIn.duration(800)
                                        .delay(500 + index * 40)}
                                    style={styles.gridItem}
                                >
                                    <Pressable
                                        onPress={() => {
                                            haptics.light();
                                            setIdentity(item.id);
                                        }}
                                        style={({ pressed }) => [
                                            styles.identityPressable,
                                            pressed && styles.identityPressed,
                                        ]}
                                    >
                                        <GlassCard
                                            accent={isSelected ? 'gold' : undefined}
                                            glow={isSelected}
                                        >
                                            <View style={styles.identityCard}>
                                                <View
                                                    style={[
                                                        styles.iconWrapper,
                                                        {
                                                            backgroundColor: isSelected
                                                                ? `${colors.gold}15`
                                                                : colors.surface,
                                                        },
                                                    ]}
                                                >
                                                    <Icon
                                                        size={32}
                                                        color={
                                                            isSelected
                                                                ? colors.gold
                                                                : colors.textGhost
                                                        }
                                                        strokeWidth={1.5}
                                                    />
                                                </View>
                                                <Text
                                                    style={[
                                                        styles.cardLabel,
                                                        {
                                                            color: isSelected
                                                                ? colors.gold
                                                                : colors.textPrimary,
                                                        },
                                                        isSelected && styles.cardLabelSelected,
                                                    ]}
                                                >
                                                    {item.label}
                                                </Text>
                                                {isSelected && (
                                                    <View
                                                        style={[
                                                            styles.checkIcon,
                                                            { backgroundColor: colors.gold },
                                                        ]}
                                                    >
                                                        <Check
                                                            size={10}
                                                            color={colors.void}
                                                            strokeWidth={4}
                                                        />
                                                    </View>
                                                )}
                                            </View>
                                        </GlassCard>
                                    </Pressable>
                                </Animated.View>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* ─── Footer ─── */}
                <View style={[styles.footer, { paddingTop: 16 }]}>
                    <LiquidCTA
                        label="CONFIRM PATH"
                        delay={1300}
                        onPress={handleNext}
                        isDisabled={!identity}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 28,
    },
    header: {
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    titleSection: {
        marginBottom: 10,
    },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 32,
        lineHeight: 40,
    },
    subtitleSection: {
        marginBottom: 20,
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        lineHeight: 24,
        opacity: 0.7,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '48%',
        marginBottom: 16,
    },
    identityPressable: {
        width: '100%',
    },
    identityPressed: {
        transform: [{ scale: 0.97 }],
    },
    identityCard: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        height: 150,
    },
    iconWrapper: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardLabel: {
        fontFamily: 'DMSans_500Medium',
        fontSize: 15,
        textAlign: 'center',
    },
    cardLabelSelected: {
        fontFamily: 'DMSans_700Bold',
    },
    checkIcon: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        width: '100%',
    },
});

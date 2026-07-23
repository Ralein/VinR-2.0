/**
 * Tab Layout v7 — 5-tab bar with center Glint button (Instagram-style)
 *
 * Tabs: Home · Check-in · Glint (center, raised) · Journey · Profile
 * Events hidden — accessible via Home navigation
 *
 * Theme-aware: reads useTheme() for dark/light color tokens
 */

import { Tabs, useRouter } from 'expo-router';
import { View, StyleSheet, Platform, Pressable, Text } from 'react-native';
import { Home, Heart, Film, Activity, User, MessageCircle, BookOpen } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import MiniPlayer from '../../components/media/MiniPlayer';
import { fonts } from '../../constants/theme';

// ──────────────────── Animated Icon wrapper ────────────────────

type TabIconProps = {
    label: string;
    focused: boolean;
    Icon: typeof Home;
};

function TabIcon({ Icon, label, focused }: TabIconProps) {
    const { colors } = useTheme();

    const animatedWrapStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: withSpring(focused ? 1.08 : 1, { stiffness: 260, damping: 20 }) },
        ],
    }));

    const haloStyle = useAnimatedStyle(() => ({
        opacity: withTiming(focused ? 1 : 0, { duration: 200 }),
        transform: [{ scale: withSpring(focused ? 1 : 0.6, { stiffness: 200, damping: 18 }) }],
    }));

    const dotStyle = useAnimatedStyle(() => ({
        opacity: withTiming(focused ? 1 : 0, { duration: 180 }),
        transform: [{ scaleX: withSpring(focused ? 1 : 0, { stiffness: 280, damping: 22 }) }],
    }));

    const color = focused ? colors.gold : colors.textGhost;
    const strokeWidth = focused ? 2.2 : 1.6;

    return (
        <View style={styles.tabItem}>
            <Animated.View style={[styles.halo, haloStyle, { backgroundColor: `${colors.gold}12` }]} />
            <Animated.View style={animatedWrapStyle}>
                <Icon size={22} color={color} strokeWidth={strokeWidth} />
            </Animated.View>
            <Animated.Text style={[
                styles.tabLabel,
                {
                    opacity: focused ? 1 : 0.45,
                    color: focused ? colors.gold : colors.textGhost,
                }
            ]}>
                {label}
            </Animated.Text>
            <Animated.View style={[
                styles.activeDot,
                dotStyle,
                {
                    backgroundColor: colors.gold,
                    shadowColor: colors.gold,
                }
            ]} />
        </View>
    );
}

// ──────────────────── Center Glint Tab Icon (Instagram-style) ────────────────────

function GlintTabIcon({ focused }: { focused: boolean }) {
    const { colors } = useTheme();

    const animatedScale = useAnimatedStyle(() => ({
        transform: [
            { scale: withSpring(focused ? 1.1 : 1, { stiffness: 280, damping: 20 }) },
        ],
    }));

    return (
        <View style={styles.glintTabWrapper}>
            <Animated.View style={[
                styles.glintButton,
                animatedScale,
                {
                    backgroundColor: focused ? colors.gold : `${colors.gold}DD`,
                    shadowColor: colors.gold,
                    borderColor: focused ? colors.goldLight : `${colors.gold}40`,
                },
            ]}>
                <Film
                    size={24}
                    color="#FFFFFF"
                    strokeWidth={focused ? 2.4 : 2}
                    fill={focused ? 'rgba(255,255,255,0.25)' : 'transparent'}
                />
            </Animated.View>
            <Text style={[
                styles.glintLabel,
                {
                    color: focused ? colors.gold : colors.textGhost,
                    opacity: focused ? 1 : 0.45,
                }
            ]}>
                Glint
            </Text>
        </View>
    );
}

// ──────────────────── Floating Buddy FAB ────────────────────

function BuddyFAB({ bottomOffset }: { bottomOffset: number }) {
    const router = useRouter();
    const { colors } = useTheme();

    return (
        <Pressable
            style={[styles.fab, { bottom: bottomOffset + 12 }]}
            onPress={() => router.push('/buddy/chat')}
        >
            <View style={[
                styles.fabInner,
                {
                    backgroundColor: colors.gold,
                    shadowColor: colors.gold,
                    borderColor: colors.goldLight,
                }
            ]}>
                <MessageCircle size={22} color="#FFFFFF" fill={colors.gold} strokeWidth={2} />
            </View>
        </Pressable>
    );
}

// ──────────────────────── Layout ─────────────────────────────

export default function TabLayout() {
    const { colors, tabBarBg, isDark } = useTheme();
    const insets = useSafeAreaInsets();

    // Calibration: base height (60) + safe area bottom
    const TAB_BAR_HEIGHT = 65 + insets.bottom;

    const tabBarStyle = {
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        elevation: 0,
        height: TAB_BAR_HEIGHT,
        paddingTop: 8,
        paddingBottom: insets.bottom,
        shadowColor: 'transparent',
    } as const;

    return (
        <View style={[styles.root, { backgroundColor: colors.void }]}>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: tabBarStyle,
                    tabBarShowLabel: false,
                    tabBarBackground: () => (
                        <View style={[
                            styles.tabBarBg,
                            {
                                backgroundColor: tabBarBg,
                                borderTopColor: `${colors.gold}${isDark ? '1A' : '22'}`,
                            }
                        ]} />
                    ),
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <TabIcon Icon={Home} label="Home" focused={focused} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="checkin"
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <TabIcon Icon={Heart} label="Check-in" focused={focused} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="glint"
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <GlintTabIcon focused={focused} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="journal"
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <TabIcon Icon={BookOpen} label="Journal" focused={focused} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <TabIcon Icon={User} label="Profile" focused={focused} />
                        ),
                    }}
                />
                {/* Hidden screens — accessible via navigation, not tab bar */}
                <Tabs.Screen name="events" options={{ href: null }} />
                <Tabs.Screen name="journey" options={{ href: null }} />
                <Tabs.Screen name="loading" options={{ href: null }} />
                <Tabs.Screen name="emergency" options={{ href: null }} />
                <Tabs.Screen name="results" options={{ href: null }} />
                <Tabs.Screen name="immediate-relief" options={{ href: null }} />
                <Tabs.Screen name="reels" options={{ href: null }} />
            </Tabs>
            {/* Persistent mini player above tab bar */}
            <MiniPlayer />
            {/* Floating VinR Buddy chat button */}
            <BuddyFAB bottomOffset={TAB_BAR_HEIGHT} />
        </View>
    );
}



const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    tabBarBg: {
        position: 'absolute',
        inset: 0,
        borderTopWidth: 1,
        shadowColor: '#D4A853',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        minWidth: 54,
        position: 'relative',
    },
    halo: {
        position: 'absolute',
        top: -6,
        width: 42,
        height: 42,
        borderRadius: 21,
        zIndex: 0,
    },
    tabLabel: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 9,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    activeDot: {
        width: 18,
        height: 3,
        borderRadius: 2,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 3,
    },
    // ── Center Glint Tab (Instagram-style) ──
    glintTabWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -20,
    },
    glintButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 2,
    },
    glintLabel: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 9,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginTop: 4,
    },
    // Floating Buddy FAB
    fab: {
        position: 'absolute',
        right: 20,
        zIndex: 100,
    },
    fabInner: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 2,
    },
});

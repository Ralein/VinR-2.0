import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable, Alert, TextInput, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    ArrowLeft, User, Shield, Moon, Sun, Smartphone,
    Droplets, Laptop, LogOut, Bell, ChevronRight, Trash2,
    AlertTriangle, X
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { deleteItemAsync } from '../utils/storage';
import GlassCard from '../components/ui/GlassCard';

type ThemePref = 'light' | 'system' | 'dark';

const THEME_OPTIONS: { value: ThemePref; Icon: typeof Sun; label: string }[] = [
    { value: 'light', Icon: Sun, label: 'Light' },
    { value: 'system', Icon: Smartphone, label: 'System' },
    { value: 'dark', Icon: Moon, label: 'Dark' },
];

function ThemePicker({ value, onChange }: { value: ThemePref; onChange: (v: ThemePref) => void }) {
    const { colors, fonts } = useTheme();

    return (
        <View style={[pickerStyles.wrapper, {
            backgroundColor: `#FFFFFF05`,
            borderColor: colors.border,
        }]}>
            {THEME_OPTIONS.map(({ value: opt, Icon, label }) => {
                const active = value === opt;
                return (
                    <Pressable
                        key={opt}
                        onPress={() => onChange(opt)}
                        style={[
                            pickerStyles.segment,
                            active && {
                                backgroundColor: colors.gold,
                            }
                        ]}
                    >
                        <Icon
                            size={16}
                            color={active ? colors.void : colors.textSecondary}
                            strokeWidth={active ? 2.5 : 1.8}
                        />
                        <Text style={[
                            pickerStyles.label,
                            {
                                color: active ? colors.void : colors.textSecondary,
                                fontFamily: active ? fonts.bodySemiBold : fonts.body,
                            }
                        ]}>
                            {label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const pickerStyles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        borderRadius: 12,
        borderWidth: 1,
        padding: 4,
        gap: 4,
    },
    segment: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    label: {
        fontSize: 13,
    },
});

export default function SettingsScreen() {
    const router = useRouter();
    const { colors, fonts, spacing } = useTheme();
    const { settings, updateSettings, loginMockUser, logoutMockUser } = useSettingsStore();
    const signOut = useAuthStore((s) => s.signOut);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    const handleMockLogin = () => {
        loginMockUser('mock-user-123', 'Demo User');
        Alert.alert('Logged In', 'You are now using the mock user profile.');
    };

    const handleMockLogout = () => {
        logoutMockUser();
        Alert.alert('Logged Out', 'You have been logged out of the mock profile.');
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This action is permanent and cannot be undone. All path data and history will be lost.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Forever',
                    style: 'destructive',
                    onPress: () => {
                        setDeleteConfirmText('');
                        setShowDeleteModal(true);
                    },
                },
            ]
        );
    };

    const executeDelete = async () => {
        if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
            Alert.alert('Cancelled', 'You did not type DELETE. Account was not deleted.');
            return;
        }
        try {
            setShowDeleteModal(false);
            setIsDeleting(true);
            await api.delete('/auth/me');
            await deleteItemAsync('authToken');
            signOut();
            router.replace('/');
        } catch (err) {
            setIsDeleting(false);
            Alert.alert('Error', 'Failed to delete account. Please try again.');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.void }}>
            
            <View style={styles.header}>
                <Pressable
                    onPress={() => router.back()}
                    style={[styles.backButton, { backgroundColor: `#FFFFFF05`, borderColor: colors.border }]}
                >
                    <ArrowLeft size={24} color={colors.textPrimary} strokeWidth={1.5} />
                </Pressable>
                <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fonts.display }]}>Settings</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <Text style={[styles.sectionTitle, { color: colors.gold, fontFamily: fonts.bodySemiBold }]}>Account</Text>
                <GlassCard accent="gold" style={styles.card}>
                    <View style={styles.row}>
                        <View style={[styles.rowIcon, { backgroundColor: `${colors.emerald}10` }]}>
                            <Shield size={20} color={colors.emerald} strokeWidth={1.5} />
                        </View>
                        <View style={styles.rowTextContainer}>
                            <Text style={[styles.rowTitle, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>Security Mode</Text>
                            <Text style={[styles.rowSubtitle, { color: colors.textSecondary, fontFamily: fonts.body }]}>Local authentication active</Text>
                        </View>
                        <Switch
                            value={settings.isMockAuthEnabled}
                            onValueChange={(val) => updateSettings({ isMockAuthEnabled: val })}
                            trackColor={{ false: `#FFFFFF10`, true: `${colors.emerald}80` }}
                            thumbColor={settings.isMockAuthEnabled ? colors.emerald : colors.textSecondary}
                        />
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {settings.mockUserId ? (
                        <View>
                            <View style={styles.row}>
                                <View style={[styles.rowIcon, { backgroundColor: `${colors.gold}10` }]}>
                                    <User size={20} color={colors.gold} strokeWidth={1.5} />
                                </View>
                                <View style={styles.rowTextContainer}>
                                    <Text style={[styles.rowTitle, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>Current Profile</Text>
                                    <Text style={[styles.rowSubtitle, { color: colors.textSecondary, fontFamily: fonts.body }]}>{settings.mockUserName}</Text>
                                </View>
                            </View>
                            <Pressable
                                style={[styles.actionButton, {
                                    backgroundColor: `${colors.gold}10`,
                                    borderColor: `${colors.gold}30`,
                                }]}
                                onPress={handleMockLogout}
                            >
                                <LogOut size={18} color={colors.gold} />
                                <Text style={[styles.actionButtonText, { color: colors.gold, fontFamily: fonts.bodySemiBold }]}>Sign Out</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <Pressable
                            style={[styles.actionButton, { backgroundColor: colors.gold, margin: 16 }]}
                            onPress={handleMockLogin}
                        >
                            <User size={18} color={colors.void} />
                            <Text style={[styles.actionButtonText, { color: colors.void, fontFamily: fonts.bodySemiBold }]}>Sign In (Demo)</Text>
                        </Pressable>
                    )}
                </GlassCard>

                <Pressable
                    style={{ marginTop: 16 }}
                    onPress={() => router.push('/profile-settings' as any)}
                >
                    <GlassCard accent="gold">
                        <View style={styles.row}>
                            <View style={[styles.rowIcon, { backgroundColor: `${colors.gold}10` }]}>
                                <User size={20} color={colors.gold} strokeWidth={1.5} />
                            </View>
                            <View style={styles.rowTextContainer}>
                                <Text style={[styles.rowTitle, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>My Personal Profile</Text>
                                <Text style={[styles.rowSubtitle, { color: colors.textSecondary, fontFamily: fonts.body }]}>Manage identity and data</Text>
                            </View>
                            <ChevronRight size={18} color={colors.textSecondary} />
                        </View>
                    </GlassCard>
                </Pressable>

                <Text style={[styles.sectionTitle, { color: colors.gold, fontFamily: fonts.bodySemiBold }]}>Preferences</Text>
                <GlassCard accent="gold" style={styles.card}>
                    <Pressable style={styles.row} onPress={() => router.push('/notification-settings' as any)}>
                        <View style={[styles.rowIcon, { backgroundColor: `${colors.sapphire}10` }]}>
                            <Bell size={20} color={colors.sapphire} strokeWidth={1.5} />
                        </View>
                        <View style={styles.rowTextContainer}>
                            <Text style={[styles.rowTitle, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>Notifications</Text>
                            <Text style={[styles.rowSubtitle, { color: colors.textSecondary, fontFamily: fonts.body }]}>Silence or activate alerts</Text>
                        </View>
                        <ChevronRight size={18} color={colors.textSecondary} />
                    </Pressable>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={[styles.row, { flexDirection: 'column', alignItems: 'stretch', gap: 12 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[styles.rowIcon, { backgroundColor: `#FFFFFF05`, marginRight: 16 }]}>
                                <Moon size={20} color={colors.textPrimary} strokeWidth={1.5} />
                            </View>
                            <View style={styles.rowTextContainer}>
                                <Text style={[styles.rowTitle, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>Appearance</Text>
                                <Text style={[styles.rowSubtitle, { color: colors.textSecondary, fontFamily: fonts.body }]}>Dynamic theme selection</Text>
                            </View>
                        </View>
                        <View style={{ marginLeft: 52 }}>
                            <ThemePicker
                                value={settings.theme as ThemePref}
                                onChange={(v) => updateSettings({ theme: v })}
                            />
                        </View>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.row}>
                        <View style={[styles.rowIcon, { backgroundColor: `${colors.gold}10` }]}>
                            <Droplets size={20} color={colors.gold} strokeWidth={1.5} />
                        </View>
                        <View style={styles.rowTextContainer}>
                            <Text style={[styles.rowTitle, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>Tactile Response</Text>
                            <Text style={[styles.rowSubtitle, { color: colors.textSecondary, fontFamily: fonts.body }]}>Haptic feedback on interaction</Text>
                        </View>
                        <Switch
                            value={settings.hapticFeedbackEnabled}
                            onValueChange={(val) => updateSettings({ hapticFeedbackEnabled: val })}
                            trackColor={{ false: `#FFFFFF10`, true: `${colors.gold}80` }}
                            thumbColor={settings.hapticFeedbackEnabled ? colors.gold : colors.textSecondary}
                        />
                    </View>
                </GlassCard>

                <Text style={[styles.sectionTitle, { color: colors.gold, fontFamily: fonts.bodySemiBold }]}>System</Text>
                <GlassCard accent="gold" style={styles.card}>
                    <View style={styles.row}>
                        <View style={[styles.rowIcon, { backgroundColor: `#FFFFFF05` }]}>
                            <Laptop size={20} color={colors.textSecondary} strokeWidth={1.5} />
                        </View>
                        <View style={styles.rowTextContainer}>
                            <Text style={[styles.rowTitle, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>Developer Access</Text>
                            <Text style={[styles.rowSubtitle, { color: colors.textSecondary, fontFamily: fonts.body }]}>Experimental protocol features</Text>
                        </View>
                        <Switch
                            value={settings.developerMode}
                            onValueChange={(val) => updateSettings({ developerMode: val })}
                            trackColor={{ false: `#FFFFFF10`, true: `${colors.gold}80` }}
                            thumbColor={settings.developerMode ? colors.gold : colors.textSecondary}
                        />
                    </View>
                </GlassCard>

                <View style={{ marginTop: 24 }}>
                <View style={{ marginTop: 24 }}>
                    <Pressable
                        onPress={handleDeleteAccount}
                    >
                        <GlassCard accent="crimson">
                            <View style={styles.deleteButtonInner}>
                                <Trash2 size={18} color={colors.crimson} strokeWidth={1.5} />
                                <Text style={[styles.rowTitle, { color: colors.crimson, fontFamily: fonts.bodySemiBold, fontSize: 14 }]}>Delete Account</Text>
                            </View>
                        </GlassCard>
                    </Pressable>
                </View>
                </View>

                <Text style={[styles.versionText, { color: colors.textSecondary, fontFamily: fonts.mono }]}>VinR PROTOTYPE v1.0.4</Text>
            </ScrollView>

            <Modal
                visible={showDeleteModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <GlassCard accent="crimson" glow={true} style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <AlertTriangle size={24} color={colors.crimson} />
                            <Text style={[styles.modalTitle, { color: colors.textPrimary, fontFamily: fonts.display }]}>Confirm Deletion</Text>
                            <Pressable onPress={() => setShowDeleteModal(false)} style={[styles.modalClose, { backgroundColor: `#FFFFFF10` }]}>
                                <X size={20} color={colors.textSecondary} />
                            </Pressable>
                        </View>
                        <Text style={[styles.modalDesc, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                            Enter <Text style={{ fontFamily: fonts.bodySemiBold, color: colors.crimson }}>DELETE</Text> to permanently erase your data from the sanctuary.
                        </Text>
                        <TextInput
                            style={[styles.modalInput, { backgroundColor: `${colors.void}90`, borderColor: colors.border, color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}
                            placeholder="DELETE"
                            placeholderTextColor={`${colors.textSecondary}40`}
                            value={deleteConfirmText}
                            onChangeText={setDeleteConfirmText}
                            autoCapitalize="characters"
                            autoFocus
                        />
                        <View style={styles.modalActions}>
                            <Pressable
                                style={[styles.modalCancelBtn, { backgroundColor: `#FFFFFF08`, borderColor: colors.border, borderWidth: 1 }]}
                                onPress={() => setShowDeleteModal(false)}
                            >
                                <View style={styles.buttonInnerCentered}>
                                    <Text style={[styles.modalCancelText, { color: colors.textSecondary, fontFamily: fonts.bodySemiBold }]}>Cancel</Text>
                                </View>
                            </Pressable>
                            <Pressable
                                style={[
                                    styles.modalDeleteBtn,
                                    { backgroundColor: colors.crimson },
                                    deleteConfirmText.trim().toUpperCase() !== 'DELETE' && { opacity: 0.3, backgroundColor: '#444' },
                                ]}
                                onPress={executeDelete}
                                disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE'}
                            >
                                <View style={styles.buttonInnerCentered}>
                                    <Trash2 size={16} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={[styles.modalDeleteText, { fontFamily: fonts.bodySemiBold }]}>Delete</Text>
                                </View>
                            </Pressable>
                        </View>
                    </GlassCard>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    title: {
        fontSize: 22,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 16,
        marginTop: 32,
        paddingHorizontal: 4,
        opacity: 0.7,
    },
    card: {
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    rowIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    rowTextContainer: {
        flex: 1,
    },
    rowTitle: {
        fontSize: 16,
        marginBottom: 2,
    },
    rowSubtitle: {
        fontSize: 13,
        opacity: 0.6,
    },
    divider: {
        height: 1,
        marginLeft: 72,
        opacity: 0.1,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    actionButtonText: {
        fontSize: 16,
    },
    versionText: {
        fontSize: 11,
        textAlign: 'center',
        marginTop: 48,
        marginBottom: 24,
        opacity: 0.4,
        letterSpacing: 1,
    },
    deleteButtonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '90%',
        maxWidth: 340,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        flex: 1,
    },
    modalClose: {
        width: 36, height: 36, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
    },
    modalDesc: {
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 16,
        opacity: 0.8,
    },
    modalInput: {
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 18,
        letterSpacing: 2,
        textAlign: 'center',
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    modalCancelBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
    },
    modalCancelText: {
        fontSize: 14,
        textAlign: 'center',
    },
    modalDeleteBtn: {
        flex: 1.5,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        overflow: 'hidden',
    },
    buttonInnerCentered: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    modalDeleteText: {
        fontSize: 14,
        color: '#ffffff',
    },
});

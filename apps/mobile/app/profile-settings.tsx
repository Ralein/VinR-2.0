/**
 * Profile Settings — View profile info + Delete account
 * Redesigned for Midnight Gold aesthetic.
 */

import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Pressable,
    Alert, TextInput, ActivityIndicator, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    ArrowLeft, User, Mail, Calendar, Target, Leaf,
    Trash2, AlertTriangle, X, Check
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../stores/authStore';
import { useOnboardingStore } from '../stores/onboardingStore';
import api from '../services/api';
import { deleteItemAsync } from '../utils/storage';
import GlassCard from '../components/ui/GlassCard';

export default function ProfileSettingsScreen() {
    const { colors, fonts, spacing } = useTheme();
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const signOut = useAuthStore((s) => s.signOut);
    const onboarding = useOnboardingStore();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This will permanently delete your account, all check-ins, journal entries, streaks, and data. This action cannot be undone.',
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

    const memberSince = user?.onboardingComplete
        ? 'Protocol Optimized'
        : 'Onboarding Pending';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]}>

            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    onPress={() => router.back()}
                    style={[styles.backButton, { backgroundColor: `#FFFFFF05`, borderColor: colors.border }]}
                >
                    <ArrowLeft size={24} color={colors.textPrimary} strokeWidth={1.5} />
                </Pressable>
                <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fonts.display }]}>Identity Profile</Text>
                <View style={{ width: 44 }} />
            </View>

            {isDeleting ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.crimson} />
                    <Text style={[styles.loadingText, { color: colors.crimson, fontFamily: fonts.bodySemiBold }]}>Purging user state...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Avatar & Name */}
                    <View style={styles.avatarSection}>
                        <View style={[styles.avatarCircle, { backgroundColor: `${colors.gold}08`, borderColor: 'rgba(212,175,55,0.25)' }]}>
                            <User size={48} color={colors.gold} strokeWidth={1} />
                        </View>
                        <Text style={[styles.userName, { color: colors.textPrimary, fontFamily: fonts.display }]}>{user?.name || 'VinR Citizen'}</Text>
                        <Text style={[styles.userEmail, { color: colors.textSecondary, fontFamily: fonts.body }]}>{user?.email || 'unattached_node@vinr.ai'}</Text>
                    </View>

                    {/* Profile Info Card */}
                    <Text style={[styles.sectionTitle, { color: colors.gold, fontFamily: fonts.bodySemiBold }]}>Established Data</Text>
                    <GlassCard accent="gold">
                        <ProfileRow
                            Icon={User}
                            label="Legal Name"
                            value={onboarding.name || user?.name || '—'}
                            iconColor={colors.gold}
                        />
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <ProfileRow
                            Icon={Mail}
                            label="Synthesis Path"
                            value={user?.email || '—'}
                            iconColor={colors.sapphire}
                        />
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <ProfileRow
                            Icon={Calendar}
                            label="Age"
                            value={onboarding.age || user?.age || '—'}
                            iconColor={colors.emerald}
                        />
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <ProfileRow
                            Icon={Target}
                            label="Primary Directive"
                            value={onboarding.identity || user?.primaryReason || '—'}
                            iconColor={colors.lavender}
                        />
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <ProfileRow
                            Icon={Leaf}
                            label="Relaxation Nodes"
                            value={onboarding.focusAreas?.join(', ') || user?.relaxationMethods?.join(', ') || '—'}
                            iconColor={colors.emerald}
                        />
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <ProfileRow
                            Icon={Check}
                            label="Lifecycle Status"
                            value={memberSince}
                            iconColor={colors.textSecondary}
                        />
                    </GlassCard>

                    {/* Danger Zone */}
                    <Text style={[styles.sectionTitle, { color: colors.crimson, fontFamily: fonts.bodySemiBold }]}>Delete Account</Text>
                    <GlassCard accent="crimson" glow={true}>
                        <View style={styles.dangerInfo}>
                            <AlertTriangle size={20} color={colors.crimson} strokeWidth={2} />
                            <Text style={[styles.dangerText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                                Account deletion is permanent and irreversible. All your data will be erased.
                            </Text>
                        </View>
                        <Pressable
                            style={({ pressed }) => [
                                styles.deleteButton,
                                { backgroundColor: colors.crimson },
                                pressed && { opacity: 0.8 }
                            ]}
                            onPress={handleDeleteAccount}
                        >
                            <View style={styles.deleteButtonInner}>
                                <Trash2 size={18} color="#fff" />
                                <Text style={[styles.deleteButtonText, { fontFamily: fonts.bodySemiBold }]}>Delete Account</Text>
                            </View>
                        </Pressable>
                    </GlassCard>

                    <View style={{ height: 60 }} />
                </ScrollView>
            )}

            {/* Cross-platform DELETE confirmation modal */}
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

// ── Reusable Profile Row ────────────────────────────────────

function ProfileRow({
    Icon, label, value, iconColor,
}: {
    Icon: any; label: string; value: string; iconColor: string;
}) {
    const { colors, fonts } = useTheme();
    return (
        <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: `${iconColor}10` }]}>
                <Icon size={18} color={iconColor} strokeWidth={1.8} />
            </View>
            <View style={styles.rowTextContainer}>
                <Text style={[styles.rowLabel, { color: colors.textSecondary, fontFamily: fonts.bodySemiBold }]}>{label}</Text>
                <Text style={[styles.rowValue, { color: colors.textPrimary, fontFamily: fonts.body }]}>{value}</Text>
            </View>
        </View>
    );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
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
    loadingContainer: {
        flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20,
    },
    loadingText: {
        fontSize: 16,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    avatarCircle: {
        width: 100, height: 100, borderRadius: 50,
        borderWidth: 1,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
    },
    userName: {
        fontSize: 28, marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        opacity: 0.6,
        letterSpacing: 1,
    },
    sectionTitle: {
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 16,
        marginTop: 32,
        paddingHorizontal: 4,
        opacity: 0.7,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    rowIcon: {
        width: 40, height: 40, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
        marginRight: 16,
    },
    rowTextContainer: {
        flex: 1,
    },
    rowLabel: {
        fontSize: 10,
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 1,
        opacity: 0.6,
    },
    rowValue: {
        fontSize: 16,
    },
    divider: {
        height: 1,
        marginLeft: 72,
        opacity: 0.1,
    },
    dangerInfo: {
        flexDirection: 'row', alignItems: 'flex-start',
        padding: 16, gap: 12,
    },
    dangerText: {
        fontSize: 13,
        flex: 1, lineHeight: 20,
        opacity: 0.8,
    },
    deleteButton: {
        margin: 16, marginTop: 0,
        borderRadius: 12,
        overflow: 'hidden',
    },
    deleteButtonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 10,
    },
    deleteButtonText: {
        fontSize: 14,
        color: '#ffffff',
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

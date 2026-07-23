import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Dimensions,
    Alert,
    ScrollView,
    Clipboard,
    Keyboard
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import {
    ArrowLeft,
    Mic,
    Send,
    MoreVertical,
    Play,
    Pause,
    Trash2,
    ChevronUp,
    Copy,
    Reply,
    Smile,
    X,
    Check,
    CheckCheck,
    Camera,
    Plus,
    Image as ImageIcon,
    MicOff,
    Volume2,
    VolumeX
} from 'lucide-react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { SafeBlurView } from '../../components/ui/SafeBlurView';
import { PERSONAS, Persona } from '../../constants/personas';
import { config } from '../../constants/config';
import { Modal, TouchableOpacity } from 'react-native';
import api from '../../services/api';
import { useChatStore, ChatMessage } from '../../stores/chatStore';



import Animated, {
    FadeIn,
    FadeInUp,
    FadeOut,
    SlideInRight,
    SlideInLeft,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withRepeat,
    withSequence,
    interpolate,
    Extrapolate,
    ZoomIn,
    BounceIn,
    SlideInUp,
    FadeInDown,
    runOnJS
} from 'react-native-reanimated';
// ── File-1 gesture API ──────────────────────────────────────────────────────
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import AudioService from '../../services/audio_service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Haptic wrapper
const triggerHaptic = async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    try {
        const styleEnum =
            style === 'light' ? Haptics.ImpactFeedbackStyle.Light :
            style === 'medium' ? Haptics.ImpactFeedbackStyle.Medium :
            Haptics.ImpactFeedbackStyle.Heavy;
        await Haptics.impactAsync(styleEnum);
    } catch (e) { /* fallback */ }
};

// Re-export ChatMessage type from store as Message alias for backward compat
type Message = ChatMessage;

interface MessageAction {
    messageId: string;
    type: 'edit' | 'delete' | 'copy' | 'reply';
}

const Waveform = ({ color, progress = 0 }: { color: string, progress?: number }) => (
    <View style={styles.waveformContainer}>
        {[8, 14, 10, 18, 12, 17, 9, 15, 11, 16, 12, 14, 8, 15, 12, 18, 10, 14, 9].map((h, i, arr) => {
            const barProgress = i / arr.length;
            const isActive = barProgress <= progress;
            return (
                <View
                    key={i}
                    style={[
                        styles.waveBar,
                        { 
                            height: h, 
                            backgroundColor: isActive ? color : color + '40',
                            opacity: isActive ? 1 : 0.5 
                        }
                    ]}
                />
            );
        })}
    </View>
);

export default function ChatScreen() {
    const { persona: personaId } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { messages, addMessage, setMessages, removeMessage, clearMessages, persona: storePersona, setPersona: setStorePersona } = useChatStore();
    const [persona, setPersonaLocal] = useState<string>(personaId as string || storePersona || 'vinr');

    useEffect(() => {
        if (personaId) {
            setPersonaLocal(personaId as string);
            setStorePersona(personaId as string);
        }
    }, [personaId]);

    const triggerPersonaGreeting = useCallback(async (pId: string) => {
        try {
            const baseUrl = config.API_BASE_URL.replace('/api/v1/', '');
            const greetingUrl = `${baseUrl}/public/wav/greetings/${pId}.wav`;
            AudioService.togglePlayback(greetingUrl);
        } catch (e) {
            console.error('Failed to trigger greeting:', e);
        }
    }, []);

    const changePersona = (id: string) => {
        if (id === persona) return;
        setPersonaLocal(id);
        setStorePersona(id);
        triggerHaptic('medium');
        const pName = PERSONAS.find(p => p.id === id)?.name;
        
        // Add switch message to store
        addMessage({
            id: Date.now().toString(),
            text: `Switched to ${pName}. How can I help you?`,
            sender: 'ai',
            timestamp: new Date(),
            isRead: true
        });

        // If voice mode is on, play greetings
        if (voiceEnabled) {
            triggerPersonaGreeting(id);
        }
    };

    // Seed initial greeting only if store is empty (first open / after logout)
    useEffect(() => {
        if (messages.length === 0) {
            const pName = PERSONAS.find((p: Persona) => p.id === persona)?.name;
            addMessage({
                id: '1',
                text: `Hey! I'm ${pName}. How can I help you today?`,
                sender: 'ai',
                timestamp: new Date(),
                isRead: true
            });
        }
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isSendingVoice, setIsSendingVoice] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [playbackUri, setPlaybackUri] = useState<string | null>(null);
    const [playbackStatus, setPlaybackStatus] = useState<any | null>(null);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [showPersonaMenu, setShowPersonaMenu] = useState(false);

    useEffect(() => {
        const unsub = AudioService.subscribe((status, uri) => {
            setPlaybackStatus(status);
            setPlaybackUri(uri);
        });
        return unsub;
    }, []);

    useEffect(() => {
        const show = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        const hide = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
        });
        return () => { show.remove(); hide.remove(); };
    }, []);

    // isLocked lives as BOTH a shared value (for gesture worklet) and React state (for render)
    const isLockedSV = useSharedValue(false);
    const [isLocked, setIsLocked] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [showMessageActions, setShowMessageActions] = useState<string | null>(null);

    const flatListRef = useRef<FlatList>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // ── Animation values ────────────────────────────────────────────────────
    const micScale = useSharedValue(1);
    const dragX = useSharedValue(0);
    const dragY = useSharedValue(0);

    useEffect(() => {
        if (isLoading) {
            micScale.value = withRepeat(
                withSequence(withTiming(1.2, { duration: 500 }), withTiming(1, { duration: 500 })),
                -1
            );
        } else {
            micScale.value = withSpring(1);
        }
    }, [isLoading]);

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const renderFormattedText = (text: string, baseStyle: any) => {
        if (!text) return null;
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return (
            <Text style={baseStyle}>
                {parts.map((part, index) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <Text key={index} style={{ fontWeight: 'bold' }}>{part.slice(2, -2)}</Text>;
                    }
                    return <Text key={index}>{part}</Text>;
                })}
            </Text>
        );
    };

    const formatMessageTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    // ── Recording logic (from file 1) ───────────────────────────────────────
    const startRecording = async () => {
        const hasPermission = await AudioService.requestPermissions();
        if (!hasPermission) {
            Alert.alert('Permission Required', 'Please enable microphone access to record voice messages.');
            return;
        }
        const started = await AudioService.startRecording();
        if (started) {
            setIsRecording(true);
            setRecordingTime(0);
            setIsLocked(false);
            isLockedSV.value = false;
            dragX.value = 0;
            dragY.value = 0;
            triggerHaptic('medium');
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
    };

    const stopAndSend = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        const uri = await AudioService.stopRecording();
        const duration = recordingTime;
        
        // Finalize recording states but keep isSendingVoice true if we have a URI
        isLockedSV.value = false;
        dragX.value = 0;
        dragY.value = 0;
        setIsRecording(false);
        setIsLocked(false);
        setRecordingTime(0);
        
        if (uri) {
            triggerHaptic('heavy');
            setIsSendingVoice(true); // Start sending state
            processVoiceMessage(uri, duration);
        }
    };

    const cancelRecording = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        await AudioService.stopRecording();
        isLockedSV.value = false;
        dragX.value = 0;
        dragY.value = 0;
        setIsRecording(false);
        setIsLocked(false);
        setRecordingTime(0);
        triggerHaptic('light');
    };

    const processVoiceMessage = async (uri: string, duration?: number) => {
        setIsLoading(true);
        triggerHaptic('medium');
        try {
            const transcript = await AudioService.transcribeAudio(uri);
            if (transcript) {
                await handleSend(transcript);
            }
        } catch (error) {
            console.error('Process voice message error:', error);
            Alert.alert('Error', 'Failed to process voice message. Please try again.');
        } finally {
            setIsLoading(false);
            setIsSendingVoice(false); // End sending state
        }
    };

    const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || input.trim();
        if (!textToSend) return;

        // Optimistic local update for User message
        const userMsg: Message = {
            id: Date.now().toString(),
            text: textToSend,
            sender: 'user',
            timestamp: new Date(),
            isRead: true
        };

        addMessage(userMsg);
        if (!textOverride) {
            setInput('');
            setReplyingTo(null);
        }

        setIsLoading(true);
        triggerHaptic('light');

        try {
            const { data } = await api.post('/chat/message', {
                text: textToSend,
                voice_enabled: voiceEnabled,
                persona: persona,
            });

            // Map backend response to local Message type
            const buddyMsg: Message = {
                id: data.buddy_message.id,
                text: data.buddy_message.content,
                sender: 'ai',
                timestamp: new Date(data.buddy_message.created_at),
                audioUri: data.buddy_message.audio_url || undefined,
                isVoice: !!data.buddy_message.audio_url,
                isRead: true
            };

            addMessage(buddyMsg);
            triggerHaptic('medium');

            // Auto-play if voice is enabled and audio_url exists
            if (voiceEnabled && data.buddy_message.audio_url) {
                // Show a brief 'Generating voice' state if there's any lag in the data URI handling
                setIsGeneratingVoice(true);
                setTimeout(() => {
                    AudioService.togglePlayback(data.buddy_message.audio_url);
                    setIsGeneratingVoice(false);
                }, 100);
            }
        } catch (error) {
            console.error('Chat error:', error);
            addMessage({
                id: (Date.now() + 1).toString(),
                text: "I'm having a little trouble connecting. Could you try saying that again?",
                sender: 'ai',
                timestamp: new Date(),
                isRead: true
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleMessageAction = async (messageId: string, action: string) => {
        const message = messages.find(m => m.id === messageId);
        if (!message) return;
        switch (action) {
            case 'copy':
                Clipboard.setString(message.text || 'Voice Message');
                Alert.alert('Copied', 'Message copied to clipboard');
                triggerHaptic('light');
                break;
            case 'delete':
                removeMessage(messageId);
                triggerHaptic('medium');
                break;
            case 'reply':
                setReplyingTo(message);
                triggerHaptic('light');
                break;
        }
        setShowMessageActions(null);
    };

    const clearHistory = async () => {
        try {
            await api.delete('/chat/history');
        } catch (error) {
            console.error('Failed to clear backend memory:', error);
        }
        clearMessages();
        setShowPersonaMenu(false);
        triggerHaptic('heavy');
    };

    const toggleVoice = async () => {
        const newState = !voiceEnabled;
        setVoiceEnabled(newState);
        setShowPersonaMenu(false);
        triggerHaptic('medium');

        if (newState) {
            // Voice just turned ON — play the pre-generated greeting
            const pName = PERSONAS.find((p: Persona) => p.id === persona)?.name || 'VinR Buddy';
            const greetingText = `Hey! I'm ${pName}. Voice mode is now active — I'll speak my replies to you.`;
            const baseUrl = config.API_BASE_URL.replace('/api/v1/', '');
            const greetingUrl = `${baseUrl}/public/wav/greetings/${persona}.wav`;

            // Add a greeting message to the chat
            addMessage({
                id: `voice-greeting-${Date.now()}`,
                text: greetingText,
                sender: 'ai',
                timestamp: new Date(),
                isRead: true,
                isVoice: true,
                audioUri: greetingUrl,
            });

            // Play the pre-generated greeting from public/wav
            triggerPersonaGreeting(persona);
        }
        
    };



    // Enforce max voice message length of 1:00 (60 seconds)
    useEffect(() => {
        if (isRecording && recordingTime >= 60) {
            stopAndSend();
        }
    }, [isRecording, recordingTime]);

    // ── Gesture.Pan — reads shared values so worklet never sees stale state ──
    const panGesture = Gesture.Pan()
        .onBegin(() => {
            runOnJS(startRecording)();
        })
        .onUpdate((e) => {
            if (isLockedSV.value) return;

            dragX.value = e.translationX;
            dragY.value = e.translationY;

            // Swipe left past threshold → cancel
            if (e.translationX < -100) {
                runOnJS(cancelRecording)();
            }

            // Swipe up past threshold → lock
            if (e.translationY < -80) {
                isLockedSV.value = true;
                runOnJS(setIsLocked)(true);
                runOnJS(triggerHaptic)('heavy');
                dragX.value = 0;
                dragY.value = 0;
            }
        })
        .onEnd(() => {
            if (isLockedSV.value) return;
            if (dragX.value <= -100) {
                runOnJS(cancelRecording)();
            } else {
                runOnJS(stopAndSend)();
            }
        });

    // ── Animated styles ─────────────────────────────────────────────────────
    const animatedMicStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: micScale.value },
            { translateX: isLockedSV.value ? 0 : dragX.value },
            { translateY: isLockedSV.value ? 0 : dragY.value }
        ]
    }));

    // ── Render message ───────────────────────────────────────────────────────
    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.sender === 'user';
        const pData = PERSONAS.find((p: Persona) => p.id === persona);
        const isSelected = selectedMessage === item.id;

        return (
            <Animated.View
                entering={isUser ? SlideInRight.springify() : SlideInLeft.springify()}
                style={[styles.msgWrapper, isUser ? styles.msgWrapperUser : styles.msgWrapperAi]}
            >
                {!isUser && (
                    <View style={[
                        styles.aiAvatar,
                        {
                            borderColor: colors.gold,
                            backgroundColor: isDark ? colors.surface : colors.void,
                            shadowColor: colors.gold,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.15,
                            shadowRadius: 6,
                            elevation: 3
                        }
                    ]}>
                        {pData && <pData.icon size={18} color={colors.gold} strokeWidth={2.5} />}
                    </View>
                )}

                <Pressable
                    onLongPress={() => {
                        setShowMessageActions(item.id);
                        triggerHaptic('medium');
                    }}
                    onPress={() => setShowMessageActions(null)}
                    style={[
                        styles.msgBubble,
                        isUser
                            ? [styles.msgBubbleUser, { backgroundColor: colors.sapphire }]
                            : [styles.msgBubbleAi, {
                                backgroundColor: colors.surface,
                                borderColor: isDark ? 'rgba(184,131,42,0.2)' : 'rgba(184,131,42,0.15)',
                                borderWidth: 1
                            }],
                        isSelected && styles.msgBubbleSelected
                    ]}
                >
                    {replyingTo?.id === item.id && (
                        <View style={[styles.replyIndicator, { borderLeftColor: colors.gold }]} />
                    )}

                    {!!item.text && renderFormattedText(item.text, [
                            styles.msgText,
                            isUser ? styles.msgTextUser : { color: colors.textPrimary }
                    ])}

                    <Text style={[
                        styles.msgTimestamp,
                        isUser ? { color: 'rgba(255,255,255,0.6)' } : { color: colors.textMuted }
                    ]}>
                        {formatMessageTime(item.timestamp)}
                    </Text>

                    {item.isVoice && (
                        <View style={[
                            styles.playBtn,
                            {
                                borderTopColor: 'transparent',
                                backgroundColor: item.sender === 'user' ? 'rgba(255,255,255,0.15)' : colors.gold + '15',
                                borderRadius: 100,
                                padding: 6,
                                paddingRight: 16,
                                marginTop: 8,
                                minWidth: 220
                            }
                        ]}>
                            <Pressable
                                style={{
                                    width: 32, height: 32, borderRadius: 16,
                                    backgroundColor: item.sender === 'user' ? '#FFFFFF' : colors.gold,
                                    alignItems: 'center', justifyContent: 'center',
                                    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3
                                }}
                                onPress={() => AudioService.togglePlayback(item.audioUri!)}
                            >
                                {playbackUri === item.audioUri && playbackStatus?.playing ? (
                                    <Pause color={item.sender === 'user' ? colors.sapphire : colors.void} size={14} fill={item.sender === 'user' ? colors.sapphire : colors.void} />
                                ) : (
                                    <Play color={item.sender === 'user' ? colors.sapphire : colors.void} size={14} fill={item.sender === 'user' ? colors.sapphire : colors.void} style={{ marginLeft: 2 }} />
                                )}
                            </Pressable>

                            <View style={{ flex: 1, marginHorizontal: 12 }}>
                                <Waveform 
                                    color={item.sender === 'user' ? 'rgba(255,255,255,0.9)' : colors.textPrimary} 
                                    progress={playbackUri === item.audioUri && playbackStatus?.duration > 0 ? playbackStatus.currentTime / playbackStatus.duration : 0}
                                />
                            </View>

                            <Text style={[
                                styles.playText,
                                { color: item.sender === 'user' ? '#FFFFFF' : colors.textPrimary, fontSize: 12 }
                            ]}>
                                {playbackUri === item.audioUri && playbackStatus?.playing
                                    ? formatTime(playbackStatus.currentTime)
                                    : (item.duration ? formatTime(item.duration) : formatTime(playbackUri === item.audioUri && playbackStatus?.duration ? playbackStatus.duration : 0))}
                            </Text>
                        </View>
                    )}

                    {isUser && item.isRead && (
                        <View style={styles.readReceipt}>
                            <CheckCheck size={12} color="rgba(255,255,255,0.7)" />
                        </View>
                    )}

                </Pressable>

                {/* Message Action Menu */}
                {showMessageActions === item.id && (
                    <Animated.View
                        entering={ZoomIn.springify()}
                        style={[
                            styles.actionMenu,
                            { backgroundColor: colors.surface, shadowColor: colors.textPrimary },
                            isUser ? styles.actionMenuRight : styles.actionMenuLeft
                        ]}
                    >
                        <Pressable
                            style={[styles.actionMenuItem, { borderBottomColor: colors.border }]}
                            onPress={() => handleMessageAction(item.id, 'copy')}
                        >
                            <Copy size={16} color={colors.gold} />
                            <Text style={[styles.actionMenuText, { color: colors.textPrimary }]}>Copy</Text>
                        </Pressable>

                        {!isUser && (
                            <Pressable
                                style={[styles.actionMenuItem, { borderBottomColor: colors.border }]}
                                onPress={() => handleMessageAction(item.id, 'reply')}
                            >
                                <Reply size={16} color={colors.gold} />
                                <Text style={[styles.actionMenuText, { color: colors.textPrimary }]}>Reply</Text>
                            </Pressable>
                        )}

                        <Pressable
                            style={[styles.actionMenuItem, { borderBottomColor: 'transparent' }]}
                            onPress={() => handleMessageAction(item.id, 'delete')}
                        >
                            <Trash2 size={16} color={colors.crimson} />
                            <Text style={[styles.actionMenuText, { color: colors.crimson }]}>Delete</Text>
                        </Pressable>
                    </Animated.View>
                )}
            </Animated.View>
        );
    };

    const renderRecordingRow = () => (
        <View style={[styles.recordingRow, { paddingHorizontal: 16 }]}>
            {/* Cancel (Trash) */}
            <Pressable
                onPress={cancelRecording}
                disabled={isSendingVoice}
                style={[
                    styles.lockedActionBtn, 
                    { 
                        backgroundColor: isLocked ? colors.crimson + '15' : 'transparent',
                        opacity: isSendingVoice ? 0.3 : 1
                    }
                ]}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
                <Trash2 size={24} color={colors.crimson} />
            </Pressable>

            {/* Timer & Indicator */}
            <View style={[styles.recordingIndicatorRow, { marginLeft: 12 }]}>
                {!isSendingVoice && (
                    <Animated.View 
                        style={[styles.recordingDot, { backgroundColor: colors.crimson }]} 
                        entering={BounceIn.duration(400)} 
                    />
                )}
                <Text style={[styles.recordingTimer, { color: colors.textPrimary, fontSize: 16, fontWeight: '600' }]}>
                    {isSendingVoice ? 'Processing...' : formatTime(recordingTime)}
                </Text>
            </View>

            {/* Hint text / Spacer */}
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                {!isLocked && !isSendingVoice && (
                    <Animated.View entering={FadeIn} exiting={FadeOut}>
                        <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                            Slide to cancel
                        </Text>
                    </Animated.View>
                )}
            </View>

            {/* Send / Activity Indicator */}
            <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                {isSendingVoice ? (
                    <ActivityIndicator size="small" color={colors.sapphire} />
                ) : (
                    <Pressable
                        onPress={stopAndSend}
                        style={[
                            styles.actionBtn, 
                            { 
                                backgroundColor: colors.sapphire,
                                width: 40,
                                height: 40,
                                borderRadius: 20
                            }
                        ]}
                    >
                        <Send size={20} color="#FFFFFF" style={{ marginLeft: 2 }} />
                    </Pressable>
                )}
            </View>
        </View>
    );

    // ── Root render ──────────────────────────────────────────────────────────
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={[styles.container, { backgroundColor: colors.void }]}>

                {/* Header */}
                <SafeBlurView
                    intensity={isDark ? 85 : 35}
                    style={[styles.header, { borderBottomColor: colors.border, paddingTop: insets.top + 10 }]}
                >
                    <Pressable
                        onPress={() => router.back()}
                        style={[styles.backBtn, { backgroundColor: '#FFFFFF05', borderColor: colors.border }]}
                    >
                        <ArrowLeft color={colors.textPrimary} size={24} strokeWidth={1.5} />
                    </Pressable>

                    <View style={styles.headerTitleContainer}>
                        <View style={styles.headerTextWrapper}>
                            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                                {PERSONAS.find((p: Persona) => p.id === persona)?.name}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.emerald }} />
                                <Text style={[styles.onlineText, { color: colors.textMuted }]}>Online</Text>
                            </View>
                        </View>
                    </View>

                    <Pressable
                        onPress={() => setShowPersonaMenu(true)}
                        style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
                    >
                        <MoreVertical color={colors.textPrimary} size={20} />
                    </Pressable>

                </SafeBlurView>

                {/* Persona Switcher */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={[
                        styles.personaContainer,
                        {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(184,131,42,0.02)',
                            borderColor: colors.border
                        }
                    ]}
                    contentContainerStyle={styles.personaScrollContent}
                >
                    {PERSONAS.map((p) => (
                        <Pressable
                            key={p.id}
                            onPress={() => changePersona(p.id)}
                            style={[
                                styles.personaTab,
                                persona === p.id && {
                                    backgroundColor: isDark ? 'rgba(184,131,42,0.2)' : 'rgba(184,131,42,0.12)',
                                    borderColor: colors.gold,
                                    borderWidth: 1.5,
                                }
                            ]}
                        >
                            <p.icon
                                size={15}
                                color={persona === p.id ? colors.gold : colors.textGhost}
                                strokeWidth={persona === p.id ? 2.5 : 2}
                            />
                            <Text style={[
                                styles.personaTabText,
                                { color: persona === p.id ? colors.textPrimary : colors.textGhost },
                                persona === p.id && { fontWeight: '700' }
                            ]}>
                                {p.name}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>

                {/*
                 * Android: KAV behavior=undefined so it never touches layout.
                 * Instead we read the actual keyboard height and apply it as
                 * marginBottom on the input container — perfectly symmetric,
                 * 0 when closed, keyboardHeight - offset when open.
                 */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    {/* Messages List */}
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={item => item.id}
                        renderItem={renderMessage}
                        contentContainerStyle={[styles.chatContent, { paddingBottom: 20 }]}
                        ListFooterComponent={(isLoading || isGeneratingVoice) ? (
                            <View style={[styles.typingContainer, { marginBottom: 10 }]}>
                                <View style={[styles.aiAvatar, { width: 24, height: 24, borderColor: colors.gold }]}>
                                    {PERSONAS.find(p => p.id === persona)?.icon && React.createElement(PERSONAS.find(p => p.id === persona)!.icon, { size: 12, color: colors.gold })}
                                </View>
                                {isGeneratingVoice ? (
                                    <View style={{ marginLeft: 8 }}>
                                        <Text style={{ fontSize: 13, color: colors.textMuted, fontStyle: 'italic' }}>
                                            {PERSONAS.find(p => p.id === persona)?.name || 'VinR'} is generating voice...
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={styles.typingDots}>
                                        <View style={[styles.dot, { backgroundColor: colors.gold }]} />
                                        <View style={[styles.dot, { backgroundColor: colors.gold }]} />
                                        <View style={[styles.dot, { backgroundColor: colors.gold }]} />
                                    </View>
                                )}
                            </View>
                        ) : null}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        ListEmptyComponent={
                            <Animated.View entering={FadeInUp} style={styles.emptyState}>
                                <View style={[styles.emptyIcon, {
                                    backgroundColor: isDark ? 'rgba(184,131,42,0.1)' : 'rgba(184,131,42,0.08)'
                                }]}>
                                    <Smile size={32} color={colors.gold} />
                                </View>
                                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Start a conversation</Text>
                                <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>Say something to get started</Text>
                            </Animated.View>
                        }
                    />

                    {/* Input container — lifted by keyboard height on Android, 0 when closed */}
                    <View
                        style={[
                            styles.inputContainer,
                            {
                                borderTopColor: colors.border,
                                backgroundColor: isDark ? colors.surface : colors.void,
                                paddingBottom: 12,
                                marginBottom: Platform.OS === 'android' ? keyboardHeight > 0 ? keyboardHeight - 5 : 0 : 0,
                            }
                        ]}
                    >
                        {/* Reply preview */}
                        {replyingTo && (
                            <Animated.View
                                entering={FadeInDown.springify().damping(20)}
                                style={[
                                    styles.replyPreview,
                                    {
                                        backgroundColor: colors.surface,
                                        borderColor: colors.border,
                                        borderLeftColor: colors.gold
                                    }
                                ]}
                            >
                                <View style={styles.replyPreviewContent}>
                                    <Text style={[styles.replyLabel, { color: colors.gold }]}>
                                        Replying to {replyingTo.sender === 'user' ? 'You' : 'AI'}
                                    </Text>
                                    <Text style={[styles.replyText, { color: colors.textPrimary }]} numberOfLines={1}>
                                        {replyingTo.text || '🎤 Voice message'}
                                    </Text>
                                </View>
                                <Pressable hitSlop={10} onPress={() => setReplyingTo(null)}>
                                    <X size={16} color={colors.textMuted} />
                                </Pressable>
                            </Animated.View>
                        )}

                        <View style={[
                            styles.inputInner,
                            {
                                borderColor: colors.border,
                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                            }
                        ]}>
                            {/* Recording overlay — shown during recording or sending */}
                            {(isRecording || isSendingVoice) && renderRecordingRow()}

                            {/* Text input — hidden during recording or sending */}
                            {(!isRecording && !isSendingVoice) && (
                                <TextInput
                                    style={[styles.input, { color: colors.textPrimary }]}
                                    placeholder="Message..."
                                    placeholderTextColor={colors.textMuted}
                                    value={input}
                                    onChangeText={setInput}
                                    multiline
                                    editable={!isLoading}
                                />
                            )}

                            {/* Mic always mounted so gesture stays alive during recording */}
                            <View style={styles.rightIconsRow}>
                                {(input.trim() === '' || isRecording || isSendingVoice) ? (
                                    <GestureDetector gesture={panGesture}>
                                        <Animated.View style={[
                                            styles.micActionBtn,
                                            animatedMicStyle,
                                            (isRecording || isSendingVoice) && { opacity: 0, position: 'absolute', right: 0 }
                                        ]}>
                                            <View style={styles.micPressable}>
                                                <Mic size={22} color={colors.gold} />
                                            </View>
                                        </Animated.View>
                                    </GestureDetector>
                                ) : (
                                    <Animated.View entering={ZoomIn.springify()}>
                                        <Pressable
                                            style={[styles.actionBtn, {
                                                backgroundColor: colors.sapphire,
                                                width: 40, height: 40, borderRadius: 20
                                            }]}
                                            onPress={() => handleSend()}
                                            disabled={isLoading}
                                        >
                                            <Send size={20} color="#FFFFFF" style={{ marginLeft: 2 }} />
                                        </Pressable>
                                    </Animated.View>
                                )}
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>

                {insets.bottom > 0 && (
                    <View style={{ height: insets.bottom, backgroundColor: isDark ? colors.surface : colors.void }} />
                )}

                {/* Kebab Menu Modal */}
                <Modal
                    visible={showPersonaMenu}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowPersonaMenu(false)}
                >
                    <Pressable 
                        style={styles.modalOverlay}
                        onPress={() => setShowPersonaMenu(false)}
                    >
                        <Animated.View 
                            entering={FadeInUp.springify()}
                            style={[
                                styles.kebabMenu,
                                { 
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                    shadowColor: colors.textPrimary,
                                }
                            ]}
                        >
                            <TouchableOpacity 
                                style={[styles.kebabItem, { borderBottomColor: colors.border }]}
                                onPress={toggleVoice}
                            >
                                {voiceEnabled ? (
                                    <Volume2 size={20} color={colors.gold} />
                                ) : (
                                    <VolumeX size={20} color={colors.textMuted} />
                                )}
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.kebabText, { color: colors.textPrimary }]}>
                                        Voice Response
                                    </Text>
                                    <Text style={{ fontSize: 11, color: colors.textMuted }}>
                                        {voiceEnabled ? 'Currently ON' : 'Currently OFF'}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.kebabItem, { borderBottomColor: 'transparent' }]}
                                onPress={clearHistory}
                            >
                                <Trash2 size={20} color={colors.crimson} />
                                <Text style={[styles.kebabText, { color: colors.crimson }]}>
                                    Clear History
                                </Text>
                            </TouchableOpacity>


                        </Animated.View>
                    </Pressable>
                </Modal>
            </View>
        </GestureHandlerRootView>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1 },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, zIndex: 100 },
    backBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    headerTitleContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
    headerTextWrapper: { alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
    onlineText: { fontSize: 11, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3 },

    // Persona Tabs
    personaContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, maxHeight: 60 },
    personaScrollContent: { gap: 10, paddingHorizontal: 4 },
    personaTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 24, gap: 6, minWidth: 100 },
    personaTabText: { fontSize: 13, fontWeight: '600' },

    // Chat content
    chatContent: { padding: 20, gap: 16 },
    emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
    emptySubtitle: { fontSize: 14, textAlign: 'center' },

    // Messages
    msgWrapper: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
    msgWrapperUser: { justifyContent: 'flex-end' },
    msgWrapperAi: { justifyContent: 'flex-start' },
    aiAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, marginBottom: 2 },
    msgBubble: { maxWidth: '80%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
    msgBubbleUser: { borderBottomRightRadius: 4 },
    msgBubbleAi: { borderBottomLeftRadius: 4, borderWidth: 1 },
    msgBubbleSelected: { shadowOpacity: 0.3, shadowRadius: 6 },
    msgText: { fontSize: 16, lineHeight: 24, marginBottom: 4 },
    msgTextUser: { color: '#FFFFFF', fontWeight: '500' },
    msgTimestamp: { fontSize: 11, marginTop: 4 },
    replyIndicator: { width: 3, borderLeftWidth: 3, marginRight: 8, borderRadius: 1 },

    // Voice message
    playBtn: { flexDirection: 'row', alignItems: 'center' },
    playText: { fontWeight: '700', letterSpacing: 0.3 },
    readReceipt: { marginTop: 4, alignItems: 'flex-end', opacity: 0.8 },
    waveformContainer: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    waveBar: { width: 3, borderRadius: 2 },

    // Action menu
    actionMenu: { position: 'absolute', borderRadius: 12, overflow: 'hidden', shadowOpacity: 0.2, shadowRadius: 8, elevation: 5, zIndex: 1000 },
    actionMenuRight: { right: 0, bottom: 50 },
    actionMenuLeft: { left: 0, bottom: 50 },
    actionMenuItem: { paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1 },
    actionMenuText: { fontSize: 13, fontWeight: '600' },

    // Typing indicator
    typingContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 8, marginTop: 8 },
    typingDots: { flexDirection: 'row', gap: 4 },
    dot: { width: 6, height: 6, borderRadius: 3 },

    // Reply preview
    replyPreview: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, marginHorizontal: 4, marginBottom: 8, borderRadius: 12, borderLeftWidth: 3, borderTopWidth: 1, borderRightWidth: 1, borderBottomWidth: 1 },
    replyPreviewContent: { flex: 1 },
    replyLabel: { fontSize: 11, fontWeight: '700', marginBottom: 2, textTransform: 'uppercase' },
    replyText: { fontSize: 14, fontWeight: '500' },

    // Input area
    inputContainer: { paddingTop: 12, paddingHorizontal: 12, borderTopWidth: StyleSheet.hairlineWidth },
    inputInner: { flexDirection: 'row', alignItems: 'center', borderRadius: 28, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 4, minHeight: 48 },
    input: { flex: 1, fontSize: 16, maxHeight: 120, paddingTop: 8, paddingBottom: 8, marginHorizontal: 8 },
    actionBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    rightIconsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 4 },
    micActionBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    micPressable: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },

    // Recording row
    recordingRow: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, height: 40 },
    recordingIndicatorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
    recordingDot: { width: 8, height: 8, borderRadius: 4 },
    recordingTimer: { fontSize: 15, fontWeight: '600' },
    flexFill: { flex: 1 },
    lockedActionBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

    // Modal / Kebab Menu
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 60, paddingRight: 20 },
    kebabMenu: { width: 220, borderRadius: 16, borderWidth: 1, overflow: 'hidden', paddingVertical: 8, elevation: 10, shadowOpacity: 0.3, shadowRadius: 10 },
    kebabItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: 1 },
    kebabText: { fontSize: 15, fontWeight: '600' },
});

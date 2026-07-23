/**
 * Ephemeral Chat Store — Genshin-style temporary chat
 * 
 * Messages live only in memory (no AsyncStorage/MMKV persistence).
 * Cleared on: app restart, sign out, or manual clear.
 * Survives: screen navigation within the same session.
 */

import { create } from 'zustand';

export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    audioUri?: string;
    isVoice?: boolean;
    duration?: number;
    isRead?: boolean;
    reactions?: string[];
}

interface ChatState {
    messages: ChatMessage[];
    persona: string;

    addMessage: (msg: ChatMessage) => void;
    setMessages: (msgs: ChatMessage[]) => void;
    removeMessage: (id: string) => void;
    clearMessages: () => void;
    setPersona: (persona: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    messages: [],
    persona: 'vinr',

    addMessage: (msg) =>
        set((state) => ({ messages: [...state.messages, msg] })),

    setMessages: (msgs) =>
        set({ messages: msgs }),

    removeMessage: (id) =>
        set((state) => ({
            messages: state.messages.filter((m) => m.id !== id),
        })),

    clearMessages: () =>
        set({ messages: [] }),

    setPersona: (persona) =>
        set({ persona }),
}));

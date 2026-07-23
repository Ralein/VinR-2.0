/**
 * Zustand Auth Store
 */

import { create } from 'zustand';
import { useChatStore } from './chatStore';

interface User {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    onboardingComplete: boolean;
    timezone: string;
    age: string | null;
    primaryReason: string | null;
    relaxationMethods: string[];
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    setLoading: (loading: boolean) => void;
    signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,

    setUser: (user) =>
        set({ user, isAuthenticated: !!user }),

    setToken: (token) =>
        set({ token }),

    setLoading: (isLoading) =>
        set({ isLoading }),

    signOut: () => {
        useChatStore.getState().clearMessages();
        set({ user: null, token: null, isAuthenticated: false });
    },
}));

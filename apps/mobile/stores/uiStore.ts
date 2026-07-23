/**
 * Zustand UI Store — global UI state
 */

import { create } from 'zustand';

interface UIState {
    isLoading: boolean;
    loadingMessage: string;
    activeModal: string | null;
    sleepModeActive: boolean;

    setLoading: (loading: boolean, message?: string) => void;
    openModal: (modal: string) => void;
    closeModal: () => void;
    toggleSleepMode: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    isLoading: false,
    loadingMessage: '',
    activeModal: null,
    sleepModeActive: false,

    setLoading: (isLoading, loadingMessage = '') =>
        set({ isLoading, loadingMessage }),

    openModal: (activeModal) => set({ activeModal }),
    closeModal: () => set({ activeModal: null }),
    toggleSleepMode: () =>
        set((state) => ({ sleepModeActive: !state.sleepModeActive })),
}));

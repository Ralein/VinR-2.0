/**
 * Zustand Onboarding Store
 *
 * Tracks user progress through the 9-step onboarding wizard.
 * Persists selections: name, age, focus areas, reasons, time commitment, etc.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OnboardingState {
    // Step 2
    name: string;
    // Step 3
    age: string;
    // Step 4
    avatar: string | null;
    avatarId: string | null;      // alias used by step4-avatar
    // Step 5
    focusAreas: string[];
    // Step 6
    identity: string;
    // Step 7
    frequency: string;
    dailyTime: string;            // alias used by step7-frequency
    // Step 8
    notificationsEnabled: boolean;
    reminderTime: string;
    
    isFirstTime: boolean;
    currentStep: number;

    // Actions
    setName: (name: string) => void;
    setAge: (age: string) => void;
    setAvatar: (avatar: string | null) => void;
    setAvatarId: (id: string | null) => void;   // alias
    
    setFocusAreas: (areas: string[]) => void;
    toggleFocusArea: (area: string) => void;
    
    setIdentity: (identity: string) => void;
    setFrequency: (frequency: string) => void;
    setDailyTime: (time: string) => void;       // alias
    
    setNotificationsEnabled: (enabled: boolean) => void;
    setReminderTime: (time: string) => void;
    
    setStep: (step: number) => void;
    nextStep: () => void;
    completeOnboarding: () => void;
    reset: () => void;
}

const initialState = {
    name: '',
    age: '',
    avatar: null,
    avatarId: null,
    focusAreas: [],
    identity: '',
    frequency: 'Daily',
    dailyTime: 'Daily',
    notificationsEnabled: false,
    reminderTime: '08:00',
    isFirstTime: true,
    currentStep: 1,
};

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set) => ({
            ...initialState,

            setName: (name) => set({ name }),
            setAge: (age) => set({ age }),
            setAvatar: (avatar) => set({ avatar, avatarId: avatar }),
            setAvatarId: (avatarId) => set({ avatarId, avatar: avatarId }),
            
            setFocusAreas: (focusAreas) => set({ focusAreas }),
            toggleFocusArea: (area) =>
                set((state) => ({
                    focusAreas: state.focusAreas.includes(area)
                        ? state.focusAreas.filter((a) => a !== area)
                        : [...state.focusAreas, area],
                })),

            setIdentity: (identity) => set({ identity }),
            setFrequency: (frequency) => set({ frequency, dailyTime: frequency }),
            setDailyTime: (dailyTime) => set({ dailyTime, frequency: dailyTime }),
            
            setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
            setReminderTime: (reminderTime) => set({ reminderTime }),
            
            setStep: (currentStep) => set({ currentStep }),
            
            nextStep: () => set((state) => ({ 
                currentStep: Math.min(state.currentStep + 1, 9) 
            })),
            
            completeOnboarding: () => set({ isFirstTime: false }),
            
            reset: () => set(initialState),
        }),
        {
            name: 'vinr-onboarding-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

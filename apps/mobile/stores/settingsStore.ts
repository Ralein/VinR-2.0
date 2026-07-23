import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
    isMockAuthEnabled: boolean;
    setMockAuthEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            isMockAuthEnabled: __DEV__, // Default to true in dev mode
            setMockAuthEnabled: (enabled) => set({ isMockAuthEnabled: enabled }),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

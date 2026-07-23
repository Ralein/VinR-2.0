import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserSettings {
  isMockAuthEnabled: boolean;
  mockUserId: string | null;
  mockUserName: string | null;
  theme: 'system' | 'light' | 'dark';
  hapticFeedbackEnabled: boolean;
  developerMode: boolean;
}

interface SettingsState {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
  loginMockUser: (id: string, name: string) => void;
  logoutMockUser: () => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  isMockAuthEnabled: true,
  mockUserId: null,
  mockUserName: null,
  theme: 'system',
  hapticFeedbackEnabled: true,
  developerMode: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      
      updateSettings: (updates) => 
        set((state) => ({
          settings: { ...state.settings, ...updates }
        })),
        
      loginMockUser: (id, name) =>
        set((state) => ({
          settings: {
            ...state.settings,
            mockUserId: id,
            mockUserName: name,
            isMockAuthEnabled: true,
          }
        })),
        
      logoutMockUser: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            mockUserId: null,
            mockUserName: null,
          }
        })),
        
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: 'vinr-settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

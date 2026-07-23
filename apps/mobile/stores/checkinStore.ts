/**
 * Zustand Check-in Store
 */

import { create } from 'zustand';

interface ReliefItem {
    id: string;
    name: string;
    emoji: string;
    category: string;
    duration: string;
    instructions: string[];
    scienceNote: string;
    source: string;
}

interface CheckinPlan {
    isEmergency: boolean;
    primaryEmotion: string;
    emotionSummary: string;
    supportMessage: string;
    immediateRelief: ReliefItem[];
    dailyHabits: ReliefItem[];
    affirmation: string;
    gratitudePrompt: string;
    therapistNote: string;
}

interface CheckinState {
    selectedMood: string | null;
    inputText: string;
    isAnalyzing: boolean;
    plan: CheckinPlan | null;
    checkinId: string | null;
    streakId: string | null;

    setMood: (mood: string) => void;
    setText: (text: string) => void;
    setAnalyzing: (analyzing: boolean) => void;
    setPlan: (plan: CheckinPlan | null) => void;
    setCheckinResult: (checkinId: string, streakId: string | null) => void;
    reset: () => void;
}

export const useCheckinStore = create<CheckinState>((set) => ({
    selectedMood: null,
    inputText: '',
    isAnalyzing: false,
    plan: null,
    checkinId: null,
    streakId: null,

    setMood: (selectedMood) => set({ selectedMood }),
    setText: (inputText) => set({ inputText }),
    setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
    setPlan: (plan) => set({ plan }),
    setCheckinResult: (checkinId, streakId) => set({ checkinId, streakId }),
    reset: () =>
        set({
            selectedMood: null,
            inputText: '',
            isAnalyzing: false,
            plan: null,
            checkinId: null,
            streakId: null,
        }),
}));

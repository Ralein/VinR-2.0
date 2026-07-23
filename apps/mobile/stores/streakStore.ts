/**
 * Zustand Streak Store
 */

import { create } from 'zustand';

interface DailyCompletion {
    id: string;
    dayNumber: number;
    completedAt: string;
    reflectionNote: string | null;
    moodRating: number | null;
}

interface StreakState {
    activeStreakId: string | null;
    currentStreak: number;
    longestStreak: number;
    globalStreak: number;
    totalDaysCompleted: number;
    startDate: string | null;
    dailyCompletions: DailyCompletion[];
    isCompletedToday: boolean;
    milestone: string | null;
    isWinner: boolean;

    setActiveStreak: (data: {
        id: string;
        currentStreak: number;
        longestStreak: number;
        globalStreak: number;
        totalDaysCompleted: number;
        startDate: string;
        dailyCompletions: DailyCompletion[];
        isCompletedToday: boolean;
    }) => void;
    markDayComplete: (completion: DailyCompletion) => void;
    setMilestone: (milestone: string | null) => void;
    reset: () => void;
    setStreak: (newStreak: number) => void;
}

const JOURNEY_GOAL_DAYS = 21;

export const useStreakStore = create<StreakState>((set) => ({
    activeStreakId: null,
    currentStreak: 0,
    longestStreak: 0,
    globalStreak: 0,
    totalDaysCompleted: 0,
    startDate: null,
    dailyCompletions: [],
    isCompletedToday: false,
    milestone: null,
    isWinner: false,

    setActiveStreak: (data) => set({
        activeStreakId: data.id,
        currentStreak: data.currentStreak,
        longestStreak: data.longestStreak,
        globalStreak: data.globalStreak || 0,
        totalDaysCompleted: data.totalDaysCompleted,
        startDate: data.startDate,
        dailyCompletions: data.dailyCompletions,
        isCompletedToday: data.isCompletedToday,
        isWinner: data.totalDaysCompleted >= JOURNEY_GOAL_DAYS,
    }),

    markDayComplete: (completion) =>
        set((state) => {
            const newTotalCompleted = state.totalDaysCompleted + 1;
            const newCurrentStreak = state.currentStreak + 1;
            return {
                dailyCompletions: [...state.dailyCompletions, completion],
                currentStreak: newCurrentStreak,
                globalStreak: Math.max(state.globalStreak, newCurrentStreak),
                totalDaysCompleted: newTotalCompleted,
                isCompletedToday: true,
                isWinner: newTotalCompleted >= JOURNEY_GOAL_DAYS,
            };
        }),

    setMilestone: (milestone) => set({ milestone }),

    reset: () =>
        set({
            activeStreakId: null,
            currentStreak: 0,
            longestStreak: 0,
            globalStreak: 0,
            totalDaysCompleted: 0,
            startDate: null,
            dailyCompletions: [],
            isCompletedToday: false,
            milestone: null,
            isWinner: false,
        }),

    setStreak: (newStreak) => set((state) => ({ 
        currentStreak: newStreak,
        globalStreak: Math.max(state.globalStreak, newStreak)
    })),
}));

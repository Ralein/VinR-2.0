/**
 * useRituals — React Query hook for morning/evening ritual content
 */

import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export interface BreathingSuggestion {
    name: string;
    technique: string;
    duration_seconds: number;
    instructions: string;
}

export interface StreakStatus {
    current_streak: number;
    total_days: number;
    message: string;
}

export interface MorningRitual {
    greeting: string;
    affirmation: string;
    streak_status: StreakStatus | null;
    daily_habit: Record<string, any> | null;
    gratitude_prompt: string;
    breathing_suggestion: BreathingSuggestion;
}

export interface EveningWindDown {
    greeting: string;
    has_checked_in: boolean;
    habit_completed: boolean;
    current_streak: number;
    gratitude_prompt: string;
    sleep_suggestion: { genre: string; message: string };
    breathing_suggestion: BreathingSuggestion;
}

export function useMorningRitual() {
    return useQuery<MorningRitual>({
        queryKey: ['rituals', 'morning'],
        queryFn: async () => {
            const { data } = await api.get('/rituals/morning');
            return data;
        },
        staleTime: 30 * 60 * 1000, // 30 minutes
    });
}
export function useAfternoonRitual() {
    return useQuery<MorningRitual>({
        queryKey: ['rituals', 'afternoon'],
        queryFn: async () => {
            const { data } = await api.get('/rituals/afternoon');
            return data;
        },
        staleTime: 30 * 60 * 1000,
    });
}

export function useEveningWindDown() {
    return useQuery<EveningWindDown>({
        queryKey: ['rituals', 'evening'],
        queryFn: async () => {
            const { data } = await api.get('/rituals/evening');
            return data;
        },
        staleTime: 30 * 60 * 1000,
    });
}


/**
 * Check if the current time is in the morning ritual window (6–10 AM).
 */
export function isMorningWindow(): boolean {
    const h = new Date().getHours();
    return h >= 6 && h < 10;
}

/**
 * Check if the current time is in the evening wind-down window (8–11 PM).
 */
export function isEveningWindow(): boolean {
    const h = new Date().getHours();
    return h >= 17 || h < 5;
}

/**
 * Check if the current time is in the afternoon window (12–5 PM).
 */
export function isAfternoonWindow(): boolean {
    const h = new Date().getHours();
    return h >= 12 && h < 17;
}

/**
 * useStreak — React Query hooks for streak tracking
 *
 * - useActiveStreak: fetches GET /streaks/active
 * - useCompleteDay: mutation for POST /streaks/{id}/complete-day
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useStreakStore } from '../stores/streakStore';

interface DailyCompletion {
    id: string;
    day_number: number;
    completed_at: string;
    habit_completed: boolean | null;
    reflection_note: string | null;
    mood_rating: number | null;
}

interface StreakResponse {
    id: string;
    user_id: string;
    plan_id: string;
    current_streak: number;
    longest_streak: number;
    global_streak: number;
    total_days_completed: number;
    start_date: string;
    last_completed_date: string | null;
    is_completed_today: boolean;
    daily_completions: DailyCompletion[];
    created_at: string;
}

interface CompleteDayPayload {
    streak_id: string;
    reflection_note?: string | null;
    mood_rating?: number | null;
}

interface CompleteDayResponse {
    success: boolean;
    day_number: number;
    current_streak: number;
    milestone: string | null;
}

export function useActiveStreak() {
    const setActiveStreak = useStreakStore((s) => s.setActiveStreak);

    return useQuery({
        queryKey: ['streak', 'active'],
        queryFn: async (): Promise<StreakResponse | null> => {
            const { data } = await api.get<StreakResponse | null>('/streaks/active');
            if (data) {
                setActiveStreak({
                    id: data.id,
                    currentStreak: data.current_streak,
                    longestStreak: data.longest_streak,
                    globalStreak: data.global_streak || 0,
                    totalDaysCompleted: data.total_days_completed,
                    startDate: data.start_date,
                    dailyCompletions: data.daily_completions.map((c) => ({
                        id: c.id,
                        dayNumber: c.day_number,
                        completedAt: c.completed_at,
                        reflectionNote: c.reflection_note,
                        moodRating: c.mood_rating,
                    })),
                    isCompletedToday: data.is_completed_today,
                });
            }
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 min
    });
}

export function useCompleteDay() {
    const queryClient = useQueryClient();
    const markDayComplete = useStreakStore((s) => s.markDayComplete);
    const setMilestone = useStreakStore((s) => s.setMilestone);

    return useMutation({
        mutationFn: async (payload: CompleteDayPayload): Promise<CompleteDayResponse> => {
            const { data } = await api.post<CompleteDayResponse>(
                `/streaks/${payload.streak_id}/complete-day`,
                {
                    reflection_note: payload.reflection_note || null,
                    mood_rating: payload.mood_rating || null,
                }
            );
            return data;
        },
        onSuccess: (data) => {
            markDayComplete({
                id: `day-${data.day_number}`,
                dayNumber: data.day_number,
                completedAt: new Date().toISOString(),
                reflectionNote: null,
                moodRating: null,
            });
            if (data.milestone) {
                setMilestone(data.milestone);
            }
            queryClient.invalidateQueries({ queryKey: ['streak', 'active'] });
        },
    });
}

/**
 * Convenience hook that combines the query and the store.
 * Returns exactly what StreakHero needs.
 */
export function useStreak() {
    const { isLoading } = useActiveStreak();
    const { globalStreak, isCompletedToday } = useStreakStore();

    // Simple weekly approximation: map recent completion days to week index 0-6 (Mon-Sun)
    const weeklyDays = [false, false, false, false, false, false, false];
    if (isCompletedToday) {
        const todayIdx = (new Date().getDay() + 6) % 7; // 0 for Mon, 6 for Sun
        weeklyDays[todayIdx] = true;
    }

    return {
        streak: globalStreak,
        todayDone: isCompletedToday,
        weeklyDays,
        isLoading,
    };
}

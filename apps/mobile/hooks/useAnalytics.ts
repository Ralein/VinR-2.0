/**
 * useAnalytics — React Query hook for Mood Analytics Dashboard
 */

import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export interface AnalyticsSummary {
    total_checkins: number;
    total_days_completed: number;
    best_streak: number;
    journal_entries: number;
    meditations: number;
}

export interface MoodTrendPoint {
    date: string;
    mood_score: number;
    is_streak_day: boolean;
}

export interface EmotionSlice {
    emotion: string;
    count: number;
    percentage: number;
}

export interface StreakCorrelation {
    avg_mood_streak_days: number;
    avg_mood_off_days: number;
    improvement_percent: number;
}

export interface InsightCard {
    emoji: string;
    text: string;
}

export interface AnalyticsTrends {
    mood_trends: MoodTrendPoint[];
    emotion_distribution: EmotionSlice[];
    streak_correlation: StreakCorrelation;
    insights: InsightCard[];
}

export function useAnalyticsSummary() {
    return useQuery<AnalyticsSummary>({
        queryKey: ['analytics', 'summary'],
        queryFn: async () => {
            const { data } = await api.get('/analytics/summary');
            return data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useAnalyticsTrends(period: string = '30d') {
    return useQuery<AnalyticsTrends>({
        queryKey: ['analytics', 'trends', period],
        queryFn: async () => {
            const { data } = await api.get(`/analytics/trends?period=${period}`);
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });
}

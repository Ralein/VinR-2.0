/**
 * useAdaptive — React Query hook for adaptive AI features
 */

import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export interface NudgeCard {
    type: 'therapist' | 'streak' | 'preference';
    emoji: string;
    title: string;
    message: string;
    action: string | null;
    priority: number;
}

export interface EscalationStatus {
    should_escalate: boolean;
    reason: string | null;
    severity: 'none' | 'mild' | 'moderate' | 'high';
}

export interface AdaptiveHomeData {
    nudge_cards: NudgeCard[];
    escalation: EscalationStatus;
    preferences: {
        preferred: string[];
        avoided: string[];
        completion_rate: number;
    };
}

export interface TherapistProvider {
    id: string;
    name: string;
    type: string;
    description: string;
    url: string;
    specialties: string[];
    accepts_insurance: boolean;
    telehealth: boolean;
    emoji: string;
}

export interface WhyTherapy {
    title: string;
    text: string;
}

export interface TherapistDirectory {
    providers: TherapistProvider[];
    why_therapy: WhyTherapy[];
}

export function useAdaptiveHome() {
    return useQuery<AdaptiveHomeData>({
        queryKey: ['adaptive', 'home'],
        queryFn: async () => {
            // Adaptive home data comes from the analytics endpoint for now
            // In the future, this could have its own dedicated endpoint
            const { data } = await api.get('/analytics/summary');
            // Generate nudge cards client-side from summary data
            const nudge_cards: NudgeCard[] = [];
            if (data.best_streak > 0) {
                nudge_cards.push({
                    type: 'streak',
                    emoji: '🔥',
                    title: 'VinR knows you better now',
                    message: `Your best streak is ${data.best_streak} days. Keep building those habits!`,
                    action: 'journey',
                    priority: 2,
                });
            }
            return {
                nudge_cards,
                escalation: { should_escalate: false, reason: null, severity: 'none' as const },
                preferences: { preferred: [], avoided: [], completion_rate: 0 },
            };
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

export function useTherapistDirectory(specialty?: string) {
    return useQuery<TherapistDirectory>({
        queryKey: ['therapist', 'directory', specialty],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (specialty) params.append('specialty', specialty);
            const { data } = await api.get(`/therapist/directory?${params}`);
            return data;
        },
        staleTime: 30 * 60 * 1000, // 30 minutes
    });
}

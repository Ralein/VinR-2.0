/**
 * useBreathing — Session tracking hook for breathing/meditation
 *
 * Logs completed sessions via POST /media/session
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export interface BreathingTechnique {
    id: string;
    name: string;
    pattern: number[];      // [inhale, hold, exhale, hold] in seconds
    description: string;
    emoji: string;
}

export const BREATHING_TECHNIQUES: BreathingTechnique[] = [
    {
        id: 'box',
        name: 'Box Breathing',
        pattern: [4, 4, 4, 4],
        description: 'Equal inhale, hold, exhale, hold. Used by Navy SEALs for calm under pressure.',
        emoji: '⬜',
    },
    {
        id: '478',
        name: '4-7-8 Sleep Breath',
        pattern: [4, 7, 8, 0],
        description: 'Inhale 4s, hold 7s, exhale 8s. Promotes melatonin release and sleep.',
        emoji: '🌙',
    },
    {
        id: 'coherent',
        name: 'Coherent Breathing',
        pattern: [5, 0, 5, 0],
        description: 'Equal in and out at 6 breaths/min. Balances your nervous system.',
        emoji: '💫',
    },
    {
        id: 'physiological_sigh',
        name: 'Physiological Sigh',
        pattern: [2, 0.5, 6, 0],
        description: 'Double inhale through nose, long exhale. Fastest way to calm down.',
        emoji: '🌊',
    },
];

export const DURATIONS = [
    { label: '2 min', seconds: 120 },
    { label: '5 min', seconds: 300 },
    { label: '10 min', seconds: 600 },
];

export function useLogSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (session: {
            session_type: string;
            duration_seconds: number;
            technique?: string;
        }) => {
            const { data } = await api.post('/media/session', session);
            return data;
        },
        onSuccess: () => {
            // Invalidate analytics to reflect new session
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
        },
    });
}

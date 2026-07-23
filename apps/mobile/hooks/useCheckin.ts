/**
 * useCheckin — React Query mutation for POST /api/v1/checkin
 *
 * Sends mood + text to backend, returns AI analysis plan.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useCheckinStore } from '../stores/checkinStore';

interface CheckinPayload {
    mood_tag: string;
    text: string | null;
}

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

interface CheckinResponse {
    checkin_id: string;
    plan: {
        isEmergency: boolean;
        primaryEmotion: string;
        emotionSummary: string;
        supportMessage: string;
        immediateRelief: ReliefItem[];
        dailyHabits: ReliefItem[];
        affirmation: string;
        gratitudePrompt: string;
        therapistNote: string;
    };
    streak_id: string | null;
    current_streak: number;
    created_at: string;
}

export function useCheckin() {
    const setPlan = useCheckinStore((s) => s.setPlan);
    const setCheckinResult = useCheckinStore((s) => s.setCheckinResult);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CheckinPayload): Promise<CheckinResponse> => {
            const { data } = await api.post<CheckinResponse>('/checkin', payload);
            return data;
        },
        onSuccess: (data) => {
            setPlan(data.plan);
            setCheckinResult(data.checkin_id, data.streak_id);
            queryClient.invalidateQueries({ queryKey: ['streak', 'active'] });
        },
    });
}

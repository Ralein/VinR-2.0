/**
 * useNotificationSettings — TanStack Query hook for notification preferences
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

interface NotificationPreferences {
    id: string;
    user_id: string;
    daily_reminder_enabled: boolean;
    daily_reminder_time: string; // HH:MM:SS
    streak_at_risk_enabled: boolean;
    milestone_enabled: boolean;
    re_engagement_enabled: boolean;
    snooze_until: string | null;
}

interface NotificationPreferencesUpdate {
    daily_reminder_enabled?: boolean;
    daily_reminder_time?: string;
    streak_at_risk_enabled?: boolean;
    milestone_enabled?: boolean;
    re_engagement_enabled?: boolean;
}

export function useNotificationSettings() {
    const queryClient = useQueryClient();

    const query = useQuery<NotificationPreferences>({
        queryKey: ['notification-preferences'],
        queryFn: async () => {
            const { data } = await api.get('/notifications/preferences');
            return data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const updateMutation = useMutation({
        mutationFn: async (update: NotificationPreferencesUpdate) => {
            const { data } = await api.put('/notifications/preferences', update);
            return data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['notification-preferences'], data);
        },
    });

    const snoozeMutation = useMutation({
        mutationFn: async (hours: number) => {
            const { data } = await api.post('/notifications/snooze', { hours });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
        },
    });

    return {
        preferences: query.data,
        isLoading: query.isLoading,
        error: query.error,
        updatePreferences: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        snooze: snoozeMutation.mutate,
        isSnoozeing: snoozeMutation.isPending,
    };
}

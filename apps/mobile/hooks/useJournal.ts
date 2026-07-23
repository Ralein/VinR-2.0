/**
 * useJournal — TanStack Query hooks for gratitude journal
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Types matching backend schemas
export interface JournalEntry {
    id: string;
    user_id: string;
    date: string; // YYYY-MM-DD
    gratitude_items: string[];
    reflection_text: string | null;
    mood_at_entry: number | null;
    ai_response: string | null;
    created_at: string;
}

export interface JournalEntryCreate {
    gratitude_items: string[];
    reflection_text?: string | null;
    mood_at_entry?: number | null;
}

export interface JournalCalendar {
    dates: string[]; // YYYY-MM-DD[]
}

export interface WeeklyInsight {
    insight: string;
    week_start: string;
    week_end: string;
    entry_count: number;
}

/** Fetch journal entries for a given month (YYYY-MM) */
export function useJournalEntries(month: string) {
    return useQuery<JournalEntry[]>({
        queryKey: ['journal-entries', month],
        queryFn: async () => {
            const { data } = await api.get(`/journal?month=${month}`);
            return data;
        },
        staleTime: 2 * 60 * 1000,
    });
}

/** Fetch calendar dots (dates with entries) for a given month */
export function useJournalCalendar(month: string) {
    return useQuery<JournalCalendar>({
        queryKey: ['journal-calendar', month],
        queryFn: async () => {
            const { data } = await api.get(`/journal/calendar?month=${month}`);
            return data;
        },
        staleTime: 2 * 60 * 1000,
    });
}

/** Fetch AI weekly insight */
export function useWeeklyInsight() {
    return useQuery<WeeklyInsight>({
        queryKey: ['journal-weekly-insight'],
        queryFn: async () => {
            const { data } = await api.get('/journal/weekly-insight');
            return data;
        },
        staleTime: 30 * 60 * 1000, // 30 minutes
    });
}

/** Search journal entries */
export function useSearchJournal(query: string) {
    return useQuery<JournalEntry[]>({
        queryKey: ['journal-search', query],
        queryFn: async () => {
            const { data } = await api.get(`/journal/search?q=${encodeURIComponent(query)}`);
            return data;
        },
        enabled: query.length >= 2,
        staleTime: 60 * 1000,
    });
}

/** Create a new journal entry */
export function useCreateJournalEntry() {
    const queryClient = useQueryClient();

    return useMutation<JournalEntry, Error, JournalEntryCreate>({
        mutationFn: async (entry) => {
            const { data } = await api.post('/journal', entry);
            return data;
        },
        onSuccess: () => {
            // Invalidate all journal queries so they refetch
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
            queryClient.invalidateQueries({ queryKey: ['journal-calendar'] });
            queryClient.invalidateQueries({ queryKey: ['journal-weekly-insight'] });
        },
    });
}

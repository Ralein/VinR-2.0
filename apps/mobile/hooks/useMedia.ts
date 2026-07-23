/**
 * useMedia — TanStack Query hooks for media API + audio playback
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { useMediaStore, type Track } from '../stores/mediaStore';

// --- Types ---

export interface AudioTrack {
    id: string;
    title: string;
    artist: string | null;
    category: string;
    duration_label: string;
    duration_seconds: number;
    thumbnail_emoji: string;
    url: string | null;
}

export interface AudioLibraryResponse {
    category: string;
    tracks: AudioTrack[];
}

export interface YouTubeResult {
    video_id: string;
    title: string;
    channel: string;
    thumbnail_url: string;
    duration: string | null;
}

export interface YouTubeSearchResponse {
    genre: string;
    content_type: string;
    results: YouTubeResult[];
}

// --- Hooks ---

/** Fetch audio tracks by category */
export function useAudioLibrary(category: string) {
    return useQuery<AudioLibraryResponse>({
        queryKey: ['audio-library', category],
        queryFn: async () => {
            const { data } = await api.get(`/media/audio?category=${category}`);
            return data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

/** Search YouTube by genre and type */
export function useYouTubeSearch(genre: string, type: 'music' | 'motivation' = 'music') {
    return useQuery<YouTubeSearchResponse>({
        queryKey: ['youtube-search', genre, type],
        queryFn: async () => {
            const { data } = await api.get(
                `/media/youtube?genre=${encodeURIComponent(genre)}&type=${type}`
            );
            return data;
        },
        enabled: !!genre,
        staleTime: 30 * 60 * 1000, // 30 minutes
    });
}

/** Log a media listening session */
export function useLogMediaSession() {
    return useMutation({
        mutationFn: async (session: {
            media_type: string;
            media_id: string;
            duration_seconds?: number;
            completed?: boolean;
        }) => {
            const { data } = await api.post('/media/session', session);
            return data;
        },
    });
}

/** Helper: play a track from the audio library */
export function usePlayTrack() {
    const setTrack = useMediaStore((s) => s.setTrack);

    return (track: AudioTrack) => {
        const storeTrack: Track = {
            id: track.id,
            title: track.title,
            artist: track.artist || undefined,
            category: track.category,
            duration_label: track.duration_label,
            duration_seconds: track.duration_seconds,
            thumbnail_emoji: track.thumbnail_emoji,
            url: track.url,
        };
        setTrack(storeTrack);
    };
}

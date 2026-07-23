/**
 * mediaStore — Zustand store for audio playback state
 */

import { create } from 'zustand';

export interface Track {
    id: string;
    title: string;
    artist?: string;
    category: string;
    duration_label: string;
    duration_seconds: number;
    thumbnail_emoji: string;
    url?: string | null;
}

interface MediaState {
    // Current track
    currentTrack: Track | null;
    isPlaying: boolean;
    positionMs: number;
    durationMs: number;

    // Sleep timer
    sleepTimerMinutes: number | null; // null = off, 30/45/60
    sleepTimerEndTime: number | null; // timestamp

    // Mini player visibility
    showMiniPlayer: boolean;

    // Actions
    setTrack: (track: Track) => void;
    play: () => void;
    pause: () => void;
    setPosition: (ms: number) => void;
    setDuration: (ms: number) => void;
    stop: () => void;
    setSleepTimer: (minutes: number | null) => void;
}

export const useMediaStore = create<MediaState>((set) => ({
    currentTrack: null,
    isPlaying: false,
    positionMs: 0,
    durationMs: 0,
    sleepTimerMinutes: null,
    sleepTimerEndTime: null,
    showMiniPlayer: false,

    setTrack: (track) =>
        set({
            currentTrack: track,
            isPlaying: true,
            positionMs: 0,
            durationMs: track.duration_seconds * 1000,
            showMiniPlayer: true,
        }),

    play: () => set({ isPlaying: true }),
    pause: () => set({ isPlaying: false }),
    setPosition: (ms) => set({ positionMs: ms }),
    setDuration: (ms) => set({ durationMs: ms }),

    stop: () =>
        set({
            currentTrack: null,
            isPlaying: false,
            positionMs: 0,
            durationMs: 0,
            showMiniPlayer: false,
            sleepTimerMinutes: null,
            sleepTimerEndTime: null,
        }),

    setSleepTimer: (minutes) =>
        set({
            sleepTimerMinutes: minutes,
            sleepTimerEndTime: minutes ? Date.now() + minutes * 60 * 1000 : null,
        }),
}));

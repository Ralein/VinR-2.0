/**
 * App configuration constants
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getDevApiUrl = () => {
    const debuggerHost = Constants.expoConfig?.hostUri;
    
    if (debuggerHost) {
        const localhost = debuggerHost.split(':')[0];
        return `http://${localhost}:8000/api/v1/`;
    }

    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:8000/api/v1/';
    }
    return 'http://127.0.0.1:8000/api/v1/';
};

export const config = {
    // API
    API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || (__DEV__
        ? getDevApiUrl()
        : 'https://api.vinr.app/api/v1/'),

    // Limits
    CHECKIN_TEXT_MAX_LENGTH: 500,
    MAX_FREE_CHECKINS_PER_MONTH: 3,
    FREE_STREAK_DAYS: 7,
    PRO_STREAK_DAYS: 21,

    // Pricing
    PRO_MONTHLY_PRICE: 12.99,
    PRO_YEARLY_PRICE: 79.99,

    // Streak
    STREAK_GRACE_PERIOD_HOURS: 2,
    MILESTONES: [5, 10, 15, 21] as const,

    // Notifications
    DEFAULT_REMINDER_HOUR: 8,
    DEFAULT_REMINDER_MINUTE: 0,

    // Mood tags
    MOOD_TAGS: [
        { emoji: '😰', label: 'Anxious', value: 'anxious' },
        { emoji: '😢', label: 'Sad', value: 'sad' },
        { emoji: '😤', label: 'Angry', value: 'angry' },
        { emoji: '😔', label: 'Lonely', value: 'lonely' },
        { emoji: '😩', label: 'Stressed', value: 'stressed' },
        { emoji: '😶', label: 'Numb', value: 'numb' },
        { emoji: '😕', label: 'Lost', value: 'lost' },
        { emoji: '🤕', label: 'Overwhelmed', value: 'overwhelmed' },
    ] as const,

    // Music genres
    MUSIC_GENRES: [
        'Pop', 'R&B', 'Hip-Hop', 'Classical',
        'Indie', 'Electronic', 'Country', 'K-Pop',
        'Jazz', 'Rock',
    ] as const,

    // Onboarding placeholders
    CHECKIN_PLACEHOLDERS: [
        "I'm feeling overwhelmed at work...",
        "I can't stop worrying about everything...",
        "Today was really tough...",
        "I just need someone to listen...",
        "I don't know why I feel this way...",
    ] as const,
} as const;

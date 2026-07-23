/**
 * useEvents — TanStack Query hooks for event search, bookmarks, and user location.
 *
 * Integrates expo-location for real GPS and supports keyword search.
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import api from '../services/api';

// --- Types ---

export interface EventResult {
    event_id: string;
    name: string;
    description: string | null;
    venue: string | null;
    address: string | null;
    date: string | null;
    start_time: string | null;
    category: string | null;
    distance_miles: number | null;
    url: string | null;
    is_virtual: boolean;
    image_url: string | null;

    // ── Enriched fields ──
    latitude: number | null;
    longitude: number | null;
    google_maps_url: string | null;
    source: 'google_places' | 'eventbrite' | null;
    photo_url: string | null;
    rating: number | null;
    rating_count: number | null;
    opening_hours: string[] | null;
    place_id: string | null;
}

export interface EventSearchResponse {
    events: EventResult[];
    total: number;
    cached: boolean;
    location_name: string | null;
}

export interface EventBookmark {
    id: string;
    user_id: string;
    event_id: string;
    event_data: Record<string, any>;
    created_at: string;
}

// --- Location Hook ---

export interface UserLocation {
    latitude: number;
    longitude: number;
    city: string | null;
}

/**
 * useUserLocation — requests GPS permission and returns current coordinates.
 * Falls back to a default location if permission denied.
 */
export function useUserLocation() {
    const [location, setLocation] = useState<UserLocation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setError('Location permission denied');
                    // Fallback: Bangalore, India  
                    setLocation({ latitude: 12.9716, longitude: 77.5946, city: 'Bangalore' });
                    setLoading(false);
                    return;
                }

                const loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });

                if (cancelled) return;

                // Reverse geocode for city name
                let city: string | null = null;
                try {
                    const [geo] = await Location.reverseGeocodeAsync({
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude,
                    });
                    if (geo) {
                        city = geo.city || geo.subregion || geo.region || null;
                    }
                } catch {
                    // Reverse geocode can fail, that's OK
                }

                setLocation({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                    city,
                });
            } catch (e: any) {
                if (!cancelled) {
                    setError(e.message || 'Failed to get location');
                    // Fallback
                    setLocation({ latitude: 12.9716, longitude: 77.5946, city: 'Bangalore' });
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, []);

    const refresh = async () => {
        setLoading(true);
        try {
            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            let city: string | null = null;
            try {
                const [geo] = await Location.reverseGeocodeAsync({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                });
                if (geo) city = geo.city || geo.subregion || geo.region || null;
            } catch {}
            setLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                city,
            });
        } catch {
            // keep existing location
        } finally {
            setLoading(false);
        }
    };

    return { location, loading, error, refresh };
}

// --- Event Search Hooks ---

/** Search for nearby wellness events with optional keyword */
export function useEventSearch(
    lat: number | null,
    lon: number | null,
    keyword?: string,
    emotion?: string,
) {
    return useQuery<EventSearchResponse>({
        queryKey: ['events-search', lat, lon, keyword, emotion],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (lat !== null) params.set('lat', lat.toString());
            if (lon !== null) params.set('lon', lon.toString());
            if (keyword) params.set('keyword', keyword);
            if (emotion) params.set('emotion', emotion);
            const { data } = await api.get(`/events?${params.toString()}`);
            return data;
        },
        enabled: lat !== null && lon !== null,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/** Get user's bookmarked events */
export function useEventBookmarks() {
    return useQuery<EventBookmark[]>({
        queryKey: ['event-bookmarks'],
        queryFn: async () => {
            const { data } = await api.get('/events/bookmarks');
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });
}

/** Bookmark an event */
export function useBookmarkEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (event: EventResult) => {
            const { data } = await api.post('/events/bookmark', {
                event_id: event.event_id,
                event_data: event,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event-bookmarks'] });
        },
    });
}

/** Remove a bookmark */
export function useRemoveBookmark() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (eventId: string) => {
            await api.delete(`/events/bookmark/${eventId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event-bookmarks'] });
        },
    });
}

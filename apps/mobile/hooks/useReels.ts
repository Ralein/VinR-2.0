import { useState, useCallback } from 'react';
import api from '../services/api';

export interface Reel {
  video_id: string;
  title: string;
  channel: string;
  thumbnail_url: string;
}

export const useReels = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReels = useCallback(async (primaryReason: string = 'Stress Relief') => {
    setLoading(true);
    setError(null);
    try {
      // Re-using the /media/glint endpoint for curated YouTube shorts/reels based on wellness reason
      const response = await api.get('/media/glint', {
        params: { primary_reason: primaryReason },
      });
      if (response.data && response.data.glints) {
        setReels(response.data.glints);
      }
    } catch (err: any) {
      console.error('Failed to fetch reels:', err);
      setError('Failed to load reels.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reels,
    loading,
    error,
    fetchReels,
  };
};

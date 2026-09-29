import { useState, useEffect, useCallback } from 'react';
import { StudyService } from '../../../../../services/study.service';

export const useProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await StudyService.getUserDashboard();
      setProfile(data?.data || data);
    } catch (e: any) {
      console.error('Failed to fetch study profile', e);
      setError(e.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, isLoading, error, refresh: fetchProfile };
};

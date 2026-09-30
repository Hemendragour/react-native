import { useState, useEffect, useCallback } from 'react';
import { ConnectionService } from '../../services/connection.service';
import AuthService from '../../services/auth.service';

export interface NetworkUser {
  id: string;
  name: string;
  title: string;
  location: string;
  mutuals: string;
  image: string;
}

export const useNetworkUsers = (userId: string | undefined) => {
  const [users, setUsers] = useState<NetworkUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = await ConnectionService.getSuggestions(userId);

      // Safe extraction of array from various backend response shapes
      let suggestions = data?.data?.data || data?.data?.suggestions || data?.data?.users || data?.data || data;
      if (!Array.isArray(suggestions)) {
        suggestions = Array.isArray(data) ? data : [];
      }
      
      const mappedUsers: NetworkUser[] = await Promise.all(
        suggestions.map(async (s: any, idx: number) => {
          try {
            let userIdStr = typeof s === 'string' ? s : (s?.userId || s?._id || s?.id || '');
            let profileData: any = typeof s === 'object' && s !== null ? s : {};

            if (userIdStr && typeof userIdStr === 'string' && userIdStr.length > 5) {
              try {
                const profileRes = await AuthService.getUserProfileById(userIdStr);
                const rawData = profileRes?.data?.data || profileRes?.data || profileRes;
                
                const p = rawData?.profile || {};
                const account = rawData?.user || rawData?.data || rawData || {};
                profileData = { ...profileData, ...account, ...p };
              } catch (e) {
                // Ignore individual profile fetch failure
              }
            }

            const id = profileData._id || profileData.id || profileData.userId || userIdStr || `user_${idx}_${Math.random()}`;
            const firstName = profileData.firstName || '';
            const lastName = profileData.lastName || '';
            const nameFallback = profileData.name || profileData.username || 'Suggested Member';
            const fullName = `${firstName} ${lastName}`.trim() || nameFallback;
            const title = profileData.headline || profileData.title || 'Professional';
            const location = profileData.location || 'Global';
            
            let rawImage = profileData.profileImage || profileData.avatar || profileData.profilePhotoId;
            let finalImage = rawImage;
            if (!rawImage || typeof rawImage !== 'string' || (!rawImage.startsWith('http') && rawImage.length > 20)) {
              finalImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=e0d8cf&color=4a3728&size=128`;
            }

            let mutualCount = 0;
            if (userIdStr && userIdStr !== userId) {
              try {
                const countRes = await ConnectionService.getMutualCount(userId, userIdStr);
                const countData = countRes?.data?.data || countRes?.data || countRes;
                mutualCount = typeof countData?.count === 'number' ? countData.count : (typeof countData === 'number' ? countData : 0);
              } catch (e) {
                console.log('Failed to fetch mutual count', e);
              }
            }

            return {
              id,
              userId: userIdStr || id,
              name: fullName,
              title,
              location,
              mutuals: `${mutualCount} mutual connections`,
              image: finalImage,
            };
          } catch (itemErr) {
            return {
              id: `fallback_${idx}`,
              userId: `fallback_${idx}`,
              name: 'Suggested Member',
              title: 'Professional',
              location: 'Global',
              mutuals: '0 mutual connections',
              image: `https://ui-avatars.com/api/?name=User&background=e0d8cf&color=4a3728&size=128`,
            };
          }
        })
      );
      
      setUsers(mappedUsers);
    } catch (err: any) {
      console.error('Failed to fetch network user suggestions:', err);
      setError(err.message || 'Failed to fetch suggestions');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const connectUser = async (targetUserId: string) => {
    try {
      await ConnectionService.sendRequest(targetUserId);
      setUsers(prev => prev.filter(u => u.id !== targetUserId && (u as any).userId !== targetUserId));
      return true;
    } catch (err) {
      console.error('Failed to connect:', err);
      return false;
    }
  };

  return { users, isLoading, error, refetch: fetchUsers, connectUser };
};

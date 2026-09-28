import { useState, useEffect, useCallback } from 'react';
import { ConnectionService } from '../../services/connection.service';
import AuthService from '../../services/auth.service';

export const useConnectionRequests = (userId?: string) => {
  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const inReqRaw = await ConnectionService.getIncomingRequests(userId);
      const outReqRaw = await ConnectionService.getOutgoingRequests(userId);
      
      // NEW CODE: Added robust extraction for data array.
      let inData = inReqRaw?.data?.data;
      if (!Array.isArray(inData)) inData = inReqRaw?.data;
      if (!Array.isArray(inData)) inData = inReqRaw;
      if (!Array.isArray(inData)) inData = [];

      let outData = outReqRaw?.data?.data;
      if (!Array.isArray(outData)) outData = outReqRaw?.data;
      if (!Array.isArray(outData)) outData = outReqRaw;
      if (!Array.isArray(outData)) outData = [];

      const mapRequestsWithProfiles = async (requests: any[], userField: string) => {
        const mapped = [];
        if (!Array.isArray(requests)) return [];
        for (const req of requests) {
          if (!req) continue;
          try {
            // 1. Extract the string userId safely
            let userIdStr = '';
            if (typeof req[userField] === 'string') {
              userIdStr = req[userField];
            } else if (typeof req[userField] === 'object' && req[userField] !== null) {
              userIdStr = req[userField].userId || req[userField]._id || req[userField].id || '';
            }

            // 2. Fetch or parse user profile
            let u: any = typeof req[userField] === 'object' && req[userField] !== null ? req[userField] : {};
            if (userIdStr && typeof userIdStr === 'string' && userIdStr.length > 5) {
               try {
                 const profileRes = await AuthService.getUserProfileById(userIdStr);
                 // Handle the nested data structure
                 const rawData = profileRes?.data?.data || profileRes?.data || profileRes;
                 const p = rawData?.profile || {};
                 const account = rawData?.user || rawData?.data || rawData || {};
                 u = { ...u, ...account, ...p };
               } catch(e) {
                 // Ignore profile fetch error for item
               }
            }

            // 3. Extract name
            const firstName = u.firstName || u.user?.firstName || '';
            const lastName = u.lastName || u.user?.lastName || '';
            const nameFallback = u.name || u.user?.name || u.username || u.user?.username || 'Member';
            const fullName = `${firstName} ${lastName}`.trim() || nameFallback;

            // 4. Extract headline
            const headline = u.headline || u.user?.headline || u.title || u.user?.title || 'Professional';

            // 5. Extract avatar — use same approach as useNetworkUsers
            let rawImage = u.profileImage || u.user?.profileImage || u.avatar || u.user?.avatar || u.profilePhotoId || u.user?.profilePhotoId;
            let avatar = rawImage;

            if (!rawImage || typeof rawImage !== 'string' || (!rawImage.startsWith('http') && rawImage.length > 20)) {
              avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=e0d8cf&color=4a3728&size=128`;
            }

            // 6. Fallback for unique request ID
            const fallbackId = req.requestId || req._id || req.id || `req_${Date.now()}_${Math.random()}`;

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

            mapped.push({
              id: fallbackId,
              userId: userIdStr || fallbackId,
              name: fullName,
              title: headline,
              mutuals: `${mutualCount} mutual connections`,
              image: avatar
            });
          } catch (itemError) {
            // Ignore single item error
          }
        }
        return mapped;
      };

      const mappedIn = await mapRequestsWithProfiles(inData, 'fromUserId');
      const mappedOut = await mapRequestsWithProfiles(outData, 'toUserId');

      setIncoming(mappedIn); 
      setOutgoing(mappedOut);
    } catch (error) {
      console.error("Failed to fetch requests", error);
      setIncoming([]);
      setOutgoing([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const accept = async (requestId: string) => {
    try {
      // Optimistically remove from UI
      setIncoming(prev => prev.filter(req => req._id !== requestId && req.id !== requestId));
      await ConnectionService.acceptRequest(requestId);
    } catch (error) {
      console.error("Accept failed", error);
      fetchRequests(); // Revert on failure
    }
  };

  const decline = async (requestId: string) => {
    try {
      setIncoming(prev => prev.filter(req => req._id !== requestId && req.id !== requestId));
      await ConnectionService.declineRequest(requestId);
    } catch (error) {
      console.error("Decline failed", error);
      fetchRequests();
    }
  };

  const withdraw = async (requestId: string) => {
    try {
      const targetReq = outgoing.find(req => req._id === requestId || req.id === requestId);
      if (targetReq && targetReq.userId) {
        ConnectionService.removePending(targetReq.userId);
        ConnectionService.addWithdrawn(targetReq.userId);
      }
      setOutgoing(prev => prev.filter(req => req._id !== requestId && req.id !== requestId));
      await ConnectionService.cancelRequest(requestId);
    } catch (error) {
      console.error("Withdraw failed", error);
      fetchRequests();
    }
  };

  return { incoming, outgoing, isLoading, accept, decline, withdraw, refresh: fetchRequests };
};

import AuthService, { api } from './auth.service';

// === OLD CODE (Original connection service with only request/connection management) ===
// export class ConnectionService {
//   private static pendingUserIds = new Set<string>();
//   private static connectedUserIds = new Set<string>();
//
//   static isPending(userId: string) { return this.pendingUserIds.has(userId); }
//   static addPending(userId: string) { this.pendingUserIds.add(userId); }
//   static removePending(userId: string) { this.pendingUserIds.delete(userId); }
//   static isConnected(userId: string) { return this.connectedUserIds.has(userId); }
//   static addConnected(userId: string) { this.connectedUserIds.add(userId); }
//   static removeConnected(userId: string) { this.connectedUserIds.delete(userId); }
//
//   static async initCache(userId: string) { ... }
//   static async sendRequest(toUserId: string, message?: string) { ... }
//   static async acceptRequest(requestId: string) { ... }
//   static async declineRequest(requestId: string) { ... }
//   static async cancelRequest(requestId: string) { ... }
//   static async getIncomingRequests(userId: string) { ... }
//   static async getOutgoingRequests(userId: string) { ... }
//   static async removeConnection(connectionId: string) { ... }
//   static async updateConnectionStatus(connectionId: string, status: string) { ... }
//   static async getSuggestions(userId: string) { ... }
// }

// === NEW CODE (Extended connection service with follow, company follow, stats) ===
export class ConnectionService {
  // ─── IN-MEMORY CACHE FOR UI PERSISTENCE ───
  private static pendingUserIds = new Set<string>();
  private static connectedUserIds = new Set<string>();
  private static followingUserIds = new Set<string>();
  private static withdrawnUserIds = new Set<string>();
  private static listeners = new Set<() => void>();

  static subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notify() {
    this.listeners.forEach(l => {
      try { l(); } catch (e) { console.error(e); }
    });
  }

  static isPending(userId: string) {
    return this.pendingUserIds.has(userId);
  }

  static addPending(userId: string) {
    this.pendingUserIds.add(userId);
    this.withdrawnUserIds.delete(userId);
    this.notify();
  }

  static removePending(userId: string) {
    this.pendingUserIds.delete(userId);
    this.notify();
  }

  static isWithdrawn(userId: string) {
    return this.withdrawnUserIds.has(userId);
  }

  static addWithdrawn(userId: string) {
    this.withdrawnUserIds.add(userId);
    this.pendingUserIds.delete(userId);
    this.notify();
  }

  static isConnected(userId: string) {
    return this.connectedUserIds.has(userId);
  }

  static addConnected(userId: string) {
    this.connectedUserIds.add(userId);
    this.notify();
  }

  static removeConnected(userId: string) {
    this.connectedUserIds.delete(userId);
    this.notify();
  }

  static isFollowing(userId: string) {
    return this.followingUserIds.has(userId);
  }

  static addFollowing(userId: string) {
    this.followingUserIds.add(userId);
    this.notify();
  }

  static removeFollowing(userId: string) {
    this.followingUserIds.delete(userId);
    this.notify();
  }

  static async initCache(userId: string) {
    try {
      const [outReq, connectionsReq, followCounts] = await Promise.all([
        this.getOutgoingRequests(userId).catch(() => null),
        api.get(`/api/v1/connections/connection/user/${userId}`).catch(() => null),
        this.getFollowCounts(userId).catch(() => null),
      ]);

      const rawOut = outReq?.data?.data || outReq?.data || outReq || [];
      const outList = Array.isArray(rawOut) ? rawOut : (Array.isArray(rawOut?.data) ? rawOut.data : []);
      outList.forEach((req: any) => {
        const targetId = req.toUserId?.userId || req.toUserId?._id || req.toUserId?.id || req.toUserId || req.userId;
        if (typeof targetId === 'string') this.addPending(targetId);
      });

      const connectionsData = connectionsReq?.data?.data || connectionsReq?.data || [];
      const list = Array.isArray(connectionsData) ? connectionsData : connectionsData.data || [];
      list.forEach((conn: any) => {
        const fromId = conn.fromUserId?.userId || conn.fromUserId?._id || conn.fromUserId?.id || conn.fromUserId;
        const toId = conn.toUserId?.userId || conn.toUserId?._id || conn.toUserId?.id || conn.toUserId;
        const otherId = fromId === userId ? toId : fromId;
        if (typeof otherId === 'string') this.addConnected(otherId);
      });

      if (followCounts) {
        const fcData = followCounts?.data || followCounts;
        if (typeof fcData.followersCount === 'number' || typeof fcData.followingCount === 'number') {
          // Cache populated for stats
        }
      }
    } catch (e) {
      console.error('Failed to init ConnectionService cache', e);
    }
  }

  // ─── CONNECTION REQUESTS ───

  static async sendRequest(toUserId: string, message?: string) {
    return this.sendConnectionRequest({ toUserId, message });
  }

  static async sendConnectionRequest(payload: {
    toUserId: string;
    message?: string;
    priority?: 'low' | 'medium' | 'high';
    templateId?: string;
  }) {
    try {
      const requestData = {
        toUserId: payload.toUserId,
        message: payload.message || "Hi! I'd like to connect with you.",
        priority: payload.priority || 'medium',
        templateId: payload.templateId || 'welcome-template',
      };

      const { data } = await api.post('/api/v1/connections/requests', requestData);
      return data;
    } catch (error: any) {
      console.error('❌ [SEND_REQUEST] Failed:', error?.response?.data || error?.message);

      if (error.response?.status === 409) {
        throw new Error('Connection request already exists');
      }
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid request data');
      }

      throw new Error(error.response?.data?.message || 'Failed to send request');
    }
  }

  static async acceptRequest(requestId: string) {
    const { data } = await api.post(`/api/v1/connections/requests/${requestId}/accept`);
    return data;
  }

  static async declineRequest(requestId: string) {
    const { data } = await api.post(`/api/v1/connections/requests/${requestId}/decline`);
    return data;
  }

  static async cancelRequest(requestId: string) {
    const { data } = await api.post(`/api/v1/connections/requests/${requestId}/cancel`);
    return data;
  }

  static async getIncomingRequests(userId: string) {
    const { data } = await api.get(`/api/v1/connections/requests/user/${userId}/incoming`);
    return data;
  }

  static async getOutgoingRequests(userId: string) {
    const { data } = await api.get(`/api/v1/connections/requests/user/${userId}/outgoing`, {
      params: { status: 'pending' }
    });
    return data;
  }

  static async getRequestStats(userId: string) {
    const { data } = await api.get(`/api/v1/connections/requests/user/${userId}/stats`);
    return data;
  }

  // ─── ESTABLISHED CONNECTIONS ───

  static async getUserConnections(userId: string, page = 1, limit = 50) {
    const { data } = await api.get(`/api/v1/connections/connection/user/${userId}`, {
      params: { page, limit }
    });
    return data;
  }

  static async getConnectionCount(userId: string) {
    const { data } = await api.get(`/api/v1/connections/connection/user/${userId}/count`);
    return data;
  }

  static async removeConnection(connectionId: string) {
    const { data } = await api.delete(`/api/v1/connections/connection/${connectionId}`);
    return data;
  }

  static async updateConnectionStatus(connectionId: string, status: string) {
    const { data } = await api.patch(`/api/v1/connections/connection/${connectionId}/status`, { status });
    return data;
  }

  static async getSuggestions(userId: string) {
    const { data } = await api.get(`/api/v1/connections/connection/user/${userId}/suggestions`);
    return data;
  }

  // ─── FOLLOW SYSTEM ───

  static async followUser(targetUserId: string) {
    const { data } = await api.post('/api/v1/connections/follow', { followingId: targetUserId });
    return data;
  }

  static async unfollowUser(targetUserId: string) {
    const { data } = await api.delete(`/api/v1/connections/follow/${targetUserId}`);
    return data;
  }

  static async getFollowCounts(userId: string) {
    const { data } = await api.get(`/api/v1/connections/follow/counts/${userId}`);
    return data;
  }

  static async getFollowStatus(userId: string) {
    const { data } = await api.get(`/api/v1/connections/follow/status/${userId}`);
    return data;
  }

  static async getFollowers(userId: string, page = 1, limit = 20) {
    const { data } = await api.get(`/api/v1/connections/follow/followers/${userId}`, {
      params: { page, limit }
    });
    return data;
  }

  static async getFollowing(userId: string, page = 1, limit = 20) {
    const { data } = await api.get(`/api/v1/connections/follow/following/${userId}`, {
      params: { page, limit }
    });
    return data;
  }

  // ─── COMPANY FOLLOW ───

  static async followCompany(companyId: string) {
    const { data } = await api.post(`/api/v1/connections/follow/company/${companyId}`);
    return data;
  }

  static async unfollowCompany(companyId: string) {
    const { data } = await api.delete(`/api/v1/connections/follow/company/${companyId}`);
    return data;
  }

  static async getCompanies(userId: string, page = 1, limit = 20) {
    const { data } = await api.get(`/api/v1/connections/follow/user/${userId}/companies`, {
      params: { page, limit }
    });
    return data;
  }

  // ─── MUTUAL CONNECTIONS ───

  static async getMutualConnections(userId1: string, userId2: string, limit = 10) {
    const { data } = await api.get(`/api/v1/connections/mutual/${userId1}/${userId2}`, {
      params: { limit }
    });
    return data;
  }

  static async getMutualCount(userId1: string, userId2: string) {
    const { data } = await api.get(`/api/v1/connections/mutual/${userId1}/${userId2}/count`);
    return data;
  }

  static async getMutualSuggestions(userId: string, limit = 10) {
    const { data } = await api.get(`/api/v1/connections/mutual/${userId}/suggestions`, {
      params: { limit }
    });
    return data;
  }

  // ─── PROFILE VIEWS ───

  static async getProfileViewers(limit = 10, skip = 0) {
    const { data } = await api.get('/api/v1/connections/profile-views/viewers', {
      params: { limit, skip }
    });
    return data;
  }

  static async getProfileViewCount() {
    const { data } = await api.get('/api/v1/connections/profile-views/count');
    return data;
  }

  static async recordProfileView(viewedUserId: string) {
    const { data } = await api.post('/api/v1/connections/profile-views/record', { viewedUserId });
    return data;
  }

  // ─── CATCH-UP FEED ───

  static async getCatchUpFeed(userId: string) {
    const { data } = await api.get(`/api/v1/connections/catchup/${userId}`);
    return data;
  }

  // ─── SUGGESTIONS & PYMK ───

  static async dismissSuggestion(targetUserId: string) {
    const { data } = await api.delete(`/api/v1/connections/suggestions/${targetUserId}`);
    return data;
  }

  // ─── NETWORK ANALYTICS & HEALTH ───

  static async getNetworkOverview(userId: string) {
    const { data } = await api.get(`/api/v1/connections/network/overview/${userId}`);
    return data;
  }

  static async getNetworkHealth(userId: string) {
    const { data } = await api.get(`/api/v1/connections/network/health/${userId}`);
    return data;
  }

  static async getNetworkComposition(userId: string) {
    const { data } = await api.get(`/api/v1/connections/network/composition/${userId}`);
    return data;
  }

  static async getNetworkGrowth(userId: string) {
    const { data } = await api.get(`/api/v1/connections/network/growth/${userId}`);
    return data;
  }

  // ─── BULK REQUEST ACTIONS ───

  static async bulkAcceptRequests(requestIds: string[]) {
    const { data } = await api.post('/api/v1/connections/requests/bulk/accept', { requestIds });
    return data;
  }

  static async bulkDeclineRequests(requestIds: string[]) {
    const { data } = await api.post('/api/v1/connections/requests/bulk/decline', { requestIds });
    return data;
  }

  // ─── CONNECTION TAGS & STRENGTH ───

  static async getConnectionStrength(connectionId: string) {
    const { data } = await api.get(`/api/v1/connections/connection/${connectionId}/strength`);
    return data;
  }

  static async updateConnectionTags(connectionId: string, tags: string[]) {
    const { data } = await api.patch(`/api/v1/connections/connection/${connectionId}/tags`, { tags });
    return data;
  }

  // ─── SAFETY & BLOCKING ───

  static async blockUser(targetUserId: string) {
    const { data } = await api.post(`/api/v1/connections/block/${targetUserId}`);
    return data;
  }

  static async unblockUser(targetUserId: string) {
    const { data } = await api.delete(`/api/v1/connections/block/${targetUserId}`);
    return data;
  }

  static async getBlockedUsers() {
    const { data } = await api.get('/api/v1/connections/block/list');
    return data;
  }
}


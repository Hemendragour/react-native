import { api } from './auth.service';

const MENTORSHIP_NOTIF_PATH = '/api/v1/mentorship/notifications';
const GENERAL_NOTIF_PATH = '/api/v1/notifications';

function mapNotificationType(rawType: string): 'booking' | 'review' | 'payment' | 'message' | 'system' {
  if (!rawType) return 'system';
  if (rawType.includes('booking') || rawType.includes('session') || rawType.includes('waitlist')) return 'booking';
  if (rawType.includes('review')) return 'review';
  if (rawType.includes('payment') || rawType.includes('refund') || rawType.includes('package') || rawType.includes('credit')) return 'payment';
  if (rawType.includes('query')) return 'message';
  return 'system';
}

function normalizeNotificationDoc(raw: any): any {
  return {
    _id: raw.id || raw.notificationId || raw._id,
    notificationId: raw.notificationId || raw.id || raw._id,
    type: mapNotificationType(raw.type),
    title: raw.title,
    message: raw.message,
    createdAt: raw.createdAt || new Date().toISOString(),
    isRead: raw.status?.read ?? raw.isRead ?? false,
  };
}

export const NotificationService = {
  // ── General Notifications ─────────────────────────────────────────────────────

  /**
   * GET /api/v1/notifications
   */
  getNotifications: async (params?: { page?: number; limit?: number }) => {
    return api.get(GENERAL_NOTIF_PATH, { params });
  },

  markAsRead: async (notificationId: string) => {
    return api.patch(`${GENERAL_NOTIF_PATH}/${notificationId}/read`);
  },

  markAllAsRead: async () => {
    return api.patch(`${GENERAL_NOTIF_PATH}/mark-all-read`);
  },

  deleteNotification: async (notificationId: string) => {
    return api.delete(`${GENERAL_NOTIF_PATH}/${notificationId}`);
  },

  // ── Mentorship-Scoped Notifications ──────────────────────────────────────────

  /**
   * GET /api/v1/mentorship/notifications
   * Get paginated in-app mentorship notifications.
   */
  async getMentorshipNotifications(params?: { page?: number; limit?: number; unreadOnly?: boolean }): Promise<any> {
    try {
      const { data } = await api.get(MENTORSHIP_NOTIF_PATH, { params });
      const rawList = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      const normalized = rawList.map(normalizeNotificationDoc);
      return { ...data, data: normalized };
    } catch (error: any) {
      console.error('❌ [GET_MENTORSHIP_NOTIFICATIONS] Failed:', error);
      throw error;
    }
  },

  /**
   * GET /api/v1/mentorship/notifications/unread-count
   * Get total unread notifications badge count.
   */
  async getUnreadCount(): Promise<any> {
    try {
      const { data } = await api.get(`${MENTORSHIP_NOTIF_PATH}/unread-count`);
      return data;
    } catch (error: any) {
      console.error('❌ [GET_UNREAD_COUNT] Failed:', error);
      return { data: { count: 0 } };
    }
  },

  /**
   * GET /api/v1/mentorship/notifications/:id
   * Get notification details by ID.
   */
  async getNotificationById(notificationId: string): Promise<any> {
    try {
      const { data } = await api.get(`${MENTORSHIP_NOTIF_PATH}/${notificationId}`);
      return data;
    } catch (error: any) {
      console.error('❌ [GET_NOTIFICATION_BY_ID] Failed:', error);
      throw error;
    }
  },

  /**
   * PUT /api/v1/mentorship/notifications/:id/read
   * Mark single notification as read.
   */
  async markMentorshipNotificationRead(notificationId: string): Promise<any> {
    try {
      const { data } = await api.put(`${MENTORSHIP_NOTIF_PATH}/${notificationId}/read`);
      return data;
    } catch (error: any) {
      console.error('❌ [MARK_MENTORSHIP_NOTIFICATION_READ] Failed:', error);
      throw error;
    }
  },

  /**
   * PUT /api/v1/mentorship/notifications/read-all
   * Mark all notifications as read.
   */
  async markAllMentorshipNotificationsRead(): Promise<any> {
    try {
      const { data } = await api.put(`${MENTORSHIP_NOTIF_PATH}/read-all`);
      return data;
    } catch (error: any) {
      console.error('❌ [MARK_ALL_MENTORSHIP_NOTIFICATIONS_READ] Failed:', error);
      throw error;
    }
  },

  /**
   * DELETE /api/v1/mentorship/notifications/:id
   * Delete a notification.
   */
  async deleteMentorshipNotification(notificationId: string): Promise<any> {
    try {
      const { data } = await api.delete(`${MENTORSHIP_NOTIF_PATH}/${notificationId}`);
      return data;
    } catch (error: any) {
      console.error('❌ [DELETE_MENTORSHIP_NOTIFICATION] Failed:', error);
      throw error;
    }
  },

  /**
   * PUT /api/v1/mentorship/notifications/preferences
   * Update notification channel preferences (Email, In-App, Push).
   */
  async updateNotificationPreferences(preferences: {
    email?: boolean;
    inApp?: boolean;
    push?: boolean;
    types?: string[];
  }): Promise<any> {
    try {
      const { data } = await api.put(`${MENTORSHIP_NOTIF_PATH}/preferences`, preferences);
      return data;
    } catch (error: any) {
      console.error('❌ [UPDATE_NOTIFICATION_PREFERENCES] Failed:', error);
      throw error;
    }
  },
};

export default NotificationService;

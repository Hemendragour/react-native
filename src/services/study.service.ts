import { api } from './auth.service';

// ─── Chat User Cache ──────────────────────────────────────────────────────────
// Caches user profiles so chat can show real names/avatars for sender IDs

interface CachedUser {
  name: string;
  avatar: string | null;
  firstName?: string;
  lastName?: string;
}

const userCache = new Map<string, CachedUser>();

export async function fetchChatUsers(userIds: string[]): Promise<Map<string, CachedUser>> {
  const toFetch = userIds.filter(id => id && !userCache.has(id));
  if (toFetch.length === 0) return userCache;

  // Fetch in parallel, don't block on failures
  await Promise.allSettled(
    toFetch.map(async (id) => {
      try {
        const res = await api.get(`/api/v1/auth/get-user/${id}`);
        const u = res.data?.data || res.data;
        const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim()
          || u.name || u.username || u.email?.split('@')[0] || 'User';
        const avatar = u.profileImage || u.avatar || u.profilePhoto || u.profilePhotoId || null;
        userCache.set(id, { name, avatar, firstName: u.firstName, lastName: u.lastName });
      } catch {
        userCache.set(id, { name: 'User', avatar: null });
      }
    })
  );

  return userCache;
}

export function getCachedUserName(userId: string): string {
  return userCache.get(userId)?.name || 'User';
}

export function getCachedUserAvatar(userId: string): string | null {
  return userCache.get(userId)?.avatar || null;
}

export function cacheUserFromPayload(userObj: any) {
  if (!userObj || typeof userObj !== 'object') return;
  const id = userObj._id || userObj.userId || userObj.id;
  if (!id) return;
  const name = [userObj.firstName, userObj.lastName].filter(Boolean).join(' ').trim() || userObj.name || userObj.fullName || userObj.username || 'User';
  const avatar = userObj.profileImage || userObj.avatar || userObj.profilePhotoId || null;
  userCache.set(String(id), { name, avatar, firstName: userObj.firstName, lastName: userObj.lastName });
}

export interface StudyGroupInput {
  title: string;
  description: string;
  category: string;
  capacity: number;
  goalHours: number;
  cameraRequired: boolean;
  visibility: 'public' | 'private';
  attendanceRequired?: boolean;
  minAttendancePercent?: number;
}

export interface StudyGoalInput {
  title: string;
  color: string;
  days?: string[];
}

export interface StudyTaskInput {
  title: string;
  description?: string;
  deadline?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  groupId?: string;
  tags?: string[];
  reminderAt?: string;
}

export class StudyService {
  // =========================================================================
  // STUDY GROUPS
  // =========================================================================

  static async getMyGroups() {
    try {
      console.log('[StudyService] Fetching my groups...');
      const response = await api.get('/api/v1/study-group/groups/my-groups');
      return response.data;
    } catch (error) {
      console.error('[StudyService] Error fetching my groups:', error);
      throw error;
    }
  }

  static async getAllGroups(params?: { search?: string; category?: string; visibility?: string; page?: number; limit?: number }) {
    try {
      console.log('[StudyService] Fetching all groups...', params);
      const response = await api.get('/api/v1/study-group/groups', { params });
      return response.data;
    } catch (error) {
      console.error('[StudyService] Error fetching all groups:', error);
      throw error;
    }
  }

  static async getTopRankedGroups() {
    try {
      console.log('[StudyService] Fetching top ranked groups...');
      const response = await api.get('/api/v1/study-group/groups/top-ranked');
      return response.data;
    } catch (error) {
      console.error('[StudyService] Error fetching top ranked groups:', error);
      throw error;
    }
  }

  static async getGroupById(groupId: string) {
    try {
      console.log(`[StudyService] Fetching group details for ${groupId}...`);
      const response = await api.get(`/api/v1/study-group/groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error fetching group ${groupId}:`, error);
      throw error;
    }
  }

  static async createGroup(groupData: StudyGroupInput) {
    try {
      console.log('[StudyService] Creating new study group...', groupData);
      const response = await api.post('/api/v1/study-group/groups/create', groupData);
      return response.data;
    } catch (error) {
      console.error('[StudyService] Error creating study group:', error);
      throw error;
    }
  }

  static async joinGroup(groupId: string) {
    try {
      console.log(`[StudyService] Joining group ${groupId}...`);
      const response = await api.post(`/api/v1/study-group/groups/${groupId}/join`);
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error joining group ${groupId}:`, error);
      throw error;
    }
  }

  static async leaveGroup(groupId: string) {
    try {
      console.log(`[StudyService] Leaving group ${groupId}...`);
      const response = await api.post(`/api/v1/study-group/groups/${groupId}/leave`);
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error leaving group ${groupId}:`, error);
      throw error;
    }
  }

  static async getGroupMembers(groupId: string) {
    try {
      console.log(`[StudyService] Fetching members for group ${groupId}...`);
      const response = await api.get(`/api/v1/study-group/groups/${groupId}/members`);
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error fetching members for group ${groupId}:`, error);
      throw error;
    }
  }

  static async updateGroup(groupId: string, groupData: Partial<StudyGroupInput>) {
    try {
      console.log(`[StudyService] Updating group ${groupId}...`, groupData);
      const response = await api.put(`/api/v1/study-group/groups/${groupId}`, groupData);
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error updating group ${groupId}:`, error);
      throw error;
    }
  }

  static async deleteGroup(groupId: string) {
    try {
      console.log(`[StudyService] Deleting group ${groupId}...`);
      const response = await api.delete(`/api/v1/study-group/groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error deleting group ${groupId}:`, error);
      throw error;
    }
  }

  // =========================================================================
  // MEMBER MANAGEMENT (/member)
  // =========================================================================

  static async addMember(groupId: string, userId: string, role?: string) {
    try {
      console.log(`[StudyService] Adding member ${userId} to group ${groupId}...`);
      const response = await api.post(`/api/v1/study-group/member/${groupId}/add-member`, { userId, role });
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error adding member to group ${groupId}:`, error);
      throw error;
    }
  }

  static async removeMember(groupId: string, userId: string) {
    try {
      console.log(`[StudyService] Removing member ${userId} from group ${groupId}...`);
      const response = await api.delete(`/api/v1/study-group/member/${groupId}/remove-member/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error removing member ${userId} from group ${groupId}:`, error);
      throw error;
    }
  }

  static async getMembers(groupId: string) {
    try {
      console.log(`[StudyService] Fetching members from /member for group ${groupId}...`);
      const response = await api.get(`/api/v1/study-group/member/${groupId}/members`);
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error fetching members for group ${groupId}:`, error);
      throw error;
    }
  }

  static async getMemberCount(groupId: string) {
    try {
      const response = await api.get(`/api/v1/study-group/member/${groupId}/member-count`);
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error fetching member count for group ${groupId}:`, error);
      throw error;
    }
  }

  // =========================================================================
  // GOALS
  // =========================================================================

  static async getAllGoals() {
    try {
      console.log('[StudyService] Fetching all goals...');
      const response = await api.get('/api/v1/study-group/goals');
      return response.data;
    } catch (error) {
      console.error('[StudyService] Error fetching goals:', error);
      throw error;
    }
  }

  static async createGoal(goalData: StudyGoalInput) {
    try {
      console.log('[StudyService] Creating new goal...', goalData);
      const response = await api.post('/api/v1/study-group/goals', goalData);
      return response.data;
    } catch (error) {
      console.error('[StudyService] Error creating goal:', error);
      throw error;
    }
  }

  static async updateGoal(goalId: string, goalData: any) {
    try {
      console.log(`[StudyService] Updating goal ${goalId}...`);
      const response = await api.put(`/api/v1/study-group/goals/${goalId}`, goalData);
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error updating goal ${goalId}:`, error);
      throw error;
    }
  }

  static async deleteGoal(goalId: string) {
    try {
      console.log(`[StudyService] Deleting goal ${goalId}...`);
      const response = await api.delete(`/api/v1/study-group/goals/${goalId}`);
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error deleting goal ${goalId}:`, error);
      throw error;
    }
  }

  // =========================================================================
  // TASKS / TODOS
  // =========================================================================

  static async getAllTasks(params?: { limit?: number; page?: number; status?: string }) {
    try {
      console.log('[StudyService] Fetching all tasks...');
      // Default to a large limit so the calendar view can show all tasks (max 100 allowed by backend)
      const query = { limit: 100, page: 1, ...params };
      const response = await api.get('/api/v1/study-group/tasks', { params: query });
      return response.data;
    } catch (error) {
      console.error('[StudyService] Error fetching tasks:', error);
      throw error;
    }
  }

  static async createTask(taskData: StudyTaskInput) {
    try {
      console.log('[StudyService] Creating new task...', taskData);
      const response = await api.post('/api/v1/study-group/tasks', taskData);
      return response.data;
    } catch (error) {
      console.error('[StudyService] Error creating task:', error);
      throw error;
    }
  }

  static async updateTask(taskId: string, taskData: Partial<StudyTaskInput> & { status?: string }) {
    try {
      console.log(`[StudyService] Updating task ${taskId}...`, taskData);
      const response = await api.put(`/api/v1/study-group/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error updating task ${taskId}:`, error);
      throw error;
    }
  }

  static async toggleTaskCompletion(taskId: string, isCompleted: boolean) {
    try {
      console.log(`[StudyService] Setting task ${taskId} completion to ${isCompleted}...`);
      const endpoint = `/api/v1/study-group/tasks/${taskId}/${isCompleted ? 'complete' : 'incomplete'}`;
      const response = await api.patch(endpoint);
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error toggling completion for task ${taskId}:`, error);
      throw error;
    }
  }

  static async deleteTask(taskId: string) {
    try {
      console.log(`[StudyService] Deleting task ${taskId}...`);
      const response = await api.delete(`/api/v1/study-group/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error deleting task ${taskId}:`, error);
      throw error;
    }
  }

  // =========================================================================
  // TIMERS / STUDY SESSIONS
  // =========================================================================

  static async startTimer(data?: { goalId?: string; subject?: string; notes?: string }) {
    try {
      console.log('[StudyService] Starting active study session timer...');
      const response = await api.post('/api/v1/study-group/timer/start', data || {});
      return response.data;
    } catch (error) {
      console.error('[StudyService] Error starting timer:', error);
      throw error;
    }
  }

  static async pauseTimer() {
    try {
      console.log('[StudyService] Pausing active timer...');
      const response = await api.patch('/api/v1/study-group/timer/pause', {});
      return response.data;
    } catch (error) {
      console.error('[StudyService] Error pausing timer:', error);
      throw error;
    }
  }

  static async resumeTimer() {
    try {
      console.log('[StudyService] Resuming active timer...');
      const response = await api.patch('/api/v1/study-group/timer/resume', {});
      return response.data;
    } catch (error) {
      console.error('[StudyService] Error resuming timer:', error);
      throw error;
    }
  }

  static async stopTimer(sessionData: { focusScore?: number; notes?: string }) {
    try {
      console.log('[StudyService] Stopping active study session timer...', sessionData);
      const response = await api.patch('/api/v1/study-group/timer/stop', sessionData || {});
      return response.data;
    } catch (error) {
      console.error('[StudyService] Error stopping timer:', error);
      throw error;
    }
  }

  static async cancelTimer() {
    try {
      console.log('[StudyService] Cancelling active timer...');
      const response = await api.delete('/api/v1/study-group/timer/cancel');
      return response.data;
    } catch (error) {
      console.error('[StudyService] Error cancelling timer:', error);
      throw error;
    }
  }

  static async getActiveTimer() {
    try {
      console.log('[StudyService] Fetching active timer status...');
      const response = await api.get('/api/v1/study-group/timer/active');
      return response.data;
    } catch (error) {
      console.error('[StudyService] Error fetching active timer:', error);
      throw error;
    }
  }

  // =========================================================================
  // DASHBOARD / USER PROFILE
  // =========================================================================

  static async getUserDashboard() {
    try {
      console.log('[StudyService] Fetching user dashboard...');
      const response = await api.get('/api/v1/study-group/dashboard/user');
      return response.data;
    } catch (error) {
      console.error('[StudyService] Error fetching user dashboard:', error);
      throw error;
    }
  }

  static async getStudyStatistics(period: '7days' | '30days' | '90days' = '7days') {
    try {
      console.log(`[StudyService] Fetching study statistics for ${period}...`);
      const response = await api.get('/api/v1/study-group/dashboard/statistics', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('[StudyService] Error fetching study statistics:', error);
      throw error;
    }
  }

  static async getPerformanceAnalytics() {
    try {
      console.log('[StudyService] Fetching performance analytics...');
      const response = await api.get('/api/v1/study-group/dashboard/analytics');
      return response.data;
    } catch (error) {
      console.error('[StudyService] Error fetching performance analytics:', error);
      throw error;
    }
  }

  static async getSessionStats() {
    try {
      console.log('[StudyService] Fetching study session stats...');
      const response = await api.get('/api/v1/study-group/timer/stats');
      return response.data;
    } catch (error) {
      console.error('[StudyService] Error fetching study stats:', error);
      throw error;
    }
  }

  // =========================================================================
  // LEADERBOARD
  // =========================================================================

  static async getLeaderboard(type: 'global' | 'weekly' | 'monthly' | string, page = 1, limit = 100) {
    try {
      console.log(`[StudyService] Fetching leaderboard for ${type}...`);
      let endpoint = `/api/v1/study-group/leaderboard/${type}`;
      if (type !== 'global' && type !== 'weekly' && type !== 'monthly') {
        endpoint = `/api/v1/study-group/leaderboard/category/${type}`;
      }
      const response = await api.get(endpoint, { params: { page, limit } });
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error fetching leaderboard (${type}):`, error);
      throw error;
    }
  }

  static async getGroupLeaderboard(groupId: string, page = 1, limit = 100) {
    try {
      console.log(`[StudyService] Fetching group leaderboard for ${groupId}...`);
      const response = await api.get(`/api/v1/study-group/leaderboard/group/${groupId}`, { params: { page, limit } });
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error fetching group leaderboard:`, error);
      throw error;
    }
  }

  static async getStreakLeaderboard(page = 1, limit = 100) {
    try {
      console.log(`[StudyService] Fetching streak leaderboard...`);
      const response = await api.get('/api/v1/study-group/streak/leaderboard', { params: { page, limit } });
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error fetching streak leaderboard:`, error);
      throw error;
    }
  }

  static async getGroupStreakLeaderboard(groupId: string, page = 1, limit = 100) {
    try {
      console.log(`[StudyService] Fetching group streak leaderboard for ${groupId}...`);
      const response = await api.get(`/api/v1/study-group/streak/group-leaderboard/${groupId}`, { params: { page, limit } });
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error fetching group streak leaderboard:`, error);
      throw error;
    }
  }

  // =========================================================================
  // CHAT — REST API (for fetching history; real-time via socket)
  // =========================================================================

  static async getChatMessages(groupId: string, page = 1, limit = 50) {
    try {
      console.log(`[StudyService] Fetching messages for group ${groupId} (page ${page})...`);
      const response = await api.get(`/api/v1/study-group/chat/${groupId}/messages`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error fetching messages for group ${groupId}:`, error);
      throw error;
    }
  }

  static async getPinnedMessages(groupId: string) {
    try {
      console.log(`[StudyService] Fetching pinned messages for group ${groupId}...`);
      const response = await api.get(`/api/v1/study-group/chat/${groupId}/pinned`);
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error fetching pinned messages:`, error);
      throw error;
    }
  }

  static async sendChatMessage(
    groupId: string,
    messageDataOrContent: string | { content: string; messageType?: string; replyTo?: string; fileUrl?: string; fileName?: string; fileSize?: number },
    replyTo?: string
  ) {
    try {
      console.log(`[StudyService] Sending message to group ${groupId}...`);
      const body = typeof messageDataOrContent === 'string'
        ? { content: messageDataOrContent, ...(replyTo ? { replyTo } : {}) }
        : messageDataOrContent;
      const response = await api.post(`/api/v1/study-group/chat/${groupId}/send`, body);
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error sending message to group ${groupId}:`, error);
      throw error;
    }
  }

  static async searchChatMessages(groupId: string, query: string, page = 1, limit = 20) {
    try {
      const response = await api.get(`/api/v1/study-group/chat/${groupId}/search`, {
        params: { query, page, limit },
      });
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error searching chat messages:`, error);
      throw error;
    }
  }

  static async editChatMessage(messageId: string, content: string) {
    try {
      const response = await api.put(`/api/v1/study-group/chat/message/${messageId}`, { content });
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error editing chat message:`, error);
      throw error;
    }
  }

  static async deleteChatMessage(messageId: string) {
    try {
      const response = await api.delete(`/api/v1/study-group/chat/message/${messageId}`);
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error deleting chat message:`, error);
      throw error;
    }
  }

  static async reactToChatMessage(messageId: string, emoji: string) {
    try {
      const response = await api.post(`/api/v1/study-group/chat/message/${messageId}/react`, { emoji });
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error reacting to message:`, error);
      throw error;
    }
  }

  static async togglePinChatMessage(messageId: string) {
    try {
      const response = await api.patch(`/api/v1/study-group/chat/message/${messageId}/pin`);
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error pinning/unpinning chat message:`, error);
      throw error;
    }
  }

  static async markChatMessageRead(messageId: string) {
    try {
      const response = await api.patch(`/api/v1/study-group/chat/message/${messageId}/read`);
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error marking message read:`, error);
      throw error;
    }
  }

  static async getChatMessageReadStatus(messageId: string) {
    try {
      const response = await api.get(`/api/v1/study-group/chat/message/${messageId}/read-status`);
      return response.data;
    } catch (error) {
      console.error(`[StudyService] Error getting message read status:`, error);
      throw error;
    }
  }

  // =========================================================================
  // STREAK
  // =========================================================================

  static async getCurrentStreak() {
    const response = await api.get('/api/v1/study-group/streak/current');
    return response.data;
  }

  static async getLongestStreak() {
    const response = await api.get('/api/v1/study-group/streak/longest');
    return response.data;
  }

  static async getStreakHistory() {
    const response = await api.get('/api/v1/study-group/streak/history');
    return response.data;
  }

  // =========================================================================
  // PROGRESS
  // =========================================================================

  static async getDailyProgress() {
    const response = await api.get('/api/v1/study-group/progress/daily');
    return response.data;
  }

  static async getWeeklyProgress() {
    const response = await api.get('/api/v1/study-group/progress/weekly');
    return response.data;
  }

  static async getTotalProgress() {
    const response = await api.get('/api/v1/study-group/progress/total');
    return response.data;
  }

  static async getGraphData() {
    const response = await api.get('/api/v1/study-group/progress/graph-data');
    return response.data;
  }

  // =========================================================================
  // RANKING
  // =========================================================================

  static async getMyRank() {
    const response = await api.get('/api/v1/study-group/ranking/my-rank');
    return response.data;
  }

  static async getUserRank(userId: string) {
    const response = await api.get(`/api/v1/study-group/ranking/user/${userId}`);
    return response.data;
  }

  // =========================================================================
  // ATTENDANCE
  // =========================================================================

  static async dailyCheckIn() {
    const response = await api.post('/api/v1/study-group/attendance/check-in');
    return response.data;
  }

  static async getAttendancePercentage() {
    const response = await api.get('/api/v1/study-group/attendance/percentage');
    return response.data;
  }

  static async getAttendanceHistory() {
    const response = await api.get('/api/v1/study-group/attendance/history');
    return response.data;
  }

  static async getAttendanceCalendar() {
    const response = await api.get('/api/v1/study-group/attendance/calendar');
    return response.data;
  }

  static async getAttendanceStatus() {
    const response = await api.get('/api/v1/study-group/attendance/status');
    return response.data;
  }

  // =========================================================================
  // GOALS — additional endpoints
  // =========================================================================

  static async getGoalStats() {
    const response = await api.get('/api/v1/study-group/goals/stats');
    return response.data;
  }

  static async getActiveGoals() {
    const response = await api.get('/api/v1/study-group/goals/active');
    return response.data;
  }

  static async getUpcomingGoals() {
    const response = await api.get('/api/v1/study-group/goals/upcoming');
    return response.data;
  }

  static async getGoalById(goalId: string) {
    const response = await api.get(`/api/v1/study-group/goals/${goalId}`);
    return response.data;
  }

  static async updateGoalProgress(goalId: string, currentProgress: number) {
    const response = await api.patch(`/api/v1/study-group/goals/${goalId}/progress`, { currentProgress });
    return response.data;
  }

  static async completeGoal(goalId: string) {
    const response = await api.patch(`/api/v1/study-group/goals/${goalId}/complete`);
    return response.data;
  }

  static async reopenGoal(goalId: string) {
    const response = await api.patch(`/api/v1/study-group/goals/${goalId}/incomplete`);
    return response.data;
  }

  // =========================================================================
  // TASKS — additional endpoints
  // =========================================================================

  static async getTaskStats() {
    const response = await api.get('/api/v1/study-group/tasks/stats');
    return response.data;
  }

  static async getOverdueTasks() {
    const response = await api.get('/api/v1/study-group/tasks/overdue');
    return response.data;
  }

  static async getUpcomingTasks() {
    const response = await api.get('/api/v1/study-group/tasks/upcoming');
    return response.data;
  }

  static async getTaskById(taskId: string) {
    const response = await api.get(`/api/v1/study-group/tasks/${taskId}`);
    return response.data;
  }

  // =========================================================================
  // TIMER — additional endpoints
  // =========================================================================

  static async getAllSessions() {
    const response = await api.get('/api/v1/study-group/timer/');
    return response.data;
  }

  static async getTodaySessions() {
    const response = await api.get('/api/v1/study-group/timer/today');
    return response.data;
  }

  static async getSessionById(sessionId: string) {
    const response = await api.get(`/api/v1/study-group/timer/${sessionId}`);
    return response.data;
  }

  static async deleteSession(sessionId: string) {
    const response = await api.delete(`/api/v1/study-group/timer/${sessionId}`);
    return response.data;
  }

  // =========================================================================
  // STREAK & ATTENDANCE — additional endpoints
  // =========================================================================

  static async updateStreak() {
    const response = await api.post('/api/v1/study-group/streak/update');
    return response.data;
  }

  static async autoMarkAttendance(reason: 'study_session' | 'task_completion', studyHours?: number) {
    const response = await api.patch('/api/v1/study-group/attendance/auto-mark', { reason, studyHours });
    return response.data;
  }

  // =========================================================================
  // RANKING & LEADERBOARD — additional endpoints
  // =========================================================================

  static async updateUserRank(data: any) {
    const response = await api.put('/api/v1/study-group/ranking/update', data);
    return response.data;
  }

  static async recalculateRanks() {
    const response = await api.post('/api/v1/study-group/ranking/recalculate');
    return response.data;
  }

  static async getCategoryLeaderboard(category: string, page = 1, limit = 100) {
    const response = await api.get(`/api/v1/study-group/leaderboard/category/${category}`, { params: { page, limit } });
    return response.data;
  }

  // =========================================================================
  // NOTIFICATIONS
  // =========================================================================

  static async getAllNotifications() {
    const response = await api.get('/api/v1/study-group/notifications/all');
    return response.data;
  }

  static async getUnreadNotifications() {
    const response = await api.get('/api/v1/study-group/notifications/unread');
    return response.data;
  }

  static async getNotificationCount() {
    const response = await api.get('/api/v1/study-group/notifications/count');
    return response.data;
  }

  static async markNotificationRead(notificationId: string) {
    const response = await api.patch(`/api/v1/study-group/notifications/${notificationId}/read`);
    return response.data;
  }

  static async markAllNotificationsRead() {
    const response = await api.patch('/api/v1/study-group/notifications/mark-all-read');
    return response.data;
  }

  static async deleteNotification(notificationId: string) {
    const response = await api.delete(`/api/v1/study-group/notifications/${notificationId}`);
    return response.data;
  }

  static async getNotificationPreferences() {
    const response = await api.get('/api/v1/study-group/notifications/preferences');
    return response.data;
  }

  static async updateNotificationPreferences(preferences: any) {
    const response = await api.put('/api/v1/study-group/notifications/preferences', preferences);
    return response.data;
  }

  // =========================================================================
  // SEARCH
  // =========================================================================

  static async searchGroups(queryOrParams: string | { search?: string; category?: string; visibility?: string; tags?: string | string[]; hasSpace?: boolean; minHours?: number; maxHours?: number; sort?: string; page?: number; limit?: number }) {
    const params = typeof queryOrParams === 'string'
      ? { search: queryOrParams }
      : queryOrParams;
    const response = await api.get('/api/v1/study-group/search/groups', { params });
    return response.data;
  }

  static async getPopularGroups(limit = 10) {
    const response = await api.get('/api/v1/study-group/search/groups/popular', { params: { limit } });
    return response.data;
  }

  static async getTrendingGroups(limit = 10) {
    const response = await api.get('/api/v1/study-group/search/groups/trending', { params: { limit } });
    return response.data;
  }

  static async getRecommendedGroups(category?: string, limit = 10) {
    const response = await api.get('/api/v1/study-group/search/groups/recommended', {
      params: { ...(category ? { category } : {}), limit },
    });
    return response.data;
  }

  static async getGroupsByCategory(category: string) {
    const response = await api.get(`/api/v1/study-group/search/groups/category/${category}`);
    return response.data;
  }

  static async getAvailableGroups(page = 1, limit = 10) {
    const response = await api.get('/api/v1/study-group/search/groups/available', { params: { page, limit } });
    return response.data;
  }

  static async searchGroupsByTags(tags: string | string[], page = 1, limit = 10) {
    const response = await api.get('/api/v1/study-group/search/groups/tags', { params: { tags, page, limit } });
    return response.data;
  }

  // =========================================================================
  // FILES
  // =========================================================================

  static async uploadFile(groupId: string, formData: any) {
    const response = await api.post(`/api/v1/study-group/files/${groupId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  static async getGroupFiles(groupId: string) {
    const response = await api.get(`/api/v1/study-group/files/${groupId}/all`);
    return response.data;
  }

  static async getPinnedFiles(groupId: string) {
    const response = await api.get(`/api/v1/study-group/files/${groupId}/pinned`);
    return response.data;
  }

  static async getFileById(fileId: string) {
    const response = await api.get(`/api/v1/study-group/files/${fileId}`);
    return response.data;
  }

  static async downloadFile(fileId: string) {
    const response = await api.get(`/api/v1/study-group/files/${fileId}/download`);
    return response.data;
  }

  static async deleteFile(fileId: string) {
    const response = await api.delete(`/api/v1/study-group/files/${fileId}`);
    return response.data;
  }

  static async togglePinFile(fileId: string) {
    const response = await api.patch(`/api/v1/study-group/files/${fileId}/pin`);
    return response.data;
  }

  // =========================================================================
  // LIVE ROOMS
  // =========================================================================

  static async createLiveRoom(data: { groupId: string; roomName: string; roomType: 'video' | 'audio' | 'silent'; maxParticipants?: number }) {
    const response = await api.post('/api/v1/study-group/live-rooms', data);
    return response.data;
  }

  static async getLiveRooms() {
    const response = await api.get('/api/v1/study-group/live-rooms');
    return response.data;
  }

  static async getLiveRoomById(roomId: string) {
    const response = await api.get(`/api/v1/study-group/live-rooms/${roomId}`);
    return response.data;
  }

  static async updateLiveRoom(roomId: string, data: any) {
    const response = await api.put(`/api/v1/study-group/live-rooms/${roomId}`, data);
    return response.data;
  }

  static async deleteLiveRoom(roomId: string) {
    const response = await api.delete(`/api/v1/study-group/live-rooms/${roomId}`);
    return response.data;
  }

  static async getGroupLiveRooms(groupId: string) {
    const response = await api.get(`/api/v1/study-group/live-rooms/group/${groupId}`);
    return response.data;
  }

  static async getActiveGroupLiveRoom(groupId: string) {
    const response = await api.get(`/api/v1/study-group/live-rooms/group/${groupId}/active`);
    return response.data;
  }

  static async getGroupLiveRoomStats(groupId: string) {
    const response = await api.get(`/api/v1/study-group/live-rooms/group/${groupId}/stats`);
    return response.data;
  }

  static async joinLiveRoom(roomId: string) {
    const response = await api.post(`/api/v1/study-group/live-rooms/${roomId}/join`);
    return response.data;
  }

  static async leaveLiveRoom(roomId: string) {
    const response = await api.post(`/api/v1/study-group/live-rooms/${roomId}/leave`);
    return response.data;
  }

  static async endLiveRoom(roomId: string) {
    const response = await api.post(`/api/v1/study-group/live-rooms/${roomId}/end`);
    return response.data;
  }

  static async getLiveRoomParticipants(roomId: string) {
    const response = await api.get(`/api/v1/study-group/live-rooms/${roomId}/participants`);
    return response.data;
  }

  static async toggleLiveRoomCamera(roomId: string, isCameraOn: boolean) {
    const response = await api.patch(`/api/v1/study-group/live-rooms/${roomId}/toggle-camera`, { isCameraOn });
    return response.data;
  }

  static async toggleLiveRoomMic(roomId: string, isMicOn: boolean) {
    const response = await api.patch(`/api/v1/study-group/live-rooms/${roomId}/toggle-mic`, { isMicOn });
    return response.data;
  }

  static async toggleLiveRoomScreenShare(roomId: string, isScreenSharing: boolean) {
    const response = await api.patch(`/api/v1/study-group/live-rooms/${roomId}/toggle-screen-share`, { isScreenSharing });
    return response.data;
  }

  // =========================================================================
  // TESTS & QUIZZES
  // =========================================================================

  static async createTest(testData: {
    groupId: string;
    title: string;
    description?: string;
    durationMinutes: number;
    totalMarks: number;
    passingMarks: number;
    startTime?: string;
    endTime?: string;
  }) {
    const response = await api.post('/api/v1/study-group/tests', testData);
    return response.data;
  }

  static async getTestsByGroup(groupId: string) {
    const response = await api.get(`/api/v1/study-group/tests/group/${groupId}`);
    return response.data;
  }

  static async getTestById(testId: string) {
    const response = await api.get(`/api/v1/study-group/tests/${testId}`);
    return response.data;
  }

  static async updateTest(testId: string, testData: any) {
    const response = await api.put(`/api/v1/study-group/tests/${testId}`, testData);
    return response.data;
  }

  static async deleteTest(testId: string) {
    const response = await api.delete(`/api/v1/study-group/tests/${testId}`);
    return response.data;
  }

  static async publishTest(testId: string) {
    const response = await api.patch(`/api/v1/study-group/tests/${testId}/publish`);
    return response.data;
  }

  static async unpublishTest(testId: string) {
    const response = await api.patch(`/api/v1/study-group/tests/${testId}/unpublish`);
    return response.data;
  }

  static async getTestStats(testId: string) {
    const response = await api.get(`/api/v1/study-group/tests/${testId}/stats`);
    return response.data;
  }

  static async addTestQuestion(testId: string, data: {
    questionText: string;
    questionType: 'mcq' | 'boolean';
    options: string[];
    correctOption: number | string;
    marks: number;
  }) {
    const response = await api.post(`/api/v1/study-group/tests/${testId}/questions`, data);
    return response.data;
  }

  static async getTestQuestions(testId: string) {
    const response = await api.get(`/api/v1/study-group/tests/${testId}/questions`);
    return response.data;
  }

  static async updateTestQuestion(testId: string, questionId: string, data: any) {
    const response = await api.put(`/api/v1/study-group/tests/${testId}/questions/${questionId}`, data);
    return response.data;
  }

  static async deleteTestQuestion(testId: string, questionId: string) {
    const response = await api.delete(`/api/v1/study-group/tests/${testId}/questions/${questionId}`);
    return response.data;
  }

  // =========================================================================
  // ASSIGNMENTS & SUBMISSIONS
  // =========================================================================

  static async createAssignment(formData: any) {
    const response = await api.post('/api/v1/study-group/assignments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  static async getAssignmentsByGroup(groupId: string) {
    const response = await api.get(`/api/v1/study-group/assignments/group/${groupId}`);
    return response.data;
  }

  static async getAssignmentById(assignmentId: string) {
    const response = await api.get(`/api/v1/study-group/assignments/${assignmentId}`);
    return response.data;
  }

  static async updateAssignment(assignmentId: string, data: any) {
    const response = await api.put(`/api/v1/study-group/assignments/${assignmentId}`, data);
    return response.data;
  }

  static async deleteAssignment(assignmentId: string) {
    const response = await api.delete(`/api/v1/study-group/assignments/${assignmentId}`);
    return response.data;
  }

  static async getAssignmentStats(assignmentId: string) {
    const response = await api.get(`/api/v1/study-group/assignments/${assignmentId}/stats`);
    return response.data;
  }

  static async submitAssignment(assignmentId: string, formData: any) {
    const response = await api.post(`/api/v1/study-group/assignments/${assignmentId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  static async getAssignmentSubmissions(assignmentId: string) {
    const response = await api.get(`/api/v1/study-group/assignments/${assignmentId}/submissions`);
    return response.data;
  }

  static async getMyAssignmentSubmission(assignmentId: string) {
    const response = await api.get(`/api/v1/study-group/assignments/${assignmentId}/my-submission`);
    return response.data;
  }

  static async gradeAssignmentSubmission(assignmentId: string, submissionId: string, data: { marksObtained: number; feedback?: string }) {
    const response = await api.patch(`/api/v1/study-group/assignments/${assignmentId}/submissions/${submissionId}/grade`, data);
    return response.data;
  }

  // =========================================================================
  // DOUBT SOLVING FORUM (/doubts)
  // =========================================================================

  static async postDoubt(groupId: string, formData: any) {
    const response = await api.post(`/api/v1/study-group/doubts/${groupId}/post`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  static async getDoubtById(doubtId: string) {
    const response = await api.get(`/api/v1/study-group/doubts/${doubtId}`);
    return response.data;
  }

  static async getGroupDoubts(groupId: string, page = 1, limit = 20) {
    const response = await api.get(`/api/v1/study-group/doubts/${groupId}/all`, { params: { page, limit } });
    return response.data;
  }

  static async getMyDoubts() {
    const response = await api.get('/api/v1/study-group/doubts/user/my-doubts');
    return response.data;
  }

  static async getSolvedDoubts(groupId: string) {
    const response = await api.get(`/api/v1/study-group/doubts/${groupId}/solved`);
    return response.data;
  }

  static async getUnsolvedDoubts(groupId: string) {
    const response = await api.get(`/api/v1/study-group/doubts/${groupId}/unsolved`);
    return response.data;
  }

  static async getUrgentDoubts(groupId: string) {
    const response = await api.get(`/api/v1/study-group/doubts/${groupId}/urgent`);
    return response.data;
  }

  static async updateDoubt(doubtId: string, data: { title?: string; description?: string }) {
    const response = await api.put(`/api/v1/study-group/doubts/${doubtId}`, data);
    return response.data;
  }

  static async deleteDoubt(doubtId: string) {
    const response = await api.delete(`/api/v1/study-group/doubts/${doubtId}`);
    return response.data;
  }

  static async markDoubtSolved(doubtId: string) {
    const response = await api.patch(`/api/v1/study-group/doubts/${doubtId}/mark-solved`);
    return response.data;
  }

  static async searchDoubts(q: string, page = 1) {
    const response = await api.get('/api/v1/study-group/doubts/search/query', { params: { q, page } });
    return response.data;
  }

  static async getDoubtsByCategory(category: string) {
    const response = await api.get(`/api/v1/study-group/doubts/category/${category}`);
    return response.data;
  }

  static async tagMemberInDoubt(doubtId: string, userIds: string[]) {
    const response = await api.post(`/api/v1/study-group/doubts/${doubtId}/tag-member`, { userIds });
    return response.data;
  }

  static async getGroupDoubtStats(groupId: string) {
    const response = await api.get(`/api/v1/study-group/doubts/${groupId}/stats`);
    return response.data;
  }

  static async getUserDoubtStats(userId: string) {
    const response = await api.get(`/api/v1/study-group/doubts/user/${userId}/stats`);
    return response.data;
  }

  // Doubt Answers
  static async postDoubtAnswer(doubtId: string, formData: any) {
    const response = await api.post(`/api/v1/study-group/doubts/${doubtId}/answer`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  static async getDoubtAnswers(doubtId: string) {
    const response = await api.get(`/api/v1/study-group/doubts/${doubtId}/answers`);
    return response.data;
  }

  static async updateDoubtAnswer(answerId: string, content: string) {
    const response = await api.put(`/api/v1/study-group/doubts/answer/${answerId}`, { content });
    return response.data;
  }

  static async deleteDoubtAnswer(answerId: string) {
    const response = await api.delete(`/api/v1/study-group/doubts/answer/${answerId}`);
    return response.data;
  }

  static async upvoteDoubtAnswer(answerId: string) {
    const response = await api.post(`/api/v1/study-group/doubts/answer/${answerId}/upvote`);
    return response.data;
  }

  static async downvoteDoubtAnswer(answerId: string) {
    const response = await api.post(`/api/v1/study-group/doubts/answer/${answerId}/downvote`);
    return response.data;
  }

  static async removeDoubtAnswerVote(answerId: string) {
    const response = await api.post(`/api/v1/study-group/doubts/answer/${answerId}/remove-vote`);
    return response.data;
  }

  static async getTopAnswerers() {
    const response = await api.get('/api/v1/study-group/doubts/answers/top-answerers');
    return response.data;
  }

  static async getBestAnswers() {
    const response = await api.get('/api/v1/study-group/doubts/answers/best-answers');
    return response.data;
  }

  // =========================================================================
  // GROUP SHARING, QR & INVITES (/share)
  // =========================================================================

  static async generateInviteLink(groupId: string) {
    const response = await api.post(`/api/v1/study-group/share/${groupId}/generate-link`);
    return response.data;
  }

  static async generateQRCode(groupId: string) {
    const response = await api.post(`/api/v1/study-group/share/${groupId}/generate-qr`);
    return response.data;
  }

  static async getSocialLinks(groupId: string) {
    const response = await api.get(`/api/v1/study-group/share/${groupId}/social-links`);
    return response.data;
  }

  static async getShareAnalytics(groupId: string) {
    const response = await api.get(`/api/v1/study-group/share/${groupId}/analytics`);
    return response.data;
  }

  static async getGroupInviteLinks(groupId: string) {
    const response = await api.get(`/api/v1/study-group/share/${groupId}/links`);
    return response.data;
  }

  static async revokeInviteCode(inviteCode: string) {
    const response = await api.delete(`/api/v1/study-group/share/${inviteCode}/revoke`);
    return response.data;
  }

  static async validateInviteCode(inviteCode: string) {
    const response = await api.get(`/api/v1/study-group/share/validate/${inviteCode}`);
    return response.data;
  }

  static async trackInviteJoin(inviteCode: string) {
    const response = await api.post(`/api/v1/study-group/share/${inviteCode}/track-join`);
    return response.data;
  }

  // =========================================================================
  // GROUP MODERATION & RULES (/moderation)
  // =========================================================================

  static async setGroupRules(groupId: string, rules: string[]) {
    const response = await api.post(`/api/v1/study-group/moderation/${groupId}/set-rules`, { rules });
    return response.data;
  }

  static async getGroupRules(groupId: string) {
    const response = await api.get(`/api/v1/study-group/moderation/${groupId}/rules`);
    return response.data;
  }

  static async kickMember(groupId: string, userId: string) {
    const response = await api.post(`/api/v1/study-group/moderation/${groupId}/kick/${userId}`);
    return response.data;
  }

  static async banMember(groupId: string, userId: string, reason: string) {
    const response = await api.post(`/api/v1/study-group/moderation/${groupId}/ban/${userId}`, { reason });
    return response.data;
  }

  static async unbanMember(groupId: string, userId: string) {
    const response = await api.post(`/api/v1/study-group/moderation/${groupId}/unban/${userId}`);
    return response.data;
  }

  static async warnMember(groupId: string, userId: string, reason: string) {
    const response = await api.post(`/api/v1/study-group/moderation/${groupId}/warn/${userId}`, { reason });
    return response.data;
  }

  static async assignModerator(groupId: string, userId: string) {
    const response = await api.post(`/api/v1/study-group/moderation/${groupId}/assign-moderator/${userId}`);
    return response.data;
  }

  static async removeModerator(groupId: string, userId: string) {
    const response = await api.post(`/api/v1/study-group/moderation/${groupId}/remove-moderator/${userId}`);
    return response.data;
  }

  static async reportUser(data: { reportedUserId: string; groupId: string; reason: string; details?: string }) {
    const response = await api.post('/api/v1/study-group/moderation/report-user', data);
    return response.data;
  }

  static async reportMessage(data: { messageId: string; groupId: string; reason: string }) {
    const response = await api.post('/api/v1/study-group/moderation/report-message', data);
    return response.data;
  }

  static async getGroupReports(groupId: string) {
    const response = await api.get(`/api/v1/study-group/moderation/${groupId}/reports`);
    return response.data;
  }

  // =========================================================================
  // DASHBOARD — group overview
  // =========================================================================

  static async getGroupDashboard(groupId: string) {
    const response = await api.get(`/api/v1/study-group/dashboard/group/${groupId}`);
    return response.data;
  }
}

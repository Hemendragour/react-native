import { api } from './auth.service';

export interface PopularServiceStat {
  sessionType: string;
  bookings: number;
  revenue?: number;
}

export interface MonthlyEarningStat {
  month: string;
  amount: number;
}

export interface MentorDashboardAnalytics {
  profileViews: {
    value: number;
    valueThisMonth?: number;
    changePercent: number;
    trend: 'up' | 'down';
  };
  bookingRate: {
    value: number;
    trend: 'up' | 'down';
  };
  avgSessionDuration: {
    value: number;
  };
  popularServices: PopularServiceStat[];
  monthlyEarnings: MonthlyEarningStat[];
  reviews?: {
    averageRating: number;
    totalReviews: number;
    distribution: Record<string, number>;
  };
}

export interface MentorDetailedStats {
  mentor: {
    id: string;
    userId: string;
    title: string;
    status: string;
  };
  sessions: {
    total: number;
    completed: number;
    cancelled: number;
    completionRate: number;
    byType: Array<{ _id: string; count: number; revenue: number }>;
  };
  earnings: {
    total: number;
    average: number;
    currency: string;
  };
  reviews: {
    averageRating: number;
    totalReviews: number;
    distribution: Record<string, number>;
  };
  period?: {
    startDate?: string;
    endDate?: string;
  };
}

interface ApiResponse<T = any> {
  success?: boolean;
  status?: string;
  message?: string;
  data: T;
}

const BASE_PATH = '/api/v1/mentorship/analytics';

class AnalyticsService {
  /**
   * GET /api/v1/mentorship/analytics/mentor/:mentorId/dashboard
   * Full analytics payload for mentor dashboard (profile views, booking rate, duration, popular services, monthly earnings).
   */
  static async getMentorDashboard(mentorId: string): Promise<ApiResponse<MentorDashboardAnalytics>> {
    try {
      const { data } = await api.get<ApiResponse<MentorDashboardAnalytics>>(`${BASE_PATH}/mentor/${mentorId}/dashboard`);
      return data;
    } catch (error: any) {
      console.error('❌ [GET_MENTOR_DASHBOARD] Failed', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to fetch mentor dashboard analytics.');
    }
  }

  /**
   * GET /api/v1/mentorship/analytics/mentor/:mentorId/stats
   * Comprehensive mentor statistics.
   */
  static async getMentorStats(mentorId: string, days?: number): Promise<ApiResponse<MentorDetailedStats>> {
    try {
      const params: any = {};
      if (days) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        params.startDate = startDate.toISOString();
        params.endDate = endDate.toISOString();
      }
      const { data } = await api.get<ApiResponse<MentorDetailedStats>>(`${BASE_PATH}/mentor/${mentorId}/stats`, { params });
      return data;
    } catch (error: any) {
      console.error('❌ [GET_MENTOR_STATS] Failed', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to fetch mentor stats.');
    }
  }

  /**
   * GET /api/v1/mentorship/analytics/mentor/:mentorId/earnings
   * Detailed financial earnings & payout metrics.
   */
  static async getMentorEarnings(mentorId: string, days?: number): Promise<ApiResponse> {
    try {
      const params: any = {};
      if (days) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        params.startDate = startDate.toISOString();
        params.endDate = endDate.toISOString();
      }
      const { data } = await api.get<ApiResponse>(`${BASE_PATH}/mentor/${mentorId}/earnings`, { params });
      return data;
    } catch (error: any) {
      console.error('❌ [GET_MENTOR_EARNINGS] Failed', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to fetch mentor earnings.');
    }
  }

  /**
   * GET /api/v1/mentorship/analytics/mentor/:mentorId/sessions
   * Session completion & cancellation analytics.
   */
  static async getMentorSessions(mentorId: string, days?: number): Promise<ApiResponse> {
    try {
      const params: any = {};
      if (days) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        params.startDate = startDate.toISOString();
        params.endDate = endDate.toISOString();
      }
      const { data } = await api.get<ApiResponse>(`${BASE_PATH}/mentor/${mentorId}/sessions`, { params });
      return data;
    } catch (error: any) {
      console.error('❌ [GET_MENTOR_SESSIONS] Failed', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to fetch session analytics.');
    }
  }

  /**
   * GET /api/v1/mentorship/analytics/mentor/:mentorId/reviews
   * Mentor review sentiment & breakdown metrics.
   */
  static async getMentorReviewAnalytics(mentorId: string): Promise<ApiResponse> {
    try {
      const { data } = await api.get<ApiResponse>(`${BASE_PATH}/mentor/${mentorId}/reviews`);
      return data;
    } catch (error: any) {
      console.error('❌ [GET_MENTOR_REVIEW_ANALYTICS] Failed', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to fetch review analytics.');
    }
  }

  // ── Platform-Wide Analytics ──────────────────────────────────

  /**
   * GET /api/v1/mentorship/analytics/platform/stats
   * Platform-wide session and user volume.
   */
  static async getPlatformStats(): Promise<ApiResponse> {
    try {
      const { data } = await api.get<ApiResponse>(`${BASE_PATH}/platform/stats`);
      return data;
    } catch (error: any) {
      console.error('❌ [GET_PLATFORM_STATS] Failed', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to fetch platform stats.');
    }
  }

  /**
   * GET /api/v1/mentorship/analytics/platform/revenue
   * Platform total GMV and fee earnings.
   */
  static async getPlatformRevenue(params: { startDate?: string; endDate?: string } = {}): Promise<ApiResponse> {
    try {
      const { data } = await api.get<ApiResponse>(`${BASE_PATH}/platform/revenue`, { params });
      return data;
    } catch (error: any) {
      console.error('❌ [GET_PLATFORM_REVENUE] Failed', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to fetch platform revenue.');
    }
  }

  /**
   * GET /api/v1/mentorship/analytics/platform/sessions
   * Global session distribution.
   */
  static async getPlatformSessions(params: { startDate?: string; endDate?: string } = {}): Promise<ApiResponse> {
    try {
      const { data } = await api.get<ApiResponse>(`${BASE_PATH}/platform/sessions`, { params });
      return data;
    } catch (error: any) {
      console.error('❌ [GET_PLATFORM_SESSIONS] Failed', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to fetch platform sessions.');
    }
  }

  /**
   * GET /api/v1/mentorship/analytics/platform/mentors
   * Global mentor activity metrics.
   */
  static async getPlatformMentors(): Promise<ApiResponse> {
    try {
      const { data } = await api.get<ApiResponse>(`${BASE_PATH}/platform/mentors`);
      return data;
    } catch (error: any) {
      console.error('❌ [GET_PLATFORM_MENTORS] Failed', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to fetch platform mentors.');
    }
  }

  /**
   * GET /api/v1/mentorship/analytics/platform/growth
   * Month-over-month growth analytics.
   */
  static async getPlatformGrowth(months = 6): Promise<ApiResponse> {
    try {
      const { data } = await api.get<ApiResponse>(`${BASE_PATH}/platform/growth`, { params: { months } });
      return data;
    } catch (error: any) {
      console.error('❌ [GET_PLATFORM_GROWTH] Failed', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to fetch platform growth.');
    }
  }
}

export default AnalyticsService;



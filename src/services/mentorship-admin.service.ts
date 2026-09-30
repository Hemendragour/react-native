import { api } from './auth.service';

const BASE_PATH = '/api/v1/mentorship/admin';

export interface AdminMentorFilter {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminSessionFilter {
  status?: string;
  mentorId?: string;
  menteeId?: string;
  page?: number;
  limit?: number;
}

export interface AdminReviewFilter {
  mentorId?: string;
  isReported?: boolean;
  page?: number;
  limit?: number;
}

class MentorshipAdminService {
  /**
   * GET /api/v1/mentorship/admin/dashboard
   * Master dashboard KPIs (active mentors, session GMV, issues).
   */
  static async getDashboardKPIs(): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/dashboard`);
      return data;
    } catch (error: any) {
      console.error('❌ [ADMIN_DASHBOARD] Failed', error?.response?.data || error?.message);
      throw error;
    }
  }

  /**
   * GET /api/v1/mentorship/admin/mentors
   * Paginated mentor list (?status=, ?search=).
   */
  static async getAllMentors(params?: AdminMentorFilter): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/mentors`, { params });
      return data;
    } catch (error: any) {
      console.error('❌ [ADMIN_MENTORS] Failed', error?.response?.data || error?.message);
      throw error;
    }
  }

  /**
   * GET /api/v1/mentorship/admin/mentors/pending
   * Mentors waiting for verification/approval.
   */
  static async getPendingMentors(params?: { page?: number; limit?: number }): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/mentors/pending`, { params });
      return data;
    } catch (error: any) {
      console.error('❌ [ADMIN_PENDING_MENTORS] Failed', error?.response?.data || error?.message);
      throw error;
    }
  }

  /**
   * POST /api/v1/mentorship/admin/mentors/:id/status
   * Update mentor account status (approved, rejected, suspended).
   */
  static async updateMentorStatus(mentorId: string, status: 'approved' | 'rejected' | 'suspended', reason?: string): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/mentors/${mentorId}/status`, { status, reason });
      return data;
    } catch (error: any) {
      console.error('❌ [ADMIN_UPDATE_MENTOR_STATUS] Failed', error?.response?.data || error?.message);
      throw error;
    }
  }

  /**
   * GET /api/v1/mentorship/admin/sessions
   * All platform session logs & statuses.
   */
  static async getAllSessions(params?: AdminSessionFilter): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/sessions`, { params });
      return data;
    } catch (error: any) {
      console.error('❌ [ADMIN_SESSIONS] Failed', error?.response?.data || error?.message);
      throw error;
    }
  }

  /**
   * GET /api/v1/mentorship/admin/reviews
   * All reviews with filter for reported reviews.
   */
  static async getAllReviews(params?: AdminReviewFilter): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/reviews`, { params });
      return data;
    } catch (error: any) {
      console.error('❌ [ADMIN_REVIEWS] Failed', error?.response?.data || error?.message);
      throw error;
    }
  }

  /**
   * GET /api/v1/mentorship/admin/reviews/reported
   * Flagged & reported reviews queue.
   */
  static async getReportedReviews(params?: { page?: number; limit?: number }): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/reviews/reported`, { params });
      return data;
    } catch (error: any) {
      console.error('❌ [ADMIN_REPORTED_REVIEWS] Failed', error?.response?.data || error?.message);
      throw error;
    }
  }

  /**
   * POST /api/v1/mentorship/admin/reviews/:id/moderate
   * Moderate review (approve, hide, delete).
   */
  static async moderateReview(reviewId: string, action: 'approve' | 'hide' | 'delete', reason?: string): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/reviews/${reviewId}/moderate`, { action, reason });
      return data;
    } catch (error: any) {
      console.error('❌ [ADMIN_MODERATE_REVIEW] Failed', error?.response?.data || error?.message);
      throw error;
    }
  }

  /**
   * GET /api/v1/mentorship/admin/payments
   * Platform payment ledger & transaction audit logs.
   */
  static async getPaymentAuditLogs(params?: { page?: number; limit?: number; status?: string }): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/payments`, { params });
      return data;
    } catch (error: any) {
      console.error('❌ [ADMIN_PAYMENTS] Failed', error?.response?.data || error?.message);
      throw error;
    }
  }
}

export default MentorshipAdminService;

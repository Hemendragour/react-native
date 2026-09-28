import { api } from './auth.service';

// ── Interfaces ─────────────────────────────────────────────────────────────────

export interface JoinWaitlistInput {
  mentorId: string;
  preferredSlots?: string[];
  message?: string;
}

const BASE_PATH = '/api/v1/mentorship/waitlist';

class WaitlistService {
  /**
   * POST /api/v1/mentorship/waitlist/join
   * Join waitlist when mentor slots are fully booked.
   */
  static async joinWaitlist(input: JoinWaitlistInput): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/join`, input);
      return data;
    } catch (error: any) {
      console.error('❌ [WAITLIST] Failed to join', error);
      throw error;
    }
  }

  /**
   * GET /api/v1/mentorship/waitlist/position/:mentorId
   * Get user's current queue position for a specific mentor.
   */
  static async getQueuePosition(mentorId: string): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/position/${mentorId}`);
      return data;
    } catch (error: any) {
      console.error('❌ [WAITLIST] Failed to get position', error);
      throw error;
    }
  }

  /**
   * GET /api/v1/mentorship/waitlist/my-waitlists
   * Get all active waitlist requests of current user.
   */
  static async getMyWaitlists(): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/my-waitlists`);
      return data;
    } catch (error: any) {
      console.error('❌ [WAITLIST] Failed to get my waitlists', error);
      throw error;
    }
  }

  /**
   * GET /api/v1/mentorship/waitlist/mentor/:mentorId
   * Mentor views their waitlist queue.
   */
  static async getMentorWaitlist(mentorId: string): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/mentor/${mentorId}`);
      return data;
    } catch (error: any) {
      console.error('❌ [WAITLIST] Failed to get mentor waitlist', error);
      throw error;
    }
  }

  /**
   * POST /api/v1/mentorship/waitlist/notify/:mentorId
   * Mentor notifies next in line that a slot opened up.
   */
  static async notifyNextInLine(mentorId: string): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/notify/${mentorId}`);
      return data;
    } catch (error: any) {
      console.error('❌ [WAITLIST] Failed to notify next in line', error);
      throw error;
    }
  }

  /**
   * PUT /api/v1/mentorship/waitlist/:waitlistId/book
   * Convert notified waitlist spot into a confirmed booking.
   */
  static async convertToBooking(waitlistId: string, bookingPayload?: any): Promise<any> {
    try {
      const { data } = await api.put(`${BASE_PATH}/${waitlistId}/book`, bookingPayload || {});
      return data;
    } catch (error: any) {
      console.error('❌ [WAITLIST] Failed to convert to booking', error);
      throw error;
    }
  }

  /**
   * DELETE /api/v1/mentorship/waitlist/:waitlistId
   * Leave / remove from waitlist.
   */
  static async leaveWaitlist(waitlistId: string): Promise<any> {
    try {
      const { data } = await api.delete(`${BASE_PATH}/${waitlistId}`);
      return data;
    } catch (error: any) {
      console.error('❌ [WAITLIST] Failed to leave waitlist', error);
      throw error;
    }
  }

  /**
   * POST /api/v1/mentorship/waitlist/:waitlistId/approve
   * Mentor manually approves a mentee on the waitlist.
   */
  static async approveWaitlistEntry(waitlistId: string): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/${waitlistId}/approve`);
      return data;
    } catch (error: any) {
      console.error('❌ [WAITLIST] Failed to approve waitlist entry', error);
      throw error;
    }
  }

  /**
   * GET /api/v1/mentorship/waitlist/stats/:mentorId
   * Get waitlist analytics for a mentor.
   */
  static async getWaitlistStats(mentorId: string): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/stats/${mentorId}`);
      return data;
    } catch (error: any) {
      console.error('❌ [WAITLIST] Failed to get stats', error);
      throw error;
    }
  }
}

export default WaitlistService;


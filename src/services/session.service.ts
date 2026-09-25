import { api } from './auth.service';

// ── Types ──────────────────────────────────────────────────
export interface CreateSessionInput {
  sessionType: string;
  scheduledAt: string;
  timezone: string;
  title: string;
  description?: string;
  paymentMethod: string;
  duration: number;
  followUp?: {
    allowed: boolean;
    periodDays: number;
  };
  bufferTimeMinutes?: number;
  pricing: {
    basePrice: number;
    platformFee: number;
    totalAmount: number;
    currency?: string;
  };
  thumbnailImageFile?: any;
}

export interface SessionFilters {
  page?: number;
  limit?: number;
  status?: string;
  sessionType?: string;
  role?: 'mentor' | 'mentee';
  startDate?: string;
  endDate?: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: any;
}

export interface BookSessionInput {
  sessionId: string;
  mentorId: string;
  availabilityId: string;
  slotTime: string;
  scheduledAt: string;
  timezone: string;
  paymentMethod: string;
  pricing: {
    basePrice: number;
    platformFee: number;
    totalAmount: number;
    currency?: string;
  };
}

export interface SessionReviewInput {
  rating: number;
  comment: string;
  tags?: string[];
}

class SessionService {

  // ── CREATE SESSION ─────────────────────────────────────
  static async createSession(input: CreateSessionInput): Promise<ApiResponse> {
    try {
      console.log('📅 [CREATE_SESSION] Creating...', { sessionType: input.sessionType, scheduledAt: input.scheduledAt });
      let payload: any = { ...input };
      let config: any = {};

      if (payload.pricing && !payload.pricing.currency) {
        payload.pricing = { ...payload.pricing, currency: 'INR' };
      }

      if (input.thumbnailImageFile) {
        const form = new FormData();
        form.append('sessionType', input.sessionType);
        form.append('scheduledAt', input.scheduledAt);
        form.append('timezone', input.timezone);
        form.append('title', input.title);
        if (input.description) form.append('description', input.description);
        form.append('paymentMethod', input.paymentMethod);
        form.append('duration', input.duration.toString());
        if (input.followUp) form.append('followUp', JSON.stringify(input.followUp));
        if (input.bufferTimeMinutes !== undefined) form.append('bufferTimeMinutes', input.bufferTimeMinutes.toString());
        form.append('pricing', JSON.stringify(payload.pricing));
        form.append('thumbnailImage', {
          uri: input.thumbnailImageFile.uri,
          name: input.thumbnailImageFile.name || 'thumbnail.jpg',
          type: input.thumbnailImageFile.type || 'image/jpeg',
        } as any);
        payload = form;
        config.headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        delete payload.thumbnailImageFile;
      }

      const { data } = await api.post<ApiResponse>('/api/v1/mentorship/sessions/create', payload, config);
      return data;
    } catch (error: any) {
      const errData = error?.response?.data;
      const backendErrors = errData?.errors;
      let detailedMsg = '';
      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        detailedMsg = backendErrors.map((e: any) => {
          if (typeof e === 'string') return e;
          return e?.message || e?.msg || (e?.field ? `${e.field}: ${e.message || 'invalid'}` : JSON.stringify(e));
        }).join('; ');
      } else if (backendErrors && typeof backendErrors === 'object') {
        detailedMsg = Object.entries(backendErrors).map(([k, v]: any) => `${k}: ${v?.message || v}`).join('; ');
      }
      const finalMsg = detailedMsg || errData?.message || error?.message || 'Failed to create session.';
      console.error('❌ [CREATE_SESSION] Failed:', finalMsg, JSON.stringify(errData));

      if (error?.response?.status === 400) throw new Error(finalMsg || 'Invalid session data.');
      if (error?.response?.status === 404) throw new Error('Mentor not found.');
      if (error?.response?.status === 409) throw new Error('Slot already booked.');
      if (error?.code === 'ERR_NETWORK') throw new Error('Unable to connect to server.');
      throw new Error(finalMsg);
    }
  }

  // ── GET MENTOR SESSIONS ────────────────────────────────
  static async getMentorSessions(mentorId: string): Promise<ApiResponse> {
    try {
      const { data } = await api.get<ApiResponse>(`/api/v1/mentorship/sessions/mentor/${mentorId}`);
      console.log('✅ [GET_MENTOR_SESSIONS] Fetched:', data, 'sessions');
      return data;
    } catch (error: any) {
      console.error('❌ [GET_MENTOR_SESSIONS] Failed', error?.response?.data);
      throw new Error(error?.response?.data?.message || 'Failed to fetch mentor sessions.');
    }
  }

  // ── BOOK SESSION ──────────────────────────────────────
  static async bookSession(input: BookSessionInput): Promise<ApiResponse> {
    try {
      const { data } = await api.post<ApiResponse>('/api/v1/mentorship/sessions/book', input);
      return data;
    } catch (error: any) {
      console.error('❌ [BOOK_SESSION] Failed', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to book session.');
    }
  }

  // ── GET UPCOMING SESSIONS ──────────────────────────────
  static async getUpcomingSessions(): Promise<ApiResponse> {
    try {
      const { data } = await api.get<ApiResponse>('/api/v1/mentorship/sessions/upcoming');
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch upcoming sessions.');
    }
  }

  // ── GET PAST SESSIONS ─────────────────────────────────
  static async getPastSessions(): Promise<ApiResponse> {
    try {
      const { data } = await api.get<ApiResponse>('/api/v1/mentorship/sessions/past');
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch past sessions.');
    }
  }

  // ── GET SESSION STATS ─────────────────────────────────
  static async getSessionStats(): Promise<ApiResponse> {
    try {
      const { data } = await api.get<ApiResponse>('/api/v1/mentorship/sessions/stats');
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch session stats.');
    }
  }

  // ── GET ALL SESSIONS FROM DB ───────────────────────────────
  static async getAllSessionsFromDB(filters: { page?: number; limit?: number } = {}): Promise<ApiResponse> {
    try {
      const { data } = await api.get<ApiResponse>('/api/v1/mentorship/sessions/get-all-db', { params: filters });
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch all sessions.');
    }
  }

  // ── GET SESSION BY ID ──────────────────────────────────
  static async getSessionById(sessionId: string): Promise<ApiResponse> {
    try {
      const { data } = await api.get<ApiResponse>(`/api/v1/mentorship/sessions/${sessionId}`);
      return data;
    } catch (error: any) {
      console.error('❌ [GET_SESSION] Failed', error?.response?.data || error?.message);
      if (error?.response?.status === 404) throw new Error('Session not found.');
      if (error?.response?.status === 403) throw new Error('Not authorized to view this session.');
      if (error?.code === 'ERR_NETWORK') throw new Error('Unable to connect to server.');
      throw new Error(error?.response?.data?.message || 'Failed to fetch session.');
    }
  }

  // ── GET SESSION PROGRESS ────────────────────────────────
  static async getSessionProgress(sessionId: string): Promise<ApiResponse> {
    try {
      const { data } = await api.get<ApiResponse>(`/api/v1/mentorship/sessions/${sessionId}/progress`);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch session progress.');
    }
  }

  // ── GET SESSION RECEIPT ─────────────────────────────────
  static async getSessionReceipt(sessionId: string, bookingId?: string): Promise<ApiResponse> {
    try {
      const params = bookingId ? { bookingId } : {};
      const { data } = await api.get<ApiResponse>(`/api/v1/mentorship/sessions/${sessionId}/receipt`, { params });
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch session receipt.');
    }
  }

  // ── GET REFUND ESTIMATE ─────────────────────────────────
  static async getRefundEstimate(sessionId: string): Promise<ApiResponse> {
    try {
      const { data } = await api.get<ApiResponse>(`/api/v1/mentorship/sessions/${sessionId}/refund-estimate`);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch refund estimate.');
    }
  }

  // ── GET ALL SESSIONS ───────────────────────────────────
  static async getAllSessions(filters: SessionFilters = {}): Promise<ApiResponse> {
    try {
      console.log('📋 [GET_ALL_SESSIONS] Fetching with filters:', filters);
      const { data } = await api.get<ApiResponse>('/api/v1/mentorship/sessions/get-all', { params: filters });
      return data;
    } catch (error: any) {
      console.error('❌ [GET_ALL_SESSIONS] Failed', error?.response?.data || error?.message);
      if (error?.response?.status === 401) throw new Error('Please login again.');
      if (error?.code === 'ERR_NETWORK') throw new Error('Unable to connect to server.');
      throw new Error(error?.response?.data?.message || 'Failed to fetch sessions.');
    }
  }

  // ── CONFIRM SESSION ────────────────────────────────────
  static async confirmSession(sessionId: string, bookingId?: string): Promise<ApiResponse> {
    try {
      const { data } = await api.post<ApiResponse>(`/api/v1/mentorship/sessions/${sessionId}/confirm`, { bookingId });
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to confirm session.');
    }
  }

  // ── START SESSION ──────────────────────────────────────
  static async startSession(sessionId: string): Promise<ApiResponse> {
    try {
      const { data } = await api.post<ApiResponse>(`/api/v1/mentorship/sessions/${sessionId}/start`);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to start session.');
    }
  }

  // ── COMPLETE SESSION ───────────────────────────────────
  static async completeSession(sessionId: string, payload: { actualDuration?: number; notes?: string; keyTakeaways?: string[] }): Promise<ApiResponse> {
    try {
      const { data } = await api.post<ApiResponse>(`/api/v1/mentorship/sessions/${sessionId}/complete`, payload);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to complete session.');
    }
  }

  // ── CANCEL SESSION ─────────────────────────────────────
  static async cancelSession(sessionId: string, payload: { reason: string }): Promise<ApiResponse> {
    try {
      const { data } = await api.post<ApiResponse>(`/api/v1/mentorship/sessions/${sessionId}/cancel`, payload);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to cancel session.');
    }
  }

  // ── RESCHEDULE SESSION ─────────────────────────────────
  static async rescheduleSession(sessionId: string, payload: { newScheduledAt: string; reason: string }): Promise<ApiResponse> {
    try {
      const { data } = await api.post<ApiResponse>(`/api/v1/mentorship/sessions/${sessionId}/reschedule`, payload);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to reschedule session.');
    }
  }

  // ── SUBMIT SESSION REVIEW (Mentee) ─────────────────────
  static async submitSessionReview(sessionId: string, payload: SessionReviewInput): Promise<ApiResponse> {
    try {
      const { data } = await api.post<ApiResponse>(`/api/v1/mentorship/sessions/${sessionId}/review`, payload);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to submit session review.');
    }
  }

  // ── UPDATE SESSION ─────────────────────────────────────
  static async updateSession(sessionId: string, input: Partial<CreateSessionInput>): Promise<ApiResponse> {
    try {
      let payload: any = input;
      let config: any = {};
      if (input.thumbnailImageFile) {
        const form = new FormData();
        if (input.sessionType) form.append('sessionType', input.sessionType);
        if (input.scheduledAt) form.append('scheduledAt', input.scheduledAt);
        if (input.timezone) form.append('timezone', input.timezone);
        if (input.title) form.append('title', input.title);
        if (input.description) form.append('description', input.description);
        if (input.paymentMethod) form.append('paymentMethod', input.paymentMethod);
        if (input.duration !== undefined) form.append('duration', input.duration.toString());
        if (input.followUp) form.append('followUp', JSON.stringify(input.followUp));
        if (input.bufferTimeMinutes !== undefined) form.append('bufferTimeMinutes', input.bufferTimeMinutes.toString());
        if (input.pricing) form.append('pricing', JSON.stringify(input.pricing));
        form.append('thumbnailImage', {
          uri: input.thumbnailImageFile.uri,
          name: input.thumbnailImageFile.name || 'thumbnail.jpg',
          type: input.thumbnailImageFile.type || 'image/jpeg',
        } as any);
        payload = form;
        config.headers = { 'Content-Type': 'multipart/form-data' };
      }
      const { data } = await api.put<ApiResponse>(`/api/v1/mentorship/sessions/${sessionId}`, payload, config);
      return data;
    } catch (error: any) {
      console.error('❌ [UPDATE_SESSION] Failed', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to update session.');
    }
  }

  // ── DELETE SESSION ─────────────────────────────────────
  static async deleteSession(sessionId: string): Promise<ApiResponse> {
    try {
      const { data } = await api.delete<ApiResponse>(`/api/v1/mentorship/sessions/${sessionId}`);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to delete session.');
    }
  }
}

export default SessionService;
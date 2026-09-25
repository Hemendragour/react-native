import { api } from './auth.service';

export interface QueryPricing {
  amount: number;
  currency?: string;
  transactionId?: string;
  paidAt?: string;
}

export interface SubmitQueryInput {
  mentorId: string;
  question: string;
  context?: string;
  attachments?: string[];
  category?: string;
  priority?: 'normal' | 'high';
  pricing: QueryPricing;
}

export interface QueryItem {
  _id?: string;
  queryId: string;
  mentorId: string;
  menteeId: string;
  question: string;
  context?: string;
  answer?: string;
  answeredAt?: string;
  status: 'pending' | 'answered' | 'expired';
  priority: 'normal' | 'high';
  category?: string;
  pricing: QueryPricing;
  followUp?: {
    question: string;
    answer?: string;
    askedAt: string;
    answeredAt?: string;
  };
  feedback?: {
    rating: number;
    comment?: string;
    submittedAt: string;
  };
  createdAt: string;
  mentor?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    profilePhotoId?: string | null;
  };
  mentee?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    profilePhotoId?: string | null;
  };
}

const BASE_PATH = '/api/v1/mentorship/queries';

export const QueryService = {
  /**
   * POST /api/v1/mentorship/queries/submit
   * Mentee: Submit a new async question/query to a mentor.
   */
  async submitQuery(input: SubmitQueryInput): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/submit`, input);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to submit query', error);
      throw error;
    }
  },

  /**
   * GET /api/v1/mentorship/queries
   * Get all queries by role ('mentor' or 'mentee').
   */
  async getAllQueries(params: {
    page?: number;
    limit?: number;
    status?: string;
    role?: 'mentor' | 'mentee';
  } = {}): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}`, { params });
      return data;
    } catch (error: any) {
      console.error('❌ Failed to fetch queries', error);
      return { data: [] };
    }
  },

  /**
   * GET /api/v1/mentorship/queries/:id
   * Get query thread & discussion details.
   */
  async getQueryById(queryId: string): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/${queryId}`);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to fetch query by ID', error);
      throw error;
    }
  },

  /**
   * GET /api/v1/mentorship/queries/pending
   * Mentor: Get unanswered queries awaiting response.
   */
  async getPendingQueries(): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/pending`);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to fetch pending queries', error);
      return { data: [] };
    }
  },

  /**
   * GET /api/v1/mentorship/queries/stats
   * Get query resolution metrics & counts.
   */
  async getQueryStats(role: 'mentor' | 'mentee' = 'mentee'): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/stats`, { params: { role } });
      return data;
    } catch (error: any) {
      console.error('❌ Failed to fetch query stats', error);
      return { data: null };
    }
  },

  /**
   * POST /api/v1/mentorship/queries/:id/answer
   * Mentor: Submit answer to a pending query.
   */
  async answerQuery(queryId: string, answer: string): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/${queryId}/answer`, { answer });
      return data;
    } catch (error: any) {
      console.error('❌ Failed to answer query', error?.response?.data || error);
      throw error;
    }
  },

  /**
   * POST /api/v1/mentorship/queries/:id/follow-up
   * Mentee: Submit a follow-up question.
   */
  async submitFollowUp(queryId: string, question: string): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/${queryId}/follow-up`, { question });
      return data;
    } catch (error: any) {
      console.error('❌ Failed to submit follow-up', error);
      throw error;
    }
  },

  /**
   * POST /api/v1/mentorship/queries/:id/follow-up/answer
   * Mentor: Answer a follow-up question.
   */
  async answerFollowUp(queryId: string, answer: string): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/${queryId}/follow-up/answer`, { answer });
      return data;
    } catch (error: any) {
      console.error('❌ Failed to answer follow-up', error);
      throw error;
    }
  },

  /**
   * POST /api/v1/mentorship/queries/:id/feedback
   * Mentee: Rate query resolution quality.
   */
  async submitQueryFeedback(queryId: string, payload: { rating: number; comment?: string }): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/${queryId}/feedback`, payload);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to submit query feedback', error);
      throw error;
    }
  },

  // ── Convenience aliases ───────────────────────────────────────────────────────

  async getMentorQueries(params?: { status?: string; page?: number; limit?: number }): Promise<any> {
    return this.getAllQueries({ ...params, role: 'mentor' });
  },

  async getMenteeQueries(params?: { status?: string; page?: number; limit?: number }): Promise<any> {
    return this.getAllQueries({ ...params, role: 'mentee' });
  },
};

export default QueryService;

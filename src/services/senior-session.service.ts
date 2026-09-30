import { api } from './auth.service';

export interface SeniorSessionInput {
  title: string;
  description: string;
  duration: number;
  category?: string;
  scheduledAt: string;
  timezone?: string;
  price: number;
  maxAttendees?: number;
  topics?: string[];
  prerequisites?: string[];
  thumbnailImageFile?: any;
}

const BASE_PATH = '/api/v1/mentorship/senior-sessions';

class SeniorSessionService {
  /**
   * GET /api/v1/mentorship/senior-sessions
   * List senior mentor sessions.
   */
  static async getSeniorSessions(params: { page?: number; limit?: number; mentorId?: string } = {}): Promise<any> {
    try {
      const { data } = await api.get(BASE_PATH, { params });
      return data;
    } catch (error: any) {
      console.error('❌ [SENIOR_SESSION] Failed to fetch senior sessions', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to fetch senior sessions.');
    }
  }

  /**
   * POST /api/v1/mentorship/senior-sessions
   * Create a new senior mentor session.
   */
  static async createSeniorSession(input: SeniorSessionInput): Promise<any> {
    try {
      let payload: any = input;
      let config: any = {};
      if (input.thumbnailImageFile) {
        const form = new FormData();
        Object.keys(input).forEach((key) => {
          if (key === 'thumbnailImageFile') {
            form.append('thumbnailImage', {
              uri: input.thumbnailImageFile.uri,
              name: input.thumbnailImageFile.name || 'senior_session.jpg',
              type: input.thumbnailImageFile.type || 'image/jpeg',
            } as any);
          } else {
            const val = (input as any)[key];
            if (val !== undefined && val !== null) {
              form.append(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
            }
          }
        });
        payload = form;
        config.headers = { 'Content-Type': 'multipart/form-data' };
      }
      const { data } = await api.post(BASE_PATH, payload, config);
      return data;
    } catch (error: any) {
      console.error('❌ [SENIOR_SESSION] Failed to create senior session', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to create senior session.');
    }
  }

  /**
   * GET /api/v1/mentorship/senior-sessions/:sessionId
   * Fetch individual senior mentor session.
   */
  static async getSeniorSessionById(sessionId: string): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/${sessionId}`);
      return data;
    } catch (error: any) {
      console.error(`❌ [SENIOR_SESSION] Failed to fetch senior session ${sessionId}`, error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to fetch senior session.');
    }
  }

  /**
   * PUT /api/v1/mentorship/senior-sessions/:sessionId
   * Update senior session details.
   */
  static async updateSeniorSession(sessionId: string, payload: Partial<SeniorSessionInput>): Promise<any> {
    try {
      const { data } = await api.put(`${BASE_PATH}/${sessionId}`, payload);
      return data;
    } catch (error: any) {
      console.error(`❌ [SENIOR_SESSION] Failed to update senior session ${sessionId}`, error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to update senior session.');
    }
  }

  /**
   * DELETE /api/v1/mentorship/senior-sessions/:sessionId
   * Delete senior session.
   */
  static async deleteSeniorSession(sessionId: string): Promise<any> {
    try {
      const { data } = await api.delete(`${BASE_PATH}/${sessionId}`);
      return data;
    } catch (error: any) {
      console.error(`❌ [SENIOR_SESSION] Failed to delete senior session ${sessionId}`, error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to delete senior session.');
    }
  }
}

export default SeniorSessionService;

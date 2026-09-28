// Use the shared, authenticated axios instance (handles JWT + refresh)
import { api } from './auth.service';

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface Mentor {
  _id: string;
  mentorId: string;
  userId: string;
  companyId?: string;
  status: string;
  title: string;
  tagline: string;
  bio: string;
  profilePic?: string;
  domains: string[];
  skills: string[];
  experience: {
    total: number;
    level: string;
    currentRole: string;
  };
  stats: {
    averageRating: number;
    totalSessions: number;
    totalReviews: number;
  };
  user?: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string | null;
    profilePhotoId?: string | null;
  } | null;
}

export interface MentorApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MentorApiResponse {
  success: boolean;
  message: string;
  data: Mentor[];
  meta: MentorApiMeta;
}

/** Input accepted by POST /api/v1/mentorship/mentors/create */
export interface BecomeMentorInput {
  title: string;
  bio: string;
  tagline?: string;
  domains: string[];
  skills: string[];
  experienceTotal: number;
  experienceCurrentRole: string;
  companyId?: string;
  /** Local file URI from react-native-image-picker (file:// or content://) */
  profilePicUrl: string;
  /** MIME type returned by the image picker, e.g. 'image/jpeg' */
  profilePicType?: string;
  /** File name returned by the image picker */
  profilePicName?: string;
}

export interface UpdateMentorPayload {
  title?: string;
  bio?: string;
  tagline?: string;
  domains?: string[];
  skills?: string[];
  experience?: {
    total?: number;
    level?: string;
    currentRole?: string;
    previousRoles?: any[];
  };
  socialProof?: {
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    achievements?: string[];
    certifications?: string[];
  };
  profilePicFile?: { uri: string; type: string; name: string };
  bannerImageFile?: { uri: string; type: string; name: string };
}

export interface MentorSearchFilters {
  keyword?: string;
  domains?: string[];
  companyIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  minExperience?: number;
  skills?: string[];
  languages?: string[];
  sortBy?: string;
  page?: number;
  limit?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_PATH = '/api/v1/mentorship';

// ─── Standalone helpers (used by Redux slice) ─────────────────────────────────

export const fetchAllMentors = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<MentorApiResponse> => {
  const resp = await api.get<MentorApiResponse>(`${BASE_PATH}/mentors/all`, { params });
  if (__DEV__) {
    console.log('🧑‍🏫 Mentor list response →', resp.data);
  }
  return resp.data;
};

// ─── MentorshipService ────────────────────────────────────────────────────────

class MentorshipService {
  static cachedIsMentor: boolean | null = null;

  // ── 1. Mentor Profile ─────────────────────────────────────────────────────────

  /**
   * GET /api/v1/mentorship/mentors/me
   * Returns the enriched mentor profile for the currently authenticated user.
   */
  static async getMyMentor(): Promise<any> {
    try {
      const response = await api.get(`${BASE_PATH}/mentors/me`);
      if (__DEV__) console.log('🧑‍🏫 Mentor profile fetched →', response.data);
      const data = response.data?.data;
      if (data && (data._id || data.mentorId || data.id)) {
        MentorshipService.cachedIsMentor = true;
      }
      return data;
    } catch (error: any) {
      if (error.response && (error.response.status === 404 || error.response.status === 500)) {
        if (__DEV__) console.log(`ℹ️ User is not a mentor (${error.response.status})`);
        MentorshipService.cachedIsMentor = false;
        return null;
      }
      console.error('❌ Failed to fetch mentor profile', error);
      throw error;
    }
  }

  /**
   * GET /api/v1/mentorship/mentors/me/trust-score
   * Returns deep trust score diagnostics, percentile, factors & improvement tips.
   */
  static async getMyTrustScore(): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/mentors/me/trust-score`);
      if (__DEV__) console.log('🛡️ Trust score fetched →', data);
      return data?.data ?? data;
    } catch (error: any) {
      console.error('❌ Failed to fetch trust score', error);
      throw error;
    }
  }

  /**
   * GET /api/v1/mentorship/trust-score/:userId
   * Returns trust score breakdown for any user by userId.
   */
  static async getTrustScoreByUserId(userId: string): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/trust-score/${userId}`);
      return data?.data ?? data;
    } catch (error: any) {
      console.error(`❌ Failed to fetch trust score for user ${userId}`, error);
      throw error;
    }
  }

  /**
   * GET /api/v1/mentorship/mentors/all
   * Returns paginated list of all verified mentors.
   */
  static async getAllMentors(params?: { page?: number; limit?: number }): Promise<MentorApiResponse> {
    return fetchAllMentors(params);
  }

  /**
   * GET /api/v1/mentorship/mentors/:mentorId
   * Returns a single mentor profile by its ID.
   */
  static async getMentorProfile(mentorId: string): Promise<any> {
    try {
      const response = await api.get(`${BASE_PATH}/mentors/${mentorId}`);
      if (__DEV__) console.log(`🧑‍🏫 Mentor profile ${mentorId} fetched →`, response.data);
      return response.data?.data ?? response.data;
    } catch (error: any) {
      if (error?.response?.status === 404 || error?.status === 404) {
        try {
          const userRes = await api.get(`${BASE_PATH}/mentors/user/${mentorId}`);
          if (__DEV__) console.log(`🧑‍🏫 Mentor profile by userId ${mentorId} fetched →`, userRes.data);
          return userRes.data?.data ?? userRes.data;
        } catch (innerError) {
          // If both fail, log a gentle warning and allow peer fallback in UI
          if (__DEV__) console.warn(`ℹ️ No mentor record found for ID: ${mentorId}, attempting peer profile fallback.`);
        }
      } else {
        console.error(`❌ Failed to fetch mentor profile for ${mentorId}`, error?.response?.data || error);
      }
      throw error;
    }
  }

  /**
   * GET /api/v1/mentorship/mentors/user/:userId
   * Returns the mentor profile by the user's userId.
   */
  static async getMentorByUserId(userId: string): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/mentors/user/${userId}`);
      return data?.data ?? data;
    } catch (error: any) {
      console.error(`❌ Failed to fetch mentor by userId ${userId}`, error);
      throw error;
    }
  }

  /**
   * GET /api/v1/mentorship/mentors/:mentorId/stats
   * Returns public mentor statistics (sessions count, rating, etc.)
   */
  static async getMentorPublicStats(mentorId: string): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/mentors/${mentorId}/stats`);
      return data?.data ?? data;
    } catch (error: any) {
      console.error(`❌ Failed to fetch mentor stats for ${mentorId}`, error);
      throw error;
    }
  }

  /**
   * POST /api/v1/mentorship/mentors/create
   * Registers the authenticated user as a new mentor.
   */
  static async becomeMentor(input: BecomeMentorInput): Promise<any> {
    try {
      const form = new FormData();
      form.append('title', input.title);
      form.append('bio', input.bio);
      if (input.tagline) form.append('tagline', input.tagline);
      if (input.companyId) form.append('companyId', input.companyId);
      form.append('domains', JSON.stringify(input.domains));
      form.append('skills', JSON.stringify(input.skills));
      form.append('experience', JSON.stringify({
        total: input.experienceTotal,
        currentRole: input.experienceCurrentRole,
      }));
      const uri = input.profilePicUrl;
      const mimeType = input.profilePicType || 'image/jpeg';
      const ext = mimeType.split('/')[1] || 'jpg';
      const fileName = input.profilePicName || `mentor_pic_${Date.now()}.${ext}`;
      form.append('profilePic', { uri, name: fileName, type: mimeType } as any);
      const response = await api.post(`${BASE_PATH}/mentors/create`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (__DEV__) console.log('✅ Mentor application submitted →', response.data);
      MentorshipService.cachedIsMentor = true;
      return response.data;
    } catch (error) {
      console.error('❌ Failed to submit mentor application', error);
      throw error;
    }
  }

  /**
   * PUT /api/v1/mentorship/mentors/:mentorId
   * Updates the core professional profile for the given mentor.
   */
  static async updateMentorProfile(mentorId: string, payload: UpdateMentorPayload): Promise<any> {
    try {
      const hasFiles = Boolean(payload.profilePicFile || payload.bannerImageFile);
      let finalPayload: any = payload;
      let headers: any = {};
      if (hasFiles) {
        const form = new FormData();
        Object.keys(payload).forEach((key) => {
          if (key === 'profilePicFile' && payload.profilePicFile) {
            form.append('profilePic', payload.profilePicFile as any);
          } else if (key === 'bannerImageFile' && payload.bannerImageFile) {
            form.append('bannerImage', payload.bannerImageFile as any);
          } else {
            const value = (payload as any)[key];
            if (value !== undefined && value !== null) {
              form.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
            }
          }
        });
        finalPayload = form;
        headers = { 'Content-Type': 'multipart/form-data' };
      }
      const response = await api.put(`${BASE_PATH}/mentors/${mentorId}`, finalPayload, { headers });
      if (__DEV__) console.log('✅ Mentor profile updated →', response.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ Failed to update mentor profile', error);
      throw error;
    }
  }

  static async updateMentor(mentorId: string, payload: UpdateMentorPayload): Promise<any> {
    return this.updateMentorProfile(mentorId, payload);
  }

  static async updateMentorAvailability(
    mentorId: string,
    availability: {
      timezone?: string;
      daysAvailable?: string[];
      preferredHours?: { start: string; end: string };
      bufferBetweenSessions?: number;
      weeklySchedule?: any[];
      schedule?: any[];
    }
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('availability', JSON.stringify(availability));
      const response = await api.put(`${BASE_PATH}/mentors/${mentorId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data?.data;
    } catch (error) {
      console.error('❌ Failed to update mentor availability settings', error);
      throw error;
    }
  }

  /**
   * DELETE /api/v1/mentorship/mentors/:mentorId
   * Soft-deletes a mentor profile.
   */
  static async deleteMentor(mentorId: string): Promise<any> {
    try {
      const { data } = await api.delete(`${BASE_PATH}/mentors/${mentorId}`);
      MentorshipService.cachedIsMentor = false;
      return data;
    } catch (error: any) {
      console.error('❌ Failed to delete mentor profile', error);
      throw error;
    }
  }

  /**
   * PATCH /api/v1/mentorship/mentors/:mentorId/approve (Admin)
   */
  static async approveMentor(mentorId: string): Promise<any> {
    try {
      const { data } = await api.patch(`${BASE_PATH}/mentors/${mentorId}/approve`);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to approve mentor', error);
      throw error;
    }
  }

  /**
   * PATCH /api/v1/mentorship/mentors/:mentorId/save
   * Bookmark / Save / Unsave a mentor.
   */
  static async toggleSaveMentor(mentorId: string): Promise<{ saved: boolean }> {
    try {
      const { data } = await api.patch<{ saved: boolean }>(`${BASE_PATH}/mentors/${mentorId}/save`);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to save/unsave mentor', error);
      throw error;
    }
  }

  /**
   * POST /api/v1/mentorship/mentors/:mentorId/report
   */
  static async reportMentor(mentorId: string, reason: string): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/mentors/${mentorId}/report`, { reason });
      return data;
    } catch (error: any) {
      console.error('❌ Failed to report mentor', error);
      throw error;
    }
  }

  // ── Group Sessions ─────────────────────────────────────────────────────────────

  static async getAllGroupSessions(filters: { mentorId?: string; page?: number; limit?: number; status?: string; topic?: string } = {}): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/group-sessions`, { params: filters });
      return data;
    } catch (error: any) {
      console.error('❌ Failed to fetch group sessions', error);
      throw error;
    }
  }

  static async getUpcomingGroupSessions(): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/group-sessions/upcoming`);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to fetch upcoming group sessions', error);
      throw error;
    }
  }

  static async getMyGroupSessions(): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/group-sessions/my-sessions`);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to fetch my group sessions', error);
      throw error;
    }
  }

  static async getGroupSessionById(id: string): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/group-sessions/${id}`);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to fetch group session details', error);
      throw error;
    }
  }

  static async createGroupSession(payload: Record<string, any>): Promise<any> {
    try {
      const formData = new FormData();

      const title = String(payload.title || 'Group Mentorship Masterclass').trim();
      const topic = String(payload.topic || payload.title || 'Group Mentorship').trim();
      let description = String(payload.description || '').trim();
      if (description.length < 50) {
        description = `${description} This group mentorship masterclass covers core topics, practical live workflows, architectural patterns, and an open interactive Q&A session.`.trim();
      }

      const duration = Number(payload.duration) || 60;
      const scheduledAt = payload.scheduledAt || new Date(Date.now() + 86400000 * 2).toISOString();
      const timezone = payload.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
      const maxParticipants = Number(payload.maxParticipants || payload.maxAttendees) || 10;
      const minParticipants = Number(payload.minParticipants) || 1;
      const pricePerPerson = Number(payload.pricePerPerson ?? payload.pricing?.basePrice ?? payload.price ?? 0);
      const paymentMethod = payload.paymentMethod || (pricePerPerson > 0 ? 'razorpay' : 'free');

      formData.append('title', title);
      formData.append('topic', topic);
      formData.append('description', description);
      formData.append('duration', String(duration));
      formData.append('scheduledAt', String(scheduledAt));
      formData.append('timezone', String(timezone));
      formData.append('maxParticipants', String(maxParticipants));
      formData.append('minParticipants', String(minParticipants));
      formData.append('pricePerPerson', String(pricePerPerson));
      formData.append('paymentMethod', String(paymentMethod));

      if (payload.category) formData.append('category', String(payload.category));
      if (payload.agenda) formData.append('agenda', String(payload.agenda));
      if (payload.outcomes) formData.append('outcomes', JSON.stringify(payload.outcomes));

      // Thumbnail Image file
      const thumb = payload.thumbnailImage || payload.thumbnailImageFile || payload.thumbnailUri;
      if (thumb && typeof thumb === 'object' && thumb.uri) {
        formData.append('thumbnailImage', {
          uri: thumb.uri,
          name: thumb.name || 'group_cover.jpg',
          type: thumb.type || 'image/jpeg',
        } as any);
      } else if (typeof thumb === 'string' && thumb.length > 0) {
        formData.append('thumbnailImage', {
          uri: thumb,
          name: 'group_cover.jpg',
          type: 'image/jpeg',
        } as any);
      } else {
        // Safe default placeholder file to satisfy backend uploadSingle('thumbnailImage') requirement
        formData.append('thumbnailImage', {
          uri: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
          name: 'group_cover.jpg',
          type: 'image/jpeg',
        } as any);
      }

      const { data } = await api.post(`${BASE_PATH}/group-sessions/create`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    } catch (error: any) {
      console.error('❌ Failed to create group session', error);
      throw error;
    }
  }

  static async joinGroupSession(id: string, transactionId?: string): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/group-sessions/${id}/join`, { transactionId });
      return data;
    } catch (error: any) {
      console.error('❌ Failed to join group session', error);
      throw error;
    }
  }

  static async leaveGroupSession(id: string): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/group-sessions/${id}/leave`);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to leave group session', error);
      throw error;
    }
  }

  static async startGroupSession(id: string): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/group-sessions/${id}/start`);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to start group session', error);
      throw error;
    }
  }

  static async completeGroupSession(id: string): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/group-sessions/${id}/complete`);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to complete group session', error);
      throw error;
    }
  }

  static async updateGroupSession(id: string, payload: Record<string, any>): Promise<any> {
    try {
      const { data } = await api.put(`${BASE_PATH}/group-sessions/${id}`, payload);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to update group session', error);
      throw error;
    }
  }

  static async deleteGroupSession(id: string): Promise<any> {
    try {
      const { data } = await api.delete(`${BASE_PATH}/group-sessions/${id}`);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to delete group session', error);
      throw error;
    }
  }

  static async cancelGroupSession(id: string, reason: string): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/group-sessions/${id}/cancel`, { reason });
      return data;
    } catch (error: any) {
      console.error('❌ Failed to cancel group session', error);
      throw error;
    }
  }

  static async submitGroupSessionFeedback(id: string, payload: { rating: number; comment?: string }): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/group-sessions/${id}/feedback`, payload);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to submit group session feedback', error);
      throw error;
    }
  }

  // ── Reviews ───────────────────────────────────────────────────────────────────

  static async getMentorReviews(mentorId: string, params?: { page?: number; limit?: number }): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/reviews/mentor/${mentorId}`, { params });
      return data;
    } catch (error: any) {
      console.error('❌ Failed to fetch reviews', error);
      throw error;
    }
  }

  static async getMentorReviewStats(mentorId: string): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/reviews/mentor/${mentorId}/stats`);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to fetch review stats', error);
      throw error;
    }
  }

  static async submitReview(payload: {
    sessionId: string;
    mentorId: string;
    rating: number;
    comment: string;
    tags?: string[];
  }): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/reviews`, payload);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to submit review', error);
      throw error;
    }
  }

  // ── Session (legacy alias) ────────────────────────────────────────────────────

  static async getSessionById(sessionId: string): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/sessions/${sessionId}`);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to fetch session details', error);
      throw error;
    }
  }
}

export default MentorshipService;

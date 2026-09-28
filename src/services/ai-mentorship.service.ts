import { api } from './auth.service';

export interface AIMatchParams {
  skills?: string[];
  domains?: string[];
  experienceLevel?: string;
  maxBudget?: number;
  learningGoals?: string[];
  limit?: number;
}

export interface AIMatchExplanation {
  matchScore: number;
  matchingSkills: string[];
  domainAlignment: string;
  reason: string;
  strengths: string[];
}

export interface AIMentorRecommendation {
  _id: string;
  mentorId: string;
  title: string;
  tagline?: string;
  bio?: string;
  domains: string[];
  skills: string[];
  matchScore?: number;
  matchReasons?: string[];
  stats?: {
    averageRating: number;
    totalReviews: number;
    totalSessions: number;
  };
  user?: {
    fullName?: string;
    profilePhotoId?: string;
  };
}

const BASE_PATH = '/api/v1/mentorship/ai';

class AIMentorshipService {
  /**
   * GET /api/v1/mentorship/ai/match
   * Smart AI matching algorithm comparing mentee skills/goals with verified mentors.
   */
  static async getMatches(params: AIMatchParams = {}): Promise<any> {
    try {
      const queryParams: any = { ...params };
      if (Array.isArray(params.skills)) queryParams.skills = params.skills.join(',');
      if (Array.isArray(params.domains)) queryParams.domains = params.domains.join(',');
      if (Array.isArray(params.learningGoals)) queryParams.learningGoals = params.learningGoals.join(',');

      const { data } = await api.get(`${BASE_PATH}/match`, { params: queryParams });
      return data;
    } catch (error: any) {
      console.error('❌ [AI_MENTORSHIP] Failed to fetch AI matches', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to fetch AI matches.');
    }
  }

  /**
   * GET /api/v1/mentorship/ai/match/:mentorId
   * AI Match explanation ("Why this mentor was matched: 94% fit").
   */
  static async getMatchExplanation(mentorId: string): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/match/${mentorId}`);
      return data;
    } catch (error: any) {
      console.error(`❌ [AI_MENTORSHIP] Failed to fetch match explanation for ${mentorId}`, error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to fetch match explanation.');
    }
  }

  /**
   * GET /api/v1/mentorship/ai/similar/:mentorId
   * "Mentors similar to this one" recommendation carousel.
   */
  static async getSimilarMentors(mentorId: string, limit = 5): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/similar/${mentorId}`, { params: { limit } });
      return data;
    } catch (error: any) {
      console.error(`❌ [AI_MENTORSHIP] Failed to fetch similar mentors for ${mentorId}`, error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to fetch similar mentors.');
    }
  }

  /**
   * GET /api/v1/mentorship/ai/top-rated
   * AI curated top-rated mentors.
   */
  static async getTopRated(limit = 10): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/top-rated`, { params: { limit } });
      return data;
    } catch (error: any) {
      // Graceful fallback to search or general mentor list if AI top-rated route is not mounted in backend
      try {
        const { data } = await api.get('/api/v1/mentorship/mentors', { params: { limit } });
        return data;
      } catch (e) {
        return { data: [] };
      }
    }
  }

  /**
   * GET /api/v1/mentorship/ai/new
   * AI fresh talent showcase.
   */
  static async getNewTalent(limit = 10): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/new`, { params: { limit } });
      return data;
    } catch (error: any) {
      console.error('❌ [AI_MENTORSHIP] Failed to fetch new talent', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to fetch new talent.');
    }
  }

  /**
   * GET /api/v1/mentorship/ai/domain/:domain
   * Domain-specific AI recommendations.
   */
  static async getByDomain(domain: string, limit = 10): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/domain/${encodeURIComponent(domain)}`, { params: { limit } });
      return data;
    } catch (error: any) {
      console.error(`❌ [AI_MENTORSHIP] Failed to fetch mentors for domain ${domain}`, error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to fetch domain mentors.');
    }
  }
}

export default AIMentorshipService;

import { api } from './auth.service';

// ── Interfaces ─────────────────────────────────────────────────────────────────

export interface MentorSearchParams {
  keyword?: string;
  domains?: string | string[];
  companyIds?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  minExperience?: number;
  skills?: string | string[];
  languages?: string | string[];
  sortBy?: 'rating' | 'price_asc' | 'price_desc' | 'sessions' | 'newest';
  page?: number;
  limit?: number;
}

const BASE_PATH = '/api/v1/mentorship/search';

class MentorshipSearchService {
  /**
   * GET /api/v1/mentorship/search/mentors
   * Filter & search mentors with full query params.
   */
  static async searchMentors(params: MentorSearchParams = {}): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/mentors`, { params });
      return data;
    } catch (error: any) {
      console.error('❌ [SEARCH] Failed to search mentors', error);
      throw error;
    }
  }

  /**
   * GET /api/v1/mentorship/search/domains
   * Get all domains/categories with mentor counts.
   */
  static async getDomains(): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/domains`);
      return data;
    } catch (error: any) {
      console.error('❌ [SEARCH] Failed to get domains', error);
      throw error;
    }
  }

  /**
   * GET /api/v1/mentorship/search/companies
   * Get companies with mentor counts.
   */
  static async getCompanies(): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/companies`);
      return data;
    } catch (error: any) {
      console.error('❌ [SEARCH] Failed to get companies', error);
      throw error;
    }
  }

  /**
   * GET /api/v1/mentorship/search/suggestions
   * Autocomplete search suggestions.
   */
  static async getSuggestions(keyword: string, limit = 10): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/suggestions`, { params: { keyword, limit } });
      return data;
    } catch (error: any) {
      console.error('❌ [SEARCH] Failed to get suggestions', error);
      return { data: [] };
    }
  }

  /**
   * GET /api/v1/mentorship/search/popular
   * Get trending search keywords.
   */
  static async getPopularSearches(): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/popular`);
      return data;
    } catch (error: any) {
      console.error('❌ [SEARCH] Failed to get popular searches', error);
      return { data: [] };
    }
  }

  /**
   * POST /api/v1/mentorship/search/clear-filters
   * Reset search query filters (server-side state).
   */
  static async clearFilters(): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/clear-filters`);
      return data;
    } catch (error: any) {
      console.error('❌ [SEARCH] Failed to clear filters', error);
      throw error;
    }
  }
}

export default MentorshipSearchService;

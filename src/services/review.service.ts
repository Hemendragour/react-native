import { api } from './auth.service';

export interface MentorReview {
  _id?: string;
  reviewId: string;
  sessionId: string;
  mentorId: string;
  menteeId: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  reportCount?: number;
  isVerified?: boolean;
  isPublic?: boolean;
  tags?: string[];
  mentorResponse?: {
    comment?: string;
    response?: string;
    respondedAt?: string;
  };
  mentee?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    profilePhotoId?: string | null;
    profilePic?: string | null;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewInput {
  sessionId: string;
  mentorId: string;
  rating: number;
  comment: string;
  tags?: string[];
}

export interface ReviewResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedReviewResponse {
  success: boolean;
  message: string;
  data: MentorReview[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const BASE_PATH = '/api/v1/mentorship/reviews';

class ReviewService {
  /**
   * POST /api/v1/mentorship/reviews
   * Submit a new review for a completed session.
   */
  static async submitReview(payload: ReviewInput): Promise<ReviewResponse<MentorReview>> {
    try {
      const { data } = await api.post<ReviewResponse<MentorReview>>(BASE_PATH, payload);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to submit review');
    }
  }

  /**
   * GET /api/v1/mentorship/reviews/mentor/:mentorId
   * Get paginated reviews for a mentor.
   */
  static async getMentorReviews(mentorId: string, page = 1, limit = 10): Promise<PaginatedReviewResponse> {
    try {
      const { data } = await api.get<PaginatedReviewResponse>(`${BASE_PATH}/mentor/${mentorId}`, {
        params: { page, limit },
      });
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch reviews');
    }
  }

  /**
   * GET /api/v1/mentorship/reviews/mentee/me
   * Get all reviews written by current mentee.
   */
  static async getMyReviews(page = 1, limit = 10): Promise<PaginatedReviewResponse> {
    try {
      const { data } = await api.get<PaginatedReviewResponse>(`${BASE_PATH}/mentee/me`, {
        params: { page, limit },
      });
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch my reviews');
    }
  }


  /**
   * GET /api/v1/mentorship/reviews/mentor/:mentorId/top
   * Get top/highlighted reviews for a mentor.
   */
  static async getTopReviews(mentorId: string, limit = 5): Promise<ReviewResponse<MentorReview[]>> {
    try {
      const { data } = await api.get<ReviewResponse<MentorReview[]>>(`${BASE_PATH}/mentor/${mentorId}/top`, {
        params: { limit },
      });
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch top reviews');
    }
  }

  /**
   * GET /api/v1/mentorship/reviews/mentor/:mentorId/stats
   * Get rating breakdown, average rating, star distributions.
   */
  static async getReviewStats(mentorId: string): Promise<ReviewResponse<ReviewStats>> {
    try {
      const { data } = await api.get<ReviewResponse<ReviewStats>>(`${BASE_PATH}/mentor/${mentorId}/stats`);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch review stats');
    }
  }

  /**
   * GET /api/v1/mentorship/reviews/:id
   * Get a single review by its ID.
   */
  static async getReviewById(reviewId: string): Promise<ReviewResponse<MentorReview>> {
    try {
      const { data } = await api.get<ReviewResponse<MentorReview>>(`${BASE_PATH}/${reviewId}`);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch review');
    }
  }

  /**
   * PUT /api/v1/mentorship/reviews/:id
   * Update a review.
   */
  static async updateReview(reviewId: string, payload: Partial<ReviewInput>): Promise<ReviewResponse<MentorReview>> {
    try {
      const { data } = await api.put<ReviewResponse<MentorReview>>(`${BASE_PATH}/${reviewId}`, payload);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to update review');
    }
  }

  /**
   * DELETE /api/v1/mentorship/reviews/:id
   * Delete a review.
   */
  static async deleteReview(reviewId: string): Promise<ReviewResponse> {
    try {
      const { data } = await api.delete<ReviewResponse>(`${BASE_PATH}/${reviewId}`);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to delete review');
    }
  }

  /**
   * POST /api/v1/mentorship/reviews/:id/response
   * Mentor posts an official reply to a review.
   */
  static async postMentorResponse(reviewId: string, responseText: string): Promise<ReviewResponse<MentorReview>> {
    try {
      const { data } = await api.post<ReviewResponse<MentorReview>>(`${BASE_PATH}/${reviewId}/response`, {
        response: responseText,
      });
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to post review response');
    }
  }

  /**
   * POST /api/v1/mentorship/reviews/:id/helpful
   * Upvote / mark review as helpful.
   */
  static async markHelpful(reviewId: string): Promise<ReviewResponse<MentorReview>> {
    try {
      const { data } = await api.post<ReviewResponse<MentorReview>>(`${BASE_PATH}/${reviewId}/helpful`);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to mark review as helpful');
    }
  }

  /**
   * POST /api/v1/mentorship/reviews/:id/report
   * Report abusive/spam review.
   */
  static async reportReview(reviewId: string, reason: string): Promise<ReviewResponse> {
    try {
      const { data } = await api.post<ReviewResponse>(`${BASE_PATH}/${reviewId}/report`, { reason });
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to report review');
    }
  }
}

export default ReviewService;


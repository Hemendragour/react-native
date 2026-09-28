import { api } from './auth.service';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface SeniorMentorApplyPayload {
  fullName?: string;
  college?: string;
  degree?: string;
  fieldOfStudy?: string;
  graduationYear?: number;
  currentRole?: string;
  currentCompany?: string;
  shortBio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  yearsOfExperience?: number;
  experienceLevel?: string;
  primaryExpertise?: string;
  otherSkills?: string[];
  technologies?: string[];
  achievements?: string[];
  certifications?: string[];
  helpAreas?: string[];
  motivation?: string;
  adviceToJuniorSelf?: string;
  profilePhotoFile?: { uri: string; name?: string; type?: string };
  resumeFile?: { uri: string; name?: string; type?: string; size?: number };
  proofDocumentFile?: { uri: string; name?: string; type?: string; size?: number };
  [key: string]: any;
}

export interface SeniorMentorApplication {
  _id?: string;
  id?: string;
  applicationId?: string;
  userId: string;
  fullName?: string;
  college?: string;
  degree?: string;
  fieldOfStudy?: string;
  graduationYear?: number;
  currentRole?: string;
  currentCompany?: string;
  shortBio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  yearsOfExperience: number;
  experienceLevel?: string;
  primaryExpertise?: string;
  otherSkills?: string[];
  technologies?: string[];
  achievements?: string[];
  certifications?: string[];
  helpAreas: string[];
  motivation?: string;
  adviceToJuniorSelf?: string;
  status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'withdrawn' | string;
  verificationStatus?: 'pending' | 'under_review' | 'verified' | 'approved' | 'rejected' | 'withdrawn' | string;
  rejectionReason?: string;
  profilePhoto?: string;
  resumeUrl?: string;
  proofDocumentUrl?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    _id: string;
    fullName: string;
    email: string;
    profilePhotoId?: string;
  };
}

const BASE_PATH = '/api/v1/mentorship/senior-mentor-applications';

class SeniorMentorService {
  /**
   * POST /api/v1/mentorship/senior-mentor-applications/apply
   * Apply for Senior Mentor badge with document/resume proofs.
   */
  static async apply(payload: SeniorMentorApplyPayload): Promise<any> {
    try {
      const formData = new FormData();

      Object.keys(payload).forEach((key) => {
        const val = payload[key];
        if (val === undefined || val === null) return;

        if (key === 'profilePhotoFile' && val?.uri) {
          formData.append('profilePhoto', {
            uri: val.uri,
            name: val.name || 'profile_photo.jpg',
            type: val.type || 'image/jpeg',
          } as any);
        } else if (key === 'resumeFile' && val?.uri) {
          formData.append('resume', {
            uri: val.uri,
            name: val.name || 'resume.pdf',
            type: val.type || 'application/pdf',
          } as any);
        } else if (key === 'proofDocumentFile' && val?.uri) {
          formData.append('proofDocument', {
            uri: val.uri,
            name: val.name || 'proof_document.pdf',
            type: val.type || 'application/pdf',
          } as any);
        } else if (Array.isArray(val) || typeof val === 'object') {
          formData.append(key, JSON.stringify(val));
        } else {
          formData.append(key, String(val));
        }
      });

      const { data } = await api.post(`${BASE_PATH}/apply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    } catch (error: any) {
      console.error('❌ [SENIOR_MENTOR] Apply failed', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to submit senior mentor application.');
    }
  }

  /**
   * GET /api/v1/mentorship/senior-mentor-applications/me
   * Get current logged-in user's senior mentor application status & history.
   */
  static async getMyApplication(): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/me`);
      return data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return { success: true, data: null };
      }
      console.error('❌ [SENIOR_MENTOR] Failed to fetch my application', error?.response?.data || error?.message);
      throw error;
    }
  }

  /**
   * PUT /api/v1/mentorship/senior-mentor-applications/me
   * Edit application details before verification/review is finalized.
   */
  static async updateMyApplication(payload: Partial<SeniorMentorApplyPayload>): Promise<any> {
    try {
      const { data } = await api.put(`${BASE_PATH}/me`, payload);
      return data;
    } catch (error: any) {
      console.error('❌ [SENIOR_MENTOR] Update application failed', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to update senior mentor application.');
    }
  }

  /**
   * DELETE /api/v1/mentorship/senior-mentor-applications/me
   * Withdraw pending senior mentor application.
   */
  static async withdrawMyApplication(): Promise<any> {
    try {
      const { data } = await api.delete(`${BASE_PATH}/me`);
      return data;
    } catch (error: any) {
      console.error('❌ [SENIOR_MENTOR] Withdraw application failed', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to withdraw application.');
    }
  }

  /**
   * GET /api/v1/mentorship/senior-mentor-applications/user/:userId/profile
   * View public senior mentor verification profile.
   */
  static async getPublicProfile(userId: string): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/user/${userId}/profile`);
      return data;
    } catch (error: any) {
      console.error(`❌ [SENIOR_MENTOR] Failed to fetch public profile for ${userId}`, error?.response?.data || error?.message);
      throw error;
    }
  }


  // ── Admin Endpoints ─────────────────────────────────────────────────────────


  /**
   * GET /api/v1/mentorship/senior-mentor-applications
   * Admin list of all applications with filter & pagination.
   */
  static async getAllApplications(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}`, { params });
      return data;
    } catch (error: any) {
      console.error('❌ [SENIOR_MENTOR] Failed to fetch applications', error?.response?.data || error?.message);
      throw error;
    }
  }

  /**
   * GET /api/v1/mentorship/senior-mentor-applications/:id
   * Admin view details of a specific application.
   */
  static async getApplicationById(id: string): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/${id}`);
      return data;
    } catch (error: any) {
      console.error('❌ [SENIOR_MENTOR] Failed to fetch application details', error?.response?.data || error?.message);
      throw error;
    }
  }

  /**
   * POST /api/v1/mentorship/senior-mentor-applications/:id/under-review
   * Admin: Mark application as under review.
   */
  static async markUnderReview(id: string): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/${id}/under-review`);
      return data;
    } catch (error: any) {
      console.error('❌ [SENIOR_MENTOR] Failed to mark under review', error?.response?.data || error?.message);
      throw error;
    }
  }

  /**
   * POST /api/v1/mentorship/senior-mentor-applications/:id/approve
   * Admin: Approve and grant Senior Mentor status.
   */
  static async approveApplication(id: string): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/${id}/approve`);
      return data;
    } catch (error: any) {
      console.error('❌ [SENIOR_MENTOR] Approve application failed', error?.response?.data || error?.message);
      throw error;
    }
  }

  /**
   * POST /api/v1/mentorship/senior-mentor-applications/:id/reject
   * Admin: Reject application with reason.
   */
  static async rejectApplication(id: string, rejectionReason: string): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/${id}/reject`, { rejectionReason });
      return data;
    } catch (error: any) {
      console.error('❌ [SENIOR_MENTOR] Reject application failed', error?.response?.data || error?.message);
      throw error;
    }
  }
}

export default SeniorMentorService;

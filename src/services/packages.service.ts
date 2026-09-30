import { api } from './auth.service';

// ── Interfaces ─────────────────────────────────────────────────────────────────

export interface PackagePurchaseInput {
  packageType: 'starter' | 'professional' | 'premium' | 'custom';
  paymentMethod: string;
  mentorId: string;
}

export interface PackageFilters {
  status?: 'active' | 'expired' | 'exhausted';
  page?: number;
  limit?: number;
}

export interface UseCreditInput {
  sessionDetails?: {
    mentorId: string;
    scheduledAt: string;
    timezone: string;
  };
}

const BASE_PATH = '/api/v1/mentorship/packages';

class PackagesService {
  /**
   * GET /api/v1/mentorship/packages/pricing
   * Get available mentorship package tiers.
   */
  static async getAllPricingTiers(): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/pricing`);
      return data;
    } catch (error: any) {
      console.error('❌ [PACKAGES] Failed to get pricing', error);
      throw error;
    }
  }

  /**
   * GET /api/v1/mentorship/packages/pricing/:packageType
   * Get specific tier pricing & details.
   */
  static async getPackageTierPricing(packageType: string): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/pricing/${packageType}`);
      return data;
    } catch (error: any) {
      console.error(`❌ [PACKAGES] Failed to get pricing for ${packageType}`, error);
      throw error;
    }
  }

  /**
   * POST /api/v1/mentorship/packages/purchase
   * Purchase a session bundle.
   */
  static async purchasePackage(input: PackagePurchaseInput): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/purchase`, input);
      return data;
    } catch (error: any) {
      console.error('❌ [PACKAGES] Failed to purchase package', error);
      throw error;
    }
  }

  /**
   * GET /api/v1/mentorship/packages
   * Get all packages purchased by current user.
   */
  static async getMyPackages(filters?: PackageFilters): Promise<any> {
    try {
      const { data } = await api.get(BASE_PATH, { params: filters });
      return data;
    } catch (error: any) {
      console.error('❌ [PACKAGES] Failed to get packages', error);
      throw error;
    }
  }

  /**
   * GET /api/v1/mentorship/packages/summary
   * Get user package summary & overall balance.
   */
  static async getPackageSummary(): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/summary`);
      return data;
    } catch (error: any) {
      console.error('❌ [PACKAGES] Failed to get package summary', error);
      throw error;
    }
  }

  /**
   * GET /api/v1/mentorship/packages/credits
   * Get remaining session credits.
   */
  static async getRemainingCredits(): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/credits`);
      return data;
    } catch (error: any) {
      console.error('❌ [PACKAGES] Failed to get credits', error);
      throw error;
    }
  }

  /**
   * GET /api/v1/mentorship/packages/:packageId
   * Get package details by ID.
   */
  static async getPackageById(packageId: string): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/${packageId}`);
      return data;
    } catch (error: any) {
      console.error(`❌ [PACKAGES] Failed to get package ${packageId}`, error);
      throw error;
    }
  }

  /**
   * POST /api/v1/mentorship/packages/:packageId/use-credit
   * Redeem a package credit to book a session.
   */
  static async useCredit(packageId: string, input?: UseCreditInput): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/${packageId}/use-credit`, input || {});
      return data;
    } catch (error: any) {
      console.error('❌ [PACKAGES] Failed to use credit', error);
      throw error;
    }
  }

  /**
   * PUT /api/v1/mentorship/packages/:packageId/cancel
   * Cancel a package.
   */
  static async cancelPackage(packageId: string, reason?: string): Promise<any> {
    try {
      const { data } = await api.put(`${BASE_PATH}/${packageId}/cancel`, { reason });
      return data;
    } catch (error: any) {
      console.error('❌ [PACKAGES] Failed to cancel package', error);
      throw error;
    }
  }
}

export default PackagesService;

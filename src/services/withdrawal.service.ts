import { api } from './auth.service';

export interface WithdrawalMethod {
  _id: string;
  mentorId: string;
  type: 'bank' | 'upi';
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountType?: 'savings' | 'current';
  upiId?: string;
  upiName?: string;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: string;
}

export type AddBankPayload = {
  type: 'bank';
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: 'savings' | 'current';
  isDefault?: boolean;
};

export type AddUpiPayload = {
  type: 'upi';
  upiId: string;
  upiName: string;
  isDefault?: boolean;
};

export interface WithdrawalRequestPayload {
  amount: number;
  methodId: string;
}

const BASE_PATH = '/api/v1/mentorship/withdrawal';

export const WithdrawalService = {
  /**
   * Get all withdrawal methods saved by the mentor
   */
  async getMethods(mentorId: string): Promise<any> {
    try {
      const { data } = await api.get(`${BASE_PATH}/${mentorId}`);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to fetch withdrawal methods', error);
      throw error;
    }
  },

  /**
   * Add a new withdrawal method (Bank account or UPI)
   */
  async addMethod(mentorId: string, payload: AddBankPayload | AddUpiPayload): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/${mentorId}`, payload);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to add withdrawal method', error);
      throw error;
    }
  },

  /**
   * Set a method as default payout method
   */
  async setDefault(mentorId: string, methodId: string): Promise<any> {
    try {
      const { data } = await api.patch(`${BASE_PATH}/${mentorId}/${methodId}/default`);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to set default method', error);
      throw error;
    }
  },

  /**
   * Delete a saved withdrawal method
   */
  async deleteMethod(mentorId: string, methodId: string): Promise<any> {
    try {
      const { data } = await api.delete(`${BASE_PATH}/${mentorId}/${methodId}`);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to delete withdrawal method', error);
      throw error;
    }
  },

  /**
   * Request payout/withdrawal
   */
  async requestPayout(mentorId: string, payload: WithdrawalRequestPayload): Promise<any> {
    try {
      const { data } = await api.post(`${BASE_PATH}/${mentorId}/request`, payload);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to request payout', error);
      throw error;
    }
  },
};

export default WithdrawalService;

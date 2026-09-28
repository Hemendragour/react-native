import { api } from './auth.service';

export interface CreateAvailabilityInput {
  mentorId: string;
  date: string; // ISO string (e.g. YYYY-MM-DD or 2026-09-18T00:00:00.000Z)
  slots: { startTime: string; endTime: string }[];
  timezone: string;
  isRecurring?: boolean;
  dayOfWeek?: string;
}

export interface BulkAvailabilityInput {
  mentorId: string;
  dateRange: {
    startDate: string; // ISO string
    endDate: string;   // ISO string
  };
  slotConfig: {
    startTime: string;       // "HH:MM"
    endTime: string;         // "HH:MM"
    slotDuration: number;    // minutes (15 - 480)
    bufferBetween?: number;  // minutes
  };
  daysOfWeek?: string[];     // ['monday', 'tuesday', ...]
  timezone: string;
}

export interface AvailabilitySlot {
  startTime: string;
  endTime: string;
  isBooked?: boolean;
  isBlocked?: boolean;
  bookingId?: string;
}

export interface AvailabilityRecord {
  availabilityId: string;
  _id?: string;
  mentorId: string;
  date: string;
  dayOfWeek: string;
  timezone: string;
  isDateBlocked?: boolean;
  isRecurring?: boolean;
  slots: AvailabilitySlot[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AvailabilityStats {
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  blockedSlots: number;
}

export interface AvailabilityFilters {
  startDate?: string;
  endDate?: string;
  status?: 'available' | 'booked' | 'blocked';
}

export interface BlockDateInput {
  mentorId: string;
  date: string;
  reason?: string;
  timezone?: string;
}

export interface CompareMentorsInput {
  mentorIds: string[]; // 1–3 mentorIds
  date: string;
  timezone?: string;
}

interface ApiResponse<T = any> {
  status: string;
  message: string;
  data: T;
}

class AvailabilityService {
  /**
   * POST /api/v1/mentorship/availability/create
   * Create specific date availability slots.
   */
  static async createAvailability(input: CreateAvailabilityInput): Promise<ApiResponse> {
    try {
      console.log('📅 [CREATE_AVAILABILITY] Creating...', {
        mentorId: input.mentorId,
        date: input.date,
        slotsCount: input.slots.length,
      });
      const { data } = await api.post<ApiResponse>('/api/v1/mentorship/availability/create', input);
      return data;
    } catch (error: any) {
      console.error('❌ [CREATE_AVAILABILITY] Failed', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to create availability.');
    }
  }

  /**
   * POST /api/v1/mentorship/availability/bulk
   * Bulk-generate recurring weekly slots across a date range.
   */
  static async bulkCreateAvailability(input: BulkAvailabilityInput): Promise<ApiResponse> {
    try {
      console.log('📅 [BULK_AVAILABILITY] Creating bulk availability...', {
        mentorId: input.mentorId,
        dateRange: input.dateRange,
        daysOfWeek: input.daysOfWeek,
      });
      const { data } = await api.post<ApiResponse>('/api/v1/mentorship/availability/bulk', input);
      return data;
    } catch (error: any) {
      console.error('❌ [BULK_AVAILABILITY] Failed', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to bulk create availability.');
    }
  }

  /**
   * GET /api/v1/mentorship/availability/slots/:mentorId
   * Get bookable slots for a mentor on a specific date.
   */
  static async getAvailableSlots(mentorId: string, date: string, timezone?: string): Promise<ApiResponse> {
    try {
      const params: any = { date };
      if (timezone) params.timezone = timezone;
      const { data } = await api.get<ApiResponse>(`/api/v1/mentorship/availability/slots/${mentorId}`, { params });
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch available slots.');
    }
  }

  /**
   * GET /api/v1/mentorship/availability/mentor/:mentorId
   * Get mentor's complete availability calendar.
   */
  static async getMentorAvailability(mentorId: string, filters: AvailabilityFilters = {}): Promise<ApiResponse<{ availabilities: AvailabilityRecord[]; count: number }>> {
    try {
      const { data } = await api.get<ApiResponse<{ availabilities: AvailabilityRecord[]; count: number }>>(
        `/api/v1/mentorship/availability/mentor/${mentorId}`,
        { params: filters }
      );
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch availability.');
    }
  }

  /**
   * GET /api/v1/mentorship/availability/:availabilityId
   * Get specific availability record by ID.
   */
  static async getAvailabilityById(availabilityId: string): Promise<ApiResponse> {
    try {
      const { data } = await api.get<ApiResponse>(`/api/v1/mentorship/availability/${availabilityId}`);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch availability by ID.');
    }
  }

  /**
   * GET /api/v1/mentorship/availability/stats/:mentorId
   * Get mentor slot utilization and availability statistics.
   */
  static async getAvailabilityStats(mentorId: string): Promise<ApiResponse<AvailabilityStats>> {
    try {
      const { data } = await api.get<ApiResponse<AvailabilityStats>>(`/api/v1/mentorship/availability/stats/${mentorId}`);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch availability stats.');
    }
  }

  /**
   * PATCH /api/v1/mentorship/availability/update/:availabilityId
   * Update specific slot time window or status.
   */
  static async updateAvailability(availabilityId: string, input: any): Promise<ApiResponse> {
    try {
      const { data } = await api.patch<ApiResponse>(`/api/v1/mentorship/availability/update/${availabilityId}`, input);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to update availability.');
    }
  }

  /**
   * DELETE /api/v1/mentorship/availability/delete/:availabilityId
   * Delete an availability entry.
   */
  static async deleteAvailability(availabilityId: string): Promise<ApiResponse> {
    try {
      const { data } = await api.delete<ApiResponse>(`/api/v1/mentorship/availability/delete/${availabilityId}`);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to delete availability.');
    }
  }

  /**
   * POST /api/v1/mentorship/availability/block-date
   * Block an entire date by date string.
   */
  static async blockDateByDate(mentorId: string, date: string, reason?: string, timezone?: string): Promise<ApiResponse> {
    try {
      const { data } = await api.post<ApiResponse>('/api/v1/mentorship/availability/block-date', {
        mentorId,
        date,
        reason,
        timezone,
      });
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to block date.');
    }
  }

  /**
   * POST /api/v1/mentorship/availability/unblock-date
   * Unblock a previously blocked date by date string.
   */
  static async unblockDateByDate(mentorId: string, date: string): Promise<ApiResponse> {
    try {
      const { data } = await api.post<ApiResponse>('/api/v1/mentorship/availability/unblock-date', {
        mentorId,
        date,
      });
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to unblock date.');
    }
  }

  /**
   * PATCH /api/v1/mentorship/availability/block/:availabilityId
   * Block a date record by availabilityId.
   */
  static async blockDateById(availabilityId: string, reason?: string): Promise<ApiResponse> {
    try {
      const { data } = await api.patch<ApiResponse>(`/api/v1/mentorship/availability/block/${availabilityId}`, { reason });
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to block date.');
    }
  }

  /**
   * PATCH /api/v1/mentorship/availability/unblock/:availabilityId
   * Unblock a date record by availabilityId.
   */
  static async unblockDateById(availabilityId: string): Promise<ApiResponse> {
    try {
      const { data } = await api.patch<ApiResponse>(`/api/v1/mentorship/availability/unblock/${availabilityId}`);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to unblock date.');
    }
  }

  /**
   * POST /api/v1/mentorship/availability/compare
   * Compare calendar slot availability of 1–3 mentors side by side.
   */
  static async compareMentorAvailability(input: CompareMentorsInput): Promise<ApiResponse> {
    try {
      const { data } = await api.post<ApiResponse>('/api/v1/mentorship/availability/compare', input);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to compare availability.');
    }
  }
}

export default AvailabilityService;


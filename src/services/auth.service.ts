// lib/api/auth.service.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import TokenStorage from '..//store/token.storage';
import { CreateSessionInput, SessionFilters } from './/session.service';
 
// ─────────────────────────────────────────────
// RN File Type
// Web ka `File` RN mein nahi hota.
// DocumentPicker / ImagePicker se ye milta hai.
// ─────────────────────────────────────────────
interface RNFile {
    uri:      string;
    name:     string;
    mimeType?: string;
    size?:    number;
}
 
// ─────────────────────────────────────────────
// Session Expired Handler
//
// window.location.href RN mein nahi chalta.
// App root mein setSessionExpiredHandler() call
// karo aur expo-router se redirect karo.
//
// Usage — app/_layout.tsx mein:
//   import { setSessionExpiredHandler } from '@/lib/api/auth.service';
//   import { router } from 'expo-router';
//   setSessionExpiredHandler(() => router.replace('/login'));
// ─────────────────────────────────────────────
let onSessionExpired: (() => void) | null = null;
 
export const setSessionExpiredHandler = (handler: () => void): void => {
    onSessionExpired = handler;
};
 
// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface UserProfileResponse {
    status: string;
    statusCode: number;
    message: string;
    data: {
        userId: string;
        email: string;
        username: string | null;
        role: string;
        status: string;
        emailVerified: boolean;
        phoneVerified: boolean;
        phone: string;
        twoFactorEnabled: boolean;
        preferences: {
            notifications: { email: boolean; push: boolean; sms: boolean };
            language: string;
            timezone: string;
            theme: string;
        };
        metadata: {
            totalLogins: number;
            lastLoginAt: string;
            lastLoginIp: string;
            lastActiveAt: string;
        };
        createdAt: string;
        updatedAt: string;
    };
    timestamp: string;
}
 
interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}
 
interface LoginResponse {
    status: string;
    statusCode: number;
    message: string;
    data: {
        user: { userId: string; email: string; role: string };
        tokens: { accessToken: string; refreshToken: string; expiresIn: string };
    };
    timestamp: string;
}
 
interface ApiError {
    status: string;
    statusCode: number;
    message: string;
    errors?: Array<{ field: string; message: string }>;
}
 
interface Mentor {
    id: string;
    name: string;
    role: string;
    company: string;
    expertise: string;
    rating: number;
    sessions: number;
    img: string;
    bio?: string;
    hourlyRate?: number;
    yearsExperience?: number;
    isAvailable?: boolean;
}
 
interface GetAllMentorsResponse {
    mentors: Mentor[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
 
// ─────────────────────────────────────────────
// Axios Instance
// ─────────────────────────────────────────────
const api: AxiosInstance = axios.create({
    // ✅ NEXT_PUBLIC → EXPO_PUBLIC
    baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept':        'application/json',
    },
    // ✅ withCredentials: true web ke cookies ke liye tha
    // RN mein Bearer token use ho raha hai isliye false
    withCredentials: false,
});
 
// ─────────────────────────────────────────────
// Request Interceptor
// ─────────────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        // ✅ Sync — memory cache se token milta hai
        const accessToken = TokenStorage.getAccessToken();
 
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
            console.log('🔑 [API] Access token attached');
        } else {
            console.log('ℹ️ [API] No access token available');
        }
 
        return config;
    },
    (error) => {
        console.error('❌ [API] Request interceptor error:', error);
        return Promise.reject(error);
    },
);
 
// ─────────────────────────────────────────────
// Response Interceptor — Token Refresh
// ─────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject:  (reason?: any) => void;
}> = [];
 
const processQueue = (error: any = null, token: string | null = null) => {
    failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
    failedQueue = [];
};
 
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest: any = error.config;
 
        if (error.response?.status === 401 && !originalRequest._retry) {
 
            if (isRefreshing) {
                console.log('🔄 [API] Token refresh in progress, queuing...');
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }
 
            originalRequest._retry = true;
            isRefreshing = true;
 
            const refreshToken = TokenStorage.getRefreshToken();
 
            if (!refreshToken) {
                console.error('❌ [API] No refresh token, redirecting to login');
                // ✅ window.location.href nahi — callback use karo
                await TokenStorage.clearAuthData();
                onSessionExpired?.();
                return Promise.reject(error);
            }
 
            try {
                console.log('🔄 [API] Refreshing access token...');
 
                const { data } = await axios.post(
                    `${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/api/v1/auth/refresh`,
                    { refreshToken },
                );
 
                const newAccessToken  = data.data.tokens.accessToken;
                const newRefreshToken = data.data.tokens.refreshToken;
                const expiresIn       = data.data.tokens.expiresIn;
 
                // ✅ async setAuthData
                await TokenStorage.setAuthData(
                    { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn },
                    data.data.user,
                );
 
                api.defaults.headers.common['Authorization']  = `Bearer ${newAccessToken}`;
                originalRequest.headers['Authorization']       = `Bearer ${newAccessToken}`;
 
                processQueue(null, newAccessToken);
                console.log('✅ [API] Token refreshed successfully');
                return api(originalRequest);
 
            } catch (refreshError) {
                console.error('❌ [API] Token refresh failed:', refreshError);
                processQueue(refreshError, null);
                // ✅ await clearAuthData (async hai ab)
                await TokenStorage.clearAuthData();
                onSessionExpired?.();
                return Promise.reject(refreshError);
 
            } finally {
                isRefreshing = false;
            }
        }
 
        return Promise.reject(error);
    },
);
 
// ─────────────────────────────────────────────
// AuthService
// ─────────────────────────────────────────────
class AuthService {
 
    static post<T>(arg0: string, input: CreateSessionInput): { data: any } | PromiseLike<{ data: any }> {
        throw new Error('Method not implemented.');
    }
    static get<T>(arg0: string, p0: { params: SessionFilters }): { data: any } | PromiseLike<{ data: any }> {
        throw new Error('Method not implemented.');
    }
 
    // ══════════════════════════════════════════
    // REGISTER
    // ══════════════════════════════════════════
    static async register(registrationData: any): Promise<any> {
        try {
            console.log('📝 [REGISTER] Initiating registration...', {
                email:    registrationData.email,
                userType: registrationData.userType,
            });
 
            const { data } = await api.post('/api/v1/auth/register', registrationData);
 
            console.log('✅ [REGISTER] Registration successful', {
                userId: data.data?.user?.userId,
            });
 
            // ✅ await — async hai ab
            await TokenStorage.setAuthData(data.data.tokens, data.data.user);
            console.log('✅ [REGISTER] Auth data stored');
 
            return data;
 
        } catch (error: any) {
            console.error('❌ [REGISTER] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.code === 'ERR_NETWORK')        throw new Error('Unable to connect to server. Please check your internet connection.');
                if (apiError?.message)                   throw new Error(apiError.message);
                if (error.response?.status === 409)      throw new Error('User already exists with this email.');
                if (error.response?.status === 400) {
                    const errors = apiError?.errors?.map(e => e.message).join(', ');
                    throw new Error(errors || 'Validation failed. Please check your inputs.');
                }
            }
            throw new Error('An unexpected error occurred. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // LOGIN
    // ══════════════════════════════════════════
    static async login(credentials: LoginCredentials): Promise<LoginResponse> {
        try {
            console.log('🔐 [LOGIN] Initiating login...', { email: credentials.email });
 
            const { data } = await api.post<LoginResponse>('/api/v1/auth/login', credentials);
 
            console.log('✅ [LOGIN] Welcome To Throne8', {
                userId: data.data?.user?.userId,
                role:   data.data?.user?.role,
            });
 
            // ✅ await
            await TokenStorage.setAuthData(data.data.tokens, data.data.user);
            console.log('✅ [LOGIN] Auth data stored');
 
            return data;
 
        } catch (error: any) {
            console.error('❌ [LOGIN] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.code === 'ERR_NETWORK')         throw new Error('Unable to connect to server. Please check your internet connection.');
                if (error.code === 'ECONNABORTED')        throw new Error('Request timed out. Please try again.');
                if (apiError?.message)                    throw new Error(apiError.message);
                if (error.response?.status === 429)       throw new Error('Too many requests. Please wait a moment and try again.');
                if (error.response?.status === 503)       throw new Error('Service temporarily unavailable. Please try again later.');
            }
            throw new Error('An unexpected error occurred. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // GET USER PROFILE
    // ══════════════════════════════════════════
    static async getUserProfile(): Promise<any> {
        try {
            console.log('👤 [GET_PROFILE] Fetching user profile...');
            const { data } = await api.get('/api/v1/auth/profile');
            console.log('✅ [GET_PROFILE] Profile fetched', { userId: data.data?.userId });
            return data;
        } catch (error: any) {
            console.error('❌ [GET_PROFILE] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.code === 'ERR_NETWORK')       throw new Error('Unable to connect to server. Please check your internet connection.');
                if (error.response?.status === 401)     throw new Error('Authentication required. Please login again.');
                if (error.response?.status === 404)     throw new Error('User profile not found.');
                if (apiError?.message)                  throw new Error(apiError.message);
            }
            throw new Error('Failed to fetch user profile. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // GET USER PROFILE BY ID
    // ══════════════════════════════════════════
    static async getUserProfileById(userId: string): Promise<any> {
        try {
            console.log('👤 [GET_PROFILE_BY_ID] Fetching profile...', { userId });
            const { data } = await api.get(`/api/v1/auth/get-user/${userId}`);
            console.log('✅ [GET_PROFILE_BY_ID] Profile fetched');
            return data;
        } catch (error: any) {
            console.error('❌ [GET_PROFILE_BY_ID] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.code === 'ERR_NETWORK')     throw new Error('Unable to connect to server. Please check your internet connection.');
                if (error.response?.status === 401)   throw new Error('Authentication required. Please login again.');
                if (error.response?.status === 404)   throw new Error('User profile not found.');
                if (apiError?.message)                throw new Error(apiError.message);
            }
            throw new Error('Failed to fetch user profile. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // GET ALL USERS
    // ══════════════════════════════════════════
    static async getAllUsers(params?: { page?: number; limit?: number; search?: string }): Promise<any> {
        try {
            console.log('👥 [GET_ALL_USERS] Fetching users...', params);
            const { data } = await api.get('/api/v1/auth/users', { params });
            console.log('✅ [GET_ALL_USERS] Users fetched');
            return data;
        } catch (error: any) {
            console.error('❌ [GET_ALL_USERS] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.response?.status === 401)  throw new Error('Authentication required. Please login again.');
                if (apiError?.message)               throw new Error(apiError.message);
            }
            throw new Error('Failed to fetch users. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // UPDATE USER PROFILE
    // ══════════════════════════════════════════
    static async updateUserProfile(updates: {
        email?:       string;
        password?:    string;
        phoneNumber?: string;
        firstName?:   string;
        lastName?:    string;
        location?:    string;
        onboarding?:  any;
        preferences?: any;
    }): Promise<any> {
        try {
            console.log('📝 [UPDATE_PROFILE] Updating profile...', { fields: Object.keys(updates) });
            const { data } = await api.put('/api/v1/auth/update-profile', updates);
            console.log('✅ [UPDATE_PROFILE] Profile updated');
            return data;
        } catch (error: any) {
            console.error('❌ [UPDATE_PROFILE] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.code === 'ERR_NETWORK')        throw new Error('Unable to connect to server. Please check your internet connection.');
                if (error.response?.status === 400) {
                    const errors = apiError?.errors?.map(e => e.message).join(', ');
                    throw new Error(errors || apiError?.message || 'Validation failed');
                }
                if (error.response?.status === 401)      throw new Error('Session expired. Please login again.');
                if (apiError?.message)                   throw new Error(apiError.message);
            }
            throw new Error('Failed to update profile. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // UPLOAD COVER PHOTO
    // ✅ File → RNFile
    // ✅ FormData.append RN style
    // ══════════════════════════════════════════
    static async uploadCoverPhoto(file: RNFile, setAsActive: boolean = true): Promise<any> {
        try {
            console.log('📸 [UPLOAD_COVER_PHOTO] Uploading...', {
                fileName: file.name,
                setAsActive,
            });
 
            const formData = new FormData();
            formData.append('cover', {
                uri:  file.uri,
                name: file.name,
                type: file.mimeType || 'image/jpeg',
            } as any);
            formData.append('setAsActive', setAsActive.toString());
 
            const { data } = await api.post('/api/v1/profile/cover/upload-cover', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
 
            console.log('✅ [UPLOAD_COVER_PHOTO] Uploaded', { coverId: data.data?.cover?.coverId });
            return data;
 
        } catch (error: any) {
            console.error('❌ [UPLOAD_COVER_PHOTO] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.code === 'ERR_NETWORK')      throw new Error('Unable to connect to server. Please check your internet connection.');
                if (error.response?.status === 400)    throw new Error(apiError?.message || 'Invalid image file or dimensions');
                if (error.response?.status === 401)    throw new Error('Session expired. Please login again.');
                if (apiError?.message)                 throw new Error(apiError.message);
            }
            throw new Error('Failed to upload cover photo. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // GET COVER PHOTO BY ID
    // ══════════════════════════════════════════
    static async getCoverPhotoById(coverId: string): Promise<any> {
        try {
            console.log('📸 [GET_COVER_PHOTO] Fetching...', { coverId });
            const { data } = await api.get(`/api/v1/profile/cover/get-cover/${coverId}`);
            console.log('✅ [GET_COVER_PHOTO] Fetched');
            return data;
        } catch (error: any) {
            console.error('❌ [GET_COVER_PHOTO] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.response?.status === 404)   throw new Error('Cover photo not found');
                if (apiError?.message)                throw new Error(apiError.message);
            }
            throw new Error('Failed to fetch cover photo. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // UPDATE COVER PHOTO
    // ✅ File → RNFile
    // ══════════════════════════════════════════
    static async updateCoverPhoto(coverId: string, file: RNFile): Promise<any> {
        try {
            console.log('🔄 [UPDATE_COVER_PHOTO] Updating...', { coverId, fileName: file.name });
 
            const formData = new FormData();
            formData.append('cover', {
                uri:  file.uri,
                name: file.name,
                type: file.mimeType || 'image/jpeg',
            } as any);
 
            const { data } = await api.put(
                `/api/v1/profile/cover/update-cover/${coverId}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } },
            );
 
            console.log('✅ [UPDATE_COVER_PHOTO] Updated');
            return data;
 
        } catch (error: any) {
            console.error('❌ [UPDATE_COVER_PHOTO] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.code === 'ERR_NETWORK')     throw new Error('Unable to connect to server. Please check your internet connection.');
                if (error.response?.status === 400)   throw new Error(apiError?.message || 'Invalid image file');
                if (error.response?.status === 404)   throw new Error('Cover photo not found');
                if (apiError?.message)                throw new Error(apiError.message);
            }
            throw new Error('Failed to update cover photo. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // DELETE COVER PHOTO
    // ══════════════════════════════════════════
    static async deleteCoverPhoto(coverId: string): Promise<any> {
        try {
            console.log('🗑️ [DELETE_COVER_PHOTO] Deleting...', { coverId });
            const { data } = await api.delete(`/api/v1/profile/cover/delete-cover/${coverId}`);
            console.log('✅ [DELETE_COVER_PHOTO] Deleted');
            return data;
        } catch (error: any) {
            console.error('❌ [DELETE_COVER_PHOTO] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.response?.status === 404)  throw new Error('Cover photo not found');
                if (apiError?.message)               throw new Error(apiError.message);
            }
            throw new Error('Failed to delete cover photo. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // ARCHIVE COVER PHOTO
    // ══════════════════════════════════════════
    static async archiveCoverPhoto(coverId: string): Promise<any> {
        try {
            console.log('📦 [ARCHIVE_COVER_PHOTO] Archiving...', { coverId });
            const { data } = await api.post(`/api/v1/profile/cover/archive-cover/${coverId}`);
            console.log('✅ [ARCHIVE_COVER_PHOTO] Archived');
            return data;
        } catch (error: any) {
            console.error('❌ [ARCHIVE_COVER_PHOTO] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.response?.status === 404)                                    throw new Error('Cover photo not found');
                if (error.response?.status === 400 && apiError?.message?.includes('already archived')) throw new Error('Cover photo is already archived');
                if (apiError?.message)                                                 throw new Error(apiError.message);
            }
            throw new Error('Failed to archive cover photo. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // SET ACTIVE COVER PHOTO
    // ══════════════════════════════════════════
    static async setActiveCoverPhoto(coverId: string): Promise<any> {
        try {
            console.log('🔄 [SET_ACTIVE_COVER] Setting active...', { coverId });
            const { data } = await api.put(`/api/v1/profile/cover/set-active-cover/${coverId}/set-active`);
            console.log('✅ [SET_ACTIVE_COVER] Set active');
            return data;
        } catch (error: any) {
            console.error('❌ [SET_ACTIVE_COVER] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.response?.status === 404)  throw new Error('Cover photo not found');
                if (apiError?.message)               throw new Error(apiError.message);
            }
            throw new Error('Failed to set cover as active. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // UPLOAD PROFILE PHOTO
    // ✅ File → RNFile
    // ══════════════════════════════════════════
    static async uploadProfilePhoto(file: RNFile, setAsActive: boolean = true): Promise<any> {
        try {
            console.log('📸 [UPLOAD_PROFILE_PHOTO] Uploading...', { fileName: file.name });
 
            const formData = new FormData();
            formData.append('photo', {
                uri:  file.uri,
                name: file.name,
                type: file.mimeType || 'image/jpeg',
            } as any);
            formData.append('setAsActive', setAsActive.toString());
 
            const { data } = await api.post('/api/v1/profile/profile-photo/upload-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
 
            console.log('✅ [UPLOAD_PROFILE_PHOTO] Uploaded', { photoId: data.data?.photo?.photoId });
            return data;
 
        } catch (error: any) {
            console.error('❌ [UPLOAD_PROFILE_PHOTO] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.code === 'ERR_NETWORK')    throw new Error('Unable to connect to server. Please check your internet connection.');
                if (error.response?.status === 400)  throw new Error(apiError?.message || 'Invalid image file');
                if (error.response?.status === 401)  throw new Error('Session expired. Please login again.');
                if (apiError?.message)               throw new Error(apiError.message);
            }
            throw new Error('Failed to upload profile photo. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // GET PROFILE PHOTO BY ID
    // ══════════════════════════════════════════
    static async getProfilePhotoById(photoId: string): Promise<any> {
        try {
            console.log('📸 [GET_PROFILE_PHOTO] Fetching...', { photoId });
            const { data } = await api.get(`/api/v1/profile/profile-photo/get-photo/${photoId}`);
            console.log('✅ [GET_PROFILE_PHOTO] Fetched');
            return data;
        } catch (error: any) {
            console.error('❌ [GET_PROFILE_PHOTO] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.response?.status === 404)  throw new Error('Photo not found');
                if (apiError?.message)               throw new Error(apiError.message);
            }
            throw new Error('Failed to fetch profile photo. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // GET MULTIPLE PROFILE PHOTOS
    // ══════════════════════════════════════════
    static async getMultipleProfilePhotosByIds(photoIds: string[]): Promise<any> {
        try {
            console.log('📸 [GET_MULTIPLE_PHOTOS] Fetching...', { count: photoIds.length });
            const { data } = await api.post('/api/v1/profile/profile-photo/get-multiple-photos', { photoIds });
            console.log('✅ [GET_MULTIPLE_PHOTOS] Fetched', { found: data.data?.photos?.length });
            return data;
        } catch (error: any) {
            console.error('❌ [GET_MULTIPLE_PHOTOS] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.response?.status === 400)  throw new Error(apiError?.message || 'Invalid photo IDs');
                if (apiError?.message)               throw new Error(apiError.message);
            }
            throw new Error('Failed to fetch profile photos. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // CREATE HEADLINE
    // ══════════════════════════════════════════
    static async createHeadline(headlineData: { title: string }): Promise<any> {
        try {
            console.log('📰 [CREATE_HEADLINE] Creating...');
            const { data } = await api.post('/api/v1/profile/headlines/create-headline', headlineData);
            console.log('✅ [CREATE_HEADLINE] Created', { headlineId: data.data?.headline?.headlineId });
            return data;
        } catch (error: any) {
            console.error('❌ [CREATE_HEADLINE] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.code === 'ERR_NETWORK')      throw new Error('Unable to connect to server. Please check your internet connection.');
                if (error.response?.status === 400) {
                    const errors = apiError?.errors?.map(e => e.message).join(', ');
                    throw new Error(errors || apiError?.message || 'Validation failed');
                }
                if (error.response?.status === 401)    throw new Error('Session expired. Please login again.');
                if (apiError?.message)                 throw new Error(apiError.message);
            }
            throw new Error('Failed to create headline. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // GET HEADLINE BY ID
    // ══════════════════════════════════════════
    static async getHeadlineById(headlineId: string): Promise<any> {
        try {
            console.log('📖 [GET_HEADLINE] Fetching...', { headlineId });
            const { data } = await api.get(`/api/v1/profile/headlines/get-headline-by-id/${headlineId}`);
            console.log('✅ [GET_HEADLINE] Fetched');
            return data;
        } catch {
            return null;
        }
    }
 
    // ══════════════════════════════════════════
    // CREATE ABOUT
    // ══════════════════════════════════════════
    static async createAbout(aboutData: { aboutText: string; textFormatting?: string }): Promise<any> {
        try {
            console.log('📝 [CREATE_ABOUT] Creating...', { textLength: aboutData.aboutText.length });
            const { data } = await api.post('/api/v1/profile/about/create-about', aboutData);
            console.log('✅ [CREATE_ABOUT] Created', { aboutId: data.data?.about?.aboutId });
            return data;
        } catch (error: any) {
            console.error('❌ [CREATE_ABOUT] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.code === 'ERR_NETWORK')      throw new Error('Unable to connect to server. Please check your internet connection.');
                if (error.response?.status === 400) {
                    const errors = apiError?.errors?.map(e => e.message).join(', ');
                    throw new Error(errors || apiError?.message || 'Validation failed');
                }
                if (error.response?.status === 409)    throw new Error('About already exists. Use update instead.');
                if (apiError?.message)                 throw new Error(apiError.message);
            }
            throw new Error('Failed to create about. Please try again.');
        }
    }

    // ══════════════════════════════════════════
    // GET ABOUT BY ID
    // ══════════════════════════════════════════
    static async getAboutById(aboutId: string): Promise<any> {
        try {
            console.log('📖 [GET_ABOUT] Fetching...', { aboutId });
            const { data } = await api.get(`/api/v1/profile/about/get-about/${aboutId}`);
            console.log('✅ [GET_ABOUT] Fetched');
            return data;
        } catch (error: any) {
            console.error('❌ [GET_ABOUT] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.response?.status === 404)  throw new Error('About not found');
                if (apiError?.message)               throw new Error(apiError.message);
            }
            throw new Error('Failed to fetch about. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // UPDATE ABOUT
    // ══════════════════════════════════════════
    static async updateAbout(aboutId: string, updates: {
        aboutText?:       string;
        isExpanded?:      boolean;
        textFormatting?:  string;
    }): Promise<any> {
        try {
            console.log('🔄 [UPDATE_ABOUT] Updating...', { aboutId, fields: Object.keys(updates) });
            const { data } = await api.put(`/api/v1/profile/about/update-about/${aboutId}`, updates);
            console.log('✅ [UPDATE_ABOUT] Updated');
            return data;
        } catch (error: any) {
            console.error('❌ [UPDATE_ABOUT] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.code === 'ERR_NETWORK')      throw new Error('Unable to connect to server. Please check your internet connection.');
                if (error.response?.status === 400) {
                    const errors = apiError?.errors?.map(e => e.message).join(', ');
                    throw new Error(errors || apiError?.message || 'Validation failed');
                }
                if (error.response?.status === 404)    throw new Error('About not found.');
                if (apiError?.message)                 throw new Error(apiError.message);
            }
            throw new Error('Failed to update about. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // UPLOAD COVER STORY VIDEO
    // ✅ File → RNFile
    // ══════════════════════════════════════════
    static async uploadCoverStoryVideo(aboutId: string, videoFile: RNFile): Promise<any> {
        try {
            console.log('📹 [UPLOAD_VIDEO] Uploading...', { aboutId, fileName: videoFile.name });
 
            const formData = new FormData();
            formData.append('video', {
                uri:  videoFile.uri,
                name: videoFile.name,
                type: videoFile.mimeType || 'video/mp4',
            } as any);
 
            const { data } = await api.post(
                `/api/v1/profile/about/upload-video/${aboutId}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } },
            );
 
            console.log('✅ [UPLOAD_VIDEO] Uploaded', { videoUrl: data.data?.coverStory?.videoUrl });
            return data;
 
        } catch (error: any) {
            console.error('❌ [UPLOAD_VIDEO] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.response?.status === 400)  throw new Error(apiError?.message || 'Invalid video file');
                if (error.response?.status === 404)  throw new Error('About section not found');
                if (apiError?.message)               throw new Error(apiError.message);
            }
            throw new Error('Failed to upload video. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // CREATE EDUCATION
    // ══════════════════════════════════════════
    static async createEducation(educationData: {
        schoolCollegeName: string;
        degree:            string;
        degreeType:        string;
        specialization?:   string;
        startDate:         string;
        endDate?:          string | null;
        description?:      string;
        educationType?:    string;
        gradeType?:        string;
        gradeValue?:       string;
        location?:         string;
    }): Promise<any> {
        try {
            const { data } = await api.post('/api/v1/profile/education/create-education', educationData);
            return data;
        } catch (error: any) {
            console.error('❌ [CREATE_EDUCATION] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.code === 'ERR_NETWORK')      throw new Error('Unable to connect to server. Please check your internet connection.');
                if (error.response?.status === 400) {
                    const errors = apiError?.errors?.map(e => e.message).join(', ');
                    throw new Error(errors || apiError?.message || 'Validation failed');
                }
                if (error.response?.status === 401)    throw new Error('Session expired. Please login again.');
                if (apiError?.message)                 throw new Error(apiError.message);
            }
            throw new Error('Failed to create education. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // GET ALL EDUCATION
    // ══════════════════════════════════════════
    static async getAllEducation(includeArchived: boolean = false): Promise<any> {
        try {
            const { data } = await api.get('/api/v1/profile/education/get-all-education', {
                params: { includeArchived },
            });
            return data;
        } catch (error: any) {
            console.error('❌ [GET_ALL_EDUCATION] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.response?.status === 401)  throw new Error('Authentication required. Please login again.');
                if (apiError?.message)               throw new Error(apiError.message);
            }
            throw new Error('Failed to fetch education records. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // UPDATE EDUCATION
    // ══════════════════════════════════════════
    static async updateEducation(educationId: string, updates: {
        schoolCollegeName?: string;
        degree?:            string;
        degreeType?:        string;
        specialization?:    string;
        startDate?:         string;
        endDate?:           string | null;
        description?:       string;
        educationType?:     string;
        gradeType?:         string;
        gradeValue?:        string;
        location?:          string;
    }): Promise<any> {
        try {
            console.log('🎓 [UPDATE_EDUCATION] Updating...', { educationId });
            const { data } = await api.put(`/api/v1/profile/education/update-education/${educationId}`, updates);
            console.log('✅ [UPDATE_EDUCATION] Updated');
            return data;
        } catch (error: any) {
            console.error('❌ [UPDATE_EDUCATION] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.response?.status === 400) {
                    const errors = apiError?.errors?.map(e => e.message).join(', ');
                    throw new Error(errors || apiError?.message || 'Validation failed');
                }
                if (error.response?.status === 401)    throw new Error('Session expired. Please login again.');
                if (error.response?.status === 404)    throw new Error('Education not found.');
                if (apiError?.message)                 throw new Error(apiError.message);
            }
            throw new Error('Failed to update education. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // DELETE EDUCATION
    // ══════════════════════════════════════════
    static async deleteEducation(educationId: string): Promise<any> {
        try {
            console.log('🗑️ [DELETE_EDUCATION] Deleting...', { educationId });
            const { data } = await api.delete(`/api/v1/profile/education/delete-education/${educationId}`);
            console.log('✅ [DELETE_EDUCATION] Deleted');
            return data;
        } catch (error: any) {
            console.error('❌ [DELETE_EDUCATION] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.response?.status === 404)  throw new Error('Education not found');
                if (error.response?.status === 401)  throw new Error('Session expired. Please login again.');
                if (apiError?.message)               throw new Error(apiError.message);
            }
            throw new Error('Failed to delete education. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // ARCHIVE EDUCATION
    // ══════════════════════════════════════════
    static async archiveEducation(educationId: string): Promise<any> {
        try {
            console.log('📦 [ARCHIVE_EDUCATION] Archiving...', { educationId });
            const { data } = await api.post(`/api/v1/profile/education/archive-education/${educationId}/archive`);
            console.log('✅ [ARCHIVE_EDUCATION] Archived');
            return data;
        } catch (error: any) {
            console.error('❌ [ARCHIVE_EDUCATION] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.response?.status === 404)                                        throw new Error('Education not found');
                if (error.response?.status === 400 && apiError?.message?.includes('already archived')) throw new Error('Education is already archived');
                if (error.response?.status === 401)                                        throw new Error('Session expired. Please login again.');
                if (apiError?.message)                                                     throw new Error(apiError.message);
            }
            throw new Error('Failed to archive education. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // CREATE EXPERIENCE
    // ══════════════════════════════════════════
    static async createExperience(experienceData: {
        currentPosition:   string;
        companyName:       string;
        description:       string;
        startDate:         string;
        endDate?:          string;
        currentlyWorking:  boolean;
        keyAchievements?:  string[];
    }): Promise<any> {
        try {
            console.log('💼 [CREATE_EXPERIENCE] Creating...');
            const { data } = await api.post('/api/v1/profile/experience/create-experience', experienceData);
            console.log('✅ [CREATE_EXPERIENCE] Created');
            return data;
        } catch (error: any) {
            console.error('❌ [CREATE_EXPERIENCE] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.code === 'ERR_NETWORK')      throw new Error('Unable to connect to server. Please check your internet connection.');
                if (error.response?.status === 400) {
                    const errors = apiError?.errors?.map(e => e.message).join(', ');
                    throw new Error(errors || apiError?.message || 'Validation failed');
                }
                if (error.response?.status === 401)    throw new Error('Session expired. Please login again.');
                if (apiError?.message)                 throw new Error(apiError.message);
            }
            throw new Error('Failed to create experience. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // GET EXPERIENCE BY ID
    // ══════════════════════════════════════════
    static async getExperienceById(experienceId: string): Promise<any> {
        try {
            console.log('💼 [GET_EXPERIENCE] Fetching...', { experienceId });
            const { data } = await api.get(`/api/v1/profile/experience/get-experience/${experienceId}`);
            console.log('✅ [GET_EXPERIENCE] Fetched');
            return data;
        } catch (error: any) {
            console.error('❌ [GET_EXPERIENCE] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.response?.status === 401)  throw new Error('Authentication required. Please login again.');
                if (error.response?.status === 404)  throw new Error('Experience not found');
                if (apiError?.message)               throw new Error(apiError.message);
            }
            throw new Error('Failed to fetch experience. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // UPDATE EXPERIENCE
    // ══════════════════════════════════════════
    static async updateExperience(experienceId: string, updates: {
        currentPosition?:  string;
        companyName?:      string;
        description?:      string;
        startDate?:        string;
        endDate?:          string;
        currentlyWorking?: boolean;
        keyAchievements?:  string[];
    }): Promise<any> {
        try {
            console.log('💼 [UPDATE_EXPERIENCE] Updating...', { experienceId });
            const { data } = await api.put(`/api/v1/profile/experience/update-experience/${experienceId}`, updates);
            console.log('✅ [UPDATE_EXPERIENCE] Updated');
            return data;
        } catch (error: any) {
            console.error('❌ [UPDATE_EXPERIENCE] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.code === 'ERR_NETWORK')      throw new Error('Unable to connect to server. Please check your internet connection.');
                if (error.response?.status === 400) {
                    const errors = apiError?.errors?.map(e => e.message).join(', ');
                    throw new Error(errors || apiError?.message || 'Validation failed');
                }
                if (error.response?.status === 401)    throw new Error('Session expired. Please login again.');
                if (error.response?.status === 404)    throw new Error('Experience not found.');
                if (apiError?.message)                 throw new Error(apiError.message);
            }
            throw new Error('Failed to update experience. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // ARCHIVE EXPERIENCE
    // ══════════════════════════════════════════
    static async archiveExperience(experienceId: string): Promise<any> {
        try {
            console.log('📦 [ARCHIVE_EXPERIENCE] Archiving...', { experienceId });
            const { data } = await api.post(`/api/v1/profile/experience/${experienceId}/archive`);
            console.log('✅ [ARCHIVE_EXPERIENCE] Archived');
            return data;
        } catch (error: any) {
            console.error('❌ [ARCHIVE_EXPERIENCE] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.response?.status === 404)                                        throw new Error('Experience not found');
                if (error.response?.status === 400 && apiError?.message?.includes('already archived')) throw new Error('Experience is already archived');
                if (error.response?.status === 401)                                        throw new Error('Session expired. Please login again.');
                if (apiError?.message)                                                     throw new Error(apiError.message);
            }
            throw new Error('Failed to archive experience. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // DELETE EXPERIENCE
    // ══════════════════════════════════════════
    static async deleteExperience(experienceId: string): Promise<any> {
        try {
            console.log('🗑️ [DELETE_EXPERIENCE] Deleting...', { experienceId });
            const { data } = await api.delete(`/api/v1/profile/experience/delete-experience/${experienceId}`);
            console.log('✅ [DELETE_EXPERIENCE] Deleted');
            return data;
        } catch (error: any) {
            console.error('❌ [DELETE_EXPERIENCE] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.response?.status === 404)  throw new Error('Experience not found');
                if (error.response?.status === 401)  throw new Error('Session expired. Please login again.');
                if (apiError?.message)               throw new Error(apiError.message);
            }
            throw new Error('Failed to delete experience. Please try again.');
        }
    }
 
    // ══════════════════════════════════════════
    // CREATE POST
    // ✅ File[] → RNFile[]
    // ══════════════════════════════════════════
    static async createPost(postData: {
        title:      string;
        content:    string;
        images?:    RNFile[];
        videos?:    RNFile[];
        documents?: RNFile[];
    }): Promise<any> {
        try {
            console.log('📝 [CREATE_POST] Creating...');
            const formData = new FormData();
            formData.append('title',   postData.title);
            formData.append('content', postData.content);
 
            postData.images?.forEach(f =>
                formData.append('images', { uri: f.uri, name: f.name, type: f.mimeType || 'image/jpeg' } as any),
            );
            postData.videos?.forEach(f =>
                formData.append('videos', { uri: f.uri, name: f.name, type: f.mimeType || 'video/mp4' } as any),
            );
            postData.documents?.forEach(f =>
                formData.append('documents', { uri: f.uri, name: f.name, type: f.mimeType || 'application/octet-stream' } as any),
            );
 
            const { data } = await api.post('/api/v1/profile/activity/create-posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log('✅ [CREATE_POST] Created:', data.data?.post?.postId);
            return data;
        } catch (error: any) {
            console.error('❌ [CREATE_POST] Failed', error);
            throw new Error(error.response?.data?.message || 'Failed to create post');
        }
    }
 
    // ══════════════════════════════════════════
    // GET POST BY ID
    // ══════════════════════════════════════════
    static async getPostById(postId: string): Promise<any> {
        try {
            const { data } = await api.get(`/api/v1/profile/activity/get-post/${postId}`);
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch post');
        }
    }
 
    // ══════════════════════════════════════════
    // GET ALL USER POSTS
    // ══════════════════════════════════════════
    static async getAllUserPosts(includeArchived: boolean = false): Promise<any> {
        try {
            const { data } = await api.get('/api/v1/profile/activity/get-all/posts', {
                params: { includeArchived },
            });
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch posts');
        }
    }
 
    // ══════════════════════════════════════════
    // GET ALL POSTS FOR HOME FEED
    // ══════════════════════════════════════════
    static async getAllPostsForHomeFeed(includeArchived: boolean = false): Promise<any> {
        try {
            const { data } = await api.get('/api/v1/profile/activity/posts/feed/all', {
                params: { includeArchived },
            });
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch home feed posts');
        }
    }
 
    // ══════════════════════════════════════════
    // UPDATE POST
    // ══════════════════════════════════════════
    static async updatePost(postId: string, updates: { title?: string; content?: string }): Promise<any> {
        try {
            const { data } = await api.put(`/api/v1/profile/activity/update-post/${postId}`, updates);
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to update post');
        }
    }
 
    // ══════════════════════════════════════════
    // DELETE POST
    // ══════════════════════════════════════════
    static async deletePost(postId: string, permanent: boolean = false): Promise<any> {
        try {
            const { data } = await api.delete(`/api/v1/profile/activity/delete-post/${postId}`, {
                params: { permanent },
            });
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to delete post');
        }
    }
 
    // ══════════════════════════════════════════
    // ARCHIVE POST
    // ══════════════════════════════════════════
    static async archivePost(postId: string): Promise<any> {
        try {
            const { data } = await api.post(`/api/v1/profile/activity/posts/${postId}/archive`);
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to archive post');
        }
    }
 
    // ══════════════════════════════════════════
    // PIN / UNPIN POST
    // ══════════════════════════════════════════
    static async pinPost(postId: string, isPinned: boolean): Promise<any> {
        try {
            const { data } = await api.put(`/api/v1/profile/activity/posts/${postId}/pin`, { isPinned });
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to pin post');
        }
    }
 
    // ══════════════════════════════════════════
    // SAVE / UNSAVE POST
    // ══════════════════════════════════════════
    static async savePost(postId: string, isSaved: boolean): Promise<any> {
        try {
            const { data } = await api.put(`/api/v1/profile/activity/posts/${postId}/save`, { isSaved });
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to save post');
        }
    }
 
    // ══════════════════════════════════════════
    // LIKE / UNLIKE POST
    // ══════════════════════════════════════════
    static async likePost(postId: string): Promise<any> {
        try {
            const { data } = await api.post(`/api/v1/profile/activity/posts/${postId}/like`);
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to like post');
        }
    }
 
    static async unlikePost(postId: string): Promise<any> {
        try {
            const { data } = await api.delete(`/api/v1/profile/activity/posts/${postId}/like`);
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to unlike post');
        }
    }
 
    // ══════════════════════════════════════════
    // COMMENTS
    // ══════════════════════════════════════════
    static async createComment(postId: string, content: string): Promise<any> {
        try {
            const { data } = await api.post('/api/v1/profile/activity/create-comment/comments', { postId, content });
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to create comment');
        }
    }
 
    static async createReply(commentId: string, content: string): Promise<any> {
        try {
            const { data } = await api.post(`/api/v1/profile/activity/comments/${commentId}/reply`, { content });
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to create reply');
        }
    }
 
    static async getCommentsByPostId(postId: string): Promise<any> {
        try {
            const { data } = await api.get(`/api/v1/profile/activity/posts/${postId}/comments`);
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch comments');
        }
    }
 
    static async getMyComments(): Promise<any> {
        try {
            const { data } = await api.get('/api/v1/profile/activity/comments/my-comments');
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch my comments');
        }
    }
 
    static async getCommentById(commentId: string): Promise<any> {
        try {
            const { data } = await api.get(`/api/v1/profile/activity/comments/${commentId}`);
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch comment');
        }
    }
 
    static async updateComment(commentId: string, content: string): Promise<any> {
        try {
            const { data } = await api.put(`/api/v1/profile/activity/update-comments/${commentId}`, { content });
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to update comment');
        }
    }
 
    static async deleteComment(commentId: string, permanent: boolean = false): Promise<any> {
        try {
            const { data } = await api.delete(`/api/v1/profile/activity/delete-comments/${commentId}`, {
                params: { permanent },
            });
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to delete comment');
        }
    }
 
    static async likeComment(commentId: string): Promise<any> {
        try {
            const { data } = await api.post(`/api/v1/profile/activity/comments/${commentId}/like`);
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to like comment');
        }
    }
 
    static async unlikeComment(commentId: string): Promise<any> {
        try {
            const { data } = await api.delete(`/api/v1/profile/activity/comments/${commentId}/like`);
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to unlike comment');
        }
    }
 
    // ══════════════════════════════════════════
    // SKILLS
    // ══════════════════════════════════════════
    static async createSkill(skillData: {
        skillName:         string;
        category:          string;
        skillStrength:     'beginner' | 'intermediate' | 'advanced' | 'expert';
        yearsOfExperience: number;
    }): Promise<any> {
        try {
            console.log('💡 [CREATE_SKILL] Creating...', { skillName: skillData.skillName });
            const { data } = await api.post('/api/v1/profile/skills/create-skill', skillData);
            console.log('✅ [CREATE_SKILL] Created');
            return data;
        } catch (error: any) {
            console.error('❌ [CREATE_SKILL] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.code === 'ERR_NETWORK')      throw new Error('Unable to connect to server. Please check your internet connection.');
                if (error.response?.status === 400) {
                    const errors = apiError?.errors?.map(e => e.message).join(', ');
                    throw new Error(errors || apiError?.message || 'Validation failed');
                }
                if (error.response?.status === 401)    throw new Error('Session expired. Please login again.');
                if (apiError?.message)                 throw new Error(apiError.message);
            }
            throw new Error('Failed to create skill. Please try again.');
        }
    }
 
    static async updateSkill(skillId: string, updates: {
        skillName?:         string;
        category?:          string;
        skillStrength?:     'beginner' | 'intermediate' | 'advanced' | 'expert';
        yearsOfExperience?: number;
    }): Promise<any> {
        try {
            const { data } = await api.put(`/api/v1/profile/skills/update-skill/${skillId}`, updates);
            return data;
        } catch (error: any) {
            console.error('❌ [UPDATE_SKILL] Failed', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiError;
                if (error.response?.status === 404)  throw new Error('Skill not found.');
                if (error.response?.status === 401)  throw new Error('Session expired. Please login again.');
                if (apiError?.message)               throw new Error(apiError.message);
            }
            throw new Error('Failed to update skill. Please try again.');
        }
    }
 
    static async pinSkill(skillId: string, pinnedOrder: number): Promise<any> {
        try {
            const { data } = await api.post(`/api/v1/profile/skills/pin-skill/${skillId}/pin`, { pinnedOrder });
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to pin skill');
        }
    }
 
    static async unpinSkill(skillId: string): Promise<any> {
        try {
            const { data } = await api.post(`/api/v1/profile/skills/unpin-skill/${skillId}/unpin`, { pinnedOrder: 1 });
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to unpin skill');
        }
    }
 
    static async archiveSkill(skillId: string): Promise<any> {
        try {
            const { data } = await api.post(`/api/v1/profile/skills/archive-skill/${skillId}/archive`);
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to archive skill');
        }
    }
 
    static async deleteSkill(skillId: string): Promise<any> {
        try {
            const { data } = await api.delete(`/api/v1/profile/skills/delete-skill/${skillId}`);
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to delete skill');
        }
    }
 
    static async getAllSkills(includeArchived: boolean = false): Promise<any> {
        try {
            const { data } = await api.get('/api/v1/profile/skills/get-all-skills', {
                params: { includeArchived },
            });
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch skills');
        }
    }
 
    // ══════════════════════════════════════════
    // LOGOUT
    // ✅ window.location.href → onSessionExpired
    // ✅ clearAuthData async hai ab
    // ══════════════════════════════════════════
    static async logout(): Promise<void> {
        try {
            console.log('🚪 [LOGOUT] Calling logout API...');
            await api.post('/api/v1/auth/logout');
            console.log('✅ [LOGOUT] Logout API successful');
        } catch (error) {
            console.error('❌ [LOGOUT] API error:', error);
        } finally {
            await TokenStorage.clearAuthData();
            console.log('✅ [LOGOUT] Auth data cleared');
            // ✅ window.location.href nahi — callback
            onSessionExpired?.();
        }
    }
 
    // ══════════════════════════════════════════
    // HELPERS
    // ══════════════════════════════════════════
    static isAuthenticated(): boolean {
        return TokenStorage.isAuthenticated();
    }
 
    static getCurrentUser() {
        return TokenStorage.getUserData();
    }
 
    static getAuthSummary() {
        return TokenStorage.getAuthSummary();
    }
}
 
export default AuthService;
export { api };
export type { LoginCredentials, LoginResponse, ApiError, GetAllMentorsResponse, RNFile };

import { api } from './auth.service';

/**
 * ProfileService — Only for profile data methods NOT in AuthService
 * (getMyProfile, addExperience, addEducation, addContactInfo, addHonor, addTestScore)
 * 
 * All photo/cover routes are handled by AuthService in auth.service.ts
 */
class ProfileService {
    /**
     * Fetch the complete profile for the currently logged-in user.
     * Route: GET /api/v1/auth/profile
     */
    static async getMyProfile() {
        try {
            console.log('Fetching user profile data...');
            const response = await api.get('/api/v1/auth/profile');
            console.log('✅ Profile data fetched successfully');
            return response;
        } catch (error) {
            console.error('❌ Failed to fetch profile data', error);
            throw error;
        }
    }

    /**
     * Add experience to user profile
     * Route: POST /api/v1/profile/experience
     */
    static async addExperience(data: any) {
        try {
            const response = await api.post('/api/v1/profile/experience', data);
            return response;
        } catch (error) {
            console.error('❌ Failed to add experience', error);
            throw error;
        }
    }

    /**
     * Add education to user profile
     * Route: POST /api/v1/profile/education
     */
    static async addEducation(data: any) {
        try {
            const response = await api.post('/api/v1/profile/education', data);
            return response;
        } catch (error) {
            console.error('❌ Failed to add education', error);
            throw error;
        }
    }

    /**
     * Add contact info to user profile
     * Route: POST /api/v1/profile/contact
     */
    static async addContactInfo(data: any) {
        try {
            const response = await api.post('/api/v1/profile/contact', data);
            return response;
        } catch (error) {
            console.error('❌ Failed to add contact info', error);
            throw error;
        }
    }

    /**
     * Add awards and honors to user profile
     * Route: POST /api/v1/profile/honor
     */
    static async addHonor(data: any) {
        try {
            const response = await api.post('/api/v1/profile/honor', data);
            return response;
        } catch (error) {
            console.error('❌ Failed to add honor', error);
            throw error;
        }
    }

    /**
     * Add test score to user profile
     * Route: POST /api/v1/profile/test-score
     */
    static async addTestScore(data: any) {
        try {
            const response = await api.post('/api/v1/profile/test-score', data);
            return response;
        } catch (error) {
            console.error('❌ Failed to add test score', error);
            throw error;
        }
    }

    // ── OLD DUPLICATE METHODS (Commented Out - Now in auth.service.ts) ───────
    // /**
    //  * Upload Profile Photo
    //  * Route: POST /api/v1/profile/profile-photo/upload-photo
    //  */
    // static async uploadProfilePhoto(imageUri: string, mimeType: string, fileName: string) {
    //     try {
    //         const formData = new FormData();
    //         formData.append('photo', {
    //             uri: imageUri,
    //             type: mimeType,
    //             name: fileName,
    //         } as any);
    // 
    //         const response = await api.post('/api/v1/profile/profile-photo/upload-photo', formData, {
    //             headers: { 'Content-Type': 'multipart/form-data' },
    //         });
    //         return response.data;
    //     } catch (error) {
    //         console.error('❌ Failed to upload profile photo', error);
    //         throw error;
    //     }
    // }
    // 
    // /**
    //  * Get all profile photos for the user
    //  * Route: GET /api/v1/profile/profile-photo/get-all-photos
    //  */
    // static async getAllProfilePhotos(includeArchived: boolean = false) {
    //     try {
    //         const response = await api.get(`/api/v1/profile/profile-photo/get-all-photos?includeArchived=${includeArchived}`);
    //         return response.data;
    //     } catch (error) {
    //         console.error('❌ Failed to get all profile photos', error);
    //         throw error;
    //     }
    // }
    // 
    // /**
    //  * Set a specific profile photo as the active profile picture
    //  * Route: PUT /api/v1/profile/profile-photo/set-active-photo/:photoId/set-active
    //  */
    // static async setActiveProfilePhoto(photoId: string) {
    //     try {
    //         const response = await api.put(`/api/v1/profile/profile-photo/set-active-photo/${photoId}/set-active`);
    //         return response.data;
    //     } catch (error) {
    //         console.error('❌ Failed to set active profile photo', error);
    //         throw error;
    //     }
    // }
    // 
    // /**
    //  * Delete a profile photo
    //  * Route: DELETE /api/v1/profile/profile-photo/delete-photo/:photoId
    //  */
    // static async deleteProfilePhoto(photoId: string) {
    //     try {
    //         const response = await api.delete(`/api/v1/profile/profile-photo/delete-photo/${photoId}`);
    //         return response.data;
    //     } catch (error) {
    //         console.error('❌ Failed to delete profile photo', error);
    //         throw error;
    //     }
    // }
    // 
    // /**
    //  * Update/replace a profile photo
    //  * Route: PUT /api/v1/profile/profile-photo/update-photo/:photoId
    //  */
    // static async updateProfilePhoto(photoId: string, imageUri: string, mimeType: string, fileName: string) {
    //     try {
    //         const formData = new FormData();
    //         formData.append('photo', {
    //             uri: imageUri,
    //             type: mimeType,
    //             name: fileName,
    //         } as any);
    // 
    //         const response = await api.put(`/api/v1/profile/profile-photo/update-photo/${photoId}`, formData, {
    //             headers: { 'Content-Type': 'multipart/form-data' },
    //         });
    //         return response.data;
    //     } catch (error) {
    //         console.error('❌ Failed to update profile photo', error);
    //         throw error;
    //     }
    // }
    // 
    // /**
    //  * Upload Cover Photo
    //  * Route: POST /api/v1/profile/cover/upload-cover
    //  */
    // static async uploadCoverPhoto(imageUri: string, mimeType: string, fileName: string) {
    //     try {
    //         const formData = new FormData();
    //         formData.append('cover', {
    //             uri: imageUri,
    //             type: mimeType,
    //             name: fileName,
    //         } as any);
    // 
    //         const response = await api.post('/api/v1/profile/cover/upload-cover', formData, {
    //             headers: { 'Content-Type': 'multipart/form-data' },
    //         });
    //         return response.data;
    //     } catch (error) {
    //         console.error('❌ Failed to upload cover photo', error);
    //         throw error;
    //     }
    // }
    // 
    // /**
    //  * Get all cover photos for the user
    //  * Route: GET /api/v1/profile/cover/get-all-covers
    //  */
    // static async getAllCovers(includeArchived: boolean = false) {
    //     try {
    //         const response = await api.get(`/api/v1/profile/cover/get-all-covers?includeArchived=${includeArchived}`);
    //         return response.data;
    //     } catch (error) {
    //         console.error('❌ Failed to get all cover photos', error);
    //         throw error;
    //     }
    // }
    // 
    // /**
    //  * Set a specific cover as the active cover
    //  * Route: PUT /api/v1/profile/cover/set-active-cover/:coverId/set-active
    //  */
    // static async setActiveCover(coverId: string) {
    //     try {
    //         const response = await api.put(`/api/v1/profile/cover/set-active-cover/${coverId}/set-active`);
    //         return response.data;
    //     } catch (error) {
    //         console.error('❌ Failed to set active cover photo', error);
    //         throw error;
    //     }
    // }
    // 
    // /**
    //  * Delete a cover photo
    //  * Route: DELETE /api/v1/profile/cover/delete-cover/:coverId
    //  */
    // static async deleteCover(coverId: string) {
    //     try {
    //         const response = await api.delete(`/api/v1/profile/cover/delete-cover/${coverId}`);
    //         return response.data;
    //     } catch (error) {
    //         console.error('❌ Failed to delete cover photo', error);
    //         throw error;
    //     }
    // }
    // 
    // /**
    //  * Update/replace a cover photo
    //  * Route: PUT /api/v1/profile/cover/update-cover/:coverId
    //  */
    // static async updateCover(coverId: string, imageUri: string, mimeType: string, fileName: string) {
    //     try {
    //         const formData = new FormData();
    //         formData.append('cover', {
    //             uri: imageUri,
    //             type: mimeType,
    //             name: fileName,
    //         } as any);
    // 
    //         const response = await api.put(`/api/v1/profile/cover/update-cover/${coverId}`, formData, {
    //             headers: { 'Content-Type': 'multipart/form-data' },
    //         });
    //         return response.data;
    //     } catch (error) {
    //         console.error('❌ Failed to update cover photo', error);
    //         throw error;
    //     }
    // }
}

export default ProfileService;

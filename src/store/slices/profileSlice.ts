import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ProfileService from '../../services/profile.service';
import AuthService, { api } from '../../services/auth.service';

// ── Types ────────────────────────────────────────────────────────────────────
export interface ProfileData {
  userId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  location?: string;
  userType?: string;
  bio?: string;
  skills?: string[];
  // Profile header fields
  headline?: string;
  profileImage?: string;
  coverImage?: string;
  followers?: number;
  connections?: string;
  // About section
  about?: string;
  aboutId?: string;
  introVideoUrl?: string;
  // Experience & Education IDs (components fetch their own details)
  experienceIds?: string[];
  educationIds?: string[];
  educationList?: any[];
  experienceList?: any[];
  // add more fields as your API returns them
}

interface ProfileState {
  data: ProfileData | null;
  coverPhotos: any[]; // Stores cover photos array
  profilePhotos: any[]; // Stores profile photos array
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  data: null,
  coverPhotos: [],
  profilePhotos: [],
  loading: false,
  error: null,
};

// ── Profile Thunk (uses ProfileService) ──────────────────────────────────────
export const fetchMyProfile = createAsyncThunk(
  'profile/fetchMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ProfileService.getMyProfile();
      console.log('✅ RAW PROFILE RESPONSE:', JSON.stringify(response.data, null, 2));
      
      const raw = response.data?.data || response.data || {};
      const rawUser = raw?.user || raw?.account || (raw?.data?.user ? raw.data.user : raw);
      const rawProfile = raw?.profile || (raw?.data?.profile ? raw.data.profile : {});
      const rawOnboarding = raw?.onboarding || rawUser?.onboarding || {};
      
      const profileData: any = {
        ...rawOnboarding,
        ...rawUser,
        ...rawProfile,
        ...(typeof raw === 'object' ? raw : {}),
      };

      // ── Helper to validate professional headline strings ──
      const isValidHeadline = (val: any): boolean => {
        if (!val || typeof val !== 'string') return false;
        const trimmed = val.trim().toLowerCase();
        return (
          trimmed.length > 0 &&
          trimmed !== 'user' &&
          trimmed !== 'admin' &&
          trimmed !== 'member' &&
          trimmed !== 'null' &&
          trimmed !== 'undefined' &&
          trimmed !== 'new user' &&
          trimmed !== 'unknown'
        );
      };

      // ── Resolve Headline ──
      let headline: string | undefined;

      // 1. Check direct headline string or object on profile / user / onboarding
      const rawCandidate = profileData.headline || rawProfile.headline || rawUser.headline || rawOnboarding.headline || rawOnboarding.professionalHeadline;
      if (typeof rawCandidate === 'string' && isValidHeadline(rawCandidate)) {
        headline = rawCandidate.trim();
      } else if (typeof rawCandidate === 'object' && rawCandidate !== null) {
        const candidateTitle = rawCandidate.title || rawCandidate.headlineText || rawCandidate.text;
        if (typeof candidateTitle === 'string' && isValidHeadline(candidateTitle)) {
          headline = candidateTitle.trim();
        }
      }

      // 2. Check headlineId via API
      const headlineId = profileData.headlineId || rawProfile.headlineId || rawUser.headlineId || rawOnboarding.headlineId;
      if (!headline && headlineId) {
        try {
          console.log('📰 Fetching headline text on frontend for ID:', headlineId);
          const headlineRes = await AuthService.getHeadlineById(headlineId);
          const title = headlineRes?.data?.headline?.title || headlineRes?.data?.title || headlineRes?.title || headlineRes?.data?.data?.title || '';
          console.log('✅ Headline text retrieved on frontend:', title);
          if (isValidHeadline(title)) headline = title.trim();
        } catch (headlineErr: any) {
          console.warn('⚠️ Failed to fetch headline text:', headlineErr?.message);
        }
      }

      // 3. Check active headline from getAllHeadlines API
      if (!headline) {
        try {
          const hlRes = await AuthService.getAllHeadlines();
          const hlData = hlRes?.data?.data || hlRes?.data || hlRes || [];
          const activeHl = Array.isArray(hlData) ? (hlData.find((h: any) => (h.isActive || h.active)) || hlData[0]) : hlData;
          const realHl = activeHl?.headline || activeHl;
          const foundTitle = realHl?.title || realHl?.headlineText || realHl?.text || (typeof realHl === 'string' ? realHl : '');
          if (isValidHeadline(foundTitle)) headline = foundTitle.trim();
        } catch (_hlE) {}
      }

      // 4. Derive from workingProfile
      if (!headline) {
        const wp = profileData.workingProfile || rawProfile.workingProfile || rawUser.workingProfile || rawOnboarding.workingProfile;
        if (wp?.jobTitle) {
          headline = wp.companyName ? `${wp.jobTitle} at ${wp.companyName}` : wp.jobTitle;
        }
      }

      // 5. Derive from studentProfile
      if (!headline) {
        const sp = profileData.studentProfile || rawProfile.studentProfile || rawUser.studentProfile || rawOnboarding.studentProfile;
        if (sp?.degree) {
          headline = sp.collegeName ? `${sp.degree} Student at ${sp.collegeName}` : `${sp.degree} Student`;
        }
      }

      // 6. Derive from experience list
      if (!headline) {
        const experiences = profileData.experienceList || profileData.experiences || rawProfile.experienceList || rawProfile.experiences || [];
        if (Array.isArray(experiences) && experiences.length > 0) {
          const exp = experiences.find((e: any) => e.currentlyWorking || e.current) || experiences[0];
          if (exp?.currentPosition || exp?.position) {
            const pos = exp.currentPosition || exp.position;
            const comp = exp.companyName || exp.company;
            headline = comp ? `${pos} at ${comp}` : pos;
          }
        }
      }

      // 7. Check bio/about or custom role (only if not generic 'user')
      if (!headline && isValidHeadline(profileData.bio || profileData.about || rawProfile.bio || rawProfile.about)) {
        headline = (profileData.bio || profileData.about || rawProfile.bio || rawProfile.about).trim();
      }
      if (!headline && isValidHeadline(rawUser.role)) {
        headline = rawUser.role.trim();
      }

      // ── Resolve Profile Photo ──
      let profileImage = profileData.profileImage || profileData.avatar || profileData.profilePhoto || rawProfile.profileImage || rawUser.profileImage || rawUser.avatar || rawOnboarding.profileImage;
      if (!profileImage || typeof profileImage !== 'string' || !profileImage.startsWith('http')) {
        try {
          const photoRes = await AuthService.getAllProfilePhotos();
          const photoData = photoRes?.data?.data || photoRes?.data || photoRes || [];
          const photoArr = Array.isArray(photoData) ? photoData : photoData.photos || [];
          const activePhoto = Array.isArray(photoArr) ? (photoArr.find((p: any) => p.isActive || p.active) || photoArr[0]) : null;
          if (activePhoto) {
            profileImage = activePhoto.cloudinarySecureUrl || activePhoto.cloudinaryUrl || activePhoto.url || activePhoto.imageUrl || activePhoto.photoUrl;
          }
        } catch (_photoE) {}
      }

      // ── Resolve Cover Image ──
      let coverImage = profileData.coverImage || profileData.banner || rawProfile.coverImage || rawUser.coverImage || rawOnboarding.coverImage;
      if (!coverImage || typeof coverImage !== 'string' || !coverImage.startsWith('http')) {
        try {
          const coverRes = await AuthService.getAllCoverPhotos();
          const coverData = coverRes?.data?.data || coverRes?.data || coverRes || [];
          const coverArr = Array.isArray(coverData) ? coverData : coverData.covers || [];
          const activeCover = Array.isArray(coverArr) ? (coverArr.find((c: any) => c.isActive || c.active) || coverArr[0]) : null;
          if (activeCover) {
            coverImage = activeCover.cloudinarySecureUrl || activeCover.cloudinaryUrl || activeCover.url || activeCover.imageUrl || activeCover.coverUrl;
          }
        } catch (_coverE) {}
      }

      profileData.headline = typeof headline === 'string' ? headline : undefined;
      profileData.profileImage = profileImage;
      profileData.coverImage = coverImage;

      // ── Resolve Followers and Connections Counts ──
      const myId = profileData.userId || profileData._id || profileData.id || rawUser?.userId || rawUser?._id || rawUser?.id;
      if (myId) {
        try {
          const [followCountsRes, connCountsRes, followersListRes] = await Promise.allSettled([
            api.get(`/api/v1/connections/follow/counts/${myId}`),
            api.get(`/api/v1/connections/connection/user/${myId}/count`),
            api.get(`/api/v1/connections/follow/followers/${myId}`),
          ]);

          let followersCount: number | undefined;
          let connectionsCount: number | string | undefined;

          if (followCountsRes.status === 'fulfilled' && followCountsRes.value?.data) {
            const fc = followCountsRes.value.data?.data || followCountsRes.value.data;
            if (typeof fc.followers === 'number') followersCount = fc.followers;
            else if (typeof fc.followersCount === 'number') followersCount = fc.followersCount;
            else if (typeof fc.followerCount === 'number') followersCount = fc.followerCount;
            else if (typeof fc.count === 'number') followersCount = fc.count;
            else if (Array.isArray(fc.followers)) followersCount = fc.followers.length;
          }

          if ((followersCount === undefined || followersCount === 0) && followersListRes.status === 'fulfilled' && followersListRes.value?.data) {
            const fList = followersListRes.value.data?.data || followersListRes.value.data;
            const arr = Array.isArray(fList) ? fList : (Array.isArray(fList?.followers) ? fList.followers : (Array.isArray(fList?.data) ? fList.data : []));
            if (arr.length > 0) {
              followersCount = arr.length;
            }
          }

          if (connCountsRes.status === 'fulfilled' && connCountsRes.value?.data) {
            const cc = connCountsRes.value.data?.data || connCountsRes.value.data;
            if (typeof cc.count === 'number') connectionsCount = cc.count;
            else if (typeof cc.totalCount === 'number') connectionsCount = cc.totalCount;
            else if (typeof cc.total === 'number') connectionsCount = cc.total;
          }

          if (followersCount !== undefined) {
            profileData.followers = followersCount;
          } else if (typeof profileData.followersCount === 'number') {
            profileData.followers = profileData.followersCount;
          }

          if (connectionsCount !== undefined) {
            profileData.connections = String(connectionsCount);
          }
        } catch (_cntErr) {}
      }
      
      return profileData;
    } catch (err: any) {
      console.error('❌ PROFILE FETCH ERROR:', err);
      return rejectWithValue(err?.message || 'Failed to fetch profile');
    }
  }
);

// ── Cover Photo Thunks (uses AuthService) ────────────────────────────────────
export const fetchAllCovers = createAsyncThunk(
  'profile/fetchAllCovers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthService.getAllCoverPhotos();
      return response.data; // Array of covers
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to fetch cover photos');
    }
  }
);

export const setActiveCover = createAsyncThunk(
  'profile/setActiveCover',
  async (coverId: string, { rejectWithValue }) => {
    try {
      await AuthService.setActiveCoverPhoto(coverId);
      return coverId; // Return ID to update UI
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to set active cover');
    }
  }
);

export const deleteCover = createAsyncThunk(
  'profile/deleteCover',
  async (coverId: string, { rejectWithValue }) => {
    try {
      await AuthService.deleteCoverPhoto(coverId);
      return coverId; // Return ID to remove from state
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to delete cover photo');
    }
  }
);

// ── Profile Photo Thunks (uses AuthService) ──────────────────────────────────
export const fetchAllProfilePhotos = createAsyncThunk(
  'profile/fetchAllProfilePhotos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthService.getAllProfilePhotos();
      return response.data; // Array of profile photos
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to fetch profile photos');
    }
  }
);

export const setActiveProfilePhoto = createAsyncThunk(
  'profile/setActiveProfilePhoto',
  async (photoId: string, { rejectWithValue }) => {
    try {
      await AuthService.setActiveProfilePhoto(photoId);
      return photoId; // Return ID to update UI
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to set active profile photo');
    }
  }
);

export const deleteProfilePhoto = createAsyncThunk(
  'profile/deleteProfilePhoto',
  async (photoId: string, { rejectWithValue }) => {
    try {
      await AuthService.deleteProfilePhoto(photoId);
      return photoId; // Return ID to remove from state
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to delete profile photo');
    }
  }
);

// ── Slice ────────────────────────────────────────────────────────────────────
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile(state) {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload?.data || action.payload; // handles both { data: ... } and direct payloads safely
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Covers
      .addCase(fetchAllCovers.fulfilled, (state, action) => {
        const payloadData = action.payload?.data || action.payload || {};
        state.coverPhotos = payloadData.covers || [];
      })
      // Delete Cover (optimistic or state update)
      .addCase(deleteCover.fulfilled, (state, action) => {
        state.coverPhotos = state.coverPhotos.filter(c => c._id !== action.payload && c.id !== action.payload);
      })
      // Set Active Cover update
      .addCase(setActiveCover.fulfilled, (_state, _action) => {
        // Option to handle updating active status in list if needed
      })
      // Fetch Profile Photos
      .addCase(fetchAllProfilePhotos.fulfilled, (state, action) => {
        const payloadData = action.payload?.data || action.payload || {};
        state.profilePhotos = payloadData.photos || [];
      })
      // Delete Profile Photo (optimistic or state update)
      .addCase(deleteProfilePhoto.fulfilled, (state, action) => {
        state.profilePhotos = state.profilePhotos.filter(p => p._id !== action.payload && p.id !== action.payload);
      })
      // Set Active Profile Photo update
      .addCase(setActiveProfilePhoto.fulfilled, (_state, _action) => {
        // Option to handle updating active status in list if needed
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;

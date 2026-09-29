import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { StudyService } from '../../../../../services/study.service';

export interface StudyProfileState {
  name: string;
  username: string;
  bio: string;
  avatar: string;
  profileImage: string;
  firstName: string;
  lastName: string;
  joinedDate: string;
  rank: number;
  rankScore: number;
  streak: number;
  longestStreak: number;
  studyHoursTotal: number;
  todayStudyHours: number;
  activeGroups: number;
  activeTasks: number;
  activeGoals: number;
  totalSessions: number;
  totalTasksCompleted: number;
  totalGoalsAchieved: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: StudyProfileState = {
  name: '',
  username: '',
  bio: '',
  avatar: '',
  profileImage: '',
  firstName: '',
  lastName: '',
  joinedDate: '',
  rank: 0,
  rankScore: 0,
  streak: 0,
  longestStreak: 0,
  studyHoursTotal: 0,
  todayStudyHours: 0,
  activeGroups: 0,
  activeTasks: 0,
  activeGoals: 0,
  totalSessions: 0,
  totalTasksCompleted: 0,
  totalGoalsAchieved: 0,
  status: 'idle',
};

export const fetchStudyProfile = createAsyncThunk(
  'profile/fetchStudyProfile',
  async () => {
    const [dashRes, analyticsRes] = await Promise.allSettled([
      StudyService.getUserDashboard(),
      StudyService.getPerformanceAnalytics(),
    ]);

    const dashData = dashRes.status === 'fulfilled' ? dashRes.value?.data || dashRes.value : null;
    const analyticsData = analyticsRes.status === 'fulfilled' ? analyticsRes.value?.data || analyticsRes.value : null;

    return {
      dashboard: dashData,
      analytics: analyticsData,
    };
  }
);

const profileSlice = createSlice({
  name: 'studyProfile',
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<Partial<StudyProfileState>>) => {
      return { ...state, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudyProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchStudyProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { dashboard, analytics } = action.payload;

        if (dashboard?.user) {
          const u = dashboard.user;
          state.firstName = u.firstName || '';
          state.lastName = u.lastName || '';
          state.name = u.name || ((u.firstName || '') + ' ' + (u.lastName || '')).trim() || state.name;
          state.username = u.email ? `@${u.email.split('@')[0]}` : u.username ? `@${u.username}` : state.username;
          if (u.avatar || u.profileImage || u.profilePhotoId) {
            state.avatar = u.avatar || u.profileImage || u.profilePhotoId;
            state.profileImage = u.profileImage || u.avatar || u.profilePhotoId;
          }
        }

        if (dashboard?.stats) {
          const s = dashboard.stats;
          state.rank = s.globalRank || analytics?.globalRank || state.rank;
          state.rankScore = s.rankScore || analytics?.rankScore || state.rankScore;
          state.streak = s.currentStreak || analytics?.currentStreak || state.streak;
          state.longestStreak = s.longestStreak || analytics?.longestStreak || state.longestStreak;
          state.studyHoursTotal = s.totalStudyHours ?? analytics?.totalStudyHours ?? state.studyHoursTotal;
          state.todayStudyHours = s.todayStudyHours ?? state.todayStudyHours;
          state.activeGroups = s.activeGroups ?? state.activeGroups;
          state.activeTasks = s.activeTasks ?? state.activeTasks;
          state.activeGoals = s.activeGoals ?? state.activeGoals;
        }

        if (analytics) {
          state.totalSessions = analytics.totalSessions ?? state.totalSessions;
          state.totalTasksCompleted = analytics.totalTasksCompleted ?? state.totalTasksCompleted;
          state.totalGoalsAchieved = analytics.totalGoalsAchieved ?? state.totalGoalsAchieved;
        }
      })
      .addCase(fetchStudyProfile.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const { updateProfile } = profileSlice.actions;
export default profileSlice.reducer;
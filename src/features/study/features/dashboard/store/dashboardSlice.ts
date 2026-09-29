import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { StudyService } from '../../../../../services/study.service';

export interface DashboardState {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    profileImage?: string;
    firstName?: string;
    lastName?: string;
  } | null;
  stats: {
    globalRank: number;
    rankScore: number;
    currentStreak: number;
    longestStreak: number;
    totalStudyHours: number;
    activeGroups: number;
    todayStudyHours: number;
    activeTasks: number;
    activeGoals: number;
    weeklyGoal?: number;
    weeklyProgress?: number;
  } | null;
  studyTrend: { date: string; sessions: number; hours: number }[];
  subjectShare: { name: string; value: number; color: string }[];
  performanceAnalytics: {
    totalSessions: number;
    totalTasksCompleted: number;
    totalGoalsAchieved: number;
    totalStudyHours: number;
    globalRank: number;
    rankScore: number;
    currentStreak: number;
    longestStreak: number;
  } | null;
  loading: boolean;
  trendLoading: boolean;
  analyticsLoading: boolean;
  error: string | null;
  trendPeriod: '7days' | '30days' | '90days';
}

const initialState: DashboardState = {
  user: null,
  stats: null,
  studyTrend: [],
  subjectShare: [],
  performanceAnalytics: null,
  loading: false,
  trendLoading: false,
  analyticsLoading: false,
  error: null,
  trendPeriod: '7days',
};

export const fetchUserDashboardData = createAsyncThunk(
  'dashboard/fetchUserDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await StudyService.getUserDashboard();
      return response.data || response;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch user dashboard');
    }
  }
);

export const fetchStudyTrendStatistics = createAsyncThunk(
  'dashboard/fetchStudyTrendStatistics',
  async (period: '7days' | '30days' | '90days', { rejectWithValue }) => {
    try {
      const response = await StudyService.getStudyStatistics(period);
      return { data: response.data || response, period };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch study statistics');
    }
  }
);

export const fetchPerformanceAnalytics = createAsyncThunk(
  'dashboard/fetchPerformanceAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await StudyService.getPerformanceAnalytics();
      return response.data || response;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch performance analytics');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // user dashboard
      .addCase(fetchUserDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;

        const rawUser = payload.user || payload.data?.user || null;
        if (rawUser) {
          state.user = {
            id: rawUser.id || rawUser.userId || '',
            name: rawUser.name || ((rawUser.firstName || '') + ' ' + (rawUser.lastName || '')).trim() || 'Student',
            email: rawUser.email || '',
            avatar: rawUser.avatar || rawUser.profileImage || rawUser.profilePhotoId || '',
            profileImage: rawUser.profileImage || rawUser.avatar || '',
            firstName: rawUser.firstName || '',
            lastName: rawUser.lastName || '',
          };
        } else {
          state.user = null;
        }

        const rawStats = payload.stats || payload.data?.stats || null;
        if (rawStats) {
          state.stats = {
            globalRank: rawStats.globalRank || 0,
            rankScore: rawStats.rankScore || 0,
            currentStreak: rawStats.currentStreak || 0,
            longestStreak: rawStats.longestStreak || 0,
            totalStudyHours: rawStats.totalStudyHours || 0,
            activeGroups: rawStats.activeGroups || 0,
            todayStudyHours: rawStats.todayStudyHours || 0,
            activeTasks: rawStats.activeTasks || 0,
            activeGoals: rawStats.activeGoals || 0,
            weeklyGoal: rawStats.weeklyGoal || payload.weeklyGoal || null,
            weeklyProgress: rawStats.weeklyProgress || payload.weeklyProgress || null,
          };
        } else {
          state.stats = null;
        }

        // Also extract subjectShare from dashboard response if available
        const subjectData = payload.subjectShare || payload.data?.subjectShare || payload.data?.subjectDistribution;
        if (Array.isArray(subjectData) && subjectData.length > 0) {
          const fallbackColors = ['#4a3728', '#8b6f47', '#d4c4b5', '#6b8a73', '#9ca3af', '#c9a96e', '#7a9e7e'];
          state.subjectShare = subjectData.map((s: any, i: number) => ({
            name: s.name || s.subject || s.label || 'Other',
            value: s.value || s.percentage || s.percent || 0,
            color: s.color || fallbackColors[i % fallbackColors.length],
          }));
        }
      })
      .addCase(fetchUserDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // statistics (studyTrend)
      .addCase(fetchStudyTrendStatistics.pending, (state) => {
        state.trendLoading = true;
      })
      .addCase(fetchStudyTrendStatistics.fulfilled, (state, action) => {
        state.trendLoading = false;
        state.trendPeriod = action.payload.period;
        const payload = action.payload.data;
        state.studyTrend = payload.statistics || payload.data || payload.trend || payload.sessions || (Array.isArray(payload) ? payload : []);
      })
      .addCase(fetchStudyTrendStatistics.rejected, (state) => {
        state.trendLoading = false;
      })
      // performance analytics
      .addCase(fetchPerformanceAnalytics.pending, (state) => {
        state.analyticsLoading = true;
      })
      .addCase(fetchPerformanceAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        const payload = action.payload;
        state.performanceAnalytics = payload.analytics || payload.data?.analytics || payload || null;

        // Also extract subjectShare from analytics if not already set from dashboard
        const subjectData = payload.subjectDistribution || payload.data?.subjectDistribution || payload.subjectShare;
        if (!state.subjectShare.length && Array.isArray(subjectData) && subjectData.length > 0) {
          const fallbackColors = ['#4a3728', '#8b6f47', '#d4c4b5', '#6b8a73', '#9ca3af', '#c9a96e', '#7a9e7e'];
          state.subjectShare = subjectData.map((s: any, i: number) => ({
            name: s.name || s.subject || s.label || 'Other',
            value: s.value || s.percentage || s.percent || 0,
            color: s.color || fallbackColors[i % fallbackColors.length],
          }));
        }
      })
      .addCase(fetchPerformanceAnalytics.rejected, (state) => {
        state.analyticsLoading = false;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;

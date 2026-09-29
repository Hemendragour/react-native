import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { StudyService } from '../../../../../services/study.service';

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  studyHours: number;
  streak: number;
  rank: number;
}

interface LeaderboardState {
  users: LeaderboardUser[];
  streakUsers: LeaderboardUser[];
  groupUsers: LeaderboardUser[];
  isLoading: boolean;
  error: string | null;
  activeTab: string;
  selectedGroupId: string | null;
  page: number;
  hasMore: boolean;
}

const initialState: LeaderboardState = {
  users: [],
  streakUsers: [],
  groupUsers: [],
  isLoading: false,
  error: null,
  activeTab: 'monthly',
  selectedGroupId: null,
  page: 1,
  hasMore: true,
};

const mapEntries = (rankings: any[]): LeaderboardUser[] =>
  rankings.map((entry: any, idx: number) => ({
    id: entry.userId || entry._id || entry.id || `user_${idx}`,
    name: entry.name || entry.username || `${entry.firstName || ''} ${entry.lastName || ''}`.trim() || 'Student',
    avatar: entry.avatar || entry.profileImage || entry.photo || '',
    studyHours: entry.totalHours || entry.studyHours || entry.hours || entry.totalStudyHours || 0,
    streak: entry.streak || entry.currentStreak || entry.longestStreak || 0,
    rank: entry.rank || idx + 1,
  }));

export const fetchLeaderboard = createAsyncThunk(
  'leaderboard/fetchLeaderboard',
  async (type: string = 'monthly', { rejectWithValue }) => {
    try {
      const response = await StudyService.getLeaderboard(type);
      const data = response?.data || response;
      const rankings = data?.rankings || data?.data || (Array.isArray(data) ? data : []);
      return mapEntries(rankings);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch leaderboard');
    }
  }
);

export const fetchStreakLeaderboard = createAsyncThunk(
  'leaderboard/fetchStreakLeaderboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await StudyService.getStreakLeaderboard();
      const data = response?.data || response;
      const rankings = data?.rankings || data?.data || (Array.isArray(data) ? data : []);
      return mapEntries(rankings);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch streak leaderboard');
    }
  }
);

export const fetchGroupLeaderboard = createAsyncThunk(
  'leaderboard/fetchGroupLeaderboard',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await StudyService.getGroupLeaderboard(groupId);
      const data = response?.data || response;
      const rankings = data?.rankings || data?.data || (Array.isArray(data) ? data : []);
      return mapEntries(rankings);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch group leaderboard');
    }
  }
);

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    setActiveTab(state, action) {
      state.activeTab = action.payload;
      state.page = 1;
      state.hasMore = true;
    },
    setSelectedGroupId(state, action) {
      state.selectedGroupId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStreakLeaderboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStreakLeaderboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.streakUsers = action.payload;
      })
      .addCase(fetchStreakLeaderboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchGroupLeaderboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupLeaderboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groupUsers = action.payload;
      })
      .addCase(fetchGroupLeaderboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setActiveTab, setSelectedGroupId } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;

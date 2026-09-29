import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { StudyService } from '../../../../../services/study.service';

export interface StudySession {
  subject: string;
  time: number;
  date: string;
}

export interface TimerSettings {
  pomodoroMinutes: number;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

interface TimerState {
  activeTab: 'pomodoro' | 'focus' | 'timer';
  minutes: number;
  seconds: number;
  isActive: boolean;
  subject: string;
  customMinutes: number;
  studySessions: StudySession[];
  totalStudyTime: number;
  sessionStartTime: number | null;
  completedSessions: number;
  isBreakMode: boolean;
  settings: TimerSettings;
  dailyGoal: number;
  weeklyStats: { [date: string]: number };
  streakCount: number;
  lastStudyDate: string | null;
  loading: boolean;
  error: string | null;
}

export const startStudySession = createAsyncThunk(
  'timer/startStudySession',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { timer: TimerState };
      const response = await StudyService.startTimer({ subject: state.timer.subject });
      return response.data || response;
    } catch (err: any) {
      console.log('Error starting timer session on backend:', err.message);
      return rejectWithValue(err.message || 'Failed to start timer');
    }
  }
);

export const stopStudySession = createAsyncThunk(
  'timer/stopStudySession',
  async (sessionData: { focusScore?: number; notes?: string }, { rejectWithValue }) => {
    try {
      const response = await StudyService.stopTimer(sessionData);
      return response.data || response;
    } catch (err: any) {
      // 404 means session was already stopped/cancelled — not a real error
      if (err?.response?.status === 404) {
        console.log('Session already completed or cancelled on backend');
        return null;
      }
      console.log('Error stopping timer session on backend:', err.message);
      return rejectWithValue(err.message || 'Failed to stop timer');
    }
  }
);

export const pauseStudySession = createAsyncThunk(
  'timer/pauseStudySession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await StudyService.pauseTimer();
      return response.data || response;
    } catch (err: any) {
      console.log('Error pausing timer session on backend:', err.message);
      return rejectWithValue(err.message || 'Failed to pause timer');
    }
  }
);

export const resumeStudySession = createAsyncThunk(
  'timer/resumeStudySession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await StudyService.resumeTimer();
      return response.data || response;
    } catch (err: any) {
      console.log('Error resuming timer session on backend:', err.message);
      return rejectWithValue(err.message || 'Failed to resume timer');
    }
  }
);

export const fetchStudyStats = createAsyncThunk(
  'timer/fetchStudyStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await StudyService.getSessionStats();
      return response.data || response;
    } catch (err: any) {
      // Don't reject on 404 — just means no stats yet
      if (err?.response?.status === 404) {
        console.log('No study stats found yet (new user)');
        return { data: null };
      }
      console.log('Error fetching study stats from backend:', err.message);
      return rejectWithValue(err.message || 'Failed to fetch stats');
    }
  }
);

export const cancelStudySession = createAsyncThunk(
  'timer/cancelStudySession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await StudyService.cancelTimer();
      return response.data || response;
    } catch (err: any) {
      // 404 means no active timer — that's fine for a reset/cancel operation
      if (err?.response?.status === 404) {
        console.log('No active timer to cancel (already clean)');
        return null;
      }
      console.log('Error cancelling timer session on backend:', err.message);
      return rejectWithValue(err.message || 'Failed to cancel timer');
    }
  }
);

export const fetchActiveTimer = createAsyncThunk(
  'timer/fetchActiveTimer',
  async (_, { rejectWithValue }) => {
    try {
      const response = await StudyService.getActiveTimer();
      return response.data || response;
    } catch (err: any) {
      // Don't reject on 404 — just means no active timer
      if (err?.response?.status === 404) {
        console.log('No active timer found');
        return { data: null };
      }
      console.log('Error fetching active timer from backend:', err.message);
      return rejectWithValue(err.message || 'Failed to fetch active timer');
    }
  }
);

const initialState: TimerState = {
  activeTab: 'pomodoro',
  minutes: 25,
  seconds: 0,
  isActive: false,
  subject: '',
  customMinutes: 15,
  studySessions: [],
  totalStudyTime: 0,
  sessionStartTime: null,
  completedSessions: 0,
  isBreakMode: false,
  settings: {
    pomodoroMinutes: 25,
    focusMinutes: 45,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    autoStartBreaks: true,
    autoStartPomodoros: true,
  },
  dailyGoal: 120,
  weeklyStats: {},
  streakCount: 0,
  lastStudyDate: null,
  loading: false,
  error: null,
};

const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<'pomodoro' | 'focus' | 'timer'>) => {
      if (state.isActive) {
                // If a session is actively running, only change the tab visually.
        // Do NOT reset the timer state, minutes, or seconds!
        // state.activeTab = action.payload;
        
        // If a session is actively running, COMPLETELY block switching tabs
        // to prevent visual confusion about which session is active.
        return;
      }
      
      state.activeTab = action.payload;
      state.isBreakMode = false;
      state.isActive = false;
      state.sessionStartTime = null;
      state.seconds = 0;
      if (action.payload === 'pomodoro') {
        state.minutes = state.settings.pomodoroMinutes;
      } else if (action.payload === 'focus') {
        state.minutes = state.settings.focusMinutes;
      } else {
        state.minutes = state.customMinutes;
      }
    },
    setMinutes: (state, action: PayloadAction<number>) => {
      state.minutes = action.payload;
    },
    setSeconds: (state, action: PayloadAction<number>) => {
      state.seconds = action.payload;
    },
    decrementTime: (state) => {
      if (state.seconds === 0) {
        if (state.minutes === 0) {
          state.isActive = false;
        } else {
          state.minutes -= 1;
          state.seconds = 59;
        }
      } else {
        state.seconds -= 1;
      }
    },
    toggleTimer: (state) => {
      state.isActive = !state.isActive;
      if (state.isActive && !state.isBreakMode && !state.sessionStartTime) {
        state.sessionStartTime = Date.now();
      }
    },
    resetTimer: (state) => {
      state.isActive = false;
      state.isBreakMode = false;
      state.sessionStartTime = null;
      state.seconds = 0;
      if (state.activeTab === 'pomodoro') {
        state.minutes = state.settings.pomodoroMinutes;
      } else if (state.activeTab === 'focus') {
        state.minutes = state.settings.focusMinutes;
      } else {
        state.minutes = state.customMinutes;
      }
    },
    setSubject: (state, action: PayloadAction<string>) => {
      state.subject = action.payload;
    },
    setCustomMinutes: (state, action: PayloadAction<number>) => {
      state.customMinutes = action.payload;
      if (state.activeTab === 'timer' && !state.isActive) {
        state.minutes = action.payload;
        state.seconds = 0;
      }
    },
    completeSession: (state) => {
      state.completedSessions += 1;
      if (state.sessionStartTime && !state.isBreakMode) {
        const duration = Math.round((Date.now() - state.sessionStartTime) / 60000);
        const finalSubject = state.subject.trim() || 'Other';
        const today = new Date().toISOString().split('T')[0];
        const existingIndex = state.studySessions.findIndex(s => s.subject === finalSubject);
        if (existingIndex >= 0) {
          state.studySessions[existingIndex].time += duration;
        } else {
          state.studySessions.push({ subject: finalSubject, time: duration, date: today });
        }
        state.totalStudyTime += duration;
        if (!state.weeklyStats[today]) state.weeklyStats[today] = 0;
        state.weeklyStats[today] += duration;

        if (state.lastStudyDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          state.streakCount = state.lastStudyDate === yesterday ? state.streakCount + 1 : 1;
          state.lastStudyDate = today;
        }
      }
      state.sessionStartTime = null;
    },
    startBreak: (state, action: PayloadAction<'short' | 'long'>) => {
      state.isBreakMode = true;
      state.seconds = 0;
      state.minutes = action.payload === 'short'
        ? state.settings.shortBreakMinutes
        : state.settings.longBreakMinutes;
      state.isActive = state.settings.autoStartBreaks;
    },
    endBreak: (state) => {
      state.isBreakMode = false;
      state.seconds = 0;
      state.minutes = state.settings.pomodoroMinutes;
      if (state.settings.autoStartPomodoros) {
        state.isActive = true;
        state.sessionStartTime = Date.now();
      } else {
        state.isActive = false;
      }
    },
    updateSettings: (state, action: PayloadAction<Partial<TimerSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    resetDailyStats: (state) => {
      state.studySessions = [];
      state.totalStudyTime = 0;
      state.completedSessions = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudyStats.fulfilled, (state, action) => {
        const stats = action.payload?.data;
        if (stats) {
          // Hydrate stats if backend provides daily / total study times
          state.totalStudyTime = stats.totalStudyTime ?? state.totalStudyTime;
          state.streakCount = stats.streakCount ?? state.streakCount;
          state.completedSessions = stats.completedSessions !== undefined ? stats.completedSessions : state.completedSessions;
          if (stats.weeklyStats) {
            state.weeklyStats = { ...state.weeklyStats, ...stats.weeklyStats };
          }
          if (stats.todaySessions) {
            state.studySessions = stats.todaySessions;
          }
        }
      })
      .addCase(fetchActiveTimer.fulfilled, (state, action) => {
        const activeTimer = action.payload?.data;
        if (activeTimer) {
          state.isActive = activeTimer.status === 'ACTIVE';
          state.sessionStartTime = new Date(activeTimer.startTime).getTime();
          if (activeTimer.subject) {
            state.subject = activeTimer.subject;
          }
          
          // Calculate remaining time
          // Default tab duration in seconds
          const totalSeconds = state.activeTab === 'pomodoro' ? state.settings.pomodoroMinutes * 60
                             : state.activeTab === 'focus' ? state.settings.focusMinutes * 60
                             : state.customMinutes * 60;
          
          const remainingSeconds = Math.max(0, totalSeconds - (activeTimer.elapsedTime || 0));
          state.minutes = Math.floor(remainingSeconds / 60);
          state.seconds = remainingSeconds % 60;
        }
      });
  }
});

export const {
  setActiveTab, setMinutes, setSeconds, decrementTime,
  toggleTimer, resetTimer, setSubject, setCustomMinutes,
  completeSession, startBreak, endBreak,
  updateSettings, resetDailyStats,
} = timerSlice.actions;

export default timerSlice.reducer;
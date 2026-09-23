import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import registerReducer from './slices/registerSlice';
import profileReducer from './slices/profileSlice';
import groupsReducer from '../features/study/store/groupsSlice';
import timerReducer from '../features/study/features/timer/store/timerSlice';
import { todoReducer } from '../features/study/features/todo/store/todosSlice';
import goalsReducer from '../features/study/features/goals/store/goalsSlice';
import studyProfileReducer from '../features/study/features/profile/store/profilSlice';
import dashboardReducer from '../features/study/features/dashboard/store/dashboardSlice';
import leaderboardReducer from '../features/study/features/leaderboard/store/leaderboardSlice';

import mentorReducer from './slices/mentorSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    register: registerReducer,
    profile: profileReducer,
    groups: groupsReducer,
    timer: timerReducer,
    todos: todoReducer,
    goals: goalsReducer,
    studyProfile: studyProfileReducer,
    dashboard: dashboardReducer,
    leaderboard: leaderboardReducer,
    mentor: mentorReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

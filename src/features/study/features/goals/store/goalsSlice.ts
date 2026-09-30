import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { StudyService, StudyGoalInput } from '../../../../../services/study.service';

export interface Label {
  name: string;
}

export interface Goal {
  id: string | number;
  title: string;
  color: string;
  labels?: Label[];
  progress?: boolean[];
  days?: string[];
  completedDays?: string[];
  completed?: boolean;
}

export interface WeeklyGoal extends Goal {
  completed: boolean;
}

export interface WeeklyGoals {
  Monday: WeeklyGoal[];
  Tuesday: WeeklyGoal[];
  Wednesday: WeeklyGoal[];
  Thursday: WeeklyGoal[];
  Friday: WeeklyGoal[];
  Saturday: WeeklyGoal[];
  Sunday: WeeklyGoal[];
}

interface GoalsState {
  items: Goal[];
  weeklyGoals: WeeklyGoals;
  loading: boolean;
  error: string | null;
}

export const isDayMatch = (d1?: string, d2?: string): boolean => {
  if (!d1 || !d2) return false;
  const s1 = d1.trim().toLowerCase();
  const s2 = d2.trim().toLowerCase();
  if (s1 === s2) return true;
  return s1.slice(0, 3) === s2.slice(0, 3);
};

const mapGoal = (g: any): Goal => {
  let meta: any = {};
  try {
    if (g.description && g.description.startsWith('{')) {
      meta = JSON.parse(g.description);
    }
  } catch (e) {}

  const completedDays: string[] = Array.isArray(meta.completedDays)
    ? meta.completedDays
    : Array.isArray(g.completedDays)
    ? g.completedDays
    : [];

  return {
    id: g.goalId || g.id || g._id,
    title: g.title || '',
    color: meta.color || g.color || '#4a3728',
    labels: meta.labels || (g.tags ? g.tags.map((t: string) => ({ name: t })) : []),
    progress: meta.progress || g.progress || [false, false, false, false],
    days: meta.days || g.days || [],
    completedDays,
    completed: meta.completed ?? g.completed ?? false
  };
};

// Helper to construct backend payload
const createBackendPayload = (goal: Partial<Goal>) => ({
  title: goal.title,
  targetHours: 1,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  description: JSON.stringify({
    color: goal.color,
    labels: goal.labels,
    progress: goal.progress,
    days: goal.days,
    completedDays: goal.completedDays || [],
    completed: goal.completed
  })
});

export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await StudyService.getAllGoals();
      // The backend returns { success: true, data: { page, limit, data: [] } }
      // StudyService returns the body directly, so response = { success: true, data: { ... } }
      const bodyData = response.data || response;
      const rawGoals = Array.isArray(bodyData) ? bodyData : bodyData.data;
      return Array.isArray(rawGoals) ? rawGoals.map(mapGoal) : [];
    } catch (err: any) {
      console.log('Error fetching goals from backend:', err.message);
      return rejectWithValue(err.message || 'Failed to fetch goals');
    }
  }
);

export const createGoalAsync = createAsyncThunk(
  'goals/createGoalAsync',
  async (goalData: Omit<Goal, 'id'>, { rejectWithValue }) => {
    try {
      const response = await StudyService.createGoal(createBackendPayload(goalData) as any);
      const rawGoal = response.data || response;
      return mapGoal(rawGoal);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to create goal');
    }
  }
);

export const updateGoalAsync = createAsyncThunk(
  'goals/updateGoalAsync',
  async (goal: Goal, { rejectWithValue }) => {
    try {
      const response = await StudyService.updateGoal(String(goal.id), createBackendPayload(goal));
      return mapGoal(response.data || response);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update goal');
    }
  }
);

// We define other thunks that compute the new goal state from Redux state and then call updateGoalAsync
export const toggleWeekProgressAsync = createAsyncThunk(
  'goals/toggleWeekProgressAsync',
  async ({ goalId, weekIndex }: { goalId: string | number; weekIndex: number }, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as any;
    const goal = state.goals.items.find((g: Goal) => String(g.id) === String(goalId));
    if (!goal) return rejectWithValue('Goal not found');
    const newGoal = JSON.parse(JSON.stringify(goal));
    newGoal.progress[weekIndex] = !newGoal.progress[weekIndex];
    return await dispatch(updateGoalAsync(newGoal)).unwrap();
  }
);

export const addGoalToDayAsync = createAsyncThunk(
  'goals/addGoalToDayAsync',
  async ({ goal, day }: { goal: Goal; day: string }, { dispatch, rejectWithValue }) => {
    const newGoal: Goal = JSON.parse(JSON.stringify(goal));
    if (!newGoal.days) newGoal.days = [];
    if (!newGoal.days.some((d: string) => isDayMatch(d, day))) {
      newGoal.days.push(day);
    }
    return await dispatch(updateGoalAsync(newGoal)).unwrap();
  }
);

export const toggleDayGoalCompletionAsync = createAsyncThunk(
  'goals/toggleDayGoalCompletionAsync',
  async ({ day, goalId, completed }: { day: string; goalId: string | number; completed: boolean }, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as any;
    const goal = state.goals.items.find((g: Goal) => String(g.id) === String(goalId));
    if (!goal) return rejectWithValue('Goal not found');
    const newGoal: Goal = JSON.parse(JSON.stringify(goal));
    
    const currentCompletedDays: string[] = Array.isArray(newGoal.completedDays) ? newGoal.completedDays : [];
    let updatedCompletedDays: string[];
    
    if (completed) {
      if (!currentCompletedDays.some((d: string) => isDayMatch(d, day))) {
        updatedCompletedDays = [...currentCompletedDays, day];
      } else {
        updatedCompletedDays = currentCompletedDays;
      }
    } else {
      updatedCompletedDays = currentCompletedDays.filter((d: string) => !isDayMatch(d, day));
    }
    
    newGoal.completedDays = updatedCompletedDays;
    
    // Overall completion: true if goal has days scheduled and all are completed
    if (newGoal.days && newGoal.days.length > 0) {
      newGoal.completed = newGoal.days.every(d => updatedCompletedDays.some(cd => isDayMatch(cd, d)));
    } else {
      newGoal.completed = completed;
    }
    
    return await dispatch(updateGoalAsync(newGoal)).unwrap();
  }
);

export const removeGoalFromDayAsync = createAsyncThunk(
  'goals/removeGoalFromDayAsync',
  async ({ day, goalId }: { day: string; goalId: string | number }, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as any;
    const goal = state.goals.items.find((g: Goal) => String(g.id) === String(goalId));
    if (!goal) return rejectWithValue('Goal not found');
    const newGoal: Goal = JSON.parse(JSON.stringify(goal));
    newGoal.days = (newGoal.days || []).filter((d: string) => !isDayMatch(d, day));
    if (newGoal.completedDays) {
      newGoal.completedDays = newGoal.completedDays.filter((d: string) => !isDayMatch(d, day));
    }
    return await dispatch(updateGoalAsync(newGoal)).unwrap();
  }
);

export const deleteGoalAsync = createAsyncThunk(
  'goals/deleteGoalAsync',
  async (goalId: string | number, { rejectWithValue }) => {
    try {
      await StudyService.deleteGoal(String(goalId));
      return goalId;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to delete goal');
    }
  }
);

const initialState: GoalsState = {
  items: [],
  weeklyGoals: {
    Monday: [], Tuesday: [], Wednesday: [],
    Thursday: [], Friday: [], Saturday: [], Sunday: [],
  },
  loading: false,
  error: null,
};

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
        
        // Hydrate weeklyGoals mapping if days are assigned
        Object.keys(state.weeklyGoals).forEach(day => {
          const key = day as keyof WeeklyGoals;
          state.weeklyGoals[key] = [];
        });
        
        state.items.forEach(goal => {
          if (goal.days && goal.days.length > 0) {
            goal.days.forEach(day => {
              Object.keys(state.weeklyGoals).forEach(wkDay => {
                if (isDayMatch(wkDay, day)) {
                  const key = wkDay as keyof WeeklyGoals;
                  const exists = state.weeklyGoals[key].some(g => String(g.id) === String(goal.id));
                  if (!exists) {
                    const isDayDone = goal.completedDays && goal.completedDays.length > 0
                      ? goal.completedDays.some(cd => isDayMatch(cd, wkDay))
                      : false;
                    state.weeklyGoals[key].push({ ...goal, completed: isDayDone });
                  }
                }
              });
            });
          }
        });
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(toggleDayGoalCompletionAsync.pending, (state, action) => {
        const { day, goalId, completed } = action.meta.arg;
        
        Object.keys(state.weeklyGoals).forEach(d => {
          if (isDayMatch(d, day)) {
            const k = d as keyof WeeklyGoals;
            const wg = state.weeklyGoals[k].find(g => String(g.id) === String(goalId));
            if (wg) {
              wg.completed = completed;
            }
          }
        });

        const item = state.items.find(g => String(g.id) === String(goalId));
        if (item) {
          const current = item.completedDays || [];
          if (completed) {
            if (!current.some(cd => isDayMatch(cd, day))) {
              item.completedDays = [...current, day];
            }
          } else {
            item.completedDays = current.filter(cd => !isDayMatch(cd, day));
          }
          if (item.days && item.days.length > 0) {
            item.completed = item.days.every(d => item.completedDays?.some(cd => isDayMatch(cd, d)));
          }
        }
      })
      .addCase(toggleDayGoalCompletionAsync.rejected, (state, action) => {
        const { day, goalId, completed } = action.meta.arg;
        
        Object.keys(state.weeklyGoals).forEach(d => {
          if (isDayMatch(d, day)) {
            const k = d as keyof WeeklyGoals;
            const wg = state.weeklyGoals[k].find(g => String(g.id) === String(goalId));
            if (wg) {
              wg.completed = !completed;
            }
          }
        });

        const item = state.items.find(g => String(g.id) === String(goalId));
        if (item) {
          const current = item.completedDays || [];
          if (!completed) {
            if (!current.some(cd => isDayMatch(cd, day))) {
              item.completedDays = [...current, day];
            }
          } else {
            item.completedDays = current.filter(cd => !isDayMatch(cd, day));
          }
          if (item.days && item.days.length > 0) {
            item.completed = item.days.every(d => item.completedDays?.some(cd => isDayMatch(cd, d)));
          }
        }
      })
      .addCase(removeGoalFromDayAsync.pending, (state, action) => {
        const { day, goalId } = action.meta.arg;
        Object.keys(state.weeklyGoals).forEach(wkDay => {
          if (isDayMatch(wkDay, day)) {
            const key = wkDay as keyof WeeklyGoals;
            state.weeklyGoals[key] = state.weeklyGoals[key].filter(g => String(g.id) !== String(goalId));
          }
        });
      })
      .addCase(removeGoalFromDayAsync.rejected, (state, action) => {
        const { day, goalId } = action.meta.arg;
        const item = state.items.find(g => String(g.id) === String(goalId));
        if (item) {
          Object.keys(state.weeklyGoals).forEach(wkDay => {
            if (isDayMatch(wkDay, day)) {
              const key = wkDay as keyof WeeklyGoals;
              const exists = state.weeklyGoals[key].some(g => String(g.id) === String(goalId));
              if (!exists) {
                const isDayDone = item.completedDays
                  ? item.completedDays.some(cd => isDayMatch(cd, wkDay))
                  : false;
                state.weeklyGoals[key].push({ ...item, completed: isDayDone });
              }
            }
          });
        }
      })
      .addCase(addGoalToDayAsync.pending, (state, action) => {
        const { goal, day } = action.meta.arg;
        const item = state.items.find(g => String(g.id) === String(goal.id));
        if (item) {
          if (!item.days) item.days = [];
          if (!item.days.some(d => isDayMatch(d, day))) {
            item.days.push(day);
          }
        }
        
        Object.keys(state.weeklyGoals).forEach(wkDay => {
          if (isDayMatch(wkDay, day)) {
            const key = wkDay as keyof WeeklyGoals;
            const exists = state.weeklyGoals[key].some(g => String(g.id) === String(goal.id));
            if (!exists) {
              const isDayDone = goal.completedDays
                ? goal.completedDays.some(cd => isDayMatch(cd, wkDay))
                : false;
              state.weeklyGoals[key].push({ ...goal, completed: isDayDone });
            }
          }
        });
      })
      .addCase(addGoalToDayAsync.rejected, (state, action) => {
        const { goal, day } = action.meta.arg;
        const item = state.items.find(g => String(g.id) === String(goal.id));
        if (item && item.days) {
          item.days = item.days.filter(d => !isDayMatch(d, day));
        }
        Object.keys(state.weeklyGoals).forEach(wkDay => {
          if (isDayMatch(wkDay, day)) {
            const key = wkDay as keyof WeeklyGoals;
            state.weeklyGoals[key] = state.weeklyGoals[key].filter(g => String(g.id) !== String(goal.id));
          }
        });
      })
      .addCase(createGoalAsync.fulfilled, (state, action) => {
        const existsInItems = state.items.some(g => String(g.id) === String(action.payload.id));
        if (!existsInItems) {
          state.items.push(action.payload);
        }
        if (action.payload.days && action.payload.days.length > 0) {
          action.payload.days.forEach(day => {
            Object.keys(state.weeklyGoals).forEach(wkDay => {
              if (isDayMatch(wkDay, day)) {
                const key = wkDay as keyof WeeklyGoals;
                const existsInDay = state.weeklyGoals[key].some(g => String(g.id) === String(action.payload.id));
                if (!existsInDay) {
                  const isDayDone = action.payload.completedDays
                    ? action.payload.completedDays.some(cd => isDayMatch(cd, wkDay))
                    : false;
                  state.weeklyGoals[key].push({ ...action.payload, completed: isDayDone });
                }
              }
            });
          });
        }
      })
      .addCase(updateGoalAsync.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex(g => String(g.id) === String(updated.id));
        if (idx !== -1) state.items[idx] = updated;
        
        // Rebuild weekly goals for this item
        Object.keys(state.weeklyGoals).forEach(day => {
          const key = day as keyof WeeklyGoals;
          state.weeklyGoals[key] = state.weeklyGoals[key].filter(g => String(g.id) !== String(updated.id));
          if (updated.days && updated.days.some(d => isDayMatch(d, day))) {
            const isDayDone = updated.completedDays
              ? updated.completedDays.some(cd => isDayMatch(cd, day))
              : false;
            state.weeklyGoals[key].push({ ...updated, completed: isDayDone });
          }
        });
      })
      .addCase(deleteGoalAsync.fulfilled, (state, action) => {
        const goalId = action.payload;
        state.items = state.items.filter(g => String(g.id) !== String(goalId));
        Object.keys(state.weeklyGoals).forEach(day => {
          const key = day as keyof WeeklyGoals;
          state.weeklyGoals[key] = state.weeklyGoals[key].filter(g => String(g.id) !== String(goalId));
        });
      });
  }
});

export {}

export default goalsSlice.reducer;
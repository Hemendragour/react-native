import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { StudyService } from '../../../../../services/study.service';

export interface Todo {
  id: string;          // always taskId (UUID) from backend
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  deadline?: string;
}

export interface Todos {
  [dateStr: string]: Todo[];
}

interface TodosState {
  items: Todos;
  loading: boolean;
  saving: boolean;   // for create/toggle/delete operations
  error: string | null;
}

/** YYYY-MM-DD from a date string or Date object */
const formatDate = (dateStr?: string): string => {
  const d = dateStr ? new Date(dateStr) : new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Extract the real taskId from a backend task object */
const extractId = (task: any): string =>
  task.taskId || task.id || String(task._id || '');

/** Map a raw backend task to our Todo shape */
const mapTask = (task: any): Todo => ({
  id:        extractId(task),
  text:      task.title || '',
  completed: task.completed ?? false,
  priority:  task.priority || 'medium',
  createdAt: task.createdAt || new Date().toISOString(),
  deadline:  task.deadline || undefined,
});

/** Group a flat array of tasks by their deadline (or createdAt) date */
const groupByDate = (tasks: any[]): Todos => {
  const grouped: Todos = {};
  tasks.forEach((task: any) => {
    const dateStr = formatDate(task.deadline || task.createdAt);
    if (!grouped[dateStr]) grouped[dateStr] = [];
    grouped[dateStr].push(mapTask(task));
  });
  return grouped;
};

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const fetchTasks = createAsyncThunk(
  'todos/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await StudyService.getAllTasks();
      console.log('[todosSlice] fetchTasks response:', JSON.stringify(response).substring(0, 500));
      const raw = response;
      const tasks: any[] =
        Array.isArray(raw)           ? raw           :
        Array.isArray(raw?.tasks)    ? raw.tasks     :
        Array.isArray(raw?.data)     ? raw.data      :
        Array.isArray(raw?.data?.tasks) ? raw.data.tasks : [];
      console.log('[todosSlice] fetchTasks parsed tasks count:', tasks.length);
      return tasks;
    } catch (err: any) {
      console.error('[todosSlice] fetchTasks error:', err.message);
      return rejectWithValue(err.message || 'Failed to fetch tasks');
    }
  }
);

export const createTaskAsync = createAsyncThunk(
  'todos/createTaskAsync',
  async (payload: { text: string; dateStr: string; priority?: Todo['priority'] }, { rejectWithValue }) => {
    try {
      const dateObj = new Date(payload.dateStr + 'T23:59:59');
      const deadline = dateObj > new Date()
        ? dateObj.toISOString()
        : new Date(Date.now() + 5 * 60000).toISOString();

      const response = await StudyService.createTask({
        title:    payload.text,
        deadline,
        priority: payload.priority || 'medium',
      });

      console.log('[todosSlice] createTask response:', JSON.stringify(response).substring(0, 500));
      const task = response?.data ?? response;
      return { task, dateStr: payload.dateStr };
    } catch (err: any) {
      console.error('[todosSlice] createTaskAsync error:', err.message);
      return rejectWithValue(err.message || 'Failed to create task');
    }
  }
);

export const toggleTaskAsync = createAsyncThunk(
  'todos/toggleTaskAsync',
  async (
    payload: { todoId: string; isCompleted: boolean; dateStr: string },
    { rejectWithValue }
  ) => {
    try {
      await StudyService.toggleTaskCompletion(payload.todoId, payload.isCompleted);
      return payload;
    } catch (err: any) {
      console.log('[todosSlice] toggleTaskAsync error:', err.message);
      return rejectWithValue(err.message || 'Failed to toggle task');
    }
  }
);

export const deleteTaskAsync = createAsyncThunk(
  'todos/deleteTaskAsync',
  async (payload: { todoId: string; dateStr: string }, { rejectWithValue }) => {
    try {
      await StudyService.deleteTask(payload.todoId);
      return payload;
    } catch (err: any) {
      console.log('[todosSlice] deleteTaskAsync error:', err.message);
      return rejectWithValue(err.message || 'Failed to delete task');
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const initialState: TodosState = {
  items:   {},
  loading: false,
  saving:  false,
  error:   null,
};

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ── fetchTasks ─────────────────────────────────────────────────────
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        const serverTasks = action.payload;
        if (Array.isArray(serverTasks) && serverTasks.length > 0) {
          state.items = groupByDate(serverTasks);
        }
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })

      // ── createTaskAsync ────────────────────────────────────────────────
      .addCase(createTaskAsync.pending, (state) => { state.saving = true; })
      .addCase(createTaskAsync.fulfilled, (state, action) => {
        state.saving = false;
        const { task, dateStr } = action.payload;
        if (!state.items[dateStr]) state.items[dateStr] = [];
        // Avoid duplicates if fetch re-runs
        const mapped = mapTask(task);
        if (!state.items[dateStr].find(t => t.id === mapped.id)) {
          state.items[dateStr].push(mapped);
        }
      })
      .addCase(createTaskAsync.rejected, (state, action) => {
        state.saving = false;
        state.error  = action.payload as string;
      })

      // ── toggleTaskAsync — optimistic ───────────────────────────────────
      .addCase(toggleTaskAsync.pending, (state, action) => {
        const { todoId, isCompleted, dateStr } = action.meta.arg;
        const todo = state.items[dateStr]?.find(t => t.id === todoId);
        if (todo) todo.completed = isCompleted;
      })
      .addCase(toggleTaskAsync.rejected, (state, action) => {
        // Rollback on failure
        const { todoId, isCompleted, dateStr } = action.meta.arg;
        const todo = state.items[dateStr]?.find(t => t.id === todoId);
        if (todo) todo.completed = !isCompleted;
      })
      .addCase(toggleTaskAsync.fulfilled, (state, action) => {
        // Already updated optimistically; confirm with server value
        const { todoId, isCompleted, dateStr } = action.payload;
        const todo = state.items[dateStr]?.find(t => t.id === todoId);
        if (todo) todo.completed = isCompleted;
      })

      // ── deleteTaskAsync — optimistic ───────────────────────────────────
      .addCase(deleteTaskAsync.pending, (state, action) => {
        const { todoId, dateStr } = action.meta.arg;
        if (state.items[dateStr]) {
          state.items[dateStr] = state.items[dateStr].filter(t => t.id !== todoId);
          if (state.items[dateStr].length === 0) delete state.items[dateStr];
        }
      })
      .addCase(deleteTaskAsync.rejected, (state, action) => {
        // We can't easily restore the deleted item without caching it
        // Just log — the next fetchTasks will re-sync
        state.error = action.payload as string;
      })
      .addCase(deleteTaskAsync.fulfilled, (_state, _action) => {
        // Already removed in pending
      });
  },
});

export const todoReducer = todoSlice.reducer;
export default todoReducer;
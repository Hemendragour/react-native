import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Mentor, MentorApiResponse } from "../../services/mentorship.service"
import { fetchAllMentors } from "../../services/mentorship.service"
import { RootState } from '../../store/store';

// ---------- Async thunk ----------
export const loadMentors = createAsyncThunk<
  Mentor[],                      // Return type on success
  void,                         // Argument type (none)
  { rejectValue: string }       // Payload type for rejected case
>('mentor/loadMentors', async (_, { rejectWithValue }) => {
  try {
    const resp: MentorApiResponse = await fetchAllMentors();
    if (resp.success) {
      return resp.data;
    } else {
      return rejectWithValue(resp.message ?? 'Failed to fetch mentors');
    }
  } catch (err) {
    const msg = (err as Error).message ?? 'Network error';
    return rejectWithValue(msg);
  }
});

// ---------- Slice ----------

interface MentorState {
  mentors: Mentor[];
  loading: boolean;
  error: string | null;
}

const initialState: MentorState = {
  mentors: [],
  loading: false,
  error: null,
};

const mentorSlice = createSlice({
  name: 'mentor',
  initialState,
  reducers: {
    clearMentors(state) {
      state.mentors = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMentors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMentors.fulfilled, (state, action: PayloadAction<Mentor[]>) => {
        state.loading = false;
        const seen = new Set<string>();
        const unique: Mentor[] = [];
        (action.payload || []).forEach((m) => {
          const id = m?.mentorId || m?._id || (m as any)?.id || (m as any)?.userId;
          if (id) {
            if (!seen.has(id)) {
              seen.add(id);
              unique.push(m);
            }
          } else {
            unique.push(m);
          }
        });
        state.mentors = unique;
      })
      .addCase(loadMentors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      })
  },
});

export const { clearMentors } = mentorSlice.actions;
export default mentorSlice.reducer;

// ---------- Selector helpers ----------
export const selectMentors = (state: RootState) => state.mentor.mentors;
export const selectMentorLoading = (state: RootState) => state.mentor.loading;
export const selectMentorError = (state: RootState) => state.mentor.error;

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AuthService from '../../services/auth.service';

// ── Types ────────────────────────────────────────────────────────────────────
interface AuthState {
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  loading: false,
  error: null,
};

// ── Thunks ───────────────────────────────────────────────────────────────────
// NOTE: AuthService.login() already calls TokenStorage.setAuthData() internally.
// So we do NOT need to save tokens here again — just call the service and let it handle storage.
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string; rememberMe?: boolean }, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(credentials);
      // AuthService.login() already stores tokens via TokenStorage.setAuthData()
      return response;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Login failed');
    }
  }
);

// NOTE: AuthService.register() already calls TokenStorage.setAuthData() internally.
export const registerUser = createAsyncThunk(
  'auth/register',
  async (registrationData: any, { rejectWithValue }) => {
    try {
      const response = await AuthService.register(registrationData);
      // AuthService.register() already stores tokens via TokenStorage.setAuthData()
      return response;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Registration failed');
    }
  }
);

// --- OLD CODE (Token storage clear only) ---
// export const logoutUser = createAsyncThunk('auth/logout', async () => {
//   // Import TokenStorage here to avoid circular dependency issues
//   const TokenStorage = (await import('../token.storage')).default;
//   await TokenStorage.clearAuthData();
// });

// --- NEW CODE (Backend integrated API logout) ---
export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await AuthService.logout();
});

// ── Slice ────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoggedIn(state, action: PayloadAction<boolean>) {
      state.isLoggedIn = action.payload;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.loading = false;
        state.isLoggedIn = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.isLoggedIn = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoggedIn = false;
        state.error = null;
      });
  },
});

export const { setLoggedIn, clearAuthError } = authSlice.actions;
export default authSlice.reducer;

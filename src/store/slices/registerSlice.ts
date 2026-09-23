import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ── Types ────────────────────────────────────────────────────────────────────
export interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  location: string;
  status: string;
  userType: string;
  jobTitle?: string;
  companyName?: string;
  startDate?: string;
  endDate?: string;
  collegeName?: string;
  degree?: string;
  fieldOfStudy?: string;
  graduationYear?: string;
  highestEducation?: string;
  preferredRole?: string;
  cgpa?: string;
  skills?: string[];
}

interface RegisterState {
  currentStep: number;
  formData: Partial<RegistrationData>;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: RegisterState = {
  currentStep: 1,
  formData: {},
  loading: false,
  error: null,
  success: false,
};

// ── Slice ────────────────────────────────────────────────────────────────────
// NOTE: The actual register API call is handled by authSlice.registerUser thunk.
// This slice only manages the multi-step form state (current step, form data).
const registerSlice = createSlice({
  name: 'register',
  initialState,
  reducers: {
    saveFormData(state, action: PayloadAction<Partial<RegistrationData>>) {
      state.formData = { ...state.formData, ...action.payload };
    },
    goNext(state) {
      state.currentStep += 1;
    },
    goBack(state) {
      state.currentStep -= 1;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setSuccess(state, action: PayloadAction<boolean>) {
      state.success = action.payload;
    },
    clearErrors(state) {
      state.error = null;
    },
    resetRegister() {
      return initialState; // clean up after success
    },
  },
});

export const { saveFormData, goNext, goBack, setLoading, setError, setSuccess, clearErrors, resetRegister } =
  registerSlice.actions;
export default registerSlice.reducer;

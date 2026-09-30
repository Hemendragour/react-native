import { useAppDispatch, useAppSelector } from '../hooks';
import { loginUser, logoutUser, registerUser, setLoggedIn, clearAuthError } from '../slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { isLoggedIn, loading, error } = useAppSelector((state) => state.auth);

  return {
    isLoggedIn,
    loading,
    error,
    login: (credentials: { email: string; password: string; rememberMe?: boolean }) =>
      dispatch(loginUser(credentials)),
    register: (data: any) => dispatch(registerUser(data)),
    logout: () => dispatch(logoutUser()),
    setLoggedIn: (val: boolean) => dispatch(setLoggedIn(val)),
    clearError: () => dispatch(clearAuthError()),
  };
};

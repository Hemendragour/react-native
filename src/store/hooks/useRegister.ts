import { useAppDispatch, useAppSelector } from '../hooks';
import {
  saveFormData,
  goNext,
  goBack,
  setLoading,
  setError,
  setSuccess,
  clearErrors,
  resetRegister,
  RegistrationData,
} from '../slices/registerSlice';

export const useRegister = () => {
  const dispatch = useAppDispatch();
  const { currentStep, formData, loading, error, success } = useAppSelector(
    (state) => state.register
  );

  return {
    currentStep,
    formData,
    loading,
    error,
    success,
    goNext: () => dispatch(goNext()),
    goBack: () => dispatch(goBack()),
    setLoading: (val: boolean) => dispatch(setLoading(val)),
    setError: (msg: string | null) => dispatch(setError(msg)),
    setSuccess: (val: boolean) => dispatch(setSuccess(val)),
    clearErrors: () => dispatch(clearErrors()),
    resetRegister: () => dispatch(resetRegister()),
    saveFormData: (data: Partial<RegistrationData>) => dispatch(saveFormData(data)),
  };
};

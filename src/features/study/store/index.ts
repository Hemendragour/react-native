import { RootState, AppDispatch } from '../../../store/store';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export type { RootState, AppDispatch };
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
import { useAppDispatch, useAppSelector } from '../hooks';
import { 
  fetchMyProfile, 
  clearProfile, 
  fetchAllCovers, 
  setActiveCover, 
  deleteCover,
  fetchAllProfilePhotos,
  setActiveProfilePhoto,
  deleteProfilePhoto
} from '../slices/profileSlice';

export const useProfile = () => {
  const dispatch = useAppDispatch();
  const { data, coverPhotos, profilePhotos, loading, error } = useAppSelector((state) => state.profile);

  return {
    profile: data,
    coverPhotos,
    profilePhotos,
    loading,
    error,
    fetchProfile: () => dispatch(fetchMyProfile()),
    clearProfile: () => dispatch(clearProfile()),
    // Cover Photos
    fetchAllCovers: () => dispatch(fetchAllCovers()),
    setActiveCover: (id: string) => dispatch(setActiveCover(id)),
    deleteCover: (id: string) => dispatch(deleteCover(id)),
    // Profile Photos
    fetchAllProfilePhotos: () => dispatch(fetchAllProfilePhotos()),
    setActiveProfilePhoto: (id: string) => dispatch(setActiveProfilePhoto(id)),
    deleteProfilePhoto: (id: string) => dispatch(deleteProfilePhoto(id)),
  };
};
